import type { CheckResult, Question, Response } from '@questeo/content';
import { recordAnswer, xpForAnswer, type PlannedQuestion, type TrainingState } from '@questeo/engine';
import type { SessionSummary } from '@questeo/shared';
import type { HeroLine, HeroMoment } from '../../shared/lib/dialogue.ts';
import type { SoundName } from '../../shared/lib/sound.ts';
import { formatAnswer } from '../../shared/question/answers.ts';
import type { Missed } from './types.ts';

/**
 * État de l'écran d'entraînement et ses transitions (fonction `reducer` pure).
 *
 * La série (questions prévues, niveaux adaptés, variantes) suit les règles de @questeo/engine ;
 * ce module ajoute ce que l'écran en fait : question affichée, 2e essai avec indice, correction,
 * série de bonnes réponses, XP gagnée, réaction du héros. Tirages, sons et appels au serveur
 * sont dans `useTraining.ts` ; l'affichage dans `TrainingPlay.tsx`.
 */

/** Question affichée. */
export interface Current {
  readonly plan: PlannedQuestion;
  readonly question: Question;
  /** Conseil d'outil de Questy : seulement à la 1re question de chaque notion (pas de radotage). */
  readonly advise: boolean;
}

/** Correction affichée après la réponse (ou après le 2e essai). */
export interface Answered {
  readonly correct: boolean;
  /** Bonne réponse trouvée au 2e essai, grâce à l'indice. */
  readonly retried?: boolean;
  readonly why?: string;
  /** Dernière réponse donnée (affichée dans l'explication). */
  readonly given?: Response;
  readonly xp: number;
  readonly streak: number;
}

/** 1re erreur : Questy dit ce qui cloche et donne un indice, l'enfant réessaie la même question. */
export interface Retry {
  readonly why?: string;
  /** Option de QCM déjà essayée (grisée au 2e essai). */
  readonly excluded?: number;
  /** Identifiant de l'essai (relance l'animation et remet les outils à zéro). */
  readonly nonce: number;
}

/** Réaction du héros en haut de l'écran ; `nonce` relance l'animation de la bulle. */
export interface HeroReaction extends HeroLine {
  readonly nonce: number;
}

export interface TrainingScreen {
  readonly training: TrainingState;
  readonly sessionId: string | null;
  readonly current: Current | null;
  readonly answered: Answered | null;
  readonly retry: Retry | null;
  /** Nœud choisi sur une figure (réponse « point »). */
  readonly picked: { readonly x: number; readonly y: number } | null;
  /** Questions ratées (récapitulatif de fin). */
  readonly missed: readonly Missed[];
  /** Bonnes réponses d'affilée (bonus d'XP). */
  readonly streak: number;
  readonly xpTotal: number;
  readonly hero: HeroReaction;
  readonly summary: SessionSummary | null;
  readonly error: string | null;
  /** Compteur des 2es essais (identifiants). */
  readonly retries: number;
}

export const initialTrainingScreen = (training: TrainingState, hello: HeroLine): TrainingScreen => ({
  training,
  sessionId: null,
  current: null,
  answered: null,
  retry: null,
  picked: null,
  missed: [],
  streak: 0,
  xpTotal: 0,
  hero: { ...hello, nonce: 1 },
  summary: null,
  error: null,
  retries: 0,
});

export type TrainingEvent =
  | { readonly type: 'started'; readonly sessionId: string }
  | { readonly type: 'drawn'; readonly current: Current; readonly lastOne: boolean }
  | {
      readonly type: 'answered';
      readonly result: CheckResult;
      readonly response: Response;
      readonly durationMs: number;
    }
  | { readonly type: 'picked'; readonly point: { readonly x: number; readonly y: number } | null }
  | { readonly type: 'finishing' }
  | { readonly type: 'finished'; readonly summary: SessionSummary }
  | { readonly type: 'failed'; readonly error: string };

