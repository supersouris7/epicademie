import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level } from '../types.ts';
import { PREUVES } from './guerres-europe-sources.ts';
import { NOTIONS, SKILLS } from './guerres-europe.ts';

const preuves = (n: (typeof NOTIONS)[number]) => [
  ...n.faits,
  ...n.libres,
  ...n.docs.flatMap((d) => d.qs),
  ...(n.frise ?? []),
];

describe('histoire cm2 — Des guerres mondiales à l’Union européenne', () => {
  it('propose les quatre notions du référentiel, en 5 niveaux', () => {
    expect(SKILLS.map((s) => s.id)).toEqual([
      'hcm2-premiere-guerre',
      'hcm2-seconde-guerre',
      'hcm2-construction-europeenne',
      'hcm2-lieux-memoire',
    ]);
    for (const s of SKILLS) expect([s.levels, s.version], s.id).toEqual([5, 1]);
  });

  it('produit des questions valides aux 5 niveaux', () => {
    for (const s of SKILLS) {
      for (const level of [1, 2, 3, 4, 5] as readonly Level[]) {
        const qs = Array.from({ length: 60 }, (_, seed) => generate(s.id, level, seed));
        expect(validateVariants(qs), `${s.id} ${level}`).toEqual([]);
      }
    }
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

  it('couvre ce que demande le programme : Résistance, collaboration, génocide et autres persécutions', () => {
    const answers = NOTIONS[1]!.faits.map((f) => f.a);
    for (const a of ['la collaboration', 'la Shoah', 'les Roms']) expect(answers).toContain(a);
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
      expect(n.faits.length, n.id).toBeGreaterThanOrEqual(6);
      expect(n.paires3.length, n.id).toBe(3);
      expect(n.paires5.length, n.id).toBe(5);
      expect(n.libres.length, n.id).toBeGreaterThanOrEqual(4);
      expect(n.docs.length, n.id).toBeGreaterThanOrEqual(2);
      for (const f of n.faits) expect(f.wrong.length, n.id).toBeGreaterThanOrEqual(3);
      for (const l of n.libres) expect(l.traps.length, n.id).toBeGreaterThanOrEqual(2);
      for (const d of n.docs) for (const q of d.qs) expect(q.wrong.length, n.id).toBeGreaterThanOrEqual(2);
    }
  });
});
