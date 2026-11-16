/** Barème d'XP et de pièces (voir docs/SPEC.md §7). */
export const XP_PER_CORRECT = 10;
export const XP_PER_VARIANT = 5;
export const MAX_SPEED_BONUS = 5;
export const PERFECT_BONUS = 20;

export function comboMultiplier(streak: number): number {
  if (streak >= 10) return 2;
  if (streak >= 5) return 1.5;
  return 1;
}

/** Bonus de vitesse : plein bonus sous la moitié du temps cible, nul au-delà du temps cible. */
export function speedBonus(durationMs: number, targetSeconds: number): number {
  const t = durationMs / 1000;
  if (t <= targetSeconds / 2) return MAX_SPEED_BONUS;
  if (t >= targetSeconds) return 0;
  return Math.round(MAX_SPEED_BONUS * (1 - (t - targetSeconds / 2) / (targetSeconds / 2)));
}

export interface AnswerXpInput {
  readonly correct: boolean;
  readonly variant: boolean;
  readonly durationMs: number;
  readonly targetSeconds: number;
  /** Nombre de bonnes réponses consécutives, celle-ci comprise. */
  readonly streak: number;
}

export function xpForAnswer(a: AnswerXpInput): number {
  if (!a.correct) return 0;
  if (a.variant) return XP_PER_VARIANT;
  return Math.round((XP_PER_CORRECT + speedBonus(a.durationMs, a.targetSeconds)) * comboMultiplier(a.streak));
}

export const coinsForXp = (xp: number) => Math.floor(xp / 10);
