import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import {
  COMPLEMENTS,
  FAITS_ACCORDS_6E,
  GROUPES_ETENDUS,
  INDIRECTS,
  PHRASES_PIEGES,
  PHRASES_SUJET,
  SUJETS_CHOIX,
  SUJETS_ELOIGNES,
  SUJETS_INVERSES,
  TRANSFORMATIONS,
  accordeAvoir,
  textePhrase,
  verbeFaux,
  verbeJuste,
} from './accords-6e.donnees.ts';
import { F6_ACCORDS } from './accords-6e.ts';

const skills = F6_ACCORDS;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const tirages = (id: string, level: Level) => Array.from({ length: 300 }, (_, seed) => generate(id, level, seed));
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

/** Marques attendues, recalculées ici sans passer par les fonctions du chapitre. */
const marques = (participe: string, genre: 'm' | 'f', nombre: 'sg' | 'pl') => {
  const f = genre === 'f' ? `${participe}e` : participe;
  return nombre === 'pl' && !f.endsWith('s') ? `${f}s` : f;
};

describe('francais 6e — les accords', () => {
  it('le chapitre compte les quatre notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'f6-chaine-accord-gn',
      'f6-accord-sujet-verbe',
      'f6-participe-etre',
      'f6-participe-avoir-cod',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    expect(new Set(FAITS_ACCORDS_6E.map((f) => f.id)).size).toBe(FAITS_ACCORDS_6E.length);
    for (const f of FAITS_ACCORDS_6E) {
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
      }
      expect(niveauxAvecPieges, s.id).toBeGreaterThanOrEqual(2);
      expect(enonces.size, s.id).toBe(5);
    }
  });
});

