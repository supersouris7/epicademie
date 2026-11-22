import type { CompetenceState } from '@questeo/shared';
import { DOMAIN_ORDER, EVALUATION } from './constants.ts';

/** Compétence d'un bilan, pour les calculs de maîtrise et de couverture (§7). */
export interface ScoredCompetence {
  readonly id: string;
  readonly domain: string;
  readonly essential: boolean;
  /** Dans le périmètre noté S (sinon elle ne compte que dans le programme Π). */
  readonly scored: boolean;
  readonly state: CompetenceState;
  /** Déclarée « vue en classe » (Progression, Maîtres). */
  readonly studied?: boolean;
}

export const competenceWeight = (c: Pick<ScoredCompetence, 'essential'>): number =>
  c.essential ? EVALUATION.weights.essential : EVALUATION.weights.other;

/** Valeur d'un état dans la maîtrise ; null pour les états 1 à 3 (non évaluée). */
export function stateValue(state: CompetenceState): number | null {
  switch (state) {
    case 'maitrisee':
    case 'a-consolider':
    case 'en-cours':
    case 'en-difficulte':
      return EVALUATION.stateValue[state];
    default:
      return null;
  }
}

export const isEvaluated = (state: CompetenceState): boolean => stateValue(state) !== null;

const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);

export interface Scores {
  /** 0–100 non arrondi ; null si rien n'est évalué. */
  readonly mastery: number | null;
  /** M peut être montrée (au moins 4 points de poids évalués). */
  readonly masteryDisplayable: boolean;
  readonly coverage: number;
  /** Part du programme étudiée (0–100), null si la notion ne s'applique pas. */
  readonly studied: number | null;
  readonly counts: {
    readonly evaluated: number;
    readonly mastered: number;
    readonly inProgress: number;
    readonly struggling: number;
  };
}

/** Maîtrise M, couverture C et part étudiée T sur un ensemble de compétences du programme Π. */
export function computeScores(program: readonly ScoredCompetence[], trackStudied = false): Scores {
  const evaluated = program.filter((c) => c.scored && isEvaluated(c.state));
  const evalWeight = sum(evaluated.map(competenceWeight));
  const programWeight = sum(program.map(competenceWeight));
  const mastery =
    evalWeight > 0
      ? (sum(evaluated.map((c) => competenceWeight(c) * (stateValue(c.state) ?? 0))) / evalWeight) * 100
      : null;
  const studiedWeight = sum(program.filter((c) => c.studied).map(competenceWeight));
  return {
    mastery,
    masteryDisplayable: evalWeight >= EVALUATION.minWeightForMastery,
    coverage: programWeight > 0 ? (evalWeight / programWeight) * 100 : 0,
    studied: trackStudied && programWeight > 0 ? (studiedWeight / programWeight) * 100 : null,
    counts: {
      evaluated: evaluated.length,
      mastered: evaluated.filter((c) => c.state === 'maitrisee').length,
      inProgress: evaluated.filter((c) => c.state === 'en-cours' || c.state === 'a-consolider').length,
      struggling: evaluated.filter((c) => c.state === 'en-difficulte').length,
    },
  };
}

export interface DomainScores {
  readonly domain: string;
  readonly mastery: number | null;
  readonly coverage: number;
}

/** Mêmes formules restreintes à chaque domaine (ordre N, G, E, D, F, I). */
export function scoresByDomain(program: readonly ScoredCompetence[]): DomainScores[] {
  const known = (d: string) => {
    const i = (DOMAIN_ORDER as readonly string[]).indexOf(d);
    return i < 0 ? DOMAIN_ORDER.length : i;
  };
  const domains = [...new Set(program.map((c) => c.domain))].toSorted((a, b) => known(a) - known(b));
  return domains.map((domain) => {
    const s = computeScores(program.filter((c) => c.domain === domain));
    return { domain, mastery: s.mastery, coverage: s.coverage };
  });
}

