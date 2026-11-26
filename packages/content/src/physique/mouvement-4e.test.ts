import { describe, expect, it } from 'vitest';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import type { Level, Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { FAITS_INTERACTIONS } from './donnees-interactions.ts';
import { PHYSIQUE_CHAPTERS } from './index.ts';

const notions = PHYSIQUE_CHAPTERS.find((c) => c.id === 'p4-mouvement')?.skills ?? [];
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
const bonne = (q: Question): string => (q.answer.kind === 'choice' ? String(q.answer.options[q.answer.correct]) : '');
const valeur = (q: Question): number => (q.answer.kind === 'number' ? q.answer.value.n / q.answer.value.d : NaN);
const lire = (re: RegExp, s: string) => Number((re.exec(s)?.[1] ?? 'NaN').replace(/\s/g, '').replace(',', '.'));

describe('physique-chimie 4e : « Mouvement et interactions »', () => {
  it('porte les quatre notions du référentiel, à 5 niveaux (identifiant historique conservé)', () => {
    expect(notions.map((s) => [s.id, s.version])).toEqual([
      ['p4-vitesse', 2],
      ['p4-interactions', 1],
      ['p4-forces', 1],
      ['p4-mouvement-force', 1],
    ]);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
  });

  it('chaque source citée existe et porte un fait ; les mots en gras sont définis', () => {
    for (const s of notions) {
      for (const id of s.lesson.sources ?? []) {
        expect(getSource(id), id).toBeDefined();
        expect(id === 'cycle4-2020' || FAITS_INTERACTIONS.some((f) => f.source === id), id).toBe(true);
      }
      expect(s.lesson.sources).toContain('cycle4-2020');
      for (const t of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(t, SUBJECT_GLOSSARIES.sciences ?? []), t).toBe(true);
    }
  });

  it('questions cohérentes aux 5 niveaux, distinctes d’un niveau à l’autre, avec des pièges expliqués', () => {
    for (const s of notions) {
      const prompts = LEVELS.map((level) => {
        const qs = tirages(s.id, level);
        expect(validateVariants(qs), `${s.id} ${level}`).toEqual([]);
        return new Set(qs.map((q) => q.prompt));
      });
      for (const [i, a] of prompts.entries())
        for (const b of prompts.slice(i + 1))
          expect(
            [...a].some((p) => b.has(p)),
            s.id,
          ).toBe(false);
      const pieges = new Set(LEVELS.flatMap((l) => tirages(s.id, l).flatMap((q) => q.traps.map((t) => t.why))));
      expect(pieges.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('la bonne réponse des QCM change de place', () => {
    for (const s of notions) {
      const places = LEVELS.flatMap((l) =>
        tirages(s.id, l).flatMap((q) => (q.answer.kind === 'choice' ? [q.answer.correct] : [])),
      );
      expect(new Set(places).size, s.id).toBeGreaterThan(1);
    }
  });

  it('vitesse : calculs, conversions et chronométrage refaits à partir de l’énoncé', () => {
    let vus = 0;
    for (const q of tirages('p4-vitesse', 3)) {
      const t = q.prompt;
      const d = lire(/(\d+) m(?= en | d’un)/, t);
      const v = lire(/(\d+) m\/s/, t);
      const duree = lire(/en (\d+) s\b/, t);
      const attendu = Number.isNaN(v) ? d / duree : Number.isNaN(d) ? v * duree : d / v;
      expect(valeur(q), t).toBeCloseTo(attendu, 8);
      vus += 1;
    }
    for (const q of tirages('p4-vitesse', 4)) {
      const x = lire(/vitesse (\d+) /, q.prompt);
      expect(valeur(q), q.prompt).toBeCloseTo(q.prompt.includes('en km/h') ? x * 3.6 : x / 3.6, 8);
      vus += 1;
    }
    for (const q of tirages('p4-vitesse', 5)) {
      const doc = lignes(q).join(' ');
      if (q.answer.kind === 'number') {
        const d = lire(/contrôlé : (\d+) m/, doc);
        const v = lire(/affichée : (\d+) km\/h/, doc) / 3.6;
        expect(valeur(q), doc).toBeCloseTo(d / v, 8);
      } else {
        const a = lire(/A : vitesse affichée (\d+) m\/s/, doc);
        const b = lire(/B : vitesse affichée ([\d,]+) km\/h/, doc) / 3.6;
        const c = lire(/C : (\d+) m/, doc) / lire(/en (\d+) s/, doc);
        const v = [a, b, c];
        expect(bonne(q), doc).toBe(`Le mobile ${'ABC'[v.indexOf(Math.max(...v))]}`);
      }
      vus += 1;
    }
    expect(vus).toBe(900);
  });

  it('interactions : au niveau 5, la réponse trie bien les corps du document', () => {
    for (const q of tirages('p4-interactions', 5)) {
      const doc = lignes(q).join(' ');
      const distance = q.prompt.includes('à distance');
      expect(bonne(q).includes('la Terre'), doc).toBe(distance);
      if (doc.includes('aimant')) expect(bonne(q).includes('aimant')).toBe(distance);
    }
  });

  it('forces : valeur lue sur la flèche et longueurs recalculées', () => {
    for (const q of tirages('p4-forces', 3)) {
      if (q.figure?.kind !== 'grid') throw new Error('schéma attendu');
      const b = q.figure.points[1]!;
      expect(valeur(q)).toBe(Math.hypot(b.x, b.y) * lire(/représente (\d+) N/, q.prompt));
    }
    for (const q of tirages('p4-forces', 4)) {
      if (q.answer.kind === 'number')
        expect(valeur(q)).toBe(lire(/valeur (\d+) N/, q.prompt) / lire(/pour (\d+) N/, q.prompt));
      else if (q.answer.kind === 'cloze' && q.figure?.kind === 'grid') {
        const b = q.figure.points[1]!;
        const sens = b.x > 0 ? 'vers la droite' : b.x < 0 ? 'vers la gauche' : b.y > 0 ? 'vers le haut' : 'vers le bas';
        const n = String(Math.hypot(b.x, b.y) * lire(/représente (\d+) N/, q.prompt));
        expect(
          check(q, { kind: 'cloze', answers: ['a', b.x === 0 ? 'verticale' : 'horizontale', sens, n] }).correct,
        ).toBe(true);
      }
    }
    for (const q of tirages('p4-forces', 5)) {
      const doc = lignes(q);
      const force = (l: string) => lire(/pour (\d+) N/, l) * lire(/flèche de (\d+) cm/, l);
      const [f1, f2] = [force(doc[0]!), force(doc[1]!)];
      if (q.answer.kind === 'number') expect(valeur(q)).toBeCloseTo(f2 / lire(/pour (\d+) N/, doc[0]!), 8);
      else expect(bonne(q)).toBe(f2 > f1 ? 'la force F2' : 'la force F1');
    }
  });

  it('mouvement et force : au niveau 5, les phases retenues découlent du relevé', () => {
    for (const q of tirages('p4-mouvement-force', 5)) {
      const attendu = lignes(q)
        .filter((l) => {
          const d = [...l.matchAll(/(\d+) m\b/g)].map((m) => m[1]);
          return l.includes('cercle') || new Set(d).size > 1;
        })
        .map((l) => /Phase (\w)/.exec(l)![1]!);
      expect(attendu).toHaveLength(2);
      expect(bonne(q)).toBe(`les phases ${attendu[0]} et ${attendu[1]}`);
    }
  });

  it('mouvement et force : à l’équilibre, la seconde force a la même valeur, vers le haut', () => {
    for (const q of tirages('p4-mouvement-force', 4)) {
      if (q.answer.kind === 'number') expect(valeur(q)).toBe(lire(/de (\d+) N/, q.prompt));
      else expect(check(q, { kind: 'text', text: 'Vers le haut' }).correct).toBe(true);
    }
  });
});
