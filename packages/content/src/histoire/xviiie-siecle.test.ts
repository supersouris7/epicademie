import { describe, expect, it } from 'vitest';
import { getSource } from '../sources.ts';
import { GLOSSAIRE } from './glossaire.ts';
import { PREUVES } from './xviiie-siecle-sources.ts';
import { NOTIONS, SKILLS } from './xviiie-siecle.ts';

const preuves = (n: (typeof NOTIONS)[number]) => [
  ...n.faits,
  ...n.libres,
  ...n.docs.flatMap((d) => d.qs),
  ...(n.frise ?? []),
];

describe('histoire 4e — Le XVIIIe siècle : expansions, Lumières et révolutions', () => {
  it('propose les trois notions du référentiel, en 5 niveaux', () => {
    expect(SKILLS.map((s) => s.id)).toEqual(['h4-negoces-traites', 'h4-europe-lumieres', 'h4-revolution-empire']);
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
      expect(SKILLS[i]!.lesson.sources, n.id).toContain('eduscol-4e-xviiie');
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
    for (const n of NOTIONS) {
      expect(n.frise!.length, n.id).toBeGreaterThanOrEqual(4);
      const years = n.frise!.map((r) => Number(/\d{4}/.exec(r.date)![0]));
      expect(
        [...years].sort((a, b) => a - b),
        n.id,
      ).toEqual(years);
      expect(new Set(years).size, n.id).toBe(years.length);
    }
  });

  it('définit au glossaire les termes nouveaux, sans doublon de forme', () => {
    const forms = GLOSSAIRE.flatMap((g) => [...new Set(g.forms.map((f) => f.toLowerCase()))]);
    for (const w of [
      'bourgeoisie',
      'négociant',
      'armateur',
      'plantation',
      'commerce triangulaire',
      'traite négrière',
      'lumières',
      'raison',
      'philosophes',
      'salons',
      'encyclopédie',
      'censure',
      'despotisme éclairé',
      'privilèges',
      'déclaration des droits de l’homme et du citoyen',
      'souveraineté nationale',
      'terreur',
      'coup d’état',
      'code civil',
    ]) {
      expect(
        forms.filter((f) => f === w),
        w,
      ).toHaveLength(1);
    }
  });
});
