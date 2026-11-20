import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import type {
  AccountRole,
  AvatarConfig,
  BossMedal,
  Gender,
  Grade,
  HeroId,
  ItemId,
  ModeId,
  SubjectId,
} from '@questeo/shared';

/**
 * Schéma PostgreSQL (source des migrations : `pnpm --filter @questeo/server db:generate`).
 *
 * Conventions :
 * - identifiants `uuid`, horodatages `timestamptz`, jours (révision, naissance) en `date` ;
 * - JSON en `jsonb` typé par `$type` ;
 * - invariants métier simples doublés d'une contrainte CHECK (ex. pièces ≥ 0) : la base refuse
 *   un état incohérent même en cas de bug applicatif ;
 * - suppression d'un profil en cascade sur toutes ses données (droit à l'effacement).
 */

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const at = (name: string) => timestamp(name, { withTimezone: true });

/** Famille : regroupe le compte parent et les profils enfants (unité d'isolation des données). */
export const families = pgTable('families', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: createdAt(),
});

/**
 * Compte de connexion (parent ou administrateur). E-mail stocké en minuscules (unique) ; mot de
 * passe haché (scrypt, sel aléatoire, voir core/auth/password.ts), jamais en clair.
 */
export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    familyId: uuid('family_id')
      .notNull()
      .references(() => families.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').$type<AccountRole>().notNull().default('parent'),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('accounts_email_unique').on(t.email),
    index('accounts_family_idx').on(t.familyId),
    check('accounts_email_lowercase', sql`${t.email} = lower(${t.email})`),
    check('accounts_role_valid', sql`${t.role} in ('parent', 'admin')`),
  ],
);

/**
 * Session d'un appareil. Le cookie porte un jeton aléatoire ; la base n'en garde que l'empreinte
 * SHA-256 (une fuite de la base ne permet pas de se connecter). `parentUntil` : fin du
 * déverrouillage des actions parent (mot de passe confirmé récemment).
 */
export const authSessions = pgTable(
  'auth_sessions',
  {
    tokenHash: text('token_hash').primaryKey(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    expiresAt: at('expires_at').notNull(),
    parentUntil: at('parent_until'),
    createdAt: createdAt(),
  },
  (t) => [index('auth_sessions_account_idx').on(t.accountId), index('auth_sessions_expires_idx').on(t.expiresAt)],
);

/** Lien de réinitialisation du mot de passe : empreinte du jeton, usage unique, courte durée. */
export const passwordResets = pgTable(
  'password_resets',
  {
    tokenHash: text('token_hash').primaryKey(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    expiresAt: at('expires_at').notNull(),
    usedAt: at('used_at'),
    createdAt: createdAt(),
  },
  (t) => [index('password_resets_account_idx').on(t.accountId)],
);

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /**
     * Famille du profil. Nul pour les profils créés avant les comptes (bêta) : invisibles de
     * toutes les familles jusqu'à leur rattachement (aucune donnée supprimée).
     */
    familyId: uuid('family_id').references(() => families.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    avatar: jsonb('avatar').$type<AvatarConfig>().notNull(),
    gender: text('gender').$type<Gender>(),
    birthDate: date('birth_date', { mode: 'string' }),
    hero: text('hero').$type<HeroId>().notNull().default('alex'),
    grade: text('grade').$type<Grade>(),
    xp: integer('xp').notNull().default(0),
    coins: integer('coins').notNull().default(0),
    rubies: integer('rubies').notNull().default(2),
    soundOn: boolean('sound_on').notNull().default(true),
    musicOn: boolean('music_on').notNull().default(true),
    /** Objets équipés pour les combats de boss (3 au plus, pris dans l'inventaire). */
    equipped: jsonb('equipped').$type<ItemId[]>().notNull().default([]),
    createdAt: createdAt(),
  },
  (t) => [
    check('profiles_xp_nonnegative', sql`${t.xp} >= 0`),
    check('profiles_coins_nonnegative', sql`${t.coins} >= 0`),
    check('profiles_rubies_nonnegative', sql`${t.rubies} >= 0`),
    index('profiles_created_at_idx').on(t.createdAt),
    index('profiles_family_idx').on(t.familyId),
  ],
);

export type ProfileRow = typeof profiles.$inferSelect;

/** Une partie : entraînement (mode ≠ boss) ou combat de boss (état dans `battle`). */
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    mode: text('mode').$type<ModeId>().notNull(),
    subject: text('subject').$type<SubjectId>().notNull(),
    chapterId: text('chapter_id').notNull(),
    skillId: text('skill_id'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
    answered: integer('answered').notNull().default(0),
    correct: integer('correct').notNull().default(0),
    xp: integer('xp').notNull().default(0),
    coins: integer('coins').notNull().default(0),
    /** Notions signalées « Je n'ai pas compris » pendant la partie. */
    confused: jsonb('confused').$type<string[]>().notNull().default([]),
    /** État du combat de boss (mode « boss »), tenu par le serveur. Voir modules/battles. */
    battle: jsonb('battle').$type<unknown>(),
  },
  (t) => [index('sessions_profile_mode_chapter_idx').on(t.profileId, t.mode, t.chapterId)],
);

