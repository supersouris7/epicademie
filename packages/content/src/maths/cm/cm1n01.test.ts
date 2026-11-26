import { describe, expect, it } from 'vitest';
import { generate } from '../../catalog.ts';
import { auditSkill } from '../../couverture.ts';
import { toNumber } from '../../rational.ts';
import { skillLevels, skillVersion, type Level, type Question } from '../../types.ts';
import { validateVariants } from '../../validate.ts';
import { CM1, CM2 } from './index.ts';

/** Lot ma-cm1-n01 : « Les nombres entiers » et « Les fractions » du CM1 portés à 5 niveaux. */
const NOMBRES = ['lire-nombres', 'valeur-chiffre', 'comparer-entiers', 'demi-droite', 'multiples'];
const FRACTIONS = [
  'lire-fraction',
  'fraction-entier',
  'comparer-fractions',
  'additionner-fractions',
  'fraction-quantite',
];
const IDS = [...NOMBRES, ...FRACTIONS].map((x) => `mcm1-${x}`);
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const SEEDS = Array.from({ length: 200 }, (_, i) => i);
const all = (id: string): Question[] => LEVELS.flatMap((l) => SEEDS.map((seed) => generate(id, l, seed)));
const texts = (q: Question) => JSON.stringify([q.prompt, q.answer, q.steps, q.figure ?? null]);
const skill = (list: typeof CM1, id: string) => list.flatMap((c) => c.skills).find((s) => s.id === id)!;

describe('lot ma-cm1-n01', () => {
  it.each(IDS)('%s : 5 niveaux, version 2, sourcée, glossaire complet', (id) => {
    const s = skill(CM1, id);
    expect(skillLevels(s)).toBe(5);
    expect(skillVersion(s)).toBe(2);
    expect(s.lesson.sources).toEqual(['maths-cycle3-2025']);
    expect(auditSkill({ skill: s, chapter: { subject: 'maths' } })).toEqual([]);
  });

  it.each(IDS)('%s : 200 graines valides à chaque niveau, au moins deux pièges expliqués', (id) => {
    const questions = all(id);
    expect(validateVariants(questions)).toEqual([]);
    expect(questions.some((q) => q.traps.length >= 2)).toBe(true);
  });

  it('nombres entiers : jamais plus de six chiffres (borne du CM1)', () => {
    for (const id of NOMBRES) {
      for (const q of all(`mcm1-${id}`)) {
        // Les espaces des milliers sont retirées avant de chercher un nombre de 7 chiffres ou plus.
        const big = /\d{7,}/.exec(texts(q).replace(/(\d)\s(?=\d{3})/g, '$1'));
        // La droite graduée code ses sous-graduations en fraction d'unité : ce n'est pas un nombre montré.
        if (q.figure?.kind !== 'numberLine') expect(big, q.prompt).toBeNull();
        if (q.answer.kind === 'number') expect(toNumber(q.answer.value)).toBeLessThanOrEqual(999_999);
      }
    }
  });

  it('demi-droite : 10 intervalles exacts, point sur un trait, réponse relue sur la figure', () => {
    for (const q of all('mcm1-demi-droite')) {
      const f = q.figure;
      if (f?.kind !== 'numberLine') throw new Error('figure attendue');
      expect((f.max - f.min) * f.subdivisions).toBe(10);
      for (const p of f.points) expect(Number.isInteger((p.at - f.min) / ((f.max - f.min) / 10))).toBe(true);
      const [a, b] = f.points;
      if (q.answer.kind === 'number') expect(toNumber(q.answer.value)).toBe(b ? b.at - a!.at : a!.at);
    }
  });

  it('fractions : dénominateurs ≤ 20 (borne du CM1)', () => {
    for (const id of FRACTIONS) {
      for (const q of all(`mcm1-${id}`)) {
        // Les pièges des propositions peuvent doubler le dénominateur : seuls l'énoncé et la bonne réponse comptent.
        const asked = [...q.prompt.matchAll(/\{\d+\/(\d+)\}/g)].map((m) => Number(m[1]));
        if (q.answer.kind === 'fraction') asked.push(q.answer.value.d);
        expect(Math.max(0, ...asked), q.prompt).toBeLessThanOrEqual(20);
      }
    }
  });

  it('fraction d’une quantité : fractions unitaires seulement', () => {
    for (const q of all('mcm1-fraction-quantite')) {
      for (const m of q.prompt.matchAll(/\{(\d+)\/\d+\}/g)) expect(m[1]).toBe('1');
    }
  });

  it('le CM2 garde ses notions à 3 niveaux et le même ordre que le CM1', () => {
    for (const id of IDS) expect(skillLevels(skill(CM2, id.replace('cm1', 'cm2')))).toBe(3);
    expect(
      CM1.find((c) => c.id === 'mcm1-nombres')!
        .skills.slice(0, 5)
        .map((s) => s.id),
    ).toEqual(IDS.slice(0, 5));
    expect(
      CM1.find((c) => c.id === 'mcm1-fractions')!
        .skills.slice(0, 5)
        .map((s) => s.id),
    ).toEqual(IDS.slice(5));
  });
});
