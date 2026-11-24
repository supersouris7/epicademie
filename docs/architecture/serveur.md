# Serveur (`apps/server`)

## Arborescence

```
src/
  main.ts              point d'entrée : config → base vérifiée → app → temps réel → écoute
  app.ts               racine de composition (buildApp) : crée services et routes
  realtime.ts          branche socket.io sur le serveur HTTP
  config.ts            variables d'environnement validées (Zod)
  cli/migrate.ts       commande de migration
  core/                transverse, sans métier
    errors.ts          AppError (erreurs métier attendues) et raccourcis notFound/conflict/…
    clock.ts random.ts horloge et hasard injectables
    http/              route() (contrat → Fastify), erreurs, sécurité, OpenAPI
    observability/     métriques Prometheus, suivi d'erreurs
  db/                  schéma Drizzle, connexion (pg / PGlite), migrations
  modules/<domaine>/   un dossier par domaine métier
    index.ts           API publique du module (seul fichier importable de l'extérieur)
    *.routes.ts        HTTP : branche les points d'accès du contrat sur le service
    *.service.ts       règles et orchestration, frontière transactionnelle
    *.repo.ts          accès aux données (requêtes Drizzle, aucune règle)
    *.test.ts          tests d'intégration du module (HTTP + base réelle)
  testing/harness.ts   application et base de test
```

## Modules

| Module      | Rôle                                                                        |
| ----------- | --------------------------------------------------------------------------- |
| `accounts`  | familles, comptes parents, sessions, verrou parent, isolation (`ownership`) |
| `profiles`  | profils joueurs ; crédit/débit atomiques d'XP, pièces, rubis                |
| `training`  | parties hors boss, correction serveur, répétition espacée, coffres          |
| `battles`   | combats de boss (état serveur), boss vaincus, médailles, équipement         |
| `inventory` | objets possédés, équipement, boutique                                       |
| `realtime`  | présence, messages prédéfinis, arène (socket.io)                            |
| `system`    | santé, disponibilité, métriques, réseau local, présence                     |
| `telemetry` | erreurs remontées par le navigateur                                         |

## Couches et règles

- **Routes** : aucune logique ; `route(app, api.xxx, ({ params, body }) => service.f(...))`.
  La validation d'entrée et de sortie est faite par le contrat.
- **Services** : règles métier (souvent déléguées à `@epicademie/engine`), erreurs métier par
  `AppError` (`notFound`, `conflict`, `badRequest`), **frontière transactionnelle** :
  `db.transaction(async (tx) => { … })` ; chaque dépôt est construit sur `tx`.
- **Dépôts** : fonctions `xxxRepo(executor)` acceptant la base ou une transaction ; requêtes
  Drizzle uniquement ; conversions ligne ↔ type du contrat (dates en ISO…).

### Concurrence

- Une requête qui modifie une partie la **verrouille** (`findSessionForUpdate`) : un double
  envoi (double clic, réseau qui rejoue) est traité séquentiellement ; le second voit la partie
  terminée et reçoit 409.
- Les gains sont crédités par **incrément atomique** (`profilesRepo.credit`), les achats par un
  débit conditionnel (`spend` : `where coins >= prix`), les stocks par `least(count + n, 9)`.

### Erreurs

| Situation                  | Réponse                                           |
| -------------------------- | ------------------------------------------------- |
| `AppError`                 | son statut, `{ code, error, requestId }`          |
| entrée hors contrat        | 400 `BAD_REQUEST`, champ en cause dans `error`    |
| JSON illisible / trop gros | 400 / 413                                         |
| débit dépassé              | 429 `RATE_LIMITED`                                |
| réponse hors contrat, bug  | 500 `INTERNAL` neutre + journal + suivi d'erreurs |

## Ajouter un point d'accès

1. Déclarer le point d'accès et ses schémas dans `packages/shared/src/api/contract.ts`.
2. Implémenter la méthode du service (et du dépôt si besoin) dans le module.
3. Brancher la route dans `*.routes.ts` : `route(app, api.nouveau, …)`.
4. Tester dans `*.test.ts` (HTTP via `t.http.inject`, base réelle).
5. Côté web : `request(api.nouveau, { … })` — typé automatiquement.

## Ajouter un module

Créer `modules/<nom>/` avec `index.ts`, `<nom>.routes.ts`, `<nom>.service.ts`, `<nom>.repo.ts`,
`<nom>.test.ts`, puis l'enregistrer dans `app.ts`. Les tables vont dans `db/schema.ts`, suivies
de `pnpm --filter @epicademie/server db:generate`.

## Accès et isolation

Chaque point d'accès du contrat déclare son niveau d'accès (`public`, `family`, `parent`,
`admin`), vérifié par `route()` avant le gestionnaire à partir de la session (cookie) ; `admin` = opérateur
reconnu à l'en-tête secret du frontal de pilotage, sans compte de jeu (module `admin`, [ADR 0033](../adr/0033-administration-par-operateur.md)). Une route
qui désigne un profil, une partie ou un combat appelle d'abord `owns.profile()` / `owns.game()`
(module `accounts`) : 404 si la donnée n'est pas à la famille connectée. Voir
[ADR 0012](../adr/0012-comptes-familiaux.md).
