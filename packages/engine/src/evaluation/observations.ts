import type { CompetenceState, Level } from '@epicademie/shared';
import { EVALUATION } from './constants.ts';

/** Origine d'une observation : l'épreuve, un mode solo, un mode à plusieurs, ou écartée (poids 0). */
export type ObservationSource = keyof typeof EVALUATION.observation.sourceWeight;

/**
 * Une observation = une première réponse individuelle sans aide (ADR 0013). Second essai, indice
 * et réponse collective sont écartés par l'appelant (source `none`).
 */
export interface Observation {
  readonly skillId: string;
  readonly source: ObservationSource;
  readonly correct: boolean;
  readonly level: Level;
  /** Jour de la réponse, `AAAA-MM-JJ` (fuseau de la famille). */
  readonly day: string;
}

export const daysBetween = (from: string, to: string): number =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/** Fraîcheur d'une observation selon son âge (§3.1) : l'Arène vieillit moins vite que le reste. */
export function freshness(source: ObservationSource, ageDays: number): number {
  if (ageDays > 180) return 0;
  if (source === 'evaluation') return ageDays <= 90 ? 1 : 0.5;
  if (ageDays <= 30) return 1;
  return ageDays <= 90 ? 0.5 : 0;
}

/** Poids = source × fraîcheur, au jour `today`. */
export const observationWeight = (o: Observation, today: string): number =>
  EVALUATION.observation.sourceWeight[o.source] * freshness(o.source, daysBetween(o.day, today));

/** Grandeurs d'une compétence (§3.2). */
export interface CompetenceStats {
  /** P : somme des poids. */
  readonly weight: number;
  /** Pa : part venant de l'Arène. */
  readonly arenaWeight: number;
  /** Pe : part venant des autres modes. */
  readonly otherWeight: number;
  /** R : réussite pondérée (null si P = 0). */
  readonly rate: number | null;
  /** n : observations de poids non nul. */
  readonly count: number;
  /** j : jours distincts. */
  readonly days: number;
  /** Jours distincts hors Arène. */
  readonly otherDays: number;
  readonly correctCount: number;
  /** Une observation juste de niveau ≥ 2 et de poids non nul. */
  readonly level2Proof: boolean;
  /** Âge (jours) de l'observation non nulle la plus récente. */
  readonly lastAgeDays: number | null;
  /** Une observation d'Arène de moins de 90 jours. */
  readonly recentArena: boolean;
  /** La dernière observation d'Arène (non nulle) est juste (null s'il n'y en a pas). */
  readonly lastArenaCorrect: boolean | null;
}

/** `observations` du plus ancien au plus récent ; seules les 20 plus récentes sont lues. */
export function competenceStats(observations: readonly Observation[], today: string): CompetenceStats {
  const ordered = observations
    .map((o, i) => ({ o, i }))
    .toSorted((a, b) => (a.o.day < b.o.day ? -1 : a.o.day > b.o.day ? 1 : a.i - b.i))
    .map((x) => x.o)
    .slice(-EVALUATION.observation.maxPerCompetence);
  let weight = 0;
  let arenaWeight = 0;
  let good = 0;
  let count = 0;
  let correctCount = 0;
  let level2Proof = false;
  let recentArena = false;
  let lastArenaCorrect: boolean | null = null;
  let lastAge: number | null = null;
  const days = new Set<string>();
  const otherDays = new Set<string>();
  for (const o of ordered) {
    const w = observationWeight(o, today);
    if (w === 0) continue;
    const age = daysBetween(o.day, today);
    weight += w;
    good += o.correct ? w : 0;
    count++;
    days.add(o.day);
    if (o.correct) correctCount++;
    if (o.correct && o.level >= 2) level2Proof = true;
    if (lastAge === null || age <= lastAge) lastAge = age;
    if (o.source === 'evaluation') {
      arenaWeight += w;
      lastArenaCorrect = o.correct;
      if (age <= EVALUATION.sufficient.arenaDays) recentArena = true;
    } else otherDays.add(o.day);
  }
  return {
    weight,
    arenaWeight,
    otherWeight: weight - arenaWeight,
    rate: weight > 0 ? good / weight : null,
    count,
    days: days.size,
    otherDays: otherDays.size,
    correctCount,
    level2Proof,
    lastAgeDays: lastAge,
    recentArena,
    lastArenaCorrect,
  };
}

/** Règle « observations suffisantes » (§3.3). */
export function isSufficient(s: CompetenceStats): boolean {
  const k = EVALUATION.sufficient;
  if (s.weight < k.minWeight || s.count < k.minCount) return false;
  return s.recentArena || (s.otherWeight >= k.othersWeight && s.otherDays >= k.othersDays);
}

export interface StateInput {
  readonly stats: CompetenceStats;
  /** Chapitre déclaré « pas encore vu » cette année et non montré acquis. */
  readonly notStudied?: boolean;
  /** Toutes les notions du chapitre sont désactivées (maintenance). */
  readonly disabled?: boolean;
  /** « Maîtrisée » dans le dernier bilan comparable. */
  readonly previouslyMastered?: boolean;
}

/** Arbre de décision des 7 états (§4), évalué dans l'ordre. */
export function competenceState({ stats, notStudied, disabled, previouslyMastered }: StateInput): CompetenceState {
  if (notStudied) return 'non-etudiee';
  if (disabled || stats.weight === 0 || stats.rate === null) return 'non-evaluee';
  if (!isSufficient(stats)) return 'evaluation-insuffisante';
  const k = EVALUATION.state;
  if (stats.rate < k.difficulty) return 'en-difficulte';
  const mastered =
    stats.rate >= k.mastered &&
    stats.correctCount >= k.minCorrect &&
    stats.level2Proof &&
    stats.lastArenaCorrect !== false &&
    (stats.lastAgeDays ?? Infinity) <= k.masteredMaxAgeDays;
  if (mastered) return 'maitrisee';
  if (stats.rate >= k.mastered || previouslyMastered) return 'a-consolider';
  return 'en-cours';
}
