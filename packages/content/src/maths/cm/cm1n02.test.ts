import { describe, expect, it } from 'vitest';
import { generate } from '../../catalog.ts';
import { auditSkill } from '../../couverture.ts';
import { toNumber } from '../../rational.ts';
import { skillLevels, skillVersion, type Level, type Question } from '../../types.ts';
import { validateVariants } from '../../validate.ts';
import { CM1, CM2 } from './index.ts';

/** Lot ma-cm1-n02 : « Les nombres décimaux » et « Calcul mental » du CM1 portés à 5 niveaux. */
const DECIMAUX = ['fraction-decimale', 'chiffres-decimaux', 'comparer-decimaux', 'arrondi', 'droite-decimale'];
const MENTAL = ['tables', 'ajouter-9', 'fois-10', 'fois-4-5-8', 'fractions-usuelles'];
const PORTEES = [...DECIMAUX, ...MENTAL].map((x) => `mcm1-${x}`);
const IDS = [...PORTEES, 'mcm1-ajouter-sans-retenue'];
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const SEEDS = Array.from({ length: 300 }, (_, i) => i);
const all = (id: string): Question[] => LEVELS.flatMap((l) => SEEDS.map((seed) => generate(id, l, seed)));
const skill = (list: typeof CM1, id: string) => list.flatMap((c) => c.skills).find((s) => s.id === id)!;
/** Textes lus par l'élève, correction comprise. */
const lus = (q: Question) =>
  [
    q.prompt,
    q.hint,
    ...q.steps,
    ...q.traps.map((t) => t.why),
    ...(q.answer.kind === 'choice' ? q.answer.options : []),
    ...(q.answer.kind === 'order' ? q.answer.items : []),
    ...(q.answer.kind === 'match' ? [...q.answer.left, ...q.answer.right] : []),
  ].join(' | ');
const valeur = (s: string) => Number(s.replace(/\s/g, '').replace(',', '.'));

