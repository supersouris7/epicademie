import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import { PERSONNES } from './present.donnees.ts';
import {
  ER_GER,
  ER_VARIANTES,
  FAITS_PASSE_SIMPLE,
  HUIT_IRREGULIERS,
  IR_DEUXIEME,
  VERBES_IMPARFAIT,
  VERBES_PS,
  VOYELLE_FAUTIVE,
  imparfait,
  passeSimple,
} from './passe-simple.donnees.ts';
import { FCM2_PASSE_SIMPLE, FINALES, modele } from './passe-simple.ts';

const skills = FCM2_PASSE_SIMPLE;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const tirages = (id: string, level: Level) => Array.from({ length: 200 }, (_, seed) => generate(id, level, seed));
const saisie = (q: Question) => {
  if (q.answer.kind !== 'text') throw new Error('forme inattendue');
  return q.answer.accepted[0] ?? '';
};
const juste = (q: Question) => {
  if (q.answer.kind !== 'choice') throw new Error('forme inattendue');
  return q.answer.options[q.answer.correct] ?? '';
};
const TOUTES = VERBES_PS.flatMap((v) => PERSONNES.map((p) => passeSimple(v, p)));

describe('francais cm2 — le passé simple', () => {
  it('le chapitre compte les cinq notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm2-passe-simple-1er-groupe',
      'fcm2-passe-simple-2e-groupe',
      'fcm2-passe-simple-etre-avoir',
      'fcm2-passe-simple-irreguliers',
      'fcm2-passe-simple-ou-imparfait',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    expect(new Set(FAITS_PASSE_SIMPLE.map((f) => f.id)).size).toBe(FAITS_PASSE_SIMPLE.length);
    for (const f of FAITS_PASSE_SIMPLE) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(7);
    }
    for (const s of skills) {
      for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
      for (const term of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(term, SUBJECT_GLOSSARIES.francais ?? []), term).toBe(true);
    }
  });

  it('questions valides et distinctes aux 5 niveaux, au moins deux pièges expliqués', () => {
    for (const s of skills) {
      let niveauxAvecPieges = 0;
      const enonces = new Set<string>();
      for (const level of LEVELS) {
        const qs = tirages(s.id, level);
        expect(validateVariants(qs), `${s.id} N${level}`).toEqual([]);
        if (qs.every((q) => q.traps.length >= 2)) niveauxAvecPieges++;
        enonces.add(qs.map((q) => q.prompt).join('|'));
        for (const q of qs) {
          if (q.answer.kind !== 'text') continue;
          for (const text of q.answer.accepted) expect(check(q, { kind: 'text', text }).correct).toBe(true);
        }
      }
      expect(niveauxAvecPieges, s.id).toBeGreaterThanOrEqual(3);
      expect(enonces.size, s.id).toBe(5);
    }
  });
});

describe('formes du passé simple', () => {
  it('chaque forme relevée suit son modèle de terminaisons (-a, -i, -u, -in)', () => {
    for (const v of VERBES_PS)
      for (const p of PERSONNES)
        expect(passeSimple(v, p), `${v} ${p}`).toMatch(new RegExp(`${FINALES[modele(v)][p]}$`));
    expect(passeSimple('aller', 'ils')).toBe('allèrent');
    expect(passeSimple('venir', 'nous')).toBe('vînmes');
    expect(passeSimple('avoir', 'je')).toBe('eus');
  });

  it('les formes fautives tentantes ne sont jamais une forme juste', () => {
    for (const v of VERBES_PS) for (const f of VOYELLE_FAUTIVE[v]) expect(TOUTES, `${v} ${f}`).not.toContain(f);
  });

  it('passé simple et imparfait ne se confondent jamais', () => {
    for (const v of VERBES_IMPARFAIT)
      for (const p of PERSONNES) expect(imparfait(v, p), `${v} ${p}`).not.toBe(passeSimple(v, p));
  });
});

