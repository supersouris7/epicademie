import { describe, expect, it } from 'vitest';
import { CHAPTERS } from './catalog.ts';
import { CE2_CHAPTERS, generateCe2 } from './ce2.ts';
import { check } from './check.ts';
import { fmt } from './rational.ts';
import type { Level, Question, Response } from './types.ts';
import { validateVariants } from './validate.ts';

const LEVELS: Level[] = [1, 2, 3];
const skills = CE2_CHAPTERS.flatMap((c) => c.skills);

function perfect(q: Question): Response {
  const a = q.answer;
  switch (a.kind) {
    case 'number':
      return { kind: 'number', text: fmt(a.value) };
    case 'fraction':
      return { kind: 'fraction', num: String(a.value.n), den: String(a.value.d) };
    case 'choice':
      return { kind: 'choice', index: a.correct };
    case 'point':
      return { kind: 'point', x: a.x, y: a.y };
    case 'zone':
      return { kind: 'zone', zone: a.zone };
    case 'text':
      return { kind: 'text', text: a.accepted[0] ?? '' };
    case 'order':
      return { kind: 'order', order: [...a.correct] };
    case 'match':
      return { kind: 'match', pairs: [...a.pairs] };
    case 'cloze':
      return {
        kind: 'cloze',
        answers: a.blanks.map((b) => (b.mode === 'list' ? (b.options[b.correct] ?? '') : (b.accepted[0] ?? ''))),
      };
  }
}

describe('fondamentaux du CE2', () => {
  it('couvre les neuf compétences attendues, sur trois domaines, hors Entraînement', () => {
    expect(CE2_CHAPTERS.map((c) => c.id)).toEqual([
      'mce2-nombres',
      'mce2-calcul-mental',
      'mce2-operations',
      'mce2-problemes',
      'mce2-fractions',
      'mce2-mesures',
      'mce2-durees',
      'mce2-geometrie',
      'mce2-donnees',
    ]);
    expect(new Set(CE2_CHAPTERS.map((c) => c.domain))).toEqual(
      new Set(['nombres', 'grandeurs', 'geometrie', 'donnees']),
    );
    expect(CHAPTERS.some((c) => c.grade === ('ce2' as string))).toBe(false);
  });

  it('chaque notion est sourcée (programme du cycle 2, CE2) et a un mémo court, des identifiants préfixés', () => {
    expect(new Set(skills.map((s) => s.id)).size).toBe(skills.length);
    for (const c of CE2_CHAPTERS)
      for (const s of c.skills) {
        expect(s.id.startsWith('mce2-'), s.id).toBe(true);
        expect(s.lesson.source, s.id).toMatch(/cycle 2, CE2 \(BO n°41 du 31 octobre 2024\) — « .{15,}/);
        expect(s.lesson.memo.length, s.id).toBeGreaterThan(0);
        expect(s.lesson.memo.length, s.id).toBeLessThanOrEqual(3);
      }
  });

  it.each(skills.map((s) => s.id))('%s : 150 graines × 3 niveaux, réponses acceptées, déterminisme', (id) => {
    for (const level of LEVELS) {
      const qs = Array.from({ length: 150 }, (_, i) => generateCe2(id, level, i + 1));
      expect(validateVariants(qs).map((i) => `${i.code} s${i.seed} ${i.message}`)).toEqual([]);
      for (const q of qs) {
        const ctx = `${id} L${level} s${q.seed}`;
        expect(q.steps.length, ctx).toBeGreaterThan(1);
        expect(q.hint.length, ctx).toBeGreaterThan(10);
        expect(q.steps.join(' '), ctx).toMatch(/\*\*/);
        expect(check(q, perfect(q)).correct, ctx).toBe(true);
        expect(generateCe2(id, level, q.seed), ctx).toEqual(q);
      }
    }
  });

  it('refuse une notion inconnue', () => {
    expect(() => generateCe2('mce2-inconnue', 1, 1)).toThrow();
  });
});
