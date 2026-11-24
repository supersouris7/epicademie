import { api } from '@epicademie/shared';
import { request } from '../api/client.ts';

/**
 * Suivi d'erreurs côté navigateur : les erreurs non rattrapées (affichage, promesses, scripts)
 * sont envoyées au serveur (`POST /api/v1/telemetry/errors`), qui les journalise et les transmet
 * à son service de suivi. Jamais de donnée personnelle : message, pile, chemin de la page,
 * version. Plafonné pour qu'une page qui boucle ne submerge pas le serveur.
 */

const MAX_REPORTS_PER_PAGE = 10;
let sent = 0;

export function reportError(error: unknown, extra?: string): void {
  if (sent >= MAX_REPORTS_PER_PAGE) return;
  sent++;
  const err = error instanceof Error ? error : new Error(String(error));
  const stack = [err.stack, extra].filter(Boolean).join('\n').slice(0, 4000);
  request(api.reportClientError, {
    body: {
      message: err.message.slice(0, 500) || 'Erreur inconnue',
      ...(stack ? { stack } : {}),
      // Chemin sans paramètres (pas d'identifiant ni de donnée dans l'URL).
      path: window.location.pathname.slice(0, 200),
      release: import.meta.env.VITE_RELEASE ?? 'dev',
    },
  }).catch(() => undefined);
}

/** Branche le suivi sur les erreurs globales du navigateur (à appeler une fois au démarrage). */
export function installErrorReporting(): void {
  window.addEventListener('error', (e) => reportError(e.error ?? e.message));
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason));
}
