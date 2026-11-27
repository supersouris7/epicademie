import { motion, useReducedMotion } from 'motion/react';
import { AlertSymbol } from './AlertSymbol.tsx';

/**
 * Pièces du HUD façon jeu de combat, partagées par la barre de combat et la barre du menu
 * principal : même cadre sombre, portraits inclinés à bord doré, barres segmentées inclinées.
 */

/** Cadre du HUD : fond violet nuit, contour épais, ombre portée. */
export const HUD_FRAME =
  'border-outline rounded-2xl border-[3px] bg-[linear-gradient(180deg,#1b0f33,#2a1650)] text-white shadow-[0_4px_0_rgb(0_0_0/0.35)]';

/** Cadre du portrait, incliné vers le centre comme dans les jeux de combat. */
export function HudPortrait({
  side,
  size = 60,
  children,
}: {
  readonly side: 'left' | 'right';
  readonly size?: number;
  readonly children: React.ReactNode;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border-[3px] bg-[radial-gradient(circle_at_50%_35%,#5b3a9e,#1b0f33)] ${side === 'left' ? '-skew-x-6' : 'skew-x-6'}`}
      style={{ borderColor: 'var(--gold)', width: size, height: size }}
    >
      <div className={side === 'left' ? 'skew-x-6' : '-skew-x-6'}>{children}</div>
    </div>
  );
}

const FILLS = {
  life: 'linear-gradient(180deg,#ffe066,#f59f00)',
  low: 'linear-gradient(180deg,#ff8a7a,#e23b2e)',
  boss: 'linear-gradient(180deg,#ff6b6b,#c2183a)',
  xp: 'linear-gradient(180deg,#9ff0ff,#2bb3e6)',
  time: 'linear-gradient(180deg,#9ff0ff,#2bb3e6)',
} as const;

/**
 * Barre de jeu de combat : segments, remplissage jaune→orange (rouge au dernier point de vie),
 * traînée blanche qui rattrape la valeur restante après un coup. Se vide vers le centre.
 * `kind="xp"` : barre d'expérience (bleue, sans alerte), découpée en `segments` cases.
 * `kind="time"` : jauge de temps (bleue), rouge et pulsante quand `alert` ; `hit` rejoue la traînée.
 * En alerte, un symbole se pose sur le bout vide de la barre (jamais de texte dans les barres).
 */
export function HudBar({
  side,
  value,
  max,
  label,
  role,
  hit = 0,
  kind = 'life',
  alert,
  segments,
  className = '',
}: {
  readonly side: 'left' | 'right';
  readonly value: number;
  readonly max: number;
  readonly label: string;
  readonly role: 'img' | 'progressbar';
  readonly hit?: number;
  readonly kind?: 'life' | 'boss' | 'xp' | 'time';
  /** Force l'état d'alerte (rouge) ; par défaut : dernier point d'une barre de vie. */
  readonly alert?: boolean;
  /** Nombre de cases ; par défaut une par point (vies). */
  readonly segments?: number;
  readonly className?: string;
}) {
  const reduce = useReducedMotion();
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) * 100 : 0;
  const low = alert ?? (kind === 'life' && value <= 1);
  const fill = low ? FILLS.low : FILLS[kind];
  const origin = side === 'left' ? 'right-0' : 'left-0';
  const a11y =
    role === 'progressbar'
      ? { role, 'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': value }
      : { role, 'aria-label': label };
  return (
    <div className="relative w-full">
      <div
        {...a11y}
        className={`relative h-5 w-full overflow-hidden rounded-sm border-2 border-black/70 bg-black/60 ${side === 'left' ? '-skew-x-12' : 'skew-x-12'} ${className}`}
      >
        {/* Traînée : rattrape la valeur restante un peu après le coup. */}
        <motion.div
          key={`trail-${hit}`}
          className={`absolute inset-y-0 ${origin} bg-white/80`}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ delay: reduce ? 0 : 0.6, duration: reduce ? 0 : 0.5 }}
        />
        <motion.div
          className={`absolute inset-y-0 ${origin} ${low && !reduce ? 'animate-pulse' : ''}`}
          style={{ background: fill }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        />
        {/* Séparations entre les cases. */}
        <div className="absolute inset-0 flex" aria-hidden>
          {Array.from({ length: segments ?? max }, (_, i) => (
            <span key={i} className="h-full flex-1 border-r-2 border-black/50 last:border-r-0" />
          ))}
        </div>
      </div>
      {low && (
        <AlertSymbol
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${side === 'left' ? 'left-0' : 'right-0'}`}
        />
      )}
    </div>
  );
}
