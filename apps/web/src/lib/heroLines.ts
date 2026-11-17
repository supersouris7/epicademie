import type { HeroExpression } from '../design/assets.ts';

/** Réactions courtes du héros pendant l'entraînement (Questy garde les indices et les explications). */
export type HeroMoment = 'start' | 'correct' | 'streak' | 'wrong' | 'retried' | 'lastOne';

const LINES: Record<HeroMoment, readonly string[]> = {
  start: ['C’est parti !', 'Allez, on s’échauffe !', 'Prêt pour le loot ?'],
  correct: ['Trop facile !', 'Yes !', 'Dans le mille !', 'Easy !', 'Je gère !'],
  streak: ['Série en feu !', 'Rien ne m’arrête !', 'Combo !'],
  wrong: ['Aïe… on se reprend !', 'Oups, pas grave !', 'Hmm, je réfléchis…'],
  retried: ['Rattrapé !', 'Ouf, je l’ai eu !'],
  lastOne: ['Dernière question !', 'On termine en beauté !'],
};

const FACES: Record<HeroMoment, readonly HeroExpression[]> = {
  start: ['determine', 'confiant'],
  correct: ['joie', 'clin-oeil', 'confiant'],
  streak: ['enthousiaste', 'rire'],
  wrong: ['surprise', 'reflexion', 'triste'],
  retried: ['joie', 'clin-oeil'],
  lastOne: ['determine'],
};

export function heroLine(moment: HeroMoment, n: number): { text: string; face: HeroExpression } {
  const lines = LINES[moment];
  const faces = FACES[moment];
  return { text: lines[n % lines.length] ?? '', face: faces[n % faces.length] ?? 'confiant' };
}
