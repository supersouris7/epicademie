import { describe, expect, it } from 'vitest';
import { GRID, MOODS, MOOD_IDS, litPixels } from './moods.ts';

describe('humeurs de Questy', () => {
  it.each(MOOD_IDS)('%s : motif valide, dans le cercle de l’écran', (id) => {
    const mood = MOODS[id];
    expect(mood.pixels.length).toBeLessThanOrEqual(GRID);
    for (const row of mood.pixels) {
      expect(row).toMatch(/^[.#]+$/);
      expect(row.length).toBeLessThanOrEqual(GRID);
    }
    const pixels = litPixels(mood);
    expect(pixels.length).toBeGreaterThan(0);
    const pitch = 100 / GRID;
    for (const [x, y] of pixels) {
      // Centre du pixel à moins de 45 unités du centre (écran de rayon 48).
      const d = Math.hypot((x + 0.5) * pitch - 50, (y + 0.5) * pitch - 50);
      expect(d, `${id} pixel (${x},${y})`).toBeLessThan(44);
    }
  });
  it('toutes les humeurs ont une couleur distincte par paire (lueur, écran)', () => {
    const keys = MOOD_IDS.map((id) => `${MOODS[id].glow}/${MOODS[id].screen}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
