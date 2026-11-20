import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import { buildApp, type App, type AppConfig } from '../app.ts';
import { openDatabase, type Database } from '../db/client.ts';
import { runMigrations } from '../db/migrations.ts';
import { ALL_TABLES, subscriptions } from '../db/schema.ts';
import { memoryMailer } from '../core/mail/mailer.ts';
import { systemRandom, type Random } from '../core/random.ts';
import type { Clock } from '../core/clock.ts';
import type { InjectOptions, LightMyRequestResponse } from 'fastify';
import type { Me } from '@questeo/shared';

/**
 * Outillage des tests du serveur.
 *
 * Base : PostgreSQL embarqué en mémoire (PGlite) par défaut ; si `TEST_DATABASE_URL` est
 * défini (CI d'intégration), une base PostgreSQL réelle et neuve est créée pour chaque
 * fichier de test, puis supprimée. Les mêmes tests valident ainsi les deux moteurs.
 */

export const MIGRATIONS_DIR = path.resolve(import.meta.dirname, '../../drizzle');

export const testConfig = (overrides: Partial<AppConfig> = {}): AppConfig => ({
  env: 'test',
  port: 3000,
  webDir: null,
  publicUrl: 'http://test:3000',
  logLevel: 'silent',
  trustProxy: 0,
  rateLimitMax: 100_000,
  authRateLimitMax: 100_000,
  metricsToken: null,
  apiDocs: false,
  timeZone: 'Europe/Paris',
  version: 'test',
  cookieSecure: false,
  corsOrigins: null,
  sessionDays: 30,
  billing: {
    provider: 'simulateur',
    priceCents: 2499,
    currency: 'eur',
    schoolYearEnd: '08-31',
    minDays: 60,
    stripeSecretKey: null,
    stripeWebhookSecret: null,
  },
  ...overrides,
});

/** Horloge réglable : jour fixe, modifiable pendant le test. */
export function fixedClock(day: string): Clock & { set(day: string): void } {
  let current = day;
  return {
    today: () => current,
    now: () => new Date(`${current}T12:00:00Z`),
    set: (d) => void (current = d),
  };
}

/** Hasard prévisible : `float()` renvoie toujours `value`, les graines restent aléatoires. */
export const fixedRandom = (value: number): Random => ({ ...systemRandom, float: () => value });

/** Hasard qui rejoue une suite de tirages (puis recommence). */
export const sequenceRandom = (values: readonly number[]): Random => {
  let i = 0;
  return { ...systemRandom, float: () => values[i++ % values.length] ?? 0 };
};

/** Base de test migrée (voir en-tête). */
export async function createTestDatabase(): Promise<Database & { reset(): Promise<void> }> {
  const adminUrl = process.env.TEST_DATABASE_URL;
  let database: Database;
  let drop: (() => Promise<void>) | null = null;
  if (adminUrl) {
    const name = `questeo_test_${randomBytes(6).toString('hex')}`;
    const admin = new pg.Client({ connectionString: adminUrl });
    await admin.connect();
    await admin.query(`create database ${name}`);
    await admin.end();
    const url = new URL(adminUrl);
    url.pathname = `/${name}`;
    database = await openDatabase(url.toString(), { poolMax: 4 });
    drop = async () => {
      const a = new pg.Client({ connectionString: adminUrl });
      await a.connect();
      await a.query(`drop database if exists ${name} with (force)`);
      await a.end();
    };
  } else {
    database = await openDatabase('pglite://memory');
  }
  await runMigrations(database, MIGRATIONS_DIR);
  return {
    ...database,
    async reset() {
      await database.db.execute(sql.raw(`truncate ${ALL_TABLES.join(', ')} restart identity cascade`));
    },
    async close() {
      await database.close();
      await drop?.();
    },
  };
}

