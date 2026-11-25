import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level } from '../types.ts';
import {
  CONTRASTES,
  EPITHETES,
  EPITHETES_PIEGES,
  FAITS_GN,
  GROUPES_LONGS,
  GROUPES_PAR_CONSTRUCTION,
  LIGNES_CONSTRUCTIONS,
  NOM_CONSTRUCTION,
  OBJETS_PRONOMS,
  OBJETS_SIMPLES,
  SUJETS_SIMPLES,
  texteDe,
  type Construction,
} from './groupe-nominal.donnees.ts';
import { FCM1_GROUPE_NOMINAL } from './groupe-nominal.ts';

const skills = FCM1_GROUPE_NOMINAL;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
/** Toutes les questions d'une notion à un niveau, sur de nombreuses graines. */
const tirages = (id: string, level: Level) => Array.from({ length: 200 }, (_, seed) => generate(id, level, seed));

describe('francais cm1 — le groupe nominal', () => {
  it('le chapitre compte les quatre notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm1-gn-noyau',
      'fcm1-gn-composition',
      'fcm1-adjectif-epithete',
      'fcm1-gn-pronom',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    for (const f of FAITS_GN) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(10);
    }
    for (const s of skills) {
      for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
      for (const term of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(term, SUBJECT_GLOSSARIES.francais ?? []), term).toBe(true);
    }
  });

  it('questions valides aux 5 niveaux, réponse juste acceptée, pièges refusés et expliqués', () => {
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
});

describe('banques de phrases du groupe nominal', () => {
  const mots = (texte: string) => texte.replace(/\./g, '').toLowerCase().split(' ');

  it('chaque groupe simple a un seul adjectif, chaque groupe long en a deux', () => {
    for (const p of [...SUJETS_SIMPLES, ...OBJETS_SIMPLES]) {
      expect([p.avant, p.apres].filter(Boolean), texteDe(p)).toHaveLength(1);
    }
    for (const p of GROUPES_LONGS) expect([p.avant, p.apres].filter(Boolean), texteDe(p)).toHaveLength(2);
  });

  it('les constructions annoncées ont le bon nombre de mots', () => {
    const longueur: Record<Construction, number> = { dn: 2, dan: 3, dna: 3, dana: 4 };
    for (const [c, groupes] of Object.entries(GROUPES_PAR_CONSTRUCTION))
      for (const g of groupes) expect(mots(g), g).toHaveLength(longueur[c as Construction]);
    expect(new Set(LIGNES_CONSTRUCTIONS.map(([t]) => t)).size).toBe(LIGNES_CONSTRUCTIONS.length);
  });

  it('le décompte du niveau 5 correspond aux lignes affichées', () => {
    for (const q of tirages('fcm1-gn-composition', 5)) {
      if (q.figure?.kind !== 'document' || q.answer.kind !== 'number') throw new Error('forme inattendue');
      const c = (['dna', 'dan', 'dn'] as const).find((x) => q.prompt.endsWith(`: ${NOM_CONSTRUCTION[x]} ?`));
      const attendu = q.figure.lines.filter((l) => LIGNES_CONSTRUCTIONS.some(([t, x]) => t === l && x === c)).length;
      expect(check(q, { kind: 'number', text: String(attendu) }).correct, q.prompt).toBe(true);
    }
  });

  it('épithète : collée au nom dans la bonne phrase, séparée par un verbe dans les autres', () => {
    for (const c of CONTRASTES) {
      expect(c.epithete).toContain(`${c.nom} ${c.adjectif}`);
      for (const s of c.separes) expect(s).not.toContain(`${c.nom} ${c.adjectif}`);
    }
    for (const e of [...EPITHETES, ...EPITHETES_PIEGES]) {
      expect([`${e.nom} ${e.adjectif}`, `${e.adjectif} ${e.nom}`].some((g) => e.texte.toLowerCase().includes(g))).toBe(
        true,
      );
    }
    for (const e of EPITHETES_PIEGES) {
      expect(e.texte).toContain(`${e.verbe} ${e.separe}`);
      const verbe = e.texte.indexOf(` ${e.verbe} `);
      expect(e.texte.indexOf(e.adjectif) > verbe, e.texte).toBe(e.place === 'apres');
      // L'adjectif écarté est toujours de l'autre côté du verbe par rapport à son nom.
      expect(e.texte.indexOf(e.nomSepare)).toBeLessThan(verbe);
      expect(e.texte.indexOf(e.separe)).toBeGreaterThan(verbe);
    }
  });

  it('épithète au niveau 5 : au moins une ligne avec l’épithète avant le verbe et une après', () => {
    for (const q of tirages('fcm1-adjectif-epithete', 5)) {
      if (q.figure?.kind !== 'document') throw new Error('forme inattendue');
      const places = q.figure.lines.map((l) => EPITHETES_PIEGES.find((e) => e.texte === l)?.place);
      expect(new Set(places)).toEqual(new Set(['avant', 'apres']));
      expect(new Set(q.figure.lines).size).toBe(3);
    }
  });

  it('nom noyau : le nom seul est juste, le déterminant devant le nom est refusé et expliqué', () => {
    const groupes = [...OBJETS_SIMPLES, ...GROUPES_LONGS];
    for (const level of [3, 4] as const) {
      for (const q of tirages('fcm1-gn-noyau', level)) {
        const p = groupes.find((g) => q.prompt.includes(texteDe(g)));
        if (!p || q.answer.kind !== 'text') throw new Error('forme inattendue');
        expect(q.answer.accepted).toEqual([p.nom]);
        const faux = check(q, { kind: 'text', text: `${p.det} ${p.nom}` });
        expect(faux.correct).toBe(false);
        expect(JSON.stringify(faux)).toContain('écris le nom seul');
        if (p.autre) {
          const autre = check(q, { kind: 'text', text: p.autre.nom });
          expect(autre.correct).toBe(false);
          expect(JSON.stringify(autre)).toContain('un autre groupe nominal');
        }
      }
    }
    for (const q of tirages('fcm1-gn-noyau', 5)) {
      if (q.answer.kind !== 'cloze') throw new Error('forme inattendue');
      for (const b of q.answer.blanks) {
        if (b.mode !== 'text') throw new Error('forme inattendue');
        expect(b.accepted).toHaveLength(1);
        expect(b.accepted[0]).not.toContain(' ');
      }
    }
  });

  it('pronoms compléments : les verbes commencent par une consonne', () => {
    for (const o of OBJETS_PRONOMS) expect(o.verbe).toMatch(/^[^aeéèiouh]/);
  });

  it('le pronom seul à la place du groupe est jugé juste, le groupe gardé est refusé', () => {
    for (const q of tirages('fcm1-gn-pronom', 3)) {
      const [, phrase = ''] = /: « (.*) »$/.exec(q.prompt) ?? [];
      expect(check(q, { kind: 'text', text: phrase }).correct).toBe(false);
    }
  });
});
