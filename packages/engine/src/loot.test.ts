import { describe, expect, it } from 'vitest';
import { chestChance, rollChest, rollRarity } from './loot.ts';

const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
};

describe('coffres d’équipement', () => {
  it('sans-faute : coffre garanti ; la chance baisse avec le score', () => {
    expect(chestChance(5, 5)).toBe(1);
    expect(chestChance(4, 5)).toBeGreaterThan(chestChance(3, 5));
    expect(chestChance(3, 5)).toBeGreaterThan(chestChance(1, 5));
    expect(chestChance(0, 5)).toBeGreaterThan(0);
  });

  it('rareté : commun, rare, épique ; le sans-faute améliore le tirage', () => {
    expect(rollRarity(0.1, false)).toBe('commun');
    expect(rollRarity(0.7, false)).toBe('rare');
    expect(rollRarity(0.95, false)).toBe('epique');
    expect(rollRarity(0.6, true)).toBe('rare');
  });

  it('contenu : objets et pièces selon la rareté', () => {
    const chest = rollChest(5, 5, seq(0, 0.99, 0, 0.5, 0.99));
    expect(chest).toEqual({ rarity: 'epique', items: { bouclier: 1, soin: 1, indice: 1 }, coins: 40 });
    expect(rollChest(1, 5, seq(0.5))).toBeNull();
  });
});
