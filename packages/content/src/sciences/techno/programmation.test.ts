import { describe, expect, it } from 'vitest';
import { check } from '../../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../../glossaires.ts';
import { createRng } from '../../rng.ts';
import { getSource } from '../../sources.ts';
import type { Level, Question, Skill } from '../../types.ts';
import { validateVariants } from '../../validate.ts';
import { FAITS_PROGRAMMATION } from './donnees-programmation.ts';
import { TECHNO_CHAPTERS } from './index.ts';

const chapitre = TECHNO_CHAPTERS.find((c) => c.id === 't5-programmer');
const notions: readonly Skill[] = chapitre?.skills ?? [];
const LEVELS = [1, 2, 3, 4, 5] as const;

const tirages = (s: Skill, level: Level, n = 300): Question[] =>
  Array.from({ length: n }, (_, seed) => ({
    traps: [],
    targetSeconds: 30,
    ...s.generate(createRng(seed), level),
    skillId: s.id,
    level,
    seed,
  }));

const notion = (id: string): Skill => notions.find((s) => s.id === id)!;
const juste = (q: Question, text: string) => check(q, { kind: 'text', text }).correct;
const lignes = (q: Question): string => (q.figure?.kind === 'document' ? q.figure.lines.join('\n') : '');
const nombre = (texte: string, motif: RegExp): number => Number(motif.exec(texte)?.[1]);

describe('technologie 5e : « Programmer »', () => {
  it('porte les quatre notions du lot, à 5 niveaux, en 5e et en technologie', () => {
    expect([chapitre?.subject, chapitre?.grade, chapitre?.domain]).toEqual(['sciences', '5e', 'technologie']);
    expect(notions.map((s) => s.id)).toEqual([
      't5-algorithme',
      't5-capteurs-actionneurs',
      't5-sequence-boucle',
      't5-tester-programme',
    ]);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
  });

  it('faits : identifiants uniques, source du registre, citation non vide', () => {
    expect(new Set(FAITS_PROGRAMMATION.map((f) => f.id)).size).toBe(FAITS_PROGRAMMATION.length);
    for (const f of FAITS_PROGRAMMATION) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(5);
    }
  });

  it('chaque source citée porte un fait ; le mémo n’a que des mots définis', () => {
    for (const s of notions) {
      expect(s.lesson.source, s.id).toContain('«');
      for (const id of s.lesson.sources ?? []) {
        expect(getSource(id), id).toBeDefined();
        expect(
          FAITS_PROGRAMMATION.some((f) => f.source === id),
          `${s.id} ${id}`,
        ).toBe(true);
      }
      for (const t of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(t, SUBJECT_GLOSSARIES.sciences ?? []), t).toBe(true);
    }
  });

  it('questions valides aux 5 niveaux, niveaux distincts, au moins deux pièges expliqués', () => {
    for (const s of notions) {
      const prompts = LEVELS.map((level) => {
        const qs = tirages(s, level);
        expect(validateVariants(qs), `${s.id} ${level}`).toEqual([]);
        for (const q of qs) expect(q.steps.at(-1), `${s.id} ${level}`).toContain('**');
        return qs.map((q) => q.prompt).join('|');
      });
      expect(new Set(prompts).size, s.id).toBe(5);
      const pieges = new Set(LEVELS.flatMap((l) => tirages(s, l).flatMap((q) => q.traps.map((t) => t.why))));
      expect(pieges.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('QCM : chaque proposition écartée est expliquée', () => {
    for (const s of notions)
      for (const level of LEVELS)
        for (const q of tirages(s, level)) {
          if (q.answer.kind !== 'choice') continue;
          expect(q.traps.length, `${s.id} ${q.prompt}`).toBe(q.answer.options.length - 1);
          expect(check(q, { kind: 'choice', index: q.answer.correct }).correct).toBe(true);
        }
  });

  it('boucles : distances, bips, allumages et durées recalculés depuis l’énoncé', () => {
    let controles = 0;
    for (const q of [3, 4, 5].flatMap((l) => tirages(notion('t5-sequence-boucle'), l as Level))) {
      if (q.answer.kind !== 'text') continue;
      const doc = lignes(q);
      let attendu: number;
      if (q.level === 3) {
        const [, n, d] = /répéter (\d+) fois « (?:avancer de|émettre) (\d+)/.exec(q.prompt) ?? [];
        attendu = Number(n) * Number(d);
      } else if (q.level === 4) {
        const avant = nombre(doc, /avancer de (\d+) cm/);
        const d = nombre(doc, / {8}avancer de (\d+) cm/);
        const n = /devient « répéter (\d+) fois »/.exec(q.prompt)?.[1] ?? /répéter (\d+) fois/.exec(doc)?.[1];
        attendu = avant + Number(n) * d;
      } else {
        const n = nombre(doc, /répéter (\d+) fois/);
        const appuis = /Un visiteur appuie (\d+) fois/.exec(q.prompt)?.[1];
        attendu = n * (appuis ? Number(appuis) : (doc.match(/attendre 1 s/g)?.length ?? 0));
      }
      expect(juste(q, String(attendu)), q.prompt).toBe(true);
      controles++;
    }
    expect(controles).toBeGreaterThan(500);
  });

  it('algorithme : l’action commandée suit la condition écrite dans le document', () => {
    let controles = 0;
    for (const q of tirages(notion('t5-algorithme'), 5)) {
      const mesure = /La mesure vaut (\d+)/.exec(q.prompt)?.[1];
      if (!mesure || q.answer.kind !== 'choice') continue;
      const doc = lignes(q);
      const [, sens, seuil, oui] = /est (supérieure|inférieure) à (\d+) [^,]+, (.+?) ;/.exec(doc) ?? [];
      const non = /sinon, (.+)\./.exec(doc)?.[1];
      const vraie = sens === 'supérieure' ? Number(mesure) > Number(seuil) : Number(mesure) < Number(seuil);
      expect(q.answer.options[q.answer.correct], q.prompt).toBe(vraie ? oui : non);
      controles++;
    }
    expect(controles).toBeGreaterThan(100);
  });

  it('tests : la valeur révélatrice et l’essai en écart sont les seuls à contredire le besoin', () => {
    const s = notion('t5-tester-programme');
    for (const q of tirages(s, 4)) {
      if (q.answer.kind !== 'choice') continue;
      const demande = nombre(q.prompt, /supérieure à (\d+)/);
      const ecrit = nombre(lignes(q), /> (\d+)/);
      const differe = q.answer.options.filter(
        (o) => Number.parseInt(o, 10) > demande !== Number.parseInt(o, 10) > ecrit,
      );
      expect(differe, q.prompt).toEqual([q.answer.options[q.answer.correct]]);
    }
    for (const q of tirages(s, 5)) {
      if (q.answer.kind !== 'choice' || !q.prompt.startsWith('Compare')) continue;
      const seuil = nombre(q.prompt, /seuil de (\d+)/);
      const essai = new RegExp(`Essai (\\d) : mesure ${seuil} `).exec(lignes(q))?.[1];
      expect(q.answer.options[q.answer.correct], q.prompt).toBe(`l’essai ${essai}`);
    }
  });
});
