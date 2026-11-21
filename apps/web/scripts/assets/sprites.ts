/**
 * Personnages v2 (planches fournies le 20/11/2026, déjà détourées) : découpe en images fixes
 * (poses, têtes, portrait) et en bandes d'animation (8 images côte à côte, même cadre pour
 * chaque image afin que le personnage ne « saute » pas d'une image à l'autre).
 *
 *   pnpm --filter @questeo/web assets:sprites
 *
 * Nettoyage : le voile semi-transparent laissé par le détourage (fond dégradé) est retiré ;
 * pour la course de Lina, seule la silhouette est gardée (fumée blanche retirée, décision du
 * 20/11/2026).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { contentBox, dropEdgeScraps, gridCells, type Box, type Rgba } from './image.ts';

const BOARDS = fileURLToPath(new URL('../../assets-src/planches-v2/', import.meta.url));
const PUBLIC = fileURLToPath(new URL('../../public/assets/', import.meta.url));

/** En dessous de cette opacité, un pixel est du voile de détourage : retiré. */
const MIN_ALPHA = 96;
/** Marge autour du personnage, en pixels de la planche. */
const MARGIN = 6;

export interface StillJob {
  readonly kind: 'stills';
  readonly board: string;
  readonly cols: number;
  readonly rows: number;
  /** Un chemin par case (relatif à public/assets, sans extension), « - » pour ignorer. */
  readonly targets: readonly string[];
  /** Plus grand côté de l'image produite. */
  readonly size: number;
  /** Cases dont on ne garde que la plus grande forme (effets séparés retirés). */
  readonly silhouetteOnly?: readonly number[];
  /** Retourner en miroir (le boss, dessiné tourné vers la droite, doit regarder le héros à sa gauche). */
  readonly mirror?: boolean;
  /**
   * Toutes les images dans le même cadre (le plus grand), pieds sur la même ligne et centrées :
   * même échelle d'une pose à l'autre (sinon une pose large paraît plus petite).
   */
  readonly sameFrame?: boolean;
}

export interface AnimJob {
  readonly kind: 'anim';
  readonly board: string;
  readonly cols: number;
  readonly rows: number;
  readonly target: string;
  /** Hauteur d'une image de l'animation. */
  readonly height: number;
  /** Opacité minimale gardée (voile de détourage plus marqué sur certaines planches). */
  readonly minAlpha?: number;
  /** Retourner en miroir chaque image. */
  readonly mirror?: boolean;
}

export type Job = StillJob | AnimJob;

const ALEX_HEADS = [
  'confiant',
  'rire',
  'enthousiaste',
  'joie',
  'determine',
  'clin-oeil',
  'surprise',
  'reflexion',
  'affection',
  'colere',
  'triste',
  'etourdi',
];
const LINA_HEADS = [
  'joie',
  'rire',
  'enthousiaste',
  'confiant',
  'determine',
  'clin-oeil',
  'surprise',
  'reflexion',
  'affection',
  'colere',
  'triste',
  'etourdi',
];
/** Têtes du Sorcier π : six calmes (yeux bleus), puis six en rage (yeux rouges). */
const SORCIER_HEADS = [
  'menace',
  'concentre',
  'surprise',
  'moqueur',
  'perplexe',
  'colere',
  'inquiet',
  'rage-menace',
  'rage-surprise',
  'furieux',
  'rage-cri',
  'rage-plisse',
];

/** Coffres : 4 raretés fermées (1re rangée), les mêmes ouvertes (2e rangée). */
const CHESTS = ['commun', 'rare', 'epique', 'legendaire'];

