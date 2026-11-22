import { and, desc, eq, inArray } from 'drizzle-orm';
import type { Executor } from '../../db/client.ts';
import { profiles, recommendations } from '../../db/schema.ts';

export type RecommendationRow = typeof recommendations.$inferSelect;

/** Recommandations : lecture et écriture (aucune règle métier ici). */
export function recommendationsRepo(db: Executor) {
  return {
    /** Recommandations en attente d'un enfant, la plus récente d'abord. */
    pendingOf(profileId: string) {
      return db
        .select()
        .from(recommendations)
        .where(and(eq(recommendations.profileId, profileId), eq(recommendations.status, 'en-attente')))
        .orderBy(desc(recommendations.createdAt));
    },

    /** Toutes les recommandations non annulées des enfants d'une famille, avec leur prénom. */
    async ofFamily(familyId: string, limit: number) {
      return db
        .select({ row: recommendations, profileName: profiles.name })
        .from(recommendations)
        .innerJoin(profiles, eq(profiles.id, recommendations.profileId))
        .where(and(eq(profiles.familyId, familyId), inArray(recommendations.status, ['en-attente', 'faite'])))
        .orderBy(desc(recommendations.createdAt))
        .limit(limit);
    },

    async insert(profileId: string, skillId: string, note: string | null, now: Date) {
      const [row] = await db.insert(recommendations).values({ profileId, skillId, note, createdAt: now }).returning();
      return row;
    },

    /** Annule une recommandation en attente de CE profil ; false si elle n'existe pas ou n'est plus en attente. */
    async cancel(profileId: string, id: string, now: Date): Promise<boolean> {
      const rows = await db
        .update(recommendations)
        .set({ status: 'annulee', closedAt: now })
        .where(
          and(
            eq(recommendations.id, id),
            eq(recommendations.profileId, profileId),
            eq(recommendations.status, 'en-attente'),
          ),
        )
        .returning({ id: recommendations.id });
      return rows.length > 0;
    },

    /** Marque « faite » la recommandation en attente de cette notion (s'il y en a une). */
    async complete(profileId: string, skillId: string, result: { correct: number; answered: number }, now: Date) {
      await db
        .update(recommendations)
        .set({ status: 'faite', closedAt: now, correct: result.correct, answered: result.answered })
        .where(
          and(
            eq(recommendations.profileId, profileId),
            eq(recommendations.skillId, skillId),
            eq(recommendations.status, 'en-attente'),
          ),
        );
    },

    /** Verrouille la ligne du profil : sérialise les créations concurrentes (limite de 3). */
    async lockProfile(profileId: string): Promise<boolean> {
      const rows = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, profileId)).for('update');
      return rows.length > 0;
    },
  };
}
