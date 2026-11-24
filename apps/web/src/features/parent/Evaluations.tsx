import { useQuery } from '@tanstack/react-query';
import { api, subjectLabel, type Grade } from '@epicademie/shared';
import { request } from '../../shared/api/client.ts';
import { appreciation, formatNote, KIND_INFO, note20 } from '../evaluation/index.ts';
import { dateOf, evolution, noted } from './evaluationNotes.ts';

/**
 * Notes des évaluations dans l'Espace parent : par matière, la dernière note sur 20 avec son
 * appréciation, l'évolution depuis l'épreuve précédente (12/20 → 15/20) et l'historique.
 */
const useEvaluationSummary = (profileId: string) =>
  useQuery({
    queryKey: ['evaluation-summary', profileId],
    queryFn: () => request(api.evaluationSummary, { params: { id: profileId } }),
  });

/** Une ligne par matière pour la carte d'un enfant : dernière note et évolution. */
export function EvaluationLine({ profileId, grade }: { readonly profileId: string; readonly grade: Grade | null }) {
  const { data } = useEvaluationSummary(profileId);
  const subjects = (data?.subjects ?? []).filter((s) => noted(s.history).length > 0);
  if (subjects.length === 0) return null;
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {subjects.map((s) => {
        const last = noted(s.history)[0];
        if (last?.mastery == null) return null;
        const evo = evolution(s.history);
        return (
          <li key={s.subject}>
            <span className="text-muted font-bold">Évaluation {subjectLabel(s.subject, grade)} : </span>
            {evo ? evo.text : formatNote(last.mastery)} · {appreciation(last.mastery, last.id)?.label}
          </li>
        );
      })}
    </ul>
  );
}

/** Section complète de la page d'un enfant. */
export function EvaluationNotes({ profileId, grade }: { readonly profileId: string; readonly grade: Grade | null }) {
  const { data } = useEvaluationSummary(profileId);
  const subjects = data?.subjects ?? [];
  if (subjects.length === 0) return null;
  return (
    <section aria-labelledby="evaluations" className="flex flex-col gap-3">
      <h2 id="evaluations" className="text-lg font-bold">
        Notes des évaluations
      </h2>
      {subjects.map((s) => {
        const last = noted(s.history)[0];
        const evo = evolution(s.history);
        const mood = last ? appreciation(last.mastery, last.id, last.partial) : null;
        return (
          <article key={s.subject} className="bg-surface flex flex-col gap-2 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-bold">{subjectLabel(s.subject, grade)}</h3>
              {last?.mastery != null && (
                <span className="text-2xl font-bold" aria-label={`Dernière note : ${note20(last.mastery)} sur 20`}>
                  {formatNote(last.mastery)}
                </span>
              )}
            </div>
            {mood && (
              <p>
                <strong>{mood.label}</strong>
                {evo && (
                  <span className={evo.delta > 0 ? 'text-success' : evo.delta < 0 ? 'text-muted' : ''}>
                    {' '}
                    · évolution {evo.text}
                  </span>
                )}
              </p>
            )}
            <ul className="text-muted flex flex-col gap-0.5 text-sm">
              {s.history.map((h) => (
                <li key={h.id}>
                  {dateOf(h.finishedAt)} · {KIND_INFO[h.kind].name} ·{' '}
                  {h.mastery !== null ? formatNote(h.mastery) : 'pas assez de questions pour une note'}
                  {h.partial ? ' (épreuve écourtée)' : ''}
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </section>
  );
}
