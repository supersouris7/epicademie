import type { Level } from '@epicademie/shared';
import type { SkillState } from './srs.ts';
import { skillWeight, startLevel } from './adaptive.ts';

/**
 * Déroulé d’une série d’Entraînement : 4 questions régulières (5 pour le calcul de tête, très court),
 * plus une variante immédiate (même notion, même niveau, nouvelle graine) après chaque erreur.
 */
export const TRAINING_LENGTH = 5;
export const SHORT_TRAINING_LENGTH = 4;

/** Longueur d'une série : 5 si toutes les notions sont du calcul de tête, sinon 4. */
export const seriesLength = (allMental: boolean) => (allMental ? TRAINING_LENGTH : SHORT_TRAINING_LENGTH);

/** Épreuve du chapitre : série mélangée de 10 questions, réussie à 80 % ou plus (8 sur 10). */
export const EPREUVE_LENGTH = 10;
export const EPREUVE_PASS_RATE = 0.8;
/** Épreuve réussie : série complète et au moins 80 % de bonnes réponses du premier coup. */
export const epreuvePassed = (correct: number, answered: number) =>
  answered >= EPREUVE_LENGTH && correct >= EPREUVE_PASS_RATE * answered;
export const MAX_VARIANTS = 3;

export interface PlannedQuestion {
  readonly skillId: string;
  readonly level: Level;
  readonly seed: number;
  readonly variant: boolean;
}

export interface AnswerRecord {
  readonly skillId: string;
  readonly level: Level;
  readonly variant: boolean;
  readonly correct: boolean;
}

export interface TrainingState {
  readonly skills: readonly string[];
  readonly answers: readonly AnswerRecord[];
  readonly levels: Readonly<Record<string, Level>>;
  /** Niveau maximal de chaque notion (3 si absent). */
  readonly maxLevels?: Readonly<Record<string, Level>>;
  /** Variante à proposer juste après une erreur. */
  readonly pendingVariant: { skillId: string; level: Level } | null;
  /** Questions régulières de la série (4, ou 5 en calcul de tête). */
  readonly length: number;
}

export function startTraining(
  skills: readonly string[],
  states: ReadonlyMap<string, SkillState>,
  length: number = TRAINING_LENGTH,
  maxLevelOf: (skillId: string) => Level = () => 3,
): TrainingState {
  if (skills.length === 0) throw new Error('Aucune notion à travailler');
  const levels: Record<string, Level> = {};
  const maxLevels: Record<string, Level> = {};
  for (const id of skills) {
    maxLevels[id] = maxLevelOf(id);
    levels[id] = startLevel(states.get(id), maxLevels[id]);
  }
  return { skills, answers: [], levels, maxLevels, pendingVariant: null, length };
}

export const regularCount = (s: TrainingState) => s.answers.filter((a) => !a.variant).length;
export const variantCount = (s: TrainingState) => s.answers.filter((a) => a.variant).length;

export function isFinished(s: TrainingState): boolean {
  return regularCount(s) >= s.length && s.pendingVariant === null;
}

/** Tirage d'une question : `random` ∈ [0, 1) pour le choix pondéré, `seed` pour le générateur. */
export interface QuestionDraw {
  readonly random: number;
  readonly seed: number;
}

/**
 * Choisit la prochaine question (poids : adaptive.ts). Évite de reposer la même notion deux fois
 * de suite quand le chapitre en propose plusieurs. `lastPracticed` : jour de dernière pratique de
 * chaque notion (espacement).
 */
export function nextQuestion(
  s: TrainingState,
  states: ReadonlyMap<string, SkillState>,
  today: string,
  { random, seed }: QuestionDraw,
  lastPracticed: ReadonlyMap<string, string | null> = new Map(),
): PlannedQuestion {
  if (s.pendingVariant) return { ...s.pendingVariant, seed, variant: true };
  const last = s.answers.at(-1)?.skillId;
  const pool = s.skills.length > 1 ? s.skills.filter((id) => id !== last) : s.skills;
  const weights = pool.map((id) => skillWeight(states.get(id), today, lastPracticed.get(id)));
  const total = weights.reduce((a, b) => a + b, 0);
  let pick = random * total;
  let skillId = pool[0] ?? '';
  for (let i = 0; i < pool.length; i++) {
    pick -= weights[i] ?? 0;
    if (pick < 0) {
      skillId = pool[i] ?? skillId;
      break;
    }
  }
  return { skillId, level: s.levels[skillId] ?? 1, seed, variant: false };
}

/** Niveau après une série réussie / ratée (borné à 1 et au niveau maximal de la notion). */
const levelUp = (level: Level, max: Level): Level => Math.min(max, level + 1) as Level;
const levelDown = (level: Level): Level => Math.max(1, level - 1) as Level;

/** Enregistre une réponse : adapte le niveau (3 justes → +1, 2 fausses → −1) et prévoit la variante. */
export function recordAnswer(s: TrainingState, q: PlannedQuestion, correct: boolean): TrainingState {
  const answers = [...s.answers, { skillId: q.skillId, level: q.level, variant: q.variant, correct }];
  const ofSkill = answers.filter((a) => a.skillId === q.skillId);
  const lastTwo = ofSkill.slice(-2);
  let level = s.levels[q.skillId] ?? 1;
  // Niveau 1 vite passé (2 réussites d'affilée), niveau 2 → 3 après 3 réussites.
  const needed = level === 1 ? 2 : 3;
  const streak = ofSkill.slice(-needed);
  if (streak.length === needed && streak.every((a) => a.correct && a.level === level))
    level = levelUp(level, s.maxLevels?.[q.skillId] ?? 3);
  else if (lastTwo.length === 2 && lastTwo.every((a) => !a.correct)) level = levelDown(level);
  const pendingVariant =
    !correct && !q.variant && variantCount({ ...s, answers }) < MAX_VARIANTS
      ? { skillId: q.skillId, level: q.level }
      : null;
  return { ...s, answers, levels: { ...s.levels, [q.skillId]: level }, pendingVariant };
}

/** Bilan par notion, sur les questions régulières et les variantes. */
export function perSkill(s: TrainingState): Map<string, { answered: number; correct: number; answers: boolean[] }> {
  const out = new Map<string, { answered: number; correct: number; answers: boolean[] }>();
  for (const a of s.answers) {
    const cur = out.get(a.skillId) ?? { answered: 0, correct: 0, answers: [] };
    cur.answered++;
    if (a.correct) cur.correct++;
    cur.answers.push(a.correct);
    out.set(a.skillId, cur);
  }
  return out;
}
