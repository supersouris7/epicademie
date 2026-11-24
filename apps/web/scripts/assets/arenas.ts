/**
 * Arènes : tire les 4 cadrages de chaque décor fourni par le client (originaux 16:9 dans
 * assets-src/originals/environments/arenas/<arène>.png) vers public/assets/environments/arenas.
 *
 * - plein cadre (16:9) : image entière, redimensionnée (Lanczos) ;
 * - portrait (9:10) : image pleine hauteur, rognée sur les côtés autour du point focal ;
 * - large (2,6:1) : bande centrée sur l'horizon et le sol ;
 * - panorama (4,4:1) : la bande large prolongée de chaque côté par miroir, flou progressif et
 *   assombrissement (bords harmonieux, aucun étirement).
 *
 * Usage : pnpm --filter @epicademie/web assets:arenas
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp, { type Sharp } from 'sharp';
import { ARENAS } from '../../src/design/bosses.ts';
import { ARENA_VARIANTS, KINDS } from '../../src/design/assets.ts';
import { availableFile } from './plan.ts';

const WEB = fileURLToPath(new URL('../../', import.meta.url));
const SRC = join(WEB, 'assets-src/originals/environments/arenas');
const OUT = join(WEB, 'public/assets/environments/arenas');
const AVAILABLE = join(WEB, 'src/design/assets.available.ts');
const QUALITY = 84;

const size = (suffix: string): readonly [number, number] => {
  const v = ARENA_VARIANTS.find((x) => x.suffix === suffix);
  if (!v) throw new Error(`variante inconnue ${suffix}`);
  return KINDS[v.kind].final;
};

/** Point focal horizontal (0..1) du cadrage portrait, selon l'élément emblématique du décor. */
const FOCUS_X: Record<string, number> = { jungle: 0.5, espace: 0.5, volcan: 0.5, glace: 0.5, academie: 0.5 };
/** Début (0..1) de la bande large : l'horizon et le sol restent dedans. */
const BAND_TOP = 0.24;

const lanczos = { kernel: 'lanczos3' } as const;

/** Prolonge `core` (RGB brut) de `ext` pixels de chaque côté : miroir, flou progressif, assombrissement. */
async function extend(core: Buffer, w: number, h: number, ext: number): Promise<Buffer> {
  const blurred = await sharp(core, { raw: { width: w, height: h, channels: 3 } })
    .blur(16)
    .raw()
    .toBuffer();
  const W = w + 2 * ext;
  const out = Buffer.alloc(W * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < W; x++) {
      let col = x - ext;
      let t = 0; // 0 : raccord avec l'image, 1 : bord extérieur
      if (x < ext) {
        col = Math.min(w - 1, ext - x);
        t = (ext - x) / ext;
      } else if (x >= ext + w) {
        col = Math.max(0, w - 1 - (x - (ext + w) + 1));
        t = (x - (ext + w) + 1) / ext;
      }
      const k = t * t * (3 - 2 * t); // lissage du fondu
      const dark = 1 - 0.5 * k;
      const o = (y * W + x) * 3;
      const s = (y * w + col) * 3;
      for (let c = 0; c < 3; c++) {
        const sharpV = core[s + c] ?? 0;
        const blurV = blurred[s + c] ?? 0;
        out[o + c] = Math.round((sharpV * (1 - k) + blurV * k) * dark);
      }
    }
  }
  return out;
}

async function render(id: string) {
  const file = join(SRC, `${id}.png`);
  const input = readFileSync(file);
  const meta = await sharp(input).metadata();
  const W = meta.width;
  const H = meta.height;
  const save = (suffix: string, img: Sharp) =>
    img.webp({ quality: QUALITY, effort: 5 }).toFile(join(OUT, `${id}${suffix}.webp`));

  // Plein cadre
  const [bw, bh] = size('');
  await save('', sharp(input).resize(bw, bh, { fit: 'cover', ...lanczos }));

  // Portrait : pleine hauteur, rognée autour du point focal
  const [pw, ph] = size('-portrait');
  const cw = Math.round(H * (pw / ph));
  const left = Math.round(Math.min(Math.max((FOCUS_X[id] ?? 0.5) * W - cw / 2, 0), W - cw));
  await save('-portrait', sharp(input).extract({ left, top: 0, width: cw, height: H }).resize(pw, ph, lanczos));

  // Large : bande sur l'horizon et le sol
  const [lw, lh] = size('-large');
  const bandH = Math.round(W * (lh / lw));
  const top = Math.round(Math.min(BAND_TOP * H, H - bandH));
  const band = sharp(input).extract({ left: 0, top, width: W, height: bandH });
  await save('-large', band.clone().resize(lw, lh, lanczos));

  // Panorama : bande large à la hauteur finale, prolongée de chaque côté
  const [nw, nh] = size('-pano');
  const coreW = Math.round(nh * (lw / lh));
  const core = await band.clone().resize(coreW, nh, lanczos).removeAlpha().raw().toBuffer();
  const ext = Math.floor((nw - coreW) / 2);
  const wide = await extend(core, coreW, nh, ext);
  const outW = coreW + 2 * ext;
  await save('-pano', sharp(wide, { raw: { width: outW, height: nh, channels: 3 } }).resize(nw, nh, { fit: 'fill' }));
}

mkdirSync(OUT, { recursive: true });
for (const id of ARENAS) {
  await render(id);
  console.log(`arène ${id} : 4 cadrages`);
}
writeFileSync(AVAILABLE, availableFile());
