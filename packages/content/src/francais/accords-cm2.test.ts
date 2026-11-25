import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import { SUJETS_PARTICIPE, SUJETS_PARTICIPE_PIEGES } from './accords.donnees.ts';
import {
  ADJ_REGULIERS,
  ATTRIBUTS_ELOIGNES,
  ELOIGNES,
  FAITS_ACCORDS_CM2,
  FEMININS_COURANTS,
  FEMININS_RARES,
  INVERSES_PIEGES,
  INVERSES_SIMPLES,
  OBJETS_AVOIR,
  PHRASES_FORMES,
  PLURIELS_COURANTS,
  PLURIELS_RARES,
  forme,
  formeParticuliere,
  textePhrase,
  verbeFaux,
  verbeJuste,
} from './accords-cm2.donnees.ts';
import { FCM2_ACCORDS } from './accords-cm2.ts';

const skills = FCM2_ACCORDS;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const tirages = (id: string, level: Level) => Array.from({ length: 200 }, (_, seed) => generate(id, level, seed));
const trous = (q: Question) => {
  if (q.answer.kind !== 'cloze') throw new Error('forme inattendue');
  return q.answer.blanks.map((b) => (b.mode === 'text' ? (b.accepted[0] ?? '') : ''));
};
const lignes = (q: Question) => {
  if (q.figure?.kind !== 'document') throw new Error('forme inattendue');
  return q.figure.lines;
};
const saisie = (q: Question) => {
  if (q.answer.kind !== 'text') throw new Error('forme inattendue');
  return q.answer.accepted[0] ?? '';
};
const juste = (q: Question) => {
  if (q.answer.kind !== 'choice') throw new Error('forme inattendue');
  return q.answer.options[q.answer.correct] ?? '';
};
const PHRASES = [...INVERSES_SIMPLES, ...INVERSES_PIEGES, ...ELOIGNES];

