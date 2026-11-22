import { applyKey } from './numpad.ts';
import { inputIds, layoutOf, MAX_DIGITS, type PosedLayout, type PosedOp } from './posedLayout.ts';

/** Ce que les touches remplissent : un des deux nombres, ou une case du calcul. */
export type PosedTarget = 'a' | 'b' | { readonly cell: string };

export interface PosedState {
  readonly op: PosedOp;
  readonly a: string;
  readonly b: string;
  /** Contenu des cases remplies par l'enfant (jamais calculé par l'outil). */
  readonly cells: Readonly<Record<string, string>>;
  /** Soustractions ajoutées à la potence. */
  readonly extraSteps: number;
  readonly target: PosedTarget;
}

export const EMPTY_POSED: PosedState = { op: 'addition', a: '', b: '', cells: {}, extraSteps: 0, target: 'a' };

const layoutFor = (s: PosedState): PosedLayout | null => layoutOf(s.op, s.a, s.b, s.extraSteps);

const without = (cells: PosedState['cells'], id: string): PosedState['cells'] =>
  Object.fromEntries(Object.entries(cells).filter(([k]) => k !== id));

/** Retire les cases qui n'existent plus dans la nouvelle disposition. */
function pruned(s: PosedState): PosedState {
  const layout = layoutFor(s);
  const ids = layout ? inputIds(layout) : new Set<string>();
  const cells = Object.fromEntries(Object.entries(s.cells).filter(([id]) => ids.has(id)));
  const target = typeof s.target === 'object' && !ids.has(s.target.cell) ? ('b' as const) : s.target;
  return { ...s, cells, target };
}

export const setOp = (s: PosedState, op: PosedOp): PosedState =>
  s.op === op
    ? s
    : { ...s, op, cells: {}, extraSteps: 0, target: s.target === 'a' || s.target === 'b' ? s.target : 'a' };

export const selectTarget = (s: PosedState, target: PosedTarget): PosedState => ({ ...s, target });

/** Recommencer : on garde les nombres, on vide toutes les cases. */
export const restart = (s: PosedState): PosedState => ({ ...s, cells: {}, extraSteps: 0 });

export const addStep = (s: PosedState): PosedState => ({ ...s, extraSteps: Math.min(s.extraSteps + 1, 8) });

/** Case suivante dans l'ordre du calcul (la dernière reste sélectionnée). */
function nextCell(layout: PosedLayout, id: string): string {
  const i = layout.order.indexOf(id);
  return i >= 0 && i < layout.order.length - 1 ? (layout.order[i + 1] ?? id) : id;
}

/** « Suivant » (touche Entrée) : du premier nombre au second, puis à la première case. */
export function advance(s: PosedState): PosedState {
  if (s.target === 'a') return { ...s, target: 'b' };
  if (s.target === 'b') {
    const first = layoutFor(s)?.order[0];
    return first ? { ...s, target: { cell: first } } : s;
  }
  return s;
}

/** Touche : chiffre, virgule ou ⌫. Une case contient un seul caractère. */
export function press(s: PosedState, key: string): PosedState {
  if (s.target === 'a' || s.target === 'b') {
    const field = s.target;
    return pruned({ ...s, [field]: applyKey(s[field], key, MAX_DIGITS) });
  }
  const layout = layoutFor(s);
  if (!layout) return s;
  const id = s.target.cell;
  if (key === '⌫') {
    if (s.cells[id]) {
      return { ...s, cells: without(s.cells, id) };
    }
    // Case déjà vide : on revient à la précédente.
    const i = layout.order.indexOf(id);
    const prev = i > 0 ? layout.order[i - 1] : undefined;
    if (!prev) return s;
    return { ...s, cells: without(s.cells, prev), target: { cell: prev } };
  }
  if (!/^[\d,]$/.test(key)) return s;
  return { ...s, cells: { ...s.cells, [id]: key }, target: { cell: nextCell(layout, id) } };
}
