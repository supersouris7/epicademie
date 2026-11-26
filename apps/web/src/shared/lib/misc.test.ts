import { describe, expect, it } from 'vitest';
import { localToday, randomSeed } from './dates.ts';
import { comingSoon } from './comingSoon.ts';

describe('petits outils', () => {
  it('date locale AAAA-MM-JJ et graine aléatoire', () => {
    expect(localToday(new Date(2026, 10, 19, 12))).toBe('2026-11-19');
    expect(randomSeed()).toBeGreaterThanOrEqual(0);
  });

  it('message des classes à venir', () => {
    expect(comingSoon('adulte')).toMatch(/Adulte/);
    expect(comingSoon('cm1')).toMatch(/arrive bientôt/);
  });
});
