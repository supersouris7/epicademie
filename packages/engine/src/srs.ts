/**
 * Médaille d'une notion : sa meilleure série de 5 questions (tout réussi sans aide : Diamant ;
 * tout réussi avec aide : Or ; 4/5 Argent, 3/5 Bronze). Une médaille gagnée n'est jamais perdue.
 * En arrière-plan, la répétition espacée (J0, J+2, J+7, puis mensuel) propose les notions
 * « à revoir » ; une série pas encore réussie remet la notion à revoir le lendemain.
 */
export type Stage = 0 | 1 | 2 | 3;

export interface SkillState {
  readonly skillId: string;
  /** 0 nouvelle / à revoir ; 1 réussie J0 ; 2 réussie J+2 ; 3 acquise. */
  readonly stage: Stage;
  /** Date (AAAA-MM-JJ) à partir de laquelle la notion est à revoir ; null si jamais vue. */
  readonly due: string | null;
  readonly attempts: number;
  readonly correct: number;
  /** Dernières réponses (true = juste), 20 au plus, la plus récente à la fin. */
  readonly recent: readonly boolean[];
  /** Rappels d'entretien réussis une fois la notion acquise. */
  readonly maintained: number;
  /**
   * Meilleure série sur cette notion, quelle que soit sa longueur (4 questions, ou 5 en calcul de
   * tête) : 6 = tout réussi sans aide (Diamant), 5 = tout réussi avec aide (Or), 4 = une question
   * pas encore réussie (Argent), 3 = deux (Bronze).
   */
  readonly best: number;
}

export interface SkillSessionResult {
  readonly answered: number;
  readonly correct: number;
}

export const RECENT_WINDOW = 20;
/** Taux de réussite minimal d'une série pour qu'elle compte comme réussie. */
export const SUCCESS_RATE = 0.8;
const GAP_AFTER_STAGE: Record<Stage, number> = { 0: 1, 1: 2, 2: 5, 3: 30 };

/** Palier suivant après une réussite (le dernier palier est conservé). */
const NEXT_STAGE: Record<Stage, Stage> = { 0: 1, 1: 2, 2: 3, 3: 3 };

/** Palier lu depuis un stockage (entier non typé) ; refuse toute valeur hors 0–3. */
export function toStage(value: number): Stage {
  if (value === 0 || value === 1 || value === 2 || value === 3) return value;
  throw new RangeError(`Palier de révision invalide : ${value}`);
}

export function newSkillState(skillId: string): SkillState {
  return { skillId, stage: 0, due: null, attempts: 0, correct: 0, recent: [], maintained: 0, best: 0 };
}

/** Nombre de jours d'un jour AAAA-MM-JJ à un autre. */
export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

