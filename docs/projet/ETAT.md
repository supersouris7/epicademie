# État du projet — Academy Fighters

> Point de reprise de toute session. Court, daté, mis à jour en fin d'intervention.
> Le détail opérationnel est dans les tickets GitHub ; ici, seulement la synthèse.

- Mis à jour : 2026-11-21
- Maturité : mature — CI complète (lint, types, tests, e2e, PostgreSQL, Trivy), 16 migrations.
- Environnement de test : questeo.lan à jour de `main` (PR #28, #29, #30 déployées le 21/11, sauvegarde faite).
- Production : aucune pour l'instant (commercialisation en préparation).
- Tableau de suivi : à créer (droit GitHub « project » en attente).

## Livré récemment (21/11)

- Finitions de jeu (#28), code PIN et Espace parent soigné (#29), console d'administration pro (#30).

## En cours

- Intégration à la fabrique logicielle (branche `chore/fabrique-integration`).

## En attente du client

- 24 images de badges (6 badges × bronze/argent/or/diamant).
- Planches des boss des autres matières.
- PDF officiel du programme d'histoire cycle 4.
- Renouvellement de la connexion Claude Code (expire entre le 24 et le 27/11).

## Anomalies connues

- Aucune bloquante. Contrôle sécurité du 21/11 : 0 critique/haute ; 1 faux positif (jeton de test).

## Prochaine action

- Backlog initial dans GitHub Issues, puis reprise des matières (anglais en premier).

## Décisions récentes

- 21/11 : console d'admin accessible seulement par /admin + mot de passe, session de 15 min.
- 21/11 : code PIN parent à 4 chiffres, oubli = mot de passe du compte.
