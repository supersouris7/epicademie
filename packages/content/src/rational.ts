/** Nombres rationnels exacts (n/d, d > 0, forme irréductible) : aucun arrondi flottant dans les calculs d'exercices. */
export interface Rational {
  readonly n: number;
  readonly d: number;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export function r(n: number, d = 1): Rational {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || d === 0) {
    throw new RangeError(`Rationnel invalide : ${n}/${d}`);
  }
  const g = gcd(n, d) || 1;
  const s = d < 0 ? -1 : 1;
  return { n: (s * n) / g || 0, d: (s * d) / g };
}

/** Décimal exact : dec(27, 1) = 2,7 ; dec(-35, 2) = −0,35. */
export const dec = (digits: number, decimals: number): Rational => r(digits, 10 ** decimals);

export const add = (a: Rational, b: Rational) => r(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Rational, b: Rational) => r(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Rational, b: Rational) => r(a.n * b.n, a.d * b.d);
export const div = (a: Rational, b: Rational) => {
  if (b.n === 0) throw new RangeError('Division par zéro');
  return r(a.n * b.d, a.d * b.n);
};
export const neg = (a: Rational) => r(-a.n, a.d);
export const abs = (a: Rational) => r(Math.abs(a.n), a.d);
export const cmp = (a: Rational, b: Rational) => Math.sign(a.n * b.d - b.n * a.d);
export const eq = (a: Rational, b: Rational) => a.n === b.n && a.d === b.d;
export const isInteger = (a: Rational) => a.d === 1;
export const toNumber = (a: Rational) => a.n / a.d;

/** Vrai si l'écriture décimale est finie (dénominateur de la forme 2^a·5^b). */
export function isDecimal(a: Rational): boolean {
  let d = a.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

const MINUS = '−';

/** Écriture décimale française exacte (virgule, signe moins typographique, espaces fines par milliers). */
export function fmt(a: Rational | number): string {
  const q = typeof a === 'number' ? fromNumber(a) : a;
  if (!isDecimal(q)) throw new RangeError(`Écriture décimale infinie : ${q.n}/${q.d}`);
  let scale = 0;
  while (10 ** scale % q.d !== 0) scale++;
  const scaled = Math.abs((q.n * 10 ** scale) / q.d);
  const digits = String(Math.round(scaled)).padStart(scale + 1, '0');
  const intPart = digits.slice(0, digits.length - scale) || '0';
  const fracPart = scale ? digits.slice(digits.length - scale) : '';
  const grouped = intPart.length > 4 ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : intPart;
  return `${q.n < 0 ? MINUS : ''}${grouped}${fracPart ? `,${fracPart}` : ''}`;
}

/** Relatif avec signe explicite : (+3), (−2,5). */
export function fmtSigned(a: Rational | number): string {
  const q = typeof a === 'number' ? fromNumber(a) : a;
  return `(${q.n >= 0 ? '+' : ''}${fmt(q)})`;
}

/** Fraction en mini-balisage `{n/d}` (affichée empilée), ou entier si d = 1. */
export function frac(a: Rational): string {
  if (a.d === 1) return fmt(a);
  return `${a.n < 0 ? MINUS : ''}{${Math.abs(a.n)}/${a.d}}`;
}

/** Fraction non simplifiée (ex. 6/8 tel quel). */
export const rawFrac = (n: number, d: number) => `${n < 0 ? MINUS : ''}{${Math.abs(n)}/${d}}`;

/** Conversion d'un nombre JS « propre » (au plus 6 décimales) en rationnel exact. */
export function fromNumber(x: number): Rational {
  if (!Number.isFinite(x)) throw new RangeError(`Nombre invalide : ${x}`);
  for (let k = 0; k <= 6; k++) {
    const scaled = x * 10 ** k;
    if (Math.abs(scaled - Math.round(scaled)) < 1e-9) return r(Math.round(scaled), 10 ** k);
  }
  throw new RangeError(`Trop de décimales : ${x}`);
}

/**
 * Lecture d'une saisie élève : « 3,5 », « -2 », « −0.25 », « 1 200 ».
 * Renvoie `null` si la saisie n'est pas un nombre décimal valide.
 */
export function parseDecimal(text: string): Rational | null {
  const s = text
    .replace(/[\s\u202f\u00a0]/g, '')
    .replace(MINUS, '-')
    .replace(',', '.');
  const m = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(s) ?? /^([+-]?)()\.(\d+)$/.exec(s);
  if (!m) return null;
  const [, sign = '', int = '', frac = ''] = m;
  if (frac.length > 6 || int.length > 12) return null;
  const value = r(Number(`${int || '0'}${frac}`), 10 ** frac.length);
  return sign === '-' ? neg(value) : value;
}
