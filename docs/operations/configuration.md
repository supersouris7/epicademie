# Configuration

Le serveur lit son environnement **une fois** au démarrage (`apps/server/src/config.ts`) et
refuse de démarrer si une valeur est invalide. Une variable vide vaut « non définie ».

| Variable                | Défaut                                        | Rôle                                                                                                                           |
| ----------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `NODE_ENV`              | `development`                                 | `production` : front servi, documentation API coupée, base obligatoire                                                         |
| `PORT` / `HOST`         | `3000` / `0.0.0.0`                            | écoute HTTP                                                                                                                    |
| `DATABASE_URL`          | dev : `pglite://apps/server/data/pglite`      | `postgres://…`, `pglite://memory` ou `pglite://<dossier>`                                                                      |
| `DATABASE_POOL_MAX`     | `10`                                          | connexions PostgreSQL par instance                                                                                             |
| `PUBLIC_URL`            | IP du réseau local détectée                   | URL du QR code de connexion des appareils                                                                                      |
| `TRUST_PROXY`           | `0`                                           | nombre de proxys devant le serveur (nginx : `1`)                                                                               |
| `CORS_ORIGINS`          | même origine                                  | origines autorisées pour le temps réel, séparées par des virgules                                                              |
| `RATE_LIMIT_MAX`        | `600`                                         | requêtes HTTP par minute et par IP                                                                                             |
| `METRICS_TOKEN`         | aucun                                         | jeton (16 caractères min.) exigé par `/api/metrics`                                                                            |
| `ADMIN_OPERATOR_SECRET` | aucun (administration désactivée)             | secret de l'opérateur (32 caractères min., sinon le serveur refuse de démarrer) ; voir ADR 0033                                |
| `API_DOCS`              | `true` hors production                        | Swagger UI sur `/api/docs`                                                                                                     |
| `LOG_LEVEL`             | `info` (`silent` en test)                     | niveau des journaux                                                                                                            |
| `TZ_FAMILY`             | `Europe/Paris`                                | fuseau des jours de révision                                                                                                   |
| `WEB_DIR`               | `../web/dist` (production)                    | front buildé ; hors production, servi seulement si la variable est donnée (e2e)                                                |
| `QUESTEO_VERSION`       | `dev` (image : tag de version)                | version affichée par les sondes et l'OpenAPI                                                                                   |
| `PUBLIC_URL`            | (voir plus haut)                              | aussi l'adresse des liens envoyés par e-mail (validation, mot de passe oublié)                                                 |
| `COOKIE_SECURE`         | `true` en production                          | cookie de session réservé à HTTPS (mettre `false` seulement en HTTP local)                                                     |
| `SESSION_DAYS`          | `30`                                          | durée d'une session d'appareil sans activité                                                                                   |
| `PREMIUM_PRICE_CENTS`   | `2499`                                        | prix de l'année scolaire, en centimes                                                                                          |
| `PREMIUM_CURRENCY`      | `eur`                                         | devise du paiement                                                                                                             |
| `SCHOOL_YEAR_END`       | `08-31`                                       | fin d'année scolaire (MM-JJ) : fin de l'accès payé                                                                             |
| `PREMIUM_MIN_DAYS`      | `60`                                          | durée minimale d'un accès : payer trop près de la fin donne l'année suivante                                                   |
| `BILLING_PROVIDER`      | `aucun` (production), `simulateur` (ailleurs) | `stripe`, `simulateur` (interdit en production) ou `aucun` (paiement fermé, version gratuite seule)                            |
| `STRIPE_SECRET_KEY`     | —                                             | clé secrète Stripe (`sk_…`, mode test tant que le compte marchand n'est pas validé)                                            |
| `STRIPE_WEBHOOK_SECRET` | —                                             | secret de signature des notifications (`whsec_…`) ; webhook : `POST /api/v1/billing/webhook/stripe`                            |
| `AUTH_RATE_LIMIT_MAX`   | `10`                                          | tentatives par minute et par IP : connexion, inscription, mot de passe                                                         |
| `APP_ENV`               | `production` si `NODE_ENV=production`         | `production` impose Brevo et ne renvoie jamais de lien secret dans une réponse ; autre valeur (`recette`) : simulation permise |
| `BREVO_API_KEY`         | —                                             | clé de l'API transactionnelle Brevo (secret) ; absente : simulation, **démarrage refusé en production**                        |
| `MAIL_FROM`             | —                                             | expéditeur (`adresse@domaine` ou `Nom <adresse@domaine>`), exigé avec `BREVO_API_KEY`                                          |
| `GOOGLE_CLIENT_ID`      | —                                             | identifiant client OAuth Google ; avec le secret, active « Continuer avec Google »                                             |
| `GOOGLE_CLIENT_SECRET`  | —                                             | secret client OAuth Google                                                                                                     |
| `GOOGLE_REDIRECT_URI`   | `PUBLIC_URL` + `/api/v1/auth/google/callback` | URL de retour, à déclarer à l'identique chez Google                                                                            |

## Ouverture de compte avec e-mail

Un compte avec e-mail (parent, élève de 15 ans ou plus) ne naît que de deux façons : adresse
**validée par un lien** (jeton à usage unique, haché en base, 24 h), ou **Google** (e-mail vérifié
par Google). Les enfants de moins de 15 ans restent sans e-mail, rattachés au parent.

- **E-mails** : interface `Mailer` (`core/mail/mailer.ts`), adaptateur Brevo (`POST /v3/smtp/email`).
  Sans `BREVO_API_KEY`, mode **simulation** : le lien est journalisé (niveau info, rien d'autre) et,
  hors production seulement, renvoyé dans la réponse d'inscription (l'écran affiche « Ouvrir le lien »).
  La recette sans fournisseur se déclare avec `APP_ENV=recette` ; en production sans clé, le
  serveur refuse de démarrer.
- **Google** : console Google Cloud → identifiants OAuth « Application Web », URI de redirection =
  `GOOGLE_REDIRECT_URI`. Flux code + PKCE (S256) + `state` + `nonce` ; l'`id_token` est vérifié
  (signature par les clés publiques de Google, `iss`, `aud`, expiration, `nonce`) et l'e-mail doit
  être vérifié par Google. Même e-mail = même compte ; un compte jamais validé qui est relié à
  Google perd son mot de passe. Bouton masqué si `GOOGLE_CLIENT_ID`/`SECRET` manquent. Un compte
  Google n'a pas de mot de passe : « Mot de passe oublié » permet d'en définir un (nécessaire pour
  confirmer les actions parent).
- **Migration 0023** : `accounts.email_verified_at` (comptes existants = vérifiés), `google_sub`,
  table `email_verifications`. Retour arrière SQL en tête du fichier.

Tests : `TEST_DATABASE_URL` (facultatif) fait tourner les tests du serveur sur un PostgreSQL
réel (une base neuve par fichier de test, supprimée ensuite).
