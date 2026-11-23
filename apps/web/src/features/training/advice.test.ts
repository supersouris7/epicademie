import { describe, expect, it } from 'vitest';
import type { SkillProgress } from '@questeo/shared';
import { OFTEN_MISSED, oftenMissed, recentErrors } from './advice.ts';

const progress = (skillId: string, recent: boolean[]): SkillProgress => ({
  skillId,
  stage: 1,
  due: null,
  attempts: recent.length,
  correct: recent.filter(Boolean).length,
  recent,
  maintained: 0,
  best: 0,
  lastPracticed: null,
});

const rowsTables = [{ skillId: 'm5-tables', answered: 3, correct: 1 }];

describe('oftenMissed', () => {
  it('ne compte que les 10 dernières réponses', () => {
    const old = Array<boolean>(5).fill(false);
    expect(recentErrors(progress('m5-tables', [...old, ...Array<boolean>(10).fill(true)]))).toBe(0);
  });

  it(`propose une notion à partir de ${OFTEN_MISSED} erreurs récentes`, () => {
    const often = progress('m5-tables', [true, false, true, false, false]);
    expect(oftenMissed(rowsTables, [often])).toMatchObject({ skillId: 'm5-tables', errors: 3 });
  });

  it('ne propose rien en dessous du seuil', () => {
    expect(oftenMissed(rowsTables, [progress('m5-tables', [true, false, true, false, true])])).toBeNull();
  });

  it('ignore une notion hors entraînement', () => {
    expect(oftenMissed(rowsTables, [progress('inconnue', [false, false, false])])).toBeNull();
  });

  it('reste dans la matière de la partie : pas de maths après un test d’anglais', () => {
    const maths = progress('m5-tables', [false, false, false]);
    const english = progress('a6-be-preterit', [false, false, false]);
    const playedEnglish = [{ skillId: 'a6-present-3e-personne', answered: 3, correct: 1 }];
    expect(oftenMissed(playedEnglish, [maths])).toBeNull();
    expect(oftenMissed(playedEnglish, [maths, english])).toMatchObject({ skillId: 'a6-be-preterit' });
    const playedMaths = [{ skillId: 'm5-tables', answered: 3, correct: 1 }];
    expect(oftenMissed(playedMaths, [english])).toBeNull();
    expect(oftenMissed([], [maths])).toBeNull();
  });
});
