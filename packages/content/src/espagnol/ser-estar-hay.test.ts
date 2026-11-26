import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { CONJUGAISONS } from './conjugaisons.generated.ts';
import { ESPAGNOL_CHAPTERS } from './index.ts';
import { PERSONS } from './present-reguliers-faits.ts';
import { FAITS_SER_ESTAR_HAY, PRESENT_SER_ESTAR } from './ser-estar-hay-faits.ts';
import { SER_ESTAR_HAY_SKILLS as skills } from './ser-estar-hay.ts';

const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const many = (id: string, level: Level, n = 200) => Array.from({ length: n }, (_, seed) => generate(id, level, seed));
const find = (id: string, level: Level, wanted: string): Question => {
  const q = many(id, level, 600).find((x) => x.prompt.includes(wanted));
  if (!q) throw new Error(`question introuvable : ${id} niveau ${level} « ${wanted} »`);
  return q;
};
const typed = (q: Question, text: string) => check(q, { kind: 'text', text });

describe('espagnol 5e : ser, estar, hay', () => {
  it('4 notions à 5 niveaux dans le chapitre, identifiant historique conservé, sources et termes définis', () => {
    expect(skills.map((s) => [s.id, s.version])).toEqual([
      ['e5-ser', 1],
      ['e5-estar', 1],
      ['e5-ser-estar', 2],
      ['e5-hay', 1],
    ]);
    const chapter = ESPAGNOL_CHAPTERS.find((c) => c.id === 'e5-ser-estar-hay')!;
    expect(chapter.skills).toEqual(skills);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('espagnol-college-2025');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter })).toEqual([]);
    }
  });

  it('chaque fait cite une source du registre (domaine autorisé), citée par une notion, avec une citation', () => {
    const cited = new Set(skills.flatMap((s) => s.lesson.sources ?? []));
    for (const f of FAITS_SER_ESTAR_HAY) {
      const src = getSource(f.sourceId);
      expect(src, f.id).toBeDefined();
      expect(isAllowedUrl(src!.url), f.id).toBe(true);
      expect(cited.has(f.sourceId), f.id).toBe(true);
      expect(f.quote.trim().length, f.id).toBeGreaterThan(0);
    }
    expect(new Set(FAITS_SER_ESTAR_HAY.map((f) => f.id)).size).toBe(FAITS_SER_ESTAR_HAY.length);
  });

  it('les formes de ser et estar concordent avec le relevé cité', () => {
    for (const v of ['ser', 'estar'] as const)
      expect(PERSONS.map((p) => CONJUGAISONS[v].present[p]).join(' ')).toBe(PRESENT_SER_ESTAR[v]);
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

  it('estar : l’accent écrit est exigé et expliqué', () => {
    const q = find('e5-estar', 4, '¿cómo … ?');
    expect(typed(q, 'Estás').correct).toBe(true);
    expect(typed(q, 'estas').why).toMatch(/ces/);
    expect(typed(q, 'eres').why).toMatch(/ser/);
  });

  it('ser : l’heure s’accorde avec le nombre', () => {
    const q = find('e5-ser', 4, 'las doce');
    expect(typed(q, 'son').correct).toBe(true);
    expect(typed(q, 'están').why).toMatch(/estar/);
    expect(typed(q, 'es').correct).toBe(false);
  });

  it.each([
    ['El concierto', 'es', 'está'],
    ['a lunes', 'estamos', 'somos'],
    ['martes', 'es', 'está'],
    ['lista para salir', 'estás', 'eres'],
  ])('ser ou estar : « %s » demande « %s »', (wanted, good, wrong) => {
    const q = find('e5-ser-estar', 4, wanted);
    expect(typed(q, good).correct).toBe(true);
    expect(typed(q, wrong).correct).toBe(false);
    expect(typed(q, wrong).why).toBeTruthy();
  });

  it.each([
    ['leche en la nevera', 'hay', 'está'],
    ['dos mapas', 'hay', 'han'],
    ['mis primos', 'están', 'hay'],
    ['que salir', 'hay', 'es'],
  ])('hay : « %s » demande « %s »', (wanted, good, wrong) => {
    const q = find('e5-hay', 4, wanted);
    expect(typed(q, good).correct).toBe(true);
    expect(typed(q, wrong).correct).toBe(false);
    expect(typed(q, wrong).why).toBeTruthy();
  });

  it('niveau 5 : un document et trois phrases à compléter, qui ne recopient pas le document', () => {
    for (const s of skills)
      for (const q of many(s.id, 5, 50)) {
        expect(q.answer.kind, s.id).toBe('cloze');
        expect(q.figure?.kind, s.id).toBe('document');
        if (q.answer.kind !== 'cloze' || q.figure?.kind !== 'document') continue;
        const { parts, blanks } = q.answer;
        expect(blanks, s.id).toHaveLength(3);
        const text = q.figure.lines.join(' ');
        blanks.forEach((b, i) => {
          if (b.mode !== 'text') return;
          // Le mot juste suivi du premier mot de la phrase ne se lit pas tel quel dans le document.
          const next = (parts[i + 1] ?? '').trim().split(' ')[0] ?? '';
          expect(text, `${s.id} : ${b.accepted[0]} ${next}`).not.toContain(`${b.accepted[0]} ${next}`);
        });
      }
  });
});
