import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import {
  COORDINATION_6E,
  COORDONNEES,
  DOUBLES,
  ELLIPSES,
  FAITS_PHRASE_COMPLEXE_6E,
  JUXTAPOSEES,
  MIXTES,
  SIMPLES,
  SUB_DEBUT,
  SUB_FIN,
  SUBORDINATION_6E,
  classeDe,
  subTexte,
  texteCoord,
  texteJuxta,
  texteSubord,
} from './phrase-complexe-6e.donnees.ts';
import { F6_PHRASE_COMPLEXE } from './phrase-complexe-6e.ts';

const skills = F6_PHRASE_COMPLEXE;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const tirages = (id: string, level: Level) => Array.from({ length: 200 }, (_, seed) => generate(id, level, seed));

const SUBORDS = [...SUB_FIN, ...SUB_DEBUT];
const modeDe = (texte: string) => {
  if (JUXTAPOSEES.some((j) => texteJuxta(j) === texte)) return 'juxtaposition';
  if (COORDONNEES.some((c) => texteCoord(c) === texte)) return 'coordination';
  if (SUBORDS.some((x) => texteSubord(x) === texte)) return 'subordination';
  if (SIMPLES.some((s) => s.texte === texte)) return 'phrase simple';
  throw new Error(`phrase inconnue : ${texte}`);
};
const COMPLEXES = new Map<string, number>([
  ...[...JUXTAPOSEES.map(texteJuxta), ...COORDONNEES.map(texteCoord), ...SUBORDS.map(texteSubord)].map(
    (t) => [t, 2] as const,
  ),
  ...ELLIPSES.map((e) => [e.texte, e.verbes.length] as const),
]);
const nbProps = (texte: string) => {
  if (SIMPLES.some((s) => s.texte === texte)) return 1;
  const n = COMPLEXES.get(texte);
  if (!n) throw new Error(`phrase inconnue : ${texte}`);
  return n;
};
const citee = (q: Question) => /« (.+) »/.exec(q.prompt)?.[1] ?? '';
const lignes = (q: Question) => {
  if (q.figure?.kind !== 'document') throw new Error('forme inattendue');
  return q.figure.lines;
};
const trous = (q: Question) => {
  if (q.answer.kind !== 'cloze') throw new Error('forme inattendue');
  return q.answer.blanks.map((b) => (b.mode === 'text' ? (b.accepted[0] ?? '') : (b.options[b.correct] ?? '')));
};
const options = (q: Question) => {
  if (q.answer.kind !== 'choice') throw new Error('forme inattendue');
  return { toutes: q.answer.options, bonne: q.answer.options[q.answer.correct] ?? '' };
};

