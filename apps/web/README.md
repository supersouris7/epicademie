# @epicademie/web

Front React d'Épicadémie, organisé par fonctionnalités (`src/features/`).
Architecture : [docs/architecture/web.md](../../docs/architecture/web.md) ;
design system : [docs/DESIGN-SYSTEM.md](../../docs/DESIGN-SYSTEM.md).

```bash
pnpm --filter @epicademie/web dev      # Vite :5173 (le serveur doit tourner sur :3000)
pnpm --filter @epicademie/web build
```

Images : catalogue dans `src/design/assets.ts` (familles dans `src/design/catalog/`), import par
`pnpm --filter @epicademie/web assets:import`, plan de génération par `assets:plan`.
