# Configuration

Le serveur lit son environnement **une fois** au démarrage (`apps/server/src/config.ts`) et
refuse de démarrer si une valeur est invalide. Une variable vide vaut « non définie ».

| Variable            | Défaut                                   | Rôle                                                                   |
| ------------------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| `NODE_ENV`          | `development`                            | `production` : front servi, documentation API coupée, base obligatoire |
| `PORT` / `HOST`     | `3000` / `0.0.0.0`                       | écoute HTTP                                                            |
| `DATABASE_URL`      | dev : `pglite://apps/server/data/pglite` | `postgres://…`, `pglite://memory` ou `pglite://<dossier>`              |
| `DATABASE_POOL_MAX` | `10`                                     | connexions PostgreSQL par instance                                     |
| `PUBLIC_URL`        | IP du réseau local détectée              | URL du QR code de connexion des appareils                              |
| `TRUST_PROXY`       | `0`                                      | nombre de proxys devant le serveur (nginx : `1`)                       |
| `CORS_ORIGINS`      | même origine                             | origines autorisées pour le temps réel, séparées par des virgules      |
| `RATE_LIMIT_MAX`    | `600`                                    | requêtes HTTP par minute et par IP                                     |
| `METRICS_TOKEN`     | aucun                                    | jeton (16 caractères min.) exigé par `/api/metrics`                    |
| `API_DOCS`          | `true` hors production                   | Swagger UI sur `/api/docs`                                             |
| `LOG_LEVEL`         | `info` (`silent` en test)                | niveau des journaux                                                    |
| `TZ_FAMILY`         | `Europe/Paris`                           | fuseau des jours de révision                                           |
| `WEB_DIR`           | `../web/dist`                            | front buildé (production)                                              |
| `QUESTEO_VERSION`   | `dev` (image : tag de version)           | version affichée par les sondes et l'OpenAPI                           |

Tests : `TEST_DATABASE_URL` (facultatif) fait tourner les tests du serveur sur un PostgreSQL
réel (une base neuve par fichier de test, supprimée ensuite).
