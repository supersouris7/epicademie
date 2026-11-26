import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { InjectOptions, LightMyRequestResponse } from 'fastify';
import {
  ADMIN_PERMISSIONS,
  ADMIN_ROLES,
  api,
  API_PREFIX,
  buildPath,
  type AdminPermission,
  type AdminRole,
  type AdminStats,
  type AdminTrends,
  type AnyEndpoint,
  type AuditPage,
} from '@epicademie/shared';
import { loadConfig } from '../../config.ts';
import { adminAccessEvents, adminAudit, adminSessions, contentEvents } from '../../db/schema.ts';
import { createTestApp, fixedClock, TEST_OPERATOR_SECRET } from '../../testing/harness.ts';
import { createTestOidc, TEST_CLIENT, TEST_ISSUER, type TestSignIn } from '../../testing/oidcProvider.ts';

const ORIGIN = 'https://admin.test';
const HOST = 'admin.test';
const RESCUE = 'secret-de-secours-de-test-0123456789-abcdef';
const COOKIE = '__Host-epicademie_admin';

let provider: Awaited<ReturnType<typeof createTestOidc>>;
let t: Awaited<ReturnType<typeof createTestApp>>;
let now = new Date('2026-11-24T08:00:00Z');
const clock = { ...fixedClock('2026-11-24'), now: () => now };
const later = (minutes: number) => void (now = new Date(now.getTime() + minutes * 60_000));

beforeAll(async () => {
  provider = await createTestOidc();
  t = await createTestApp({
    clock,
    fetcher: provider.fetcher,
    config: { adminOrigin: ORIGIN, adminSso: { issuer: TEST_ISSUER, ...TEST_CLIENT } },
  });
});
afterAll(() => t.close());
beforeEach(async () => {
  now = new Date('2026-11-24T08:00:00Z');
  await t.reset();
});

const cookiesOf = (res: LightMyRequestResponse): string[] => [res.headers['set-cookie'] ?? []].flat();
const pair = (res: LightMyRequestResponse, name: string) =>
  cookiesOf(res)
    .map((c) => c.split(';')[0] ?? '')
    .find((c) => c.startsWith(`${name}=`) && c.length > name.length + 1) ?? '';

/** Parcours complet : départ vers le fournisseur, identification, retour sur l'application. */
async function signIn(person: TestSignIn = {}, tamper: { state?: string; query?: string; cookie?: string } = {}) {
  const start = await t.raw.inject({ url: `${API_PREFIX}/admin-auth/login`, headers: { host: HOST } });
  expect(start.statusCode).toBe(302);
  const { code, state } = provider.authorize(String(start.headers.location), person);
  const res = await t.raw.inject({
    url: `${API_PREFIX}/admin-auth/callback?code=${code}&state=${tamper.state ?? state}${tamper.query ?? ''}`,
    headers: { host: HOST, cookie: tamper.cookie ?? pair(start, '__Host-epicademie_oidc') },
  });
  return { start, res, cookie: pair(res, COOKIE) };
}

/** Requêtes d'un navigateur connecté sur le site d'administration. */
const browser = (cookie: string) => (options: InjectOptions & { url: string }) =>
  t.raw.inject({ ...options, headers: { host: HOST, origin: ORIGIN, cookie, ...options.headers } });

const as = async (role: AdminRole, person: TestSignIn = {}) => {
  const { cookie } = await signIn({ sub: `sub-${role}`, groups: [`epicademie-${role}`], ...person });
  return browser(cookie);
};

const status = async (cookie: string, url = '/admin/session') =>
  (await browser(cookie)({ url: API_PREFIX + url })).statusCode;

