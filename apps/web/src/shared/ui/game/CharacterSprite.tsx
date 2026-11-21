import { motion, useReducedMotion } from 'motion/react';
import type { HeroId } from '@questeo/shared';
import { assetSrc, HERO_ANIMS, type AnimationState } from '../../../design/assets.ts';
import { CHARACTER_MOTION } from '../../../design/motion.ts';
import { Sprite } from './Sprite.tsx';

interface CharacterSpriteProps {
  readonly hero: HeroId;
  readonly state: AnimationState;
  /** Hauteur affichée (pixels ou valeur CSS). */
  readonly height?: number | string;
  /** Retourne le personnage (face à gauche). */
  readonly flip?: boolean;
}

const isAnim = (s: AnimationState): s is (typeof HERO_ANIMS)[number] => (HERO_ANIMS as readonly string[]).includes(s);

/**
 * Héros en pied : animation dessinée pour « sur place » et « victoire » (bande de 8 images),
 * pose fixe pour le reste (course, tir, bouclier, touché, K.-O.), avec seulement une secousse aux impacts.
 * Point d'ancrage : bas centre (pieds).
 */
export function CharacterSprite({ hero, state, height = 240, flip = false }: CharacterSpriteProps) {
  const reduce = useReducedMotion();
  if (isAnim(state)) {
    return (
      <div className="flex items-end justify-center" style={{ height }}>
        <Sprite
          anim={`characters/${hero}/anim-${state}`}
          height={height}
          flip={flip}
          fps={state === 'victory' ? 10 : 7}
        />
      </div>
    );
  }
  const src = assetSrc(`characters-${hero}-pose-${state}`);
  if (!src) return null;
  return (
    <motion.img
      key={state}
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      // Même hauteur que l'animation : toutes les poses partagent le même cadre (même échelle,
      // pieds sur la même ligne), la largeur suit.
      className="block w-auto max-w-none"
      style={{ height, originX: 0.5, originY: 1, scaleX: flip ? -1 : 1 }}
      animate={reduce ? undefined : CHARACTER_MOTION[state]}
    />
  );
}
