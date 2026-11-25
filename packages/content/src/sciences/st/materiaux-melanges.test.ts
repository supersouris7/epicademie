import { describe, expect, it } from 'vitest';
import { check } from '../../check.ts';
import { createRng } from '../../rng.ts';
import { getSource } from '../../sources.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../../glossaires.ts';
import type { Level, Question, QuestionDraft, Skill } from '../../types.ts';
import { validateVariants } from '../../validate.ts';
import { FAITS } from './donnees.ts';
import { dissolution } from './dissolution.ts';
import { GLOSSAIRE } from './glossaire.ts';
import { ST_CHAPTERS } from './index.ts';
import { materiaux } from './materiaux.ts';
import { separer } from './separer.ts';
import { signal } from './signal.ts';

const chapitre = ST_CHAPTERS.find((c) => c.id === 'pcm2-materiaux-melanges');
const sixieme = ST_CHAPTERS.find((c) => c.id === 'p6-signal-information');
const notions: readonly Skill[] = [...(chapitre?.skills ?? []), ...(sixieme?.skills ?? [])];
const LEVELS = [1, 2, 3, 4, 5] as const;

const tirages = (s: Skill, level: Level, n = 200): Question[] =>
  Array.from({ length: n }, (_, seed) => ({
    traps: [],
    targetSeconds: 30,
    ...s.generate(createRng(seed), level),
    skillId: s.id,
    level,
    seed,
  }));