export function addDays(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const isDue = (s: SkillState, today: string) => s.due !== null && s.due <= today;

/** Note maximale d'une série (sans-faute), quelle que soit sa longueur. */
export const SERIES_LENGTH = 5;

/** Meilleure note : série entièrement réussie sans aucune aide (Diamant). */
export const UNAIDED_SERIES = SERIES_LENGTH + 1;

/**
 * Note d'une série complète : 5 − questions pas encore réussies (une série de 4 toute réussie vaut
 * 5, comme une de 5). `solved` compte les réussites avec ou sans aide ; `unaided` (toutes justes
 * du premier coup, sans indice ni explication) donne la note Diamant.
 */
export const seriesScore = (solved: number, length: number, unaided = false) =>
  unaided && solved >= length ? UNAIDED_SERIES : Math.max(0, SERIES_LENGTH - (length - solved));

/**
 * Détails facultatifs du bilan d'une série sur une notion (voir `applySession`).
 */
export interface SessionDetails {
  /** Réponses dans l'ordre (vrai = juste), pour la fenêtre des réponses récentes. */
  readonly answers?: readonly boolean[];
  /**
   * L'élève a demandé l'explication (« Je n'ai pas compris ») : jamais une erreur, la notion est
   * simplement reproposée dès le lendemain.
   */
  readonly reviewSoon?: boolean;
  /**
   * Note de la série complète de cette seule notion (voir `seriesScore`), absente si la série
   * mêlait plusieurs notions ; la meilleure fixe la médaille.
   */
  readonly series?: number;
}

/** Applique le bilan d'une série sur une notion (au plus une progression par jour). */
export function applySession(
  state: SkillState,
  result: SkillSessionResult,
  today: string,
  { answers = [], reviewSoon = false, series }: SessionDetails = {},
): SkillState {
  const recent = [...state.recent, ...answers].slice(-RECENT_WINDOW);
  const base = {
    ...state,
    attempts: state.attempts + result.answered,
    correct: state.correct + result.correct,
    recent,
    best: Math.max(state.best, Math.min(UNAIDED_SERIES, series ?? 0)),
  };
  if (result.answered === 0) return state;
  const next = schedule(state, base, result, today);
  // Explication demandée : la notion est reproposée dès demain, sans rien retirer à l'élève.
  return reviewSoon ? { ...next, due: addDays(today, GAP_AFTER_STAGE[0]) } : next;
}

/** Répétition espacée : palier et prochaine date après une série. */
function schedule(state: SkillState, base: SkillState, result: SkillSessionResult, today: string): SkillState {
  const rate = result.correct / result.answered;
  if (rate < SUCCESS_RATE) return { ...base, stage: 0, maintained: 0, due: addDays(today, GAP_AFTER_STAGE[0]) };
  // Réussite : progression seulement si la notion est nouvelle ou arrivée à échéance.
  const canProgress = state.due === null || state.stage === 0 || state.due <= today;
  if (!canProgress) return base;
  const stage = NEXT_STAGE[state.stage];
  const maintained = state.stage === 3 ? state.maintained + 1 : state.maintained;
  return { ...base, stage, maintained, due: addDays(today, GAP_AFTER_STAGE[stage]) };
}

/** Niveau de maîtrise à l'échelle du livret scolaire (LSU). */
export type Mastery = 'non-evalue' | 'insuffisante' | 'fragile' | 'satisfaisante' | 'tres-bonne';

export const MASTERY_LABELS: Record<Mastery, string> = {
  'non-evalue': 'Pas encore évalué',
  insuffisante: 'Maîtrise à renforcer',
  fragile: 'Maîtrise en progrès',
  satisfaisante: 'Maîtrise satisfaisante',
  'tres-bonne': 'Très bonne maîtrise',
};

/** Taux de réussite récent (null si moins de 5 réponses). */
export function recentRate(state: Pick<SkillState, 'recent'>): number | null {
  return state.recent.length < 5 ? null : state.recent.filter(Boolean).length / state.recent.length;
}

export function masteryFromRate(rate: number | null): Mastery {
  if (rate === null) return 'non-evalue';
  if (rate < 0.5) return 'insuffisante';
  if (rate < 0.7) return 'fragile';
  if (rate < 0.9) return 'satisfaisante';
  return 'tres-bonne';
}

export const mastery = (state: Pick<SkillState, 'recent'>) => masteryFromRate(recentRate(state));

/** Note sur 20 arrondie au demi-point. */
export function scoreOn20(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 40) / 2;
}

/** Médaille d'une notion, d'après sa meilleure série : Diamant (sans aide), Or (avec aide), Argent, Bronze. */
export type Medal = 'aucune' | 'bronze' | 'argent' | 'or' | 'diamant';
export const MEDALS: readonly Medal[] = ['bronze', 'argent', 'or', 'diamant'];
export const MEDAL_LABELS: Record<Medal, string> = {
  aucune: 'Pas encore',
  bronze: 'Bronze',
  argent: 'Argent',
  or: 'Or',
  diamant: 'Diamant',
};

export function medal(state: Pick<SkillState, 'best'> | undefined): Medal {
  const best = state?.best ?? 0;
  if (best >= UNAIDED_SERIES) return 'diamant';
  if (best >= SERIES_LENGTH) return 'or';
  if (best === SERIES_LENGTH - 1) return 'argent';
  if (best === SERIES_LENGTH - 2) return 'bronze';
  return 'aucune';
}

/** Notion acquise : médaille d'or ou de diamant (série entièrement réussie). */
export const acquired = (state: Pick<SkillState, 'best'> | undefined) => (state?.best ?? 0) >= SERIES_LENGTH;
