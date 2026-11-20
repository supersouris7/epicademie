import { z } from 'zod';
import type { BadgeCategory, BadgeTier } from './learning.ts';

/**
 * QG du joueur et cosmétiques (docs/adr/0021-qg-et-cosmetiques.md). Purement décoratifs : aucun
 * avantage de jeu. Trois façons de les obtenir : offerts au départ, achetés (rubis ou pièces
 * gagnés en jouant, jamais d'argent réel), ou débloqués par un badge (récompense d'apprentissage).
 */

export const COSMETIC_KINDS = ['fond', 'cadre', 'titre'] as const;
export type CosmeticKind = (typeof COSMETIC_KINDS)[number];

export const COSMETIC_KIND_LABELS: Record<CosmeticKind, string> = {
  fond: 'Décor du QG',
  cadre: 'Cadre du héros',
  titre: 'Titre',
};

export type CosmeticSource =
  | { readonly type: 'depart' }
  | { readonly type: 'achat'; readonly coins: number; readonly rubies: number }
  | { readonly type: 'badge'; readonly badge: BadgeCategory; readonly tier: BadgeTier };

export interface CosmeticInfo {
  readonly kind: CosmeticKind;
  readonly name: string;
  readonly source: CosmeticSource;
  /** Décor et cadre : rendu CSS (dégradé, couleur) ; titre : texte affiché. */
  readonly look: string;
}

const free = { type: 'depart' } as const;
const buy = (coins: number, rubies: number) => ({ type: 'achat', coins, rubies }) as const;
const badge = (b: BadgeCategory, tier: BadgeTier) => ({ type: 'badge', badge: b, tier }) as const;

export const COSMETICS = {
  'fond-classe': {
    kind: 'fond',
    name: 'Salle de classe',
    source: free,
    look: 'linear-gradient(180deg,#fef3c7,#fde68a)',
  },
  'fond-nuit': {
    kind: 'fond',
    name: 'Nuit étoilée',
    source: buy(0, 2),
    look: 'radial-gradient(circle at 30% 20%,#4c1d95,#0f172a 70%)',
  },
  'fond-ocean': {
    kind: 'fond',
    name: 'Fond marin',
    source: buy(0, 3),
    look: 'linear-gradient(180deg,#67e8f9,#0e7490)',
  },
  'fond-volcan': {
    kind: 'fond',
    name: 'Volcan',
    source: badge('boss', 'argent'),
    look: 'linear-gradient(180deg,#fb923c,#7f1d1d)',
  },
  'fond-foret': { kind: 'fond', name: 'Forêt', source: buy(400, 0), look: 'linear-gradient(180deg,#bbf7d0,#166534)' },
  'cadre-simple': { kind: 'cadre', name: 'Cadre simple', source: free, look: '#1f2937' },
  'cadre-or': { kind: 'cadre', name: 'Cadre doré', source: buy(0, 4), look: '#f59e0b' },
  'cadre-diamant': { kind: 'cadre', name: 'Cadre diamant', source: badge('consolidees', 'or'), look: '#22d3ee' },
  'cadre-feu': { kind: 'cadre', name: 'Cadre de feu', source: buy(300, 0), look: '#ef4444' },
  'titre-apprenti': { kind: 'titre', name: 'Apprenti', source: free, look: 'Apprenti' },
  'titre-chasseur': {
    kind: 'titre',
    name: 'Chasseur de boss',
    source: badge('boss', 'bronze'),
    look: 'Chasseur de boss',
  },
  'titre-perseverant': {
    kind: 'titre',
    name: 'Persévérant',
    source: badge('perseverance', 'argent'),
    look: 'Jamais abattu',
  },
  'titre-perfection': { kind: 'titre', name: 'Perfection', source: badge('parfait', 'or'), look: 'Sans faute' },
  'titre-explorateur': {
    kind: 'titre',
    name: 'Explorateur',
    source: badge('chapitres', 'argent'),
    look: 'Grand explorateur',
  },
  'titre-legende': { kind: 'titre', name: 'Légende', source: buy(0, 8), look: 'Légende de l’Académie' },
} as const satisfies Record<string, CosmeticInfo>;

export type CosmeticId = keyof typeof COSMETICS;
export const COSMETIC_IDS = Object.keys(COSMETICS) as [CosmeticId, ...CosmeticId[]];
export const CosmeticIdSchema = z.enum(COSMETIC_IDS);

export const cosmeticInfo = (id: CosmeticId): CosmeticInfo => COSMETICS[id];

/** Trophée mis en vitrine : boss vaincu, badge obtenu ou Acad-Héros trouvé (« type:id »). */
export const TrophyIdSchema = z
  .string()
  .regex(/^(boss:[a-z0-9-]+|badge:[a-z]+|heros:[a-z]+)$/)
  .max(80);
export const MAX_SHOWCASE = 3;

export const HqLayoutSchema = z.object({
  fond: CosmeticIdSchema,
  cadre: CosmeticIdSchema,
  titre: CosmeticIdSchema,
  vitrine: z.array(TrophyIdSchema).max(MAX_SHOWCASE),
});
export type HqLayout = z.infer<typeof HqLayoutSchema>;

export const DEFAULT_HQ: HqLayout = {
  fond: 'fond-classe',
  cadre: 'cadre-simple',
  titre: 'titre-apprenti',
  vitrine: [],
};

export const HqSchema = z.object({
  layout: HqLayoutSchema,
  /** Cosmétiques utilisables (offerts, achetés ou débloqués). */
  unlocked: z.array(CosmeticIdSchema),
  /** Trophées gagnés, pour la salle des trophées et la vitrine. */
  trophies: z.array(TrophyIdSchema),
});
export type Hq = z.infer<typeof HqSchema>;

export const BuyCosmeticSchema = z.object({ profileId: z.uuid(), cosmetic: CosmeticIdSchema });

export const CosmeticPurchaseSchema = z.object({
  coins: z.number().int().nonnegative(),
  rubies: z.number().int().nonnegative(),
  hq: HqSchema,
});
