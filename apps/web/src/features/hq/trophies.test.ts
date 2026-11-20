import { describe, expect, it } from 'vitest';
import { toggleShowcase, trophyLabel } from './trophies.ts';

describe('trophées', () => {
  it('libellés lisibles', () => {
    expect(trophyLabel('boss:m5-calcul', [])).toBe('Boss vaincu : Calcul mental');
    expect(trophyLabel('heros:lina', [])).toBe('Acad-Héros : Lina');
    expect(
      trophyLabel('badge:boss', [
        { category: 'boss', title: 'Chasseur de boss', how: '', value: 1, tier: 'bronze', next: 5 },
      ]),
    ).toBe('Badge Chasseur de boss (Bronze)');
  });
  it('vitrine : ajout, retrait, 3 au plus', () => {
    expect(toggleShowcase(['a', 'b'], 'a', 3)).toEqual(['b']);
    expect(toggleShowcase(['a', 'b', 'c'], 'd', 3)).toEqual(['b', 'c', 'd']);
  });
});
