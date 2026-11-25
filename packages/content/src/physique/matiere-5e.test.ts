import { describe, expect, it } from 'vitest';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import type { Level, Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { FAITS } from './donnees-matiere.ts';
import { PHYSIQUE_CHAPTERS } from './index.ts';

const chapitre = PHYSIQUE_CHAPTERS.find((c) => c.id === 'p5-matiere');
const notions = chapitre?.skills ?? [];
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
const nombres = (re: RegExp, s: string) => Number((re.exec(s)?.[1] ?? 'NaN').replace(',', '.'));

describe('physique-chimie 5e : « Organisation de la matière »', () => {
  it('porte les cinq notions du référentiel, à 5 niveaux, l’identifiant existant conservé', () => {
    expect(notions.map((s) => s.id)).toEqual([
      'p5-etats',
      'p5-corps-purs-melanges',
      'p5-masse-volumique',
      'p5-solubilite',
      'p5-conservation-masse',
    ]);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
    expect(notions.find((s) => s.id === 'p5-masse-volumique')?.version).toBe(2);
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

  it('masse volumique : les calculs des niveaux 3 à 5 sont refaits à partir de l’énoncé', () => {
    let vus = 0;
    for (const q of [...tirages('p5-masse-volumique', 3), ...tirages('p5-masse-volumique', 4)]) {
      if (q.answer.kind !== 'number') continue;
      const t = texte(q);
      const rho = nombres(/masse volumique de ([\d,]+) g/, t);
      const masse = nombres(/(?:masse de|avoir) ([\d,]+) g/, t);
      const attendu =
        q.answer.unit === 'g'
          ? rho * nombres(/objet de (\d+) cm³/, t)
          : q.answer.unit === 'cm³'
            ? nombres(/en avoir ([\d,]+) g/, t) / nombres(/volumique de ([\d,]+) g/, t)
            : q.answer.unit === 'g/mL'
              ? masse / (nombres(/à (\d+) mL quand/, t) - nombres(/de (\d+) mL à/, t))
              : masse / nombres(/volume de (\d+) cm³/, t);
      expect(q.answer.value.n / q.answer.value.d, t).toBeCloseTo(attendu, 8);
      vus += 1;
    }
    expect(vus).toBeGreaterThan(300);
    for (const q of tirages('p5-masse-volumique', 5)) {
      const t = texte(q);
      const volume = nombres(/mL avant immersion, (\d+) mL/, t) - nombres(/(\d+) mL avant/, t);
      const rho = nombres(/Masse de l’objet : ([\d\s]+(?:,\d+)?) g/, t.replace(/(\d)\s(\d{3})/g, '$1$2')) / volume;
      if (q.answer.kind !== 'choice') throw new Error('choix attendu');
      const lettre = q.answer.options[q.answer.correct]?.slice(-1) ?? '';
      expect(nombres(new RegExp(`Substance ${lettre} : masse volumique ([\\d,]+)`), t), t).toBeCloseTo(rho, 8);
    }
  });

  it('conservation : la masse se conserve, y compris après fusion (masse volumique recalculée)', () => {
    for (const q of tirages('p5-conservation-masse', 5)) {
      const t = texte(q);
      const m = nombres(/masse volumique (\d+) g/, t) * nombres(/volume (\d+) cm³\. Après/, t);
      const attendu = q.prompt.includes('en grammes') ? m : m / nombres(/Après la fusion : volume (\d+)/, t);
      expect(check(q, { kind: 'number', text: String(attendu) }).correct, t).toBe(true);
    }
  });

  it('solubilité : masse maximale, dépôt et estimation recalculés', () => {
    let vus = 0;
    for (const level of [4, 5] as const)
      for (const q of tirages('p5-solubilite', level)) {
        if (q.answer.kind !== 'number') continue;
        const t = texte(q);
        let attendu: number;
        if (level === 4) {
          const max = nombres(/est de (\d+) g par litre/, t) * nombres(/dans ([\d,]+) L/, t);
          const verse = nombres(/On en verse (\d+) g/, t);
          attendu = Number.isNaN(verse) ? max : verse - max;
        } else {
          attendu = (nombres(/Jusqu’à (\d+) g/, t) * 1000) / nombres(/verse (\d+) mL/, t);
        }
        expect(check(q, { kind: 'number', text: String(Math.round(attendu * 100) / 100) }).correct, t).toBe(true);
        vus += 1;
      }
    expect(vus).toBeGreaterThan(200);
  });

  it('états : au niveau 5, l’état annoncé correspond aux températures de la fiche', () => {
    let vus = 0;
    for (const q of tirages('p5-etats', 5)) {
      if (q.answer.kind !== 'choice') continue;
      const t = texte(q);
      const x = nombres(/à (-?\d+) °C \?/, t);
      const tf = nombres(/fusion : (-?\d+)/, t);
      const te = nombres(/ébullition : (-?\d+)/, t);
      expect(q.answer.options[q.answer.correct], t).toBe(x < tf ? 'Solide' : x < te ? 'Liquide' : 'Gazeux');
      vus += 1;
    }
    expect(vus).toBeGreaterThan(50);
  });
});
