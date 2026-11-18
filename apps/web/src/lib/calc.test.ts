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

describe('calculatrice scientifique', () => {
  it('carré, puissance et racine', () => {
    expect(evaluate('5²')).toBe(25);
    expect(evaluate('3²+4²')).toBe(25);
    expect(evaluate('√(3²+4²)')).toBe(5);
    expect(evaluate('2^10')).toBe(1024);
    expect(evaluate('10^−2')).toBeCloseTo(0.01);
    expect(evaluate('−2^2')).toBe(-4);
    expect(evaluate('(−2)²')).toBe(4);
    expect(evaluate('2^3^2')).toBe(512);
    expect(evaluate('2√(9)')).toBe(6);
    expect(() => evaluate('√(−4)')).toThrow(CalcError);
  });
  it('trigonométrie en degrés', () => {
    expect(formatResult(evaluate('cos(60)'))).toBe('0,5');
    expect(formatResult(evaluate('sin(30)'))).toBe('0,5');
    expect(formatResult(evaluate('tan(45)'))).toBe('1');
    expect(formatResult(evaluate('8×cos(35)'))).toBe('6,553216');
    expect(formatResult(evaluate('cos⁻¹(0,5)'))).toBe('60');
    expect(formatResult(evaluate('sin⁻¹(1)'))).toBe('90');
    expect(formatResult(evaluate('tan⁻¹(1)'))).toBe('45');
    expect(formatResult(evaluate('cos⁻¹(3÷5)'))).toBe('53,130102');
    expect(() => evaluate('cos⁻¹(2)')).toThrow(CalcError);
    expect(() => evaluate('tan(90)')).toThrow(CalcError);
    expect(() => evaluate('cos(60')).toThrow(CalcError);
  });
});