export const JOBS: readonly Job[] = [
  {
    kind: 'stills',
    board: 'coffres.png',
    cols: 4,
    rows: 2,
    size: 512,
    targets: [...CHESTS.map((c) => `rewards/chests/${c}`), ...CHESTS.map((c) => `rewards/chests/${c}-ouvert`)],
  },
  {
    kind: 'anim',
    board: 'alex-anim-attente.png',
    cols: 4,
    rows: 2,
    target: 'characters/alex/anim-idle',
    height: 512,
    // Voile gris entre les jambes : seuls les pixels presque opaques sont gardés.
    minAlpha: 230,
  },
  {
    kind: 'anim',
    board: 'alex-anim-victoire.png',
    cols: 4,
    rows: 2,
    target: 'characters/alex/anim-victory',
    height: 512,
  },
  {
    kind: 'stills',
    board: 'alex-poses.png',
    sameFrame: true,
    cols: 3,
    rows: 2,
    size: 640,
    targets: ['run', 'shoot', 'shield', 'hurt', 'defeat'].map((p) => `characters/alex/pose-${p}`),
  },
  {
    kind: 'stills',
    board: 'alex-tetes.png',
    cols: 4,
    rows: 3,
    size: 320,
    targets: ALEX_HEADS.map((h) => `characters/alex/head-${h}`),
  },
  { kind: 'anim', board: 'lina-anim-attente.png', cols: 4, rows: 2, target: 'characters/lina/anim-idle', height: 512 },
  {
    kind: 'anim',
    board: 'lina-anim-victoire.png',
    cols: 4,
    rows: 2,
    target: 'characters/lina/anim-victory',
    height: 512,
  },
  {
    kind: 'stills',
    board: 'lina-poses.png',
    sameFrame: true,
    cols: 3,
    rows: 2,
    size: 640,
    targets: ['run', 'shoot', 'shield', 'hurt', 'defeat'].map((p) => `characters/lina/pose-${p}`),
    silhouetteOnly: [0],
  },
  {
    kind: 'stills',
    board: 'lina-tetes.png',
    cols: 4,
    rows: 3,
    size: 320,
    targets: LINA_HEADS.map((h) => `characters/lina/head-${h}`),
  },
  {
    kind: 'anim',
    board: 'sorcier-pi-anim-attente.png',
    cols: 4,
    rows: 2,
    mirror: true,
    target: 'bosses/sorcier-pi/anim-idle',
    height: 512,
  },
  {
    kind: 'stills',
    board: 'sorcier-pi-poses.png',
    sameFrame: true,
    cols: 4,
    rows: 2,
    size: 640,
    mirror: true,
    targets: ['idle', 'attack', 'shield', 'hurt', 'defeat', 'cast', 'charge', 'victory'].map(
      (p) => `bosses/sorcier-pi/pose-${p}`,
    ),
  },
  {
    kind: 'stills',
    board: 'sorcier-pi-tetes.png',
    cols: 4,
    rows: 3,
    size: 320,
    mirror: true,
    targets: SORCIER_HEADS.map((h) => `bosses/sorcier-pi/head-${h}`),
  },
  {
    kind: 'stills',
    board: 'sorcier-pi-portrait.png',
    cols: 1,
    rows: 1,
    size: 640,
    mirror: true,
    targets: ['bosses/sorcier-pi/portrait'],
  },
];

