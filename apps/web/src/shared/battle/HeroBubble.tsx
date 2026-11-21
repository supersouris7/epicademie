import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { HeroId } from '@questeo/shared';
import type { HeroExpression } from '../../design/assets.ts';
import { HeroFace } from './HeroFace.tsx';
import { Bubble } from '../ui/Bubble.tsx';

/** Tête du héros et sa petite bulle à droite (par-dessus la barre de progression), qui s'efface d'elle-même. */
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
            initial={{ opacity: 0, x: -6, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            // Pas sur téléphone : la bulle recouvrait la barre de progression et le compteur d'XP.
            className="pointer-events-none absolute top-1/2 left-full z-30 ml-3 hidden w-max max-w-[min(40vw,18rem)] -translate-y-1/2 sm:block"
          >
            <Bubble tail="left" className="font-display px-3 py-1 text-sm leading-tight sm:text-base">
              {text}
            </Bubble>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
