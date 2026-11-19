import { INK, MUTED, ACCENT, type Of, type P } from './common.ts';

/** Parallèles et sécante. */
export function Parallels({ f }: { f: Of<'parallels'> }) {
  const W = 420;
  const H = 300;
  const rad = (f.angle * Math.PI) / 180;
  const I1 = { x: 210 + 70 / Math.tan(rad), y: 90 };
  const I2 = { x: 210 - 70 / Math.tan(rad), y: 230 };
  const tilt = f.parallel ? 0 : 0.09;
  const at = (i: number) => (i < 4 ? I1 : I2);
  // Directions (repère mathématique) : droite 0°, sécante θ, gauche 180°, sécante θ+180°.
  const bounds = (p: number): [number, number] =>
    [
      [0, f.angle],
      [f.angle, 180],
      [180, 180 + f.angle],
      [180 + f.angle, 360],
    ][p % 4] as [number, number];
  const pt = (c: P, deg: number, r: number) => ({
    x: c.x + r * Math.cos((deg * Math.PI) / 180),
    y: c.y - r * Math.sin((deg * Math.PI) / 180),
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Deux droites coupées par une sécante">
      <line x1={10} y1={I1.y} x2={W - 10} y2={I1.y} stroke={INK} strokeWidth={3} />
      <line
        x1={10}
        y1={I2.y - (I2.x - 10) * tilt}
        x2={W - 10}
        y2={I2.y + (W - 10 - I2.x) * tilt}
        stroke={INK}
        strokeWidth={3}
      />
      <line
        x1={I2.x - 120 * Math.cos(rad)}
        y1={I2.y + 120 * Math.sin(rad)}
        x2={I1.x + 120 * Math.cos(rad)}
        y2={I1.y - 120 * Math.sin(rad)}
        stroke={MUTED}
        strokeWidth={3}
      />
      <text x={W - 16} y={I1.y - 10} textAnchor="end" fontSize={17} fontWeight={800} fill={INK}>
        (d)
      </text>
      <text
        x={W - 16}
        y={I2.y + (W - 10 - I2.x) * tilt - 10}
        textAnchor="end"
        fontSize={17}
        fontWeight={800}
        fill={INK}
      >
        (d′)
      </text>
      {f.marks.map((m) => {
        const c = at(m.at);
        const [a0, a1] = bounds(m.at);
        const p0 = pt(c, a0, 26);
        const p1 = pt(c, a1, 26);
        const lab = pt(c, (a0 + a1) / 2, 50);
        return (
          <g key={m.at}>
            <path d={`M${p0.x} ${p0.y} A26 26 0 0 0 ${p1.x} ${p1.y}`} fill="none" stroke={ACCENT} strokeWidth={3.5} />
            <text x={lab.x} y={lab.y + 6} textAnchor="middle" fontSize={18} fontWeight={800} fill={ACCENT}>
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
