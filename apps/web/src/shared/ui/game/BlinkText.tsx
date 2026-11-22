import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/** Message qui clignote doucement (« Touche l'écran pour continuer ») ; fixe avec prefers-reduced-motion. */
export function BlinkText({
  children,
  className = 'font-display text-toon pointer-events-none relative text-xl',
  delay = 1.2,
  as = 'p',
  id,
}: {
  children: ReactNode;
  className?: string;
  /** Attente avant l'apparition (secondes). */
  delay?: number;
  /** Balise rendue (un titre garde son niveau). */
  as?: 'p' | 'h2';
  id?: string;
}) {
  const reduce = useReducedMotion();
  const Tag = as === 'h2' ? motion.h2 : motion.p;
  return (
    <Tag
      id={id}
      initial={{ opacity: 0 }}
      animate={reduce ? { opacity: 1 } : { opacity: [0.4, 1, 0.4] }}
      transition={{ delay, duration: 1.6, repeat: reduce ? 0 : Infinity }}
      className={className}
    >
      {children}
    </Tag>
  );
}
