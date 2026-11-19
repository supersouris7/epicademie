import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import Fastify, { LogController, type FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { API_PREFIX } from '@questeo/shared';
import type { ServerConfig } from './config.ts';
import type { Database } from './db/client.ts';
import { systemClock, type Clock } from './core/clock.ts';
import { systemRandom, type Random } from './core/random.ts';
import { detectLanAddress } from './core/lan.ts';
import { registerErrorHandling, send } from './core/http/errors.ts';
import { registerSecurity } from './core/http/security.ts';
import { registerOpenApi } from './core/http/openapi.ts';
import { logErrorReporter, type ErrorReporter } from './core/observability/error-reporter.ts';
import { createMetrics, instrumentHttp, type Metrics } from './core/observability/metrics.ts';
import { createProfilesService, profilesRoutes, type ProfilesService } from './modules/profiles/index.ts';
import { createTrainingService, trainingRoutes } from './modules/training/index.ts';
import { battlesRoutes, createBattlesService } from './modules/battles/index.ts';
import { createShopService, inventoryRoutes } from './modules/inventory/index.ts';
import { createPresence, type Presence } from './modules/realtime/index.ts';
import { opsRoutes, systemRoutes } from './modules/system/index.ts';
import { telemetryRoutes } from './modules/telemetry/index.ts';

/**
 * Racine de composition : construit l'application HTTP à partir de ses dépendances.
 *
 * Toutes les dépendances externes (base, horloge, hasard, suivi d'erreurs) sont injectées :
 * les tests passent une base éphémère, une horloge fixe et un hasard prévisible. Aucun module
 * ne lit l'environnement ni ne crée lui-même ses dépendances. Voir docs/architecture/serveur.md.
 */

export type AppConfig = Pick<
  ServerConfig,
  | 'env'
  | 'port'
  | 'webDir'
  | 'publicUrl'
  | 'logLevel'
  | 'trustProxy'
  | 'rateLimitMax'
  | 'metricsToken'
  | 'apiDocs'
  | 'timeZone'
  | 'version'
>;

export interface AppDeps {
  readonly config: AppConfig;
  readonly database: Database;
  readonly clock?: Clock;
  readonly random?: Random;
  readonly presence?: Presence;
  readonly reporter?: ErrorReporter;
  readonly metrics?: Metrics;
}

export interface App {
  readonly http: FastifyInstance;
  readonly presence: Presence;
  readonly metrics: Metrics;
  readonly reporter: ErrorReporter;
  readonly clock: Clock;
  readonly random: Random;
  readonly profiles: ProfilesService;
}

/** Corps de requête maximal (les réponses d'exercice font quelques centaines d'octets). */
const BODY_LIMIT = 64 * 1024;

export async function buildApp(deps: AppDeps): Promise<App> {
  const { config, database } = deps;
  const http = Fastify({
    logger: {
      level: config.logLevel,
      // Jamais de secrets ni de cookies dans les journaux.
      redact: ['req.headers.authorization', 'req.headers.cookie', 'req.headers["set-cookie"]'],
    },
    bodyLimit: BODY_LIMIT,
    // Nombre de proxys de confiance (nginx…) : l'IP client réelle vient de X-Forwarded-For.
    trustProxy: config.trustProxy > 0 ? (_address: string, hop: number) => hop < config.trustProxy : false,
    // Identifiant de requête : repris de l'en-tête x-request-id (proxy) ou généré.
    requestIdHeader: 'x-request-id',
    logController: new LogController({ requestIdLogLabel: 'requestId' }),
    genReqId: () => randomUUID(),
  });
  http.setValidatorCompiler(validatorCompiler);
  http.setSerializerCompiler(serializerCompiler);
  http.addHook('onSend', async (request, reply) => {
    reply.header('x-request-id', request.id);
  });

  const clock = deps.clock ?? systemClock(config.timeZone);
  const random = deps.random ?? systemRandom;
  const presence = deps.presence ?? createPresence();
  const reporter = deps.reporter ?? logErrorReporter(http.log);
  const metrics = deps.metrics ?? createMetrics();

  registerErrorHandling(http, reporter);
  instrumentHttp(http, metrics);
  await registerSecurity(http, { rateLimitMax: config.rateLimitMax });
  await registerOpenApi(http, { ui: config.apiDocs, version: config.version });

  // Services métier (un par module), partagés par les routes HTTP et le temps réel.
  const { db } = database;
  const profiles = createProfilesService(db);
  const training = createTrainingService({
    db,
    clock,
    random,
    onFinished: () => metrics.finishedGames.inc({ kind: 'entrainement' }),
  });
  const battles = createBattlesService({
    db,
    clock,
    random,
    onFinished: () => metrics.finishedGames.inc({ kind: 'boss' }),
  });
  const shop = createShopService(db);

  await http.register(
    opsRoutes({ ping: () => database.ping(), metrics, metricsToken: config.metricsToken, version: config.version }),
    { prefix: '/api' },
  );
  await http.register(
    async (v1) => {
      await v1.register(
        systemRoutes({
          publicUrl: () => {
            const lan = detectLanAddress();
            return config.publicUrl ?? (lan ? `http://${lan}:${config.port}` : null);
          },
          onlineIds: () => presence.onlineIds(),
        }),
      );
      await v1.register(profilesRoutes(profiles));
      await v1.register(trainingRoutes(training));
      await v1.register(battlesRoutes(battles));
      await v1.register(inventoryRoutes(shop));
      await v1.register(telemetryRoutes(reporter));
    },
    { prefix: API_PREFIX },
  );

  await registerWeb(http, config.webDir);
  return { http, presence, metrics, reporter, clock, random, profiles };
}

/**
 * Front buildé (production) : fichiers statiques et repli SPA. Les fichiers à empreinte
 * (`-abcd1234.js`) sont mis en cache un an ; index.html jamais (nouvelle version visible
 * immédiatement).
 */
async function registerWeb(http: FastifyInstance, webDir: string | null): Promise<void> {
  const hasWeb = webDir !== null && fs.existsSync(path.join(webDir, 'index.html'));
  if (hasWeb) {
    await http.register(fastifyStatic, {
      root: webDir,
      wildcard: false,
      setHeaders: (res, file) => {
        if (file.endsWith('.html')) res.header('cache-control', 'no-cache');
        else if (/-[\w-]{8,}\.(js|css)$/.test(file)) res.header('cache-control', 'public, max-age=31536000, immutable');
        else res.header('cache-control', 'public, max-age=86400');
      },
    });
  }
  http.setNotFoundHandler((request, reply) =>
    request.url.startsWith('/api/') || !hasWeb
      ? send(reply, request, 'NOT_FOUND', 'Route inconnue')
      : reply.type('text/html').header('cache-control', 'no-cache').sendFile('index.html'),
  );
}
