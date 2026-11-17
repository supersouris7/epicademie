import { assetSrc } from '../../design/assets.ts';
import { skinStyle } from '../../design/skin.ts';

interface BossCardProps {
  readonly name: string;
  /** Illustration du boss (identifiant du catalogue). */
  readonly image: string;
  /** Matière affichée sur le bandeau. */
  readonly subject: string;
  /** Couleur du bandeau (variable CSS de matière). */
  readonly color?: string;
  readonly defeated?: boolean;
  readonly onClick?: () => void;
}

/** Carte de boss : illustration sur fond sombre, bandeau de matière coloré. */
export function BossCard({ name, image, subject, color = 'var(--danger)', defeated = false, onClick }: BossCardProps) {
  const src = assetSrc(image);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${name} — ${subject}${defeated ? ' (vaincu)' : ''}`}
      className="cartoon bg-accent-strong relative flex w-full flex-col items-center overflow-hidden"
      style={skinStyle('hud/frames/boss-card.webp', 22, '0.9rem')}
    >
      {src && (
        <img
          src={src}
          alt=""
          aria-hidden
          className={`aspect-square w-full object-contain p-2 ${defeated ? 'opacity-50 grayscale' : ''}`}
        />
      )}
      <span className="font-display text-toon w-full px-2 py-1 text-center text-lg" style={{ backgroundColor: color }}>
        {subject}
      </span>
    </button>
  );
}
