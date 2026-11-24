# Épicadémie — règles du projet

> Complète le socle commun de la fabrique (`~/.claude/CLAUDE.md`, `~/.claude/fabrique/standards/`),
> sans jamais l'affaiblir en sécurité. Point de reprise : `~/opencode/questeo-pilotage/ETAT.md` (dépôt privé de pilotage).

## Produit

- Vision, spécifications produit (spec avant code) et Arène d'évaluation : dépôt privé de pilotage, clone local
  `~/opencode/questeo-pilotage/specs/` (SPEC.md, VISION.md, ARENE-EVALUATION.md). Identité visuelle :
  `docs/DESIGN-SYSTEM.md`, `docs/ASSETS-CHATGPT.md`, `docs/PLANCHES-BOSS.md`.
- Décisions d'architecture : `docs/adr/`.

## Pile et commandes de contrôle

- TypeScript / Node.js (pnpm)
  - `pnpm run typecheck`
  - `pnpm run lint`
  - `pnpm run test`
  - `pnpm run e2e`
  - `pnpm run deadcode`
  - `pnpm run arch`
  - `pnpm run build`
- Tests web avec `--maxWorkers=2` ; e2e Playwright sur 3 profils (tablette, smartphone, ordinateur-tv), port 3100.
- Docker : image `supersouris7/epicademie`, tag `unstable` publié par la CI à chaque push sur `main`.
- CI GitHub Actions : `ci.yml` (lint, types, tests, build, e2e, intégration PostgreSQL, Trivy).
- Commits : commitlint (sujet en minuscules, lignes ≤ 100).
- Migrations Drizzle : `when` du journal strictement croissant (test de garde), réversibles, testées sur données fictives.

## Stratégie de tests

- Unitaires / intégration : vitest
- End-to-end : Playwright (parcours utilisateur)

## Environnements

> Renommage (Épicadémie) : l'hôte de test, son dossier et ses sauvegardes gardent l'ancien nom technique, comme la base,
> l'utilisateur PostgreSQL et le volume (les renommer imposerait une migration de données).

- Test (déploiement autorisé aux agents) : **questeo.lan** — `/home/lenovo/docker-data/questeo`.
  Procédure : `docker exec questeo-db pg_dump -U questeo -Fc questeo > /home/lenovo/docker-data/questeo-backups/questeo-<date>.dump`
  puis `docker compose pull questeo questeo-migrate && docker compose run --rm questeo-migrate && docker compose up -d`
  et contrôle `curl http://127.0.0.1:8104/api/ready`. Retour arrière : image précédente (`sha-…`) + restauration du dump.
- Production : uniquement avec accord explicite du client.

## Suivi

- Dépôt de code : supersouris7/questeo (PUBLIC, temporairement). **Tickets, jalons et roadmap : uniquement dans le dépôt
  PRIVÉ supersouris7/academy-fighters-pilotage** (tableau privé #2). Ne jamais créer d'issue ni écrire de stratégie, de tarif ou de
  spécification détaillée dans ce dépôt public ; PR sobres et techniques, `Closes supersouris7/academy-fighters-pilotage#N`.
- Branche principale : main
- Branches : `feat|fix|chore/<n° ticket>-<slug>` ; une PR par ticket, `Closes supersouris7/academy-fighters-pilotage#n`.

## Règles spécifiques

- Conventions de contribution : `CONTRIBUTING.md`.
- Nom affiché du produit : **Épicadémie** (nom de code technique : epicademie).
- Public : élèves (collège, puis toutes matières) et adultes ; parents = clients payants (Espace parent).
- Contenu pédagogique : pas de relecture humaine → chaque fait est sourcé (sources institutionnelles :
  Éduscol / BO…) et vérifié par des tests de cohérence.
- Pédagogie : ton de coach (pas de manuel), chaque mot difficile défini, schémas, peu de clics.
- Images : générées par le client (planches ChatGPT) ; les personnages sont toujours affichés en entier.
- Données d'enfants : minimisation, isolation par famille, aucune donnée personnelle envoyée à l'extérieur.
- Paiement : Stripe en mode test uniquement tant que le client n'a pas décidé autrement.
