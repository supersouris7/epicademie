import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Billing, LearningReport, Profile } from '@questeo/shared';
import { createTestApp, profileInput, sessionCookie, TEST_PASSWORD } from '../../testing/harness.ts';
import { signStripePayload } from './stripe.ts';

/** Famille SANS abonnement : chapitres gratuits seulement, jusqu'au paiement. */
let t: Awaited<ReturnType<typeof createTestApp>>;
let profileId: string;

beforeAll(async () => {
  t = await createTestApp({ today: '2026-11-20', premium: false });
});
afterAll(() => t.close());
beforeEach(async () => {
  t.clock.set('2026-11-20');
  await t.reset();
  profileId = (
    await t.http.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput() })
  ).json<Profile>().id;
});

const startSession = (chapterId: string, skillId: string | null = null) =>
  t.http.inject({
    method: 'POST',
    url: '/api/v1/sessions',
    payload: { profileId, mode: 'entrainement', subject: 'maths', chapterId, skillId },
  });
const startBattle = (chapterId: string) =>
  t.http.inject({ method: 'POST', url: '/api/v1/battles', payload: { profileId, chapterId } });
const billing = async () => (await t.http.inject('/api/v1/billing')).json<Billing>();
const checkout = async () =>
  (await t.http.inject({ method: 'POST', url: '/api/v1/billing/checkout' })).json<{ url: string }>();
const paymentId = (url: string) => new URL(url, 'http://x').searchParams.get('paiement') ?? '';
const simulate = (id: string, outcome: 'succes' | 'echec') =>
  t.http.inject({ method: 'POST', url: `/api/v1/billing/simulate/${id}`, payload: { outcome } });

describe('version gratuite', () => {
  it('1er chapitre de la classe jouable, chapitre suivant réservé à l’abonnement', async () => {
    expect((await startSession('m5-calcul')).statusCode).toBe(201);
    const locked = await startSession('m5-relatifs');
    expect(locked.statusCode).toBe(402);
    expect(locked.json()).toMatchObject({ code: 'PREMIUM_REQUIRED' });
    expect((await startBattle('m5-relatifs')).statusCode).toBe(402);
    expect((await startBattle('m5-calcul')).statusCode).toBe(201);
  });

  it('séance mêlant des chapitres : chaque notion payante est refusée à la réponse', async () => {
    const { id } = (await startSession('seance')).json<{ id: string }>();
    const res = await t.http.inject({
      method: 'POST',
      url: `/api/v1/sessions/${id}/answers`,
      payload: {
        skillId: 'm5-relatifs-comparer',
        level: 1,
        seed: 1,
        variant: false,
        response: { kind: 'choice', index: 0 },
        durationMs: 1000,
      },
    });
    expect(res.statusCode).toBe(402);
  });

  it('état : pas d’accès complet, prix configurable, fin d’accès si l’on payait aujourd’hui', async () => {
    expect(await billing()).toMatchObject({
      premium: false,
      until: null,
      priceCents: 2499,
      currency: 'eur',
      wouldEnd: '2027-08-31',
      available: true,
      simulated: true,
      history: [],
    });
  });
});

describe('paiement (simulateur)', () => {
  it('paiement accepté : accès complet jusqu’à la fin de l’année scolaire, historique', async () => {
    const { url } = await checkout();
    expect(url).toMatch(/^\/parent\/abonnement\/simulateur\?paiement=/);
    expect((await billing()).history).toEqual([expect.objectContaining({ status: 'en-attente', amountCents: 2499 })]);
    const paid = (await simulate(paymentId(url), 'succes')).json<Billing>();
    expect(paid).toMatchObject({ premium: true, until: '2027-08-31' });
    expect(paid.history[0]).toMatchObject({ status: 'payee', periodEnd: '2027-08-31' });
    expect((await startSession('m5-relatifs')).statusCode).toBe(201);
    // Déjà payé pour cette année : pas de second paiement.
    expect((await t.http.inject({ method: 'POST', url: '/api/v1/billing/checkout' })).statusCode).toBe(409);
    // Notification rejouée : rien ne change.
    expect((await simulate(paymentId(url), 'echec')).json<Billing>().premium).toBe(true);
  });

  it('paiement refusé : pas d’accès, l’échec reste dans l’historique, nouvel essai possible', async () => {
    const { url } = await checkout();
    const failed = (await simulate(paymentId(url), 'echec')).json<Billing>();
    expect(failed).toMatchObject({ premium: false, history: [expect.objectContaining({ status: 'echouee' })] });
    expect((await startSession('m5-relatifs')).statusCode).toBe(402);
    expect((await t.http.inject({ method: 'POST', url: '/api/v1/billing/checkout' })).statusCode).toBe(201);
  });

  it('expiration : chapitres payants refermés, progrès conservés, renouvellement explicite', async () => {
    await simulate(paymentId((await checkout()).url), 'succes');
    // Une réponse sur un chapitre payant pendant l'abonnement.
    const { id } = (await startSession('m5-relatifs', 'm5-relatifs-comparer')).json<{ id: string }>();
    await t.http.inject({
      method: 'POST',
      url: `/api/v1/sessions/${id}/answers`,
      payload: {
        skillId: 'm5-relatifs-comparer',
        level: 1,
        seed: 1,
        variant: false,
        response: { kind: 'choice', index: 0 },
        durationMs: 1000,
      },
    });
    t.clock.set('2027-09-01');
    // Dix mois plus tard, la session de l'appareil a expiré : le parent se reconnecte.
    const login = await t.http.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: { cookie: '' },
      payload: { email: t.family().email, password: TEST_PASSWORD },
    });
    const device = t.as(sessionCookie(login));
    const status = (await device.inject('/api/v1/billing')).json<Billing>();
    expect(status).toMatchObject({ premium: false, until: '2027-08-31', wouldEnd: '2028-08-31' });
    const relocked = await device.inject({
      method: 'POST',
      url: '/api/v1/sessions',
      payload: { profileId, mode: 'entrainement', subject: 'maths', chapterId: 'm5-relatifs', skillId: null },
    });
    expect(relocked.statusCode).toBe(402);
    const report = (await device.inject(`/api/v1/profiles/${profileId}/learning`)).json<LearningReport>();
    expect(report.tally.answered).toBe(1);
    // Pas de renouvellement automatique : un nouveau paiement est nécessaire.
    expect(status.history.filter((h) => h.status === 'payee')).toHaveLength(1);
  });

  it('paiement réservé au parent ; paiement d’une autre famille introuvable', async () => {
    t.clock.set('2026-11-21'); // verrou parent expiré
    expect((await t.http.inject({ method: 'POST', url: '/api/v1/billing/checkout' })).statusCode).toBe(403);
    t.clock.set('2026-11-20');
    const { url } = await checkout();
    const other = await t.signup('voisins@famille.test');
    const res = await t
      .as(other.cookie)
      .inject({ method: 'POST', url: `/api/v1/billing/simulate/${paymentId(url)}`, payload: { outcome: 'succes' } });
    expect(res.statusCode).toBe(404);
    expect((await billing()).premium).toBe(false);
  });
});

