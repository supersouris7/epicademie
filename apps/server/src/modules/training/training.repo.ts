import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { toStage, type SkillState } from '@questeo/engine';
import type { AnswerSubmit, ModeId, SkillProgress, SubjectId } from '@questeo/shared';
import type { Executor } from '../../db/client.ts';
import { attempts, chapterRewards, sessions, skillStates, type SkillStateRow } from '../../db/schema.ts';

/** Accès aux parties, réponses et états de répétition espacée. */

const toSkillState = (row: SkillStateRow): SkillState => ({
  skillId: row.skillId,
  stage: toStage(row.stage),
  due: row.due,
  attempts: row.attempts,
  correct: row.correct,
  recent: row.recent,
  maintained: row.maintained,
  best: row.bestSeries,
});

export interface NewSession {
  readonly profileId: string;
  readonly mode: ModeId;
  readonly subject: SubjectId;
  readonly chapterId: string;
  readonly skillId: string | null;
  /** Épreuve du chapitre. */
  readonly epreuve?: boolean;
  /** État d'un combat de boss, déjà mis au format stocké par le module « combats ». */
  readonly battle?: unknown;
}

export interface NewAttempt extends Omit<AnswerSubmit, 'response' | 'attempt'> {
  readonly sessionId: string;
  readonly profileId: string;
  readonly response: unknown;
  readonly correct: boolean;
  readonly xp: number;
  readonly attempt?: 1 | 2;
  readonly hinted?: boolean;
  readonly collective?: boolean;
  readonly skillVersion: number;
  readonly diagnosis?: string | null;
}

export function trainingRepo(db: Executor) {
  return {
    async insertSession(s: NewSession): Promise<string> {
      const [row] = await db.insert(sessions).values(s).returning({ id: sessions.id });
      if (!row) throw new Error('insertion de partie sans retour');
      return row.id;
    },

    async findSession(id: string) {
      const [row] = await db.select().from(sessions).where(eq(sessions.id, id));
      return row;
    },

    /** Verrouille la partie jusqu'à la fin de la transaction : deux requêtes simultanées
     *  sur la même partie (double clic, réseau qui rejoue) s'exécutent l'une après l'autre. */
    async findSessionForUpdate(id: string) {
      const [row] = await db.select().from(sessions).where(eq(sessions.id, id)).for('update');
      return row;
    },

    async updateSession(id: string, patch: Partial<typeof sessions.$inferInsert>): Promise<void> {
      await db.update(sessions).set(patch).where(eq(sessions.id, id));
    },

    /** Réponses d'une partie, dans l'ordre. */
    attemptsOf(sessionId: string) {
      return db.select().from(attempts).where(eq(attempts.sessionId, sessionId)).orderBy(asc(attempts.id));
    },

    async insertAttempt(a: NewAttempt): Promise<void> {
      await db.insert(attempts).values({
        sessionId: a.sessionId,
        profileId: a.profileId,
        skillId: a.skillId,
        level: a.level,
        seed: a.seed,
        variant: a.variant,
        response: a.response,
        correct: a.correct,
        durationMs: a.durationMs,
        xp: a.xp,
        attempt: a.attempt ?? 1,
        hinted: a.hinted ?? false,
        collective: a.collective ?? false,
        skillVersion: a.skillVersion,
        // Texte de correction tronqué : sert à compter les erreurs récurrentes.
        diagnosis: a.diagnosis?.slice(0, 300) ?? null,
      });
    },

    /** Premières réponses d'une partie, dans l'ordre (les seconds essais ne comptent pas au score). */
    firstAttemptsOf(sessionId: string) {
      return db
        .select()
        .from(attempts)
        .where(and(eq(attempts.sessionId, sessionId), eq(attempts.attempt, 1)))
        .orderBy(asc(attempts.id));
    },

    /**
     * Enregistre la validation du chapitre ; false si le profil l'avait déjà validé (la clé
     * primaire garantit une seule récompense, même avec deux requêtes simultanées).
     */
    async insertChapterReward(profileId: string, chapterId: string, sessionId: string): Promise<boolean> {
      const rows = await db
        .insert(chapterRewards)
        .values({ profileId, chapterId, sessionId })
        .onConflictDoNothing()
        .returning({ chapterId: chapterRewards.chapterId });
      return rows.length > 0;
    },

    async chapterTrophies(profileId: string) {
      const rows = await db
        .select({ chapterId: chapterRewards.chapterId, obtainedAt: chapterRewards.obtainedAt })
        .from(chapterRewards)
        .where(eq(chapterRewards.profileId, profileId))
        .orderBy(asc(chapterRewards.obtainedAt));
      return rows.map((r) => ({ chapterId: r.chapterId, obtainedAt: r.obtainedAt.toISOString() }));
    },

    /** Progression par notion, avec le jour de dernière pratique (fuseau de la famille). */
    async skillProgress(profileId: string, timeZone: string): Promise<SkillProgress[]> {
      const rows = await db
        .select({
          row: skillStates,
          day: sql<string>`to_char(${skillStates.updatedAt} at time zone ${timeZone}, 'YYYY-MM-DD')`,
        })
        .from(skillStates)
        .where(eq(skillStates.profileId, profileId));
      return rows.map(({ row, day }) => ({ ...toSkillState(row), lastPracticed: day }));
    },

    async skillStates(profileId: string): Promise<SkillState[]> {
      const rows = await db.select().from(skillStates).where(eq(skillStates.profileId, profileId));
      return rows.map(toSkillState);
    },

    /** États des notions demandées (celles jamais jouées sont absentes), en une requête. */
    async skillStatesOf(profileId: string, skillIds: readonly string[]): Promise<Map<string, SkillState>> {
      if (skillIds.length === 0) return new Map();
      const rows = await db
        .select()
        .from(skillStates)
        .where(and(eq(skillStates.profileId, profileId), inArray(skillStates.skillId, [...skillIds])));
      return new Map(rows.map((r) => [r.skillId, toSkillState(r)]));
    },

    async saveSkillState(profileId: string, s: SkillState): Promise<void> {
      const values = {
        stage: s.stage,
        due: s.due,
        attempts: s.attempts,
        correct: s.correct,
        recent: [...s.recent],
        maintained: s.maintained,
        bestSeries: s.best,
        updatedAt: new Date(),
      };
      await db
        .insert(skillStates)
        .values({ profileId, skillId: s.skillId, ...values })
        .onConflictDoUpdate({ target: [skillStates.profileId, skillStates.skillId], set: values });
    },
  };
}
