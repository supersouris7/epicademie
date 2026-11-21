import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { BattleView, Me, Profile } from '@questeo/shared';
import { createTestApp, profileInput, sessionCookie, TEST_PASSWORD } from '../../testing/harness.ts';

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
const signupRes = (email: string, password = TEST_PASSWORD) =>
  t.http.inject({ method: 'POST', url: '/api/v1/auth/signup', headers: anonymous, payload: { email, password } });
const loginRes = (email: string, password = TEST_PASSWORD) =>
  t.http.inject({ method: 'POST', url: '/api/v1/auth/login', headers: anonymous, payload: { email, password } });
const me = (cookie: string) => t.as(cookie).inject('/api/v1/auth/me');
const createProfile = (cookie: string, name = 'Léa') =>
  t.as(cookie).inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput(name) });

describe('inscription et connexion', () => {
  it('inscription : session ouverte par cookie HttpOnly, parent déverrouillé, e-mail normalisé', async () => {
    const res = await signupRes('  Parent.Durand@Exemple.FR ');
    expect(res.statusCode).toBe(201);
    const setCookie = String(res.headers['set-cookie']);
    expect(setCookie).toMatch(/^af_session=[\w-]{43}; Path=\/; HttpOnly; SameSite=Lax; Max-Age=2592000$/);
    const body = res.json<Me>();
    expect(body).toMatchObject({ account: { email: 'parent.durand@exemple.fr', role: 'parent' }, parent: true });
    // Le jeton n'apparaît jamais dans le corps.
    expect(res.body).not.toContain(sessionCookie(res).split('=')[1]);
    expect((await me(sessionCookie(res))).json<Me>().family.id).toBe(body.family.id);
  });

  it('refus : adresse déjà prise, mot de passe trop court, adresse invalide', async () => {
    await signupRes('a@exemple.fr');
    expect((await signupRes('A@exemple.fr')).statusCode).toBe(409);
    expect((await signupRes('b@exemple.fr', 'court')).statusCode).toBe(400);
    expect((await signupRes('pas-une-adresse')).statusCode).toBe(400);
  });

  it('connexion : bon mot de passe ; mauvais mot de passe ou adresse inconnue → même message', async () => {
    await signupRes('c@exemple.fr');
    expect((await loginRes('c@exemple.fr')).statusCode).toBe(200);
    const wrong = await loginRes('c@exemple.fr', 'mauvais mot de passe');
    const unknown = await loginRes('personne@exemple.fr');
    expect(wrong.statusCode).toBe(401);
    expect(unknown.statusCode).toBe(401);
    expect(wrong.json<{ error: string }>().error).toBe(unknown.json<{ error: string }>().error);
  });

  it('sans session : 401 ; déconnexion : la session ne vaut plus rien', async () => {
    expect((await me('')).statusCode).toBe(401);
    expect((await t.http.inject({ url: '/api/v1/profiles', headers: anonymous })).statusCode).toBe(401);
    expect((await me('af_session=jeton-invente')).statusCode).toBe(401);
    const cookie = sessionCookie(await loginRes(t.family().me.account.email));
    expect((await me(cookie)).statusCode).toBe(200);
    const out = await t.as(cookie).inject({ method: 'POST', url: '/api/v1/auth/logout' });
    expect(out.statusCode).toBe(204);
    expect(String(out.headers['set-cookie'])).toContain('Max-Age=0');
    expect((await me(cookie)).statusCode).toBe(401);
  });

  it('session expirée après 30 jours sans activité, prolongée par l’activité', async () => {
    const cookie = t.family().cookie;
    t.clock.set('2026-12-10');
    expect((await me(cookie)).statusCode).toBe(200); // activité : prolongée de 30 jours
    t.clock.set('2027-01-05');
    expect((await me(cookie)).statusCode).toBe(200);
    t.clock.set('2027-03-01');
    expect((await me(cookie)).statusCode).toBe(401);
  });
});

