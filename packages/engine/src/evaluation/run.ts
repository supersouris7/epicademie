import type { CompetenceState, EvaluationKind, EvaluationRole, Level, StudiedStatus } from '@epicademie/shared';
import { DOMAIN_ORDER, EVALUATION } from './constants.ts';
import {
  competenceState,
  competenceStats,
  isSufficient,
  type CompetenceStats,
  type Observation,
} from './observations.ts';
import {
  computeScores,
  isEvaluated,
  scoresByDomain,
  type DomainScores,
  type ScoredCompetence,
  type Scores,
} from './scores.ts';

/**
 * Déroulé d'une épreuve (docs/ARENE-EVALUATION.md §5) : fonctions pures sur un état JSON
 * sérialisable. Le serveur le stocke après chaque réponse (reprise exacte, ADR 0009) ; il tire
 * seul les graines (`assignSeed`, `pickSeed`) et ne montre jamais juste/faux pendant l'épreuve.
 * Interprétations : `max` plafonne le total explorations comprises ; `min` ne fait que relever
 * le besoin des petits programmes (jamais de question redondante au-delà de 3 par compétence).
 */

/** Version du format de l'état stocké (un état d'une autre version clôt l'épreuve). */
export const EVALUATION_STATE_VERSION = 1;

/** Compétence telle que le serveur la décrit au lancement (tirée du référentiel et de l'historique). */
export interface PlanCompetence {
  readonly id: string;
  readonly domain: string;
  readonly essential: boolean;
  /** Notions actives du chapitre, dans l'ordre du chapitre (vide : tout est désactivé). */
  readonly skills: readonly string[];
  /** Dans le périmètre noté S (sinon elle ne compte que dans le programme Π). */
  readonly scored: boolean;
  readonly studied?: StudiedStatus;
  /** État dans le dernier bilan comparable. */
  readonly priorState?: CompetenceState | null;
  /** Prérequis principal (exploré si cette compétence essentielle est en difficulté). */
  readonly primaryPrerequisite?: string | null;
  /** Observations antérieures (≤ 180 jours), du plus ancien au plus récent. */
  readonly observations: readonly Observation[];
}

export interface PlanInput {
  readonly kind: EvaluationKind;
  /** Jour de l'épreuve `AAAA-MM-JJ`. */
  readonly today: string;
  readonly nowMs: number;
  /** Programme concerné Π, dans l'ordre du programme. */
  readonly program: readonly PlanCompetence[];
  /** Compétences de prérequis explorables (classes N−1 ou N−2). */
  readonly prerequisitePool: readonly PlanCompetence[];
  /** Compétences hors périmètre pour les avancées. */
  readonly advancedPool: readonly PlanCompetence[];
}

export interface EvalAnswer {
  readonly skillId: string;
  readonly level: Level;
  readonly seed: number;
  readonly correct: boolean;
  /** « Je ne sais pas » : observation fausse. */
  readonly dontKnow: boolean;
}

interface EvalCompetence extends PlanCompetence {
  readonly role: EvaluationRole;
  /** Questions notées prévues (0 : non interrogée). */
  readonly need: number;
  readonly answers: readonly EvalAnswer[];
  /** EvaluationQuestion de niveau 2 supplémentaire déjà posée (preuve manquante). */
  readonly proofAsked: boolean;
}

export type EvaluationPhase = 'score' | 'prerequis' | 'fin' | 'avance' | 'termine';
export type EvaluationEndReason = 'concluded' | 'time' | 'max' | 'discouraged';

export interface EvaluationQuestion {
  readonly competenceId: string;
  readonly skillId: string;
  readonly level: Level;
  /** Rang de la question (1 = première). */
  readonly index: number;
  readonly planned: number;
  readonly domain: string;
  readonly role: EvaluationRole;
  /** Tirée par le serveur (`assignSeed`). */
  readonly seed: number | null;
}

