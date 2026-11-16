import { FoxHead } from './FoxHead.tsx';
import { QUESTY as C } from './palette.ts';

interface SvgProps {
  readonly size?: number | string;
  readonly className?: string;
  readonly title?: string;
}

/** Icône : tête seule de Questy. */
export function QuestyHead({ size = 64, className, title = 'Questy' }: SvgProps) {
  return (
    <svg viewBox="-6 -4 268 262" width={size} height={size} className={className} role="img" aria-label={title}>
      <FoxHead />
    </svg>
  );
}

/** L'épée-crayon de Questy, dessinée verticalement, origine = centre de la poignée. */
function PencilSword() {
  return (
    <g stroke={C.outline} strokeWidth={5} strokeLinejoin="round">
      <rect x={-12} y={-152} width={24} height={132} fill={C.pencil} />
      <rect x={-4} y={-152} width={8} height={132} fill={C.pencilShade} stroke="none" />
      <path d="M-12 -152 L12 -152 L0 -190 Z" fill={C.wood} />
      <path d="M-4.4 -176 L4.4 -176 L0 -190 Z" fill={C.graphite} />
      <path d="M-12 -152 L-12 -20 M12 -152 L12 -20" fill="none" />
      <rect x={-32} y={-24} width={64} height={14} rx={7} fill={C.gold} />
      <rect x={-7} y={-10} width={14} height={40} rx={4} fill="#7a4a2a" />
      <circle cx={0} cy={36} r={9} fill={C.gold} />
      {/* Étincelle magique */}
      <path
        d="M22 -176 L26 -166 L36 -162 L26 -158 L22 -148 L18 -158 L8 -162 L18 -166 Z"
        fill="#fff"
        stroke={C.gold}
        strokeWidth={3}
      />
    </g>
  );
}

/** Questy en pied, style « brawler » : bandeau, veste, épée-crayon levée. */
export function QuestyFull({ size = 240, className, title = 'Questy, le renard explorateur' }: SvgProps) {
  const o = { stroke: C.outline, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  return (
    <svg viewBox="0 -40 440 520" width={size} className={className} role="img" aria-label={title}>
      <ellipse cx={200} cy={458} rx={110} ry={14} fill={C.outline} opacity={0.18} />
      {/* Queue */}
      <path d="M156 360 C84 384 36 324 56 262 C66 232 98 220 112 240 C100 272 120 318 170 330 Z" fill={C.fur} {...o} />
      <path d="M56 262 C66 232 98 220 112 240 C104 254 102 264 104 276 C88 268 72 266 56 262 Z" fill={C.cream} {...o} />
      {/* Épée (derrière la patte) */}
      <g transform="translate(304 196) rotate(24) scale(1.25)">
        <PencilSword />
      </g>
      {/* Jambes et bottes */}
      <path d="M150 360 L150 420 L190 420 L190 360 Z" fill={C.pants} {...o} />
      <path d="M210 360 L210 420 L250 420 L250 360 Z" fill={C.pants} {...o} />
      <path d="M136 420 C136 404 196 404 196 420 L200 446 C200 456 132 456 132 446 Z" fill={C.boots} {...o} />
      <path d="M204 420 C204 404 264 404 264 420 L268 446 C268 456 200 456 200 446 Z" fill={C.boots} {...o} />
      {/* Torse */}
      <path d="M148 218 L252 218 C282 250 292 320 278 372 L122 372 C108 320 118 250 148 218 Z" fill={C.jacket} {...o} />
      <path d="M230 222 C262 256 270 320 262 368 L278 372 C292 320 282 250 252 218 Z" fill={C.jacketShade} />
      <path d="M172 220 L200 300 L228 220 Z" fill={C.cream} {...o} />
      <path
        d="M200 316 L208 334 L228 336 L213 349 L218 368 L200 358 L182 368 L187 349 L172 336 L192 334 Z"
        fill={C.gold}
        stroke={C.outline}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <rect x={120} y={366} width={160} height={18} rx={6} fill="#5b3418" {...o} />
      <rect x={188} y={362} width={24} height={26} rx={5} fill={C.gold} stroke={C.outline} strokeWidth={5} />
      {/* Bras gauche (poing sur la hanche) */}
      <path d="M150 236 C118 252 106 292 114 322 L140 318 C138 292 146 266 162 252 Z" fill={C.jacket} {...o} />
      <circle cx={126} cy={326} r={17} fill={C.fur} {...o} />
      {/* Bras droit levé tenant l'épée */}
      <path d="M244 230 C280 236 300 222 308 198 L284 186 C278 204 262 212 238 214 Z" fill={C.jacket} {...o} />
      <circle cx={304} cy={194} r={18} fill={C.fur} {...o} />
      {/* Tête */}
      <g transform="translate(72 0)">
        <FoxHead />
      </g>
    </svg>
  );
}
