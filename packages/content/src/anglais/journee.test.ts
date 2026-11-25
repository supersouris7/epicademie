import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_DAY_CHAPTER } from './journee.ts';
import { DAY_CHAIN, FAITS, HABITS, ROUTINES } from './journee-faits.ts';

const { skills } = ENGLISH_DAY_CHAPTER;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const questions = (id: string, level: Level) => Array.from({ length: 200 }, (_, i) => generate(id, level, i + 1));
const text = (q: Question, t: string) => check(q, { kind: 'text', text: t }).correct;
const cloze = (q: Question, answers: string[]) => check(q, { kind: 'cloze', answers }).correct;

describe('anglais cm2 : la journée', () => {
  it('4 notions à 5 niveaux, sources et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual(['acm2-present-simple', 'acm2-heure', 'acm2-routine', 'acm2-frequence']);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('cycle3-2020');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_DAY_CHAPTER })).toEqual([]);
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

  it('routine : les douze cartes sont citées ; la chaîne de la journée suit leur ordre', () => {
    const cards = FAITS.filter((f) => f.sourceId === 'bck-flashcards-daily-routines').map((f) => f.quote);
    expect(cards).toEqual(ROUTINES.map((r) => r.en));
    expect(cards).toHaveLength(12);
    expect(cards.filter((c) => DAY_CHAIN.includes(c))).toEqual(DAY_CHAIN);
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

  it('présent simple : base avec I et you, -s refusé ; apostrophe simple acceptée', () => {
    for (const q of questions('acm2-present-simple', 3)) {
      if (q.answer.kind !== 'text') throw new Error('saisie attendue');
      expect(text(q, `${q.answer.accepted[0]}s`), q.prompt).toBe(false);
    }
    const negative = questions('acm2-present-simple', 4).filter((q) => q.prompt.startsWith('Dis le contraire'));
    expect(negative.length).toBeGreaterThan(0);
    for (const q of negative) {
      expect(text(q, "don't")).toBe(true);
      expect(text(q, 'doesn’t')).toBe(false);
    }
  });

  it('heure : « moins vingt » se dit avec to et l’heure qui arrive', () => {
    const found = Array.from({ length: 2000 }, (_, i) => generate('acm2-heure', 4, i + 1)).filter((x) =>
      x.prompt.includes('sept heures moins vingt.'),
    );
    expect(found.length).toBeGreaterThan(0);
    for (const x of found) {
      expect(text(x, "It's twenty to seven.")).toBe(true);
      expect(text(x, 'twenty to seven')).toBe(true);
      expect(text(x, 'twenty past seven')).toBe(false);
    }
    for (const x of questions('acm2-heure', 4)) {
      if (x.answer.kind !== 'text') throw new Error('saisie attendue');
      expect(text(x, x.answer.accepted[0]!.replaceAll('’', "'")), x.prompt).toBe(true);
    }
  });

  it('heure, niveau 5 : deux heures d’après l’agenda, avec ou sans « a quarter »', () => {
    for (const q of questions('acm2-heure', 5)) {
      if (q.figure?.kind !== 'document' || q.answer.kind !== 'cloze') throw new Error('agenda attendu');
      const answers = q.answer.blanks.map((b) => (b.mode === 'text' ? b.accepted[0]! : ''));
      expect(cloze(q, answers), q.prompt).toBe(true);
      expect(cloze(q, [answers[1]!, answers[0]!]), q.prompt).toBe(false);
    }
  });

  it('routine, niveau 5 : trois actions lues dans l’emploi du temps', () => {
    for (const q of questions('acm2-routine', 5)) {
      if (q.figure?.kind !== 'document' || q.answer.kind !== 'cloze') throw new Error('document attendu');
      const answers = q.figure.lines.map((l) => ROUTINES.find((r) => l.endsWith(`: ${r.fr}`))?.en ?? '');
      expect(cloze(q, answers), q.prompt).toBe(true);
    }
  });

  it('fréquence : le nombre de jours donne l’adverbe', () => {
    const expected = (n: number, week: number) => (n === week ? 'always' : n === 0 ? 'never' : 'sometimes');
    for (const q of questions('acm2-frequence', 3)) {
      const n = Number(/: (\d) jours? sur 7/.exec(q.prompt)?.[1]);
      expect(text(q, expected(n, 7)), q.prompt).toBe(true);
    }
    for (const q of questions('acm2-frequence', 5)) {
      if (q.figure?.kind !== 'document') throw new Error('tableau attendu');
      const answers = q.figure.lines.map((l) => expected(Number(/: (\d) jour/.exec(l)?.[1]), 5));
      expect(cloze(q, answers), q.prompt).toBe(true);
    }
  });

  it('fréquence, niveau 4 : jamais de double négation', () => {
    const never = questions('acm2-frequence', 4).filter((q) => q.answer.kind === 'text');
    expect(never.length).toBeGreaterThan(0);
    for (const q of never) {
      const h = HABITS.find((x) => q.prompt.includes(x.french.never));
      expect(text(q, `never ${h?.verb}`), q.prompt).toBe(true);
      expect(text(q, `don't never ${h?.verb}`), q.prompt).toBe(false);
    }
  });
});
