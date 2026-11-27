import {
  API_PREFIX,
  buildPath,
  type AnyEndpoint,
  type BodyOf,
  type ErrorBody,
  type ErrorCode,
  type ParamsOf,
  type ResponseOf,
} from '@epicademie/shared';

/**
 * Client HTTP typé par le contrat de l'API (`api` de @epicademie/shared) : chemin, paramètres,
 * corps et réponse sont vérifiés à la compilation ; aucune URL écrite à la main.
 *
 *   const profile = await request(api.getProfile, { params: { id } });
 */

/** Erreur d'appel : statut HTTP (0 = réseau), code stable, message affichable. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode | 'NETWORK',
    message: string,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Réponses d’un relais quand le serveur redémarre ou ne répond pas : passagères. */
export const isGatewayError = (status: number) => status === 502 || status === 503 || status === 504;

/** Délai maximal d'une requête (réseau du collège ou de la maison parfois lent). */
const TIMEOUT_MS = 15_000;

type Input<E extends AnyEndpoint> = (ParamsOf<E> extends undefined
  ? { readonly params?: undefined }
  : { readonly params: ParamsOf<E> }) &
  (BodyOf<E> extends undefined ? { readonly body?: undefined } : { readonly body: BodyOf<E> }) & {
    /** Clé d'idempotence : une requête rejouée (double appui, réseau) n'est exécutée qu'une fois. */
    readonly idempotencyKey?: string;
  };

/** L'argument est facultatif pour un point d'accès sans paramètre ni corps. */
type Args<E extends AnyEndpoint> = object extends Input<E> ? [input?: Input<E>] : [input: Input<E>];

export async function request<E extends AnyEndpoint>(endpoint: E, ...[input]: Args<E>): Promise<ResponseOf<E>> {
  const url = API_PREFIX + buildPath(endpoint.path, input?.params);
  const body = input?.body;
  let res: Response;
  try {
    res = await fetch(url, {
      method: endpoint.method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(input?.idempotencyKey ? { 'Idempotency-Key': input.idempotencyKey } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Impossible de joindre le serveur. Vérifie la connexion.');
  }
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as Partial<ErrorBody> | null;
    const fallback = isGatewayError(res.status)
      ? 'Le serveur redémarre. Patiente un instant, puis réessaie.'
      : `Erreur ${res.status}`;
    throw new ApiError(res.status, err?.code ?? 'INTERNAL', err?.error ?? fallback, err?.requestId);
  }
  return (res.status === 204 ? undefined : await res.json()) as ResponseOf<E>;
}
