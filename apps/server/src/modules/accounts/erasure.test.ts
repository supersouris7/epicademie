import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { sql } from 'drizzle-orm';
import type { FamilyExport, Me } from '@epicademie/shared';
import { createTestApp, profileInput, TEST_PASSWORD } from '../../testing/harness.ts';

let t: Awaited<ReturnType<typeof createTestApp>>;
const stripeCalls: string[] = [];

beforeAll(async () => {
  t = await createTestApp({
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
        stripeWebhookSecret: 'whsec_test',
      },
    },
    fetcher: async (input) => {
      const url = urlOf(input);
      stripeCalls.push(url);
      return new Response(JSON.stringify({ id: 'cs_test_1', url: 'https://checkout.stripe.com/c/pay/cs_test_1' }));
    },
  });
});
afterAll(() => t.close());
beforeEach(async () => {
  stripeCalls.length = 0;
  await t.reset();
});

const del = (cookie: string | null, payload: object) =>
  (cookie === null ? t.http : t.as(cookie)).inject({ method: 'POST', url: '/api/v1/family/delete', payload });
const CONFIRM = { confirmation: 'SUPPRIMER', password: TEST_PASSWORD };

/** Profil, partie jouée et paiement en attente pour une famille. */
async function populate(cookie: string, name: string) {
  const api = t.as(cookie);
  const res = await api.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput(name) });
  expect(res.statusCode).toBe(201);
  await api.inject({ method: 'POST', url: '/api/v1/billing/checkout' });
  return res.json<{ id: string }>().id;
}

const rowsOf = (res: unknown): Record<string, unknown>[] => (res as { rows: Record<string, unknown>[] }).rows;
const urlOf = (input: string | URL | Request): string =>
  typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

/** Lignes qui portent encore l'un de ces identifiants, dans toutes les tables. */
async function rowsReferencing(ids: { family: string; accounts: string[]; profiles: string[] }) {
  const cols = rowsOf(
    await t.database.db.execute(sql`
    select table_name, column_name from information_schema.columns
    where table_schema = 'public' and column_name in
      ('family_id','account_id','profile_id','profile_a','profile_b','requested_by','id')
      and table_name not in ('__drizzle_migrations')`),
  );
  const known: Record<string, string[]> = {
    family_id: [ids.family],
    account_id: ids.accounts,
    profile_id: ids.profiles,
    profile_a: ids.profiles,
    profile_b: ids.profiles,
    requested_by: ids.profiles,
  };
  const found: string[] = [];
  for (const row of cols) {
    const table = String(row.table_name);
    const col = String(row.column_name);
    const values = col === 'id' ? [] : (known[col] ?? []);
    if (table === 'families' && col === 'id') values.push(ids.family);
    if (table === 'accounts' && col === 'id') values.push(...ids.accounts);
    if (table === 'profiles' && col === 'id') values.push(...ids.profiles);
    if (values.length === 0) continue;
    const list = sql.join(
      values.map((v) => sql`${v}::uuid`),
      sql`, `,
    );
    const r = rowsOf(
      await t.database.db.execute(
        sql`select count(*)::int as n from ${sql.identifier(table)} where ${sql.identifier(col)} in (${list})`,
      ),
    );
    if (Number(r[0]?.n ?? 0) > 0) found.push(`${table}.${col}`);
  }
  return found;
}

