import { describe, expect, it } from 'vitest';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import type { Level, Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { FAITS_MOUVEMENT } from './donnees-mouvement.ts';
import { PHYSIQUE_CHAPTERS } from './index.ts';

const notions = PHYSIQUE_CHAPTERS.find((c) => c.id === 'p5-mouvement')?.skills ?? [];
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

const lignes = (q: Question) => (q.figure?.kind === 'document' ? q.figure.lines : []);
const bonne = (q: Question): string => (q.answer.kind === 'choice' ? String(q.answer.options[q.answer.correct]) : '');
const mot = (q: Question): string => (q.answer.kind === 'text' ? (q.answer.accepted[0] ?? '') : bonne(q));
const metres = (s: string) => [...s.matchAll(/(\d+) m\b/g)].map((m) => Number(m[1]));
/** Allure déduite des distances parcourues pendant des durées égales. */
const allure = (d: readonly number[]) => {
  expect(d.length).toBeGreaterThan(1);
  const ecarts = d.slice(1).map((x, i) => x - (d[i] ?? 0));
  if (ecarts.every((e) => e === 0)) return 'uniforme';
  if (ecarts.every((e) => e > 0)) return 'accéléré';
  if (ecarts.every((e) => e < 0)) return 'ralenti';
  throw new Error(`allure indéterminée : ${d.join(' ')}`);
};
const differences = (p: readonly number[]) => p.slice(1).map((x, i) => Math.abs(x - (p[i] ?? 0)));

describe('physique-chimie 5e : « Mouvement »', () => {
  it('porte les quatre notions du référentiel, à 5 niveaux', () => {
    expect(notions.map((s) => s.id)).toEqual([
      'p5-trajectoire',
      'p5-referentiel',
      'p5-mouvement-uniforme',
      'p5-vitesse-moyenne',
    ]);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
  });

  it('chaque source citée existe et porte un fait ; les mots en gras sont définis', () => {
    for (const s of notions) {
      for (const id of s.lesson.sources ?? []) {
        expect(getSource(id), id).toBeDefined();
        expect(id === 'cycle4-2020' || FAITS_MOUVEMENT.some((f) => f.source === id), id).toBe(true);
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

  it('la bonne réponse des QCM n’est pas toujours à la même place', () => {
    for (const s of notions)
      for (const level of LEVELS) {
        const places = tirages(s.id, level).flatMap((q) => (q.answer.kind === 'choice' ? [q.answer.correct] : []));
        if (places.length > 0) expect(new Set(places).size, `${s.id} ${level}`).toBeGreaterThan(1);
      }
  });

  it('trajectoire : au niveau 1, la forme annoncée est celle des points du schéma', () => {
    for (const q of tirages('p5-trajectoire', 1)) {
      if (q.figure?.kind !== 'grid') throw new Error('schéma attendu');
      const p = q.figure.points;
      const [a, b] = [p[0]!, p[1]!];
      const alignes = p.every((c) => (b.x - a.x) * (c.y - a.y) === (b.y - a.y) * (c.x - a.x));
      const cercle = p.every((c) => c.x * c.x + c.y * c.y === 25);
      expect(bonne(q)).toContain(alignes ? 'rectiligne' : cercle ? 'circulaire' : 'autre courbe');
    }
  });

  it('allure : recalculée depuis le schéma, la liste ou le relevé (niveaux 1 à 4)', () => {
    let vus = 0;
    for (const level of [1, 2, 3, 4] as const)
      for (const q of tirages('p5-mouvement-uniforme', level)) {
        let d: number[];
        if (q.figure?.kind === 'grid') d = differences(q.figure.points.map((p) => p.x));
        else if (q.figure?.kind === 'table') d = differences((q.figure.rows[1] ?? []).slice(1).map(Number));
        else if (q.answer.kind === 'match') {
          const { left, right, pairs } = q.answer;
          for (const [i, serie] of left.entries()) expect(right[pairs[i]!]).toBe(allure(metres(serie)));
          continue;
        } else d = metres(q.prompt);
        if (d.length === 0) continue;
        expect(mot(q), q.prompt).toBe(allure(d));
        vus += 1;
      }
    expect(vus).toBeGreaterThan(600);
  });

  it('allure : au niveau 5, une seule phase par allure et la conclusion découle du document', () => {
    for (const q of tirages('p5-mouvement-uniforme', 5)) {
      const phases = lignes(q).map((l) => ({
        nom: /Phase (\w)/.exec(l)![1]!,
        forme: l.includes('droite') ? 'rectiligne' : 'circulaire',
        allure: allure(metres(l)),
      }));
      expect(new Set(phases.map((p) => p.allure)).size).toBe(3);
      const quelle = /est-il (\S+) \?/.exec(q.prompt)?.[1];
      if (quelle) expect(bonne(q)).toBe(`La phase ${phases.find((p) => p.allure === quelle)!.nom}`);
      else {
        const p = phases.find((x) => x.nom === /phase (\w) \?/.exec(q.prompt)![1])!;
        expect(bonne(q)).toBe(`${p.forme} et ${p.allure}`);
      }
    }
  });

  it('vitesse : les calculs des niveaux 2 à 4 sont refaits à partir de l’énoncé', () => {
    const lire = (re: RegExp, s: string) => Number((re.exec(s)?.[1] ?? 'NaN').replace(',', '.'));
    let vus = 0;
    for (const level of [2, 3, 4] as const)
      for (const q of tirages('p5-vitesse-moyenne', level)) {
        const t = q.prompt;
        const d = lire(/(?:parcourt|parcourir) ([\d,]+) (?:m|km)\b/, t);
        const duree = lire(/en (\d+) (?:s|h|min)\b/, t);
        const v = lire(/à (\d+) (?:m\/s|km\/h)/, t);
        const heures = t.includes(' min') ? duree / 60 : duree;
        const attendu = Number.isNaN(v) ? d / heures : Number.isNaN(d) ? v * heures : d / v;
        if (q.answer.kind === 'number') expect(q.answer.value.n / q.answer.value.d, t).toBeCloseTo(attendu, 8);
        else expect(Number.parseFloat(bonne(q)), t).toBeCloseTo(attendu, 8);
        vus += 1;
      }
    expect(vus).toBe(900);
  });

  it('vitesse : au niveau 5, distance totale divisée par la durée totale, pause comprise', () => {
    for (const q of tirages('p5-vitesse-moyenne', 5)) {
      const etapes = lignes(q).filter((l) => l.startsWith('Étape'));
      const km = etapes.reduce((n, l) => n + Number(/: (\d+) km/.exec(l)![1]), 0);
      const minutes = lignes(q).reduce((n, l) => {
        const h = Number(/(\d+) h\b/.exec(l)?.[1] ?? 0);
        return n + 60 * h + Number(/(\d+) min/.exec(l)?.[1] ?? 0);
      }, 0);
      const attendu = km / (minutes / 60);
      expect(check(q, { kind: 'number', text: String(attendu) }).correct, lignes(q).join(' ')).toBe(true);
    }
  });

  it('allure en saisie : « décélérée » acceptée, « constant » et « régulier » expliqués', () => {
    const saisies = ([3, 4] as const)
      .flatMap((l) => tirages('p5-mouvement-uniforme', l))
      .filter((q) => q.answer.kind === 'text');
    expect(new Set(saisies.map(mot)).size).toBe(3);
    for (const q of saisies) {
      expect(check(q, { kind: 'text', text: 'décélérée' }).correct).toBe(mot(q) === 'ralenti');
      for (const text of ['constant', 'régulier']) {
        const r = check(q, { kind: 'text', text });
        expect(r.correct).toBe(false);
        expect(
          q.traps.some((t) => 'text' in t && t.text === text),
          text,
        ).toBe(true);
      }
    }
  });

  it('direction et sens : deux mots distincts, définis au mémo, et « mobile » au glossaire', () => {
    const memo = notions.find((s) => s.id === 'p5-mouvement-uniforme')?.lesson.memo.join(' ');
    expect(memo).toContain('La direction est la droite suivie ; le sens indique vers quel côté');
    expect(FAITS_MOUVEMENT.find((f) => f.id === 'sens')?.source).toBe('academie-sens');
    expect(getSource('cnrtl-sens')).toBeUndefined();
    expect(isDefined('mobile', SUBJECT_GLOSSARIES.sciences ?? [])).toBe(true);
  });
});
