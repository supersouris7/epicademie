/**
 * Animations communes (bibliothèque `motion`). Uniquement `transform` et `opacity` : pas de recalcul de mise en page.
 * Les durées reprennent les tokens CSS (--dur-*) ; la réduction des animations du système est respectée
 * par les composants (useReducedMotion) et par la règle globale de index.css.
 */
import type { TargetAndTransition, Transition } from 'motion/react';
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

/**
 * Animations des personnages par état. Sur place et victoire sont des animations dessinées
 * (bandes de 8 images) ; les poses fixes reçoivent un mouvement court (recul, élan…).
 */
export const CHARACTER_MOTION: Record<AnimationState, TargetAndTransition> = {
  // Sur place et victoire : animations dessinées image par image (bande de 8), pas de mouvement en plus.
  idle: {},
  run: { y: [0, -8, 0], transition: { duration: 0.35, repeat: Infinity, ease: 'easeInOut' } },
  shoot: { x: [0, -10, 0], transition: { duration: 0.25 } },
  shield: { x: [0, 6, 0], transition: { duration: 0.3 } },
  hurt: { x: [0, -14, 10, -6, 0], opacity: [1, 0.5, 1, 0.6, 1], transition: { duration: 0.45 } },
  victory: {},
  defeat: { y: 12, rotate: -8, opacity: 0.75, transition: { duration: DURATION.slow } },
};
