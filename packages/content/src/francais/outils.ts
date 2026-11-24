import type { Rng } from '../rng.ts';
import type { Trap } from '../types.ts';

/** Petits outils communs aux générateurs de français. */

/** Élément d'une liste à un indice valide (échec franc sinon). */
export function at<T>(items: readonly T[], i: number): T {
  const v = items[i];
  if (v === undefined) throw new RangeError(`indice hors liste : ${i}`);
  return v;
}

export const pickN = <T>(rng: Rng, items: readonly T[], n: number): T[] => rng.shuffle(items).slice(0, n);

export const document = (title: string, lines: readonly string[]) => ({
  kind: 'document' as const,
  title,
  lines,
});

export const textTrap = (text: string, why: string): Trap => ({ text, why });

/** Première lettre en minuscule (un groupe sujet placé après « Ce matin, »). */
export const lowerFirst = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);

/** Une écriture en minuscules, sans doublon, pour comparer des propositions. */
export const same = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();
