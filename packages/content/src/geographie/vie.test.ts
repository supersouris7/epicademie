import { describe, expect, it } from 'vitest';
import { getSource } from '../sources.ts';
import { NOTIONS, SKILLS } from './vie.ts';
import { PROGRAMME } from './kit.ts';

describe('géographie cm1 — Se loger, travailler, avoir des loisirs', () => {
  it('compte les quatre notions du lot, à 5 niveaux', () => {
    expect(NOTIONS.map((n) => n.id)).toEqual([
      'gcm1-espaces-urbains',
      'gcm1-espaces-touristiques',
      'gcm1-logement',
      'gcm1-travail',
    ]);
    for (const s of SKILLS) expect(s.levels).toBe(5);
  });

  it('cite une source du registre et une citation non vide pour chaque fait', () => {
    for (const n of NOTIONS) {
      const all = [...n.faits, ...n.libres, ...n.docs.flatMap((d) => d.qs)];
      for (const f of all) {
        expect(getSource(f.src ?? PROGRAMME), n.id).toBeDefined();
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
