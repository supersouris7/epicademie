import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { HeroId } from '@questeo/shared';
import type { HeroExpression } from '../../design/assets.ts';
import { HeroFace } from './HeroFace.tsx';

/** Tête du héros et sa petite bulle, qui s'efface d'elle-même (sans pousser le reste de l'écran). */
export function HeroBubble({
  hero,
  face,
  text,
  nonce,
  size = 56,
}: {
  readonly hero: HeroId;
  readonly face: HeroExpression;
  readonly text: string;
  readonly nonce: number;
  readonly size?: number;
}) {
  // La bulle s'efface après 2,2 s ; une nouvelle réaction (nonce) la fait réapparaître.
  const [hidden, setHidden] = useState<number | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setHidden(nonce), 2200);
    return () => clearTimeout(t);
  }, [nonce]);
  const shown = hidden === nonce ? null : nonce;
  return (
    <div className="relative shrink-0">
      <HeroFace hero={hero} expression={face} size={size} />
      <AnimatePresence>
        {shown === nonce && text && (
          <motion.span
            key={nonce}
            role="status"
            initial={{ opacity: 0, y: -6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="cartoon font-display text-on-light pointer-events-none absolute top-full left-1/2 z-30 mt-1 -translate-x-1/4 rounded-2xl bg-white px-3 py-1 text-base whitespace-nowrap shadow-lg"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
