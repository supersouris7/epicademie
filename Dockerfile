# syntax=docker/dockerfile:1
FROM node:24-slim AS build
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
 && pnpm --filter @questeo/server deploy --prod /out/server \
 && cp -r apps/web/dist /out/web

FROM node:24-slim
ARG VERSION=dev
LABEL org.opencontainers.image.title="Questeo" \
      org.opencontainers.image.description="Academy Fighters — exercices gamifiés du CM1 à la 3e" \
      org.opencontainers.image.version="${VERSION}"
ENV NODE_ENV=production PORT=3000 QUESTEO_VERSION=${VERSION}
WORKDIR /app
COPY --from=build --chown=node:node /out/server ./server
COPY --from=build --chown=node:node /out/web ./web/dist
USER node
EXPOSE 3000
# Disponibilité : le processus ET la base répondent.
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://localhost:3000/api/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# Serveur par défaut ; la migration se lance avec la même image : `node server/dist/migrate.js`.
# DATABASE_URL (postgres://…) est obligatoire. Voir docs/operations/deploiement.md.
CMD ["node", "server/dist/main.js"]
