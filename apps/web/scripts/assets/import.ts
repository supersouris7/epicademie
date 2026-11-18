/**
 * Importe les images générées (assets-src/originals) vers public/assets :
 * détourage du fond magenta, découpe des planches en grille, recadrage, redimensionnement,
 * conversion WebP, contrôle de la transparence, puis mise à jour du manifeste.
 *
 * Usage : pnpm --filter @questeo/web assets:import [--force] [filtre…]
 *   filtre : morceau d'identifiant, de chemin ou de nom de planche (ex. « questy », « boutons »).
 * Les originaux ne sont jamais modifiés.
 */
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { KINDS, PLANNED_ASSETS, type AssetKind, type KindId, type PlannedAsset } from '../../src/design/assets.ts';
import { chromaKey, contentBox, dropEdgeScraps, hasAlpha, inspect, splitSheet, type Box, type Rgba } from './image.ts';
import { availableFile, sheets } from './plan.ts';

const WEB = fileURLToPath(new URL('../../', import.meta.url));
const PUBLIC = join(WEB, 'public/assets');
const ORIGINALS = join(WEB, 'assets-src/originals');
const AVAILABLE = join(WEB, 'src/design/assets.available.ts');
const EXTENSIONS = ['.png', '.webp', '.jpg', '.jpeg'];

/** Types recadrés au plus près puis centrés (les autres gardent le cadrage demandé : ligne de sol, échelle commune). */
const TRIM: ReadonlySet<KindId> = new Set([
  'icon',
  'glyph',
  'tile',
  'minion',
  'projectile',
  'effect',
  'prop',
  'head',
  'frame',
  'button',
  'ring',
  'card',
  'logo',
  'platform',
  'weapon',
]);

/** Marge laissée autour des éléments recadrés (part de la taille finale). */
const MARGIN = 0.04;

const findSource = (base: string) => EXTENSIONS.map((e) => base + e).find((f) => existsSync(f));
const individualSource = (asset: PlannedAsset) => findSource(join(ORIGINALS, asset.file.replace(/\.webp$/, '')));

async function load(file: string): Promise<Rgba> {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function crop(img: Rgba, box: Box): Rgba {
  const out = Buffer.alloc(box.width * box.height * 4);
  for (let y = 0; y < box.height; y++) {
    const from = ((box.top + y) * img.width + box.left) * 4;
    Buffer.from(img.data.buffer, img.data.byteOffset + from, box.width * 4).copy(out, y * box.width * 4);
  }
  return { data: out, width: box.width, height: box.height };
}

export interface Result {
  readonly asset: PlannedAsset;
  readonly ok: boolean;
  readonly notes: string[];
}

/** Produit le WebP final d'un asset à partir d'une image (déjà détourée si besoin). */
export async function render(asset: PlannedAsset, source: Rgba): Promise<{ webp: Buffer; notes: string[] }> {
  const kind = KINDS[asset.kind];
  const [fw, fh] = kind.final;
  const notes: string[] = [];
  const raw = { raw: { width: source.width, height: source.height, channels: 4 as const } };

  if (isOpaque(asset)) {
    const webp = await sharp(source.data, raw)
      .resize(fw, fh, { fit: 'cover' })
      .removeAlpha()
      .webp({ quality: 86 })
      .toBuffer();
    return { webp, notes };
  }

  // Le fond n'a pas été retiré (ni transparence d'origine, ni magenta détouré) : à signaler.
  if (!hasAlpha(source)) notes.push('fond non détouré');
  // Image déjà détourée par le générateur : on retire les débris de la case voisine collés au bord.
  let img = hasAlpha(source) ? dropEdgeScraps(source) : source;
  // Pose (héros ou boss) livrée seule et déjà détourée : même échelle pour toutes les poses (jamais agrandie),
  // pieds posés en bas, centrée : les poses s'enchaînent sans saut de taille ni de position.
  if ((asset.kind === 'pose' || asset.kind === 'boss') && hasAlpha(source)) {
    const box = contentBox(img);
    if (!box) throw new Error('image vide');
    img = crop(img, box);
    const scale = Math.min(1, fw / img.width, (fh * 0.98) / img.height);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const body = await sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } })
      .resize(w, h)
      .png()
      .toBuffer();
    const webp = await sharp({
      create: { width: fw, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: body, left: Math.round((fw - w) / 2), top: fh - h - Math.round(fh * 0.01) }])
      .webp({ quality: 88, alphaQuality: 100, effort: 5 })
      .toBuffer();
    return { webp, notes };
  }
  if (TRIM.has(asset.kind)) {
    const box = contentBox(img);
    if (!box) throw new Error('image vide');
    img = crop(img, box);
  }
  const mw = TRIM.has(asset.kind) ? Math.round(fw * MARGIN) : 0;
  const mh = TRIM.has(asset.kind) ? Math.round(fh * MARGIN) : 0;
  const resized = await sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } })
    .resize(fw - 2 * mw, fh - 2 * mh, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: mh, bottom: mh, left: mw, right: mw, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const report = inspect({ data: resized.data, width: resized.info.width, height: resized.info.height });
  if (!report.cornersClear) notes.push('coins non transparents');
  if (report.transparent < 0.02) notes.push('presque aucune transparence');
  if (report.magentaLeft > resized.info.width * resized.info.height * 0.002)
    notes.push(`${report.magentaLeft} px encore magenta`);
  const webp = await sharp(resized.data, {
    raw: { width: resized.info.width, height: resized.info.height, channels: 4 },
  })
    .webp({ quality: 88, alphaQuality: 100, effort: 5 })
    .toBuffer();
  return { webp, notes };
}

