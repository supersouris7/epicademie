import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import {
  ANTONYMES,
  CONSTRUITS,
  CONTRAIRES_PREFIXES,
  FAITS_VOCABULAIRE,
  FAMILLES,
  INCONNUS,
  POLYSEMES,
  POLYSEMES_EXPERTS,
  SYNONYMES,
  faitVocabulaire,
} from './vocabulaire.donnees.ts';
import { FCM1_VOCABULAIRE } from './vocabulaire.ts';

const skills = FCM1_VOCABULAIRE;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const tirages = (id: string, level: Level) => Array.from({ length: 300 }, (_, seed) => generate(id, level, seed));
const saisie = (text: string) => ({ kind: 'text' as const, text });
const accepte = (q: Question) => {
  if (q.answer.kind !== 'text') throw new Error('forme inattendue');
  return q.answer.accepted;
};
const trouve = (id: string, level: Level, morceau: string) => {
  const q = tirages(id, level).find((x) => x.prompt.includes(morceau));
  if (!q) throw new Error(`aucune question « ${morceau} »`);
  return q;
};

describe('francais cm1 — vocabulaire', () => {
  it('le chapitre compte les six notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm1-synonymes',
      'fcm1-antonymes',
      'fcm1-familles-de-mots',
      'fcm1-prefixes-suffixes',
      'fcm1-mots-polysemiques',
      'fcm1-sens-contexte',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    expect(new Set(FAITS_VOCABULAIRE.map((f) => f.id)).size).toBe(FAITS_VOCABULAIRE.length);
    for (const f of FAITS_VOCABULAIRE) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(7);
    }
    for (const s of skills) {
      for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
      for (const term of [...s.lesson.memo, ...tirages(s.id, 1).flatMap((q) => q.steps.slice(0, 1))].flatMap(boldTerms))
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
      expect(niveauxAvecPieges, s.id).toBeGreaterThanOrEqual(2);
      expect(enonces.size, s.id).toBe(5);
    }
  });

  it('QCM : 3 propositions au niveau 1 ; 4 au niveau 2 ; association de 3 paires au niveau 2', () => {
    for (const s of skills) {
      for (const level of [1, 2] as const) {
        for (const q of tirages(s.id, level)) {
          if (q.answer.kind === 'choice') expect(q.answer.options, q.prompt).toHaveLength(level + 2);
          else if (q.answer.kind === 'match') expect(q.answer.left, q.prompt).toHaveLength(3);
          else throw new Error(`forme inattendue : ${q.prompt}`);
        }
      }
    }
  });

  it('niveau 4 : saisie sans propositions ou association de 5 paires', () => {
    for (const s of skills) {
      for (const q of tirages(s.id, 4)) {
        if (q.answer.kind === 'match') expect(q.answer.left, q.prompt).toHaveLength(5);
        else expect(q.answer.kind, q.prompt).toBe('text');
      }
    }
  });

  it('niveau 5 : un texte de 4 lignes, un trou par ligne', () => {
    for (const s of skills) {
      for (const q of tirages(s.id, 5)) {
        if (q.figure?.kind !== 'document' || q.answer.kind !== 'cloze') throw new Error('forme inattendue');
        expect(q.figure.lines, q.prompt).toHaveLength(4);
        expect(q.answer.blanks).toHaveLength(4);
        for (const line of q.figure.lines) expect(line).not.toContain('{}');
      }
    }
  });
});

