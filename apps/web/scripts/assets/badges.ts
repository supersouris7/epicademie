/**
 * Badges : 24 médailles (6 badges × 4 rangs) à partir de la planche du client (21/11/2026).
 *
 *   pnpm --filter @epicademie/web assets:badges
 *
 * Planche : 6 lignes (un badge par ligne, dans l'ordre de `BADGES`) × 4 colonnes (bronze, argent,
 * or, diamant), déjà transparente. Chaque médaille est localisée par sa forme (composantes
 * connexes), pas par une grille fixe ; le voile quasi transparent du détourage est retiré, puis
 * toutes les médailles sont posées sur un même canevas carré, alignées par le bas (les rubans
 * restent au même endroit ; le diamant dépasse au-dessus) et centrées horizontalement.
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { BADGE_IMAGES } from '../../src/design/badges.ts';
import { contentBox, type Rgba } from './image.ts';
import { clean, crop, largestShape } from './sprites.ts';

const SHEET = fileURLToPath(new URL('../../assets-src/originals/rewards/badges/planche-badges.png', import.meta.url));
const PUBLIC = fileURLToPath(new URL('../../public/assets/', import.meta.url));
/** Marge autour de la plus grande médaille (diamant compris). */
const MARGIN = 8;
const COLS = 4;
const ROWS = 6;
/** Pixels plus transparents que cela : voile de détourage, retirés. */
const MIN_ALPHA = 40;

/** Bornes (n + 1 valeurs) des n bandes régulières, coupées au creux de la projection de l'opacité. */
function cuts(img: Rgba, axis: 'x' | 'y', n: number): number[] {
  const len = axis === 'x' ? img.width : img.height;
  const other = axis === 'x' ? img.height : img.width;
  const proj = new Array<number>(len).fill(0);
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < other; j++) {
      const p = axis === 'x' ? j * img.width + i : i * img.width + j;
      if ((img.data[p * 4 + 3] ?? 0) >= 128) proj[i] = (proj[i] ?? 0) + 1;
    }
  }
  const first = proj.findIndex((v) => v > 0);
  const last = len - 1 - [...proj].reverse().findIndex((v) => v > 0);
  const pitch = (last + 1 - first) / n;
  const out = [first];
  for (let k = 1; k < n; k++) {
    const mid = Math.round(first + k * pitch);
    const reach = Math.round(pitch / 4);
    let best = mid;
    for (let i = mid - reach; i <= mid + reach; i++) if ((proj[i] ?? 0) < (proj[best] ?? 0)) best = i;
    out.push(best);
  }
  out.push(last + 1);
  return out;
}

/** Rayon d'érosion : sépare les médailles qui se touchent sans entamer les parties fines. */
const ERODE = 12;
/** Luminance sous laquelle un pixel est du contour sombre, et coût de sa traversée. */
/** Gemme du rang diamant : hauteur au-dessus du cœur et demi-largeur. */
const GEM = 40;
const GEM_HALF_WIDTH = 26;
const DARK = 45;
const DARK_COST = 6;

