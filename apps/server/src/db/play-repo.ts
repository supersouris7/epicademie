import { randomUUID } from 'node:crypto';
import { and, asc, eq } from 'drizzle-orm';
import { check, generate, getSkill } from '@questeo/content';
import {
  applySession,
  SERIES_LENGTH,
  coinsForXp,
  levelFromXp,
  newSkillState,
  PERFECT_BONUS,
  rollChest,
  scoreOn20,
  TRAINING_LENGTH,
  xpForAnswer,
  type SkillState,
} from '@questeo/engine';
import type { AnswerResult, AnswerSubmit, SessionCreate, SessionSummary, SkillProgress } from '@questeo/shared';
import type { Db } from './client.ts';
import { addItems } from './inventory.ts';
import { attempts, profiles, sessions, skillStates } from './schema.ts';

export class PlayError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const toState = (row: typeof skillStates.$inferSelect): SkillState => ({
  skillId: row.skillId,
  stage: row.stage as SkillState['stage'],
  due: row.due,
  attempts: row.attempts,
  correct: row.correct,
  recent: row.recent,
  maintained: row.maintained,
  best: row.bestSeries,
});

export function createPlayRepo(db: Db, today: () => string, random: () => number = Math.random) {
  const getSession = (id: string) => db.select().from(sessions).where(eq(sessions.id, id)).get();

  return {
    skills(profileId: string): SkillProgress[] {
      return db.select().from(skillStates).where(eq(skillStates.profileId, profileId)).all().map(toState);
    },

    start(input: SessionCreate): { id: string } {
      const profile = db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, input.profileId)).get();
      if (!profile) throw new PlayError(404, 'Profil introuvable');
      if (input.skillId && !getSkill(input.skillId)) throw new PlayError(400, 'Notion inconnue');
      if (input.mode === 'boss') throw new PlayError(400, 'Le combat de boss se lance par /battles');
      const id = randomUUID();
      db.insert(sessions)
        .values({ id, ...input })
        .run();
      return { id };
    },

    /** Re-génère la question, la corrige et enregistre la réponse (le serveur fait foi). */
    answer(sessionId: string, a: AnswerSubmit): AnswerResult {
      const session = getSession(sessionId);
      if (!session) throw new PlayError(404, 'Partie introuvable');
      if (session.finishedAt) throw new PlayError(409, 'Partie terminée');
      if (session.mode === 'boss') throw new PlayError(409, 'Combat de boss : utiliser /battles');
      if (!getSkill(a.skillId)) throw new PlayError(400, 'Notion inconnue');
      const question = generate(a.skillId, a.level, a.seed);
      const result = check(question, a.response);
      if (result.invalid) return { correct: false, invalid: true, xp: 0 };
      const previous = db
        .select({ correct: attempts.correct })
        .from(attempts)
        .where(eq(attempts.sessionId, sessionId))
        .orderBy(asc(attempts.id))
        .all();
      let streak = 0;
      for (let i = previous.length - 1; i >= 0 && previous[i]?.correct; i--) streak++;
      const xp = xpForAnswer({
        correct: result.correct,
        variant: a.variant,
        durationMs: a.durationMs,
        targetSeconds: question.targetSeconds,
        streak: result.correct ? streak + 1 : 0,
      });
      db.insert(attempts)
        .values({
          sessionId,
          profileId: session.profileId,
          skillId: a.skillId,
          level: a.level,
          seed: a.seed,
          variant: a.variant,
          response: a.response,
          correct: result.correct,
          durationMs: a.durationMs,
          xp,
        })
        .run();
      return { correct: result.correct, invalid: false, xp };
    },

    /** « Je n'ai pas compris » : la notion repassera « à revoir » à la fin de la partie. */
    confused(sessionId: string, skillId: string): void {
      const session = getSession(sessionId);
      if (!session) throw new PlayError(404, 'Partie introuvable');
      if (session.finishedAt) throw new PlayError(409, 'Partie terminée');
      if (!getSkill(skillId)) throw new PlayError(400, 'Notion inconnue');
      if (session.confused.includes(skillId)) return;
      db.update(sessions)
        .set({ confused: [...session.confused, skillId] })
        .where(eq(sessions.id, sessionId))
        .run();
    },

    /** Clôture : répétition espacée par notion, XP et pièces du profil. */
    finish(sessionId: string): SessionSummary {
      return db.transaction((tx) => {
        const session = tx.select().from(sessions).where(eq(sessions.id, sessionId)).get();
        if (!session) throw new PlayError(404, 'Partie introuvable');
        if (session.finishedAt) throw new PlayError(409, 'Partie déjà terminée');
        if (session.mode === 'boss') throw new PlayError(409, 'Combat de boss : utiliser /battles');
        const rows = tx
          .select()
          .from(attempts)
          .where(eq(attempts.sessionId, sessionId))
          .orderBy(asc(attempts.id))
          .all();
        const regular = rows.filter((r) => !r.variant);
        const variants = rows.filter((r) => r.variant);
        const regularCorrect = regular.filter((r) => r.correct).length;
        const perfect = regular.length >= TRAINING_LENGTH && regularCorrect === regular.length;
        const xpGained = rows.reduce((s, r) => s + r.xp, 0) + (perfect ? PERFECT_BONUS : 0);
        const coinsGained = coinsForXp(xpGained);

        const day = today();
        const bySkill = new Map<string, boolean[]>();
        for (const r of rows) bySkill.set(r.skillId, [...(bySkill.get(r.skillId) ?? []), r.correct]);
        const skills = [...bySkill].map(([skillId, answers]) => {
          const row = tx
            .select()
            .from(skillStates)
            .where(and(eq(skillStates.profileId, session.profileId), eq(skillStates.skillId, skillId)))
            .get();
          const before = row ? toState(row) : newSkillState(skillId);
          const correct = answers.filter(Boolean).length;
          // Série complète de 5 sur cette seule notion : ses bonnes réponses du 1er coup fixent la médaille.
          const firsts = regular.filter((r) => r.skillId === skillId);
          const series = firsts.length >= SERIES_LENGTH ? firsts.filter((r) => r.correct).length : undefined;
          const after = applySession(
            before,
            { answered: answers.length, correct },
            day,
            answers,
            session.confused.includes(skillId),
            series,
          );
          const values = {
            stage: after.stage,
            due: after.due,
            attempts: after.attempts,
            correct: after.correct,
            recent: [...after.recent],
            maintained: after.maintained,
            bestSeries: after.best,
            updatedAt: new Date().toISOString(),
          };
          tx.insert(skillStates)
            .values({ profileId: session.profileId, skillId, ...values })
            .onConflictDoUpdate({ target: [skillStates.profileId, skillStates.skillId], set: values })
            .run();
          return {
            skillId,
            answered: answers.length,
            correct,
            stageBefore: before.stage,
            stageAfter: after.stage,
            bestBefore: before.best,
            bestAfter: after.best,
            due: after.due,
          };
        });

        const profile = tx.select().from(profiles).where(eq(profiles.id, session.profileId)).get();
        if (!profile) throw new PlayError(404, 'Profil introuvable');
        // Coffre d'équipement au hasard : plus probable avec un bon score, garanti par un sans-faute.
        const rolled = rollChest(regularCorrect, regular.length, random);
        const chest = rolled ? { ...rolled, items: addItems(tx, profile.id, rolled.items) } : null;
        const chestCoins = chest?.coins ?? 0;
        tx.update(profiles)
          .set({ xp: profile.xp + xpGained, coins: profile.coins + coinsGained + chestCoins })
          .where(eq(profiles.id, profile.id))
          .run();
        tx.update(sessions)
          .set({
            finishedAt: new Date().toISOString(),
            answered: rows.length,
            correct: rows.filter((r) => r.correct).length,
            xp: xpGained,
            coins: coinsGained,
          })
          .where(eq(sessions.id, sessionId))
          .run();

        return {
          regular: { answered: regular.length, correct: regularCorrect },
          variants: { answered: variants.length, correct: variants.filter((r) => r.correct).length },
          scoreOn20: scoreOn20(regularCorrect, regular.length),
          xpGained,
          coinsGained,
          perfect,
          levelBefore: levelFromXp(profile.xp).level,
          levelAfter: levelFromXp(profile.xp + xpGained).level,
          skills,
          chest,
        };
      });
    },
  };
}

export type PlayRepo = ReturnType<typeof createPlayRepo>;
