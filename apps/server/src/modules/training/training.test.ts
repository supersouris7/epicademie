import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { fmt, generate } from '@questeo/content';
import type { AnswerResult, Profile, SessionSummary, SkillProgress } from '@questeo/shared';
import { createTestApp } from '../../testing/harness.ts';

let t: Awaited<ReturnType<typeof createTestApp>>;
let app: Awaited<ReturnType<typeof createTestApp>>['http'];
let profileId: string;

beforeAll(async () => {
  t = await createTestApp({ today: '2026-11-16' });
  app = t.http;
});
afterAll(() => t.close());

beforeEach(async () => {
  await t.reset();
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/profiles',
    payload: {
      name: 'Léa',
      avatar: { style: 'pixelbot', seed: 's' },
      gender: 'fille',
      birthDate: '2014-03-09',
      grade: '5e',
    },
  });
  profileId = res.json<Profile>().id;
});

const start = async (skillId: string | null = 'm5-tables') =>
  (
    await app.inject({
      method: 'POST',
      url: '/api/v1/sessions',
      payload: { profileId, mode: 'entrainement', subject: 'maths', chapterId: 'm5-calcul', skillId },
    })
  ).json<{ id: string }>().id;

/** Répond juste (ou faux) à la question m5-tables niveau 1 de graine `seed`. */
async function answer(sessionId: string, seed: number, right: boolean, variant = false, attempt: 1 | 2 = 1) {
  const q = generate('m5-tables', 1, seed);
  if (q.answer.kind !== 'number') throw new Error('attendu : nombre');
  const text = right ? fmt(q.answer.value) : '-1';
  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/sessions/${sessionId}/answers`,
    payload: {
      skillId: 'm5-tables',
      level: 1,
      seed,
      variant,
      response: { kind: 'number', text },
      durationMs: 2000,
      attempt,
    },
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
      url: `/api/v1/sessions/${id}/answers`,
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
    for (let seed = 1; seed <= 5; seed++) await answer(id, seed, true);
    const summary = (await app.inject({ method: 'POST', url: `/api/v1/sessions/${id}/finish` })).json<SessionSummary>();
    expect(summary).toMatchObject({ regular: { answered: 5, correct: 5 }, scoreOn20: 20, perfect: true });
    expect(summary.skills).toEqual([
      {
        skillId: 'm5-tables',
        answered: 5,
        correct: 5,
        stageBefore: 0,
        stageAfter: 1,
        bestBefore: 0,
        bestAfter: 5, // sans-faute : médaille d'or, notion acquise
        due: '2026-11-18',
      },
    ]);
    const profile = (await app.inject(`/api/v1/profiles/${profileId}`)).json<Profile>();
    expect(profile.xp).toBe(summary.xpGained);
    // Série entièrement juste : un coffre, ses pièces s'ajoutent.
    expect(summary.chest).not.toBeNull();
    expect(profile.coins).toBe(summary.coinsGained + (summary.chest?.coins ?? 0));
    const skills = (await app.inject(`/api/v1/profiles/${profileId}/skills`)).json<SkillProgress[]>();
    expect(skills[0]).toMatchObject({ skillId: 'm5-tables', stage: 1, attempts: 5, correct: 5 });
  });

  it('série ratée : notion à revoir demain, variantes comptées à part', async () => {
    const id = await start();
    for (let seed = 1; seed <= 5; seed++) {
      await answer(id, seed, seed > 3);
      if (seed <= 3) await answer(id, 100 + seed, true, true);
    }
    const summary = (await app.inject({ method: 'POST', url: `/api/v1/sessions/${id}/finish` })).json<SessionSummary>();
    expect(summary.regular).toEqual({ answered: 5, correct: 2 });
    expect(summary.variants).toEqual({ answered: 3, correct: 3 });
    expect(summary.scoreOn20).toBe(8);
    expect(summary.skills[0]).toMatchObject({ stageAfter: 0, due: '2026-11-17' });
  });

  it('coffre seulement si toute la série est juste : une erreur rattrapée au 2e essai compte comme trouvée', async () => {
    const missed = await start();
    for (let seed = 1; seed <= 5; seed++) await answer(missed, seed, seed !== 2);
    const none = (
      await app.inject({ method: 'POST', url: `/api/v1/sessions/${missed}/finish` })
    ).json<SessionSummary>();
    expect(none.chest).toBeNull();

    const recovered = await start();
    for (let seed = 1; seed <= 5; seed++) {
      await answer(recovered, seed, seed !== 2);
      if (seed === 2) await answer(recovered, seed, true, false, 2);
    }
    const got = (
      await app.inject({ method: 'POST', url: `/api/v1/sessions/${recovered}/finish` })
    ).json<SessionSummary>();
    expect(got.perfect).toBe(false);
    expect(got.chest).not.toBeNull();
  });

  it('« Je ne sais pas » : compté comme une erreur', async () => {
    const id = await start();
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/sessions/${id}/answers`,
      payload: {
        skillId: 'm5-tables',
        level: 1,
        seed: 1,
        variant: false,
        response: { kind: 'unknown' },
        durationMs: 900,
      },
    });
    expect(res.json<AnswerResult>()).toMatchObject({ correct: false, xp: 0 });
  });

  it('« Je n’ai pas compris » remet la notion à revoir malgré un sans-faute', async () => {
    const id = await start();
    for (let seed = 1; seed <= 5; seed++) await answer(id, seed, true);
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/sessions/${id}/confused`,
      payload: { skillId: 'm5-tables' },
    });
    expect(res.statusCode).toBe(204);
    const summary = (await app.inject({ method: 'POST', url: `/api/v1/sessions/${id}/finish` })).json<SessionSummary>();
    expect(summary.skills[0]).toMatchObject({ stageAfter: 0, due: '2026-11-17' });
  });

  it('refuse de terminer deux fois et de répondre après la fin', async () => {
    const id = await start();
    await answer(id, 1, true);
    expect((await app.inject({ method: 'POST', url: `/api/v1/sessions/${id}/finish` })).statusCode).toBe(200);
    expect((await app.inject({ method: 'POST', url: `/api/v1/sessions/${id}/finish` })).statusCode).toBe(409);
    const late = await app.inject({
      method: 'POST',
      url: `/api/v1/sessions/${id}/answers`,
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
      url: '/api/v1/sessions',
      payload: { profileId, mode: 'inconnu', subject: 'maths', chapterId: 'x', skillId: null },
    });
    expect(bad.statusCode).toBe(400);
    const unknownSkill = await app.inject({
      method: 'POST',
      url: '/api/v1/sessions',
      payload: { profileId, mode: 'entrainement', subject: 'maths', chapterId: 'x', skillId: 'nope' },
    });
    expect(unknownSkill.statusCode).toBe(400);
    const ghost = await app.inject({
      method: 'POST',
      url: '/api/v1/sessions',
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
    await app.inject({ method: 'DELETE', url: `/api/v1/profiles/${profileId}` });
    expect((await app.inject({ method: 'POST', url: `/api/v1/sessions/${id}/finish` })).statusCode).toBe(404);
  });
});

describe('concurrence', () => {
  it('deux fins simultanées d’une même partie : une seule est comptée', async () => {
    const id = await start();
    for (let seed = 1; seed <= 4; seed++) await answer(id, seed, true);
    const [a, b] = await Promise.all([
      app.inject({ method: 'POST', url: `/api/v1/sessions/${id}/finish` }),
      app.inject({ method: 'POST', url: `/api/v1/sessions/${id}/finish` }),
    ]);
    expect([a.statusCode, b.statusCode].sort()).toEqual([200, 409]);
    const won = (a.statusCode === 200 ? a : b).json<SessionSummary>().xpGained;
    const profile = (await app.inject(`/api/v1/profiles/${profileId}`)).json<Profile>();
    expect(profile.xp).toBe(won);
  });

  it('réponse rejouée (réseau qui renvoie) : comptée une seule fois, même résultat', async () => {
    const id = await start();
    const [a, b, c] = await Promise.all([answer(id, 1, true), answer(id, 1, true), answer(id, 1, true)]);
    expect(b).toEqual(a);
    expect(c).toEqual(a);
    for (const seed of [2, 3, 4]) await answer(id, seed, true);
    const summary = (await app.inject({ method: 'POST', url: `/api/v1/sessions/${id}/finish` })).json<SessionSummary>();
    expect(summary.regular).toEqual({ answered: 4, correct: 4 });
  });
});