describe('données', () => {
  it('synonymes et antonymes : paires et phrases cohérentes', () => {
    expect(new Set(SYNONYMES.map((s) => s.mot)).size).toBe(SYNONYMES.length);
    expect(new Set(SYNONYMES.map((s) => s.syn)).size).toBe(SYNONYMES.length);
    for (const s of SYNONYMES) {
      expect(s.phrase).toContain('{}');
      expect(faitVocabulaire(s.faitId).citation).toContain(s.syn);
      expect(s.faux.map(([f]) => f)).not.toContain(s.syn);
    }
    for (const a of ANTONYMES) {
      expect(faitVocabulaire(a.faitId).citation).toContain(a.contraire);
      expect(a.proche).not.toBe(a.contraire);
    }
    for (const c of CONTRAIRES_PREFIXES) expect(c.contraire).toBe(`${c.prefixe.replace('-', '')}${c.mot}`);
  });

  it('familles : les citations nomment le mot simple', () => {
    for (const f of FAMILLES) {
      for (const m of f.membres) {
        const citation = faitVocabulaire(m.faitId).citation;
        expect(citation.includes(f.base), `${m.mot} : ${citation}`).toBe(true);
      }
      expect(f.membres.map((m) => m.mot)).not.toContain(f.intrus?.mot);
    }
  });

  it('mots construits, polysémiques et inconnus', () => {
    expect(new Set(CONSTRUITS.map((c) => c.mot)).size).toBe(CONSTRUITS.length);
    for (const c of CONSTRUITS) expect(c.phrase).toContain('{}');
    for (const p of [...POLYSEMES, ...POLYSEMES_EXPERTS]) {
      expect(p.sens.length, p.mot).toBeGreaterThanOrEqual(2);
      for (const s of p.sens) {
        expect(s.phrase, p.mot).toContain('___');
        expect(s.phrase.toLowerCase(), p.mot).not.toContain(p.mot);
      }
    }
    for (const i of INCONNUS) {
      expect(i.phrase.toLowerCase(), i.mot).toContain(i.mot);
      expect(i.indice.length, i.mot).toBeGreaterThan(0);
    }
  });

  it('niveaux 1 à 3 de « sens par le contexte » : chaque mot a trois propositions fausses distinctes', () => {
    for (const q of tirages('fcm1-sens-contexte', 2)) {
      if (q.answer.kind !== 'choice') continue;
      expect(new Set(q.answer.options).size).toBe(4);
    }
  });
});

describe('correction des réponses', () => {
  it('synonyme : recopier le mot est refusé et expliqué', () => {
    const q = trouve('fcm1-synonymes', 3, '« content »');
    expect(check(q, saisie('satisfait')).correct).toBe(true);
    const faux = check(q, saisie('content'));
    expect(faux.correct).toBe(false);
    expect(faux.why).toContain('recopié');
  });

  it('antonyme : « sombre » et « obscur » acceptés ; mauvais préfixe expliqué', () => {
    const clair = trouve('fcm1-antonymes', 4, '« clair »');
    for (const mot of ['obscur', 'sombre']) expect(check(clair, saisie(mot)).correct).toBe(true);
    const q = trouve('fcm1-antonymes', 4, '« possible »');
    expect(check(q, saisie('impossible')).correct).toBe(true);
    expect(check(q, saisie('inpossible')).why).toContain('im-');
  });

  it('famille : « rang » accepté pour « déranger », recopie refusée', () => {
    const q = trouve('fcm1-familles-de-mots', 4, '« déranger »');
    for (const mot of ['ranger', 'rang']) expect(check(q, saisie(mot)).correct).toBe(true);
    expect(check(q, saisie('déranger')).correct).toBe(false);
  });

  it('préfixes et suffixes : « maisonette » à un seul n est refusé', () => {
    const q = trouve('fcm1-prefixes-suffixes', 4, 'petite maison');
    expect(check(q, saisie('maisonnette')).correct).toBe(true);
    expect(check(q, saisie('maisonette')).correct).toBe(false);
  });

  it('polysémie : le même mot complète les deux phrases', () => {
    for (const q of tirages('fcm1-mots-polysemiques', 4)) {
      const [bon] = accepte(q);
      if (!bon) throw new Error(q.prompt);
      expect(check(q, saisie(bon)).correct).toBe(true);
    }
  });

  it('contexte : le mot caché est attendu', () => {
    const q = trouve('fcm1-sens-contexte', 4, '« ensablé »');
    expect(accepte(q)).toEqual(['sable']);
    expect(check(q, saisie('ensabler')).correct).toBe(false);
  });
});
