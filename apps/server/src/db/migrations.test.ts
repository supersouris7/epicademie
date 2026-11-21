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

  it('journal : dates strictement croissantes (sinon le migrateur saute une migration sans rien dire)', () => {
    const journal = JSON.parse(readFileSync(path.join(MIGRATIONS_DIR, 'meta', '_journal.json'), 'utf8')) as {
      entries: { tag: string; when: number }[];
    };
    for (let i = 1; i < journal.entries.length; i++) {
      const [prev, cur] = [journal.entries[i - 1], journal.entries[i]];
      expect(cur?.when, `${cur?.tag} après ${prev?.tag}`).toBeGreaterThan(prev?.when ?? 0);
    }
  });

  it('une migration sautée rend la base « pas à jour »', async () => {
    database = await openDatabase('pglite://memory');
    await runMigrations(database, MIGRATIONS_DIR);
    await database.db.execute(
      sql`delete from drizzle.__drizzle_migrations where id = (select min(id) from drizzle.__drizzle_migrations)`,
    );
    expect((await schemaStatus(database, MIGRATIONS_DIR)).upToDate).toBe(false);
  });

  it('coffres : depuis une base en 0010, la colonne arrive et les séries terminées comptent un coffre', async () => {
    const dir = migrationsUpTo(11); // jusqu'à 0010
    try {
      database = await openDatabase('pglite://memory');
      await runMigrations(database, dir);
      const { db } = database;
      await db.execute(sql`insert into profiles (id, name, avatar, hero) values
        ('77777777-7777-4777-8777-777777777777', 'Léo', '{"style":"pixelbot","seed":"l"}', 'alex')`);
      await db.execute(sql`insert into sessions (profile_id, mode, subject, chapter_id, finished_at, answered) values
        ('77777777-7777-4777-8777-777777777777', 'entrainement', 'maths', 'm5-calcul', now(), 4),
        ('77777777-7777-4777-8777-777777777777', 'entrainement', 'maths', 'm5-calcul', null, 2),
        ('77777777-7777-4777-8777-777777777777', 'boss', 'maths', 'm5-relatifs', now(), 7)`);
      await runMigrations(database, MIGRATIONS_DIR);
      expect((await schemaStatus(database, MIGRATIONS_DIR)).upToDate).toBe(true);
      const chests: unknown = await db.execute(sql`select mode, chest from sessions order by mode, chest`);
      expect(JSON.stringify(chests)).toContain('{"mode":"entrainement","chest":"commun"}');
      expect(JSON.stringify(chests).match(/"chest":"commun"/g)).toHaveLength(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
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

  it('refonte des héros : Pixel, Tao, Ayla deviennent Alex ; collection nettoyée', async () => {
    const dir = migrationsUpTo(9); // jusqu'à 0008
    try {
      database = await openDatabase('pglite://memory');
      await runMigrations(database, dir);
      const { db } = database;
      await db.execute(sql`insert into profiles (id, name, avatar, hero) values
        ('33333333-3333-4333-8333-333333333333', 'Noé', '{"style":"pixelbot","seed":"n"}', 'pixel'),
        ('44444444-4444-4444-8444-444444444444', 'Ana', '{"style":"pixelbot","seed":"a"}', 'lina')`);
      await db.execute(sql`insert into owned_heroes (profile_id, hero, source) values
        ('33333333-3333-4333-8333-333333333333', 'pixel', 'depart'),
        ('33333333-3333-4333-8333-333333333333', 'lina', 'coffre'),
        ('44444444-4444-4444-8444-444444444444', 'lina', 'depart')`);

      const upTo0009 = migrationsUpTo(10);
      await runMigrations(database, upTo0009);
      rmSync(upTo0009, { recursive: true, force: true });
      const heroes = await db
        .select({ name: profiles.name, hero: profiles.hero })
        .from(profiles)
        .orderBy(profiles.name);
      expect(heroes).toEqual([
        { name: 'Ana', hero: 'lina' },
        { name: 'Noé', hero: 'alex' },
      ]);
      const owned: unknown = await db.execute(sql`select profile_id, hero from owned_heroes order by profile_id, hero`);
      expect(JSON.stringify(owned)).not.toContain('pixel');
      expect(JSON.stringify(owned).match(/"hero":"alex"/g)).toHaveLength(1);
      expect(JSON.stringify(owned).match(/"hero":"lina"/g)).toHaveLength(2);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('héros débloqués : chaque profil possède Alex et Lina, le héros porté ne change pas', async () => {
    const dir = migrationsUpTo(10); // jusqu'à 0009
    try {
      database = await openDatabase('pglite://memory');
      await runMigrations(database, dir);
      const { db } = database;
      await db.execute(sql`insert into profiles (id, name, avatar, hero) values
        ('55555555-5555-4555-8555-555555555555', 'Zoé', '{"style":"pixelbot","seed":"z"}', 'lina'),
        ('66666666-6666-4666-8666-666666666666', 'Tom', '{"style":"pixelbot","seed":"t"}', 'alex')`);
      await db.execute(sql`insert into owned_heroes (profile_id, hero, source) values
        ('55555555-5555-4555-8555-555555555555', 'lina', 'depart'),
        ('66666666-6666-4666-8666-666666666666', 'alex', 'depart'),
        ('66666666-6666-4666-8666-666666666666', 'lina', 'coffre')`);

      await runMigrations(database, MIGRATIONS_DIR);
      const owned: unknown = await db.execute(
        sql`select p.name, o.hero, o.source from owned_heroes o join profiles p on p.id = o.profile_id order by p.name, o.hero`,
      );
      const rows = JSON.stringify(owned);
      for (const expected of [
        '{"name":"Tom","hero":"alex","source":"depart"}',
        '{"name":"Tom","hero":"lina","source":"coffre"}',
        '{"name":"Zoé","hero":"alex","source":"depart"}',
        '{"name":"Zoé","hero":"lina","source":"depart"}',
      ])
        expect(rows).toContain(expected);
      const worn = await db.select({ name: profiles.name, hero: profiles.hero }).from(profiles).orderBy(profiles.name);
      expect(worn).toEqual([
        { name: 'Tom', hero: 'alex' },
        { name: 'Zoé', hero: 'lina' },
      ]);
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
