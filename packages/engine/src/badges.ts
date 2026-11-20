import type { BadgeCategory, BadgeProgress, BadgeTier } from '@questeo/shared';
import { BADGE_TIERS } from '@questeo/shared';

/**
 * Badges : TOUTES les conditions de déblocage sont ici (docs/adr/0018-badges.md). Un badge se
 * calcule à partir de compteurs tirés des événements déjà enregistrés (boss vaincus, séries,
 * réponses, répétition espacée) : rien de nouveau à stocker, aucune attribution en double.
 *
 * Pour ne pas encourager à refaire des exercices trop faciles, les compteurs sont choisis en
 * conséquence : une série parfaite ne compte qu'une fois par notion et par jour ; la persévérance
 * compte les erreurs corrigées au second essai ; les notions consolidées passent par la
 * répétition espacée (plusieurs jours).
 */

export interface BadgeDefinition {
  readonly category: BadgeCategory;
  readonly title: string;
  /** Ce qu'il faut faire, en une phrase d'enfant. */
  readonly how: string;
  /** Seuils des grades bronze, argent, or, diamant. */
  readonly thresholds: readonly [number, number, number, number];
}

export const BADGES: readonly BadgeDefinition[] = [
  {
    category: 'boss',
    title: 'Chasseur de boss',
    how: 'Bats des boss de chapitre différents.',
    thresholds: [1, 5, 15, 40],
  },
  {
    category: 'parfait',
    title: 'Sans faute',
    how: 'Réussis des séries d’entraînement sans aucune erreur (une par notion et par jour).',
    thresholds: [3, 10, 30, 75],
  },
  {
    category: 'perseverance',
    title: 'Persévérant',
    how: 'Trouve la bonne réponse au second essai, après l’indice.',
    thresholds: [5, 20, 60, 150],
  },
  {
    category: 'chapitres',
    title: 'Explorateur',
    how: 'Termine des chapitres : une médaille sur chacune de leurs notions.',
    thresholds: [1, 3, 8, 20],
  },
  {
    category: 'consolidees',
    title: 'Mémoire d’acier',
    how: 'Fais revenir des notions jusqu’à ce qu’elles soient acquises.',
    thresholds: [3, 10, 30, 80],
  },
  {
    category: 'heros',
    title: 'Collectionneur',
    how: 'Trouve des Acad-Héros dans les coffres.',
    thresholds: [2, 3, 4, 5],
  },
];

/** Compteurs d'un joueur, par catégorie. */
export type BadgeCounts = Readonly<Record<BadgeCategory, number>>;

/** Grade atteint et prochain objectif de chaque badge. */
export function badgeProgress(counts: BadgeCounts): BadgeProgress[] {
  return BADGES.map((b) => {
    const value = counts[b.category];
    const reached = b.thresholds.filter((t) => value >= t).length;
    const tier: BadgeTier | null = reached === 0 ? null : (BADGE_TIERS[reached - 1] ?? null);
    const next = b.thresholds[reached] ?? null;
    return { category: b.category, title: b.title, how: b.how, value, tier, next };
  });
}
