import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { fmt, generate } from '@questeo/content';
import type { AnswerResult, Profile, SessionSummary, SkillProgress } from '@questeo/shared';
import { buildApp } from './app.ts';
import { openDb } from './db/client.ts';

const migrationsDir = path.resolve(import.meta.dirname, '../drizzle');
let app: FastifyInstance;
let close: () => void;
let profileId: string;

beforeEach(async () => {
  const opened = openDb(':memory:', migrationsDir);
  close = opened.close;
  app = await buildApp({ db: opened.db, port: 3000, webDir: null, publicUrl: null, today: () => '2026-11-16' });
  const res = await app.inject({
    method: 'POST',
    url: '/api/profiles',
    payload: { name: 'Léa', avatar: { style: 'pixelbot', seed: 's' }, gender: 'fille', birthDate: '2014-03-09' },
  });
  profileId = res.json<Profile>().id;
});
afterEach(async () => {
  await app.close();
  close();
});

const start = async (skillId: string | null = 'm5-tables') =>
  (
    await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { profileId, mode: 'entrainement', subject: 'maths', chapterId: 'm5-calcul', skillId },
    })
  ).json<{ id: string }>().id;

/** Répond juste (ou faux) à la question m5-tables niveau 1 de graine `seed`. */
async function answer(sessionId: string, seed: number, right: boolean, variant = false) {
  const q = generate('m5-tables', 1, seed);
  if (q.answer.kind !== 'number') throw new Error('attendu : nombre');
  const text = right ? fmt(q.answer.value) : '-1';
  const res = await app.inject({
    method: 'POST',
    url: `/api/sessions/${sessionId}/answers`,
    payload: { skillId: 'm5-tables', level: 1, seed, variant, response: { kind: 'number', text }, durationMs: 2000 },
  });
  return res.json<AnswerResult>();
}

describe('parties d’entraînement', () => {
  it('le serveur corrige lui-même les réponses', async () => {
    const id = await start();
    expect(await answer(id, 1, true)).toMatchObject({ correct: true, invalid: false });
    expect((await answer(id, 2, true)).xp).toBeGreaterThan(0);
    expect(await answer(id, 3, false)).toMatchObject({ correct: false, xp: 0 });
  });

  it('signale une saisie illisible sans la compter', async () => {
    const id = await start();
    const res = await app.inject({
      method: 'POST',
      url: `/api/sessions/${id}/answers`,
      payload: {
        skillId: 'm5-tables',
        level: 1,
        seed: 1,
        variant: false,
        response: { kind: 'number', text: '3,,2' },
        durationMs: 1000,
      },
    });
    expect(res.json<AnswerResult>()).toEqual({ correct: false, invalid: true, xp: 0 });
  });

  it('série parfaite : XP, pièces, progression de la notion', async () => {
    const id = await start();
    for (let seed = 1; seed <= 10; seed++) await answer(id, seed, true);
    const summary = (await app.inject({ method: 'POST', url: `/api/sessions/${id}/finish` })).json<SessionSummary>();
    expect(summary).toMatchObject({ regular: { answered: 10, correct: 10 }, scoreOn20: 20, perfect: true });
    expect(summary.skills).toEqual([
      { skillId: 'm5-tables', answered: 10, correct: 10, stageBefore: 0, stageAfter: 1, due: '2026-11-18' },
    ]);
    const profile = (await app.inject(`/api/profiles/${profileId}`)).json<Profile>();
    expect(profile.xp).toBe(summary.xpGained);
    expect(profile.coins).toBe(summary.coinsGained);
    const skills = (await app.inject(`/api/profiles/${profileId}/skills`)).json<SkillProgress[]>();
    expect(skills[0]).toMatchObject({ skillId: 'm5-tables', stage: 1, attempts: 10, correct: 10 });
  });

  it('série ratée : notion à revoir demain, variantes comptées à part', async () => {
    const id = await start();
    for (let seed = 1; seed <= 10; seed++) {
      await answer(id, seed, seed > 5);
      if (seed <= 5) await answer(id, 100 + seed, true, true);
    }
    const summary = (await app.inject({ method: 'POST', url: `/api/sessions/${id}/finish` })).json<SessionSummary>();
    expect(summary.regular).toEqual({ answered: 10, correct: 5 });
    expect(summary.variants).toEqual({ answered: 5, correct: 5 });
    expect(summary.scoreOn20).toBe(10);
    expect(summary.skills[0]).toMatchObject({ stageAfter: 0, due: '2026-11-17' });
  });

  it('« Je n’ai pas compris » remet la notion à revoir malgré un sans-faute', async () => {
    const id = await start();
    for (let seed = 1; seed <= 10; seed++) await answer(id, seed, true);
    const res = await app.inject({
      method: 'POST',
      url: `/api/sessions/${id}/confused`,
      payload: { skillId: 'm5-tables' },
    });
    expect(res.statusCode).toBe(204);
    const summary = (await app.inject({ method: 'POST', url: `/api/sessions/${id}/finish` })).json<SessionSummary>();
    expect(summary.skills[0]).toMatchObject({ stageAfter: 0, due: '2026-11-17' });
  });

  it('refuse de terminer deux fois et de répondre après la fin', async () => {
    const id = await start();
    await answer(id, 1, true);
    expect((await app.inject({ method: 'POST', url: `/api/sessions/${id}/finish` })).statusCode).toBe(200);
    expect((await app.inject({ method: 'POST', url: `/api/sessions/${id}/finish` })).statusCode).toBe(409);
    const late = await app.inject({
      method: 'POST',
      url: `/api/sessions/${id}/answers`,
      payload: {
        skillId: 'm5-tables',
        level: 1,
        seed: 2,
        variant: false,
        response: { kind: 'number', text: '1' },
        durationMs: 1,
      },
    });
    expect(late.statusCode).toBe(409);
  });

  it('valide les entrées', async () => {
    const bad = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { profileId, mode: 'inconnu', subject: 'maths', chapterId: 'x', skillId: null },
    });
    expect(bad.statusCode).toBe(400);
    const unknownSkill = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: { profileId, mode: 'entrainement', subject: 'maths', chapterId: 'x', skillId: 'nope' },
    });
    expect(unknownSkill.statusCode).toBe(400);
    const ghost = await app.inject({
      method: 'POST',
      url: '/api/sessions',
      payload: {
        profileId: '00000000-0000-4000-8000-000000000000',
        mode: 'entrainement',
        subject: 'maths',
        chapterId: 'x',
        skillId: null,
      },
    });
    expect(ghost.statusCode).toBe(404);
  });

  it('supprimer un profil supprime ses parties', async () => {
    const id = await start();
    await answer(id, 1, true);
    await app.inject({ method: 'DELETE', url: `/api/profiles/${profileId}` });
    expect((await app.inject({ method: 'POST', url: `/api/sessions/${id}/finish` })).statusCode).toBe(404);
  });
});
