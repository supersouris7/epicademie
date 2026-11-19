import { r } from '../../rational.ts';
import { chapterOf, MINUS, sgn, skillsOf } from '../kit.ts';

/** Outils communs aux chapitres de la 3e. */

/** Programme de 3e (cycle 4, BO n°10 du 5 mars 2026), dans l'ordre du programme. */
export const S = skillsOf('3e');

export const C = chapterOf('3e');

export const tenth = (x: number) => r(Math.round(x * 10), 10);

export const unit = (x: number) => r(Math.round(x));

/** Polynôme ax + b écrit proprement. */
export const lin = (a: number, b: number, x = 'x') => {
  const ax = a === 1 ? x : a === -1 ? `${MINUS}${x}` : `${sgn(a)}${x}`;
  if (b === 0) return ax;
  return `${ax} ${b < 0 ? MINUS : '+'} ${Math.abs(b)}`;
};
