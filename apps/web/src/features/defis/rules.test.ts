import { describe, expect, it } from 'vitest';
import { CHRONO_MS, isOver, levelFor, scoreAfter, SURVIE_HEARTS } from './rules.ts';

describe('défis', () => {
  it('Contre-la-montre : 60 s, les erreurs ne coûtent rien', () => {
    let s = { correct: 0, answered: 0, hearts: SURVIE_HEARTS };
    s = scoreAfter('chrono', s, false);
    s = scoreAfter('chrono', s, true);
    expect(s).toEqual({ correct: 1, answered: 2, hearts: SURVIE_HEARTS });
    expect(isOver('chrono', s, CHRONO_MS - 1)).toBe(false);
    expect(isOver('chrono', s, CHRONO_MS)).toBe(true);
    expect([levelFor('chrono', 0, 0.1), levelFor('chrono', 0, 0.9)]).toEqual([1, 2]);
  });

  it('Survie : 3 cœurs, la difficulté monte toutes les 5 bonnes réponses', () => {
    let s = { correct: 0, answered: 0, hearts: SURVIE_HEARTS };
    for (let i = 0; i < 3; i++) s = scoreAfter('survie', s, false);
    expect(isOver('survie', s, 0)).toBe(true);
    expect([
      levelFor('survie', 0, 0),
      levelFor('survie', 5, 0),
      levelFor('survie', 10, 0),
      levelFor('survie', 99, 0),
    ]).toEqual([1, 2, 3, 3]);
  });
});
