import type { PointerEvent, ReactNode } from 'react';
import { INK, MUTED, ACCENT, DANGER, PRIMARY, frNum, type FigureProps, type Of } from './common.ts';

/** Quadrillage / repère. */
export function Grid({ f, picked, onPick, reveal }: { f: Of<'grid'> } & FigureProps) {
  const U = 34;
  const pad = 24;
  const W = (f.xMax - f.xMin) * U + 2 * pad;
  const H = (f.yMax - f.yMin) * U + 2 * pad;
  const X = (x: number) => pad + (x - f.xMin) * U;
  const Y = (y: number) => pad + (f.yMax - y) * U;
  const handle = (e: PointerEvent<SVGSVGElement>) => {
    if (!onPick) return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const p = pt.matrixTransform(ctm.inverse());
    const x = Math.round((p.x - pad) / U + f.xMin);
    const y = Math.round(f.yMax - (p.y - pad) / U);
    if (x < f.xMin || x > f.xMax || y < f.yMin || y > f.yMax) return;
    onPick({ x, y });
  };
  const byName = new Map(f.points.map((p) => [p.name, p]));
  const lines: ReactNode[] = [];
  for (let x = f.xMin; x <= f.xMax; x++)
    lines.push(
      <line
        key={`v${x}`}
        x1={X(x)}
        x2={X(x)}
        y1={Y(f.yMin)}
        y2={Y(f.yMax)}
        stroke={MUTED}
        strokeOpacity={0.35}
        strokeWidth={1}
      />,
    );
  for (let y = f.yMin; y <= f.yMax; y++)
    lines.push(
      <line
        key={`h${y}`}
        y1={Y(y)}
        y2={Y(y)}
        x1={X(f.xMin)}
        x2={X(f.xMax)}
        stroke={MUTED}
        strokeOpacity={0.35}
        strokeWidth={1}
      />,
    );
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`w-full ${onPick ? 'cursor-crosshair touch-none' : ''}`}
      onPointerDown={handle}
      role="img"
      aria-label={onPick ? 'Quadrillage : touche un nœud pour placer le point' : 'Quadrillage'}
    >
      {lines}
      {f.axes && (
        <g>
          <line x1={X(f.xMin)} x2={X(f.xMax)} y1={Y(0)} y2={Y(0)} stroke={INK} strokeWidth={2.5} />
          <line y1={Y(f.yMin)} y2={Y(f.yMax)} x1={X(0)} x2={X(0)} stroke={INK} strokeWidth={2.5} />
          {Array.from({ length: f.xMax - f.xMin + 1 }, (_, i) => f.xMin + i)
            .filter((v) => v !== 0)
            .map((v) => (
              <text key={`lx${v}`} x={X(v)} y={Y(0) + 16} textAnchor="middle" fontSize={12} fill={MUTED}>
                {frNum(v)}
              </text>
            ))}
          {Array.from({ length: f.yMax - f.yMin + 1 }, (_, i) => f.yMin + i)
            .filter((v) => v !== 0)
            .map((v) => (
              <text key={`ly${v}`} x={X(0) - 8} y={Y(v) + 4} textAnchor="end" fontSize={12} fill={MUTED}>
                {frNum(v)}
              </text>
            ))}
          <text x={X(0) - 8} y={Y(0) + 16} textAnchor="end" fontSize={12} fill={MUTED}>
            0
          </text>
        </g>
      )}
      {f.axis && (
        <line
          x1={X(f.axis.x1)}
          y1={Y(f.axis.y1)}
          x2={X(f.axis.x2)}
          y2={Y(f.axis.y2)}
          stroke={DANGER}
          strokeWidth={3.5}
        />
      )}
      {f.segments?.map(([a, b]) => {
        const p = byName.get(a);
        const q = byName.get(b);
        return p && q ? (
          <line key={`${a}${b}`} x1={X(p.x)} y1={Y(p.y)} x2={X(q.x)} y2={Y(q.y)} stroke={INK} strokeWidth={2.5} />
        ) : null;
      })}
      {f.points.map((p) => (
        <g key={p.name}>
          <circle cx={X(p.x)} cy={Y(p.y)} r={7} fill={p.color === 'muted' ? INK : ACCENT} />
          <text
            x={X(p.x) + 10}
            y={Y(p.y) - 10}
            fontSize={20}
            fontWeight={800}
            fill={p.color === 'muted' ? INK : ACCENT}
          >
            {p.name}
          </text>
        </g>
      ))}
      {reveal && (
        <circle cx={X(reveal.x)} cy={Y(reveal.y)} r={11} fill="none" stroke="var(--success)" strokeWidth={4} />
      )}
      {picked && (
        <g>
          <circle cx={X(picked.x)} cy={Y(picked.y)} r={8} fill={PRIMARY} stroke={INK} strokeWidth={2} />
          <text x={X(picked.x) + 10} y={Y(picked.y) + 22} fontSize={18} fontWeight={800} fill={PRIMARY}>
            ?
          </text>
        </g>
      )}
    </svg>
  );
}
