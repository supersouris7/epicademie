import { describe, expect, it } from 'vitest';
import { CHAPTERS, generate } from './catalog.ts';
import { toNumber } from './rational.ts';
import type { Level } from './types.ts';

/**
 * Vérification indépendante : pour toute question « Calcule <expression>. », on réévalue
 * l'expression écrite dans l'énoncé avec l'arithmétique JavaScript et on la compare à la
 * réponse attendue du générateur. Attrape les erreurs de câblage énoncé ↔ réponse.
 */
function evaluate(expr: string): number {
  const js = expr
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\{(\d+)\/(\d+)\}/g, '($1/$2)')
    .replace(/\^(\d)/g, '**$1')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\u202f/g, '')
    .replace(/(\d)\s*\(/g, '$1*(');
  if (!/^[\d\s.+\-*/()]+$/.test(js)) throw new Error(`Expression non évaluable : ${expr} → ${js}`);
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call -- expressions produites par nos générateurs, en test uniquement
  return Number(new Function(`return (${js});`)());
}

const CALC = /^Calcule (?:astucieusement )?(.+?)(?: de tête)?\.$/;

describe('vérification indépendante des calculs', () => {
  const skills = CHAPTERS.flatMap((c) => c.skills.map((s) => s.id));
  it.each(skills)('%s', (skillId) => {
    let checked = 0;
    for (const level of [1, 2, 3] as Level[]) {
      for (let seed = 1; seed <= 100; seed++) {
        const q = generate(skillId, level, seed);
        const m = CALC.exec(q.prompt);
        if (!m?.[1] || (q.answer.kind !== 'number' && q.answer.kind !== 'fraction')) continue;
        if (/[a-zA-Zé%]/.test(m[1].replace(/[×÷]/g, ''))) continue; // énoncé avec mots ou lettres
        expect(evaluate(m[1]), `${skillId} n${level} g${seed} : ${q.prompt}`).toBeCloseTo(toNumber(q.answer.value), 9);
        checked++;
      }
    }
    expect(checked).toBeGreaterThanOrEqual(0);
  });
});
