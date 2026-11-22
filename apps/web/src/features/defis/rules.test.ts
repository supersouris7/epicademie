import { beforeEach, describe, expect, it } from 'vitest';
import {
  basePoints,
  bestScore,
  CHRONO_MS,
  comboOf,
  INITIAL_SCORE,
  isOver,
  levelFor,
  pointsFor,
  remainingMs,
  saveBest,
  scoreAfter,
  speedBonus,
  SPEED_BONUS_MAX,
} from './rules.ts';

describe('défis : barème', () => {
  it('base : plus de points pour un niveau plus haut et pour une saisie que pour un choix', () => {
    expect([1, 2, 3].map((l) => basePoints(l as 1 | 2 | 3, 'choice'))).toEqual([10, 20, 30]);
    expect(basePoints(1, 'number')).toBe(15);
    expect(basePoints(1, 'number')).toBeGreaterThan(basePoints(1, 'choice'));
    expect(basePoints(3, 'choice')).toBeGreaterThan(basePoints(2, 'number'));
  });

  it('bonus de rapidité : plafonné à 10, nul à 10 s', () => {
    expect(speedBonus(0)).toBe(SPEED_BONUS_MAX);
    expect(speedBonus(2000)).toBe(SPEED_BONUS_MAX);
    expect(speedBonus(6000)).toBe(5);
    expect(speedBonus(10_000)).toBe(0);
    expect(speedBonus(60_000)).toBe(0);
  });

  it('multiplicateur de série : ×1, ×2 à 3, … plafonné à ×5', () => {
    expect([0, 1, 2, 3, 5, 6, 9, 12, 100].map(comboOf)).toEqual([1, 1, 1, 2, 2, 3, 4, 5, 5]);
  });

  it('points d’une bonne réponse : (base + rapidité) × série', () => {
    expect(pointsFor(1, 'choice', 20_000, 1)).toBe(10);
    expect(pointsFor(2, 'number', 1000, 3)).toBe((25 + 10) * 2);
    expect(pointsFor(3, 'number', 1000, 99)).toBe((35 + 10) * 5);
    expect(pointsFor(3, 'choice', 20_000, 1)).toBeGreaterThan(pointsFor(2, 'choice', 20_000, 1));
  });
});

describe('défis : déroulé', () => {
  it('Contre-la-montre : +2 s par bonne réponse, −5 s et série cassée par erreur', () => {
    let s = scoreAfter('chrono', INITIAL_SCORE, true, 10);
    s = scoreAfter('chrono', s, true, 10);
    expect(s).toMatchObject({ correct: 2, points: 20, streak: 2, timeAdjustMs: 4000 });
    s = scoreAfter('chrono', s, false);
    expect(s).toMatchObject({ correct: 2, answered: 3, points: 20, streak: 0, timeAdjustMs: -1000 });
    expect(remainingMs(s, 0)).toBe(CHRONO_MS - 1000);
    expect(isOver('chrono', s, CHRONO_MS - 1001)).toBe(false);
    expect(isOver('chrono', s, CHRONO_MS - 1000)).toBe(true);
    expect(isOver('chrono', INITIAL_SCORE, CHRONO_MS)).toBe(true);
  });

  it('niveaux : Contre-la-montre alterne 1 et 2 ; Survie monte toutes les 5 bonnes réponses', () => {
    expect([levelFor('chrono', 0, 0.1), levelFor('chrono', 0, 0.9)]).toEqual([1, 2]);
    expect([0, 5, 10, 99].map((n) => levelFor('survie', n, 0))).toEqual([1, 2, 3, 3]);
  });

  it('Survie : 3 cœurs, une erreur coûte un cœur et casse la série, sans toucher au chrono', () => {
    let s = scoreAfter('survie', INITIAL_SCORE, true, 10);
    s = scoreAfter('survie', s, false);
    expect(s).toMatchObject({ hearts: 2, streak: 0, points: 10, timeAdjustMs: 0 });
    s = scoreAfter('survie', scoreAfter('survie', s, false), false);
    expect(isOver('survie', s, 0)).toBe(true);
    expect(isOver('survie', INITIAL_SCORE, 10 * CHRONO_MS)).toBe(false);
  });
});

describe('défis : records en points', () => {
  beforeEach(() => localStorage.clear());

  it('garde le meilleur score, par matière et par classe', () => {
    expect(saveBest('chrono', 'p1', 'maths', '6e', 120)).toBe(true);
    expect(saveBest('chrono', 'p1', 'maths', '6e', 100)).toBe(false);
    expect(bestScore('chrono', 'p1', 'maths', '6e')).toBe(120);
    expect(bestScore('chrono', 'p1', 'maths', '5e')).toBe(0);
    expect(bestScore('chrono', 'p1', 'anglais', '6e')).toBe(0);
    expect(bestScore('survie', 'p1', 'maths', '6e')).toBe(0);
  });

  it('ne reprend pas les anciens records en bonnes réponses', () => {
    localStorage.setItem('af:defi:chrono:p1:maths', '25');
    expect(bestScore('chrono', 'p1', 'maths', '6e')).toBe(0);
  });
});
