import { describe, expect, it } from 'vitest';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import { GLOSSAIRE } from './glossaire.ts';
import { PREUVES } from './chretientes-islam-sources.ts';
import { NOTIONS, SKILLS } from './chretientes-islam.ts';

const preuves = (n: (typeof NOTIONS)[number]) => [
  ...n.faits,
  ...n.libres,
  ...n.docs.flatMap((d) => d.qs),
  ...(n.frise ?? []),
];

describe('histoire 5e — Chrétientés et islam (VIe-XIIIe siècles), des mondes en contact', () => {
  it('propose les trois notions du référentiel, en 5 niveaux', () => {
    expect(SKILLS.map((s) => s.id)).toEqual(['h5-byzance-carolingiens', 'h5-islam-bagdad', 'h5-mondes-contact']);
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
    });
  });

  it('prévoit des erreurs typiques expliquées et assez de matière', () => {
    for (const n of NOTIONS) {
      expect(n.faits.length, n.id).toBeGreaterThanOrEqual(6);
      expect(n.paires3.length, n.id).toBe(3);
      expect(n.paires5.length, n.id).toBe(5);
      expect(n.frise!.length, n.id).toBeGreaterThanOrEqual(4);
      expect(n.libres.length, n.id).toBeGreaterThanOrEqual(3);
      expect(n.docs.length, n.id).toBeGreaterThanOrEqual(2);
      for (const f of n.faits) expect(f.wrong.length, n.id).toBeGreaterThanOrEqual(3);
      for (const l of n.libres) expect(l.traps.length, n.id).toBeGreaterThanOrEqual(2);
      for (const d of n.docs) for (const q of d.qs) expect(q.wrong.length, n.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('range la frise du plus ancien au plus récent', () => {
    for (const n of NOTIONS) {
      const years = n.frise!.map((r) => Number(/\d+/.exec(r.date)?.[0]));
      expect(
        [...years].sort((a, b) => a - b),
        n.id,
      ).toEqual(years);
    }
  });

  it('annonce le programme du cycle 4 et nomme l’auteur de la citation dans la correction', () => {
    const byz = SKILLS[0]!;
    expect(byz.lesson.source).toContain('cycle 4');
    expect(byz.lesson.source).toContain('classe de cinquième');
    expect(byz.lesson.sources).toContain('eduscol-5e-chretientes-islam');
    const steps = Array.from({ length: 20 }, (_, seed) => byz.generate(createRng(seed), 1).steps[0]);
    expect(steps.some((s) => s?.includes('La ressource d’accompagnement d’Éduscol écrit'))).toBe(true);
  });

  it('définit au glossaire les termes nouveaux, sans doublon de forme', () => {
    const forms = GLOSSAIRE.flatMap((g) => g.forms.map((f) => f.toLowerCase()));
    for (const w of ['basileus', 'calife', 'hégire', 'omeyyades', 'abbassides', 'excommunication', 'chrétientés']) {
      expect(
        forms.filter((f) => f === w),
        w,
      ).toHaveLength(1);
    }
  });
});
