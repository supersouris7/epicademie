import { describe, expect, it } from 'vitest';
import { check } from '../../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../../glossaires.ts';
import { createRng } from '../../rng.ts';
import { getSource } from '../../sources.ts';
import type { Level, Question } from '../../types.ts';
import { validateVariants } from '../../validate.ts';
import { FAITS_MOUVEMENT_ENERGIE } from './donnees-6e-mouvement-energie.ts';
import { ST_CHAPTERS } from './index.ts';

const chapitre = ST_CHAPTERS.find((c) => c.id === 'p6-mouvements-energie');
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
/** Nombre capturé, espaces de milliers et virgule décimale compris. */
const nombre = (re: RegExp, s: string) => Number(re.exec(s)?.[1]?.replace(/\s/g, '').replace(',', '.') ?? Number.NaN);
const juste = (q: Question, v: number) => check(q, { kind: 'number', text: String(v) }).correct;

describe('sciences 6e : « Mouvements et énergie »', () => {
  it('porte les quatre notions, en physique-chimie 6e, à 5 niveaux', () => {
    expect(chapitre?.grade).toBe('6e');
    expect(chapitre?.domain).toBe('physique-chimie');
    expect(notions.map((s) => s.id)).toEqual([
      'p6-types-mouvements',
      'p6-vitesse',
      'p6-sources-conversions',
      'p6-circuit',
    ]);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
  });

  it('chaque source citée existe et porte un fait ; les mots en gras sont définis', () => {
    expect(new Set(FAITS_MOUVEMENT_ENERGIE.map((f) => f.id)).size).toBe(FAITS_MOUVEMENT_ENERGIE.length);
    for (const s of notions) {
      expect(s.lesson.source, s.id).toContain('«');
      for (const id of s.lesson.sources ?? []) {
        expect(getSource(id), id).toBeDefined();
        expect(
          FAITS_MOUVEMENT_ENERGIE.some((f) => f.source === id),
          `${s.id} ${id}`,
        ).toBe(true);
      }
      for (const t of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(t, SUBJECT_GLOSSARIES.sciences ?? []), t).toBe(true);
    }
  });

  it('questions valides aux 5 niveaux, progressives, avec indices, étapes et au moins deux pièges', () => {
    for (const s of notions) {
      const prompts = LEVELS.map((level) => {
        const qs = tirages(s.id, level);
        expect(validateVariants(qs), `${s.id} ${level}`).toEqual([]);
        for (const q of qs) expect(q.steps.at(-1), q.prompt).toContain('**');
        return qs.map((q) => q.prompt).join('|');
      });
      expect(new Set(prompts).size, s.id).toBe(5);
      const pieges = new Set(LEVELS.flatMap((l) => tirages(s.id, l).flatMap((q) => q.traps.map((t) => t.why))));
      expect(pieges.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('vitesse : chaque valeur numérique est recalculée à partir de l’énoncé', () => {
    const vus = new Set<string>();
    for (const level of [3, 4, 5] as const)
      for (const q of tirages('p6-vitesse', level)) {
        if (q.answer.kind !== 'number') continue;
        const t = texte(q);
        let attendu: number;
        if (level === 5) {
          const fin = nombre(/entre 0 s et (\d+) s/, t);
          const d = nombre(new RegExp(`À ${fin} s : (\\d+) m`), t);
          attendu = (d / fin) * (q.prompt.includes('par minute') ? 60 : 1);
        } else if (t.includes('planète')) {
          attendu = nombre(/parcourt ([\d\s]+) km/, t) / (nombre(/en (\d+) jours/, t) * 24);
        } else if (t.includes('une voiture')) {
          attendu = (nombre(/parcourt ([\d,]+) km/, t) * 1000) / (nombre(/en (\d+) min/, t) * 60);
        } else {
          attendu = nombre(/parcourt (\d+) k?m en/, t) / nombre(/ en (\d+) [sh]\./, t);
        }
        expect(juste(q, attendu), t).toBe(true);
        vus.add(`${level} ${q.answer.unit}`);
      }
    expect([...vus].sort()).toEqual(['3 km/h', '3 m/s', '4 km/h', '4 m/s', '5 m/min', '5 m/s']);
  });

  it('vitesse : ni distance ni durée demandées à partir de la vitesse (cycle 4)', () => {
    for (const level of LEVELS)
      for (const q of tirages('p6-vitesse', level))
        expect(q.prompt).not.toMatch(/(Calcule|Quelle est) (la|sa) (distance|durée)/);
  });

  it('types de mouvements : la description du niveau 5 suit les distances du document', () => {
    for (const q of tirages('p6-types-mouvements', 5)) {
      if (q.answer.kind !== 'choice') continue;
      const d = [...texte(q).matchAll(/parcourt (\d+) dm/g)].map((m) => Number(m[1]));
      const forme = texte(q).includes('rail') ? 'rectiligne' : 'circulaire';
      const allure = new Set(d).size === 1 ? 'uniforme' : 'à vitesse variable';
      expect(q.answer.options[q.answer.correct], texte(q)).toBe(`${forme} ${allure}`);
    }
  });

  it('circuit : intervertir des composants ne change pas le fonctionnement (N4 et N5)', () => {
    for (const level of [4, 5] as const) {
      const qs = tirages('p6-circuit', level).filter((q) => /intervertit|essai 3/.test(q.prompt));
      expect(qs.length, `niveau ${level}`).toBeGreaterThan(0);
      for (const q of qs) {
        expect(texte(q)).toContain('intervertit');
        if (q.answer.kind !== 'choice') throw new Error(q.prompt);
        expect(q.answer.options[q.answer.correct], q.prompt).toMatch(/comme (avant|à l’essai 1)$/);
      }
    }
    const lesson = notions.find((s) => s.id === 'p6-circuit')?.lesson;
    expect(lesson?.memo.join(' ')).toContain('intervertir');
    expect(lesson?.source).toContain('intervertir les positions');
    for (const q of tirages('p6-circuit', 5)) expect(q.answer.kind, q.prompt).toBe('choice');
  });

  it('circuit : les noms justes de la photopile et du récepteur sont acceptés, « pile » est expliqué', () => {
    const qs = tirages('p6-circuit', 4);
    const photo = qs.find((q) => q.prompt.includes('photovoltaïque produit'));
    const recepteur = qs.find((q) => q.prompt.includes('convertit l’énergie électrique reçue'));
    if (!photo || !recepteur) throw new Error('question absente');
    const dit = (q: Question, text: string) => check(q, { kind: 'text', text });
    for (const mot of ['élément', 'panneau']) expect(dit(photo, `un ${mot} photovoltaïque`).correct, mot).toBe(true);
    for (const text of ['une pile photovoltaïque', 'pile solaire', 'convertisseur photovoltaïque'])
      expect(dit(photo, text).correct, text).toBe(true);
    expect(dit(photo, 'pile').correct).toBe(false);
    expect(dit(photo, 'pile').why).toContain('chimique');
    for (const text of ['convertisseur', 'un convertisseur d’énergie'])
      expect(dit(recepteur, text).correct, text).toBe(true);
  });

  it('circuit : une boucle interrompue n’est jamais dite fermée', () => {
    for (const q of tirages('p6-circuit', 3)) {
      if (q.answer.kind !== 'text') continue;
      const coupe = /débranché|est ouvert|dévissée/.test(q.prompt);
      expect(check(q, { kind: 'text', text: coupe ? 'ouvert' : 'fermé' }).correct, q.prompt).toBe(true);
    }
  });
});
