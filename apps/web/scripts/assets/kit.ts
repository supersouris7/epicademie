/**
 * Kit de personnage (héros, boss, mob) : deux planches 1536×1024 au même gabarit pour tous.
 *
 * - Planche « poses » : 6 poses en pied, grille 3 × 2 (cases de 512 × 512), pieds sur une ligne de
 *   sol commune, même échelle partout.
 * - Planche « têtes » : 12 expressions, grille 4 × 3 (cases de 384 × 341), même échelle partout.
 *
 * `pnpm assets:kit gabarit` fabrique le gabarit à partir d'Alex (docs/chatgpt/gabarit/), à joindre à
 * ChatGPT ; `pnpm assets:kit decouper <poses.png> <tetes.png> <héros|ennemi> <dossier>` découpe les
 * planches livrées en originaux individuels détourés.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromaKey, contentBox, dropEdgeScraps, hasAlpha, type Rgba } from './image.ts';

export const SHEET = { width: 1536, height: 1024 } as const;
export const POSE_GRID = { cols: 3, rows: 2 } as const;
export const HEAD_GRID = { cols: 4, rows: 3 } as const;
/** Zone utile d'une case (le reste est une marge de sécurité) et ligne de sol des poses. */
export const SAFE = 0.84;
export const GROUND = 0.92;

export type Role = 'heros' | 'ennemi';

/** Cases dans l'ordre de lecture (gauche → droite, haut → bas) : [identifiant, libellé]. */
export const POSES: Record<Role, readonly (readonly [string, string])[]> = {
  heros: [
    ['idle', 'attente'],
    ['run', 'course'],
    ['shoot', 'tir (vers la droite)'],
    ['shield', 'bouclier'],
    ['jump', 'saut'],
    ['victory', 'victoire'],
  ],
  ennemi: [
    ['idle', 'attente'],
    ['attack', 'attaque (vers la gauche)'],
    ['shield', 'bouclier'],
    ['summon', 'invocation'],
    ['hurt', 'touché'],
    ['ko', 'KO'],
  ],
};

export const HEADS: Record<Role, readonly (readonly [string, string])[]> = {
  heros: [
    ['joie', 'joie'],
    ['rire', 'rire'],
    ['enthousiaste', 'enthousiaste'],
    ['confiant', 'confiant'],
    ['determine', 'déterminé'],
    ['clin-oeil', 'clin d’œil'],
    ['surprise', 'surprise'],
    ['reflexion', 'réflexion'],
    ['affection', 'affection'],
    ['colere', 'colère'],
    ['triste', 'triste'],
    ['etourdi', 'étourdi'],
  ],
  ennemi: [
    ['menace', 'menaçant'],
    ['moqueur', 'moqueur'],
    ['colere', 'colère'],
    ['surprise', 'surprise'],
    ['perplexe', 'perplexe'],
    ['rire', 'rire'],
    ['clin-oeil', 'clin d’œil'],
    ['inquiet', 'inquiet'],
    ['triste', 'triste'],
    ['furieux', 'furieux'],
    ['amour', 'amour'],
    ['ko', 'KO'],
  ],
};

