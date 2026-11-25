import { describe, expect, it } from 'vitest';
import { getSource } from '../sources.ts';
import { NOTIONS, SKILLS } from './habiter.ts';
import { PROGRAMME } from './kit.ts';
import { createRng } from '../rng.ts';

describe('géographie cm2 — Mieux habiter', () => {
  it('compte les quatre notions du lot, à 5 niveaux', () => {
    expect(NOTIONS.map((n) => n.id)).toEqual([
      'gcm2-nature-ville',
      'gcm2-recycler',
      'gcm2-ecoquartier',
      'gcm2-transition',
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

  it('annonce la classe de CM2 et la source de chaque première bulle', () => {
    for (const s of SKILLS) {
      expect(s.lesson.source).toContain('classe de CM2');
      for (let seed = 0; seed < 20; seed++) {
        const { figure } = s.generate(createRng(seed), 5);
        expect(figure?.kind === 'document' ? figure.credit : '').toContain('CM2');
        const [first] = s.generate(createRng(seed), 1).steps;
        expect(first).toMatch(/^Cherchons (ce que dit|dans le dictionnaire)/);
      }
    }
  });

  it('fait ranger les choix face aux déchets dans l’ordre de priorité cité', () => {
    const skill = SKILLS.find((s) => s.id === 'gcm2-recycler')!;
    expect(skill.lesson.sources).toContain('ecologie-economie-circulaire');
    const orders = Array.from({ length: 20 }, (_, seed) => skill.generate(createRng(seed), 3)).flatMap((q) =>
      q.answer.kind === 'order' ? [{ ...q, answer: q.answer }] : [],
    );
    expect(orders.length).toBeGreaterThan(0);
    for (const q of orders) {
      expect(q.answer.correct.map((i) => q.answer.items[i])).toEqual([
        'éviter de produire le déchet',
        'réutiliser',
        'recycler',
        'valoriser d’une autre façon',
      ]);
      expect(q.prompt).not.toContain('plus petit');
      expect(q.steps[0]).toContain('ministère de la Transition écologique');
    }
  });
});
