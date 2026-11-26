import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import {
  FAITS_CONJUGAISON_6E,
  ORDRES,
  REGULIERS_6,
  VERBES_VAR,
  composeAu,
  conditionnel,
  conditionnels,
  imperatif,
  type VerbeOrdre,
} from './conjugaison-6e.donnees.ts';
import { F6_CONJUGAISON, RECITS_MARQUES, decoupe } from './conjugaison-6e.ts';
import { PERSONNES } from './present.donnees.ts';
import { conjugue } from './temps.donnees.ts';

const skills = F6_CONJUGAISON;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const tirages = (id: string, level: Level) => Array.from({ length: 200 }, (_, seed) => generate(id, level, seed));
const saisie = (q: Question) => {
  if (q.answer.kind !== 'text') throw new Error('forme inattendue');
  return q.answer.accepted[0] ?? '';
};

describe('francais 6e — conjugaison', () => {
  it('le chapitre compte les cinq notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'f6-imperatif-present',
      'f6-conditionnel-present',
      'f6-marques-temps',
      'f6-passe-compose-plus-que-parfait',
      'f6-variations-radical',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    expect(new Set(FAITS_CONJUGAISON_6E.map((f) => f.id)).size).toBe(FAITS_CONJUGAISON_6E.length);
    for (const f of FAITS_CONJUGAISON_6E) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(7);
    }
    for (const s of skills) {
      for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
      for (const term of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(term, SUBJECT_GLOSSARIES.francais ?? []), term).toBe(true);
    }
  });

  it('questions valides et distinctes aux 5 niveaux, réponses acceptées, pièges refusés', () => {
    for (const s of skills) {
      let niveauxAvecPieges = 0;
      const enonces = new Set<string>();
      for (const level of LEVELS) {
        const qs = tirages(s.id, level);
        expect(validateVariants(qs), `${s.id} N${level}`).toEqual([]);
        if (qs.every((q) => q.traps.length >= 2)) niveauxAvecPieges++;
        enonces.add(qs.map((q) => q.prompt).join('|'));
        for (const q of qs) {
          expect(JSON.stringify(q), `${s.id} N${level}`).not.toContain('undefined');
          if (q.answer.kind !== 'text') continue;
          for (const text of q.answer.accepted) expect(check(q, { kind: 'text', text }).correct).toBe(true);
        }
      }
      expect(niveauxAvecPieges, s.id).toBeGreaterThanOrEqual(2);
      expect(enonces.size, s.id).toBe(5);
    }
  });
});

describe('formes de la conjugaison de 6e', () => {
  it('impératif : pas de « s » au singulier des verbes en -er', () => {
    expect(imperatif('chanter', 'tu')).toBe('chante');
    expect(imperatif('aller', 'tu')).toBe('va');
    expect(imperatif('finir', 'tu')).toBe('finis');
    for (const v of Object.keys(ORDRES) as VerbeOrdre[])
      if (v.endsWith('er')) expect(imperatif(v, 'tu').endsWith('s'), v).toBe(false);
  });

  it('conditionnel : le « r » du futur puis les fins de l’imparfait', () => {
    for (const v of REGULIERS_6)
      for (const p of PERSONNES) {
        expect(conditionnel(v, p).startsWith(conjugue('futur', v, 'je').slice(0, -2)), `${v} ${p}`).toBe(true);
        expect(conditionnel(v, p)).toMatch(/r(ais|ait|ions|iez|aient)$/);
      }
    expect(conditionnels('répéter', 'je')).toEqual(['répéterais', 'répèterais']);
  });

  it('découpe : début + marques de temps + marque de personne', () => {
    for (const v of REGULIERS_6)
      for (const p of PERSONNES)
        for (const t of ['imparfait', 'futur', 'conditionnel présent'] as const) {
          const d = decoupe(t, v, p);
          expect(`${d.debut}${d.temps.join('')}${d.personne}`, `${v} ${p} ${t}`).toBe(d.forme);
          expect(d.debut.length).toBeGreaterThan(0);
        }
    expect(decoupe('conditionnel présent', 'chanter', 'nous')).toMatchObject({ temps: ['r', 'i'], personne: 'ons' });
    expect(decoupe('impératif présent', 'finir', 'vous')).toMatchObject({ debut: 'finiss', temps: [], personne: 'ez' });
  });

  it('temps composés : auxiliaire et accord avec être', () => {
    const elles = { texte: 'elles', personne: 'ils' as const, genre: 'f' as const };
    expect(composeAu('plus-que-parfait', 'partir', elles)).toBe('étaient parties');
    expect(composeAu('passé composé', 'chanter', elles)).toBe('ont chanté');
  });

  it('variations : tous les verbes ont leur conditionnel relevé', () => {
    for (const v of VERBES_VAR) for (const p of PERSONNES) expect(conditionnel(v, p).length).toBeGreaterThan(2);
    expect(conditionnel('envoyer', 'je')).toBe('enverrais');
  });
});

