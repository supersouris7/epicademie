import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { fmt, generate } from '@questeo/content';
import type { FamilyRecommendation, Profile, Recommendation } from '@questeo/shared';
import { createTestApp, profileInput } from '../../testing/harness.ts';

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp();
});
afterAll(() => t.close());
beforeEach(() => t.reset());

type Client = ReturnType<typeof t.as>;
const SKILLS: [string, string, string, string] = [
  'm5-tables',
  'm5-relatifs-vocab',
  'm5-relatifs-droite',
  'm5-relatifs-comparer',
];
const MOT = 'Courage, tu progresses vite !';

const child = async (c: Client, name = 'Léa') =>
  (await c.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput(name) })).json<Profile>();
const recommend = (c: Client, profileId: string, payload: object) =>
  c.inject({ method: 'POST', url: `/api/v1/profiles/${profileId}/recommendations`, payload });
const pending = async (c: Client, profileId: string) =>
  (await c.inject(`/api/v1/profiles/${profileId}/recommendations`)).json<Recommendation[]>();
const family = async (c: Client) => (await c.inject('/api/v1/family/recommendations')).json<FamilyRecommendation[]>();

/** Série d'entraînement sur m5-tables : `right` réponses justes sur `total`. */
async function play(c: Client, profileId: string, skillId: string, right: number, total: number) {
  const session = (
    await c.inject({
      method: 'POST',
      url: '/api/v1/sessions',
      payload: { profileId, mode: 'entrainement', subject: 'maths', chapterId: 'm5-calcul', skillId },
    })
  ).json<{ id: string }>().id;
  for (let seed = 1; seed <= total; seed++) {
    const q = generate(skillId, 1, seed);
    if (q.answer.kind !== 'number') throw new Error('attendu : nombre');
    await c.inject({
      method: 'POST',
      url: `/api/v1/sessions/${session}/answers`,
      payload: {
        skillId,
        level: 1,
        seed,
        variant: false,
        response: { kind: 'number', text: seed <= right ? fmt(q.answer.value) : '-1' },
        durationMs: 2000,
        attempt: 1,
      },
    });
  }
  await c.inject({ method: 'POST', url: `/api/v1/sessions/${session}/finish` });
}

