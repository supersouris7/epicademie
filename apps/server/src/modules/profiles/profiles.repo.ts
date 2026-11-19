import { asc, eq, gte, and, sql } from 'drizzle-orm';
import type { Profile, ProfileCreate, ProfileUpdate } from '@questeo/shared';
import type { Executor } from '../../db/client.ts';
import { profiles, type ProfileRow } from '../../db/schema.ts';

/** Accès aux données des profils (aucune règle métier ici : voir profiles.service.ts). */

export const toProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  name: row.name,
  avatar: row.avatar,
  gender: row.gender,
  birthDate: row.birthDate,
  hero: row.hero,
  grade: row.grade,
  xp: row.xp,
  coins: row.coins,
  rubies: row.rubies,
  soundOn: row.soundOn,
  musicOn: row.musicOn,
  createdAt: row.createdAt.toISOString(),
});

/** Gains à créditer à un profil (valeurs ≥ 0). */
export interface Rewards {
  readonly xp?: number;
  readonly coins?: number;
  readonly rubies?: number;
}

export function profilesRepo(db: Executor) {
  return {
    async list(): Promise<Profile[]> {
      const rows = await db.select().from(profiles).orderBy(asc(profiles.createdAt), asc(profiles.id));
      return rows.map(toProfile);
    },

    async find(id: string): Promise<ProfileRow | undefined> {
      const [row] = await db.select().from(profiles).where(eq(profiles.id, id));
      return row;
    },

    /** Lit le profil en le verrouillant jusqu'à la fin de la transaction (gains, achats). */
    async findForUpdate(id: string): Promise<ProfileRow | undefined> {
      const [row] = await db.select().from(profiles).where(eq(profiles.id, id)).for('update');
      return row;
    },

    async exists(id: string): Promise<boolean> {
      const [row] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, id));
      return row !== undefined;
    },

    async insert(input: ProfileCreate & { readonly rubies: number }): Promise<ProfileRow> {
      const [row] = await db
        .insert(profiles)
        .values({ ...input, hero: input.hero ?? 'alex' })
        .returning();
      if (!row) throw new Error('insertion de profil sans retour');
      return row;
    },

    async update(id: string, patch: ProfileUpdate): Promise<ProfileRow | undefined> {
      const [row] = await db.update(profiles).set(patch).where(eq(profiles.id, id)).returning();
      return row;
    },

    async remove(id: string): Promise<boolean> {
      const removed = await db.delete(profiles).where(eq(profiles.id, id)).returning({ id: profiles.id });
      return removed.length > 0;
    },

    /** Crédite XP, pièces et rubis de façon atomique (pas de lecture-écriture concurrente). */
    async credit(id: string, r: Rewards): Promise<ProfileRow | undefined> {
      const [row] = await db
        .update(profiles)
        .set({
          xp: sql`${profiles.xp} + ${r.xp ?? 0}`,
          coins: sql`${profiles.coins} + ${r.coins ?? 0}`,
          rubies: sql`${profiles.rubies} + ${r.rubies ?? 0}`,
        })
        .where(eq(profiles.id, id))
        .returning();
      return row;
    },

    /** Débite des pièces si le solde suffit (sinon `undefined`), et crédite des rubis. */
    async spend(id: string, coins: number, rubiesGained = 0): Promise<ProfileRow | undefined> {
      const [row] = await db
        .update(profiles)
        .set({ coins: sql`${profiles.coins} - ${coins}`, rubies: sql`${profiles.rubies} + ${rubiesGained}` })
        .where(and(eq(profiles.id, id), gte(profiles.coins, coins)))
        .returning();
      return row;
    },
  };
}

export type ProfilesRepo = ReturnType<typeof profilesRepo>;
