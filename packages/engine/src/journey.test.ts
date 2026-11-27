import { describe, expect, it } from 'vitest';
import { epreuveStep, journey } from './journey.ts';
import type { AnswerFact } from './learning.ts';

const TODAY = '2026-11-27';
let n = 0;
const fact = (day: string, correct: boolean, over: Partial<AnswerFact> = {}): AnswerFact => ({
  skillId: 'm6-rang',
  attempt: 1,
  correct,
  hinted: false,
  collective: false,
  at: `${day}T10:00:${String(n++ % 60).padStart(2, '0')}.000Z`,
  day,
  mode: 'entrainement',
  diagnosis: null,
  ...over,
});
const series = (day: string, right: number, total: number, over: Partial<AnswerFact> = {}) =>
  Array.from({ length: total }, (_, i) => fact(day, i < right, over));
const of = (facts: AnswerFact[], seriesDays: string[] = []) => journey({ facts, seriesDays, today: TODAY });

describe('progrès personnel', () => {
  it('compare cette semaine à avant : « 4 sur 10, puis 8 sur 10 »', () => {
    const { gains } = of([...series('2026-11-13', 4, 10), ...series(TODAY, 8, 10)]);
    expect(gains).toEqual([
      {
        skillId: 'm6-rang',
        before: { day: '2026-11-13', correct: 4, answered: 10 },
        now: { day: TODAY, correct: 8, answered: 10 },
      },
    ]);
  });

  it('ne montre jamais un recul, ni une comparaison sur trop peu de réponses', () => {
    expect(of([...series('2026-11-13', 9, 10), ...series(TODAY, 5, 10)]).gains).toEqual([]);
    expect(of([...series('2026-11-13', 1, 3), ...series(TODAY, 8, 10)]).gains).toEqual([]);
    expect(of([...series('2026-11-13', 1, 10), ...series(TODAY, 3, 3)]).gains).toEqual([]);
  });

  it('ignore les seconds essais, les réponses à plusieurs et les épreuves de mesure', () => {
    const before = series('2026-11-13', 1, 4);
    for (const over of [{ attempt: 2 as const }, { collective: true }, { mode: 'evaluation' as const }]) {
      expect(of([...before, ...series(TODAY, 4, 4, over)]).gains).toEqual([]);
    }
  });

  it('range les plus fortes hausses d’abord, cinq au plus', () => {
    const facts = Array.from({ length: 7 }, (_, i) => [
      ...series('2026-11-13', 0, 8, { skillId: `s${i}` }),
      ...series(TODAY, i + 1, 8, { skillId: `s${i}` }),
    ]).flat();
    expect(of(facts).gains.map((g) => g.skillId)).toEqual(['s6', 's5', 's4', 's3', 's2']);
  });
});

describe('efforts de la semaine', () => {
  it('compte séries et jours des 7 derniers jours', () => {
    const { effort } = of(
      [fact('2026-11-20', true), fact('2026-11-21', true), fact(TODAY, true), fact(TODAY, true)],
      ['2026-11-20', '2026-11-21', TODAY, TODAY],
    );
    expect(effort).toMatchObject({ series: 3, days: 2, reworked: [], pauseDays: null });
  });

  it('notion retravaillée après une réponse pas encore juste, réussie ou non', () => {
    expect(of([fact(TODAY, false), fact(TODAY, false)]).effort.reworked).toEqual(['m6-rang']);
    expect(of([fact('2026-11-01', false), fact(TODAY, true)]).effort.reworked).toEqual(['m6-rang']);
    expect(of([fact(TODAY, true), fact(TODAY, false)]).effort.reworked).toEqual([]);
    expect(of([fact('2026-11-01', false), fact('2026-11-02', true)]).effort.reworked).toEqual([]);
  });

  it('retour après une pause d’au moins 7 jours', () => {
    expect(of([fact('2026-11-10', true), fact('2026-11-25', true), fact(TODAY, true)]).effort.pauseDays).toBe(15);
    expect(of([fact('2026-11-21', true), fact(TODAY, true)]).effort.pauseDays).toBeNull();
    expect(of([fact('2026-10-01', true), fact('2026-11-01', true)]).effort.pauseDays).toBeNull();
  });
});

describe('étapes avant les 80 % de l’épreuve', () => {
  it('départ, mi-chemin, tout près, avec ce qu’il reste', () => {
    expect(epreuveStep(2, 10)).toEqual({ step: 'depart', missing: 6 });
    expect(epreuveStep(4, 10)).toEqual({ step: 'mi-chemin', missing: 4 });
    expect(epreuveStep(7, 10)).toEqual({ step: 'proche', missing: 1 });
    expect(epreuveStep(8, 10)).toEqual({ step: 'proche', missing: 0 });
    expect(epreuveStep(0, 0)).toEqual({ step: 'depart', missing: 0 });
  });
});
