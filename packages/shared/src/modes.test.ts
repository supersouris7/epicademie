import { describe, expect, it } from 'vitest';
import { MODES, MODE_CATEGORIES, MODE_IDS, getMode } from './modes.ts';

describe('modes de jeu', () => {
  it('décrit chaque identifiant exactement une fois', () => {
    expect(MODES.map((m) => m.id).toSorted()).toEqual([...MODE_IDS].toSorted());
  });
  it('chaque catégorie a au moins un mode', () => {
    for (const c of MODE_CATEGORIES) expect(MODES.some((m) => m.category === c.id)).toBe(true);
  });
  it('getMode retrouve un mode ou renvoie undefined', () => {
    expect(getMode('boss')?.name).toBe('Combat de boss');
    expect(getMode('inconnu')).toBeUndefined();
  });
});