async function load(file: string): Promise<Rgba> {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Voile de détourage retiré : opacité faible → transparent. */
export function clean(img: Rgba, min = MIN_ALPHA): Rgba {
  const data = Buffer.from(img.data);
  for (let i = 3; i < data.length; i += 4) if ((data[i] ?? 0) < min) data[i] = 0;
  return { ...img, data };
}

export function crop(img: Rgba, box: Box): Rgba {
  const data = Buffer.alloc(box.width * box.height * 4);
  for (let y = 0; y < box.height; y++) {
    const sy = box.top + y;
    if (sy < 0 || sy >= img.height) continue;
    for (let x = 0; x < box.width; x++) {
      const sx = box.left + x;
      if (sx < 0 || sx >= img.width) continue;
      const s = (sy * img.width + sx) * 4;
      const d = (y * box.width + x) * 4;
      for (let k = 0; k < 4; k++) data[d + k] = img.data[s + k] ?? 0;
    }
  }
  return { data, width: box.width, height: box.height };
}

/**
 * Ne garde que la silhouette : la plus grande forme de pixels opaques (alpha ≥ 200), élargie de
 * quelques pixels pour garder le contour adouci. Un effet relié au personnage seulement par une
 * lueur légère (la fumée de la course de Lina) est ainsi retiré.
 */
export function largestShape(img: Rgba, solid = 200, grow = 4): Rgba {
  const { width: w, height: h } = img;
  const label = new Int32Array(w * h).fill(-1);
  const sizes: number[] = [];
  const stack: number[] = [];
  const isSolid = (p: number) => (img.data[p * 4 + 3] ?? 0) >= solid;
  for (let p = 0; p < w * h; p++) {
    if (label[p] !== -1 || !isSolid(p)) continue;
    const id = sizes.length;
    let size = 0;
    label[p] = id;
    stack.push(p);
    while (stack.length) {
      const q = stack.pop() ?? 0;
      size++;
      const x = q % w;
      const y = (q - x) / w;
      for (const r of [x > 0 ? q - 1 : -1, x < w - 1 ? q + 1 : -1, y > 0 ? q - w : -1, y < h - 1 ? q + w : -1]) {
        if (r >= 0 && label[r] === -1 && isSolid(r)) {
          label[r] = id;
          stack.push(r);
        }
      }
    }
    sizes.push(size);
  }
  const keep = sizes.indexOf(Math.max(...sizes));
  // Masque : la forme gardée, élargie de `grow` pixels (contour adouci conservé).
  const mask = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) if (label[p] === keep) mask[p] = 1;
  for (let k = 0; k < grow; k++) {
    const next = mask.slice();
    for (let p = 0; p < w * h; p++) {
      if (mask[p]) continue;
      const x = p % w;
      if ((x > 0 && mask[p - 1]) || (x < w - 1 && mask[p + 1]) || mask[p - w] || mask[p + w]) next[p] = 1;
    }
    mask.set(next);
  }
  const data = Buffer.from(img.data);
  for (let p = 0; p < w * h; p++) if (!mask[p]) data[p * 4 + 3] = 0;
  return { ...img, data };
}

const withMargin = (box: Box, img: Rgba): Box => {
  const left = Math.max(0, box.left - MARGIN);
  const top = Math.max(0, box.top - MARGIN);
  return {
    left,
    top,
    width: Math.min(img.width, box.left + box.width + MARGIN) - left,
    height: Math.min(img.height, box.top + box.height + MARGIN) - top,
  };
};

async function writeWebp(img: Rgba, target: string, resize: { width?: number; height?: number }, mirror = false) {
  const dest = join(PUBLIC, `${target}.webp`);
  mkdirSync(dirname(dest), { recursive: true });
  await sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } })
    .resize({ ...resize, fit: 'inside', withoutEnlargement: true })
    .flop(mirror)
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(dest);
  return dest;
}

/** Image posée en bas au centre d'un cadre transparent `width` × `height`. */
export function placeBottom(img: Rgba, width: number, height: number): Rgba {
  const data = Buffer.alloc(width * height * 4);
  const left = Math.floor((width - img.width) / 2);
  const top = height - img.height;
  for (let y = 0; y < img.height; y++) {
    const from = y * img.width * 4;
    data.set(img.data.subarray(from, from + img.width * 4), ((top + y) * width + left) * 4);
  }
  return { data, width, height };
}

