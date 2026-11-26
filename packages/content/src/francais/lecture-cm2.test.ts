import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import {
  DERIVES,
  DOSSIERS,
  ENIGMES,
  ENIGMES_PIEGES,
  EXTRAITS,
  FAITS_LECTURE_CM2,
  INFOS_A_PRELEVER,
  LONGS_DOCUMENTS,
  LONGS_INFERENCE,
  LONGS_PERSONNAGES,
  LONGS_RECITS,
  MOTIVATIONS,
  MOTS_RARES,
  NARRATEURS_CACHES,
  PAIRES,
  POLYSEMIE,
  QUI_RACONTE,
  QUI_SE_CACHE,
  RECITS_DANS_LE_DESORDRE,
  RECITS_MOTS,
  REPRISES,
} from './lecture-cm2.donnees.ts';
import { FCM2_LECTURE } from './lecture-cm2.ts';

const skills = FCM2_LECTURE;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const tirages = (id: string, level: Level) => Array.from({ length: 300 }, (_, seed) => generate(id, level, seed));
const saisie = (text: string) => ({ kind: 'text' as const, text });
const trouve = (id: string, level: Level, morceau: string) => {
  const q = tirages(id, level).find((x) => `${x.prompt} ${lignes(x)}`.includes(morceau));
  if (!q) throw new Error(`aucune question « ${morceau} »`);
  return q;
};
const lignes = (q: Question) => (q.figure?.kind === 'document' ? q.figure.lines.join(' ') : '');
const normal = (s: string) => s.toLowerCase().replace(/[’']/g, '’');
const mots = (t: string): string[] => normal(t).match(/[\p{L}’-]+/gu) ?? [];
/** Expressions citées entre « ». */
const citations = (t: string) => [...t.matchAll(/« ([^»]+) »/g)].map((m) => m[1] ?? '');
const dansLeTexte = (citation: string, texte: string) =>
  expect(normal(texte), citation).toContain(normal(citation).replace(/[.…]+$/, ''));

describe('francais cm2 — lire et comprendre', () => {
  it('le chapitre compte les cinq notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm2-texte-narratif',
      'fcm2-texte-documentaire',
      'fcm2-inferences',
      'fcm2-sens-mot',
      'fcm2-personnages-narrateur',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    expect(new Set(FAITS_LECTURE_CM2.map((f) => f.id)).size).toBe(FAITS_LECTURE_CM2.length);
    for (const f of FAITS_LECTURE_CM2) {
      expect(getSource(f.source), f.source).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(7);
    }
    for (const s of skills) {
      expect(s.lesson.sources).toContain('francais-cycle3-2025');
      for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
      const steps = LEVELS.flatMap((l) => tirages(s.id, l).flatMap((q) => q.steps));
      for (const term of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(term, SUBJECT_GLOSSARIES.francais ?? []), term).toBe(true);
      // Les étapes mettent aussi la réponse en gras : seules les définitions (« Un **terme** ») sont des termes.
      for (const [, term = ''] of steps.join('\n').matchAll(/^(?:Un|Une|Le|La) \*\*([^*]+)\*\*/gm))
        expect(isDefined(term, SUBJECT_GLOSSARIES.francais ?? []), term).toBe(true);
    }
  });

  it('questions valides aux 5 niveaux, énoncés distincts, au moins deux pièges expliqués', () => {
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
          else if (q.answer.kind === 'match') expect(q.answer.left, q.prompt).toHaveLength(3);
          else throw new Error(`forme inattendue : ${q.prompt}`);
        }
      }
    }
  });

  it('niveaux 3 et 4 : on produit la réponse (saisie, ordre ou 5 paires)', () => {
    for (const s of skills) {
      for (const level of [3, 4] as const) {
        for (const q of tirages(s.id, level)) {
          if (q.answer.kind === 'match') expect(q.answer.left, q.prompt).toHaveLength(5);
          else expect(['text', 'order'], q.prompt).toContain(q.answer.kind);
        }
      }
    }
  });

  it('niveau 5 : un document long et un texte à 4 trous au moins', () => {
    for (const s of skills) {
      for (const q of tirages(s.id, 5)) {
        expect(q.figure?.kind, q.prompt).toBe('document');
        expect(q.figure?.kind === 'document' && q.figure.lines.length).toBeGreaterThanOrEqual(4);
        if (q.answer.kind !== 'cloze') throw new Error('forme inattendue');
        expect(q.answer.blanks.length).toBeGreaterThanOrEqual(4);
      }
    }
  });
});

