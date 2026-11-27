import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import { FAITS_ORTHOGRAPHE_CM2, MOTS_MUETS, SERIES_CM2, faitOrthographeCm2 } from './orthographe-mots-cm2.donnees.ts';
import { FCM2_ORTHOGRAPHE_MOTS, ecritures, motsDe, phraseComplete } from './orthographe-mots-cm2.ts';

const skills = FCM2_ORTHOGRAPHE_MOTS;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const tirages = (id: string, level: Level) => Array.from({ length: 200 }, (_, seed) => generate(id, level, seed));
const trous = (q: Question) => {
  if (q.answer.kind !== 'cloze') throw new Error('forme inattendue');
  return q.answer.blanks.map((b) => (b.mode === 'text' ? (b.accepted[0] ?? '') : ''));
};

describe('francais cm2 — orthographe des mots', () => {
  it('le chapitre compte les six notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm2-ou-ou',
      'fcm2-la-la-la',
      'fcm2-ce-se',
      'fcm2-leur-leurs',
      'fcm2-quel-quelle',
      'fcm2-lettres-muettes',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    expect(new Set(FAITS_ORTHOGRAPHE_CM2.map((f) => f.id)).size).toBe(FAITS_ORTHOGRAPHE_CM2.length);
    for (const f of FAITS_ORTHOGRAPHE_CM2) {
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

  it('les accents et l’apostrophe comptent : « ou » n’est pas « où », « quelle » n’est pas « qu’elle »', () => {
    for (const [id, a, b] of [
      ['fcm2-ou-ou', 'ou', 'où'],
      ['fcm2-quel-quelle', 'quelle', 'qu’elle'],
    ] as const) {
      const q = tirages(id, 3).find((x) => x.answer.kind === 'text' && x.answer.accepted[0] === b);
      if (!q) throw new Error('forme inattendue');
      expect(check(q, { kind: 'text', text: b.replace('’', "'") }).correct).toBe(true);
      const faux = check(q, { kind: 'text', text: a });
      expect(faux.correct).toBe(false);
      expect(faux.why, q.prompt).toBeDefined();
    }
  });
});

describe('banques de phrases', () => {
  it('chaque phrase a autant de trous que d’emplois connus ; chaque écriture a au moins trois phrases simples', () => {
    for (const serie of SERIES_CM2) {
      for (const x of [...serie.simples, ...serie.doubles]) {
        expect(x.texte.split('…').length - 1, x.texte).toBe(x.cles.length);
        for (const c of x.cles) expect(serie.emplois[c], `${x.texte} : ${c}`).toBeDefined();
      }
      for (const x of serie.simples) expect(x.cles, x.texte).toHaveLength(1);
      for (const x of serie.doubles) expect(x.cles.length, x.texte).toBeGreaterThanOrEqual(2);
      for (const m of ecritures(serie))
        expect(serie.simples.filter((x) => motsDe(serie, x)[0] === m).length, m).toBeGreaterThanOrEqual(3);
      if (serie.intrus) expect(ecritures(serie)).not.toContain(serie.intrus.mot);
    }
    expect(phraseComplete('… vas-tu ?', ['où'])).toBe('Où vas-tu ?');
  });

  it('« quel(le) » + nom n’est jamais suivi directement de « qu’elle » (tournure fautive)', () => {
    for (const serie of SERIES_CM2)
      for (const x of [...serie.simples, ...serie.doubles]) {
        const phrase = phraseComplete(x.texte, motsDe(serie, x));
        expect(phrase).not.toMatch(/(?<!\p{L})quel(le)?s? \p{L}+ qu’(elle|il)/iu);
      }
  });

  it('niveaux 1 et 2 : trois puis quatre propositions ; niveau 5 : trois lignes avec la notion précédente', () => {
    for (const s of skills.slice(0, 5)) {
      for (const level of [1, 2] as const)
        for (const q of tirages(s.id, level)) {
          if (q.answer.kind !== 'choice') throw new Error('forme inattendue');
          expect(q.answer.options, q.prompt).toHaveLength(level + 2);
        }
      for (const q of tirages(s.id, 5)) {
        if (q.figure?.kind !== 'document') throw new Error('forme inattendue');
        expect(q.figure.lines).toHaveLength(3);
        const justes = trous(q);
        expect(check(q, { kind: 'cloze', answers: justes }).correct).toBe(true);
        expect(justes.length).toBe(q.figure.lines.join('').split('…').length - 1);
      }
    }
    for (const q of tirages('fcm2-ou-ou', 5)) expect(trous(q).some((m) => m === 'a' || m === 'à')).toBe(true);
  });
});

describe('lettres muettes finales', () => {
  it('chaque mot a sa phrase, son mot de famille qui garde la lettre et une citation de l’Académie', () => {
    expect(new Set(MOTS_MUETS.map((x) => x.mot)).size).toBe(MOTS_MUETS.length);
    for (const x of MOTS_MUETS) {
      expect(x.phrase.split('…'), x.mot).toHaveLength(2);
      const racine = x.mot.normalize('NFD').replace(/\p{M}/gu, '');
      const parent = x.parent.normalize('NFD').replace(/\p{M}/gu, '');
      expect(parent, x.mot).toContain(racine);
      const citation = faitOrthographeCm2(x.fait).citation;
      expect(citation, x.mot).toMatch(/^(Dérivé de|Déverbal d)/);
      // La citation nomme le mot court, ou le mot de la famille dont il est tiré.
      expect(citation.includes(x.mot) || citation.includes(x.parent), x.mot).toBe(true);
    }
  });

  it('une lettre oubliée ou changée est refusée et expliquée ; les niveaux 4 et 5 ne donnent pas la famille', () => {
    for (const level of [3, 4] as const)
      for (const q of tirages('fcm2-lettres-muettes', level)) {
        if (q.answer.kind !== 'text') throw new Error('forme inattendue');
        const juste = q.answer.accepted[0] ?? '';
        const faux = check(q, { kind: 'text', text: juste.slice(0, -1) });
        expect(faux.correct).toBe(false);
        expect(faux.why, q.prompt).toBeDefined();
        const x = MOTS_MUETS.find((m) => m.mot === juste);
        expect(q.prompt.includes(x?.parent ?? ''), q.prompt).toBe(level === 3);
      }
    for (const q of tirages('fcm2-lettres-muettes', 5)) {
      expect(trous(q)).toHaveLength(4);
      expect(check(q, { kind: 'cloze', answers: trous(q) }).correct).toBe(true);
    }
  });
});
