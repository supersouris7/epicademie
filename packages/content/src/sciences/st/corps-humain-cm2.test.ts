import { describe, expect, it } from 'vitest';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../../glossaires.ts';
import { createRng } from '../../rng.ts';
import { getSource } from '../../sources.ts';
import type { Level, Question, Skill } from '../../types.ts';
import { validateVariants } from '../../validate.ts';
import { FAITS } from './donnees.ts';
import { ST_CHAPTERS } from './index.ts';

const chapitre = ST_CHAPTERS.find((c) => c.id === 'vcm2-corps-humain');
const notions: readonly Skill[] = chapitre?.skills ?? [];
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
const toutes = (s: Skill) => LEVELS.flatMap((l) => tirages(s, l));

describe('sciences CM2 : « Le corps humain »', () => {
  it('porte les quatre notions du lot, en SVT, à 5 niveaux', () => {
    expect(chapitre?.grade).toBe('cm2');
    expect(chapitre?.domain).toBe('svt');
    expect(notions.map((s) => s.id)).toEqual([
      'vcm2-digestion',
      'vcm2-alimentation',
      'vcm2-besoins-alimentaires',
      'vcm2-circulation',
    ]);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
  });

  it('chaque source citée existe et porte au moins un fait cité ; les mots en gras sont définis', () => {
    for (const s of notions) {
      expect(s.lesson.source, s.id).toContain('«');
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
      const pieges = new Set(toutes(s).flatMap((q) => q.traps.map((t) => t.why)));
      expect(pieges.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('le niveau 5 s’appuie toujours sur un document', () => {
    for (const s of notions) for (const q of tirages(s, 5)) expect(q.figure?.kind, s.id).toBe('document');
  });

  it('hors programme du cycle 3 : ni respiration, ni os, ni poids du corps', () => {
    for (const s of notions)
      expect(JSON.stringify(toutes(s)), s.id).not.toMatch(
        /respiration|poumon|squelette|(?<!\p{L})os(?!\p{L})|surpoids|obés|régime|calorie/iu,
      );
  });

  it('alimentation : un repère alimentaire chiffré est toujours annoncé « pour les adultes »', () => {
    const alimentation = notions.find((s) => s.id === 'vcm2-alimentation')!;
    for (const q of toutes(alimentation))
      if (/fruits et légumes faut-il|légumes secs \?|aux adultes/.test(q.prompt)) expect(q.prompt).toMatch(/adultes/);
  });

  it('alimentation : le jus de fruits n’est jamais un piège contre « fruit ou légume »', () => {
    const alimentation = notions.find((s) => s.id === 'vcm2-alimentation')!;
    for (const q of tirages(alimentation, 2))
      if (q.prompt.includes('« fruit ou légume »')) expect(JSON.stringify(q.answer)).not.toContain('jus de fruits');
  });
});
