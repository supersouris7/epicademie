/**
 * Opérations posées : disposition en colonnes (pure, sans rendu). L'outil aligne les nombres et prépare
 * les cases ; il ne calcule ni ne vérifie JAMAIS la réponse (c'est l'enfant qui calcule).
 */

export type PosedOp = 'addition' | 'soustraction' | 'multiplication' | 'division';

export const POSED_OPS: readonly PosedOp[] = ['addition', 'soustraction', 'multiplication', 'division'];

/** Nombre saisi : partie entière (sans zéros inutiles devant) et chiffres après la virgule. */
export interface ParsedNumber {
  readonly int: string;
  readonly frac: string;
  readonly comma: boolean;
}

export function parseNumber(text: string): ParsedNumber | null {
  const parts = text.replace('.', ',').split(',');
  const [head = '', tail] = parts;
  if (parts.length > 2 || !/^\d*$/.test(head) || !/^\d*$/.test(tail ?? '') || (head === '' && !tail)) return null;
  return { int: head.replace(/^0+(?=\d)/, '') || '0', frac: tail ?? '', comma: tail !== undefined };
}

export type CellKind =
  | 'text' // chiffre ou signe imposé
  | 'input' // case que l'enfant remplit
  | 'shift' // décalage d'un produit partiel (non modifiable)
  | 'blank';

export interface PosedCell {
  readonly id: string;
  readonly kind: CellKind;
  readonly text?: string;
  /** Nom lu par les lecteurs d'écran (cases à remplir). */
  readonly label?: string;
  /** Trait sous la case (trait de résultat, barre de la potence). */
  readonly under?: boolean;
  /** Trait à gauche de la case (potence). */
  readonly side?: boolean;
  /** Case de retenue : plus petite. */
  readonly small?: boolean;
}

export type RowRole = 'carry' | 'operand' | 'partial' | 'result' | 'quotient' | 'product' | 'rest';

export interface PosedRow {
  readonly id: string;
  readonly role: RowRole;
  readonly cells: readonly PosedCell[];
  /** Légende affichée au-dessus de la ligne (ex. « Quotient »). */
  readonly caption?: string;
}

export interface PosedLayout {
  readonly op: PosedOp;
  readonly cols: number;
  readonly rows: readonly PosedRow[];
  /** Cases à remplir dans l'ordre naturel du calcul (la touche suivante passe à la suivante). */
  readonly order: readonly string[];
  /** Multiplication : chiffres après la virgule dans les deux nombres (pour penser à la virgule). */
  readonly decimals: number;
}

const MAX_STEPS = 8;

const cell = (id: string, kind: CellKind, extra: Partial<PosedCell> = {}): PosedCell => ({ id, kind, ...extra });
const text = (id: string, t: string, extra: Partial<PosedCell> = {}) => cell(id, 'text', { text: t, ...extra });
const blank = (id: string, extra: Partial<PosedCell> = {}) => cell(id, 'blank', extra);

/** Donne à chaque case à remplir son nom (« Résultat, case 1 » = la plus à droite). */
function named(id: string, role: RowRole, name: string, cells: readonly PosedCell[], caption?: string): PosedRow {
  const inputs = cells.filter((c) => c.kind === 'input').length;
  let seen = 0;
  return {
    id,
    role,
    caption,
    cells: cells.map((c) => (c.kind === 'input' ? { ...c, label: `${name}, case ${inputs - seen++}` } : c)),
  };
}

type Column = { kind: 'sign' } | { kind: 'lead' } | { kind: 'comma' } | { kind: 'int' | 'frac'; index: number };