/** Numéro (1…24, 0 = fond) de la médaille propriétaire de chaque pixel non transparent. */
function ownership(img: Rgba, xs: readonly number[], ys: readonly number[]): Uint8Array {
  const { width: w, height: h, data } = img;
  const opaque = (p: number) => (data[p * 4 + 3] ?? 0) >= 200;
  // Érosion séparable : un pixel reste s'il est entouré d'opaque sur ±ERODE.
  const horiz = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    let run = 0;
    for (let x = 0; x < w; x++) {
      run = opaque(y * w + x) ? run + 1 : 0;
      if (run > 2 * ERODE) horiz[y * w + x - ERODE] = 1;
    }
  }
  const core = new Uint8Array(w * h);
  for (let x = 0; x < w; x++) {
    let run = 0;
    for (let y = 0; y < h; y++) {
      run = horiz[y * w + x] ? run + 1 : 0;
      if (run > 2 * ERODE) core[(y - ERODE) * w + x] = 1;
    }
  }
  const owner = new Uint8Array(w * h);
  const queue: number[] = [];
  /** Haut du cœur et abscisse du centre de chaque médaille. */
  const top = new Array<number>(COLS * ROWS).fill(h);
  const centerX = new Array<number>(COLS * ROWS).fill(0);
  // Case la plus proche (centres réguliers : les médailles débordent de leur case nominale).
  const near = (v: number, b: readonly number[], n: number) =>
    Math.min(n - 1, Math.max(0, Math.floor(((v - (b[0] ?? 0)) / ((b[n] ?? 1) - (b[0] ?? 0))) * n)));
  const cellOf = (x: number, y: number) => near(y, ys, ROWS) * COLS + near(x, xs, COLS);
  // Composantes du cœur ; chacune est rattachée à la case qui contient son centre.
  const seen = new Uint8Array(w * h);
  for (let s = 0; s < w * h; s++) {
    if (!core[s] || seen[s]) continue;
    const comp: number[] = [s];
    seen[s] = 1;
    let [sx, sy] = [0, 0];
    // `comp` grandit pendant le parcours : le for-of le suit.
    for (const p of comp) {
      sx += p % w;
      sy += Math.floor(p / w);
      for (const q of [p - 1, p + 1, p - w, p + w]) {
        if (q < 0 || q >= w * h || seen[q] || !core[q]) continue;
        if ((q === p - 1 && p % w === 0) || (q === p + 1 && q % w === 0)) continue;
        seen[q] = 1;
        comp.push(q);
      }
    }
    if (comp.length < 100) continue;
    const cell = cellOf(Math.floor(sx / comp.length), Math.floor(sy / comp.length));
    for (const p of comp) {
      owner[p] = cell + 1;
      queue.push(p);
      top[cell] = Math.min(top[cell] ?? h, Math.floor(p / w));
    }
    centerX[cell] = Math.floor(sx / comp.length);
  }
  // Croissance simultanée (Dijkstra par seaux) dans tous les pixels non transparents. Traverser
  // le contour sombre coûte cher : la pointe d'un ruban reste à sa médaille, qui l'atteint par
  // l'intérieur du ruban, plutôt qu'à la médaille voisine qui la frôle par son contour.
  const dist = new Float32Array(w * h).fill(Infinity);
  const buckets: number[][] = [[]];
  for (const p of queue) {
    dist[p] = 0;
    buckets[0]?.push(p);
  }
  const cost = (p: number) => {
    const lum = 0.299 * (data[p * 4] ?? 0) + 0.587 * (data[p * 4 + 1] ?? 0) + 0.114 * (data[p * 4 + 2] ?? 0);
    return lum < DARK ? DARK_COST : 1;
  };
  for (let d = 0; d < buckets.length; d++) {
    const list = buckets[d] ?? [];
    for (const p of list) {
      if ((dist[p] ?? Infinity) !== d) continue;
      for (const q of [p - 1, p + 1, p - w, p + w]) {
        if (q < 0 || q >= w * h || (data[q * 4 + 3] ?? 0) === 0) continue;
        if ((q === p - 1 && p % w === 0) || (q === p + 1 && q % w === 0)) continue;
        const nd = d + cost(q);
        if (nd >= (dist[q] ?? Infinity)) continue;
        dist[q] = nd;
        owner[q] = owner[p] ?? 0;
        (buckets[nd] ??= []).push(q);
      }
    }
  }
  // Pointes de ruban de la médaille du dessus restées accrochées au haut du disque : retirées
  // (sauf, au rang diamant, la gemme posée au centre au-dessus du disque).
  for (let p = 0; p < w * h; p++) {
    const k = (owner[p] ?? 0) - 1;
    if (k < 0) continue;
    const gem = k % COLS === COLS - 1 && Math.abs((p % w) - (centerX[k] ?? 0)) < GEM_HALF_WIDTH;
    if (Math.floor(p / w) < (top[k] ?? 0) - ERODE - 2 - (gem ? GEM : 0)) owner[p] = 0;
  }
  return owner;
}

export async function cutBadges(): Promise<string[]> {
  const { data, info } = await sharp(SHEET).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const board = clean({ data, width: info.width, height: info.height }, MIN_ALPHA);
  // Les médailles se touchent presque (ruban d'une ligne, disque de la suivante) : on repère le
  // cœur de chaque médaille (pixels opaques érodés), rattaché à sa case, puis on fait grandir
  // chaque cœur dans les pixels non transparents ; les fronts se rencontrent à la jonction.
  const xs = cuts(board, 'x', COLS);
  const ys = cuts(board, 'y', ROWS);
  const owner = ownership(board, xs, ys);
  const parts: Rgba[] = [];
  for (let k = 0; k < COLS * ROWS; k++) {
    const own = Buffer.alloc(board.width * board.height * 4);
    for (let p = 0; p < owner.length; p++) {
      if (owner[p] === k + 1) own.set(board.data.subarray(p * 4, p * 4 + 4), p * 4);
    }
    // Miettes du contour de la voisine (pointe de ruban) retirées : seule la plus grande forme reste.
    const all = largestShape({ data: own, width: board.width, height: board.height }, 128, 3);
    const tight = contentBox(all, 0);
    if (!tight) throw new Error(`médaille ${k + 1} vide`);
    parts.push(crop(all, tight));
  }
  const size = Math.max(...parts.map((p) => Math.max(p.width, p.height))) + 2 * MARGIN;
  const written: string[] = [];
  for (const [i, img] of parts.entries()) {
    const target = BADGE_IMAGES[i];
    if (!target) throw new Error('trop de médailles');
    const canvas = Buffer.alloc(size * size * 4);
    const left = Math.floor((size - img.width) / 2);
    const top = size - MARGIN - img.height;
    for (let y = 0; y < img.height; y++) {
      canvas.set(img.data.subarray(y * img.width * 4, (y + 1) * img.width * 4), ((top + y) * size + left) * 4);
    }
    const dest = join(PUBLIC, target.file);
    mkdirSync(dirname(dest), { recursive: true });
    await sharp(canvas, { raw: { width: size, height: size, channels: 4 } })
      .webp({ quality: 90, alphaQuality: 100, effort: 6 })
      .toFile(dest);
    written.push(dest);
  }
  return written;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const f of await cutBadges()) console.log(`✓ ${f}`);
}
