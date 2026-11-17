import { sql } from 'drizzle-orm';
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { AvatarConfig, Gender, HeroId } from '@questeo/shared';

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatar: text('avatar', { mode: 'json' }).$type<AvatarConfig>().notNull(),
  gender: text('gender').$type<Gender>(),
  birthDate: text('birth_date'),
  hero: text('hero').$type<HeroId>().notNull().default('alex'),
  xp: integer('xp').notNull().default(0),
  coins: integer('coins').notNull().default(0),
  soundOn: integer('sound_on', { mode: 'boolean' }).notNull().default(true),
  musicOn: integer('music_on', { mode: 'boolean' }).notNull().default(true),
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
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.skillId] })],
);
