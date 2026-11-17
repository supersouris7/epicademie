import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import type { Block, Figure as FigureSpec } from '@questeo/content';

const INK = 'var(--text)';
const MUTED = 'var(--text-muted)';
const ACCENT = 'var(--accent)';
const DANGER = 'var(--danger)';
const PRIMARY = 'var(--primary)';

const frNum = (v: number) =>
  String(Math.round(v * 1000) / 1000)
    .replace('.', ',')
    .replace('-', '−');

interface FigureProps {
  readonly figure: FigureSpec;
  /** Point choisi (quadrillage interactif). */
  readonly picked?: { x: number; y: number } | null;
  readonly onPick?: (p: { x: number; y: number }) => void;
  /** Réponse attendue, affichée pendant la correction. */
  readonly reveal?: { x: number; y: number } | null;
  /** Hauteur maximale de la figure (CSS), pour que tout tienne à l'écran. */
  readonly maxHeight?: string;
}

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
    case 'pattern':
      return box(<Pattern f={f} />, true);
  }
}

type Of<K extends FigureSpec['kind']> = Extract<FigureSpec, { kind: K }>;

/* ───────────── Droite graduée ───────────── */

function NumberLine({ f }: { f: Of<'numberLine'> }) {
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

/* ───────────── Quadrillage / repère ───────────── */

function Grid({ f, picked, onPick, reveal }: { f: Of<'grid'> } & FigureProps) {
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

/* ───────────── Polygones (triangles, parallélogrammes) ───────────── */

type P = { x: number; y: number };

function Polygon({ f }: { f: Of<'polygon'> }) {
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

/* ───────────── Disque ───────────── */

function Disk({ f }: { f: Of<'disk'> }) {
  return (
    <svg viewBox="0 0 300 240" className="mx-auto w-full max-w-xs" role="img" aria-label="Disque">
      <circle cx={150} cy={120} r={95} fill={ACCENT} fillOpacity={0.15} stroke={INK} strokeWidth={3} />
      <circle cx={150} cy={120} r={4} fill={INK} />
      <line x1={f.diameter ? 55 : 150} y1={120} x2={245} y2={120} stroke={PRIMARY} strokeWidth={3} />
      <text x={f.diameter ? 150 : 197} y={110} textAnchor="middle" fontSize={18} fontWeight={800} fill={PRIMARY}>
        {f.radiusLabel}
      </text>
    </svg>
  );
}

/* ───────────── Solides (perspective cavalière) ───────────── */

function Solid({ f }: { f: Of<'solid'> }) {
  const label = (x: number, y: number, t: string | undefined) =>
    t ? (
      <text x={x} y={y} textAnchor="middle" fontSize={16} fontWeight={800} fill={PRIMARY}>
        {t}
      </text>
    ) : null;
  const stroke = { stroke: INK, strokeWidth: 2.5, fill: 'none', strokeLinejoin: 'round' as const };
  const hidden = { ...stroke, strokeDasharray: '6 5', strokeWidth: 1.8 };
  if (f.solid === 'cylindre') {
    return (
      <svg viewBox="0 0 300 260" className="mx-auto w-full max-w-xs" role="img" aria-label="Cylindre">
        <ellipse cx={150} cy={50} rx={80} ry={22} {...stroke} fill={ACCENT} fillOpacity={0.15} />
        <path d="M70 50 V200 M230 50 V200" {...stroke} />
        <path d="M70 200 A80 22 0 0 0 230 200" {...stroke} />
        <path d="M70 200 A80 22 0 0 1 230 200" {...hidden} />
        <line x1={150} y1={50} x2={230} y2={50} stroke={PRIMARY} strokeWidth={2.5} />
        {label(190, 42, f.labels[0])}
        {label(262, 130, f.labels[1])}
      </svg>
    );
  }
  if (f.solid === 'prisme') {
    return (
      <svg viewBox="0 0 320 240" className="mx-auto w-full max-w-sm" role="img" aria-label="Prisme droit">
        <path d="M40 200 H130 L40 110 Z" {...stroke} fill={ACCENT} fillOpacity={0.15} />
        <path d="M40 110 L170 50 M130 200 L260 140 L170 50" {...stroke} />
        <path d="M40 200 L170 140 L260 140 M170 140 V50" {...hidden} />
        <path d="M40 186 h14 v14" fill="none" stroke={INK} strokeWidth={2} />
        {label(85, 222, f.labels[0])}
        {label(18, 160, f.labels[1])}
        {label(215, 188, f.labels[2])}
      </svg>
    );
  }
  const cube = f.solid === 'cube';
  const w = cube ? 130 : 170;
  const h = cube ? 130 : 100;
  const d = cube ? 60 : 55;
  const x0 = 40;
  const y0 = 200;
  return (
    <svg viewBox="0 0 320 250" className="mx-auto w-full max-w-sm" role="img" aria-label={cube ? 'Cube' : 'Pavé droit'}>
      <rect x={x0} y={y0 - h} width={w} height={h} {...stroke} fill={ACCENT} fillOpacity={0.15} />
      <path
        d={`M${x0} ${y0 - h} l${d} ${-d * 0.6} h${w} l${-d} ${d * 0.6} M${x0 + w + d} ${y0 - h - d * 0.6} v${h} l${-d} ${d * 0.6}`}
        {...stroke}
      />
      <path d={`M${x0} ${y0} l${d} ${-d * 0.6} h${w} M${x0 + d} ${y0 - d * 0.6} v${-h}`} {...hidden} />
      {label(x0 + w / 2, y0 + 22, f.labels[0])}
      {!cube && label(x0 + w + d / 2 + 26, y0 - d * 0.3 + 4, f.labels[1])}
      {!cube && label(x0 - 22, y0 - h / 2, f.labels[2])}
    </svg>
  );
}

/* ───────────── Parallèles et sécante ───────────── */

function Parallels({ f }: { f: Of<'parallels'> }) {
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

/* ───────────── Diagramme en barres ───────────── */

function Bars({ f }: { f: Of<'bars'> }) {
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

/* ───────────── Tableau ───────────── */

function Table({ f }: { f: Of<'table'> }) {
  return (
    <table className="mx-auto border-collapse text-lg">
      <tbody>
        {f.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => {
              const head = f.header && j === 0;
              return head ? (
                <th key={j} className="border-outline bg-surface border-2 px-3 py-2 text-left font-bold">
                  {cell}
                </th>
              ) : (
                <td key={j} className="border-outline border-2 px-3 py-2 text-center font-bold">
                  {cell}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ───────────── Graphique cartésien ───────────── */

function Chart({ f }: { f: Of<'chart'> }) {
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

/* ───────────── Programme par blocs ───────────── */

const BLOCK_COLORS = { ask: '#5cb1d6', set: '#ff8c1a', change: '#ff8c1a', say: '#9966ff', repeat: '#ffab19' } as const;

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="mx-1 inline-block rounded-full bg-white px-2 py-0.5 font-bold text-on-light">{children}</span>
  );
}

function BlockView({ b }: { b: Block }) {
  const style = { backgroundColor: BLOCK_COLORS[b.op] };
  const cls =
    'w-fit rounded-lg border-2 border-black/20 px-3 py-2 text-base font-bold text-white shadow-[0_3px_0_rgba(0,0,0,0.2)]';
  switch (b.op) {
    case 'ask':
      return (
        <div className={cls} style={style}>
          demander <Pill>{b.text}</Pill> et attendre
        </div>
      );
    case 'set':
      return (
        <div className={cls} style={style}>
          mettre <Pill>{b.variable}</Pill> à <Pill>{b.expr}</Pill>
        </div>
      );
    case 'change':
      return (
        <div className={cls} style={style}>
          ajouter <Pill>{b.by}</Pill> à <Pill>{b.variable}</Pill>
        </div>
      );
    case 'say':
      return (
        <div className={cls} style={style}>
          dire <Pill>{b.expr}</Pill>
        </div>
      );
    case 'repeat':
      return (
        <div className="w-fit rounded-lg border-2 border-black/20 text-base font-bold text-white" style={style}>
          <div className="px-3 py-2">
            répéter <Pill>{b.times}</Pill> fois
          </div>
          <div className="ml-5 flex flex-col gap-1 rounded-l-lg bg-[var(--surface-2)] py-2 pl-2">
            {b.body.map((c, i) => (
              <BlockView key={i} b={c} />
            ))}
          </div>
          <div className="h-4" />
        </div>
      );
  }
}

function Blocks({ program }: { program: readonly Block[] }) {
  return (
    <div className="flex flex-col gap-1.5" role="img" aria-label="Programme en blocs">
      <div className="w-fit rounded-t-2xl rounded-b-lg bg-[#ffbf00] px-3 py-2 text-base font-bold text-on-light">
        quand le drapeau vert est cliqué
      </div>
      {program.map((b, i) => (
        <BlockView key={i} b={b} />
      ))}
    </div>
  );
}

/* ───────────── Suites de motifs ───────────── */

function Pattern({ f }: { f: Of<'pattern'> }) {
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
