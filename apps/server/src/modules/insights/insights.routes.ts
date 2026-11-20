import type { FastifyInstance } from 'fastify';
import { api, type AdminError } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import type { InsightsService } from './insights.service.ts';

/** Routes du pilotage (rôle administrateur, vérifié par le contrat). */
export function insightsRoutes(service: InsightsService, recentErrors: () => AdminError[]) {
  return async (app: FastifyInstance) => {
    route(app, api.adminStats, () => service.stats());
    route(app, api.adminAnomalies, () => service.anomalies());
    route(app, api.adminErrors, async () => recentErrors());
  };
}
