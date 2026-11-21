import type { LearningReport } from '@questeo/shared';
import { skillTitle, weakPoints } from './summary.ts';

/** Espace parent : relevé des points faibles (réussite sans aide, nombre de réponses). */
export function WeakPoints({ report }: { readonly report: LearningReport }) {
  const weak = weakPoints(report);
  return (
    <section aria-labelledby="points-faibles" className="flex flex-col gap-2">
      <h2 id="points-faibles" className="font-display text-2xl tracking-wide">
        Points faibles
      </h2>
      {weak.length === 0 ? (
        <p>Aucun point faible marqué pour l’instant.</p>
      ) : (
        <table className="cartoon bg-surface w-full overflow-hidden text-left">
          <thead className="bg-surface-2">
            <tr>
              <th className="p-2">Notion</th>
              <th className="p-2 text-right">Réussite seul</th>
              <th className="p-2 text-right">Réponses</th>
            </tr>
          </thead>
          <tbody>
            {weak.map((w) => (
              <tr key={w.skillId} className="border-outline/20 border-t">
                <td className="p-2 font-bold">{skillTitle(w.skillId)}</td>
                <td className="p-2 text-right">{Math.round(w.rate * 100)} %</td>
                <td className="p-2 text-right">{w.answered}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
