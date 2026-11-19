import { Server as SocketServer } from 'socket.io';
import { buildApp } from './app.ts';
import { loadConfig } from './config.ts';
import { openDb } from './db/client.ts';
import { createProfilesRepo } from './db/profiles-repo.ts';
import { attachRealtime, createPresence } from './realtime.ts';

const config = loadConfig();
const { db, close } = openDb(config.dbPath, config.migrationsDir);
const presence = createPresence();
const app = await buildApp({ ...config, db, logger: true, presence });

// Temps réel : joueurs connectés, messages, arène.
const io = new SocketServer(app.server, { cors: { origin: true } });
attachRealtime(io, createProfilesRepo(db), presence);

const shutdown = async () => {
  await io.close();
  await app.close();
  close();
  process.exit(0);
};
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

await app.listen({ port: config.port, host: config.host });
