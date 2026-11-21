import { describe, expect, it } from 'vitest';
import { bossChest, bossRarity, fillChest, rollRarity, trainingChest } from './loot.ts';

const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
};

describe('coffres d’équipement', () => {
  it('entraînement : coffre seulement si toute la série est juste (2e essai compris)', () => {
    for (const solved of [0, 1, 2, 3]) expect(trainingChest({ total: 4, solved, firstTry: 0 }, seq(0.3))).toBeNull();
    expect(trainingChest({ total: 0, solved: 0, firstTry: 0 }, seq(0.3))).toBeNull();
    expect(trainingChest({ total: 4, solved: 4, firstTry: 2 }, seq(0.3, 0.5))).not.toBeNull();
  });

  it('rareté : commun, rare, épique, légendaire ; le sans-faute du 1er coup améliore le tirage', () => {
    expect(rollRarity(0.1, false)).toBe('commun');
    expect(rollRarity(0.7, false)).toBe('rare');
    expect(rollRarity(0.9, false)).toBe('epique');
    expect(rollRarity(0.98, false)).toBe('legendaire');
    expect(rollRarity(0.4, true)).toBe('rare');
    // Sans-faute : jamais pire que sans.
    for (const r of [0, 0.3, 0.6, 0.9, 0.99]) {
      const order = ['commun', 'rare', 'epique', 'legendaire'];
      expect(order.indexOf(rollRarity(r, true))).toBeGreaterThanOrEqual(order.indexOf(rollRarity(r, false)));
    }
  });

  it('boss : la médaille fixe la rareté, parfois un cran au-dessus, jamais en dessous', () => {
    expect(bossRarity('bronze', 0.9)).toBe('commun');
    expect(bossRarity('argent', 0.9)).toBe('rare');
    expect(bossRarity('or', 0.9)).toBe('epique');
    expect(bossRarity('diamant', 0.9)).toBe('legendaire');
    expect(bossRarity('bronze', 0.1)).toBe('rare');
    expect(bossRarity('diamant', 0.1)).toBe('legendaire');
    expect(bossChest('or', seq(0.9, 0, 0.5, 0.99)).rarity).toBe('epique');
  });

  it('contenu : objets, pièces et rubis selon la rareté', () => {
    // Objets (2), puis héros (0,99 ≥ 25 % : aucun).
    expect(fillChest('epique', seq(0, 0.5, 0.99))).toEqual({
      rarity: 'epique',
      items: { bouclier: 1, soin: 1 },
      coins: 40,
      rubies: 1,
      hero: null,
    });
    expect(fillChest('commun', seq(0.1))).toEqual({ rarity: 'commun', items: {}, coins: 25, rubies: 0, hero: null });
    const legendary = fillChest('legendaire', seq(0, 0, 0, 0.99));
    expect(legendary).toMatchObject({ rarity: 'legendaire', coins: 80, rubies: 2 });
    expect(Object.values(legendary.items).reduce((a, b) => a + b, 0)).toBe(3);
  });

  it('Acad-Héros : jamais dans un coffre commun, tiré parmi ceux qui manquent', () => {
    expect(fillChest('epique', seq(0, 0, 0.1, 0.5), new Set(['alex'])).hero).toEqual({ id: 'lina', duplicate: false });
    expect(fillChest('commun', seq(0)).hero).toBeNull();
  });

  it('héros déjà tous possédés : doublon converti en pièces', () => {
    const chest = fillChest('epique', seq(0, 0, 0.1, 0), new Set(['alex', 'lina']));
    expect(chest.hero).toMatchObject({ duplicate: true });
    expect(chest.coins).toBe(40 + 60);
  });
});
