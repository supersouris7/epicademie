import { describe, expect, it } from 'vitest';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import type { Level, Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { FAITS_SIGNAUX } from './donnees-signaux.ts';
import { PHYSIQUE_CHAPTERS } from './index.ts';
import { PREFIXES } from './prefixes.ts';
import { domaine } from './propagation-son.ts';

const notions = PHYSIQUE_CHAPTERS.find((c) => c.id === 'p5-unites')?.skills ?? [];
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];

const tirages = (id: string, level: Level, n = 300): Question[] => {
  const s = notions.find((x) => x.id === id);
  if (!s) throw new Error(id);
  return Array.from({ length: n }, (_, seed) => ({
    traps: [],
    targetSeconds: 30,
    ...s.generate(createRng(seed), level),
    skillId: s.id,
    level,
    seed,
  }));
};

const lignes = (q: Question) => (q.figure?.kind === 'document' ? q.figure.lines : []);
const nombre = (q: Question) => (q.answer.kind === 'number' ? q.answer.value.n / q.answer.value.d : NaN);
const hertz = (ligne: string) => Number(ligne.replace(/^.*: /, '').replace(/[^\d]/g, ''));

describe('physique-chimie 5e : « Signaux et unités »', () => {
  it('porte les quatre notions du référentiel, à 5 niveaux ; identifiants historiques conservés', () => {
    expect(notions.map((s) => s.id)).toEqual([
      'p5-propagation-lumiere',
      'p5-propagation-son',
      'p5-unites',
      'p5-prefixes',
    ]);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
    expect(notions.map((s) => s.version)).toEqual([1, 1, 2, 2]);
  });

  it('chaque source citée existe et porte un fait ; les mots en gras sont définis', () => {
    for (const s of notions) {
      for (const id of s.lesson.sources ?? []) {
        expect(getSource(id), id).toBeDefined();
        expect(id === 'cycle4-2020' || FAITS_SIGNAUX.some((f) => f.source === id), id).toBe(true);
      }
      expect(s.lesson.source, s.id).toContain('«');
      for (const t of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(t, SUBJECT_GLOSSARIES.sciences ?? []), t).toBe(true);
    }
  });

  it('questions cohérentes aux 5 niveaux, distinctes d’un niveau à l’autre, avec des pièges expliqués', () => {
    for (const s of notions) {
      const prompts = LEVELS.map((level) => {
        const qs = tirages(s.id, level);
        expect(validateVariants(qs), `${s.id} ${level}`).toEqual([]);
        return new Set(qs.map((q) => q.prompt));
      });
      for (const [i, a] of prompts.entries())
        for (const b of prompts.slice(i + 1))
          expect(
            [...a].some((p) => b.has(p)),
            s.id,
          ).toBe(false);
      const pieges = new Set(LEVELS.flatMap((l) => tirages(s.id, l).flatMap((q) => q.traps.map((t) => t.why))));
      expect(pieges.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('son : le domaine suit les repères 20 Hz et 20 000 Hz ; le niveau 5 recompte les signaux audibles', () => {
    expect([domaine(19), domaine(20), domaine(20000), domaine(20001)]).toEqual([
      'infrason',
      'son audible',
      'son audible',
      'ultrason',
    ]);
    for (const q of tirages('p5-propagation-son', 5)) {
      if (!q.prompt.includes('signaux sonores')) continue;
      expect(nombre(q), lignes(q).join(' ')).toBe(lignes(q).filter((l) => domaine(hertz(l)) === 'son audible').length);
    }
  });

  it('préfixes : les puissances de dix suivent le tableau 3 du BIPM', () => {
    expect(PREFIXES.map((p) => [p.symbole, p.exposant])).toEqual([
      ['G', 9],
      ['M', 6],
      ['k', 3],
      ['h', 2],
      ['da', 1],
      ['d', -1],
      ['c', -2],
      ['m', -3],
      ['μ', -6],
      ['n', -9],
    ]);
  });

  it('unités : le niveau 1 ne propose que trois unités de base, sans chiffre au niveau 2', () => {
    for (const q of tirages('p5-unites', 1)) expect(q.answer.kind === 'choice' && q.answer.options.length).toBe(3);
    for (const q of tirages('p5-unites', 2)) expect(q.prompt).not.toMatch(/\d/);
  });
});
