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
 * Panneau de menu dessiné en CSS : fond violet en léger dégradé et bordure sombre.
 */
export function GamePanel({ title, as: Tag = 'section', className = '', children, ...rest }: GamePanelProps) {
  return (
    <Tag
      className={`relative ${title ? 'mt-5 pt-7' : ''} border-outline rounded-game-lg border-[length:var(--stroke-lg)] bg-clip-padding bg-gradient-to-b from-[color-mix(in_srgb,var(--surface)_80%,white)] to-[var(--surface)] p-4 shadow-[inset_0_2px_0_rgb(255_255_255/0.12),var(--drop-md)] ${className}`}
      {...rest}
    >
      {title && (
        <h2 className="cartoon bg-accent-strong font-display text-toon absolute -top-5 left-4 rounded-game-sm px-4 py-1 text-xl tracking-wide shadow-[var(--drop-sm)]">
          {title}
        </h2>
      )}
      {children}
    </Tag>
  );
}
