import { describe, expect, it } from 'vitest';
import { planningStatus, recommendedReviews, skillWeight, startLevel } from './adaptive.ts';
import { newSkillState, type SkillState, type Stage } from './srs.ts';

const today = '2026-11-20';
/** État de notion : réponses récentes ('1' juste, '0' faux), palier, échéance. */
const state = (id: string, recent: string, stage: Stage = 1, due: string | null = '2026-12-01'): SkillState => ({
  ...newSkillState(id),
  stage,
  due,
  recent: Array.from(recent, (c) => c === '1'),
});

describe('état pédagogique utilisé par le moteur', () => {
  it('mêmes règles que le suivi des apprentissages', () => {
    expect(planningStatus(undefined)).toBe('non-commencee');
    expect(planningStatus(state('a', '11'))).toBe('en-progression');
    expect(planningStatus(state('a', '1100100'))).toBe('a-travailler');
    expect(planningStatus(state('a', '1111111100'))).toBe('a-travailler');
    expect(planningStatus(state('a', '1101101'))).toBe('en-progression');
    expect(planningStatus(state('a', '1111101111', 2))).toBe('a-consolider');
    expect(planningStatus(state('a', '1111101111', 3))).toBe('acquise');
  });
});

describe('niveau de départ', () => {
  it('1 pour découvrir ou retravailler, 2 à consolider, 3 pour une notion acquise', () => {
    expect(startLevel(undefined)).toBe(1);
    expect(startLevel(state('a', '000110', 2))).toBe(1);
    expect(startLevel(state('a', '1101101', 1))).toBe(1);
    expect(startLevel(state('a', '1101101', 2))).toBe(2);
    expect(startLevel(state('a', '1111111111', 2))).toBe(2);
    expect(startLevel(state('a', '1111111111', 3))).toBe(3);
  });
});

describe('poids de tirage', () => {
  it('les notions fragiles passent avant les notions acquises', () => {
    const weak = skillWeight(state('a', '0001000'), today);
    const solid = skillWeight(state('b', '1111111111', 3, '2026-12-20'), today);
    expect(weak).toBeGreaterThan(solid);
  });

  it('une révision due remonte, d’autant plus qu’elle est en retard', () => {
    const notDue = skillWeight(state('a', '1111111111', 2, '2026-11-25'), today);
    const due = skillWeight(state('a', '1111111111', 2, '2026-11-19'), today);
    const late = skillWeight(state('a', '1111111111', 2, '2026-11-01'), today);
    expect(due).toBe(notDue + 2);
    expect(late).toBe(due + 1);
  });

  it('déjà travaillée aujourd’hui sans être due : espacée (poids divisé par deux)', () => {
    const s = state('a', '1101101', 1, '2026-11-25');
    expect(skillWeight(s, today, today)).toBe(skillWeight(s, today, '2026-11-18') / 2);
  });
});

describe('révisions recommandées', () => {
  it('notions étudiées et dues, puis « à travailler » non revues aujourd’hui ; triées par priorité', () => {
    const reviews = recommendedReviews(
      [
        state('jamais', ''),
        state('due-recente', '1111111111', 2, '2026-11-19'),
        state('due-ancienne', '1111111111', 2, '2026-11-01'),
        state('fragile', '0001000', 1, '2026-11-30'),
        state('fragile-vue', '0001000', 1, '2026-11-30'),
        state('pas-due', '1111111111', 2, '2026-11-30'),
      ],
      today,
      { lastPracticed: new Map([['fragile-vue', today]]) },
    );
    expect(reviews.map((r) => r.skillId)).toEqual(['due-ancienne', 'fragile', 'due-recente']);
    expect(reviews[1]).toMatchObject({ status: 'a-travailler' });
  });

  it('au plus 5 suggestions', () => {
    const many = Array.from({ length: 12 }, (_, i) => state(`n${i}`, '0001000'));
    expect(recommendedReviews(many, today)).toHaveLength(5);
  });
});
