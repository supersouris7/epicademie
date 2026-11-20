import {
  ITEM_PRICES,
  MAX_ITEM_STOCK,
  PurchaseSchema,
  RUBY_PRICE,
  ITEM_INFO,
  type Buy,
  type Purchase,
} from '@questeo/shared';
import { idempotencyRepo } from '../../db/idempotency.ts';
import type { Db } from '../../db/client.ts';
import { conflict, notFound } from '../../core/errors.ts';
import { PROFILE_NOT_FOUND, profilesRepo } from '../profiles/index.ts';
import { inventoryRepo } from './inventory.repo.ts';

/**
 * Boutique : un consommable ou un rubis contre des pièces, en une seule transaction. Avec une
 * clé d'idempotence, une requête rejouée (double appui, réseau qui renvoie) rend le même achat
 * au lieu de débiter une seconde fois.
 */
export function createShopService(db: Db) {
  return {
    buy({ profileId, item }: Buy, replay?: { familyId: string; key: string }): Promise<Purchase> {
      return db.transaction(async (tx) => {
        const profiles = profilesRepo(tx);
        const items = inventoryRepo(tx);
        // Le verrou du profil d'abord : deux requêtes de même clé passent l'une après l'autre.
        const profile = await profiles.findForUpdate(profileId);
        if (!profile) throw notFound(PROFILE_NOT_FOUND);
        const done = replay && (await idempotencyRepo(tx).find(replay.familyId, replay.key, 'buy'));
        if (done) return PurchaseSchema.parse(done);
        const price = item === 'rubis' ? RUBY_PRICE : ITEM_PRICES[item];
        if (profile.coins < price) throw conflict(`Il te faut ${price} pièces`);
        if (item !== 'rubis' && (await items.read(profileId))[item] >= MAX_ITEM_STOCK) {
          throw conflict(`${MAX_ITEM_STOCK} ${ITEM_INFO[item].name.toLowerCase()}s au maximum`);
        }
        const after = await profiles.spend(profileId, price, item === 'rubis' ? 1 : 0);
        if (!after) throw conflict(`Il te faut ${price} pièces`);
        if (item !== 'rubis') await items.add(profileId, { [item]: 1 });
        const purchase = { coins: after.coins, rubies: after.rubies, inventory: await items.read(profileId) };
        if (replay) await idempotencyRepo(tx).save(replay.familyId, replay.key, 'buy', purchase, new Date());
        return purchase;
      });
    },
  };
}

export type ShopService = ReturnType<typeof createShopService>;
