import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import { PERSONNES, forme } from './present.donnees.ts';
import { IRREGULIERS_CITES, REGULIERS, conjugue, participe } from './temps.donnees.ts';
import {
  FAITS_TEMPS_COMPOSES,
  FORMES_A_RATTACHER,
  VERBES_1,
  VERBES_3,
  conjugue1,
  conjugue3,
  plusQueParfait,
} from './temps-composes.donnees.ts';
import { FCM2_TEMPS_COMPOSES, decoupe } from './temps-composes.ts';

const skills = FCM2_TEMPS_COMPOSES;
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

describe('francais cm2 — les temps composés', () => {
  it('le chapitre compte les cinq notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm2-plus-que-parfait',
      'fcm2-passe-compose-ou-plus-que-parfait',
      'fcm2-temps-composes-negatifs',
      'fcm2-marques-temps-personne',
      'fcm2-variations-radical',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    expect(new Set(FAITS_TEMPS_COMPOSES.map((f) => f.id)).size).toBe(FAITS_TEMPS_COMPOSES.length);
    for (const f of FAITS_TEMPS_COMPOSES) {
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

describe('formes des temps composés', () => {
  it('plus-que-parfait : auxiliaire à l’imparfait + participe passé (relevés du CNRTL)', () => {
    const il = { texte: 'il', personne: 'il' as const, genre: 'm' as const };
    const ils = { texte: 'ils', personne: 'ils' as const, genre: 'm' as const };
    expect(plusQueParfait('chanter', il)).toBe('avait chanté');
    expect(plusQueParfait('venir', ils)).toBe('étaient venus');
    expect(plusQueParfait('prendre', ils)).toBe('avaient pris');
    for (const v of [...REGULIERS, ...IRREGULIERS_CITES])
      expect(plusQueParfait(v, il).endsWith(` ${participe(v)}`), v).toBe(true);
  });

  it('marques : chaque forme se découpe en radical + marque de temps + marque de personne', () => {
    for (const v of [...REGULIERS, ...IRREGULIERS_CITES])
      for (const p of PERSONNES) {
        const d = decoupe('imparfait', v, p);
        expect(`${d.radical}${d.temps}${d.personne}`, `${v} ${p}`).toBe(conjugue('imparfait', v, p));
        expect(d.radical.length, `${v} ${p}`).toBeGreaterThan(0);
        const f = decoupe('futur', v, p);
        expect(f.forme.endsWith(`r${f.personne}`), `${v} ${p}`).toBe(true);
      }
    expect(decoupe('imparfait', 'chanter', 'ils')).toMatchObject({ radical: 'chant', temps: 'ai', personne: 'ent' });
    expect(decoupe('imparfait', 'voir', 'nous')).toMatchObject({ radical: 'voy', temps: 'i', personne: 'ons' });
  });

  it('variations du radical : le 1er groupe change devant un e muet, a ou o', () => {
    expect(conjugue1('futur', 'appeler', 'nous')).toBe('appellerons');
    expect(conjugue1('futur', 'acheter', 'ils')).toBe('achèteront');
    expect(conjugue1('futur', 'nettoyer', 'je')).toBe('nettoierai');
    expect(conjugue1('imparfait', 'lancer', 'il')).toBe('lançait');
    expect(conjugue1('imparfait', 'nager', 'nous')).toBe('nagions');
    for (const v of VERBES_1)
      for (const p of PERSONNES) expect(conjugue1('futur', v, p)).toMatch(/r(ai|as|a|ons|ez|ont)$/);
  });

  it('formes à rattacher : jamais une forme d’un des infinitifs proposés à tort', () => {
    for (const x of FORMES_A_RATTACHER) {
      expect(VERBES_3).toContain(x.v);
      expect(x.faux).not.toContain(x.v);
      expect(conjugue3(x.t, x.v, x.p).length).toBeGreaterThan(1);
    }
  });
});

describe('banques et réponses des temps composés', () => {
  it('plus-que-parfait, niveau 3 : la réponse a deux mots, auxiliaire à l’imparfait', () => {
    for (const q of tirages('fcm2-plus-que-parfait', 3))
      expect(saisie(q)).toMatch(/^(avais|avait|avions|aviez|avaient) \S+$/);
  });

  it('passé composé ou plus-que-parfait, niveau 1 : la réponse suit le temps de l’auxiliaire', () => {
    for (const q of tirages('fcm2-passe-compose-ou-plus-que-parfait', 1)) {
      const pqp = /\b(avais|avait|avions|aviez|avaient)\b/.test(q.prompt);
      expect(juste(q), q.prompt).toBe(pqp ? 'plus-que-parfait' : 'passé composé');
    }
  });

  it('forme négative : ne (ou n’) et l’adverbe encadrent l’auxiliaire', () => {
    for (const level of [3, 4] as const)
      for (const q of tirages('fcm2-temps-composes-negatifs', level)) {
        const mot = saisie(q);
        expect(mot, q.prompt).toMatch(/^(ne |n’)\S+ (pas|jamais|plus) \S+$/);
        const [aux = ''] = mot.replace(/^ne |^n’/, '').split(' ');
        expect(mot.startsWith('n’'), mot).toBe(/^[aeéêiouh]/.test(aux));
      }
  });

  it('variations du radical, niveau 4 : la réponse est la forme relevée du verbe', () => {
    for (const q of tirages('fcm2-variations-radical', 4)) {
      const v = VERBES_3.find((x) => q.prompt.includes(`« ${x} »`));
      expect(v, q.prompt).toBeDefined();
      expect(saisie(q)).not.toBe(v);
    }
  });

  it('variations du radical, niveau 3 : le présent n’est jamais accepté à la place', () => {
    for (const q of tirages('fcm2-variations-radical', 3)) {
      const v = VERBES_1.find((x) => q.prompt.includes(`« ${x} »`));
      if (!v) throw new Error(`verbe inattendu : ${q.prompt}`);
      for (const p of PERSONNES) {
        const pr = forme(v, p);
        if (pr !== saisie(q)) expect(check(q, { kind: 'text', text: pr }).correct).toBe(false);
      }
    }
  });
});
