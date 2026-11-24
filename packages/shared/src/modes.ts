/** Modes de jeu : on choisit le mode, puis la matière. */
export const MODE_IDS = ['entrainement', 'boss', 'chrono', 'survie', 'arene', 'evaluation'] as const;
export type ModeId = (typeof MODE_IDS)[number];

export type ModeCategory = 'apprendre' | 'defis' | 'multi';

export interface ModeInfo {
  readonly id: ModeId;
  readonly name: string;
  readonly pitch: string;
  readonly category: ModeCategory;
  /** Mode jouable ; sinon tuile grisée « À venir ». */
  readonly available: boolean;
}

export const MODE_CATEGORIES: readonly { id: ModeCategory; name: string }[] = [
  { id: 'apprendre', name: 'Apprendre' },
  { id: 'defis', name: 'Défis' },
  { id: 'multi', name: 'En famille' },
];

/** Chaque mode se joue sur une matière, choisie après le mode. */
export const MODES: readonly ModeInfo[] = [
  {
    id: 'entrainement',
    name: 'Entraînement',
    pitch: '4 questions sur un thème (5 en calcul de tête), à ton rythme',
    category: 'apprendre',
    available: true,
  },
  {
    id: 'boss',
    name: 'Mode Histoire',
    pitch: '4 mobs puis le boss du chapitre',
    category: 'apprendre',
    available: true,
  },
  {
    id: 'chrono',
    name: 'Contre-la-montre',
    pitch: 'Un max de bonnes réponses en 60 s',
    category: 'defis',
    available: true,
  },
  { id: 'survie', name: 'Survie', pitch: 'Ça monte sans arrêt, 3 vies', category: 'defis', available: true },
  {
    id: 'evaluation',
    name: 'Arène d’évaluation',
    pitch: 'Fais le point : d’où tu pars, ce que tu sais, ce qui reste',
    category: 'defis',
    available: true,
  },
  {
    id: 'arene',
    name: 'Duels',
    pitch: 'Tes bonnes réponses attaquent les autres',
    category: 'multi',
    available: true,
  },
];

export function getMode(id: string): ModeInfo | undefined {
  return MODES.find((m) => m.id === id);
}