function addSubLayout(op: 'addition' | 'soustraction', a: ParsedNumber, b: ParsedNumber): PosedLayout {
  const intLen = Math.max(a.int.length, b.int.length);
  const fracLen = Math.max(a.frac.length, b.frac.length);
  const columns: Column[] = [
    { kind: 'sign' },
    ...(op === 'addition' ? ([{ kind: 'lead' }] as const) : []),
    ...Array.from({ length: intLen }, (_, index) => ({ kind: 'int' as const, index })),
    ...(fracLen > 0 ? ([{ kind: 'comma' }] as const) : []),
    ...Array.from({ length: fracLen }, (_, index) => ({ kind: 'frac' as const, index })),
  ];
  const lastDigit = columns.length - 1;
  const operand = (rowId: string, n: ParsedNumber, sign: string): PosedRow => ({
    id: rowId,
    role: 'operand',
    cells: columns.map((c, i) => {
      const id = `${rowId}:${i}`;
      switch (c.kind) {
        case 'sign':
          return sign ? text(id, sign) : blank(id);
        case 'comma':
          return text(id, ',');
        case 'int': {
          const digit = n.int[c.index - (intLen - n.int.length)];
          return digit ? text(id, digit) : blank(id);
        }
        case 'frac': {
          const digit = n.frac[c.index];
          return digit ? text(id, digit) : blank(id);
        }
        default:
          return blank(id);
      }
    }),
  });
  const withRule = (row: PosedRow): PosedRow => ({
    ...row,
    cells: row.cells.map((c) => ({ ...c, under: true })),
  });
  const carry = named(
    'c',
    'carry',
    'Retenue',
    columns.map((c, i) =>
      (c.kind === 'int' || c.kind === 'frac') && i !== lastDigit
        ? cell(`c:${i}`, 'input', { small: true })
        : blank(`c:${i}`),
    ),
  );
  const result = named(
    'r',
    'result',
    'Résultat',
    columns.map((c, i) =>
      c.kind === 'comma' ? text(`r:${i}`, ',') : c.kind === 'sign' ? blank(`r:${i}`) : cell(`r:${i}`, 'input'),
    ),
  );
  const rows = [carry, operand('a', a, ''), withRule(operand('b', b, op === 'addition' ? '+' : '−')), result];
  const order = result.cells
    .filter((c) => c.kind === 'input')
    .map((c) => c.id)
    .reverse();
  return { op, cols: columns.length, rows, order, decimals: 0 };
}

const digitsOf = (n: ParsedNumber) => (n.int + n.frac).replace(/^0+(?=\d)/, '');

function multiplicationLayout(a: ParsedNumber, b: ParsedNumber): PosedLayout {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const width = da.length + db.length;
  const cols = width + 1; // colonne 0 : signe
  const fixedRow = (rowId: string, digits: string, sign: string, under: boolean): PosedRow => ({
    id: rowId,
    role: 'operand',
    cells: Array.from({ length: cols }, (_, i) => {
      const k = i - (cols - digits.length);
      if (i === 0 && sign) return text(`${rowId}:0`, sign, { under });
      return k >= 0 ? text(`${rowId}:${i}`, digits[k] ?? '', { under }) : blank(`${rowId}:${i}`, { under });
    }),
  });
  const carry = named(
    'c',
    'carry',
    'Retenue',
    Array.from({ length: cols }, (_, i) =>
      i >= cols - da.length && i < cols - 1 ? cell(`c:${i}`, 'input', { small: true }) : blank(`c:${i}`),
    ),
  );
  const partials = Array.from({ length: db.length }, (_, i) =>
    named(
      `p${i}`,
      'partial',
      `Produit partiel ${i + 1}`,
      Array.from({ length: cols }, (_, c) => {
        const d = c - 1;
        const last = width - 1 - i;
        if (d > last) return cell(`p${i}:${c}`, 'shift', { text: '·' });
        return d >= last - da.length && d >= 0 ? cell(`p${i}:${c}`, 'input') : blank(`p${i}:${c}`);
      }),
    ),
  );
  const result = named(
    'r',
    'result',
    'Résultat',
    Array.from({ length: cols }, (_, i) => (i === 0 ? blank('r:0') : cell(`r:${i}`, 'input'))),
  );
  const fromRight = (row: PosedRow) =>
    row.cells
      .filter((c) => c.kind === 'input')
      .map((c) => c.id)
      .reverse();
  const rows = [
    carry,
    fixedRow('a', da, '', false),
    fixedRow('b', db, '×', true),
    ...partials.map((r, i) =>
      i === partials.length - 1 ? { ...r, cells: r.cells.map((c) => ({ ...c, under: true })) } : r,
    ),
    result,
  ];
  return {
    op: 'multiplication',
    cols,
    rows,
    order: [...partials.flatMap(fromRight), ...fromRight(result)],
    decimals: a.frac.length + b.frac.length,
  };
}