/** Affichage : arrondi au multiple de 5 % le plus proche. */
export const roundDisplay = (percent: number): number =>
  Math.round(percent / EVALUATION.displayStep) * EVALUATION.displayStep;

/** Bilan des Maîtres : complet seulement à ≥ 90 % de couverture et toutes les essentielles évaluées. */
export function maitresTitle(program: readonly ScoredCompetence[]): { full: boolean; coverage: number } {
  const { coverage } = computeScores(program);
  const essentialsDone = program
    .filter((c) => c.essential && c.state !== 'non-etudiee')
    .every((c) => c.scored && isEvaluated(c.state));
  return { full: coverage >= EVALUATION.maitresFullCoverage && essentialsDone, coverage };
}

/* ---------- Comparabilité (§7.2, §7.3) ---------- */

export interface BilanMeta {
  readonly subject: string;
  readonly referentialGrade: string;
  readonly referentialVersion: number;
}

export const comparable = (a: BilanMeta, b: BilanMeta): boolean =>
  a.subject === b.subject && a.referentialGrade === b.referentialGrade && a.referentialVersion === b.referentialVersion;

export type ProgressCategory = 'newly-mastered' | 'resolved' | 'persistent' | 'regression' | 'stable' | 'other';

export function progressCategory(before: CompetenceState | null, after: CompetenceState): ProgressCategory {
  if (after === 'maitrisee' && before !== 'maitrisee') return 'newly-mastered';
  if (before === 'en-difficulte' && after === 'en-difficulte') return 'persistent';
  if (
    ((before === 'maitrisee' || before === 'a-consolider') && after === 'en-difficulte') ||
    (before === 'maitrisee' && after === 'a-consolider')
  )
    return 'regression';
  if (before === 'en-difficulte' && (after === 'en-cours' || after === 'a-consolider')) return 'resolved';
  if (before === after) return 'stable';
  return 'other';
}

export interface BilanCompetence {
  readonly id: string;
  readonly essential: boolean;
  readonly state: CompetenceState;
}

export interface Progress {
  /** Compétences évaluées dans les deux bilans. */
  readonly common: number;
  /** Maîtrise des bilans recalculée sur l'intersection (0–100). */
  readonly masteryBefore: number | null;
  readonly masteryAfter: number | null;
  readonly newlyMastered: readonly string[];
  readonly resolved: readonly string[];
  readonly persistent: readonly string[];
  readonly regressions: readonly string[];
}

/**
 * Compare le bilan `after` au bilan comparable précédent `before` (l'appelant a vérifié
 * `comparable`). Null : « pas encore comparable » (moins de 3 compétences communes).
 * « Nouvelle acquise » compte aussi une compétence évaluée pour la première fois.
 */
export function compareBilans(before: readonly BilanCompetence[], after: readonly BilanCompetence[]): Progress | null {
  const prior = new Map(before.filter((c) => isEvaluated(c.state)).map((c) => [c.id, c]));
  const current = after.filter((c) => isEvaluated(c.state));
  const common = current.filter((c) => prior.has(c.id));
  if (common.length < EVALUATION.minCommon) return null;
  const ids = (list: readonly BilanCompetence[], cat: ProgressCategory) =>
    list.filter((c) => progressCategory(prior.get(c.id)?.state ?? null, c.state) === cat).map((c) => c.id);
  const masteryOf = (list: readonly BilanCompetence[]) => {
    const asScored = list.map((c) => ({ ...c, domain: '', scored: true }));
    return computeScores(asScored).mastery;
  };
  const newlyMastered = current
    .filter((c) => progressCategory(prior.get(c.id)?.state ?? null, c.state) === 'newly-mastered')
    .map((c) => c.id);
  return {
    common: common.length,
    masteryBefore: masteryOf(common.flatMap((c) => prior.get(c.id) ?? [])),
    masteryAfter: masteryOf(common),
    newlyMastered,
    resolved: ids(common, 'resolved'),
    persistent: ids(common, 'persistent'),
    regressions: ids(common, 'regression'),
  };
}
