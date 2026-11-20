# Configuration

Le serveur lit son environnement **une fois** au démarrage (`apps/server/src/config.ts`) et
refuse de démarrer si une valeur est invalide. Une variable vide vaut « non définie ».

| Variable                | Défaut                                        | Rôle                                                                                                |
| ----------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `NODE_ENV`              | `development`                                 | `production` : front servi, documentation API coupée, base obligatoire                              |
| `PORT` / `HOST`         | `3000` / `0.0.0.0`                            | écoute HTTP                                                                                         |
| `DATABASE_URL`          | dev : `pglite://apps/server/data/pglite`      | `postgres://…`, `pglite://memory` ou `pglite://<dossier>`                                           |
| `DATABASE_POOL_MAX`     | `10`                                          | connexions PostgreSQL par instance                                                                  |
| `PUBLIC_URL`            | IP du réseau local détectée                   | URL du QR code de connexion des appareils                                                           |
| `TRUST_PROXY`           | `0`                                           | nombre de proxys devant le serveur (nginx : `1`)                                                    |
| `CORS_ORIGINS`          | même origine                                  | origines autorisées pour le temps réel, séparées par des virgules                                   |
| `RATE_LIMIT_MAX`        | `600`                                         | requêtes HTTP par minute et par IP                                                                  |
| `METRICS_TOKEN`         | aucun                                         | jeton (16 caractères min.) exigé par `/api/metrics`                                                 |
| `API_DOCS`              | `true` hors production                        | Swagger UI sur `/api/docs`                                                                          |
| `LOG_LEVEL`             | `info` (`silent` en test)                     | niveau des journaux                                                                                 |
| `TZ_FAMILY`             | `Europe/Paris`                                | fuseau des jours de révision                                                                        |
| `WEB_DIR`               | `../web/dist` (production)                    | front buildé ; hors production, servi seulement si la variable est donnée (e2e)                     |
| `QUESTEO_VERSION`       | `dev` (image : tag de version)                | version affichée par les sondes et l'OpenAPI                                                        |
| `PUBLIC_URL`            | (voir plus haut)                              | aussi l'adresse des liens envoyés par e-mail (mot de passe oublié)                                  |
| `COOKIE_SECURE`         | `true` en production                          | cookie de session réservé à HTTPS (mettre `false` seulement en HTTP local)                          |
| `SESSION_DAYS`          | `30`                                          | durée d'une session d'appareil sans activité                                                        |
| `PREMIUM_PRICE_CENTS`   | `2499`                                        | prix de l'année scolaire, en centimes                                                               |
| `PREMIUM_CURRENCY`      | `eur`                                         | devise du paiement                                                                                  |
| `SCHOOL_YEAR_END`       | `08-31`                                       | fin d'année scolaire (MM-JJ) : fin de l'accès payé                                                  |
| `PREMIUM_MIN_DAYS`      | `60`                                          | durée minimale d'un accès : payer trop près de la fin donne l'année suivante                        |
| `BILLING_PROVIDER`      | `aucun` (production), `simulateur` (ailleurs) | `stripe`, `simulateur` (interdit en production) ou `aucun` (paiement fermé, version gratuite seule) |
| `STRIPE_SECRET_KEY`     | —                                             | clé secrète Stripe (`sk_…`, mode test tant que le compte marchand n'est pas validé)                 |
| `STRIPE_WEBHOOK_SECRET` | —                                             | secret de signature des notifications (`whsec_…`) ; webhook : `POST /api/v1/billing/webhook/stripe` |
| `AUTH_RATE_LIMIT_MAX`   | `10`                                          | tentatives par minute et par IP : connexion, inscription, mot de passe                              |

Tests : `TEST_DATABASE_URL` (facultatif) fait tourner les tests du serveur sur un PostgreSQL
réel (une base neuve par fichier de test, supprimée ensuite).
