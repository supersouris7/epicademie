import type { Question, Skill } from '@questeo/content';
import type { DockTab } from './PlayDock.tsx';
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

/**
 * Hauteur de la zone « Répondre » et outils en portrait (téléphone) : assez pour le pavé entier
 * (4 rangées et l'affichage), davantage quand la calculatrice est ouverte (touches de fonction).
 */
export const DOCK_HEIGHT =
  'h-[clamp(300px,46dvh,420px)] md:h-[clamp(360px,50dvh,560px)] has-[[data-tool=calc]]:h-[clamp(360px,58dvh,520px)] md:has-[[data-tool=calc]]:h-[clamp(420px,60dvh,640px)]';
