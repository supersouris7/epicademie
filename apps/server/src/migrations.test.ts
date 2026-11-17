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
