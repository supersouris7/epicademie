import type { FastifyInstance } from 'fastify';
import { api } from '@epicademie/shared';
import { route } from '../../core/http/route.ts';
import type { AdminService } from './admin.service.ts';

/** Routes de consultation des comptes (permission du contrat vérifiée par `route()`). */
export function adminRoutes(service: AdminService) {
  return async (app: FastifyInstance) => {
    // Données de comptes et mot de passe temporaire : jamais mis en cache.
    app.addHook('onSend', async (_request, reply) => {
      reply.header('cache-control', 'no-store');
    });
    route(app, api.adminSession, async ({ admin }) => {
      const { name, role, via } = admin();
      return { operator: name, role, via };
    });
    route(app, api.adminAccounts, ({ body }) => service.search(body));
    route(app, api.adminAccount, ({ params, admin }) => service.detail(params.id, admin()));
    route(app, api.adminResetPassword, ({ params, admin }) => service.resetPassword(params.id, admin()), {
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    });
    route(app, api.adminAudit, ({ body }) => service.auditPage(body.page));
  };
}
