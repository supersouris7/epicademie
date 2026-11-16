import { Server as SocketServer } from 'socket.io';
import { buildApp } from './app.ts';
import { loadConfig } from './config.ts';
import { openDb } from './db/client.ts';

const config = loadConfig();
const { db, close } = openDb(config.dbPath, config.migrationsDir);
const app = await buildApp({ ...config, db, logger: true });

// Temps réel (multijoueur, jalon J6).
const io = new SocketServer(app.server, { cors: { origin: true } });
io.on('connection', (socket) => app.log.debug({ id: socket.id }, 'socket connecté'));

const shutdown = async () => {
  await io.close();
  await app.close();
  close();
  process.exit(0);
};
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

await app.listen({ port: config.port, host: config.host });
