/**
 * Animations communes (bibliothèque `motion`). Uniquement `transform` et `opacity` : pas de recalcul de mise en page.
 * Les durées reprennent les tokens CSS (--dur-*) ; la réduction des animations du système est respectée
 * par les composants (useReducedMotion) et par la règle globale de index.css.
 */
import type { TargetAndTransition, Transition, Variants } from 'motion/react';
import type { AnimationState } from './assets.ts';

/** Durées en secondes (miroir de --dur-* dans tokens.css). */
export const DURATION = { instant: 0.08, fast: 0.15, base: 0.25, slow: 0.45 } as const;

export const SPRING = {
  /** Apparition d'un élément (tuiles, cartes). */
  pop: { type: 'spring', stiffness: 260, damping: 16 },
  /** Remplissage des barres. */
  bar: { type: 'spring', stiffness: 90, damping: 18 },
  /** Petit rebond (compteurs qui changent). */
  bounce: { type: 'spring', stiffness: 500, damping: 12 },
} as const satisfies Record<string, Transition>;

/** Apparition échelonnée d'une liste : `custom={index}`. */
export const popIn: Variants = {
  hidden: { scale: 0.85, opacity: 0 },
  shown: (i = 0) => ({ scale: 1, opacity: 1, transition: { ...SPRING.pop, delay: 0.04 * i } }),
};

/**
 * Animations des personnages par état. Les images de pose changent selon l'état ;
 * ces mouvements donnent la vie entre deux poses (respiration, recul, saut…).
 */
export const CHARACTER_MOTION: Record<AnimationState, TargetAndTransition> = {
  idle: { y: [0, -4, 0], transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  run: { y: [0, -8, 0], transition: { duration: 0.35, repeat: Infinity, ease: 'easeInOut' } },
  shoot: { x: [0, -10, 0], transition: { duration: 0.25 } },
  jump: { y: [0, -36, 0], transition: { duration: 0.5, ease: 'easeOut' } },
  shield: { x: [0, 6, 0], transition: { duration: 0.3 } },
  hurt: { x: [0, -14, 10, -6, 0], opacity: [1, 0.5, 1, 0.6, 1], transition: { duration: 0.45 } },
  victory: { y: [0, -30, 0], scale: [1, 1.05, 1], transition: { duration: 0.6, repeat: 2 } },
  defeat: { y: 12, rotate: -8, opacity: 0.75, transition: { duration: DURATION.slow } },
};

/** Secousse d'impact (bonne réponse contre un boss, erreur…). */
export const shake = { x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } } as const;
