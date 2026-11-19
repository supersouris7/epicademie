# 0005 — Journaux structurés, sondes, métriques, suivi d'erreurs

- Statut : Acceptée
- Date : 2026-11-19

## Décision

- **Journaux** JSON (pino, intégré à Fastify), un identifiant par requête (`requestId`, repris de
  l'en-tête `x-request-id` d'un proxy ou généré, renvoyé dans la réponse et dans chaque corps
  d'erreur). Niveau réglé par `LOG_LEVEL`. **Aucune donnée personnelle** : pas de corps de
  requête, en-têtes d'authentification et cookies masqués.
- **Sondes** : `/api/health` (le processus répond) et `/api/ready` (la base aussi), utilisées
  par Docker et par l'hébergeur ; jamais soumises à la limite de débit.
- **Métriques Prometheus** sur `/api/metrics` (jeton `METRICS_TOKEN` optionnel) : durée et statut
  des requêtes par route **paramétrée** (jamais l'URL brute), processus Node, joueurs connectés,
  arènes ouvertes, parties terminées.
- **Suivi d'erreurs** : interface `ErrorReporter` (`core/observability/error-reporter.ts`), par
  défaut écrite dans les journaux (`report: true`). Branchable sur un service (Sentry,
  GlitchTip…) sans toucher au reste du code. Les erreurs du navigateur remontent par
  `POST /api/v1/telemetry/errors` (débit limité, sans données personnelles).

## Conséquences

- Une erreur signalée par un parent se retrouve dans les journaux par son `requestId`.
- Brancher un service de suivi d'erreurs = une implémentation de `ErrorReporter`.
