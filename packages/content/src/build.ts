import { eq, fmt, r, type Rational } from './rational.ts';
import type { Rng } from './rng.ts';
import type { AnswerSpec, Rich, Trap } from './types.ts';

/** Source officielle commune aux notions de maths de 5e. */
export const BO_MATHS = 'Programme de mathématiques du cycle 4, classe de 5e (BO n°10 du 5 mars 2026)';
export const objective = (text: string) => `${BO_MATHS} — « ${text} »`;

export const num = (value: Rational | number, unit?: string): AnswerSpec => ({
  kind: 'number',
  value: typeof value === 'number' ? r(value) : value,
  ...(unit ? { unit } : {}),
});

export const fraction = (value: Rational): AnswerSpec => ({ kind: 'fraction', value });

/** Pièges numériques, en ignorant ceux qui coïncident avec la bonne réponse ou entre eux. */
export function traps(correct: Rational, list: readonly (readonly [Rational | number, Rich])[]): Trap[] {
  const out: Trap[] = [];
  for (const [v, why] of list) {
    const value = typeof v === 'number' ? r(v) : v;
    if (eq(value, correct) || out.some((t) => 'value' in t && eq(t.value, value))) continue;
    out.push({ value, why });
  }
  return out;
}

export interface Option {
  readonly label: Rich;
  /** Explication si l'élève choisit cette option (fausse). */
  readonly why?: Rich;
}

/** QCM : mélange les options (graine) et renvoie la réponse + les pièges associés. */
export function choice(rng: Rng, correct: Rich, wrong: readonly Option[], keepOrder = false) {
  const unique = wrong.filter((w, i) => w.label !== correct && wrong.findIndex((x) => x.label === w.label) === i);
  const all: Option[] = [{ label: correct }, ...unique];
  const options = keepOrder ? all : rng.shuffle(all);
  const answer: AnswerSpec = {
    kind: 'choice',
    options: options.map((o) => o.label),
    correct: options.findIndex((o) => o.label === correct),
  };
  const t: Trap[] = options.flatMap((o, i) => (o.why ? [{ option: i, why: o.why }] : []));
  return { answer, traps: t };
}

/** Vrai / Faux. */
export function trueFalse(isTrue: boolean, whyIfWrong: Rich) {
  const answer: AnswerSpec = { kind: 'choice', options: ['Vrai', 'Faux'], correct: isTrue ? 0 : 1 };
  return { answer, traps: [{ option: isTrue ? 1 : 0, why: whyIfWrong }] satisfies Trap[] };
}

/** Entier tiré au hasard, différent de zéro. */
export const nonZero = (rng: Rng, min: number, max: number) => {
  let v = 0;
  while (v === 0) v = rng.int(min, max);
  return v;
};

/** Tire `count` valeurs distinctes. */
export function distinct<T>(rng: Rng, count: number, draw: () => T, key: (v: T) => string = String): T[] {
  const out: T[] = [];
  for (let guard = 0; out.length < count && guard < 500; guard++) {
    const v = draw();
    if (!out.some((o) => key(o) === key(v))) out.push(v);
  }
  if (out.length < count) throw new Error('Impossible de tirer assez de valeurs distinctes');
  return out;
}

export { fmt };