interface Cell {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** Cases d'une grille (bords arrondis au pixel, sans trou ni chevauchement). */
export function cells(cols: number, rows: number): Cell[] {
  const out: Cell[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = Math.round((c * SHEET.width) / cols);
      const y = Math.round((r * SHEET.height) / rows);
      out.push({
        x,
        y,
        w: Math.round(((c + 1) * SHEET.width) / cols) - x,
        h: Math.round(((r + 1) * SHEET.height) / rows) - y,
      });
    }
  return out;
}

/**
 * Original nettoyé et rogné : sans les débris de la case voisine collés au bord, ni les poussières
 * éloignées du personnage (on garde ses effets : éclairs, cœurs, étoiles).
 */
async function trimmed(file: string) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const img = dropEdgeScraps({ data, width: info.width, height: info.height });
  const { label, list } = blobs(img);
  const first = list[0];
  if (!first) throw new Error(`Image vide : ${file}`);
  const main = list.reduce((a, b) => (b.n > a.n ? b : a), first);
  const mx = (main.maxX - main.minX) * 0.06;
  const my = (main.maxY - main.minY) * 0.06;
  const keep = new Set(
    list
      .filter(
        (b) =>
          b.n >= main.n * 0.02 ||
          (b.maxX >= main.minX - mx &&
            b.minX <= main.maxX + mx &&
            b.maxY >= main.minY - my &&
            b.minY <= main.maxY + my),
      )
      .map((b) => b.id),
  );
  const out = Buffer.from(img.data);
  for (let p = 0; p < label.length; p++) {
    const l = label[p] ?? -1;
    if (l >= 0 && !keep.has(l)) out[p * 4 + 3] = 0;
  }
  const clean: Rgba = { data: out, width: img.width, height: img.height };
  const box = contentBox(clean);
  if (!box) throw new Error(`Image vide : ${file}`);
  return sharp(out, { raw: { width: img.width, height: img.height, channels: 4 } }).extract(box);
}

/**
 * Planche d'un gabarit : chaque image est rognée, mise à la même échelle que les autres (la plus
 * grande remplit la zone utile), centrée dans sa case ; posée sur la ligne de sol si `ground`.
 */