/** Matrice attendue (docs/adr/0036), écrite à part de la table du code. */
const MATRIX: Record<AdminPermission, readonly [boolean, boolean, boolean, boolean]> = {
  // propriétaire, modération, pédagogie, lecture seule
  'stats:lire': [true, true, true, true],
  'comptes:lire': [true, true, false, false],
  'comptes:agir': [true, true, false, false],
  'signalements:lire': [true, true, true, true],
  'signalements:traiter': [true, true, true, false],
  'contenus:lire': [true, false, true, true],
  'contenus:modifier': [true, false, true, false],
  'finances:lire': [true, false, false, false],
  'audit:lire': [true, false, false, false],
};

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';
const PARAMS: Record<string, string> = { id: UNKNOWN_ID, status: 'nouveau', skillId: 'm5-tables' };
const BODIES: Partial<Record<keyof typeof api, object>> = {
  adminAccounts: {},
  adminAudit: {},
  adminUpdateReport: { status: 'resolu' },
  adminUpdateContent: { reviewed: true },
};
const adminEndpoints = (Object.entries(api) as [keyof typeof api, AnyEndpoint][]).filter(
  ([, e]) => e.access === 'admin',
);

describe('matrice des rôles', () => {
  it('toute route d’administration déclare une permission connue', () => {
    expect(adminEndpoints.length).toBeGreaterThan(10);
    for (const [name, e] of adminEndpoints) {
      expect(Object.keys(ADMIN_PERMISSIONS), name).toContain(e.permission);
      expect(e.path.startsWith('/admin/'), name).toBe(true);
    }
    expect(Object.keys(MATRIX).sort()).toEqual(Object.keys(ADMIN_PERMISSIONS).sort());
  });

  const cases = ADMIN_ROLES.flatMap((role, i) =>
    (Object.keys(MATRIX) as AdminPermission[]).map((permission) => ({
      role,
      permission,
      allowed: MATRIX[permission][i],
    })),
  );

  it.each(cases)('$role × $permission : $allowed', async ({ role, permission, allowed }) => {
    const send = await as(role);
    expect(ADMIN_PERMISSIONS[permission].includes(role as never)).toBe(allowed);
    for (const [name, e] of adminEndpoints.filter(([, e]) => e.permission === permission)) {
      const params = Object.fromEntries((e.path.match(/:\w+/g) ?? []).map((p) => [p.slice(1), PARAMS[p.slice(1)]!]));
      const res = await send({
        method: e.method,
        url: API_PREFIX + buildPath(e.path, params),
        ...(BODIES[name] ? { payload: BODIES[name] } : {}),
      });
      // Autorisé : la requête atteint le service (200, ou 404 pour un identifiant inconnu).
      if (allowed) expect([200, 404], name).toContain(res.statusCode);
      else expect(res.statusCode, name).toBe(403);
    }
  });

  it('montants et abonnements : au propriétaire seulement', async () => {
    for (const role of ADMIN_ROLES) {
      const send = await as(role);
      const stats = (await send({ url: `${API_PREFIX}/admin/stats` })).json<AdminStats>();
      const trends = (await send({ url: `${API_PREFIX}/admin/trends` })).json<AdminTrends>();
      const money = [
        stats.payments,
        stats.premiumFamilies,
        trends.revenueCents,
        trends.activeByOffer,
        trends.activeSubscriptionsByDay,
        trends.paymentProviders,
      ];
      if (role === 'proprietaire') expect(money).not.toContain(null);
      else expect(money).toEqual([null, null, null, null, null, null]);
      expect(stats.families).toBe(1);
    }
  });
});

