export type ConversionKind = 'longueur' | 'aire' | 'volume' | 'masse';

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
  masse: ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'].map((unit) => ({ unit, cells: 1 })),
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
  for (const m of prompt.matchAll(
    /\b(km|hm|dam|m|dm|cm|mm|kL|hL|daL|L|dL|cL|mL|kg|hg|dag|g|dg|cg|mg)(\^[23])?(?![a-zA-Z])/g,
  ))
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
const MASS_UNIT = '(?:kg|hg|dag|g|dg|cg|mg)';

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
  if (afterNumber(MASS_UNIT)) return 'masse';
  return null;
}

/** Case des unités d'une unité dans le tableau (« cm^2 » : 2e case de sa colonne ; « L » : sous dm^3). */
export function unitCell(kind: ConversionKind, unit: string): number | null {
  let start = 0;
  for (const c of LAYOUTS[kind]) {
    if (c.unit === unit) return start + c.cells - 1;
    const k = c.capacity?.indexOf(unit) ?? -1;
    if (k >= 0 && unit !== '') return start + k;
    start += c.cells;
  }
  return null;
}

export interface ConversionDemo {
  /** Nombre de cases ajoutées à gauche et à droite du tableau pour loger tous les chiffres. */
  readonly padLeft: number;
  readonly padRight: number;
  /** Le nombre placé sous son unité de départ, puis lu dans l'unité d'arrivée (zéros ajoutés). */
  readonly before: ConversionState;
  readonly after: ConversionState;
}

/**
 * Démonstration d'une conversion : `value` (écrit « 2,8 ») placé avec son chiffre des unités sous `from`,
 * puis la virgule déplacée après la case des unités de `to`, les cases vides comblées par des zéros.
 * Les indices des états tiennent compte des cases ajoutées (padLeft).
 */
export function conversionDemo(kind: ConversionKind, value: string, from: string, to: string): ConversionDemo | null {
  const fromCell = unitCell(kind, from);
  const toCell = unitCell(kind, to);
  if (fromCell === null || toCell === null) return null;
  const [int = '0', dec = ''] = value.replace('−', '').split(',');
  const digits = (int + dec).split('');
  const first = fromCell - int.length + 1;
  const last = fromCell + dec.length;
  const total = LAYOUTS[kind].reduce((s, c) => s + c.cells, 0);
  const padLeft = Math.max(0, -Math.min(first, toCell));
  const padRight = Math.max(0, Math.max(last, toCell) - (total - 1));
  const size = padLeft + total + padRight;
  const before: (string | null)[] = Array.from({ length: size }, () => null);
  digits.forEach((d, i) => (before[padLeft + first + i] = d));
  const after = [...before];
  for (let i = Math.min(first, toCell); i <= Math.max(last, toCell); i++) after[padLeft + i] ??= '0';
  return {
    padLeft,
    padRight,
    before: { digits: before, comma: padLeft + fromCell, selected: -1 },
    after: { digits: after, comma: padLeft + toCell, selected: -1 },
  };
}

/**
 * Le tableau de conversion n'est proposé que s'il sert : l'énoncé (et l'unité de la réponse) mêlent
 * au moins deux unités d'une même grandeur (ex. « 3 mL = … L », « en m » pour des longueurs en cm).
 * Une aire de triangle en cm et cm^2 n'en a pas besoin.
 */
export function conversionNeeded(prompt: string, answerUnit?: string): ConversionKind | null {
  const units = unitsIn(`${prompt} ${answerUnit ?? ''}`);
  const families: Record<ConversionKind, Set<string>> = {
    longueur: new Set(),
    aire: new Set(),
    volume: new Set(),
    masse: new Set(),
  };
  for (const u of units) {
    if (u.endsWith('^3') || u.endsWith('L')) families.volume.add(u);
    else if (u.endsWith('g')) families.masse.add(u);
    else if (u.endsWith('^2')) families.aire.add(u);
    else families.longueur.add(u);
  }
  const kinds: ConversionKind[] = ['volume', 'aire', 'longueur', 'masse'];
  return kinds.find((k) => families[k].size >= 2) ?? null;
}
