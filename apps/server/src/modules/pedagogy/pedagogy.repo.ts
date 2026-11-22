import { and, desc, eq, gte, inArray, isNull, sql } from 'drizzle-orm';
import type { ReportReason, ReportStatus } from '@questeo/shared';
import type { Executor } from '../../db/client.ts';
import { contentEvents, contentStates, profiles, questionReports } from '../../db/schema.ts';

/** Accès aux signalements, aux états des notions et à leur historique. */
export function pedagogyRepo(db: Executor) {
  return {
    async insertReport(r: {
      familyId: string;
      profileId?: string;
      reason: ReportReason;
      comment: string | null;
      question?: { skillId: string; level: number; seed: number; skillVersion: number };
      general?: { screen: string; appVersion: string };
    }): Promise<string> {
      const [row] = await db
        .insert(questionReports)
        .values({
          familyId: r.familyId,
          profileId: r.profileId ?? null,
          kind: r.question ? 'question' : 'general',
          ...(r.question ?? {}),
          ...(r.general ?? {}),
          reason: r.reason,
          comment: r.comment,
        })
        .returning({ id: questionReports.id });
      if (!row) throw new Error('signalement sans retour');
      return row.id;
    },

    /** Signalements d'une famille depuis une date (quota quotidien). */
    async countSince(familyId: string, since: Date): Promise<number> {
      const [row] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(questionReports)
        .where(and(eq(questionReports.familyId, familyId), gte(questionReports.createdAt, since)));
      return row?.n ?? 0;
    },

    /** Pseudos des profils d'une famille (pour masquer les noms dans les commentaires). */
    async familyNames(familyId: string): Promise<string[]> {
      const rows = await db.select({ name: profiles.name }).from(profiles).where(eq(profiles.familyId, familyId));
      return rows.map((r) => r.name);
    },

    /** Signalements pas encore exportés (du plus ancien au plus récent). */
    pendingExport() {
      return db
        .select()
        .from(questionReports)
        .where(isNull(questionReports.exportedAt))
        .orderBy(questionReports.createdAt)
        .limit(5000);
    },

    async markExported(ids: readonly string[], at: Date): Promise<number> {
      if (ids.length === 0) return 0;
      const rows = await db
        .update(questionReports)
        .set({ exportedAt: at })
        .where(inArray(questionReports.id, [...ids]))
        .returning({ id: questionReports.id });
      return rows.length;
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
      return new Map(rows.flatMap((r) => (r.skillId ? [[r.skillId, r.n] as const] : [])));
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
