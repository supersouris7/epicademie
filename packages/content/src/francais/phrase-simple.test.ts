import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import {
  ACCORDS_ATTRIBUT,
  ATTRIBUTS,
  CIRCONSTANCES,
  CIRCONSTANCIELS,
  DEUX_OBJETS,
  FAITS_PHRASE_SIMPLE,
  INCISES,
  INVERSES_LIEU,
  INVERSES_PRONOM,
  INVERSES_QUESTION,
  JUMELLES,
  OBJETS,
  ORDRE_HABITUEL,
  PHRASES,
  SUJETS_VARIES,
  TRIPLES,
  aLaFin,
  auDebut,
  gv,
} from './phrase-simple.donnees.ts';
import { FCM2_PHRASE_SIMPLE } from './phrase-simple.ts';

const skills = FCM2_PHRASE_SIMPLE;
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
const choisi = (q: Question) => {
  if (q.answer.kind !== 'choice') throw new Error('forme inattendue');
  return q.answer.options[q.answer.correct] ?? '';
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

describe('francais cm2 — analyser la phrase simple', () => {
  it('le chapitre compte les cinq notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm2-constituants-phrase',
      'fcm2-sujet-inverse',
      'fcm2-cod-coi',
      'fcm2-attribut-ou-objet',
      'fcm2-circonstanciels-temps-lieu-cause',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    for (const f of FAITS_PHRASE_SIMPLE) {
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

describe('réponses de l’analyse de la phrase', () => {
  const banque = [...PHRASES, ...SUJETS_VARIES];

  it('trois groupes : le groupe écrit est celui de la phrase affichée', () => {
    for (const q of tirages('fcm2-constituants-phrase', 3))
      expect(ecrit(q)).toEqual([gv(trouve(PHRASES, (p) => q.prompt.includes(auDebut(p))))]);
    for (const q of tirages('fcm2-constituants-phrase', 4))
      expect(ecrit(q)).toEqual([trouve(SUJETS_VARIES, (p) => q.prompt.includes(auDebut(p))).gs]);
    for (const q of tirages('fcm2-constituants-phrase', 5))
      lignes(q).forEach((ligne, i) => {
        const p = trouve(banque, (x) => ligne === auDebut(x) || ligne === aLaFin(x));
        const role = new RegExp(`ligne ${i + 1}, le groupe (sujet|verbal|circonstanciel)`).exec(q.prompt)?.[1];
        expect(trous(q)[i]).toBe(role === 'sujet' ? p.gs : role === 'verbal' ? gv(p) : p.gc);
      });
  });

  it('sujet inversé : le sujet suit le verbe, sauf dans les phrases à l’ordre habituel', () => {
    const inversees = [...INVERSES_LIEU, ...INVERSES_QUESTION, ...INVERSES_PRONOM, ...INCISES];
    for (const i of inversees)
      expect(i.phrase.indexOf(i.sujet, i.phrase.indexOf(i.verbe)), i.phrase).toBeGreaterThan(0);
    for (const i of ORDRE_HABITUEL) expect(i.phrase.indexOf(i.sujet)).toBeLessThan(i.phrase.indexOf(i.verbe));
    for (const q of tirages('fcm2-sujet-inverse', 2)) {
      if (q.answer.kind !== 'choice') throw new Error('forme inattendue');
      const bon = choisi(q);
      for (const option of q.answer.options)
        expect(ORDRE_HABITUEL.some((i) => i.phrase === option)).toBe(option !== bon);
    }
    for (const level of [3, 4] as const)
      for (const q of tirages('fcm2-sujet-inverse', level))
        expect(ecrit(q)).toEqual([trouve(inversees, (i) => q.prompt.endsWith(i.phrase)).sujet]);
    for (const q of tirages('fcm2-sujet-inverse', 5)) {
      const attendu = lignes(q).map((l) => trouve([...inversees, ...ORDRE_HABITUEL], (i) => i.phrase === l).sujet);
      expect(trous(q)).toEqual(attendu);
    }
  });

  it('COD ou COI : la fonction suit la préposition, un groupe en « à » peut être circonstanciel', () => {
    for (const o of OBJETS) {
      if (o.type === 'COI') expect(o.obj.startsWith(`${o.prep} `)).toBe(true);
      else expect(o.obj).not.toMatch(/^(à|de|aux|au) /);
    }
    for (const d of DEUX_OBJETS) expect(d.coi).toMatch(/^(à|aux) /);
    for (const q of tirages('fcm2-cod-coi', 4)) {
      const d = trouve(DEUX_OBJETS, (x) => q.prompt.includes(x.cod) && q.prompt.includes(x.coi));
      expect(trous(q)).toEqual([d.cod, d.coi]);
    }
    for (const q of tirages('fcm2-cod-coi', 5))
      lignes(q).forEach((ligne, i) => {
        const d = trouve(DEUX_OBJETS, (x) => ligne.includes(x.cod) && ligne.includes(x.coi));
        const groupe = q.answer.kind === 'cloze' ? /« (.+) » : $/.exec(q.answer.parts[i] ?? '')?.[1] : undefined;
        const attendu = groupe === d.cod ? 'COD' : groupe === d.coi ? 'COI' : 'complément circonstanciel';
        expect(trous(q)[i], ligne).toBe(attendu);
      });
  });

  it('attribut ou complément d’objet : le verbe décide', () => {
    for (const q of tirages('fcm2-attribut-ou-objet', 1)) {
      const attribut = JUMELLES.some((j) => q.prompt.includes(`${j.s} ${j.attributif} ${j.groupe}.`));
      expect(choisi(q)).toBe(attribut ? 'un attribut du sujet' : 'un complément d’objet');
    }
    for (const q of tirages('fcm2-attribut-ou-objet', 3))
      expect(ecrit(q)).toEqual([trouve(ATTRIBUTS, (a) => q.prompt.includes(` ${a.verbe} ${a.adj}.`)).adj]);
    for (const q of tirages('fcm2-attribut-ou-objet', 4))
      lignes(q).forEach((ligne, i) => {
        const attribut =
          JUMELLES.some((j) => ligne === `${j.s} ${j.attributif} ${j.groupe}.`) ||
          ATTRIBUTS.some((a) => ligne === `${a.s} ${a.verbe} ${a.adj}.`);
        const indirect = OBJETS.some((o) => o.type === 'COI' && ligne === `${o.s} ${o.verbe} ${o.obj}.`);
        expect(trous(q)[i], ligne).toBe(attribut ? 'attribut du sujet' : indirect ? 'COI' : 'COD');
      });
    for (const q of tirages('fcm2-attribut-ou-objet', 5)) {
      const texte = lignes(q);
      const j = trouve(JUMELLES, (x) => texte.includes(`${x.s} ${x.attributif} ${x.groupe}.`));
      const o = trouve(OBJETS, (x) => texte.includes(`${x.s} ${x.verbe} ${x.obj}.`));
      const a = trouve(ACCORDS_ATTRIBUT, (x) => texte[2] === x.texte);
      expect(trous(q)).toEqual([j.groupe, o.obj, a.options[a.correct]]);
      const ligne = texte.findIndex((l) => l.includes(j.groupe)) + 1;
      expect(q.prompt).toContain(`l’attribut du sujet (ligne ${ligne})`);
    }
  });

  it('accord de l’attribut : la forme juste suit le genre et le nombre du sujet', () => {
    expect(ACCORDS_ATTRIBUT.map((a) => `${a.sujet} ${a.options[a.correct]}`)).toEqual([
      'Les fenêtres ouvertes',
      'La cour déserte',
      'Les nuages noirs',
      'Les valises lourdes',
      'La mer bleue',
      'Les murs verts',
    ]);
  });

  it('temps, lieu, cause : le complément demandé est le bon', () => {
    for (const t of TRIPLES) expect(t.cause).toMatch(/^à cause /);
    for (const q of tirages('fcm2-circonstanciels-temps-lieu-cause', 3)) {
      const type = trouve(CIRCONSTANCES, (c) => q.prompt.includes(`circonstanciel de ${c} `));
      const t = trouve(TRIPLES, (x) => CIRCONSTANCES.every((c) => q.prompt.toLowerCase().includes(x[c])));
      expect(ecrit(q)).toEqual([t[type]]);
    }
    for (const q of tirages('fcm2-circonstanciels-temps-lieu-cause', 4)) {
      const c = trouve(CIRCONSTANCIELS, (x) => q.prompt.includes(x.phrase));
      expect(c.phrase.toLowerCase()).toContain(c.cc);
      expect(trous(q)).toEqual([c.cc, c.type === 'cause' ? 'la cause' : `le ${c.type}`]);
    }
    for (const q of tirages('fcm2-circonstanciels-temps-lieu-cause', 5))
      lignes(q).forEach((ligne, i) => {
        const t = trouve(TRIPLES, (x) => ligne.includes(x.action));
        const type = trouve(CIRCONSTANCES, (c) => q.prompt.includes(`ligne ${i + 1}, ${c}`));
        expect(trous(q)[i]).toBe(t[type]);
        expect(ligne.toLowerCase()).toContain(t[type]);
      });
  });
});
