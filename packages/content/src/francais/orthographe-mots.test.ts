import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import {
  CES_SES,
  FAITS_ORTHOGRAPHE,
  MOTS_INVARIABLES,
  MOTS_VARIABLES,
  PAIRES,
  faitOrthographe,
} from './orthographe-mots.donnees.ts';
import { ADVERBES_SURS, FCM1_ORTHOGRAPHE_MOTS, remplir } from './orthographe-mots.ts';

const skills = FCM1_ORTHOGRAPHE_MOTS;
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

describe('francais cm1 — orthographe des mots', () => {
  it('le chapitre compte les six notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm1-a-a',
      'fcm1-et-est',
      'fcm1-son-sont',
      'fcm1-on-ont',
      'fcm1-ces-ses',
      'fcm1-mots-invariables',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    expect(new Set(FAITS_ORTHOGRAPHE.map((f) => f.id)).size).toBe(FAITS_ORTHOGRAPHE.length);
    for (const f of FAITS_ORTHOGRAPHE) {
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

  it('les accents comptent : « a » n’est pas « à », « deja » n’est pas « déjà »', () => {
    for (const q of tirages('fcm1-a-a', 3)) {
      if (q.answer.kind !== 'text') throw new Error('forme inattendue');
      const juste = q.answer.accepted[0] ?? '';
      const faux = check(q, { kind: 'text', text: juste === 'a' ? 'à' : 'a' });
      expect(faux.correct).toBe(false);
      expect(faux.why, q.prompt).toBeDefined();
    }
    const q = tirages('fcm1-mots-invariables', 4).find((x) => x.prompt.includes('fini ton dessin'));
    if (!q) throw new Error('phrase absente');
    expect(check(q, { kind: 'text', text: 'déjà' }).correct).toBe(true);
    expect(check(q, { kind: 'text', text: 'deja' }).correct).toBe(false);
  });
});

describe('banques de phrases et de mots', () => {
  it('chaque phrase a autant de trous que de mots, choisis dans sa paire', () => {
    for (const paire of PAIRES) {
      const [m1, m2] = paire.emplois.map((e) => e.mot);
      expect([m1, m2]).not.toContain(paire.intrus.mot);
      for (const x of paire.simples) {
        expect(x.texte.split('…'), x.texte).toHaveLength(2);
        expect([m1, m2], x.texte).toContain(x.mots[0]);
      }
      for (const m of [m1, m2]) expect(paire.simples.filter((x) => x.mots[0] === m).length).toBeGreaterThanOrEqual(4);
      for (const x of paire.doubles) {
        expect(x.texte.split('…'), x.texte).toHaveLength(3);
        expect([...x.mots].sort(), x.texte).toEqual([m1, m2].sort());
      }
    }
  });

  it('ces / ses : chaque phrase porte l’indice qui tranche (on montre, ou c’est à quelqu’un)', () => {
    const montre = /-là|-ci|là-bas|que je te montre|que tu vois/g;
    const possede = /à lui|à elle|propres/g;
    for (const x of [...CES_SES.simples, ...CES_SES.doubles]) {
      expect(x.texte.match(montre)?.length ?? 0, x.texte).toBe(x.mots.filter((m) => m === 'ces').length);
      expect(x.texte.match(possede)?.length ?? 0, x.texte).toBe(x.mots.filter((m) => m === 'ses').length);
    }
  });

  it('niveaux 2, 4 et 5 : une seule phrase juste, deux trous, puis un carnet de six trous', () => {
    expect(remplir('Il … faim … midi.', ['a', 'à'])).toBe('Il a faim à midi.');
    for (const q of tirages('fcm1-et-est', 2)) {
      if (q.answer.kind !== 'choice') throw new Error('forme inattendue');
      expect(q.answer.options).toHaveLength(4);
      expect(q.traps).toHaveLength(3);
    }
    for (const q of tirages('fcm1-on-ont', 4)) expect(trous(q).sort()).toEqual(['on', 'ont']);
    for (const q of tirages('fcm1-ces-ses', 5)) {
      expect(trous(q)).toHaveLength(6);
      expect(lignes(q)).toHaveLength(3);
      // Une ligne reprend la notion précédente (on / ont).
      expect(trous(q).filter((m) => m.startsWith('on'))).toHaveLength(2);
    }
  });

  it('mots invariables : citation attestant la classe, fautes distinctes, début juste', () => {
    for (const x of MOTS_INVARIABLES) {
      expect(x.mot.startsWith(x.debut), x.mot).toBe(true);
      expect(new Set([x.mot, ...x.fautes]).size, x.mot).toBe(3);
      expect(x.phrase.split('…'), x.mot).toHaveLength(2);
      const citation = faitOrthographe(x.fait).citation;
      expect(citation.length, x.mot).toBeGreaterThan(7);
    }
    for (const m of ADVERBES_SURS) {
      expect(MOTS_INVARIABLES.find((x) => x.mot === m)?.classe).toBe('adverbe');
      expect(MOTS_VARIABLES.map(([v]) => v)).not.toContain(m);
    }
  });

  it('mots invariables niveau 5 : chaque ligne porte une faute, la correction est acceptée', () => {
    for (const q of tirages('fcm1-mots-invariables', 5)) {
      const justes = trous(q);
      expect(check(q, { kind: 'cloze', answers: justes }).correct).toBe(true);
      lignes(q).forEach((l, i) => {
        const x = MOTS_INVARIABLES.find((m) => m.mot === justes[i]);
        expect(
          x?.fautes.some((f) => l === x.phrase.replace('…', f)),
          l,
        ).toBe(true);
      });
    }
  });
});
