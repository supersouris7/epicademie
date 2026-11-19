import { randomInt } from 'node:crypto';

/**
 * Hasard injectable : `float()` dans [0, 1[ (coffres, dés de combat) et `seed()` pour générer
 * une question. Remplacé par une suite fixe dans les tests.
 */
export interface Random {
  readonly float: () => number;
  readonly seed: () => number;
  /** Entier dans [0, max[. */
  readonly int: (max: number) => number;
}

export const systemRandom: Random = {
  float: Math.random,
  seed: () => randomInt(1, 2 ** 31),
  int: (max) => randomInt(max),
};
