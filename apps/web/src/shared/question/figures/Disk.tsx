import { INK, ACCENT, PRIMARY, type Of } from './common.ts';

/** Disque. */
export function Disk({ f }: { f: Of<'disk'> }) {
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
