import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import {
  DOCUMENTS,
  ENIGMES,
  ENIGMES_PIEGES,
  FAITS_LECTURE,
  HISTOIRES,
  LONGS_INFERENCE,
  LONGS_QUI,
  MOTS_PLUSIEURS_SENS,
  MOTS_RARES,
  PLANS,
  RECITS_DESORDRE,
  RECITS_MOTS,
  RECITS_QUATRE,
  TEXTES_PIEGES,
} from './lecture.donnees.ts';
import { FCM1_LECTURE } from './lecture.ts';

const skills = FCM1_LECTURE;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const tirages = (id: string, level: Level) => Array.from({ length: 300 }, (_, seed) => generate(id, level, seed));
const saisie = (text: string) => ({ kind: 'text' as const, text });
const trouve = (id: string, level: Level, morceau: string) => {
  const q = tirages(id, level).find((x) => x.prompt.includes(morceau));
  if (!q) throw new Error(`aucune question « ${morceau} »`);
  return q;
};
const lignes = (q: Question) => (q.figure?.kind === 'document' ? q.figure.lines.join(' ') : '');
const normal = (s: string) => s.toLowerCase().replace(/[’']/g, '’');

describe('francais cm1 — lire et comprendre', () => {
  it('le chapitre compte les cinq notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm1-lire-qui-quoi',
      'fcm1-inferences',
      'fcm1-sens-mot-texte',
      'fcm1-ordre-recit',
      'fcm1-consigne-document',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    expect(new Set(FAITS_LECTURE.map((f) => f.id)).size).toBe(FAITS_LECTURE.length);
    for (const f of FAITS_LECTURE) {
      expect(getSource(f.source), f.source).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(7);
    }
    for (const s of skills) {
      for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
      const steps = LEVELS.flatMap((l) => tirages(s.id, l).map((q) => q.steps[0] ?? ''));
      for (const term of [...s.lesson.memo, ...steps].flatMap(boldTerms))
        expect(isDefined(term, SUBJECT_GLOSSARIES.francais ?? []), term).toBe(true);
    }
  });

  it('questions valides aux 5 niveaux, énoncés distincts d’un niveau à l’autre, deux pièges au moins', () => {
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

  it('niveau 5 : un document et un texte à trous', () => {
    for (const s of skills) {
      for (const q of tirages(s.id, 5)) {
        expect(q.figure?.kind, q.prompt).toBe('document');
        if (q.answer.kind !== 'cloze') throw new Error('forme inattendue');
        expect(q.answer.blanks.length).toBeGreaterThanOrEqual(4);
      }
    }
  });
});

describe('données', () => {
  it('qui, quoi, où, quand : chaque réponse est écrite dans le texte', () => {
    for (const h of HISTOIRES) {
      const texte = normal(h.lignes.join(' '));
      for (const i of Object.values(h.infos)) {
        expect(texte, `${h.titre} : ${i.rep}`).toContain(normal(i.rep));
        expect(texte, `${h.titre} : ${i.autre}`).not.toContain(normal(i.autre));
      }
    }
    for (const t of TEXTES_PIEGES) {
      const texte = normal(t.lignes.join(' '));
      for (const q of t.questions) expect(q.accepted.some((a) => texte.includes(normal(a)))).toBe(true);
    }
  });

  it('textes longs : trous distincts', () => {
    for (const t of [...LONGS_QUI, ...LONGS_INFERENCE, ...DOCUMENTS])
      for (const x of t.trous) expect(new Set([x.bon, ...x.faux]).size, x.etiquette).toBe(3);
  });

  it('sens des mots : le mot est dans le texte, sa citation existe, les sens sont distincts', () => {
    const faits = new Set(FAITS_LECTURE.map((f) => f.id));
    for (const m of [...MOTS_PLUSIEURS_SENS, ...MOTS_RARES]) {
      expect(m.lignes.join(' ').toLowerCase(), m.mot).toContain(m.mot);
      expect(faits.has(m.faitId), m.mot).toBe(true);
      expect(new Set([m.sens, ...m.faux.map(([f]) => f)]).size, m.mot).toBe(4);
    }
    for (const r of RECITS_MOTS) for (const m of r.mots) expect(r.lignes.join(' '), `${r.titre} ${m}`).toContain(m);
  });

  it('récits : événements distincts', () => {
    for (const r of [...RECITS_QUATRE, ...RECITS_DESORDRE])
      expect(new Set(r.evenements).size, r.titre).toBe(r.evenements.length);
  });

  it('plans : un signe par case, chaque signe de la légende est placé une fois', () => {
    for (const p of PLANS) {
      expect(Object.values(p.cases).sort(), p.titre).toEqual(p.legende.map((o) => o.signe).sort());
      for (const c of Object.keys(p.cases)) expect(c).toMatch(/^[ABC][123]$/);
    }
  });

  it('énigmes : la réponse n’est pas écrite dans le texte', () => {
    for (const e of [...ENIGMES, ...ENIGMES_PIEGES]) {
      const texte = normal(e.lignes.join(' '));
      for (const a of e.accepted) expect(texte.split(/[^a-zà-ÿœ’]+/), a).not.toContain(normal(a));
    }
  });
});

describe('correction des réponses', () => {
  it('qui, quoi, où : « dans le jardin » accepté, une autre information refusée et expliquée', () => {
    const q = trouve('fcm1-lire-qui-quoi', 3, 'Où Lina');
    for (const t of ['dans le jardin de l’école', 'le jardin']) expect(check(q, saisie(t)).correct).toBe(true);
    const faux = check(q, saisie('Lina'));
    expect(faux.correct).toBe(false);
    expect(faux.why).toContain('Qui ?');
  });

  it('pièges : le mauvais jour est expliqué', () => {
    const q = trouve('fcm1-lire-qui-quoi', 4, 'au musée');
    expect(check(q, saisie('Jeudi')).correct).toBe(true);
    expect(check(q, saisie('lundi')).why).toContain('autre moment');
  });

  it('inférences : « l’hiver » accepté, « été » refusé et expliqué', () => {
    const q = trouve('fcm1-inferences', 3, 'saison');
    expect(check(q, saisie('l’hiver')).correct).toBe(true);
    expect(check(q, saisie('été')).why).toContain('neige');
  });

  it('sens d’un mot : le mot du texte, avec ou sans article', () => {
    const q = trouve('fcm1-sens-mot-texte', 3, 'chemin étroit');
    for (const t of ['sentier', 'un sentier']) expect(check(q, saisie(t)).correct).toBe(true);
    expect(lignes(q)).toContain('sentier');
    expect(check(q, saisie('marcheurs')).correct).toBe(false);
  });

  it('ordre : seul l’ordre du récit est juste', () => {
    const q = trouve('fcm1-ordre-recit', 4, 'ne suit pas l’ordre');
    if (q.answer.kind !== 'order') throw new Error('forme inattendue');
    expect(check(q, { kind: 'order', order: [...q.answer.correct] }).correct).toBe(true);
    expect(check(q, { kind: 'order', order: [...q.answer.correct].reverse() }).correct).toBe(false);
  });

  it('plan : la case s’écrit « B2 » ou « b 2 » ; une autre case est expliquée', () => {
    const q = trouve('fcm1-consigne-document', 3, 'un banc');
    if (q.answer.kind !== 'text') throw new Error('forme inattendue');
    const [bon = ''] = q.answer.accepted;
    expect(check(q, saisie(bon.toLowerCase())).correct).toBe(true);
    expect(check(q, saisie(`${bon.charAt(0)} ${bon.charAt(1)}`)).correct).toBe(true);
    const [piege] = q.traps;
    if (!piege || !('text' in piege)) throw new Error('piège attendu');
    expect(check(q, saisie(piege.text)).why).toContain('légende');
  });
});
