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

type Answer = Question['answer'];
type Trap = Question['traps'][number];
type AnswerOf<K extends Answer['kind']> = Extract<Answer, { kind: K }>;
type ResponseOf<K extends Response['kind']> = Extract<Response, { kind: K }>;

const INVALID: CheckResult = Object.freeze({ correct: false, invalid: true });
const RIGHT: CheckResult = Object.freeze({ correct: true });

/** Explication de l'erreur typique reconnue (piège) correspondant à la réponse, s'il y en a une. */
const trapWhy = (traps: readonly Trap[], matches: (t: Trap) => boolean) => traps.find(matches)?.why;
const valueTrap = (traps: readonly Trap[], value: Rational) =>
  trapWhy(traps, (t) => 'value' in t && eq(t.value, value));

/** Nombre décimal : valeur exacte (ou acceptée), piège connu, arrondi oublié, puis diagnostic générique. */
function checkNumber(answer: AnswerOf<'number'>, response: ResponseOf<'number'>, traps: readonly Trap[]): CheckResult {
  const value = parseDecimal(response.text);
  if (!value) return INVALID;
  if (eq(value, answer.value) || answer.accept?.some((a) => eq(a, value))) return RIGHT;
  const trap = valueTrap(traps, value);
  if (trap) return { correct: false, why: trap };
  const { round } = answer;
  const unrounded = round !== undefined && !isInteger(mul(value, r(10 ** round)));
  if (unrounded && cmp(abs(sub(value, answer.value)), dec(1, round)) <= 0) {
    const how = ROUND_NAMES[round] ?? `à ${round} décimales`;
    return { correct: false, why: `Presque ! Il fallait arrondir ${how} : ${fmt(answer.value)}.` };
  }
  return { correct: false, why: diagnose(value, answer.value) };
}

function checkFraction(
  answer: AnswerOf<'fraction'>,
  response: ResponseOf<'fraction'>,
  traps: readonly Trap[],
): CheckResult {
  const value = parseFraction(response.num, response.den);
  if (!value) return INVALID;
  if (eq(value, answer.value)) return RIGHT;
  return { correct: false, why: valueTrap(traps, value) ?? diagnose(value, answer.value) };
}

function checkChoice(answer: AnswerOf<'choice'>, response: ResponseOf<'choice'>, traps: readonly Trap[]): CheckResult {
  if (response.index < 0 || response.index >= answer.options.length) return INVALID;
  if (response.index === answer.correct) return RIGHT;
  return { correct: false, why: trapWhy(traps, (t) => 'option' in t && t.option === response.index) };
}

function checkPoint(answer: AnswerOf<'point'>, response: ResponseOf<'point'>, traps: readonly Trap[]): CheckResult {
  if (response.x === answer.x && response.y === answer.y) return RIGHT;
  const why = trapWhy(traps, (t) => 'point' in t && t.point.x === response.x && t.point.y === response.y);
  return { correct: false, why };
}

function checkText(answer: AnswerOf<'text'>, response: ResponseOf<'text'>, traps: readonly Trap[]): CheckResult {
  if (!response.text.trim()) return INVALID;
  const given = normalizeText(response.text);
  if (answer.accepted.some((a) => normalizeText(a) === given)) return RIGHT;
  return { correct: false, why: trapWhy(traps, (t) => 'text' in t && normalizeText(t.text) === given) };
}

/**
 * Corrige une réponse. Pure et déterministe : utilisée à l'identique par l'appli et le serveur.
 * Une réponse d'une autre forme que celle attendue (ou illisible) est « invalide » : on la
 * redemande sans compter d'erreur.
 */
export function check(question: Question, response: Response): CheckResult {
  const { answer, traps } = question;
  switch (answer.kind) {
    case 'number':
      return response.kind === 'number' ? checkNumber(answer, response, traps) : INVALID;
    case 'fraction':
      return response.kind === 'fraction' ? checkFraction(answer, response, traps) : INVALID;
    case 'choice':
      return response.kind === 'choice' ? checkChoice(answer, response, traps) : INVALID;
    case 'point':
      return response.kind === 'point' ? checkPoint(answer, response, traps) : INVALID;
    case 'text':
      return response.kind === 'text' ? checkText(answer, response, traps) : INVALID;
  }
}
