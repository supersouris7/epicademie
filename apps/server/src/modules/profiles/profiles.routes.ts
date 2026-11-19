import type { FastifyInstance } from 'fastify';
import { api } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import type { ProfilesService } from './profiles.service.ts';

/** Routes HTTP des profils (contrat : `api.*Profile*` dans @questeo/shared). */
export function profilesRoutes(service: ProfilesService) {
  return async (app: FastifyInstance) => {
    route(app, api.listProfiles, () => service.list());
    route(app, api.getProfile, ({ params }) => service.get(params.id));
    route(app, api.createProfile, ({ body }) => service.create(body));
    route(app, api.updateProfile, ({ params, body }) => service.update(params.id, body));
    route(app, api.deleteProfile, async ({ params }) => service.remove(params.id));
  };
}
