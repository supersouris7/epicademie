import { describe, expect, it } from 'vitest';
import { learningReport, mondayOf, skillStatus, tallyOf, trendOf, type AnswerFact } from './learning.ts';

let n = 0;
/** Réponse fictive : par défaut 1re réponse individuelle juste sans aide, en entraînement. */
const fact = (over: Partial<AnswerFact> = {}): AnswerFact => {
  n++;
  return {
    skillId: 'm5-tables',
    attempt: 1,
    correct: true,
    hinted: false,
    collective: false,
    at: `2026-11-${String(10 + Math.floor(n / 100)).padStart(2, '0')}T10:${String(n % 60).padStart(2, '0')}:00.000Z`,
    day: '2026-11-10',
    mode: 'entrainement',
    diagnosis: null,
    ...over,
  };
};
const series = (pattern: string, over: Partial<AnswerFact> = {}) =>
  Array.from(pattern, (c) => fact({ correct: c === '1', ...over }));

describe('comptes des réponses', () => {
  it('sépare réussite autonome, réussite avec aide et réponses collectives', () => {
    const t = tallyOf([
      fact(), // autonome
      fact({ hinted: true }), // juste avec l'indice (combat)
      fact({ correct: false }), // 1re réponse fausse…
      fact({ attempt: 2, hinted: true }), // …réussie au second essai
      fact({ collective: true }), // réponse donnée à plusieurs
    ]);
    expect(t).toEqual({ answered: 3, autonomous: 1, helped: 2, hints: 2, collective: 1 });
  });
});

describe('état pédagogique d’une notion', () => {
  it('pas commencée, puis « en progression » tant qu’il y a moins de 4 réponses', () => {
    expect(skillStatus([])).toBe('non-commencee');
    expect(skillStatus(series('11'))).toBe('en-progression');
  });

  it('à travailler : moins de 50 % de réussite autonome récente, ou 2 échecs de suite', () => {
    expect(skillStatus(series('1100100'))).toBe('a-travailler');
    expect(skillStatus(series('1111111100'))).toBe('a-travailler');
  });

  it('en progression entre 50 et 80 % ; à consolider au-delà ; acquise si la révision l’a validée', () => {
    expect(skillStatus(series('1101101'))).toBe('en-progression');
    expect(skillStatus(series('1111101111'))).toBe('a-consolider');
    expect(skillStatus(series('1111101111'), { stage: 3, due: '2026-12-10' })).toBe('acquise');
  });

  it('une réussite avec aide n’est pas une maîtrise personnelle', () => {
    expect(skillStatus(series('111111', { hinted: true }))).toBe('a-travailler');
  });

  it('seules les 10 dernières réponses comptent : on peut progresser après un mauvais départ', () => {
    expect(skillStatus(series('0000000000111111111'))).toBe('a-consolider');
  });

  it('tendance : 5 dernières réponses contre les 5 précédentes', () => {
    expect(trendOf(series('11111'))).toBeNull();
    expect(trendOf(series('0000011111'))).toBe('hausse');
    expect(trendOf(series('1111100000'))).toBe('baisse');
    expect(trendOf(series('1010110101'))).toBe('stable');
  });
});

describe('rapport de suivi', () => {
  const places: Record<string, { chapterId: string; subject: 'maths' | 'anglais' }> = {
    'm5-tables': { chapterId: 'm5-calcul', subject: 'maths' },
    'm5-priorites': { chapterId: 'm5-calcul', subject: 'maths' },
    'en-colors': { chapterId: 'en-cm1-1', subject: 'anglais' },
  };
  const placeOf = (id: string) => places[id];

  it('notions, chapitres, matières ; notions retirées du contenu ignorées', () => {
    const report = learningReport({
      facts: [
        ...series('0010', { skillId: 'm5-priorites' }),
        ...series('1111'),
        ...series('11', { skillId: 'en-colors' }),
        fact({ skillId: 'notion-retiree' }),
      ],
      reviews: new Map(),
      placeOf,
      today: '2026-11-20',
    });
    expect(report.skills.map((s) => [s.skillId, s.status])).toEqual([
      ['en-colors', 'en-progression'],
      ['m5-priorites', 'a-travailler'],
      ['m5-tables', 'a-consolider'],
    ]);
    expect(report.chapters.find((c) => c.chapterId === 'm5-calcul')).toMatchObject({
      tally: { answered: 8, autonomous: 5 },
      statuses: { 'a-travailler': 1, 'a-consolider': 1 },
    });
    expect(report.subjects.map((s) => s.subject)).toEqual(['anglais', 'maths']);
    expect(report.tally.answered).toBe(10);
    expect(report.toRework).toEqual(['m5-priorites']);
  });

  it('erreurs récurrentes, révisions dues, notion seulement planifiée', () => {
    const why = 'Les priorités : la multiplication passe avant l’addition.';
    const report = learningReport({
      facts: [
        fact({ skillId: 'm5-priorites', correct: false, diagnosis: why }),
        fact({ skillId: 'm5-priorites', correct: false, diagnosis: why }),
        fact({ skillId: 'm5-priorites', correct: false, diagnosis: 'Une seule fois' }),
      ],
      reviews: new Map([
        ['m5-priorites', { stage: 1 as const, due: '2026-11-19' }],
        ['m5-tables', { stage: 2 as const, due: '2026-11-25' }],
      ]),
      placeOf,
      today: '2026-11-20',
    });
    const prio = report.skills.find((s) => s.skillId === 'm5-priorites');
    expect(prio?.recurringErrors).toEqual([{ text: why, count: 2 }]);
    expect(report.dueReviews).toEqual(['m5-priorites']);
    expect(report.skills.find((s) => s.skillId === 'm5-tables')).toMatchObject({
      status: 'non-commencee',
      nextReview: '2026-11-25',
    });
  });

  it('8 semaines, de la plus ancienne à la plus récente, avec les modes joués', () => {
    const report = learningReport({
      facts: [fact({ day: '2026-11-18', mode: 'boss' }), fact({ day: '2026-11-16' }), fact({ day: '2026-10-01' })],
      reviews: new Map(),
      placeOf,
      today: '2026-11-20',
    });
    expect(report.weeks).toHaveLength(8);
    expect(report.weeks.at(-1)).toMatchObject({
      week: '2026-11-16',
      tally: { answered: 2 },
      modes: ['boss', 'entrainement'],
    });
    expect(report.weeks[0]?.week).toBe('2026-09-28');
    expect(report.weeks[0]?.tally.answered).toBe(1);
  });

  it('lundi de la semaine', () => {
    expect(mondayOf('2026-11-20')).toBe('2026-11-16');
    expect(mondayOf('2026-11-16')).toBe('2026-11-16');
    expect(mondayOf('2026-11-22')).toBe('2026-11-16');
  });
});
