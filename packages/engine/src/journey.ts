import type { Journey, JourneyPoint } from '@epicademie/shared';
import type { AnswerFact } from './learning.ts';
import { EPREUVE_PASS_RATE } from './session.ts';
import { daysBetween } from './srs.ts';

/**
 * Progrès personnel : l'enfant n'est comparé qu'à lui-même. Fonctions pures.
 * - un progrès : la réussite sur les premières réponses d'une notion est plus haute ces 7 derniers
 *   jours qu'avant ;
 * - les efforts comptent, réussite ou non : séries terminées, jours d'entraînement, notions
 *   retravaillées, reprise après une pause.
 */

/** « Cette semaine » : aujourd'hui et les 6 jours précédents. */
export const JOURNEY_WINDOW_DAYS = 7;
/** Pause à partir de laquelle la reprise est saluée. */
export const PAUSE_DAYS = 7;
/** Réponses comparées de chaque côté : au plus 10, au moins 4. */
const SAMPLE = 10;
const MIN_SAMPLE = 4;
const MAX_GAINS = 5;

const rate = (p: JourneyPoint) => p.correct / p.answered;

/** Les dernières réponses d'une période, résumées (null s'il y en a trop peu). */
function point(facts: readonly AnswerFact[]): JourneyPoint | null {
  const last = facts.slice(-SAMPLE);
  const end = last.at(-1);
  if (!end || last.length < MIN_SAMPLE) return null;
  return { day: end.day, correct: last.filter((f) => f.correct).length, answered: last.length };
}

function bySkill(facts: readonly AnswerFact[]): Map<string, AnswerFact[]> {
  const map = new Map<string, AnswerFact[]>();
  for (const f of facts) {
    const list = map.get(f.skillId);
    if (list) list.push(f);
    else map.set(f.skillId, [f]);
  }
  return map;
}

/** Une réponse (pas la première) arrivée cette semaine après une réponse pas encore juste. */
const wasReworked = (facts: readonly AnswerFact[], recent: (day: string) => boolean) => {
  const missed = facts.findIndex((f) => !f.correct);
  return missed >= 0 && facts.slice(missed + 1).some((f) => recent(f.day));
};

/** Durée de la dernière pause terminée cette semaine, ou null. */
function pauseOf(days: readonly string[], recent: (day: string) => boolean): number | null {
  let pause: number | null = null;
  for (let i = 1; i < days.length; i++) {
    const [previous, day] = [days[i - 1], days[i]];
    if (previous === undefined || day === undefined || !recent(day)) continue;
    const gap = daysBetween(previous, day);
    if (gap >= PAUSE_DAYS) pause = gap;
  }
  return pause;
}

export function journey({
  facts,
  seriesDays,
  today,
}: {
  /** Réponses du joueur, dans n'importe quel ordre. */
  readonly facts: readonly AnswerFact[];
  /** Jour de fin de chaque série terminée. */
  readonly seriesDays: readonly string[];
  readonly today: string;
}): Journey {
  const recent = (day: string) => daysBetween(day, today) < JOURNEY_WINDOW_DAYS;
  // Réponses personnelles (jamais à plusieurs, ni les épreuves de mesure), de la plus ancienne à la plus récente.
  const own = facts.filter((f) => !f.collective && f.mode !== 'evaluation').sort((a, b) => a.at.localeCompare(b.at));
  const skills = [...bySkill(own)];
  const gains = skills
    .flatMap(([skillId, list]) => {
      const first = list.filter((f) => f.attempt === 1);
      const before = point(first.filter((f) => !recent(f.day)));
      const now = point(first.filter((f) => recent(f.day)));
      return before && now && rate(now) > rate(before) ? [{ skillId, before, now }] : [];
    })
    .sort((a, b) => rate(b.now) - rate(b.before) - (rate(a.now) - rate(a.before)))
    .slice(0, MAX_GAINS);
  const days = [...new Set(own.map((f) => f.day))].sort();
  return {
    today,
    gains,
    effort: {
      series: seriesDays.filter(recent).length,
      days: days.filter(recent).length,
      reworked: skills.filter(([, list]) => wasReworked(list, recent)).map(([skillId]) => skillId),
      pauseDays: pauseOf(days, recent),
    },
  };
}

/** Étapes avant les 80 % d'une Épreuve : la part de réussite déjà atteinte, et ce qu'il reste. */
export function epreuveStep(
  correct: number,
  answered: number,
): { step: 'depart' | 'mi-chemin' | 'proche'; missing: number } {
  const share = answered === 0 ? 0 : correct / answered;
  return {
    step: share >= 0.6 ? 'proche' : share >= 0.4 ? 'mi-chemin' : 'depart',
    missing: Math.max(0, Math.ceil(EPREUVE_PASS_RATE * answered - correct)),
  };
}
