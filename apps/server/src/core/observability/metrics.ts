import type { FastifyInstance } from 'fastify';
import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from '@prometheus-io/client';

/**
 * Métriques Prometheus exposées sur /api/metrics : requêtes HTTP (nombre, durée, statut par
 * route), métriques du processus Node (mémoire, boucle d'événements) et jauges métier (joueurs
 * connectés, arènes ouvertes). Un registre par application (pas de registre global : plusieurs
 * applications peuvent coexister dans les tests).
 */
export interface Metrics {
  readonly registry: Registry;
  readonly onlinePlayers: Gauge;
  readonly openArenas: Gauge;
  readonly finishedGames: Counter<'kind'>;
}

export function createMetrics(): Metrics {
  const registry = new Registry();
  registry.setDefaultLabels({ app: 'questeo' });
  collectDefaultMetrics({ register: registry });
  return {
    registry,
    onlinePlayers: new Gauge({
      name: 'questeo_online_players',
      help: 'Joueurs connectés en temps réel',
      registers: [registry],
    }),
    openArenas: new Gauge({
      name: 'questeo_open_arenas',
      help: 'Arènes ouvertes (salon ou partie)',
      registers: [registry],
    }),
    finishedGames: new Counter({
      name: 'questeo_finished_games_total',
      help: 'Parties terminées',
      labelNames: ['kind'],
      registers: [registry],
    }),
  };
}

/** Mesure chaque requête HTTP (route paramétrée, jamais l'URL brute : pas d'identifiants). */
export function instrumentHttp(app: FastifyInstance, metrics: Metrics): void {
  const duration = new Histogram({
    name: 'questeo_http_request_duration_seconds',
    help: 'Durée des requêtes HTTP',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [metrics.registry],
  });
  app.addHook('onResponse', async (request, reply) => {
    const route = request.routeOptions.url ?? 'inconnue';
    duration.observe({ method: request.method, route, status: String(reply.statusCode) }, reply.elapsedTime / 1000);
  });
}