describe('lot ma-cm1-n02', () => {
  it.each(IDS)('%s : 5 niveaux, sourcée, glossaire complet', (id) => {
    const s = skill(CM1, id);
    expect(skillLevels(s)).toBe(5);
    expect(skillVersion(s)).toBe(PORTEES.includes(id) ? 2 : 1);
    expect(s.lesson.sources).toEqual(['maths-cycle3-2025']);
    expect(auditSkill({ skill: s, chapter: { subject: 'maths' } })).toEqual([]);
  });

  it.each(IDS)('%s : 300 graines valides, niveaux distincts, au moins deux pièges expliqués', (id) => {
    const questions = all(id);
    expect(validateVariants(questions)).toEqual([]);
    expect(questions.some((q) => q.traps.length >= 2)).toBe(true);
    const parNiveau = LEVELS.map((l) =>
      questions
        .filter((q) => q.level === l)
        .map((q) => q.prompt)
        .join('|'),
    );
    expect(new Set(parNiveau).size).toBe(5);
    for (const q of questions) {
      if (q.answer.kind !== 'choice') continue;
      expect(q.answer.options.length, q.prompt).toBe(q.level === 1 ? 3 : 4);
    }
  });

  it.each(IDS)('%s : bornes du CM1 (centièmes au plus, nombres ≤ 999 999, la solution clôt la correction)', (id) => {
    for (const q of all(id)) {
      // Aucun millième montré, hors fractions et nombres écrits dans l'explication d'une erreur.
      expect(lus(q), q.prompt).not.toMatch(/\d,\d{3}/);
      expect(lus(q), q.prompt).not.toMatch(/\/1000\}/);
      expect(q.steps.at(-1), q.prompt).toMatch(/\*\*[^*]+\*\*/);
      if (q.answer.kind === 'number') {
        const v = toNumber(q.answer.value);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(999_999);
        expect(100 % q.answer.value.d, q.prompt).toBe(0);
      }
    }
  });

  it('droite graduée : point sur un des traits tracés, réponse relue sur la figure', () => {
    for (const q of all('mcm1-droite-decimale')) {
      const f = q.figure;
      if (f?.kind !== 'numberLine') throw new Error('figure attendue');
      // Mêmes traits que le composant d'affichage.
      const n = (f.max - f.min) * f.subdivisions;
      const traits = Array.from({ length: Math.floor(n) + 1 }, (_, i) => f.min + i / f.subdivisions);
      expect(traits.length).toBeGreaterThanOrEqual(11);
      expect(traits.at(-1)).toBeCloseTo(f.max, 8);
      for (const p of f.points) expect(traits.some((t) => Math.abs(t - p.at) < 1e-8)).toBe(true);
      if (q.answer.kind === 'number') {
        const [a, b] = f.points;
        expect(toNumber(q.answer.value)).toBeCloseTo(b ? b.at - a!.at : a!.at, 8);
      }
    }
  });

  it('comparer, ranger, encadrer : réponses recalculées depuis l’énoncé', () => {
    for (const q of all('mcm1-comparer-decimaux')) {
      const a = q.answer;
      if (a.kind === 'order' && q.level === 3) {
        const v = a.correct.map((i) => valeur(a.items[i]!));
        expect(v).toEqual([...v].sort((x, y) => x - y));
        expect(new Set(v).size).toBe(4);
      }
      if (a.kind === 'order' && q.level === 5) {
        const v = a.correct.map((i) => valeur(new RegExp(`${a.items[i]} met ([\\d,]+) s`).exec(q.prompt)![1]!));
        expect(v).toEqual([...v].sort((x, y) => x - y));
        expect(new Set(v).size).toBe(4);
      }
      if (a.kind === 'choice' && q.level === 2) {
        const v = a.options.map(valeur);
        expect(v[a.correct]).toBe(Math.max(...v));
      }
      if (a.kind === 'cloze') {
        const x = valeur(/Encadre ([\d,]+)/.exec(q.prompt)![1]!);
        const [lo, hi] = a.blanks.map((b) => (b.mode === 'text' ? valeur(b.accepted[0]!) : NaN));
        expect(lo!).toBeLessThan(x);
        expect(hi!).toBeGreaterThan(x);
        expect(hi! - lo!).toBeCloseTo(0.1, 8);
      }
    }
  });

  it('arrondi à l’unité : entier le plus proche', () => {
    for (const q of all('mcm1-arrondi')) {
      if (q.level < 3 || q.level > 4 || q.answer.kind !== 'number') continue;
      const x = valeur(/(\d+,\d+)/.exec(q.prompt)![1]!);
      expect(toNumber(q.answer.value), q.prompt).toBe(Math.round(x));
    }
  });

  it('ajouter ou soustraire : seuls les nombres du programme', () => {
    for (const q of all('mcm1-ajouter-9')) {
      if (q.level !== 3 && q.level !== 4) continue;
      const m = /Calcule (\d+) ([+−]) (\d+)\./.exec(q.prompt)!;
      expect([8, 9, 18, 19, 28, 29, 38, 39]).toContain(Number(m[3]));
    }
  });

  it('sans retenue : un seul chiffre change', () => {
    for (const q of all('mcm1-ajouter-sans-retenue')) {
      if (q.level !== 3 || q.answer.kind !== 'number') continue;
      const m = /Calcule ([\d\s,]+) [+−] /.exec(q.prompt)!;
      const avant = String(Math.round(valeur(m[1]!) * 100)).padStart(6, '0');
      const apres = String(Math.round(toNumber(q.answer.value) * 100)).padStart(6, '0');
      expect(Array.from(avant, (d, i) => d !== apres[i]).filter(Boolean).length, q.prompt).toBe(1);
    }
  });

  it('le CM2 garde ses notions à 3 niveaux ; la nouvelle notion est réservée au CM1', () => {
    for (const id of PORTEES) expect(skillLevels(skill(CM2, id.replace('cm1', 'cm2')))).toBe(3);
    expect(skill(CM2, 'mcm2-ajouter-sans-retenue')).toBeUndefined();
    for (const [chapter, ids] of [
      ['mcm1-decimaux', DECIMAUX],
      ['mcm1-calcul-mental', MENTAL],
    ] as const) {
      expect(
        CM1.find((c) => c.id === chapter)!
          .skills.slice(0, 5)
          .map((s) => s.id),
      ).toEqual(ids.map((x) => `mcm1-${x}`));
    }
  });
});
