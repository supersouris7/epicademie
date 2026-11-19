# Observabilité

## Journaux

JSON sur la sortie standard (pino). Champs utiles : `level`, `time`, `requestId`, `req.method`,
`req.url`, `res.statusCode`, `responseTime`, `err`. Retrouver une requête signalée :
`docker compose logs questeo | grep <requestId>`.

## Sondes

- `GET /api/health` → `{ status: "ok", version }` : le processus répond.
- `GET /api/ready` → idem si la base répond, sinon 503 `UNAVAILABLE`.

## Métriques (`GET /api/metrics`, format Prometheus)

| Métrique                                | Sens                                   |
| --------------------------------------- | -------------------------------------- |
| `questeo_http_request_duration_seconds` | durée par `method`, `route`, `status`  |
| `questeo_online_players`                | joueurs connectés en temps réel        |
| `questeo_open_arenas`                   | arènes ouvertes                        |
| `questeo_finished_games_total{kind}`    | parties terminées (entraînement, boss) |
| `process_*`, `nodejs_*`                 | mémoire, CPU, boucle d'événements      |

Alertes conseillées : taux de 5xx > 1 % sur 5 min ; p95 de latence > 1 s ; `/api/ready` en
échec ; mémoire en hausse continue.

## Suivi d'erreurs

Par défaut, chaque erreur inattendue (serveur, temps réel, navigateur) est écrite dans les
journaux avec `report: true`. Pour un service externe : implémenter `ErrorReporter`
(`apps/server/src/core/observability/error-reporter.ts`) et le passer à `buildApp` dans
`main.ts`. Côté navigateur, les erreurs remontent par `POST /api/v1/telemetry/errors`.
