import { describe, expect, it } from 'vitest';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../../glossaires.ts';
import { createRng } from '../../rng.ts';
import { getSource } from '../../sources.ts';
import type { Level, Question, Skill } from '../../types.ts';
import { validateVariants } from '../../validate.ts';
import { CAPS, executer, parcours } from './algorithmes.ts';
import { FAITS } from './donnees.ts';
import { ST_CHAPTERS } from './index.ts';
import { BONS_GESTES, DANGERS } from './securite-electrique.ts';

const chapitre = (id: string) => ST_CHAPTERS.find((c) => c.id === id);
const cm2 = chapitre('tcm2-objets-programmation');
const sixieme = chapitre('p6-electricite-energie');
const notions: readonly Skill[] = [...(cm2?.skills ?? []), ...(sixieme?.skills ?? [])];
const LEVELS = [1, 2, 3, 4, 5] as const;

const tirages = (s: Skill, level: Level, n = 300): Question[] =>
  Array.from({ length: n }, (_, seed) => ({
    traps: [],
    targetSeconds: 30,
    ...s.generate(createRng(seed), level),
    skillId: s.id,
    level,
    seed,
  }));

describe('sciences : « Objets techniques et programmation » (CM2) et « Électricité et énergie » (6e)', () => {
  it('range les notions selon la colonne du programme, à 5 niveaux', () => {
    expect([cm2?.grade, cm2?.domain]).toEqual(['cm2', 'technologie']);
    expect([sixieme?.grade, sixieme?.domain]).toEqual(['6e', 'physique-chimie']);
    expect(notions.map((s) => s.id)).toEqual([
      'tcm2-chaine-information',
      'tcm2-algorithme-programme',
      'tcm2-securite-electrique',
      'p6-conducteurs-isolants',
      'p6-chaine-energie',
    ]);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
  });

  it('chaque source citée existe et porte au moins un fait cité ; les mots en gras sont définis', () => {
    for (const s of notions) {
      expect(s.lesson.source, s.id).toContain('«');
      expect(s.lesson.sources, s.id).toContain('cycle3-2020');
      for (const id of s.lesson.sources ?? []) {
        expect(getSource(id), id).toBeDefined();
        expect(
          FAITS.some((f) => f.source === id),
          `${s.id} ${id}`,
        ).toBe(true);
      }
      for (const t of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(t, SUBJECT_GLOSSARIES.sciences ?? []), t).toBe(true);
    }
  });

  it('questions valides aux 5 niveaux, distinctes, avec au moins deux pièges expliqués par notion', () => {
    for (const s of notions) {
      const prompts = LEVELS.map((level) => {
        const qs = tirages(s, level);
        expect(validateVariants(qs), `${s.id} ${level}`).toEqual([]);
        return qs.map((q) => q.prompt).join('|');
      });
      expect(new Set(prompts).size, s.id).toBe(5);
      const pieges = new Set(LEVELS.flatMap((l) => tirages(s, l).flatMap((q) => q.traps.map((t) => t.why))));
      expect(pieges.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('algorithme : le robot tourne sans avancer', () => {
    expect(executer('nord', ['d'])).toEqual({ cap: 'est', est: 0, nord: 0, cases: 0 });
    expect(executer('nord', ['g', 'a'])).toEqual({ cap: 'ouest', est: -1, nord: 0, cases: 1 });
    for (const cap of CAPS) expect(executer(cap, ['d', 'd', 'd', 'd']).cap).toBe(cap);
  });

  it('algorithme, niveau 5 : seuls les programmes annoncés atteignent la balise, le court est le plus court', () => {
    for (const nord of [2, 3])
      for (const est of [1, 2, 3]) {
        const p = parcours(nord, est);
        for (const blocs of [p.court, p.long]) expect(executer('nord', blocs)).toMatchObject({ nord, est });
        expect(executer('nord', p.faux).est).not.toBe(est);
        expect(p.court.length).toBeLessThan(p.long.length);
      }
  });

  it('sécurité : un geste n’est jamais à la fois dangereux et bon réflexe', () => {
    const dangers = new Set(DANGERS.map((g) => g.texte));
    expect(BONS_GESTES.some((g) => dangers.has(g.texte))).toBe(false);
  });
});