export interface EvaluationState {
  readonly v: typeof EVALUATION_STATE_VERSION;
  readonly kind: EvaluationKind;
  readonly today: string;
  readonly startedAt: number;
  readonly competences: readonly EvalCompetence[];
  readonly phase: EvaluationPhase;
  /** Questions posées et répondues, explorations comprises. */
  readonly asked: number;
  readonly planned: number;
  readonly errorsInRow: number;
  readonly pending: EvaluationQuestion | null;
  /** Compétences de prérequis à explorer, dans l'ordre. */
  readonly queue: readonly string[];
  readonly lastCompetenceId: string | null;
  readonly lastDomain: string | null;
  readonly endReason: EvaluationEndReason | null;
  readonly advanced: 'none' | 'acceptee' | 'refusee';
}

const isScoreRole = (c: EvalCompetence) => c.role === 'score';
const toObservation = (c: EvalCompetence, a: EvalAnswer, today: string): Observation => ({
  skillId: a.skillId,
  source: 'evaluation',
  correct: a.correct,
  level: a.level,
  day: today,
});
const statsOf = (c: EvalCompetence, today: string): CompetenceStats =>
  competenceStats([...c.observations, ...c.answers.map((a) => toObservation(c, a, today))], today);
const stateOf = (c: EvalCompetence, today: string): CompetenceState =>
  competenceState({
    stats: statsOf(c, today),
    notStudied: c.studied === 'pas-vu',
    disabled: c.skills.length === 0,
    previouslyMastered: c.priorState === 'maitrisee',
  });

/* ---------- Préparation (§5.1) ---------- */

/** Besoin d'une compétence : 1 vérification si déjà suffisamment observée, sinon 2. */
export function baseNeed(c: PlanCompetence, today: string): number {
  if (c.skills.length === 0) return 0;
  return isSufficient(competenceStats(c.observations, today)) ? EVALUATION.need.verified : EVALUATION.need.unverified;
}

/** Retient les compétences dans le budget : essentielles, jamais évaluées, preuve la plus ancienne, programme. */
function allocateNeeds(program: readonly PlanCompetence[], today: string): Map<string, number> {
  const rows = program
    .map((c, order) => ({
      c,
      order,
      need: c.scored ? baseNeed(c, today) : 0,
      stats: competenceStats(c.observations, today),
    }))
    .filter((r) => r.need > 0);
  const priority = [...rows].toSorted(
    (a, b) =>
      Number(b.c.essential) - Number(a.c.essential) ||
      Number(a.stats.weight > 0) - Number(b.stats.weight > 0) ||
      (b.stats.lastAgeDays ?? Infinity) - (a.stats.lastAgeDays ?? Infinity) ||
      a.order - b.order,
  );
  const needs = new Map<string, number>();
  let total = 0;
  for (const r of priority) {
    if (total + r.need > EVALUATION.questions.target) continue;
    needs.set(r.c.id, r.need);
    total += r.need;
  }
  // Petit programme : on approfondit (essentielles d'abord) jusqu'au minimum, sans dépasser 3 par compétence.
  const deepen = priority.filter((r) => needs.has(r.c.id));
  let progressed = true;
  while (total < EVALUATION.questions.min && progressed) {
    progressed = false;
    for (const r of deepen) {
      const n = needs.get(r.c.id) ?? 0;
      if (total >= EVALUATION.questions.min || n >= EVALUATION.maxPerCompetence) continue;
      needs.set(r.c.id, n + 1);
      total++;
      progressed = true;
    }
  }
  return needs;
}

export function createEvaluation(input: PlanInput): EvaluationState {
  const needs = allocateNeeds(input.program, input.today);
  const competences: EvalCompetence[] = [
    ...input.program.map((c) => ({
      ...c,
      role: 'score' as const,
      need: needs.get(c.id) ?? 0,
      answers: [],
      proofAsked: false,
    })),
    ...input.prerequisitePool.map((c) => ({
      ...c,
      scored: false,
      role: 'prerequis' as const,
      need: 0,
      answers: [],
      proofAsked: false,
    })),
    ...input.advancedPool.map((c) => ({
      ...c,
      scored: false,
      role: 'avance' as const,
      need: 0,
      answers: [],
      proofAsked: false,
    })),
  ];
  const planned = [...needs.values()].reduce((a, b) => a + b, 0);
  return {
    v: EVALUATION_STATE_VERSION,
    kind: input.kind,
    today: input.today,
    startedAt: input.nowMs,
    competences,
    phase: 'score',
    asked: 0,
    planned,
    errorsInRow: 0,
    pending: null,
    queue: [],
    lastCompetenceId: null,
    lastDomain: null,
    endReason: null,
    advanced: 'none',
  };
}

