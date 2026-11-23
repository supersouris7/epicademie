import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { generateKeyPair, SignJWT, type CryptoKey } from 'jose';
import type { Me, Profile } from '@questeo/shared';
import { createTestApp, profileInput, TEST_PASSWORD } from '../../testing/harness.ts';
import { accounts } from '../../db/schema.ts';

const CLIENT_ID = 'client-test.apps.googleusercontent.com';
const anonymous = { cookie: '' };

let good: { publicKey: CryptoKey; privateKey: CryptoKey };
let forger: { publicKey: CryptoKey; privateKey: CryptoKey };
let t: Awaited<ReturnType<typeof createTestApp>>;
/** Jeton que « Google » renvoie à l'échange du code (réglé par chaque test). */
let mint: () => Promise<string>;
const exchanges: URLSearchParams[] = [];

interface Claims {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  aud?: string;
  iss?: string;
  nonce?: string;
  exp?: number;
  key?: CryptoKey;
}
const token = (c: Claims = {}) =>
  new SignJWT({ email: c.email ?? 'maman@gmail.test', email_verified: c.email_verified ?? true, nonce: c.nonce })
    .setProtectedHeader({ alg: 'RS256' })
    .setSubject(c.sub ?? 'sub-maman')
    .setIssuer(c.iss ?? 'https://accounts.google.com')
    .setAudience(c.aud ?? CLIENT_ID)
    .setIssuedAt()
    .setExpirationTime(c.exp ?? Math.floor(Date.now() / 1000) + 600)
    .sign(c.key ?? good.privateKey);

// Aucun appel réseau réel : l'échange du code est simulé, les clés de Google sont locales.
const fetcher: typeof fetch = async (_url, init) => {
  const body = new URLSearchParams(init?.body as URLSearchParams);
  exchanges.push(body);
  return new Response(JSON.stringify({ id_token: await mint() }), { status: 200 });
};

beforeAll(async () => {
  good = await generateKeyPair('RS256');
  forger = await generateKeyPair('RS256');
  t = await createTestApp({
    today: '2026-11-20',
    config: { google: { clientId: CLIENT_ID, clientSecret: 'secret-test', redirectUri: 'http://test:3000/cb' } },
    googleKeys: async () => good.publicKey,
    fetcher,
  });
});
afterAll(() => t.close());
beforeEach(async () => {
  exchanges.length = 0;
  await t.reset();
});

/** Parcours complet : démarrage, retour de Google avec ce que `claims` fait signer. */
async function signIn(claims: Claims = {}, { state, cookie }: { state?: string; cookie?: string } = {}) {
  const start = await t.http.inject({ url: '/api/v1/auth/google/start', headers: anonymous });
  const url = new URL(String(start.headers.location));
  const challenge = String(start.headers['set-cookie']).split(';')[0] ?? '';
  const nonce = url.searchParams.get('nonce') ?? '';
  mint = () => token({ nonce, ...claims });
  const back = await t.http.inject({
    url: `/api/v1/auth/google/callback?code=code-test&state=${state ?? url.searchParams.get('state')}`,
    headers: { cookie: cookie ?? challenge },
  });
  return { start, url, back };
}

const af = (r: { headers: Record<string, unknown> }) =>
  /af_session=[\w-]+/.exec(String(r.headers['set-cookie']))?.[0] ?? '';
const emailOf = async (email: string) =>
  (await t.database.db.select().from(accounts).where(eq(accounts.email, email)))[0];
const refused = (back: { statusCode: number; headers: Record<string, unknown> }) => {
  expect(back.statusCode).toBe(302);
  expect(back.headers.location).toBe('/connexion?erreur=google');
  expect(String(back.headers['set-cookie'])).not.toContain('af_session');
};

