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

/** Libellé de la bonne réponse (choix ou saisie). */
const bonne = (q: Question): string =>
  q.answer.kind === 'choice'
    ? String(q.answer.options[q.answer.correct])
    : q.answer.kind === 'text'
      ? (q.answer.accepted[0] ?? '')
      : '';

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
      const un = nombres(/1 cm³ (?:de la substance \w|d’un liquide) a une masse de ([\d,]+) g/, t);
      const masse = nombres(/ont une masse de (\d+) g|a une masse de (\d+) g\. Dans/, t);
      let attendu: number;
      if (q.answer.unit === 'cm³') attendu = nombres(/en avoir ([\d,]+) g/, t) / un;
      else if (t.includes('éprouvette'))
        attendu =
          nombres(/objet a une masse de (\d+) g/, t) / (nombres(/à (\d+) mL quand/, t) - nombres(/de (\d+) mL à/, t));
      else if (t.includes('objet de')) attendu = un * nombres(/objet de (\d+) cm³/, t);
      else attendu = masse / nombres(/^(\d+) cm³/, t);
      expect(q.answer.value.n / q.answer.value.d, t).toBeCloseTo(attendu, 8);
      vus += 1;
    }
    expect(vus).toBeGreaterThan(300);
    for (const q of tirages('p5-masse-volumique', 5)) {
      const t = texte(q);
      const volume = nombres(/mL avant immersion, (\d+) mL/, t) - nombres(/(\d+) mL avant/, t);
      const un = nombres(/Masse de l’objet : (\d+(?:,\d+)?) g/, t) / volume;
      if (q.answer.kind !== 'choice') throw new Error('choix attendu');
      const lettre = q.answer.options[q.answer.correct]?.slice(-1) ?? '';
      expect(nombres(new RegExp(`Substance ${lettre} : 1 cm³ a une masse de ([\\d,]+)`), t), t).toBeCloseTo(un, 8);
    }
  });

  it('masse volumique : ni symbole ρ, ni formule, ni unité quotient ; trois propositions au niveau 1', () => {
    const s = notions.find((x) => x.id === 'p5-masse-volumique');
    const tout = JSON.stringify([s?.lesson, ...LEVELS.map((l) => tirages('p5-masse-volumique', l))]);
    expect(tout).not.toMatch(/ρ|m ÷ V|ρ × V|g\/cm³|g\/mL|grandeur quotient|pèse/);
    for (const q of tirages('p5-masse-volumique', 1))
      if (q.answer.kind === 'choice') expect(q.answer.options.length, q.prompt).toBe(3);
  });

  it('conservation : le sel ne dépasse jamais ce que l’eau peut dissoudre', () => {
    let vus = 0;
    for (const level of [3, 4] as const)
      for (const q of tirages('p5-conservation-masse', level, 1000)) {
        const m = /(\d+) g de sel dans (\d+) (k?)g d’eau/.exec(q.prompt);
        if (!m) continue;
        expect(Number(m[1]), q.prompt).toBeLessThanOrEqual(0.3 * Number(m[2]) * (m[3] ? 1000 : 1));
        vus += 1;
      }
    expect(vus).toBeGreaterThan(300);
  });

  it('conservation : au niveau 2 la réponse varie ; au niveau 4 une affirmation est vraie', () => {
    expect(new Set(tirages('p5-conservation-masse', 2).map(bonne)).size).toBe(2);
    expect(new Set(tirages('p5-conservation-masse', 4).map(bonne))).toContain('oui');
    expect(new Set(tirages('p5-corps-purs-melanges', 4).map(bonne))).toContain('oui');
  });

  it('conservation : au niveau 5, la masse se conserve et le volume varie d’au plus 15 %', () => {
    for (const q of tirages('p5-conservation-masse', 5)) {
      const t = texte(q);
      const m = nombres(/sa masse est de (\d+) g/, t) - nombres(/vide a une masse de (\d+) g/, t);
      const avant = nombres(/Volume avant : (\d+)/, t);
      const apres = nombres(/échappe : volume (\d+)/, t);
      expect(Math.abs(apres - avant) / avant, t).toBeLessThanOrEqual(0.15);
      if (q.answer.kind === 'number') expect(check(q, { kind: 'number', text: String(m) }).correct, t).toBe(true);
      else expect(bonne(q), t).toContain(m / apres > m / avant ? 'plus grande' : 'plus petite');
    }
  });

  it('corps purs : au niveau 1 aucune proposition ne contient le mot « pur »', () => {
    for (const q of tirages('p5-corps-purs-melanges', 1))
      if (q.answer.kind === 'choice') expect(q.answer.options.join(' ')).not.toMatch(/\bpure?\b/);
  });

  it('corps purs : au niveau 5, la conclusion découle des relevés ou de l’étiquette', () => {
    const conclusions = new Set<string>();
    for (const q of tirages('p5-corps-purs-melanges', 5)) {
      const t = texte(q);
      const solide = /pour le solide (\w)/.exec(q.prompt)?.[1];
      if (!solide) {
        conclusions.add(bonne(q));
        expect(bonne(q), t).toBe(
          t.includes('dépôt visible')
            ? 'Un mélange hétérogène'
            : t.includes('dissoutes')
              ? 'Un mélange homogène'
              : 'Un corps pur',
        );
        continue;
      }
      const valeurs = [...(new RegExp(`Solide ${solide} : ([^.]+)\\.`).exec(t)?.[1] ?? '').matchAll(/\d+/g)].map(
        Number,
      );
      expect(valeurs).toHaveLength(4);
      const ref = new RegExp(`Substance (\\w) \\(corps pur\\) : fusion à ${valeurs[0]} °C`).exec(t)?.[1];
      const attendu =
        new Set(valeurs).size > 1 ? 'Un mélange' : ref ? `Le corps pur ${ref}` : 'Un corps pur absent du tableau';
      expect(bonne(q), t).toBe(attendu);
      conclusions.add(attendu.replace(/pur [A-D]$/, 'pur'));
    }
    for (const c of [
      'Un mélange',
      'Le corps pur',
      'Un corps pur absent du tableau',
      'Un corps pur',
      'Un mélange homogène',
    ])
      expect(conclusions).toContain(c);
  });

  it('solubilité : au niveau 5, on compare à volume égal, avec égalités et plus grande masse trompeuse', () => {
    let egalites = 0;
    let trompeurs = 0;
    for (const q of tirages('p5-solubilite', 5)) {
      if (q.answer.kind !== 'choice') continue;
      const t = texte(q);
      const lire = (nom: string) => {
        const m = new RegExp(`Solide ${nom} : au maximum (\\d+) g dissous dans (\\d+) mL`).exec(t);
        return { masse: Number(m?.[1]), v: Number(m?.[2]) };
      };
      const p = lire('P');
      const s = lire('Q');
      expect(p.v).not.toBe(s.v);
      const ecart = p.masse / p.v - s.masse / s.v;
      const egal = Math.abs(ecart) < 1e-9;
      expect(bonne(q), t).toBe(egal ? 'Les deux autant' : ecart > 0 ? 'Le solide P' : 'Le solide Q');
      if (egal) egalites += 1;
      else if (ecart * (p.masse - s.masse) < 0) trompeurs += 1;
    }
    expect(egalites).toBeGreaterThan(10);
    expect(trompeurs).toBeGreaterThan(30);
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
