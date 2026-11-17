/**
 * Génère les SVG d'Academy Fighters dans public/assets et leur catalogue dans src/design/assets.generated.ts.
 * Usage : pnpm --filter @questeo/web assets:svg  (ou `assets:svg --check` pour vérifier sans écrire).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EFFECTS, HUD, MEDALS, PLACEHOLDERS, REWARDS, SUBJECTS, brandAssets } from './defs/game.ts';
import { NAVIGATION, RESOURCES, STATUS, TOOLS } from './defs/icons.ts';
import type { SvgAsset } from './types.ts';

export const PUBLIC_ASSETS = fileURLToPath(new URL('../../public/assets/', import.meta.url));
const CATALOG = fileURLToPath(new URL('../../src/design/assets.generated.ts', import.meta.url));

export function svgAssets(): SvgAsset[] {
  return [
    ...brandAssets(),
    ...RESOURCES,
    ...NAVIGATION,
    ...TOOLS,
    ...STATUS,
    ...SUBJECTS,
    ...MEDALS,
    ...REWARDS,
    ...HUD,
    ...EFFECTS,
    ...PLACEHOLDERS,
  ];
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function renderSvg(a: SvgAsset): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${a.viewBox ?? '0 0 64 64'}" role="img" aria-label="${escape(a.title)}">` +
    `<title>${escape(a.title)}</title>${a.body}</svg>\n`
  );
}

export function renderCatalog(assets: readonly SvgAsset[]): string {
  const rows = assets.map((a) => {
    const category = a.file.split('/').slice(0, -1).join('/');
    return `  ${JSON.stringify(a.id)}: { category: ${JSON.stringify(category)}, path: ${JSON.stringify(`/assets/${a.file}`)}, viewBox: ${JSON.stringify(a.viewBox ?? '0 0 64 64')}, title: ${JSON.stringify(a.title)}, usage: ${JSON.stringify(a.usage)}, status: ${JSON.stringify(a.status ?? 'disponible')} },`;
  });
  return [
    '// Fichier généré par scripts/assets/build.ts — ne pas modifier à la main.',
    '// prettier-ignore',
    'export const SVG_ASSETS = {',
    ...rows,
    '} as const;',
    '',
  ].join('\n');
}

/** Fichiers attendus (chemin absolu → contenu). */
export function outputs(): Map<string, string> {
  const assets = svgAssets();
  const ids = new Set<string>();
  for (const a of assets) {
    if (ids.has(a.id)) throw new Error(`Identifiant en double : ${a.id}`);
    ids.add(a.id);
  }
  const out = new Map<string, string>();
  for (const a of assets) out.set(PUBLIC_ASSETS + a.file, renderSvg(a));
  out.set(CATALOG, renderCatalog(assets));
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  let stale = 0;
  for (const [file, content] of outputs()) {
    const current = existsSync(file) ? readFileSync(file, 'utf8') : null;
    if (current === content) continue;
    stale++;
    if (check) console.error(`Pas à jour : ${file}`);
    else {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, content);
    }
  }
  if (check && stale) process.exit(1);
  console.log(check ? 'SVG à jour.' : `${stale} fichier(s) écrit(s).`);
}