describe('actions réservées au parent', () => {
  it('verrou après quelques minutes : création de profil refusée, puis permise après confirmation', async () => {
    const cookie = t.family().cookie;
    expect((await createProfile(cookie)).statusCode).toBe(201);
    t.clock.set('2026-11-21');
    const refused = await createProfile(cookie, 'Tom');
    expect(refused.statusCode).toBe(403);
    expect(refused.json()).toMatchObject({ code: 'FORBIDDEN' });
    const bad = await t
      .as(cookie)
      .inject({ method: 'POST', url: '/api/v1/auth/parent', payload: { password: 'mauvais' } });
    expect(bad.statusCode).toBe(401);
    const ok = await t
      .as(cookie)
      .inject({ method: 'POST', url: '/api/v1/auth/parent', payload: { password: TEST_PASSWORD } });
    expect(ok.json<Me>()).toMatchObject({ parent: true });
    expect((await createProfile(cookie, 'Tom')).statusCode).toBe(201);
  });

  it('code PIN : choisi avec le mot de passe, ouvre l’Espace parent, bloqué après 5 erreurs, se quitte', async () => {
    const cookie = t.family().cookie;
    const c = t.as(cookie);
    const post = (url: string, payload?: object) => c.inject({ method: 'POST', url: `/api/v1${url}`, payload });
    expect((await c.inject('/api/v1/auth/me')).json<Me>()).toMatchObject({ hasPin: false });
    expect((await post('/auth/parent/pin', { password: 'mauvais', pin: '1234' })).statusCode).toBe(401);
    expect((await post('/auth/parent/pin', { password: TEST_PASSWORD, pin: '12a4' })).statusCode).toBe(400);
    expect((await post('/auth/parent/pin', { password: TEST_PASSWORD, pin: '2580' })).json<Me>()).toMatchObject({
      hasPin: true,
    });
    // Quitter l'Espace parent : actions parent verrouillées.
    expect((await post('/auth/parent/lock')).json<Me>()).toMatchObject({ parent: false, hasPin: true });
    expect((await createProfile(cookie, 'Tom')).statusCode).toBe(403);
    // Ouvrir avec le bon PIN.
    expect((await post('/auth/parent/pin/unlock', { pin: '2580' })).json<Me>()).toMatchObject({ parent: true });
    expect((await createProfile(cookie, 'Tom')).statusCode).toBe(201);
    // 5 erreurs : bloqué, même avec le bon PIN ; le mot de passe reste possible.
    await post('/auth/parent/lock');
    for (let i = 0; i < 4; i++) expect((await post('/auth/parent/pin/unlock', { pin: '0000' })).statusCode).toBe(401);
    const fifth = await post('/auth/parent/pin/unlock', { pin: '0000' });
    expect(fifth.json<{ error: string }>().error).toMatch(/bloqué 15 minutes/);
    expect((await post('/auth/parent/pin/unlock', { pin: '2580' })).statusCode).toBe(401);
    expect((await post('/auth/parent', { password: TEST_PASSWORD })).json<Me>()).toMatchObject({ parent: true });
  });

  it('l’enfant change ses réglages, pas son identité ; seul le parent supprime', async () => {
    const cookie = t.family().cookie;
    const p = (await createProfile(cookie)).json<Profile>();
    t.clock.set('2026-11-21');
    const patch = (payload: object) =>
      t.as(cookie).inject({ method: 'PATCH', url: `/api/v1/profiles/${p.id}`, payload });
    expect((await patch({ soundOn: false, hero: 'alex' })).statusCode).toBe(200);
    expect((await patch({ name: 'Autre' })).statusCode).toBe(403);
    expect((await patch({ grade: '3e' })).statusCode).toBe(403);
    expect((await t.as(cookie).inject({ method: 'DELETE', url: `/api/v1/profiles/${p.id}` })).statusCode).toBe(403);
  });
});

describe('mot de passe oublié', () => {
  it('lien par e-mail, usage unique, ferme les anciennes sessions', async () => {
    const { cookie, me: account } = t.family();
    const email = account.account.email;
    const forgot = await t.http.inject({
      method: 'POST',
      url: '/api/v1/auth/password/forgot',
      headers: anonymous,
      payload: { email },
    });
    expect(forgot.statusCode).toBe(204);
    const mail = t.mailer.outbox.at(-1);
    expect(mail?.to).toBe(email);
    const token = /jeton=([\w-]+)/.exec(mail?.text ?? '')?.[1] ?? '';
    expect(token).toHaveLength(43);

    const reset = (password: string) =>
      t.http.inject({
        method: 'POST',
        url: '/api/v1/auth/password/reset',
        headers: anonymous,
        payload: { token, password },
      });
    expect((await reset('nouveau mot de passe 2026')).statusCode).toBe(204);
    expect((await me(cookie)).statusCode).toBe(401);
    expect((await loginRes(email)).statusCode).toBe(401);
    expect((await loginRes(email, 'nouveau mot de passe 2026')).statusCode).toBe(200);
    // Lien déjà utilisé.
    expect((await reset('encore un autre mot de passe')).statusCode).toBe(400);
  });

  it('adresse inconnue : même réponse, aucun e-mail ; lien expiré refusé', async () => {
    const before = t.mailer.outbox.length;
    const res = await t.http.inject({
      method: 'POST',
      url: '/api/v1/auth/password/forgot',
      headers: anonymous,
      payload: { email: 'inconnu@exemple.fr' },
    });
    expect(res.statusCode).toBe(204);
    expect(t.mailer.outbox).toHaveLength(before);

    await t.http.inject({
      method: 'POST',
      url: '/api/v1/auth/password/forgot',
      headers: anonymous,
      payload: { email: t.family().me.account.email },
    });
    const token = /jeton=([\w-]+)/.exec(t.mailer.outbox.at(-1)?.text ?? '')?.[1] ?? '';
    t.clock.set('2026-11-21');
    const late = await t.http.inject({
      method: 'POST',
      url: '/api/v1/auth/password/reset',
      headers: anonymous,
      payload: { token, password: 'trop tard pour ce lien' },
    });
    expect(late.statusCode).toBe(400);
  });
});

