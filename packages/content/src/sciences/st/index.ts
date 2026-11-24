import type { Chapter } from '../../types.ts';
import { eau } from './eau.ts';
import { energieQuotidien } from './energie-quotidien.ts';
import { formesEnergie } from './energie-formes.ts';
import { sourcesEnergie } from './energie-sources.ts';
import { etats } from './etats.ts';
import { masseVolume } from './masse-volume.ts';
import { melanges } from './melanges.ts';
import { mouvement } from './mouvement.ts';

/**
 * Sciences et technologie, CM1 à 6e (préfixe `p…` pour le domaine physique-chimie, ADR 0034).
 * Le lot de contenu ajoute ses chapitres ici, sans toucher à catalog.ts.
 */
export const ST_CHAPTERS: readonly Chapter[] = [
  {
    id: 'pcm1-matiere',
    subject: 'sciences',
    grade: 'cm1',
    domain: 'physique-chimie',
    title: 'La matière',
    skills: [etats, eau, masseVolume, melanges],
  },
  {
    id: 'pcm1-mouvement-energie',
    subject: 'sciences',
    grade: 'cm1',
    domain: 'physique-chimie',
    title: 'Mouvement et énergie',
    skills: [sourcesEnergie, formesEnergie, mouvement, energieQuotidien],
  },
];
