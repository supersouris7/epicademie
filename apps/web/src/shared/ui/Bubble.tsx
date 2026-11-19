import type { ReactNode } from 'react';

/**
 * Bulle de dialogue dessinée en CSS (nette à toutes les tailles) : fond clair légèrement dégradé,
 * contour encre, petite pointe tournée vers celui qui parle.
 * Tons : crème (gentils, Questy, héros) ou rouge pâle (méchants).
 */
export function Bubble({
  children,
  tail = 'left',
  tone = 'cream',
  className = '',
}: {
  readonly children: ReactNode;
  /** Côté de la pointe : vers le personnage. */
  readonly tail?: 'left' | 'right' | 'none';
  readonly tone?: 'cream' | 'villain';
  readonly className?: string;
}) {
  const bg = tone === 'villain' ? 'var(--bubble-villain)' : 'var(--bubble-cream)';
  return (
    <div
      className={`text-on-light relative min-w-0 rounded-2xl border-[3px] border-[var(--outline)] px-4 py-2.5 leading-snug font-bold shadow-[0_4px_0_var(--outline),0_10px_18px_rgb(0_0_0/0.25)] ${className}`}
      style={{ background: `linear-gradient(180deg, color-mix(in srgb, white 35%, ${bg}) 0%, ${bg} 55%)` }}
    >
      {children}
      {tail !== 'none' && (
        <span
          aria-hidden
          className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-[var(--outline)] ${tail === 'left' ? '-left-[10px] border-b-[3px] border-l-[3px]' : '-right-[10px] border-t-[3px] border-r-[3px]'}`}
          style={{ background: bg }}
        />
      )}
    </div>
  );
}
