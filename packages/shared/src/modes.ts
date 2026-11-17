/** Modes de jeu : on choisit le mode, puis la matière. */
export const MODE_IDS = ['entrainement', 'boss', 'chrono', 'survie', 'arene', 'raid', 'quiz', 'course'] as const;
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
  { id: 'multi', name: 'Multijoueur' },
];

/** Chaque mode se joue sur une matière, choisie après le mode. */
export const MODES: readonly ModeInfo[] = [
  {
    id: 'entrainement',
    name: 'Entraînement',
    pitch: '10 questions sur un thème, à ton rythme',
    category: 'apprendre',
    available: true,
  },
  {
    id: 'boss',
    name: 'Combat de boss',
    pitch: 'Bats le boss du thème, 3 cœurs',
    category: 'apprendre',
    available: false,
  },
  {
    id: 'chrono',
    name: 'Contre-la-montre',
    pitch: 'Un max de bonnes réponses en 60 s',
    category: 'defis',
    available: false,
  },
  { id: 'survie', name: 'Survie', pitch: 'Ça monte sans arrêt, 3 vies', category: 'defis', available: false },
  {
    id: 'arene',
    name: 'Arène',
    pitch: 'Tes bonnes réponses attaquent les autres',
    category: 'multi',
    available: false,
  },
  { id: 'raid', name: 'Raid', pitch: 'Toute l’équipe contre un boss géant', category: 'multi', available: false },
  {
    id: 'quiz',
    name: 'Quiz plateau',
    pitch: 'Buzzer sur le téléphone, le plus rapide gagne',
    category: 'multi',
    available: false,
  },
  {
    id: 'course',
    name: 'Course de calcul',
    pitch: 'Le premier à 20 bonnes réponses',
    category: 'multi',
    available: false,
  },
];

export function getMode(id: string): ModeInfo | undefined {
  return MODES.find((m) => m.id === id);
}
