import { check, generate, getSkill, skillVersion } from '@questeo/content';
import {
  applySession,
  coinsForXp,
  levelFromXp,
  newSkillState,
  PERFECT_BONUS,
  trainingChest,
  defiBonusXp,
  defiChest,
  type DefiKind,
  type SeriesResult,
  scoreOn20,
  seriesLength,
  seriesScore,
  xpForAnswer,
} from '@questeo/engine';
import type {
  AnswerResult,
  Chest,
  AnswerSubmit,
  SessionCreate,
  SessionSkillSummary,
  SessionSummary,
  SkillProgress,
} from '@questeo/shared';
import type { Db, Tx } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import type { Random } from '../../core/random.ts';
import { badRequest, conflict, notFound } from '../../core/errors.ts';
import { PROFILE_NOT_FOUND, profilesRepo } from '../profiles/index.ts';
import { grantChest } from '../inventory/index.ts';
import { trainingRepo } from './training.repo.ts';
import { disabledSkills } from '../pedagogy/index.ts';

/**
 * Entraînement (toutes les parties hors combat de boss).
 *
 * Le serveur fait foi : le client envoie la notion, le niveau, la graine et la réponse ; le
 * serveur régénère la question (générateurs déterministes de @questeo/content), corrige et
 * enregistre. À la fin de la partie : répétition espacée par notion, médailles, XP, pièces et
 * coffre, le tout dans UNE transaction (pas de gain partiel en cas d'erreur).
 */

export const SESSION_NOT_FOUND = 'Partie introuvable';

/** Défi joué (Contre-la-montre, Survie), sinon null. */
const defiOf = (mode: string): DefiKind | null => (mode === 'chrono' || mode === 'survie' ? mode : null);
/** Bonus d'XP de fin : selon le score pour un défi, sinon le bonus du sans-faute. */
const finishBonus = (defi: DefiKind | null, perfect: boolean, correct: number) =>
  defi ? defiBonusXp(correct) : perfect ? PERFECT_BONUS : 0;
const UNKNOWN_SKILL = 'Notion inconnue';
const BOSS_ELSEWHERE = 'Combat de boss : utiliser /battles';

export interface TrainingDeps {
  readonly db: Db;
  readonly clock: Clock;
  readonly random: Random;
  /** Fuseau de la famille (jours de pratique). */
  readonly timeZone: string;
  /** Appelé à chaque partie terminée (métriques). */
  /** Fin de partie : monnaie distribuée (métriques). */
  readonly onFinished?: (rewards: { readonly coins: number; readonly rubies: number }) => void;
}

