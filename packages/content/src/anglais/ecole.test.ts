import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_SCHOOL_CHAPTER } from './ecole.ts';
import {
  BODY_PARTS,
  BUGS,
  DRINKS,
  FAITS,
  FOOD,
  FRUIT,
  OTHER_ANIMALS,
  SCHOOL_SUBJECTS,
  SCHOOL_THINGS,
  VEGETABLES,
} from './ecole-faits.ts';

const { skills } = ENGLISH_SCHOOL_CHAPTER;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const questions = (id: string, level: Level) => Array.from({ length: 200 }, (_, i) => generate(id, level, i + 1));
const text = (q: Question, t: string) => check(q, { kind: 'text', text: t }).correct;
const quoted = (...ids: string[]) =>
  FAITS.filter((f) => ids.includes(f.sourceId))
    .map((f) => f.quote)
    .join(' ');
const lines = (q: Question) => (q.figure?.kind === 'document' ? q.figure.lines : []);

describe('anglais cm2 : école, nourriture, animaux', () => {
  it('5 notions à 5 niveaux, sources et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'acm2-ecole',
      'acm2-nourriture',
      'acm2-some',
      'acm2-animaux',
      'acm2-id-like',
    ]);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('cycle3-2020');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_SCHOOL_CHAPTER })).toEqual([]);
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

  it('chaque mot de vocabulaire figure dans la citation de sa fiche', () => {
    const cards = [
      [SCHOOL_THINGS, quoted('bck-flashcards-classroom-objects')],
      [SCHOOL_SUBJECTS, quoted('bck-flashcards-school-subjects')],
      [FOOD, quoted('bck-flashcards-food-1', 'bck-flashcards-food-2')],
      [FRUIT, quoted('bck-flashcards-fruit')],
      [VEGETABLES, quoted('bck-flashcards-vegetables')],
      [DRINKS, quoted('bck-flashcards-drinks')],
      [BUGS, quoted('bck-flashcards-bugs')],
      [OTHER_ANIMALS, quoted('bck-flashcards-birds', 'bck-flashcards-wild-2')],
      [BODY_PARTS, quoted('bck-flashcards-animal-body')],
    ] as const;
    for (const [words, quote] of cards) for (const w of words) expect(quote, w.en).toContain(w.en);
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

  it('école, niveau 5 : le jour attendu est le seul à avoir les deux matières', () => {
    for (const q of questions('acm2-ecole', 5)) {
      const wanted = [...q.prompt.matchAll(/« (.+?) »/g)].map((m) => SCHOOL_SUBJECTS.find((s) => s.fr === m[1])?.en);
      expect(wanted).toHaveLength(2);
      const both = lines(q).filter((l) => {
        const subjects = l.split(': ')[1]?.split(', ') ?? [];
        return wanted.every((w) => subjects.includes(w ?? ''));
      });
      expect(both).toHaveLength(1);
      expect(text(q, both[0]?.split(':')[0] ?? ''), q.prompt).toBe(true);
    }
  });

  it('nourriture, niveau 5 : fruit ou boisson aimé par le bon enfant', () => {
    for (const q of questions('acm2-nourriture', 5)) {
      const kid = /(?:fruit|boisson) (\S+) aime/.exec(q.prompt)?.[1] ?? '';
      const line = lines(q).find((l) => l.startsWith(`${kid}:`)) ?? '';
      const liked = /I like (.+?) and (.+?)\. I don’t/.exec(line);
      const fruit = q.prompt.includes('Quel fruit');
      const expected = fruit ? FRUIT.find((f) => f.alt?.[0] === liked?.[1])?.en : liked?.[2];
      expect(text(q, expected ?? ''), `${q.prompt} ${line}`).toBe(true);
    }
  });

  it('petits mots acceptés : jamais « a » devant un pluriel ou un liquide', () => {
    for (const id of ['acm2-ecole', 'acm2-nourriture', 'acm2-animaux'])
      for (const l of LEVELS)
        for (const q of questions(id, l))
          if (q.answer.kind === 'text')
            for (const a of q.answer.accepted)
              expect(a, q.prompt).not.toMatch(/^an? (scissors|peas|grapes|chips|eggs|apples|pears|milk|water|rice)\b/);
  });

  it('some, niveaux 2 et 3 : « any » avec la négation, « some » sinon', () => {
    for (const q of questions('acm2-some', 3)) {
      const negative = q.prompt.includes('n’t');
      expect(text(q, negative ? 'any' : 'some'), q.prompt).toBe(true);
      expect(text(q, negative ? 'some' : 'any'), q.prompt).toBe(false);
    }
  });

  it('animaux, niveau 5 : réponse en deux étapes', () => {
    for (const q of questions('acm2-animaux', 5)) {
      const anchor = q.prompt.includes('sous l’arbre') ? 'under the tree' : 'behind the house';
      const find = (re: RegExp) =>
        lines(q)
          .map((l) => re.exec(l)?.[1])
          .find(Boolean) ?? '';
      const near = find(new RegExp(`^There is an? (\\w+) ${anchor}\\.$`));
      const target = find(new RegExp(`^There is an? (\\w+) next to the ${near}\\.$`));
      expect(text(q, target), q.prompt).toBe(true);
      expect(text(q, near), q.prompt).toBe(false);
    }
  });

  it('I’d like, niveau 4 : phrase complète, apostrophe simple et « I would » acceptés', () => {
    const written = questions('acm2-id-like', 4).filter((q) => q.answer.kind === 'text');
    expect(written.length).toBeGreaterThan(0);
    for (const q of written) {
      if (q.answer.kind !== 'text') continue;
      const good = q.answer.accepted[0] ?? '';
      expect(text(q, good.replace('’', "'"))).toBe(true);
      expect(text(q, good.replace('I’d', 'I would'))).toBe(true);
      expect(text(q, good.replace('I’d like', 'I like'))).toBe(false);
    }
  });

  it('I’d like, niveau 5 : le petit mot suit la commande', () => {
    for (const q of questions('acm2-id-like', 5)) {
      if (q.answer.kind !== 'cloze') throw new Error('trous attendus');
      const item =
        lines(q)
          .find((l) => l.endsWith(': 1'))
          ?.split(':')[0] ?? '';
      const blank = q.answer.blanks[2];
      if (blank?.mode !== 'list') throw new Error('liste attendue');
      expect(blank.options[blank.correct]).toBe(/^[aeiou]/.test(item) ? 'an' : 'a');
    }
  });
});
