import { describe, expect, it } from 'vitest';
import { indexFor, pickAt, shuffleWith } from './random.ts';

/** Source qui rejoue une suite de tirages fixée. */
const replay = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
};

describe('tirages sur des listes', () => {
  it('indexFor couvre toute la liste, bornes comprises', () => {
    expect(indexFor(4, 0)).toBe(0);
    expect(indexFor(4, 0.999)).toBe(3);
    expect(indexFor(4, 1)).toBe(0);
    expect(() => indexFor(0, 0.5)).toThrow(RangeError);
  });

  it('pickAt prend l’élément du tirage', () => {
    expect(pickAt(['a', 'b', 'c'], 0.5)).toBe('b');
    expect(() => pickAt([], 0.5)).toThrow('Liste vide');
  });

  it('shuffleWith garde les mêmes éléments sans toucher l’original', () => {
    const items = [1, 2, 3, 4, 5];
    const out = shuffleWith(items, replay([0.1, 0.9, 0.4, 0.7]));
    expect(out).not.toBe(items);
    expect([...out].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });

  it('shuffleWith est déterministe pour une même source', () => {
    const a = shuffleWith([1, 2, 3, 4], replay([0.3, 0.6, 0.2]));
    const b = shuffleWith([1, 2, 3, 4], replay([0.3, 0.6, 0.2]));
    expect(a).toEqual(b);
    // Source nulle : chaque élément échange avec le premier.
    expect(shuffleWith([1, 2, 3], () => 0)).toEqual([2, 3, 1]);
  });
});
