import type { FastifyInstance } from 'fastify';
import { api } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import type { Ownership } from '../accounts/index.ts';
import type { HqService } from './hq.service.ts';

/** Routes du QG : profils de la famille connectée seulement. */
export function hqRoutes(service: HqService, owns: Ownership) {
  return async (app: FastifyInstance) => {
    route(app, api.hq, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      return service.read(params.id);
    });
    route(app, api.saveHq, async ({ params, body, actor }) => {
      await owns.profile(actor(), params.id);
      return service.save(params.id, body);
    });
    route(app, api.buyCosmetic, async ({ body, actor }) => {
      await owns.profile(actor(), body.profileId);
      return service.buy(body.profileId, body.cosmetic);
    });
  };
}
