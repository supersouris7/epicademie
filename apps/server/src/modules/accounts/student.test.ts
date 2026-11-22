import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import type { InviteResult, Me, Profile, StudentSignupResult } from '@questeo/shared';
import { accounts, familyInvites } from '../../db/schema.ts';
import { createTestApp, profileInput, sessionCookie, TEST_PASSWORD } from '../../testing/harness.ts';

/** Élève de moins de 15 ans : compte sans donnée personnelle, récupération, rattachement (#44). */

let t: Awaited<ReturnType<typeof createTestApp>>;

beforeAll(async () => {
  t = await createTestApp({ today: '2026-11-20' });
});
afterAll(() => t.close());
beforeEach(async () => {
  t.clock.set('2026-11-20');
  await t.reset();
});

const anonymous = { cookie: '' };
const studentInput = { name: 'Capucine', avatar: { style: 'portrait', seed: '03' }, grade: '5e', age: 12 };
const post = (url: string, cookie: string, payload?: object) =>
  t.as(cookie).inject({ method: 'POST', url: `/api/v1${url}`, payload });
const signupStudent = (payload: object = studentInput) =>
  t.http.inject({ method: 'POST', url: '/api/v1/auth/student/signup', headers: anonymous, payload });

async function newStudent() {
  const res = await signupStudent();
  expect(res.statusCode).toBe(201);
  return { cookie: sessionCookie(res), ...res.json<StudentSignupResult>() };
}

describe('inscription d’un élève de moins de 15 ans', () => {
  it('crée une famille autonome sans e-mail ni mot de passe, avec son profil et un code de récupération', async () => {
    const s = await newStudent();
    expect(s.me).toMatchObject({ account: { email: null }, family: { autonomous: true }, parent: false });
    expect(s.recoveryCode).toMatch(/^([A-Z2-9]{4}-){3}[A-Z2-9]{4}$/);
    const profiles = (await t.as(s.cookie).inject('/api/v1/profiles')).json<Profile[]>();
    expect(profiles).toEqual([
      expect.objectContaining({ name: 'Capucine', grade: '5e', gender: null, birthDate: null }),
    ]);
    // Rien de personnel en base : ni e-mail, ni mot de passe, ni âge ; le code n'est stocké que haché.
    const [account] = await t.database.db.select().from(accounts).where(eq(accounts.id, s.me.account.id));
    expect(account).toMatchObject({ email: null, passwordHash: null });
    expect(JSON.stringify(account)).not.toContain(s.recoveryCode);
    expect(JSON.stringify(account)).not.toContain(s.recoveryCode.replaceAll('-', ''));
  });

  it('refus : 15 ans ou plus (compte complet), âge absent', async () => {
    expect((await signupStudent({ ...studentInput, age: 15 })).statusCode).toBe(400);
    expect((await signupStudent({ ...studentInput, age: undefined })).statusCode).toBe(400);
  });

  it('paiement, Espace parent et profils : « Demande à un parent »', async () => {
    const s = await newStudent();
    for (const [url, payload] of [
      ['/billing/checkout', undefined],
      ['/profiles', profileInput('Autre')],
      ['/family/join', { code: 'ABCD-EFGH' }],
    ] as const) {
      const res = await post(url, s.cookie, payload);
      expect(res.statusCode, url).toBe(403);
      expect(res.json<{ error: string }>().error).toContain('Demande à un parent');
    }
    expect((await post('/auth/parent', s.cookie, { password: 'x' })).statusCode).toBe(403);
    expect((await post('/auth/parent/pin/unlock', s.cookie, { pin: '1234' })).statusCode).toBe(403);
    // Le contenu gratuit reste accessible.
    expect((await t.as(s.cookie).inject('/api/v1/billing')).statusCode).toBe(200);
  });
});

