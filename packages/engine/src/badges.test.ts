import { describe, expect, it } from 'vitest';
import { BADGES, badgeProgress, type BadgeCounts } from './badges.ts';

const zero: BadgeCounts = { boss: 0, parfait: 0, perseverance: 0, chapitres: 0, consolidees: 0, coffres: 1 };

describe('badges', () => {
  it('une définition par catégorie, seuils croissants', () => {
    expect(new Set(BADGES.map((b) => b.category)).size).toBe(BADGES.length);
    for (const b of BADGES) expect([...b.thresholds].sort((x, y) => x - y)).toEqual(b.thresholds);
  });

  it('grade atteint et prochain objectif', () => {
    const p = badgeProgress({ ...zero, boss: 5, parfait: 2, perseverance: 150 });
    expect(p.find((b) => b.category === 'boss')).toMatchObject({ value: 5, tier: 'argent', next: 15 });
    expect(p.find((b) => b.category === 'parfait')).toMatchObject({ tier: null, next: 3 });
    expect(p.find((b) => b.category === 'perseverance')).toMatchObject({ tier: 'diamant', next: null });
    // Héros de départ : pas encore de grade.
    expect(p.find((b) => b.category === 'coffres')).toMatchObject({ tier: null, next: 5 });
  });
});
