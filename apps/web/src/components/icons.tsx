import type { ReactNode } from 'react';
import type { SubjectId } from '@questeo/shared';

/** Icônes cartoon maison (contour épais), indépendantes des polices émoji du système. */
const O = '#1d1638';

interface IconProps {
  readonly size?: number | string;
  readonly className?: string;
}

function Svg({ size = 32, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {children}
    </svg>
  );
}

export const GearIcon = (p: IconProps) => (
  <Svg {...p}>
    <path
      d="M28 6h8l2 7 6 3 7-3 5 6-4 6 1 6 7 3-1 8-7 1-3 6 3 7-6 5-6-4-6 1-3 7h-8l-2-7-6-3-7 3-5-6 4-6-1-6-7-3 1-8 7-1 3-6-3-7 6-5 6 4 6-1z"
      fill="#9aa0c8"
      stroke={O}
      strokeWidth={4}
    />
    <circle cx={32} cy={32} r={9} fill="#fff" stroke={O} strokeWidth={4} />
  </Svg>
);

export const FullscreenIcon = ({ exit = false, ...p }: IconProps & { readonly exit?: boolean }) => (
  <Svg {...p}>
    <g fill="none" stroke="currentColor" strokeWidth={6}>
      {exit ? (
        <path d="M24 10v14H10M40 10v14h14M24 54V40H10M40 54V40h14" />
      ) : (
        <path d="M10 24V10h14M54 24V10H40M10 40v14h14M54 40v14H40" />
      )}
    </g>
  </Svg>
);

export const CoinIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx={32} cy={32} r={24} fill="#ffc83d" stroke={O} strokeWidth={4} />
    <circle cx={32} cy={32} r={15} fill="none" stroke="#d99a12" strokeWidth={4} />
    <path
      d="M32 21l3.5 7 7.5 1-5.5 5 1.5 7.5-7-3.5-7 3.5 1.5-7.5-5.5-5 7.5-1z"
      fill="#fff6d0"
      stroke={O}
      strokeWidth={3}
    />
  </Svg>
);

export const DiceIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x={8} y={8} width={48} height={48} rx={12} fill="#fff" stroke={O} strokeWidth={4} />
    {[
      [21, 21],
      [43, 21],
      [32, 32],
      [21, 43],
      [43, 43],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={4.5} fill={O} />
    ))}
  </Svg>
);

export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x={18} y={4} width={28} height={56} rx={7} fill="#fff" stroke={O} strokeWidth={4} />
    <rect x={23} y={12} width={18} height={30} rx={2} fill="#19d3c5" />
    <circle cx={32} cy={51} r={3.5} fill={O} />
  </Svg>
);

const SUBJECT_ICONS: Record<SubjectId, ReactNode> = {
  maths: (
    <>
      <rect x={8} y={8} width={48} height={48} rx={10} fill="#fff" stroke={O} strokeWidth={4} />
      <path d="M32 8v48M8 32h48" stroke={O} strokeWidth={3} />
      <path d="M20 14v12M14 20h12" stroke="#ff7a1a" strokeWidth={5} />
      <path d="M38 20h12" stroke="#4b3fe0" strokeWidth={5} />
      <path d="M15 39l10 10M25 39 15 49" stroke="#e6224b" strokeWidth={5} />
      <path d="M38 44h12" stroke="#12b886" strokeWidth={5} />
      <circle cx={44} cy={38} r={2.5} fill="#12b886" />
      <circle cx={44} cy={50} r={2.5} fill="#12b886" />
    </>
  ),
  physique: (
    <>
      <path d="M24 6h16v14l14 26a8 8 0 0 1-7 12H17a8 8 0 0 1-7-12l14-26z" fill="#fff" stroke={O} strokeWidth={4} />
      <path d="M16 40h32l5 9a5 5 0 0 1-4 7H15a5 5 0 0 1-4-7z" fill="#19d3c5" />
      <path d="M24 6h16v14l14 26a8 8 0 0 1-7 12H17a8 8 0 0 1-7-12l14-26z" fill="none" stroke={O} strokeWidth={4} />
      <path d="M34 26l-6 9h7l-5 9" fill="none" stroke="#ffc83d" strokeWidth={4} />
      <circle cx={24} cy={49} r={3} fill="#fff" />
      <circle cx={38} cy={46} r={2} fill="#fff" />
    </>
  ),
  anglais: (
    <>
      <clipPath id="questeo-uk">
        <rect x={4} y={12} width={56} height={40} rx={8} />
      </clipPath>
      <g clipPath="url(#questeo-uk)">
        <rect x={4} y={12} width={56} height={40} fill="#012169" />
        <path d="M4 12l56 40M60 12 4 52" stroke="#fff" strokeWidth={8} />
        <path d="M4 12l56 40M60 12 4 52" stroke="#c8102e" strokeWidth={3} />
        <path d="M32 12v40M4 32h56" stroke="#fff" strokeWidth={12} />
        <path d="M32 12v40M4 32h56" stroke="#c8102e" strokeWidth={6} />
      </g>
      <rect x={4} y={12} width={56} height={40} rx={8} fill="none" stroke={O} strokeWidth={4} />
    </>
  ),
  espagnol: (
    <>
      <rect x={4} y={12} width={56} height={40} rx={8} fill="#aa151b" />
      <rect x={4} y={22} width={56} height={20} fill="#f1bf00" />
      <rect x={4} y={12} width={56} height={40} rx={8} fill="none" stroke={O} strokeWidth={4} />
    </>
  ),
  histoire: (
    <>
      <path d="M8 56V22h8v6h6v-6h8v6h4v-6h8v6h6v-6h8v34z" fill="#e9d3a8" stroke={O} strokeWidth={4} />
      <path d="M26 56V42a6 6 0 0 1 12 0v14z" fill="#7a4a2a" stroke={O} strokeWidth={4} />
      <path d="M32 22V6l12 5-12 5" fill="#e6224b" stroke={O} strokeWidth={3} />
    </>
  ),
  geographie: (
    <>
      <circle cx={32} cy={32} r={26} fill="#118ab2" stroke={O} strokeWidth={4} />
      <path
        d="M18 16c6 2 8 6 6 10s2 8 6 8 4 6 0 10-4 8-2 10M40 10c-2 4 2 8 6 8s6 4 4 8"
        fill="none"
        stroke="#12b886"
        strokeWidth={7}
      />
      <circle cx={32} cy={32} r={26} fill="none" stroke={O} strokeWidth={4} />
    </>
  ),
};

export const SubjectIcon = ({ subject, ...p }: IconProps & { readonly subject: SubjectId }) => (
  <Svg {...p}>{SUBJECT_ICONS[subject]}</Svg>
);
