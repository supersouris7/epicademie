import type { Chapter } from '../types.ts';
import { CIVISME_NUMERIQUE_SKILLS } from './civisme-numerique.ts';
import { FAIRE_SOCIETE_SKILLS } from './faire-societe.ts';
import { VIVRE_REPUBLIQUE_SKILLS } from './vivre-republique.ts';

/**
 * EMC (matière histoire, domaine emc, préfixe em), ADR 0034. Les chapitres sont ajoutés ici par les lots de
 * contenu, sans toucher à catalog.ts.
 */
export const EMC_CHAPTERS: readonly Chapter[] = [
  {
    id: 'emcm1-faire-societe',
    subject: 'histoire',
    grade: 'cm1',
    domain: 'emc',
    title: 'Faire société',
    skills: FAIRE_SOCIETE_SKILLS,
  },
  {
    id: 'emcm1-civisme-numerique',
    subject: 'histoire',
    grade: 'cm1',
    domain: 'emc',
    title: 'Civisme numérique',
    skills: CIVISME_NUMERIQUE_SKILLS,
  },
  {
    id: 'emcm2-vivre-republique',
    subject: 'histoire',
    grade: 'cm2',
    domain: 'emc',
    title: 'Vivre en République',
    skills: VIVRE_REPUBLIQUE_SKILLS,
  },
];
