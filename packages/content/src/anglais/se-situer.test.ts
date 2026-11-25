import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_PLACES_CHAPTER } from './se-situer.ts';
import { COUNTED_PLACES, FAITS, FIXED_PLACES, HOUSE, PREPOSITIONS, ROOMS, TOWN } from './se-situer-faits.ts';

const { skills } = ENGLISH_PLACES_CHAPTER;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const questions = (id: string, level: Level) => Array.from({ length: 200 }, (_, i) => generate(id, level, i + 1));
const text = (q: Question, t: string) => check(q, { kind: 'text', text: t }).correct;
const quoted = (...ids: string[]) =>
  FAITS.filter((f) => ids.includes(f.sourceId))
    .map((f) => f.quote)
    .join(' ');

describe('anglais cm2 : se situer', () => {
  it('4 notions à 5 niveaux, sources et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual(['acm2-there-is', 'acm2-prepositions', 'acm2-maison', 'acm2-ville']);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('cycle3-2020');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_PLACES_CHAPTER })).toEqual([]);
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

  it('mots et prépositions : chacun figure dans une citation de sa fiche', () => {
    const home = quoted('bck-flashcards-home', 'bck-flashcards-furniture');
    for (const w of HOUSE) expect(home, w.en).toContain(w.en);
    const town = quoted('bck-flashcards-town');
    for (const w of TOWN) expect(town, w.en).toContain(w.en);
    const prep = quoted('bck-flashcards-prepositions');
    for (const p of PREPOSITIONS) expect(prep, p.en).toContain(p.en);
  });

  it('questions valides et niveaux distincts', () => {
    for (const s of skills) {
      const byLevel = LEVELS.map((l) => questions(s.id, l));
      for (const qs of byLevel) expect(validateVariants(qs), s.id).toEqual([]);
      expect(new Set(byLevel.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
    }
  });

  it('saisie : réponses justes acceptées, chaque piège jugé faux ; deux explications au moins', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const l of LEVELS)
        for (const q of questions(s.id, l)) {
          for (const t of q.traps) reasons.add(t.why);
          if (q.answer.kind !== 'text') continue;
          for (const t of q.answer.accepted) expect(text(q, t), q.prompt).toBe(true);
          for (const t of q.traps) if ('text' in t) expect(text(q, t.text), `${q.prompt} ${t.text}`).toBe(false);
        }
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('there is / are : la forme suit le nombre écrit ; apostrophe simple acceptée', () => {
    for (const q of questions('acm2-there-is', 3)) {
      const one = q.prompt.includes('« … a ');
      expect(text(q, one ? "there's" : 'there are'), q.prompt).toBe(true);
      expect(text(q, one ? 'there are' : 'there is'), q.prompt).toBe(false);
    }
  });

  it('there is, niveau 4 : « Yes, there’s » refusé', () => {
    const yes = questions('acm2-there-is', 4).filter((q) => q.prompt.includes('Réponds oui. « Is there'));
    expect(yes.length).toBeGreaterThan(0);
    for (const q of yes) {
      expect(text(q, 'there is.')).toBe(true);
      expect(text(q, "there's")).toBe(false);
    }
  });

  it('there is, niveau 5 : les trous suivent les nombres des notes', () => {
    for (const q of questions('acm2-there-is', 5)) {
      if (q.figure?.kind !== 'document' || q.answer.kind !== 'cloze') throw new Error('document attendu');
      const many = q.figure.lines.find((l) => /: [2-4]$/.test(l))?.split(':')[0] ?? '';
      const place = COUNTED_PLACES.find((p) => p.one === many);
      expect(q.answer.blanks[2]).toEqual({ mode: 'text', accepted: [place?.many] });
      const none = q.figure.lines.find((l) => l.endsWith(': 0'))?.split(':')[0] ?? '';
      expect(q.answer.parts[4]).toBe(` a ${none}.`);
    }
  });

  it('prépositions, niveau 4 : cinq paires ou at / in / on selon l’expression', () => {
    let match = 0;
    for (const q of questions('acm2-prepositions', 4)) {
      if (q.answer.kind === 'match') {
        match++;
        expect(q.answer.left).toHaveLength(5);
        continue;
      }
      const f = FIXED_PLACES.find((x) => q.prompt.includes(`(${x.fr})`));
      expect(text(q, f?.en ?? ''), q.prompt).toBe(true);
    }
    expect(match).toBeGreaterThan(0);
  });

  it('prépositions, niveau 5 : quatre trous, il y a puis la place', () => {
    for (const q of questions('acm2-prepositions', 5)) {
      if (q.answer.kind !== 'cloze') throw new Error('trous attendus');
      expect(q.answer.blanks).toHaveLength(4);
    }
  });

  it('maison, niveau 5 : le message ne donne jamais le nom de l’endroit', () => {
    for (const r of ROOMS) expect(r.lines.join(' '), r.en).not.toContain(r.en);
    for (const q of questions('acm2-maison', 5)) {
      if (q.figure?.kind !== 'document' || q.answer.kind !== 'text') throw new Error('document attendu');
      const lines = [...q.figure.lines].sort();
      const room = ROOMS.find((r) => [...r.lines].sort().join() === lines.join());
      expect(text(q, `the ${room?.en}`), q.prompt).toBe(true);
    }
  });

  it('ville, niveau 5 : réponse déduite du lieu du milieu', () => {
    for (const q of questions('acm2-ville', 5)) {
      if (q.figure?.kind !== 'document' || q.answer.kind !== 'text') throw new Error('document attendu');
      const middle = q.figure.lines.map((l) => /^The (.+) is between/.exec(l)?.[1]).find(Boolean);
      const word = q.prompt.includes('en face de') ? 'opposite' : 'behind';
      const answer = q.figure.lines
        .map((l) => new RegExp(`^The (.+) is ${word} the ${middle}\\.$`).exec(l)?.[1])
        .find(Boolean);
      expect(text(q, answer ?? ''), q.prompt).toBe(true);
      expect(text(q, middle ?? ''), q.prompt).toBe(false);
    }
  });
});
