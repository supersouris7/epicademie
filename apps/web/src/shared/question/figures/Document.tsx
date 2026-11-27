import { MathText } from '../MathText.tsx';
import { type Of } from './common.ts';

/** Extrait de texte dont chaque ligne est numérotée (lecture, source historique). */
export function Document({ f }: { f: Of<'document'> }) {
  return (
    <figure className="text-left" aria-label={f.title ?? 'Document'}>
      {f.title && <figcaption className="mb-2 text-lg font-bold">{f.title}</figcaption>}
      <ol className="text-lg leading-snug">
        {f.lines.map((line, i) => (
          <li key={i} className="flex gap-3 py-0.5">
            <span aria-hidden className="text-muted w-6 shrink-0 text-right font-bold tabular-nums">
              {i + 1}
            </span>
            <span>
              <span className="sr-only">Ligne {i + 1} : </span>
              <MathText text={line} />
            </span>
          </li>
        ))}
      </ol>
      {f.credit && <p className="text-muted mt-2 text-sm italic">{f.credit}</p>}
    </figure>
  );
}
