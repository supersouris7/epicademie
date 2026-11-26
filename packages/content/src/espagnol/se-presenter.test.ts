import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { SPANISH_PRESENTATION_CHAPTER as chapter } from './se-presenter.ts';
import { FAITS, NO_ACCENT, WRITTEN_ACCENT, numberWord } from './se-presenter-faits.ts';

const skills = chapter.skills;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const many = (id: string, level: Level, n = 200) => Array.from({ length: n }, (_, seed) => generate(id, level, seed));
const find = (id: string, level: Level, wanted: (q: Question) => boolean): Question => {
  const q = many(id, level).find(wanted);
  if (!q) throw new Error(`question introuvable : ${id} niveau ${level}`);
  return q;
};
const typed = (q: Question, text: string) => check(q, { kind: 'text', text });

describe('espagnol 5e : se présenter', () => {
  it('4 notions à 5 niveaux, sources valides (programme cité) et termes définis', () => {
    expect(skills.map((s) => s.id)).toEqual(['e5-saluer', 'e5-se-presenter', 'e5-nombres', 'e5-alphabet-accent']);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('espagnol-college-2025');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter })).toEqual([]);
    }
  });

  it('chaque fait cite une source du registre (domaine autorisé), citée par une notion, avec une citation', () => {
    const cited = new Set(skills.flatMap((s) => s.lesson.sources ?? []));
    for (const f of FAITS) {
      const src = getSource(f.sourceId);
      expect(src, f.id).toBeDefined();
      expect(isAllowedUrl(src!.url), f.id).toBe(true);
      expect(cited.has(f.sourceId), f.id).toBe(true);
      expect(f.quote.trim().length, f.id).toBeGreaterThan(0);
    }
    expect(new Set(FAITS.map((f) => f.id)).size).toBe(FAITS.length);
  });

  it('5 niveaux valides sur 200 graines, avec au moins deux erreurs typiques expliquées', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const level of LEVELS) {
        const questions = many(s.id, level);
        expect(validateVariants(questions), `${s.id} niveau ${level}`).toEqual([]);
        for (const q of questions) for (const t of q.traps) reasons.add(t.why);
      }
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('les conjugaisons et les nombres cités correspondent au code', () => {
    expect(numberWord(0)).toBe('cero');
    expect(numberWord(16)).toBe('dieciséis');
    expect(numberWord(22)).toBe('veintidós');
    expect(numberWord(31)).toBe('treinta y uno');
    expect(numberWord(100)).toBe('cien');
    expect(() => numberWord(101)).toThrow();
  });

  it('saluer : « au revoir » accepte adiós et hasta luego, sans exiger les accents', () => {
    const q = find('e5-saluer', 4, (x) => x.prompt.includes('« au revoir »'));
    for (const text of ['Adiós', 'adios.', '¡Hasta luego!']) expect(typed(q, text).correct, text).toBe(true);
    expect(typed(q, 'hola').correct).toBe(false);
  });

  it('se présenter : « Soy … años » est refusé avec une explication', () => {
    const q = find('e5-se-presenter', 4, (x) => x.prompt.includes('ils ont 12 ans'));
    expect(typed(q, 'Tienen 12 años').correct).toBe(true);
    expect(typed(q, 'tienen doce años.').correct).toBe(true);
    expect(typed(q, 'son doce años').why).toMatch(/tener/);
    expect(typed(q, 'tienen doce anos').correct).toBe(false);
  });

  it('nombres : graphie simple admise après 30, « veinte y dos » refusé, apocope exigée', () => {
    const q = find('e5-nombres', 4, (x) => /nombre 2[2-9]\./.test(x.prompt));
    expect(typed(q, 'veinte y dos').correct).toBe(false);
    const high = find('e5-nombres', 4, (x) => /nombre [3-9][1-9]\./.test(x.prompt));
    const n = Number(/nombre (\d+)\./.exec(high.prompt)![1]);
    expect(typed(high, numberWord(n)).correct).toBe(true);
    expect(typed(high, numberWord(n).replace(' y ', 'i')).correct).toBe(true);
    expect(typed(high, numberWord(n).replace(' y ', ' ')).why).toMatch(/« y »/);
    const apocope = find('e5-nombres', 4, (x) => x.prompt.includes('(21 ans)'));
    expect(typed(apocope, 'veintiun').correct).toBe(true);
    expect(typed(apocope, 'veintiuno').why).toMatch(/« un »/);
  });

  it('accent tonique : la tilde et la terminaison des mots suivent les règles citées', () => {
    for (const w of NO_ACCENT) {
      const text = w.syllables.join('');
      expect(text, text).not.toMatch(/[áéíóú]/);
      expect(w.stress, text).toBe(w.syllables.length - (/[aeiouns]$/.test(text) ? 2 : 1));
    }
    for (const w of WRITTEN_ACCENT) {
      expect(w.syllables[w.stress], w.syllables.join('')).toMatch(/[áéíóú]/);
    }
  });

  it('alphabet : « i griega » est admis pour y', () => {
    const q = find('e5-alphabet-accent', 3, (x) => x.prompt.includes('lettre « y »'));
    expect(typed(q, 'i griega').correct).toBe(true);
    expect(typed(q, 'ye').correct).toBe(true);
  });
});
