import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { openDb } from './db/client.ts';

const migrationsDir = path.resolve(import.meta.dirname, '../drizzle');

describe('migration 0007 : style « Personnage » retiré', () => {
  it('passe les profils big-ears en Visage, même graine, sans coiffure', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'questeo-')), 'test.db');
    openDb(file, migrationsDir).close();
    const sqlite = new Database(file);
    const insert = sqlite.prepare('INSERT INTO profiles (id, name, avatar, created_at) VALUES (?, ?, ?, ?)');
    insert.run('a', 'Léa', JSON.stringify({ style: 'big-ears', seed: 's1', hair: 'long' }), Date.now());
    insert.run('b', 'Tom', JSON.stringify({ style: 'pixelbot', seed: 's2' }), Date.now());
    sqlite.exec(fs.readFileSync(path.join(migrationsDir, '0007_avatar_no_big_ears.sql'), 'utf8'));
    const avatars = sqlite.prepare('SELECT id, avatar FROM profiles ORDER BY id').all() as { avatar: string }[];
    expect(avatars.map((r) => JSON.parse(r.avatar) as unknown)).toEqual([
      { style: 'adventurer-neutral', seed: 's1' },
      { style: 'pixelbot', seed: 's2' },
    ]);
    sqlite.close();
  });
});

describe('migration 0008 : nouveaux héros', () => {
  it('remplace Alex, Léo, Zoé et Mia par Nassim, Tao, Lina et Ayla', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'questeo-')), 'test.db');
    openDb(file, migrationsDir).close();
    const sqlite = new Database(file);
    const insert = sqlite.prepare('INSERT INTO profiles (id, name, avatar, hero, created_at) VALUES (?, ?, ?, ?, ?)');
    const avatar = JSON.stringify({ style: 'pixelbot', seed: 's' });
    ['alex', 'leo', 'zoe', 'mia', 'pixel'].forEach((hero, i) =>
      insert.run(String(i), `P${i}`, avatar, hero, Date.now()),
    );
    sqlite.exec(fs.readFileSync(path.join(migrationsDir, '0008_new_heroes.sql'), 'utf8'));
    const heroes = sqlite.prepare('SELECT hero FROM profiles ORDER BY id').all() as { hero: string }[];
    expect(heroes.map((r) => r.hero)).toEqual(['nassim', 'tao', 'lina', 'ayla', 'pixel']);
    sqlite.close();
  });
});

describe('migration 0009 : combat de boss', () => {
  it('renomme Nassim en Alex, ajoute la classe et la munition', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'questeo-')), 'test.db');
    openDb(file, migrationsDir).close();
    const sqlite = new Database(file);
    const insert = sqlite.prepare('INSERT INTO profiles (id, name, avatar, hero, created_at) VALUES (?, ?, ?, ?, ?)');
    const avatar = JSON.stringify({ style: 'pixelbot', seed: 's' });
    ['nassim', 'tao'].forEach((hero, i) => insert.run(String(i), `P${i}`, avatar, hero, Date.now()));
    sqlite.exec(
      fs
        .readFileSync(path.join(migrationsDir, '0009_battle.sql'), 'utf8')
        .split('--> statement-breakpoint')
        .filter((st) => st.includes('UPDATE `profiles`'))
        .join(';'),
    );
    const rows = sqlite.prepare('SELECT hero, grade FROM profiles ORDER BY id').all();
    expect(rows).toEqual([
      { hero: 'alex', grade: null },
      { hero: 'tao', grade: null },
    ]);
    sqlite.close();
  });
});

describe('migration 0010 : Alex seul héros jouable', () => {
  it('passe tous les profils sur Alex', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'questeo-')), 'test.db');
    openDb(file, migrationsDir).close();
    const sqlite = new Database(file);
    const insert = sqlite.prepare('INSERT INTO profiles (id, name, avatar, hero, created_at) VALUES (?, ?, ?, ?, ?)');
    const avatar = JSON.stringify({ style: 'pixelbot', seed: 's' });
    ['pixel', 'alex', 'lina'].forEach((hero, i) => insert.run(String(i), `P${i}`, avatar, hero, Date.now()));
    sqlite.exec(fs.readFileSync(path.join(migrationsDir, '0010_alex_only.sql'), 'utf8'));
    const heroes = sqlite.prepare('SELECT hero FROM profiles ORDER BY id').all() as { hero: string }[];
    expect(heroes.map((r) => r.hero)).toEqual(['alex', 'alex', 'alex']);
    sqlite.close();
  });
});

describe('migration 0014 : rubis', () => {
  it('s’applique à une base arrêtée à la 0013', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'questeo-'));
    // Dossier de migrations amputé de la 0014 : reproduit une base déjà déployée.
    const oldDir = path.join(root, 'drizzle');
    fs.cpSync(migrationsDir, oldDir, { recursive: true });
    const journalPath = path.join(oldDir, 'meta/_journal.json');
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8')) as { entries: { tag: string }[] };
    fs.rmSync(path.join(oldDir, `${journal.entries.pop()?.tag}.sql`));
    fs.writeFileSync(journalPath, JSON.stringify(journal));
    const file = path.join(root, 'test.db');
    openDb(file, oldDir).close();
    openDb(file, migrationsDir).close();
    const sqlite = new Database(file);
    const columns = sqlite.prepare('PRAGMA table_info(profiles)').all() as { name: string }[];
    expect(columns.map((c) => c.name)).toContain('rubies');
    sqlite.close();
  });
});

describe('migration 0013 : équipement et meilleure série', () => {
  it('donne aux notions déjà travaillées la médaille qu’elles avaient (acquise → Or)', () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'questeo-')), 'test.db');
    openDb(file, migrationsDir).close();
    const sqlite = new Database(file);
    sqlite
      .prepare('INSERT INTO profiles (id, name, avatar, created_at) VALUES (?, ?, ?, ?)')
      .run('p', 'Léa', JSON.stringify({ style: 'pixelbot', seed: 's' }), Date.now());
    const insert = sqlite.prepare(
      "INSERT INTO skill_states (profile_id, skill_id, stage, recent, updated_at) VALUES ('p', ?, ?, '[]', 'x')",
    );
    for (const [id, stage] of [
      ['a', 0],
      ['b', 1],
      ['c', 2],
      ['d', 3],
    ] as const)
      insert.run(id, stage);
    const sql = fs.readFileSync(path.join(migrationsDir, '0013_equipment_series.sql'), 'utf8');
    sqlite.exec(sql.split('--> statement-breakpoint').at(-1) ?? '');
    const rows = sqlite.prepare('SELECT skill_id, best_series FROM skill_states ORDER BY skill_id').all();
    expect(rows).toEqual([
      { skill_id: 'a', best_series: 0 },
      { skill_id: 'b', best_series: 3 },
      { skill_id: 'c', best_series: 4 },
      { skill_id: 'd', best_series: 5 },
    ]);
    expect(sqlite.prepare("SELECT equipped FROM profiles WHERE id = 'p'").get()).toEqual({ equipped: '[]' });
    sqlite.close();
  });
});
