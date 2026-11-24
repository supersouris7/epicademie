import { AnimatePresence, motion } from 'motion/react';
import type { HeroId } from '@epicademie/shared';
import { assetSrc, deliveredSrc, type HeroExpression } from '../../design/assets.ts';

/** Tête du héros dans le HUD du combat : son expression suit ce qui se passe (joie, colère, étourdi…). */
export function HeroFace({
  hero,
  expression,
  size = 56,
}: {
  readonly hero: HeroId;
  readonly expression: HeroExpression;
  readonly size?: number;
}) {
  const src = deliveredSrc(`characters-${hero}-head-${expression}`) ?? assetSrc(`characters-${hero}-portrait`);
  if (!src) return null;
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }} aria-hidden>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.img
          key={expression}
          src={src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        />
      </AnimatePresence>
    </span>
  );
}
