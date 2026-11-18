import { describe, expect, it } from 'vitest';
import { bestMedal, bossMedal } from './battle.ts';

describe('médailles de boss', () => {
  it('selon les cœurs restants, diamant à 3 cœurs sans objet', () => {
    expect(bossMedal(3, 3, 0)).toBe('diamant');
    expect(bossMedal(3, 3, 1)).toBe('or');
    expect(bossMedal(2, 3, 0)).toBe('argent');
    expect(bossMedal(1, 3, 0)).toBe('bronze');
    expect(bossMedal(0, 3, 0)).toBeNull();
  });

  it('garde la meilleure', () => {
    expect(bestMedal('or', 'argent')).toBe('or');
    expect(bestMedal('bronze', 'diamant')).toBe('diamant');
    expect(bestMedal(null, 'bronze')).toBe('bronze');
  });
});
