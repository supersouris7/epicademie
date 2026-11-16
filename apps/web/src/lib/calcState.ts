import { CalcError, evaluate, formatResult } from './calc.ts';

export interface CalcState {
  readonly expr: string;
  readonly result: string | null;
}
export const EMPTY_CALC: CalcState = { expr: '', result: null };

export function pressCalc(state: CalcState, k: string): CalcState {
  if (k === 'C') return EMPTY_CALC;
  if (k === '⌫') return { expr: state.expr.slice(0, -1), result: null };
  if (k === '=') {
    try {
      const r = formatResult(evaluate(state.expr));
      return { expr: r, result: r };
    } catch (err) {
      return { ...state, result: err instanceof CalcError ? err.message : 'Erreur' };
    }
  }
  return { expr: state.expr.length < 40 ? state.expr + k : state.expr, result: null };
}
