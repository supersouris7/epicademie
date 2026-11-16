import { describe, expect, it } from 'vitest';
import { coinsForXp, comboMultiplier, speedBonus, xpForAnswer } from './xp.ts';

describe('XP', () => {
  it('bonus de vitesse dégressif', () => {
    expect(speedBonus(4000, 10)).toBe(5);
    expect(speedBonus(7500, 10)).toBe(3);
    expect(speedBonus(12000, 10)).toBe(0);
  });
  it('combos', () => {
    expect(comboMultiplier(4)).toBe(1);
    expect(comboMultiplier(5)).toBe(1.5);
    expect(comboMultiplier(10)).toBe(2);
  });
  it('XP par réponse', () => {
    expect(xpForAnswer({ correct: false, variant: false, durationMs: 1000, targetSeconds: 10, streak: 0 })).toBe(0);
    expect(xpForAnswer({ correct: true, variant: false, durationMs: 1000, targetSeconds: 10, streak: 1 })).toBe(15);
    expect(xpForAnswer({ correct: true, variant: false, durationMs: 60000, targetSeconds: 10, streak: 10 })).toBe(20);
    expect(xpForAnswer({ correct: true, variant: true, durationMs: 1000, targetSeconds: 10, streak: 3 })).toBe(5);
    expect(coinsForXp(147)).toBe(14);
  });
});
