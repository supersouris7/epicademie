import { eq, inArray, or } from 'drizzle-orm';
import type { Executor } from '../../db/client.ts';
import {
  accounts,
  attempts,
  bossRecords,
  chapterRewards,
  evaluationCompetences,
  evaluations,
  families,
  friendships,
  inventory,
  ownedHeroes,
  profiles,
  questionReports,
  sessions,
  skillStates,
  studiedChapters,
  subscriptions,
} from '../../db/schema.ts';

/** Export et effacement des données d'une famille (droit d'accès, de portabilité et d'effacement). */
export function erasureRepo(db: Executor) {
  const rows = (list: object[]) => list as Record<string, unknown>[];
  return {
    /** Toutes les données de la famille, sans empreintes de mot de passe, de PIN ni de jetons. */
    async collect(familyId: string) {
      const account = await db
        .select({ id: accounts.id, email: accounts.email, role: accounts.role, createdAt: accounts.createdAt })
        .from(accounts)
        .where(eq(accounts.familyId, familyId));
      const profileRows = await db.select().from(profiles).where(eq(profiles.familyId, familyId));
      const ids = profileRows.map((p) => p.id);
      const none = ids.length === 0;
      const byProfile = async <T extends object>(read: (ids: string[]) => Promise<T[]>) =>
        rows(none ? [] : await read(ids));
      const evals = await byProfile((i) => db.select().from(evaluations).where(inArray(evaluations.profileId, i)));
      const evalIds = evals.map((e) => e.id as string);
      return {
        account,
        profiles: profileRows,
        progression: {
          skillStates: await byProfile((i) => db.select().from(skillStates).where(inArray(skillStates.profileId, i))),
          sessions: await byProfile((i) => db.select().from(sessions).where(inArray(sessions.profileId, i))),
          attempts: await byProfile((i) => db.select().from(attempts).where(inArray(attempts.profileId, i))),
          inventory: await byProfile((i) => db.select().from(inventory).where(inArray(inventory.profileId, i))),
          ownedHeroes: await byProfile((i) => db.select().from(ownedHeroes).where(inArray(ownedHeroes.profileId, i))),
          bossRecords: await byProfile((i) => db.select().from(bossRecords).where(inArray(bossRecords.profileId, i))),
          chapterRewards: await byProfile((i) =>
            db.select().from(chapterRewards).where(inArray(chapterRewards.profileId, i)),
          ),
          studiedChapters: await byProfile((i) =>
            db.select().from(studiedChapters).where(inArray(studiedChapters.profileId, i)),
          ),
          evaluations: evals,
          evaluationCompetences:
            evalIds.length === 0
              ? []
              : rows(
                  await db
                    .select()
                    .from(evaluationCompetences)
                    .where(inArray(evaluationCompetences.evaluationId, evalIds)),
                ),
          friendships: await byProfile((i) =>
            db
              .select()
              .from(friendships)
              .where(or(inArray(friendships.profileA, i), inArray(friendships.profileB, i))),
          ),
          questionReports: rows(await db.select().from(questionReports).where(eq(questionReports.familyId, familyId))),
        },
        subscriptions: rows(await db.select().from(subscriptions).where(eq(subscriptions.familyId, familyId))),
      };
    },

    /**
     * Efface la famille. Les signalements (liés par « set null ») sont supprimés explicitement ;
     * tout le reste suit par les suppressions en cascade des clés étrangères.
     */
    async erase(familyId: string): Promise<void> {
      await db.delete(questionReports).where(eq(questionReports.familyId, familyId));
      await db.delete(families).where(eq(families.id, familyId));
    },
  };
}
