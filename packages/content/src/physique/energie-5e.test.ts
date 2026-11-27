import { describe, expect, it } from 'vitest';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import type { Level, Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { allumees } from './circuits.ts';
import { CONDUCTEURS, ISOLANTS } from './conducteurs.ts';
import { FAITS_ENERGIE } from './donnees-energie.ts';
import { PHYSIQUE_CHAPTERS } from './index.ts';

const notions = PHYSIQUE_CHAPTERS.find((c) => c.id === 'p5-energie')?.skills ?? [];
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
const bonne = (q: Question): string => (q.answer.kind === 'choice' ? String(q.answer.options[q.answer.correct]) : '');
const nombre = (q: Question) => (q.answer.kind === 'number' ? q.answer.value.n / q.answer.value.d : NaN);

describe('physique-chimie 5e : « Énergie et circuits »', () => {
  it('porte les quatre notions du référentiel, à 5 niveaux', () => {
    expect(notions.map((s) => s.id)).toEqual([
      'p5-sources-formes-energie',
      'p5-conversions-energie',
      'p5-circuits-serie-derivation',
      'p5-conducteurs-isolants',
    ]);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
  });

  it('chaque source citée existe et porte un fait ; les mots en gras sont définis', () => {
    for (const s of notions) {
      for (const id of s.lesson.sources ?? []) {
        expect(getSource(id), id).toBeDefined();
        expect(id === 'cycle4-2020' || FAITS_ENERGIE.some((f) => f.source === id), id).toBe(true);
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

  it('sources d’énergie : au niveau 5, le nombre de sources est recompté d’après le document', () => {
    for (const q of tirages('p5-sources-formes-energie', 5)) {
      const fossile = lignes(q).filter((l) => /gaz naturel|charbon|pétrole/.test(l)).length;
      expect(nombre(q), lignes(q).join(' ')).toBe(q.prompt.includes('fossiles') ? fossile : lignes(q).length - fossile);
    }
  });

  it('conversions : aucune proposition « → énergie thermique » en leurre', () => {
    for (const level of [1, 2] as const)
      for (const q of tirages('p5-conversions-energie', level)) {
        // Le radiateur fournit bien de l'énergie thermique : la proposer à l'envers est alors un vrai piège.
        if (q.answer.kind !== 'choice' || q.prompt.includes('radiateur')) continue;
        const leurres = q.answer.options.filter((o) => o !== bonne(q));
        expect(
          leurres.filter((o) => /(→ énergie|^Énergie) thermique$/.test(o)),
          q.prompt,
        ).toEqual([]);
      }
  });

  it('circuits : le calcul des lampes allumées', () => {
    const rs = { branches: [['A'], ['B', 'C']] } as const;
    expect(allumees(rs, [])).toEqual(['A', 'B', 'C']);
    expect(allumees(rs, ['K0'])).toEqual([]);
    expect(allumees(rs, ['K1'])).toEqual(['B', 'C']);
    expect(allumees(rs, ['C'])).toEqual(['A']);
  });

  it('circuits : au niveau 5, la réponse est refaite à partir du document', () => {
    let vus = 0;
    for (const q of tirages('p5-circuits-serie-derivation', 5)) {
      const branches = lignes(q)
        .filter((l) => l.startsWith('Branche'))
        .map((l) => [...l.matchAll(/lampe ([ABC])/g)].map((m) => m[1]!));
      const coupe = /(?:interrupteur|lampe) (K\d|[ABC])\. /.exec(q.prompt)?.[1];
      expect(coupe, q.prompt).toBeDefined();
      const restent =
        coupe === 'K0' ? [] : branches.filter((b, i) => coupe !== `K${i + 1}` && !b.includes(coupe!)).flat();
      if (q.answer.kind === 'number') expect(nombre(q), q.prompt).toBe(restent.length);
      else expect([...(bonne(q).match(/[ABC](?=,|$)/g) ?? [])], q.prompt).toEqual(restent.sort());
      vus += 1;
    }
    expect(vus).toBe(300);
  });

  it('conducteurs : les familles sont disjointes et le niveau 5 compte les conducteurs du document', () => {
    expect(CONDUCTEURS.filter((m) => (ISOLANTS as readonly string[]).includes(m))).toEqual([]);
    for (const q of tirages('p5-conducteurs-isolants', 5)) {
      if (q.answer.kind !== 'number') continue;
      const n = lignes(q).filter((l) => /en (cuivre|fer|argent|graphite)\./.test(l)).length;
      expect(nombre(q)).toBe(n);
    }
  });
});
