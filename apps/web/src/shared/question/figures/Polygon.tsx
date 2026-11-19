import { INK, ACCENT, PRIMARY, type Of, type P } from './common.ts';

/** Polygones (triangles, parallélogrammes). */

export function Polygon({ f }: { f: Of<'polygon'> }) {
  const W = 420;
  const H = 300;
  const pad = 46;
  const all: P[] = [...f.vertices, ...(f.extra ?? []).flatMap((e) => [e.from, e.to])];
  const minX = Math.min(...all.map((p) => p.x));
  const maxX = Math.max(...all.map((p) => p.x));
  const minY = Math.min(...all.map((p) => p.y));
  const maxY = Math.max(...all.map((p) => p.y));
  const s = Math.min((W - 2 * pad) / (maxX - minX || 1), (H - 2 * pad) / (maxY - minY || 1));
  const ox = (W - (maxX - minX) * s) / 2;
  const oy = (H - (maxY - minY) * s) / 2;
  const T = (p: P): P => ({ x: ox + (p.x - minX) * s, y: H - (oy + (p.y - minY) * s) });
  const V = f.vertices.map(T);
  const c = { x: V.reduce((a, p) => a + p.x, 0) / V.length, y: V.reduce((a, p) => a + p.y, 0) / V.length };
  const away = (p: P, d: number): P => {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const n = Math.hypot(dx, dy) || 1;
    return { x: p.x + (dx / n) * d, y: p.y + (dy / n) * d };
  };
  const toward = (p: P, q: P, d: number): P => {
    const n = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    return { x: p.x + ((q.x - p.x) / n) * d, y: p.y + ((q.y - p.y) / n) * d };
  };
  const ticks = (a: P, b: P, count: number, key: string) => {
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const n = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const ux = (b.x - a.x) / n;
    const uy = (b.y - a.y) / n;
    return Array.from({ length: count }, (_, k) => {
      const off = (k - (count - 1) / 2) * 6;
      const cx = m.x + ux * off;
      const cy = m.y + uy * off;
      return (
        <line
          key={`${key}${k}`}
          x1={cx - uy * 8}
          y1={cy + ux * 8}
          x2={cx + uy * 8}
          y2={cy - ux * 8}
          stroke={INK}
          strokeWidth={2.5}
        />
      );
    });
  };
  const square = (at: P, u: P, v: P, key: string) => {
    const k = 13;
    const a = { x: at.x + u.x * k, y: at.y + u.y * k };
    const b = { x: at.x + (u.x + v.x) * k, y: at.y + (u.y + v.y) * k };
    const d = { x: at.x + v.x * k, y: at.y + v.y * k };
    return (
      <path key={key} d={`M${a.x} ${a.y} L${b.x} ${b.y} L${d.x} ${d.y}`} fill="none" stroke={INK} strokeWidth={2} />
    );
  };
  const unit = (p: P, q: P): P => {
    const n = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    return { x: (q.x - p.x) / n, y: (q.y - p.y) / n };
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Figure géométrique">
      <polygon
        points={V.map((p) => `${p.x},${p.y}`).join(' ')}
        fill={ACCENT}
        fillOpacity={0.12}
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {(f.extra ?? []).map((e, i) => {
        let a = T(e.from);
        let b = T(e.to);
        if (e.infinite) {
          const u = unit(a, b);
          a = { x: a.x - u.x * 30, y: a.y - u.y * 30 };
          b = { x: b.x + u.x * 30, y: b.y + u.y * 30 };
        }
        const to = T(e.to);
        const dir = unit(to, T(e.from));
        const base = { x: -dir.y, y: dir.x };
        const mid = { x: (T(e.from).x + to.x) / 2, y: (T(e.from).y + to.y) / 2 };
        const mp = e.midpointOf;
        const s1 = mp ? V[mp[0]] : undefined;
        const s2 = mp ? V[mp[1]] : undefined;
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={PRIMARY} strokeWidth={3} strokeDasharray="8 6" />
            {e.rightAngleAtEnd && square(to, dir, base, `sq${i}`)}
            {s1 && s2 && [...ticks(s1, to, 2, `m1${i}`), ...ticks(to, s2, 2, `m2${i}`)]}
            {e.label && (
              <text x={mid.x + 10} y={mid.y} fontSize={17} fontWeight={700} fill={PRIMARY}>
                {e.label}
              </text>
            )}
          </g>
        );
      })}
      {V.map((p, i) => {
        const q = V[(i + 1) % V.length] ?? p;
        const label = f.sideLabels?.[i];
        const m = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
        const o = away(m, 22);
        return (
          <g key={`s${i}`}>
            {label && (
              <text x={o.x} y={o.y + 6} textAnchor="middle" fontSize={17} fontWeight={700} fill={INK}>
                {label}
              </text>
            )}
            {(f.ticks?.[i] ?? 0) > 0 && ticks(p, q, f.ticks?.[i] ?? 0, `t${i}`)}
          </g>
        );
      })}
      {V.map((p, i) => {
        const prev = V[(i - 1 + V.length) % V.length] ?? p;
        const next = V[(i + 1) % V.length] ?? p;
        const lab = away(p, 20);
        const angle = f.angleLabels?.[i];
        const inside = toward(p, c, 40);
        return (
          <g key={`v${i}`}>
            <text x={lab.x} y={lab.y + 7} textAnchor="middle" fontSize={21} fontWeight={800} fill={INK}>
              {f.vertices[i]?.name}
            </text>
            {angle && (
              <>
                <path
                  d={`M${toward(p, prev, 22).x} ${toward(p, prev, 22).y} Q${toward(p, c, 30).x} ${toward(p, c, 30).y} ${toward(p, next, 22).x} ${toward(p, next, 22).y}`}
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth={2.5}
                />
                <text x={inside.x} y={inside.y + 6} textAnchor="middle" fontSize={17} fontWeight={800} fill={ACCENT}>
                  {angle}
                </text>
              </>
            )}
            {f.rightAngles?.includes(i) && square(p, unit(p, prev), unit(p, next), `ra${i}`)}
          </g>
        );
      })}
    </svg>
  );
}
