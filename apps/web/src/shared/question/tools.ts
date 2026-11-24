import { chapterOfAnySkill, type Question, type Skill } from '@epicademie/content';
import type { SubjectId } from '@epicademie/shared';
import type { DockTab } from './PlayDock.tsx';
import { conversionNeeded } from './conversion.ts';

/** Matières où l'on calcule : seules à proposer calculatrice, brouillon et tableau de conversion. */
const NUMERIC_SUBJECTS: readonly SubjectId[] = ['maths', 'sciences'];

/**
 * Onglets d'une question (audit du 21/11/2026) :
 * - langues, histoire, géographie : la réponse seule (pas d'outil de calcul) ;
 * - maths et physique-chimie : brouillon ; calculatrice quand l'énoncé contient des nombres, sauf
 *   quand calculer est l'objectif de la notion (calcul mental) ; tableau de conversion quand la
 *   notion le prévoit ou que la question mêle deux unités d'une même grandeur.
 */
export function toolTabs(question: Question, skill: Skill | undefined): DockTab[] {
  const subject = chapterOfAnySkill(question.skillId)?.subject;
  if (!subject || !NUMERIC_SUBJECTS.includes(subject)) return ['reponse'];
  const tools = skill?.tools ?? [];
  const measured = question.answer.kind === 'number' ? conversionNeeded(question.prompt, question.answer.unit) : null;
  const withNumbers = /\d/.test(question.prompt);
  return [
    'reponse',
    ...(skill?.mental || !withNumbers ? [] : (['calculatrice'] as const)),
    'brouillon',
    ...(tools.length > 0 || measured ? (['conversion'] as const) : []),
  ];
}

/**
 * Hauteur de la zone « Répondre » et outils en portrait (téléphone) : assez pour le pavé entier
 * (4 rangées et l'affichage), davantage quand la calculatrice est ouverte (touches de fonction).
 */
export const DOCK_HEIGHT =
  'h-[clamp(300px,46dvh,420px)] md:h-[clamp(360px,50dvh,560px)] has-[[data-tool=calc]]:h-[clamp(360px,58dvh,520px)] md:has-[[data-tool=calc]]:h-[clamp(420px,60dvh,640px)]';
