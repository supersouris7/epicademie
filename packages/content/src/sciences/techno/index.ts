import type { Chapter } from '../../types.ts';
import { algorithme } from './algorithme.ts';
import { besoin } from './besoin.ts';
import { capteurs } from './capteurs.ts';
import { contraintes } from './contraintes.ts';
import { cycleVie } from './cycle-vie.ts';
import { donnees } from './fichiers.ts';
import { impacts } from './impacts.ts';
import { materiaux } from './materiaux.ts';
import { reseaux } from './reseaux.ts';
import { securite } from './securite.ts';
import { sequenceBoucle } from './sequence-boucle.ts';
import { testsProgramme } from './tests-programme.ts';

/** Technologie (préfixe `t…`, ADR 0034). Le lot de contenu ajoute ses chapitres ici, sans toucher à catalog.ts. */
export const TECHNO_CHAPTERS: readonly Chapter[] = [
  {
    id: 't5-objets-techniques',
    subject: 'sciences',
    grade: '5e',
    domain: 'technologie',
    title: 'Objets et systèmes techniques',
    skills: [besoin, contraintes, materiaux, cycleVie],
  },
  {
    id: 't5-numerique',
    subject: 'sciences',
    grade: '5e',
    domain: 'technologie',
    title: 'Usages du numérique',
    skills: [donnees, reseaux, securite, impacts],
  },
  {
    id: 't5-programmer',
    subject: 'sciences',
    grade: '5e',
    domain: 'technologie',
    title: 'Programmer',
    skills: [algorithme, capteurs, sequenceBoucle, testsProgramme],
  },
];