describe('Continuer avec Google', () => {
  it('démarrage : code + PKCE S256 + state + nonce, secrets en cookie HttpOnly court', async () => {
    const { start, url } = await signIn();
    expect(start.statusCode).toBe(302);
    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      client_id: CLIENT_ID,
      redirect_uri: 'http://test:3000/cb',
      response_type: 'code',
      scope: 'openid email',
      code_challenge_method: 'S256',
    });
    for (const k of ['state', 'nonce', 'code_challenge']) expect(url.searchParams.get(k)?.length).toBeGreaterThan(20);
    expect(String(start.headers['set-cookie'])).toMatch(/^af_google=.*HttpOnly.*Max-Age=600/);
    expect(exchanges[0]?.get('code_verifier')).toHaveLength(43);
    expect(exchanges[0]?.get('client_secret')).toBe('secret-test');
  });

  it('crée un compte parent vérifié, sans mot de passe, session ouverte ; la fois suivante : même compte', async () => {
    const { back } = await signIn();
    expect(back.statusCode).toBe(302);
    expect(back.headers.location).toBe('/profils/nouveau');
    const cookie = af(back);
    const me = (await t.as(cookie).inject('/api/v1/auth/me')).json<Me>();
    expect(me.account).toMatchObject({ email: 'maman@gmail.test', role: 'parent' });
    expect(await emailOf('maman@gmail.test')).toMatchObject({ passwordHash: null, googleSub: 'sub-maman' });
    expect((await emailOf('maman@gmail.test'))?.emailVerifiedAt).not.toBeNull();

    const again = await signIn();
    expect(again.back.headers.location).toBe('/');
    const me2 = (await t.as(af(again.back)).inject('/api/v1/auth/me')).json<Me>();
    expect(me2.family.id).toBe(me.family.id);
  });

  it('même e-mail (vérifié par Google) = même compte : relie le compte existant, mot de passe conservé', async () => {
    const mine = t.family();
    const { back } = await signIn({ email: mine.email, sub: 'sub-relie' });
    expect(back.headers.location).toBe('/');
    const cookie = af(back);
    expect((await t.as(cookie).inject('/api/v1/auth/me')).json<Me>().family.id).toBe(mine.me.family.id);
    expect((await emailOf(mine.email))?.googleSub).toBe('sub-relie');
    const login = await t.http.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: anonymous,
      payload: { email: mine.email, password: TEST_PASSWORD },
    });
    expect(login.statusCode).toBe(200);
  });

  it('compte créé par mot de passe mais jamais validé : relié, mot de passe effacé (pas de prise de compte)', async () => {
    await t.http.inject({
      method: 'POST',
      url: '/api/v1/auth/signup',
      headers: anonymous,
      payload: { email: 'squat@gmail.test', password: 'mot de passe du squatteur 1' },
    });
    const { back } = await signIn({ email: 'squat@gmail.test', sub: 'sub-vraie' });
    expect(back.statusCode).toBe(302);
    const row = await emailOf('squat@gmail.test');
    expect(row).toMatchObject({ passwordHash: null, googleSub: 'sub-vraie' });
    expect(row?.emailVerifiedAt).not.toBeNull();
    const login = await t.http.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: anonymous,
      payload: { email: 'squat@gmail.test', password: 'mot de passe du squatteur 1' },
    });
    expect(login.statusCode).toBe(401);
  });

  it('id_token falsifié (signé par une autre clé) refusé', async () => {
    refused((await signIn({ key: forger.privateKey })).back);
    expect(await emailOf('maman@gmail.test')).toBeUndefined();
  });

  it('mauvaise audience, mauvais émetteur, jeton expiré, nonce inattendu : refusés', async () => {
    refused((await signIn({ aud: 'autre-client.apps.googleusercontent.com' })).back);
    refused((await signIn({ iss: 'https://accounts.evil.test' })).back);
    refused((await signIn({ exp: Math.floor(Date.now() / 1000) - 3600 })).back);
    refused((await signIn({ nonce: 'nonce-rejoue' })).back);
    expect(await emailOf('maman@gmail.test')).toBeUndefined();
  });

  it('e-mail non vérifié par Google : refusé, aucun compte créé ni relié', async () => {
    refused((await signIn({ email_verified: false })).back);
    refused((await signIn({ email: t.family().email, email_verified: false })).back);
    expect(await emailOf('maman@gmail.test')).toBeUndefined();
    expect((await emailOf(t.family().email))?.googleSub).toBeNull();
  });

  it('state différent ou cookie absent : refusé avant tout échange avec Google', async () => {
    refused((await signIn({}, { state: 'state-forge' })).back);
    refused((await signIn({}, { cookie: '' })).back);
    expect(exchanges).toHaveLength(0);
  });

  it('isolation : deux comptes Google = deux familles étanches', async () => {
    const cookieOf = af;
    const a = cookieOf((await signIn({ email: 'a@gmail.test', sub: 'sub-a' })).back);
    const b = cookieOf((await signIn({ email: 'b@gmail.test', sub: 'sub-b' })).back);
    const lea = (
      await t.as(a).inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Léa') })
    ).json<Profile>();
    expect((await t.as(b).inject('/api/v1/profiles')).json()).toEqual([]);
    expect((await t.as(b).inject(`/api/v1/profiles/${lea.id}`)).statusCode).toBeGreaterThanOrEqual(403);
  });

  it('bouton : proposé seulement si Google est configuré', async () => {
    expect((await t.http.inject({ url: '/api/v1/auth/options', headers: anonymous })).json()).toEqual({ google: true });
    const plain = await createTestApp();
    try {
      expect((await plain.http.inject({ url: '/api/v1/auth/options', headers: anonymous })).json()).toEqual({
        google: false,
      });
      expect((await plain.http.inject({ url: '/api/v1/auth/google/start', headers: anonymous })).statusCode).toBe(404);
    } finally {
      await plain.close();
    }
  });
});
