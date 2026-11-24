import type { FastifyInstance } from 'fastify';
import { api } from '@epicademie/shared';
import { route } from '../../core/http/route.ts';
import type { ShopService } from './shop.service.ts';
import type { Ownership } from '../accounts/index.ts';
import { IDEMPOTENCY_KEY } from '../../db/idempotency.ts';
import { badRequest } from '../../core/errors.ts';

/** Routes HTTP de la boutique : profil de la famille connectée seulement ; règles dans le service. */
export function inventoryRoutes(shop: ShopService, owns: Ownership) {
  return async (app: FastifyInstance) => {
    route(app, api.buy, async ({ body, actor, request }) => {
      await owns.profile(actor(), body.profileId);
      const key = request.headers['idempotency-key'];
      if (key === undefined) return shop.buy(body);
      if (typeof key !== 'string' || !IDEMPOTENCY_KEY.test(key)) throw badRequest('En-tête Idempotency-Key invalide');
      return shop.buy(body, { familyId: actor().familyId, key });
    });
  };
}
