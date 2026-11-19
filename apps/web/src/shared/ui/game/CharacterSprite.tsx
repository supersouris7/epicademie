import { motion, useReducedMotion } from 'motion/react';
import type { HeroId } from '@questeo/shared';
import { heroPoseSrc, type AnimationState } from '../../../design/assets.ts';
import { CHARACTER_MOTION } from '../../../design/motion.ts';

interface CharacterSpriteProps {
  readonly hero: HeroId;
  readonly state: AnimationState;
  /** Hauteur affichée ; les poses sont carrées. */
  readonly height?: number;
  /** Retourne le personnage (face à gauche). */
  readonly flip?: boolean;
}

/**
 * Personnage animé par images clés : une image de pose par état (idle, course, tir, touché, victoire, défaite)
 * et un mouvement `motion` entre les poses. Point d'ancrage : milieu des pieds (bas centre), commun à toutes
 * les poses grâce au cadrage imposé à la génération.
 * Tant qu'une pose n'est pas livrée, rien n'est affiché : aucune animation n'est simulée sans image.
 */
export function CharacterSprite({ hero, state, height = 240, flip = false }: CharacterSpriteProps) {
  const reduce = useReducedMotion();
  // Pose manquante (touché, défaite) : la pose d'attente, animée selon l'état.
  const src = heroPoseSrc(hero, state);
  if (!src) return null;
  return (
    <motion.img
      key={state}
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      style={{ height, width: height, originX: 0.5, originY: 1, scaleX: flip ? -1 : 1 }}
      animate={reduce ? undefined : CHARACTER_MOTION[state]}
    />
  );
}
