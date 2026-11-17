/**
 * Traitements d'image purs (tampons RGBA) utilisés par l'import des images générées :
 * détourage du fond magenta, suppression du liseré magenta, boîte englobante, contrôles.
 */

export interface Rgba {
  readonly data: Uint8Array | Buffer;
  readonly width: number;
  readonly height: number;
}

/** Fond de détourage demandé à ChatGPT. */
export const KEY = [255, 0, 255] as const;

/** Fond : pixels proches du magenta reliés au bord de l'image (bruit de compression toléré). */
const BG = 80;
/** Magenta presque pur : du fond même enfermé dans le sujet (entre les jambes, dans un anneau). */
const PURE = 45;
/** Bord adouci : jusqu'à cette distance, un pixel voisin du fond devient semi-transparent. */
const EDGE = 175;
/** Largeur de la zone de bord traitée, en pixels. */
const EDGE_WIDTH = 2;

/** Distance euclidienne au magenta (0 à 441). */
export function keyDistance(r: number, g: number, b: number): number {
  return Math.hypot(r - KEY[0], g - KEY[1], b - KEY[2]);
}

/** Vrai si l'image a déjà une vraie transparence (au moins 1 % de pixels transparents). */
export function hasAlpha(img: Rgba): boolean {
  let transparent = 0;
  for (let i = 3; i < img.data.length; i += 4) if ((img.data[i] ?? 255) < 250) transparent++;
  return transparent > (img.width * img.height) / 100;
}

/**
 * Retire le fond magenta.
 * 1. Le fond est rempli depuis les bords (pixels proches du magenta, connexes) : les couleurs du sujet
 *    voisines du magenta (violet, rose) ne sont jamais touchées si elles ne sont pas reliées au fond.
 * 2. Le magenta presque pur enfermé dans le sujet est aussi retiré.
 * 3. Sur 2 px autour du fond, les pixels mélangés deviennent semi-transparents et perdent la teinte magenta.
 */
