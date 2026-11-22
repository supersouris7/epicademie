import { describe, expect, it } from 'vitest';
import { ARENAS } from '../../design/bosses.ts';
import { AVAILABLE } from '../../design/assets.available.ts';
import { ARENA_VARIANTS } from '../../design/assets.ts';
import { isExtended, pickArena, pickArenaVariant, STAGE_MAX_RATIO } from './arena.ts';

const all = (id: string) => `/${id}.webp`;
const baseOnly = (id: string) => (id.endsWith('-espace') ? `/${id}.webp` : null);
const pick = (r: number) => pickArena('espace', r, all);

describe('pickArena', () => {
  it('smartphone (portrait très allongé 9:20) et fenêtre étroite : cadrage portrait', () => {
    expect(pick(360 / 352)).toBe('/environments-arenas-espace-portrait.webp');
    expect(pick(320 / 440)).toBe('/environments-arenas-espace-portrait.webp');
  });
  it('tablette en portrait : plein cadre 16:9', () => {
    expect(pick(768 / 440)).toBe('/environments-arenas-espace.webp');
  });
  it('tablette en paysage et ordinateur : cadrage large', () => {
    expect(pick(1024 / 338)).toBe('/environments-arenas-espace-large.webp');
  });
  it('écrans très larges (21:9, 32:9) : panorama', () => {
    expect(pick(2560 / 440)).toBe('/environments-arenas-espace-pano.webp');
    expect(pick(5120 / 440)).toBe('/environments-arenas-espace-pano.webp');
  });
  it("garde l'image livrée tant que les variantes manquent", () => {
    expect(pickArena('espace', 0.7, baseOnly)).toBe('/environments-arenas-espace.webp');
    expect(pickArena('espace', 0.7, () => null)).toBeNull();
  });
});

describe('extension du décor', () => {
  it("l'image garde ses proportions : au-delà du panorama, fond d'ambiance sur les côtés", () => {
    const wide = pickArenaVariant('espace', 5120 / 440, all);
    expect(wide && isExtended(5120 / 440, wide.ratio)).toBe(true);
    const phone = pickArenaVariant('espace', 1, all);
    expect(phone && isExtended(1, phone.ratio)).toBe(false);
  });
  it('la scène des combattants est plus étroite que le panorama', () => {
    expect(STAGE_MAX_RATIO).toBeLessThan(ARENA_VARIANTS[ARENA_VARIANTS.length - 1]?.ratio ?? 0);
  });
});

describe('arènes livrées', () => {
  it('chaque arène existe dans tous les cadrages, aucune ancienne arène ne reste', () => {
    const files = AVAILABLE.filter((f) => f.startsWith('environments/arenas/'));
    expect(files.length).toBe(ARENAS.length * ARENA_VARIANTS.length);
    for (const id of ARENAS) {
      for (const v of ARENA_VARIANTS) expect(files).toContain(`environments/arenas/${id}${v.suffix}.webp`);
    }
  });
});