describe('banques et réponses des accords de 6e', () => {
  it('groupe nominal : le complément diffère du noyau en genre ou en nombre', () => {
    for (const q of tirages('f6-chaine-accord-gn', 2)) {
      const x = GROUPES_ETENDUS.find((g) => q.prompt.startsWith(`« ${g.debut},`));
      expect(juste(q)).toBe(x?.noyau);
      if (q.answer.kind === 'choice') expect(q.answer.options).toHaveLength(4);
    }
    for (const q of tirages('f6-chaine-accord-gn', 5))
      expect(trous(q)).toEqual(
        lignes(q).map((l) => {
          const x = GROUPES_ETENDUS.find((g) => l.startsWith(`${g.debut},`));
          if (!x) throw new Error(`ligne inconnue : ${l}`);
          const base = x.adjectif.m[0];
          const [m, f] = [x.adjectif[x.genre][0], x.adjectif[x.genre][1]];
          expect(l).toContain(`(${base})`);
          return x.nombre === 'sg' ? m : f;
        }),
      );
  });

  it('groupe nominal, niveau 4 : les trois mots sont attendus, la forme de départ est refusée', () => {
    for (const q of tirages('f6-chaine-accord-gn', 4)) {
      const t = TRANSFORMATIONS.find((x) => q.prompt.includes(`« ${x.depart.join(' ')} » ${x.consigne}`));
      if (!t) throw new Error(`question inconnue : ${q.prompt}`);
      expect(trous(q)).toEqual(t.arrivee);
      expect(check(q, { kind: 'cloze', answers: [...t.depart] }).correct).toBe(false);
    }
    expect(TRANSFORMATIONS.find((t) => t.depart[1] === 'cheval')?.arrivee).toEqual(['des', 'chevaux', 'vifs']);
    expect(TRANSFORMATIONS.find((t) => t.depart[1] === 'chien')?.arrivee).toEqual(['une', 'chienne', 'vive']);
  });

  it('sujet-verbe : le pronom suit le groupe sujet, la forme fautive est refusée', () => {
    for (const p of PHRASES_SUJET) {
      expect(p.groupeSujet, p.noyau).toContain(p.noyau);
      expect(textePhrase(p, verbeJuste(p))).toContain(p.groupeSujet);
      expect(verbeJuste(p).endsWith('ent'), `${p.noyau} ${verbeJuste(p)}`).toBe(p.pronom.endsWith('s'));
    }
    for (const level of [3, 4] as const)
      for (const q of tirages('f6-accord-sujet-verbe', level)) {
        const p = PHRASES_SUJET.find((x) => q.prompt.includes(`« ${textePhrase(x, '…')} »`));
        if (!p) throw new Error(`phrase inconnue : ${q.prompt}`);
        expect(p.temps).toBe('présent');
        expect(PHRASES_PIEGES.includes(p)).toBe(level === 4);
        expect(saisie(q)).toBe(verbeJuste(p));
        expect(check(q, { kind: 'text', text: verbeFaux(p) }).correct).toBe(false);
      }
    for (const q of tirages('f6-accord-sujet-verbe', 5))
      expect(trous(q)).toEqual(
        lignes(q).map((l) => {
          const p = PHRASES_SUJET.find((x) => textePhrase(x, verbeFaux(x)) === l);
          if (!p) throw new Error(`ligne inconnue : ${l}`);
          expect(p.temps).toBe('imparfait');
          return verbeJuste(p);
        }),
      );
  });

  it('être : un seul des quatre sujets convient au niveau 2', () => {
    for (const q of tirages('f6-participe-etre', 2)) {
      if (q.answer.kind !== 'choice') throw new Error('forme inattendue');
      const serie = SUJETS_CHOIX.find((s) => s.includes(juste(q)));
      expect([...q.answer.options].sort()).toEqual([...(serie ?? [])].sort());
      const i = serie?.indexOf(juste(q)) ?? -1;
      const [, aux = '', participe = ''] = /… (\S+) (\S+)/.exec(q.prompt) ?? [];
      expect(/(sont|étaient)/.test(aux)).toBe(i >= 2);
      expect(participe.replace(/s$/, '').endsWith('e')).toBe(i % 2 === 1);
    }
  });

  it('être : le participe suit le sujet, éloigné ou placé après', () => {
    const sujets = [...SUJETS_ELOIGNES, ...SUJETS_INVERSES];
    for (const q of tirages('f6-participe-etre', 4)) {
      const s = sujets.find((x) => q.prompt.includes(` ${x.texte}.`) || q.prompt.includes(`« ${x.texte} `));
      if (!s) throw new Error(`question inconnue : ${q.prompt}`);
      const mot = saisie(q);
      expect(mot.endsWith('s'), q.prompt).toBe(s.nombre === 'pl');
      expect(mot.replace(/s$/, '').endsWith('e'), q.prompt).toBe(s.genre === 'f');
    }
    for (const q of tirages('f6-participe-etre', 5)) {
      const reponses = trous(q);
      lignes(q).forEach((l, i) => {
        const s = sujets.find((x) => l.startsWith(`${x.texte} `) || l.endsWith(` ${x.texte}.`));
        if (!s) throw new Error(`ligne inconnue : ${l}`);
        const pqp = l.includes('plus-que-parfait');
        const aux = pqp ? ['était', 'étaient'] : ['est', 'sont'];
        expect(reponses[2 * i]).toBe(aux[s.nombre === 'sg' ? 0 : 1]);
        expect(reponses[2 * i + 1]?.endsWith('s')).toBe(s.nombre === 'pl');
      });
    }
  });

  it('avoir : « pris » ne prend pas de second s ; accord seulement si le COD est avant', () => {
    expect(accordeAvoir('pris', 'm', 'pl')).toBe('pris');
    expect(accordeAvoir('pris', 'f', 'pl')).toBe('prises');
    expect(accordeAvoir('fait', 'm', 'pl')).toBe('faits');
    for (const level of [3, 4] as const)
      for (const q of tirages('f6-participe-avoir-cod', level)) {
        const indirect = INDIRECTS.find((x) => q.prompt.includes(`${x.pronom} `) && q.prompt.includes(x.suite));
        const x = COMPLEMENTS.find(
          (c) =>
            q.prompt.includes(`de « ${c.verbe.infinitif} »`) && q.prompt.toLowerCase().includes(c.cod.toLowerCase()),
        );
        if (indirect && !x) {
          expect(saisie(q)).toBe(indirect.verbe.participe);
          continue;
        }
        if (!x) throw new Error(`question inconnue : ${q.prompt}`);
        const avant = q.prompt.toLowerCase().includes(`« ${x.cod} ?`);
        expect(saisie(q), q.prompt).toBe(avant ? marques(x.verbe.participe, x.genre, x.nombre) : x.verbe.participe);
      }
    for (const q of tirages('f6-participe-avoir-cod', 5)) {
      const reponses = trous(q);
      lignes(q)
        .slice(0, -1)
        .forEach((l, i) => {
          const c = COMPLEMENTS.find((y) => l.toLowerCase().includes(y.cod) && l.includes(`(${y.verbe.infinitif})`));
          if (c) {
            const avant = l.toLowerCase().startsWith(`${c.cod} ?`);
            expect(reponses[i]).toBe(avant ? marques(c.verbe.participe, c.genre, c.nombre) : c.verbe.participe);
          } else {
            const ind = INDIRECTS.find((y) => l.includes(`(${y.verbe.infinitif})`));
            expect(reponses[i]).toBe(ind?.verbe.participe);
          }
        });
      expect(reponses.at(-1)).toMatch(/(é|i|u)e?s?$/);
    }
  });
});