describe('récupération sur un autre appareil', () => {
  it('le code ouvre une session sur le même profil (casse et tirets sans importance)', async () => {
    const s = await newStudent();
    const typed = s.recoveryCode.toLowerCase().replaceAll('-', ' ');
    const res = await t.http.inject({
      method: 'POST',
      url: '/api/v1/auth/student/recover',
      headers: anonymous,
      payload: { code: typed },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json<Me>().account.id).toBe(s.me.account.id);
    const profiles = (await t.as(sessionCookie(res)).inject('/api/v1/profiles')).json<Profile[]>();
    expect(profiles.map((p) => p.name)).toEqual(['Capucine']);
  });

  it('un code faux est refusé ; un nouveau code remplace l’ancien', async () => {
    const s = await newStudent();
    const recover = (code: string) =>
      t.http.inject({ method: 'POST', url: '/api/v1/auth/student/recover', headers: anonymous, payload: { code } });
    expect((await recover('AAAA-BBBB-CCCC-DDDD')).statusCode).toBe(401);
    const renewed = (await post('/auth/student/recovery-code', s.cookie)).json<{ recoveryCode: string }>();
    expect((await recover(s.recoveryCode)).statusCode).toBe(401);
    expect((await recover(renewed.recoveryCode)).statusCode).toBe(200);
  });

  it('tentatives limitées par IP (mécanisme existant des routes sensibles)', async () => {
    const limited = await createTestApp({ config: { authRateLimitMax: 3 } });
    try {
      const codes: number[] = [];
      for (let i = 0; i < 5; i++) {
        const res = await limited.http.inject({
          method: 'POST',
          url: '/api/v1/auth/student/recover',
          headers: anonymous,
          payload: { code: 'AAAA-BBBB-CCCC-DDDD' },
        });
        codes.push(res.statusCode);
      }
      expect(codes).toEqual([401, 401, 401, 429, 429]);
    } finally {
      await limited.close();
    }
  });
});

describe('rattachement à un parent', () => {
  const invite = async (cookie: string) => (await post('/auth/student/invite', cookie)).json<InviteResult>();
  const join = (code: string, cookie = t.family().cookie) => post('/family/join', cookie, { code });

  it('le profil rejoint la famille avec sa progression ; la famille autonome disparaît', async () => {
    const s = await newStudent();
    const [child] = (await t.as(s.cookie).inject('/api/v1/profiles')).json<Profile[]>();
    await t.database.db.execute(sql`update profiles set coins = 420 where id = ${child?.id}`);

    const inv = await invite(s.cookie);
    expect(inv.code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(Date.parse(inv.expiresAt) - t.clock.now().getTime()).toBe(24 * 3_600_000);

    const res = await join(inv.code.toLowerCase());
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ joined: ['Capucine'] });
    const mine = (await t.http.inject('/api/v1/profiles')).json<Profile[]>();
    expect(mine).toContainEqual(expect.objectContaining({ id: child?.id, name: 'Capucine', coins: 420 }));
    // Famille autonome supprimée : l'ancien appareil n'a plus de session, le code ne marche plus.
    expect((await t.as(s.cookie).inject('/api/v1/auth/me')).statusCode).toBe(401);
    expect((await join(inv.code)).statusCode).toBe(400);
  });

  it('usage unique : un second parent ne peut pas réutiliser le code', async () => {
    const s = await newStudent();
    const inv = await invite(s.cookie);
    const other = await t.signup('autre.parent@famille.test');
    expect((await join(inv.code)).statusCode).toBe(200);
    expect((await join(inv.code, other.cookie)).statusCode).toBe(400);
    expect((await t.as(other.cookie).inject('/api/v1/profiles')).json<Profile[]>()).toEqual([]);
  });

  it('refus après expiration (24 h) : rien ne bouge', async () => {
    const s = await newStudent();
    const inv = await invite(s.cookie);
    t.clock.set('2026-11-22');
    // Le parent est redéverrouillé (son verrou de 10 minutes a expiré avec le temps).
    await t.http.inject({ method: 'POST', url: '/api/v1/auth/parent', payload: { password: TEST_PASSWORD } });
    const res = await join(inv.code);
    expect(res.statusCode).toBe(400);
    expect(res.json<{ error: string }>().error).toContain('pas valable');
    expect((await t.as(s.cookie).inject('/api/v1/auth/me')).statusCode).toBe(200);
    expect((await t.http.inject('/api/v1/profiles')).json<Profile[]>()).toEqual([]);
  });

  it('une nouvelle invitation remplace la précédente', async () => {
    const s = await newStudent();
    const first = await invite(s.cookie);
    const second = await invite(s.cookie);
    expect((await join(first.code)).statusCode).toBe(400);
    expect((await join(second.code)).statusCode).toBe(200);
  });

  it('seule l’empreinte du code est stockée ; seul un élève autonome crée une invitation', async () => {
    const s = await newStudent();
    const inv = await invite(s.cookie);
    const rows = await t.database.db.select().from(familyInvites);
    expect(rows).toHaveLength(1);
    expect(JSON.stringify(rows)).not.toContain(inv.code.replaceAll('-', ''));
    expect((await post('/auth/student/invite', t.family().cookie)).statusCode).toBe(403);
    expect((await post('/auth/student/recovery-code', t.family().cookie)).statusCode).toBe(403);
  });
});

describe('isolation par famille', () => {
  it('un élève autonome ne voit ni les profils d’une autre famille ni les siens depuis ailleurs', async () => {
    const mine = (
      await t.http.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Léa') })
    ).json<Profile>();
    const s = await newStudent();
    expect((await t.as(s.cookie).inject(`/api/v1/profiles/${mine.id}`)).statusCode).toBe(404);
    const [own] = (await t.as(s.cookie).inject('/api/v1/profiles')).json<Profile[]>();
    expect((await t.http.inject(`/api/v1/profiles/${own?.id}`)).statusCode).toBe(404);
    expect((await t.as(s.cookie).inject('/api/v1/profiles')).json<Profile[]>()).toHaveLength(1);
  });

  it('un compte autonome ne peut pas se connecter par e-mail', async () => {
    await newStudent();
    const res = await t.http.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: anonymous,
      payload: { email: 'eleve@exemple.fr', password: 'un mot de passe long' },
    });
    expect(res.statusCode).toBe(401);
  });
});
