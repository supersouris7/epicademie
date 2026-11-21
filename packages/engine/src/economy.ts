import type { ChestRarity } from '@questeo/shared';

/**
 * Paramètres d'équilibrage de l'économie, réunis ici (docs/adr/0019-economie.md) : un seul
 * endroit à modifier, vérifié par la simulation `economy.test.ts`. Les prix de la boutique
 * (`ITEM_PRICES`, `RUBY_PRICE` = 2 000 pièces le rubis) et le barème d'XP (`xp.ts`) restent dans
 * leurs modules et sont repris par la simulation.
 */
export const ECONOMY = {
  chest: {
    /**
     * Contenu par rareté : commun = pièces ; rare = un objet ; épique = deux objets et un rubis ;
     * légendaire = trois objets, beaucoup de pièces et deux rubis.
     */
    content: {
      commun: { items: 0, coins: 25, rubies: 0 },
      rare: { items: 1, coins: 15, rubies: 0 },
      epique: { items: 2, coins: 40, rubies: 1 },
      legendaire: { items: 3, coins: 80, rubies: 2 },
    } satisfies Record<ChestRarity, { items: number; coins: number; rubies: number }>,
    /** Tirage de rareté (entraînement) : 55 % commun, 30 % rare, 12 % épique, 3 % légendaire. */
    rareFrom: 0.55,
    epicFrom: 0.85,
    legendaryFrom: 0.97,
    /** Sans-faute du premier coup : tirage décalé vers le haut (≈ 36 / 43 / 17 / 4 %). */
    perfectBoost: 0.3,
    /** Boss : la médaille fixe la rareté, avec une chance de monter d'un cran (jamais de descendre). */
    bossUpgradeChance: 0.25,
    /** Chance de trouver un Acad-Héros selon la rareté du coffre. */
    heroChance: { commun: 0, rare: 0.04, epique: 0.25, legendaire: 0.5 } satisfies Record<ChestRarity, number>,
    /** Héros déjà possédé : converti en pièces. */
    duplicateHeroCoins: 60,
  },
} as const;
