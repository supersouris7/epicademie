import type { Chapter } from '../types.ts';
import { QUATRIEME_AUTRES } from './quatrieme-autres.ts';
import { QUATRIEME_NOMBRES } from './quatrieme-nombres.ts';

/** Programme de mathématiques de 4e (cycle 4, BO n°10 du 5 mars 2026), dans l'ordre du programme. */
export const QUATRIEME: readonly Chapter[] = [...QUATRIEME_NOMBRES, ...QUATRIEME_AUTRES];
