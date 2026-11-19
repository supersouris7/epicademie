import { and, desc, eq, sql } from 'drizzle-orm';
import type { BossMedal, BossRecord } from '@questeo/shared';
import type { Executor } from '../../db/client.ts';
import { attempts, bossRecords, sessions } from '../../db/schema.ts';

/** Accès aux boss vaincus et à l'historique des questions de combat. */
export function battlesRepo(db: Executor) {
  const toRecord = (r: typeof bossRecords.$inferSelect): BossRecord => ({
    chapterId: r.chapterId,
    wins: r.wins,
    bestHearts: r.bestHearts,
    bestMedal: r.bestMedal,
    firstWonAt: r.firstWonAt.toISOString(),
  });

  return {
    async records(profileId: string): Promise<BossRecord[]> {
      const rows = await db.select().from(bossRecords).where(eq(bossRecords.profileId, profileId));
      return rows.map(toRecord);
    },

    async record(profileId: string, chapterId: string): Promise<BossRecord | undefined> {
      const [row] = await db
        .select()
        .from(bossRecords)
        .where(and(eq(bossRecords.profileId, profileId), eq(bossRecords.chapterId, chapterId)));
      return row && toRecord(row);
    },

    /** Enregistre une victoire (1re : création ; suivantes : compteur et meilleurs scores). */
    async saveWin(profileId: string, chapterId: string, hearts: number, best: BossMedal, at: Date): Promise<void> {
      await db
        .insert(bossRecords)
        .values({ profileId, chapterId, wins: 1, bestHearts: hearts, bestMedal: best, firstWonAt: at })
        .onConflictDoUpdate({
          target: [bossRecords.profileId, bossRecords.chapterId],
          set: {
            wins: sql`${bossRecords.wins} + 1`,
            bestHearts: sql`greatest(${bossRecords.bestHearts}, ${hearts})`,
            bestMedal: best,
          },
        });
    },

    /** Dernières questions posées en combat sur ce chapitre, de la plus ancienne à la plus récente. */
    async recentQuestions(profileId: string, chapterId: string, limit: number) {
      const rows = await db
        .select({ skillId: attempts.skillId, level: attempts.level, seed: attempts.seed })
        .from(attempts)
        .innerJoin(sessions, eq(sessions.id, attempts.sessionId))
        .where(and(eq(attempts.profileId, profileId), eq(sessions.mode, 'boss'), eq(sessions.chapterId, chapterId)))
        .orderBy(desc(attempts.id))
        .limit(limit);
      return rows.reverse();
    },
  };
}
