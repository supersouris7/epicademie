// @vitest-environment node
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { PLANNED_ASSETS } from '../../src/design/assets.ts';
import { chromaKey, contentBox, dropEdgeScraps, gridCells, hasAlpha, inspect, splitSheet, type Rgba } from './image.ts';
import { render } from './import.ts';

/** Sujet de test : disque violet et rose cerclé d'encre, sur fond magenta, anticrénelé. */
const SUBJECT = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <rect width="200" height="200" fill="#ff00ff"/>
  <circle cx="100" cy="100" r="60" fill="#7c4dff" stroke="#1d1238" stroke-width="8"/>
  <circle cx="100" cy="100" r="25" fill="#ff4fa0"/>
  <circle cx="100" cy="100" r="8" fill="#ff00ff"/>
</svg>`;

async function raster(svg: string): Promise<Rgba> {
  const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

const pixel = (img: Rgba, x: number, y: number) => [
  ...img.data.subarray((y * img.width + x) * 4, (y * img.width + x) * 4 + 4),
];

describe('détourage magenta', () => {
  it('retire le fond relié aux bords, garde violet et rose, retire le magenta pur enfermé', async () => {
    const img = await raster(SUBJECT);
    expect(hasAlpha(img)).toBe(false);
    const out = chromaKey(img);
    expect(pixel(out, 2, 2)[3]).toBe(0);
    expect(pixel(out, 100, 60)).toEqual([124, 77, 255, 255]); // violet intact
    expect(pixel(out, 100, 85)).toEqual([255, 79, 160, 255]); // rose intact
    expect(pixel(out, 100, 100)[3]).toBe(0); // magenta enfermé
    const report = inspect(out);
    expect(report.cornersClear).toBe(true);
    expect(report.magentaLeft).toBe(0);
    expect(contentBox(out)?.width).toBeGreaterThan(100);
  });

  it('les bords anticrénelés deviennent semi-transparents sans teinte magenta', async () => {
    const out = chromaKey(await raster(SUBJECT));
    let soft = 0;
    for (let i = 0; i < out.data.length; i += 4) {
      const a = out.data[i + 3] ?? 0;
      if (a > 0 && a < 255) {
        soft++;
        const [r = 0, g = 0, b = 0] = [out.data[i], out.data[i + 1], out.data[i + 2]];
        expect(Math.min(r, b) - g).toBeLessThanOrEqual(0);
      }
    }
    expect(soft).toBeGreaterThan(0);
  });
});

describe('planches', () => {
  it('découpe une grille sans trou ni chevauchement', () => {
    const cells = gridCells(1536, 1024, 3, 2);
    expect(cells).toHaveLength(6);
    expect(cells.reduce((s, c) => s + c.width * c.height, 0)).toBe(1536 * 1024);
    expect(cells[5]).toEqual({ left: 1024, top: 512, width: 512, height: 512 });
  });
});

describe('découpe par formes', () => {
  it('rattache un élément débordant à sa case et le sépare de son voisin', async () => {
    // Grille 2×1 de 200×100 : le rectangle de gauche déborde sur la moitié droite, son étincelle est détachée.
    const sheet = chromaKey(
      await raster(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
        <rect width="200" height="100" fill="#ff00ff"/>
        <rect x="10" y="20" width="110" height="60" fill="#7c4dff"/>
        <rect x="12" y="5" width="6" height="6" fill="#ffd23f"/>
        <circle cx="165" cy="50" r="25" fill="#3fc944"/>
      </svg>`),
    );
    const [left, right] = splitSheet(sheet, 2, 1);
    expect(left?.width).toBeGreaterThanOrEqual(110);
    expect(left?.height).toBeGreaterThanOrEqual(75);
    expect(right?.width).toBeLessThanOrEqual(52);
  });

  it('case sans élément : null', async () => {
    const sheet = chromaKey(
      await raster(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
        <rect width="200" height="100" fill="#ff00ff"/><circle cx="50" cy="50" r="30" fill="#3fc944"/>
      </svg>`),
    );
    expect(splitSheet(sheet, 2, 1)[1]).toBeNull();
  });
});

describe('rendu final', () => {
  it('icône : recadrée, centrée, aux dimensions finales, coins transparents', async () => {
    const asset = PLANNED_ASSETS.find((p) => p.kind === 'icon');
    if (!asset) throw new Error('aucune icône');
    const { webp, notes } = await render(asset, chromaKey(await raster(SUBJECT)));
    const meta = await sharp(webp).metadata();
    expect([meta.width, meta.height, meta.hasAlpha, meta.format]).toEqual([256, 256, true, 'webp']);
    expect(notes).toEqual([]);
  });

  it('signale une image sans transparence', async () => {
    const asset = PLANNED_ASSETS.find((p) => p.kind === 'icon');
    if (!asset) throw new Error('aucune icône');
    const plain = await raster(
      '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#3fc944"/></svg>',
    );
    const { notes } = await render(asset, plain);
    expect(notes).toContain('fond non détouré');
  });
});

describe('débris collés au bord', () => {
  it('retire une petite forme qui touche le bord, garde le sujet et les décors détachés', () => {
    const w = 20;
    const h = 20;
    const data = Buffer.alloc(w * h * 4);
    const set = (x: number, y: number) => (data[(y * w + x) * 4 + 3] = 255);
    for (let y = 4; y < 16; y++) for (let x = 4; x < 16; x++) set(x, y); // sujet 12×12
    set(0, 10); // débris au bord
    set(18, 2); // étoile détachée, loin du bord
    const out = dropEdgeScraps({ data, width: w, height: h });
    const alpha = (x: number, y: number) => out.data[(y * w + x) * 4 + 3];
    expect(alpha(0, 10)).toBe(0);
    expect(alpha(18, 2)).toBe(255);
    expect(alpha(10, 10)).toBe(255);
  });
});
