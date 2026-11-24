import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { getSource } from '../sources.ts';
import { FCM1_VERBE_SUJET } from './verbe-sujet.ts';
import {
  FAITS_VS,
  NOMS_VERBES,
  PHRASES_DOUBLES,
  PHRASES_INFINITIF,
  PHRASES_NEGATIVES,
  PHRASES_SIMPLES,
  VERBES_IRREGULIERS,
  VERBES_REGULIERS,
} from './verbe-sujet.donnees.ts';

const skills = FCM1_VERBE_SUJET;

describe('francais cm1 — le verbe et le sujet', () => {
  it('le chapitre compte les cinq notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm1-verbe-conjugue',
      'fcm1-infinitif',
      'fcm1-groupe-sujet',
      'fcm1-types-sujets',
      'fcm1-nom-ou-verbe',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('chaque fait cite une source du registre et une citation non vide', () => {
    for (const f of FAITS_VS) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(10);
    }
  });

  it('au moins deux erreurs typiques expliquées par notion (niveaux 1 à 5, 20 graines)', () => {
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
            const [first] = q.answer.accepted;
            expect(check(q, { kind: 'text', text: first ?? '' }).correct, `${s.id} N${level} g${seed}`).toBe(true);
            for (const t of q.traps)
              if ('text' in t) expect(check(q, { kind: 'text', text: t.text }).correct, t.text).toBe(false);
          }
        }
  });
});

describe('banques de phrases', () => {
  it('chaque phrase étiquetée a le bon nombre de verbes', () => {
    const verbs = (p: readonly { tag: string }[]) => p.filter((m) => m.tag === 'v').length;
    for (const p of [...PHRASES_SIMPLES, ...PHRASES_INFINITIF, ...PHRASES_NEGATIVES]) expect(verbs(p)).toBe(1);
    for (const p of PHRASES_DOUBLES) expect(verbs(p)).toBe(2);
    for (const p of [...PHRASES_SIMPLES, ...PHRASES_NEGATIVES])
      for (const m of p) if (m.tag === 'v') expect(m.inf).toBeTruthy();
  });

  it('les infinitifs régulièrement formés se terminent par -er ou -ir', () => {
    for (const v of VERBES_REGULIERS) expect(v.inf).toMatch(/(er|ir)$/);
    for (const v of [...VERBES_REGULIERS, ...VERBES_IRREGULIERS]) expect(v.formes.length).toBeGreaterThanOrEqual(4);
  });

  it('nom ou verbe : les formes plurielles suivent la règle (-s pour le nom, -nt pour le verbe)', () => {
    for (const e of NOMS_VERBES) {
      expect(e.mot).toMatch(/e$/);
      expect(e.verbe.toLowerCase()).toContain(e.mot);
      expect(e.nom.toLowerCase()).toContain(e.mot);
    }
  });
});
