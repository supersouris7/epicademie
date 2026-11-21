/**
 * Animations communes (bibliothèque `motion`). Uniquement `transform` et `opacity` : pas de recalcul de mise en page.
 * La réduction des animations du système est respectée
 * par les composants (useReducedMotion) et par la règle globale de index.css.
 */
import type { TargetAndTransition, Transition } from 'motion/react';
import type { AnimationState } from './assets.ts';

export const SPRING = {
  /** Apparition d'un élément (tuiles, cartes). */
  pop: { type: 'spring', stiffness: 260, damping: 16 },
  /** Remplissage des barres. */
  bar: { type: 'spring', stiffness: 90, damping: 18 },
  /** Petit rebond (compteurs qui changent). */
  bounce: { type: 'spring', stiffness: 500, damping: 12 },
} as const satisfies Record<string, Transition>;

/**
 * Mouvements des personnages par état. Sur place et victoire sont des animations dessinées
 * (bandes de 8 images) ; les poses sont fixes, avec seulement une secousse aux impacts (le recul
 * du tir, le coup reçu). Pas de rebond, de flottement ni de pulsation.
 */
export const CHARACTER_MOTION: Record<AnimationState, TargetAndTransition> = {
  idle: {},
  run: {},
  shoot: { x: [0, -10, 0], transition: { duration: 0.25 } },
  shield: {},
  hurt: { x: [0, -14, 10, -6, 0], transition: { duration: 0.45 } },
  victory: {},
  defeat: {},
};
