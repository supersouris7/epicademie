import { check, generate, getSkill } from '@questeo/content';
import {
  applySession,
  coinsForXp,
  levelFromXp,
  newSkillState,
  PERFECT_BONUS,
  rollChest,
  scoreOn20,
  seriesLength,
  seriesScore,
  xpForAnswer,
} from '@questeo/engine';
import type {
  AnswerResult,
  AnswerSubmit,
  SessionCreate,
  SessionSkillSummary,
  SessionSummary,
  SkillProgress,
} from '@questeo/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import type { Random } from '../../core/random.ts';
import { badRequest, conflict, notFound } from '../../core/errors.ts';
import { PROFILE_NOT_FOUND, profilesRepo } from '../profiles/index.ts';
import { inventoryRepo } from '../inventory/index.ts';
import { trainingRepo } from './training.repo.ts';

/**
 * Entraînement (toutes les parties hors combat de boss).
 *
 * Le serveur fait foi : le client envoie la notion, le niveau, la graine et la réponse ; le
 * serveur régénère la question (générateurs déterministes de @questeo/content), corrige et
 * enregistre. À la fin de la partie : répétition espacée par notion, médailles, XP, pièces et
 * coffre, le tout dans UNE transaction (pas de gain partiel en cas d'erreur).
 */

export const SESSION_NOT_FOUND = 'Partie introuvable';
const UNKNOWN_SKILL = 'Notion inconnue';
const BOSS_ELSEWHERE = 'Combat de boss : utiliser /battles';

export interface TrainingDeps {
  readonly db: Db;
  readonly clock: Clock;
  readonly random: Random;
  /** Appelé à chaque partie terminée (métriques). */
  readonly onFinished?: () => void;
}

