import { describe, expect, it } from 'vitest';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import type { Level, Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { FAITS, MOLECULES } from './donnees-atomes.ts';
import { PHYSIQUE_CHAPTERS } from './index.ts';

const notions = PHYSIQUE_CHAPTERS.find((c) => c.id === 'p4-atomes')?.skills ?? [];
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];

const tirages = (id: string, level: Level, n = 300): Question[] => {
  const s = notions.find((x) => x.id === id);
  if (!s) throw new Error(id);
  return Array.from({ length: n }, (_, seed) => ({
    traps: [],
    targetSeconds: 30,
    ...s.generate(createRng(seed), level),
    skillId: s.id,
    level,
    seed,
  }));
};
const texte = (q: Question) => `${q.prompt} ${q.figure?.kind === 'document' ? q.figure.lines.join(' ') : ''}`;
const juste = (q: Question, n: number) => check(q, { kind: 'number', text: String(n).replace('.', ',') }).correct;

describe('physique-chimie 4e : « Atomes et transformations »', () => {
  it('porte les cinq notions du référentiel, à 5 niveaux', () => {
    expect(notions.map((s) => s.id)).toEqual([
      'p4-atomes-molecules',
      'p4-formules-chimiques',
      'p4-transformation-chimique',
      'p4-combustions',
      'p4-conservation-masse',
    ]);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
  });

  it('chaque source citée existe et porte un fait ; les mots en gras sont définis', () => {
    for (const s of notions) {
      for (const id of s.lesson.sources ?? []) {
        expect(getSource(id), id).toBeDefined();
        expect(
          FAITS.some((f) => f.source === id),
          id,
        ).toBe(true);
      }
      for (const t of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(t, SUBJECT_GLOSSARIES.sciences ?? []), t).toBe(true);
    }
  });

  it('questions cohérentes aux 5 niveaux, distinctes d’un niveau à l’autre, avec des pièges expliqués', () => {
    for (const s of notions) {
      const prompts = LEVELS.map((level) => {
        const qs = tirages(s.id, level);
        expect(validateVariants(qs), `${s.id} ${level}`).toEqual([]);
        return new Set(qs.map((q) => q.prompt));
      });
      for (const [i, a] of prompts.entries())
        for (const b of prompts.slice(i + 1))
          expect(
            [...a].some((p) => b.has(p)),
            s.id,
          ).toBe(false);
      const pieges = new Set(LEVELS.flatMap((l) => tirages(s.id, l).flatMap((q) => q.traps.map((t) => t.why))));
      expect(pieges.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('atomes et formules : les décomptes sont refaits à partir des formules', () => {
    for (const q of tirages('p4-formules-chimiques', 4)) {
      const m = /On écrit (\d+) (\S+) pour.*atomes (?:de |d’)(\S+) cela/.exec(q.prompt);
      const [, k, formule, nom] = m ?? [];
      const symbole = { carbone: 'C', hydrogène: 'H', azote: 'N', oxygène: 'O' }[nom ?? ''] ?? '?';
      const indice = new RegExp(`${symbole}([₂₄]?)`).exec(formule ?? '')?.[1];
      const parMolecule = indice === '₂' ? 2 : indice === '₄' ? 4 : 1;
      expect(juste(q, Number(k) * parMolecule), q.prompt).toBe(true);
    }
    for (const q of tirages('p4-atomes-molecules', 5)) {
      const t = texte(q);
      const [, x, , y] = /contient (\d+) molécules (.+?) et (\d+) molécules/.exec(t) ?? [];
      const par = [...t.matchAll(/Une molécule [^:]+ : ([^.]+)\./g)].map((m) =>
        Number(/(\d+) atomes? d’oxygène/.exec(m[1] ?? '')?.[1]),
      );
      expect(juste(q, Number(x) * (par[0] ?? 0) + Number(y) * (par[1] ?? 0)), t).toBe(true);
    }
  });

  it('formules : la formule attendue est acceptée avec des chiffres ordinaires', () => {
    expect(new Set(MOLECULES.map((m) => m.formule)).size).toBe(MOLECULES.length);
    for (const level of [3, 5] as const)
      for (const q of tirages('p4-formules-chimiques', level)) {
        if (q.answer.kind !== 'text') throw new Error('saisie attendue');
        const f = (q.answer.accepted[0] ?? '').replace('₂', '2').replace('₄', '4');
        expect(check(q, { kind: 'text', text: f }).correct, f).toBe(true);
      }
  });

  it('transformation : l’équation fournie est équilibrée et le décompte la respecte', () => {
    const coefficients: Record<string, number> = { 'de dihydrogène': 2, 'de dioxygène': 1, 'd’eau': 2 };
    const couples = new Set<string>();
    for (const q of tirages('p4-transformation-chimique', 4)) {
      const [, eq, n, donne = '', cherche = ''] =
        /est (.+?)\. (?:Pour former|Quand) (\d+) molécules (d’eau|de \S+?)(?: sont consommées)?, combien de molécules (d’eau|de \S+)/.exec(
          q.prompt,
        ) ?? [];
      expect(eq, q.prompt).toBe('2 H₂ + O₂ → 2 H₂O');
      const ratio = (coefficients[cherche] ?? 0) / (coefficients[donne] ?? 0);
      expect(ratio, q.prompt).not.toBe(1);
      expect(juste(q, Number(n) * ratio), q.prompt).toBe(true);
      expect(juste(q, Number(n)), q.prompt).toBe(false);
      couples.add(`${donne} → ${cherche}`);
    }
    expect(couples.size).toBe(4);
  });

  it('combustions : au niveau 4, un cinquième de l’air ; au niveau 5, la conclusion suit les restes', () => {
    for (const q of tirages('p4-combustions', 4)) {
      const v = /dans (\d+) L d’air/.exec(q.prompt)?.[1];
      if (v) expect(juste(q, Number(v) / 5), q.prompt).toBe(true);
    }
    for (const q of tirages('p4-combustions', 5)) {
      if (q.answer.kind !== 'choice') throw new Error('choix attendu');
      const t = texte(q);
      const attendu = t.includes('plus de dioxygène')
        ? 'Le comburant est épuisé'
        : t.includes('plus de carbone')
          ? 'Le combustible est épuisé'
          : 'Le combustible et le comburant sont tous deux épuisés';
      expect(q.answer.options[q.answer.correct], t).toBe(attendu);
    }
  });

  it('conservation : les masses des niveaux 3 à 5 sont recalculées à partir de l’énoncé', () => {
    for (const q of tirages('p4-conservation-masse', 3)) {
      const [, a, b] = /entièrement (\d+) g .+? avec (\d+) g/.exec(q.prompt) ?? [];
      expect(juste(q, Number(a) + Number(b)), q.prompt).toBe(true);
    }
    for (const q of tirages('p4-conservation-masse', 4)) {
      const [, total, unite, autre] = /forme (\d+) (m?g) .+? consommant (\d+) g/.exec(q.prompt) ?? [];
      expect(juste(q, Number(total) / (unite === 'mg' ? 1000 : 1) - Number(autre)), q.prompt).toBe(true);
    }
    for (const q of tirages('p4-conservation-masse', 5)) {
      const t = texte(q);
      const avant = Number(/indique (\d+) g \(récipient/.exec(t)?.[1]);
      const apres = /la balance indique ([\d,]+) g\.$/.exec(t)?.[1];
      const vide = Number(/vide a une masse de (\d+)/.exec(t)?.[1]);
      const attendu = apres ? Math.round((avant - Number(apres.replace(',', '.'))) * 10) / 10 : avant - vide;
      expect(juste(q, attendu), t).toBe(true);
    }
  });
});
