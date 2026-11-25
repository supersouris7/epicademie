import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_BE_HAVE_CHAPTER } from './be-have.ts';
import { FAITS } from './be-have-faits.ts';

const { skills } = ENGLISH_BE_HAVE_CHAPTER;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const questions = (id: string, level: Level) => Array.from({ length: 600 }, (_, i) => generate(id, level, i + 1));
const text = (q: Question, t: string) => check(q, { kind: 'text', text: t }).correct;
const find = (id: string, level: Level, part: string) => {
  const q = questions(id, level).find((x) => x.prompt.includes(part));
  if (!q) throw new Error(`question introuvable : ${part}`);
  return q;
};
const accepts = (q: Question, ...answers: string[]) => {
  for (const a of answers) expect(text(q, a), `${q.prompt} → ${a}`).toBe(true);
};
const refuses = (q: Question, ...answers: string[]) => {
  for (const a of answers) expect(text(q, a), `${q.prompt} → ${a}`).toBe(false);
};

describe('anglais 6e : be et have', () => {
  it('4 notions à 5 niveaux, identifiant historique conservé, sources et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual(['a6-be-present', 'a6-have', 'a6-be-preterit', 'a6-there-was-were']);
    expect(skills.map((s) => s.version)).toEqual([1, 1, 2, 1]);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('anglais-college-2025');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_BE_HAVE_CHAPTER })).toEqual([]);
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
          accepts(q, ...q.answer.accepted);
          const words = q.hint.toLowerCase().split(/[^a-z’]+/);
          expect(words, q.prompt).not.toContain(q.answer.accepted[0]!.toLowerCase());
        }
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('niveau 5 : un document, 3 ou 4 trous, la bonne saisie est jugée juste', () => {
    for (const s of skills)
      for (const q of questions(s.id, 5)) {
        expect(q.figure?.kind).toBe('document');
        if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
        expect(q.answer.blanks.length).toBeGreaterThanOrEqual(3);
        const answers = q.answer.blanks.map((b) => (b.mode === 'list' ? b.options[b.correct]! : b.accepted[0]!));
        expect(check(q, { kind: 'cloze', answers }).correct, q.prompt).toBe(true);
      }
  });

  it('be au présent : formes pleines et courtes, question avec be devant le sujet', () => {
    const no = find('a6-be-present', 4, 'négative : « She is happy.');
    accepts(no, 'She is not happy.', 'She isn’t happy', "She's not happy");
    refuses(no, 'She doesn’t be happy.', 'She not is happy.');
    const me = find('a6-be-present', 4, 'négative : « I am happy.');
    accepts(me, 'I’m not happy', 'I am not happy.');
    refuses(me, 'I amn’t happy.');
    const ask = find('a6-be-present', 4, 'oui ou non) : « My sister is late.');
    accepts(ask, 'Is my sister late?', 'Is your sister late');
    refuses(ask, 'Does my sister be late?');
  });

  it('have : do ou does, have got et la forme sans do sont acceptés', () => {
    const no = find('a6-have', 4, 'négative : « Tom has a dog.');
    accepts(no, 'Tom doesn’t have a dog.', 'Tom does not have a dog', "Tom hasn't got a dog.", 'Tom hasn’t a dog');
    refuses(no, 'Tom doesn’t has a dog.', 'Tom don’t have a dog.');
    const ask = find('a6-have', 4, 'oui ou non) : « Tom has a dog.');
    accepts(ask, 'Does Tom have a dog?', 'Has Tom got a dog?', 'Has Tom a dog');
    refuses(ask, 'Does Tom has a dog?', 'Do Tom have a dog?');
  });

  it('was / were : accord, négation et question sans did', () => {
    const plural = find('a6-be-preterit', 3, '« They … ');
    accepts(plural, 'were');
    refuses(plural, 'was', 'are');
    const no = find('a6-be-preterit', 4, 'négative : « Lisa was ');
    expect(no.answer.kind === 'text' && no.answer.accepted.some((a) => a.startsWith('Lisa wasn’t'))).toBe(true);
    const ask = find('a6-be-preterit', 4, 'oui ou non) : « Tom and Ana were ');
    expect(ask.answer.kind === 'text' && ask.answer.accepted[0]!.startsWith('Were Tom and Ana ')).toBe(true);
  });

  it('there was / were : singulier, pluriel, négation avec any', () => {
    const no = find('a6-there-was-were', 4, 'négative : « There were some parks');
    accepts(no, 'There weren’t any parks in the town.', 'There were no parks in the town');
    refuses(no, 'There weren’t some parks in the town.', 'There wasn’t any parks in the town.');
    const ask = find('a6-there-was-were', 4, 'oui ou non) : « There was a park');
    accepts(ask, 'Was there a park in the town?');
    refuses(ask, 'Were there a park in the town?', 'Did there be a park in the town?');
  });
});
