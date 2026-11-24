import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { count, eq } from 'drizzle-orm';
import type { AccountDetail, AccountPage, AuditPage, Profile, TemporaryPassword } from '@questeo/shared';
import { accounts, adminAudit, authSessions, contentEvents, profiles } from '../../db/schema.ts';
import { loadConfig } from '../../config.ts';
import { sanitizeOperatorName } from '../../core/http/auth.ts';
import { createTestApp, profileInput, TEST_OPERATOR_SECRET, TEST_PASSWORD } from '../../testing/harness.ts';
import { newTemporaryPassword } from './admin.service.ts';

let t: Awaited<ReturnType<typeof createTestApp>>;
let op: ReturnType<typeof t.operator>;

beforeAll(async () => {
  t = await createTestApp({ today: '2026-11-24' });
});
afterAll(() => t.close());
beforeEach(async () => {
  await t.reset();
  op = t.operator('Marie Dupont');
});

const search = async (body: object = {}) =>
  (await op.inject({ method: 'POST', url: '/api/v1/admin/accounts/search', payload: body })).json<AccountPage>();

describe('opérateur d’administration', () => {
  it('reconnu au secret seulement : famille connectée, secret absent ou faux = 403', async () => {
    expect((await op.inject('/api/v1/admin/stats')).statusCode).toBe(200);
    expect((await t.http.inject('/api/v1/admin/stats')).statusCode).toBe(403);
    const wrong = await t.raw.inject({
      url: '/api/v1/admin/stats',
      headers: { 'x-questeo-operateur': `${TEST_OPERATOR_SECRET}x` },
    });
    expect(wrong.statusCode).toBe(403);
    expect((await t.raw.inject('/api/v1/admin/session')).statusCode).toBe(403);
    expect((await op.inject('/api/v1/admin/session')).json()).toEqual({ operator: 'Marie Dupont' });
  });

  it('droits d’administration uniquement : aucune famille, aucun profil', async () => {
    const res = await op.inject({ url: '/api/v1/profiles' });
    expect(res.statusCode).toBe(401);
    const cookie = t.family().cookie;
    // Même avec un cookie de jeu, l'opérateur n'est pas un compte : pas de session d'appareil.
    expect((await op.inject({ url: '/api/v1/auth/me', headers: { cookie } })).statusCode).toBe(401);
  });

  it('sans secret configuré : aucune administration', async () => {
    const off = await createTestApp({ config: { adminOperatorSecret: null } });
    try {
      const res = await off.operator().inject('/api/v1/admin/stats');
      expect(res.statusCode).toBe(403);
    } finally {
      await off.close();
    }
  });

  it('configuration : secret de moins de 32 caractères refusé, absent accepté', () => {
    expect(() => loadConfig({ ADMIN_OPERATOR_SECRET: 'trop-court' })).toThrow(/ADMIN_OPERATOR_SECRET/);
    expect(loadConfig({}).adminOperatorSecret).toBeNull();
    expect(loadConfig({ ADMIN_OPERATOR_SECRET: 'x'.repeat(32) }).adminOperatorSecret).toBe('x'.repeat(32));
  });

  it('nom assaini : caractères de contrôle retirés, 40 caractères', () => {
    expect(sanitizeOperatorName('  Marie\n\tDupont\u0000 ')).toBe('Marie Dupont');
    expect(sanitizeOperatorName('a'.repeat(100))).toHaveLength(40);
    expect(sanitizeOperatorName(undefined)).toBe('operateur');
  });

  it('origine vérifiée pour les requêtes non sûres', async () => {
    const res = await op.inject({
      method: 'POST',
      url: '/api/v1/admin/accounts/search',
      payload: {},
      headers: { origin: 'https://autre-site.example', host: 'recette.example' },
    });
    expect(res.statusCode).toBe(403);
  });

  it('l’ancien accès par compte de jeu n’existe plus', async () => {
    expect((await t.http.inject({ method: 'POST', url: '/api/v1/auth/admin', payload: {} })).statusCode).toBe(404);
  });

  it('décisions sur les notions : nom de l’opérateur dans l’historique', async () => {
    await op.inject({ method: 'PUT', url: '/api/v1/admin/content/m5-tables', payload: { disabled: true } });
    const [event] = await t.database.db.select().from(contentEvents);
    expect(event?.operator).toBe('Marie Dupont');
  });
});

