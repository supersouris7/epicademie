import { describe, expect, it } from 'vitest';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import type { Level, Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { NOTIONS, SKILLS, SOURCE } from './reperes-6e.ts';

const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];

const questions = (id: string, level: Level, count = 100): Question[] => {
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

describe('histoire 6e — Se repérer dans le temps', () => {
  it('propose les quatre notions du référentiel, en 5 niveaux', () => {
    expect(SKILLS.map((s) => s.id)).toEqual([
      'h6-frise-antiquite',
      'h6-avant-apres-jc',
      'h6-millenaires-siecles',
      'h6-reperes-annuels',
    ]);
    for (const s of SKILLS) expect(s.levels, s.id).toBe(5);
  });

  it('cite pour chaque fait une source du registre et une citation exacte', () => {
    expect(getSource(SOURCE)).toBeDefined();
    for (const s of SKILLS) for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
    for (const n of NOTIONS) {
      for (const f of [...n.faits, ...n.libres, ...n.docs.flatMap((d) => d.qs)]) {
        expect(f.quote.trim().length, n.id).toBeGreaterThan(10);
        if (f.source) expect(getSource(f.source), f.source).toBeDefined();
        expect(f.explain.trim().length, n.id).toBeGreaterThan(0);
      }
    }
  });

  it('prévoit au moins deux erreurs typiques expliquées par fait', () => {
    for (const n of NOTIONS) {
      for (const f of n.faits) {
        expect(f.wrong.length, n.id).toBeGreaterThanOrEqual(3);
        for (const w of f.wrong) expect(w.why.trim().length, n.id).toBeGreaterThan(0);
      }
      for (const l of n.libres) expect(l.traps.length, n.id).toBeGreaterThanOrEqual(2);
      for (const d of n.docs) for (const q of d.qs) expect(q.wrong.length, n.id).toBeGreaterThanOrEqual(2);
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
});
