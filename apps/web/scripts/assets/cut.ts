/**
 * Découpe une planche qui ne suit pas le catalogue (ordre ou contenu différents de la demande)
 * en originaux individuels détourés, rangés aux chemins du catalogue. `assets:import` les prend
 * ensuite en priorité sur la planche prévue.
 *
 * Usage : pnpm --filter @questeo/web assets:cut <planche.png> <colonnes>x<lignes> <chemin|-> …
 *   un chemin par case, dans l'ordre de lecture, relatif à public/assets et sans extension
 *   (ex. icons/modes/chrono) ; « - » ignore la case.
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { PLANNED_ASSETS } from '../../src/design/assets.ts';
import { chromaKey, hasAlpha, splitSheet, type Rgba } from './image.ts';

const ORIGINALS = fileURLToPath(new URL('../../assets-src/originals/', import.meta.url));

export async function cut(sheet: string, cols: number, rows: number, targets: readonly string[]): Promise<string[]> {
  const known = new Set(PLANNED_ASSETS.map((p) => p.file.replace(/\.webp$/, '')));
  const unknown = targets.filter((t) => t !== '-' && !known.has(t));
  if (unknown.length) throw new Error(`Chemins absents du catalogue : ${unknown.join(', ')}`);
  if (targets.length > cols * rows) throw new Error('Plus de chemins que de cases');

  const { data, info } = await sharp(sheet).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const img: Rgba = { data, width: info.width, height: info.height };
  const cells = splitSheet(hasAlpha(img) ? img : chromaKey(img), cols, rows);
  const written: string[] = [];
  for (const [i, target] of targets.entries()) {
    if (target === '-') continue;
    const cell = cells[i];
    if (!cell) throw new Error(`Case ${i + 1} vide (${target})`);
    const dest = join(ORIGINALS, `${target}.png`);
    mkdirSync(dirname(dest), { recursive: true });
    await sharp(cell.data, { raw: { width: cell.width, height: cell.height, channels: 4 } })
      .png()
      .toFile(dest);
    written.push(dest);
  }
  return written;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [sheet, grid, ...targets] = process.argv.slice(2);
  const [cols, rows] = (grid ?? '').split('x').map(Number);
  if (!sheet || !cols || !rows || !targets.length) {
    console.error('Usage : assets:cut <planche.png> <colonnes>x<lignes> <chemin|-> …');
    process.exit(1);
  }
  for (const f of await cut(sheet, cols, rows, targets)) console.log(`✓ ${f}`);
}
