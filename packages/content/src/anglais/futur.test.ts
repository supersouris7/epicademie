import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { FAITS as FUTURE_FACTS } from './futur-faits.ts';
import { ENGLISH_FUTURE_CHAPTER } from './futur.ts';
import { FAITS as ADVICE_FACTS } from './modaux-souhait-faits.ts';
import { ENGLISH_ADVICE_CHAPTER } from './modaux-souhait.ts';

const CHAPTERS = [
  { chapter: ENGLISH_FUTURE_CHAPTER, facts: FUTURE_FACTS },
  { chapter: ENGLISH_ADVICE_CHAPTER, facts: ADVICE_FACTS },
];
const SKILLS = CHAPTERS.flatMap(({ chapter, facts }) => chapter.skills.map((skill) => ({ skill, chapter, facts })));
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const questions = (id: string, level: Level) => Array.from({ length: 600 }, (_, i) => generate(id, level, i + 1));
const find = (id: string, level: Level, part: string) => {
  const q = questions(id, level).find((x) => x.prompt.includes(part));
  if (!q) throw new Error(`question introuvable : ${part}`);
  return q;
};
const text = (q: Question, t: string) => check(q, { kind: 'text', text: t }).correct;
const accepts = (q: Question, ...answers: string[]) => {
  for (const a of answers) expect(text(q, a), `${q.prompt} → ${a}`).toBe(true);
};
const refuses = (q: Question, ...answers: string[]) => {
  for (const a of answers) expect(text(q, a), `${q.prompt} → ${a}`).toBe(false);
};
const expected = (q: Question) => {
  if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
  return q.answer.blanks.map((b) => (b.mode === 'list' ? b.options[b.correct]! : b.accepted[0]!));
};

