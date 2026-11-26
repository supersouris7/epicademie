import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level } from '../types.ts';
import { BANQUES, FAITS_CULTURE_CM2 } from './culture-cm2.donnees.ts';
import { FCM2_CULTURE } from './culture-cm2.ts';

const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const tirages = (id: string, level: Level) => Array.from({ length: 300 }, (_, seed) => generate(id, level, seed));
const saisie = (text: string) => ({ kind: 'text' as const, text });
const trouve = (id: string, level: Level, morceau: string) => {
  const q = tirages(id, level).find((x) =>
    `${x.prompt} ${x.figure?.kind === 'document' ? x.figure.lines.join(' ') : ''}`.includes(morceau),
  );
  if (!q) throw new Error(`aucune question « ${morceau} »`);
  return q;
};
const banques = Object.values(BANQUES);

describe('francais cm2 — culture littéraire', () => {
  it('le chapitre compte les cinq notions du lot, à 5 niveaux', () => {
    expect(FCM2_CULTURE.map((s) => s.id)).toEqual([
      'fcm2-recit-narrateur',
      'fcm2-theatre',
      'fcm2-poesie',
      'fcm2-fable-morale',
      'fcm2-conte-merveilleux',
    ]);
    for (const s of FCM2_CULTURE) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    expect(new Set(FAITS_CULTURE_CM2.map((f) => f.id)).size).toBe(FAITS_CULTURE_CM2.length);
    for (const f of FAITS_CULTURE_CM2) {
      expect(getSource(f.source), f.source).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(7);
    }
    for (const s of FCM2_CULTURE) {
      expect(s.lesson.sources).toContain('francais-cycle3-2025');
      for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
      const steps = LEVELS.flatMap((l) => tirages(s.id, l).flatMap((q) => q.steps));
      for (const term of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(term, SUBJECT_GLOSSARIES.francais ?? []), term).toBe(true);
      for (const [, term = ''] of steps.join('\n').matchAll(/^(?:Un|Une|Le|La|Dans un) \*\*([^*]+)\*\*/gm))
        expect(isDefined(term, SUBJECT_GLOSSARIES.francais ?? []), term).toBe(true);
    }
  });

  it('questions valides aux 5 niveaux, énoncés distincts, pièges expliqués', () => {
    for (const s of FCM2_CULTURE) {
      const enonces = new Set<string>();
      for (const level of LEVELS) {
        const qs = tirages(s.id, level);
        expect(validateVariants(qs), `${s.id} N${level}`).toEqual([]);
        enonces.add(qs.map((q) => q.prompt).join('|'));
        for (const q of qs)
          if (q.answer.kind === 'choice' || q.answer.kind === 'text')
            expect(q.traps.length, q.prompt).toBeGreaterThanOrEqual(2);
      }
      expect(enonces.size, s.id).toBe(5);
    }
  });

  it('formes par niveau : QCM puis paires, production, puis texte à quatre trous', () => {
    for (const s of FCM2_CULTURE) {
      for (const level of [1, 2] as const)
        for (const q of tirages(s.id, level)) {
          if (q.answer.kind === 'choice') expect(q.answer.options, q.prompt).toHaveLength(level + 2);
          else if (q.answer.kind === 'match') expect(q.answer.left, q.prompt).toHaveLength(3);
          else throw new Error(`forme inattendue : ${q.prompt}`);
        }
      for (const level of [3, 4] as const)
        for (const q of tirages(s.id, level)) {
          if (q.answer.kind === 'match') expect(q.answer.left, q.prompt).toHaveLength(5);
          else expect(['text', 'order'], q.prompt).toContain(q.answer.kind);
        }
      for (const q of tirages(s.id, 5)) {
        expect(q.figure?.kind === 'document' && q.figure.lines.length).toBeGreaterThanOrEqual(4);
        if (q.answer.kind !== 'cloze') throw new Error('forme inattendue');
        expect(q.answer.blanks).toHaveLength(4);
      }
    }
  });
});

describe('données', () => {
  it('paires : descriptions et noms distincts', () => {
    for (const b of banques)
      for (const paires of [b.paires, b.cinq]) {
        expect(new Set(paires.map(([a]) => a)).size).toBe(paires.length);
        expect(new Set(paires.map(([, n]) => n)).size).toBe(paires.length);
      }
  });

  it('textes longs : trois propositions distinctes ; expressions citées présentes dans le texte', () => {
    for (const t of banques.flatMap((b) => b.longs))
      for (const x of t.trous) {
        expect(new Set([x.bon, ...x.faux]).size, x.etiquette).toBe(3);
        for (const [, c = ''] of x.preuve.matchAll(/« ([^»…]{9,}) »/g))
          expect(t.lignes.join(' '), c).toContain(c.replace(/\.$/, ''));
      }
  });

  it('QCM : propositions distinctes ; le N1 en a au moins deux fausses, le N2 trois', () => {
    for (const b of banques)
      for (const [liste, n] of [
        [b.decouvrir, 2],
        [b.reconnaitre, 3],
      ] as const)
        for (const c of liste) {
          expect(c.faux.length, c.titre).toBeGreaterThanOrEqual(n);
          expect(new Set([c.bon, ...c.faux.map(([f]) => f)]).size, c.titre).toBe(c.faux.length + 1);
        }
  });
});

describe('correction des réponses', () => {
  it('variantes acceptées, erreurs typiques refusées et expliquées', () => {
    const cas = [
      ['fcm2-recit-narrateur', 4, 'narrateur de ce livre', ['biscotte'], 'Hélène Vasseur'],
      ['fcm2-theatre', 4, 'cachée à Tom', ['aparte', 'un aparté'], 'tirade'],
      ['fcm2-poesie', 4, 'entoure la rime', ['embrassees', 'des rimes embrassées'], 'croisées'],
      ['fcm2-fable-morale', 3, '« Le Lièvre et la … ».', ['tortue', 'la Tortue'], 'cigale'],
      ['fcm2-conte-merveilleux', 3, 'Quel auteur', ['perrault', 'Charles Perrault'], 'La Fontaine'],
    ] as const;
    for (const [id, level, morceau, justes, faux] of cas) {
      const q = trouve(id, level, morceau);
      for (const t of justes) expect(check(q, saisie(t)).correct, t).toBe(true);
      const r = check(q, saisie(faux));
      expect(r.correct, faux).toBe(false);
      expect(r.why, faux).toBeTruthy();
    }
  });

  it('histoire à remettre dans l’ordre : seul l’ordre attendu est juste', () => {
    const q = trouve('fcm2-conte-merveilleux', 3, 'dans l’ordre');
    if (q.answer.kind !== 'order') throw new Error('forme inattendue');
    expect(check(q, { kind: 'order', order: [...q.answer.correct] }).correct).toBe(true);
    expect(check(q, { kind: 'order', order: [...q.answer.correct].reverse() }).correct).toBe(false);
  });
});
