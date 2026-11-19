import { readFileSync } from 'node:fs';
import { build } from 'esbuild';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
// Les paquets npm restent externes (installés par `pnpm deploy`), les paquets @questeo/* sont inclus.
const external = Object.keys(pkg.dependencies).filter((d) => !d.startsWith('@questeo/'));

// Deux points d'entrée : le serveur et la commande de migration (conteneur « migrate »).
await build({
  entryPoints: { main: 'src/main.ts', migrate: 'src/cli/migrate.ts' },
  outdir: 'dist',
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  sourcemap: true,
  external,
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
});
