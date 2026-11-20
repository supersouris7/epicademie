import { describe, expect, it } from 'vitest';
import { gradeFromBirthDate, gradeInfo, playedGrade } from './grades.ts';

describe('classe déduite de la date de naissance', () => {
  it('à la rentrée 2026, un enfant né en 2014 est en 5e', () => {
    expect(gradeFromBirthDate('2014-03-09', '2026-11-17')).toBe('5e');
    expect(gradeFromBirthDate('2014-12-31', '2026-09-01')).toBe('5e');
  });
  it('avant septembre, on est encore dans l’année scolaire précédente', () => {
    expect(gradeFromBirthDate('2014-03-09', '2026-06-30')).toBe('6e');
  });
  it('du CM1 à la 4e, adulte à partir de 18 ans, rien pour la 3e et le lycée', () => {
    expect(gradeFromBirthDate('2017-05-01', '2026-11-17')).toBe('cm1');
    expect(gradeFromBirthDate('2016-05-01', '2026-11-17')).toBe('cm2');
    expect(gradeFromBirthDate('2015-05-01', '2026-11-17')).toBe('6e');
    expect(gradeFromBirthDate('2013-05-01', '2026-11-17')).toBe('4e');
    expect(gradeFromBirthDate('2012-05-01', '2026-11-17')).toBe('3e');
    expect(gradeFromBirthDate('2011-05-01', '2026-11-17')).toBeNull();
    expect(gradeFromBirthDate('2019-05-01', '2026-11-17')).toBeNull();
    expect(gradeFromBirthDate('1985-05-01', '2026-11-17')).toBe('adulte');
  });
  it('toutes les classes sont disponibles, Adulte compris (parcours de remise à niveau)', () => {
    expect(gradeInfo('5e').available).toBe(true);
    expect(gradeInfo('4e').available).toBe(true);
    expect(gradeInfo('3e').available).toBe(true);
    expect(gradeInfo('cm1').available).toBe(true);
    expect(gradeInfo('adulte').available).toBe(true);
    expect(playedGrade('adulte')).toBe('adulte');
    expect(playedGrade(null)).toBe('5e');
  });
});
