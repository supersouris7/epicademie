import type { FastifyInstance, FastifyRequest, RouteShorthandOptions } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import type { z } from 'zod';
import { API_PREFIX, ErrorBodySchema, type AnyEndpoint, type ResponseOf } from '@questeo/shared';

/**
 * Branche un point d'accès du contrat (`@questeo/shared` → `api`) sur Fastify.
 *
 * Le contrat fournit méthode, chemin, schémas d'entrée et de sortie : Fastify valide les
 * paramètres et le corps AVANT le gestionnaire, puis la réponse APRÈS (un champ en trop est
 * retiré, un champ manquant est une erreur 500 : le contrat est tenu). Les mêmes schémas
 * produisent la documentation OpenAPI (/api/docs).
 */

type Present<S> = Exclude<S, undefined>;
/** Type de sortie d'un schéma optionnel du contrat (`undefined` s'il est absent). */
type Out<S> = [Present<S>] extends [never]
  ? undefined
  : Present<S> extends z.ZodType
    ? z.output<Present<S>>
    : undefined;

export interface HandlerInput<E extends AnyEndpoint> {
  readonly params: Out<E['params']>;
  readonly body: Out<E['body']>;
  readonly request: FastifyRequest;
}

/** Gestionnaire : renvoie la réponse du contrat (valeur ignorée pour une réponse 204). */
export type Handler<E extends AnyEndpoint> = (
  input: HandlerInput<E>,
) => Promise<ResponseOf<E> extends undefined ? unknown : ResponseOf<E>>;

export interface RouteOptions {
  /** Réglages par route (ex. limite de débit plus stricte). */
  readonly config?: RouteShorthandOptions['config'];
}

/** Erreurs documentées pour chaque route (corps commun `ErrorBodySchema`). */
const errorResponses = { '4xx': ErrorBodySchema, '5xx': ErrorBodySchema } as const;

export function route<E extends AnyEndpoint>(
  app: FastifyInstance,
  endpoint: E,
  handler: Handler<E>,
  options: RouteOptions = {},
): void {
  const success = endpoint.response ? { [endpoint.status]: endpoint.response } : {};
  app.withTypeProvider<ZodTypeProvider>().route({
    method: endpoint.method,
    url: endpoint.path,
    config: options.config,
    schema: {
      tags: [endpoint.tag],
      summary: endpoint.summary,
      ...('params' in endpoint ? { params: endpoint.params } : {}),
      ...('body' in endpoint ? { body: endpoint.body } : {}),
      response: { ...success, ...errorResponses },
    },
    handler: async (request, reply): Promise<void> => {
      const result = await handler({
        params: request.params as HandlerInput<E>['params'],
        body: request.body as HandlerInput<E>['body'],
        request,
      });
      // Réponse déjà validée par le schéma de sortie du contrat (sérialiseur Zod).
      const raw = reply as unknown as { code(n: number): { send(body?: unknown): unknown } };
      if (endpoint.status === 204) raw.code(204).send();
      else raw.code(endpoint.status).send(result);
    },
  });
}

/** Préfixe des routes métier versionnées. */
export const V1 = API_PREFIX;
