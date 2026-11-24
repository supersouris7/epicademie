import { indexFor, shuffleWith } from '@epicademie/shared';

/** Générateur pseudo-aléatoire déterministe (mulberry32), pour des exercices reproductibles par graine. */
export interface Rng {
  /** Flottant dans [0, 1). */
  next(): number;
  /** Entier dans [min, max] (bornes incluses). */
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
  const int = (min: number, max: number): number => {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
      throw new RangeError(`Intervalle invalide : [${min}, ${max}]`);
    }
    return min + Math.floor(next() * (max - min + 1));
  };
  return {
    next,
    int,
    // Mêmes tirages qu'avec `int` : les exercices restent identiques pour une même graine.
    pick: <T>(items: readonly T[]): T => items[indexFor(items.length, next())] as T,
    shuffle: <T>(items: readonly T[]): T[] => shuffleWith(items, next),
  };
}

/** Graine stable à partir d'une chaîne (ex. date du défi du jour). */
export function seedFromString(text: string): number {
  let h = 2_166_136_261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16_777_619);
  }
  return h >>> 0;
}
