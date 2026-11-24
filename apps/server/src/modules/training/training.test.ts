import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { sql } from 'drizzle-orm';
import { fmt, generate } from '@epicademie/content';
import type { AnswerResult, Profile, SessionSummary, SkillProgress } from '@epicademie/shared';
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
      avatar: { style: 'portrait', seed: '07' },
      gender: 'fille',
      birthDate: '2014-03-09',
      grade: '5e',
    },
  });
  profileId = res.json<Profile>().id;
});

const start = async (
  skillId: string | null = 'm5-tables',
  mode: 'entrainement' | 'chrono' | 'survie' = 'entrainement',
) =>
  (
    await app.inject({
      method: 'POST',
      url: '/api/v1/sessions',
      payload: { profileId, mode, subject: 'maths', chapterId: 'm5-calcul', skillId },
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

  it('défis : coffre selon le score et bonus d’XP de fin (Survie : 5 bonnes réponses = coffre commun)', async () => {
    const few = await start('m5-tables', 'survie');
    for (let seed = 1; seed <= 4; seed++) await answer(few, seed, true);
    const none = (await app.inject({ method: 'POST', url: `/api/v1/sessions/${few}/finish` })).json<SessionSummary>();
    expect(none.chest).toBeNull();

    const id = await start('m5-tables', 'survie');
    let perAnswer = 0;
    for (let seed = 1; seed <= 6; seed++) perAnswer += (await answer(id, seed, true)).xp;
    await answer(id, 7, false);
    const got = (await app.inject({ method: 'POST', url: `/api/v1/sessions/${id}/finish` })).json<SessionSummary>();
    expect(got.chest?.rarity).toBe('commun');
    expect(got.xpGained).toBe(perAnswer + 12);
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

describe('Épreuve du chapitre', () => {
  const startEpreuve = async (profile = profileId, extra: Record<string, unknown> = {}) =>
    app.inject({
      method: 'POST',
      url: '/api/v1/sessions',
      payload: {
        profileId: profile,
        mode: 'entrainement',
        subject: 'maths',
        chapterId: 'm5-calcul',
        skillId: null,
        epreuve: true,
        ...extra,
      },
    });
  /** Joue une épreuve de 10 questions dont `right` sont justes ; renvoie le bilan. */
  const play = async (profile: string, right: number) => {
    const id = (await startEpreuve(profile)).json<{ id: string }>().id;
    for (let seed = 1; seed <= 10; seed++) await answer(id, seed, seed <= right);
    return (await app.inject({ method: 'POST', url: `/api/v1/sessions/${id}/finish` })).json<SessionSummary>();
  };
  const trophies = async (profile = profileId) =>
    (await app.inject(`/api/v1/profiles/${profile}/chapter-trophies`)).json<{ chapterId: string }[]>();

  it('80 % pile (8 sur 10) : chapitre validé, coffre légendaire, trophée', async () => {
    const summary = await play(profileId, 8);
    expect(summary.epreuve).toMatchObject({ chapterId: 'm5-calcul', passed: true, rewarded: true });
    expect(summary.chest?.rarity).toBe('legendaire');
    expect(await trophies()).toHaveLength(1);
    const profile = (await app.inject(`/api/v1/profiles/${profileId}`)).json<Profile>();
    expect(profile.coins).toBe(summary.coinsGained + (summary.chest?.coins ?? 0));
  });

  it('moins de 80 % (7 sur 10) : pas de récompense, notion à travailler indiquée', async () => {
    const summary = await play(profileId, 7);
    expect(summary.epreuve).toMatchObject({ passed: false, rewarded: false, weakestSkillId: 'm5-tables' });
    expect(summary.chest).toBeNull();
    expect(await trophies()).toEqual([]);
  });

  it('épreuve trop courte : jamais validée', async () => {
    const id = (await startEpreuve()).json<{ id: string }>().id;
    for (let seed = 1; seed <= 4; seed++) await answer(id, seed, true);
    const summary = (await app.inject({ method: 'POST', url: `/api/v1/sessions/${id}/finish` })).json<SessionSummary>();
    expect(summary.epreuve?.passed).toBe(false);
    expect(await trophies()).toEqual([]);
  });

  it('double validation : un seul coffre « chapitre », un seul trophée', async () => {
    const first = await play(profileId, 10);
    // 9 sur 10 : validé (≥ 80 %) mais pas de sans-faute, donc aucun coffre d'entraînement aléatoire
    // (un sans-faute peut tirer « légendaire » au hasard et rendre le test instable).
    const second = await play(profileId, 9);
    expect(first.epreuve?.rewarded).toBe(true);
    expect(second.epreuve).toMatchObject({ passed: true, rewarded: false, alreadyValidated: true });
    expect(second.chest).toBeNull();
    expect(await trophies()).toHaveLength(1);
  });

  it('isolation : la validation d’un profil ne touche pas celui d’un autre', async () => {
    const other = (
      await app.inject({
        method: 'POST',
        url: '/api/v1/profiles',
        payload: {
          name: 'Tom',
          avatar: { style: 'portrait', seed: '02' },
          gender: 'garcon',
          birthDate: '2014-05-01',
          grade: '5e',
        },
      })
    ).json<Profile>().id;
    await play(profileId, 9);
    expect(await trophies(other)).toEqual([]);
    expect((await play(other, 9)).epreuve?.rewarded).toBe(true);
    expect(await trophies(other)).toHaveLength(1);
  });

  it('refuse une épreuve mal formée ou une notion hors chapitre', async () => {
    expect((await startEpreuve(profileId, { skillId: 'm5-tables' })).statusCode).toBe(400);
    expect((await startEpreuve(profileId, { chapterId: 'inconnu' })).statusCode).toBe(400);
    expect((await startEpreuve(profileId, { mode: 'chrono' })).statusCode).toBe(400);
    const id = (await startEpreuve()).json<{ id: string }>().id;
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/sessions/${id}/answers`,
      payload: {
        skillId: 'm5-blocs-valeur',
        level: 1,
        seed: 1,
        variant: false,
        response: { kind: 'number', text: '1' },
        durationMs: 1000,
      },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('compatibilité ascendante : matière « physique »', () => {
  it('un ancien client envoyant « physique » est accepté et enregistré en « sciences »', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/sessions',
      payload: { profileId, mode: 'entrainement', subject: 'physique', chapterId: 'p4-mouvement', skillId: null },
    });
    expect(res.statusCode).toBe(201);
    const rows = await t.database.db.execute(
      sql`select subject from sessions where id = ${res.json<{ id: string }>().id}`,
    );
    expect(JSON.stringify(rows)).toContain('sciences');
    expect(JSON.stringify(rows)).not.toContain('physique');
  });
});
