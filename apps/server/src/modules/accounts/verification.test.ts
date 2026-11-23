import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
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
  await t.mailIdle();
  return { res, token: tokenOf(res.json<{ verificationLink?: string }>().verificationLink) };
};
const verify = (token: string, password = TEST_PASSWORD) => post('/auth/email/verify', { token, password });
const login = (email: string, password = TEST_PASSWORD) => post('/auth/login', { email, password });
const resend = async (email: string) => {
  const res = await post('/auth/email/resend', { email });
  await t.mailIdle();
  return res;
};
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

  it('valider le lien exige le mot de passe du compte (un mot de passe faux ne consomme pas le lien)', async () => {
    const { token } = await signup('mdp@exemple.fr');
    const wrong = await verify(token, 'pas le bon mot de passe');
    expect(wrong.statusCode).toBe(401);
    expect(wrong.json<{ error: string }>().error).toContain('Mot de passe oublié');
    expect(wrong.headers['set-cookie']).toBeUndefined();
    expect((await accountRow('mdp@exemple.fr'))?.emailVerifiedAt).toBeNull();
    expect((await post('/auth/email/verify', { token })).statusCode).toBe(400);
    expect((await verify(token)).statusCode).toBe(200);
  });

  it('pré-prise de contrôle : le titulaire réel ne connaît pas le mot de passe posé par un tiers → « mot de passe oublié »', async () => {
    // Un tiers inscrit l'adresse d'autrui avec son propre mot de passe.
    await post('/auth/signup', { email: 'victime@exemple.fr', password: 'mot de passe du tiers 1' });
    await t.mailIdle();
    const link = tokenOf(t.mailer.outbox.at(-1)?.text);
    // La victime ouvre le lien mais ne connaît pas ce mot de passe : refus.
    expect((await verify(link, TEST_PASSWORD)).statusCode).toBe(401);
    // Elle passe par « Mot de passe oublié » : adresse validée, mot de passe du tiers remplacé.
    await post('/auth/password/forgot', { email: 'victime@exemple.fr' });
    await t.mailIdle();
    const reset = tokenOf(t.mailer.outbox.at(-1)?.text);
    expect(
      (await post('/auth/password/reset', { token: reset, password: 'mot de passe de la victime 2' })).statusCode,
    ).toBe(204);
    expect((await accountRow('victime@exemple.fr'))?.emailVerifiedAt).not.toBeNull();
    expect((await login('victime@exemple.fr', 'mot de passe du tiers 1')).statusCode).toBe(401);
    expect((await login('victime@exemple.fr', 'mot de passe de la victime 2')).statusCode).toBe(200);
    // L'ancien lien de validation ne sert plus à personne.
    expect((await verify(link, 'mot de passe du tiers 1')).statusCode).toBe(400);
  });

  it('inscription : même réponse (code, corps) que l’adresse soit libre, en attente ou déjà validée', async () => {
    await signup('attente2@exemple.fr');
    const validated = await signup('valide@exemple.fr');
    await verify(validated.token);
    const answers = [];
    for (const email of ['libre@exemple.fr', 'attente2@exemple.fr', 'valide@exemple.fr']) {
      const res = await post('/auth/signup', { email, password: 'un autre mot de passe 99' });
      answers.push({
        status: res.statusCode,
        body: { ...res.json<object>(), email: undefined, verificationLink: undefined },
      });
    }
    expect(answers[1]).toEqual(answers[0]);
    expect(answers[2]).toEqual(answers[0]);
    expect(answers[0]?.status).toBe(201);
  });

  it('adresse déjà prise : e-mail d’information (pas de lien), compte et mot de passe inchangés', async () => {
    await signup('pris@exemple.fr');
    const before = await accountRow('pris@exemple.fr');
    const sent = t.mailer.outbox.length;
    const res = await post('/auth/signup', { email: 'pris@exemple.fr', password: 'un autre mot de passe 99' });
    await t.mailIdle();
    expect(res.statusCode).toBe(201);
    expect(res.json<{ verificationLink?: string }>().verificationLink).toBeUndefined();
    expect(t.mailer.outbox).toHaveLength(sent + 1);
    const mail = t.mailer.outbox.at(-1);
    expect(mail?.to).toBe('pris@exemple.fr');
    expect(mail?.link).toBeUndefined();
    expect(mail?.text).toContain('Quelqu’un vient d’essayer de créer un compte');
    expect(mail?.text).not.toContain('jeton=');
    expect((await accountRow('pris@exemple.fr'))?.passwordHash).toBe(before?.passwordHash);
    expect((await login('pris@exemple.fr')).statusCode).toBe(403);
  });

  it('Google sur une adresse inscrite non validée : le mot de passe posé par un tiers ne marche plus', async () => {
    await post('/auth/signup', { email: 'google@exemple.fr', password: 'mot de passe du tiers 1' });
    await t.mailIdle();
    const link = tokenOf(t.mailer.outbox.at(-1)?.text);
    await t.app.accounts.loginWithGoogle({ sub: 'sub-google-1', email: 'google@exemple.fr' });
    const row = await accountRow('google@exemple.fr');
    expect(row?.passwordHash).toBeNull();
    expect(row?.emailVerifiedAt).not.toBeNull();
    expect((await login('google@exemple.fr', 'mot de passe du tiers 1')).statusCode).toBe(401);
    expect((await verify(link, 'mot de passe du tiers 1')).statusCode).toBe(400);
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

describe('envoi détaché', () => {
  it('la réponse n’attend pas le fournisseur d’e-mail (inscription, renvoi, mot de passe oublié)', async () => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const slow = await createTestApp({
      wrapMailer: (inner) => ({ send: (m) => (m.to === 'lent@exemple.fr' ? gate : inner.send(m)) }),
    });
    try {
      const call = (url: string, payload: object) =>
        slow.app.http.inject({ method: 'POST', url: `/api/v1${url}`, payload });
      const email = 'lent@exemple.fr';
      expect((await call('/auth/signup', { email, password: TEST_PASSWORD })).statusCode).toBe(201);
      t.clock.set('2026-11-20');
      expect((await call('/auth/email/resend', { email })).statusCode).toBe(200);
      expect((await call('/auth/password/forgot', { email })).statusCode).toBe(204);
      release();
      await slow.mailIdle();
    } finally {
      release();
      await slow.close();
    }
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
      await prod.mailIdle();
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

describe('boîte mail de test (recette)', () => {
  // Application dédiée : la boîte est en mémoire et survit à `reset()`.
  let m: Awaited<ReturnType<typeof createTestApp>>;
  beforeEach(async () => {
    m = await createTestApp({ today: '2026-11-20' });
  });
  afterEach(() => m.close());
  const signup = async (email: string) => {
    await m.http.inject({
      method: 'POST',
      url: '/api/v1/auth/signup',
      headers: anonymous,
      payload: { email, password: TEST_PASSWORD },
    });
    await m.mailIdle();
  };
  const box = (email?: string) =>
    m.http.inject({
      url: `/api/v1/recette/boite-mail${email ? `?email=${encodeURIComponent(email)}` : ''}`,
      headers: anonymous,
    });
  type Box = { messages: { to: string; subject: string; text: string; sentAt: string; link?: string }[] };

  it('simulation active : garde les e-mails, y compris après renvoi, 2e inscription et mot de passe oublié', async () => {
    await signup('a@famille.test');
    await signup('a@famille.test'); // réponse neutre : aucun lien dans la réponse
    await m.http.inject({
      method: 'POST',
      url: '/api/v1/auth/password/forgot',
      headers: anonymous,
      payload: { email: 'a@famille.test' },
    });
    await m.mailIdle();
    const { messages } = (await box('A@famille.test')).json<Box>();
    expect(messages).toHaveLength(3);
    expect(messages[0]?.subject).toContain('nouveau mot de passe');
    expect(messages.at(-1)?.link).toContain('/email/verification?jeton=');
    expect(messages[0]).toMatchObject({ to: 'a@famille.test', sentAt: '2026-11-20T12:00:00.000Z' });
  });

  it('filtre par adresse', async () => {
    await signup('x@famille.test');
    await signup('y@famille.test');
    expect((await box('y@famille.test')).json<Box>().messages.map((m) => m.to)).toEqual(['y@famille.test']);
    // Sans filtre : tous les messages (la famille de test du harnais compte aussi).
    expect((await box()).json<Box>().messages.map((m) => m.to)).toEqual(
      expect.arrayContaining(['x@famille.test', 'y@famille.test']),
    );
    expect((await box('personne@famille.test')).json<Box>().messages).toEqual([]);
  });

  it('ne garde que les 50 derniers', async () => {
    for (let i = 0; i < 52; i++) await signup(`n${i}@famille.test`);
    const { messages } = (await box()).json<Box>();
    expect(messages).toHaveLength(50);
    expect(messages[0]?.to).toBe('n51@famille.test');
  });

  it('options : la simulation est annoncée', async () => {
    const res = await m.http.inject({ url: '/api/v1/auth/options', headers: anonymous });
    expect(res.json()).toMatchObject({ simulatedMail: true });
  });

  it('production ou fournisseur réel : route introuvable, rien n’est conservé', async () => {
    const prod = await createTestApp({
      config: { mail: { production: true, brevoApiKey: 'xkeysib-test-0000', from: 'noreply@exemple.fr' } },
    });
    try {
      await prod.http.inject({
        method: 'POST',
        url: '/api/v1/auth/signup',
        headers: anonymous,
        payload: { email: 'prod@exemple.fr', password: TEST_PASSWORD },
      });
      await prod.mailIdle();
      expect((await prod.http.inject({ url: '/api/v1/recette/boite-mail', headers: anonymous })).statusCode).toBe(404);
      const options = await prod.http.inject({ url: '/api/v1/auth/options', headers: anonymous });
      expect(options.json()).toMatchObject({ simulatedMail: false });
    } finally {
      await prod.close();
    }
  });
});
