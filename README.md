# Questeo — Academy Fighters

Exercices de mathématiques du **CM1 à la 3e** (programmes officiels), gamifiés : entraînement
avec répétition espacée, combats de boss par chapitre, arène multijoueur tour par tour. Pensé
tablette et smartphone. Mascotte : **Questy**.

- Produit et règles du jeu : [`docs/SPEC.md`](docs/SPEC.md)
- Architecture : [`docs/architecture/`](docs/architecture/README.md) — décisions : [`docs/adr/`](docs/adr/README.md)
- Exploitation : [configuration](docs/operations/configuration.md), [déploiement](docs/operations/deploiement.md), [observabilité](docs/operations/observabilite.md)
- Contribuer : [`CONTRIBUTING.md`](CONTRIBUTING.md)

## Démarrage rapide (Docker)

```bash
cp .env.example .env      # renseigner POSTGRES_PASSWORD (et PUBLIC_URL)
docker compose up -d      # PostgreSQL → migration → serveur sur :3000
```

Images publiées : `docker.io/<utilisateur>/questeo` — `unstable` (dernier commit sur `main`),
`1.0.1` / `1.0` / `1` / `latest` (versions taguées).

## Développement

Prérequis : Node 24, pnpm via Corepack (`corepack enable`). Aucune base à installer
(PostgreSQL embarqué, PGlite).

```bash
pnpm install
pnpm dev                  # migre la base de dev, serveur :3000 (+ /api/docs) et Vite :5173
pnpm test                 # tests unitaires et d'intégration
pnpm e2e                  # tests de bout en bout (Playwright, tablette + smartphone)
pnpm lint && pnpm typecheck && pnpm arch && pnpm format:check
```

| Dossier            | Rôle                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| `apps/web`         | Front React + Vite, organisé par fonctionnalités (`src/features/`)      |
| `apps/server`      | Fastify + socket.io + PostgreSQL (Drizzle), organisé par modules métier |
| `packages/shared`  | Contrats partagés : schémas Zod de l'API et du temps réel, types        |
| `packages/content` | Générateurs d'exercices (purs, déterministes)                           |
| `packages/engine`  | Règles du jeu : XP, répétition espacée, combats, arène, coffres (purs)  |

Migrations : modifier `apps/server/src/db/schema.ts` puis `pnpm --filter @questeo/server db:generate`.
Mascotte : la source est `apps/web/src/shared/ui/mascot/` ; `pnpm --filter @questeo/web mascot:export`
régénère `public/questy.svg`.

Commits au format [Conventional Commits](https://www.conventionalcommits.org/fr/) (vérifié par commitlint).

## Publier une version

```bash
git tag v1.0.1 && git push origin v1.0.1
```

La CI (lint, types, tests, E2E) doit passer avant la publication des images `linux/amd64` + `linux/arm64`. Secrets GitHub requis : `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`.

## Licence

Logiciel propriétaire — © 2026 supersouris7, tous droits réservés (voir [`LICENSE`](LICENSE)).
Code non open source : aucune réutilisation sans autorisation écrite.

## Crédits

Avatars générés avec [DiceBear](https://www.dicebear.com) (styles sous CC BY 4.0 et licences libres) et polices sous SIL OFL — détail dans l'application (Paramètres → À propos) et dans [`apps/web/src/features/settings/credits.ts`](apps/web/src/features/settings/credits.ts).
