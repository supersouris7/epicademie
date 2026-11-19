import type { Chapter } from '../types.ts';
import { CINQUIEME } from './5e/index.ts';
import { QUATRIEME } from './4e/index.ts';
import { SIXIEME } from './6e/index.ts';
import { TROISIEME } from './3e/index.ts';
import { CM1, CM2 } from './cm/index.ts';

/**
 * Mathématiques : un dossier par classe (`cm/`, `6e/`, `5e/`, `4e/`, `3e/`), un fichier par
 * chapitre. Programmes : cycle 3 (CM1 → 6e) BO n°16 du 17/04/2025, cycle 4 (5e → 3e) BO n°10
 * du 5/03/2026.
 */
export const MATHS_CHAPTERS: readonly Chapter[] = [
  ...CM1,
  ...CM2,
  ...SIXIEME,
  ...CINQUIEME,
  ...QUATRIEME,
  ...TROISIEME,
];