/** Une épreuve non terminée au-delà de 7 jours, ou d'un autre format, est expirée. */
export const isExpired = (state: { readonly v: number; readonly startedAt: number }, nowMs: number): boolean =>
  state.v !== EVALUATION_STATE_VERSION || nowMs - state.startedAt > EVALUATION.expiryDays * 86_400_000;

/* ---------- Choix de la question (§5.2, §5.3) ---------- */

const scoredAnswers = (s: EvaluationState) => s.competences.filter(isScoreRole).flatMap((c) => c.answers);

/** Niveau global : 2 par défaut ; après 4 réponses, 1 sous 40 % et 3 au-dessus de 80 %. */
export function globalLevel(answers: readonly Pick<EvalAnswer, 'correct'>[]): Level {
  if (answers.length < EVALUATION.globalLevelAfter) return 2;
  const rate = answers.filter((a) => a.correct).length / answers.length;
  if (rate < EVALUATION.globalLevelLow) return 1;
  return rate > EVALUATION.globalLevelHigh ? 3 : 2;
}

function startLevel(c: EvalCompetence, s: EvaluationState): Level {
  if (c.priorState === 'en-difficulte') return 1;
  if (c.priorState === 'maitrisee') return 3;
  return globalLevel(scoredAnswers(s));
}

/** Escalier : juste → niveau +1 (max 3), faux → −1 (min 1). */
export const stepLevel = (level: Level, correct: boolean): Level =>
  (correct ? Math.min(3, level + 1) : Math.max(1, level - 1)) as Level;

function levelFor(c: EvalCompetence, s: EvaluationState, forced: Level | null): Level {
  if (forced) return forced;
  if (s.errorsInRow >= EVALUATION.errorsToEase) return 1;
  if (s.asked < EVALUATION.warmupQuestions) return 1;
  const last = c.answers.at(-1);
  return last ? stepLevel(last.level, last.correct) : startLevel(c, s);
}

/** Besoin couvert et deux dernières réponses concordantes, ou 3 réponses posées. */
function needMet(c: EvalCompetence): boolean {
  const n = c.answers.length;
  if (c.need <= 0) return true;
  if (n >= EVALUATION.maxPerCompetence) return true;
  if (n < c.need) return false;
  if (n === 1) return true;
  return c.answers[n - 1]?.correct === c.answers[n - 2]?.correct;
}

/** Exception : bonne réussite sans preuve de niveau 2 → une question de niveau 2 en plus si le budget le permet. */
function needsProof(c: EvalCompetence, s: EvaluationState): boolean {
  if (c.proofAsked || c.answers.length === 0 || !needMet(c)) return false;
  if (s.asked >= EVALUATION.questions.target) return false;
  const stats = statsOf(c, s.today);
  return (stats.rate ?? 0) >= EVALUATION.state.mastered && !stats.level2Proof;
}

const isOpen = (c: EvalCompetence, s: EvaluationState) =>
  isScoreRole(c) && c.skills.length > 0 && c.need > 0 && (!needMet(c) || needsProof(c, s));

const domainRank = (d: string) => {
  const i = (DOMAIN_ORDER as readonly string[]).indexOf(d);
  return i < 0 ? DOMAIN_ORDER.length : i;
};

/** Notion : pas encore posée, la moins observée récemment ; à défaut la moins posée. */
function pickSkill(c: EvalCompetence, s: EvaluationState): string {
  const posed = new Map<string, number>();
  for (const x of s.competences) for (const a of x.answers) posed.set(a.skillId, (posed.get(a.skillId) ?? 0) + 1);
  const seen = (id: string) => c.observations.filter((o) => o.skillId === id).length;
  const ranked = c.skills
    .map((id, order) => ({ id, order, posed: posed.get(id) ?? 0, seen: seen(id) }))
    .toSorted((a, b) => a.posed - b.posed || a.seen - b.seen || a.order - b.order);
  return (ranked[0] as { id: string }).id;
}

