import { assetSrc } from '../../../design/assets.ts';

const ICON_SIZES = {
  xs: 'var(--icon-xs)',
  sm: 'var(--icon-sm)',
  md: 'var(--icon-md)',
  lg: 'var(--icon-lg)',
  xl: 'var(--icon-xl)',
} as const;
export type IconSize = keyof typeof ICON_SIZES;

interface GameIconProps {
  /** Identifiant du catalogue (ex. `icons-navigation-home`). */
  readonly id: string;
  readonly size?: IconSize | number;
  /** Texte alternatif ; vide (par défaut) = décoratif. */
  readonly label?: string;
  readonly className?: string;
}

/**
 * Icône du catalogue : image finale si elle est livrée, sinon SVG provisoire.
 * Rien n'est affiché si l'asset n'a ni image ni remplaçant (le libellé du parent reste lisible).
 */
export function GameIcon({ id, size = 'md', label = '', className = '' }: GameIconProps) {
  const src = assetSrc(id);
  if (!src) return null;
  const dim = typeof size === 'number' ? `${size}px` : ICON_SIZES[size];
  return (
    <img
      src={src}
      alt={label}
      aria-hidden={label ? undefined : true}
      draggable={false}
      decoding="async"
      className={`pointer-events-none shrink-0 select-none object-contain ${className}`}
      style={{ width: dim, height: dim }}
    />
  );
}