describe('connexion', () => {
  it('demande conforme : code, PKCE, state, nonce, retour sur le site d’administration', async () => {
    const { start, res } = await signIn({ groups: ['epicademie-lecture'] });
    const url = new URL(String(start.headers.location));
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      client_id: TEST_CLIENT.clientId,
      redirect_uri: `${ORIGIN}/api/v1/admin-auth/callback`,
      response_type: 'code',
      scope: 'openid profile email groups',
      code_challenge_method: 'S256',
    });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/admin');
  });

  it('cookie __Host- : Secure, HttpOnly, SameSite=Lax, sans domaine ; empreinte seule en base', async () => {
    const { res, cookie } = await signIn({ groups: ['epicademie-lecture'] });
    const header = cookiesOf(res).find((c) => c.startsWith(`${COOKIE}=`)) ?? '';
    for (const flag of ['Path=/', 'HttpOnly', 'Secure', 'SameSite=Lax', 'Max-Age=43200'])
      expect(header).toContain(flag);
    expect(header).not.toContain('Domain');
    const [row] = await t.database.db.select().from(adminSessions);
    expect(cookie).not.toContain(row!.tokenHash);
  });

  it('plusieurs groupes : le rôle le plus fort ; groupes et nom lus au besoin par userinfo', async () => {
    const send = await as('lecture', {
      name: '  Dominique\n Petit ',
      groups: ['autre', 'epicademie-lecture', 'epicademie-moderation'],
      userinfo: {},
    });
    expect((await send({ url: `${API_PREFIX}/admin/session` })).json()).toEqual({
      operator: 'Dominique Petit',
      role: 'moderation',
      via: 'sso',
    });
  });

  const past = Math.floor(Date.now() / 1000) - 3600;
  it.each<[string, TestSignIn]>([
    ['signature d’une clé inconnue', { signature: 'autre-cle' }],
    ['signature par secret partagé', { signature: 'hs256' }],
    ['émetteur', { claims: { iss: 'https://autre.test' } }],
    ['audience', { claims: { aud: 'autre-client' } }],
    ['audiences multiples sans « azp »', { claims: { aud: [TEST_CLIENT.clientId, 'autre-client'] } }],
    ['nonce', { claims: { nonce: 'autre-nonce' } }],
    ['jeton expiré', { claims: { iat: past - 300, exp: past } }],
    ['jeton sans expiration', { claims: { exp: undefined } }],
    ['userinfo d’une autre personne', { userinfo: { sub: 'quelqu-un-d-autre' } }],
  ])('refusé : %s', async (_label, person) => {
    const { res, cookie } = await signIn({ groups: ['epicademie-proprietaire'], ...person });
    expect(res.statusCode).toBe(403);
    expect(cookie).toBe('');
    expect(await t.database.db.select().from(adminSessions)).toHaveLength(0);
  });

  it('refusé : state différent, cookie de tentative absent, émetteur de retour inattendu', async () => {
    const person = { groups: ['epicademie-proprietaire'] };
    for (const tamper of [{ state: 'autre' }, { cookie: '' }, { query: '&iss=https%3A%2F%2Fautre.test' }]) {
      const { res, cookie } = await signIn(person, tamper);
      expect(res.statusCode).toBe(403);
      expect(cookie).toBe('');
    }
  });

  it('aucun groupe epicademie-* : 403, aucune session, refus tracé avec l’identité', async () => {
    const { res, cookie } = await signIn({ sub: 'sub-externe', groups: ['fabrique', 'epicademie-inconnu'] });
    expect(res.statusCode).toBe(403);
    expect(cookie).toBe('');
    expect(await t.database.db.select().from(adminSessions)).toHaveLength(0);
    expect(await t.database.db.select().from(adminAccessEvents)).toMatchObject([
      { action: 'refus-de-role', adminSub: 'sub-externe', operator: 'Camille Martin' },
    ]);
  });
});

