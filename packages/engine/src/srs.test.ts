import { describe, expect, it } from 'vitest';
import {
  acquired,
  addDays,
  applySession,
  mastery,
  masteryFromRate,
  medal,
  newSkillState,
  scoreOn20,
  seriesScore,
} from './srs.ts';

const ok = { answered: 5, correct: 5 };
const ko = { answered: 5, correct: 2 };

describe('répétition espacée', () => {
  it('addDays gère les fins de mois', () => {
    expect(addDays('2026-11-29', 2)).toBe('2026-12-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('acquise après réussites à J0, J+2 et J+7', () => {
    let s = applySession(newSkillState('x'), ok, '2026-11-16');
    expect(s).toMatchObject({ stage: 1, due: '2026-11-18' });
    s = applySession(s, ok, '2026-11-18');
    expect(s).toMatchObject({ stage: 2, due: '2026-11-23' }); // J+7 depuis J0
    s = applySession(s, ok, '2026-11-23');
    expect(s).toMatchObject({ stage: 3, due: '2026-12-23' }); // entretien mensuel
  });

  it('pas de progression en révisant avant l’échéance', () => {
    const s1 = applySession(newSkillState('x'), ok, '2026-11-16');
    const s2 = applySession(s1, ok, '2026-11-16');
    expect(s2.stage).toBe(1);
    expect(s2.attempts).toBe(10);
  });

  it('une série pas encore réussie remet « à revoir » le lendemain', () => {
    let s = applySession(newSkillState('x'), ok, '2026-11-16');
    s = applySession(s, ok, '2026-11-18');
    s = applySession(s, ko, '2026-11-20');
    expect(s).toMatchObject({ stage: 0, due: '2026-11-21' });
  });

  it('80 % suffit, 79 % non', () => {
    expect(applySession(newSkillState('x'), { answered: 5, correct: 4 }, '2026-11-16').stage).toBe(1);
    expect(applySession(newSkillState('x'), { answered: 4, correct: 3 }, '2026-11-16').stage).toBe(0);
  });

  it('garde les 20 dernières réponses', () => {
    const s = applySession(newSkillState('x'), { answered: 25, correct: 25 }, '2026-11-16', {
      answers: Array.from({ length: 25 }, () => true),
    });
    expect(s.recent).toHaveLength(20);
  });
});

describe('maîtrise et note', () => {
  it('échelle LSU', () => {
    expect(masteryFromRate(null)).toBe('non-evalue');
    expect(masteryFromRate(0.4)).toBe('insuffisante');
    expect(masteryFromRate(0.6)).toBe('fragile');
    expect(masteryFromRate(0.8)).toBe('satisfaisante');
    expect(masteryFromRate(0.95)).toBe('tres-bonne');
    expect(mastery({ recent: [true, true] })).toBe('non-evalue');
  });
  it('note /20 au demi-point', () => {
    expect(scoreOn20(7, 10)).toBe(14);
    expect(scoreOn20(2, 3)).toBe(13.5);
    expect(scoreOn20(0, 0)).toBe(0);
  });
});

describe('médailles', () => {
  it('la meilleure série de 5 fixe la médaille : 5/5 Or (acquise), 4/5 Argent, 3/5 Bronze', () => {
    const day = '2026-11-16';
    let s = newSkillState('x');
    expect(medal(s)).toBe('aucune');
    s = applySession(s, { answered: 5, correct: 2 }, day, { series: 2 });
    expect(medal(s)).toBe('aucune');
    s = applySession(s, { answered: 5, correct: 3 }, day, { series: 3 });
    expect(medal(s)).toBe('bronze');
    s = applySession(s, { answered: 5, correct: 4 }, day, { series: 4 });
    expect(medal(s)).toBe('argent');
    // Un seul sans-faute suffit, même le jour même : notion acquise.
    s = applySession(s, { answered: 5, correct: 5 }, day, { series: 5 });
    expect(medal(s)).toBe('or');
    expect(acquired(s)).toBe(true);
    // Une série moins bonne ne fait pas perdre la médaille.
    s = applySession(s, { answered: 5, correct: 1 }, day, { series: 1 });
    expect(medal(s)).toBe('or');
    // Série mêlant plusieurs notions (pas de score de série) : la médaille ne bouge pas.
    expect(medal(applySession(newSkillState('y'), { answered: 2, correct: 2 }, day, { answers: [true, true] }))).toBe(
      'aucune',
    );
  });
  it('tout réussi avec aide : Or ; sans aide : Diamant, au-dessus ; jamais perdue', () => {
    expect(seriesScore(5, 5)).toBe(5);
    expect(seriesScore(4, 4, true)).toBe(6);
    // « Sans aide » ne vaut que pour une série entièrement réussie.
    expect(seriesScore(4, 5, true)).toBe(4);
    const day = '2026-11-16';
    let s = applySession(newSkillState('x'), ok, day, { series: seriesScore(5, 5) });
    expect(medal(s)).toBe('or');
    s = applySession(s, ok, day, { series: seriesScore(5, 5, true) });
    expect(medal(s)).toBe('diamant');
    expect(acquired(s)).toBe(true);
    // Une aide ensuite, ou une série moins réussie : le diamant reste.
    s = applySession(s, ok, day, { series: seriesScore(5, 5), reviewSoon: true });
    s = applySession(s, ko, day, { series: 2 });
    expect(medal(s)).toBe('diamant');
  });
  it('demander l’explication n’est jamais une erreur : même progression, notion reproposée dès demain', () => {
    const day = '2026-11-16';
    const plain = applySession(newSkillState('x'), ok, day, { series: 5 });
    const asked = applySession(newSkillState('x'), ok, day, { series: 5, reviewSoon: true });
    expect(asked).toEqual({ ...plain, due: '2026-11-17' });
  });
});