export function createTrainingService({ db, clock, random, onFinished }: TrainingDeps) {
  return {
    skills(profileId: string): Promise<SkillProgress[]> {
      return trainingRepo(db).skillStates(profileId);
    },

    async start(input: SessionCreate): Promise<{ id: string }> {
      if (input.mode === 'boss') throw badRequest('Le combat de boss se lance par /battles');
      if (input.skillId && !getSkill(input.skillId)) throw badRequest(UNKNOWN_SKILL);
      if (!(await profilesRepo(db).exists(input.profileId))) throw notFound(PROFILE_NOT_FOUND);
      return { id: await trainingRepo(db).insertSession(input) };
    },

    /** Re-génère la question, la corrige et enregistre la réponse. */
    answer(sessionId: string, a: AnswerSubmit): Promise<AnswerResult> {
      if (!getSkill(a.skillId)) throw badRequest(UNKNOWN_SKILL);
      return db.transaction(async (tx) => {
        const repo = trainingRepo(tx);
        const session = await repo.findSessionForUpdate(sessionId);
        if (!session) throw notFound(SESSION_NOT_FOUND);
        if (session.finishedAt) throw conflict('Partie terminée');
        if (session.mode === 'boss') throw conflict(BOSS_ELSEWHERE);
        const question = generate(a.skillId, a.level, a.seed);
        const result = check(question, a.response);
        if (result.invalid) return { correct: false, invalid: true, xp: 0 };
        // Série en cours (bonnes réponses consécutives) : bonus d'XP.
        const previous = await repo.attemptsOf(sessionId);
        let streak = 0;
        for (let i = previous.length - 1; i >= 0 && previous[i]?.correct; i--) streak++;
        const xp = xpForAnswer({
          correct: result.correct,
          variant: a.variant,
          durationMs: a.durationMs,
          targetSeconds: question.targetSeconds,
          streak: result.correct ? streak + 1 : 0,
        });
        await repo.insertAttempt({ ...a, sessionId, profileId: session.profileId, correct: result.correct, xp });
        return { correct: result.correct, invalid: false, xp };
      });
    },

    /** « Je n'ai pas compris » : la notion repassera « à revoir » à la fin de la partie. */
    async confused(sessionId: string, skillId: string): Promise<void> {
      if (!getSkill(skillId)) throw badRequest(UNKNOWN_SKILL);
      await db.transaction(async (tx) => {
        const repo = trainingRepo(tx);
        const session = await repo.findSessionForUpdate(sessionId);
        if (!session) throw notFound(SESSION_NOT_FOUND);
        if (session.finishedAt) throw conflict('Partie terminée');
        if (session.confused.includes(skillId)) return;
        await repo.updateSession(sessionId, { confused: [...session.confused, skillId] });
      });
    },

    /** Clôture : répétition espacée par notion, XP, pièces et coffre. */
    async finish(sessionId: string): Promise<SessionSummary> {
      const summary = await db.transaction(async (tx) => {
        const repo = trainingRepo(tx);
        const session = await repo.findSessionForUpdate(sessionId);
        if (!session) throw notFound(SESSION_NOT_FOUND);
        if (session.finishedAt) throw conflict('Partie déjà terminée');
        if (session.mode === 'boss') throw conflict(BOSS_ELSEWHERE);

        const rows = await repo.attemptsOf(sessionId);
        const regular = rows.filter((r) => !r.variant);
        const variants = rows.filter((r) => r.variant);
        const regularCorrect = regular.filter((r) => r.correct).length;
        // Série de 5 en calcul de tête (toutes les notions « mental »), sinon de 4.
        const length = seriesLength(regular.every((r) => getSkill(r.skillId)?.mental === true));
        const perfect = regular.length >= length && regularCorrect === regular.length;
        const xpGained = rows.reduce((s, r) => s + r.xp, 0) + (perfect ? PERFECT_BONUS : 0);
        const coinsGained = coinsForXp(xpGained);

        // Répétition espacée : une mise à jour par notion jouée.
        const day = clock.today();
        const bySkill = new Map<string, boolean[]>();
        for (const r of rows) bySkill.set(r.skillId, [...(bySkill.get(r.skillId) ?? []), r.correct]);
        const skills: SessionSkillSummary[] = [];
        const states = await repo.skillStatesOf(session.profileId, [...bySkill.keys()]);
        for (const [skillId, answers] of bySkill) {
          const before = states.get(skillId) ?? newSkillState(skillId);
          const correct = answers.filter(Boolean).length;
          // Série complète sur cette seule notion : ses erreurs du 1er coup fixent la médaille.
          const firsts = regular.filter((r) => r.skillId === skillId);
          const series =
            firsts.length >= length ? seriesScore(firsts.filter((r) => r.correct).length, firsts.length) : undefined;
          const after = applySession(before, { answered: answers.length, correct }, day, {
            answers,
            forceFail: session.confused.includes(skillId),
            series,
          });
          await repo.saveSkillState(session.profileId, after);
          skills.push({
            skillId,
            answered: answers.length,
            correct,
            stageBefore: before.stage,
            stageAfter: after.stage,
            bestBefore: before.best,
            bestAfter: after.best,
            due: after.due,
          });
        }

        // Coffre d'équipement garanti à chaque série terminée (meilleure rareté sans faute) ;
        // une partie close sans aucune réponse n'en donne pas.
        const profiles = profilesRepo(tx);
        const profile = await profiles.findForUpdate(session.profileId);
        if (!profile) throw notFound(PROFILE_NOT_FOUND);
        const rolled = regular.length > 0 ? rollChest(regularCorrect, regular.length, random.float) : null;
        const chest = rolled ? { ...rolled, items: await inventoryRepo(tx).add(profile.id, rolled.items) } : null;
        await profiles.credit(profile.id, {
          xp: xpGained,
          coins: coinsGained + (chest?.coins ?? 0),
          rubies: chest?.rubies ?? 0,
        });
        await repo.updateSession(sessionId, {
          finishedAt: clock.now(),
          answered: rows.length,
          correct: rows.filter((r) => r.correct).length,
          xp: xpGained,
          coins: coinsGained,
        });

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
      onFinished?.();
      return summary;
    },
  };
}

export type TrainingService = ReturnType<typeof createTrainingService>;
