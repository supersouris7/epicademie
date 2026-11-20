import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { sql } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vitest';
import { openDatabase, type Database } from './client.ts';
import { assertSchemaUpToDate, runMigrations, schemaStatus } from './migrations.ts';
import { MIGRATIONS_DIR } from '../testing/harness.ts';
import { profiles, skillStates } from './schema.ts';

let database: Database | null = null;
afterEach(async () => {
  await database?.close();
  database = null;
});

describe('migrations', () => {
  it('une base neuve n’est pas à jour : le serveur refuse de démarrer', async () => {
    database = await openDatabase('pglite://memory');
    const status = await schemaStatus(database, MIGRATIONS_DIR);
    expect(status).toMatchObject({ upToDate: false, applied: 0 });
    expect(status.expected).toBeGreaterThan(0);
    await expect(assertSchemaUpToDate(database, MIGRATIONS_DIR)).rejects.toThrow(/db:migrate/);
  });

  it('migre, puis la base est à jour ; relancer ne fait rien (idempotent)', async () => {
    database = await openDatabase('pglite://memory');
    await runMigrations(database, MIGRATIONS_DIR);
    const first = await schemaStatus(database, MIGRATIONS_DIR);
    expect(first.upToDate).toBe(true);
    expect(first.applied).toBe(first.expected);
    await runMigrations(database, MIGRATIONS_DIR);
    expect((await schemaStatus(database, MIGRATIONS_DIR)).applied).toBe(first.applied);
    await expect(assertSchemaUpToDate(database, MIGRATIONS_DIR)).resolves.toBeUndefined();
  });

  it('refuse une URL de base inconnue', async () => {
    await expect(openDatabase('mysql://x')).rejects.toThrow(/DATABASE_URL/);
  });

  it('mise à jour d’une base de la bêta : profils et progression conservés, sans famille', async () => {
    // Base telle qu'en production avant les comptes : seulement la 1re migration.
    const dir = migrationsUpTo(1);
    try {
      database = await openDatabase('pglite://memory');
      await runMigrations(database, dir);
      const { db } = database;
      await db.execute(sql`insert into profiles (id, name, avatar, coins, xp)
        values ('11111111-1111-4111-8111-111111111111', 'Léa', '{"style":"pixelbot","seed":"l"}', 120, 340)`);
      await db.execute(sql`insert into skill_states (profile_id, skill_id, stage, recent)
        values ('11111111-1111-4111-8111-111111111111', 'm5-tables', 2, '[true,true]')`);

      await runMigrations(database, MIGRATIONS_DIR);
      expect((await schemaStatus(database, MIGRATIONS_DIR)).upToDate).toBe(true);
      const rows = await db
        .select({ name: profiles.name, coins: profiles.coins, xp: profiles.xp, familyId: profiles.familyId })
        .from(profiles);
      expect(rows).toEqual([{ name: 'Léa', coins: 120, xp: 340, familyId: null }]);
      expect(await db.select().from(skillStates)).toHaveLength(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('suppression du QG : cosmétiques achetés remboursés (pièces et rubis), tables supprimées', async () => {
    const dir = migrationsUpTo(8); // jusqu'à 0007_qg
    try {
      database = await openDatabase('pglite://memory');
      await runMigrations(database, dir);
      const { db } = database;
      await db.execute(sql`insert into profiles (id, name, avatar, coins, rubies)
        values ('22222222-2222-4222-8222-222222222222', 'Tom', '{"style":"pixelbot","seed":"t"}', 100, 1)`);
      await db.execute(sql`insert into owned_cosmetics (profile_id, cosmetic) values
        ('22222222-2222-4222-8222-222222222222', 'fond-nuit'),
        ('22222222-2222-4222-8222-222222222222', 'cadre-feu')`);
      await db.execute(sql`insert into hq_layouts (profile_id, layout)
        values ('22222222-2222-4222-8222-222222222222', '{}')`);

      await runMigrations(database, MIGRATIONS_DIR);
      expect((await schemaStatus(database, MIGRATIONS_DIR)).upToDate).toBe(true);
      const [tom] = await db.select({ coins: profiles.coins, rubies: profiles.rubies }).from(profiles);
      // fond-nuit : 2 rubis ; cadre-feu : 300 pièces.
      expect(tom).toEqual({ coins: 400, rubies: 3 });
      const tables: unknown = await db.execute(
        sql`select table_name from information_schema.tables where table_name in ('hq_layouts', 'owned_cosmetics')`,
      );
      expect(JSON.stringify(tables)).not.toMatch(/hq_layouts|owned_cosmetics/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

/** Copie des `count` premières migrations (base d'une version antérieure). */
function migrationsUpTo(count: number): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'questeo-migrations-'));
  cpSync(MIGRATIONS_DIR, dir, { recursive: true });
  const journalPath = path.join(dir, 'meta', '_journal.json');
  const journal = JSON.parse(readFileSync(journalPath, 'utf8')) as { entries: unknown[] };
  writeFileSync(journalPath, JSON.stringify({ ...journal, entries: journal.entries.slice(0, count) }));
  return dir;
}
