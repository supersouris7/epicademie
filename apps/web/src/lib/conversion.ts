export type ConversionKind = 'longueur' | 'aire' | 'volume';

export interface ConversionState {
  readonly digits: readonly (string | null)[];
  readonly comma: number | null;
  readonly selected: number;
}

export interface Column {
  readonly unit: string;
  readonly cells: number;
  readonly capacity?: readonly string[];
}

const LENGTHS = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];

export const LAYOUTS: Record<ConversionKind, readonly Column[]> = {
  longueur: LENGTHS.map((unit) => ({ unit, cells: 1 })),
  aire: LENGTHS.map((u) => ({ unit: `${u}^2`, cells: 2 })),
  // 1 m³ = 1 kL ; 1 dm³ = 1 L (daL, hL à gauche) ; 1 cm³ = 1 mL (cL, dL à gauche).
  volume: [
    { unit: 'm^3', cells: 3, capacity: ['', '', 'kL'] },
    { unit: 'dm^3', cells: 3, capacity: ['hL', 'daL', 'L'] },
    { unit: 'cm^3', cells: 3, capacity: ['dL', 'cL', 'mL'] },
  ],
};

export const emptyConversion = (kind: ConversionKind): ConversionState => ({
  digits: Array.from({ length: LAYOUTS[kind].reduce((s, c) => s + c.cells, 0) }, () => null),
  comma: null,
  selected: 0,
});

/** Unités citées dans l'énoncé (ex. « 3 mL = … L » → mL, L), pour les surligner. */
export function unitsIn(prompt: string): Set<string> {
  const found = new Set<string>();
  for (const m of prompt.matchAll(/\b(km|hm|dam|m|dm|cm|mm|kL|hL|daL|L|dL|cL|mL)(\^[23])?(?![a-zA-Z])/g))
    found.add(`${m[1] ?? ''}${m[2] ?? ''}`);
  return found;
}

/**
 * Nombre lu dans le tableau, comme sur le cahier : des premiers aux derniers chiffres écrits,
 * cases vides intermédiaires lues comme des zéros, virgule après la case marquée.
 * Ex. 2 | 5 | virgule après le 2 → « 2,5 ». Renvoie null si aucun chiffre.
 */
export function readConversion(state: ConversionState): string | null {
  const filled = state.digits.flatMap((d, i) => (d === null ? [] : [i]));
  const first = filled[0];
  const lastDigit = filled[filled.length - 1];
  if (first === undefined || lastDigit === undefined) return null;
  const comma = state.comma ?? lastDigit;
  const start = Math.min(first, comma);
  const end = Math.max(lastDigit, comma);
  const at = (i: number) => state.digits[i] ?? '0';
  let int = '';
  for (let i = start; i <= comma; i++) int += at(i);
  let dec = '';
  for (let i = comma + 1; i <= end; i++) dec += at(i);
  int = int.replace(/^0+(?=\d)/, '');
  dec = dec.replace(/0+$/, '');
  return dec ? `${int},${dec}` : int;
}

const LENGTH_UNIT = '(?:km|hm|dam|m|dm|cm|mm)';
const CAPACITY_UNIT = '(?:kL|hL|daL|L|dL|cL|mL)';

/**
 * Grandeur mesurée par une question (unités après un nombre dans l'énoncé, ou unité de la réponse),
 * pour proposer le bon tableau de conversion ; null si la question ne parle pas de mesures.
 */
export function measureKind(prompt: string, answerUnit?: string): ConversionKind | null {
  const afterNumber = (unit: string, power = '') =>
    new RegExp(`\\d[\\d\\s\\u202f,]*\\s?${unit}${power}(?![\\w^])`).test(prompt) ||
    new RegExp(`^${unit}${power}$`).test(answerUnit ?? '');
  if (afterNumber(LENGTH_UNIT, '\\^3') || afterNumber(CAPACITY_UNIT)) return 'volume';
  if (afterNumber(LENGTH_UNIT, '\\^2')) return 'aire';
  if (afterNumber(LENGTH_UNIT)) return 'longueur';
  return null;
}
