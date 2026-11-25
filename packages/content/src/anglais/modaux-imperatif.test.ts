import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_MODALS_CHAPTER } from './modaux-imperatif.ts';
import { FAITS } from './modaux-imperatif-faits.ts';

const { skills } = ENGLISH_MODALS_CHAPTER;
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

describe('anglais 6e : modaux et impératif', () => {
  it('4 notions à 5 niveaux, sources citées et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual(['a6-can', 'a6-must', 'a6-imperatif-affirmatif', 'a6-imperatif-negatif']);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('anglais-college-2025');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_MODALS_CHAPTER })).toEqual([]);
      for (const id of s.lesson.sources ?? [])
        expect(
          FAITS.some((f) => f.sourceId === id),
          `${s.id} ${id}`,
        ).toBe(true);
    }
  });

  it('chaque fait cite une source du registre (domaine autorisé) et une citation non vide', () => {
    expect(new Set(FAITS.map((f) => f.id)).size).toBe(FAITS.length);
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
      for (const qs of byLevel) expect(validateVariants(qs), s.id).toEqual([]);
      expect(new Set(byLevel.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
    }
  }, 30_000);

  it('au moins deux erreurs typiques ; l’indice ne contient pas la réponse saisie', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const l of LEVELS)
        for (const q of questions(s.id, l)) {
          for (const t of q.traps) reasons.add(t.why);
          if (q.answer.kind !== 'text') continue;
          accepts(q, ...q.answer.accepted);
          expect(q.hint.toLowerCase(), q.prompt).not.toContain(q.answer.accepted[0]!.toLowerCase());
        }
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

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

  it('can : négation en un mot ou contractée, question avec can devant le sujet', () => {
    const no = find('a6-can', 4, 'négative : « She can swim.');
    accepts(no, 'She can’t swim.', 'She cannot swim', "She can't swim");
    refuses(no, 'She doesn’t can swim.', 'She can’t swims.');
    const ask = find('a6-can', 4, 'oui ou non) : « My sister can ');
    const verb = /can (.+)\. »/.exec(ask.prompt)![1]!;
    accepts(ask, `Can my sister ${verb}?`, `Can your sister ${verb}`);
    refuses(ask, `Does my sister can ${verb}?`, `Can my sister to ${verb}?`);
  });

  it('must : interdiction et changement de sujet sans -s', () => {
    const no = find('a6-must', 4, 'interdiction, avec le même auxiliaire de modalité : « Tom must wait here.');
    accepts(no, 'Tom mustn’t wait here.', 'Tom must not wait here');
    refuses(no, 'Tom doesn’t must wait here.', 'Tom can’t wait here.', 'Tom mustn’t waits here.');
    const other = find('a6-must', 4, 'pour « Lisa » (toute la phrase) : « I must go out.');
    accepts(other, 'Lisa must go out.');
    refuses(other, 'Lisa musts go out.', 'Lisa must goes out.');
  });

  it('must, niveau 5 : can’t est aussi accepté pour une interdiction', () => {
    const q = questions('a6-must', 5).find((x) => expected(x).includes('mustn’t'))!;
    const answers = expected(q).map((a) => (a === 'mustn’t' ? 'can’t' : a));
    expect(check(q, { kind: 'cloze', answers }).correct).toBe(true);
  });

  it('impératif : sans you ni -s, please accepté', () => {
    const open = find('a6-imperatif-affirmatif', 3, '« Ouvre la fenêtre ! »');
    accepts(open, 'Open the window!', 'open the window', 'Please open the window.', 'Open the window, please !');
    refuses(open, 'You open the window!', 'Opens the window.', 'To open the window');
  });

  it('impératif, niveau 4 : situation en français, sans anglais donné, variantes acceptées', () => {
    const all = questions('a6-imperatif-affirmatif', 4);
    expect(new Set(all.map((q) => q.prompt)).size).toBeGreaterThanOrEqual(12);
    for (const q of all) {
      if (q.answer.kind !== 'text') throw new Error('saisie attendue');
      expect(q.prompt).not.toMatch(/Vocabulaire|You must/);
      for (const a of q.answer.accepted) expect(q.prompt.toLowerCase()).not.toContain(a.toLowerCase());
    }
    const be = find('a6-imperatif-affirmatif', 4, 'd’être prudent');
    accepts(be, 'Be careful!', 'be careful', 'Please be careful.', 'Be careful, please !', 'Be cautious!');
    refuses(be, 'Are careful!', 'You be careful.', 'You are careful.', 'To be careful', 'Being careful!');
    const wait = find('a6-imperatif-affirmatif', 4, 'd’attendre ici');
    accepts(wait, 'Wait here!', 'Please, wait here.');
    refuses(wait, 'Waits here!', 'You wait here.', 'To wait here', 'Waiting here!');
  });

  it('impératif négatif : don’t ou do not, panneau accepté, be avec don’t', () => {
    const run = find('a6-imperatif-negatif', 3, '« Ne cours pas ! »');
    accepts(run, 'Don’t run!', 'Do not run.', 'No running!', "don't run");
    refuses(run, 'Not run!', 'No run!', 'Doesn’t run!', 'Don’t running!');
    const late = find('a6-imperatif-negatif', 4, '« Be late! »');
    accepts(late, 'Don’t be late!', 'Do not be late');
    refuses(late, 'Be not late!', 'Aren’t late!');
  });
});
