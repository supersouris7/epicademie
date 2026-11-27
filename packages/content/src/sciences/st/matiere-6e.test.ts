import { describe, expect, it } from 'vitest';
import { check } from '../../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../../glossaires.ts';
import { createRng } from '../../rng.ts';
import { getSource } from '../../sources.ts';
import type { Level, Question } from '../../types.ts';
import { validateVariants } from '../../validate.ts';
import { FAITS_MATIERE } from './donnees-6e-matiere.ts';
import { ST_CHAPTERS } from './index.ts';

const chapitre = ST_CHAPTERS.find((c) => c.id === 'p6-matiere');
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
const nombre = (re: RegExp, s: string) => Number(re.exec(s)?.[1]?.replace(/\s/g, '') ?? Number.NaN);
const juste = (q: Question, v: number) => check(q, { kind: 'number', text: String(v) }).correct;

describe('sciences 6e : « La matière »', () => {
  it('porte les cinq notions, en physique-chimie 6e, à 5 niveaux', () => {
    expect(chapitre?.grade).toBe('6e');
    expect(chapitre?.domain).toBe('physique-chimie');
    expect(notions.map((s) => s.id)).toEqual([
      'p6-etats',
      'p6-masse-volume',
      'p6-melanges',
      'p6-dissolution',
      'p6-transformations-securite',
    ]);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
  });

  it('chaque source citée existe et porte un fait ; les mots en gras sont définis', () => {
    expect(new Set(FAITS_MATIERE.map((f) => f.id)).size).toBe(FAITS_MATIERE.length);
    for (const s of notions) {
      expect(s.lesson.source, s.id).toContain('«');
      for (const id of s.lesson.sources ?? []) {
        expect(getSource(id), id).toBeDefined();
        expect(
          FAITS_MATIERE.some((f) => f.source === id),
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

  it('reste au programme de 6e : ni corps pur ni masse volumique', () => {
    for (const s of notions)
      for (const level of LEVELS)
        expect(JSON.stringify(tirages(s.id, level))).not.toMatch(/corps pur|masse volumique/i);
  });

  it('états : la température et la durée du palier se lisent dans les relevés', () => {
    let vus = 0;
    for (const q of tirages('p6-etats', 5)) {
      if (q.answer.kind !== 'number') continue;
      const releves = [...texte(q).matchAll(/Minute (\d+) : (-?\d+) °C/g)].map((m) => Number(m[2]));
      const palier = releves.find((v, i) => releves[i + 1] === v) ?? Number.NaN;
      const duree = releves.filter((v) => v === palier).length - 1;
      expect(juste(q, q.prompt.includes('Combien de minutes') ? duree : palier), texte(q)).toBe(true);
      vus += 1;
    }
    expect(vus).toBeGreaterThan(100);
  });

  it('masse et volume : proportionnalité vérifiée à partir du document', () => {
    let vus = 0;
    for (const q of tirages('p6-masse-volume', 5)) {
      const t = texte(q);
      const v1 = nombre(/pièce de (\d+) cm³ a une masse/, t);
      if (!Number.isNaN(v1)) {
        const parCm3 = nombre(/a une masse de (\d+) g\./, t) / v1;
        const v2 = nombre(/masse d’une pièce de (\d+) cm³/, t);
        const m2 = nombre(/a une masse de (\d+) g, en cm³/, t);
        expect(juste(q, Number.isNaN(v2) ? m2 / parCm3 : v2 * parCm3), t).toBe(true);
      } else {
        const d = nombre(/leur masse est (\d+) g/, t) / nombre(/mesure (\d+) cm³/, t);
        expect(juste(q, nombre(/masse de (\d+) L/, t) * 1000 * d), t).toBe(true);
      }
      vus += 1;
    }
    expect(vus).toBe(300);
  });

  it('mélanges : le liquide le plus lourd pour 100 mL est au fond', () => {
    for (const q of tirages('p6-melanges', 5)) {
      if (q.answer.kind !== 'text') continue;
      const mx = nombre(/de X ont une masse de (\d+) g/, texte(q));
      const my = nombre(/de Y ont une masse de (\d+) g/, texte(q));
      expect(check(q, { kind: 'text', text: mx > my ? 'X' : 'Y' }).correct, texte(q)).toBe(true);
    }
  });

  it('dissolution : saturation et conservation de la masse recalculées', () => {
    let vus = 0;
    for (const q of tirages('p6-dissolution', 4)) {
      if (q.answer.kind !== 'number') continue;
      const t = texte(q);
      const eau = nombre(/dans (\d+) g d’eau(?! \(même)(?!.*dans \d+ g d’eau)/, t);
      const max = nombre(/au maximum (\d+) g/, t);
      const verse = nombre(/On verse (\d+) g/, t);
      let attendu: number;
      if (t.includes('masse maximale de')) attendu = (max * eau) / 100;
      else if (t.includes('reste au fond, en g')) attendu = verse - (max * eau) / 100;
      else attendu = eau + verse;
      expect(juste(q, attendu), t).toBe(true);
      vus += 1;
    }
    expect(vus).toBeGreaterThan(100);
    for (const q of tirages('p6-dissolution', 5)) {
      if (q.answer.kind !== 'number') continue;
      const t = texte(q);
      const eau = nombre(/avec (\d+) g d’eau/, t);
      const total = Math.max(...[...t.matchAll(/soit (\d+) g/g)].map((m) => Number(m[1])));
      const dissous = nombre(/maximale dissoute est de (\d+) g/, t);
      expect(juste(q, q.prompt.includes('reste au fond') ? total - dissous : eau + total), t).toBe(true);
    }
  });

  it('états : évaporation et ébullition ne sont acceptées que dans leur situation', () => {
    const accepte = (q: Question, text: string) => check(q, { kind: 'text', text }).correct;
    const vus = new Set<string>();
    for (const level of [3, 4] as const)
      for (const q of tirages('p6-etats', level)) {
        if (q.answer.kind !== 'text') continue;
        const flaque = /flaque|sans aucune bulle/.test(q.prompt);
        const bout = /qui bout|Des bulles/.test(q.prompt);
        const inverse = q.prompt.includes('subi une liquéfaction');
        if (!flaque && !bout && !inverse) continue;
        vus.add(`${level} ${flaque} ${bout}`);
        expect(accepte(q, 'ébullition'), q.prompt).toBe(bout);
        expect(accepte(q, 'évaporation'), q.prompt).toBe(flaque || inverse);
        if (level === 3 || inverse) expect(accepte(q, 'vaporisation'), q.prompt).toBe(true);
        const confondu = flaque ? 'ébullition' : bout ? 'évaporation' : 'ébullition';
        expect(
          q.traps.some((p) => 'text' in p && p.text === confondu),
          q.prompt,
        ).toBe(true);
      }
    expect(vus.size).toBe(5);
  });

  it('sécurité, niveau 5 : deux pictogrammes et une situation à croiser, quatre propositions expliquées', () => {
    const questions = tirages('p6-transformations-securite', 5);
    for (const q of questions) {
      const t = texte(q);
      expect(t).toMatch(/premier pictogramme .*Second pictogramme .*Situation : /);
      expect(t).not.toContain('Un adulte');
      expect(q.answer.kind === 'choice' && q.answer.options.length, t).toBe(4);
      expect(q.traps.length, t).toBe(3);
    }
    const gestes = JSON.stringify(questions);
    expect(gestes).toContain('à l’écart des vêtements');
    expect(gestes).toContain('pièce bien aérée');
  });
});
