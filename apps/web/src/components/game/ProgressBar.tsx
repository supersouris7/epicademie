import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { SPRING } from '../../design/motion.ts';
import { GameIcon } from './GameIcon.tsx';

export interface ProgressBarProps {
  readonly value: number;
  readonly max: number;
  /** Nom accessible de la barre. */
  readonly label: string;
  /** Couleur de remplissage (variable CSS). */
  readonly color?: string;
  /** Icône posée à gauche, qui déborde de la barre. */
  readonly icon?: string;
  /** Texte affiché dans la barre (ex. « 340 / 500 »). */
  readonly text?: ReactNode;
  /** Nombre de segments dessinés (barres de vie, d'énergie). */
  readonly segments?: number;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

const HEIGHTS = { sm: 'h-4', md: 'h-6', lg: 'h-8' } as const;

/**
 * Barre de progression de HUD : rail sombre, remplissage brillant segmenté, icône à gauche.
 * Le remplissage s'anime en `scaleX` (pas de recalcul de mise en page).
 */
export function ProgressBar({
  value,
  max,
  label,
  color = 'var(--primary)',
  icon,
  text,
  segments,
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const reduce = useReducedMotion();
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div className={`relative flex items-center ${icon ? 'pl-6' : ''} ${className}`}>
      {icon && (
        <span className="absolute left-0 z-10 drop-shadow-[0_2px_0_var(--shadow)]">
          <GameIcon id={icon} size={size === 'lg' ? 52 : 40} />
        </span>
      )}
      <div
        className={`border-outline bg-track relative flex-1 overflow-hidden rounded-full border-[length:var(--stroke-sm)] ${HEIGHTS[size]} ${icon ? 'pl-4' : ''}`}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <motion.div
          className="absolute inset-0 origin-left rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: 'inset 0 -3px 0 rgb(0 0 0 / 0.2), inset 0 2px 0 rgb(255 255 255 / 0.45)',
          }}
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: ratio }}
          transition={SPRING.bar}
        />
        {segments && segments > 1 && (
          <div aria-hidden className="absolute inset-0 flex">
            {Array.from({ length: segments }, (_, i) => (
              <span
                key={i}
                className="flex-1 border-r-2 border-black/15 last:border-r-0"
                style={{ transform: 'skewX(-20deg)' }}
              />
            ))}
          </div>
        )}
        {text !== undefined && (
          <span className="font-display text-toon absolute inset-0 flex items-center justify-center text-sm leading-none">
            {text}
          </span>
        )}
      </div>
    </div>
  );
}