/** Illustration plein cadre (pas de détourage). */
const isOpaque = (asset: PlannedAsset): boolean => (KINDS[asset.kind] as AssetKind).opaque === true;

const keyed = (img: Rgba, opaque: boolean) => (opaque || hasAlpha(img) ? img : chromaKey(img));

function write(asset: PlannedAsset, webp: Buffer) {
  const dest = join(PUBLIC, asset.file);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, webp);
}

const upToDate = (src: string, asset: PlannedAsset) => {
  const dest = join(PUBLIC, asset.file);
  return existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs;
};

export async function run(filters: readonly string[], force: boolean): Promise<Result[]> {
  const match = (...keys: string[]) => !filters.length || filters.some((f) => keys.some((k) => k.includes(f)));
  const results: Result[] = [];

  // Original individuel : prioritaire, même pour un élément prévu dans une planche (découpé avec assets:cut).
  for (const asset of PLANNED_ASSETS) {
    const src = individualSource(asset);
    if (!src || !match(asset.id, asset.file) || (!force && upToDate(src, asset))) continue;
    try {
      const { webp, notes } = await render(asset, keyed(await load(src), isOpaque(asset)));
      write(asset, webp);
      results.push({ asset, ok: true, notes });
    } catch (e) {
      results.push({ asset, ok: false, notes: [(e as Error).message] });
    }
  }

  for (const sheet of sheets()) {
    const src = findSource(join(ORIGINALS, 'sheets', sheet.name));
    const items = sheet.items.filter((p) => !individualSource(p));
    if (!src || !match(sheet.name, ...items.map((p) => p.id))) continue;
    if (!force && items.every((p) => upToDate(src, p))) continue;
    const cells = splitSheet(keyed(await load(src), false), sheet.grid.cols, sheet.grid.rows);
    for (const [i, asset] of sheet.items.entries()) {
      if (!items.includes(asset)) continue;
      const cell = cells[i];
      try {
        if (!cell) throw new Error('case vide');
        const { webp, notes } = await render(asset, cell);
        write(asset, webp);
        results.push({ asset, ok: true, notes });
      } catch (e) {
        results.push({ asset, ok: false, notes: [`planche ${sheet.name}, case ${i + 1} : ${(e as Error).message}`] });
      }
    }
  }

  writeFileSync(AVAILABLE, availableFile());
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const results = await run(
    args.filter((a) => !a.startsWith('--')),
    args.includes('--force'),
  );
  for (const r of results) {
    const mark = !r.ok ? '✗' : r.notes.length ? '!' : '✓';
    console.log(`${mark} ${r.asset.file}${r.notes.length ? ` — ${r.notes.join(', ')}` : ''}`);
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(
    results.length
      ? `${results.length - failed} image(s) importée(s), ${failed} échec(s). Manifeste mis à jour.`
      : 'Rien de nouveau à importer (déposer les PNG dans apps/web/assets-src/originals).',
  );
  if (failed) process.exit(1);
}