/** Un 2e essai n'a pas de sens quand il ne reste qu'une option (Vrai / Faux, < / >…). */
export const canRetry = (q: Question) => q.answer.kind !== 'choice' || q.answer.options.length > 2;

/** Série de bonnes réponses après cette réponse (inchangée pour un 2e essai, qui ne compte pas). */
const streakAfter = (s: TrainingScreen, correct: boolean) => (correct ? s.streak + 1 : 0);

/** Son de la réponse : combo toutes les 5 bonnes réponses d'affilée (hors 2e essai). */
export function answerSound(s: TrainingScreen, correct: boolean): SoundName {
  if (!correct) return 'wrong';
  if (s.retry) return 'correct';
  const streak = streakAfter(s, true);
  return streak % 5 === 0 ? 'combo' : 'correct';
}

/** La réponse est la 1re à cette question (elle compte et part au serveur) ; un 2e essai, non. */
export const isFirstAttempt = (s: TrainingScreen) => s.retry === null;

export function createTrainingReducer(heroSays: (moment: HeroMoment) => HeroLine) {
  const react = (s: TrainingScreen, moment: HeroMoment): TrainingScreen => ({
    ...s,
    hero: { ...heroSays(moment), nonce: s.hero.nonce + 1 },
  });

  /** 2e essai : il ne compte pas dans le score (la 1re réponse est déjà enregistrée), il sert à apprendre. */
  const secondAttempt = (s: TrainingScreen, result: CheckResult, given: Response): TrainingScreen => ({
    ...react(s, result.correct ? 'retried' : 'wrong'),
    answered: { correct: result.correct, retried: true, why: result.why, given, xp: 0, streak: 0 },
    // Erreur corrigée seul avec l'indice : pas besoin d'une question similaire.
    training: result.correct ? { ...s.training, pendingVariant: null } : s.training,
  });

  const firstAttempt = (
    s: TrainingScreen,
    current: Current,
    { result, response, durationMs }: Extract<TrainingEvent, { type: 'answered' }>,
  ): TrainingScreen => {
    const { correct, why } = result;
    const streak = streakAfter(s, correct);
    const xp = xpForAnswer({
      correct,
      variant: current.plan.variant,
      durationMs,
      targetSeconds: current.question.targetSeconds,
      streak,
    });
    const reacted = react(s, correct ? (streak >= 3 ? 'streak' : 'correct') : 'wrong');
    const scored: TrainingScreen = {
      ...reacted,
      streak,
      xpTotal: s.xpTotal + xp,
      missed: correct
        ? s.missed
        : [...s.missed, { prompt: current.question.prompt, answer: formatAnswer(current.question) }],
      training: recordAnswer(s.training, current.plan, correct),
    };
    if (!correct && canRetry(current.question)) {
      const nonce = s.retries + 1;
      const excluded = response.kind === 'choice' ? response.index : undefined;
      return { ...scored, retry: { why, excluded, nonce }, retries: nonce, picked: null };
    }
    return { ...scored, answered: { correct, why, given: response, xp, streak } };
  };

  return function reducer(s: TrainingScreen, e: TrainingEvent): TrainingScreen {
    switch (e.type) {
      case 'started':
        return { ...s, sessionId: e.sessionId };
      case 'drawn': {
        const drawn = { ...s, current: e.current, answered: null, retry: null, picked: null };
        return e.lastOne ? react(drawn, 'lastOne') : drawn;
      }
      case 'answered':
        // Réponse ignorée sans question, ou une fois la correction affichée.
        if (!s.current || s.answered) return s;
        return s.retry ? secondAttempt(s, e.result, e.response) : firstAttempt(s, s.current, e);
      case 'picked':
        return { ...s, picked: e.point };
      case 'finishing':
        return { ...s, current: null };
      case 'finished':
        return { ...s, summary: e.summary };
      case 'failed':
        return { ...s, error: e.error };
    }
  };
}