export interface TestHarnessOptions {
  readonly today?: string;
  readonly random?: Random;
  readonly config?: Partial<AppConfig>;
  /** Routes supplémentaires, ajoutées avant le démarrage (ex. une route qui plante). */
  readonly routes?: (http: App['http']) => void;
  /** La famille de test a l'abonnement (par défaut : oui, tous les chapitres sont jouables). */
  readonly premium?: boolean;
  /** Appels HTTP sortants (prestataire de paiement simulé). */
  readonly fetcher?: typeof fetch;
}

/** Mot de passe des comptes de test. */
export const TEST_PASSWORD = 'mot de passe de test 42';

/** Valeur du cookie de session posé par une réponse (`af_session=…`), ou `''`. */
export const sessionCookie = (res: LightMyRequestResponse): string => {
  const header = res.headers['set-cookie'];
  const first = Array.isArray(header) ? header[0] : header;
  return first?.split(';')[0] ?? '';
};

/**
 * Application complète sur une base de test (une par fichier de test).
 *
 * Une **famille de test est connectée par défaut** : `t.http.inject()` envoie son cookie de
 * session (comme un appareil de la famille). Pour une requête anonyme, passer
 * `headers: { cookie: '' }` ; pour une autre famille, `t.signup()` puis `t.as(cookie)`.
 * `reset()` vide la base et reconnecte une famille neuve.
 */
export async function createTestApp(options: TestHarnessOptions = {}) {
  const database = await createTestDatabase();
  const clock = fixedClock(options.today ?? '2026-11-16');
  const mailer = memoryMailer();
  const app: App = await buildApp({
    config: testConfig(options.config),
    database,
    clock,
    random: options.random ?? systemRandom,
    mailer,
    fetcher: options.fetcher,
  });
  options.routes?.(app.http);
  let accounts = 0;

  /** Crée une famille (compte parent) et renvoie le cookie de sa session. */
  const signup = async (email = `parent${++accounts}@famille.test`) => {
    const res = await app.http.inject({
      method: 'POST',
      url: '/api/v1/auth/signup',
      payload: { email, password: TEST_PASSWORD },
    });
    if (res.statusCode !== 201) throw new Error(`inscription de test refusée : ${res.body}`);
    return { cookie: sessionCookie(res), me: res.json<Me>() };
  };
  /** Paiement réussi enregistré directement (abonnement de la famille de test). */
  const subscribe = async (familyId: string) => {
    await database.db.insert(subscriptions).values({
      familyId,
      offer: 'famille-annee',
      status: 'payee',
      amountCents: 2499,
      currency: 'eur',
      periodEnd: '2099-08-31',
      provider: 'simulateur',
      paidAt: new Date(),
    });
  };
  const defaultFamily = async () => {
    const f = await signup();
    if (options.premium ?? true) await subscribe(f.me.family.id);
    return f;
  };
  let family = await defaultFamily();

  /** Client HTTP d'un appareil connecté avec ce cookie (un cookie explicite l'emporte). */
  const as = (cookie: () => string) => ({
    inject: (opts: InjectOptions | string) => {
      const o = typeof opts === 'string' ? { url: opts } : opts;
      return app.http.inject({ ...o, headers: { cookie: cookie(), ...o.headers } });
    },
  });

  return {
    app,
    /** Serveur Fastify brut (écoute réseau, temps réel). */
    raw: app.http,
    /** Requêtes au nom de la famille de test connectée. */
    http: as(() => family.cookie),
    as: (cookie: string) => as(() => cookie),
    signup,
    /** Famille de test connectée (cookie, compte). */
    family: () => family,
    mailer,
    clock,
    database,
    /** Vide toutes les tables (entre deux tests) et reconnecte une famille neuve. */
    async reset() {
      await database.reset();
      family = await defaultFamily();
    },
    async close() {
      await app.http.close();
      await database.close();
    },
  };
}

/** Profil de test valide (5e, fille, née en 2014). */
export const profileInput = (name = 'Léa') => ({
  name,
  avatar: { style: 'pixelbot', seed: name },
  gender: 'fille',
  birthDate: '2014-03-09',
  grade: '5e',
});
