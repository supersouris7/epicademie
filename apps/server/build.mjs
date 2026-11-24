import { readFileSync } from 'node:fs';
import { build } from 'esbuild';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
// Les paquets npm restent externes (installés par `pnpm deploy`), les paquets @epicademie/* sont inclus.
const external = Object.keys(pkg.dependencies).filter((d) => !d.startsWith('@epicademie/'));

// Points d'entrée : le serveur, la migration (conteneur « migrate »), l'administration et l'export des signalements.
await build({
  entryPoints: {
    main: 'src/main.ts',
    migrate: 'src/cli/migrate.ts',
    admin: 'src/cli/admin.ts',
    reports: 'src/cli/reports.ts',
  },
  outdir: 'dist',
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  sourcemap: true,
  external,
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
});
