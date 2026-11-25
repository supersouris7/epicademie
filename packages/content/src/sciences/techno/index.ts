import type { Chapter } from '../../types.ts';
import { besoin } from './besoin.ts';
import { contraintes } from './contraintes.ts';
import { cycleVie } from './cycle-vie.ts';
import { materiaux } from './materiaux.ts';

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
];