describe('réponses des niveaux', () => {
  it('conditionnel niveaux 3 et 4 : ni le futur ni l’imparfait ne sont acceptés', () => {
    for (const level of [3, 4] as const)
      for (const q of tirages('f6-conditionnel-present', level))
        expect(saisie(q)).toMatch(/r(ais|ait|ions|iez|aient)$/);
  });

  it('conditionnel niveau 5 : phrases lisibles, quatre trous', () => {
    for (const q of tirages('f6-conditionnel-present', 5)) {
      if (q.answer.kind !== 'cloze') throw new Error('forme inattendue');
      expect(q.answer.blanks).toHaveLength(4);
      expect(q.answer.parts.join('___')).toMatch(/^Phrase 1 : Si .+ ___ .+, .+ ___ .+\. Phrase 2 : Si .+ ___ .+\.$/);
    }
  });

  it('marques niveau 5 : texte suivi, trois verbes dont on donne temps et marques', () => {
    const temps = new Set<string>();
    let repetitions = 0;
    for (const q of tirages('f6-marques-temps', 5)) {
      if (q.answer.kind !== 'cloze' || q.figure?.kind !== 'document') throw new Error('forme inattendue');
      const { blanks } = q.answer;
      expect(blanks.map((b) => b.mode)).toEqual(Array(3).fill(['list', 'list', 'text']).flat());
      const texte = q.figure.lines.join(' ');
      expect(texte).toMatch(/Si .+ (était|avions|avais|avait) .+!/);
      for (const lettre of ['A', 'B', 'C']) expect(texte).toContain(`(${lettre})`);
      const choisis = [0, 3, 6].map((i) => {
        const b = blanks[i];
        return b?.mode === 'list' ? b.options[b.correct] : undefined;
      });
      for (const t of choisis) temps.add(t ?? '');
      if (new Set(choisis).size < 3) repetitions++;
    }
    expect(temps.size).toBe(4);
    expect(repetitions).toBeGreaterThan(50);
  });

  it('marques niveau 5 : chaque verbe des textes est régulier et accordé à son sujet', () => {
    for (const r of RECITS_MARQUES) {
      const formes = r.phrases.map(([, x]) => decoupe(x.t, x.v, x.p).forme);
      expect(new Set(formes).size, r.titre).toBe(formes.length);
      for (const [avant, x] of r.phrases) {
        expect(REGULIERS_6).toContain(x.v);
        if (x.t === 'impératif présent') expect(avant).toBe('');
        if (x.t === 'conditionnel présent') expect(avant).toMatch(/^Si /);
      }
    }
  });

  it('QCM : la bonne réponse n’est pas toujours la plus longue ni la plus courte', () => {
    for (const s of skills)
      for (const level of [1, 2] as const) {
        const qs = tirages(s.id, level).filter((q) => q.answer.kind === 'choice');
        if (qs.length === 0) continue;
        const extreme = (f: (a: number, b: number) => boolean) =>
          qs.filter((q) => {
            if (q.answer.kind !== 'choice') return false;
            const { options, correct } = q.answer;
            const n = options[correct]?.length ?? 0;
            return options.every((o, i) => i === correct || f(n, o.length));
          }).length / qs.length;
        // L’impératif est plus court par nature au niveau 1 : le sujet manque, c’est le critère enseigné.
        if (s.id === 'f6-imperatif-present' && level === 1) continue;
        // Le conditionnel cumule les marques au niveau 1 : c’est le critère enseigné.
        if (s.id === 'f6-conditionnel-present') continue;
        expect(
          extreme((a, b) => a > b),
          `${s.id} N${level} longue`,
        ).toBeLessThan(0.75);
        expect(
          extreme((a, b) => a < b),
          `${s.id} N${level} courte`,
        ).toBeLessThan(0.75);
      }
  });
});