function pickScored(s: EvaluationState): { c: EvalCompetence; forced: Level | null } | null {
  let open = s.competences.filter((c) => isOpen(c, s));
  if (open.length === 0) return null;
  const others = open.filter((c) => c.id !== s.lastCompetenceId);
  if (others.length > 0) open = others;
  if (s.errorsInRow >= EVALUATION.errorsToEase) {
    const elsewhere = open.filter((c) => c.domain !== s.lastDomain);
    if (elsewhere.length > 0) open = elsewhere;
  }
  const count = new Map<string, number>();
  for (const c of s.competences) if (isScoreRole(c)) count.set(c.domain, (count.get(c.domain) ?? 0) + c.answers.length);
  const domain = [...new Set(open.map((c) => c.domain))].toSorted(
    (a, b) => (count.get(a) ?? 0) - (count.get(b) ?? 0) || domainRank(a) - domainRank(b),
  )[0];
  const priority = (c: EvalCompetence) => {
    const stats = statsOf(c, s.today);
    const old = stats.lastAgeDays === null || stats.lastAgeDays > 90;
    const remaining = Math.max(1, c.need - c.answers.length);
    return 10 * Number(c.essential) + 3 * remaining + 2 * Number(old);
  };
  const best = open
    .filter((c) => c.domain === domain)
    .map((c) => ({ c, p: priority(c), order: s.competences.indexOf(c) }))
    .toSorted((a, b) => b.p - a.p || a.order - b.order)[0] as { c: EvalCompetence };
  return { c: best.c, forced: needsProof(best.c, s) ? 2 : null };
}

const question = (s: EvaluationState, c: EvalCompetence, level: Level): EvaluationQuestion => ({
  competenceId: c.id,
  skillId: pickSkill(c, s),
  level,
  index: s.asked + 1,
  planned: Math.max(s.planned, s.asked + 1),
  domain: c.domain,
  role: c.role,
  seed: null,
});

/* ---------- Explorations hors score (§5.4) ---------- */

/** Une essentielle est « en difficulté » : conclue ainsi, ou 2 erreurs sur 2. */
function struggling(c: EvalCompetence, today: string, lenient: boolean): boolean {
  if (c.answers.length === 0) return false;
  // Arrêt de protection : une seule erreur sur une essentielle suffit à chercher ses points forts en amont.
  if (lenient) return c.answers.every((a) => !a.correct);
  if (c.answers.length >= 2 && c.answers.slice(0, 2).every((a) => !a.correct)) return true;
  return needMet(c) && stateOf(c, today) === 'en-difficulte';
}

function leaveScore(s: EvaluationState, reason: EvaluationEndReason): EvaluationState {
  const wanted: string[] = [];
  for (const c of s.competences) {
    const target = c.primaryPrerequisite;
    if (!isScoreRole(c) || !c.essential || !target || wanted.includes(target)) continue;
    if (!s.competences.some((x) => x.id === target && x.role === 'prerequis' && x.skills.length > 0)) continue;
    if (struggling(c, s.today, reason === 'discouraged')) wanted.push(target);
  }
  const queue = wanted.slice(0, EVALUATION.exploration.maxPrerequisites);
  return { ...s, phase: queue.length > 0 ? 'prerequis' : 'fin', queue, endReason: reason };
}

const explored = (s: EvaluationState, role: EvaluationRole) =>
  s.competences.filter((c) => c.role === role).reduce((n, c) => n + c.answers.length, 0);

/** Réussite globale sur les questions notées (« Je ne sais pas » compris). */
export function globalRate(s: EvaluationState): number {
  const all = scoredAnswers(s);
  return all.length === 0 ? 0 : all.filter((a) => a.correct).length / all.length;
}

export const canOfferAdvanced = (s: EvaluationState): boolean =>
  s.phase === 'fin' &&
  s.advanced === 'none' &&
  s.endReason === 'concluded' &&
  s.asked < EVALUATION.questions.max &&
  globalRate(s) >= EVALUATION.exploration.advancedMinRate &&
  s.competences.some((c) => c.role === 'avance' && c.skills.length > 0);

