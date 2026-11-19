import { BO_MATHS } from '../../build.ts';
import { dec } from '../../rational.ts';

/** Outils communs aux chapitres de la 5e. */

export const SOURCE_NOTE = BO_MATHS;

export const PI = dec(314, 2);

/** Triplets pythagoriciens (pied, hauteur, côté oblique) : longueurs affichées exactes. */
export const TRIPLES: readonly [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [9, 12, 15],
  [12, 5, 13],
];