export function chromaKey(img: Rgba): Rgba {
  const { width: w, height: h } = img;
  const n = w * h;
  const out = Buffer.from(img.data);
  const dist = new Float32Array(n);
  for (let p = 0; p < n; p++) dist[p] = keyDistance(out[p * 4] ?? 0, out[p * 4 + 1] ?? 0, out[p * 4 + 2] ?? 0);

  const bg = new Uint8Array(n);
  const stack: number[] = [];
  const seed = (p: number) => {
    if (!bg[p] && (dist[p] ?? 999) < BG) {
      bg[p] = 1;
      stack.push(p);
    }
  };
  for (let x = 0; x < w; x++) {
    seed(x);
    seed((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    seed(y * w);
    seed(y * w + w - 1);
  }
  while (stack.length) {
    const p = stack.pop() ?? 0;
    const x = p % w;
    if (x > 0) seed(p - 1);
    if (x < w - 1) seed(p + 1);
    if (p >= w) seed(p - w);
    if (p < n - w) seed(p + w);
  }
  for (let p = 0; p < n; p++) if ((dist[p] ?? 999) < PURE) bg[p] = 1;

  // Zone de bord : pixels non-fond à moins de EDGE_WIDTH px du fond.
  let ring = bg;
  const edge = new Uint8Array(n);
  for (let pass = 0; pass < EDGE_WIDTH; pass++) {
    const next = new Uint8Array(ring);
    for (let p = 0; p < n; p++) {
      if (ring[p]) continue;
      const x = p % w;
      if (
        (x > 0 && ring[p - 1]) ||
        (x < w - 1 && ring[p + 1]) ||
        (p >= w && ring[p - w]) ||
        (p < n - w && ring[p + w])
      ) {
        next[p] = 1;
        edge[p] = 1;
      }
    }
    ring = next;
  }

  for (let p = 0; p < n; p++) {
    const i = p * 4;
    if (bg[p]) {
      out[i + 3] = 0;
      continue;
    }
    const d = dist[p] ?? 999;
    if (!edge[p] || d >= EDGE) continue;
    out[i + 3] = Math.round((out[i + 3] ?? 255) * Math.max(0, Math.min(1, (d - BG) / (EDGE - BG))));
    const r = out[i] ?? 0;
    const g = out[i + 1] ?? 0;
    const b = out[i + 2] ?? 0;
    const spill = Math.min(r, b) - g;
    if (spill > 0) {
      out[i] = r - spill;
      out[i + 2] = b - spill;
    }
  }
  return { data: out, width: w, height: h };
}

export interface Box {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** Boîte englobante des pixels visibles (alpha > seuil) ; null si l'image est vide. */
export function contentBox(img: Rgba, threshold = 16): Box | null {
  let minX = img.width;
  let minY = img.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if ((img.data[(y * img.width + x) * 4 + 3] ?? 0) > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** Taille minimale d'une forme isolée (part de l'image) : en dessous, poussière ignorée. */
const SPECK = 0.0002;

/**
 * Découpe une planche détourée en éléments : chaque forme visible (pixels connexes) est rattachée à la case
 * de la grille qui contient son centre, puis chaque case est recadrée sur ses seules formes.
 * Plus robuste qu'un découpage à la règle : un élément qui déborde de sa case n'est ni coupé ni mêlé au voisin.
 * Renvoie une image par case (ordre de lecture), null pour une case vide.
 */
export function splitSheet(img: Rgba, cols: number, rows: number, threshold = 16): (Rgba | null)[] {
  const { width: w, height: h } = img;
  const n = w * h;
  const label = new Int32Array(n).fill(-1);
  const comps: { cell: number; box: Box }[] = [];
  const stack: number[] = [];
  const visible = (p: number) => (img.data[p * 4 + 3] ?? 0) > threshold;
  for (let start = 0; start < n; start++) {
    if (label[start] !== -1 || !visible(start)) continue;
    const id = comps.length;
    let count = 0;
    let sx = 0;
    let sy = 0;
    let minX = w;
    let minY = h;
    let maxX = 0;
    let maxY = 0;
    label[start] = id;
    stack.push(start);
    while (stack.length) {
      const p = stack.pop() ?? 0;
      const x = p % w;
      const y = (p - x) / w;
      count++;
      sx += x;
      sy += y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w]) {
        if (q >= 0 && q < n && label[q] === -1 && visible(q)) {
          label[q] = id;
          stack.push(q);
        }
      }
    }
    const cx = Math.min(cols - 1, Math.floor(((sx / count) * cols) / w));
    const cy = Math.min(rows - 1, Math.floor(((sy / count) * rows) / h));
    const cell = count < n * SPECK ? -1 : cy * cols + cx;
    comps.push({ cell, box: { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 } });
  }

  return Array.from({ length: cols * rows }, (_, cell) => {
    const mine = comps.flatMap((c, i) => (c.cell === cell ? [i] : []));
    if (!mine.length) return null;
    const left = Math.min(...mine.map((i) => comps[i]?.box.left ?? w));
    const top = Math.min(...mine.map((i) => comps[i]?.box.top ?? h));
    const right = Math.max(...mine.map((i) => (comps[i]?.box.left ?? 0) + (comps[i]?.box.width ?? 0)));
    const bottom = Math.max(...mine.map((i) => (comps[i]?.box.top ?? 0) + (comps[i]?.box.height ?? 0)));
    const keep = new Set(mine);
    const out = Buffer.alloc((right - left) * (bottom - top) * 4);
    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        const p = y * w + x;
        const owner = label[p] ?? -1;
        // Pixels de la forme, et pixels presque transparents qui la bordent (liseré adouci).
        if (owner === -1 ? (img.data[p * 4 + 3] ?? 0) === 0 : !keep.has(owner)) continue;
        if (owner === -1 && !nearOwned(label, keep, p, w, n)) continue;
        Buffer.from(img.data.buffer, img.data.byteOffset + p * 4, 4).copy(
          out,
          ((y - top) * (right - left) + x - left) * 4,
        );
      }
    }
    return { data: out, width: right - left, height: bottom - top };
  });
}

