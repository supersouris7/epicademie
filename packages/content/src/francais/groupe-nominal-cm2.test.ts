import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import {
  ACCORDS_GN,
  ADJECTIFS,
  DEUX_ADJECTIFS,
  EPITHETES_APRES_VERBE,
  FAITS_GN_CM2,
  GROUPES_ENRICHIS,
  PHRASES_COMPLEMENT,
  accorder,
  texteComplement,
  texteGroupe,
} from './groupe-nominal-cm2.donnees.ts';
import { FCM2_GROUPE_NOMINAL } from './groupe-nominal-cm2.ts';

const skills = FCM2_GROUPE_NOMINAL;
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

describe('francais cm2 — le groupe nominal enrichi', () => {
  it('le chapitre compte les quatre notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm2-gn-expansions',
      'fcm2-complement-du-nom',
      'fcm2-epithete-attribut',
      'fcm2-chaine-accord-expansions',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    for (const f of FAITS_GN_CM2) expect(getSource(f.source), f.id).toBeDefined();
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

describe('banques et réponses du groupe nominal enrichi', () => {
  it('chaque groupe enrichi a un seul adjectif et un complément introduit par une préposition', () => {
    for (const g of GROUPES_ENRICHIS) {
      expect([g.avant, g.apres].filter(Boolean), texteGroupe(g)).toHaveLength(1);
      expect(g.complement).toMatch(/^(de|du|des|en|à) /);
    }
  });

  it('expansions : le groupe réduit garde le déterminant et le nom', () => {
    for (const q of tirages('fcm2-gn-expansions', 3)) {
      const g = GROUPES_ENRICHIS.find((x) => q.prompt.includes(`« ${texteGroupe(x)} »`));
      if (!g || q.answer.kind !== 'text') throw new Error('forme inattendue');
      expect(q.answer.accepted).toEqual([`${g.det} ${g.nom}`]);
    }
  });

  it('expansions au niveau 5 : le total correspond aux groupes affichés', () => {
    for (const q of tirages('fcm2-gn-expansions', 5)) {
      const attendu = lignes(q).reduce((somme, ligne) => {
        const g = GROUPES_ENRICHIS.find((x) => ligne.toLowerCase().includes(x.nom) && ligne.includes(x.verbe));
        if (!g) throw new Error(`ligne inconnue : ${ligne}`);
        const adjectif = g.avant ?? g.apres ?? '';
        return somme + Number(ligne.includes(adjectif)) + Number(ligne.includes(g.complement));
      }, 0);
      expect(check(q, { kind: 'number', text: String(attendu) }).correct, lignes(q).join(' ')).toBe(true);
    }
  });

  it('complément du nom : le groupe circonstanciel et le complément sans préposition sont refusés', () => {
    for (const q of tirages('fcm2-complement-du-nom', 4)) {
      const p = PHRASES_COMPLEMENT.find((x) => q.prompt.includes(texteComplement(x)));
      if (!p) throw new Error('forme inattendue');
      expect(check(q, { kind: 'text', text: p.complement }).correct).toBe(true);
      expect(check(q, { kind: 'text', text: p.leurre }).correct).toBe(false);
      expect(check(q, { kind: 'text', text: p.complement.replace(/^\S+ /, '') }).correct).toBe(false);
    }
    for (const q of tirages('fcm2-complement-du-nom', 5)) {
      expect(trous(q)).toEqual(
        lignes(q).map((l) => PHRASES_COMPLEMENT.find((p) => texteComplement(p) === l)?.complement),
      );
    }
  });

  it('épithète ou attribut : la fonction suit la construction de la phrase', () => {
    for (const q of tirages('fcm2-epithete-attribut', 1)) {
      if (q.answer.kind !== 'choice') throw new Error('forme inattendue');
      const attribut = ADJECTIFS.some((a) => q.prompt.includes(` est ${a.adjectif}.`));
      expect(q.answer.options[q.answer.correct]).toBe(attribut ? 'attribut du sujet' : 'épithète');
    }
    for (const q of tirages('fcm2-epithete-attribut', 5)) {
      const attendu = trous(q);
      lignes(q).forEach((ligne, i) => {
        const adjectif = /« ([^»]+) » : $/.exec(q.answer.kind === 'cloze' ? (q.answer.parts[i] ?? '') : '')?.[1];
        const d = DEUX_ADJECTIFS.find((x) => x.texte === ligne);
        const e = EPITHETES_APRES_VERBE.find((x) => x.texte === ligne);
        expect(d ?? e, ligne).toBeDefined();
        expect(attendu[i]).toBe(d && d.attribut === adjectif ? 'attribut du sujet' : 'épithète');
      });
      expect(new Set(attendu).size).toBe(2);
    }
  });

  it('chaîne d’accord : les adjectifs suivent le nom noyau, pas le nom du complément', () => {
    expect(accorder('petit', 'f', 'pl')).toBe('petites');
    expect(accorder('bleu', 'm', 'pl')).toBe('bleus');
    for (const q of tirages('fcm2-chaine-accord-expansions', 4)) {
      const [, avant = '', apres = '', nom = ''] =
        /^Accorde « (.+) » et « (.+) » avec le nom « (.+) »\.$/.exec(q.prompt) ?? [];
      const a = ACCORDS_GN.find((x) => x.avant === avant && x.apres === apres && nom.replace(/s$/, '') === x.nom);
      if (!a) throw new Error(`question inconnue : ${q.prompt}`);
      const n = nom === a.nom ? 'sg' : 'pl';
      expect(trous(q)).toEqual([accorder(avant, a.genre, n), accorder(apres, a.genre, n)]);
      expect(a.genre === a.nomComplement.genre && n === a.nomComplement.nombre).toBe(false);
    }
  });

  it('chaîne d’accord au niveau 5 : un nouveau nom noyau change le genre ou le nombre de toute la chaîne', () => {
    for (const q of tirages('fcm2-chaine-accord-expansions', 5)) {
      const saisies = trous(q);
      expect(saisies).toHaveLength(8);
      let changementsDeGenre = 0;
      const nombres = lignes(q).map((ligne, i) => {
        const [, ancien = '', nouveau = ''] =
          new RegExp(`ligne ${i + 1}, « ([^»]+) » devient « ([^»]+) »`).exec(q.prompt) ?? [];
        const a = ACCORDS_GN.find((x) => ancien.replace(/s$/, '') === x.nom && ligne.includes(` ${x.complement} `));
        if (!a) throw new Error(`ligne inconnue : ${ligne}`);
        const n = ancien === a.nom ? 'pl' : 'sg';
        const autre = nouveau.replace(/s$/, '') === a.remplacants.autreGenre;
        if (!autre) expect(nouveau).toBe(a.remplacants.memeGenre);
        const genre = autre === (a.genre === 'm') ? 'f' : 'm';
        if (autre) changementsDeGenre++;
        const attendu = [
          { m: 'Le', f: 'La' }[genre],
          accorder(a.avant, genre, n),
          accorder(a.apres, genre, n),
          a.verbe[n === 'sg' ? 0 : 1],
        ];
        if (n === 'pl') attendu[0] = 'Les';
        const ecrits = saisies.slice(i * 4, i * 4 + 4);
        expect(ecrits, q.prompt).toEqual(attendu);
        // Au moins deux trous ne se déduisent pas d'un simple « s » ajouté au mot écrit dans le texte.
        const mots = ligne.replace(/\.$/, '').split(' ');
        const origine = [mots[0], mots[1], mots[3], mots.at(-1)];
        expect(ecrits.filter((e, j) => e !== `${origine[j]}s`).length).toBeGreaterThanOrEqual(2);
        // Le nom du complément reste un piège.
        expect(genre === a.nomComplement.genre && n === a.nomComplement.nombre, q.prompt).toBe(false);
        return n;
      });
      expect(changementsDeGenre).toBeGreaterThanOrEqual(1);
      expect([...nombres].sort()).toEqual(['pl', 'sg']);
    }
  });
});