async function stills(job: StillJob): Promise<string[]> {
  const board = clean(await load(join(BOARDS, job.board)));
  const cells = gridCells(board.width, board.height, job.cols, job.rows);
  const parts: { target: string; img: Rgba }[] = [];
  for (const [i, target] of job.targets.entries()) {
    const cellBox = cells[i];
    if (target === '-' || !cellBox) continue;
    // Débord d'une case voisine (lueur, objet lancé) retiré.
    let cell = dropEdgeScraps(crop(board, cellBox));
    if (job.silhouetteOnly?.includes(i)) cell = largestShape(cell);
    const box = contentBox(cell, 0);
    if (!box) throw new Error(`${job.board} : case ${i + 1} vide (${target})`);
    parts.push({ target, img: crop(cell, withMargin(box, cell)) });
  }
  if (job.sameFrame) {
    const width = Math.max(...parts.map((p) => p.img.width));
    const height = Math.max(...parts.map((p) => p.img.height));
    for (const p of parts) p.img = placeBottom(p.img, width, height);
  }
  const out: string[] = [];
  for (const { target, img } of parts) {
    out.push(await writeWebp(img, target, { width: job.size, height: job.size }, job.mirror));
  }
  return out;
}

/** Animations produites : nombre d'images et taille d'une image (écrit dans sprites.generated.ts). */
const ANIMS: Record<string, { frames: number; width: number; height: number }> = {};

/** Bande d'animation : toutes les images recadrées sur la même boîte (union), côte à côte. */
async function anim(job: AnimJob): Promise<string> {
  const board = clean(await load(join(BOARDS, job.board)), job.minAlpha);
  const cells = gridCells(board.width, board.height, job.cols, job.rows).map((b) => dropEdgeScraps(crop(board, b)));
  const boxes = cells.map((c) => contentBox(c, 0)).filter((b): b is Box => b !== null);
  if (boxes.length !== cells.length) throw new Error(`${job.board} : image vide`);
  const left = Math.min(...boxes.map((b) => b.left));
  const top = Math.min(...boxes.map((b) => b.top));
  const union: Box = {
    left,
    top,
    width: Math.max(...boxes.map((b) => b.left + b.width)) - left,
    height: Math.max(...boxes.map((b) => b.top + b.height)) - top,
  };
  const frames = cells.map((c) => crop(c, withMargin(union, c)));
  const fw = frames[0]?.width ?? 0;
  const fh = frames[0]?.height ?? 0;
  // Taille exacte de chaque image (entière) : l'animation avance d'une largeur fixe.
  const height = Math.min(job.height, fh);
  const width = Math.round((fw * height) / fh);
  const resized = await Promise.all(
    frames.map((f) =>
      sharp(f.data, { raw: { width: f.width, height: f.height, channels: 4 } })
        .resize({ width, height, fit: 'fill' })
        .flop(job.mirror ?? false)
        .png()
        .toBuffer(),
    ),
  );
  const dest = join(PUBLIC, `${job.target}.webp`);
  mkdirSync(dirname(dest), { recursive: true });
  await sharp({
    create: { width: width * frames.length, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(resized.map((input, k) => ({ input, left: k * width, top: 0 })))
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(dest);
  ANIMS[job.target] = { frames: frames.length, width, height };
  return dest;
}

const GENERATED = fileURLToPath(new URL('../../src/design/sprites.generated.ts', import.meta.url));

export async function run(jobs: readonly Job[] = JOBS): Promise<string[]> {
  const out: string[] = [];
  for (const job of jobs) {
    if (job.kind === 'anim') out.push(await anim(job));
    else out.push(...(await stills(job)));
  }
  const entries = Object.entries(ANIMS)
    .sort(([x], [y]) => x.localeCompare(y))
    .map(([k, v]) => `  '${k}': { frames: ${v.frames}, width: ${v.width}, height: ${v.height} },`);
  writeFileSync(
    GENERATED,
    `// Fichier généré par scripts/assets/sprites.ts (pnpm --filter @questeo/web assets:sprites) : ne pas modifier.\n\n/** Bandes d'animation : nombre d'images et taille d'une image, en pixels. */\nexport const SPRITE_ANIMS: Readonly<Record<string, { frames: number; width: number; height: number }>> = {\n${entries.join('\n')}\n};\n`,
  );
  out.push(GENERATED);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const f of await run()) console.log(`✓ ${f.replace(PUBLIC, '')}`);
}
