import { Server } from 'socket.io';
import type { App } from './app.ts';
import { attachRealtime, originAllowed, type RealtimeServer } from './modules/realtime/index.ts';

/** Messages temps réel : quelques centaines d'octets suffisent. */
const MAX_MESSAGE_BYTES = 16 * 1024;

/** Branche socket.io sur le serveur HTTP de l'application. */
export function startRealtime(app: App, corsOrigins: readonly string[] | null) {
  const io: RealtimeServer = new Server(app.http.server, {
    serveClient: false,
    maxHttpBufferSize: MAX_MESSAGE_BYTES,
    allowRequest: (req, callback) => callback(null, originAllowed(req, corsOrigins)),
    ...(corsOrigins ? { cors: { origin: [...corsOrigins] } } : {}),
  });
  return attachRealtime(io, {
    presence: app.presence,
    findProfile: (id) => app.profiles.find(id),
    clock: app.clock,
    random: app.random,
    logger: app.http.log,
    reporter: app.reporter,
    metrics: app.metrics,
  });
}
