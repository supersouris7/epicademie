import type { FastifyInstance } from 'fastify';
import { api } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import type { AdminService } from './admin.service.ts';

/** Routes de consultation des comptes (opérateur seulement, vérifié par le contrat). */
export function adminRoutes(service: AdminService) {
  return async (app: FastifyInstance) => {
    // Données de comptes et mot de passe temporaire : jamais mis en cache.
    app.addHook('onSend', async (_request, reply) => {
      reply.header('cache-control', 'no-store');
    });
    route(app, api.adminSession, async ({ operator }) => ({ operator: operator() }));
    route(app, api.adminAccounts, ({ body }) => service.search(body));
    route(app, api.adminAccount, ({ params, operator }) => service.detail(params.id, operator()));
    route(app, api.adminResetPassword, ({ params, operator }) => service.resetPassword(params.id, operator()), {
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    });
    route(app, api.adminAudit, ({ body }) => service.auditPage(body.page));
  };
}