describe('Stripe (mode test, aucune clé réelle)', () => {
  const secret = 'whsec_test_secret';
  let stripe: Awaited<ReturnType<typeof createTestApp>>;
  const sent: { url: string; body: string; headers: Record<string, string> }[] = [];

  beforeAll(async () => {
    stripe = await createTestApp({
      today: '2026-11-20',
      premium: false,
      config: {
        billing: {
          provider: 'stripe',
          priceCents: 2499,
          currency: 'eur',
          schoolYearEnd: '08-31',
          minDays: 60,
          stripeSecretKey: 'sk_test_factice',
          stripeWebhookSecret: secret,
        },
      },
      fetcher: async (input, init) => {
        sent.push({
          url: input instanceof Request ? input.url : input.toString(),
          body: init?.body instanceof URLSearchParams ? init.body.toString() : '',
          headers: init?.headers as Record<string, string>,
        });
        return new Response(
          JSON.stringify({ id: 'cs_test_123', url: 'https://checkout.stripe.com/c/pay/cs_test_123' }),
        );
      },
    });
  });
  afterAll(() => stripe.close());

  const webhook = (payload: object, signature: string) =>
    stripe.http.inject({
      method: 'POST',
      url: '/api/v1/billing/webhook/stripe',
      headers: { 'content-type': 'application/json', 'stripe-signature': signature, cookie: '' },
      payload: JSON.stringify(payload),
    });

  it('session de paiement unique, puis notification signée : accès complet ; signature fausse refusée', async () => {
    const res = await stripe.http.inject({ method: 'POST', url: '/api/v1/billing/checkout' });
    expect(res.json()).toEqual({ url: 'https://checkout.stripe.com/c/pay/cs_test_123' });
    const call = sent.at(-1);
    expect(call?.url).toBe('https://api.stripe.com/v1/checkout/sessions');
    expect(call?.body).toContain('mode=payment');
    expect(call?.body).toContain('unit_amount%5D=2499');
    expect(call?.headers.Authorization).toBe('Bearer sk_test_factice');
    const subId = new URLSearchParams(call?.body).get('metadata[subscription_id]') ?? '';

    const event = {
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: { object: { payment_status: 'paid', metadata: { subscription_id: subId } } },
    };
    const now = Math.floor(Date.now() / 1000);
    expect((await webhook(event, 't=1,v1=00')).statusCode).toBe(400);
    expect((await webhook(event, signStripePayload(JSON.stringify(event), secret, now - 3600))).statusCode).toBe(400);
    expect((await webhook(event, signStripePayload(JSON.stringify(event), 'whsec_autre', now))).statusCode).toBe(400);
    const ok = await webhook(event, signStripePayload(JSON.stringify(event), secret, now));
    expect(ok.statusCode).toBe(200);
    // Notification rejouée : sans effet.
    expect((await webhook(event, signStripePayload(JSON.stringify(event), secret, now))).statusCode).toBe(200);
    const status = (await stripe.http.inject('/api/v1/billing')).json<Billing>();
    expect(status).toMatchObject({ premium: true, simulated: false });
    expect(status.history.filter((h) => h.status === 'payee')).toHaveLength(1);
  });
});

describe('paiement fermé', () => {
  it('sans prestataire configuré : paiement indisponible (503), jeu gratuit intact', async () => {
    const closed = await createTestApp({
      premium: false,
      config: {
        billing: {
          provider: 'aucun',
          priceCents: 2499,
          currency: 'eur',
          schoolYearEnd: '08-31',
          minDays: 60,
          stripeSecretKey: null,
          stripeWebhookSecret: null,
        },
      },
    });
    try {
      expect((await closed.http.inject({ method: 'POST', url: '/api/v1/billing/checkout' })).statusCode).toBe(503);
      expect((await closed.http.inject('/api/v1/billing')).json<Billing>()).toMatchObject({ available: false });
    } finally {
      await closed.close();
    }
  });
});
