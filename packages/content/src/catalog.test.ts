import { describe, expect, it } from 'vitest';
import { CHAPTERS, generate } from './catalog.ts';
import { check } from './check.ts';
import { eq, fmt, frac, toNumber } from './rational.ts';
import type { Figure, Level, Question, Response } from './types.ts';

const LEVELS: Level[] = [1, 2, 3];
const SEEDS = 150;

/** Réponse parfaite attendue pour une question. */
function perfect(q: Question): Response {
  const a = q.answer;
  switch (a.kind) {
    case 'number':
      return { kind: 'number', text: fmt(a.value) };
    case 'fraction':
      return { kind: 'fraction', num: String(a.value.n), den: String(a.value.d) };
    case 'choice':
      return { kind: 'choice', index: a.correct };
    case 'point':
      return { kind: 'point', x: a.x, y: a.y };
    case 'text':
      return { kind: 'text', text: a.accepted[0] ?? '' };
  }
}

function checkFigure(f: Figure | undefined) {
  if (!f) return;
  if (f.kind === 'numberLine') {
    expect(f.max).toBeGreaterThan(f.min);
    for (const p of f.points) {
      expect(p.at).toBeGreaterThanOrEqual(f.min);
      expect(p.at).toBeLessThanOrEqual(f.max);
    }
  }
  if (f.kind === 'grid') {
    for (const p of f.points) {
      expect(p.x).toBeGreaterThanOrEqual(f.xMin);
      expect(p.x).toBeLessThanOrEqual(f.xMax);
      expect(p.y).toBeGreaterThanOrEqual(f.yMin);
      expect(p.y).toBeLessThanOrEqual(f.yMax);
    }
  }
}

const cases = CHAPTERS.flatMap((c) => c.skills.map((s) => [c.id, s.id] as const));

describe('catalogue', () => {
  it('a des identifiants de chapitres uniques et non vides', () => {
    expect(new Set(CHAPTERS.map((c) => c.id)).size).toBe(CHAPTERS.length);
    for (const c of CHAPTERS) expect(c.skills.length).toBeGreaterThan(0);
  });

  it('chaque notion a un mémo court', () => {
    for (const c of CHAPTERS)
      for (const s of c.skills) {
        expect(s.lesson.memo.length, s.id).toBeGreaterThan(0);
        expect(s.lesson.memo.length, s.id).toBeLessThanOrEqual(3);
      }
  });

  it.each(cases)('%s / %s : questions cohérentes (150 graines × 3 niveaux)', (_chapter, skillId) => {
    for (const level of LEVELS) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const q = generate(skillId, level, seed);
        const ctx = `${skillId} niveau ${level} graine ${seed}`;
        expect(q.prompt.length, ctx).toBeGreaterThan(3);
        expect(q.steps.length, `${ctx} : explication en plusieurs bulles`).toBeGreaterThan(1);
        expect(q.hint.length, `${ctx} : indice`).toBeGreaterThan(10);
        expect(q.hint, ctx).not.toMatch(/undefined|NaN|\[object/);
        // L'indice met sur la voie sans donner la réponse.
        if (q.answer.kind === 'number' && Math.abs(toNumber(q.answer.value)) >= 10)
          expect(q.hint, `${ctx} : l’indice donne la réponse`).not.toMatch(
            new RegExp(`= ${fmt(q.answer.value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\d,\u202f])`),
          );
        // La dernière bulle donne la réponse en gras.
        expect(q.steps.join(' '), `${ctx} : réponse en gras`).toMatch(/\*\*/);
        expect(q.prompt, ctx).not.toMatch(/undefined|NaN|\[object/);
        for (const s of q.steps) expect(s, ctx).not.toMatch(/undefined|NaN|\[object/);
        // La bonne réponse est acceptée.
        expect(check(q, perfect(q)).correct, ctx).toBe(true);
        const a = q.answer;
        if (a.kind === 'choice') {
          expect(new Set(a.options).size, `${ctx} options en double`).toBe(a.options.length);
          expect(a.options.length, ctx).toBeGreaterThanOrEqual(2);
          expect(a.correct, ctx).toBeGreaterThanOrEqual(0);
          for (const o of a.options) expect(o, ctx).not.toMatch(/undefined|NaN/);
        }
        // Aucun piège ne coïncide avec la bonne réponse.
        for (const t of q.traps) {
          if ('value' in t && (a.kind === 'number' || a.kind === 'fraction'))
            expect(eq(t.value, a.value), `${ctx} piège = réponse`).toBe(false);
          if ('option' in t && a.kind === 'choice') expect(t.option, `${ctx} piège = bonne option`).not.toBe(a.correct);
          expect(t.why, ctx).not.toMatch(/undefined|NaN/);
        }
        // Les réponses numériques s'écrivent (décimal fini ou fraction).
        if (a.kind === 'number') expect(() => fmt(a.value), ctx).not.toThrow();
        if (a.kind === 'fraction') expect(() => frac(a.value), ctx).not.toThrow();
        checkFigure(q.figure);
        // Déterminisme.
        expect(generate(skillId, level, seed), ctx).toEqual(q);
      }
    }
  });
});
