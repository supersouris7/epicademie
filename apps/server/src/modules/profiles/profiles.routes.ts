import type { FastifyInstance } from 'fastify';
import { api } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import type { Ownership } from '../accounts/index.ts';
import type { ProfilesService } from './profiles.service.ts';

/**
 * Routes HTTP des profils (contrat : `api.*Profile*` dans @questeo/shared). Seuls les profils de
 * la famille connectée sont visibles ; création et suppression réservées au parent (contrat).
 */
export function profilesRoutes(service: ProfilesService, owns: Ownership) {
  return async (app: FastifyInstance) => {
    route(app, api.listProfiles, ({ actor }) => service.list(actor().familyId));
    route(app, api.getProfile, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      return service.get(params.id);
    });
    route(app, api.createProfile, ({ body, actor }) => service.create(body, actor().familyId));
    route(app, api.updateProfile, async ({ params, body, actor }) => {
      await owns.profile(actor(), params.id);
      return service.update(params.id, body, actor());
    });
    route(app, api.deleteProfile, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      await service.remove(params.id);
    });
  };
}
