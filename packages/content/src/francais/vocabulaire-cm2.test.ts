import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import {
  EXPRESSIONS,
  FAITS_VOCABULAIRE_CM2,
  FAMILLES,
  GROUPES,
  PAIRES,
  PREFIXES,
  SUFFIXES,
  faitVocabulaireCm2,
} from './vocabulaire-cm2.donnees.ts';
import { FCM2_VOCABULAIRE } from './vocabulaire-cm2.ts';

const skills = FCM2_VOCABULAIRE;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const tirages = (id: string, level: Level) => Array.from({ length: 300 }, (_, seed) => generate(id, level, seed));
const saisie = (text: string) => ({ kind: 'text' as const, text });
const trouve = (id: string, level: Level, morceau: string) => {
  const q = tirages(id, level).find((x: Question) => x.prompt.includes(morceau));
  if (!q) throw new Error(`aucune question « ${morceau} »`);
  return q;
};

describe('francais cm2 — vocabulaire', () => {
  it('le chapitre compte les six notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm2-familles-de-mots',
      'fcm2-prefixes',
      'fcm2-suffixes',
      'fcm2-synonymes-antonymes',
      'fcm2-mot-generique',
      'fcm2-expressions-locutions',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    expect(new Set(FAITS_VOCABULAIRE_CM2.map((f) => f.id)).size).toBe(FAITS_VOCABULAIRE_CM2.length);
    for (const f of FAITS_VOCABULAIRE_CM2) {
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

  it('niveaux 1 et 2 : QCM à 3 puis 4 propositions, ou association de 3 paires', () => {
    for (const s of skills) {
      for (const level of [1, 2] as const) {
        for (const q of tirages(s.id, level)) {
          if (q.answer.kind === 'choice') expect(q.answer.options, q.prompt).toHaveLength(level + 2);
          else if (q.answer.kind === 'match' && level === 2) expect(q.answer.left, q.prompt).toHaveLength(3);
          else throw new Error(`forme inattendue : ${q.prompt}`);
        }
      }
    }
  });

  it('niveaux 3 et 4 : saisie sans propositions, ou association de 5 paires au niveau 4', () => {
    for (const s of skills) {
      for (const q of tirages(s.id, 3)) expect(q.answer.kind, q.prompt).toBe('text');
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
        for (const blank of q.answer.blanks)
          if (blank.mode === 'list') expect(new Set(blank.options).size).toBe(blank.options.length);
      }
    }
  });
});

describe('données', () => {
  it('chaque réponse citée figure dans sa citation', () => {
    for (const p of PAIRES) {
      expect(faitVocabulaireCm2(p.faitId).citation, `${p.mot} → ${p.reponse}`).toContain(p.reponse);
      expect(p.phrase).toContain('{}');
      expect(p.autreClasse[1]).not.toBe(p.classe);
    }
    for (const g of GROUPES)
      for (const m of g.particuliers)
        expect(faitVocabulaireCm2(m.faitId).citation.toLowerCase(), m.mot).toContain(
          g.generique === 'instrument de musique' ? 'instrument' : g.generique,
        );
  });

  it('mots construits : préfixe au début, mot simple dans la famille', () => {
    for (const p of PREFIXES) {
      expect(p.mot, p.mot).toBe(`${p.prefixe.replace('-', '')}${p.base}`);
      expect(p.phrase).toContain('{}');
      if (p.prefixe === 'im-') expect(p.base).toMatch(/^[mbp]/);
      if (p.prefixe === 'in-') expect(p.base).not.toMatch(/^[mbp]/);
    }
    for (const s of SUFFIXES) {
      expect(s.mot.endsWith(s.suffixe.replace('-', '')), s.mot).toBe(true);
      expect(s.phrase).toContain('{}');
    }
    for (const f of FAMILLES) expect(f.membres.map((m) => m.mot)).not.toContain(f.intrus?.mot);
  });

  it('expressions : le mot à retrouver figure dans le texte', () => {
    for (const e of EXPRESSIONS) {
      expect(e.texte, e.texte).toContain(e.trou);
      expect(e.piege[0]).not.toBe(e.sens);
    }
    expect(new Set(EXPRESSIONS.map((e) => e.sens)).size).toBe(EXPRESSIONS.length);
  });
});

describe('correction des réponses', () => {
  it('famille : « boiser » ne suffit pas pour « reboiser »', () => {
    const q = trouve('fcm2-familles-de-mots', 4, '« reboiser »');
    expect(check(q, saisie('bois')).correct).toBe(true);
    expect(check(q, saisie('boiser')).why).toContain('plus court');
  });

  it('préfixe : « inpoli » est refusé avec la règle du « im- »', () => {
    const q = trouve('fcm2-prefixes', 4, '« poli »');
    expect(check(q, saisie('impoli')).correct).toBe(true);
    expect(check(q, saisie('inpoli')).why).toContain('im-');
  });

  it('suffixe : « garçonet » à un seul n est refusé', () => {
    const q = trouve('fcm2-suffixes', 4, 'petit garçon');
    expect(check(q, saisie('garçonnet')).correct).toBe(true);
    expect(check(q, saisie('garçonet')).correct).toBe(false);
  });

  it('synonyme : un mot d’une autre classe est refusé et expliqué', () => {
    const q = trouve('fcm2-synonymes-antonymes', 3, 'synonyme du nom « victoire »');
    expect(check(q, saisie('triomphe')).correct).toBe(true);
    expect(check(q, saisie('triompher')).why).toContain('verbe');
  });

  it('antonyme : « déroute » accepté pour « victoire »', () => {
    const q = trouve('fcm2-synonymes-antonymes', 3, 'antonyme du nom « victoire »');
    for (const mot of ['défaite', 'déroute']) expect(check(q, saisie(mot)).correct).toBe(true);
  });

  it('mot générique : un mot particulier est refusé', () => {
    const q = trouve('fcm2-mot-generique', 3, '« chaise »');
    expect(check(q, saisie('sièges')).correct).toBe(true);
    expect(check(q, saisie('chaise')).correct).toBe(false);
  });

  it('expression : « coeur » sans ligature est accepté', () => {
    const q = trouve('fcm2-expressions-locutions', 3, 'sur la main');
    for (const mot of ['cœur', 'coeur']) expect(check(q, saisie(mot)).correct).toBe(true);
  });
});
