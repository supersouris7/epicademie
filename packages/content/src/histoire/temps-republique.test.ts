import { describe, expect, it } from 'vitest';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import { PREUVES } from './temps-republique-sources.ts';
import { NOTIONS, SKILLS } from './temps-republique.ts';

const preuves = (n: (typeof NOTIONS)[number]) => [
  ...n.faits,
  ...n.libres,
  ...n.docs.flatMap((d) => d.qs),
  ...(n.frise ?? []),
];

describe('histoire cm2 — Le temps de la République', () => {
  it('propose les quatre notions du référentiel, en 5 niveaux', () => {
    expect(SKILLS.map((s) => s.id)).toEqual(['hcm2-1892', 'hcm2-ecole-ferry', 'hcm2-democratie', 'hcm2-vote-femmes']);
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
    });
  });

  it('range chaque frise du plus ancien au plus récent, avec la date dans la citation', () => {
    for (const n of NOTIONS) {
      const dates = n.frise!.map((r) => Number(r.date));
      expect(dates, n.id).toEqual([...dates].sort((a, b) => a - b));
      expect(new Set(dates).size, n.id).toBe(dates.length);
      for (const r of n.frise!) expect(r.quote, `${n.id} ${r.date}`).toContain(r.date);
    }
  });

  it('prévoit des erreurs typiques expliquées et assez de matière', () => {
    for (const n of NOTIONS) {
      expect(n.faits.length, n.id).toBeGreaterThanOrEqual(4);
      expect(n.paires3.length, n.id).toBe(3);
      expect(n.paires5.length, n.id).toBe(5);
      expect(n.libres.length, n.id).toBeGreaterThanOrEqual(3);
      expect(n.docs.length, n.id).toBeGreaterThanOrEqual(2);
      for (const f of n.faits) expect(f.wrong.length, n.id).toBeGreaterThanOrEqual(3);
      for (const l of n.libres) expect(l.traps.length, n.id).toBeGreaterThanOrEqual(2);
      for (const d of n.docs) for (const q of d.qs) expect(q.wrong.length, n.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('annonce le CM2 et nomme l’auteur de la citation dans la correction', () => {
    const vote = SKILLS.find((s) => s.id === 'hcm2-vote-femmes')!;
    expect(vote.lesson.source).toContain('classe de CM2');
    const { steps } = vote.generate(createRng(1), 1);
    expect(steps[0]).toMatch(/(L’Assemblée nationale|Le Sénat|Le programme d’enseignement moral et civique) écrit/);
  });
});
