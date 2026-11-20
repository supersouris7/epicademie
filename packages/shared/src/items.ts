import { z } from 'zod';
import { HEROES } from './profile.ts';

/**
 * Objets et économie du jeu : objets de combat à usage unique, coffres, prix.
 * Dépend seulement de la liste des héros (`profile.ts`) ; importé par `play.ts` et `battle.ts`.
 */

/** Objets à usage unique, gagnés à l'entraînement et utilisés pendant un combat de boss. */
export const ITEMS = ['bouclier', 'soin', 'indice'] as const;
export const ItemIdSchema = z.enum(ITEMS);
export type ItemId = z.infer<typeof ItemIdSchema>;

const count = z.number().int().nonnegative();

/** Quantité possédée de chaque objet. */
export const InventorySchema = z.object({ bouclier: count, soin: count, indice: count });
export type Inventory = z.infer<typeof InventorySchema>;

/** Gain ou perte partiels (seuls les objets concernés sont présents). */
export const PartialInventorySchema = InventorySchema.partial();

export const ITEM_INFO: Record<ItemId, { readonly name: string; readonly effect: string; readonly earn: string }> = {
  bouclier: { name: 'Bouclier', effect: 'Bloque la prochaine riposte', earn: 'Dans les coffres de l’entraînement' },
  soin: { name: 'Soin', effect: 'Rend 1 cœur', earn: 'Dans les coffres de l’entraînement' },
  indice: {
    name: 'Indice',
    effect: 'Affiche l’indice de la question',
    earn: 'Dans les coffres, ou avec des pièces',
  },
};

/** Coffre d'équipement gagné au hasard en fin de série d'entraînement. */
export const CHEST_RARITIES = ['commun', 'rare', 'epique'] as const;
export type ChestRarity = (typeof CHEST_RARITIES)[number];
export const ChestSchema = z.object({
  rarity: z.enum(CHEST_RARITIES),
  items: PartialInventorySchema,
  coins: count,
  rubies: count,
  /**
   * Acad-Héros trouvé (null : aucun). `duplicate` : déjà dans la collection, converti en pièces
   * (comprises dans `coins`).
   */
  hero: z.object({ id: z.enum(HEROES), duplicate: z.boolean() }).nullable(),
});
export type Chest = z.infer<typeof ChestSchema>;

/** Stock maximal par objet, emplacements d'équipement (objets utilisables par combat), prix. */
export const MAX_ITEM_STOCK = 9;
export const MAX_ITEMS_PER_BATTLE = 3;
export const HINT_PRICE = 20;
export const ITEM_PRICES: Record<ItemId, number> = { indice: 20, soin: 30, bouclier: 40 };
export const RUBY_PRICE = 2000;

/** Garde les objets équipés que l'inventaire couvre encore (3 au plus). */
export function sanitizeEquipped(items: readonly ItemId[], inventory: Inventory): ItemId[] {
  const left: Inventory = { ...inventory };
  const out: ItemId[] = [];
  for (const item of items) {
    if (out.length >= MAX_ITEMS_PER_BATTLE || left[item] <= 0) continue;
    left[item]--;
    out.push(item);
  }
  return out;
}

/** Équipement choisi avant un combat : jusqu'à 3 objets pris dans la réserve. */
export const EquipmentSchema = z.object({ items: z.array(ItemIdSchema).max(MAX_ITEMS_PER_BATTLE) });
export type Equipment = z.infer<typeof EquipmentSchema>;

/** Achat à la boutique : un consommable, ou un rubis. */
export const BuySchema = z.object({ profileId: z.uuid(), item: z.union([ItemIdSchema, z.literal('rubis')]) });
export type Buy = z.infer<typeof BuySchema>;

export const PurchaseSchema = z.object({ coins: count, rubies: count, inventory: InventorySchema });
export type Purchase = z.infer<typeof PurchaseSchema>;
