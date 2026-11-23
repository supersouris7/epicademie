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
import { withErrorJournal } from './core/observability/error-journal.ts';
import { createMetrics, instrumentHttp, type Metrics } from './core/observability/metrics.ts';
import { registerAuth } from './core/http/auth.ts';
import { logMailer, type Mailer } from './core/mail/mailer.ts';
import {
  accountsRoutes,
  createAccountsService,
  createOwnership,
  type AccountsService,
} from './modules/accounts/index.ts';
import { createProfilesService, profilesRoutes, type ProfilesService } from './modules/profiles/index.ts';
import { createLearningService, learningRoutes } from './modules/learning/index.ts';
import { createPedagogyService, pedagogyRoutes } from './modules/pedagogy/index.ts';
import { billingRoutes, createBillingService, type BillingService } from './modules/billing/index.ts';
import { createEvaluationService, evaluationRoutes } from './modules/evaluation/index.ts';
import { createTrainingService, trainingRoutes } from './modules/training/index.ts';
import { battlesRoutes, createBattlesService } from './modules/battles/index.ts';
import { createShopService, inventoryRoutes } from './modules/inventory/index.ts';
import { createInsightsService, insightsRoutes } from './modules/insights/index.ts';
import { createPresence, type Presence } from './modules/realtime/index.ts';
import { opsRoutes, systemRoutes } from './modules/system/index.ts';
import { createFriendsService, friendsRoutes, type FriendsService } from './modules/friends/index.ts';
import { createTelemetryService, telemetryRoutes } from './modules/telemetry/index.ts';

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
  | 'authRateLimitMax'
  | 'metricsToken'
  | 'apiDocs'
  | 'corsOrigins'
  | 'timeZone'
  | 'version'
  | 'cookieSecure'
  | 'sessionDays'
  | 'billing'
>;

export interface AppDeps {
  readonly config: AppConfig;
  readonly database: Database;
  readonly clock?: Clock;
  readonly random?: Random;
  readonly presence?: Presence;
  readonly reporter?: ErrorReporter;
  readonly metrics?: Metrics;
  /** Envoi d'e-mails ; par défaut, journal sans contenu (aucun fournisseur configuré). */
  readonly mailer?: Mailer;
  /** Appels HTTP sortants (prestataire de paiement) ; remplaçable en test. */
  readonly fetcher?: typeof fetch;
}

export interface App {
  readonly http: FastifyInstance;
  readonly presence: Presence;
  readonly metrics: Metrics;
  readonly reporter: ErrorReporter;
  readonly clock: Clock;
  readonly random: Random;
  readonly profiles: ProfilesService;
  readonly accounts: AccountsService;
  readonly billing: BillingService;
  readonly friends: FriendsService;
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
  const metrics = deps.metrics ?? createMetrics();
  // Journal des erreurs récentes (administration) devant le suivi d'erreurs choisi.
  const reporter = withErrorJournal(deps.reporter ?? logErrorReporter(http.log), {
    now: () => clock.now(),
    counter: metrics.errors,
  });
  const rewarded = ({ coins, rubies }: { coins: number; rubies: number }) => {
    metrics.rewards.inc({ currency: 'pieces' }, coins);
    metrics.rewards.inc({ currency: 'rubis' }, rubies);
  };

  registerErrorHandling(http, reporter);
  instrumentHttp(http, metrics);
  await registerSecurity(http, { rateLimitMax: config.rateLimitMax });
  await registerOpenApi(http, { ui: config.apiDocs, version: config.version });

  // Services métier (un par module), partagés par les routes HTTP et le temps réel.
  const { db } = database;
  // Amitiés validées ou retirées : la liste des connectés des deux joueurs change tout de suite.
  const friends = createFriendsService({
    db,
    clock,
    random,
    onChange: (ids) => {
      void Promise.all(ids.map(async (id) => presence.setFriends(id, await friends.activeIds(id))))
        .then(() => presence.changed())
        .catch((err: unknown) => reporter.capture(err, { source: 'server' }));
    },
  });
  const appUrl = () => config.publicUrl ?? `http://localhost:${config.port}`;
  const profiles = createProfilesService(db);
  const accounts = createAccountsService({
    db,
    clock,
    // Le lien de réinitialisation n'apparaît dans les journaux qu'en développement.
    mailer: deps.mailer ?? logMailer(http.log, { revealContent: config.env === 'development' }),
    appUrl,
    sessionDays: config.sessionDays,
    createStudentProfile: (input, familyId) => profiles.createStudent(input, familyId),
  });
  const owns = createOwnership(db);
  registerAuth(http, { resolve: (token) => accounts.resolve(token), allowedOrigins: config.corsOrigins });
  const training = createTrainingService({
    db,
    clock,
    random,
    timeZone: config.timeZone,
    onFinished: (r) => {
      metrics.finishedGames.inc({ kind: 'entrainement' });
      rewarded(r);
    },
  });
  const evaluation = createEvaluationService({
    db,
    clock,
    random,
    timeZone: config.timeZone,
    onFinished: (r) => {
      metrics.finishedGames.inc({ kind: 'evaluation' });
      rewarded(r);
    },
  });
  const battles = createBattlesService({
    db,
    clock,
    random,
    onFinished: (r) => {
      metrics.finishedGames.inc({ kind: 'boss' });
      rewarded(r);
    },
  });
  const shop = createShopService(db);
  const learning = createLearningService({ db, clock, timeZone: config.timeZone });
  const pedagogy = createPedagogyService({ db, clock });
  const billing = createBillingService({
    db,
    clock,
    config: config.billing,
    appUrl,
    fetcher: deps.fetcher,
    onSettled: (status) => metrics.payments.inc({ status }),
  });

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
          onlineIds: (familyId) => presence.onlineIds(familyId),
        }),
      );
      await v1.register(
        accountsRoutes(accounts, {
          secure: config.cookieSecure,
          maxAgeDays: config.sessionDays,
          rateLimitMax: config.authRateLimitMax,
        }),
      );
      await v1.register(profilesRoutes(profiles, owns));
      await v1.register(trainingRoutes(training, owns, billing));
      await v1.register(evaluationRoutes(evaluation, owns));
      await v1.register(learningRoutes(learning, owns));
      await v1.register(pedagogyRoutes(pedagogy, owns));
      await v1.register(battlesRoutes(battles, owns, billing));
      await v1.register(billingRoutes(billing, config.billing.stripeWebhookSecret));
      await v1.register(inventoryRoutes(shop, owns));
      await v1.register(friendsRoutes(friends, owns, (ids) => learning.ranking(ids)));
      await v1.register(insightsRoutes(createInsightsService({ db, clock }), () => reporter.recent()));
      await v1.register(telemetryRoutes(reporter, createTelemetryService({ db, clock })));
    },
    { prefix: API_PREFIX },
  );

  await registerWeb(http, config.webDir);
  return { http, presence, metrics, reporter, clock, random, profiles, accounts, billing, friends };
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
