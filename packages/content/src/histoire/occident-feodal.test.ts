import { describe, expect, it } from 'vitest';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import { GLOSSAIRE } from './glossaire.ts';
import { PREUVES } from './occident-feodal-sources.ts';
import { NOTIONS, SKILLS } from './occident-feodal.ts';

const preuves = (n: (typeof NOTIONS)[number]) => [
  ...n.faits,
  ...n.libres,
  ...n.docs.flatMap((d) => d.qs),
  ...(n.frise ?? []),
];

const ROMAINS: Record<string, number> = { I: 1, V: 5, X: 10 };

/** Année d'un repère : le premier nombre écrit, sinon le début du siècle en chiffres romains. */
const annee = (date: string): number => {
  const chiffres = /\d+/.exec(date);
  if (chiffres) return Number(chiffres[0]);
  const romain = /\b([IVX]+)e siècle/.exec(date)?.[1] ?? '';
  let siecle = 0;
  for (let i = 0; i < romain.length; i++) {
    const v = ROMAINS[romain[i]!]!;
    siecle += v < (ROMAINS[romain[i + 1] ?? ''] ?? 0) ? -v : v;
  }
  return (siecle - 1) * 100;
};

describe('histoire 5e — Société, Église et pouvoir politique dans l’occident féodal (XIe-XVe siècles)', () => {
  it('propose les quatre notions du référentiel, en 5 niveaux', () => {
    expect(SKILLS.map((s) => s.id)).toEqual([
      'h5-ordre-seigneurial',
      'h5-societe-urbaine',
      'h5-eglise-feodale',
      'h5-etat-monarchique',
    ]);
    for (const s of SKILLS) expect([s.levels, s.version], s.id).toEqual([5, 1]);
  });

  it('cite pour chaque fait une source du registre, déclarée par la notion, et une citation', () => {
    for (const p of Object.values(PREUVES)) {
      expect(getSource(p.source), p.source).toBeDefined();
      expect(p.quote.trim().length, p.source).toBeGreaterThan(10);
    }
    NOTIONS.forEach((n, i) => {
      for (const p of preuves(n)) {
        expect(p.source, n.id).toBeDefined();
        expect(SKILLS[i]!.lesson.sources, n.id).toContain(p.source);
      }
      expect(SKILLS[i]!.lesson.sources, n.id).toContain('cycle4-2020');
      expect(SKILLS[i]!.lesson.sources, n.id).toContain('eduscol-5e-occident-feodal');
    });
  });

  it('prévoit des erreurs typiques expliquées et assez de matière', () => {
    for (const n of NOTIONS) {
      expect(n.faits.length, n.id).toBeGreaterThanOrEqual(6);
      expect(n.paires3.length, n.id).toBe(3);
      expect(n.paires5.length, n.id).toBe(5);
      expect(n.libres.length, n.id).toBeGreaterThanOrEqual(3);
      expect(n.docs.length, n.id).toBeGreaterThanOrEqual(2);
      for (const f of n.faits) expect(f.wrong.length, n.id).toBeGreaterThanOrEqual(3);
      for (const l of n.libres) expect(l.traps.length, n.id).toBeGreaterThanOrEqual(2);
      for (const d of n.docs) for (const q of d.qs) expect(q.wrong.length, n.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('range chaque frise du plus ancien au plus récent', () => {
    const frises = NOTIONS.filter((n) => n.frise);
    expect(frises.map((n) => n.id)).toEqual(['h5-ordre-seigneurial', 'h5-etat-monarchique']);
    for (const n of frises) {
      expect(n.frise!.length, n.id).toBeGreaterThanOrEqual(4);
      const years = n.frise!.map((r) => annee(r.date));
      expect(
        years.every((y) => y > 0),
        n.id,
      ).toBe(true);
      expect(
        [...years].sort((a, b) => a - b),
        n.id,
      ).toEqual(years);
      expect(new Set(years).size, n.id).toBe(years.length);
    }
    expect(annee('seconde moitié du IXe siècle')).toBe(800);
  });

  it('annonce le programme de cinquième et nomme l’auteur de la citation dans la correction', () => {
    const etat = SKILLS[3]!;
    expect(etat.lesson.source).toContain('cycle 4');
    expect(etat.lesson.source).toContain('classe de cinquième');
    const steps = Array.from({ length: 20 }, (_, seed) => etat.generate(createRng(seed), 1).steps[0]);
    expect(steps.some((s) => s?.includes('La ressource d’accompagnement d’Éduscol écrit'))).toBe(true);
  });

  it('définit au glossaire les termes nouveaux, sans doublon de forme', () => {
    const forms = GLOSSAIRE.flatMap((g) => [...new Set(g.forms.map((f) => f.toLowerCase()))]);
    for (const w of [
      'seigneur',
      'seigneurie',
      'tenure',
      'vilains',
      'banalités',
      'servage',
      'commune',
      'bourgeoisie',
      'corporation',
      'foire',
      'paroisse',
      'sacre',
      'abbé',
      'capétiens',
      'suzerain',
      'légistes',
      'valois',
    ]) {
      expect(
        forms.filter((f) => f === w),
        w,
      ).toHaveLength(1);
    }
  });
});
