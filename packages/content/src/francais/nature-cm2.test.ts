import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level } from '../types.ts';
import {
  ACCORDS,
  DIRECTS,
  FAITS_NATURE_CM2,
  INDIRECTS,
  INVARIABLES,
  LIGNES_INVARIABLES,
  LIGNES_PREP,
  PHRASES_PREP,
  PHRASES_SUB,
  PREPOSITIONS,
  REPRISES,
  SUBS_RARES,
  UN_INVARIABLE,
} from './nature-cm2.donnees.ts';
import { FCM2_NATURE } from './nature-cm2.ts';

const skills = FCM2_NATURE;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
/** Toutes les questions d'une notion à un niveau, sur de nombreuses graines. */
const tirages = (id: string, level: Level) => Array.from({ length: 200 }, (_, seed) => generate(id, level, seed));
const mots = (texte: string) => texte.toLowerCase().match(/[a-zàâçéèêëîïôûù]+/g) ?? [];
const compte = (texte: string, liste: readonly string[]) => mots(texte).filter((m) => liste.includes(m)).length;
const conjonctions = [...new Set(PHRASES_SUB.map((p) => p.conj))];

describe('francais cm2 — nature des mots', () => {
  it('le chapitre compte les cinq notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm2-prepositions',
      'fcm2-conjonctions-subordination',
      'fcm2-pronoms-complements',
      'fcm2-variations-pronom',
      'fcm2-mots-variables',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    for (const f of FAITS_NATURE_CM2) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(10);
    }
    for (const s of skills) {
      for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
      for (const term of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(term, SUBJECT_GLOSSARIES.francais ?? []), term).toBe(true);
    }
  });

  it('questions valides aux 5 niveaux, réponse juste acceptée, pièges expliqués', () => {
    for (const s of skills) {
      let niveauxAvecPieges = 0;
      for (const level of LEVELS) {
        const qs = tirages(s.id, level);
        expect(validateVariants(qs), `${s.id} N${level}`).toEqual([]);
        if (qs.some((q) => q.traps.length >= 2)) niveauxAvecPieges++;
        for (const q of qs) {
          if (q.answer.kind !== 'text') continue;
          for (const text of q.answer.accepted) expect(check(q, { kind: 'text', text }).correct).toBe(true);
        }
      }
      expect(niveauxAvecPieges, s.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('niveau 4 : association de cinq paires proposée dans chaque notion', () => {
    for (const s of skills) {
      const paires = tirages(s.id, 4).filter((q) => q.answer.kind === 'match' && q.answer.left.length === 5);
      expect(paires.length, s.id).toBeGreaterThan(0);
    }
  });
});

describe('banques de phrases', () => {
  it('une seule préposition par phrase, qui est bien celle attendue', () => {
    for (const p of PHRASES_PREP) {
      expect(compte(p.texte, PREPOSITIONS), p.texte).toBe(1);
      expect(mots(p.texte)).toEqual(expect.arrayContaining([p.prep, p.det, p.nom, p.verbe]));
    }
  });

  it('les décomptes annoncés correspondent aux mots des lignes, sans forme contractée', () => {
    for (const l of LIGNES_PREP) {
      expect(compte(l.texte, PREPOSITIONS), l.texte).toBe(l.n);
      expect(compte(l.texte, ['du', 'au', 'aux', 'des', 'sous', 'vers', 'devant', 'derrière']), l.texte).toBe(0);
    }
    for (const l of LIGNES_INVARIABLES) {
      expect(compte(l.texte, INVARIABLES), l.texte).toBe(l.n);
      // Aucun autre mot invariable ne doit se glisser dans les lignes.
      expect(compte(l.texte, ['bien', 'vite', 'peu', 'aussi', 'ne', 'pas', 'à', 'de', 'après', 'avant']), l.texte).toBe(
        0,
      );
    }
    for (const p of UN_INVARIABLE) {
      expect(compte(p.texte, INVARIABLES), p.texte).toBe(1);
      expect(mots(p.texte)).toContain(p.mot);
    }
  });

  it('chaque phrase complexe a une seule conjonction de subordination', () => {
    for (const p of PHRASES_SUB) {
      const texte = `${p.principale} ${p.sub}.`.toLowerCase();
      expect(p.sub.startsWith(`${p.conj} `), texte).toBe(true);
      expect(conjonctions.filter((c) => new RegExp(`(^| )${c} `).test(texte))).toEqual([p.conj]);
    }
    for (const p of SUBS_RARES) expect(p.texte.toLowerCase()).toContain(p.accepted[1] ?? p.conj);
  });

  it('pronoms : verbes à consonne, direct sans « à », indirect avec « à » ou « au(x) »', () => {
    for (const r of [...DIRECTS, ...INDIRECTS, ...REPRISES]) expect(r.verbe).toMatch(/^[^aeéèiouh]/);
    for (const r of DIRECTS) {
      expect(['le', 'la', 'les']).toContain(r.pronom);
      expect(r.groupe).not.toMatch(/^(à|au|aux) /);
    }
    for (const r of INDIRECTS) {
      expect(['lui', 'leur']).toContain(r.pronom);
      expect(r.groupe).toMatch(/^(à|au|aux) /);
    }
  });

  it('au pluriel, les mots invariables ne changent pas', () => {
    for (const a of ACCORDS) {
      expect(a.parts).toHaveLength(a.trous.length + 1);
      for (const [s, p] of a.trous) if ((INVARIABLES as readonly string[]).includes(s)) expect(p).toBe(s);
    }
  });
});