describe('données', () => {
  it('textes longs : trois propositions distinctes ; expressions citées présentes dans le texte', () => {
    for (const t of [...LONGS_RECITS, ...LONGS_DOCUMENTS, ...LONGS_INFERENCE, ...LONGS_PERSONNAGES])
      for (const x of t.trous) {
        expect(new Set([x.bon, ...x.faux]).size, x.etiquette).toBe(3);
        for (const c of citations(x.preuve)) if (c.length > 8) dansLeTexte(c, t.lignes.join(' '));
      }
  });

  it('extraits : trois par genre ; sous-titres distincts', () => {
    for (const g of ['recit', 'poeme', 'theatre', 'documentaire'])
      expect(EXTRAITS.filter((x) => x.genre === g)).toHaveLength(3);
    for (const d of DOSSIERS) expect(new Set(d.paragraphes.map((p) => p.titre)).size).toBe(3);
  });

  it('récits dans le désordre : cinq événements distincts', () => {
    for (const r of RECITS_DANS_LE_DESORDRE) expect(new Set(r.ordre).size, r.titre).toBe(5);
  });

  it('information à prélever : un des mots attendus est écrit dans le document', () => {
    for (const s of INFOS_A_PRELEVER) {
      const texte = normal(s.lignes.join(' '));
      expect(
        s.accepted.some((a) => texte.includes(normal(a))),
        s.titre,
      ).toBe(true);
    }
  });

  it('énigmes : la réponse n’est pas écrite dans le texte', () => {
    for (const e of [...ENIGMES, ...ENIGMES_PIEGES]) {
      if (e.accepted.includes('le chien')) continue; // le coupable est cité : l’énigme est de le désigner.
      const texte = mots(e.lignes.join(' '));
      for (const a of e.accepted) expect(texte, a).not.toContain(normal(a));
    }
  });

  it('inférences : aucune déduction ne reprend un mot long de sa phrase ; déductions distinctes', () => {
    for (const [phrase, deduction] of PAIRES)
      expect(
        mots(deduction).filter((m) => m.length > 3 && mots(phrase).includes(m)),
        phrase,
      ).toEqual([]);
    expect(new Set(PAIRES.map(([, d]) => d)).size).toBe(PAIRES.length);
    expect(new Set(MOTIVATIONS.map(([, d]) => d)).size).toBe(MOTIVATIONS.length);
  });

  it('mots : dans le texte, cités, sens distincts entre eux et de leurs distracteurs', () => {
    const ids = new Set(FAITS_LECTURE_CM2.map((f) => f.id));
    for (const m of [...POLYSEMIE, ...MOTS_RARES]) {
      expect(m.lignes.join(' ').toLowerCase(), m.mot).toContain(m.mot);
      expect(ids.has(m.faitId), m.mot).toBe(true);
      expect(new Set([m.sens, ...m.faux.map(([f]) => f)]).size, m.mot).toBe(4);
      for (const c of citations(m.indice)) dansLeTexte(c, m.lignes.join(' '));
    }
    expect(new Set(POLYSEMIE.map((m) => m.sens)).size).toBe(POLYSEMIE.length);
    expect(new Set(MOTS_RARES.map((m) => m.sens)).size).toBe(MOTS_RARES.length);
    for (const r of RECITS_MOTS)
      for (const { mot, indice } of r.mots) {
        expect(r.lignes.join(' '), `${r.titre} ${mot}`).toContain(mot);
        for (const c of citations(indice)) dansLeTexte(c, r.lignes.join(' '));
      }
    for (const d of DERIVES) {
      expect(d.mot.endsWith(d.base), d.mot).toBe(true);
      expect(d.lignes[1], d.mot).toContain(d.mot);
    }
  });

  it('personnages : le nom attendu est dans le texte ; reprises présentes', () => {
    for (const q of QUI_RACONTE) expect(q.lignes.join(' '), q.bon).toContain(q.bon);
    for (const s of [...QUI_SE_CACHE, ...NARRATEURS_CACHES])
      expect(s.lignes.join(' '), s.titre).toContain(s.accepted[0]);
    for (const r of REPRISES)
      for (const [reprise, nom] of r.paires) {
        dansLeTexte(reprise.replace(/^(le |la |l’)/, ''), r.lignes.join(' '));
        expect(normal(r.lignes.join(' '))).toContain(normal(nom).replace(/^le /, ''));
      }
  });
});

