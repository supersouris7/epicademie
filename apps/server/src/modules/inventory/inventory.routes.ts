import type { FastifyInstance } from 'fastify';
import { api } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import type { ShopService } from './shop.service.ts';

export function inventoryRoutes(shop: ShopService) {
  return async (app: FastifyInstance) => {
    route(app, api.buy, ({ body }) => shop.buy(body));
  };
}
