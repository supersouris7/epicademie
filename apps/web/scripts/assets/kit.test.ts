// @vitest-environment node
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { cells, cutSheet, HEAD_GRID, POSE_GRID, SHEET, template } from './kit.ts';

const ALEX = fileURLToPath(new URL('../../assets-src/originals/characters/alex', import.meta.url));

describe('kit de personnage', () => {
  it('grilles du gabarit : 6 cases de poses et 12 de têtes, sans trou ni chevauchement', () => {
    for (const g of [POSE_GRID, HEAD_GRID]) {
      const list = cells(g.cols, g.rows);
      expect(list).toHaveLength(g.cols * g.rows);
      expect(list.reduce((a, c) => a + c.w * c.h, 0)).toBe(SHEET.width * SHEET.height);
    }
  });

  it('le gabarit d’Alex se redécoupe en 6 poses et 12 têtes, sur fond transparent ou magenta', async () => {
    const t = await template(ALEX);
    expect(await sharp(t.poses).metadata()).toMatchObject({ width: 1536, height: 1024, hasAlpha: true });
    const magenta = await sharp({ create: { ...SHEET, channels: 3, background: '#ff00ff' } })
      .composite([{ input: t.heads }])
      .png()
      .toBuffer();
    for (const [sheet, grid] of [
      [t.poses, POSE_GRID],
      [t.heads, HEAD_GRID],
      [magenta, HEAD_GRID],
    ] as const) {
      const parts = await cutSheet(sheet, grid);
      expect(parts.filter(Boolean)).toHaveLength(grid.cols * grid.rows);
      for (const p of parts) {
        if (!p) throw new Error('case vide');
        const m = await sharp(p).metadata();
        expect(m.width).toBeGreaterThan(150);
        expect(m.height).toBeGreaterThan(150);
      }
    }
  }, 60_000);
});
