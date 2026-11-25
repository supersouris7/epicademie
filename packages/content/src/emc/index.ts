import type { Chapter } from '../types.ts';
import { CIVISME_NUMERIQUE_SKILLS } from './civisme-numerique.ts';
import { DISCOURS_HAINE_SKILLS } from './discours-haine.ts';
import { DROITS_LIBERTES_SKILLS } from './droits-libertes.ts';
import { EGALITE_FRATERNITE_SKILLS } from './egalite-fraternite.ts';
import { FAIRE_SOCIETE_SKILLS } from './faire-societe.ts';
import { SINFORMER_SKILLS } from './sinformer-en-ligne.ts';
import { SOCIETE_DEMOCRATIQUE_SKILLS } from './societe-democratique.ts';
import { VIE_PRIVEE_SKILLS } from './vie-privee.ts';
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
  {
    id: 'emcm2-sinformer-en-ligne',
    subject: 'histoire',
    grade: 'cm2',
    domain: 'emc',
    title: 'S’informer en ligne',
    skills: SINFORMER_SKILLS,
  },
  {
    id: 'em6-societe-democratique',
    subject: 'histoire',
    grade: '6e',
    domain: 'emc',
    title: 'Vivre dans une société démocratique',
    skills: SOCIETE_DEMOCRATIQUE_SKILLS,
  },
  {
    id: 'em6-vie-privee',
    subject: 'histoire',
    grade: '6e',
    domain: 'emc',
    title: 'Vie privée et vie publique',
    skills: VIE_PRIVEE_SKILLS,
  },
  {
    id: 'em5-egalite-fraternite',
    subject: 'histoire',
    grade: '5e',
    domain: 'emc',
    title: 'Égalité, fraternité, solidarité',
    skills: EGALITE_FRATERNITE_SKILLS,
  },
  {
    id: 'em5-discours-haine',
    subject: 'histoire',
    grade: '5e',
    domain: 'emc',
    title: 'Discours de haine',
    skills: DISCOURS_HAINE_SKILLS,
  },
  {
    id: 'em4-droits-libertes',
    subject: 'histoire',
    grade: '4e',
    domain: 'emc',
    title: 'Défendre les droits et les libertés',
    skills: DROITS_LIBERTES_SKILLS,
  },
];
