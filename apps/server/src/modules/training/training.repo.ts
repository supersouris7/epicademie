import { and, asc, eq } from 'drizzle-orm';
import type { SkillState } from '@questeo/engine';
import type { AnswerSubmit, ModeId, SubjectId } from '@questeo/shared';
import type { Executor } from '../../db/client.ts';
import { attempts, sessions, skillStates, type SkillStateRow } from '../../db/schema.ts';

/** Accès aux parties, réponses et états de répétition espacée. */

export const toSkillState = (row: SkillStateRow): SkillState => ({
  skillId: row.skillId,
  stage: row.stage as SkillState['stage'],
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
  readonly battle?: unknown;
}

export interface NewAttempt extends Omit<AnswerSubmit, 'response'> {
  readonly sessionId: string;
  readonly profileId: string;
  readonly response: unknown;
  readonly correct: boolean;
  readonly xp: number;
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
      });
    },

    async skillStates(profileId: string): Promise<SkillState[]> {
      const rows = await db.select().from(skillStates).where(eq(skillStates.profileId, profileId));
      return rows.map(toSkillState);
    },

    async skillState(profileId: string, skillId: string): Promise<SkillState | undefined> {
      const [row] = await db
        .select()
        .from(skillStates)
        .where(and(eq(skillStates.profileId, profileId), eq(skillStates.skillId, skillId)));
      return row && toSkillState(row);
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

export type TrainingRepo = ReturnType<typeof trainingRepo>;
