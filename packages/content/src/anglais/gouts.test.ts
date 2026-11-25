import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_TASTES_CHAPTER } from './gouts.ts';
import { FAITS } from './gouts-faits.ts';

const { skills } = ENGLISH_TASTES_CHAPTER;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const questions = (id: string, level: Level) => Array.from({ length: 300 }, (_, i) => generate(id, level, i + 1));

describe('anglais cm1 : goûts et capacités', () => {
  it('4 notions à 5 niveaux, sources valides et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual(['acm1-like', 'acm1-can', 'acm1-sports-loisirs', 'acm1-animaux']);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('cycle3-2020');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_TASTES_CHAPTER })).toEqual([]);
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

  it('questions valides et niveaux distincts', () => {
    for (const s of skills) {
      const byLevel = LEVELS.map((l) => questions(s.id, l));
      for (const qs of byLevel) expect(validateVariants(qs.slice(0, 20)), s.id).toEqual([]);
      expect(new Set(byLevel.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
    }
  });

  it('saisie : réponses justes acceptées, chaque piège jugé faux et expliqué ; deux pièges au moins', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const l of LEVELS)
        for (const q of questions(s.id, l)) {
          for (const t of q.traps) reasons.add(t.why);
          if (q.answer.kind !== 'text') continue;
          for (const text of q.answer.accepted) expect(check(q, { kind: 'text', text }).correct, q.prompt).toBe(true);
          for (const t of q.traps)
            if ('text' in t)
              expect(check(q, { kind: 'text', text: t.text }).correct, `${q.prompt} ${t.text}`).toBe(false);
        }
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('négations : « cannot », « do not » et apostrophe droite acceptés', () => {
    const can = questions('acm1-can', 4).find((q) => q.prompt.includes('forme négative'))!;
    const [, subject, action] = /« (\w+) can (.+)\. »/.exec(can.prompt) ?? [];
    for (const n of ['can’t', "can't", 'cannot'])
      expect(check(can, { kind: 'text', text: `${subject} ${n} ${action}.` }).correct, n).toBe(true);
    const like = questions('acm1-like', 4).find((q) => q.prompt.includes('forme négative'))!;
    const [, who, thing] = /« (\w+) likes (\w+)\. »/.exec(like.prompt) ?? [];
    for (const n of ["doesn't", 'does not'])
      expect(check(like, { kind: 'text', text: `${who} ${n} like ${thing}` }).correct, n).toBe(true);
  });

  it('niveau 5 : la réponse vient de la ligne du bon enfant', () => {
    for (const id of ['acm1-like', 'acm1-can', 'acm1-sports-loisirs', 'acm1-animaux'])
      for (const q of questions(id, 5)) {
        if (q.figure?.kind !== 'document' || q.answer.kind !== 'text') throw new Error('document attendu');
        const kid = q.figure.lines
          .map((l) => l.split(':')[0]!)
          .find((n) => new RegExp(`(\\b|’)${n}\\b`).test(q.prompt))!;
        const line = q.figure.lines.find((l) => l.startsWith(`${kid}:`))!;
        const good = q.answer.accepted[0]!;
        if (id === 'acm1-like') {
          const thing = /like (\w+)\?/.exec(q.prompt)![1]!;
          expect(line).toContain(good.startsWith('Yes') ? `I like ${thing}.` : `I don’t like ${thing}.`);
        } else if (id === 'acm1-animaux') expect(line).toContain(`I’ve got a ${good.split(' got a ')[1]}.`);
        else {
          const said = good
            .replace(/^(He|She) /, 'I ')
            .replace('likes', 'like')
            .replace('doesn’t', 'don’t');
          expect(line, q.prompt).toContain(`${said}.`);
        }
      }
  });

  it('can, niveau 2 : l’écoute ne montre pas la phrase dans l’énoncé', () => {
    const audio = questions('acm1-can', 2).filter((q) => q.audio);
    expect(audio.length).toBeGreaterThan(0);
    for (const q of audio) expect(q.prompt).not.toContain(q.audio!.text);
  });
});
