import { describe, expect, it } from 'vitest';
import { check } from '../../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../../glossaires.ts';
import { createRng } from '../../rng.ts';
import { getSource } from '../../sources.ts';
import type { Level, Question } from '../../types.ts';
import { validateVariants } from '../../validate.ts';
import { FAITS_VIVANT } from './donnees-6e-vivant.ts';
import { ST_CHAPTERS } from './index.ts';

const chapitre = ST_CHAPTERS.find((c) => c.id === 'v6-vivant');
const notions = chapitre?.skills ?? [];
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];

const tirages = (id: string, level: Level, n = 300): Question[] => {
  const s = notions.find((x) => x.id === id);
  if (!s) throw new Error(id);
  return Array.from({ length: n }, (_, seed) => ({
    traps: [],
    targetSeconds: 30,
    ...s.generate(createRng(seed), level),
    skillId: s.id,
    level,
    seed,
  }));
};

const lignes = (q: Question) => (q.figure?.kind === 'document' ? q.figure.lines : []);
const juste = (q: Question, v: number) => check(q, { kind: 'number', text: String(v) }).correct;

describe('sciences 6e : « Le vivant »', () => {
  it('porte les cinq notions, en SVT 6e, à 5 niveaux', () => {
    expect(chapitre?.grade).toBe('6e');
    expect(chapitre?.domain).toBe('svt');
    expect(notions.map((s) => s.id)).toEqual([
      'v6-cellule',
      'v6-classification',
      'v6-reproduction',
      'v6-developpement',
      'v6-biodiversite',
    ]);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
  });

  it('chaque source citée existe et porte un fait ; les mots en gras sont définis', () => {
    expect(new Set(FAITS_VIVANT.map((f) => f.id)).size).toBe(FAITS_VIVANT.length);
    for (const s of notions) {
      expect(s.lesson.source, s.id).toContain('«');
      for (const id of s.lesson.sources ?? []) {
        expect(getSource(id), id).toBeDefined();
        expect(
          FAITS_VIVANT.some((f) => f.source === id),
          `${s.id} ${id}`,
        ).toBe(true);
      }
      for (const t of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(t, SUBJECT_GLOSSARIES.sciences ?? []), t).toBe(true);
    }
  });

  it('questions valides aux 5 niveaux, progressives, avec étapes conclues et au moins deux pièges', () => {
    for (const s of notions) {
      const prompts = LEVELS.map((level) => {
        const qs = tirages(s.id, level);
        expect(validateVariants(qs), `${s.id} ${level}`).toEqual([]);
        for (const q of qs) expect(q.steps.at(-1), q.prompt).toContain('**');
        return qs.map((q) => q.prompt).join('|');
      });
      expect(new Set(prompts).size, s.id).toBe(5);
      const pieges = new Set(LEVELS.flatMap((l) => tirages(s.id, l).flatMap((q) => q.traps.map((t) => t.why))));
      expect(pieges.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('cellule : le nombre d’organismes unicellulaires se lit dans les relevés', () => {
    let vus = 0;
    for (const q of tirages('v6-cellule', 5)) {
      if (q.answer.kind !== 'number') continue;
      expect(juste(q, lignes(q).filter((l) => l.includes(': 1 cellule ')).length), q.prompt).toBe(true);
      vus += 1;
    }
    expect(vus).toBeGreaterThan(0);
  });

  it('reproduction et développement : les écarts se recalculent depuis le document', () => {
    let vus = 0;
    for (const q of tirages('v6-reproduction', 5)) {
      if (q.answer.kind !== 'number') continue;
      const fruits = lignes(q).map((l) => Number(/(\d+) fruits/.exec(l)?.[1]));
      expect(juste(q, (fruits[0] ?? 0) - (fruits[1] ?? 0)), q.prompt).toBe(true);
      vus += 1;
    }
    for (const q of tirages('v6-developpement', 5)) {
      if (q.answer.kind !== 'number') continue;
      const doc = lignes(q).join(' ');
      const nombres = q.answer.unit === 'jours' ? /Jour (\d+) : (?:des têtards|les pattes)/g : /estimée (\d+) cm/g;
      const [a, b] = [...doc.matchAll(nombres)].map((m) => Number(m[1]));
      expect(juste(q, (b ?? 0) - (a ?? 0)), doc).toBe(true);
      vus += 1;
    }
    expect(vus).toBeGreaterThan(0);
  });

  it('biodiversité : la clé de détermination mène à la réponse attendue', () => {
    let vus = 0;
    for (const q of tirages('v6-biodiversite', 5)) {
      const [q1, q2] = lignes(q);
      if (q.answer.kind !== 'text' || !q2?.startsWith('Question 2')) continue;
      const attendu = q.prompt.includes('blanches')
        ? /blanches : plante (\w)/.exec(q1 ?? '')?.[1]
        : new RegExp(`${q.prompt.includes('rondes') ? 'rondes' : 'allongées'} : plante (\\w)`).exec(q2)?.[1];
      expect(check(q, { kind: 'text', text: attendu ?? '' }).correct, q.prompt).toBe(true);
      vus += 1;
    }
    expect(vus).toBeGreaterThan(0);
  });
});
