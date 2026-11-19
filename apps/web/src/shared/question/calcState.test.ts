import { describe, expect, it } from 'vitest';
import { calcRows, EMPTY_CALC, pressCalc } from './calcState.ts';

const press = (...keys: string[]) => keys.reduce(pressCalc, EMPTY_CALC);

describe('état de la calculatrice', () => {
  it('insère les fonctions et les efface d’un bloc', () => {
    expect(press('8', '×', 'cos', '3', '5', ')').expr).toBe('8×cos(35)');
    expect(press('cos⁻¹', '⌫').expr).toBe('');
    expect(press('2', '√', '⌫').expr).toBe('2');
    expect(press('5', 'x²', '=').result).toBe('25');
    expect(press('2', 'xⁿ', '3', '=').result).toBe('8');
  });
  it('propose les touches du programme de chaque classe', () => {
    const flat = (g: Parameters<typeof calcRows>[0]) => calcRows(g).flat();
    expect(flat('cm1')).not.toContain('π');
    expect(flat('6e')).toContain('π');
    expect(flat('5e')).toEqual(expect.arrayContaining(['x²', '√']));
    expect(flat('4e')).toContain('xⁿ');
    expect(flat('4e')).not.toContain('cos');
    expect(flat('3e')).toEqual(expect.arrayContaining(['cos', 'sin', 'tan', 'cos⁻¹']));
  });
});
