# Contribuer

Ce guide s'adresse à toute personne qui modifie le code. Lire d'abord
[l'architecture](docs/architecture/README.md) et les [décisions (ADR)](docs/adr/README.md).

## Installer et lancer

Prérequis : Node 24, pnpm via Corepack (`corepack enable`). Aucune base à installer :
le développement utilise PostgreSQL embarqué (PGlite, dans `apps/server/data/`).

```bash
pnpm install
pnpm dev                 # migre la base de dev, puis serveur :3000 + Vite :5173
```

Documentation interactive de l'API : http://localhost:3000/api/docs.

## Vérifier avant de pousser

```bash
pnpm format && pnpm lint && pnpm typecheck               # style, lint (dont complexité), types
pnpm arch && pnpm deadcode                                # règles d'architecture, code mort
pnpm test                                                 # unitaires + intégration (PGlite)
pnpm test:coverage                                        # avec seuils de couverture (CI)
pnpm e2e                                                  # bout en bout (Playwright)
```

Le crochet `pre-commit` formate et corrige les fichiers indexés ; `commit-msg` vérifie le format
[Conventional Commits](https://www.conventionalcommits.org/fr/) (`feat:`, `fix:`, `refactor:`,
`docs:`, `test:`, `chore:`…).

## Règles

- **Où mettre le code** :
  - une règle du jeu (calcul, barème, progression) → `packages/engine`, fonction pure, testée ;
  - un exercice → `packages/content`, générateur déterministe, testé ;
  - un type ou un schéma partagé, un point d'accès d'API → `packages/shared` ;
  - le serveur → `apps/server/src/modules/<domaine>/` (routes → service → dépôt) ;
  - le web → `apps/web/src/features/<domaine>/` ; composants et outils communs dans
    `apps/web/src/shared/`, design system dans `apps/web/src/design/`.
- **Frontières** : on n'importe un module (serveur) ou une fonctionnalité (web) que par son
  `index.ts`. Vérifié par `pnpm arch`.
- **Pas de logique dans les routes ni dans les composants d'affichage** : services, hooks et
  fonctions pures.
- **Commentaires en français**, identifiants en anglais. Chaque fichier commence par un
  commentaire qui dit son rôle ; on commente le « pourquoi », pas le « quoi ».
- **Lisibilité** : complexité ≤ 20, imbrication ≤ 4, fonction ≤ 200 lignes, ≤ 5 paramètres
  (vérifié par `pnpm lint`). Au-delà, on découpe — voir [ADR 0010](docs/adr/0010-qualite-renforcee.md)
  pour le découpage des écrans (état / déroulé / affichage).
- **Tests** : toute correction de bug commence par un test qui le reproduit. Les seuils de
  couverture bloquent la CI. Un écran se teste sur l'application complète avec le faux serveur
  (`apps/web/src/testing/`).
- **Données relues en base** : jamais de cast d'un `jsonb` ; un schéma Zod le valide (exemple :
  `modules/battles/battle-state.ts`, [ADR 0009](docs/adr/0009-etat-des-combats.md)).
- **Base de données** : modifier `apps/server/src/db/schema.ts`, puis
  `pnpm --filter @epicademie/server db:generate` ; relire le SQL généré ; migrations compatibles avec
  la version précédente du code (voir [ADR 0003](docs/adr/0003-migrations.md)).
- **API** : toute évolution passe par le contrat (`packages/shared/src/api/contract.ts`) et suit
  les règles de compatibilité de l'[ADR 0004](docs/adr/0004-api-versionnee.md).
- **Dépendances** : versions exactes, publiées depuis au moins deux semaines ; justifier tout
  ajout dans le message de commit. Dependabot propose les mises à jour chaque semaine
  ([ADR 0011](docs/adr/0011-chaine-d-approvisionnement.md)).
- **Données personnelles** : jamais dans les journaux, les métriques, la télémétrie ni les
  messages d'erreur.

## Décision structurante

Rédiger une ADR (`docs/adr/NNNN-titre.md`, modèle dans [l'index](docs/adr/README.md)) dans la
même demande de fusion que le code.
