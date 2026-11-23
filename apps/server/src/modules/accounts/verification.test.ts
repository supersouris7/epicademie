import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import type { Me, Profile } from '@questeo/shared';
import { createTestApp, profileInput, sessionCookie, TEST_PASSWORD, tokenOf } from '../../testing/harness.ts';
import { tokenHash } from '../../core/auth/tokens.ts';
import { accounts, emailVerifications } from '../../db/schema.ts';

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
const post = (url: string, payload: object) =>
  t.http.inject({ method: 'POST', url: `/api/v1${url}`, headers: anonymous, payload });
const signup = async (email: string) => {
  const res = await post('/auth/signup', { email, password: TEST_PASSWORD });
  return { res, token: tokenOf(res.json<{ verificationLink?: string }>().verificationLink) };
};
const verify = (token: string) => post('/auth/email/verify', { token });
const login = (email: string, password = TEST_PASSWORD) => post('/auth/login', { email, password });
const resend = (email: string) => post('/auth/email/resend', { email });
const accountRow = async (email: string) =>
  (await t.database.db.select().from(accounts).where(eq(accounts.email, email)))[0];

describe('validation de l’adresse e-mail', () => {
  it('le jeton n’est gardé que haché (24 h) ; le lien envoyé le contient', async () => {
    const { token } = await signup('neuf@exemple.fr');
    expect(t.mailer.outbox.at(-1)?.text).toContain(`/email/verification?jeton=${token}`);
    const rows = await t.database.db.select().from(emailVerifications);
    const row = rows.find((r) => r.tokenHash === tokenHash(token));
    expect(row).toBeDefined();
    expect(rows.some((r) => r.tokenHash === token)).toBe(false);
    expect(row!.expiresAt.getTime() - t.clock.now().getTime()).toBe(24 * 3_600_000);
    expect((await accountRow('neuf@exemple.fr'))?.emailVerifiedAt).toBeNull();
  });

  it('connexion refusée tant que non vérifié (message clair), sans révéler l’état à qui ne connaît pas le mot de passe', async () => {
    await signup('attente@exemple.fr');
    const refused = await login('attente@exemple.fr');
    expect(refused.statusCode).toBe(403);
    const body = refused.json<{ code: string; error: string }>();
    expect(body.code).toBe('EMAIL_NOT_VERIFIED');
    expect(body.error).toContain('pas encore validée');
    expect(refused.headers['set-cookie']).toBeUndefined();
    expect((await login('attente@exemple.fr', 'mauvais mot de passe')).statusCode).toBe(401);
  });

  it('le lien valide l’adresse, ouvre la session, et la connexion fonctionne ensuite', async () => {
    const { token } = await signup('ok@exemple.fr');
    const res = await verify(token);
    expect(res.statusCode).toBe(200);
    const cookie = sessionCookie(res);
    expect(cookie).toMatch(/^af_session=/);
    expect(res.json<Me>().account.email).toBe('ok@exemple.fr');
    expect((await t.as(cookie).inject('/api/v1/auth/me')).statusCode).toBe(200);
    expect((await accountRow('ok@exemple.fr'))?.emailVerifiedAt).not.toBeNull();
    expect((await login('ok@exemple.fr')).statusCode).toBe(200);
  });

  it('usage unique, expiration à 24 h, mauvais jeton', async () => {
    const { token } = await signup('une-fois@exemple.fr');
    expect((await verify(token)).statusCode).toBe(200);
    const again = await verify(token);
    expect(again.statusCode).toBe(410);
    expect(again.json<{ error: string }>().error).toContain('déjà été utilisé');
    expect(again.headers['set-cookie']).toBeUndefined();

    const late = await signup('tard@exemple.fr');
    t.clock.set('2026-11-21'); // +24 h exactement : expiré
    const expired = await verify(late.token);
    expect(expired.statusCode).toBe(410);
    expect(expired.json<{ error: string }>().error).toContain('expiré');
    expect((await login('tard@exemple.fr')).statusCode).toBe(403);

    expect((await verify('x'.repeat(43))).statusCode).toBe(400);
    expect((await verify('trop-court')).statusCode).toBe(400);
  });

  it('un jeton ne valide que son propre compte (isolation des familles)', async () => {
    const a = await signup('a@exemple.fr');
    await signup('b@exemple.fr');
    const res = await verify(a.token);
    expect(res.json<Me>().account.email).toBe('a@exemple.fr');
    expect((await accountRow('b@exemple.fr'))?.emailVerifiedAt).toBeNull();
    const lea = (
      await t.as(sessionCookie(res)).inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Léa') })
    ).json<Profile>();
    const other = await t.signup('c@exemple.fr');
    expect((await t.as(other.cookie).inject(`/api/v1/profiles/${lea.id}`)).statusCode).toBeGreaterThanOrEqual(403);
  });

  it('renvoi : nouveau lien (l’ancien ne vaut plus), limité à un par minute, sans fuite sur l’adresse', async () => {
    const first = await signup('renvoi@exemple.fr');
    const sent = t.mailer.outbox.length;
    // Dans la minute : silencieusement ignoré.
    const quick = await resend('renvoi@exemple.fr');
    expect(quick.statusCode).toBe(200);
    expect(quick.json()).toEqual({});
    expect(t.mailer.outbox).toHaveLength(sent);

    t.clock.set('2026-11-21');
    const second = await resend('renvoi@exemple.fr');
    const link = second.json<{ verificationLink?: string }>().verificationLink;
    expect(t.mailer.outbox).toHaveLength(sent + 1);
    expect((await verify(first.token)).statusCode).toBe(400);
    expect((await verify(tokenOf(link))).statusCode).toBe(200);

    // Adresse inconnue ou déjà validée : même réponse, aucun e-mail.
    const before = t.mailer.outbox.length;
    expect((await resend('inconnu@exemple.fr')).json()).toEqual({});
    expect((await resend('renvoi@exemple.fr')).json()).toEqual({});
    expect(t.mailer.outbox).toHaveLength(before);
  });

  it('la limite de débit des routes s’applique (inscription, renvoi, validation)', async () => {
    const limited = await createTestApp({ config: { authRateLimitMax: 2 } });
    try {
      const codes: number[] = [];
      for (let i = 0; i < 4; i++) {
        const res = await limited.http.inject({
          method: 'POST',
          url: '/api/v1/auth/email/resend',
          headers: anonymous,
          payload: { email: 'x@exemple.fr' },
        });
        codes.push(res.statusCode);
      }
      expect(codes).toEqual([200, 200, 429, 429]);
    } finally {
      await limited.close();
    }
  });

  it('adresse déjà prise (même non validée) : refus, aucun nouveau compte ni écrasement du mot de passe', async () => {
    await signup('pris@exemple.fr');
    const res = await post('/auth/signup', { email: 'pris@exemple.fr', password: 'un autre mot de passe 99' });
    expect(res.statusCode).toBe(409);
  });

  it('mot de passe oublié : le lien reçu prouve aussi l’adresse', async () => {
    await signup('oubli@exemple.fr');
    await post('/auth/password/forgot', { email: 'oubli@exemple.fr' });
    const token = tokenOf(t.mailer.outbox.at(-1)?.text);
    expect((await post('/auth/password/reset', { token, password: 'nouveau mot de passe 2026' })).statusCode).toBe(204);
    expect((await login('oubli@exemple.fr', 'nouveau mot de passe 2026')).statusCode).toBe(200);
  });

  it('les comptes existants (avant la migration) sont vérifiés ; l’élève < 15 ans reste sans e-mail', async () => {
    expect((await accountRow(t.family().email))?.emailVerifiedAt).not.toBeNull();
    const res = await post('/auth/student/signup', {
      name: 'Zoé',
      avatar: profileInput().avatar,
      grade: '6e',
      age: 11,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json<{ me: Me }>().me.account.email).toBeNull();
  });
});

describe('production : le lien ne sort jamais du serveur', () => {
  it('aucun lien dans la réponse ; il part uniquement par e-mail', async () => {
    const prod = await createTestApp({
      config: { mail: { production: true, brevoApiKey: 'xkeysib-test-0000', from: 'noreply@exemple.fr' } },
    });
    try {
      const res = await prod.http.inject({
        method: 'POST',
        url: '/api/v1/auth/signup',
        headers: anonymous,
        payload: { email: 'prod@exemple.fr', password: TEST_PASSWORD },
      });
      expect(res.statusCode).toBe(201);
      expect(res.json()).toEqual({ status: 'verification_required', email: 'prod@exemple.fr' });
      expect(tokenOf(prod.mailer.outbox.at(-1)?.text)).toHaveLength(43);
      const again = await prod.http.inject({
        method: 'POST',
        url: '/api/v1/auth/email/resend',
        headers: anonymous,
        payload: { email: 'prod@exemple.fr' },
      });
      expect(again.json()).toEqual({});
    } finally {
      await prod.close();
    }
  });
});
