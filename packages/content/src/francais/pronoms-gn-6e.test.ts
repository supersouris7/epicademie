import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import {
  COMPLEMENTS_DU_NOM,
  COMPLETS,
  DEUX_FONCTIONS,
  DOUBLES_REPRISES,
  EPITHETES,
  FAITS_PRONOMS_GN_6E,
  GROUPES_NOMINAUX,
  GROUPES_PREPOSITIONNELS,
  OBJETS_PRONOMS,
  RECITS,
  REMPLACEMENTS,
  REPRISES,
  SUJETS_PRONOMS,
} from './pronoms-gn-6e.donnees.ts';
import { F6_PRONOMS_GN } from './pronoms-gn-6e.ts';

const skills = F6_PRONOMS_GN;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const tirages = (id: string, level: Level) => Array.from({ length: 200 }, (_, seed) => generate(id, level, seed));
const lignes = (q: Question) => {
  if (q.figure?.kind !== 'document') throw new Error('forme inattendue');
  return q.figure.lines;
};
const trous = (q: Question) => {
  if (q.answer.kind !== 'cloze') throw new Error('forme inattendue');
  return q.answer.blanks.map((b) => (b.mode === 'text' ? (b.accepted[0] ?? '') : (b.options[b.correct] ?? '')));
};
const juste = (q: Question) => {
  if (q.answer.kind === 'text') return q.answer.accepted.join('|');
  if (q.answer.kind !== 'choice') throw new Error('forme inattendue');
  return q.answer.options[q.answer.correct] ?? '';
};
const trouve = <T>(items: readonly T[], test: (x: T) => boolean): T => {
  const x = items.find(test);
  if (!x) throw new Error('phrase introuvable');
  return x;
};
const PHRASES = [...SUJETS_PRONOMS, ...OBJETS_PRONOMS];

