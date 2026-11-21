import { GameIcon } from './GameIcon.tsx';

/**
 * Icône qui se remplit de couleur du bas vers le haut, comme une barre de progression : grise au
 * départ, une limite horizontale franche entre la partie en couleur (bas) et la partie grise.
 */
export function ProgressIcon({
  id,
  ratio,
  size,
  label,
}: {
  readonly id: string;
  /** Part remplie, de 0 à 1. */
  readonly ratio: number;
  readonly size: number;
  readonly label: string;
}) {
  const filled = Math.max(0, Math.min(1, ratio));
  return (
    <span role="img" aria-label={label} className="relative inline-block" style={{ width: size, height: size }}>
      <span aria-hidden className="absolute inset-0 opacity-70 grayscale">
        <GameIcon id={id} size={size} />
      </span>
      <span aria-hidden className="absolute inset-0" style={{ clipPath: `inset(${(1 - filled) * 100}% 0 0 0)` }}>
        <GameIcon id={id} size={size} />
      </span>
    </span>
  );
}
