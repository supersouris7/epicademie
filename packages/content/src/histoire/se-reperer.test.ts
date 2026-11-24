import { describe, expect, it } from 'vitest';
import { check } from '../check.ts';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import type { Level, Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { PREUVES } from './se-reperer-sources.ts';
import { EVENEMENTS, SKILLS, centuryOf, toRoman } from './se-reperer.ts';

const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];

const questions = (id: string, level: Level, count = 200): Question[] => {
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

describe('histoire cm1 — Se repérer dans le temps', () => {
  it('propose les quatre notions du référentiel, en 5 niveaux', () => {
    expect(SKILLS.map((s) => s.id)).toEqual([
      'hcm1-siecles-romains',
      'hcm1-frise-chronologique',
      'hcm1-avant-apres-jc',
      'hcm1-ordonner-evenements',
    ]);
    for (const s of SKILLS) expect(s.levels, s.id).toBe(5);
  });

  it('cite pour chaque fait une source du registre et une citation exacte', () => {
    for (const p of Object.values(PREUVES)) {
      expect(getSource(p.source), p.source).toBeDefined();
      expect(p.quote.trim().length, p.source).toBeGreaterThan(10);
    }
    for (const s of SKILLS) for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
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

  it('prévoit au moins deux erreurs typiques expliquées pour chaque choix et chaque saisie', () => {
    for (const s of SKILLS) {
      for (const q of LEVELS.flatMap((level) => questions(s.id, level))) {
        if (q.answer.kind !== 'choice' && q.answer.kind !== 'text') continue;
        expect(q.traps.length, q.prompt).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('écrit les chiffres romains et calcule les siècles', () => {
    expect([1, 4, 6, 9, 11, 13, 14, 18, 19, 21].map(toRoman)).toEqual([
      'I',
      'IV',
      'VI',
      'IX',
      'XI',
      'XIII',
      'XIV',
      'XVIII',
      'XIX',
      'XXI',
    ]);
    expect([1, 100, 101, 800, 1789, 1800, 1801, 2000, 2001].map(centuryOf)).toEqual([1, 1, 2, 8, 18, 18, 19, 20, 21]);
  });

  it('juge juste le siècle écrit en chiffres romains ou arabes, et faux le siècle voisin', () => {
    for (const q of questions('hcm1-siecles-romains', 4)) {
      const year = Number(/année (\d+)/.exec(q.prompt)![1]);
      const c = Math.floor((year - 1) / 100) + 1;
      const answer = (text: string) => check(q, { kind: 'text', text }).correct;
      expect(answer(`${toRoman(c)}e siècle`), q.prompt).toBe(true);
      expect(answer(`${c}e`), q.prompt).toBe(true);
      expect(answer(`${c + 1}e`), q.prompt).toBe(false);
      expect(answer(`${c - 1}e`), q.prompt).toBe(false);
    }
  });

  it('avant J.-C., la date la plus ancienne est la plus grande', () => {
    for (const q of questions('hcm1-avant-apres-jc', 2)) {
      if (q.answer.kind !== 'choice') continue;
      const value = (label: string) => (label.includes('av.') ? -1 : 1) * Number(/\d+/.exec(label)![0]);
      expect(value(q.answer.options[q.answer.correct]!), q.prompt).toBe(Math.min(...q.answer.options.map(value)));
    }
  });

  it('range les événements du plus ancien au plus récent', () => {
    const labels = EVENEMENTS.map((e) => e.label);
    expect([...EVENEMENTS].sort((a, b) => a.t - b.t).map((e) => e.label)).toEqual(labels);
    for (const level of [3, 4, 5] as const) {
      for (const q of questions('hcm1-ordonner-evenements', level)) {
        if (q.answer.kind !== 'order') continue;
        const { items, correct } = q.answer;
        const ranks = correct.map((i) => labels.findIndex((l) => items[i]!.startsWith(l)));
        expect(ranks, q.prompt).toEqual([...ranks].sort((a, b) => a - b));
        expect(ranks).not.toContain(-1);
      }
    }
  });
});
