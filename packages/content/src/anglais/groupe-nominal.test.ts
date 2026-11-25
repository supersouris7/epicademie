import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_NOUN_GROUP_CHAPTER } from './groupe-nominal.ts';
import { ARTICLE_TRICKY, ARTICLE_WORDS, FAITS, NOUNS } from './groupe-nominal-faits.ts';

const { skills } = ENGLISH_NOUN_GROUP_CHAPTER;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const questions = (id: string, level: Level) => Array.from({ length: 200 }, (_, i) => generate(id, level, i + 1));
const text = (q: Question, t: string) => check(q, { kind: 'text', text: t }).correct;

describe('anglais cm2 : le groupe nominal', () => {
  it('4 notions à 5 niveaux, identifiant historique conservé, sources et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual(['acm2-pluriel', 'acm2-articles', 'acm2-this-that', 'acm2-adjectif']);
    expect(skills[0]?.version).toBe(2);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('cycle3-2020');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_NOUN_GROUP_CHAPTER })).toEqual([]);
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

  it('pluriels : chaque nom figure dans une citation de la page « Count nouns »', () => {
    const quoted = FAITS.filter((f) => f.sourceId === 'bc-count-nouns')
      .map((f) => f.quote)
      .join(' ');
    for (const n of NOUNS) {
      expect(quoted, n.one).toContain(n.many);
      expect(n.wrong, n.one).not.toContain(n.many);
    }
  });

  it('questions valides et niveaux distincts', () => {
    for (const s of skills) {
      const byLevel = LEVELS.map((l) => questions(s.id, l));
      for (const qs of byLevel) expect(validateVariants(qs), s.id).toEqual([]);
      expect(new Set(byLevel.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
    }
  });

  it('saisie : réponses justes acceptées, chaque piège jugé faux ; deux pièges au moins', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const l of LEVELS)
        for (const q of questions(s.id, l)) {
          for (const t of q.traps) reasons.add(t.why);
          if (q.answer.kind !== 'text') continue;
          for (const t of q.answer.accepted) expect(text(q, t), q.prompt).toBe(true);
          for (const t of q.traps) if ('text' in t) expect(text(q, t.text), q.prompt).toBe(false);
        }
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('pluriel : « person » jamais demandé en saisie ; niveau 4, irréguliers dans les 5 paires', () => {
    for (const l of [3, 4, 5] as const)
      for (const q of questions('acm2-pluriel', l)) {
        if (q.answer.kind === 'text') expect(q.answer.accepted).not.toContain('people');
        if (q.answer.kind !== 'match') continue;
        expect(q.answer.left).toHaveLength(5);
        const irregular = NOUNS.filter((n) => n.rule === 'irregulier').map((n) => n.one);
        expect(q.answer.left.filter((w) => irregular.includes(w)).length).toBeGreaterThanOrEqual(2);
      }
  });

  it('articles : an devant une voyelle écrite, sauf les cas de son expliqués', () => {
    for (const w of [...ARTICLE_WORDS, ...ARTICLE_TRICKY])
      if (!['university', 'hour'].includes(w.word))
        expect(w.article, w.word).toBe(/^[aeiou]/.test(w.word) ? 'an' : 'a');
    for (const q of questions('acm2-articles', 5)) {
      if (q.answer.kind !== 'cloze') throw new Error('trous attendus');
      expect(q.answer.blanks[2]).toEqual({ mode: 'text', accepted: ['the'] });
    }
  });

  it('this / that : la réponse suit la distance et le nombre écrits', () => {
    const expected = (near: boolean, plural: boolean) =>
      near ? (plural ? 'these' : 'this') : plural ? 'those' : 'that';
    const plurals = new Set(['children', 'men', 'women', 'feet', 'boxes', 'watches', 'ladies']);
    for (const q of questions('acm2-this-that', 4)) {
      const [, noun, where] = /… (\w+) (here|over there)/.exec(q.prompt) ?? [];
      expect(text(q, expected(where === 'here', plurals.has(noun ?? ''))), q.prompt).toBe(true);
    }
    for (const q of questions('acm2-this-that', 5)) {
      if (q.figure?.kind !== 'document' || q.answer.kind !== 'cloze') throw new Error('document attendu');
      const [held, far] = q.figure.lines.map((l) => l.includes(' are two '));
      expect(q.answer.blanks).toEqual([
        { mode: 'text', accepted: [expected(true, held ?? false)] },
        { mode: 'text', accepted: [expected(false, far ?? false)] },
      ]);
    }
  });

  it('adjectif, niveaux 4 et 5 : virgule et « gray » acceptés, mauvais ordre refusé', () => {
    for (const l of [4, 5] as const) {
      let grey = 0;
      for (const q of questions('acm2-adjectif', l)) {
        if (q.answer.kind !== 'text') throw new Error('saisie attendue');
        const [number, size, colour, noun] = (q.answer.accepted[0] ?? '').split(' ');
        expect(text(q, `${number} ${size}, ${colour} ${noun}.`)).toBe(true);
        expect(text(q, `${number} ${colour} ${size} ${noun}`)).toBe(false);
        if (colour === 'grey') {
          grey++;
          expect(text(q, `${number} ${size} gray ${noun}`)).toBe(true);
        }
      }
      expect(grey).toBeGreaterThan(0);
    }
  });

  it('adjectif, niveaux 4 et 5 : « little » accepté pour « small », « large » pour « big » au niveau 4', () => {
    for (const l of [4, 5] as const) {
      const seen = new Set<string>();
      for (const q of questions('acm2-adjectif', l)) {
        if (q.answer.kind !== 'text') throw new Error('saisie attendue');
        const [number, size = '', colour, noun] = (q.answer.accepted[0] ?? '').split(' ');
        seen.add(size);
        const other = size === 'small' ? 'little' : 'large';
        const accepted = size === 'small' || l === 4;
        const colours = colour === 'grey' ? ['grey', 'gray'] : [colour];
        for (const c of colours)
          for (const t of [`${number} ${other} ${c} ${noun}`, `${number} ${other}, ${c} ${noun}.`])
            expect(text(q, t), `${q.prompt} ${t}`).toBe(accepted);
        expect(text(q, `${number} ${colour} ${other} ${noun}`)).toBe(false);
      }
      expect([...seen].sort()).toEqual(['big', 'small']);
    }
  });

  it('adjectif, niveau 5 : l’énoncé ne donne pas l’ordre des mots', () => {
    for (const q of questions('acm2-adjectif', 5)) expect(q.prompt).not.toMatch(/taille|couleur/);
  });

  it('adjectif, niveau 5 : la réponse reprend la ligne de l’enfant demandé', () => {
    for (const q of questions('acm2-adjectif', 5)) {
      if (q.figure?.kind !== 'document' || q.answer.kind !== 'text') throw new Error('document attendu');
      const kid = /qu(?:e |’)([A-Z]\w+) possède/.exec(q.prompt)?.[1] ?? '';
      const line = q.figure.lines.find((l) => l.startsWith(`${kid}:`)) ?? '';
      const [number, size, colour, noun] = (q.answer.accepted[0] ?? '').split(' ');
      expect(line).toBe(`${kid}: I’ve got ${number} ${noun}. They are ${size}. They are ${colour}.`);
    }
  });
});