describe('recommandations de travail', () => {
  it('le parent recommande, l’enfant la voit avec le mot, l’entraînement la marque « faite » avec le score', async () => {
    const lea = await child(t.http);
    const created = await recommend(t.http, lea.id, { skillId: 'm5-tables', note: `  ${MOT}  ` });
    expect(created.statusCode).toBe(201);
    expect(created.json<Recommendation>()).toMatchObject({ profileId: lea.id, skillId: 'm5-tables', note: MOT });

    expect(await pending(t.http, lea.id)).toMatchObject([{ skillId: 'm5-tables', note: MOT }]);
    expect(await family(t.http)).toMatchObject([
      { profileName: 'Léa', status: 'en-attente', doneAt: null, correct: null },
    ]);

    // Un autre entraînement ne la valide pas.
    await play(t.http, lea.id, 'm5-relatifs-vocab', 2, 2);
    expect(await pending(t.http, lea.id)).toHaveLength(1);

    await play(t.http, lea.id, 'm5-tables', 3, 4);
    expect(await pending(t.http, lea.id)).toEqual([]);
    expect(await family(t.http)).toMatchObject([
      { status: 'faite', correct: 3, answered: 4, doneAt: expect.any(String) as string, note: MOT },
    ]);
  });

  it('le mot est facultatif (vide = pas de mot) et limité à 140 caractères', async () => {
    const lea = await child(t.http);
    expect((await recommend(t.http, lea.id, { skillId: 'm5-tables' })).json<Recommendation>().note).toBeNull();
    expect(
      (await recommend(t.http, lea.id, { skillId: SKILLS[1], note: '   ' })).json<Recommendation>().note,
    ).toBeNull();
    expect((await recommend(t.http, lea.id, { skillId: SKILLS[2], note: 'é'.repeat(140) })).statusCode).toBe(201);
    const tooLong = await recommend(t.http, lea.id, { skillId: SKILLS[3], note: 'x'.repeat(141) });
    expect(tooLong.statusCode).toBe(400);
    // Le mot n'est jamais répété dans une réponse d'erreur.
    expect(tooLong.body).not.toContain('xxxxxxxxxx');
  });

  it('refuse une notion inconnue ou déjà recommandée, et plus de 3 recommandations en attente', async () => {
    const lea = await child(t.http);
    expect((await recommend(t.http, lea.id, { skillId: 'inconnue' })).statusCode).toBe(400);
    expect((await recommend(t.http, lea.id, { skillId: SKILLS[0] })).statusCode).toBe(201);
    expect((await recommend(t.http, lea.id, { skillId: SKILLS[0] })).statusCode).toBe(409);
    expect((await recommend(t.http, lea.id, { skillId: SKILLS[1] })).statusCode).toBe(201);
    expect((await recommend(t.http, lea.id, { skillId: SKILLS[2] })).statusCode).toBe(201);
    const fourth = await recommend(t.http, lea.id, { skillId: SKILLS[3], note: MOT });
    expect(fourth.statusCode).toBe(409);
    expect(fourth.body).not.toContain(MOT);
    expect(await pending(t.http, lea.id)).toHaveLength(3);
    // Un autre enfant de la famille a ses propres 3 places.
    const tom = await child(t.http, 'Tom');
    expect((await recommend(t.http, tom.id, { skillId: SKILLS[3] })).statusCode).toBe(201);
  });

  it('le parent annule : la place se libère, l’enfant ne la voit plus, on ne rouvre pas une recommandation faite', async () => {
    const lea = await child(t.http);
    const a = (await recommend(t.http, lea.id, { skillId: SKILLS[0], note: MOT })).json<Recommendation>();
    const url = `/api/v1/profiles/${lea.id}/recommendations/${a.id}`;
    expect((await t.http.inject({ method: 'DELETE', url })).statusCode).toBe(204);
    expect(await pending(t.http, lea.id)).toEqual([]);
    expect(await family(t.http)).toEqual([]);
    // Déjà annulée : introuvable.
    expect((await t.http.inject({ method: 'DELETE', url })).statusCode).toBe(404);

    // Une recommandation annulée n'est pas « faite » par un entraînement ultérieur.
    await play(t.http, lea.id, SKILLS[0], 2, 2);
    expect(await family(t.http)).toEqual([]);

    // Faite : ne peut plus être annulée.
    const b = (await recommend(t.http, lea.id, { skillId: SKILLS[0] })).json<Recommendation>();
    await play(t.http, lea.id, SKILLS[0], 2, 2);
    const del = await t.http.inject({ method: 'DELETE', url: `/api/v1/profiles/${lea.id}/recommendations/${b.id}` });
    expect(del.statusCode).toBe(404);
    expect(await family(t.http)).toMatchObject([{ status: 'faite' }]);
  });

  it('création et annulation réservées au parent (verrou de l’Espace parent) ; l’enfant ne fait que lire', async () => {
    const lea = await child(t.http);
    const a = (await recommend(t.http, lea.id, { skillId: SKILLS[0] })).json<Recommendation>();
    t.clock.set('2026-11-21'); // l'Espace parent se reverrouille
    expect((await recommend(t.http, lea.id, { skillId: SKILLS[1] })).statusCode).toBe(403);
    expect(
      (await t.http.inject({ method: 'DELETE', url: `/api/v1/profiles/${lea.id}/recommendations/${a.id}` })).statusCode,
    ).toBe(403);
    expect((await t.http.inject('/api/v1/family/recommendations')).statusCode).toBe(403);
    expect(await pending(t.http, lea.id)).toHaveLength(1);
  });

  it('sans connexion : refusé', async () => {
    const lea = await child(t.http);
    const anon = { headers: { cookie: '' } };
    expect((await t.http.inject({ url: `/api/v1/profiles/${lea.id}/recommendations`, ...anon })).statusCode).toBe(401);
  });

  it('isolation : une autre famille ne voit, ne crée ni n’annule rien', async () => {
    const lea = await child(t.http);
    const a = (await recommend(t.http, lea.id, { skillId: SKILLS[0], note: MOT })).json<Recommendation>();
    const other = t.as((await t.signup('autre@famille.test')).cookie);
    const tom = await child(other, 'Tom');

    // Lecture, création et annulation sur l'enfant d'une autre famille : 404, comme s'il n'existait pas.
    const read = await other.inject(`/api/v1/profiles/${lea.id}/recommendations`);
    expect(read.statusCode).toBe(404);
    expect(read.body).not.toContain(MOT);
    expect((await recommend(other, lea.id, { skillId: SKILLS[1] })).statusCode).toBe(404);
    expect(
      (await other.inject({ method: 'DELETE', url: `/api/v1/profiles/${lea.id}/recommendations/${a.id}` })).statusCode,
    ).toBe(404);
    // Annuler par son propre enfant l'identifiant d'une recommandation d'une autre famille : 404 aussi.
    expect(
      (await other.inject({ method: 'DELETE', url: `/api/v1/profiles/${tom.id}/recommendations/${a.id}` })).statusCode,
    ).toBe(404);

    // Vues du parent et de l'enfant : seulement les siennes.
    expect(await family(other)).toEqual([]);
    expect(await pending(other, tom.id)).toEqual([]);
    expect(await family(t.http)).toHaveLength(1);
    expect(await pending(t.http, lea.id)).toHaveLength(1);

    // L'entraînement de Tom sur la même notion ne touche pas la recommandation de Léa.
    await play(other, tom.id, SKILLS[0], 2, 2);
    expect(await family(t.http)).toMatchObject([{ status: 'en-attente' }]);
  });

  it('les recommandations disparaissent avec le profil', async () => {
    const lea = await child(t.http);
    await recommend(t.http, lea.id, { skillId: SKILLS[0] });
    expect((await t.http.inject({ method: 'DELETE', url: `/api/v1/profiles/${lea.id}` })).statusCode).toBe(204);
    expect(await family(t.http)).toEqual([]);
  });
});
