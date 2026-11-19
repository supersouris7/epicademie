import { afterEach, describe, expect, it } from 'vitest';
import { openDatabase, type Database } from './client.ts';
import { assertSchemaUpToDate, runMigrations, schemaStatus } from './migrations.ts';
import { MIGRATIONS_DIR } from '../testing/harness.ts';

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
});
