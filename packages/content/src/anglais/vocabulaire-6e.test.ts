import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_VOCABULARY_6E_CHAPTER } from './vocabulaire-6e.ts';
import { AXIS_WORDS, FAITS, FOODS, HOME, LEISURE, SCHOOL, STUDIES } from './vocabulaire-6e-faits.ts';

const { skills } = ENGLISH_VOCABULARY_6E_CHAPTER;
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
const plain = (s: string) => s.toLowerCase().replaceAll('-', ' ');

describe('anglais 6e : vocabulaire thématique', () => {
  it('5 notions à 5 niveaux, sources citées et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'a6-voc-ecole',
      'a6-voc-loisirs',
      'a6-voc-alimentation',
      'a6-voc-maison',
      'a6-axes-culturels',
    ]);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('anglais-college-2025');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_VOCABULARY_6E_CHAPTER })).toEqual([]);
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

  it('chaque mot anglais et chaque objet d’étude figure dans une citation', () => {
    const quotes = FAITS.map((f) => plain(f.quote)).join(' § ');
    for (const t of [...SCHOOL, ...LEISURE, ...FOODS, ...HOME, ...AXIS_WORDS])
      expect(quotes, t.en).toContain(plain(t.en.replace(/^to /, '')));
    for (const s of STUDIES) expect(quotes, s.name).toContain(plain(s.name));
    for (let axis = 0; axis < 5; axis++) expect(STUDIES.filter((s) => s.axis === axis)).toHaveLength(4);
  });

  it('un sens français ne désigne qu’un mot, et aucune faute typique n’est une réponse admise', () => {
    for (const list of [SCHOOL, LEISURE, FOODS, HOME, AXIS_WORDS]) {
      expect(new Set(list.map((t) => t.fr)).size).toBe(list.length);
      for (const t of list) expect([t.en, ...t.alt], t.en).not.toContain(t.typo);
    }
  });

  it('questions valides et niveaux distincts', () => {
    for (const s of skills) {
      const byLevel = LEVELS.map((l) => questions(s.id, l));
      for (const qs of byLevel) expect(validateVariants(qs), s.id).toEqual([]);
      expect(new Set(byLevel.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
    }
  }, 60_000);

  it('au moins deux erreurs typiques ; chaque réponse saisie est jugée juste, avec un indice qui la tait', () => {
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
  }, 60_000);

  it('niveau 5 : document, 4 trous à choisir, réponses variables d’une graine à l’autre', () => {
    for (const s of skills) {
      const sequences = new Set<string>();
      for (const q of questions(s.id, 5)) {
        expect(q.figure?.kind).toBe('document');
        if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
        expect(q.answer.blanks).toHaveLength(4);
        const answers = q.answer.blanks.map((b) => {
          if (b.mode !== 'list') throw new Error('liste attendue');
          expect(b.options.length).toBeGreaterThanOrEqual(2);
          expect(new Set(b.options).size).toBe(b.options.length);
          return b.options[b.correct]!;
        });
        expect(check(q, { kind: 'cloze', answers }).correct, q.prompt).toBe(true);
        sequences.add(answers.join(','));
      }
      expect(sequences.size, s.id).toBeGreaterThan(20);
    }
  });

  it('variantes britanniques et américaines, article admis', () => {
    const fridge = find('a6-voc-maison', 3, '« le réfrigérateur »');
    accepts(fridge, 'fridge', 'refrigerator');
    refuses(fridge, 'the fridge', 'a fridge');
    const flat = find('a6-voc-maison', 4, '« l’appartement »');
    accepts(flat, 'flat', 'a flat', 'an apartment', 'Apartment.');
    refuses(flat, 'house', 'an flat');
    const furniture = find('a6-voc-maison', 4, '(le mobilier)');
    accepts(furniture, 'furniture', 'some furniture');
    refuses(furniture, 'furnitures', 'a furniture');
    const zucchini = find('a6-voc-alimentation', 4, '« la courgette »');
    accepts(zucchini, 'zucchini', 'a courgette');
    const library = find('a6-voc-loisirs', 3, 'borrow books');
    accepts(library, 'library');
    refuses(library, 'the library', 'bookshop', 'librery');
    const scissors = find('a6-voc-ecole', 3, '« les ciseaux »');
    accepts(scissors, 'scissors');
    refuses(scissors, 'a scissors', 'some pair of scissors', 'ruler');
    const wear = find('a6-voc-ecole', 3, 'wear a school');
    refuses(wear, 'school uniform', 'an uniform');
    accepts(find('a6-voc-ecole', 4, '« l’uniforme »'), 'uniform', 'a uniform');
    accepts(find('a6-voc-alimentation', 3, 'sandwich with'), 'cheese', 'some cheese');
  });

  it('niveau 5 : la réponse attendue suit la phrase, affirmée ou niée', () => {
    for (const q of questions('a6-voc-alimentation', 5)) {
      if (q.answer.kind !== 'cloze' || q.figure?.kind !== 'document') throw new Error('document attendu');
      const i = q.answer.parts.findIndex((p) => p.includes('n’a pas'));
      if (i < 0) continue;
      const blank = q.answer.blanks[i]!;
      if (blank.mode !== 'list') throw new Error('liste attendue');
      const good = FOODS.find((t) => t.fr === blank.options[blank.correct])!;
      expect(q.figure.lines[i]).toContain(`haven’t got any ${good.en}`);
    }
  });

  it('école, niveau 5 : jamais un objet à la fois dans le sac et introuvable', () => {
    for (const q of questions('a6-voc-ecole', 5)) {
      if (q.figure?.kind !== 'document') throw new Error('document attendu');
      const doc = q.figure.lines.join(' ');
      const lost = /can’t find my ([a-z ]+)\./.exec(doc)?.[1];
      if (lost) expect(doc).not.toMatch(new RegExp(`I’ve got an? ${lost}\\.`));
    }
  });

  it('axes : un objet d’étude renvoie à son seul axe', () => {
    for (const q of questions('a6-axes-culturels', 1)) {
      if (q.answer.kind !== 'choice') throw new Error('QCM attendu');
      expect(q.answer.options).toHaveLength(3);
      const s = STUDIES.find((x) => q.prompt.includes(`« ${x.name} »`))!;
      expect(s.plain, q.prompt).toBe(true);
    }
    const witch = find('a6-axes-culturels', 3, '« la sorcière »');
    accepts(witch, 'witch', 'a witch');
    refuses(witch, 'wizard', 'wich');
  });
});
