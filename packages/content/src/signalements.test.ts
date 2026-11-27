import { describe, expect, it } from 'vitest';
import { generate, getAnySkill } from './catalog.ts';
import type { Level, Question } from './types.ts';

/** Corrections demandées par les joueurs : chaque cas reste vrai sur 60 graines. */
const sample = (id: string, level: Level): Question[] =>
  Array.from({ length: 60 }, (_, seed) => generate(id, level, seed));

const fractions = (text: string) => [...text.matchAll(/\{(\d+)\/(\d+)\}/g)].map((m) => [Number(m[1]), Number(m[2])]);

describe('retours des joueurs', () => {
  it('division euclidienne niveau 1 : petites tables, quotient seul', () => {
    for (const q of sample('m5-euclide', 1)) {
      expect(q.prompt).toContain('quotient');
      const [, divisor] = /de (\d+) par (\d+)/.exec(q.prompt)!.slice(1).map(Number);
      expect(divisor).toBeLessThanOrEqual(5);
    }
    expect(sample('m5-euclide', 2).some((q) => q.prompt.includes('reste'))).toBe(true);
  });

  it('fraction quotient niveau 1 : moins d’une unité, avec un dessin', () => {
    for (const q of sample('m6-fraction-quotient', 1)) {
      expect(q.answer.kind === 'fraction' && q.answer.value.n < q.answer.value.d).toBe(true);
      expect(q.demo?.kind).toBe('fraction');
    }
  });

  it('enchaînements de relatifs : parenthèses au niveau 3 seulement', () => {
    for (const level of [1, 2] as const) {
      for (const q of sample('m5-relatifs-sommes', level)) expect(q.prompt).not.toContain('(');
    }
    expect(sample('m5-relatifs-sommes', 3).every((q) => q.prompt.includes('('))).toBe(true);
  });

  it('boss des relatifs : le plus petit parmi trois négatifs proches', () => {
    for (const q of sample('m5-boss-relatifs-piege-comparer', 2)) {
      if (q.answer.kind !== 'choice') throw new Error('choix attendu');
      const values = q.answer.options.map((o) => Number(o.replace('−', '-').replace(',', '.')));
      expect(values.filter((v) => v < 0)).toHaveLength(3);
      expect(values[q.answer.correct]).toBe(Math.min(...values));
    }
  });

  it('boss des fractions : trois fractions de même numérateur, dessinées en gâteaux', () => {
    for (const q of sample('m5-boss-fractions-piege-comparer', 2)) {
      const shown = fractions(q.prompt);
      expect(new Set(shown.map(([n]) => n)).size).toBe(1);
      expect(shown).toHaveLength(3);
      if (q.answer.kind !== 'choice') throw new Error('choix attendu');
      const [[, best] = []] = fractions(q.answer.options[q.answer.correct]!);
      expect(best).toBe(Math.min(...shown.map(([, d]) => d!)));
      expect(q.demo).toMatchObject({ kind: 'fraction', shape: 'cake' });
    }
  });

  it('problèmes de fractions : une difficulté de plus par niveau', () => {
    const dens = (q: Question) => new Set(fractions(q.prompt).map(([, d]) => d)).size;
    for (const q of sample('m5-fractions-problemes', 1)) {
      expect([dens(q), q.prompt.includes('reste')]).toEqual([1, false]);
    }
    for (const q of sample('m5-fractions-problemes', 2)) {
      expect([dens(q), q.prompt.includes('reste')]).toEqual([1, true]);
    }
    for (const q of sample('m5-fractions-problemes', 3)) {
      const [[, a] = [], [, b] = []] = fractions(q.prompt);
      expect(b).toBe(a! * 2);
    }
  });

  it('problèmes de fractions : la réponse est juste', () => {
    for (const level of [1, 2, 3] as const) {
      for (const q of sample('m5-fractions-problemes', level)) {
        const [x, y] = fractions(q.prompt).map(([n, d]) => n! / d!);
        if (q.answer.kind !== 'fraction') throw new Error('fraction attendue');
        const value = q.answer.value.n / q.answer.value.d;
        expect(value).toBeCloseTo(level === 1 ? x! + y! : 1 - x! - y!);
        expect(value).toBeGreaterThan(0);
      }
    }
  });

  it('cinéma : chaque personne a sa place et son pop-corn', () => {
    for (const q of sample('m5-boss-operations-cinema', 2)) {
      expect(q.prompt).toContain('Chaque personne achète 1 place');
      const [n, place, pop] = q.prompt
        .match(/\d+/g)!
        .filter((v, i) => i !== 1 && i !== 3)
        .map(Number);
      expect(q.answer.kind === 'number' && q.answer.value.n).toBe(n! * (place! + pop!));
    }
  });

  it('estimation : la bonne proposition est le produit des dizaines arrondies', () => {
    for (const id of ['mcm1-estimer', 'mcm2-estimer']) {
      for (const q of sample(id, 1)) {
        if (q.answer.kind !== 'choice') throw new Error('choix attendu');
        const [a, b] = /de (\d+) × (\d+)/.exec(q.prompt)!.slice(1).map(Number);
        const expected = Math.round(a! / 10) * Math.round(b! / 10) * 100;
        expect(Number(q.answer.options[q.answer.correct]!.replace(/\D/g, ''))).toBe(expected);
      }
    }
  });

  it('notions dont les énoncés changent : version relevée', () => {
    for (const id of [
      'm5-euclide',
      'm6-fraction-quotient',
      'm6-boss-fractions-gateau',
      'm5-relatifs-sommes',
      'm5-boss-relatifs-piege-comparer',
      'm5-boss-fractions-piege-comparer',
      'm5-boss-fractions-reste',
      'm5-fractions-problemes',
      'm5-boss-operations-cinema',
      'mcm1-estimer',
      'mcm1-boss-mental-piege',
    ]) {
      expect(getAnySkill(id)?.version, id).toBe(2);
    }
  });
});