describe('francais 6e — pronoms et groupe nominal', () => {
  it('le chapitre compte les quatre notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'f6-pronom-fonction',
      'f6-pronom-antecedent',
      'f6-groupe-nominal',
      'f6-epithete-complement-nom',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    for (const f of FAITS_PRONOMS_GN_6E) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(10);
    }
    for (const s of skills) {
      for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
      for (const term of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(term, SUBJECT_GLOSSARIES.francais ?? []), term).toBe(true);
    }
  });

  it('questions valides et distinctes aux 5 niveaux, pièges expliqués et refusés', () => {
    for (const s of skills) {
      let niveauxAvecPieges = 0;
      const enonces = new Set<string>();
      for (const level of LEVELS) {
        const qs = tirages(s.id, level);
        expect(validateVariants(qs), `${s.id} N${level}`).toEqual([]);
        enonces.add(qs.map((q) => q.prompt).join('|'));
        if (qs.every((q) => q.traps.length >= 2)) niveauxAvecPieges++;
        for (const q of qs) {
          if (q.answer.kind !== 'text') continue;
          for (const t of q.traps)
            if ('text' in t) expect(check(q, { kind: 'text', text: t.text }).correct, t.text).toBe(false);
        }
      }
      expect(enonces.size, s.id).toBe(5);
      expect(niveauxAvecPieges, s.id).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('réponses des pronoms et du groupe nominal (6e)', () => {
  it('pronom : fonction, remplacement et phrases à deux pronoms', () => {
    for (const q of tirages('f6-pronom-fonction', 2))
      expect(juste(q)).toBe(trouve(PHRASES, (p) => q.prompt.includes(p.phrase)).fonction);
    for (const r of REMPLACEMENTS) expect(r.phrase).toContain(r.groupe);
    for (const q of tirages('f6-pronom-fonction', 3))
      expect(juste(q)).toBe(trouve(REMPLACEMENTS, (r) => q.prompt.includes(r.phrase)).pronom);
    for (const q of tirages('f6-pronom-fonction', 4)) {
      const d = trouve(DEUX_FONCTIONS, (x) => q.prompt.includes(x.phrase));
      expect(trous(q)).toEqual([d.sujet, d.complement, d.fonction]);
    }
    for (const q of tirages('f6-pronom-fonction', 5)) {
      const texte = lignes(q);
      const attendu = texte.slice(0, 3).map((l) => trouve(PHRASES, (p) => p.phrase === l).fonction);
      expect(trous(q)).toEqual([...attendu, trouve(REMPLACEMENTS, (r) => r.phrase === texte[3]).pronom]);
    }
  });

  it('antécédent : il est écrit avant le pronom et la réponse le reprend en entier', () => {
    for (const r of REPRISES) {
      expect(r.premiere).toContain(r.antecedent);
      expect(r.premiere).toContain(r.autre);
    }
    for (const d of DOUBLES_REPRISES)
      for (const l of [d.sujet, d.complement]) {
        expect(d.premiere).toContain(l.antecedent);
        expect(d.seconde).toContain(l.pronom);
      }
    for (const r of RECITS) {
      expect(r.lignes[0]).toContain(r.milieu.antecedent);
      expect(r.lignes[1]).toContain(r.milieu.pronom);
      for (const l of [r.sujet, r.complement]) {
        expect(r.lignes[2]).toContain(l.antecedent);
        expect(r.lignes[3]).toContain(l.pronom);
      }
    }
    for (const q of tirages('f6-pronom-antecedent', 3))
      expect(juste(q)).toBe(trouve(REPRISES, (r) => q.prompt.includes(r.premiere)).antecedent);
    for (const q of tirages('f6-pronom-antecedent', 5)) {
      const r = trouve(RECITS, (x) => lignes(q)[0] === x.lignes[0]);
      expect(trous(q)).toEqual([r.milieu.antecedent, r.milieu.fonction, r.sujet.antecedent, r.complement.antecedent]);
    }
  });

  it('groupe nominal : noyau dans le groupe, une seule fonction demandée', () => {
    for (const g of GROUPES_NOMINAUX) {
      expect(g.phrase).toContain(g.gn);
      expect(g.phrase).toContain(g.coupe);
      expect(g.gn.split(' ')).toContain(g.noyau);
      expect(g.autres).not.toContain(g.noyau);
    }
    for (const g of GROUPES_PREPOSITIONNELS) expect(g.phrase).toContain(`${g.prep} ${g.gn}`);
    for (const q of tirages('f6-groupe-nominal', 3))
      expect(juste(q)).toBe(trouve(GROUPES_NOMINAUX, (g) => q.prompt.includes(g.phrase)).gn);
    for (const q of tirages('f6-groupe-nominal', 4)) {
      const g = trouve(GROUPES_PREPOSITIONNELS, (x) => q.prompt.includes(x.phrase));
      expect(trous(q)).toEqual([g.gn, g.noyau, g.fonction]);
    }
    for (const q of tirages('f6-groupe-nominal', 5)) {
      const [a, b, c] = lignes(q).map((l) => trouve(GROUPES_NOMINAUX, (g) => g.phrase === l));
      expect(trous(q)).toEqual([a?.gn, b?.fonction, c?.noyau]);
    }
  });

  it('épithète ou complément du nom : la préposition distingue les deux banques', () => {
    const prep = /^(de |d’|en |à |sans |pour )/;
    for (const e of EPITHETES) expect(e.expansion).not.toMatch(prep);
    for (const c of COMPLEMENTS_DU_NOM) expect(c.expansion).toMatch(prep);
    for (const e of [...EPITHETES, ...COMPLEMENTS_DU_NOM]) expect(e.gn).toContain(e.expansion);
    for (const g of COMPLETS) {
      expect(g.complement).toMatch(prep);
      for (const mot of [g.noyau, g.epithete, g.complement]) expect(g.gn).toContain(mot);
    }
    for (const q of tirages('f6-epithete-complement-nom', 2)) {
      const banque = q.prompt.includes('une épithète') ? EPITHETES : COMPLEMENTS_DU_NOM;
      expect(banque.map((e) => e.gn)).toContain(juste(q));
    }
    for (const q of tirages('f6-epithete-complement-nom', 5)) {
      const attendu = lignes(q).map((l) =>
        EPITHETES.some((e) => l === `${e.avant} ${e.gn}.`) ? 'épithète' : 'complément du nom',
      );
      expect(trous(q).slice(0, 4)).toEqual(attendu);
    }
  });
});
