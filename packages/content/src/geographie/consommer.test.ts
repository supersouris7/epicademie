import { describe, expect, it } from 'vitest';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import { NOTIONS, SKILLS } from './consommer.ts';
import { PROGRAMME } from './kit.ts';

describe('géographie cm1 — Consommer en France', () => {
  it('compte les quatre notions du lot, à 5 niveaux', () => {
    expect(NOTIONS.map((n) => n.id)).toEqual([
      'gcm1-eau',
      'gcm1-energie',
      'gcm1-alimentation',
      'gcm1-circuits-courts-longs',
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

  it('prévoit des erreurs typiques expliquées et assez de matière pour varier les niveaux', () => {
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

  it('remet un trajet en ordre avec sa propre consigne', () => {
    for (const s of SKILLS.filter((x) => x.id !== 'gcm1-energie')) {
      const questions = Array.from({ length: 20 }, (_, seed) => s.generate(createRng(seed), 3));
      const ordre = questions.filter((q) => q.answer.kind === 'order');
      expect(ordre.length, s.id).toBeGreaterThan(0);
      for (const q of ordre) expect(q.prompt, s.id).toContain('trajet');
    }
  });
});
