# Architecture — vue d'ensemble

Academy Fighters (dépôt « questeo ») : exercices de maths du CM1 à la 3e, gamifiés (entraînement,
combats de boss, arène multijoueur), pensés tablette et smartphone.

```
┌────────────────────────── navigateur ──────────────────────────┐
│  apps/web (React 19, Vite, React Query, zustand)                │
│   features/<domaine>  ──request(api.x)──►  HTTP /api/v1         │
│   realtime store      ──socket.io──────►  /socket.io            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌──────────────────────── apps/server (Fastify) ──────────────────┐
│  core/      config, erreurs, sécurité, OpenAPI, observabilité   │
│  modules/   profils · entraînement · combats · inventaire ·     │
│             temps réel · système · télémétrie                   │
│             routes → service → dépôt (Drizzle)                  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                     PostgreSQL (prod) / PGlite (dev, tests)

packages/shared   contrats Zod (API, temps réel), types, constantes
packages/content  générateurs d'exercices déterministes (purs)
packages/engine   règles du jeu (purs)
```

## Principes

1. **Le serveur fait foi** : il régénère chaque question à partir de (notion, niveau, graine),
   corrige, et calcule tous les gains. Le client n'envoie que des réponses.
2. **Règles pures, effets en bordure** : `engine` et `content` sont des fonctions pures ; les
   services du serveur orchestrent et persistent dans une transaction.
3. **Un contrat, trois usages** : les schémas de `shared` valident (serveur), typent (client) et
   documentent (OpenAPI). Voir [ADR 0004](../adr/0004-api-versionnee.md).
4. **Dépendances injectées** : base, horloge, hasard, suivi d'erreurs ; aucun module ne lit
   l'environnement. Les tests sont déterministes.
5. **Modules à frontières nettes** : un module n'expose que son `index.ts`.

## Documents

- [Serveur](serveur.md) — couches, modules, transactions, erreurs, ajout d'un module.
- [Web](web.md) — fonctionnalités, état, appels API, design system.
- [Sécurité](securite.md) — menaces traitées, défenses, limites connues.
- [Décisions (ADR)](../adr/README.md).
- Exploitation : [configuration](../operations/configuration.md),
  [déploiement](../operations/deploiement.md), [observabilité](../operations/observabilite.md).
- Produit et règles du jeu : spécification dans le dépôt privé de pilotage ; design : [DESIGN-SYSTEM](../DESIGN-SYSTEM.md).
