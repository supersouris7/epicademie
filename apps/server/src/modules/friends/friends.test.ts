import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { FamilyFriend, FriendsView, Profile, RankingRow } from '@questeo/shared';
import { createTestApp, profileInput } from '../../testing/harness.ts';

let t: Awaited<ReturnType<typeof createTestApp>>;

beforeAll(async () => {
  t = await createTestApp();
});
afterAll(() => t.close());
beforeEach(() => t.reset());

/** Deux familles, un enfant chacune : Léa (famille de test) et Tom (autre famille). */
async function twoFamilies() {
  const lea = (
    await t.http.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Léa') })
  ).json<Profile>();
  const other = await t.signup('tom@famille.test');
  const tomClient = t.as(other.cookie);
  const tom = (
    await tomClient.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Tom') })
  ).json<Profile>();
  return { lea, tom, lc: t.http, tc: tomClient };
}

type Client = ReturnType<typeof t.as>;
const view = async (c: Client, id: string) => (await c.inject(`/api/v1/profiles/${id}/friends`)).json<FriendsView>();

describe('amis d’autres familles', () => {
  it('code ami, demande, acceptation, puis validation des deux parents', async () => {
    const { lea, tom, lc, tc } = await twoFamilies();
    const tomCode = (await view(tc, tom.id)).code;
    expect(tomCode).toMatch(/^[A-Z2-9]{6}$/);
    // Le code est stable.
    expect((await view(tc, tom.id)).code).toBe(tomCode);

    // Léa saisit le code de Tom (minuscules et tiret tolérés).
    const sent = await lc.inject({
      method: 'POST',
      url: `/api/v1/profiles/${lea.id}/friends`,
      payload: { code: `${tomCode.slice(0, 3).toLowerCase()}-${tomCode.slice(3)}` },
    });
    expect(sent.statusCode).toBe(201);
    expect(sent.json<FriendsView>().friends).toMatchObject([{ id: tom.id, name: 'Tom', status: 'envoyee' }]);
    expect((await view(tc, tom.id)).friends).toMatchObject([{ id: lea.id, status: 'recue' }]);

    // Léa ne peut pas accepter sa propre demande ; Tom accepte.
    expect(
      (await lc.inject({ method: 'POST', url: `/api/v1/profiles/${lea.id}/friends/${tom.id}/accept` })).statusCode,
    ).toBe(400);
    const accepted = await tc.inject({ method: 'POST', url: `/api/v1/profiles/${tom.id}/friends/${lea.id}/accept` });
    expect(accepted.json<FriendsView>().friends).toMatchObject([{ id: lea.id, status: 'parents', myParentOk: false }]);

    // Espace parent : chaque parent valide pour son enfant.
    const pending = (await lc.inject('/api/v1/family/friends')).json<FamilyFriend[]>();
    expect(pending).toMatchObject([{ profileId: lea.id, profileName: 'Léa', id: tom.id, status: 'parents' }]);
    await lc.inject({ method: 'POST', url: `/api/v1/profiles/${lea.id}/friends/${tom.id}/approve` });
    expect((await view(lc, lea.id)).friends).toMatchObject([{ status: 'parents', myParentOk: true }]);
    await tc.inject({ method: 'POST', url: `/api/v1/profiles/${tom.id}/friends/${lea.id}/approve` });
    expect((await view(lc, lea.id)).friends).toMatchObject([{ id: tom.id, status: 'active' }]);
    expect(await t.app.friends.activeIds(lea.id)).toEqual([tom.id]);

    // Retrait par l'un des deux : plus amis.
    const removed = await tc.inject({ method: 'DELETE', url: `/api/v1/profiles/${tom.id}/friends/${lea.id}` });
    expect(removed.json<FriendsView>().friends).toEqual([]);
    expect(await t.app.friends.activeIds(lea.id)).toEqual([]);
  });

  it('refus : code inconnu, son propre code, un joueur de sa famille, une demande en double', async () => {
    const { lea, tom, lc, tc } = await twoFamilies();
    const add = (code: string) =>
      lc.inject({ method: 'POST', url: `/api/v1/profiles/${lea.id}/friends`, payload: { code } });
    expect((await add('ZZZZZZ')).statusCode).toBe(404);
    expect((await add((await view(lc, lea.id)).code)).statusCode).toBe(400);
    const sister = (
      await lc.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Zoé') })
    ).json<Profile>();
    expect((await add((await view(lc, sister.id)).code)).statusCode).toBe(400);
    const tomCode = (await view(tc, tom.id)).code;
    expect((await add(tomCode)).statusCode).toBe(201);
    expect((await add(tomCode)).statusCode).toBe(409);
    expect((await add('ABC')).statusCode).toBe(400);
  });

  it('une famille ne touche pas aux amitiés d’un enfant d’une autre famille', async () => {
    const { lea, tom, tc } = await twoFamilies();
    expect((await tc.inject(`/api/v1/profiles/${lea.id}/friends`)).statusCode).toBe(404);
    expect(
      (await tc.inject({ method: 'POST', url: `/api/v1/profiles/${lea.id}/friends/${tom.id}/approve` })).statusCode,
    ).toBe(404);
  });

  it('se comparer : sa famille et ses amis actifs seulement, avec leurs chiffres', async () => {
    const { lea, tom, lc, tc } = await twoFamilies();
    const zoe = (
      await lc.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Zoé') })
    ).json<Profile>();
    const ranking = async () => (await lc.inject(`/api/v1/profiles/${lea.id}/ranking`)).json<RankingRow[]>();
    // Avant l'amitié : la famille seulement.
    expect((await ranking()).map((r) => r.name).sort()).toEqual(['Léa', 'Zoé']);
    // Amitié acceptée et validée par les deux parents : Tom apparaît, marqué « ami ».
    const tomCode = (await view(tc, tom.id)).code;
    await lc.inject({ method: 'POST', url: `/api/v1/profiles/${lea.id}/friends`, payload: { code: tomCode } });
    await tc.inject({ method: 'POST', url: `/api/v1/profiles/${tom.id}/friends/${lea.id}/accept` });
    await lc.inject({ method: 'POST', url: `/api/v1/profiles/${lea.id}/friends/${tom.id}/approve` });
    await tc.inject({ method: 'POST', url: `/api/v1/profiles/${tom.id}/friends/${lea.id}/approve` });
    const rows = await ranking();
    expect(rows.map((r) => r.name).sort()).toEqual(['Léa', 'Tom', 'Zoé']);
    expect(rows.find((r) => r.id === tom.id)).toMatchObject({ friend: true, me: false, level: 1, bosses: 0 });
    expect(rows.find((r) => r.id === lea.id)).toMatchObject({ me: true, friend: false });
    expect(rows.find((r) => r.id === zoe.id)).toMatchObject({ friend: false });
    // Une autre famille ne lit pas le classement de Léa.
    expect((await tc.inject(`/api/v1/profiles/${lea.id}/ranking`)).statusCode).toBe(404);
  });
});
