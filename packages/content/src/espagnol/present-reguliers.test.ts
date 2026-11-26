import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { CONJUGAISONS } from './conjugaisons.generated.ts';
import { ESPAGNOL_CHAPTERS } from './index.ts';
import { ENDINGS, FAITS_PRESENT, PERSONS, PRESENT_RELEVE, VERBES } from './present-reguliers-faits.ts';
import { PRESENT_SKILLS as skills } from './present-reguliers.ts';

const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const GROUPS = ['ar', 'er', 'ir'] as const;
const many = (id: string, level: Level, n = 200) => Array.from({ length: n }, (_, seed) => generate(id, level, seed));
const find = (id: string, level: Level, wanted: (q: Question) => boolean): Question => {
  const q = many(id, level, 600).find(wanted);
  if (!q) throw new Error(`question introuvable : ${id} niveau ${level}`);
  return q;
};
const typed = (q: Question, text: string) => check(q, { kind: 'text', text });

describe('espagnol 5e : le présent des réguliers', () => {
  it('4 notions à 5 niveaux dans le chapitre, identifiant historique conservé, sources et termes définis', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'e5-pronoms-sujets',
      'e5-present-reguliers',
      'e5-present-er',
      'e5-present-ir',
    ]);
    const chapter = ESPAGNOL_CHAPTERS.find((c) => c.id === 'e5-present')!;
    expect(chapter.skills.map((s) => s.id)).toEqual([...skills.map((s) => s.id), 'e5-ser-estar']);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('espagnol-college-2025');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter })).toEqual([]);
    }
  });

  it('chaque fait cite une source du registre (domaine autorisé), citée par une notion, avec une citation', () => {
    const cited = new Set(skills.flatMap((s) => s.lesson.sources ?? []));
    for (const f of FAITS_PRESENT) {
      const src = getSource(f.sourceId);
      expect(src, f.id).toBeDefined();
      expect(isAllowedUrl(src!.url), f.id).toBe(true);
      expect(cited.has(f.sourceId), f.id).toBe(true);
      expect(f.quote.trim().length, f.id).toBeGreaterThan(0);
    }
    expect(new Set(FAITS_PRESENT.map((f) => f.id)).size).toBe(FAITS_PRESENT.length);
  });

  it('les formes utilisées concordent avec le relevé cité et avec les terminaisons régulières', () => {
    for (const g of GROUPS)
      for (const { inf } of VERBES[g]) {
        const forms = PERSONS.map((p) => CONJUGAISONS[inf].present[p]);
        expect(forms.join(' '), inf).toBe(PRESENT_RELEVE[inf]);
        expect(forms, inf).toEqual(PERSONS.map((p) => `${inf.slice(0, -2)}${ENDINGS[g][p]}`));
      }
  });

  it('5 niveaux valides sur 200 graines, avec au moins deux erreurs typiques expliquées', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const level of LEVELS) {
        const questions = many(s.id, level);
        expect(validateVariants(questions), `${s.id} niveau ${level}`).toEqual([]);
        for (const q of questions)
          for (const t of q.traps) {
            expect(t.why.length, `${s.id} niveau ${level}`).toBeGreaterThan(0);
            reasons.add(t.why);
          }
      }
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('pronoms : « él » exige son accent, avec une explication', () => {
    const q = find('e5-pronoms-sujets', 3, (x) => x.prompt.includes('« Antonio »'));
    expect(typed(q, 'Él').correct).toBe(true);
    expect(typed(q, 'el').why).toMatch(/article/);
  });

  it('pronoms : un groupe avec « moi » admet les deux genres seulement quand c’est possible', () => {
    const mixed = find('e5-pronoms-sujets', 3, (x) => x.prompt.includes('« Clara y yo »'));
    for (const text of ['nosotros', 'Nosotras.']) expect(typed(mixed, text).correct, text).toBe(true);
    const male = find('e5-pronoms-sujets', 3, (x) => x.prompt.includes('« Javier y yo »'));
    expect(typed(male, 'nosotras').correct).toBe(false);
  });

  it.each([
    ['e5-present-reguliers', 'habláis', '(hablar)', 'hablan'],
    ['e5-present-er', 'coméis', '(comer)', 'comen'],
    ['e5-present-ir', 'vivís', '(vivir)', 'viven'],
  ] as const)('%s : au niveau 4, « %s » exige l’accent et la bonne personne', (id, right, verb, other) => {
    const q = find(id, 4, (x) => x.prompt.includes('tú y Gonzalo') && x.prompt.includes(verb));
    expect(typed(q, right).correct).toBe(true);
    expect(typed(q, right.normalize('NFD').replace(/́/g, '')).why).toMatch(/accent/);
    expect(typed(q, other).why).toMatch(/ellos/);
  });

  it('niveau 5 : un document et une réécriture à la 3e personne', () => {
    for (const s of skills)
      for (const q of many(s.id, 5, 20)) {
        expect(q.figure?.kind, s.id).toBe('document');
        expect(q.answer.kind, s.id).toBe('cloze');
      }
  });
});
