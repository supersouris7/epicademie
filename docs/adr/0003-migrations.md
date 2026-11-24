# 0003 — Migrations par une commande dédiée avant le démarrage

- Statut : Acceptée
- Date : 2026-11-19

## Contexte

Avec plusieurs instances, appliquer les migrations au démarrage de chaque instance crée des
courses (deux instances migrent en même temps) et mêle déploiement du schéma et démarrage.

## Décision

- Les migrations SQL sont **générées** par drizzle-kit depuis `apps/server/src/db/schema.ts`
  (`pnpm --filter @epicademie/server db:generate`), relues et versionnées dans `apps/server/drizzle`.
- Elles s'appliquent par une **commande dédiée** : `pnpm --filter @epicademie/server db:migrate`
  (dev) ou `node server/dist/migrate.js` (image Docker, service `migrate` de `compose.yml`),
  protégée par un verrou consultatif PostgreSQL (idempotente, sûre en parallèle).
- Au démarrage, le serveur **vérifie** que la base est au niveau du code et **refuse de démarrer**
  sinon, avec un message indiquant la commande à lancer.
- Exception : une base `pglite://memory` (éphémère, tests et e2e) est migrée par le processus
  qui la crée, puisqu'il est le seul à y accéder.

## Conséquences

- Ordre de déploiement : migrer, puis démarrer/remplacer les instances.
- Les migrations doivent rester **compatibles avec la version précédente du code** pendant un
  déploiement progressif (ajouter avant de retirer : colonne nullable, puis remplissage, puis
  contrainte, en plusieurs versions).

## Options écartées

- **Migration automatique au démarrage** : simple mais dangereuse à plusieurs instances.