describe('correction des réponses', () => {
  it('genre trompeur : « récit » accepté, l’autre genre refusé et expliqué', () => {
    const q = trouve('fcm2-texte-narratif', 4, 'Pilou');
    for (const t of ['récit', 'un texte narratif']) expect(check(q, saisie(t)).correct).toBe(true);
    const faux = check(q, saisie('un documentaire'));
    expect(faux.correct).toBe(false);
    expect(faux.why).toContain('relis');
  });

  it('récit à construire : seul l’ordre attendu est juste', () => {
    const q = trouve('fcm2-texte-narratif', 3, 'remets les phrases');
    if (q.answer.kind !== 'order') throw new Error('forme inattendue');
    expect(check(q, { kind: 'order', order: [...q.answer.correct] }).correct).toBe(true);
    expect(check(q, { kind: 'order', order: [...q.answer.correct].reverse() }).correct).toBe(false);
  });

  it('deux documents : « jeudi » accepté, « mercredi » refusé et expliqué', () => {
    const q = trouve('fcm2-texte-documentaire', 4, 'marché');
    expect(check(q, saisie('Jeudi')).correct).toBe(true);
    expect(check(q, saisie('mercredi')).why).toContain('mercredi');
  });

  it('inférences : « une piscine » accepté, « à la mer » refusé', () => {
    const q = trouve('fcm2-inferences', 4, 'Anouk');
    expect(check(q, saisie('à la piscine')).correct).toBe(true);
    expect(check(q, saisie('à la mer')).why).toContain('chlore');
  });

  it('mot à fabriquer : « illisible » seul est juste, « inlisible » est expliqué, la réponse reste cachée', () => {
    const q = trouve('fcm2-sens-mot', 4, 'à partir de « lisible »');
    expect(lignes(q)).not.toContain('illisible');
    expect(check(q, saisie('illisible')).correct).toBe(true);
    for (const t of ['inlisible', 'ilisible', 'lisible']) expect(check(q, saisie(t)).correct, t).toBe(false);
    expect(check(q, saisie('inlisible')).why).toContain('change d’écriture');
    const audible = trouve('fcm2-sens-mot', 4, 'à partir de « audible »');
    expect(check(audible, saisie('inaudible')).correct).toBe(true);
  });

  it('mot du texte : avec article ou à l’infinitif', () => {
    const q = trouve('fcm2-sens-mot', 3, 'un petit bateau');
    for (const t of ['embarcation', 'une embarcation']) expect(check(q, saisie(t)).correct).toBe(true);
  });

  it('narrateur caché : le prénom attendu, l’autre personnage expliqué', () => {
    const q = trouve('fcm2-personnages-narrateur', 4, 'piano');
    expect(check(q, saisie('maelle')).correct).toBe(true);
    expect(check(q, saisie('Léon')).why).toContain('frère');
  });
});
