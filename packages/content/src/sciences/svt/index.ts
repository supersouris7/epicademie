import type { Chapter } from '../../types.ts';
import { biodiversite } from './biodiversite.ts';
import { caracteresPartages } from './caracteres.ts';
import { circulationSang } from './circulation.ts';
import { digestionAliments } from './digestion.ts';
import { ecosystemes } from './ecosystemes.ts';
import { effortPhysique } from './effort.ts';
import { espece } from './espece.ts';
import { groupesEmboites } from './groupes.ts';
import { meteoClimat } from './meteo-climat.ts';
import { parentes } from './parentes.ts';
import { respiration } from './respiration.ts';
import { respirationHumaine } from './respiration-humaine.ts';
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
  {
    id: 'v5-corps',
    subject: 'sciences',
    grade: '5e',
    domain: 'svt',
    title: 'Le corps en activité',
    skills: [respirationHumaine, circulationSang, digestionAliments, effortPhysique],
  },
  {
    id: 'v5-classer',
    subject: 'sciences',
    grade: '5e',
    domain: 'svt',
    title: 'Classer le vivant',
    skills: [caracteresPartages, groupesEmboites, parentes, espece],
  },
];
