# @questeo/web

Front React d'Academy Fighters, organisé par fonctionnalités (`src/features/`).
Architecture : [docs/architecture/web.md](../../docs/architecture/web.md) ;
design system : [docs/DESIGN-SYSTEM.md](../../docs/DESIGN-SYSTEM.md).

```bash
pnpm --filter @questeo/web dev      # Vite :5173 (le serveur doit tourner sur :3000)
pnpm --filter @questeo/web build
```

Images : catalogue dans `src/design/assets.ts` (familles dans `src/design/catalog/`), import par
`pnpm --filter @questeo/web assets:import`, plan de génération par `assets:plan`.
