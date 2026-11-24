import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import type { Profile, Purchase } from '@epicademie/shared';
import { profiles } from '../../db/schema.ts';
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

const setCoins = (coins: number) => t.database.db.update(profiles).set({ coins }).where(eq(profiles.id, profile.id));
const buy = (item: string, profileId = profile.id) =>
  t.http.inject({ method: 'POST', url: '/api/v1/shop', payload: { profileId, item } });

describe('boutique', () => {
  it('achète un objet : pièces débitées, objet en réserve', async () => {
    await setCoins(100);
    const res = await buy('bouclier');
    expect(res.statusCode).toBe(200);
    expect(res.json<Purchase>()).toMatchObject({ coins: 60, rubies: 2, inventory: { bouclier: 1 } });
  });

  it('achète un rubis', async () => {
    await setCoins(2500);
    expect((await buy('rubis')).json<Purchase>()).toMatchObject({ coins: 500, rubies: 3 });
  });

  it('refuse sans assez de pièces, sans rien débiter', async () => {
    await setCoins(10);
    const res = await buy('soin');
    expect(res.statusCode).toBe(409);
    expect(res.json()).toMatchObject({ code: 'CONFLICT', error: 'Il te faut 30 pièces' });
    const after = (await t.http.inject(`/api/v1/profiles/${profile.id}`)).json<Profile>();
    expect(after.coins).toBe(10);
  });

  it('plafonne le stock à 9 par objet', async () => {
    await setCoins(1000);
    for (let i = 0; i < 9; i++) expect((await buy('indice')).statusCode).toBe(200);
    const res = await buy('indice');
    expect(res.statusCode).toBe(409);
    expect(res.json<{ error: string }>().error).toMatch(/9 indices au maximum/);
  });

  it('achats simultanés : jamais de solde négatif', async () => {
    await setCoins(40);
    const results = await Promise.all([buy('bouclier'), buy('bouclier'), buy('bouclier')]);
    expect(results.filter((r) => r.statusCode === 200)).toHaveLength(1);
    const after = (await t.http.inject(`/api/v1/profiles/${profile.id}`)).json<Profile>();
    expect(after.coins).toBe(0);
  });

  it('profil inconnu : 404', async () => {
    expect((await buy('soin', '00000000-0000-4000-8000-000000000000')).statusCode).toBe(404);
  });

  describe('requête rejouée (double appui, réseau qui renvoie)', () => {
    const buyWithKey = (key: string, item = 'bouclier') =>
      t.http.inject({
        method: 'POST',
        url: '/api/v1/shop',
        headers: { 'idempotency-key': key },
        payload: { profileId: profile.id, item },
      });
    const coins = async () => (await t.http.inject(`/api/v1/profiles/${profile.id}`)).json<Profile>().coins;

    it('même clé : un seul achat, même réponse', async () => {
      await setCoins(200);
      const first = await buyWithKey('achat-0001');
      const again = await buyWithKey('achat-0001');
      expect(again.json()).toEqual(first.json());
      expect(await coins()).toBe(160);
      // Autre clé : nouvel achat.
      await buyWithKey('achat-0002');
      expect(await coins()).toBe(120);
    });

    it('même clé envoyée trois fois en même temps : débité une seule fois', async () => {
      await setCoins(200);
      const results = await Promise.all([buyWithKey('simultane'), buyWithKey('simultane'), buyWithKey('simultane')]);
      expect(results.map((r) => r.statusCode)).toEqual([200, 200, 200]);
      expect(await coins()).toBe(160);
    });

    it('clé invalide ou réutilisée pour un autre objet : refusée', async () => {
      await setCoins(200);
      expect((await buyWithKey('x')).statusCode).toBe(400);
      await buyWithKey('cle-unique-1', 'bouclier');
      // Même opération (« acheter ») : la réponse d'origine revient, sans second débit.
      expect((await buyWithKey('cle-unique-1', 'soin')).json<Purchase>().inventory.soin).toBe(0);
      expect(await coins()).toBe(160);
    });

    it('les clés d’une famille ne servent pas à une autre', async () => {
      await setCoins(200);
      await buyWithKey('partagee-01');
      const other = await t.signup('autre@famille.test');
      const theirs = (
        await t.as(other.cookie).inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Zoé') })
      ).json<Profile>();
      await t.database.db.update(profiles).set({ coins: 100 }).where(eq(profiles.id, theirs.id));
      const res = await t.as(other.cookie).inject({
        method: 'POST',
        url: '/api/v1/shop',
        headers: { 'idempotency-key': 'partagee-01' },
        payload: { profileId: theirs.id, item: 'bouclier' },
      });
      expect(res.json<Purchase>().coins).toBe(60);
    });
  });
});
