import { and, eq, gt, sql } from 'drizzle-orm';
import { ITEMS, MAX_ITEM_STOCK, sanitizeEquipped, type Inventory, type ItemId } from '@questeo/shared';
import type { Executor } from '../../db/client.ts';
import { inventory, profiles } from '../../db/schema.ts';

/**
 * Inventaire d'objets de combat et équipement (objets mis de côté pour les prochains combats).
 * Toutes les fonctions acceptent la base ou une transaction : l'appelant fixe la frontière
 * transactionnelle.
 */
export function inventoryRepo(db: Executor) {
  const read = async (profileId: string): Promise<Inventory> => {
    const out: Inventory = { bouclier: 0, soin: 0, indice: 0 };
    const rows = await db.select().from(inventory).where(eq(inventory.profileId, profileId));
    for (const row of rows) if ((ITEMS as readonly string[]).includes(row.item)) out[row.item] = row.count;
    return out;
  };

  return {
    read,

    /** Ajoute des objets (plafonnés au stock maximal) ; renvoie ce qui a vraiment été ajouté. */
    async add(profileId: string, gains: Partial<Inventory>): Promise<Partial<Inventory>> {
      const current = await read(profileId);
      const added: Partial<Inventory> = {};
      for (const item of ITEMS) {
        const n = Math.min(gains[item] ?? 0, MAX_ITEM_STOCK - current[item]);
        if (n <= 0) continue;
        added[item] = n;
        await db
          .insert(inventory)
          .values({ profileId, item, count: n })
          .onConflictDoUpdate({
            target: [inventory.profileId, inventory.item],
            set: { count: sql`least(${inventory.count} + ${n}, ${MAX_ITEM_STOCK})` },
          });
      }
      return added;
    },

    /** Consomme un objet de façon atomique ; `false` s'il n'y en a plus. */
    async take(profileId: string, item: ItemId): Promise<boolean> {
      const taken = await db
        .update(inventory)
        .set({ count: sql`${inventory.count} - 1` })
        .where(and(eq(inventory.profileId, profileId), eq(inventory.item, item), gt(inventory.count, 0)))
        .returning({ count: inventory.count });
      return taken.length > 0;
    },

    /** Objets équipés (3 au plus), limités à ce que l'inventaire couvre encore. */
    async equipped(profileId: string): Promise<ItemId[]> {
      const [row] = await db.select({ equipped: profiles.equipped }).from(profiles).where(eq(profiles.id, profileId));
      return sanitizeEquipped(row?.equipped ?? [], await read(profileId));
    },

    /** Remplace l'équipement ; `null` si l'inventaire ne couvre pas la demande. */
    async setEquipped(profileId: string, items: readonly ItemId[]): Promise<ItemId[] | null> {
      const clean = sanitizeEquipped(items, await read(profileId));
      if (clean.length !== items.length) return null;
      await db.update(profiles).set({ equipped: clean }).where(eq(profiles.id, profileId));
      return clean;
    },

    /** Retire un exemplaire d'un objet de l'équipement (objet utilisé en combat). */
    async unequipOne(profileId: string, item: ItemId): Promise<void> {
      const [row] = await db.select({ equipped: profiles.equipped }).from(profiles).where(eq(profiles.id, profileId));
      const list = [...(row?.equipped ?? [])];
      const i = list.indexOf(item);
      if (i < 0) return;
      list.splice(i, 1);
      await db.update(profiles).set({ equipped: list }).where(eq(profiles.id, profileId));
    },
  };
}
