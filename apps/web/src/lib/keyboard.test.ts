import { describe, expect, it } from 'vitest';
import { MAX_TEXT, typeKey } from './keyboard.ts';

describe('clavier', () => {
  it('saisit, met en majuscule, efface', () => {
    expect(typeKey('', 'h', true)).toBe('H');
    expect(typeKey('H', 'é', false)).toBe('Hé');
    expect(typeKey('Hé', '⌫', false)).toBe('H');
  });
  it('pas d’espace au début ni doublé, longueur limitée', () => {
    expect(typeKey('', ' ', false)).toBe('');
    expect(typeKey('a ', ' ', false)).toBe('a ');
    expect(typeKey('a'.repeat(MAX_TEXT), 'b', false)).toHaveLength(MAX_TEXT);
  });
});
