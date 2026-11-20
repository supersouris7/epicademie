import { describe, expect, it } from 'vitest';
import { rollChest, rollRarity } from './loot.ts';

const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
};

describe('coffres d’équipement', () => {
  it('coffre garanti à chaque série, même ratée', () => {
    for (const correct of [0, 1, 2, 3, 4]) expect(rollChest(correct, 4, seq(0.3, 0.5))).not.toBeNull();
  });

  it('rareté : commun, rare, épique ; le sans-faute améliore le tirage', () => {
    expect(rollRarity(0.1, false)).toBe('commun');
    expect(rollRarity(0.7, false)).toBe('rare');
    expect(rollRarity(0.95, false)).toBe('epique');
    expect(rollRarity(0.6, true)).toBe('rare');
  });

  it('contenu : objets et pièces selon la rareté', () => {
    const chest = rollChest(5, 5, seq(0.99, 0, 0.5, 0.99));
    expect(chest).toEqual({ rarity: 'epique', items: { bouclier: 1, soin: 1 }, coins: 40, rubies: 1 });
    expect(rollChest(1, 5, seq(0.1))).toEqual({ rarity: 'commun', items: {}, coins: 25, rubies: 0 });
  });
});