describe('suppression du compte famille', () => {
  it('refus sans authentification, sans mot de confirmation, avec mauvais mot de passe', async () => {
    expect(
      (await t.http.inject({ method: 'POST', url: '/api/v1/family/delete', headers: { cookie: '' }, payload: CONFIRM }))
        .statusCode,
    ).toBe(401);
    expect((await t.http.inject({ url: '/api/v1/family/export', headers: { cookie: '' } })).statusCode).toBe(401);
    expect((await del(null, { password: TEST_PASSWORD })).statusCode).toBe(400);
    expect((await del(null, { confirmation: 'supprimer', password: TEST_PASSWORD })).statusCode).toBe(400);
    expect((await del(null, { confirmation: 'SUPPRIMER' })).statusCode).toBe(400);
    expect((await del(null, { ...CONFIRM, pin: '1234' })).statusCode).toBe(400);
    expect((await del(null, { confirmation: 'SUPPRIMER', password: 'mauvais mot de passe' })).statusCode).toBe(401);
    expect((await t.http.inject('/api/v1/auth/me')).statusCode).toBe(200);
  });

  it('refus : Espace parent verrouillé', async () => {
    await t.http.inject({ method: 'POST', url: '/api/v1/auth/parent/lock' });
    expect((await del(null, CONFIRM)).statusCode).toBe(403);
    expect((await t.http.inject('/api/v1/family/export')).statusCode).toBe(403);
  });

  it('efface tout, annule Stripe, ferme la session ; une autre famille reste intacte', async () => {
    const mine = t.family();
    const other = await t.signup();
    const myProfile = await populate(mine.cookie, 'Léa');
    const otherProfile = await populate(other.cookie, 'Hugo');
    await t.database.db.execute(
      sql`insert into question_reports (family_id, profile_id, kind, skill_id, reason)
          values (${mine.me.family.id}::uuid, ${myProfile}::uuid, 'question', 'x', 'erreur')`,
    );
    await t.database.db.execute(
      sql`insert into question_reports (family_id, profile_id, kind, skill_id, reason)
          values (${other.me.family.id}::uuid, ${otherProfile}::uuid, 'question', 'x', 'erreur')`,
    );
    stripeCalls.length = 0;

    const res = await del(null, CONFIRM);
    expect(res.statusCode).toBe(204);
    expect(String(res.headers['set-cookie'])).toMatch(/^af_session=; .*Max-Age=0/);
    expect(stripeCalls).toEqual(['https://api.stripe.com/v1/checkout/sessions/cs_test_1/expire']);

    // Session invalidée.
    expect((await t.http.inject('/api/v1/auth/me')).statusCode).toBe(401);
    // Plus aucune ligne liée, dans aucune table.
    expect(
      await rowsReferencing({ family: mine.me.family.id, accounts: [mine.me.account.id], profiles: [myProfile] }),
    ).toEqual([]);
    // Une autre famille : compte, profil, paiement, signalement intacts.
    expect((await t.as(other.cookie).inject('/api/v1/auth/me')).json<Me>().family.id).toBe(other.me.family.id);
    expect(
      await rowsReferencing({ family: other.me.family.id, accounts: [other.me.account.id], profiles: [otherProfile] }),
    ).toEqual(
      expect.arrayContaining([
        'families.id',
        'accounts.id',
        'profiles.id',
        'subscriptions.family_id',
        'question_reports.family_id',
      ]),
    );
    // Isolation : le profil effacé n'existe plus pour l'autre famille (404).
    expect((await t.as(other.cookie).inject(`/api/v1/profiles/${myProfile}`)).statusCode).toBe(404);
    // Le compte supprimé ne peut plus se connecter.
    const login = await t.http.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: { cookie: '' },
      payload: { email: mine.email, password: TEST_PASSWORD },
    });
    expect(login.statusCode).toBe(401);
  });

  it('confirmation par PIN parent ; PIN faux refusé', async () => {
    await t.http.inject({
      method: 'POST',
      url: '/api/v1/auth/parent/pin',
      payload: { password: TEST_PASSWORD, pin: '4321' },
    });
    expect((await del(null, { confirmation: 'SUPPRIMER', pin: '1111' })).statusCode).toBe(401);
    expect((await del(null, { confirmation: 'SUPPRIMER', pin: '4321' })).statusCode).toBe(204);
  });

  it('erreur Stripe : rien n’est supprimé', async () => {
    const failing = await createTestApp({
      premium: false,
      config: {
        billing: {
          provider: 'stripe',
          priceCents: 2499,
          currency: 'eur',
          schoolYearEnd: '08-31',
          minDays: 60,
          stripeSecretKey: 'sk_test_factice',
          stripeWebhookSecret: 'whsec_test',
        },
      },
      fetcher: async (input) =>
        urlOf(input).endsWith('/expire')
          ? new Response('{}', { status: 503 })
          : new Response(JSON.stringify({ id: 'cs_test_9', url: 'https://checkout.stripe.com/x' })),
    });
    try {
      await failing.http.inject({ method: 'POST', url: '/api/v1/billing/checkout' });
      const res = await failing.http.inject({ method: 'POST', url: '/api/v1/family/delete', payload: CONFIRM });
      expect(res.statusCode).toBeGreaterThanOrEqual(500);
      expect((await failing.http.inject('/api/v1/auth/me')).statusCode).toBe(200);
    } finally {
      await failing.close();
    }
  });

  it('aucun e-mail ni identifiant dans le journal de suppression', async () => {
    const lines: string[] = [];
    const mine = t.family();
    const child = t.raw.log as unknown as { info: (o: unknown, m?: string) => void };
    const original = child.info;
    child.info = (o: unknown, m?: string) => {
      lines.push(JSON.stringify([o, m]));
      original.call(child, o, m);
    };
    try {
      await del(null, CONFIRM);
    } finally {
      child.info = original;
    }
    // Le journal de requête est sérialisé par Fastify (méthode, chemin) ; on contrôle l'événement émis ici.
    const event = lines.filter((l) => l.includes('compte famille supprimé'));
    expect(event).toHaveLength(1);
    const all = event.join('\n');
    expect(all).not.toContain(mine.email);
    expect(all).not.toContain(mine.me.family.id);
  });
});

describe('export des données', () => {
  it('contient comptes, profils et progression, sans empreinte de mot de passe', async () => {
    const mine = t.family();
    await populate(mine.cookie, 'Léa');
    const res = await t.http.inject('/api/v1/family/export');
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    const body = res.json<FamilyExport>();
    expect(body.account).toEqual([expect.objectContaining({ email: mine.email, role: 'parent' })]);
    expect(body.profiles).toEqual([expect.objectContaining({ name: 'Léa' })]);
    expect(Object.keys(body.progression)).toEqual(expect.arrayContaining(['skillStates', 'attempts', 'inventory']));
    expect(body.subscriptions).toHaveLength(1);
    expect(res.body).not.toMatch(/password|pin_?hash|passwordHash|parentPinHash/i);
  });

  it('une autre famille ne voit que ses propres données', async () => {
    const other = await t.signup();
    const body = (await t.as(other.cookie).inject('/api/v1/family/export')).json<FamilyExport>();
    expect(body.profiles).toEqual([]);
    expect(body.account).toHaveLength(1);
  });
});
