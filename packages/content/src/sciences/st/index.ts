import type { Chapter } from '../../types.ts';
import { besoinsAnimaux } from './besoins-animaux.ts';
import { besoinsVegetaux } from './besoins-vegetaux.ts';
import { actionsHumaines } from './actions-humaines.ts';
import { chainesAlimentaires } from './chaines.ts';
import { decomposeurs } from './decomposeurs.ts';
import { peuplement } from './peuplement.ts';
import { relations } from './relations.ts';
import { alimentation } from './alimentation.ts';
import { besoinsAlimentaires } from './besoins-alimentaires.ts';
import { circulation } from './circulation.ts';
import { digestion } from './digestion.ts';
import { classer } from './classer.ts';
import { conversions } from './conversions.ts';
import { developpement } from './developpement.ts';
import { dissolution } from './dissolution.ts';
import { eau } from './eau.ts';
import { energieQuotidien } from './energie-quotidien.ts';
import { formesEnergie } from './energie-formes.ts';
import { sourcesEnergie } from './energie-sources.ts';
import { etats } from './etats.ts';
import { masseVolume } from './masse-volume.ts';
import { materiaux } from './materiaux.ts';
import { melanges } from './melanges.ts';
import { mouvement } from './mouvement.ts';
import { renouvelables } from './renouvelables.ts';
import { separer } from './separer.ts';
import { signal } from './signal.ts';
import { trajectoire } from './trajectoire.ts';
import { vitesse } from './vitesse.ts';

/**
 * Sciences et technologie, CM1 à 6e (préfixe `p…` pour le domaine physique-chimie, `v…` pour la SVT, ADR 0034).
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
  {
    id: 'vcm1-vivant',
    subject: 'sciences',
    grade: 'cm1',
    domain: 'svt',
    title: 'Le vivant',
    skills: [classer, besoinsVegetaux, besoinsAnimaux, developpement],
  },
  {
    id: 'pcm2-materiaux-melanges',
    subject: 'sciences',
    grade: 'cm2',
    domain: 'physique-chimie',
    title: 'Matériaux et mélanges',
    skills: [materiaux, separer, dissolution],
  },
  {
    id: 'pcm2-mouvement-energie',
    subject: 'sciences',
    grade: 'cm2',
    domain: 'physique-chimie',
    title: 'Mouvement et énergie',
    skills: [trajectoire, vitesse, renouvelables, conversions],
  },
  {
    id: 'vcm2-corps-humain',
    subject: 'sciences',
    grade: 'cm2',
    domain: 'svt',
    title: 'Le corps humain',
    skills: [digestion, alimentation, besoinsAlimentaires, circulation],
  },
  {
    id: 'vcm2-ecosystemes',
    subject: 'sciences',
    grade: 'cm2',
    domain: 'svt',
    title: 'Écosystèmes',
    skills: [peuplement, relations, chainesAlimentaires, actionsHumaines],
  },
  {
    id: 'p6-signal-information',
    subject: 'sciences',
    grade: '6e',
    domain: 'physique-chimie',
    title: 'Signal et information',
    skills: [signal],
  },
  {
    id: 'v6-decomposition',
    subject: 'sciences',
    grade: '6e',
    domain: 'svt',
    title: 'La décomposition',
    skills: [decomposeurs],
  },
];
