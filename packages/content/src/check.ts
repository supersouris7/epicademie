import { abs, cmp, dec, eq, fmt, isInteger, mul, parseDecimal, r, sub, type Rational } from './rational.ts';
import { diagnose } from './diagnose.ts';
import type { CheckResult, Question, Response } from './types.ts';

function parseFraction(num: string, den: string): Rational | null {
  const n = parseDecimal(num);
  const d = den.trim() === '' ? r(1) : parseDecimal(den);
  if (!n || !d || d.n === 0) return null;
  if (n.d !== 1 || d.d !== 1) return null;
  return r(n.n, d.n);
}

const ROUND_NAMES = ['à l’unité', 'au dixième', 'au centième', 'au millième'];

/** Normalisation d'une réponse écrite : minuscules, apostrophe droite, espaces simples. */
export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim();
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
      if (eq(value, answer.value) || answer.accept?.some((a) => eq(a, value))) return { correct: true };
      const trap = trapFor(value);
      if (trap) return { correct: false, why: trap };
      const { round } = answer;
      const unrounded = round !== undefined && !isInteger(mul(value, r(10 ** round)));
      if (unrounded && cmp(abs(sub(value, answer.value)), dec(1, round)) <= 0) {
        const how = ROUND_NAMES[round] ?? `à ${round} décimales`;
        return { correct: false, why: `Presque ! Il fallait arrondir ${how} : ${fmt(answer.value)}.` };
      }
      return { correct: false, why: diagnose(value, answer.value) };
    }
    case 'fraction': {
      if (response.kind !== 'fraction') return { correct: false, invalid: true };
      const value = parseFraction(response.num, response.den);
      if (!value) return { correct: false, invalid: true };
      if (eq(value, answer.value)) return { correct: true };
      return { correct: false, why: trapFor(value) ?? diagnose(value, answer.value) };
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
    case 'text': {
      if (response.kind !== 'text' || !response.text.trim()) return { correct: false, invalid: true };
      const given = normalizeText(response.text);
      if (answer.accepted.some((a) => normalizeText(a) === given)) return { correct: true };
      const why = traps.find((t) => 'text' in t && normalizeText(t.text) === given)?.why;
      return { correct: false, why };
    }
  }
}