describe('anglais 5e : le futur ; modaux, souhait, opinion', () => {
  it('8 notions à 5 niveaux, sources citées et mots en gras définis', () => {
    expect(SKILLS.map((s) => s.skill.id)).toEqual([
      'a5-will',
      'a5-be-going-to',
      'a5-be-ing-projet',
      'a5-choisir-futur',
      'a5-should',
      'a5-could',
      'a5-souhait',
      'a5-opinion',
    ]);
    for (const { skill, chapter, facts } of SKILLS) {
      expect(skillLevels(skill)).toBe(5);
      expect(skill.lesson.sources).toContain('anglais-college-2025');
      expect(sourceIssues(skill)).toEqual([]);
      expect(glossaryIssues({ skill, chapter })).toEqual([]);
      for (const id of skill.lesson.sources ?? [])
        expect(
          facts.some((f) => f.sourceId === id),
          `${skill.id} ${id}`,
        ).toBe(true);
    }
  });

  it('chaque fait cite une source du registre (domaine autorisé) et une citation non vide', () => {
    for (const { facts } of CHAPTERS) {
      expect(new Set(facts.map((f) => f.id)).size).toBe(facts.length);
      for (const f of facts) {
        const src = getSource(f.sourceId);
        expect(src, f.id).toBeDefined();
        expect(isAllowedUrl(src!.url), f.id).toBe(true);
        expect(f.quote.trim().length, f.id).toBeGreaterThan(0);
      }
    }
  });

  it('questions valides et niveaux distincts', () => {
    for (const { skill } of SKILLS) {
      const byLevel = LEVELS.map((l) => questions(skill.id, l));
      for (const qs of byLevel) expect(validateVariants(qs), skill.id).toEqual([]);
      const shapes = byLevel.map((qs) => qs.map((q) => q.prompt).join('|'));
      expect(new Set(shapes).size, skill.id).toBe(5);
    }
  }, 60_000);

  it('au moins deux erreurs typiques ; l’indice ne contient pas la réponse saisie', () => {
    for (const { skill } of SKILLS) {
      const reasons = new Set<string>();
      for (const l of LEVELS)
        for (const q of questions(skill.id, l)) {
          for (const t of q.traps) reasons.add(t.why);
          if (q.answer.kind !== 'text') continue;
          accepts(q, ...q.answer.accepted);
          expect(q.hint.toLowerCase(), q.prompt).not.toContain(q.answer.accepted[0]!.toLowerCase());
        }
      expect(reasons.size, skill.id).toBeGreaterThanOrEqual(2);
    }
  }, 60_000);

  it('niveau 5 : document, au moins 3 trous, réponses variables d’une graine à l’autre', () => {
    for (const { skill } of SKILLS) {
      const sequences = new Set<string>();
      for (const q of questions(skill.id, 5)) {
        expect(q.figure?.kind).toBe('document');
        const answers = expected(q);
        expect(answers.length).toBeGreaterThanOrEqual(3);
        expect(check(q, { kind: 'cloze', answers }).correct, q.prompt).toBe(true);
        sequences.add(answers.join(','));
      }
      expect(sequences.size, skill.id).toBeGreaterThan(3);
    }
  }, 30_000);

  it('will : contraction acceptée, ni -s ni to', () => {
    const q = find('a5-will', 3, '« to play tennis »');
    accepts(q, 'will play tennis', '’ll play tennis', "'ll play tennis");
    refuses(q, 'wills play tennis', 'will to play tennis', 'plays tennis');
    const no = find('a5-will', 4, 'négative : « Tom will');
    const tail = /Tom will (.+)\. »/.exec(no.prompt)![1]!;
    accepts(no, `Tom won’t ${tail}.`, `Tom will not ${tail}`);
    refuses(no, `Tom willn’t ${tail}.`);
  });

  it('be going to et be + ing : accord de be et orthographe en -ing', () => {
    const going = find('a5-be-going-to', 3, '« Tom … ');
    const verb = /« to (.+?) »/.exec(going.prompt)![1]!;
    accepts(going, `is going to ${verb}`, `’s going to ${verb}`);
    refuses(going, `going to ${verb}`, `are going to ${verb}`);
    const ing = find('a5-be-ing-projet', 4, 'négative : « I am swimming');
    const tail = /I am (.+)\. »/.exec(ing.prompt)![1]!;
    accepts(ing, `I’m not ${tail}.`, `I am not ${tail}`);
    refuses(ing, `I amn’t ${tail}.`);
  });

  it('choisir la forme : décision à l’instant, indice visible, rendez-vous, avis', () => {
    const now = find('a5-choisir-futur', 3, 'Le téléphone sonne');
    accepts(now, '’ll answer', 'will answer');
    refuses(now, '’m going to answer', 'answered');
    const seen = find('a5-choisir-futur', 3, 'nuages noirs');
    accepts(seen, 'is going to rain', '’s going to rain');
    refuses(seen, 'will rain');
    const meet = find('a5-choisir-futur', 4, 'convenu avec Jane');
    accepts(meet, '’m meeting', 'am going to meet');
    refuses(meet, 'will meet');
    const belief = find('a5-choisir-futur', 4, 'sur la finale');
    accepts(belief, 'will win', 'is going to win');
    refuses(belief, 'wills win', 'won');
  });

  it('modaux : négation contractée ou non, sans do ni to', () => {
    const should = find('a5-should', 3, '« The floor is wet.');
    accepts(should, 'shouldn’t run here', 'should not run here.');
    refuses(should, 'should run here', 'shouldn’t to run here');
    const could = find('a5-could', 3, 'savait nager');
    accepts(could, 'could swim');
    refuses(could, 'can swim', 'could to swim', 'couldn’t swim');
  });

  it('souhait et opinion : to + base, variantes d’expression', () => {
    const wish = find('a5-souhait', 3, '« would love » ; le verbe est « visit Canada »');
    accepts(wish, 'would love to visit Canada', '’d love to visit Canada');
    refuses(wish, 'would love visit Canada', 'wish to visit Canada');
    const view = find('a5-opinion', 3, 'À mon avis');
    accepts(view, 'In my opinion', 'in my opinion,');
    refuses(view, 'To my opinion', 'I am thinking');
  });
});
