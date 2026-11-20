import type { ErrorCode } from '@questeo/shared';

/**
 * Erreur métier attendue (profil introuvable, combat déjà terminé…).
 *
 * Les services lèvent des `AppError` ; le gestionnaire d'erreurs HTTP les traduit en réponse
 * `{ code, error, requestId }` avec le statut voulu. Toute autre exception est un bug : réponse
 * 500 générique, détail dans les journaux et remontée au suivi d'erreurs.
 */
export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }

  get status(): number {
    return STATUS[this.code];
  }
}

const STATUS: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  PAYLOAD_TOO_LARGE: 413,
  RATE_LIMITED: 429,
  INTERNAL: 500,
  UNAVAILABLE: 503,
};

export const statusOf = (code: ErrorCode) => STATUS[code];

/** Raccourcis lisibles dans les services. */
export const notFound = (message: string) => new AppError('NOT_FOUND', message);
export const conflict = (message: string) => new AppError('CONFLICT', message);
/** Ressource qui a existé mais n'est plus utilisable (ex. combat périmé après mise à jour). */
export const gone = (message: string) => new AppError('GONE', message);
export const badRequest = (message: string) => new AppError('BAD_REQUEST', message);