describe('francais cm2 — les accords', () => {
  it('le chapitre compte les cinq notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm2-accord-sujet-verbe',
      'fcm2-accord-attribut',
      'fcm2-participe-etre',
      'fcm2-participe-avoir-cod',
      'fcm2-pluriels-feminins',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    expect(new Set(FAITS_ACCORDS_CM2.map((f) => f.id)).size).toBe(FAITS_ACCORDS_CM2.length);
    for (const f of FAITS_ACCORDS_CM2) {
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

describe('banques et réponses des accords du CM2', () => {
  it('sujet-verbe : la forme suit le nom noyau, et un autre nom ne commande jamais', () => {
    for (const p of PHRASES) expect(p.autres, p.noyau).not.toContain(p.noyau);
    for (const level of [3, 4] as const)
      for (const q of tirages('fcm2-accord-sujet-verbe', level)) {
        const p = PHRASES.find((x) => q.prompt.includes(`« ${x.avant} … ${x.apres}. »`));
        if (!p) throw new Error(`phrase inconnue : ${q.prompt}`);
        expect(saisie(q)).toBe(verbeJuste(p));
        expect(check(q, { kind: 'text', text: verbeFaux(p) }).correct).toBe(false);
      }
    for (const q of tirages('fcm2-accord-sujet-verbe', 5))
      expect(trous(q)).toEqual(
        lignes(q).map((l) => {
          const p = PHRASES.find((x) => textePhrase(x, verbeFaux(x)) === l);
          return p && verbeJuste(p);
        }),
      );
  });

  it('attribut : l’adjectif suit le nom noyau du sujet', () => {
    expect(forme(ADJ_REGULIERS.lourd, 'f', 'pl')).toBe('lourdes');
    for (const q of tirages('fcm2-accord-attribut', 4)) {
      const x = ATTRIBUTS_ELOIGNES.find((y) => q.prompt.includes(`« ${y.texte} `));
      if (!x) throw new Error('forme inattendue');
      expect(saisie(q)).toBe(forme(x.adjectif, x.genre, x.nombre));
    }
    for (const q of tirages('fcm2-accord-attribut', 5))
      expect(trous(q)).toEqual(
        lignes(q).flatMap((l) => {
          const x = ATTRIBUTS_ELOIGNES.find((y) => l.startsWith(`${y.texte} `));
          if (!x) throw new Error(`ligne inconnue : ${l}`);
          const i = x.nombre === 'sg' ? 0 : 1;
          return [x.verbe.formes[i], forme(x.adjectif, x.genre, x.nombre)];
        }),
      );
  });

  it('attribut, niveau 5 : « paraît » et « parait » sont acceptés, « paraissent » ne change pas', () => {
    const vus = new Set<string>();
    for (const q of tirages('fcm2-accord-attribut', 5)) {
      if (q.answer.kind !== 'cloze') throw new Error('forme inattendue');
      for (const b of q.answer.blanks) {
        if (b.mode !== 'text') throw new Error('forme inattendue');
        const [mot = ''] = b.accepted;
        if (mot !== 'paraît' && mot !== 'paraissent') continue;
        vus.add(mot);
        expect(b.accepted).toEqual(mot === 'paraît' ? ['paraît', 'parait'] : ['paraissent']);
      }
      const valeurs = trous(q).map((v) => (v === 'paraît' ? 'parait' : v));
      expect(check(q, { kind: 'cloze', answers: valeurs }).correct).toBe(true);
    }
    expect([...vus].sort()).toEqual(['paraissent', 'paraît']);
  });

  it('féminins, niveau 2 : un choix entre écritures proches d’un même mot courant', () => {
    const vus = new Set<string>();
    for (const q of tirages('fcm2-pluriels-feminins', 2)) {
      const base = /le féminin de « (.+) »/.exec(q.prompt)?.[1] ?? '';
      const f = FEMININS_COURANTS.find((x) => x.base === base);
      if (!f || q.answer.kind !== 'choice') throw new Error(`question inattendue : ${q.prompt}`);
      vus.add(base);
      expect(juste(q)).toBe(f.forme);
      expect([...q.answer.options].sort()).toEqual([f.forme, f.faux, f.base].sort());
      expect(q.traps).toHaveLength(2);
    }
    expect(vus.size).toBe(FEMININS_COURANTS.length);
  });

  it('être : le participe porte les marques du sujet', () => {
    for (const q of tirages('fcm2-participe-etre', 3)) {
      const s = SUJETS_PARTICIPE.find((x) => q.prompt.includes(`« ${x.texte} `));
      if (!s) throw new Error('forme inattendue');
      const mot = saisie(q);
      expect(mot.endsWith('s')).toBe(s.nombre === 'pl');
      expect(mot.replace(/s$/, '').endsWith('e')).toBe(s.genre === 'f');
    }
    for (const q of tirages('fcm2-participe-etre', 5)) {
      const reponses = trous(q);
      lignes(q).forEach((l, i) => {
        const s = SUJETS_PARTICIPE_PIEGES.find((x) => l.startsWith(`${x.texte} `));
        if (s) expect(reponses[2 * i]).toBe(s.nombre === 'pl' ? 'étaient' : 'était');
        expect(['était', 'étaient']).toContain(reponses[2 * i]);
        expect(reponses[2 * i + 1]?.endsWith('s')).toBe(reponses[2 * i] === 'étaient');
      });
    }
  });

  it('avoir : accord avec le COD placé avant, jamais avec le COD placé après', () => {
    const accord = (x: (typeof OBJETS_AVOIR)[number]) =>
      `${x.participe}${x.genre === 'f' ? 'e' : ''}${x.nombre === 'pl' ? 's' : ''}`;
    for (const level of [3, 4] as const)
      for (const q of tirages('fcm2-participe-avoir-cod', level)) {
        const x = OBJETS_AVOIR.find(
          (y) => q.prompt.includes(`de « ${y.infinitif} »`) && q.prompt.toLowerCase().includes(y.cod),
        );
        if (!x) throw new Error(`question inconnue : ${q.prompt}`);
        const placeAvant = q.prompt.toLowerCase().includes(`« ${x.cod},`);
        expect(saisie(q), q.prompt).toBe(placeAvant ? accord(x) : x.participe);
      }
    for (const q of tirages('fcm2-participe-avoir-cod', 2)) {
      const x = OBJETS_AVOIR.find((y) => q.prompt.includes(`« ${y.cod} »`) && juste(q).includes(accord(y).slice(0, 2)));
      expect(x, q.prompt).toBeDefined();
    }
    for (const q of tirages('fcm2-participe-avoir-cod', 5)) {
      const reponses = trous(q);
      const attendu = lignes(q)
        .slice(0, -1)
        .map((l) => {
          const x = OBJETS_AVOIR.find((y) => l.toLowerCase().includes(y.cod) && l.includes(`(${y.infinitif})`));
          if (!x) throw new Error(`ligne inconnue : ${l}`);
          return l.toLowerCase().startsWith(`${x.cod},`) ? accord(x) : x.participe;
        });
      expect(reponses.slice(0, -1)).toEqual(attendu);
      expect(reponses.at(-1)).toMatch(/^parti/);
    }
  });

  it('pluriels et féminins : formes attestées, erreur tentante refusée', () => {
    const toutes = [...PLURIELS_COURANTS, ...PLURIELS_RARES, ...FEMININS_COURANTS, ...FEMININS_RARES];
    expect(new Set(toutes.map((f) => f.base)).size).toBe(toutes.length);
    for (const f of toutes) expect(f.faux, f.base).not.toBe(f.forme);
    for (const p of PHRASES_FORMES) expect(() => formeParticuliere(p.base)).not.toThrow();
    for (const level of [3, 4] as const)
      for (const q of tirages('fcm2-pluriels-feminins', level)) {
        const base = /le mot « (.+) »/.exec(q.prompt)?.[1] ?? '';
        const f = formeParticuliere(base);
        expect(saisie(q)).toBe(f.forme);
        expect(check(q, { kind: 'text', text: f.faux }).correct).toBe(false);
      }
    const fraiche = tirages('fcm2-pluriels-feminins', 4).find((q) => q.prompt.includes('« frais »'));
    if (!fraiche) throw new Error('« frais » jamais tiré');
    expect(check(fraiche, { kind: 'text', text: 'fraiche' }).correct).toBe(true);
  });
});
