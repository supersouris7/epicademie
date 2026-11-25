import { describe, expect, it } from 'vitest';
import { check } from '../check.ts';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import { boldTerms, isDefined, SUBJECT_GLOSSARIES } from '../glossaires.ts';
import type { Level, Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { PREUVES } from './se-reperer-cm2-sources.ts';
import { PERIODES, REPERES, SKILLS } from './se-reperer-cm2.ts';

const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];

const questions = (id: string, level: Level, count = 300): Question[] => {
  const s = SKILLS.find((x) => x.id === id)!;
  return Array.from({ length: count }, (_, seed) => ({
    traps: [],
    targetSeconds: 30,
    ...s.generate(createRng(seed), level),
    skillId: id,
    level,
    seed,
  }));
};

const lines = (q: Question) => (q.figure as unknown as { lines: string[] }).lines;
const increasing = (values: readonly number[]) => {
  expect(values).toEqual([...values].sort((a, b) => a - b));
  expect(new Set(values).size).toBe(values.length);
};

describe('histoire cm2 — Se repérer dans le temps', () => {
  it('propose les quatre notions du référentiel, en 5 niveaux', () => {
    expect(SKILLS.map((s) => s.id)).toEqual([
      'hcm2-frise-periodes',
      'hcm2-ordonner',
      'hcm2-durees',
      'hcm2-reperes-cycle3',
    ]);
    for (const s of SKILLS) expect([s.levels, s.version], s.id).toEqual([5, 1]);
  });

  it('cite pour chaque fait une source du registre et une citation ; termes du mémo définis', () => {
    for (const p of Object.values(PREUVES)) {
      expect(getSource(p.source), p.source).toBeDefined();
      expect(p.quote.trim().length, p.source).toBeGreaterThan(10);
    }
    for (const s of SKILLS) {
      for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
      for (const term of s.lesson.memo.flatMap(boldTerms)) {
        expect(isDefined(term, SUBJECT_GLOSSARIES.histoire!), term).toBe(true);
      }
    }
    for (const r of REPERES) {
      if (r.date.startsWith('en ')) expect(r.preuve.quote, r.label).toContain(String(r.t));
    }
  });

  it('produit des questions valides et différentes à chaque niveau', () => {
    for (const s of SKILLS) {
      const prompts = LEVELS.map((level) => {
        const qs = questions(s.id, level);
        expect(validateVariants(qs), `${s.id} niveau ${level}`).toEqual([]);
        return [...new Set(qs.map((q) => q.prompt))].sort().join('|');
      });
      expect(new Set(prompts).size, s.id).toBe(5);
    }
  });

  it('prévoit au moins deux erreurs typiques expliquées pour chaque choix et chaque saisie', () => {
    for (const s of SKILLS) {
      for (const q of LEVELS.flatMap((level) => questions(s.id, level))) {
        if (q.answer.kind !== 'choice' && q.answer.kind !== 'text') continue;
        expect(q.traps.length, q.prompt).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('place chaque année dans sa période, hors des bornes disputées', () => {
    const expected = (y: number) =>
      y < 476 ? 'Antiquité' : y < 1453 ? 'Moyen Âge' : y < 1789 ? 'Temps modernes' : 'Époque contemporaine';
    for (const level of [2, 4] as const) {
      for (const q of questions('hcm2-frise-periodes', level)) {
        const year = Number(/l’année (\d+)/.exec(q.prompt)?.[1]);
        if (!year) continue;
        expect(year < 1453 || year > 1492, q.prompt).toBe(true);
        const periode = PERIODES.find((p) => p.nom === expected(year))!;
        const given = q.answer.kind === 'choice' ? q.answer.options[q.answer.correct]! : periode.nom;
        if (q.answer.kind === 'choice') expect(given).toBe(periode.le);
        else expect(check(q, { kind: 'text', text: given }).correct, q.prompt).toBe(true);
      }
    }
  });

  it('accepte les deux dates de fin du Moyen Âge et les écritures sans accent', () => {
    const fin = questions('hcm2-frise-periodes', 4).find((q) => q.prompt.includes('fin du Moyen Âge'))!;
    for (const text of ['1453', '1492']) expect(check(fin, { kind: 'text', text }).correct).toBe(true);
    expect(check(fin, { kind: 'text', text: '476' }).correct).toBe(false);
    const moyenAge = PERIODES.find((p) => p.nom === 'Moyen Âge')!;
    expect(moyenAge.accepted).toEqual(expect.arrayContaining(['le Moyen Age', 'Moyen Âge']));
  });

  it('niveau 5 de la frise : le siècle de l’objet donne sa période', () => {
    const periodeDe: Record<string, string> = {
      II: 'l’Antiquité',
      III: 'l’Antiquité',
      IV: 'l’Antiquité',
      VII: 'le Moyen Âge',
      IX: 'le Moyen Âge',
      XI: 'le Moyen Âge',
      XIII: 'le Moyen Âge',
      XIV: 'le Moyen Âge',
      XVI: 'les Temps modernes',
      XVII: 'les Temps modernes',
      XIX: 'l’époque contemporaine',
      XX: 'l’époque contemporaine',
    };
    for (const q of questions('hcm2-frise-periodes', 5)) {
      const objets = new Map(
        lines(q).map((l) => {
          const [, nom, roman] = /^(.+) date du ([IVX]+)e siècle/.exec(l)!;
          return [nom!, periodeDe[roman!]!] as const;
        }),
      );
      expect(new Set(objets.values()).size).toBe(4);
      if (q.answer.kind === 'choice') {
        expect(q.prompt).toContain(objets.get(q.answer.options[q.answer.correct]!)!);
      } else {
        const nom = /« (.+) »/.exec(q.prompt)![1]!;
        expect(check(q, { kind: 'text', text: objets.get(nom)! }).correct, q.prompt).toBe(true);
      }
    }
  });

  it('ordonne les faits du plus ancien au plus récent', () => {
    const time = (label: string) => REPERES.find((r) => label.startsWith(r.label))!.t;
    for (const level of [3, 4] as const) {
      for (const q of questions('hcm2-ordonner', level)) {
        if (q.answer.kind !== 'order') continue;
        const { items, correct } = q.answer;
        increasing(correct.map((i) => time(items[i]!)));
      }
    }
  });

  it('niveau 2 ordonner : chaque piège concorde avec les dates, sur toutes les graines', () => {
    const find = (text: string) => REPERES.find((r) => text.startsWith(r.label))!;
    for (const q of questions('hcm2-ordonner', 2, 2000)) {
      const [, mot, cited] = /juste (avant|après) celui-ci : « (.+) » \?$/.exec(q.prompt)!;
      if (q.answer.kind !== 'choice') throw new Error(q.prompt);
      const { options, correct } = q.answer;
      const ref = find(cited!).t;
      // Distance au repère, positive du côté demandé.
      const gap = (label: string) => (find(label).t - ref) * (mot === 'après' ? 1 : -1);
      const good = gap(options[correct]!);
      expect(good, q.prompt).toBeGreaterThan(0);
      expect(q.traps, q.prompt).toHaveLength(options.length - 1);
      for (const trap of q.traps) {
        if (!('option' in trap)) throw new Error(q.prompt);
        const label = options[trap.option]!;
        const wrongSide = gap(label) < 0;
        if (!wrongSide) expect(gap(label), q.prompt).toBeGreaterThan(good);
        expect(trap.why, `${q.prompt} → ${label}`).toBe(
          wrongSide
            ? `Ce fait ne vient pas ${mot} : il arrive ${find(label).date}.`
            : `Il vient bien ${mot}, mais un autre fait est plus proche.`,
        );
      }
    }
  });

  it('niveau 1 ordonner : les étapes rangent les trois dates avant la réponse', () => {
    for (const q of questions('hcm2-ordonner', 1)) {
      if (q.answer.kind !== 'choice') throw new Error(q.prompt);
      const dates = q.answer.options
        .map((o) => REPERES.find((r) => o.startsWith(r.label))!)
        .sort((a, b) => a.t - b.t)
        .map((r) => r.date);
      expect(q.steps.at(-2), q.prompt).toBe(`Rangés : ${dates.join(', puis ')}.`);
    }
  });

  it('niveau 5 ordonner : les faits inventés se calculent depuis les faits réels, sans date écrite', () => {
    const modes = new Set<string>();
    for (const q of questions('hcm2-ordonner', 5)) {
      const times = new Map<string, number>();
      for (const l of lines(q)) {
        const known = /^Fait réel : « (.+) »\.$/.exec(l);
        if (known) times.set(known[1]!, REPERES.find((r) => r.label === known[1])!.t);
        const made = /^Fait inventé : « (.+) » (\d+) ans (avant|après) (.+)\.$/.exec(l);
        if (made) {
          const anchor = REPERES.find((r) => r.court === made[4])!.t;
          times.set(made[1]!, anchor + (made[3] === 'avant' ? -1 : 1) * Number(made[2]));
        }
      }
      expect(times.size, lines(q).join(' ')).toBe(5);
      const sorted = [...times].sort((a, b) => a[1] - b[1]);
      increasing(sorted.map(([, t]) => t));
      modes.add(q.answer.kind);
      if (q.answer.kind === 'order') {
        const { items, correct } = q.answer;
        expect(correct.map((i) => items[i])).toEqual(sorted.map(([label]) => label));
      } else if (q.answer.kind === 'choice') {
        const rank = ['premier', 'deuxième', 'troisième', 'quatrième'].findIndex((r) => q.prompt.includes(r));
        expect(q.answer.options[q.answer.correct]).toBe(sorted[rank]![0]);
      }
    }
    expect([...modes].sort()).toEqual(['choice', 'order']);
  });

  it('calcule juste les durées saisies', () => {
    for (const level of [3, 4] as const) {
      for (const q of questions('hcm2-durees', level)) {
        if (q.answer.kind !== 'text') continue;
        const between = /(?:de|séparent) (\d+) (?:à|et) (\d+) \?/.exec(q.prompt);
        const shift = /tombe (\d+) ans (avant|après) (\d+) \?/.exec(q.prompt);
        const value = between
          ? Number(between[2]) - Number(between[1])
          : Number(shift![3]) + (shift![2] === 'avant' ? -1 : 1) * Number(shift![1]);
        expect(q.answer.accepted, q.prompt).toContain(String(value));
        if (level === 3) {
          // Sans retenue : les unités et les dizaines se soustraient directement.
          const [a, b] = [Number(between![1]), Number(between![2])];
          expect(a % 10, q.prompt).toBeLessThanOrEqual(b % 10);
          expect(Math.floor(a / 10) % 10, q.prompt).toBeLessThanOrEqual(Math.floor(b / 10) % 10);
        }
      }
    }
  });

  it('niveau 5 des durées : les deux calculs partent de 1892', () => {
    for (const q of questions('hcm2-durees', 5)) {
      const years = new Map<string, number>();
      for (const l of lines(q)) {
        const made = /on construit (.+) (\d+) ans (avant|après) cette fête\.$/.exec(l);
        if (made) years.set(made[1]!, 1892 + (made[3] === 'avant' ? -1 : 1) * Number(made[2]));
      }
      expect(years.size).toBe(2);
      const both = /constructions : (.+) et (.+) \?$/.exec(q.prompt);
      const value = both
        ? years.get(both[2]!)! - years.get(both[1]!)!
        : years.get(/cent ans : (.+) \?$/.exec(q.prompt)![1]!)! + 100;
      expect(check(q, { kind: 'text', text: String(value) }).correct, q.prompt).toBe(true);
    }
  });

  it('niveau 5 des repères : une seule date de l’exposé est fausse', () => {
    for (const q of questions('hcm2-reperes-cycle3', 5)) {
      const wrong = lines(q).filter((l) => {
        const [, label, year] = /^(.+) en (\d+)\.$/.exec(l)!;
        return REPERES.find((r) => r.label === label)!.t !== Number(year);
      });
      expect(wrong, lines(q).join(' ')).toHaveLength(1);
      if (q.answer.kind === 'choice') expect(q.answer.options[q.answer.correct]).toBe(wrong[0]);
      else {
        const label = wrong[0]!.replace(/ en \d+\.$/, '');
        expect(q.answer.kind === 'text' && q.answer.accepted).toEqual([
          String(REPERES.find((r) => r.label === label)!.t),
        ]);
      }
    }
  });
});
