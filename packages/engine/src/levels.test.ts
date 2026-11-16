import { describe, expect, it } from 'vitest';
import { levelFromXp, titleForLevel, xpToNextLevel } from './levels.ts';

describe('xpToNextLevel', () => {
  it('suit la courbe 100·n^1,5', () => {
    expect(xpToNextLevel(1)).toBe(100);
    expect(xpToNextLevel(4)).toBe(800);
  });
  it('refuse un niveau invalide', () => {
    expect(() => xpToNextLevel(0)).toThrow(RangeError);
    expect(() => xpToNextLevel(1.5)).toThrow(RangeError);
  });
});

describe('levelFromXp', () => {
  it('démarre au niveau 1', () => {
    expect(levelFromXp(0)).toEqual({ level: 1, xpInLevel: 0, xpForNext: 100, title: 'Apprenti' });
  });
  it('passe de niveau pile au seuil', () => {
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100)).toMatchObject({ level: 2, xpInLevel: 0 });
  });
  it('cumule les niveaux', () => {
    const total = xpToNextLevel(1) + xpToNextLevel(2) + 10;
    expect(levelFromXp(total)).toMatchObject({ level: 3, xpInLevel: 10 });
  });
  it('est monotone', () => {
    let prev = 1;
    for (let xp = 0; xp < 50_000; xp += 137) {
      const { level } = levelFromXp(xp);
      expect(level).toBeGreaterThanOrEqual(prev);
      prev = level;
    }
  });
  it('refuse un XP négatif', () => {
    expect(() => levelFromXp(-1)).toThrow(RangeError);
  });
});

describe('titleForLevel', () => {
  it.each([
    [1, 'Apprenti'],
    [5, 'Explorateur'],
    [10, 'Aventurier'],
    [20, 'Héros'],
    [35, 'Champion'],
    [50, 'Légende'],
    [99, 'Légende'],
  ])('niveau %i → %s', (level, title) => {
    expect(titleForLevel(level)).toBe(title);
  });
});
