# 0001 — Monorepo pnpm, paquets purs et applications par modules

- Statut : Acceptée
- Date : 2026-11-19

## Contexte

Questeo devient un produit vendu en abonnement (année scolaire, familles). Le code doit rester
compréhensible par une personne qui le découvre, évoluer sans régression et accueillir de
nouvelles fonctionnalités (comptes parents, paiement, autres matières) sans réécriture.

## Décision

Un monorepo pnpm avec deux familles d'unités :

- **Paquets purs** (`packages/*`) : aucune entrée/sortie, aucun état global, testables isolément.
  - `shared` : contrats (schémas Zod), types et constantes partagés par tout le reste ;
  - `content` : générateurs d'exercices déterministes (même graine → même question) ;
  - `engine` : règles du jeu (XP, répétition espacée, combats, arène, coffres).
- **Applications** (`apps/*`) organisées **par modules métier** :
  - `server` : `modules/<domaine>/` = routes → service → dépôt (voir
    [architecture/serveur.md](../architecture/serveur.md)) ;
  - `web` : `features/<domaine>/` (voir [0008](0008-front-par-fonctionnalites.md)).

Règles de dépendance (vérifiées en CI par dependency-cruiser, voir [0007](0007-qualite.md)) :

- `shared` ne dépend de rien ; `content` et `engine` ne dépendent que de `shared` ;
- les applications ne s'importent jamais entre elles ;
- un module serveur n'importe un autre module que par son `index.ts` (API publique) ;
- aucun cycle.

## Conséquences

- La logique métier (règles, corrections) vit dans des fonctions pures, couvertes par des tests
  rapides ; le serveur l'orchestre et persiste.
- Ajouter un domaine = ajouter un module avec ses trois couches et son `index.ts`.
- Un seul `pnpm install`, une seule CI, des versions cohérentes.

## Options écartées

- **Microservices** : coût d'exploitation et de cohérence disproportionné pour une équipe
  réduite ; le découpage en modules garde la porte ouverte à une extraction future.
- **Dépôts séparés** : synchronisation des contrats entre front et serveur trop coûteuse.
