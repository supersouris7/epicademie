import type { Chapter } from '../types.ts';
import { FCM1_ACCORDS } from './accords.ts';
import { FCM1_COMPLEMENTS } from './complements.ts';
import { FCM1_GROUPE_NOMINAL } from './groupe-nominal.ts';
import { FCM1_LECTURE } from './lecture.ts';
import { FCM1_NATURE } from './nature.ts';
import { FCM1_ORTHOGRAPHE_MOTS } from './orthographe-mots.ts';
import { FCM1_PHRASES } from './phrases.ts';
import { FCM1_PRESENT } from './present.ts';
import { FCM1_TEMPS } from './temps.ts';
import { FCM1_VERBE_SUJET } from './verbe-sujet.ts';
import { FCM1_VOCABULAIRE } from './vocabulaire.ts';
import { FCM2_GROUPE_NOMINAL } from './groupe-nominal-cm2.ts';

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
  {
    id: 'fcm1-verbe-sujet',
    subject: 'francais',
    grade: 'cm1',
    domain: 'grammaire',
    title: 'Le verbe et le sujet',
    skills: FCM1_VERBE_SUJET,
  },
  {
    id: 'fcm1-complements',
    subject: 'francais',
    grade: 'cm1',
    domain: 'grammaire',
    title: 'Les compléments',
    skills: FCM1_COMPLEMENTS,
  },
  {
    id: 'fcm1-nature-mots',
    subject: 'francais',
    grade: 'cm1',
    domain: 'grammaire',
    title: 'Nature des mots',
    skills: FCM1_NATURE,
  },
  {
    id: 'fcm1-groupe-nominal',
    subject: 'francais',
    grade: 'cm1',
    domain: 'grammaire',
    title: 'Le groupe nominal',
    skills: FCM1_GROUPE_NOMINAL,
  },
  {
    id: 'fcm1-accords',
    subject: 'francais',
    grade: 'cm1',
    domain: 'grammaire',
    title: 'Les accords',
    skills: FCM1_ACCORDS,
  },
  {
    id: 'fcm1-present',
    subject: 'francais',
    grade: 'cm1',
    domain: 'conjugaison',
    title: 'Conjuguer au présent',
    skills: FCM1_PRESENT,
  },
  {
    id: 'fcm1-temps',
    subject: 'francais',
    grade: 'cm1',
    domain: 'conjugaison',
    title: 'Imparfait, futur et passé composé',
    skills: FCM1_TEMPS,
  },
  {
    id: 'fcm1-vocabulaire',
    subject: 'francais',
    grade: 'cm1',
    domain: 'vocabulaire',
    title: 'Vocabulaire',
    skills: FCM1_VOCABULAIRE,
  },
  {
    id: 'fcm1-orthographe-mots',
    subject: 'francais',
    grade: 'cm1',
    domain: 'orthographe',
    title: 'Orthographe des mots',
    skills: FCM1_ORTHOGRAPHE_MOTS,
  },
  {
    id: 'fcm1-lecture',
    subject: 'francais',
    grade: 'cm1',
    domain: 'lecture',
    title: 'Lire et comprendre',
    skills: FCM1_LECTURE,
  },
  {
    id: 'fcm2-groupe-nominal',
    subject: 'francais',
    grade: 'cm2',
    domain: 'grammaire',
    title: 'Le groupe nominal enrichi',
    skills: FCM2_GROUPE_NOMINAL,
  },
];
