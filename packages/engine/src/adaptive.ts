import type { Level, SkillStatus } from '@epicademie/shared';
import { MIN_ANSWERS_FOR_RATE, RECENT_ANSWERS, SOLID_RATE, WEAK_RATE } from './learning.ts';
import { isDue, type SkillState } from './srs.ts';

/**
 * Moteur adaptatif de l'entraînement (docs/adr/0017-moteur-adaptatif.md) : déterministe,
 * sans IA, testé règle par règle. Il lit l'état de chaque notion (répétition espacée et
 * dernières premières réponses), puis choisit le niveau de départ, la notion suivante et les
 * révisions recommandées. Le nombre de questions d'une série ne change pas.
 *
 * Les premières réponses de l'entraînement sont données sans aide (l'indice n'arrive qu'au
 * second essai, qui n'entre pas dans `recent`) : l'état calculé ici est celui du suivi.
 */

/** État pédagogique d'une notion d'après sa répétition espacée (mêmes seuils que le suivi). */
export function planningStatus(state: SkillState | undefined): SkillStatus {
  if (!state || state.recent.length === 0) return 'non-commencee';
  if (state.recent.length < MIN_ANSWERS_FOR_RATE) return 'en-progression';
  const recent = state.recent.slice(-RECENT_ANSWERS);
  if (recent.slice(-2).every((ok) => !ok)) return 'a-travailler';
  const rate = recent.filter(Boolean).length / recent.length;
  if (rate < WEAK_RATE) return 'a-travailler';
  if (rate < SOLID_RATE) return 'en-progression';
  return state.stage === 3 ? 'acquise' : 'a-consolider';
}

/**
 * Niveau de départ : 1 pour découvrir ou retravailler, 2 en progression bien engagée ou à
 * consolider, 3 pour une notion acquise (défi d'entretien). Dans la série, le niveau monte après
 * des réussites et descend après deux erreurs (session.ts).
 */
export function startLevel(state: SkillState | undefined, maxLevel: Level = 3): Level {
  // Notion à 5 niveaux : à consolider → 3, acquise → 4 (docs/adr/0034) ; à 3 niveaux, comme avant.
  const shift = maxLevel > 3 ? 1 : 0;
  const level = ((): number => {
    switch (planningStatus(state)) {
      case 'non-commencee':
      case 'a-travailler':
        return 1;
      case 'en-progression':
        return (state?.stage ?? 0) >= 2 ? 2 : 1;
      case 'a-consolider':
        return 2 + shift;
      case 'acquise':
        return 3 + shift;
    }
  })();
  return Math.min(level, maxLevel) as Level;
}

/** Poids de base selon l'état : les notions fragiles reviennent plus souvent. */
const STATUS_WEIGHT: Record<SkillStatus, number> = {
  'a-travailler': 4,
  'non-commencee': 3,
  'en-progression': 3,
  'a-consolider': 2,
  acquise: 1,
};

const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/**
 * Poids de tirage d'une notion dans une série :
 * - selon son état (fragile → plus souvent) ;
 * - +2 si une révision est due (+1 de plus au-delà d'une semaine de retard) ;
 * - divisé par deux si elle a déjà été travaillée aujourd'hui sans être due (on espace).
 */
export function skillWeight(state: SkillState | undefined, today: string, lastPracticed?: string | null): number {
  let w = STATUS_WEIGHT[planningStatus(state)];
  if (state && isDue(state, today) && state.stage > 0) {
    w += 2;
    if (state.due && daysBetween(state.due, today) > 7) w += 1;
  } else if (lastPracticed === today) {
    w = Math.max(0.5, w / 2);
  }
  return w;
}

/** Révision recommandée : notion déjà étudiée, avec sa priorité. */
export interface ReviewSuggestion {
  readonly skillId: string;
  readonly status: SkillStatus;
  /** Plus grand = plus urgent (retard en jours et fragilité). */
  readonly priority: number;
  readonly due: string | null;
}

/**
 * Révisions du jour : notions déjà étudiées dont la révision est due, et notions « à
 * travailler » pas revues depuis au moins un jour. Priorité = jours de retard + fragilité ;
 * jamais de pénalité liée aux jours sans connexion (le retard ne fait que remonter la notion).
 */
export function recommendedReviews(
  states: Iterable<SkillState>,
  today: string,
  { limit = 5, lastPracticed = new Map<string, string | null>() } = {},
): ReviewSuggestion[] {
  const out: ReviewSuggestion[] = [];
  for (const s of states) {
    if (s.recent.length === 0) continue;
    const status = planningStatus(s);
    const due = s.due !== null && s.due <= today && s.stage > 0;
    const last = lastPracticed.get(s.skillId);
    const weak = status === 'a-travailler' && last !== today;
    if (!due && !weak) continue;
    const late = s.due ? Math.max(0, daysBetween(s.due, today)) : 0;
    out.push({ skillId: s.skillId, status, due: s.due, priority: late + 2 * STATUS_WEIGHT[status] });
  }
  return out.sort((a, b) => b.priority - a.priority || a.skillId.localeCompare(b.skillId)).slice(0, limit);
}
