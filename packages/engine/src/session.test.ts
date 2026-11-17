import { describe, expect, it } from 'vitest';
import {
  isFinished,
  nextQuestion,
  perSkill,
  recordAnswer,
  regularCount,
  startTraining,
  TRAINING_LENGTH,
} from './session.ts';
import { newSkillState, type SkillState } from './srs.ts';

const today = '2026-11-16';
const none = new Map<string, SkillState>();

describe('série d’entraînement', () => {
  it('10 questions régulières, variante après chaque erreur', () => {
    let s = startTraining(['a'], none);
    let seed = 1;
    while (!isFinished(s)) {
      const q = nextQuestion(s, none, today, 0.5, seed++);
      const wrong = !q.variant && regularCount(s) % 3 === 0; // une erreur toutes les 3 questions
      s = recordAnswer(s, q, !wrong);
      if (wrong) expect(s.pendingVariant).toEqual({ skillId: 'a', level: q.level });
    }
    expect(regularCount(s)).toBe(TRAINING_LENGTH);
    expect(s.answers.filter((a) => a.variant)).toHaveLength(4);
  });

  it('une variante ratée ne déclenche pas de nouvelle variante', () => {
    let s = startTraining(['a'], none);
    const q1 = nextQuestion(s, none, today, 0, 1);
    s = recordAnswer(s, q1, false);
    const q2 = nextQuestion(s, none, today, 0, 2);
    expect(q2.variant).toBe(true);
    s = recordAnswer(s, q2, false);
    expect(s.pendingVariant).toBeNull();
  });

  it('niveau 1 passé après 2 réussites, niveau 3 après 3 de plus, descend après 2 erreurs', () => {
    let s = startTraining(['a'], none);
    s = recordAnswer(s, nextQuestion(s, none, today, 0, 0), true);
    expect(s.levels.a).toBe(1);
    s = recordAnswer(s, nextQuestion(s, none, today, 0, 1), true);
    expect(s.levels.a).toBe(2);
    for (let i = 2; i < 4; i++) s = recordAnswer(s, nextQuestion(s, none, today, 0, i), true);
    expect(s.levels.a).toBe(2);
    s = recordAnswer(s, nextQuestion(s, none, today, 0, 4), true);
    expect(s.levels.a).toBe(3);
    s = recordAnswer(s, nextQuestion(s, none, today, 0, 5), false);
    s = recordAnswer(s, nextQuestion(s, none, today, 0, 6), false);
    expect(s.levels.a).toBe(2);
    s = recordAnswer(s, nextQuestion(s, none, today, 0, 10), false);
    s = recordAnswer(s, nextQuestion(s, none, today, 0, 11), false); // variante ratée
    expect(s.levels.a).toBe(1);
  });

  it('niveau de départ 2 pour une notion déjà réussie deux fois', () => {
    const states = new Map([['a', { ...newSkillState('a'), stage: 2 as const, due: '2026-11-20' }]]);
    expect(startTraining(['a'], states).levels.a).toBe(2);
  });

  it('privilégie les notions nouvelles et évite la répétition immédiate', () => {
    const states = new Map([['acquise', { ...newSkillState('acquise'), stage: 3 as const, due: '2026-12-20' }]]);
    let s = startTraining(['nouvelle', 'acquise'], states);
    const counts = { nouvelle: 0, acquise: 0 };
    for (let i = 0; i < 400; i++) {
      const q = nextQuestion({ ...s, answers: [] }, states, today, (i % 100) / 100, i);
      counts[q.skillId as keyof typeof counts]++;
    }
    expect(counts.nouvelle).toBeGreaterThan(counts.acquise * 2);
    s = recordAnswer(s, { skillId: 'nouvelle', level: 1, seed: 1, variant: false }, true);
    expect(nextQuestion(s, states, today, 0, 2).skillId).toBe('acquise');
  });

  it('bilan par notion', () => {
    let s = startTraining(['a', 'b'], none);
    s = recordAnswer(s, { skillId: 'a', level: 1, seed: 1, variant: false }, true);
    s = recordAnswer(s, { skillId: 'b', level: 1, seed: 2, variant: false }, false);
    expect(perSkill(s).get('a')).toEqual({ answered: 1, correct: 1, answers: [true] });
    expect(perSkill(s).get('b')).toEqual({ answered: 1, correct: 0, answers: [false] });
  });
});
