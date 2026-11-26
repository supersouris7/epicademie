import { describe, expect, it } from 'vitest';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import type { Level, Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { FAITS_ELECTRICITE } from './donnees-electricite.ts';
import { PHYSIQUE_CHAPTERS } from './index.ts';

const notions = PHYSIQUE_CHAPTERS.find((c) => c.id === 'p4-electricite')?.skills ?? [];
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

const texte = (q: Question) => [q.prompt, ...(q.figure?.kind === 'document' ? q.figure.lines : [])].join(' ');
const bonne = (q: Question) => (q.answer.kind === 'choice' ? String(q.answer.options[q.answer.correct]) : '');
const valeur = (q: Question) => (q.answer.kind === 'number' ? q.answer.value.n / q.answer.value.d : Number.NaN);
const nombre = (s: string | undefined) => Number((s ?? '').replace(/\s/g, '').replace(',', '.'));
const N = '(\\d+(?:[\\s]\\d{3})*(?:,\\d+)?)';
const tous = (s: string, unite: string) =>
  [...s.matchAll(new RegExp(`${N} ${unite}(?![\\wÀ-ÿ])`, 'g'))].map((m) => nombre(m[1]));
const un = (s: string, unite: string) => tous(s, unite)[0] ?? Number.NaN;

describe('physique-chimie 4e : « Électricité »', () => {
  it('porte les quatre notions du référentiel, à 5 niveaux ; la loi d’Ohm garde son identifiant', () => {
    expect(notions.map((s) => s.id)).toEqual(['p4-tension', 'p4-intensite', 'p4-lois-circuits', 'p4-loi-ohm']);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
    expect(notions.at(-1)?.version).toBe(2);
  });

  it('chaque source citée existe et porte un fait ; les mots en gras sont définis', () => {
    for (const s of notions) {
      for (const id of s.lesson.sources ?? []) {
        expect(getSource(id), id).toBeDefined();
        expect(id === 'cycle4-2020' || FAITS_ELECTRICITE.some((f) => f.source === id), id).toBe(true);
      }
      expect(s.lesson.source, s.id).toContain('«');
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

  it('une saisie sans accents est acceptée', () => {
    const q = tirages('p4-intensite', 3).find((x) => x.answer.kind === 'cloze');
    expect(q && check(q, { kind: 'cloze', answers: ['serie', 'A'] }).correct).toBe(true);
  });

  it('tension et intensité : conversions et comparaisons refaites à partir de l’énoncé', () => {
    for (const [id, base] of [
      ['p4-tension', 'V'],
      ['p4-intensite', 'A'],
    ] as const) {
      let vus = 0;
      for (const q of tirages(id, 4)) {
        if (q.answer.kind !== 'number') continue;
        const attendu = q.answer.unit === base ? un(q.prompt, `m${base}`) / 1000 : un(q.prompt, base) * 1000;
        expect(valeur(q), q.prompt).toBeCloseTo(attendu, 8);
        vus += 1;
      }
      expect(vus).toBeGreaterThan(50);
    }
    for (const q of tirages('p4-tension', 5)) {
      const lignes = q.figure?.kind === 'document' ? q.figure.lines : [];
      const justes = lignes.filter((l) => Math.abs(un(l, 'mV') / 1000 - un(l, 'V')) < 0.001);
      expect(justes).toHaveLength(1);
      expect(justes[0]?.startsWith(bonne(q).replace('La lampe', 'Lampe')), texte(q)).toBe(true);
    }
    for (const q of tirages('p4-intensite', 5)) {
      const lignes = q.figure?.kind === 'document' ? q.figure.lines : [];
      const limite = un(lignes[0] ?? '', 'A') * 1000;
      const trop = lignes.slice(2).filter((l) => un(l, 'mA') > limite);
      expect(trop).toHaveLength(1);
      expect(trop[0]?.toLowerCase(), texte(q)).toContain(bonne(q).toLowerCase());
    }
  });

  it('lois des circuits : chaque calcul est refait à partir de l’énoncé', () => {
    for (const q of tirages('p4-lois-circuits', 3)) {
      const t = q.prompt;
      const volts = tous(t, 'V');
      const amperes = tous(t, 'A');
      const attendu = t.includes('deux lampes en série')
        ? (volts[0] ?? 0) - (volts[1] ?? 0)
        : t.includes('branche principale')
          ? (amperes[0] ?? 0) + (amperes[1] ?? 0)
          : t.includes('en dérivation aux bornes')
            ? (volts[0] ?? 0)
            : un(t, 'mA');
      expect(valeur(q), t).toBeCloseTo(attendu, 8);
    }
    for (const q of tirages('p4-lois-circuits', 4)) {
      const t = q.prompt;
      const v = tous(t, 'V');
      const ma = tous(t, 'mA');
      const attendu = t.startsWith('Trois dipôles')
        ? (v[0] ?? 0) - (v[1] ?? 0) - (v[2] ?? 0)
        : t.startsWith('À un nœud')
          ? un(t, 'A') * 1000 - (ma[0] ?? 0)
          : ma.reduce((s, x) => s + x, 0) / 1000;
      expect(valeur(q), t).toBeCloseTo(attendu, 8);
    }
    for (const q of tirages('p4-lois-circuits', 5)) {
      const t = texte(q);
      const [pile = 0, lampe = 0] = tous(t, 'V');
      const attendu = q.prompt.includes('tension') ? pile - lampe : un(t, 'A') * 1000 - un(t, 'mA');
      expect(attendu).toBeGreaterThan(0);
      expect(valeur(q), t).toBeCloseTo(attendu, 8);
    }
  });

  it('loi d’Ohm : calculs et mesures refaits à partir de l’énoncé', () => {
    for (const q of tirages('p4-loi-ohm', 3)) {
      const t = q.prompt;
      const res = un(t, 'Ω');
      const attendu = t.includes('Quelle est la tension') ? res * un(t, 'A') : un(t, 'V') / res;
      expect(valeur(q), t).toBeCloseTo(attendu, 8);
    }
    for (const q of tirages('p4-loi-ohm', 4)) {
      const t = q.prompt;
      const attendu = t.includes('sa résistance')
        ? un(t, 'V') / (un(t, 'mA') / 1000)
        : (un(t, 'V') / un(t, 'Ω')) * 1000;
      expect(valeur(q), t).toBeCloseTo(attendu, 8);
    }
    let documents = 0;
    for (const q of tirages('p4-loi-ohm', 5)) {
      const lignes = q.figure?.kind === 'document' ? q.figure.lines : [];
      if (q.answer.kind === 'number') {
        const [pile = 0, lampe = 0] = tous(lignes.join(' '), 'V');
        expect(valeur(q), texte(q)).toBeCloseTo(((pile - lampe) / un(lignes.join(' '), 'Ω')) * 1000, 8);
      } else {
        const proportionnels = lignes.filter((l) => {
          const u = tous(l, 'V');
          const i = tous(l, 'mA');
          return new Set(u.map((x, k) => (x / (i[k] ?? 1)).toFixed(6))).size === 1;
        });
        expect(proportionnels).toHaveLength(1);
        expect(proportionnels[0]?.startsWith(bonne(q).replace('Le dipôle', 'Dipôle')), texte(q)).toBe(true);
      }
      documents += 1;
    }
    expect(documents).toBe(300);
  });
});
