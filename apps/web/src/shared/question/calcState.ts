import type { Grade } from '@epicademie/shared';
import { CALC_FUNCTIONS, CalcError, evaluate, formatResult } from './calc.ts';

export interface CalcState {
  readonly expr: string;
  readonly result: string | null;
}
export const EMPTY_CALC: CalcState = { expr: '', result: null };

/** Touches de fonction → texte inséré dans l'affichage. */
export const CALC_INSERT: Record<string, string> = {
  'x²': '²',
  xⁿ: '^',
  '√': '√(',
  cos: 'cos(',
  sin: 'sin(',
  tan: 'tan(',
  'cos⁻¹': 'cos⁻¹(',
  'sin⁻¹': 'sin⁻¹(',
  'tan⁻¹': 'tan⁻¹(',
};

/**
 * Rangées de touches de fonction selon la classe, au-dessus du pavé : les outils du programme,
 * pas plus (π dès la 6e, carré et racine en 5e, puissances en 4e, trigonométrie en 3e).
 */
export function calcRows(grade: Grade | undefined): string[][] {
  switch (grade) {
    case 'cm1':
    case 'cm2':
      return [['(', ')']];
    case '6e':
      return [['(', ')', 'π']];
    case '5e':
      return [['(', ')', 'π', 'x²', '√']];
    case '4e':
      return [['(', ')', 'π', 'x²', 'xⁿ', '√']];
    default:
      // 3e, adulte ou classe inconnue : calculatrice scientifique complète.
      return [
        ['(', ')', 'π', 'x²', 'xⁿ', '√'],
        ['cos', 'sin', 'tan', 'cos⁻¹', 'sin⁻¹', 'tan⁻¹'],
      ];
  }
}

const TOKENS = Object.keys(CALC_FUNCTIONS);

export function pressCalc(state: CalcState, k: string): CalcState {
  if (k === 'C') return EMPTY_CALC;
  if (k === '⌫') {
    // Une fonction s'efface d'un bloc (« cos( »), pas lettre par lettre.
    const token = TOKENS.find((t) => state.expr.endsWith(t));
    return { expr: state.expr.slice(0, -(token?.length ?? 1)), result: null };
  }
  if (k === '=') {
    try {
      const r = formatResult(evaluate(state.expr));
      return { expr: r, result: r };
    } catch (err) {
      return { ...state, result: err instanceof CalcError ? err.message : 'Erreur' };
    }
  }
  const text = CALC_INSERT[k] ?? k;
  return { expr: state.expr.length + text.length <= 40 ? state.expr + text : state.expr, result: null };
}

/** Valeur à envoyer dans la réponse : le résultat affiché, sinon l'expression évaluée ; null si incalculable. */
export function sendable(state: CalcState): string | null {
  if (state.result !== null) return /^[−\d]/.test(state.result) ? state.result : null;
  if (!state.expr) return null;
  try {
    const r = formatResult(evaluate(state.expr));
    return r === 'Erreur' ? null : r;
  } catch {
    return null;
  }
}
