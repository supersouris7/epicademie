/**
 * Acquisition des notions : 3 réussites espacées (J0, J+2, J+7), puis entretien mensuel.
 * Une série ratée remet la notion « à revoir » le lendemain.
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
}

export interface SkillSessionResult {
  readonly answered: number;
  readonly correct: number;
}

export const RECENT_WINDOW = 20;
/** Taux de réussite minimal d'une série pour qu'elle compte comme réussie. */
export const SUCCESS_RATE = 0.8;
const GAP_AFTER_STAGE: Record<Stage, number> = { 0: 1, 1: 2, 2: 5, 3: 30 };

export function newSkillState(skillId: string): SkillState {
  return { skillId, stage: 0, due: null, attempts: 0, correct: 0, recent: [] };
}

export function addDays(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const isDue = (s: SkillState, today: string) => s.due !== null && s.due <= today;

/** Applique le bilan d'une série sur une notion (au plus une progression par jour). */
export function applySession(
  state: SkillState,
  result: SkillSessionResult,
  today: string,
  answers: readonly boolean[] = [],
): SkillState {
  const recent = [...state.recent, ...answers].slice(-RECENT_WINDOW);
  const base = {
    ...state,
    attempts: state.attempts + result.answered,
    correct: state.correct + result.correct,
    recent,
  };
  if (result.answered === 0) return state;
  const rate = result.correct / result.answered;
  if (rate < SUCCESS_RATE) return { ...base, stage: 0, due: addDays(today, GAP_AFTER_STAGE[0]) };
  // Réussite : progression seulement si la notion est nouvelle ou arrivée à échéance.
  const canProgress = state.due === null || state.stage === 0 || state.due <= today;
  if (!canProgress) return base;
  const stage = Math.min(3, state.stage + 1) as Stage;
  return { ...base, stage, due: addDays(today, GAP_AFTER_STAGE[stage]) };
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
