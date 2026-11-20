import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import type { ReportCreate, ReportStatus } from '@questeo/shared';
import type { Executor } from '../../db/client.ts';
import { contentEvents, contentStates, questionReports } from '../../db/schema.ts';

/** Accès aux signalements, aux états des notions et à leur historique. */
export function pedagogyRepo(db: Executor) {
  return {
    async insertReport(r: ReportCreate & { familyId: string; skillVersion: number }): Promise<string> {
      const [row] = await db
        .insert(questionReports)
        .values({
          familyId: r.familyId,
          profileId: r.profileId,
          skillId: r.skillId,
          level: r.level,
          seed: r.seed,
          skillVersion: r.skillVersion,
          reason: r.reason,
          comment: r.comment ?? null,
        })
        .returning({ id: questionReports.id });
      if (!row) throw new Error('signalement sans retour');
      return row.id;
    },

    reports(status: ReportStatus) {
      return db
        .select()
        .from(questionReports)
        .where(eq(questionReports.status, status))
        .orderBy(desc(questionReports.createdAt))
        .limit(500);
    },

    async updateReport(id: string, status: ReportStatus, adminNote: string | undefined, at: Date) {
      const [row] = await db
        .update(questionReports)
        .set({
          status,
          ...(adminNote !== undefined ? { adminNote } : {}),
          resolvedAt: status === 'resolu' || status === 'rejete' ? at : null,
        })
        .where(eq(questionReports.id, id))
        .returning();
      return row;
    },

    /** Signalements ouverts (nouveaux ou en cours) par notion. */
    async openReportCounts(): Promise<Map<string, number>> {
      const rows = await db
        .select({ skillId: questionReports.skillId, n: sql<number>`count(*)::int` })
        .from(questionReports)
        .where(inArray(questionReports.status, ['nouveau', 'en-cours']))
        .groupBy(questionReports.skillId);
      return new Map(rows.map((r) => [r.skillId, r.n]));
    },

    async states() {
      return db.select().from(contentStates);
    },

    async disabledSkills(): Promise<string[]> {
      const rows = await db
        .select({ skillId: contentStates.skillId })
        .from(contentStates)
        .where(eq(contentStates.disabled, true));
      return rows.map((r) => r.skillId);
    },

    async upsertState(skillId: string, patch: { disabled?: boolean; reviewedVersion?: number }, at: Date) {
      await db
        .insert(contentStates)
        .values({ skillId, ...patch, updatedAt: at })
        .onConflictDoUpdate({ target: contentStates.skillId, set: { ...patch, updatedAt: at } });
    },

    async addEvent(e: typeof contentEvents.$inferInsert) {
      await db.insert(contentEvents).values(e);
    },

    history(skillId: string) {
      return db
        .select()
        .from(contentEvents)
        .where(and(eq(contentEvents.skillId, skillId)))
        .orderBy(desc(contentEvents.at), desc(contentEvents.id));
    },
  };
}

/** Notions désactivées (lu par l'entraînement et les combats). */
export const disabledSkills = (db: Executor) => pedagogyRepo(db).disabledSkills();