export function createTrainingService({ db, clock, random, timeZone, onFinished }: TrainingDeps) {
  /**
   * Coffre de fin de série, seulement si toute la série est juste (au 2e essai compris) ; un
   * sans-faute du premier coup améliore le tirage.
   */
  const openChest = async (tx: Tx, profileId: string, series: SeriesResult): Promise<Chest | null> => {
    const rolled = trainingChest(series, random.float);
    return rolled && grantChest(tx, profileId, rolled);
  };

  /** Coffre de fin de défi : selon le nombre de bonnes réponses (aucun sous le minimum). */
  const openDefiChest = async (tx: Tx, profileId: string, kind: DefiKind, correct: number): Promise<Chest | null> => {
    const rolled = defiChest(kind, correct, random.float);
    return rolled && grantChest(tx, profileId, rolled);
  };

  /**
   * Coffre de fin de partie : défi → selon le score ; entraînement → seulement une série complète
   * entièrement juste (une question rattrapée au 2e essai compte comme trouvée).
   */
  const chestOf = async (
    tx: Tx,
    profileId: string,
    p: {
      readonly sessionId: string;
      readonly defi: DefiKind | null;
      readonly regular: readonly { readonly correct: boolean; readonly skillId: string; readonly seed: number }[];
      readonly correct: number;
      readonly complete: boolean;
    },
  ): Promise<Chest | null> => {
    if (p.defi) return openDefiChest(tx, profileId, p.defi, p.correct);
    if (!p.complete) return null;
    const solved = await solvedCount(trainingRepo(tx), p.sessionId, p.regular);
    return openChest(tx, profileId, { total: p.regular.length, solved, firstTry: p.correct });
  };

  /** Questions de la série trouvées : justes du 1er coup, ou rattrapées au 2e essai (indice). */
  const solvedCount = async (
    repo: ReturnType<typeof trainingRepo>,
    sessionId: string,
    regular: readonly { readonly correct: boolean; readonly skillId: string; readonly seed: number }[],
  ) => {
    const secondTries = (await repo.attemptsOf(sessionId)).filter((a) => a.attempt === 2 && a.correct);
    return regular.filter((r) => r.correct || secondTries.some((a) => a.skillId === r.skillId && a.seed === r.seed))
      .length;
  };

  return {
    skills(profileId: string): Promise<SkillProgress[]> {
      return trainingRepo(db).skillProgress(profileId, timeZone);
    },

    async start(input: SessionCreate): Promise<{ id: string }> {
      if (input.mode === 'boss') throw badRequest('Le combat de boss se lance par /battles');
      if (input.skillId && !getSkill(input.skillId)) throw badRequest(UNKNOWN_SKILL);
      if (input.skillId && (await disabledSkills(db)).includes(input.skillId)) {
        throw conflict('Cette notion est en maintenance : choisis-en une autre.');
      }
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
        const previous = await repo.attemptsOf(sessionId);
        // Réponse rejouée (double appui, réseau qui renvoie) : même résultat, rien de compté deux fois.
        const attempt = a.attempt;
        const already = previous.find(
          (p) => p.skillId === a.skillId && p.level === a.level && p.seed === a.seed && p.attempt === attempt,
        );
        if (already) return { correct: already.correct, invalid: false, xp: already.xp };
        const recorded = {
          ...a,
          sessionId,
          profileId: session.profileId,
          correct: result.correct,
          skillVersion: skillVersion(getSkill(a.skillId)),
          diagnosis: result.correct ? null : (result.why ?? null),
        };
        if (a.attempt === 2) {
          // Second essai après l'indice : seulement après une 1re réponse fausse à CETTE question,
          // une seule fois ; enregistré « avec aide », sans XP.
          const same = previous.filter((p) => p.skillId === a.skillId && p.level === a.level && p.seed === a.seed);
          if (!same.some((p) => p.attempt === 1 && !p.correct)) {
            throw conflict('Pas de second essai pour cette question');
          }
          await repo.insertAttempt({ ...recorded, xp: 0, attempt: 2, hinted: true });
          return { correct: result.correct, invalid: false, xp: 0 };
        }
        // Série en cours (premières réponses justes consécutives) : bonus d'XP.
        const firsts = previous.filter((p) => p.attempt === 1);
        let streak = 0;
        for (let i = firsts.length - 1; i >= 0 && firsts[i]?.correct; i--) streak++;
        const xp = xpForAnswer({
          correct: result.correct,
          variant: a.variant,
          durationMs: a.durationMs,
          targetSeconds: question.targetSeconds,
          streak: result.correct ? streak + 1 : 0,
        });
        await repo.insertAttempt({ ...recorded, xp, attempt: 1 });
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

        // Score, médailles et répétition espacée : premières réponses seulement.
        const rows = await repo.firstAttemptsOf(sessionId);
        const regular = rows.filter((r) => !r.variant);
        const variants = rows.filter((r) => r.variant);
        const regularCorrect = regular.filter((r) => r.correct).length;
        // Série de 5 en calcul de tête (toutes les notions « mental »), sinon de 4.
        const length = seriesLength(regular.every((r) => getSkill(r.skillId)?.mental === true));
        const perfect = regular.length >= length && regularCorrect === regular.length;
        // Défis : bonus de fin selon le score (le sans-faute n'y a pas de sens, la série est sans fin).
        const defi = defiOf(session.mode);
        const bonus = finishBonus(defi, perfect, regularCorrect);
        const xpGained = rows.reduce((s, r) => s + r.xp, 0) + bonus;
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

        // Coffre d'équipement : seulement pour une série complète entièrement juste (une question
        // ratée puis trouvée avec l'indice compte comme trouvée).
        const profiles = profilesRepo(tx);
        const profile = await profiles.findForUpdate(session.profileId);
        if (!profile) throw notFound(PROFILE_NOT_FOUND);
        const chest = await chestOf(tx, profile.id, {
          sessionId,
          defi,
          regular,
          correct: regularCorrect,
          complete: regular.length >= length,
        });
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
          chest: chest?.rarity ?? null,
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
      onFinished?.({ coins: summary.coinsGained + (summary.chest?.coins ?? 0), rubies: summary.chest?.rubies ?? 0 });
      return summary;
    },
  };
}

export type TrainingService = ReturnType<typeof createTrainingService>;
