import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import type { Hq, HqLayout, Profile } from '@questeo/shared';
import { bossRecords, profiles } from '../../db/schema.ts';
import { createTestApp, profileInput } from '../../testing/harness.ts';

let t: Awaited<ReturnType<typeof createTestApp>>;
let profile: Profile;

beforeAll(async () => {
  t = await createTestApp();
});
afterAll(() => t.close());
beforeEach(async () => {
  await t.reset();
  profile = (await t.http.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput() })).json<Profile>();
});

const setWallet = (coins: number, rubies: number) =>
  t.database.db.update(profiles).set({ coins, rubies }).where(eq(profiles.id, profile.id));
const hq = async () => (await t.http.inject(`/api/v1/profiles/${profile.id}/hq`)).json<Hq>();
const save = (layout: Partial<HqLayout>) =>
  t.http.inject({
    method: 'PUT',
    url: `/api/v1/profiles/${profile.id}/hq`,
    payload: { fond: 'fond-classe', cadre: 'cadre-simple', titre: 'titre-apprenti', vitrine: [], ...layout },
  });
const buy = (cosmetic: string) =>
  t.http.inject({ method: 'POST', url: '/api/v1/shop/cosmetics', payload: { profileId: profile.id, cosmetic } });

describe('QG et cosmétiques', () => {
  it('nouveau joueur : aménagement par défaut, cosmétiques de départ, héros de départ en trophée', async () => {
    const h = await hq();
    expect(h.layout).toEqual({ fond: 'fond-classe', cadre: 'cadre-simple', titre: 'titre-apprenti', vitrine: [] });
    expect(h.unlocked.sort()).toEqual(['cadre-simple', 'fond-classe', 'titre-apprenti']);
    expect(h.trophies).toEqual([`heros:${profile.hero}`]);
  });

  it('achat en rubis : débité une fois, cosmétique utilisable ; pas de second achat', async () => {
    await setWallet(0, 2);
    const res = await buy('fond-nuit');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ coins: 0, rubies: 0 });
    expect((await buy('fond-nuit')).statusCode).toBe(409);
    expect((await save({ fond: 'fond-nuit' })).statusCode).toBe(200);
    expect((await hq()).layout.fond).toBe('fond-nuit');
  });

  it('solde insuffisant : refus sans rien débiter', async () => {
    await setWallet(1000, 1);
    const res = await buy('fond-ocean');
    expect(res.statusCode).toBe(409);
    expect(res.json()).toMatchObject({ error: 'Il te faut 3 rubis.' });
    const [p] = await t.database.db.select().from(profiles).where(eq(profiles.id, profile.id));
    expect(p).toMatchObject({ coins: 1000, rubies: 1 });
  });

  it('cosmétique de badge : pas à vendre, débloqué en battant un boss', async () => {
    expect((await buy('titre-chasseur')).statusCode).toBe(409);
    expect((await save({ titre: 'titre-chasseur' })).statusCode).toBe(409);
    await t.database.db.insert(bossRecords).values({ profileId: profile.id, chapterId: 'm5-calcul', wins: 1 });
    const h = await hq();
    expect(h.unlocked).toContain('titre-chasseur');
    expect(h.trophies).toEqual(expect.arrayContaining(['boss:m5-calcul', 'badge:boss']));
    const saved = await save({ titre: 'titre-chasseur', vitrine: ['boss:m5-calcul', 'badge:boss'] });
    expect(saved.statusCode).toBe(200);
    expect(saved.json<Hq>().layout.vitrine).toEqual(['boss:m5-calcul', 'badge:boss']);
  });

  it('aménagement refusé : mauvais emplacement, trophée non gagné ou en double', async () => {
    expect((await save({ fond: 'cadre-simple' })).statusCode).toBe(409);
    expect((await save({ vitrine: ['boss:m5-calcul'] })).statusCode).toBe(409);
    const own = `heros:${profile.hero}`;
    expect((await save({ vitrine: [own, own] })).statusCode).toBe(409);
    expect((await save({ vitrine: ['n’importe quoi'] })).statusCode).toBe(400);
  });

  it('QG d’un profil d’une autre famille : introuvable', async () => {
    const other = await t.signup('autre@famille.test');
    expect((await t.as(other.cookie).inject(`/api/v1/profiles/${profile.id}/hq`)).statusCode).toBe(404);
  });
});
