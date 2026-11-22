import type { FastifyInstance } from 'fastify';
import { api } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import type { Ownership } from '../accounts/index.ts';
import type { RecommendationsService } from './recommendations.service.ts';

/**
 * Routes des recommandations : le profil désigné doit être de la famille connectée (sinon 404).
 * Création et annulation : accès « parent » imposé par le contrat. Les corps ne sont pas journalisés.
 */
export function recommendationsRoutes(service: RecommendationsService, owns: Ownership) {
  return async (app: FastifyInstance) => {
    route(app, api.recommendations, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      return service.pending(params.id);
    });
    route(app, api.familyRecommendations, ({ actor }) => service.family(actor().familyId));
    route(app, api.createRecommendation, async ({ params, body, actor }) => {
      await owns.profile(actor(), params.id);
      return service.create(params.id, body);
    });
    route(app, api.cancelRecommendation, async ({ params, actor }) => {
      await owns.profile(actor(), params.id);
      await service.cancel(params.id, params.recommendationId);
    });
  };
}
