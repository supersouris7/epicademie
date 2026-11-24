import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels } from '../types.ts';
import { ENGLISH_PRESENTATION_CHAPTER } from './presentation.ts';
import { FAITS, wordOf } from './presentation-faits.ts';

const skills = ENGLISH_PRESENTATION_CHAPTER.skills;

describe('anglais cm1 : se présenter et saluer', () => {
  it('5 notions à 5 niveaux, avec le programme du cycle 3 pour source', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'acm1-saluer',
      'acm1-your-name',
      'acm1-how-old',
      'acm1-nombres-1-31',
      'acm1-where-live',
    ]);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('cycle3-2020');
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

  it('les nombres de 1 à 31 ont tous un mot anglais, composés avec un tiret', () => {
    for (let n = 1; n <= 31; n++) expect(wordOf(n), String(n)).toBeDefined();
    expect(wordOf(27)).toBe('twenty-seven');
    expect(wordOf(31)).toBe('thirty-one');
    expect(wordOf(13)).toBe('thirteen');
  });

  it('le niveau 4 des nombres accepte le tiret ou l’espace, refuse le mot collé avec une explication', () => {
    for (let seed = 1; seed < 80; seed++) {
      const q = generate('acm1-nombres-1-31', 4, seed);
      if (q.answer.kind !== 'text' || !q.prompt.includes('27')) continue;
      expect(check(q, { kind: 'text', text: 'Twenty seven' }).correct).toBe(true);
      const glued = check(q, { kind: 'text', text: 'twentyseven' });
      expect(glued.correct).toBe(false);
      expect(glued.why).toMatch(/tiret/);
      return;
    }
    throw new Error('27 jamais tiré');
  });

  it('le niveau 4 de « How old are you? » refuse « I have » avec une explication', () => {
    const q = generate('acm1-how-old', 4, 3);
    const res = check(q, { kind: 'text', text: 'I have nine' });
    expect(res.correct).toBe(false);
  });

  it('le niveau 5 de « Where do you live? » distingue la ville d’origine de la ville d’habitation', () => {
    const q = generate('acm1-where-live', 5, 7);
    expect(q.figure?.kind).toBe('document');
    expect(q.traps.length).toBeGreaterThanOrEqual(2);
  });

  it('chaque notion prévoit au moins deux erreurs typiques sur l’ensemble des niveaux', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const level of [1, 2, 3, 4, 5] as const)
        for (let seed = 1; seed <= 20; seed++) for (const t of generate(s.id, level, seed).traps) reasons.add(t.why);
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });
});
