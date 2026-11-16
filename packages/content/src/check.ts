import { eq, parseDecimal, r, type Rational } from './rational.ts';
import type { CheckResult, Question, Response } from './types.ts';

function parseFraction(num: string, den: string): Rational | null {
  const n = parseDecimal(num);
  const d = den.trim() === '' ? r(1) : parseDecimal(den);
  if (!n || !d || d.n === 0) return null;
  if (n.d !== 1 || d.d !== 1) return null;
  return r(n.n, d.n);
}

/** Corrige une réponse. Pure et déterministe : utilisée à l'identique par l'appli et le serveur. */
export function check(question: Question, response: Response): CheckResult {
  const { answer, traps } = question;
  const trapFor = (value: Rational) => traps.find((t) => 'value' in t && eq(t.value, value))?.why;

  switch (answer.kind) {
    case 'number': {
      if (response.kind !== 'number') return { correct: false, invalid: true };
      const value = parseDecimal(response.text);
      if (!value) return { correct: false, invalid: true };
      if (eq(value, answer.value)) return { correct: true };
      return { correct: false, why: trapFor(value) };
    }
    case 'fraction': {
      if (response.kind !== 'fraction') return { correct: false, invalid: true };
      const value = parseFraction(response.num, response.den);
      if (!value) return { correct: false, invalid: true };
      if (eq(value, answer.value)) return { correct: true };
      return { correct: false, why: trapFor(value) };
    }
    case 'choice': {
      if (response.kind !== 'choice' || response.index < 0 || response.index >= answer.options.length) {
        return { correct: false, invalid: true };
      }
      if (response.index === answer.correct) return { correct: true };
      const why = traps.find((t) => 'option' in t && t.option === response.index)?.why;
      return { correct: false, why };
    }
    case 'point': {
      if (response.kind !== 'point') return { correct: false, invalid: true };
      if (response.x === answer.x && response.y === answer.y) return { correct: true };
      const why = traps.find((t) => 'point' in t && t.point.x === response.x && t.point.y === response.y)?.why;
      return { correct: false, why };
    }
  }
}
