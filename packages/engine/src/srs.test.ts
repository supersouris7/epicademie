import { describe, expect, it } from 'vitest';
import { addDays, applySession, mastery, masteryFromRate, newSkillState, scoreOn20 } from './srs.ts';

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

  it('une série ratée remet « à revoir » le lendemain', () => {
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
    const s = applySession(
      newSkillState('x'),
      { answered: 25, correct: 25 },
      '2026-11-16',
      Array.from({ length: 25 }, () => true),
    );
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