describe('liste des comptes', () => {
  it('25 par page, pagination bornée, total et page suivante', async () => {
    const rows = Array.from({ length: 30 }, (_, i) => ({
      familyId: t.family().me.family.id,
      email: `e${i}@liste.test`,
    }));
    await t.database.db.insert(accounts).values(rows);
    const first = await search();
    expect(first.items).toHaveLength(25);
    expect(first).toMatchObject({ page: 0, pageSize: 25, total: 31, hasMore: true });
    const second = await search({ page: 1 });
    expect(second.items).toHaveLength(6);
    expect(second.hasMore).toBe(false);
    const ids = new Set([...first.items, ...second.items].map((r) => r.id));
    expect(ids.size).toBe(31);
    const tooFar = await op.inject({
      method: 'POST',
      url: '/api/v1/admin/accounts/search',
      payload: { page: 100_000 },
    });
    expect(tooFar.statusCode).toBe(400);
  });

  it('recherche partielle, sans casse ni accents : e-mail, prénom de profil, identifiant de famille', async () => {
    await t.http.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Zoé') });
    const other = await t.signup('Autre.Famille@Exemple.test');
    await t.as(other.cookie).inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Hugo') });
    expect((await search({ q: 'ZOE' })).items.map((r) => r.profileNames)).toEqual([['Zoé']]);
    expect((await search({ q: 'zoé' })).total).toBe(1);
    const byEmail = await search({ q: 'famille@exemple' });
    expect(byEmail.items).toHaveLength(1);
    expect(byEmail.items[0]?.profileNames).toEqual(['Hugo']);
    const familyId = other.me.family.id;
    expect((await search({ q: familyId.slice(0, 8) })).items.map((r) => r.familyId)).toContain(familyId);
    expect((await search({ q: '100%' })).total).toBe(0);
    expect((await search({ q: 'introuvable' })).items).toEqual([]);
  });

  it('filtres de type et d’état, tri par date de création', async () => {
    const student = await t.http.inject({
      method: 'POST',
      url: '/api/v1/auth/student/signup',
      headers: { cookie: '' },
      payload: { name: 'Léo', avatar: { style: 'portrait', seed: '03' }, grade: '6e', age: 12 },
    });
    expect(student.statusCode).toBe(201);
    expect((await search({ type: 'autonome' })).items.map((r) => r.type)).toEqual(['autonome']);
    expect((await search({ type: 'famille' })).items.map((r) => r.type)).toEqual(['famille']);
    expect((await search({ state: 'abonne' })).total).toBe(1); // famille de test abonnée
    expect((await search({ state: 'non-verifie' })).total).toBe(0);
    await t.database.db
      .update(accounts)
      .set({ emailVerifiedAt: null })
      .where(eq(accounts.id, t.family().me.account.id));
    expect((await search({ state: 'non-verifie' })).total).toBe(1);
    const asc = await search({ order: 'asc' });
    const desc = await search({ order: 'desc' });
    expect(asc.items.map((r) => r.id)).toEqual(desc.items.map((r) => r.id).reverse());
    expect((await search({ sort: 'activite' })).items).toHaveLength(2);
  });

  it('réservée à l’opérateur', async () => {
    const res = await t.http.inject({ method: 'POST', url: '/api/v1/admin/accounts/search', payload: {} });
    expect(res.statusCode).toBe(403);
  });
});

