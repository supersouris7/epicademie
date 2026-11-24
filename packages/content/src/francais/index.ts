import type { Chapter } from '../types.ts';
import { FCM1_PHRASES } from './phrases.ts';

/** Français : chapitres publiés (ADR 0034). Le lot de contenu ajoute ses chapitres ici, sans toucher à catalog.ts. */
export const FRANCAIS_CHAPTERS: readonly Chapter[] = [
  {
    id: 'fcm1-phrases',
    subject: 'francais',
    grade: 'cm1',
    domain: 'grammaire',
    title: 'Types et formes de phrases',
    skills: FCM1_PHRASES,
  },
];
