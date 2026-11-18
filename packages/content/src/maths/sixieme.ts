import type { Chapter } from '../types.ts';
import { SIXIEME_DONNEES } from './sixieme-donnees.ts';
import { SIXIEME_MESURES } from './sixieme-mesures.ts';
import { SIXIEME_NOMBRES } from './sixieme-nombres.ts';

/** Programme de mathématiques de 6e (cycle 3, BO n°16 du 17 avril 2025), dans l'ordre du programme. */
export const SIXIEME: readonly Chapter[] = [...SIXIEME_NOMBRES, ...SIXIEME_MESURES, ...SIXIEME_DONNEES];
