import { INK, ACCENT, type Of } from './common.ts';

/** Suites de motifs. */
export function Pattern({ f }: { f: Of<'pattern'> }) {
  const C = 18;
  return (
    <div className="flex flex-wrap items-end justify-center gap-6">
      {f.steps.map((cells, i) => {
        const w = Math.max(...cells.map(([x]) => x)) + 1;
        const h = Math.max(...cells.map(([, y]) => y)) + 1;
        return (
          <figure key={i} className="m-0 flex flex-col items-center gap-1">
            <svg width={w * C + 4} height={h * C + 4} role="img" aria-label={`Étape ${i + 1}`}>
              {cells.map(([x, y]) => (
                <rect
                  key={`${x}-${y}`}
                  x={2 + x * C}
                  y={2 + (h - 1 - y) * C}
                  width={C - 2}
                  height={C - 2}
                  rx={3}
                  fill={ACCENT}
                  stroke={INK}
                  strokeWidth={1.5}
                />
              ))}
            </svg>
            {f.steps.length > 1 && <figcaption className="text-sm font-bold">Étape {i + 1}</figcaption>}
          </figure>
        );
      })}
    </div>
  );
}
