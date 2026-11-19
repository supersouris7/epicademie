import type { IncomingMessage } from 'node:http';

/**
 * Le temps réel n'accepte que les pages servies par ce serveur (même origine), plus les
 * origines explicitement autorisées (CORS_ORIGINS). Les WebSockets ne sont pas soumis au CORS
 * du navigateur : sans ce contrôle, n'importe quel site pourrait ouvrir une connexion.
 * Les clients sans en-tête Origin (tests, outils) sont acceptés : ils ne portent pas de
 * session de navigateur à détourner.
 */
export function originAllowed(req: Pick<IncomingMessage, 'headers'>, allowed: readonly string[] | null): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  if (allowed?.includes(origin)) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}
