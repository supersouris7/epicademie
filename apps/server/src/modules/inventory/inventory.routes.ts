import type { FastifyInstance } from 'fastify';
import { api } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import type { ShopService } from './shop.service.ts';
import type { Ownership } from '../accounts/index.ts';

/** Routes HTTP de la boutique : profil de la famille connectée seulement ; règles dans le service. */
export function inventoryRoutes(shop: ShopService, owns: Ownership) {
  return async (app: FastifyInstance) => {
    route(app, api.buy, async ({ body, actor }) => {
      await owns.profile(actor(), body.profileId);
      return shop.buy(body);
    });
  };
}
