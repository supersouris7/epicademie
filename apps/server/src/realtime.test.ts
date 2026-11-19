import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { Server } from 'socket.io';
import { io as connect, type Socket } from 'socket.io-client';
import { fmt, generate } from '@questeo/content';
import type { ArenaInvite, ArenaView, ChatMessage, OnlinePlayer, Profile } from '@questeo/shared';
import { buildApp } from './app.ts';
import { openDb } from './db/client.ts';
import { createProfilesRepo } from './db/profiles-repo.ts';
import { attachRealtime, createPresence } from './realtime.ts';

const migrationsDir = path.resolve(import.meta.dirname, '../drizzle');
let app: FastifyInstance;
let io: Server;
let close: () => void;
let url: string;
const sockets: Socket[] = [];

const once = <T>(s: Socket, event: string, pred: (v: T) => boolean = () => true) =>
  new Promise<T>((resolve) => {
    const h = (v: T) => {
      if (!pred(v)) return;
      s.off(event, h);
      resolve(v);
    };
    s.on(event, h);
  });

async function profile(name: string): Promise<Profile> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/profiles',
    payload: { name, avatar: { style: 'pixelbot', seed: name }, gender: 'fille', birthDate: '2014-03-09', grade: '5e' },
  });
  return res.json<Profile>();
}
function join(profileId: string) {
  const s = connect(url, { auth: { profileId }, transports: ['websocket'], forceNew: true });
  sockets.push(s);
  return s;
}

beforeEach(async () => {
  const opened = openDb(':memory:', migrationsDir);
  close = opened.close;
  const presence = createPresence();
  app = await buildApp({ db: opened.db, port: 0, webDir: null, publicUrl: null, presence });
  io = new Server(app.server);
  attachRealtime(io, createProfilesRepo(opened.db), presence);
  await app.listen({ port: 0, host: '127.0.0.1' });
  url = `http://127.0.0.1:${(app.server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  for (const s of sockets.splice(0)) s.disconnect();
  await io.close();
  await app.close();
  close();
});

describe('temps réel', () => {
  it('plusieurs joueurs en même temps ; un même profil refusé sur un 2e appareil', async () => {
    const lea = await profile('Léa');
    const tom = await profile('Tom');
    const a = join(lea.id);
    await once<OnlinePlayer[]>(a, 'presence', (l) => l.some((p) => p.id === lea.id));
    join(tom.id);
    const list = await once<OnlinePlayer[]>(a, 'presence', (l) => l.length === 2);
    expect(list.map((p) => p.name).sort()).toEqual(['Léa', 'Tom']);
    const presence = (await app.inject('/api/presence')).json<{ online: string[] }>();
    expect(presence.online.sort()).toEqual([lea.id, tom.id].sort());
    const again = join(lea.id);
    expect(await once<string>(again, 'refused')).toMatch(/déjà connecté/);
  });

  it('messages prédéfinis et emoji seulement', async () => {
    const lea = await profile('Léa');
    const tom = await profile('Tom');
    const a = join(lea.id);
    const b = join(tom.id);
    await once<OnlinePlayer[]>(a, 'presence', (l) => l.length === 2);
    const got = once<ChatMessage>(b, 'chat');
    a.emit('chat', { to: tom.id, payload: { kind: 'preset', index: 1 } });
    expect(await got).toMatchObject({ from: { name: 'Léa' }, text: 'Bien joué !' });
    const emoji = once<ChatMessage>(b, 'chat');
    a.emit('chat', { to: tom.id, payload: { kind: 'emoji', index: 0 } });
    expect((await emoji).text).toBe('👋');
  });

  it('arène : invitation, tour par tour, attaque et victoire', async () => {
    const lea = await profile('Léa');
    const tom = await profile('Tom');
    const a = join(lea.id);
    const b = join(tom.id);
    await once<OnlinePlayer[]>(a, 'presence', (l) => l.length === 2);
    const invited = once<ArenaInvite>(b, 'arena:invite');
    a.emit('arena:create', { chapterId: 'm5-calcul', invite: [tom.id] });
    const inv = await invited;
    expect(inv.from.name).toBe('Léa');
    const ready = once<ArenaView>(a, 'arena', (v) => v.players.every((p) => p.ready));
    b.emit('arena:respond', { arenaId: inv.arenaId, accept: true });
    await ready;
    let view = once<ArenaView>(a, 'arena', (v) => v.phase === 'playing');
    a.emit('arena:start');
    let v = await view;
    // Léa répond juste à chaque tour, Tom se trompe : Léa gagne.
    while (v.phase === 'playing') {
      const q = v.question;
      if (!q) throw new Error('pas de question');
      const turn = v.turn;
      const question = generate(q.skillId, q.level, q.seed);
      const mine = v.turnId === lea.id;
      const right =
        question.answer.kind === 'number'
          ? { kind: 'number', text: fmt(question.answer.value) }
          : question.answer.kind === 'choice'
            ? { kind: 'choice', index: question.answer.correct }
            : null;
      if (!right) throw new Error(`réponse ${question.answer.kind}`);
      const wrong =
        right.kind === 'number'
          ? { kind: 'number', text: '987654' }
          : { kind: 'choice', index: (right as { index: number }).index === 0 ? 1 : 0 };
      view = once<ArenaView>(a, 'arena', (x) => x.turn > turn);
      (mine ? a : b).emit('arena:answer', { response: mine ? right : wrong });
      v = await view;
    }
    expect(v.phase).toBe('over');
    expect(v.winnerId).toBe(lea.id);
  });
});