describe('francais 6e — la phrase complexe', () => {
  it('le chapitre compte les six notions du référentiel, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'f6-proposition',
      'f6-phrase-simple-complexe',
      'f6-juxtaposition',
      'f6-coordination',
      'f6-subordination',
      'f6-conjonctions',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    for (const f of FAITS_PHRASE_COMPLEXE_6E) expect(getSource(f.source), f.id).toBeDefined();
    for (const s of skills) {
      for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
      for (const term of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(term, SUBJECT_GLOSSARIES.francais ?? []), term).toBe(true);
    }
  });

  it('questions valides et variées aux 5 niveaux, au moins deux pièges expliqués', () => {
    for (const s of skills) {
      let niveauxAvecPieges = 0;
      for (const level of LEVELS) {
        const qs = tirages(s.id, level);
        expect(validateVariants(qs), `${s.id} N${level}`).toEqual([]);
        expect(new Set(qs.map((q) => JSON.stringify([q.prompt, q.figure, q.answer]))).size).toBeGreaterThan(3);
        if (qs.every((q) => q.traps.length >= 2)) niveauxAvecPieges++;
      }
      expect(niveauxAvecPieges, s.id).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('banques et réponses de la phrase complexe (6e)', () => {
  it('chaque verbe annoncé figure dans sa phrase ; les conjonctions sont celles annoncées', () => {
    for (const e of ELLIPSES) for (const v of e.verbes) expect(e.texte).toContain(v);
    for (const s of SIMPLES) expect(s.texte).toContain(s.verbe);
    for (const d of DOUBLES) {
      expect(d.texte).toContain(` ${d.noms} `);
      expect(d.texte).toContain(` ${d.props} `);
      expect(d.texte).toContain(d.verbe2);
      expect(d.texte.indexOf(` ${d.noms} `) < d.texte.indexOf(` ${d.props} `), d.texte).toBe(d.nomsDabord);
    }
    for (const m of MIXTES) {
      for (const mot of [m.subordination, m.coordination]) expect(m.texte.toLowerCase()).toContain(mot);
      expect(classeDe(m.subordination)).toBe('conjonction de subordination');
      expect(classeDe(m.coordination)).toBe('conjonction de coordination');
    }
    for (const c of COORDONNEES) expect(COORDINATION_6E).toContain(c.mot);
    for (const x of SUBORDS) expect(SUBORDINATION_6E).toContain(x.mot);
    expect(classeDe('donc')).toBe('adverbe');
  });

  it('proposition : nombre de propositions et sujet commun exacts', () => {
    for (const q of tirages('f6-proposition', 4))
      expect(check(q, { kind: 'number', text: String(nbProps(citee(q))) }).correct).toBe(true);
    for (const q of tirages('f6-proposition', 5)) {
      const n = lignes(q).map((l) => String(nbProps(l)));
      expect(trous(q).slice(0, 3)).toEqual(n);
      const i = Number(/ligne (\d)\./.exec(q.prompt)?.[1]) - 1;
      expect(ELLIPSES.find((e) => e.texte === lignes(q)[i])?.sujet).toBe(trous(q)[3]);
    }
  });

  it('simple ou complexe : la réponse suit le nombre de propositions', () => {
    for (const level of [1, 2] as const)
      for (const q of tirages('f6-phrase-simple-complexe', level)) {
        const complexe = q.prompt.includes('complexe');
        const { toutes, bonne } = options(q);
        for (const o of toutes) expect(nbProps(o) > 1 === complexe, o).toBe(o === bonne);
      }
    for (const q of tirages('f6-phrase-simple-complexe', 3)) {
      const n = nbProps(citee(q));
      expect(trous(q)).toEqual([String(n), n > 1 ? 'complexe' : 'simple']);
    }
    for (const q of tirages('f6-phrase-simple-complexe', 4))
      expect(check(q, { kind: 'number', text: String(nbProps(citee(q))) }).correct).toBe(true);
    for (const q of tirages('f6-phrase-simple-complexe', 5)) {
      const n = lignes(q).map(nbProps);
      expect(trous(q)).toEqual([
        ...n.map((x) => (x > 1 ? 'complexe' : 'simple')),
        String(n.reduce((a, b) => a + b, 0)),
      ]);
    }
  });

  it('les QCM de mode ont une seule phrase du mode demandé', () => {
    const cas = [
      ['f6-juxtaposition', 'juxtaposition'],
      ['f6-coordination', 'coordination'],
    ] as const;
    for (const [id, mode] of cas)
      for (const level of [1, 2] as const)
        for (const q of tirages(id, level)) {
          const { toutes, bonne } = options(q);
          for (const o of toutes) expect(modeDe(o) === mode, o).toBe(o === bonne);
        }
    for (const q of tirages('f6-subordination', 1)) {
      const { toutes, bonne } = options(q);
      for (const o of toutes) expect(modeDe(o) === 'subordination', o).toBe(o === bonne);
    }
    for (const q of tirages('f6-juxtaposition', 5)) expect(trous(q)).toEqual(lignes(q).map(modeDe));
    for (const q of tirages('f6-subordination', 5)) expect(trous(q).slice(0, 3)).toEqual(lignes(q).map(modeDe));
  });

  it('juxtaposition : la réécriture au point-virgule passe, la conjonction conservée échoue', () => {
    for (const q of tirages('f6-juxtaposition', 4)) {
      const c = COORDONNEES.find((x) => texteCoord(x) === citee(q));
      if (!c || q.answer.kind !== 'text') throw new Error('forme inattendue');
      const bon = q.answer.accepted[0] ?? '';
      expect(check(q, { kind: 'text', text: bon.replace(' ;', ';') }).correct).toBe(true);
      expect(check(q, { kind: 'text', text: bon.replace('; ', `; ${c.mot} `) }).correct).toBe(false);
    }
  });

  it('subordination : subordonnée et principale distinguées', () => {
    for (const q of tirages('f6-subordination', 2)) {
      const x = SUB_FIN.find((y) => texteSubord(y) === citee(q));
      expect(options(q).bonne).toBe(x && subTexte(x));
    }
    for (const q of tirages('f6-subordination', 4)) {
      const x = SUB_DEBUT.find((y) => texteSubord(y) === citee(q));
      if (!x) throw new Error('phrase inconnue');
      expect(check(q, { kind: 'text', text: subTexte(x) }).correct).toBe(false);
    }
  });

  it('verbe pronominal accepté avec ou sans pronom', () => {
    const q = tirages('f6-juxtaposition', 3).find((x) => trous(x)[1]?.startsWith('se '));
    if (q?.answer.kind !== 'cloze') throw new Error('aucun verbe pronominal');
    const [signe = '', verbe = ''] = trous(q);
    for (const v of [verbe, verbe.slice(3)])
      expect(check(q, { kind: 'cloze', answers: [signe, v] }).correct).toBe(true);
  });

  it('coordination : ce que relie chaque conjonction suit l’ordre de la phrase', () => {
    for (const q of tirages('f6-coordination', 4)) {
      const d = DOUBLES.find((x) => x.texte === citee(q));
      expect(trous(q)).toEqual(d?.nomsDabord ? ['deux mots', 'deux propositions'] : ['deux propositions', 'deux mots']);
    }
  });
});
