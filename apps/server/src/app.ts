import fs from 'node:fs';
import path from 'node:path';
import Fastify, { type FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import type { Db } from './db/client.ts';
import { createProfilesRepo } from './db/profiles-repo.ts';
import { createBattleRepo } from './db/battle-repo.ts';
import { createPlayRepo } from './db/play-repo.ts';
import { battleRoutes } from './routes/battles.ts';
import { playRoutes } from './routes/play.ts';
import { profileRoutes } from './routes/profiles.ts';
import { today } from './today.ts';
import { detectLanAddress } from './lan.ts';
import type { Presence } from './realtime.ts';

export interface AppOptions {
  readonly db: Db;
  readonly port: number;
  readonly webDir: string | null;
  readonly publicUrl: string | null;
  readonly logger?: boolean;
  /** Date du jour injectable (tests). */
  readonly today?: () => string;
  /** Hasard injectable (tests : coffres). */
  readonly random?: () => number;
  /** Joueurs connectés (temps réel) : profils déjà ouverts sur un appareil. */
  readonly presence?: Presence;
}

export async function buildApp(opts: AppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: opts.logger ?? false });

  await app.register(
    async (api) => {
      api.get('/health', async () => ({ status: 'ok' }));
      // Profils ouverts sur un appareil : on ne peut pas les choisir ailleurs.
      api.get('/presence', async () => ({ online: [...(opts.presence?.online.keys() ?? [])] }));
      api.get('/network', async () => {
        const lan = detectLanAddress();
        return { publicUrl: opts.publicUrl ?? (lan ? `http://${lan}:${opts.port}` : null) };
      });
      await api.register(profileRoutes(createProfilesRepo(opts.db)));
      await api.register(playRoutes(createPlayRepo(opts.db, opts.today ?? (() => today()), opts.random)));
      await api.register(battleRoutes(createBattleRepo(opts.db)));
    },
    { prefix: '/api' },
  );

  const { webDir } = opts;
  if (webDir && fs.existsSync(path.join(webDir, 'index.html'))) {
    await app.register(fastifyStatic, { root: webDir, wildcard: false });
    // Fallback SPA : toute route non-API renvoie index.html.
    app.setNotFoundHandler((req, reply) =>
      req.url.startsWith('/api/')
        ? reply.code(404).send({ error: 'Route inconnue' })
        : reply.type('text/html').sendFile('index.html'),
    );
  }

  return app;
}
