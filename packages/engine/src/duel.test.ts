import { describe, expect, it } from 'vitest';
import { duelHandicaps, duelLevel, handicapFor } from './duel.ts';

describe('handicap de duel selon l’âge', () => {
  it('pas de handicap à âge égal', () => {
    expect(handicapFor(12, 12)).toEqual({ levelBonus: 0, timeFactor: 1 });
  });
  it('gradué selon l’écart', () => {
    expect(handicapFor(13, 12).timeFactor).toBe(0.9);
    expect(handicapFor(15, 12)).toEqual({ levelBonus: 1, timeFactor: 0.75 });
    expect(handicapFor(17, 11)).toEqual({ levelBonus: 2, timeFactor: 0.6 });
  });
  it('un adulte contre un enfant : niveau max et temps divisé par 2', () => {
    const [enfant, parent] = duelHandicaps([12, 42]);
    expect(enfant).toEqual({ levelBonus: 0, timeFactor: 1 });
    expect(parent).toEqual({ levelBonus: 2, timeFactor: 0.5 });
    expect(duelLevel(2, parent!)).toBe(3);
  });
  it('âge inconnu : neutre', () => {
    expect(duelHandicaps([null, 12])[0]).toEqual({ levelBonus: 0, timeFactor: 1 });
  });
});
