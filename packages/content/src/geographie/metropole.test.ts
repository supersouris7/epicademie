import { describe, expect, it } from 'vitest';
import { getSource } from '../sources.ts';
import { zoneIds } from '../cartes.ts';
import { createRng } from '../rng.ts';
import { PROGRAMME } from './kit.ts';
import { METROPOLES, NOTIONS, SKILLS } from './metropole.ts';

describe('géographie 6e — Habiter une métropole', () => {
  it('compte les cinq notions du lot, à 5 niveaux', () => {
    expect(NOTIONS.map((n) => n.id)).toEqual([
      'g6-metropoles-monde',
      'g6-ville-peripheries',
      'g6-mobilites',
      'g6-vocabulaire-urbain',
      'g6-ville-demain',
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

  it('prévoit des erreurs typiques expliquées et assez de matière pour les niveaux', () => {
    for (const n of NOTIONS) {
      for (const f of n.faits) {
        expect(f.wrong.length, n.id).toBeGreaterThanOrEqual(3);
        for (const w of f.wrong) expect(w.why.trim().length, n.id).toBeGreaterThan(0);
        if (f.choix) expect(f.choix, n.id).toContain(f.gap[2][0]);
      }
      for (const l of n.libres) expect(l.traps.length, n.id).toBeGreaterThanOrEqual(2);
      for (const d of n.docs) for (const q of d.qs) expect(q.wrong.length, n.id).toBeGreaterThanOrEqual(2);
      expect(n.faits.length, n.id).toBeGreaterThanOrEqual(5);
      expect(n.paires3.length, n.id).toBe(3);
      expect(n.paires5.length, n.id).toBe(5);
      expect(n.libres.length, n.id).toBeGreaterThanOrEqual(3);
      expect(n.docs.length, n.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('propose au moins six questions différentes au niveau 5', () => {
    for (const n of NOTIONS) expect(n.docs.flatMap((d) => d.qs).length, n.id).toBeGreaterThanOrEqual(6);
  });

  it('n’interroge ni sur les consignes de classe ni sur des seuils statistiques', () => {
    for (const n of NOTIONS) {
      const enonces = [...n.faits, ...n.libres, ...n.docs.flatMap((d) => d.qs)].map((f) => f.q).join(' ');
      expect(enonces, n.id).not.toMatch(/Éduscol|programme|en classe|%|PIB/);
    }
  });

  it('annonce la classe de sixième dans la leçon et sous les textes à lire', () => {
    for (const s of SKILLS) {
      expect(s.lesson.source).toContain('classe de sixième');
      const { figure } = s.generate(createRng(1), 5);
      expect(figure?.kind === 'document' ? figure.credit : '').toContain('sixième');
    }
  });

  it('fait localiser les grandes métropoles sur le planisphère', () => {
    const skill = SKILLS.find((s) => s.id === 'g6-metropoles-monde')!;
    expect(skill.lesson.sources).toContain('ghsl-atlas-2018');
    const questions = ([1, 3] as const).flatMap((level) =>
      Array.from({ length: 40 }, (_, seed) => skill.generate(createRng(seed), level)).filter(
        (q) => q.figure?.kind === 'map',
      ),
    );
    expect(questions.some((q) => q.answer.kind === 'zone')).toBe(true);
    expect(questions.some((q) => q.answer.kind === 'choice')).toBe(true);
    for (const m of METROPOLES) {
      expect(zoneIds('monde')).toContain(m.continent);
      expect(skill.lesson.sources).toContain(m.src);
      expect(getSource(m.src), m.nom).toBeDefined();
    }
    expect(new Set(METROPOLES.map((m) => m.continent))).toContain('europe');
    expect(new Set(METROPOLES.map((m) => m.continent))).toContain('afrique');
    for (const q of questions) expect(q.steps.join(' ')).not.toMatch(/Most of them/);
  });

  it('fait ranger les espaces du centre vers la périphérie', () => {
    const skill = SKILLS.find((s) => s.id === 'g6-ville-peripheries')!;
    const orders = Array.from({ length: 20 }, (_, seed) => skill.generate(createRng(seed), 3)).flatMap((q) =>
      q.answer.kind === 'order' ? [q.answer] : [],
    );
    expect(orders.length).toBeGreaterThan(0);
    for (const a of orders) {
      expect(a.correct.map((i) => a.items[i])).toEqual(['la ville-centre', 'la banlieue', 'la couronne']);
    }
  });
});
