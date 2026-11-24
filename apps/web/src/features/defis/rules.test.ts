import { beforeEach, describe, expect, it } from 'vitest';
import { allSkillIds, generate, type Level, type Question } from '@epicademie/content';
import {
  basePoints,
  bestScore,
  CHRONO_MS,
  GAIN_MAX_S,
  GAIN_MIN_S,
  referenceSeconds,
  timeGainMs,
  WRONG_PENALTY_MS,
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

  it('bonus de rapidité jugé par rapport à la durée de référence : plafonné à 10, nul à 2 durées', () => {
    expect(speedBonus(0, 5)).toBe(SPEED_BONUS_MAX);
    expect(speedBonus(2000, 5)).toBe(SPEED_BONUS_MAX);
    expect(speedBonus(6000, 5)).toBe(5);
    expect(speedBonus(10_000, 5)).toBe(0);
    expect(speedBonus(60_000, 5)).toBe(0);
    // Même rapidité relative, question deux fois plus longue : même bonus.
    expect(speedBonus(12_000, 10)).toBe(speedBonus(6000, 5));
    expect(speedBonus(4000, 10)).toBe(SPEED_BONUS_MAX);
  });

  it('multiplicateur de série : ×1, ×2 à 3, … plafonné à ×5', () => {
    expect([0, 1, 2, 3, 5, 6, 9, 12, 100].map(comboOf)).toEqual([1, 1, 1, 2, 2, 3, 4, 5, 5]);
  });

  it('points d’une bonne réponse : (base + rapidité) × série', () => {
    expect(pointsFor(1, 'choice', 20_000, 1, 5)).toBe(10);
    expect(pointsFor(2, 'number', 1000, 3, 5)).toBe((25 + 10) * 2);
    expect(pointsFor(3, 'number', 1000, 99, 5)).toBe((35 + 10) * 5);
    expect(pointsFor(3, 'choice', 20_000, 1, 5)).toBeGreaterThan(pointsFor(2, 'choice', 20_000, 1, 5));
  });
});

describe('défis : déroulé', () => {
  it('Contre-la-montre : temps gagné par bonne réponse, −5 s et série cassée par erreur', () => {
    let s = scoreAfter('chrono', INITIAL_SCORE, true, 10, 2000);
    s = scoreAfter('chrono', s, true, 10, 2000);
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
    expect([0, 5, 10, 15, 20, 99].map((n) => levelFor('survie', n, 0, 5))).toEqual([1, 2, 3, 4, 5, 5]);
    expect(levelFor('chrono', 0, 0.9, 5)).toBe(2);
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

/** Questions réelles : toutes les notions, niveaux 1 et 2 (ceux du Contre-la-montre), quelques graines. */
const sample = (seeds: readonly number[]): Question[] =>
  allSkillIds().flatMap((id) => ([1, 2] as Level[]).flatMap((level) => seeds.map((seed) => generate(id, level, seed))));

describe('défis : durée de référence et temps gagné', () => {
  const questions = sample([1, 2, 3]);

  it('toutes les notions ont une durée de référence dans une plage raisonnable', () => {
    expect(questions.length).toBeGreaterThan(200);
    for (const q of questions) {
      const t = referenceSeconds(q);
      expect(t, `${q.skillId} niveau ${q.level}`).toBeGreaterThanOrEqual(3);
      expect(t, `${q.skillId} niveau ${q.level}`).toBeLessThanOrEqual(25);
    }
    expect(new Set(allSkillIds().map((id) => referenceSeconds(generate(id, 1, 1)))).size).toBeGreaterThan(5);
  });

  it('une saisie ou un problème long a une durée plus grande qu’un choix court', () => {
    const quick = questions.filter((q) => q.answer.kind === 'choice' && q.prompt.length < 40);
    const long = questions.filter((q) => q.answer.kind !== 'choice' && q.prompt.length > 120 && q.level === 2);
    expect(quick.length).toBeGreaterThan(0);
    expect(long.length).toBeGreaterThan(0);
    const mean = (l: Question[]) => l.reduce((a, q) => a + referenceSeconds(q), 0) / l.length;
    expect(mean(long)).toBeGreaterThan(mean(quick) + 5);
  });

  it('le temps gagné vaut la moitié de la durée de référence, borné entre le plancher et le plafond', () => {
    for (const q of questions) {
      const gain = timeGainMs(q) / 1000;
      const expected = Math.min(GAIN_MAX_S, Math.max(GAIN_MIN_S, referenceSeconds(q) / 2));
      expect(gain).toBeCloseTo(expected, 2);
    }
    const gains = questions.map((q) => timeGainMs(q) / 1000);
    expect(Math.min(...gains)).toBeLessThanOrEqual(2.5);
    expect(Math.max(...gains)).toBeGreaterThanOrEqual(8);
  });
});

/** Générateur pseudo-aléatoire déterministe (LCG). */
const lcg = (seed: number) => () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const FEEDBACK_S = 0.35;

/**
 * Simule une partie : questions tirées au hasard parmi toutes les notions (niveau 1 ou 2), le joueur met
 * `speed × durée de référence` (+ le retour instantané) et réussit selon `succeeds`. Renvoie la durée jouée (s)
 * et le plus grand temps restant atteint.
 */
function play(seed: number, speed: number, succeeds: (q: Question, n: number, r: () => number) => boolean) {
  const r = lcg(seed);
  const ids = allSkillIds();
  let elapsed = 0;
  let adjust = 0;
  let maxLeft = 0;
  for (let n = 0; elapsed < CHRONO_MS + adjust && n < 500; n++) {
    const q = generate(ids[Math.floor(r() * ids.length)]!, r() < 0.5 ? 1 : 2, Math.floor(r() * 1e9));
    elapsed += speed * referenceSeconds(q) * 1000 + FEEDBACK_S * 1000;
    adjust += succeeds(q, n, r) ? timeGainMs(q) : -WRONG_PENALTY_MS;
    maxLeft = Math.max(maxLeft, CHRONO_MS + adjust - elapsed);
  }
  return { seconds: elapsed / 1000, maxLeft: maxLeft / 1000 };
}

describe('défis : simulation d’une partie de Contre-la-montre', () => {
  it('un bon joueur (réponse en 0,9 durée de référence, 9 réussites sur 10) joue entre 90 et 150 s', () => {
    const runs = [1, 2, 3, 4, 5, 6, 7, 8].map((seed) => play(seed, 0.9, (_q, n) => n % 10 !== 9).seconds);
    const mean = runs.reduce((a, b) => a + b, 0) / runs.length;
    expect(mean).toBeGreaterThanOrEqual(90);
    expect(mean).toBeLessThanOrEqual(150);
    for (const t of runs) {
      expect(t).toBeGreaterThanOrEqual(75);
      expect(t).toBeLessThanOrEqual(170);
    }
  });

  it('un joueur très rapide ne rend pas la partie interminable', () => {
    for (const seed of [1, 2, 3]) expect(play(seed, 0.6, (_q, n) => n % 10 !== 9).seconds).toBeLessThanOrEqual(240);
  });

  it('un joueur qui répond au hasard ne prolonge jamais la partie', () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      // Hasard : 1 chance sur 4 sur un choix, aucune sur une saisie ; réponse en 1,5 s.
      const guess = (q: Question, _n: number, r: () => number) => q.answer.kind === 'choice' && r() < 0.25;
      const { seconds, maxLeft } = play(seed, 0.2, guess);
      expect(seconds).toBeLessThanOrEqual(CHRONO_MS / 1000 + 1);
      expect(maxLeft).toBeLessThanOrEqual(CHRONO_MS / 1000);
    }
  });
});
