import { describe, expect, it } from 'vitest';
import { check } from '../../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../../glossaires.ts';
import { createRng } from '../../rng.ts';
import { getSource } from '../../sources.ts';
import type { Level, Question, Skill } from '../../types.ts';
import { validateVariants } from '../../validate.ts';
import { FAITS_CHAINES } from './donnees-chaines.ts';
import { TECHNO_CHAPTERS } from './index.ts';

const chapitre = TECHNO_CHAPTERS.find((c) => c.id === 't4-chaines');
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

const notion = (id: string): Skill => notions.find((s) => s.id === id)!;
const juste = (q: Question, text: string) => check(q, { kind: 'text', text }).correct;
const toutes = (id: string) => LEVELS.flatMap((l) => tirages(notion(id), l));

describe('technologie 4e : « Chaînes d’énergie et d’information »', () => {
  it('porte les quatre notions du lot, à 5 niveaux, en 4e et en technologie', () => {
    expect([chapitre?.subject, chapitre?.grade, chapitre?.domain]).toEqual(['sciences', '4e', 'technologie']);
    expect(notions.map((s) => s.id)).toEqual([
      't4-fonctions-energie',
      't4-chaine-information',
      't4-constituants',
      't4-flux',
    ]);
    for (const s of notions) {
      expect(s.levels, s.id).toBe(5);
      expect(s.lesson.source, s.id).toContain('classe de 4e');
    }
  });

  it('faits : identifiants uniques, source du registre, citation non vide', () => {
    expect(new Set(FAITS_CHAINES.map((f) => f.id)).size).toBe(FAITS_CHAINES.length);
    for (const f of FAITS_CHAINES) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(5);
    }
  });

  it('chaque source citée porte un fait ; le mémo n’a que des mots définis', () => {
    for (const s of notions) {
      for (const id of s.lesson.sources ?? []) {
        expect(getSource(id), id).toBeDefined();
        expect(
          FAITS_CHAINES.some((f) => f.source === id),
          `${s.id} ${id}`,
        ).toBe(true);
      }
      for (const t of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(t, SUBJECT_GLOSSARIES.sciences ?? []), t).toBe(true);
    }
  });

  it('questions valides aux 5 niveaux, niveaux distincts, au moins deux pièges expliqués', () => {
    for (const s of notions) {
      const prompts = LEVELS.map((level) => {
        const qs = tirages(s, level);
        expect(validateVariants(qs), `${s.id} ${level}`).toEqual([]);
        for (const q of qs) {
          expect(q.steps.at(-1), `${s.id} ${level}`).toContain('**');
          expect(q.prompt, s.id).not.toMatch(/à les? |de les? |de une? |undefined/);
        }
        return qs.map((q) => q.prompt).join('|');
      });
      expect(new Set(prompts).size, s.id).toBe(5);
      const pieges = new Set(LEVELS.flatMap((l) => tirages(s, l).flatMap((q) => q.traps.map((t) => t.why))));
      expect(pieges.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('QCM : chaque proposition écartée est expliquée', () => {
    for (const s of notions)
      for (const q of toutes(s.id)) {
        if (q.answer.kind !== 'choice') continue;
        expect(q.traps.length, `${s.id} ${q.prompt}`).toBe(q.answer.options.length - 1);
        expect(check(q, { kind: 'choice', index: q.answer.correct }).correct).toBe(true);
      }
  });

  it('saisies : une seule fonction acceptée par question', () => {
    const verbes = ['alimenter', 'distribuer', 'convertir', 'transmettre', 'acquérir', 'traiter', 'communiquer'];
    for (const id of ['t4-fonctions-energie', 't4-chaine-information'])
      for (const q of toutes(id)) {
        if (q.answer.kind !== 'text') continue;
        expect(verbes.filter((v) => juste(q, v)).length, q.prompt).toBe(1);
      }
  });

  it('flux : la forme d’entrée n’est jamais acceptée comme forme fournie', () => {
    let controles = 0;
    for (const q of tirages(notion('t4-flux'), 3)) {
      const entree = q.prompt.includes('génératrice') ? 'cinétique' : 'électrique';
      expect(juste(q, entree), q.prompt).toBe(false);
      controles += 1;
    }
    expect(controles).toBeGreaterThan(0);
  });
});
