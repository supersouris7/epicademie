import type { Level } from '@questeo/content';

/** Défis (docs/adr/0026-defis.md) : règles pures, testées. */
export type DefiId = 'chrono' | 'survie';

/** Contre-la-montre : durée de départ. */
export const CHRONO_MS = 60_000;
/** Contre-la-montre : temps gagné par bonne réponse. */
export const CORRECT_BONUS_MS = 2_000;
/** Contre-la-montre : temps perdu par erreur. */
export const WRONG_PENALTY_MS = 5_000;
/** Mise sous pression : les 10 dernières secondes. */
export const PRESSURE_S = 10;

/** Barème (docs/SPEC.md, Défis) : points de base selon le niveau de la question. */
export const BASE_BY_LEVEL: Readonly<Record<Level, number>> = { 1: 10, 2: 20, 3: 30 };
/** Supplément pour une réponse saisie (clavier, point) plutôt que choisie parmi des propositions. */
export const TYPED_BONUS = 5;
/** Bonus de rapidité maximal, obtenu en répondant en 2 s ou moins ; nul à partir de 10 s. */
export const SPEED_BONUS_MAX = 10;
export const SPEED_FAST_MS = 2_000;
export const SPEED_SLOW_MS = 10_000;
/** Multiplicateur de série : +1 toutes les 3 bonnes réponses d'affilée, plafonné à ×5. */
export const COMBO_STEP = 3;
export const COMBO_MAX = 5;

/** Survie : cœurs au départ. */
export const SURVIE_HEARTS = 3;
/** Survie : la difficulté monte toutes les 5 bonnes réponses. */
export const SURVIE_STEP = 5;

/** Niveau de la question : Contre-la-montre alterne 1 et 2 ; Survie monte avec les bonnes réponses. */
export function levelFor(defi: DefiId, correct: number, random: number): Level {
  if (defi === 'chrono') return random < 0.5 ? 1 : 2;
  return Math.min(3, 1 + Math.floor(correct / SURVIE_STEP)) as Level;
}

export interface DefiScore {
  readonly correct: number;
  readonly answered: number;
  readonly hearts: number;
  /** Score en points. */
  readonly points: number;
  /** Bonnes réponses d'affilée. */
  readonly streak: number;
  /** Temps gagné moins temps perdu (Contre-la-montre), en ms. */
  readonly timeAdjustMs: number;
}

export const INITIAL_SCORE: DefiScore = {
  correct: 0,
  answered: 0,
  hearts: SURVIE_HEARTS,
  points: 0,
  streak: 0,
  timeAdjustMs: 0,
};

/** Multiplicateur de série pour une série de `streak` bonnes réponses (×1 à ×5). */
export const comboOf = (streak: number) => Math.min(COMBO_MAX, 1 + Math.floor(streak / COMBO_STEP));

/** Points de base : niveau de la question, plus un supplément pour une réponse saisie. */
export const basePoints = (level: Level, answerKind: string) =>
  BASE_BY_LEVEL[level] + (answerKind === 'choice' ? 0 : TYPED_BONUS);

/** Bonus de rapidité : maximal jusqu'à 2 s, décroît linéairement jusqu'à 0 à 10 s. */
export function speedBonus(durationMs: number): number {
  const t = (SPEED_SLOW_MS - durationMs) / (SPEED_SLOW_MS - SPEED_FAST_MS);
  return Math.round(SPEED_BONUS_MAX * Math.min(1, Math.max(0, t)));
}

/** Points d'une bonne réponse : (base + rapidité) × multiplicateur de la série (qui compte cette réponse). */
export function pointsFor(level: Level, answerKind: string, durationMs: number, streakAfter: number): number {
  return (basePoints(level, answerKind) + speedBonus(durationMs)) * comboOf(streakAfter);
}

/** Temps restant (ms) du Contre-la-montre. */
export const remainingMs = (s: DefiScore, elapsedMs: number) => Math.max(0, CHRONO_MS + s.timeAdjustMs - elapsedMs);

/** Fin du défi : temps écoulé (Contre-la-montre) ou plus de cœurs (Survie). */
export const isOver = (defi: DefiId, s: DefiScore, elapsedMs: number) =>
  defi === 'chrono' ? remainingMs(s, elapsedMs) <= 0 : s.hearts <= 0;

/**
 * Réponse : une bonne réponse rapporte `gained` points, +2 s et prolonge la série ; une erreur casse la
 * série, coûte 5 s (Contre-la-montre) ou un cœur (Survie).
 */
export const scoreAfter = (defi: DefiId, s: DefiScore, correct: boolean, gained = 0): DefiScore => ({
  correct: s.correct + (correct ? 1 : 0),
  answered: s.answered + 1,
  hearts: defi === 'survie' && !correct ? s.hearts - 1 : s.hearts,
  points: s.points + (correct ? gained : 0),
  streak: correct ? s.streak + 1 : 0,
  timeAdjustMs: defi === 'chrono' ? s.timeAdjustMs + (correct ? CORRECT_BONUS_MS : -WRONG_PENALTY_MS) : 0,
});

/**
 * Meilleur score de l'appareil, en points, par matière et par classe (confort : stockage local).
 * Nouvelle clé « af:defi-pts » : les anciens records en bonnes réponses (« af:defi ») ne sont pas repris.
 */
const key = (defi: DefiId, profileId: string, grade: string, subject: string) =>
  `af:defi-pts:${defi}:${profileId}:${grade}:${subject}`;
export function bestScore(defi: DefiId, profileId: string, subject: string, grade: string): number {
  try {
    return Number(localStorage.getItem(key(defi, profileId, grade, subject)) ?? 0) || 0;
  } catch {
    return 0;
  }
}
export function saveBest(defi: DefiId, profileId: string, subject: string, grade: string, points: number): boolean {
  const previous = bestScore(defi, profileId, subject, grade);
  if (points <= previous) return false;
  try {
    localStorage.setItem(key(defi, profileId, grade, subject), String(points));
  } catch {
    // Stockage indisponible : sans conséquence.
  }
  return true;
}
