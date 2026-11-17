import { describe, expect, it } from 'vitest';
import { CalcError, evaluate, formatResult } from './calc.ts';

describe('calculatrice', () => {
  it('respecte les priorités et les parenthèses', () => {
    expect(evaluate('2+3×4')).toBe(14);
    expect(evaluate('(2+3)×4')).toBe(20);
    expect(evaluate('3,14×5×5')).toBeCloseTo(78.5);
    expect(evaluate('−4+10÷4')).toBe(-1.5);
  });
  it('signale les erreurs', () => {
    expect(() => evaluate('3÷0')).toThrow(CalcError);
    expect(() => evaluate('(3+2')).toThrow(CalcError);
    expect(() => evaluate('3+')).toThrow(CalcError);
    expect(() => evaluate('alert(1)')).toThrow(CalcError);
  });
  it('affiche à la française sans bruit flottant', () => {
    expect(formatResult(0.1 + 0.2)).toBe('0,3');
    expect(formatResult(-2.5)).toBe('−2,5');
  });
  it('touche π et multiplication implicite', () => {
    expect(evaluate('π')).toBe(Math.PI);
    expect(evaluate('25π')).toBeCloseTo(78.5398, 4);
    expect(evaluate('π×5×5')).toBeCloseTo(78.5398, 4);
    expect(evaluate('2(3+1)')).toBe(8);
    expect(evaluate('(1+1)(2+1)')).toBe(6);
  });
  it('6 décimales au plus, comme la saisie des réponses', () => {
    expect(formatResult(Math.PI * 25)).toBe('78,539816');
    expect(formatResult(Math.PI)).toBe('3,141593');
    expect(formatResult(1 / 3)).toBe('0,333333');
    expect(formatResult(-1e-9)).toBe('0');
    expect(formatResult(1e13)).toBe('Erreur');
  });
});