function nearOwned(label: Int32Array, keep: ReadonlySet<number>, p: number, w: number, n: number): boolean {
  const x = p % w;
  for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w]) {
    if (q >= 0 && q < n && keep.has(label[q] ?? -1)) return true;
  }
  return false;
}

/** Cases d'une grille (colonnes × lignes) couvrant toute l'image. */
export function gridCells(width: number, height: number, cols: number, rows: number): Box[] {
  const cells: Box[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const left = Math.round((c * width) / cols);
      const top = Math.round((r * height) / rows);
      cells.push({
        left,
        top,
        width: Math.round(((c + 1) * width) / cols) - left,
        height: Math.round(((r + 1) * height) / rows) - top,
      });
    }
  }
  return cells;
}

export interface Report {
  /** Part de pixels entièrement transparents. */
  readonly transparent: number;
  /** Pixels visibles encore magenta (détourage raté). */
  readonly magentaLeft: number;
  /** Les 4 coins sont-ils transparents ? */
  readonly cornersClear: boolean;
}

/** Contrôle d'une image détourée. */
export function inspect(img: Rgba): Report {
  let transparent = 0;
  let magentaLeft = 0;
  const n = img.width * img.height;
  for (let i = 0; i < img.data.length; i += 4) {
    const a = img.data[i + 3] ?? 0;
    if (a === 0) transparent++;
    else if (a > 128 && keyDistance(img.data[i] ?? 0, img.data[i + 1] ?? 0, img.data[i + 2] ?? 0) < BG) magentaLeft++;
  }
  const alphaAt = (x: number, y: number) => img.data[(y * img.width + x) * 4 + 3] ?? 0;
  const w = img.width - 1;
  const h = img.height - 1;
  return {
    transparent: transparent / n,
    magentaLeft,
    cornersClear: [alphaAt(0, 0), alphaAt(w, 0), alphaAt(0, h), alphaAt(w, h)].every((a) => a === 0),
  };
}

/**
 * Débris de la case voisine (images découpées par le générateur) : formes qui touchent le bord de l'image
 * et sont petites devant la forme principale. Les éléments décoratifs détachés (étoiles, cœurs) ne
 * touchent pas le bord et sont gardés.
 */
export function dropEdgeScraps(img: Rgba, ratio = 0.05): Rgba {
  const { width: w, height: h } = img;
  const n = w * h;
  const label = new Int32Array(n).fill(-1);
  const sizes: number[] = [];
  const touches: boolean[] = [];
  const vis = (p: number) => (img.data[p * 4 + 3] ?? 0) > 8;
  const stack: number[] = [];
  for (let s = 0; s < n; s++) {
    if (label[s] !== -1 || !vis(s)) continue;
    const id = sizes.length;
    let count = 0;
    let edge = false;
    label[s] = id;
    stack.push(s);
    while (stack.length) {
      const p = stack.pop() ?? 0;
      const x = p % w;
      const y = (p - x) / w;
      count++;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge = true;
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w]) {
        if (q >= 0 && q < n && label[q] === -1 && vis(q)) {
          label[q] = id;
          stack.push(q);
        }
      }
    }
    sizes.push(count);
    touches.push(edge);
  }
  const biggest = Math.max(0, ...sizes);
  const out = Buffer.from(img.data);
  for (let p = 0; p < n; p++) {
    const id = label[p] ?? -1;
    if (id >= 0 && touches[id] && (sizes[id] ?? 0) < biggest * ratio) out[p * 4 + 3] = 0;
  }
  return { data: out, width: w, height: h };
}
