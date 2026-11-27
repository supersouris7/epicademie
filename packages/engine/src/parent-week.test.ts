import { describe, expect, it } from 'vitest';
import type { Feeling, Journey } from '@epicademie/shared';
import { feelingSummary, weeklyAdvice, type FeelingFact } from './parent-week.ts';

const TODAY = '2026-11-20';
const on = (day: string, ...feelings: Feeling[]): FeelingFact[] => feelings.map((feeling) => ({ day, feeling }));

const journey = (effort: Partial<Journey['effort']> = {}, gains: Journey['gains'] = []): Journey => ({
  today: TODAY,
  gains,
  effort: { series: 2, days: 1, reworked: [], pauseDays: null, ...effort },
});
const calm = feelingSummary([], TODAY);

describe('ressenti agrégé', () => {
  it('compte les 7 derniers jours et les 4 semaines d’avant, pas au-delà', () => {
    const facts = [
      ...on(TODAY, 3),
      ...on('2026-11-14', 1),
      ...on('2026-11-13', 2),
      ...on('2026-10-17', 2),
      ...on('2026-10-16', 1),
    ];
    expect(feelingSummary(facts, TODAY)).toEqual({
      week: { pasEncore: 1, unPeu: 0, oui: 1 },
      before: { pasEncore: 0, unPeu: 2, oui: 0 },
      trend: null,
    });
  });

  it.each([
    ['hausse', [3, 3, 2], [1, 2, 2]],
    ['stable', [2, 2, 2], [2, 2, 2]],
    ['baisse', [1, 1, 2], [3, 2, 2]],
  ] as const)('tendance %s à partir de 3 réponses de chaque côté', (trend, now, then) => {
    const facts = [...on(TODAY, ...now), ...on('2026-11-01', ...then)];
    expect(feelingSummary(facts, TODAY).trend).toBe(trend);
    expect(feelingSummary(facts.slice(1), TODAY).trend).toBeNull();
  });
});

describe('conseil de la semaine', () => {
  const gain = {
    skillId: 'm5-tables',
    before: { day: '2026-11-01', correct: 1, answered: 4 },
    now: { day: TODAY, correct: 3, answered: 4 },
  };
  const low = feelingSummary(on(TODAY, 1, 1, 3), TODAY);

  it('aucune séance : proposer un moment, quel que soit le reste', () => {
    expect(weeklyAdvice(journey({ series: 0, days: 0 }), low)).toBe('proposer');
  });

  it('priorités : rassurer, reprise, persévérance, progrès, régularité, effort', () => {
    const all = { pauseDays: 9, reworked: ['m5-tables'], days: 4 };
    expect(weeklyAdvice(journey(all, [gain]), low)).toBe('rassurer');
    expect(weeklyAdvice(journey(all, [gain]), calm)).toBe('reprise');
    expect(weeklyAdvice(journey({ ...all, pauseDays: null }, [gain]), calm)).toBe('perseverance');
    expect(weeklyAdvice(journey({ days: 4 }, [gain]), calm)).toBe('progres');
    expect(weeklyAdvice(journey({ days: 3 }), calm)).toBe('regularite');
    expect(weeklyAdvice(journey({ days: 2 }), calm)).toBe('effort');
  });

  it('un seul « pas encore » isolé ne suffit pas ; un recul du ressenti suffit', () => {
    expect(weeklyAdvice(journey(), feelingSummary(on(TODAY, 1), TODAY))).toBe('effort');
    const down = feelingSummary([...on(TODAY, 2, 2, 2), ...on('2026-11-01', 3, 3, 3)], TODAY);
    expect(weeklyAdvice(journey(), down)).toBe('rassurer');
  });
});
