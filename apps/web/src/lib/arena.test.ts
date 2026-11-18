import { describe, expect, it } from 'vitest';
import { pickArena } from './arena.ts';

const all = (id: string) => `/${id}.webp`;
const baseOnly = (id: string) => (id.endsWith('-espace') ? `/${id}.webp` : null);

describe('pickArena', () => {
  it('prend le portrait pour un téléphone', () => {
    expect(pickArena('espace', 388 / 560, all)).toBe('/environments-arenas-espace-portrait.webp');
  });
  it('prend le plein cadre 16:9 pour une tablette en portrait', () => {
    expect(pickArena('espace', 796 / 560, all)).toBe('/environments-arenas-espace.webp');
  });
  it('prend le panorama pour une tablette en paysage', () => {
    expect(pickArena('espace', 1152 / 508, all)).toBe('/environments-arenas-espace-large.webp');
  });
  it("garde l'image livrée tant que les variantes manquent", () => {
    expect(pickArena('espace', 0.7, baseOnly)).toBe('/environments-arenas-espace.webp');
    expect(pickArena('espace', 0.7, () => null)).toBeNull();
  });
});
