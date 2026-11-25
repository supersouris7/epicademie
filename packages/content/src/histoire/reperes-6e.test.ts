import { describe, expect, it } from 'vitest';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES } from '../glossaires.ts';
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

  it('sépare préhistoire et Antiquité et ne cite plus de durée non sourcée', () => {
    const [frise] = NOTIONS;
    expect(frise!.memo[1]).toContain('commence par la **préhistoire**');
    expect(frise!.memo[1]).toContain('vu en CM1');
    expect(JSON.stringify(frise)).not.toMatch(/immense|dépasse/);
    for (const f of frise!.faits) expect(f.wrong.length).toBeGreaterThanOrEqual(3);
  });

  it('donne des indices de méthode qui ne soufflent aucune réponse', () => {
    const hint = (id: string) => NOTIONS.find((n) => n.id === id)!.hint;
    expect(hint('h6-millenaires-siecles')).not.toMatch(/\d|cent|mille ans/);
    expect(hint('h6-reperes-annuels')).not.toMatch(/humanité|antique|romain/);
  });

  it('accepte les écritures justes des réponses libres', () => {
    const cases: [string, RegExp, string[]][] = [
      ['h6-frise-antiquite', /empire romain/, ['Ve siècle apr. J.-C.', 'Ve siècle après J.-C.']],
      ['h6-millenaires-siecles', /millénaire \?/, ['1000 ans', '1 000 ans', 'mille ans']],
      ['h6-millenaires-siecles', /commence en quelle année/, ['200 av JC', '200 avant JC']],
    ];
    for (const [id, q, answers] of cases) {
      const libre = NOTIONS.find((n) => n.id === id)!.libres.find((l) => q.test(l.q))!;
      for (const text of answers) {
        const question = questions(id, 4).find((x) => x.prompt.endsWith(libre.q))!;
        expect(check(question, { kind: 'text', text }).correct, text).toBe(true);
      }
    }
    const gap = NOTIONS[1]!.faits.find((f) => f.gap[0].includes('plus la date est'))!.gap[2];
    expect(gap).toContain('éloignée');
  });

  it('définit les mots difficiles ajoutés au glossaire', () => {
    // « démocratie » est définie par le glossaire d’EMC, réuni à celui d’histoire : pas de doublon.
    const ids = SUBJECT_GLOSSARIES.histoire!.map((g) => g.id);
    for (const id of ['cite', 'democratie', 'citoyennete', 'han', 'route-soie']) expect(ids).toContain(id);
  });
});
