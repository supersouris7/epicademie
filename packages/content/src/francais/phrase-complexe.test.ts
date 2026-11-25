import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import {
  COMPLEXES_PIEGES,
  COORDINATION,
  FAITS_PHRASE_COMPLEXE,
  LIENS_DEBUT,
  LIENS_INTRUS,
  LIENS_MILIEU,
  PHRASES_TYPIQUES,
  REUNIONS,
  SIMPLES_PIEGES,
  texteReunion,
} from './phrase-complexe.donnees.ts';
import { FCM2_PHRASE_COMPLEXE } from './phrase-complexe.ts';

const skills = FCM2_PHRASE_COMPLEXE;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const tirages = (id: string, level: Level) => Array.from({ length: 200 }, (_, seed) => generate(id, level, seed));
const PHRASES = [...PHRASES_TYPIQUES, ...SIMPLES_PIEGES, ...COMPLEXES_PIEGES];
const LIENS = [...LIENS_MILIEU, ...LIENS_DEBUT, ...LIENS_INTRUS];

const phraseDe = (texte: string) => {
  const p = PHRASES.find((x) => texte.includes(x.texte));
  if (!p) throw new Error(`phrase inconnue : ${texte}`);
  return p;
};
const lienDe = (texte: string) => {
  const l = LIENS.find((x) => texte.includes(x.texte));
  if (!l) throw new Error(`phrase inconnue : ${texte}`);
  return l;
};
const lignes = (q: Question) => {
  if (q.figure?.kind !== 'document') throw new Error('forme inattendue');
  return q.figure.lines;
};
const trous = (q: Question) => {
  if (q.answer.kind !== 'cloze') throw new Error('forme inattendue');
  return q.answer.blanks.map((b) => (b.mode === 'text' ? (b.accepted[0] ?? '') : (b.options[b.correct] ?? '')));
};
const bonne = (q: Question) => {
  if (q.answer.kind !== 'choice') throw new Error('forme inattendue');
  return q.answer.options[q.answer.correct] ?? '';
};

