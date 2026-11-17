import { and, eq, sql } from 'drizzle-orm';
import { ITEMS, MAX_ITEM_STOCK, type Inventory, type ItemId } from '@questeo/shared';
import type { Db } from './client.ts';
import { inventory } from './schema.ts';

/** Transaction ou base : les deux exposent la même API de requêtes. */
type Tx = Pick<Db, 'select' | 'insert' | 'update'>;

export function readInventory(db: Tx, profileId: string): Inventory {
  const out: Inventory = { bouclier: 0, soin: 0, indice: 0 };
  for (const row of db.select().from(inventory).where(eq(inventory.profileId, profileId)).all()) {
    if ((ITEMS as readonly string[]).includes(row.item)) out[row.item] = row.count;
  }
  return out;
}

/** Ajoute des objets (plafonnés au stock maximal) ; renvoie ce qui a vraiment été ajouté. */
export function addItems(db: Tx, profileId: string, gains: Partial<Inventory>): Partial<Inventory> {
  const current = readInventory(db, profileId);
  const added: Partial<Inventory> = {};
  for (const item of ITEMS) {
    const n = Math.min(gains[item] ?? 0, MAX_ITEM_STOCK - current[item]);
    if (n <= 0) continue;
    added[item] = n;
    db.insert(inventory)
      .values({ profileId, item, count: current[item] + n })
      .onConflictDoUpdate({ target: [inventory.profileId, inventory.item], set: { count: current[item] + n } })
      .run();
  }
  return added;
}

/** Consomme un objet ; false s'il n'y en a plus. */
export function takeItem(db: Tx, profileId: string, item: ItemId): boolean {
  if (readInventory(db, profileId)[item] <= 0) return false;
  db.update(inventory)
    .set({ count: sql`${inventory.count} - 1` })
    .where(and(eq(inventory.profileId, profileId), eq(inventory.item, item)))
    .run();
  return true;
}
