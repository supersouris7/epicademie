# @epicademie/server

Serveur HTTP (Fastify) et temps réel (socket.io) d'Épicadémie, sur PostgreSQL (Drizzle).
Architecture : [docs/architecture/serveur.md](../../docs/architecture/serveur.md).

```bash
pnpm --filter @epicademie/server dev          # migre la base de dev (PGlite) puis démarre :3000
pnpm --filter @epicademie/server db:generate  # nouvelle migration depuis src/db/schema.ts
pnpm --filter @epicademie/server db:migrate   # applique les migrations (DATABASE_URL)
```

- Documentation de l'API : http://localhost:3000/api/docs (spécification : `/api/openapi.json`).
- Sondes : `/api/health`, `/api/ready` ; métriques : `/api/metrics`.
- Configuration : [docs/operations/configuration.md](../../docs/operations/configuration.md).
- Tests : `pnpm exec vitest run --project @epicademie/server` (PGlite) ; avec
  `TEST_DATABASE_URL=postgres://…` pour un PostgreSQL réel.
