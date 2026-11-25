import { describe, expect, it } from 'vitest';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import type { Level, Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { HISTOIRE_CHAPTERS } from './index.ts';
import { NOTIONS, SKILLS } from './recits-fondateurs.ts';

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

describe('histoire 6e — Récits fondateurs et citoyenneté', () => {
  it('propose les quatre notions du référentiel, en 5 niveaux, dans un chapitre de 6e', () => {
    expect(SKILLS.map((s) => s.id)).toEqual([
      'h6-cites-grecques',
      'h6-rome-mythe-histoire',
      'h6-monotheisme-juif',
      'h6-citoyennete-athenes-rome',
    ]);
    for (const s of SKILLS) expect(s.levels, s.id).toBe(5);
    expect(HISTOIRE_CHAPTERS.find((c) => c.id === 'h6-recits-fondateurs')).toMatchObject({ grade: '6e' });
  });

  it('cite pour chaque fait une source du registre et une citation exacte', () => {
    for (const s of SKILLS) {
      expect(s.lesson.sources).toContain('cycle3-2020');
      for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
    }
    for (const n of NOTIONS) {
      for (const f of [...n.faits, ...n.libres, ...n.docs.flatMap((d) => d.qs), ...(n.frise ?? [])]) {
        expect(f.quote.trim().length, n.id).toBeGreaterThan(10);
        if (f.source) expect(getSource(f.source), f.source).toBeDefined();
      }
    }
  });

  it('prévoit des erreurs typiques expliquées', () => {
    for (const n of NOTIONS) {
      for (const f of n.faits) expect(f.wrong.length, n.id).toBe(3);
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

  it('accepte les variantes d’écriture des réponses libres', () => {
    for (const n of NOTIONS) {
      for (const l of n.libres) {
        const question = questions(n.id, 4).find((x) => x.prompt.endsWith(l.q))!;
        for (const text of l.accepted) expect(check(question, { kind: 'text', text }).correct, text).toBe(true);
        for (const t of l.traps) expect(check(question, { kind: 'text', text: t.text }).correct, t.text).toBe(false);
      }
    }
  });

  it('définit dans le glossaire les termes en gras des mémos', () => {
    for (const n of NOTIONS) {
      for (const term of n.memo.flatMap(boldTerms))
        expect(isDefined(term, SUBJECT_GLOSSARIES.histoire!), term).toBe(true);
    }
  });
});
