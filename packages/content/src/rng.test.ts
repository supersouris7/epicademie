import { describe, expect, it } from 'vitest';
import { createRng, seedFromString } from './rng.ts';

describe('createRng', () => {
  it('est déterministe pour une même graine', () => {
    const a = createRng(42);
    const b = createRng(42);
    for (let i = 0; i < 100; i++) expect(a.next()).toBe(b.next());
  });
  it('diffère selon la graine', () => {
    expect(createRng(1).next()).not.toBe(createRng(2).next());
  });
  it('int respecte les bornes et les atteint', () => {
    const rng = createRng(7);
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const v = rng.int(-3, 3);
      expect(v).toBeGreaterThanOrEqual(-3);
      expect(v).toBeLessThanOrEqual(3);
      seen.add(v);
    }
    expect(seen.size).toBe(7);
  });
  it('int refuse un intervalle invalide', () => {
    expect(() => createRng(1).int(5, 2)).toThrow(RangeError);
  });
  it('shuffle conserve les éléments sans muter la source', () => {
    const src = [1, 2, 3, 4, 5];
    const out = createRng(3).shuffle(src);
    expect(out.toSorted()).toEqual(src);
    expect(src).toEqual([1, 2, 3, 4, 5]);
  });
  it('pick refuse une liste vide', () => {
    expect(() => createRng(1).pick([])).toThrow(RangeError);
  });
});

describe('seedFromString', () => {
  it('est stable', () => {
    expect(seedFromString('2026-11-16')).toBe(seedFromString('2026-11-16'));
    expect(seedFromString('2026-11-16')).not.toBe(seedFromString('2026-11-17'));
  });
});
