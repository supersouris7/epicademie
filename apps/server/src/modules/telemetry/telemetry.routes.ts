import type { FastifyInstance } from 'fastify';
import { api } from '@epicademie/shared';
import { route } from '../../core/http/route.ts';
import type { ErrorReporter } from '../../core/observability/error-reporter.ts';
import type { TelemetryService } from './telemetry.service.ts';

/**
 * Erreurs du navigateur remontées au serveur, puis au suivi d'erreurs. Débit très limité
 * (une page qui boucle ne doit pas noyer les journaux). Aucune donnée personnelle acceptée :
 * message, pile, chemin de la page et version seulement ; agrégées par empreinte (compteur).
 */
export function telemetryRoutes(reporter: ErrorReporter, service: TelemetryService) {
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
        await service.record(body);
      },
      { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } },
    );
  };
}
