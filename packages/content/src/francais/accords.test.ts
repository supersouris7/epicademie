import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import {
  ADJECTIFS_ANIMES,
  FAITS_ACCORDS,
  FEMININS,
  NOMS_ANIMES,
  PHRASES_PLURIEL,
  PLURIELS_ALS,
  PLURIELS_AUX,
  PLURIELS_EAU,
  PLURIELS_OU_S,
  PLURIELS_OU_X,
  SUJETS_PIEGES,
  VERBES_ER,
  accorderParticipe,
  conjuguer,
  faitAccord,
} from './accords.donnees.ts';
import { FCM1_ACCORDS } from './accords.ts';

const skills = FCM1_ACCORDS;
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

describe('francais cm1 — les accords', () => {
  it('le chapitre compte les six notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm1-genre-nombre',
      'fcm1-pluriels',
      'fcm1-feminin',
      'fcm1-accord-gn',
      'fcm1-accord-sujet-verbe',
      'fcm1-participe-etre',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    expect(new Set(FAITS_ACCORDS.map((f) => f.id)).size).toBe(FAITS_ACCORDS.length);
    for (const f of FAITS_ACCORDS) {
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
        if (qs.some((q) => q.traps.length >= 2)) niveauxAvecPieges++;
        enonces.add(qs.map((q) => q.prompt).join('|'));
      }
      expect(niveauxAvecPieges, s.id).toBeGreaterThanOrEqual(3);
      expect(enonces.size, s.id).toBe(5);
    }
  });
});

describe('banques de mots et de phrases des accords', () => {
  it('chaque pluriel irrégulier est attesté par sa citation', () => {
    for (const p of [...PLURIELS_EAU, ...PLURIELS_AUX, ...PLURIELS_ALS]) {
      expect(faitAccord(p.fait).citation.toLowerCase(), p.s).toContain(p.p);
    }
    for (const p of PLURIELS_OU_X) expect(faitAccord(p.fait).citation).toContain(p.s);
    for (const p of PLURIELS_OU_S) expect(faitAccord('serie-ou').citation).not.toContain(p.s);
    for (const p of PLURIELS_AUX) expect(p.p).toBe(`${p.s.slice(0, -2)}aux`);
    for (const p of PLURIELS_ALS) expect(p.p).toBe(`${p.s}s`);
  });

  it('chaque féminin est attesté par sa citation (forme entière ou suffixe)', () => {
    for (const f of FEMININS) {
      const citation = faitAccord(f.fait).citation.toLowerCase();
      const suffixes = [...citation.matchAll(/(?:-|, )([a-zà-ü]+)/g)].map((m) => m[1] ?? '');
      expect(citation.includes(f.f) || suffixes.some((x) => f.f.endsWith(x)), `${f.m} → ${f.f} : ${citation}`).toBe(
        true,
      );
    }
    for (const m of [...NOMS_ANIMES, ...ADJECTIFS_ANIMES])
      expect(
        FEMININS.some((f) => f.m === m),
        m,
      ).toBe(true);
  });

  it('chaque phrase à compléter vise un nom connu, une seule fois', () => {
    const connus = [...PLURIELS_EAU, ...PLURIELS_AUX, ...PLURIELS_OU_X, ...PLURIELS_OU_S, ...PLURIELS_ALS];
    for (const [, mot] of PHRASES_PLURIEL)
      expect(
        connus.some((p) => p.s === mot),
        mot,
      ).toBe(true);
  });

  it('conjugaison et participe', () => {
    expect(VERBES_ER.map((v) => conjuguer(v, 'ils'))).toContain('chantent');
    expect(conjuguer('jouer', 'tu')).toBe('joues');
    expect(accorderParticipe('parti', { genre: 'f', nombre: 'pl' })).toBe('parties');
    for (const x of SUJETS_PIEGES)
      expect(conjuguer(x.infinitif, x.fausse), x.debut).not.toBe(conjuguer(x.infinitif, x.personne));
  });

  it('niveau 5 : la forme fautive affichée est refusée, la correction est acceptée', () => {
    for (const q of tirages('fcm1-accord-sujet-verbe', 5)) {
      const justes = trous(q);
      expect(check(q, { kind: 'cloze', answers: justes }).correct).toBe(true);
      lignes(q).forEach((l, i) => expect(l.split(' ')).not.toContain(justes[i]));
    }
    for (const q of tirages('fcm1-accord-gn', 5)) {
      const justes = trous(q);
      lignes(q).forEach((l, i) => expect(l.toLowerCase().startsWith(`${justes[i]} `), l).toBe(false));
      expect(justes.every((g) => g.startsWith('les '))).toBe(true);
    }
    for (const q of tirages('fcm1-participe-etre', 5)) {
      const justes = trous(q);
      expect(justes).toHaveLength(6);
      for (let i = 0; i < 6; i += 2) expect(['est', 'sont']).toContain(justes[i]);
    }
  });

  it('genre et nombre niveau 5 : le décompte correspond aux lignes', () => {
    for (const q of tirages('fcm1-genre-nombre', 5)) {
      if (q.answer.kind !== 'number') throw new Error('forme inattendue');
      expect(new Set(lignes(q)).size).toBe(5);
      const pluriel = q.prompt.includes('pluriel');
      const feminin = q.prompt.includes('féminin');
      const n = lignes(q).filter((l) => {
        const [det = '', nom = ''] = l.replace('Je trouve ', '').replace('.', '').split(' ');
        const estPluriel = det === 'des';
        const racine = estPluriel ? nom.slice(0, -1) : nom;
        const estFeminin = ['table', 'fleur', 'porte', 'pomme', 'maison', 'robe', 'chaise', 'balle', 'lampe', 'valise'];
        return estPluriel === pluriel && estFeminin.includes(racine) === feminin;
      }).length;
      expect(check(q, { kind: 'number', text: String(n) }).correct, q.prompt).toBe(true);
    }
  });

  it('participe : accorder avec le nom le plus proche est refusé et expliqué', () => {
    const q = tirages('fcm1-participe-etre', 4).find((x) => x.prompt.includes('La sœur de mes voisins'));
    if (q?.answer.kind !== 'text') throw new Error('forme inattendue');
    const juste = q.answer.accepted[0] ?? '';
    expect(juste.endsWith('e')).toBe(true);
    const faux = check(q, { kind: 'text', text: `${juste.slice(0, -1)}s` });
    expect(faux.correct).toBe(false);
    expect(JSON.stringify(faux)).toContain('féminin singulier');
  });
});
