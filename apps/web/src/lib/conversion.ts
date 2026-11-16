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
