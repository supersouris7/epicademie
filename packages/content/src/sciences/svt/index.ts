import type { Chapter } from '../../types.ts';
import { meteoClimat } from './meteo-climat.ts';
import { risques } from './risques.ts';
import { seismes } from './seismes.ts';
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
];
