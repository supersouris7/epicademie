import { describe, expect, it } from 'vitest';
import { evolution } from './evaluationNotes.ts';

const item = (id: string, mastery: number | null) => ({
  id,
  kind: 'origines' as const,
  subject: 'maths' as const,
  referentialGrade: 'cm2',
  referentialVersion: 1,
  schoolYear: 2026,
  finishedAt: '2026-11-20T10:00:00.000Z',
  partial: false,
  mastery,
  coverage: null,
  studied: null,
  evaluatedCount: 0,
  masteredCount: 0,
});

describe('évolution des notes (Espace parent)', () => {
  it('compare la dernière note à la précédente notée', () => {
    expect(evolution([item('b', 75), item('a', 60)])).toEqual({ text: '12/20 → 15/20 (+3)', delta: 3 });
    expect(evolution([item('c', 50), item('b', null), item('a', 60)])?.text).toBe('12/20 → 10/20 (−2)');
    expect(evolution([item('a', 60)])).toBeNull();
  });
});
