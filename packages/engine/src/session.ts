import type { Level } from '@questeo/shared';
import { isDue, type SkillState } from './srs.ts';

/**
 * Déroulé d’une série d’Entraînement : 4 questions régulières (5 pour le calcul de tête, très court),
 * plus une variante immédiate (même notion, même niveau, nouvelle graine) après chaque erreur.
 */
export const TRAINING_LENGTH = 5;
export const SHORT_TRAINING_LENGTH = 4;

/** Longueur d'une série : 5 si toutes les notions sont du calcul de tête, sinon 4. */
export const seriesLength = (allMental: boolean) => (allMental ? TRAINING_LENGTH : SHORT_TRAINING_LENGTH);
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
  /** Variante à proposer juste après une erreur. */
  readonly pendingVariant: { skillId: string; level: Level } | null;
  /** Questions régulières de la série (4, ou 5 en calcul de tête). */
  readonly length: number;
}

/** Niveau de départ selon l'avancement de la notion. */
export function startLevel(state: SkillState | undefined): Level {
  if (!state || state.stage <= 1) return 1;
  return 2;
}

export function startTraining(
  skills: readonly string[],
  states: ReadonlyMap<string, SkillState>,
  length: number = TRAINING_LENGTH,
): TrainingState {
  if (skills.length === 0) throw new Error('Aucune notion à travailler');
  const levels: Record<string, Level> = {};
  for (const id of skills) levels[id] = startLevel(states.get(id));
  return { skills, answers: [], levels, pendingVariant: null, length };
}

export const regularCount = (s: TrainingState) => s.answers.filter((a) => !a.variant).length;
export const variantCount = (s: TrainingState) => s.answers.filter((a) => a.variant).length;

export function isFinished(s: TrainingState): boolean {
  return regularCount(s) >= s.length && s.pendingVariant === null;
}

/** Poids de tirage d'une notion : prioriser les nouvelles, échues et fragiles. */
export function skillWeight(state: SkillState | undefined, today: string): number {
  if (state?.due == null) return 3;
  if (isDue(state, today) || state.stage === 0) return 3;
  if (state.stage < 3) return 2;
  return 1;
}

/**
 * Choisit la prochaine question. `random` ∈ [0, 1) pour le tirage pondéré, `seed` pour le générateur.
 * Évite de reposer la même notion deux fois de suite quand le chapitre en propose plusieurs.
 */
export function nextQuestion(
  s: TrainingState,
  states: ReadonlyMap<string, SkillState>,
  today: string,
  random: number,
  seed: number,
): PlannedQuestion {
  if (s.pendingVariant) return { ...s.pendingVariant, seed, variant: true };
  const last = s.answers.at(-1)?.skillId;
  const pool = s.skills.length > 1 ? s.skills.filter((id) => id !== last) : s.skills;
  const weights = pool.map((id) => skillWeight(states.get(id), today));
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

/** Enregistre une réponse : adapte le niveau (3 justes → +1, 2 fausses → −1) et prévoit la variante. */
export function recordAnswer(s: TrainingState, q: PlannedQuestion, correct: boolean): TrainingState {
  const answers = [...s.answers, { skillId: q.skillId, level: q.level, variant: q.variant, correct }];
  const ofSkill = answers.filter((a) => a.skillId === q.skillId);
  const lastTwo = ofSkill.slice(-2);
  let level = s.levels[q.skillId] ?? 1;
  // Niveau 1 vite passé (2 réussites d'affilée), niveau 2 → 3 après 3 réussites.
  const needed = level === 1 ? 2 : 3;
  const streak = ofSkill.slice(-needed);
  if (streak.length === needed && streak.every((a) => a.correct && a.level === level) && level < 3)
    level = (level + 1) as Level;
  else if (lastTwo.length === 2 && lastTwo.every((a) => !a.correct) && level > 1) level = (level - 1) as Level;
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
