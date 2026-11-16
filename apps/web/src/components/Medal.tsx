import type { Medal as MedalId } from '@questeo/engine';

const COLORS: Record<Exclude<MedalId, 'aucune'>, { fill: string; shade: string; ribbon: string }> = {
  bronze: { fill: '#e08a4a', shade: '#9c5222', ribbon: '#ef476f' },
  argent: { fill: '#dfe5ee', shade: '#8f9bb0', ribbon: '#118ab2' },
  or: { fill: '#ffd34d', shade: '#c8901a', ribbon: '#4b3fe0' },
  platine: { fill: '#c9f6ff', shade: '#58b9d6', ribbon: '#9b5de5' },
};

/** Médaille d'une notion (bronze, argent, or, platine) ; contour pointillé si pas encore gagnée. */
export function Medal({
  medal,
  size = 40,
  label,
}: {
  readonly medal: MedalId;
  readonly size?: number;
  readonly label?: string;
}) {
  if (medal === 'aucune') {
    return (
      <svg
        viewBox="0 0 40 48"
        width={size}
        height={size * 1.2}
        role="img"
        aria-label={label ?? 'Pas encore de médaille'}
      >
        <circle
          cx={20}
          cy={28}
          r={15}
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth={3}
          strokeDasharray="4 4"
          opacity={0.6}
        />
      </svg>
    );
  }
  const c = COLORS[medal];
  return (
    <svg viewBox="0 0 40 48" width={size} height={size * 1.2} role="img" aria-label={label ?? `Médaille ${medal}`}>
      <path
        d="M11 2 L18 16 L22 16 L15 2 Z M29 2 L22 16 L18 16 L25 2 Z"
        fill={c.ribbon}
        stroke="#1d1638"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <circle cx={20} cy={29} r={15} fill={c.fill} stroke="#1d1638" strokeWidth={2.5} />
      <circle cx={20} cy={29} r={10.5} fill="none" stroke={c.shade} strokeWidth={2} />
      <path d="M20 22 l2.2 4.6 5 .7 -3.6 3.5 .9 5 -4.5 -2.4 -4.5 2.4 .9 -5 -3.6 -3.5 5 -.7 z" fill={c.shade} />
      {medal === 'platine' && (
        <path d="M8 22 q3 -6 9 -8" stroke="#fff" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.9} />
      )}
    </svg>
  );
}
