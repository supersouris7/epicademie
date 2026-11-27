import type { AddressInfo } from 'node:net';
import { sql } from 'drizzle-orm';
import { io as connect, type Socket } from 'socket.io-client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getChapterOfSkill } from '@epicademie/content';
import type { ArenaInvite, DuelInvite, DuelView, OnlinePlayer, Profile } from '@epicademie/shared';
import { ALL_TABLES } from '../../db/schema.ts';
import { startRealtime } from '../../realtime.ts';
import { rightResponse } from '../../testing/answers.ts';
import { createTestApp, profileInput } from '../../testing/harness.ts';

/** Duel de bout en bout : vraie application, vraie base, deux appareils connectés. */
let t: Awaited<ReturnType<typeof createTestApp>>;
let realtime: ReturnType<typeof startRealtime>;
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

async function profile(name: string, grade: string, cookie = t.family().cookie): Promise<Profile> {
  const payload = { ...profileInput(name), grade };
  const res = await t.as(cookie).inject({ method: 'POST', url: '/api/v1/profiles', payload });
  return res.json<Profile>();
}
function join(profileId: string, cookie = t.family().cookie) {
  const s = connect(url, { auth: { profileId }, transports: ['websocket'], forceNew: true, extraHeaders: { cookie } });
  sockets.push(s);
  return s;
}
const connected = (s: Socket, id: string) => once<OnlinePlayer[]>(s, 'presence', (l) => l.some((p) => p.id === id));
/** Contenu de toute la base. */
const snapshot = async () => {
  const tables = await Promise.all(ALL_TABLES.map((name) => t.database.db.execute(sql.raw(`select * from ${name}`))));
  return JSON.stringify(tables.map((r) => (r as { rows: unknown[] }).rows));
};

beforeAll(async () => {
  t = await createTestApp();
  realtime = startRealtime(t.app, null, 0);
  await t.raw.listen({ port: 0, host: '127.0.0.1' });
  url = `http://127.0.0.1:${(t.raw.server.address() as AddressInfo).port}`;
});
afterAll(async () => {
  for (const s of sockets.splice(0)) s.disconnect();
  await realtime.close();
  await t.close();
});

describe('duel en temps réel', () => {
  it('profil non lié sans effet ; partie jouée entre deux classes, sans rien écrire en base', async () => {
    const lea = await profile('Léa', 'cm1');
    const tom = await profile('Tom', '4e');
    const other = await t.signup('voisins-duel@famille.test');
    const zoe = await profile('Zoé', '5e', other.cookie);
    const a = join(lea.id);
    await connected(a, lea.id);
    const b = join(tom.id);
    await connected(b, tom.id);
    const z = join(zoe.id, other.cookie);
    await connected(z, zoe.id);
    const strangers: unknown[] = [];
    z.onAny((event: string, msg: unknown) => {
      if (event.startsWith('duel')) strangers.push(msg);
    });
    const before = await snapshot();

    // Tom est invité dans un salon d'arène : accepter le duel l'en fera sortir.
    const lobby = once<ArenaInvite>(b, 'arena:invite');
    a.emit('arena:create', { chapterId: 'm5-calcul', invite: [tom.id] });
    const { arenaId } = await lobby;

    // Défi vers un profil non lié : rien ne part, ni vers lui ni en retour.
    const mine: DuelView[] = [];
    a.on('duel', (v: DuelView) => mine.push(v));
    a.emit('duel:challenge', { to: zoe.id, subject: 'maths' });
    const invited = once<DuelInvite>(b, 'duel:invite');
    a.emit('duel:challenge', { to: tom.id, subject: 'maths' });
    const { duelId } = await invited;
    expect(mine.every((v) => v.opponent.id === tom.id)).toBe(true);

    const mineStart = once<DuelView>(a, 'duel', (v) => v.phase === 'playing');
    const theirStart = once<DuelView>(b, 'duel', (v) => v.phase === 'playing');
    const busy = once<OnlinePlayer[]>(a, 'presence', (l) => l.filter((p) => p.busy).length === 2);
    const left = once<string>(b, 'arena:closed');
    b.emit('duel:respond', { duelId, accept: true });
    expect(await left).toBe(arenaId);
    const [started, theirs] = await Promise.all([mineStart, theirStart]);
    let view = started;
    await busy;
    expect(getChapterOfSkill(view.question?.skillId ?? '')?.grade).toBe('cm1');
    expect(getChapterOfSkill(theirs.question?.skillId ?? '')?.grade).toBe('4e');

    // Un joueur en duel n'est pas invitable dans l'arène.
    const arenaInvites: unknown[] = [];
    b.on('arena:invite', (m: unknown) => arenaInvites.push(m));
    a.emit('arena:create', { chapterId: 'm5-calcul', invite: [tom.id] });

    // Léa répond toujours juste : 2 manches, avec la pause entre les deux.
    while (view.phase !== 'over') {
      const q = view.phase === 'playing' ? view.question : null;
      const next = once<DuelView>(a, 'duel', (v) => (q ? v.question?.seq !== q.seq : v.phase === 'playing'));
      if (q) a.emit('duel:answer', { seq: q.seq, response: rightResponse(q) });
      view = await next;
      // Rythme sous la limite de débit des actions.
      await new Promise((r) => setTimeout(r, 100));
    }
    expect(view).toMatchObject({ end: 'match', winner: 'you' });
    expect(arenaInvites).toEqual([]);
    expect(strangers).toEqual([]);
    expect(await snapshot()).toBe(before);
  });
});
