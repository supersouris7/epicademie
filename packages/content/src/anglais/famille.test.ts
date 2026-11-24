import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_FAMILY_CHAPTER } from './famille.ts';
import { FAITS } from './famille-faits.ts';

const { skills } = ENGLISH_FAMILY_CHAPTER;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const questions = (id: string, level: Level) => Array.from({ length: 150 }, (_, i) => generate(id, level, i + 1));

describe('anglais cm1 : famille, corps, vêtements', () => {
  it('5 notions à 5 niveaux, sources valides et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'acm1-famille',
      'acm1-have-got',
      'acm1-corps',
      'acm1-vetements',
      'acm1-genitif',
    ]);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('cycle3-2020');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_FAMILY_CHAPTER })).toEqual([]);
    }
  });

  it('chaque fait cite une source du registre (domaine autorisé) et une citation non vide', () => {
    for (const f of FAITS) {
      const src = getSource(f.sourceId);
      expect(src, f.id).toBeDefined();
      expect(isAllowedUrl(src!.url), f.id).toBe(true);
      expect(f.quote.trim().length, f.id).toBeGreaterThan(0);
    }
  });

  it('questions valides et niveaux distincts', () => {
    for (const s of skills) {
      const byLevel = LEVELS.map((l) => questions(s.id, l));
      for (const qs of byLevel) expect(validateVariants(qs.slice(0, 20)), s.id).toEqual([]);
      expect(new Set(byLevel.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
    }
  });

  it('saisie : réponses justes acceptées, chaque piège jugé faux et expliqué ; deux pièges au moins', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const l of LEVELS)
        for (const q of questions(s.id, l)) {
          for (const t of q.traps) reasons.add(t.why);
          if (q.answer.kind !== 'text') continue;
          for (const text of q.answer.accepted) expect(check(q, { kind: 'text', text }).correct, q.prompt).toBe(true);
          for (const t of q.traps)
            if ('text' in t) expect(check(q, { kind: 'text', text: t.text }).correct, q.prompt).toBe(false);
        }
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('génitif : « James’ » et « James’s » acceptés, apostrophe droite tolérée', () => {
    const q = questions('acm1-genitif', 4).find((x) => x.prompt.includes('James'));
    expect(q).toBeDefined();
    for (const text of ['James’ bag', "James's bag"]) expect(check(q!, { kind: 'text', text }).correct).toBe(true);
    expect(check(q!, { kind: 'text', text: 'James bag' }).correct).toBe(false);
  });

  it('corps, niveau 5 : la réponse reprend le nombre écrit pour la partie demandée', () => {
    for (const q of questions('acm1-corps', 5)) {
      if (q.figure?.kind !== 'document' || q.answer.kind !== 'text') throw new Error('document attendu');
      const [, n, part] = /It’s got (\w+) (\w+)/.exec(q.answer.accepted[0] ?? '') ?? [];
      expect(q.figure.lines).toContain(`It has got ${n} ${part}.`);
    }
  });

  it('vêtements, niveau 5 : un seul vêtement commun aux deux enfants demandés', () => {
    for (const q of questions('acm1-vetements', 5)) {
      if (q.figure?.kind !== 'document' || q.answer.kind !== 'text') throw new Error('document attendu');
      const kids = /chez (\w+) et aussi chez (\w+) \?/.exec(q.prompt)?.slice(1) ?? [];
      const lines = q.figure.lines;
      const [x, y] = kids.map((k) =>
        [...(lines.find((l) => l.startsWith(`${k}:`)) ?? '').matchAll(/\ba (\w+)/g)].map((m) => m[1]),
      );
      const common = (x ?? []).filter((w) => y?.includes(w));
      expect(common).toHaveLength(1);
      expect(q.answer.accepted[0]).toBe(`a ${common[0] ?? ''}`);
    }
  });
});
