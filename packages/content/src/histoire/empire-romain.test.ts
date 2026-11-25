import { describe, expect, it } from 'vitest';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import { PREUVES } from './empire-romain-sources.ts';
import { NOTIONS, SKILLS } from './empire-romain.ts';

const preuves = (n: (typeof NOTIONS)[number]) => [...n.faits, ...n.libres, ...n.docs.flatMap((d) => d.qs)];

describe('histoire 6e — L’empire romain dans le monde antique', () => {
  it('propose les trois notions du référentiel, en 5 niveaux', () => {
    expect(SKILLS.map((s) => s.id)).toEqual(['h6-romanisation', 'h6-chretiens-empire', 'h6-route-soie-han']);
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
      expect(SKILLS[i]!.lesson.sources, n.id).toContain('cycle3-2020');
    });
  });

  it('prévoit des erreurs typiques expliquées et assez de matière', () => {
    for (const n of NOTIONS) {
      expect(n.faits.length, n.id).toBeGreaterThanOrEqual(4);
      expect(n.paires3.length, n.id).toBe(3);
      expect(n.paires5.length, n.id).toBe(5);
      expect(n.ordre!.length, n.id).toBeGreaterThanOrEqual(4);
      expect(n.libres.length, n.id).toBeGreaterThanOrEqual(3);
      expect(n.docs.length, n.id).toBeGreaterThanOrEqual(2);
      for (const f of n.faits) expect(f.wrong.length, n.id).toBeGreaterThanOrEqual(3);
      for (const l of n.libres) expect(l.traps.length, n.id).toBeGreaterThanOrEqual(2);
      for (const d of n.docs) for (const q of d.qs) expect(q.wrong.length, n.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('annonce la sixième et nomme l’auteur de la citation dans la correction', () => {
    const soie = SKILLS.find((s) => s.id === 'h6-route-soie-han')!;
    expect(soie.lesson.source).toContain('classe de sixième');
    expect(soie.lesson.sources).toContain('eduscol-6e-empire-romain');
    const steps = Array.from({ length: 20 }, (_, seed) => soie.generate(createRng(seed), 1).steps[0]);
    expect(steps.some((s) => s?.includes('La ressource d’accompagnement d’Éduscol écrit'))).toBe(true);
  });
});
