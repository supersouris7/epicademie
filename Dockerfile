# syntax=docker/dockerfile:1
# Image de base épinglée par empreinte (reproductible) ; Dependabot propose les mises à jour.
ARG NODE_IMAGE=node:24-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54

FROM ${NODE_IMAGE} AS build
WORKDIR /repo
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY packages/content/package.json packages/content/
COPY packages/engine/package.json packages/engine/
RUN pnpm install --frozen-lockfile --ignore-scripts=false
COPY . .
RUN pnpm build \
 && pnpm --filter @epicademie/server deploy --prod /out/server \
 && cp -r apps/web/dist /out/web

FROM ${NODE_IMAGE}
ARG VERSION=dev
LABEL org.opencontainers.image.title="Épicadémie" \
      org.opencontainers.image.description="Épicadémie — exercices gamifiés du CM1 à la 3e" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.licenses="LicenseRef-Proprietary"
ENV NODE_ENV=production PORT=3000 EPICADEMIE_VERSION=${VERSION}
WORKDIR /app
# Correctif de sécurité linux-pam (CVE-2025-6020) absent de l'image de base épinglée : mise à
# niveau des seuls paquets concernés. À retirer quand une nouvelle empreinte l'intègre.
RUN apt-get update \
 && apt-get install -y --no-install-recommends --only-upgrade \
      libpam-modules libpam-modules-bin libpam-runtime libpam0g \
 && rm -rf /var/lib/apt/lists/*
# npm, npx et corepack ne servent qu'à installer : absents de l'image d'exécution (surface
# d'attaque réduite, et leurs dépendances embarquées ne remontent plus aux analyses de sécurité).
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
      /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
      /usr/local/bin/pnpm /usr/local/bin/pnpx /usr/local/bin/yarn /usr/local/bin/yarnpkg
COPY --from=build --chown=node:node /out/server ./server
COPY --from=build --chown=node:node /out/web ./web/dist
USER node
EXPOSE 3000
# Disponibilité : le processus ET la base répondent.
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://localhost:3000/api/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# Serveur par défaut ; la migration se lance avec la même image : `node server/dist/migrate.js`.
# DATABASE_URL (postgres://…) est obligatoire. Voir docs/operations/deploiement.md.
CMD ["node", "server/dist/main.js"]
