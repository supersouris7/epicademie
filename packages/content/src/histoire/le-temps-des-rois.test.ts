import { describe, expect, it } from 'vitest';
import { getSource } from '../sources.ts';
import { NOTIONS, SOURCE } from './le-temps-des-rois.ts';

describe('histoire cm1 — Le temps des rois', () => {
  it('cite une source du registre et une citation exacte pour chaque fait', () => {
    expect(getSource(SOURCE)).toBeDefined();
    for (const n of NOTIONS) {
      const all = [...n.faits, ...n.libres, ...n.docs.flatMap((d) => d.qs)];
      for (const f of all) {
        expect(f.quote.trim().length, n.id).toBeGreaterThan(20);
        expect(f.explain.trim().length, n.id).toBeGreaterThan(0);
      }
    }
  });

  it('prévoit au moins deux erreurs typiques expliquées par fait', () => {
    for (const n of NOTIONS) {
      for (const f of n.faits) {
        expect(f.wrong.length, n.id).toBeGreaterThanOrEqual(3);
        for (const w of f.wrong) expect(w.why.trim().length, n.id).toBeGreaterThan(0);
      }
      for (const l of n.libres) expect(l.traps.length, n.id).toBeGreaterThanOrEqual(2);
      for (const d of n.docs) for (const q of d.qs) expect(q.wrong.length, n.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('propose assez de matière pour varier les niveaux', () => {
    for (const n of NOTIONS) {
      expect(n.faits.length, n.id).toBeGreaterThanOrEqual(4);
      expect(n.paires3.length, n.id).toBe(3);
      expect(n.paires5.length, n.id).toBe(5);
      expect(n.libres.length, n.id).toBeGreaterThanOrEqual(3);
      expect(n.docs.length, n.id).toBeGreaterThanOrEqual(2);
    }
  });
});
