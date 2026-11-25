import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ACTIONS, ENGLISH_BE_ING_CHAPTER } from './be-ing.ts';
import { FAITS } from './be-ing-faits.ts';

const { skills } = ENGLISH_BE_ING_CHAPTER;
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

describe('anglais 6e : be + ing', () => {
  it('4 notions à 5 niveaux, sources citées et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'a6-be-ing-present',
      'a6-be-ing-reconnaitre',
      'a6-be-ing-futur',
      'a6-want-would-like',
    ]);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('anglais-college-2025');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_BE_ING_CHAPTER })).toEqual([]);
      for (const id of s.lesson.sources ?? [])
        expect(
          FAITS.some((f) => f.sourceId === id),
          `${s.id} ${id}`,
        ).toBe(true);
    }
  });

  it('chaque fait cite une source autorisée ; chaque forme en -ing est attestée par une citation', () => {
    expect(new Set(FAITS.map((f) => f.id)).size).toBe(FAITS.length);
    for (const f of FAITS) {
      const src = getSource(f.sourceId);
      expect(src, f.id).toBeDefined();
      expect(isAllowedUrl(src!.url), f.id).toBe(true);
      expect(f.quote.trim().length, f.id).toBeGreaterThan(0);
    }
    for (const a of ACTIONS) {
      const fact = FAITS.find((f) => f.id === `forme-${a.base}`);
      expect(fact?.quote.toLowerCase(), a.base).toContain(a.ing);
    }
  });

  it('questions valides et niveaux distincts', () => {
    for (const s of skills) {
      const byLevel = LEVELS.map((l) => questions(s.id, l));
      for (const qs of byLevel) expect(validateVariants(qs), s.id).toEqual([]);
      expect(new Set(byLevel.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
    }
  }, 30_000);

  it('au moins deux erreurs typiques ; réponses acceptées, absentes de l’indice', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const l of LEVELS)
        for (const q of questions(s.id, l)) {
          for (const t of q.traps) {
            reasons.add(t.why);
            if ('text' in t) refuses(q, t.text);
          }
          if (q.answer.kind !== 'text') continue;
          accepts(q, ...q.answer.accepted);
          expect(q.hint.toLowerCase(), q.prompt).not.toContain(q.answer.accepted[0]!.toLowerCase());
        }
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  }, 30_000);

  it('niveau 5 : document, au moins 3 trous, réponses variables d’une graine à l’autre', () => {
    for (const s of skills) {
      const sequences = new Set<string>();
      for (const q of questions(s.id, 5)) {
        expect(q.figure?.kind).toBe('document');
        const answers = expected(q);
        expect(answers.length).toBeGreaterThanOrEqual(3);
        expect(check(q, { kind: 'cloze', answers }).correct, q.prompt).toBe(true);
        sequences.add(answers.join(','));
      }
      expect(sequences.size, s.id).toBeGreaterThan(3);
    }
  });

  it('présent : contractions acceptées, be oublié et orthographe fautive refusés', () => {
    const q = find('a6-be-ing-present', 3, '« Look! Tom … in the pool. »');
    accepts(q, 'is swimming', "'s swimming", 'Tom is swimming in the pool.', "Tom's swimming");
    refuses(q, 'swimming', 'is swiming', 'swims', 'are swimming', 'is swim');
  });

  it('présent, niveau 4 : négation et question, « your » accepté', () => {
    const no = find('a6-be-ing-present', 4, 'négative au présent be + ing avec ces éléments : « she / ');
    const [verb, end] = /« she \/ (\w+) \/ (.+) »/.exec(no.prompt)!.slice(1) as [string, string];
    const ing = ACTIONS.find((a) => a.base === verb)!.ing;
    accepts(no, `She isn't ${ing} ${end}.`, `She is not ${ing} ${end}`, `She's not ${ing} ${end}.`);
    refuses(no, `She doesn't ${verb} ${end}.`, `She not ${ing} ${end}.`);
    const ask = find('a6-be-ing-present', 4, 'question au présent be + ing avec ces éléments : « my parents / ');
    const [v, e] = /« my parents \/ (\w+) \/ (.+) »/.exec(ask.prompt)!.slice(1) as [string, string];
    const i = ACTIONS.find((a) => a.base === v)!.ing;
    accepts(ask, `Are my parents ${i} ${e}?`, `Are your parents ${i} ${e}`);
    refuses(ask, `Do my parents ${v} ${e}?`, `My parents are ${i} ${e}?`);
  });

  it('reconnaître : l’indice de temps décide du temps du verbe', () => {
    const all = questions('a6-be-ing-reconnaitre', 3);
    const habit = all.find((q) => q.prompt.includes('every'))!;
    const current = all.find((q) => q.prompt.includes('Look!'))!;
    expect(habit.answer.kind === 'text' && habit.answer.accepted[0]).not.toMatch(/ing$/);
    expect(current.answer.kind === 'text' && current.answer.accepted[0]).toMatch(/ing$/);
  });

  it('projet : going to accepté au niveau 3 ; moment en tête ou en fin à la négation', () => {
    const q = find('a6-be-ing-futur', 3, '« Tom … a party ');
    accepts(q, 'is having', "'s having", 'is going to have');
    refuses(q, 'having', 'is have', 'has', 'will having');
    const no = find('a6-be-ing-futur', 4, 'négative sur ce projet (présent be + ing) : « they / ');
    const accepted = no.answer.kind === 'text' ? no.answer.accepted : [];
    expect(accepted.some((a) => /^They aren’t .+ (tomorrow|tonight|this weekend|next week)$/.test(a))).toBe(true);
    expect(accepted.some((a) => /^(Tomorrow|Tonight|This weekend|Next week), they are not /.test(a))).toBe(true);
  });

  it('want / would like : to obligatoire, forme contractée acceptée', () => {
    const q = find('a6-want-would-like', 3, '« would like » et « visit »');
    accepts(q, 'would like to visit', "'d like to visit", "I'd like to visit London.");
    refuses(q, 'like to visit', 'would like visit', 'would like to visiting');
    const invite = find('a6-want-would-like', 4, '« Aimerais-tu visiter Londres ? »');
    accepts(invite, 'Would you like to visit London?');
    refuses(invite, 'Do you like to visit London?', 'Would you like visit London?');
  });
});