describe('francais cm2 — phrase simple et phrase complexe', () => {
  it('le chapitre compte les trois notions au programme du CM2, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm2-verbes-conjugues',
      'fcm2-phrase-simple-complexe',
      'fcm2-mots-qui-relient',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    for (const f of FAITS_PHRASE_COMPLEXE) expect(getSource(f.source), f.id).toBeDefined();
    for (const s of skills) {
      for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
      for (const term of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(term, SUBJECT_GLOSSARIES.francais ?? []), term).toBe(true);
    }
  });

  it('questions valides aux 5 niveaux, réponse juste acceptée, au moins deux pièges expliqués', () => {
    for (const s of skills) {
      let niveauxAvecPieges = 0;
      for (const level of LEVELS) {
        const qs = tirages(s.id, level);
        expect(validateVariants(qs), `${s.id} N${level}`).toEqual([]);
        if (qs.every((q) => q.traps.length >= 2)) niveauxAvecPieges++;
        for (const q of qs) {
          if (q.answer.kind !== 'text') continue;
          for (const text of q.answer.accepted) expect(check(q, { kind: 'text', text }).correct).toBe(true);
        }
      }
      expect(niveauxAvecPieges, s.id).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('banques et réponses de la phrase complexe', () => {
  it('chaque verbe et infinitif annoncé figure dans sa phrase ; les banques ont le bon nombre de verbes', () => {
    for (const p of PHRASES) for (const v of [...p.verbes, ...p.infinitifs]) expect(p.texte).toContain(v);
    for (const p of SIMPLES_PIEGES) expect(p.verbes, p.texte).toHaveLength(1);
    for (const p of COMPLEXES_PIEGES) expect(p.verbes.length, p.texte).toBeGreaterThan(1);
  });

  it('compter : le nombre attendu est celui des verbes conjugués, l’infinitif en plus est refusé', () => {
    for (const q of tirages('fcm2-verbes-conjugues', 1))
      expect(bonne(q)).toBe(String(phraseDe(q.prompt).verbes.length));
    for (const q of tirages('fcm2-verbes-conjugues', 3)) {
      const p = phraseDe(q.prompt);
      expect(check(q, { kind: 'number', text: String(p.verbes.length) }).correct).toBe(true);
      if (p.infinitifs.length)
        expect(check(q, { kind: 'number', text: String(p.verbes.length + p.infinitifs.length) }).correct).toBe(false);
    }
    for (const q of tirages('fcm2-verbes-conjugues', 4)) {
      const p = phraseDe(q.prompt);
      expect(check(q, { kind: 'text', text: p.verbes[0] ?? '' }).correct).toBe(true);
      for (const inf of p.infinitifs) expect(check(q, { kind: 'text', text: inf }).correct).toBe(false);
    }
    for (const q of tirages('fcm2-verbes-conjugues', 5)) {
      const total = lignes(q).reduce((s, l) => s + phraseDe(l).verbes.length, 0);
      expect(check(q, { kind: 'number', text: String(total) }).correct, lignes(q).join(' ')).toBe(true);
    }
  });

  it('simple ou complexe : la réponse suit le nombre de verbes conjugués', () => {
    for (const level of [1, 2] as const)
      for (const q of tirages('fcm2-phrase-simple-complexe', level)) {
        if (q.answer.kind !== 'choice') throw new Error('forme inattendue');
        const complexe = q.prompt.includes('complexe');
        q.answer.options.forEach((o) => expect(phraseDe(o).verbes.length > 1 === complexe, o).toBe(o === bonne(q)));
      }
    for (const q of tirages('fcm2-phrase-simple-complexe', 3)) {
      const n = phraseDe(q.prompt).verbes.length;
      expect(trous(q)).toEqual([String(n), n > 1 ? 'complexe' : 'simple']);
    }
    for (const q of tirages('fcm2-phrase-simple-complexe', 5)) {
      const attendu = lignes(q).map((l) => (phraseDe(l).verbes.length > 1 ? 'complexe' : 'simple'));
      expect(trous(q)).toEqual(attendu);
      expect(new Set(attendu).size).toBe(2);
    }
  });

  it('réunion : une seule phrase est acceptée, pas deux phrases ni un mot oublié', () => {
    for (const q of tirages('fcm2-phrase-simple-complexe', 4)) {
      const x = REUNIONS.find((y) => q.prompt.includes(`« ${y.a}. »`));
      if (!x) throw new Error(`question inconnue : ${q.prompt}`);
      expect(check(q, { kind: 'text', text: texteReunion(x) }).correct).toBe(true);
      expect(check(q, { kind: 'text', text: `${x.a} ${x.b}.` }).correct).toBe(false);
      expect(check(q, { kind: 'text', text: `${x.a}. ${x.mot} ${x.b}.` }).correct).toBe(false);
    }
  });

  it('mots qui relient : la classe suit la liste officielle de coordination', () => {
    for (const l of LIENS) {
      expect(l.texte.toLowerCase()).toContain(l.mot);
      expect((COORDINATION as readonly string[]).includes(l.mot), l.mot).toBe(
        l.classe === 'conjonction de coordination',
      );
    }
    for (const q of tirages('fcm2-mots-qui-relient', 2)) expect(bonne(q)).toBe(lienDe(q.prompt).classe);
    for (const q of tirages('fcm2-mots-qui-relient', 3)) {
      expect(check(q, { kind: 'text', text: lienDe(q.prompt).mot }).correct).toBe(true);
    }
    for (const q of tirages('fcm2-mots-qui-relient', 4)) {
      const l = lienDe(q.prompt);
      expect(trous(q)).toEqual([l.mot, l.classe]);
    }
    for (const q of tirages('fcm2-mots-qui-relient', 5)) {
      const attendu = lignes(q).flatMap((ligne) => [lienDe(ligne).mot, lienDe(ligne).classe]);
      expect(trous(q)).toEqual(attendu);
      expect(new Set(attendu.filter((x) => x.startsWith('conjonction'))).size).toBe(2);
    }
  });
});
