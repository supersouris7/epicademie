import { INK, MUTED, ACCENT, PRIMARY, frNum, type Of } from './common.ts';

/** Graphique cartésien. */
export function Chart({ f }: { f: Of<'chart'> }) {
  const W = 440;
  const H = 280;
  const left = 46;
  const bottom = 236;
  const xs = f.points.map((p) => p.x);
  const ys = f.points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMax = Math.ceil(Math.max(...ys) / 2) * 2 + 2;
  const yMin = Math.min(0, Math.floor(Math.min(...ys) / 2) * 2);
  const X = (x: number) => left + ((x - xMin) / (xMax - xMin || 1)) * (W - left - 20);
  const Y = (y: number) => bottom - ((y - yMin) / (yMax - yMin || 1)) * (bottom - 24);
  const xStep = xMax - xMin > 12 ? 2 : 1;
  const yStep = yMax - yMin > 16 ? 4 : 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Graphique">
      {Array.from({ length: Math.floor((xMax - xMin) / xStep) + 1 }, (_, i) => xMin + i * xStep).map((x) => (
        <g key={`x${x}`}>
          <line x1={X(x)} x2={X(x)} y1={Y(yMin)} y2={Y(yMax)} stroke={MUTED} strokeOpacity={0.25} />
          <text x={X(x)} y={bottom + 16} textAnchor="middle" fontSize={11} fill={MUTED}>
            {frNum(x)}
          </text>
        </g>
      ))}
      {Array.from({ length: Math.floor((yMax - yMin) / yStep) + 1 }, (_, i) => yMin + i * yStep).map((y) => (
        <g key={`y${y}`}>
          <line x1={X(xMin)} x2={X(xMax)} y1={Y(y)} y2={Y(y)} stroke={MUTED} strokeOpacity={0.25} />
          <text x={left - 6} y={Y(y) + 4} textAnchor="end" fontSize={11} fill={MUTED}>
            {frNum(y)}
          </text>
        </g>
      ))}
      <line
        x1={X(xMin)}
        x2={X(xMax)}
        y1={Y(Math.max(0, yMin))}
        y2={Y(Math.max(0, yMin))}
        stroke={INK}
        strokeWidth={2}
      />
      <line
        x1={X(Math.max(0, xMin))}
        x2={X(Math.max(0, xMin))}
        y1={Y(yMin)}
        y2={Y(yMax)}
        stroke={INK}
        strokeWidth={2}
      />
      {f.line && (
        <polyline
          points={f.points.map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')}
          fill="none"
          stroke={ACCENT}
          strokeWidth={3}
        />
      )}
      {f.points.map((p) => (
        <circle key={`${p.x}-${p.y}`} cx={X(p.x)} cy={Y(p.y)} r={5} fill={PRIMARY} stroke={INK} strokeWidth={1.5} />
      ))}
      <text x={W - 20} y={bottom - 8} textAnchor="end" fontSize={12} fontWeight={700} fill={INK}>
        {f.xLabel}
      </text>
      <text x={left + 6} y={16} fontSize={12} fontWeight={700} fill={INK}>
        {f.yLabel}
      </text>
    </svg>
  );
}
