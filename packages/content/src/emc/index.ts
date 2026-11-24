import type { Chapter } from '../types.ts';
import { FAIRE_SOCIETE_SKILLS } from './faire-societe.ts';

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
];
