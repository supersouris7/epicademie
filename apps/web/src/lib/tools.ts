import type { Question, Skill } from '@questeo/content';
import type { DockTab } from '../components/play/PlayDock.tsx';
import { conversionNeeded } from './conversion.ts';

/** Onglets d'une question : la calculatrice partout sauf quand calculer est l'objectif de la notion. */
export function toolTabs(question: Question, skill: Skill | undefined): DockTab[] {
  const tools = skill?.tools ?? [];
  // Tableau de conversion proposé seulement quand la question mêle deux unités d'une même grandeur.
  const measured = question.answer.kind === 'number' ? conversionNeeded(question.prompt, question.answer.unit) : null;
  return [
    'reponse',
    ...(skill?.mental ? [] : (['calculatrice'] as const)),
    'brouillon',
    ...(tools.length > 0 || measured ? (['conversion'] as const) : []),
  ];
}
