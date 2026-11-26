import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import {
  ACCORDS_6E,
  AMBIGUS,
  ATTRIBUTS_6E,
  CAS_PARTICULIERS,
  CIRCONSTANCIELS_6E,
  CONSTITUEES,
  DEUX_COI,
  DIRECTS,
  DOUBLES,
  EMPLOIS,
  FAITS_PHRASE_SIMPLE_6E,
  INDIRECTS,
  INVERSEES,
  PAIRES,
  PRONOMINAUX,
  REGIMES,
  TROIS_CC,
  coiDe,
  phraseDebut,
  phraseInversee,
} from './phrase-simple-6e.donnees.ts';
import { F6_PHRASE_SIMPLE } from './phrase-simple-6e.ts';

const skills = F6_PHRASE_SIMPLE;
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
const ecrit = (q: Question) => {
  if (q.answer.kind !== 'text') throw new Error('forme inattendue');
  return q.answer.accepted;
};
const trouve = <T>(items: readonly T[], test: (x: T) => boolean): T => {
  const x = items.find(test);
  if (!x) throw new Error('phrase introuvable');
  return x;
};

describe('francais 6e — la phrase simple', () => {
  it('le chapitre compte les cinq notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'f6-constituants-phrase',
      'f6-attribut-ou-cod',
      'f6-coi',
      'f6-complements-circonstanciels',
      'f6-construction-verbe',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    for (const f of FAITS_PHRASE_SIMPLE_6E) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(10);
    }
    for (const s of skills) {
      for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
      for (const term of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(term, SUBJECT_GLOSSARIES.francais ?? []), term).toBe(true);
    }
  });

  it('questions valides et distinctes aux 5 niveaux, réponse juste acceptée, pièges expliqués et refusés', () => {
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
          for (const text of q.answer.accepted) expect(check(q, { kind: 'text', text }).correct).toBe(true);
          for (const t of q.traps)
            if ('text' in t) expect(check(q, { kind: 'text', text: t.text }).correct, t.text).toBe(false);
        }
      }
      expect(enonces.size, s.id).toBe(5);
      expect(niveauxAvecPieges, s.id).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('réponses de la phrase simple (6e)', () => {
  it('constituants : sujet entier, sujet inversé et compléments', () => {
    for (const p of CONSTITUEES) expect(p.gs.startsWith(`${p.noyau} `), p.gs).toBe(true);
    for (const q of tirages('f6-constituants-phrase', 3))
      expect(ecrit(q)).toEqual([trouve(CONSTITUEES, (p) => q.prompt.includes(phraseDebut(p))).gs]);
    for (const q of tirages('f6-constituants-phrase', 4)) {
      const i = trouve(INVERSEES, (x) => q.prompt.includes(phraseInversee(x)));
      expect(trous(q)).toEqual([i.gs, i.temps, i.lieu]);
    }
    for (const q of tirages('f6-constituants-phrase', 5)) {
      const [a, b, c] = lignes(q).map((l) => trouve(CONSTITUEES, (p) => l.toLowerCase().includes(p.gs.toLowerCase())));
      expect(trous(q)).toEqual([a?.gs, b?.gc, c?.pronom]);
    }
  });

  it('attribut ou COD : le verbe décide, l’auxiliaire n’introduit pas d’attribut', () => {
    for (const q of tirages('f6-attribut-ou-cod', 3))
      expect(ecrit(q)).toEqual([trouve(ATTRIBUTS_6E, (a) => q.prompt.includes(` ${a.verbe} ${a.att}.`)).att]);
    for (const q of tirages('f6-attribut-ou-cod', 4))
      lignes(q).forEach((ligne, i) => {
        const attribut =
          ATTRIBUTS_6E.some((a) => ligne === `${a.s} ${a.verbe} ${a.att}.`) ||
          PAIRES.some((p) => ligne === `${p.s} ${p.attributif} ${p.groupe}.`);
        const direct =
          DIRECTS.some((d) => ligne === `${d.s} ${d.verbe} ${d.cod}.`) ||
          PAIRES.some((p) => ligne === `${p.s} ${p.action} ${p.groupe}.`);
        expect(trous(q)[i], ligne).toBe(attribut ? 'attribut du sujet' : direct ? 'COD' : 'partie du verbe conjugué');
      });
    for (const q of tirages('f6-attribut-ou-cod', 5)) {
      const texte = lignes(q);
      const p = trouve(PAIRES, (x) => texte.includes(`${x.s} ${x.attributif} ${x.groupe}.`));
      const d = trouve(DIRECTS, (x) => texte.includes(`${x.s} ${x.verbe} ${x.cod} ${x.circ}.`));
      expect(trous(q).slice(0, 3)).toEqual([p.groupe, d.cod, d.pronom]);
    }
  });

  it('accord de l’attribut : la forme juste suit le genre et le nombre du sujet', () => {
    expect(ACCORDS_6E.map((a) => `${a.sujet} ${a.options[a.correct]}`)).toEqual([
      'Les fenêtres de la mairie ouvertes',
      'La plage du village déserte',
      'Les sommets des montagnes lointains',
      'Les valises des voyageurs lourdes',
      'Les volets de la maison fermés',
    ]);
  });

  it('COI : préposition comprise, pronom COI et deux compléments', () => {
    for (const q of tirages('f6-coi', 3))
      expect(ecrit(q)).toEqual([coiDe(trouve(INDIRECTS, (i) => q.prompt.includes(`${i.verbe} ${coiDe(i)}`)))]);
    for (const q of tirages('f6-coi', 4))
      expect(ecrit(q)).toEqual([trouve(PRONOMINAUX, (p) => q.prompt.includes(p.phrase)).coi]);
    for (const d of DEUX_COI) {
      expect(d.de).toMatch(/^(de|du|des) /);
      expect(d.a).toMatch(/^(à|au|aux) /);
      expect(d.pronom).toBe(d.a.startsWith('aux ') || d.a.startsWith('à ses ') ? 'leur' : 'lui');
    }
    for (const q of tirages('f6-coi', 5)) {
      const [un, deux] = lignes(q);
      const d = trouve(DEUX_COI, (x) => un === `${x.s} ${x.verbe} ${x.de} ${x.a} ${x.circ}.`);
      const e = trouve(DEUX_COI, (x) => deux === `${x.s} ${x.verbe} ${x.a}.`);
      expect(trous(q)).toEqual([d.de, d.a, e.pronom]);
    }
  });

  it('compléments circonstanciels : sens, nature et fonction', () => {
    // un seul groupe de lieu par phrase : l’action n’en contient pas et son verbe n’en réclame pas
    for (const t of TROIS_CC) expect(t.action).not.toMatch(/\b(restent|vont|au port|à la|dans|sur|sous|devant)\b/);
    for (const q of tirages('f6-complements-circonstanciels', 3)) {
      const t = trouve(TROIS_CC, (x) => q.prompt.includes(x.action));
      const sens = /circonstanciel de (temps|lieu|cause) /.exec(q.prompt)?.[1] as 'temps' | 'lieu' | 'cause';
      expect(ecrit(q)).toEqual([t[sens]]);
    }
    for (const c of CIRCONSTANCIELS_6E) expect(c.nature).not.toBe('un groupe adjectival');
    for (const q of tirages('f6-complements-circonstanciels', 4)) {
      if (q.answer.kind !== 'match') throw new Error('forme inattendue');
      expect(q.answer.left).toHaveLength(5);
      expect(new Set(q.answer.right).size).toBe(5);
    }
    for (const q of tirages('f6-complements-circonstanciels', 5))
      lignes(q).forEach((ligne, i) => {
        expect(trous(q)[i], ligne).toBe(trouve(AMBIGUS, (a) => a.phrase === ligne).fonction);
      });
  });

  it('construction du verbe : préposition, double emploi, cas particuliers', () => {
    for (const e of [...EMPLOIS, ...CAS_PARTICULIERS]) {
      expect(e.phrase).toContain(e.verbe);
      expect(e.complement === undefined, e.phrase).toBe(e.construction === 'intransitif');
      if (e.complement) expect(e.phrase.toLowerCase()).toContain(e.complement.toLowerCase());
    }
    for (const q of tirages('f6-construction-verbe', 3))
      expect(ecrit(q)).toEqual([trouve(REGIMES, (r) => q.prompt.includes(`${r.avant} … ${r.apres}`)).prep]);
    for (const q of tirages('f6-construction-verbe', 4))
      lignes(q).forEach((ligne, i) => {
        const attendu = DOUBLES.some((d) => d.intransitif === ligne)
          ? 'intransitif'
          : DOUBLES.some((d) => d.direct === ligne)
            ? 'transitif direct'
            : trouve(EMPLOIS, (e) => e.phrase === ligne).construction;
        expect(trous(q)[i], ligne).toBe(attendu);
      });
    for (const q of tirages('f6-construction-verbe', 5)) {
      const cas = lignes(q).map((l) => trouve(CAS_PARTICULIERS, (c) => c.phrase === l));
      const rang = Number(/ligne (\d)\./.exec(q.prompt)?.[1]);
      expect(trous(q)).toEqual([...cas.map((c) => c.construction), cas[rang - 1]?.complement]);
    }
  });
});
