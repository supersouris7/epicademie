import { useEffect, useState } from 'react';
import { LayoutGroup } from 'motion/react';
import { fmt, type Demo } from '@questeo/content';
import { conversionDemo, unitsIn } from './conversion.ts';
import { MathText } from './MathText.tsx';
import { ConversionGrid } from './tools/ConversionTable.tsx';

/**
 * Animation de l'explication : le nombre est posé sous son unité de départ, puis la virgule
 * glisse jusqu'à l'unité demandée et les cases vides se remplissent de zéros.
 */
export function ConversionDemoView({ demo }: { readonly demo: Extract<Demo, { kind: 'conversion' }> }) {
  const value = fmt(demo.value);
  const d = conversionDemo(demo.table, value, demo.from, demo.to);
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMoved(true), 1400);
    return () => clearTimeout(t);
  }, []);
  if (!d) return null;
  return (
    <figure className="flex flex-col gap-2" aria-label="Le nombre dans le tableau de conversion">
      <div className="overflow-x-auto">
        <LayoutGroup>
          <ConversionGrid
            kind={demo.table}
            state={moved ? d.after : d.before}
            highlight={unitsIn(`${demo.from} ${demo.to}`)}
            padLeft={d.padLeft}
            padRight={d.padRight}
          />
        </LayoutGroup>
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 text-base font-bold">
        <span>
          <MathText text={moved ? `Virgule après ${demo.to}` : `${value} placé sous ${demo.from}`} />
        </span>
        <button
          type="button"
          onClick={() => {
            setMoved(false);
            setTimeout(() => setMoved(true), 900);
          }}
          className="text-primary underline"
        >
          Revoir
        </button>
      </figcaption>
    </figure>
  );
}
