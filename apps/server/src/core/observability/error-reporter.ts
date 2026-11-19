import type { FastifyBaseLogger } from 'fastify';

/**
 * Suivi d'erreurs : interface unique, branchable sur un service externe (Sentry, GlitchTip…)
 * sans toucher au reste du code. Par défaut, les erreurs sont écrites dans les journaux
 * structurés (niveau `error`, champ `report: true` pour les filtrer).
 *
 * Pour brancher un service : implémenter `ErrorReporter` et le passer à `buildApp` (voir
 * docs/operations/observabilite.md). Ne jamais y envoyer de données personnelles (nom, date de
 * naissance…) : seulement l'erreur, l'identifiant de requête et la route.
 */
export interface ErrorContext {
  readonly requestId?: string;
  readonly route?: string | undefined;
  readonly source?: 'server' | 'client' | 'realtime' | 'process';
  readonly [key: string]: unknown;
}

export interface ErrorReporter {
  capture(error: unknown, context?: ErrorContext): void;
}

export function logErrorReporter(logger: FastifyBaseLogger): ErrorReporter {
  return {
    capture(error, context = {}) {
      logger.error({ err: error, report: true, source: 'server', ...context }, 'erreur signalée');
    },
  };
}

/** Pour les tests : garde les erreurs en mémoire. */
export function memoryErrorReporter(): ErrorReporter & { readonly errors: unknown[] } {
  const errors: unknown[] = [];
  return { errors, capture: (error) => void errors.push(error) };
}
