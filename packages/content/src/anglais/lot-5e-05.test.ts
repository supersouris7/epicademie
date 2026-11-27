import { describe, expect, it } from 'vitest';
import { generate, getSkill } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { analyzeSkill } from '../lisibilite.ts';
import { sensIssues } from '../sens.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import type { Level, Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_PRONOUNS_5E_CHAPTER, NOUNS } from './groupe-nominal-5e.ts';
import { FAITS as GROUP_FACTS } from './groupe-nominal-5e-faits.ts';
import { ENGLISH_LINKING_5E_CHAPTER } from './relier-situer.ts';
import { FAITS as LINK_FACTS } from './relier-situer-faits.ts';

const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const CHAPTERS = [
  { chapter: ENGLISH_PRONOUNS_5E_CHAPTER, facts: GROUP_FACTS },
  { chapter: ENGLISH_LINKING_5E_CHAPTER, facts: LINK_FACTS },
];
const SKILLS = CHAPTERS.flatMap((c) => c.chapter.skills);
const questions = (id: string, level: Level) => Array.from({ length: 300 }, (_, i) => generate(id, level, i + 1));
const find = (id: string, level: Level, part: string) => {
  const q = questions(id, level).find((x) => x.prompt.includes(part));
  if (!q) throw new Error(`question introuvable : ${part}`);
  return q;
};
const text = (q: Question, t: string) => check(q, { kind: 'text', text: t }).correct;

