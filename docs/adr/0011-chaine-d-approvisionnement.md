# 0011 — Chaîne d'approvisionnement : versions épinglées, mises à jour suivies, image analysée

- Statut : Acceptée
- Date : 2026-11-20

## Contexte

Le code exécuté en production ou en CI ne vient pas que du dépôt : dépendances npm, actions
GitHub, image de base Node, image PostgreSQL. Une étiquette déplacée (action compromise), une
dépendance abandonnée ou une faille connue dans l'image peuvent passer inaperçues.

## Décision

- **Actions GitHub épinglées par empreinte de commit** (version en commentaire).
- **Images de base épinglées par empreinte** (`node:24-slim@sha256:…` dans le `Dockerfile`,
  `postgres:17-alpine@sha256:…` en CI et dans `compose.yml`).
- **Dependabot** (`.github/dependabot.yml`) propose chaque semaine les mises à jour npm, actions,
  images Docker, regroupées, avec un **délai de 14 jours** après publication (une version
  compromise est en général retirée avant). La CI complète valide chaque proposition.
- Dépendances ajoutées à la main : versions publiées depuis au moins deux semaines.
- **Image d'exécution minimale** : npm, npx et corepack en sont retirés (inutiles pour exécuter).
- **Analyse Trivy** de l'image en CI : bloquante s'il reste une faille grave ou critique
  corrigeable (paquets système et dépendances Node).
- `pnpm audit` doit rester propre. Une faille d'une dépendance indirecte d'outil de
  développement se corrige par un `overrides` commenté dans `pnpm-workspace.yaml`, retiré dès
  que la dépendance directe l'intègre.

## Conséquences

- Une construction est reproductible à l'identique ; une mise à jour est une PR visible et testée.
- Les mises à jour de sécurité arrivent avec au plus une semaine de délai (plus le délai de
  14 jours pour les nouvelles versions).

## Options écartées

- **Renovate** : plus configurable, mais un service de plus ; Dependabot suffit à cette taille.
- **Mises à jour automatiques en production (Watchtower)** : désactivées depuis la refonte
  (la migration de base doit précéder le serveur, voir [0003](0003-migrations.md)).
