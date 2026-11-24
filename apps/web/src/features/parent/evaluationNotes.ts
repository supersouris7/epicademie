import type { EvaluationSummary } from '@epicademie/shared';
import { formatNote, note20 } from '../evaluation/index.ts';

/** Calculs des notes d'évaluation de l'Espace parent (évolution d'une épreuve à l'autre). */
type Item = EvaluationSummary['subjects'][number]['history'][number];

export const dateOf = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/** Épreuves notées (note fiable), de la plus récente à la plus ancienne. */
export const noted = (history: readonly Item[]) => history.filter((h) => h.mastery !== null);

/** « 12/20 → 15/20 (+3) », ou null s'il n'y a pas d'épreuve précédente notée. */
export function evolution(history: readonly Item[]): { text: string; delta: number } | null {
  const [last, previous] = noted(history);
  if (last?.mastery == null || previous?.mastery == null) return null;
  const delta = note20(last.mastery) - note20(previous.mastery);
  const sign = delta > 0 ? `+${delta}` : delta < 0 ? `−${-delta}` : '=';
  return { text: `${formatNote(previous.mastery)} → ${formatNote(last.mastery)} (${sign})`, delta };
}