describe('banques et réponses du passé simple', () => {
  it('-ger et -cer : le e ou la cédille avant a, jamais avant è', () => {
    const vus = new Set<string>();
    for (const q of tirages('fcm2-passe-simple-1er-groupe', 4)) {
      const v = ER_VARIANTES.find((x) => q.prompt.includes(`« ${x} »`));
      if (!v) throw new Error(`verbe inattendu : ${q.prompt}`);
      vus.add(v);
      const mot = saisie(q);
      const ils = mot.endsWith('èrent');
      if (ER_GER.includes(v)) expect(/ge[aâ]/.test(mot), mot).toBe(!ils);
      else expect(/ç[aâ]/.test(mot), mot).toBe(!ils);
      expect(/geè|çè/.test(mot), mot).toBe(false);
      expect(q.traps.length).toBeGreaterThanOrEqual(2);
    }
    expect(vus.size).toBe(ER_VARIANTES.length);
  });

  it('2e groupe : pas de -iss- au passé simple, refusé avec son explication', () => {
    for (const q of tirages('fcm2-passe-simple-2e-groupe', 4)) {
      const mot = saisie(q);
      const v = IR_DEUXIEME.find((x) => q.prompt.includes(`« ${x} »`));
      expect(v, q.prompt).toBeDefined();
      expect(mot).not.toContain('iss');
      if (/(îmes|îtes|irent)$/.test(mot)) {
        const faux = mot.replace(/(îmes|îtes|irent)$/, 'iss$1');
        const r = check(q, { kind: 'text', text: faux });
        expect(r.correct).toBe(false);
        expect(r.why).toContain('-iss-');
      }
    }
  });

  it('être et avoir : niveau 4, association de cinq sujets à cinq formes différentes', () => {
    for (const q of tirages('fcm2-passe-simple-etre-avoir', 4)) {
      if (q.answer.kind !== 'match') throw new Error('forme inattendue');
      expect(q.answer.left).toHaveLength(5);
      expect(new Set(q.answer.right).size).toBe(5);
      if (q.prompt.includes('« avoir »')) expect(q.answer.left).not.toContain('Je');
    }
  });

  it('irréguliers : les huit verbes du programme sont travaillés, accent exigé avec nous et vous', () => {
    const vus = new Set<string>();
    for (const q of tirages('fcm2-passe-simple-irreguliers', 4)) {
      const v = HUIT_IRREGULIERS.find((x) => q.prompt.includes(`« ${x} »`));
      if (!v) throw new Error(`verbe inattendu : ${q.prompt}`);
      vus.add(v);
      const mot = saisie(q);
      expect(mot).toMatch(/[âîû]/);
      expect(
        check(q, { kind: 'text', text: mot.replace(/[âîû]/, (c) => ({ â: 'a', î: 'i', û: 'u' })[c] ?? c) }).correct,
      ).toBe(false);
    }
    expect([...vus].sort()).toEqual([...HUIT_IRREGULIERS].sort());
  });

  it('passé simple ou imparfait : la réponse suit la marque de temps', () => {
    const imparfaits = new Set(VERBES_IMPARFAIT.flatMap((v) => PERSONNES.map((p) => imparfait(v, p))));
    const estImparfait = (texte: string) => texte.split(/[\s’.«»]+/).some((m) => imparfaits.has(m));
    for (const q of tirages('fcm2-passe-simple-ou-imparfait', 1))
      expect(juste(q), q.prompt).toBe(estImparfait(q.prompt) ? 'imparfait' : 'passé simple');
    for (const q of tirages('fcm2-passe-simple-ou-imparfait', 5)) {
      if (q.answer.kind !== 'cloze') throw new Error('forme inattendue');
      const reponses = q.answer.blanks.map((b) => (b.mode === 'list' ? b.options[b.correct] : ''));
      expect(reponses).toContain('passé simple');
      expect(reponses).toContain('imparfait');
      q.answer.parts.slice(0, -1).forEach((part, i) => {
        const f = /« (.+) »/.exec(part)?.[1] ?? '';
        expect(reponses[i], f).toBe(imparfaits.has(f) ? 'imparfait' : 'passé simple');
      });
    }
  });
});
