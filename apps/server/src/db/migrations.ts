import { sql } from 'drizzle-orm';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type { Database, Schema } from './client.ts';

/**
 * Migrations du schéma (fichiers SQL générés par drizzle-kit dans `apps/server/drizzle`).
 *
 * En production, elles s'appliquent par une commande dédiée (`node dist/migrate.js`, conteneur
 * « migrate ») AVANT le démarrage des instances ; le serveur vérifie au démarrage que la base est
 * à jour et refuse de démarrer sinon. Voir docs/adr/0003-migrations.md.
 */

/** Verrou consultatif PostgreSQL : deux migrations lancées en même temps s'attendent. */
const MIGRATION_LOCK = 72_007_001;

export async function runMigrations(database: Database, migrationsFolder: string): Promise<void> {
  const { db } = database;
  await db.execute(sql`select pg_advisory_lock(${MIGRATION_LOCK})`);
  try {
    if (database.raw.kind === 'postgres') {
      await migratePg(db as unknown as NodePgDatabase<Schema>, { migrationsFolder });
    } else {
      await migratePglite(db as unknown as PgliteDatabase<Schema>, { migrationsFolder });
    }
  } finally {
    await db.execute(sql`select pg_advisory_unlock(${MIGRATION_LOCK})`);
  }
}

export interface SchemaStatus {
  readonly upToDate: boolean;
  /** Migrations connues du code. */
  readonly expected: number;
  /** Migrations appliquées en base. */
  readonly applied: number;
}

/** Compare les migrations appliquées en base à celles livrées avec le code. */
export async function schemaStatus(database: Database, migrationsFolder: string): Promise<SchemaStatus> {
  const expected = readMigrationFiles({ migrationsFolder });
  const last = expected.at(-1);
  const table = await database.db.execute(
    sql`select to_regclass('drizzle.__drizzle_migrations') is not null as exists`,
  );
  if (!rows<{ exists: boolean }>(table)[0]?.exists)
    return { upToDate: expected.length === 0, expected: expected.length, applied: 0 };
  const applied = rows<{ created_at: string | number | null; n: string | number }>(
    await database.db.execute(
      sql`select max(created_at) as created_at, count(*) as n from drizzle.__drizzle_migrations`,
    ),
  )[0];
  const count = Number(applied?.n ?? 0);
  const lastApplied = Number(applied?.created_at ?? 0);
  // Les deux conditions : la dernière migration est passée, et aucune n'a été sautée (une date
  // de journal plus ancienne que la précédente serait ignorée en silence par le migrateur).
  return {
    upToDate: (!last || lastApplied >= last.folderMillis) && count >= expected.length,
    expected: expected.length,
    applied: count,
  };
}

/** Lève une erreur explicite si la base n'est pas au niveau du code. */
export async function assertSchemaUpToDate(database: Database, migrationsFolder: string): Promise<void> {
  const status = await schemaStatus(database, migrationsFolder);
  if (!status.upToDate) {
    throw new Error(
      `Base non migrée (${status.applied}/${status.expected} migrations) : lancez d'abord ` +
        '`pnpm --filter @epicademie/server db:migrate` (ou le conteneur « migrate »).',
    );
  }
}

/** `execute` renvoie `{ rows }` (pg, PGlite) : on normalise. */
function rows<T>(result: unknown): T[] {
  return (result as { rows: T[] }).rows;
}