/** L'élève accepte ou refuse le « Défi bonus ». */
export function chooseAdvanced(s: EvaluationState, accept: boolean): EvaluationState {
  if (!canOfferAdvanced(s)) return s;
  return accept ? { ...s, advanced: 'acceptee', phase: 'avance' } : { ...s, advanced: 'refusee', phase: 'termine' };
}

/* ---------- Avancement ---------- */

export type EvaluationNext =
  | { readonly done: false; readonly state: EvaluationState; readonly question: EvaluationQuestion }
  | { readonly done: true; readonly state: EvaluationState; readonly canExploreAdvanced: boolean };

/** EvaluationQuestion en attente (idempotent : la même tant qu'elle n'a pas reçu de réponse) ou fin. */
export function nextEvaluationQuestion(state: EvaluationState, nowMs: number): EvaluationNext {
  if (state.pending) return { done: false, state, question: state.pending };
  let s = state;
  if (s.phase === 'score') {
    const pick = pickScored(s);
    const elapsed = nowMs - s.startedAt >= EVALUATION.maxDurationMs;
    if (s.errorsInRow >= EVALUATION.errorsToStop) s = leaveScore(s, 'discouraged');
    else if (s.asked >= EVALUATION.questions.max) s = leaveScore(s, 'max');
    else if (elapsed && pick) s = leaveScore(s, 'time');
    else if (!pick) s = leaveScore(s, 'concluded');
    else {
      const q = question(s, pick.c, levelFor(pick.c, s, pick.forced));
      return { done: false, state: { ...s, pending: q }, question: q };
    }
  }
  if (s.phase === 'prerequis') {
    const c = s.queue
      .map((id) => s.competences.find((x) => x.id === id && x.role === 'prerequis'))
      .find((x) => x && x.answers.length < EVALUATION.exploration.questionsPerPrerequisite);
    if (c && s.asked < EVALUATION.questions.max) {
      const q = question(s, c, c.answers.length === 0 ? 1 : 2);
      return { done: false, state: { ...s, pending: q }, question: q };
    }
    s = { ...s, phase: 'fin' };
  }
  if (s.phase === 'avance') {
    const limit = EVALUATION.exploration.maxAdvanced;
    const c = s.competences.find(
      (x) =>
        x.role === 'avance' && x.skills.length > 0 && x.answers.length < EVALUATION.exploration.questionsPerAdvanced,
    );
    if (c && explored(s, 'avance') < limit && s.asked < EVALUATION.questions.max) {
      const last = c.answers.at(-1);
      const q = question(s, c, last ? stepLevel(last.level, last.correct) : 2);
      return { done: false, state: { ...s, pending: q }, question: q };
    }
    s = { ...s, phase: 'termine' };
  }
  return { done: true, state: s, canExploreAdvanced: canOfferAdvanced(s) };
}

/** Le serveur fixe la graine de la question en attente (après `pickSeed`). */
export function assignSeed(state: EvaluationState, seed: number): EvaluationState {
  return state.pending ? { ...state, pending: { ...state.pending, seed } } : state;
}

/**
 * Tire une graine non vue récemment (5 essais au plus ; le dernier tirage est gardé même s'il a
 * été vu, pour ne jamais bloquer une notion à peu d'énoncés).
 */
export function pickSeed(draw: () => number, wasRecent: (seed: number) => boolean): number {
  let seed = draw();
  for (let i = 1; i < EVALUATION.seedAttempts && wasRecent(seed); i++) seed = draw();
  return seed;
}

export interface EvaluationGivenAnswer {
  readonly skillId: string;
  readonly level: Level;
  readonly seed: number;
  readonly correct: boolean;
  readonly dontKnow?: boolean;
}

export type EvaluationRecorded =
  | { readonly ok: true; readonly state: EvaluationState }
  | { readonly ok: false; readonly reason: 'no-pending' | 'unexpected-question' };

