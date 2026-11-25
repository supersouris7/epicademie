import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_QUESTIONS_CHAPTER } from './poser-questions.ts';
import { FAITS } from './poser-questions-faits.ts';

const { skills } = ENGLISH_QUESTIONS_CHAPTER;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const questions = (id: string, level: Level) => Array.from({ length: 400 }, (_, i) => generate(id, level, i + 1));
const text = (q: Question, t: string) => check(q, { kind: 'text', text: t }).correct;
const cloze = (q: Question, answers: string[]) => check(q, { kind: 'cloze', answers }).correct;
/** La ligne du document qui parle de l’enfant nommé dans l’énoncé (« à Ana », « sur Ana », « Tu interroges Ana »). */
const lineOf = (q: Question, pattern: RegExp) => {
  if (q.figure?.kind !== 'document') throw new Error('document attendu');
  const name = pattern.exec(q.prompt)?.[1];
  const line = q.figure.lines.find((l) => l.startsWith(`${name}:`));
  if (!line) throw new Error(`ligne introuvable : ${q.prompt}`);
  return line;
};
const firsts = (q: Question) => {
  if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
  return q.answer.blanks.map((b) => (b.mode === 'text' ? b.accepted[0]! : ''));
};

describe('anglais cm2 : poser des questions', () => {
  it('4 notions à 5 niveaux, sources et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'acm2-mots-interrogatifs',
      'acm2-how-old-many',
      'acm2-do-you',
      'acm2-can-you',
    ]);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('cycle3-2020');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_QUESTIONS_CHAPTER })).toEqual([]);
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

  it('l’écoute ne montre pas la question entendue', () => {
    for (const s of skills) {
      const audio = questions(s.id, 2).filter((q) => q.audio);
      expect(audio.length, s.id).toBeGreaterThan(0);
      for (const q of audio) expect(q.prompt).not.toContain(q.audio!.text);
    }
  });

  it('mots interrogatifs, niveau 5 : le mot suit la question, l’information vient du bon message', () => {
    const word: Readonly<Record<string, string>> = {
      'do you live?': 'Where',
      'is your birthday?': 'When',
      'is your best friend?': 'Who',
      'is your favourite food?': 'What',
    };
    for (const q of questions('acm2-mots-interrogatifs', 5)) {
      if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
      const line = lineOf(q, /questions à (\w+)\./);
      const answers = firsts(q);
      for (const i of [0, 1]) {
        const rest = Object.keys(word).find(
          (r) => q.answer.kind === 'cloze' && q.answer.parts[2 * i + 1]!.includes(r),
        )!;
        expect(answers[2 * i], q.prompt).toBe(word[rest]);
        expect(line, q.prompt).toContain(` ${answers[2 * i + 1]}.`);
      }
      expect(cloze(q, answers)).toBe(true);
    }
  });

  it('how old, how many : nombre au pluriel ; question avec ou sans « ? »', () => {
    for (const q of questions('acm2-how-old-many', 4)) {
      if (q.answer.kind !== 'text') throw new Error('saisie attendue');
      const good = q.answer.accepted[0]!;
      for (const t of [good, `${good}?`, `${good} ?`, good.toLowerCase()]) expect(text(q, t), t).toBe(true);
      if (good.startsWith('How many')) expect(good).toMatch(/^How many \w+s have you got$/);
    }
  });

  it('how old, how many, niveau 5 : les nombres viennent de la carte de l’enfant, en lettres ou en chiffres', () => {
    for (const q of questions('acm2-how-old-many', 5)) {
      if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
      const line = lineOf(q, /sur (\w+) \(/);
      const answers = firsts(q);
      for (const i of [0, 1]) {
        const part = q.answer.parts[2 * i + 1]!;
        const pet = /^ (\w+) has/.exec(part)?.[1];
        expect(answers[2 * i]).toBe(pet ? 'How many' : 'How old');
        expect(line, q.prompt).toContain(pet ? `${answers[2 * i + 1]} ${pet}` : `I’m ${answers[2 * i + 1]}.`);
      }
      expect(cloze(q, answers)).toBe(true);
      const digits = q.answer.blanks.map((b) => (b.mode === 'text' ? (b.accepted.at(-1) ?? '') : ''));
      expect(cloze(q, digits)).toBe(true);
    }
  });

  it('réponses courtes : avec ou sans virgule, « don’t » et « do not »', () => {
    const find = (id: string, level: Level, start: string) =>
      questions(id, level).find((q) => q.prompt.startsWith(start))!;
    const no = find('acm2-do-you', 3, 'Réponds non');
    for (const t of ['No, I don’t.', "no i don't", 'No, I do not']) expect(text(no, t), t).toBe(true);
    expect(text(no, 'Yes, I do.')).toBe(false);
    const cant = find('acm2-can-you', 3, 'Réponds non');
    for (const t of ["No, I can't.", 'No I cannot', 'No, I can not']) expect(text(cant, t), t).toBe(true);
  });

  it('do you, niveau 4 : we avec « toi et un ami », they avec deux autres', () => {
    const plural = questions('acm2-do-you', 4).filter((q) => /« Do (you and )?\w+ (and \w+ )?/.test(q.prompt));
    const short = plural.filter((q) => q.prompt.startsWith('Réponds'));
    expect(short.length).toBeGreaterThan(0);
    for (const q of short) {
      const we = q.prompt.includes('Do you and ');
      const yes = q.prompt.startsWith('Réponds oui');
      const good = `${yes ? 'Yes' : 'No'}, ${we ? 'we' : 'they'} ${yes ? 'do' : 'don’t'}.`;
      expect(text(q, good), q.prompt).toBe(true);
      expect(text(q, good.replace(/we|they/, 'I')), q.prompt).toBe(false);
    }
  });

  it('do you, niveau 5 : les réponses suivent le message de l’enfant interrogé', () => {
    for (const q of questions('acm2-do-you', 5)) {
      if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
      const line = lineOf(q, /interroges (\w+)\./);
      const a = firsts(q);
      for (const i of [0, 1]) {
        const thing = /Do you like (\w+)\?/.exec(q.answer.parts[2 * i]!)![1]!;
        const yes = line.includes(`I like ${thing}.`);
        expect([a[2 * i], a[2 * i + 1]], q.prompt).toEqual(yes ? ['Yes', 'do'] : ['No', 'don’t']);
      }
      expect(line).toContain(`I play ${a[6]}.`);
      expect(cloze(q, a), q.prompt).toBe(true);
    }
  });

  it('can you, niveau 5 : les réponses suivent le message, le pronom suit l’enfant', () => {
    for (const q of questions('acm2-can-you', 5)) {
      if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
      const line = lineOf(q, /sur (\w+),/);
      const girl = q.prompt.includes('est une fille.');
      const a = firsts(q);
      for (const [i, start] of [
        [0, 0],
        [1, 3],
      ] as const) {
        const action = /Can \w+ (.+)\? »/.exec(q.answer.parts[start]!)![1]!;
        const yes = line.includes(`I can ${action}.`);
        expect(a.slice(3 * i, 3 * i + 3), q.prompt).toEqual([
          yes ? 'Yes' : 'No',
          girl ? 'she' : 'he',
          yes ? 'can' : 'can’t',
        ]);
      }
      expect(cloze(q, a), q.prompt).toBe(true);
    }
  });
});
