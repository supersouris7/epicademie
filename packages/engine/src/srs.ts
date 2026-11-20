/**
 * Médaille d'une notion : sa meilleure série de 5 questions (5/5 Or = notion acquise, 4/5 Argent,
 * 3/5 Bronze). En arrière-plan, la répétition espacée (J0, J+2, J+7, puis mensuel) propose
 * les notions « à revoir » ; une série ratée remet la notion à revoir le lendemain.
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
   * Meilleure série sur cette notion, notée « 5 − erreurs » (0 à 5) quelle que soit sa longueur
   * (4 questions, ou 5 en calcul de tête) : 5 = sans-faute (Or), 4 = une erreur (Argent), 3 = deux (Bronze).
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

export function addDays(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const isDue = (s: SkillState, today: string) => s.due !== null && s.due <= today;

/** Note maximale d'une série (sans-faute), quelle que soit sa longueur. */
export const SERIES_LENGTH = 5;

/** Note d'une série complète : 5 − erreurs (une série de 4 sans faute vaut 5, comme une de 5). */
export const seriesScore = (correct: number, length: number) => Math.max(0, SERIES_LENGTH - (length - correct));

/**
 * Détails facultatifs du bilan d'une série sur une notion (voir `applySession`).
 */
export interface SessionDetails {
  /** Réponses dans l'ordre (vrai = juste), pour la fenêtre des réponses récentes. */
  readonly answers?: readonly boolean[];
  /** L'élève a signalé « Je n'ai pas compris » : la notion repasse à revoir. */
  readonly forceFail?: boolean;
  /**
   * Note de la série complète de cette seule notion (5 − erreurs du 1er coup), absente si la
   * série mêlait plusieurs notions ; la meilleure fixe la médaille.
   */
  readonly series?: number;
}

/** Applique le bilan d'une série sur une notion (au plus une progression par jour). */
export function applySession(
  state: SkillState,
  result: SkillSessionResult,
  today: string,
  { answers = [], forceFail = false, series }: SessionDetails = {},
): SkillState {
  const recent = [...state.recent, ...answers].slice(-RECENT_WINDOW);
  const base = {
    ...state,
    attempts: state.attempts + result.answered,
    correct: state.correct + result.correct,
    recent,
    best: Math.max(state.best, Math.min(SERIES_LENGTH, series ?? 0)),
  };
  if (result.answered === 0) return state;
  // « Je n'ai pas compris » : la série ne compte pas pour la médaille.
  if (forceFail) return { ...base, best: state.best, stage: 0, maintained: 0, due: addDays(today, GAP_AFTER_STAGE[0]) };
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
  insuffisante: 'Maîtrise insuffisante',
  fragile: 'Maîtrise fragile',
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

/** Médaille d'une notion, d'après sa meilleure série : Or (sans faute, acquise), Argent (1 erreur), Bronze (2 erreurs). */
export type Medal = 'aucune' | 'bronze' | 'argent' | 'or';
export const MEDALS: readonly Medal[] = ['bronze', 'argent', 'or'];
export const MEDAL_LABELS: Record<Medal, string> = {
  aucune: 'Pas encore',
  bronze: 'Bronze',
  argent: 'Argent',
  or: 'Or',
};

export function medal(state: Pick<SkillState, 'best'> | undefined): Medal {
  const best = state?.best ?? 0;
  if (best >= SERIES_LENGTH) return 'or';
  if (best === SERIES_LENGTH - 1) return 'argent';
  if (best === SERIES_LENGTH - 2) return 'bronze';
  return 'aucune';
}

/** Notion acquise : médaille d'or (sans-faute sur une série de 5). */
export const acquired = (state: Pick<SkillState, 'best'> | undefined) => medal(state) === 'or';
