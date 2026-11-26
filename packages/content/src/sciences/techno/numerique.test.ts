import { describe, expect, it } from 'vitest';
import { check } from '../../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../../glossaires.ts';
import { createRng } from '../../rng.ts';
import { getSource } from '../../sources.ts';
import type { Level, Question, Skill } from '../../types.ts';
import { validateVariants } from '../../validate.ts';
import { FAITS_NUMERIQUE } from './donnees-numerique.ts';
import { TECHNO_CHAPTERS } from './index.ts';

const chapitre = TECHNO_CHAPTERS.find((c) => c.id === 't5-numerique');
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

describe('technologie 5e : « Usages du numérique »', () => {
  it('porte les quatre notions du lot, à 5 niveaux, en 5e et en technologie', () => {
    expect([chapitre?.subject, chapitre?.grade, chapitre?.domain]).toEqual(['sciences', '5e', 'technologie']);
    expect(notions.map((s) => s.id)).toEqual([
      't5-donnees',
      't5-reseaux',
      't5-securite-numerique',
      't5-impacts-numerique',
    ]);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
  });

  it('faits : identifiants uniques, source du registre, citation non vide', () => {
    expect(new Set(FAITS_NUMERIQUE.map((f) => f.id)).size).toBe(FAITS_NUMERIQUE.length);
    for (const f of FAITS_NUMERIQUE) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(5);
    }
  });

  it('chaque source citée porte un fait ; le mémo n’a que des mots définis', () => {
    for (const s of notions) {
      expect(s.lesson.source, s.id).toContain('«');
      for (const id of s.lesson.sources ?? []) {
        expect(getSource(id), id).toBeDefined();
        expect(
          FAITS_NUMERIQUE.some((f) => f.source === id),
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
        for (const q of qs) expect(q.steps.at(-1), `${s.id} ${level}`).toContain('**');
        return qs.map((q) => q.prompt).join('|');
      });
      expect(new Set(prompts).size, s.id).toBe(5);
      const pieges = new Set(LEVELS.flatMap((l) => tirages(s, l).flatMap((q) => q.traps.map((t) => t.why))));
      expect(pieges.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('QCM : chaque proposition écartée est expliquée', () => {
    for (const s of notions)
      for (const level of LEVELS)
        for (const q of tirages(s, level)) {
          if (q.answer.kind !== 'choice') continue;
          expect(q.traps.length, `${s.id} ${q.prompt}`).toBe(q.answer.options.length - 1);
          expect(check(q, { kind: 'choice', index: q.answer.correct }).correct).toBe(true);
        }
  });

  it('unités : octets et bits, et fichier copiable le seul à tenir sur la clé', () => {
    const donnees = notions[0]!;
    for (const q of [...tirages(donnees, 3), ...tirages(donnees, 4)]) {
      const bits = /^Combien de bits contiennent (\d+) octets/.exec(q.prompt);
      if (bits) expect(check(q, { kind: 'text', text: String(Number(bits[1]) * 8) }).correct, q.prompt).toBe(true);
      const octets = /occupe (\d+) bits/.exec(q.prompt);
      if (octets) expect(check(q, { kind: 'text', text: String(Number(octets[1]) / 8) }).correct, q.prompt).toBe(true);
    }
    for (const q of tirages(donnees, 5)) {
      const libre = /a (\d+) Mo d’espace libre/.exec(q.prompt);
      if (!libre || q.answer.kind !== 'choice' || q.figure?.kind !== 'document') continue;
      const tiennent = q.figure.lines.filter((l) => {
        const [, n, unite] = / : ([\d,]+) (Mo|Go)$/.exec(l) ?? [];
        return Number(n?.replace(',', '.')) * (unite === 'Go' ? 1000 : 1) <= Number(libre[1]);
      });
      expect(tiennent.length, q.prompt).toBe(1);
      expect(tiennent[0], q.prompt).toContain(q.answer.options[q.answer.correct]);
    }
  });
});
