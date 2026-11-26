import type { Chapter } from '../../types.ts';
import { biodiversite } from './biodiversite.ts';
import { ecosystemes } from './ecosystemes.ts';
import { meteoClimat } from './meteo-climat.ts';
import { respiration } from './respiration.ts';
import { risques } from './risques.ts';
import { seismes } from './seismes.ts';
import { vegetaux } from './vegetaux.ts';
import { volcans } from './volcans.ts';

/** SVT, cycle 4 (préfixe « v », ADR 0034). Le lot de contenu ajoute ses chapitres ici, sans toucher à catalog.ts. */
export const SVT_CHAPTERS: readonly Chapter[] = [
  {
    id: 'v5-terre',
    subject: 'sciences',
    grade: '5e',
    domain: 'svt',
    title: 'Météo, climat et géologie',
    skills: [meteoClimat, seismes, volcans, risques],
  },
  {
    id: 'v5-nutrition',
    subject: 'sciences',
    grade: '5e',
    domain: 'svt',
    title: 'Nutrition des êtres vivants',
    skills: [vegetaux, respiration, ecosystemes, biodiversite],
  },
];
