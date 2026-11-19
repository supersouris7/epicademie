import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { GameIcon, type IconSize } from './GameIcon.tsx';

/** Couleurs des boutons (planches : orange principal, violet secondaire, cyan, vert, rouge). */
const BUTTON_VARIANTS = {
  primary: 'bg-primary gloss',
  accent: 'bg-accent gloss',
  info: 'bg-info gloss',
  success: 'bg-success gloss',
  danger: 'bg-danger gloss',
  surface: 'bg-surface-2 gloss text-ink [text-shadow:none]',
} as const;
export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

const SIZES = {
  sm: { box: 'min-h-11 px-4 text-base gap-2', square: 'h-11 w-11', icon: 'sm' },
  md: { box: 'min-h-14 px-5 text-xl gap-2', square: 'h-14 w-14', icon: 'sm' },
  lg: { box: 'min-h-16 px-7 text-2xl gap-3', square: 'h-16 w-16', icon: 'md' },
  xl: { box: 'min-h-20 px-9 text-3xl gap-3', square: 'h-20 w-20', icon: 'lg' },
} as const satisfies Record<string, { box: string; square: string; icon: IconSize }>;

export interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: keyof typeof SIZES;
  /** Icône du catalogue affichée avant le libellé. */
  readonly icon?: string;
  /** Bouton carré sans libellé visible : `aria-label` obligatoire. */
  readonly iconOnly?: boolean;
  /** Sélectionné (bascule, onglet) : liseré doré. */
  readonly selected?: boolean;
  /** Verrouillé : grisé avec cadenas, reste focalisable mais ne déclenche rien. */
  readonly locked?: boolean;
  readonly children?: ReactNode;
}

/**
 * Bouton de jeu : contour épais, relief (bas assombri, reflet), ombre portée, enfoncement au toucher.
 * États : normal, survol (éclairci), appuyé, désactivé, sélectionné, verrouillé.
 */
export function GameButton({
  variant = 'primary',
  size = 'md',
  icon,
  iconOnly = false,
  selected,
  locked = false,
  className = '',
  children,
  onClick,
  ...rest
}: GameButtonProps) {
  const s = SIZES[size];
  const color = locked ? 'bg-locked text-locked-text [text-shadow:none]' : BUTTON_VARIANTS[variant];
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={locked || undefined}
      onClick={locked ? undefined : onClick}
      className={[
        'cartoon bevel font-display text-toon relative inline-flex shrink-0 items-center justify-center tracking-wide',
        'transition-[transform,box-shadow,filter] duration-(--dur-instant) ease-out',
        'hover:brightness-110 active:translate-y-1 active:shadow-[var(--bevel-pressed),0_2px_0_var(--shadow)]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 disabled:active:translate-y-0',
        'focus-visible:outline-gold focus-visible:outline-4 focus-visible:outline-offset-2',
        selected ? 'ring-gold ring-4 ring-offset-2 ring-offset-transparent' : '',
        locked ? 'cursor-not-allowed' : '',
        iconOnly ? s.square : s.box,
        color,
        className,
      ].join(' ')}
      {...rest}
    >
      {locked ? <GameIcon id="icons-status-locked" size={s.icon} /> : icon && <GameIcon id={icon} size={s.icon} />}
      {!iconOnly && children}
    </button>
  );
}
