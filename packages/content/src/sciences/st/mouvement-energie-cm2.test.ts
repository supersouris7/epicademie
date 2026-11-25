import { describe, expect, it } from 'vitest';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../../glossaires.ts';
import { createRng } from '../../rng.ts';
import { getSource } from '../../sources.ts';
import type { Level, Question, Skill } from '../../types.ts';
import { validateVariants } from '../../validate.ts';
import { FAITS } from './donnees.ts';
import { ST_CHAPTERS } from './index.ts';

const chapitre = ST_CHAPTERS.find((c) => c.id === 'pcm2-mouvement-energie');
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

describe('sciences CM2 : « Mouvement et énergie »', () => {
  it('porte les quatre notions du lot, à 5 niveaux', () => {
    expect(chapitre?.grade).toBe('cm2');
    expect(chapitre?.domain).toBe('physique-chimie');
    expect(notions.map((s) => s.id)).toEqual([
      'pcm2-trajectoire',
      'pcm2-vitesse',
      'pcm2-renouvelables',
      'pcm2-conversions-energie',
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
      const pieges = new Set(LEVELS.flatMap((l) => tirages(s, l).flatMap((q) => q.traps.map((t) => t.why))));
      expect(pieges.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('vitesse : aucun calcul de valeur de vitesse (exigible seulement en sixième)', () => {
    const vitesse = notions.find((s) => s.id === 'pcm2-vitesse')!;
    for (const level of LEVELS) expect(JSON.stringify(tirages(vitesse, level))).not.toMatch(/km\/h|m\/s|÷/);
  });

  it('renouvelables : ni uranium ni gaz, dont le classement n’est pas sourcé', () => {
    const renouvelables = notions.find((s) => s.id === 'pcm2-renouvelables')!;
    for (const level of LEVELS)
      expect(JSON.stringify(tirages(renouvelables, level))).not.toMatch(/uranium|\bgaz\b|nucléaire/i);
  });
});
