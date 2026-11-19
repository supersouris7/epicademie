import { r } from '../../rational.ts';
import { chapterOf, skillsOf } from '../kit.ts';

/** Outils communs aux chapitres de la 4e. */

/** Programme de 4e (cycle 4, BO n°10 du 5 mars 2026) : nombres et calculs. */
export const S = skillsOf('4e');

export const C = chapterOf('4e');

/** Arrondi au dixième d'un nombre réel positif, en rationnel exact. */
export const tenth = (x: number) => r(Math.round(x * 10), 10);