describe('fiche d’un compte', () => {
  const detail = (id: string) => op.inject(`/api/v1/admin/accounts/${id}`);

  it('résumé complet, sans empreinte ni secret', async () => {
    const profile = (
      await t.http.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Zoé') })
    ).json<Profile>();
    await t.database.db.update(profiles).set({ coins: 120 }).where(eq(profiles.id, profile.id));
    await t.http.inject({
      method: 'POST',
      url: '/api/v1/auth/parent/pin',
      payload: { password: TEST_PASSWORD, pin: '4821' },
    });
    const res = await detail(t.family().me.account.id);
    expect(res.statusCode).toBe(200);
    const d = res.json<AccountDetail>();
    expect(d.account).toMatchObject({
      email: expect.stringContaining('@') as string,
      type: 'famille',
      methods: ['mot-de-passe'],
      hasPin: true,
    });
    expect(d.account.emailVerifiedAt).not.toBeNull();
    expect(d.profiles).toEqual([
      expect.objectContaining({ name: 'Zoé', coins: 120, games: 0, answers: 0, skillsMastered: 0 }),
    ]);
    expect(d.subscriptions).toEqual([expect.objectContaining({ status: 'payee' })]);
    expect(d.pending).toEqual({ invitation: false, passwordReset: false, emailVerification: false });
    // Jamais d'empreinte, de jeton ni de PIN.
    const [row] = await t.database.db.select().from(accounts).where(eq(accounts.id, d.account.id));
    for (const secret of [row?.passwordHash, row?.parentPinHash, '4821', TEST_PASSWORD]) {
      expect(secret).toBeTruthy();
      expect(res.body).not.toContain(secret!);
    }
    expect(res.body).not.toMatch(/passwordHash|parentPinHash|recoveryHash|tokenHash|googleSub/);
  });

  it('inconnu : 404 et aucune trace d’audit', async () => {
    const res = await detail('00000000-0000-4000-8000-000000000000');
    expect(res.statusCode).toBe(404);
    expect((await t.database.db.select({ n: count() }).from(adminAudit))[0]?.n).toBe(0);
  });

  it('chaque consultation est journalisée (opérateur, compte, date) et le journal est paginé', async () => {
    const id = t.family().me.account.id;
    await detail(id);
    await t.operator('Autre Personne').inject(`/api/v1/admin/accounts/${id}`);
    const audit = (await op.inject({ method: 'POST', url: '/api/v1/admin/audit', payload: {} })).json<AuditPage>();
    expect(audit.items.map((a) => [a.operator, a.action, a.accountId])).toEqual([
      ['Autre Personne', 'consultation', id],
      ['Marie Dupont', 'consultation', id],
    ]);
    expect(audit.hasMore).toBe(false);
    expect(new Date(audit.items[0]?.at ?? '').getTime()).toBeGreaterThan(0);
  });
});

describe('mot de passe temporaire', () => {
  it('12 caractères lisibles, ancien mot de passe invalide, sessions fermées, audit', async () => {
    const email = 'recette@famille.test';
    const other = await t.signup(email);
    const id = other.me.account.id;
    const res = await op.inject({ method: 'POST', url: `/api/v1/admin/accounts/${id}/password-reset` });
    expect(res.statusCode).toBe(200);
    const { password, sessionsClosed } = res.json<TemporaryPassword>();
    expect(password).toMatch(/^[a-zA-Z2-9]{12}$/);
    expect(password).not.toMatch(/[0OlI1]/);
    expect(sessionsClosed).toBeGreaterThanOrEqual(1);
    expect((await t.database.db.select().from(authSessions).where(eq(authSessions.accountId, id))).length).toBe(0);
    const login = (pw: string) =>
      t.raw.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email, password: pw } });
    expect((await login(TEST_PASSWORD)).statusCode).toBe(401);
    expect((await login(password)).statusCode).toBe(200);
    // Le mot de passe n'est ni dans le journal d'audit, ni dans la fiche.
    const [entry] = await t.database.db.select().from(adminAudit).where(eq(adminAudit.accountId, id));
    expect(entry).toMatchObject({ operator: 'Marie Dupont', action: 'reinitialisation-mot-de-passe' });
    expect(JSON.stringify(entry)).not.toContain(password);
  });

  it('refusé pour un élève autonome ou un compte inconnu ; réservé à l’opérateur', async () => {
    const student = await t.raw.inject({
      method: 'POST',
      url: '/api/v1/auth/student/signup',
      headers: { cookie: '' },
      payload: { name: 'Léo', avatar: { style: 'portrait', seed: '03' }, grade: '6e', age: 12 },
    });
    expect(student.statusCode).toBe(201);
    const page = await search({ type: 'autonome' });
    const id = page.items[0]?.id ?? '';
    expect((await op.inject({ method: 'POST', url: `/api/v1/admin/accounts/${id}/password-reset` })).statusCode).toBe(
      409,
    );
    const unknown = '00000000-0000-4000-8000-000000000000';
    expect(
      (await op.inject({ method: 'POST', url: `/api/v1/admin/accounts/${unknown}/password-reset` })).statusCode,
    ).toBe(404);
    expect(
      (await t.http.inject({ method: 'POST', url: `/api/v1/admin/accounts/${id}/password-reset` })).statusCode,
    ).toBe(403);
  });

  it('générateur : alphabet lisible, valeurs différentes', () => {
    const a = newTemporaryPassword();
    expect(a).toHaveLength(12);
    expect(newTemporaryPassword()).not.toBe(a);
  });
});
