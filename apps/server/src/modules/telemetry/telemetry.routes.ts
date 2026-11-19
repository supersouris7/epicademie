import type { FastifyInstance } from 'fastify';
import { api } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import type { ErrorReporter } from '../../core/observability/error-reporter.ts';

/**
 * Erreurs du navigateur remontées au serveur, puis au suivi d'erreurs. Débit très limité
 * (une page qui boucle ne doit pas noyer les journaux). Aucune donnée personnelle acceptée :
 * message, pile, chemin de la page et version seulement.
 */
export function telemetryRoutes(reporter: ErrorReporter) {
  return async (app: FastifyInstance) => {
    route(
      app,
      api.reportClientError,
      async ({ body, request }) => {
        reporter.capture(Object.assign(new Error(body.message), { stack: body.stack }), {
          source: 'client',
          requestId: request.id,
          path: body.path,
          release: body.release,
        });
      },
      { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } },
    );
  };
}
