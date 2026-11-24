import { and, desc, eq, gte, lt, ne, sql } from 'drizzle-orm';
import type { Observation } from '@epicademie/engine';
import type { CompetenceState, EvaluationKind, EvaluationRole, StudiedStatus, SubjectId } from '@epicademie/shared';
import type { Executor } from '../../db/client.ts';
import { dayIn } from '../../core/clock.ts';
import {
  attempts,
  evaluationCompetences,
  evaluations,
  sessions,
  studiedChapters,
  type EvaluationRow,
} from '../../db/schema.ts';

/** Accès aux épreuves, bilans figés, chapitres déclarés et observations (ADR 0030). */

/** Source d'une observation d'après le mode de la partie (§3.1). */
export const sourceOf = (mode: string): Observation['source'] => {
  switch (mode) {
    case 'evaluation':
      return 'evaluation';
    case 'entrainement':
    case 'boss':
    case 'chrono':
    case 'survie':
      return 'solo';
    case 'arene':
      return 'versus';
    default:
      return 'none';
  }
};

export interface NewEvaluation {
  readonly profileId: string;
  readonly sessionId: string;
  readonly subject: SubjectId;
  readonly kind: EvaluationKind;
  readonly profileGrade: string;
  readonly referentialGrade: string;
  readonly referentialVersion: number;
  readonly schoolYear: number;
  readonly state: unknown;
}

export interface CompetenceRowInput {
  readonly competenceId: string;
  readonly role: EvaluationRole;
  readonly domain: string;
  readonly essential: boolean;
  readonly state: CompetenceState;
  readonly rate: number | null;
  readonly weight: number;
  readonly arenaAnswers: number;
  readonly weakestSkillId: string | null;
}