describe('session', () => {
  it('expire après 30 minutes d’inactivité ; chaque requête la prolonge', async () => {
    const { cookie } = await signIn({ groups: ['epicademie-lecture'] });
    for (let i = 0; i < 3; i++) {
      later(29);
      expect(await status(cookie)).toBe(200);
    }
    later(30);
    expect(await status(cookie)).toBe(403);
    expect(await t.database.db.select().from(adminSessions)).toHaveLength(0);
  });

  it('expire 12 heures après la connexion, même utilisée', async () => {
    const { cookie } = await signIn({ groups: ['epicademie-lecture'] });
    for (let i = 0; i < 35; i++) {
      later(20);
      expect(await status(cookie)).toBe(200);
    }
    later(20);
    expect(await status(cookie)).toBe(403);
  });

  it('groupe retiré : rôle perdu à la reconnexion, anciennes sessions fermées', async () => {
    const sub = 'sub-alex';
    const first = await signIn({ sub, groups: ['epicademie-proprietaire'] });
    const second = await signIn({ sub, groups: ['epicademie-lecture'] });
    expect(await status(first.cookie)).toBe(403);
    expect(await status(second.cookie, '/admin/audit')).not.toBe(200);
    expect(await status(second.cookie)).toBe(200);
    expect((await signIn({ sub, groups: [] })).res.statusCode).toBe(403);
    expect(await status(second.cookie)).toBe(403);
  });

  it('déconnexion : depuis le site d’administration seulement ; session fermée, cookie effacé', async () => {
    const { cookie } = await signIn({ groups: ['epicademie-lecture'] });
    const url = `${API_PREFIX}/admin-auth/logout`;
    const foreign = await t.raw.inject({ method: 'POST', url, headers: { host: HOST, cookie } });
    expect(foreign.statusCode).toBe(403);
    const res = await browser(cookie)({ method: 'POST', url });
    expect(res.statusCode).toBe(204);
    expect(cookiesOf(res).join()).toContain(`${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    expect(await status(cookie)).toBe(403);
  });
});

describe('séparation des sites', () => {
  it('hors du site d’administration (recette) : ni connexion, ni cookie, ni accès avec le cookie', async () => {
    const host = 'recette.test';
    for (const url of ['/admin-auth/login', '/admin-auth/callback?code=x&state=y']) {
      const res = await t.raw.inject({ url: API_PREFIX + url, headers: { host } });
      expect(res.statusCode).toBe(403);
      expect(res.headers['set-cookie']).toBeUndefined();
    }
    const game = await t.raw.inject({
      method: 'POST',
      url: `${API_PREFIX}/auth/signup`,
      headers: { host },
      payload: { email: 'autre@famille.test', password: 'mot de passe de test 42' },
    });
    expect(cookiesOf(game).join()).not.toContain(COOKIE);
    const { cookie } = await signIn({ groups: ['epicademie-proprietaire'] });
    const res = await t.raw.inject({ url: `${API_PREFIX}/admin/session`, headers: { host, cookie } });
    expect(res.statusCode).toBe(403);
  });

  it('origine étrangère ou absente : écriture refusée', async () => {
    const { cookie } = await signIn({ groups: ['epicademie-proprietaire'] });
    const url = `${API_PREFIX}/admin/accounts/search`;
    const send = (headers: Record<string, string>) =>
      t.raw.inject({ method: 'POST', url, payload: {}, headers: { host: HOST, cookie, ...headers } });
    expect((await send({})).statusCode).toBe(403);
    expect((await send({ origin: 'https://recette.test' })).statusCode).toBe(403);
    expect((await send({ origin: 'http://admin.test' })).statusCode).toBe(403);
    expect((await send({ origin: ORIGIN })).statusCode).toBe(200);
  });

  it('connexion configurée : le secret historique de l’opérateur n’ouvre plus rien', async () => {
    const res = await t.raw.inject({
      url: `${API_PREFIX}/admin/session`,
      headers: { host: HOST, 'x-epicademie-operateur': TEST_OPERATOR_SECRET },
    });
    expect(res.statusCode).toBe(403);
    expect((await t.raw.inject(`${API_PREFIX}/admin-auth/config`)).json()).toEqual({ sso: true });
  });

  it('accès de secours désactivé par défaut', async () => {
    const res = await t.raw.inject({
      url: `${API_PREFIX}/admin/session`,
      headers: { host: HOST, 'x-epicademie-secours': RESCUE },
    });
    expect(res.statusCode).toBe(403);
  });
});

describe('journal', () => {
  it('connexion, consultation, réinitialisation et décisions : tracées avec l’identité', async () => {
    const send = await as('proprietaire', { name: 'Alex' });
    const [account] = (await send({ method: 'POST', url: `${API_PREFIX}/admin/accounts/search`, payload: {} })).json<{
      items: { id: string }[];
    }>().items;
    later(1);
    await send({ url: `${API_PREFIX}/admin/accounts/${account!.id}` });
    later(1);
    await send({ method: 'POST', url: `${API_PREFIX}/admin/accounts/${account!.id}/password-reset` });
    await send({ method: 'PUT', url: `${API_PREFIX}/admin/content/m5-tables`, payload: { reviewed: true } });
    const who = { operator: 'Alex', adminSub: 'sub-proprietaire' };
    expect(await t.database.db.select().from(adminAudit)).toMatchObject([who, who]);
    expect(await t.database.db.select().from(contentEvents)).toMatchObject([who]);
    const log = (await send({ method: 'POST', url: `${API_PREFIX}/admin/audit`, payload: {} })).json<AuditPage>();
    expect(log.items.map((i) => i.action).sort()).toEqual(
      ['connexion', 'consultation', 'reinitialisation-mot-de-passe'].sort(),
    );
    expect(log.items.at(-1)).toMatchObject({ action: 'connexion', accountId: null, accountExists: false });
    expect(new Set(log.items.map((i) => i.id)).size).toBe(log.items.length);
  });
});

describe('accès de secours activé', () => {
  let rescue: Awaited<ReturnType<typeof createTestApp>>;
  beforeAll(async () => {
    rescue = await createTestApp({
      fetcher: provider.fetcher,
      config: {
        adminOrigin: ORIGIN,
        adminSso: { issuer: TEST_ISSUER, ...TEST_CLIENT },
        adminRescueSecret: RESCUE,
      },
    });
  });
  afterAll(() => rescue.close());

  const send = (url: string, headers: Record<string, string> = {}) =>
    rescue.raw.inject({
      url: API_PREFIX + url,
      headers: { host: HOST, 'x-epicademie-secours': RESCUE, 'x-epicademie-secours-nom': 'Alex', ...headers },
    });

  it('rôle propriétaire, chaque requête tracée « secours »', async () => {
    expect((await send('/admin/session')).json()).toEqual({
      operator: 'Alex (secours)',
      role: 'proprietaire',
      via: 'secours',
    });
    const content = await rescue.raw.inject({
      method: 'PUT',
      url: `${API_PREFIX}/admin/content/m5-tables`,
      payload: { reviewed: true },
      headers: { host: HOST, origin: ORIGIN, 'x-epicademie-secours': RESCUE, 'x-epicademie-secours-nom': 'Alex' },
    });
    expect(content.statusCode).toBe(200);
    expect(await rescue.database.db.select().from(contentEvents)).toMatchObject([{ adminSub: 'secours' }]);
    const events = await rescue.database.db.select().from(adminAccessEvents);
    expect(events.map((e) => [e.action, e.operator, e.detail])).toEqual([
      ['secours', 'Alex (secours)', 'GET /api/v1/admin/session'],
      ['secours', 'Alex (secours)', 'PUT /api/v1/admin/content/:skillId'],
    ]);
  });

  it('secret faux ou autre site : refusé', async () => {
    expect((await send('/admin/session', { 'x-epicademie-secours': `${RESCUE}x` })).statusCode).toBe(403);
    expect((await send('/admin/session', { host: 'recette.test' })).statusCode).toBe(403);
  });
});

describe('configuration', () => {
  const sso = {
    OIDC_ISSUER: 'https://auth.exemple.test',
    OIDC_CLIENT_ID: 'epicademie',
    OIDC_CLIENT_SECRET: 'x'.repeat(32),
    ADMIN_ORIGIN: 'https://admin.exemple.test',
  };

  it('absente : ni connexion ni secours', () => {
    expect(loadConfig({})).toMatchObject({ adminSso: null, adminOrigin: null, adminRescueSecret: null });
  });

  it('complète : acceptée ; partielle, non chiffrée ou mal formée : démarrage refusé', () => {
    expect(loadConfig(sso).adminSso).toMatchObject({ issuer: sso.OIDC_ISSUER });
    for (const key of Object.keys(sso)) expect(() => loadConfig({ ...sso, [key]: '' }), key).toThrow(/OIDC|ADMIN/);
    expect(() => loadConfig({ ...sso, OIDC_ISSUER: 'http://auth.exemple.test' })).toThrow(/OIDC_ISSUER/);
    for (const ADMIN_ORIGIN of ['http://admin.exemple.test', 'https://admin.exemple.test/', 'https://a.test/admin']) {
      expect(() => loadConfig({ ...sso, ADMIN_ORIGIN })).toThrow(/ADMIN_ORIGIN/);
    }
    expect(loadConfig({ ...sso, ADMIN_ORIGIN: 'http://localhost:3000' }).adminOrigin).toBe('http://localhost:3000');
  });

  it('secret de secours : 32 caractères au moins', () => {
    expect(() => loadConfig({ ADMIN_SECOURS_SECRET: 'court' })).toThrow(/ADMIN_SECOURS_SECRET/);
  });
});
