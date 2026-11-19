import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { sql } from 'drizzle-orm';
import pg from 'pg';
import { buildApp, type App, type AppConfig } from '../app.ts';
import { openDatabase, type Database } from '../db/client.ts';
import { runMigrations } from '../db/migrations.ts';
import { ALL_TABLES } from '../db/schema.ts';
import { systemRandom, type Random } from '../core/random.ts';
import type { Clock } from '../core/clock.ts';

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
  metricsToken: null,
  apiDocs: false,
  timeZone: 'Europe/Paris',
  version: 'test',
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
}

/** Application complète sur une base de test (une par fichier de test). */
export async function createTestApp(options: TestHarnessOptions = {}) {
  const database = await createTestDatabase();
  const clock = fixedClock(options.today ?? '2026-11-16');
  const app: App = await buildApp({
    config: testConfig(options.config),
    database,
    clock,
    random: options.random ?? systemRandom,
  });
  return {
    app,
    http: app.http,
    clock,
    database,
    /** Vide toutes les tables (entre deux tests). */
    reset: () => database.reset(),
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
