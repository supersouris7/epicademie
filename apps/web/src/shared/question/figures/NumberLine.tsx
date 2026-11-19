import { INK, ACCENT, frNum, type Of } from './common.ts';

/** Droite graduée. */
export function NumberLine({ f }: { f: Of<'numberLine'> }) {
  const W = 640;
  const pad = 30;
  const X = (v: number) => pad + ((v - f.min) / (f.max - f.min)) * (W - 2 * pad);
  const ticks: { v: number; major: boolean }[] = [];
  const n = (f.max - f.min) * f.subdivisions;
  for (let i = 0; i <= n; i++) ticks.push({ v: f.min + i / f.subdivisions, major: i % f.subdivisions === 0 });
  return (
    <svg viewBox={`0 0 ${W} 110`} className="w-full" role="img" aria-label="Droite graduée">
      <line x1={pad - 15} y1={60} x2={W - pad + 18} y2={60} stroke={INK} strokeWidth={3} />
      <path d={`M${W - pad + 18} 60 l-10 -6 v12 z`} fill={INK} />
      {ticks.map((t) => (
        <line
          key={t.v}
          x1={X(t.v)}
          x2={X(t.v)}
          y1={t.major ? 48 : 53}
          y2={t.major ? 72 : 67}
          stroke={INK}
          strokeWidth={t.major ? 3 : 1.6}
        />
      ))}
      {f.labels.map((v) => (
        <text key={v} x={X(v)} y={96} textAnchor="middle" fontSize={20} fontWeight={700} fill={INK}>
          {frNum(v)}
        </text>
      ))}
      {f.points.map((p) => (
        <g key={p.name}>
          <path d={`M${X(p.at)} 56 l-8 -16 h16 z`} fill={ACCENT} />
          <text x={X(p.at)} y={30} textAnchor="middle" fontSize={22} fontWeight={800} fill={ACCENT}>
            {p.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
