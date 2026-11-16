/** Modes de jeu : on choisit le mode, puis (selon la portée) la matière. */
export const MODE_IDS = [
  'revisions',
  'entrainement',
  'boss',
  'atelier',
  'chrono',
  'survie',
  'defi',
  'bilan',
  'arene',
  'raid',
  'quiz',
  'course',
] as const;
export type ModeId = (typeof MODE_IDS)[number];

export type ModeCategory = 'apprendre' | 'defis' | 'multi';

/**
 * Portée du mode :
 * - `toutes` : mélange automatique de toutes les matières (pas de choix) ;
 * - `matiere` : choix d'une matière (puis d'un thème) ;
 * - `globale-ou-matiere` : bilan global ou par matière.
 */
export type ModeScope = 'toutes' | 'matiere' | 'globale-ou-matiere';

export interface ModeInfo {
  readonly id: ModeId;
  readonly name: string;
  readonly pitch: string;
  readonly category: ModeCategory;
  readonly scope: ModeScope;
}

export const MODE_CATEGORIES: readonly { id: ModeCategory; name: string }[] = [
  { id: 'apprendre', name: 'Apprendre' },
  { id: 'defis', name: 'Défis' },
  { id: 'multi', name: 'Multijoueur' },
];

export const MODES: readonly ModeInfo[] = [
  {
    id: 'revisions',
    name: 'Révisions du jour',
    pitch: 'Les notions à revoir aujourd’hui',
    category: 'apprendre',
    scope: 'toutes',
  },
  {
    id: 'entrainement',
    name: 'Entraînement',
    pitch: '10 questions sur un thème, à ton rythme',
    category: 'apprendre',
    scope: 'matiere',
  },
  {
    id: 'boss',
    name: 'Combat de boss',
    pitch: 'Bats le boss du thème, 3 cœurs',
    category: 'apprendre',
    scope: 'matiere',
  },
  {
    id: 'atelier',
    name: 'Atelier des erreurs',
    pitch: 'Rejoue tes erreurs jusqu’à les réussir',
    category: 'apprendre',
    scope: 'toutes',
  },
  {
    id: 'chrono',
    name: 'Contre-la-montre',
    pitch: 'Un max de bonnes réponses en 60 s',
    category: 'defis',
    scope: 'matiere',
  },
  { id: 'survie', name: 'Survie', pitch: 'Ça monte sans arrêt, 3 vies', category: 'defis', scope: 'matiere' },
  {
    id: 'defi',
    name: 'Défi du jour',
    pitch: 'Les mêmes 10 questions pour toute la famille',
    category: 'defis',
    scope: 'toutes',
  },
  {
    id: 'bilan',
    name: 'Bilan',
    pitch: 'Évalue-toi : note /20 et maîtrise',
    category: 'defis',
    scope: 'globale-ou-matiere',
  },
  {
    id: 'arene',
    name: 'Arène',
    pitch: 'Tes bonnes réponses attaquent les autres',
    category: 'multi',
    scope: 'matiere',
  },
  { id: 'raid', name: 'Raid', pitch: 'Toute l’équipe contre un boss géant', category: 'multi', scope: 'matiere' },
  {
    id: 'quiz',
    name: 'Quiz plateau',
    pitch: 'Buzzer sur le téléphone, le plus rapide gagne',
    category: 'multi',
    scope: 'matiere',
  },
  {
    id: 'course',
    name: 'Course de calcul',
    pitch: 'Le premier à 20 bonnes réponses',
    category: 'multi',
    scope: 'matiere',
  },
];

export function getMode(id: string): ModeInfo | undefined {
  return MODES.find((m) => m.id === id);
}
