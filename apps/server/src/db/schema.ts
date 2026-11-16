import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { AvatarConfig, Theme } from '@questeo/shared';

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatar: text('avatar', { mode: 'json' }).$type<AvatarConfig>().notNull(),
  xp: integer('xp').notNull().default(0),
  coins: integer('coins').notNull().default(0),
  theme: text('theme').$type<Theme>().notNull().default('auto'),
  soundOn: integer('sound_on', { mode: 'boolean' }).notNull().default(true),
  musicOn: integer('music_on', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

export type ProfileRow = typeof profiles.$inferSelect;