/** Enregistre la réponse à la question en attente ; toute autre question est refusée. */
export function recordEvaluationAnswer(state: EvaluationState, given: EvaluationGivenAnswer): EvaluationRecorded {
  const q = state.pending;
  if (!q) return { ok: false, reason: 'no-pending' };
  if (q.skillId !== given.skillId || q.level !== given.level || (q.seed !== null && q.seed !== given.seed))
    return { ok: false, reason: 'unexpected-question' };
  const correct = given.correct && !given.dontKnow;
  const answer: EvalAnswer = {
    skillId: q.skillId,
    level: q.level,
    seed: given.seed,
    correct,
    dontKnow: given.dontKnow ?? false,
  };
  const competences = state.competences.map((c) => {
    if (c.id !== q.competenceId || c.role !== q.role) return c;
    const extra = isScoreRole(c) && needMet(c) && c.answers.length > 0;
    return { ...c, answers: [...c.answers, answer], proofAsked: c.proofAsked || extra };
  });
  return {
    ok: true,
    state: {
      ...state,
      competences,
      asked: state.asked + 1,
      errorsInRow: q.role === 'score' ? (correct ? 0 : state.errorsInRow + 1) : state.errorsInRow,
      pending: null,
      lastCompetenceId: q.competenceId,
      lastDomain: q.domain,
    },
  };
}

/* ---------- Clôture : bilan figé ---------- */

export interface CompetenceResult {
  readonly id: string;
  readonly role: EvaluationRole;
  readonly domain: string;
  readonly essential: boolean;
  /** Dans le périmètre noté S (sinon, simple élément du programme). */
  readonly scored: boolean;
  readonly state: CompetenceState;
  /** R × 100 ; null sans observation. */
  readonly rate: number | null;
  /** P × 10. */
  readonly weight: number;
  readonly arenaAnswers: number;
  /** Notion la plus fragile (la plus ratée dans l'épreuve), pour les recommandations. */
  readonly weakestSkillId: string | null;
  /** Prérequis à retravailler (exploration en difficulté). */
  readonly toRework: boolean;
}

export interface EvaluationOutcome {
  readonly kind: EvaluationKind;
  readonly partial: boolean;
  readonly scores: Scores;
  readonly domains: readonly DomainScores[];
  readonly competences: readonly CompetenceResult[];
  /** Compétences du programme : non étudiées, et non évaluées (ni étudiées-évaluées). */
  readonly notStudied: readonly string[];
  readonly notEvaluated: readonly string[];
  readonly questions: number;
}

function weakest(c: EvalCompetence): string | null {
  const wrong = new Map<string, number>();
  for (const a of c.answers) if (!a.correct) wrong.set(a.skillId, (wrong.get(a.skillId) ?? 0) + 1);
  return [...wrong.entries()].toSorted((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

/** Bilan d'une épreuve terminée, ou arrêtée (l'appelant décide quand clore). */
export function summarize(state: EvaluationState): EvaluationOutcome {
  const rows: CompetenceResult[] = state.competences
    .filter((c) => c.role === 'score' || c.answers.length > 0)
    .map((c) => {
      const stats = statsOf(c, state.today);
      const st = stateOf(c, state.today);
      return {
        id: c.id,
        role: c.role,
        domain: c.domain,
        essential: c.essential,
        scored: c.scored,
        state: st,
        rate: stats.rate === null ? null : Math.round(stats.rate * 100),
        weight: Math.round(stats.weight * 10),
        arenaAnswers: c.answers.length,
        weakestSkillId: weakest(c),
        toRework: c.role === 'prerequis' && st === 'en-difficulte',
      };
    });
  const program: ScoredCompetence[] = state.competences.filter(isScoreRole).map((c) => ({
    id: c.id,
    domain: c.domain,
    essential: c.essential,
    scored: c.scored,
    state: stateOf(c, state.today),
    studied: c.studied === 'vu',
  }));
  const scores = computeScores(program, state.kind !== 'origines');
  const partialCoverage = state.endReason !== null && state.endReason !== 'concluded';
  return {
    kind: state.kind,
    partial: partialCoverage,
    scores,
    domains: scoresByDomain(program),
    competences: rows,
    notStudied: program.filter((c) => c.state === 'non-etudiee').map((c) => c.id),
    notEvaluated: program
      .filter((c) => c.state !== 'non-etudiee' && !(c.scored && isEvaluated(c.state)))
      .map((c) => c.id),
    questions: state.asked,
  };
}
