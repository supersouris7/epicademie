import type { ReactNode } from 'react';

interface GamePanelProps {
  /** Onglet de titre en haut à gauche (planches : « Héros », « Boss »…). */
  readonly title?: ReactNode;
  readonly as?: 'section' | 'div' | 'header';
  readonly className?: string;
  readonly children: ReactNode;
  readonly 'aria-label'?: string;
}

/**
 * Panneau de menu dessiné en CSS : fond violet en léger dégradé, bordure violette, coins orange.
 */
export function GamePanel({ title, as: Tag = 'section', className = '', children, ...rest }: GamePanelProps) {
  return (
    <Tag
      className={`relative ${title ? 'mt-5 pt-7' : ''} border-outline rounded-game-lg border-[length:var(--stroke-lg)] bg-gradient-to-b from-[color-mix(in_srgb,var(--surface)_80%,white)] to-[var(--surface)] p-4 shadow-[inset_0_2px_0_rgb(255_255_255/0.12),var(--drop-md)] ${className}`}
      {...rest}
    >
      {/* Coins renforcés orange */}

      {[
        '-top-1 -left-1 rounded-tl-game-lg',
        '-top-1 -right-1 rounded-tr-game-lg',
        '-bottom-1 -left-1 rounded-bl-game-lg',
        '-bottom-1 -right-1 rounded-br-game-lg',
      ].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={`border-primary pointer-events-none absolute h-6 w-6 ${pos} ${pos.includes('top') ? 'border-t-[length:var(--stroke-lg)]' : 'border-b-[length:var(--stroke-lg)]'} ${pos.includes('left') ? 'border-l-[length:var(--stroke-lg)]' : 'border-r-[length:var(--stroke-lg)]'}`}
        />
      ))}

      {title && (
        <h2 className="cartoon bg-accent-strong font-display text-toon absolute -top-5 left-4 rounded-game-sm px-4 py-1 text-xl tracking-wide shadow-[var(--drop-sm)]">
          {title}
        </h2>
      )}
      {children}
    </Tag>
  );
}
