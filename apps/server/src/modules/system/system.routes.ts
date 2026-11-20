import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { api } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import { send } from '../../core/http/errors.ts';
import type { Metrics } from '../../core/observability/metrics.ts';

/**
 * Routes d'exploitation, hors version d'API (stables pour les sondes et la supervision) :
 * - /api/health : le processus répond (sonde de vivacité) ;
 * - /api/ready  : la base répond aussi (sonde de disponibilité : retirer l'instance du
 *   répartiteur si elle échoue) ;
 * - /api/metrics : métriques Prometheus (jeton optionnel).
 */
export interface SystemDeps {
  readonly ping: () => Promise<void>;
  readonly metrics: Metrics;
  readonly metricsToken: string | null;
  readonly version: string;
}

const Status = z.object({ status: z.literal('ok'), version: z.string() });

export function opsRoutes(deps: SystemDeps) {
  return async (app: FastifyInstance) => {
    const typed = app.withTypeProvider<ZodTypeProvider>();
    const noLimit = { rateLimit: false } as const;

    typed.get(
      '/health',
      { config: noLimit, schema: { tags: ['systeme'], summary: 'Le processus répond', response: { 200: Status } } },
      async () => ({ status: 'ok' as const, version: deps.version }),
    );

    typed.get(
      '/ready',
      { config: noLimit, schema: { tags: ['systeme'], summary: 'Le serveur et sa base répondent' } },
      async (request, reply) => {
        try {
          await deps.ping();
          return { status: 'ok', version: deps.version };
        } catch (err) {
          request.log.warn({ err }, 'base injoignable');
          return send(reply, request, 'UNAVAILABLE', 'Base de données injoignable');
        }
      },
    );

    typed.get('/metrics', { config: noLimit, schema: { hide: true } }, async (request, reply) => {
      if (deps.metricsToken && request.headers.authorization !== `Bearer ${deps.metricsToken}`) {
        return send(reply, request, 'UNAUTHORIZED', 'Jeton requis');
      }
      return reply.type(deps.metrics.registry.contentType).send(await deps.metrics.registry.metrics());
    });
  };
}

/** Routes versionnées d'information système (réseau, présence). */
export function systemRoutes(deps: {
  readonly publicUrl: () => string | null;
  readonly onlineIds: (familyId: string) => string[];
}) {
  return async (app: FastifyInstance) => {
    route(app, api.network, async () => ({ publicUrl: deps.publicUrl() }));
    route(app, api.presence, async ({ actor }) => ({ online: deps.onlineIds(actor().familyId) }));
  };
}
