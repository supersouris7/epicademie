import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import type { Profile } from '@questeo/shared';
import { profiles } from '../../db/schema.ts';
import { createTestApp, profileInput } from '../../testing/harness.ts';
import { attachOrphanProfiles } from './index.ts';

let t: Awaited<ReturnType<typeof createTestApp>>;

beforeAll(async () => {
  t = await createTestApp();
});
afterAll(() => t.close());
beforeEach(() => t.reset());

describe('rattachement des profils de la bêta', () => {
  it('les profils sans famille rejoignent la famille du compte, avec leurs progrès ; les autres ne bougent pas', async () => {
    // Profil de la bêta : créé avant les comptes (sans famille), avec des pièces gagnées.
    const created = (
      await t.http.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Léo') })
    ).json<Profile>();
    await t.database.db.update(profiles).set({ familyId: null, coins: 420 }).where(eq(profiles.id, created.id));
    const other = await t.signup('voisins@famille.test');
    const theirs = (
      await t.as(other.cookie).inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Inès') })
    ).json<Profile>();
    expect((await t.http.inject('/api/v1/profiles')).json<Profile[]>()).toEqual([]);

    expect(await attachOrphanProfiles(t.database.db, ` ${t.family().me.account.email.toUpperCase()} `)).toEqual([
      'Léo',
    ]);
    const mine = (await t.http.inject('/api/v1/profiles')).json<Profile[]>();
    expect(mine).toEqual([expect.objectContaining({ id: created.id, name: 'Léo', coins: 420 })]);
    // Profil d'une autre famille : intact. Second passage : plus rien à rattacher.
    expect((await t.as(other.cookie).inject('/api/v1/profiles')).json<Profile[]>().map((p) => p.id)).toEqual([
      theirs.id,
    ]);
    expect(await attachOrphanProfiles(t.database.db, t.family().me.account.email)).toEqual([]);
    expect(await attachOrphanProfiles(t.database.db, 'inconnu@famille.test')).toBeNull();
  });
});