describe('isolation des familles', () => {
  it('une famille ne voit, ne joue ni ne modifie jamais les profils d’une autre', async () => {
    const lea = (await createProfile(t.family().cookie)).json<Profile>();
    const other = await t.signup('autre@famille.test');
    const them = t.as(other.cookie);

    expect((await them.inject('/api/v1/profiles')).json()).toEqual([]);
    const attempts = [
      them.inject(`/api/v1/profiles/${lea.id}`),
      them.inject({ method: 'PATCH', url: `/api/v1/profiles/${lea.id}`, payload: { soundOn: false } }),
      them.inject({ method: 'DELETE', url: `/api/v1/profiles/${lea.id}` }),
      them.inject(`/api/v1/profiles/${lea.id}/skills`),
      them.inject(`/api/v1/profiles/${lea.id}/bosses`),
      them.inject({ method: 'PUT', url: `/api/v1/profiles/${lea.id}/equipment`, payload: { items: [] } }),
      them.inject({ method: 'POST', url: '/api/v1/shop', payload: { profileId: lea.id, item: 'indice' } }),
      them.inject({
        method: 'POST',
        url: '/api/v1/sessions',
        payload: { profileId: lea.id, mode: 'entrainement', subject: 'maths', chapterId: 'm5-calcul', skillId: null },
      }),
      them.inject({ method: 'POST', url: '/api/v1/battles', payload: { profileId: lea.id, chapterId: 'm5-relatifs' } }),
    ];
    // Le profil est supprimé avant les dernières requêtes s'il n'est pas protégé : le test le verrait.
    for (const res of await Promise.all(attempts)) expect(res.statusCode).toBe(404);
    expect((await t.http.inject(`/api/v1/profiles/${lea.id}`)).statusCode).toBe(200);
  });

  it('les parties et combats d’une autre famille sont introuvables', async () => {
    const lea = (await createProfile(t.family().cookie)).json<Profile>();
    const battle = (
      await t.http.inject({
        method: 'POST',
        url: '/api/v1/battles',
        payload: { profileId: lea.id, chapterId: 'm5-relatifs' },
      })
    ).json<BattleView>();
    const session = (
      await t.http.inject({
        method: 'POST',
        url: '/api/v1/sessions',
        payload: { profileId: lea.id, mode: 'entrainement', subject: 'maths', chapterId: 'm5-calcul', skillId: null },
      })
    ).json<{ id: string }>();
    const them = t.as((await t.signup('voisin@famille.test')).cookie);
    const q = battle.question;
    if (!q) throw new Error('question attendue');
    const attempts = [
      them.inject({
        method: 'POST',
        url: `/api/v1/battles/${battle.id}/answers`,
        payload: {
          skillId: q.skillId,
          level: q.level,
          seed: q.seed,
          response: { kind: 'number', text: '1' },
          durationMs: 1,
        },
      }),
      them.inject({ method: 'POST', url: `/api/v1/battles/${battle.id}/items`, payload: { item: 'soin' } }),
      them.inject({ method: 'POST', url: `/api/v1/battles/${battle.id}/finish` }),
      them.inject({ method: 'POST', url: `/api/v1/sessions/${session.id}/finish` }),
      them.inject({
        method: 'POST',
        url: `/api/v1/sessions/${session.id}/confused`,
        payload: { skillId: 'm5-tables' },
      }),
    ];
    for (const res of await Promise.all(attempts)) expect(res.statusCode).toBe(404);
  });
});

describe('requêtes venues d’un autre site', () => {
  it('une modification envoyée depuis un autre site est refusée (CSRF)', async () => {
    const res = await t.http.inject({
      method: 'POST',
      url: '/api/v1/profiles',
      headers: { origin: 'https://site-malveillant.example' },
      payload: profileInput('Pirate'),
    });
    expect(res.statusCode).toBe(403);
    expect((await t.http.inject('/api/v1/profiles')).json()).toEqual([]);
    const sameSite = await t.http.inject({
      method: 'POST',
      url: '/api/v1/profiles',
      headers: { origin: 'http://questeo.test:3000', host: 'questeo.test:3000' },
      payload: profileInput('Léa'),
    });
    expect(sameSite.statusCode).toBe(201);
  });
});
