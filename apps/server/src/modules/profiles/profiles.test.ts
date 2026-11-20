import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Profile, SessionSummary } from '@questeo/shared';
import { createTestApp, profileInput, sequenceRandom } from '../../testing/harness.ts';

const avatar = { style: 'fun-emoji', seed: 'abc' } as const;

let t: Awaited<ReturnType<typeof createTestApp>>;
let app: Awaited<ReturnType<typeof createTestApp>>['http'];

beforeAll(async () => {
  t = await createTestApp();
  app = t.http;
});
beforeEach(() => t.reset());
afterAll(() => t.close());

const create = async (name: string) => {
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/profiles',
    payload: { name, avatar, gender: 'fille', birthDate: '2014-03-09', grade: '5e' },
  });
  return { res, profile: res.json<Profile>() };
};

describe('API profils', () => {
  it('crée puis liste des profils avec les valeurs par défaut', async () => {
    const { res, profile } = await create('  Léa  ');
    expect(res.statusCode).toBe(201);
    expect(profile).toMatchObject({
      name: 'Léa',
      xp: 0,
      coins: 0,
      soundOn: true,
      avatar,
      gender: 'fille',
      birthDate: '2014-03-09',
      grade: '5e',
      hero: 'alex',
    });
    const list = await app.inject('/api/v1/profiles');
    expect(list.json<Profile[]>()).toHaveLength(1);
  });

  it('rejette un prénom vide ou un avatar inconnu', async () => {
    expect((await create('   ')).res.statusCode).toBe(400);
    const bad = await app.inject({
      method: 'POST',
      url: '/api/v1/profiles',
      payload: {
        name: 'Tom',
        avatar: { ...avatar, style: 'inconnu' },
        gender: 'garcon',
        birthDate: '2014-01-01',
        grade: '5e',
      },
    });
    expect(bad.statusCode).toBe(400);
    const noGender = await app.inject({
      method: 'POST',
      url: '/api/v1/profiles',
      payload: { name: 'Tom', avatar, birthDate: '2014-01-01', grade: '5e' },
    });
    expect(noGender.statusCode).toBe(400);
    const future = await app.inject({
      method: 'POST',
      url: '/api/v1/profiles',
      payload: { name: 'Tom', avatar, gender: 'garcon', birthDate: '2099-01-01', grade: '5e' },
    });
    expect(future.statusCode).toBe(400);
    const noGrade = await app.inject({
      method: 'POST',
      url: '/api/v1/profiles',
      payload: { name: 'Tom', avatar, gender: 'garcon', birthDate: '2014-01-01' },
    });
    expect(noGrade.statusCode).toBe(400);
  });

  it('modifie un profil', async () => {
    const { profile } = await create('Tom');
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/profiles/${profile.id}`,
      payload: { soundOn: false, hero: 'alex' },
    });
    expect(res.json<Profile>()).toMatchObject({ soundOn: false, name: 'Tom', hero: 'alex' });
    const bad = await app.inject({
      method: 'PATCH',
      url: `/api/v1/profiles/${profile.id}`,
      payload: { hero: 'ninja' },
    });
    expect(bad.statusCode).toBe(400);
    // Héros pas encore dessiné : refusé.
    const soon = await app.inject({
      method: 'PATCH',
      url: `/api/v1/profiles/${profile.id}`,
      payload: { hero: 'ayla' },
    });
    expect(soon.statusCode).toBe(400);
  });

  it('ignore les champs non modifiables (xp)', async () => {
    const { profile } = await create('Tom');
    const res = await app.inject({ method: 'PATCH', url: `/api/v1/profiles/${profile.id}`, payload: { xp: 9999 } });
    expect(res.json<Profile>().xp).toBe(0);
  });

  it('supprime un profil et renvoie 404 ensuite', async () => {
    const { profile } = await create('Tom');
    expect((await app.inject({ method: 'DELETE', url: `/api/v1/profiles/${profile.id}` })).statusCode).toBe(204);
    expect((await app.inject(`/api/v1/profiles/${profile.id}`)).statusCode).toBe(404);
  });

  it('refuse un identifiant mal formé (400) et un profil inconnu (404)', async () => {
    const bad = await app.inject('/api/v1/profiles/pas-un-uuid');
    expect(bad.statusCode).toBe(400);
    expect(bad.json()).toMatchObject({ code: 'BAD_REQUEST' });
    const unknown = await app.inject('/api/v1/profiles/00000000-0000-4000-8000-000000000000');
    expect(unknown.json()).toMatchObject({ code: 'NOT_FOUND', error: 'Profil introuvable' });
  });

  it('supprime en cascade toute la progression du profil', async () => {
    const { profile } = await create('Tom');
    const session = await app.inject({
      method: 'POST',
      url: '/api/v1/sessions',
      payload: { profileId: profile.id, mode: 'entrainement', subject: 'maths', chapterId: 'm5-calcul', skillId: null },
    });
    expect(session.statusCode).toBe(201);
    await app.inject({ method: 'DELETE', url: `/api/v1/profiles/${profile.id}` });
    const finish = await app.inject({
      method: 'POST',
      url: `/api/v1/sessions/${session.json<{ id: string }>().id}/finish`,
    });
    expect(finish.statusCode).toBe(404);
  });

  it('n’expose pas les colonnes internes (équipement) dans le profil', async () => {
    const { profile } = await create('Tom');
    expect(Object.keys(profile).sort()).toEqual(
      [
        'avatar',
        'birthDate',
        'coins',
        'createdAt',
        'gender',
        'grade',
        'hero',
        'id',
        'musicOn',
        'name',
        'rubies',
        'soundOn',
        'xp',
      ].sort(),
    );
    expect(new Date(profile.createdAt).toISOString()).toBe(profile.createdAt);
  });

  it('Acad-Héros : le héros de départ est dans la collection ; un héros non trouvé ne se porte pas', async () => {
    const p = (
      await app.inject({ method: 'POST', url: '/api/v1/profiles', payload: { ...profileInput('Noé'), hero: 'pixel' } })
    ).json<Profile>();
    expect((await app.inject(`/api/v1/profiles/${p.id}/heroes`)).json()).toEqual({ heroes: ['pixel'] });
    const res = await app.inject({ method: 'PATCH', url: `/api/v1/profiles/${p.id}`, payload: { hero: 'lina' } });
    expect(res.statusCode).toBe(409);
    expect(res.json<{ error: string }>().error).toMatch(/coffre/);
    expect(
      (await app.inject({ method: 'PATCH', url: `/api/v1/profiles/${p.id}`, payload: { hero: 'pixel' } })).statusCode,
    ).toBe(200);
  });

  it('Acad-Héros trouvé dans le coffre d’une série : ajouté à la collection', async () => {
    // Coffre épique (0,99), 2 objets, héros tiré (0,1 < 25 %), le 1er héros manquant.
    const lucky = await createTestApp({ random: sequenceRandom([0.99, 0, 0, 0.1, 0]) });
    try {
      const p = (
        await lucky.http.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Noé') })
      ).json<Profile>();
      const { id } = (
        await lucky.http.inject({
          method: 'POST',
          url: '/api/v1/sessions',
          payload: {
            profileId: p.id,
            mode: 'entrainement',
            subject: 'maths',
            chapterId: 'm5-calcul',
            skillId: 'm5-tables',
          },
        })
      ).json<{ id: string }>();
      await lucky.http.inject({
        method: 'POST',
        url: `/api/v1/sessions/${id}/answers`,
        payload: {
          skillId: 'm5-tables',
          level: 1,
          seed: 1,
          variant: false,
          response: { kind: 'number', text: '-1' },
          durationMs: 1000,
        },
      });
      const summary = (
        await lucky.http.inject({ method: 'POST', url: `/api/v1/sessions/${id}/finish` })
      ).json<SessionSummary>();
      expect(summary.chest?.hero).toEqual({ id: 'lina', duplicate: false });
      expect((await lucky.http.inject(`/api/v1/profiles/${p.id}/heroes`)).json()).toEqual({ heroes: ['alex', 'lina'] });
    } finally {
      await lucky.close();
    }
  });
});
