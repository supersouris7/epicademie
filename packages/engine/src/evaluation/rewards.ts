import type { ChestRarity, EvaluationKind } from '@questeo/shared';
import { ECONOMY } from '../economy.ts';

/** Bilan terminé et récompensé d'une même matière, vu depuis l'épreuve qu'on clôt. */
export interface EarlierEvaluation {
  readonly kind: EvaluationKind;
  /** Jours écoulés depuis sa fin. */
  readonly daysAgo: number;
  readonly sameSchoolYear: boolean;
  /** Avait reçu la récompense complète (coffre). */
  readonly rewarded: boolean;
}

/** Période récompensée : Origines/Maîtres 1×/année scolaire, Progression tous les 14 jours. */
export function inRewardPeriod(kind: EvaluationKind, earlier: readonly EarlierEvaluation[]): boolean {
  const same = earlier.filter((e) => e.kind === kind && e.rewarded);
  if (kind === 'progression') return !same.some((e) => e.daysAgo < ECONOMY.evaluation.progressionCooldownDays);
  return !same.some((e) => e.sameSchoolYear);
}

export interface RewardInput {
  readonly kind: EvaluationKind;
  readonly inPeriod: boolean;
  readonly partial: boolean;
  /** Jours depuis le bilan précédent de la matière (null : aucun). */
  readonly daysSinceLast: number | null;
  /** Compétences maîtrisées pour la première fois de l'année scolaire. */
  readonly newlyMastered: number;
}

export interface EvaluationReward {
  readonly xp: number;
  readonly chest: ChestRarity | null;
  /** Détail : participation, régularité, progrès. */
  readonly participationXp: number;
  readonly regularityXp: number;
  readonly progressXp: number;
}

/** Récompenses de clôture (§8) : forfaitaires, aucune XP par bonne réponse ni bonus de vitesse. */
export function evaluationRewards(i: RewardInput): EvaluationReward {
  const e = ECONOMY.evaluation;
  const participationXp = i.inPeriod ? e.participationXp : e.reducedXp;
  const regularityXp =
    i.inPeriod && i.kind === 'progression' && i.daysSinceLast !== null && i.daysSinceLast >= e.regularityDays
      ? e.regularityXp
      : 0;
  const progressXp = Math.min(e.masteredCapXp, i.newlyMastered * e.masteredXp);
  const chest = i.inPeriod ? (i.partial ? e.chest : e.chestPersevering) : null;
  return { xp: participationXp + regularityXp + progressXp, chest, participationXp, regularityXp, progressXp };
}
