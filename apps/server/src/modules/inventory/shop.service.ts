import { ITEM_PRICES, MAX_ITEM_STOCK, RUBY_PRICE, ITEM_INFO, type Buy, type Purchase } from '@questeo/shared';
import type { Db } from '../../db/client.ts';
import { conflict, notFound } from '../../core/errors.ts';
import { PROFILE_NOT_FOUND, profilesRepo } from '../profiles/index.ts';
import { inventoryRepo } from './inventory.repo.ts';

/** Boutique : un consommable ou un rubis contre des pièces, en une seule transaction. */
export function createShopService(db: Db) {
  return {
    buy({ profileId, item }: Buy): Promise<Purchase> {
      return db.transaction(async (tx) => {
        const profiles = profilesRepo(tx);
        const items = inventoryRepo(tx);
        const profile = await profiles.findForUpdate(profileId);
        if (!profile) throw notFound(PROFILE_NOT_FOUND);
        const price = item === 'rubis' ? RUBY_PRICE : ITEM_PRICES[item];
        if (profile.coins < price) throw conflict(`Il te faut ${price} pièces`);
        if (item !== 'rubis' && (await items.read(profileId))[item] >= MAX_ITEM_STOCK) {
          throw conflict(`${MAX_ITEM_STOCK} ${ITEM_INFO[item].name.toLowerCase()}s au maximum`);
        }
        const after = await profiles.spend(profileId, price, item === 'rubis' ? 1 : 0);
        if (!after) throw conflict(`Il te faut ${price} pièces`);
        if (item !== 'rubis') await items.add(profileId, { [item]: 1 });
        return { coins: after.coins, rubies: after.rubies, inventory: await items.read(profileId) };
      });
    },
  };
}

export type ShopService = ReturnType<typeof createShopService>;
