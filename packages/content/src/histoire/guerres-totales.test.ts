import { describe, expect, it } from 'vitest';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import type { Level, Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { NOTIONS, SKILLS, SOURCE } from './guerres-totales.ts';

const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];

const questions = (id: string, level: Level, count = 150): Question[] => {
  const s = SKILLS.find((x) => x.id === id)!;
  return Array.from({ length: count }, (_, seed) => ({
    traps: [],
    targetSeconds: 30,
    ...s.generate(createRng(seed), level),
    skillId: id,
    level,
    seed,
  }));
};

const preuves = (n: (typeof NOTIONS)[number]) => [
  ...n.faits,
  ...n.libres,
  ...n.docs.flatMap((d) => d.qs),
  ...(n.frise ?? []),
];

describe('histoire 3e — La Première Guerre mondiale et les totalitarismes', () => {
  it('propose les quatre notions du référentiel, en 5 niveaux', () => {
    expect(SKILLS.map((s) => s.id)).toEqual([
      'h3-guerre-totale',
      'h3-genocide-armeniens',
      'h3-democraties-fragilisees',
      'h3-regimes-totalitaires',
    ]);
    for (const s of SKILLS) expect([s.levels, s.version], s.id).toEqual([5, 1]);
  });

  it('cite pour chaque fait une source du registre, déclarée par la notion, et une citation', () => {
    NOTIONS.forEach((n, i) => {
      expect(SKILLS[i]!.lesson.sources, n.id).toContain(SOURCE);
      for (const p of preuves(n)) {
        expect(getSource(p.source!), p.source).toBeDefined();
        expect(SKILLS[i]!.lesson.sources, n.id).toContain(p.source);
        expect(p.quote.trim().length, n.id).toBeGreaterThan(10);
      }
    });
  });

  it('prévoit des erreurs typiques expliquées et assez de matière', () => {
    for (const n of NOTIONS) {
      expect(n.faits.length, n.id).toBeGreaterThanOrEqual(8);
      expect(n.paires3.length, n.id).toBe(3);
      expect(n.paires5.length, n.id).toBe(5);
      expect(n.libres.length, n.id).toBeGreaterThanOrEqual(5);
      for (const f of n.faits) expect(f.wrong.length, n.id).toBeGreaterThanOrEqual(3);
      for (const l of n.libres) expect(l.traps.length, n.id).toBeGreaterThanOrEqual(2);
      expect(n.docs.length, n.id).toBeGreaterThanOrEqual(2);
      for (const d of n.docs) for (const q of d.qs) expect(q.wrong.length, n.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('range chaque frise du plus ancien au plus récent', () => {
    for (const n of NOTIONS) {
      const years = n.frise!.map((r) => Number(/\d{4}/.exec(r.date)![0]));
      expect(
        [...new Set(years)].sort((a, b) => a - b),
        n.id,
      ).toEqual(years);
    }
  });

  it('produit des questions valides et différentes à chaque niveau', () => {
    for (const s of SKILLS) {
      const prompts = LEVELS.map((level) => {
        const qs = questions(s.id, level);
        expect(validateVariants(qs), `${s.id} niveau ${level}`).toEqual([]);
        return [...new Set(qs.map((q) => q.prompt))].sort().join('|');
      });
      expect(new Set(prompts).size, s.id).toBe(5);
    }
  });

  it('accepte les réponses libres justes et refuse leurs pièges', () => {
    for (const [i, n] of NOTIONS.entries()) {
      for (const l of n.libres) {
        const question = questions(SKILLS[i]!.id, 4).find((q) => q.prompt.endsWith(l.q))!;
        for (const text of l.accepted) expect(check(question, { kind: 'text', text }).correct, text).toBe(true);
        for (const t of l.traps) expect(check(question, { kind: 'text', text: t.text }).correct, t.text).toBe(false);
      }
    }
  });

  it('définit au glossaire chaque terme en gras des mémos', () => {
    for (const n of NOTIONS) {
      for (const term of n.memo.flatMap(boldTerms)) {
        expect(isDefined(term, SUBJECT_GLOSSARIES.histoire!), term).toBe(true);
      }
    }
  });
});
