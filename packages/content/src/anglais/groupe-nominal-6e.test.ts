import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_NOUN_PHRASE_6E_CHAPTER } from './groupe-nominal-6e.ts';
import { ARTICLE_SENTENCES, FAITS, PLURALS } from './groupe-nominal-6e-faits.ts';

const { skills } = ENGLISH_NOUN_PHRASE_6E_CHAPTER;
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

describe('anglais 6e : le groupe nominal', () => {
  it('5 notions à 5 niveaux, sources citées et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'a6-articles',
      'a6-demonstratifs',
      'a6-pluriels-irreguliers',
      'a6-adjectif-place',
      'a6-genitif',
    ]);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('anglais-college-2025');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_NOUN_PHRASE_6E_CHAPTER })).toEqual([]);
      for (const id of s.lesson.sources ?? [])
        expect(
          FAITS.some((f) => f.sourceId === id),
          `${s.id} ${id}`,
        ).toBe(true);
    }
  });

  it('chaque fait cite une source autorisée ; chaque pluriel irrégulier est attesté par une citation', () => {
    expect(new Set(FAITS.map((f) => f.id)).size).toBe(FAITS.length);
    for (const f of FAITS) {
      const src = getSource(f.sourceId);
      expect(src, f.id).toBeDefined();
      expect(isAllowedUrl(src!.url), f.id).toBe(true);
      expect(f.quote.trim().length, f.id).toBeGreaterThan(0);
    }
    const quotes = FAITS.map((f) => f.quote).join(' ');
    for (const p of PLURALS) expect(quotes, p.one).toMatch(new RegExp(`\\b${p.one}[/>]${p.many}\\b`));
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
          expect(` ${q.hint.toLowerCase()} `, q.prompt).not.toContain(` ${q.answer.accepted[0]!.toLowerCase()} `);
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
        if (q.answer.kind === 'cloze') expect(q.answer.parts).toHaveLength(answers.length + 1);
        sequences.add(answers.join(','));
      }
      expect(sequences.size, s.id).toBeGreaterThan(3);
    }
  });

  it('articles : les quatre réponses existent ; traduction sans « the » pour une généralité', () => {
    expect(new Set(ARTICLE_SENTENCES.map((s) => s.article))).toEqual(new Set(['a', 'an', 'the', 'Ø']));
    const cats = find('a6-articles', 4, 'Les chats aiment le lait');
    accepts(cats, 'Cats like milk.', 'cats like milk');
    refuses(cats, 'The cats like the milk.', 'Cats like the milk.');
    const moon = find('a6-articles', 4, 'Regarde la Lune');
    accepts(moon, 'Look at the moon!', 'Look at the Moon.');
    refuses(moon, 'Look at moon!', 'Look at a moon!');
  });

  it('démonstratifs : nombre et distance décident ; la phrase entière est transformée', () => {
    const near = find('a6-demonstratifs', 3, '« Look at … mice here! »');
    accepts(near, 'these', 'These mice', 'Look at these mice here!');
    refuses(near, 'this', 'those', 'that');
    const q = find('a6-demonstratifs', 4, '« This child is happy. »');
    accepts(q, 'These children are happy.');
    refuses(q, 'This children are happy.', 'These child are happy.', 'Those children are happy.');
    const back = find('a6-demonstratifs', 4, '« Those women are tired. »');
    accepts(back, 'That woman is tired.', 'That woman’s tired');
  });

  it('pluriels : forme irrégulière exigée, singulier retrouvé', () => {
    const q = find('a6-pluriels-irreguliers', 3, '(child, enfant)');
    accepts(q, 'children');
    refuses(q, 'childs', 'childrens', 'child');
    const back = find('a6-pluriels-irreguliers', 4, '« two people → one … »');
    accepts(back, 'person', 'one person.');
    refuses(back, 'people');
  });

  it('adjectif : avant le nom, invariable, taille avant couleur', () => {
    const q = find('a6-adjectif-place', 4, '« deux grands chiens noirs »');
    accepts(q, 'two big black dogs', 'Two big, black dogs.');
    refuses(q, 'two dogs big black', 'two black big dogs', 'two bigs black dogs');
  });

  it('génitif : apostrophe selon le possesseur', () => {
    const one = find('a6-genitif', 3, '(Tom / bike)');
    accepts(one, 'Tom’s bike', "Tom's bike.");
    refuses(one, 'Toms bike', 'Tom bike', 'the bike’s Tom');
    const parents = find('a6-genitif', 4, '(my parents / house)');
    accepts(parents, "my parents' house");
    refuses(parents, "my parent's house", "my parents's house", 'my parents house');
    const children = find('a6-genitif', 4, '(the children / room)');
    accepts(children, "the children's room");
    refuses(children, "the childrens' room", "the children' room");
    const james = find('a6-genitif', 4, '(James / bag)');
    accepts(james, "James' bag", "James's bag");
    refuses(james, 'James bag');
  });
});
