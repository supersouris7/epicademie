# 0002 — PostgreSQL, PGlite embarqué en développement et en tests

- Statut : Acceptée
- Date : 2026-11-19

## Contexte

La bêta utilisait SQLite (un fichier, un processus). Pour un service payant hébergé dans le
cloud (UE) : plusieurs instances du serveur, sauvegardes et restauration à un instant donné,
base managée, contraintes d'intégrité fortes, montée en charge à la rentrée scolaire.

## Décision

- **PostgreSQL** est l'unique moteur, via **Drizzle ORM** (`drizzle-orm/pg-core`).
- Deux pilotes derrière la même API (`apps/server/src/db/client.ts`) :
  - `postgres://…` → pool `pg` (production, CI d'intégration) ;
  - `pglite://memory` ou `pglite://<dossier>` → **PGlite**, le vrai moteur PostgreSQL compilé
    en WASM, embarqué dans le processus (développement, tests, e2e). Même SQL, mêmes migrations.
- Schéma : `uuid`, `timestamptz`, `date`, `jsonb` typé ; invariants métier doublés de
  contraintes `CHECK` (pièces ≥ 0, stock d'objets 0–9…) ; suppression d'un profil en cascade
  (droit à l'effacement RGPD).
- Concurrence : opérations sensibles en transaction, lignes verrouillées (`SELECT … FOR UPDATE`)
  pour les parties et les profils, gains crédités par incrément atomique (`xp = xp + n`).
- Tests : les mêmes suites tournent sur PGlite (par défaut) et sur un PostgreSQL réel en CI
  (`TEST_DATABASE_URL`, une base neuve par fichier de test).
- Données de la bêta SQLite : **non reprises** (décision produit : repartir de zéro).

## Conséquences

- Aucune installation de base pour développer (`pnpm dev` suffit).
- Les tests valident le vrai dialecte PostgreSQL (pas de base « simulée »).
- Toute requête est asynchrone ; la frontière transactionnelle est fixée par les services.

## Options écartées

- **Garder SQLite** derrière une abstraction : verrou d'écriture global, pas de multi-instance,
  sauvegardes à chaud plus délicates.
- **Postgres en Docker pour le développement et les tests** : plus lourd, plus lent, sans gain
  de fidélité par rapport à PGlite + CI d'intégration.
