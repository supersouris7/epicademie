import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { getSource } from '../sources.ts';
import { FCM1_COMPLEMENTS } from './complements.ts';
import { AVANT, ENTREES, FAITS_COMPL, MANIPS, resultat } from './complements.donnees.ts';

const skills = FCM1_COMPLEMENTS;

describe('francais cm1 — les compléments', () => {
  it('le chapitre compte les quatre notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm1-objet-circonstanciel',
      'fcm1-cod-coi',
      'fcm1-groupes-circonstanciels',
      'fcm1-manipulations',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('chaque fait cite une source du registre et une citation non vide', () => {
    for (const f of FAITS_COMPL) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(10);
    }
  });

  it('au moins deux erreurs typiques expliquées par notion', () => {
    for (const s of skills) {
      const withTraps = new Set<number>();
      for (let level = 1; level <= 5; level++)
        for (let seed = 0; seed < 20; seed++) {
          const q = generate(s.id, level as 1, seed);
          if (q.traps.length >= 2) withTraps.add(level);
          for (const t of q.traps) expect(t.why.trim().length).toBeGreaterThan(5);
        }
      expect(withTraps.size, s.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('la réponse attendue est juste et chaque piège est faux, à tous les niveaux', () => {
    for (const s of skills)
      for (let level = 1; level <= 5; level++)
        for (let seed = 0; seed < 20; seed++) {
          const q = generate(s.id, level as 1, seed);
          if (q.answer.kind === 'choice')
            expect(check(q, { kind: 'choice', index: q.answer.correct }).correct).toBe(true);
          if (q.answer.kind === 'text') {
            for (const a of q.answer.accepted)
              expect(check(q, { kind: 'text', text: a }).correct, `${s.id} N${level} g${seed}`).toBe(true);
            for (const t of q.traps)
              if ('text' in t) expect(check(q, { kind: 'text', text: t.text }).correct, t.text).toBe(false);
          }
        }
  });
});

describe('banque de phrases', () => {
  it('sujets sans voyelle initiale, objets sans « du » ni « des », aucun doublon', () => {
    for (const e of ENTREES) {
      expect(e.gs, e.gs).toMatch(/^[^aeiouyhéèêAEIOUYH]/);
      expect(e.obj.split(' ')[0], e.obj).not.toMatch(/^(du|des)$/);
      if (e.type === 'coi') expect(e.obj.startsWith(`${e.prep}`), e.obj).toBe(true);
      else expect(e.prep).toBeUndefined();
      expect(e.autre).not.toBe(e.circ);
    }
    const phrases = ENTREES.map((e) => resultat(e, 'supprimer'));
    expect(new Set(phrases).size).toBe(phrases.length);
  });

  it('chaque manipulation donne une phrase différente', () => {
    for (const e of ENTREES) expect(new Set(MANIPS.map((m) => resultat(e, m))).size).toBe(MANIPS.length);
    expect(AVANT.length).toBeGreaterThanOrEqual(3);
  });
});
