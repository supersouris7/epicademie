# 0004 — Contrat d'API unique, versionné, validé et documenté

- Statut : Acceptée
- Date : 2026-11-19

## Contexte

Le front et le serveur dupliquaient les chemins d'URL et les types de réponses ; rien ne
garantissait que la réponse réelle corresponde au type attendu, et l'API n'était pas
documentée.

## Décision

- Un **contrat unique** dans `packages/shared/src/api/contract.ts` : chaque point d'accès
  déclare méthode, chemin, schémas Zod des paramètres, du corps et de la réponse.
- Le **serveur** branche chaque point d'accès par `route(app, api.xxx, handler)` : les entrées
  sont validées avant le gestionnaire, **les sorties après** (un champ en trop est retiré, un
  champ manquant est une erreur 500 signalée).
- Le **client web** appelle `request(api.xxx, { params, body })` : URL, types d'entrée et de
  sortie sont dérivés du contrat (aucune URL écrite à la main).
- La **documentation OpenAPI** est générée depuis le contrat : `/api/openapi.json`, et l'interface
  Swagger UI sur `/api/docs` (activée par `API_DOCS`, par défaut hors production).
- Les routes métier sont **versionnées** sous `/api/v1`. Les routes d'exploitation
  (`/api/health`, `/api/ready`, `/api/metrics`) ne sont pas versionnées.
- Erreurs : corps unique `{ code, error, requestId }` ; `code` est stable (le client peut s'y
  fier), `error` est un message en français affichable.

## Règles d'évolution

- Compatible (reste en v1) : nouveau point d'accès, nouveau champ **optionnel** en entrée,
  nouveau champ en sortie.
- Incompatible (nouvelle version `/api/v2`, v1 maintenue le temps de la transition) : retrait ou
  renommage d'un champ, changement de type, champ d'entrée rendu obligatoire.

## Conséquences

- Un test vérifie que chaque point d'accès du contrat figure dans la spécification OpenAPI.
- Modifier l'API = modifier le contrat ; le compilateur signale tous les usages à adapter.

## Options écartées

- **tRPC / GraphQL** : couplage plus fort ou complexité inutile ; REST + OpenAPI reste standard
  et ouvert à des clients tiers (application mobile, outils).
