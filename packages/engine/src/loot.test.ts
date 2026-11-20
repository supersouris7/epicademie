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
    // Tirages : rareté, 2 objets, puis héros (0,99 ≥ 25 % : aucun).
    const chest = rollChest(5, 5, seq(0.99, 0, 0.5, 0.99));
    expect(chest).toEqual({ rarity: 'epique', items: { bouclier: 1, soin: 1 }, coins: 40, rubies: 1, hero: null });
    expect(rollChest(1, 5, seq(0.1))).toEqual({ rarity: 'commun', items: {}, coins: 25, rubies: 0, hero: null });
  });

  it('Acad-Héros : seulement dans les coffres rares ou épiques, parmi ceux qui manquent', () => {
    // Épique, 2 objets, héros tiré (0,1 < 25 %), choix du 2e héros manquant.
    const chest = rollChest(5, 5, seq(0.99, 0, 0, 0.1, 0.5), new Set(['alex']));
    expect(chest.hero).toEqual({ id: 'pixel', duplicate: false });
    // Un coffre commun ne contient jamais de héros.
    expect(rollChest(0, 5, seq(0.1, 0)).hero).toBeNull();
  });

  it('héros déjà tous possédés : doublon converti en pièces', () => {
    const chest = rollChest(5, 5, seq(0.99, 0, 0, 0.1, 0), new Set(['alex', 'lina', 'pixel']));
    expect(chest.hero).toMatchObject({ duplicate: true });
    expect(chest.coins).toBe(40 + 60);
  });
});