async function sheet(files: readonly string[], grid: { cols: number; rows: number }, ground: boolean) {
  const parts = await Promise.all(files.map(async (f) => (await trimmed(f)).png().toBuffer()));
  const sizes = await Promise.all(parts.map(async (p) => sharp(p).metadata()));
  const grid0 = cells(grid.cols, grid.rows);
  const cw = Math.min(...grid0.map((c) => c.w)) * SAFE;
  const ch = Math.min(...grid0.map((c) => c.h)) * SAFE;
  const scale = Math.min(...sizes.map((s) => Math.min(cw / s.width, ch / s.height)));
  const layers = await Promise.all(
    parts.map(async (p, i) => {
      const s = sizes[i];
      const cell = grid0[i];
      if (!s || !cell) throw new Error('case manquante');
      const w = Math.round(s.width * scale);
      const h = Math.round(s.height * scale);
      const top = ground ? Math.round(cell.y + cell.h * GROUND - h) : Math.round(cell.y + (cell.h - h) / 2);
      return {
        input: await sharp(p).resize(w, h).png().toBuffer(),
        left: Math.round(cell.x + (cell.w - w) / 2),
        top,
      };
    }),
  );
  return sharp({ create: { ...SHEET, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(layers)
    .png()
    .toBuffer();
}

/** Copie annotée : fond sombre, grille, zone utile, ligne de sol et nom de chaque case. */
async function annotate(
  clean: Buffer,
  grid: { cols: number; rows: number },
  labels: readonly string[],
  ground: boolean,
) {
  const lines = cells(grid.cols, grid.rows)
    .map((c, i) => {
      const mx = (c.w * (1 - SAFE)) / 2;
      const my = (c.h * (1 - SAFE)) / 2;
      const g = c.y + c.h * GROUND;
      return [
        `<rect x="${c.x + 0.5}" y="${c.y + 0.5}" width="${c.w - 1}" height="${c.h - 1}" fill="none" stroke="#ffc83d" stroke-width="2"/>`,
        `<rect x="${c.x + mx}" y="${c.y + my}" width="${c.w - 2 * mx}" height="${c.h - 2 * my}" fill="none" stroke="#1ec8f2" stroke-width="1.5" stroke-dasharray="8 6"/>`,
        ground
          ? `<line x1="${c.x + 6}" x2="${c.x + c.w - 6}" y1="${g}" y2="${g}" stroke="#3fc944" stroke-width="2" stroke-dasharray="4 4"/>`
          : '',
        `<rect x="${c.x + 6}" y="${c.y + 6}" width="${Math.min(c.w - 12, 14 + 9.5 * (labels[i]?.length ?? 0))}" height="26" rx="6" fill="#1d1238" opacity="0.85"/>`,
        `<text x="${c.x + 13}" y="${c.y + 25}" font-family="DejaVu Sans, Arial, sans-serif" font-size="16" font-weight="700" fill="#fff3dd">${labels[i] ?? ''}</text>`,
      ].join('');
    })
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SHEET.width}" height="${SHEET.height}">${lines}</svg>`;
  return sharp({ create: { ...SHEET, channels: 4, background: '#2b2440' } })
    .composite([{ input: clean }, { input: Buffer.from(svg) }])
    .png()
    .toBuffer();
}

/** Gabarit à partir des originaux d'Alex (assets-src/originals/characters/alex). */
export async function template(alexDir: string) {
  const poses = POSES.heros.map(([id]) => join(alexDir, `pose-${id}.png`));
  const heads = HEADS.heros.map(([id]) => join(alexDir, `head-${id}.png`));
  const posesClean = await sheet(poses, POSE_GRID, true);
  const headsClean = await sheet(heads, HEAD_GRID, false);
  const label = (list: readonly (readonly [string, string])[]) =>
    list.map(([id, name], i) => `${i + 1} · ${name}${name === id ? '' : ` (${id})`}`);
  return {
    poses: posesClean,
    heads: headsClean,
    posesAnnotated: await annotate(posesClean, POSE_GRID, label(POSES.heros), true),
    headsAnnotated: await annotate(headsClean, HEAD_GRID, label(HEADS.heros), false),
  };
}

// ——— Découpage d'une planche livrée ———

interface Blob {
  readonly id: number;
  n: number;
  sx: number;
  sy: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Composantes connexes des pixels visibles (alpha > seuil). */
function blobs(img: Rgba, threshold = 24) {
  const { data, width: W, height: H } = img;
  const label = new Int32Array(W * H).fill(-1);
  const list: Blob[] = [];
  const stack: number[] = [];
  for (let p = 0; p < W * H; p++) {
    if (label[p] !== -1 || (data[p * 4 + 3] ?? 0) <= threshold) continue;
    const b: Blob = { id: list.length, n: 0, sx: 0, sy: 0, minX: W, minY: H, maxX: -1, maxY: -1 };
    label[p] = b.id;
    stack.push(p);
    while (stack.length) {
      const q = stack.pop() ?? 0;
      const x = q % W;
      const y = (q - x) / W;
      b.n++;
      b.sx += x;
      b.sy += y;
      b.minX = Math.min(b.minX, x);
      b.maxX = Math.max(b.maxX, x);
      b.minY = Math.min(b.minY, y);
      b.maxY = Math.max(b.maxY, y);
      for (const r of [q - 1, q + 1, q - W, q + W]) {
        if (r < 0 || r >= W * H || label[r] !== -1) continue;
        if ((r === q - 1 && x === 0) || (r === q + 1 && x === W - 1)) continue;
        if ((data[r * 4 + 3] ?? 0) > threshold) {
          label[r] = b.id;
          stack.push(r);
        }
      }
    }
    list.push(b);
  }
  return { label, list };
}

/**
 * Découpe une planche en cases : chaque forme (personnage, effet, débris) va à la case qui contient
 * son centre, même si elle déborde un peu ; les poussières sont ignorées. Renvoie une image détourée
 * par case (null si la case est vide).
 */
export async function cutSheet(
  file: string | Buffer,
  grid: { cols: number; rows: number },
): Promise<(Buffer | null)[]> {
  const { data, info } = await sharp(file)
    .resize(SHEET.width, SHEET.height, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const raw: Rgba = { data, width: info.width, height: info.height };
  const img = hasAlpha(raw) ? raw : chromaKey(raw);
  const { label, list } = blobs(img);
  const grid0 = cells(grid.cols, grid.rows);
  const minArea = 0.0005 * (grid0[0]?.w ?? 1) * (grid0[0]?.h ?? 1);
  const owner = new Map<number, number>();
  for (const b of list) {
    if (b.n < minArea) continue;
    const cx = b.sx / b.n;
    const cy = b.sy / b.n;
    const i = grid0.findIndex((c) => cx >= c.x && cx < c.x + c.w && cy >= c.y && cy < c.y + c.h);
    if (i >= 0) owner.set(b.id, i);
  }
  const W = img.width;
  return Promise.all(
    grid0.map(async (_, i) => {
      const mine = list.filter((b) => owner.get(b.id) === i);
      if (!mine.length) return null;
      const x0 = Math.min(...mine.map((b) => b.minX));
      const y0 = Math.min(...mine.map((b) => b.minY));
      const w = Math.max(...mine.map((b) => b.maxX)) - x0 + 1;
      const h = Math.max(...mine.map((b) => b.maxY)) - y0 + 1;
      const ids = new Set(mine.map((b) => b.id));
      const out = Buffer.alloc(w * h * 4);
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const p = (y0 + y) * W + x0 + x;
          const l = label[p] ?? -1;
          // Pixels des formes de la case, plus le léger anticrénelage collé à elles.
          const near =
            l === -1 &&
            (img.data[p * 4 + 3] ?? 0) > 0 &&
            [p - 1, p + 1, p - W, p + W].some((r) => ids.has(label[r] ?? -1));
          if (ids.has(l) || near) out.set(img.data.subarray(p * 4, p * 4 + 4), (y * w + x) * 4);
        }
      return sharp(out, { raw: { width: w, height: h, channels: 4 } })
        .png()
        .toBuffer();
    }),
  );
}

/** Découpe les deux planches d'un personnage en pose-<état>.png et head-<expression>.png. */
export async function cutKit(posesFile: string | Buffer, headsFile: string | Buffer, role: Role, outDir: string) {
  mkdirSync(outDir, { recursive: true });
  const written: string[] = [];
  const missing: string[] = [];
  for (const [file, grid, names, prefix] of [
    [posesFile, POSE_GRID, POSES[role], 'pose'],
    [headsFile, HEAD_GRID, HEADS[role], 'head'],
  ] as const) {
    const parts = await cutSheet(file, grid);
    for (const [i, [id]] of names.entries()) {
      const part = parts[i];
      const dest = join(outDir, `${prefix}-${id}.png`);
      if (!part) {
        missing.push(`${prefix}-${id}`);
        continue;
      }
      writeFileSync(dest, part);
      written.push(dest);
    }
  }
  return { written, missing };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, ...args] = process.argv.slice(2);
  const web = fileURLToPath(new URL('../../', import.meta.url));
  if (cmd === 'gabarit') {
    const out = join(web, '../../docs/chatgpt/gabarit');
    mkdirSync(out, { recursive: true });
    const t = await template(join(web, 'assets-src/originals/characters/alex'));
    writeFileSync(join(out, 'gabarit-poses.png'), t.poses);
    writeFileSync(join(out, 'gabarit-tetes.png'), t.heads);
    writeFileSync(join(out, 'gabarit-poses-annote.png'), t.posesAnnotated);
    writeFileSync(join(out, 'gabarit-tetes-annote.png'), t.headsAnnotated);
    console.log(`Gabarit écrit dans ${out}`);
  } else if (cmd === 'decouper') {
    const [poses, heads, role, dir] = args;
    if (!poses || !heads || (role !== 'heros' && role !== 'ennemi') || !dir) {
      console.error('Usage : assets:kit decouper <poses.png> <tetes.png> <heros|ennemi> <dossier de sortie>');
      process.exit(1);
    }
    const { written, missing } = await cutKit(poses, heads, role, dir);
    for (const f of written) console.log(`✓ ${f}`);
    for (const m of missing) console.log(`✗ case vide : ${m}`);
    if (missing.length) process.exit(1);
  } else {
    console.error('Usage : assets:kit gabarit | assets:kit decouper <poses.png> <tetes.png> <heros|ennemi> <dossier>');
    process.exit(1);
  }
}