describe('sciences : « Matériaux et mélanges » (CM2) et « Signal et information » (6e)', () => {
  it('porte les quatre notions du lot, à 5 niveaux, la transmission de l’information étant en 6e', () => {
    expect(chapitre?.grade).toBe('cm2');
    expect(chapitre?.domain).toBe('physique-chimie');
    expect(sixieme?.grade).toBe('6e');
    expect(sixieme?.domain).toBe('physique-chimie');
    expect(notions.map((s) => s.id)).toEqual(['pcm2-materiaux', 'pcm2-separer', 'pcm2-dissolution', 'p6-signal']);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
  });

  it('chaque source citée existe et porte au moins un fait cité ; les mots en gras sont définis', () => {
    for (const s of notions) {
      expect(s.lesson.source, s.id).toContain('«');
      for (const id of s.lesson.sources ?? []) {
        expect(getSource(id), id).toBeDefined();
        expect(
          FAITS.some((f) => f.source === id),
          `${s.id} ${id}`,
        ).toBe(true);
      }
      for (const t of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(t, SUBJECT_GLOSSARIES.sciences ?? []), t).toBe(true);
    }
  });

  it('questions valides et cohérentes aux 5 niveaux, avec au moins deux pièges expliqués par notion', () => {
    for (const s of notions) {
      const prompts = LEVELS.map((level) => {
        const qs = tirages(s, level);
        expect(validateVariants(qs), `${s.id} ${level}`).toEqual([]);
        return qs.map((q) => q.prompt).join('|');
      });
      expect(new Set(prompts).size, s.id).toBe(5);
      const pieges = new Set(LEVELS.flatMap((l) => tirages(s, l).flatMap((q) => q.traps.map((t) => t.why))));
      expect(pieges.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('reste dans le programme du cours moyen (ni conductivité, ni aimant, ni saturation)', () => {
    for (const s of notions)
      for (const level of LEVELS)
        expect(JSON.stringify(tirages(s, level))).not.toMatch(/conductivit|aimant|saturation|miscible/i);
  });

  it('dissolution : la masse se conserve (balance tarée ou non)', () => {
    const experiences = tirages(dissolution, 5).filter((q: QuestionDraft) => q.answer.kind === 'number');
    expect(experiences.length).toBeGreaterThan(0);
    for (const q of experiences) {
      const lignes = q.figure?.kind === 'document' ? q.figure.lines.join(' ') : '';
      const [verre, ...ajouts] = [...lignes.matchAll(/(\d+) g/g)].map((m) => Number(m[1]));
      const somme = ajouts.reduce((a, b) => a + b, 0) + (q.prompt.includes('pas été tarée') ? (verre ?? 0) : 0);
      expect(check(q, { kind: 'number', text: String(somme) }).correct, lignes).toBe(true);
    }
  });

  it('matériaux, niveau 5 : propositions rangées A à D et position de la bonne réponse variable', () => {
    const positions = new Set<number>();
    for (const q of tirages(materiaux, 5)) {
      if (q.answer.kind !== 'choice') throw new Error('choix attendu');
      expect(q.answer.options).toEqual(['A', 'B', 'C', 'D'].map((l) => `Échantillon ${l}`));
      positions.add(q.answer.correct);
      for (const piege of q.traps) expect(piege.why).toMatch(/^L’échantillon [A-D] est /);
    }
    expect(positions.size).toBe(4);
  });

  it('glossaire et libellés des matériaux', () => {
    for (const id of ['st-alliage', 'st-synthetique', 'st-depoli']) expect(GLOSSAIRE.map((g) => g.id)).toContain(id);
    expect(JSON.stringify(tirages(materiaux, 2))).not.toContain('la lumière ne passe pas :');
  });

  it('séparer : étapes sans simultanéité, tamisage à sec, buts énoncés, « du gravier » accepté', () => {
    const textes = (l: Level) => JSON.stringify(tirages(separer, l));
    expect(textes(3)).not.toContain('Attendre que la terre soit tombée');
    expect(textes(3)).toContain('Vérifier que l’eau du dessus est devenue plus claire');
    expect(textes(5)).toContain('on passe la terre sèche sur une grille');
    expect(textes(4)).not.toContain('poreux');
    for (const q of tirages(separer, 2)) expect(q.prompt).toMatch(/Tu veux (les séparer|séparer|retirer)/);
    const gravier = tirages(separer, 4).find((q) => q.prompt.includes('reste sur le tamis'));
    expect(gravier && check(gravier, { kind: 'text', text: 'du gravier' }).correct).toBe(true);
  });

  it('dissolution : le sel peut se dissoudre en entier (sel ≤ 0,3 × eau)', () => {
    let vus = 0;
    for (const level of [3, 4, 5] as const)
      for (const q of tirages(dissolution, level)) {
        const texte = `${q.prompt} ${q.figure?.kind === 'document' ? q.figure.lines.join(' ') : ''}`;
        const g = (re: RegExp) => Number(re.exec(texte)?.[1] ?? Number.NaN);
        let sel = g(/(\d+) g de sel/);
        let eau = g(/(\d+) g d’eau/);
        const kilos = g(/(\d+) kg d’eau/);
        if (!Number.isNaN(kilos)) eau = kilos * 1000;
        const salee = g(/eau salée pèse (\d+) g/);
        if (!Number.isNaN(salee)) sel = salee - eau;
        if (Number.isNaN(sel) || Number.isNaN(eau)) continue;
        vus += 1;
        expect(sel, texte).toBeLessThanOrEqual(0.3 * eau);
      }
    expect(vus).toBeGreaterThan(100);
  });

  it('dissolution : premier trou en liste, étape de l’assiette annoncée', () => {
    const trous = tirages(dissolution, 3).flatMap((q) => (q.answer.kind === 'cloze' ? [q.answer.blanks[0]] : []));
    expect(trous.length).toBeGreaterThan(0);
    for (const b of trous)
      expect(b).toMatchObject({ mode: 'list', options: ['dissout', 'transforme en vapeur', 'dépose'] });
    expect(JSON.stringify(tirages(dissolution, 5))).toContain('s’évaporer dans une assiette');
  });

  it('signal : l’énoncé à trous ne souffle pas « information »', () => {
    const trous = tirages(signal, 3).flatMap((q) => (q.answer.kind === 'cloze' ? [q.answer.parts] : []));
    expect(trous.length).toBeGreaterThan(0);
    for (const parts of trous) expect(parts[1]).toMatch(/s’appelle : $/);
  });
});