const chars = (n: ParsedNumber) => n.int + (n.comma ? ',' : '') + n.frac;

function divisionLayout(a: ParsedNumber, b: ParsedNumber, extraSteps: number): PosedLayout {
  const dividend = chars(a);
  const divisor = chars(b);
  const n = dividend.length;
  const quotientCells = Math.min(n + 1, 9);
  const right = Math.max(divisor.length, quotientCells);
  const cols = n + 1 + right;
  const sep = n;
  const steps = Math.min(MAX_STEPS, Math.max(1, digitsOf(a).length - digitsOf(b).length + 1) + Math.max(0, extraSteps));
  const left = (rowId: string, make: (i: number) => PosedCell): PosedCell[] => [
    ...Array.from({ length: n }, (_, i) => make(i)),
    ...Array.from({ length: cols - n }, (_, k) => blank(`${rowId}:${n + k}`)),
  ];
  const head: PosedRow = {
    id: 'd',
    role: 'operand',
    cells: [
      ...Array.from(dividend, (ch, i) => text(`d:${i}`, ch)),
      blank(`d:${sep}`, { side: true }),
      ...Array.from({ length: right }, (_, k) =>
        divisor[k]
          ? text(`d:${sep + 1 + k}`, divisor[k] ?? '', { under: true })
          : blank(`d:${sep + 1 + k}`, { under: true }),
      ),
    ],
  };
  const quotient = named(
    'q',
    'quotient',
    'Quotient',
    [
      ...Array.from({ length: n }, (_, i) => blank(`q:${i}`)),
      blank(`q:${sep}`, { side: true }),
      ...Array.from({ length: right }, (_, k) =>
        k < quotientCells ? cell(`q:${sep + 1 + k}`, 'input') : blank(`q:${sep + 1 + k}`),
      ),
    ],
    'Quotient',
  );
  const stepRows = Array.from({ length: steps }, (_, k) => [
    named(
      `s${k}`,
      'product',
      `Soustraction ${k + 1}, nombre à retirer`,
      left(`s${k}`, (i) => cell(`s${k}:${i}`, 'input', { under: true })),
    ),
    named(
      `t${k}`,
      'rest',
      `Soustraction ${k + 1}, ce qui reste`,
      left(`t${k}`, (i) => cell(`t${k}:${i}`, 'input')),
    ),
  ]).flat();
  const rest = named(
    'z',
    'rest',
    'Reste',
    Array.from({ length: cols }, (_, i) => (i < Math.min(4, n) ? cell(`z:${i}`, 'input') : blank(`z:${i}`))),
    'Reste',
  );
  const rows = [head, quotient, ...stepRows, rest];
  const inputsRtl = (row: PosedRow) =>
    row.cells
      .filter((c) => c.kind === 'input')
      .map((c) => c.id)
      .reverse();
  const inputsLtr = (row: PosedRow) => inputsRtl(row).reverse();
  return {
    op: 'division',
    cols,
    rows,
    order: [...inputsLtr(quotient), ...stepRows.flatMap(inputsRtl), ...inputsLtr(rest)],
    decimals: 0,
  };
}

/** Disposition d'une opération ; `null` tant que les nombres sont absents (ou division par zéro). */
export function layoutOf(op: PosedOp, aText: string, bText: string, extraSteps = 0): PosedLayout | null {
  const a = parseNumber(aText);
  const b = parseNumber(bText);
  if (!a || !b) return null;
  if (op === 'addition' || op === 'soustraction') return addSubLayout(op, a, b);
  if (op === 'multiplication') return multiplicationLayout(a, b);
  if (/^0*$/.test(b.int + b.frac)) return null;
  return divisionLayout(a, b, extraSteps);
}

export const isDivisionByZero = (bText: string): boolean => {
  const b = parseNumber(bText);
  return b !== null && /^0*$/.test(b.int + b.frac);
};

/** Identifiants de toutes les cases à remplir de la disposition. */
export const inputIds = (layout: PosedLayout): ReadonlySet<string> =>
  new Set(layout.rows.flatMap((r) => r.cells.filter((c) => c.kind === 'input').map((c) => c.id)));

/** Nombre maximal de caractères d'un nombre saisi (la disposition reste lisible sur téléphone). */
export const MAX_DIGITS = 7;
