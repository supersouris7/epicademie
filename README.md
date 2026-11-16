# Questeo

Exercices du programme de **5e** (maths, physique-chimie, anglais, espagnol, histoire, géographie), gamifiés et pensés tablette, avec un mode multijoueur où les smartphones servent de télécommandes (connexion par QR code). Mascotte : **Questy**, avatar rond à écran LED (12 humeurs en pixels).

Spécification : [`docs/SPEC.md`](docs/SPEC.md).

## Démarrage rapide (Docker, réseau local)

```bash
PUBLIC_URL=http://192.168.1.20:3000 docker compose up -d   # IP de la machine sur le Wi-Fi
```

Puis ouvrir `http://<ip>:3000` sur la tablette. `PUBLIC_URL` sert au QR code de connexion des smartphones (dans un conteneur, l'IP détectée automatiquement est celle du réseau Docker). Les données sont dans le volume `questeo-data`.

Images publiées : `docker.io/<utilisateur>/questeo` — `unstable` (dernier commit sur `main`), `1.0.1` / `1.0` / `1` / `latest` (versions taguées).

## Développement

Prérequis : Node 24, pnpm via Corepack (`corepack enable`).

```bash
pnpm install
pnpm dev          # serveur :3000 + Vite :5173 (exposé sur le réseau local)
pnpm test         # tests unitaires (Vitest)
pnpm e2e          # tests de bout en bout (Playwright, tablette + smartphone)
pnpm lint && pnpm typecheck && pnpm format:check
```

| Dossier            | Rôle                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| `apps/web`         | Front React + Vite (élève, hôte multijoueur, télécommande)            |
| `apps/server`      | Fastify + Socket.IO + SQLite (Drizzle)                                |
| `packages/shared`  | Types et schémas zod partagés                                         |
| `packages/content` | Générateurs d'exercices et banques de questions (purs, déterministes) |
| `packages/engine`  | XP/niveaux, répétition espacée, trophées (purs)                       |

Migrations : modifier `apps/server/src/db/schema.ts` puis `pnpm --filter @questeo/server db:generate`.
Mascotte : la source est `apps/web/src/components/mascot/` ; `pnpm --filter @questeo/web mascot:export` régénère `public/questy.svg` ; `npx tsx scripts/preview-mascot.tsx out.html` affiche toutes les humeurs.

Commits au format [Conventional Commits](https://www.conventionalcommits.org/fr/) (vérifié par commitlint).

## Publier une version

```bash
git tag v1.0.1 && git push origin v1.0.1
```

La CI (lint, types, tests, E2E) doit passer avant la publication des images `linux/amd64` + `linux/arm64`. Secrets GitHub requis : `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`.

## Crédits

Avatars générés avec [DiceBear](https://www.dicebear.com) (styles sous CC BY 4.0 et licences libres) et polices sous SIL OFL — détail dans l'application (Paramètres → À propos) et dans [`apps/web/src/credits.ts`](apps/web/src/credits.ts).
