import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { hasZodFastifySchemaValidationErrors, isResponseSerializationError } from 'fastify-type-provider-zod';
import type { ErrorBody, ErrorCode } from '@questeo/shared';
import { AppError, statusOf } from '../errors.ts';
import type { ErrorReporter } from '../observability/error-reporter.ts';
import { scrubError } from '../observability/scrub.ts';

/**
 * Traduction uniforme des erreurs en réponses `{ code, error, requestId }`.
 *
 * - `AppError` (erreur métier attendue) : son code et son message ;
 * - entrée invalide (schéma du contrat) : 400 avec le détail des champs ;
 * - erreurs Fastify connues (JSON illisible, corps trop gros, débit dépassé) : code dédié ;
 * - tout le reste est un BUG : 500 avec un message neutre, détail dans les journaux et
 *   remontée au suivi d'erreurs. Jamais de pile ni de message interne envoyé au client.
 */
export function registerErrorHandling(app: FastifyInstance, reporter: ErrorReporter): void {
  app.setErrorHandler((err: FastifyError, request, reply) => {
    if (err instanceof AppError) return send(reply, request, err.code, err.message);

    if (hasZodFastifySchemaValidationErrors(err)) {
      const details = err.validation
        .map((v) => {
          const field = v.instancePath.replace(/^\//, '').replaceAll('/', '.');
          return field ? `${field} : ${v.message}` : v.message;
        })
        .join(' ; ');
      return send(reply, request, 'BAD_REQUEST', `Requête invalide — ${details}`);
    }

    if (isResponseSerializationError(err)) {
      // La réponse ne respecte pas le contrat : bug serveur.
      request.log.error({ err: scrubError(err), issues: err.cause.issues }, 'réponse hors contrat');
      reporter.capture(scrubError(err), { requestId: request.id, route: request.routeOptions.url });
      return send(reply, request, 'INTERNAL', 'Oups, le serveur a rencontré un problème.');
    }

    const status = err.statusCode ?? 500;
    if (status === 429) return send(reply, request, 'RATE_LIMITED', 'Trop de requêtes, réessaie dans un instant.');
    if (status === 413) return send(reply, request, 'PAYLOAD_TOO_LARGE', 'Requête trop volumineuse.');
    if (status >= 400 && status < 500) return send(reply, request, 'BAD_REQUEST', 'Requête invalide.', status);

    const safe = scrubError(err);
    request.log.error({ err: safe }, 'erreur interne');
    reporter.capture(safe, { requestId: request.id, route: request.routeOptions.url });
    return send(reply, request, 'INTERNAL', 'Oups, le serveur a rencontré un problème.');
  });
}

export function send(
  reply: FastifyReply,
  request: FastifyRequest,
  code: ErrorCode,
  message: string,
  status: number = statusOf(code),
) {
  const body: ErrorBody = { code, error: message, requestId: request.id };
  return reply.code(status).send(body);
}
