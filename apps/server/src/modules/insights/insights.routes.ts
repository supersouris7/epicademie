import type { FastifyInstance } from 'fastify';
import { api, can, type AdminError, type AdminStats, type AdminTrends } from '@epicademie/shared';
import { route } from '../../core/http/route.ts';
import type { InsightsService } from './insights.service.ts';

/** Montants et abonnements : retirés de la réponse sans la permission `finances:lire`. */
const withoutMoney = (stats: AdminStats): AdminStats => ({ ...stats, premiumFamilies: null, payments: null });
const withoutSales = (trends: AdminTrends): AdminTrends => ({
  ...trends,
  activeSubscriptionsByDay: null,
  activeByOffer: null,
  revenueCents: null,
  paymentProviders: null,
});

/** Routes du pilotage (permissions du contrat vérifiées par `route()`). */
export function insightsRoutes(service: InsightsService, recentErrors: () => AdminError[]) {
  return async (app: FastifyInstance) => {
    route(app, api.adminStats, async ({ admin }) => {
      const stats = await service.stats();
      return can(admin().role, 'finances:lire') ? stats : withoutMoney(stats);
    });
    route(app, api.adminTrends, async ({ admin }) => {
      const trends = await service.trends();
      return can(admin().role, 'finances:lire') ? trends : withoutSales(trends);
    });
    route(app, api.adminAnomalies, () => service.anomalies());
    route(app, api.adminWeakSkills, () => service.weakSkills());
    route(app, api.adminErrors, async () => recentErrors());
  };
}
