import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_PRESENT_SIMPLE_CHAPTER, VERBS } from './present-simple.ts';
import { FAITS } from './present-simple-faits.ts';

const { skills } = ENGLISH_PRESENT_SIMPLE_CHAPTER;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const questions = (id: string, level: Level) => Array.from({ length: 400 }, (_, i) => generate(id, level, i + 1));
const text = (q: Question, t: string) => check(q, { kind: 'text', text: t }).correct;
const blanks = (q: Question) => {
  if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
  return q.answer.blanks.map((b) => (b.mode === 'list' ? b.options[b.correct]! : b.accepted[0]!));
};
const filled = (q: Question) => check(q, { kind: 'cloze', answers: blanks(q) }).correct;
const lines = (q: Question) => {
  if (q.figure?.kind !== 'document') throw new Error('document attendu');
  return q.figure.lines;
};
const find = (id: string, level: Level, part: string) => {
  const q = questions(id, level).find((x) => x.prompt.includes(part));
  if (!q) throw new Error(`question introuvable : ${part}`);
  return q;
};

describe('anglais 6e : le présent simple', () => {
  it('4 notions à 5 niveaux, identifiant historique conservé, sources et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'a6-present-affirmatif',
      'a6-present-3e-personne',
      'a6-present-negation',
      'a6-present-questions',
    ]);
    expect(skills.map((s) => s.version)).toEqual([1, 2, 1, 1]);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('anglais-college-2025');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_PRESENT_SIMPLE_CHAPTER })).toEqual([]);
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

  it('au moins deux erreurs typiques ; l’indice ne contient pas la réponse saisie', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const l of LEVELS)
        for (const q of questions(s.id, l)) {
          for (const t of q.traps) reasons.add(t.why);
          if (q.answer.kind !== 'text') continue;
          for (const t of q.answer.accepted) expect(text(q, t), q.prompt).toBe(true);
          expect(q.hint).not.toContain(q.answer.accepted[0]!);
        }
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('formes avec he, she, it : -s, -es, -ies et have → has', () => {
    const forms = Object.fromEntries(VERBS.map((v) => [v.base, v.s]));
    expect(forms).toMatchObject({
      work: 'works',
      brush: 'brushes',
      go: 'goes',
      do: 'does',
      tidy: 'tidies',
      study: 'studies',
      play: 'plays',
      have: 'has',
    });
    for (const v of VERBS) expect(v.bad).not.toBe(v.s);
  });

  it('affirmatif, niveau 5 : l’activité commune et l’activité propre viennent des bons messages', () => {
    for (const q of questions('a6-present-affirmatif', 5)) {
      const [verb, group, own] = blanks(q);
      const name = /seul le message (?:de |d’)(\w+)/.exec(q.prompt)![1]!;
      const v = VERBS.find((x) => x.s === own)!;
      expect(lines(q).filter((l) => l.includes(`I ${verb} ${group}.`))).toHaveLength(2);
      const mine = lines(q).find((l) => l.startsWith(`${name}:`))!;
      const other = lines(q).find((l) => !l.startsWith(`${name}:`))!;
      if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
      // Le verbe saisi se transforme : le message porte la base, jamais la forme attendue.
      expect(mine).not.toContain(` ${own} `);
      const phrase = `I ${v.base}${q.answer.parts[3]}`;
      expect(mine).toContain(phrase);
      expect(other).not.toContain(phrase);
      expect(filled(q)).toBe(true);
    }
    const typed = new Set(questions('a6-present-affirmatif', 5).map((q) => blanks(q)[2]));
    for (const form of ['rides', 'brushes', 'does', 'tidies', 'studies', 'has']) expect(typed).toContain(form);
  });

  it('niveau 3 : l’énoncé cite les éléments dans l’ordre mélangé, jamais la réponse', () => {
    for (const id of ['a6-present-affirmatif', 'a6-present-questions'])
      for (const q of questions(id, 3)) {
        if (q.answer.kind !== 'order') throw new Error('ordre attendu');
        const { items, correct } = q.answer;
        const quoted = [...q.prompt.matchAll(/« (.+?) »/g)].map((m) => m[1]);
        expect(quoted).toEqual(items);
        expect(quoted).not.toEqual(correct.map((i) => items[i]));
      }
  });

  it('questions, niveau 4 : « my… » ou « your… » sont acceptés', () => {
    const seen = new Set<string>();
    for (const q of questions('a6-present-questions', 4)) {
      if (q.answer.kind !== 'text' || !q.prompt.includes('« My ')) continue;
      const mine = q.answer.accepted.filter((a) => a.includes(' my '));
      expect(mine.length, q.prompt).toBeGreaterThan(0);
      for (const a of mine) expect(text(q, a.replace(' my ', ' your ')), a).toBe(true);
      seen.add(q.prompt.startsWith('Pose') ? 'mot interrogatif' : 'transformation');
    }
    expect([...seen].sort()).toEqual(['mot interrogatif', 'transformation']);
    const ride = find('a6-present-questions', 4, '« My brother rides');
    expect(text(ride, 'Does your brother ride a bike after school?')).toBe(true);
    expect(text(ride, 'Does your brother rides a bike after school?')).toBe(false);
  });

  it('3e personne, niveau 5 : chaque verbe est celui du message, mis à la 3e personne', () => {
    for (const q of questions('a6-present-3e-personne', 5)) {
      if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
      const { parts } = q.answer;
      blanks(q).forEach((form, i) => {
        const v = VERBS.find((x) => x.s === form)!;
        expect(parts[i + 1]).toContain(`${v.obj} ${v.time}`);
        expect(lines(q)).toContain(`I ${v.base} ${v.obj} ${v.time}.`);
      });
      expect(filled(q)).toBe(true);
    }
  });

  it('négation : « doesn’t », « does not » et apostrophe droite acceptés ; -s refusé', () => {
    const q = find('a6-present-negation', 3, '« Tom plays football');
    for (const t of ['doesn’t play', "doesn't play", 'does not play']) expect(text(q, t), t).toBe(true);
    for (const t of ['doesn’t plays', 'don’t play', 'not play']) expect(text(q, t), t).toBe(false);
    const full = find('a6-present-negation', 4, '« Lisa tidies');
    for (const t of ["Lisa doesn't tidy the kitchen on Sundays", 'Lisa does not tidy the kitchen on Sundays.'])
      expect(text(full, t), t).toBe(true);
  });

  it('avec have, la forme sans do est aussi acceptée (négation et question)', () => {
    const no = find('a6-present-negation', 4, '« Tom has a music lesson');
    for (const t of ['Tom doesn’t have a music lesson on Mondays.', 'Tom hasn’t a music lesson on Mondays.'])
      expect(text(no, t), t).toBe(true);
    expect(text(no, 'Tom doesn’t has a music lesson on Mondays.')).toBe(false);
    const ask = find('a6-present-questions', 4, '« Tom has a music lesson');
    for (const t of ['Does Tom have a music lesson on Mondays?', 'Has Tom a music lesson on Mondays'])
      expect(text(ask, t), t).toBe(true);
  });

  it('négation, niveau 5 : les trois trous suivent l’enquête', () => {
    for (const q of questions('a6-present-negation', 5)) {
      const [yes, no, both] = blanks(q);
      if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
      const a = q.answer.parts[0]!.trim();
      const row = (verb: string) => lines(q).find((l) => l.startsWith(`${verb} `))!;
      const first = VERBS.find((v) => v.s === yes)!.base;
      expect(row(first)).toContain(`${a}: yes`);
      expect(row(first)).toMatch(/: yes — \w+: no$/);
      expect(no).toBe(`doesn’t ${first}`);
      expect(row(both!.replace('don’t ', '')).match(/: no/g)).toHaveLength(2);
      expect(filled(q)).toBe(true);
    }
  });

  it('questions : avec ou sans « ? » ; mot interrogatif devant do ou does', () => {
    const q = find('a6-present-questions', 4, '« Lisa tidies');
    const good = 'Does Lisa tidy the kitchen on Sundays';
    for (const t of [good, `${good}?`, `${good} ?`, good.toLowerCase()]) expect(text(q, t), t).toBe(true);
    expect(text(q, 'Does Lisa tidies the kitchen on Sundays?')).toBe(false);
    expect(text(find('a6-present-questions', 4, '« Tom lives in London'), 'Where does Tom live?')).toBe(true);
    const time = find('a6-present-questions', 4, '« My parents start work');
    if (time.prompt.includes('What time')) expect(text(time, 'What time do my parents start work?')).toBe(true);
  });

  it('questions, niveau 5 : les réponses suivent le message de l’enfant interrogé', () => {
    for (const q of questions('a6-present-questions', 5)) {
      if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
      const name = /questions sur (\w+) :/.exec(q.prompt)![1]!;
      const mine = lines(q).find((l) => l.startsWith(`${name}:`))!;
      const a = blanks(q);
      const asked = [...q.prompt.matchAll(/« (.+?) »/g)].map((m) => VERBS.find((x) => x.fr === m[1])!);
      // Blocs de trous : [Does, Yes/No, réponse] puis [Does, verbe, Yes/No, réponse].
      asked.forEach((v, i) => {
        const { base } = v;
        // Le verbe à saisir n’est pas recopiable de l’énoncé.
        expect(q.prompt).not.toContain(`« ${base} »`);
        const yes = mine.includes(`I ${base} ${v.obj} ${v.time}.`);
        if (!yes) expect(mine).toContain(`I don’t ${base} ${v.obj} ${v.time}.`);
        expect(a.slice([1, 5][i], [3, 7][i])).toEqual(yes ? ['Yes', 'does'] : ['No', 'doesn’t']);
      });
      expect([a[0], a[3], a[4]]).toEqual(['Does', 'Does', asked[1]!.base]);
      expect(q.answer.parts.join(' ')).not.toContain('Does');
      expect(filled(q)).toBe(true);
    }
  });
});
