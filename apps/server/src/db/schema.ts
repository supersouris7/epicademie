import { sql } from 'drizzle-orm';
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { AvatarConfig, BossMedal, Gender, Grade, HeroId, ItemId } from '@questeo/shared';

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatar: text('avatar', { mode: 'json' }).$type<AvatarConfig>().notNull(),
  gender: text('gender').$type<Gender>(),
  birthDate: text('birth_date'),
  hero: text('hero').$type<HeroId>().notNull().default('alex'),
  grade: text('grade').$type<Grade>(),
  xp: integer('xp').notNull().default(0),
  coins: integer('coins').notNull().default(0),
  soundOn: integer('sound_on', { mode: 'boolean' }).notNull().default(true),
  musicOn: integer('music_on', { mode: 'boolean' }).notNull().default(true),
  /** Objets équipés pour les combats de boss (3 au plus, pris dans l'inventaire). */
  equipped: text('equipped', { mode: 'json' })
    .$type<ItemId[]>()
    .notNull()
    .default(sql`'[]'`),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

export type ProfileRow = typeof profiles.$inferSelect;

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  profileId: text('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  mode: text('mode').notNull(),
  subject: text('subject').notNull(),
  chapterId: text('chapter_id').notNull(),
  skillId: text('skill_id'),
  startedAt: text('started_at')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  finishedAt: text('finished_at'),
  answered: integer('answered').notNull().default(0),
  correct: integer('correct').notNull().default(0),
  xp: integer('xp').notNull().default(0),
  coins: integer('coins').notNull().default(0),
  /** Notions signalées « Je n'ai pas compris » pendant la partie. */
  confused: text('confused', { mode: 'json' })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  /** État du combat de boss (mode « boss »), tenu par le serveur. */
  battle: text('battle', { mode: 'json' }).$type<unknown>(),
});

export const attempts = sqliteTable(
  'attempts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    profileId: text('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    skillId: text('skill_id').notNull(),
    level: integer('level').notNull(),
    seed: integer('seed').notNull(),
    variant: integer('variant', { mode: 'boolean' }).notNull(),
    response: text('response', { mode: 'json' }).notNull(),
    correct: integer('correct', { mode: 'boolean' }).notNull(),
    durationMs: integer('duration_ms').notNull(),
    xp: integer('xp').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  },
  (t) => [
    index('attempts_session_idx').on(t.sessionId),
    index('attempts_profile_skill_idx').on(t.profileId, t.skillId),
  ],
);

export const skillStates = sqliteTable(
  'skill_states',
  {
    profileId: text('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    skillId: text('skill_id').notNull(),
    stage: integer('stage').notNull().default(0),
    due: text('due'),
    attempts: integer('attempts').notNull().default(0),
    correct: integer('correct').notNull().default(0),
    recent: text('recent', { mode: 'json' }).$type<boolean[]>().notNull(),
    maintained: integer('maintained').notNull().default(0),
    /** Meilleure série de 5 (bonnes réponses du 1er coup) : fixe la médaille. */
    bestSeries: integer('best_series').notNull().default(0),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.skillId] })],
);

/** Objets de combat (bouclier, soin, indice) possédés par un profil. */
export const inventory = sqliteTable(
  'inventory',
  {
    profileId: text('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    item: text('item').$type<ItemId>().notNull(),
    count: integer('count').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.item] })],
);

/** Boss vaincus : la 1re victoire donne la munition du chapitre, une médaille et un coffre. */
export const bossRecords = sqliteTable(
  'boss_records',
  {
    profileId: text('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    chapterId: text('chapter_id').notNull(),
    wins: integer('wins').notNull().default(0),
    bestHearts: integer('best_hearts').notNull().default(0),
    bestMedal: text('best_medal').$type<BossMedal>().notNull().default('bronze'),
    firstWonAt: text('first_won_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.chapterId] })],
);
