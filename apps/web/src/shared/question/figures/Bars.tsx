import { INK, MUTED, ACCENT, type Of } from './common.ts';

/** Diagramme en barres. */
export function Bars({ f }: { f: Of<'bars'> }) {
  const W = 420;
  const H = 260;
  const left = 40;
  const bottom = 220;
  const max = Math.max(...f.bars.map((b) => b.value));
  const step = max > 20 ? 5 : 2;
  const top = Math.ceil(max / step) * step;
  const Y = (v: number) => bottom - (v / top) * 180;
  const bw = (W - left - 20) / f.bars.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={f.title}>
      <text x={W / 2} y={18} textAnchor="middle" fontSize={15} fontWeight={800} fill={INK}>
        {f.title}
      </text>
      {Array.from({ length: top / step + 1 }, (_, i) => i * step).map((v) => (
        <g key={v}>
          <line x1={left} x2={W - 10} y1={Y(v)} y2={Y(v)} stroke={MUTED} strokeOpacity={0.3} />
          <text x={left - 6} y={Y(v) + 4} textAnchor="end" fontSize={12} fill={MUTED}>
            {v}
          </text>
        </g>
      ))}
      {f.bars.map((b, i) => (
        <g key={b.label}>
          <rect
            x={left + i * bw + bw * 0.18}
            y={Y(b.value)}
            width={bw * 0.64}
            height={bottom - Y(b.value)}
            fill={ACCENT}
            rx={4}
          />
          <text
            x={left + i * bw + bw / 2}
            y={bottom + 18}
            textAnchor="middle"
            fontSize={14}
            fontWeight={700}
            fill={INK}
          >
            {b.label}
          </text>
        </g>
      ))}
      <line x1={left} x2={W - 10} y1={bottom} y2={bottom} stroke={INK} strokeWidth={2} />
      <line x1={left} x2={left} y1={bottom} y2={30} stroke={INK} strokeWidth={2} />
    </svg>
  );
}
