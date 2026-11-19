import { INK, ACCENT, PRIMARY, type Of } from './common.ts';

/** Solides (perspective cavalière). */
export function Solid({ f }: { f: Of<'solid'> }) {
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
