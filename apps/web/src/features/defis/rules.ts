import type { Level } from '@questeo/content';

/** Défis (docs/adr/0026-defis.md) : règles pures, testées. */
export type DefiId = 'chrono' | 'survie';

/** Contre-la-montre : durée totale. */
export const CHRONO_MS = 60_000;
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
}

/** Fin du défi : temps écoulé (Contre-la-montre) ou plus de cœurs (Survie). */
export const isOver = (defi: DefiId, s: DefiScore, elapsedMs: number) =>
  defi === 'chrono' ? elapsedMs >= CHRONO_MS : s.hearts <= 0;

/** Réponse : une bonne réponse compte ; une erreur coûte un cœur en Survie. */
export const scoreAfter = (defi: DefiId, s: DefiScore, correct: boolean): DefiScore => ({
  correct: s.correct + (correct ? 1 : 0),
  answered: s.answered + 1,
  hearts: defi === 'survie' && !correct ? s.hearts - 1 : s.hearts,
});

/** Meilleur score de l'appareil (confort : stockage local, protégé). */
const key = (defi: DefiId, profileId: string, subject: string) => `af:defi:${defi}:${profileId}:${subject}`;
export function bestScore(defi: DefiId, profileId: string, subject: string): number {
  try {
    return Number(localStorage.getItem(key(defi, profileId, subject)) ?? 0) || 0;
  } catch {
    return 0;
  }
}
export function saveBest(defi: DefiId, profileId: string, subject: string, score: number): boolean {
  const previous = bestScore(defi, profileId, subject);
  if (score <= previous) return false;
  try {
    localStorage.setItem(key(defi, profileId, subject), String(score));
  } catch {
    // Stockage indisponible : sans conséquence.
  }
  return true;
}
