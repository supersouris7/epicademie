import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import pg from 'pg';
import * as schema from './schema.ts';

/**
 * Accès à PostgreSQL, avec deux moteurs interchangeables derrière la même API Drizzle :
 * - `postgres://…` : serveur PostgreSQL (production, CI d'intégration), pool `pg` ;
 * - `pglite://memory` ou `pglite://<dossier>` : PostgreSQL embarqué (WASM) pour le développement
 *   et les tests, sans installation. Même dialecte SQL, mêmes migrations.
 * Voir docs/adr/0002-postgresql.md.
 */

export type Schema = typeof schema;
/** Base Drizzle, quel que soit le moteur. */
export type Db = PgDatabase<PgQueryResultHKT, Schema>;
/** Transaction en cours (même API de requêtes que `Db`). */
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
/** Ce que les dépôts acceptent : la base ou une transaction. */
export type Executor = Db | Tx;

export interface Database {
  readonly db: Db;
  readonly kind: 'postgres' | 'pglite';
  /** Base éphémère (en mémoire) : rien ne survit à l'arrêt du processus. */
  readonly ephemeral: boolean;
  /** Vérifie que la base répond (sonde /api/ready). */
  ping(): Promise<void>;
  close(): Promise<void>;
  /** Moteur brut, pour les migrations. */
  readonly raw:
    { readonly kind: 'postgres'; readonly pool: pg.Pool } | { readonly kind: 'pglite'; readonly client: PGlite };
}

export interface DatabaseOptions {
  readonly poolMax?: number;
  /** Nom de l'application vu par PostgreSQL (pg_stat_activity). */
  readonly applicationName?: string;
}

const PGLITE = 'pglite://';

export async function openDatabase(url: string, options: DatabaseOptions = {}): Promise<Database> {
  if (url.startsWith(PGLITE)) {
    const target = url.slice(PGLITE.length);
    const ephemeral = target === 'memory' || target === '';
    if (!ephemeral) fs.mkdirSync(target, { recursive: true });
    const client = ephemeral ? new PGlite() : new PGlite(target);
    await client.waitReady;
    const db = drizzlePglite(client, { schema }) as unknown as Db;
    return {
      db,
      kind: 'pglite',
      ephemeral,
      ping: async () => {
        await db.execute(sql`select 1`);
      },
      close: () => client.close(),
      raw: { kind: 'pglite', client },
    };
  }
  if (/^postgres(ql)?:\/\//.test(url)) {
    const pool = new pg.Pool({
      connectionString: url,
      max: options.poolMax ?? 10,
      application_name: options.applicationName ?? 'questeo',
      // Une requête bloquée ne doit pas immobiliser le serveur.
      statement_timeout: 15_000,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
    });
    const db = drizzlePg(pool, { schema }) as unknown as Db;
    return {
      db,
      kind: 'postgres',
      ephemeral: false,
      ping: async () => {
        await db.execute(sql`select 1`);
      },
      close: () => pool.end(),
      raw: { kind: 'postgres', pool },
    };
  }
  throw new Error('DATABASE_URL doit commencer par postgres://, postgresql:// ou pglite://');
}
