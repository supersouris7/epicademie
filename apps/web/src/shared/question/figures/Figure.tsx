import type { CSSProperties, ReactNode } from 'react';
import type { FigureProps } from './common.ts';
import { Bars } from './Bars.tsx';
import { Blocks } from './Blocks.tsx';
import { Chart } from './Chart.tsx';
import { Document } from './Document.tsx';
import { Disk } from './Disk.tsx';
import { Grid } from './Grid.tsx';
import { NumberLine } from './NumberLine.tsx';
import { Parallels } from './Parallels.tsx';
import { Pattern } from './Pattern.tsx';
import { Polygon } from './Polygon.tsx';
import { Solid } from './Solid.tsx';
import { Table } from './Table.tsx';

/**
 * Figure d'une question (droite graduée, quadrillage, polygone, solide, diagramme, programme
 * par blocs…) : choisit le dessin selon le type et l'encadre. Un fichier par type de figure.
 */
export function Figure(props: FigureProps) {
  const f = props.figure;
  const box = (child: ReactNode, wide = false) => (
    <div
      className={`bg-surface-2 mx-auto w-full overflow-auto rounded-2xl p-3 [&_svg]:max-h-[var(--fig-h)] ${wide ? 'max-w-3xl' : 'max-w-xl'}`}
      style={{ '--fig-h': props.maxHeight ?? '9999px' } as CSSProperties}
    >
      {child}
    </div>
  );
  switch (f.kind) {
    case 'numberLine':
      return box(<NumberLine f={f} />, true);
    case 'grid':
      return box(<Grid f={f} {...props} />);
    case 'polygon':
      return box(<Polygon f={f} />);
    case 'disk':
      return box(<Disk f={f} />);
    case 'solid':
      return box(<Solid f={f} />);
    case 'parallels':
      return box(<Parallels f={f} />);
    case 'bars':
      return box(<Bars f={f} />);
    case 'table':
      return box(<Table f={f} />, true);
    case 'chart':
      return box(<Chart f={f} />);
    case 'blocks':
      return box(<Blocks program={f.program} />);
    case 'document':
      return box(<Document f={f} />, true);
    case 'pattern':
      return box(<Pattern f={f} />, true);
  }
}