describe('anglais 5e : groupe nominal et pronoms, relier et situer', () => {
  it('8 notions à 5 niveaux', () => {
    expect(SKILLS.map((s) => s.id)).toEqual([
      'a5-quantifieurs',
      'a5-pronoms-reflechis',
      'a5-derivation',
      'a5-antonymes',
      'a5-contraste',
      'a5-plans',
      'a5-gauche-droite',
      'a5-intensite',
    ]);
    for (const s of SKILLS) expect(getSkill(s.id)?.levels, s.id).toBe(5);
  });

  it('sources citées par un fait, domaines autorisés, mots en gras définis, sens conforme', () => {
    for (const { chapter, facts } of CHAPTERS) {
      expect(new Set(facts.map((f) => f.id)).size).toBe(facts.length);
      for (const f of facts) {
        expect(isAllowedUrl(getSource(f.sourceId)!.url), f.id).toBe(true);
        expect(f.quote.trim().length, f.id).toBeGreaterThan(0);
      }
      for (const s of chapter.skills) {
        expect(s.lesson.sources).toContain('anglais-college-2025');
        expect(sourceIssues(s)).toEqual([]);
        expect(glossaryIssues({ skill: s, chapter }), s.id).toEqual([]);
        expect(s.sens?.length, s.id).toBeGreaterThan(0);
        expect(sensIssues(s), s.id).toEqual([]);
        for (const id of [...(s.lesson.sources ?? []), ...(s.sens ?? []).map((x) => x.source)])
          expect(
            facts.some((f) => f.sourceId === id),
            `${s.id} ${id}`,
          ).toBe(true);
        for (const x of s.sens ?? [])
          expect(
            facts.some((f) => f.sourceId === x.source && f.quote.includes(x.citation.replace(/\.$/, ''))),
            `${s.id} : citation du sens`,
          ).toBe(true);
      }
    }
  });

  it('questions valides, 5 niveaux distincts, au moins deux pièges, réponses acceptées', () => {
    for (const s of SKILLS) {
      const byLevel = LEVELS.map((l) => questions(s.id, l));
      for (const qs of byLevel) {
        expect(validateVariants(qs), s.id).toEqual([]);
        expect(
          new Set(qs.map((q) => JSON.stringify([q.prompt, q.figure, q.answer]))).size,
          s.id,
        ).toBeGreaterThanOrEqual(6);
      }
      expect(new Set(byLevel.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
      const reasons = new Set(byLevel.flat().flatMap((q) => q.traps.map((t) => t.why)));
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
      for (const q of byLevel.flat()) {
        if (q.answer.kind !== 'text') continue;
        for (const t of q.answer.accepted) expect(text(q, t), q.prompt).toBe(true);
      }
    }
  });

  it('explications lisibles sans adulte : aucun signalement du détecteur', () => {
    for (const { chapter } of CHAPTERS)
      for (const s of chapter.skills) {
        const report = analyzeSkill(s, chapter);
        expect({ id: s.id, counts: report.counts }).toEqual({ id: s.id, counts: {} });
      }
  });

  it('quantifieurs : many pour ce qui se compte, much sinon, some pour proposer', () => {
    for (const q of questions('a5-quantifieurs', 3)) {
      const word = /… (\w+)/.exec(q.prompt)![1]!;
      const n = NOUNS.find((x) => x.en === word)!;
      expect(text(q, n.countable ? 'many' : 'much'), q.prompt).toBe(true);
      expect(text(q, n.countable ? 'much' : 'many'), q.prompt).toBe(false);
    }
    expect(text(find('a5-quantifieurs', 4, 'Would you like'), 'some')).toBe(true);
  });

  it('pronoms réfléchis : « hisself » et le pronom complément refusés', () => {
    const q = find('a5-pronoms-reflechis', 3, 'Tom hurt');
    expect(text(q, 'Himself.')).toBe(true);
    for (const t of ['hisself', 'him', 'themselves']) expect(text(q, t), t).toBe(false);
    expect(text(find('a5-pronoms-reflechis', 4, 'Boys,'), 'yourself')).toBe(false);
  });

  it('dérivation : « e » final supprimé, autres contraires corrects acceptés', () => {
    const q = find('a5-derivation', 4, '« believe » qui veut dire « incroyable »');
    expect(text(q, 'Unbelievable.')).toBe(true);
    expect(text(q, 'unbelieveable')).toBe(false);
    const move = find('a5-derivation', 4, '« move » qui veut dire « qu’on ne peut pas déplacer »');
    for (const t of ['immovable', 'unmovable', 'unmoveable']) expect(text(move, t), t).toBe(true);
  });

  it('antonymes : autres contraires corrects acceptés', () => {
    const q = find('a5-antonymes', 4, '« satisfied »');
    for (const t of ['dissatisfied', 'unsatisfied']) expect(text(q, t), t).toBe(true);
    expect(text(find('a5-antonymes', 4, '« legal »'), 'unlegal')).toBe(false);
  });

  it('contraste : however seulement après un point ; whereas ou but pour comparer', () => {
    for (const q of questions('a5-contraste', 4)) {
      if (q.answer.kind !== 'text') throw new Error('saisie attendue');
      const after = /([.;,]) …/.exec(q.prompt)![1];
      expect(q.answer.accepted[0] === 'however', q.prompt).toBe(after !== ',');
    }
  });

  it('positions : écritures courantes acceptées, « in the left » refusé', () => {
    const q = find('a5-gauche-droite', 4, '« à gauche »');
    for (const t of ['on the left', 'On the left.', 'to the left', 'on the left of the picture'])
      expect(text(q, t), t).toBe(true);
    expect(text(q, 'in the left')).toBe(false);
  });

  it('degré : le document propose toujours quatre trous', () => {
    for (const q of questions('a5-intensite', 5)) {
      if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
      expect(q.answer.blanks).toHaveLength(4);
    }
  });

  it('textes à trous : aucun mot collé à un trou', () => {
    for (const skill of SKILLS)
      for (const q of questions(skill.id, 5)) {
        if (q.answer.kind !== 'cloze') continue;
        const { parts } = q.answer;
        for (const [i, part] of parts.entries()) {
          if (i > 0) expect(part, `${skill.id} : « ${part} »`).toMatch(/^($|[\s.,;:!?])/);
          if (i < parts.length - 1) expect(part, `${skill.id} : « ${part} »`).toMatch(/(^|\s)$/);
        }
      }
  });
});
