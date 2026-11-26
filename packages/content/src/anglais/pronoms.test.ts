import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_PRONOUNS_CHAPTER } from './pronoms.ts';
import { FAITS, ROWS, WH } from './pronoms-faits.ts';

const { skills } = ENGLISH_PRONOUNS_CHAPTER;
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

describe('anglais 6e : les pronoms', () => {
  it('5 notions à 5 niveaux, sources citées et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'a6-pronoms-sujets',
      'a6-pronoms-complements',
      'a6-determinants-possessifs',
      'a6-pronoms-possessifs',
      'a6-mots-interrogatifs',
    ]);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('anglais-college-2025');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_PRONOUNS_CHAPTER })).toEqual([]);
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

  it('les formes employées sont celles des tableaux cités, les mots interrogatifs ceux du programme', () => {
    const cells = (id: string) => FAITS.find((f) => f.id === id)!.quote.split(' | ');
    const possessives = cells('tableau-pronoms-possessifs');
    for (const r of ROWS) {
      const at = possessives.indexOf(r.subject);
      expect(possessives.slice(at, at + 4)).toEqual([r.subject, r.object, r.det, r.pronoun ?? '-']);
    }
    const programme = FAITS.find((f) => f.id === 'programme-mots-interrogatifs')!.quote;
    for (const w of WH) expect(programme).toContain(`${w.en.toLowerCase()}?`);
  });

  it('questions valides et niveaux distincts', () => {
    for (const s of skills) {
      const byLevel = LEVELS.map((l) => questions(s.id, l));
      for (const qs of byLevel) expect(validateVariants(qs), s.id).toEqual([]);
      expect(new Set(byLevel.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
    }
  }, 30_000);

  it('au moins deux erreurs typiques ; chaque réponse saisie est jugée juste, avec un indice qui la tait', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const l of LEVELS)
        for (const q of questions(s.id, l)) {
          for (const t of q.traps) reasons.add(t.why);
          if (q.answer.kind !== 'text') continue;
          accepts(q, ...q.answer.accepted);
          const word = q.answer.accepted[0]!.toLowerCase();
          // Mot entier : « he » ou « it » se cachent dans bien des mots français.
          expect(q.hint.toLowerCase().split(/[^a-z’]+/), q.prompt).not.toContain(word);
        }
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  }, 30_000);

  it('niveau 5 : document, au moins 4 trous, réponses variables d’une graine à l’autre', () => {
    for (const s of skills) {
      const sequences = new Set<string>();
      for (const q of questions(s.id, 5)) {
        expect(q.figure?.kind).toBe('document');
        const answers = expected(q);
        expect(answers.length).toBeGreaterThanOrEqual(4);
        expect(check(q, { kind: 'cloze', answers }).correct, q.prompt).toBe(true);
        sequences.add(answers.join(','));
      }
      expect(sequences.size, s.id).toBeGreaterThan(3);
    }
  });

  it('pronoms sujets : le groupe avec « I » donne we, la météo donne it', () => {
    const we = find('a6-pronoms-sujets', 3, '« My friends and I »');
    accepts(we, 'We', 'we', 'We play football.');
    refuses(we, 'They', 'Us', 'Our');
    const rain = find('a6-pronoms-sujets', 4, 'Il pleut');
    accepts(rain, 'It', 'it');
    refuses(rain, 'He', 'Its', 'There');
  });

  it('pronoms compléments : forme complément après verbe et préposition', () => {
    const wait = find('a6-pronoms-complements', 4, 'This present is for');
    accepts(wait, 'her', 'Her.');
    refuses(wait, 'she', 'hers', 'him');
    const her = find('a6-pronoms-complements', 3, '« my sister »');
    accepts(her, 'her');
    refuses(her, 'she', 'him', 'hers');
  });

  it('pronoms compléments, niveau 4 : référent à déduire, sans pronom sujet fourni', () => {
    const cases = [
      ['Ben and I are lost.', 'us'],
      ['My mum and I', 'us'],
      ['Lisa is my friend.', 'her'],
      ['My little sister', 'her'],
      ['Tom is in the garden.', 'him'],
      ['My uncle', 'him'],
      ['This song', 'it'],
      ['My bag', 'it'],
      ['The window', 'it'],
      ['My grandparents', 'them'],
      ['The twins', 'them'],
      ['These apples', 'them'],
    ] as const;
    const all = questions('a6-pronoms-complements', 4);
    expect(new Set(all.map((q) => q.prompt)).size).toBe(cases.length);
    for (const q of all) expect(q.prompt).not.toMatch(/[()]/);
    for (const [lead, pro] of cases) {
      const q = find('a6-pronoms-complements', 4, lead);
      accepts(q, pro);
      refuses(q, ...['me', 'him', 'her', 'it', 'us', 'them'].filter((p) => p !== pro));
    }
  });

  it('déterminants possessifs : its sans apostrophe, accord avec le possesseur', () => {
    const its = find('a6-determinants-possessifs', 4, 'The tree');
    accepts(its, 'its', 'Its');
    refuses(its, 'it’s', "it's", 'his', 'their');
    const her = find('a6-determinants-possessifs', 3, 'le chien de Lisa');
    accepts(her, 'Her');
    refuses(her, 'His', 'She', 'Hers');
  });

  it('pronoms possessifs : un seul mot, sans apostrophe ni déterminant', () => {
    const hers = find('a6-pronoms-possessifs', 3, 'This is her bag.');
    accepts(hers, 'hers', 'Hers.');
    refuses(hers, 'her', 'her’s', "her's", 'his');
    const mine = find('a6-pronoms-possessifs', 4, '« My coat »');
    accepts(mine, 'Mine');
    refuses(mine, 'My', 'Me', 'Mines', 'My coat');
  });

  it('mots interrogatifs : la réponse décide du mot', () => {
    const why = find('a6-mots-interrogatifs', 4, 'is he sad?');
    accepts(why, 'Why', 'why');
    refuses(why, 'Because', 'What', 'How');
    const how = find('a6-mots-interrogatifs', 4, 'old is your brother?');
    accepts(how, 'How');
    refuses(how, 'What', 'Who');
  });
});