export type SessionRow = typeof sessions.$inferSelect;

/** Chaque réponse donnée (historique, séries, anti-répétition des énoncés). */
export const attempts = pgTable(
  'attempts',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    skillId: text('skill_id').notNull(),
    level: smallint('level').notNull(),
    seed: integer('seed').notNull(),
    variant: boolean('variant').notNull(),
    response: jsonb('response').notNull(),
    correct: boolean('correct').notNull(),
    durationMs: integer('duration_ms').notNull(),
    xp: integer('xp').notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index('attempts_session_idx').on(t.sessionId),
    index('attempts_profile_skill_idx').on(t.profileId, t.skillId),
    check('attempts_level_range', sql`${t.level} between 1 and 3`),
  ],
);

/** Répétition espacée : état de chaque notion pour chaque profil. */
export const skillStates = pgTable(
  'skill_states',
  {
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    skillId: text('skill_id').notNull(),
    stage: smallint('stage').notNull().default(0),
    due: date('due', { mode: 'string' }),
    attempts: integer('attempts').notNull().default(0),
    correct: integer('correct').notNull().default(0),
    recent: jsonb('recent').$type<boolean[]>().notNull(),
    maintained: integer('maintained').notNull().default(0),
    /** Meilleure série (bonnes réponses du 1er coup) : fixe la médaille. */
    bestSeries: smallint('best_series').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.profileId, t.skillId] }),
    check('skill_states_stage_range', sql`${t.stage} between 0 and 3`),
    check('skill_states_best_range', sql`${t.bestSeries} between 0 and 5`),
  ],
);

export type SkillStateRow = typeof skillStates.$inferSelect;

/** Objets de combat (bouclier, soin, indice) possédés par un profil. */
export const inventory = pgTable(
  'inventory',
  {
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    item: text('item').$type<ItemId>().notNull(),
    count: smallint('count').notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.profileId, t.item] }),
    // Stock maximal : MAX_ITEM_STOCK (@questeo/shared).
    check('inventory_count_range', sql`${t.count} between 0 and 9`),
  ],
);

/** Boss vaincus : la 1re victoire donne une médaille et un coffre. */
export const bossRecords = pgTable(
  'boss_records',
  {
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    chapterId: text('chapter_id').notNull(),
    wins: integer('wins').notNull().default(0),
    bestHearts: smallint('best_hearts').notNull().default(0),
    bestMedal: text('best_medal').$type<BossMedal>().notNull().default('bronze'),
    firstWonAt: timestamp('first_won_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.chapterId] })],
);

/** Toutes les tables, de la plus dépendante à la moins dépendante (remise à zéro des tests). */
export const ALL_TABLES = [
  'attempts',
  'skill_states',
  'inventory',
  'boss_records',
  'sessions',
  'profiles',
  'password_resets',
  'auth_sessions',
  'accounts',
  'families',
] as const;