export function evaluationRepo(db: Executor) {
  return {
    async insert(e: NewEvaluation): Promise<string> {
      const [row] = await db.insert(evaluations).values(e).returning({ id: evaluations.id });
      if (!row) throw new Error('insertion d’épreuve sans retour');
      return row.id;
    },

    async find(id: string): Promise<EvaluationRow | undefined> {
      const [row] = await db.select().from(evaluations).where(eq(evaluations.id, id));
      return row;
    },

    /** Verrouille l'épreuve jusqu'à la fin de la transaction (réponses et clôture rejouées). */
    async findForUpdate(id: string): Promise<EvaluationRow | undefined> {
      const [row] = await db.select().from(evaluations).where(eq(evaluations.id, id)).for('update');
      return row;
    },

    async open(profileId: string, subject: SubjectId): Promise<EvaluationRow | undefined> {
      const [row] = await db
        .select()
        .from(evaluations)
        .where(
          and(
            eq(evaluations.profileId, profileId),
            eq(evaluations.subject, subject),
            eq(evaluations.status, 'en-cours'),
          ),
        );
      return row;
    },

    async update(id: string, patch: Partial<typeof evaluations.$inferInsert>): Promise<void> {
      await db.update(evaluations).set(patch).where(eq(evaluations.id, id));
    },

    /** Bilans terminés d'une matière, du plus récent au plus ancien. */
    finished(profileId: string, subject?: SubjectId) {
      return db
        .select()
        .from(evaluations)
        .where(
          and(
            eq(evaluations.profileId, profileId),
            eq(evaluations.status, 'terminee'),
            subject ? eq(evaluations.subject, subject) : undefined,
          ),
        )
        .orderBy(desc(evaluations.finishedAt));
    },

    /** Bilan comparable précédent : même matière, classe et version de référentiel. */
    async previousComparable(e: EvaluationRow): Promise<EvaluationRow | undefined> {
      const [row] = await db
        .select()
        .from(evaluations)
        .where(
          and(
            eq(evaluations.profileId, e.profileId),
            eq(evaluations.status, 'terminee'),
            eq(evaluations.subject, e.subject),
            eq(evaluations.referentialGrade, e.referentialGrade),
            eq(evaluations.referentialVersion, e.referentialVersion),
            ne(evaluations.id, e.id),
            e.finishedAt ? lt(evaluations.finishedAt, e.finishedAt) : undefined,
          ),
        )
        .orderBy(desc(evaluations.finishedAt))
        .limit(1);
      return row;
    },

    async insertCompetences(evaluationId: string, rows: readonly CompetenceRowInput[]): Promise<void> {
      if (rows.length === 0) return;
      await db.insert(evaluationCompetences).values(rows.map((r) => ({ ...r, evaluationId })));
    },

    competencesOf(evaluationId: string) {
      return db.select().from(evaluationCompetences).where(eq(evaluationCompetences.evaluationId, evaluationId));
    },

    /** Compétences déjà « maîtrisées » dans un bilan terminé de l'année scolaire (récompense de progrès). */
    async masteredThisYear(profileId: string, subject: SubjectId, schoolYear: number): Promise<Set<string>> {
      const rows = await db
        .select({ id: evaluationCompetences.competenceId })
        .from(evaluationCompetences)
        .innerJoin(evaluations, eq(evaluations.id, evaluationCompetences.evaluationId))
        .where(
          and(
            eq(evaluations.profileId, profileId),
            eq(evaluations.subject, subject),
            eq(evaluations.schoolYear, schoolYear),
            eq(evaluations.status, 'terminee'),
            eq(evaluationCompetences.role, 'score'),
            eq(evaluationCompetences.state, 'maitrisee'),
          ),
        );
      return new Set(rows.map((r) => r.id));
    },

    async studied(profileId: string, schoolYear: number): Promise<Map<string, StudiedStatus>> {
      const rows = await db
        .select({ id: studiedChapters.chapterId, status: studiedChapters.status })
        .from(studiedChapters)
        .where(and(eq(studiedChapters.profileId, profileId), eq(studiedChapters.schoolYear, schoolYear)));
      return new Map(rows.map((r) => [r.id, r.status]));
    },

    async saveStudied(
      profileId: string,
      schoolYear: number,
      chapters: readonly { chapterId: string; status: StudiedStatus }[],
    ): Promise<void> {
      for (const c of chapters) {
        await db
          .insert(studiedChapters)
          .values({ profileId, schoolYear, chapterId: c.chapterId, status: c.status })
          .onConflictDoUpdate({
            target: [studiedChapters.profileId, studiedChapters.schoolYear, studiedChapters.chapterId],
            set: { status: c.status, updatedAt: sql`now()` },
          });
      }
    },

    /**
     * Premières réponses individuelles sans aide des 180 derniers jours (§3.1), les plus anciennes
     * d'abord. Second essai, indice et réponses collectives n'en sont jamais.
     */
    async observations(
      profileId: string,
      since: Date,
      timeZone: string,
    ): Promise<{ skillId: string; observation: Observation }[]> {
      const rows = await db
        .select({
          skillId: attempts.skillId,
          correct: attempts.correct,
          level: attempts.level,
          createdAt: attempts.createdAt,
          mode: sessions.mode,
        })
        .from(attempts)
        .innerJoin(sessions, eq(sessions.id, attempts.sessionId))
        .where(
          and(
            eq(attempts.profileId, profileId),
            eq(attempts.attempt, 1),
            eq(attempts.hinted, false),
            eq(attempts.collective, false),
            gte(attempts.createdAt, since),
          ),
        )
        .orderBy(desc(attempts.createdAt))
        .limit(6000);
      return rows.reverse().map((r) => ({
        skillId: r.skillId,
        observation: {
          skillId: r.skillId,
          source: sourceOf(r.mode),
          correct: r.correct,
          level: r.level === 3 ? 3 : r.level === 2 ? 2 : 1,
          day: dayIn(timeZone, r.createdAt),
        },
      }));
    },

    /** Graines déjà posées à ce profil sur ces notions depuis `since` (anti-répétition). */
    async seeds(profileId: string, skillId: string, since: Date): Promise<Set<number>> {
      const rows = await db
        .select({ seed: attempts.seed })
        .from(attempts)
        .where(and(eq(attempts.profileId, profileId), eq(attempts.skillId, skillId), gte(attempts.createdAt, since)));
      return new Set(rows.map((r) => r.seed));
    },

    attemptsOf(sessionId: string) {
      return db.select().from(attempts).where(eq(attempts.sessionId, sessionId)).orderBy(attempts.id);
    },
  };
}
