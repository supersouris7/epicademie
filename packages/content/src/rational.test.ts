import { describe, expect, it } from 'vitest';
import {
  add,
  cmp,
  dec,
  div,
  fmt,
  fmtSigned,
  frac,
  fromNumber,
  isDecimal,
  mul,
  parseDecimal,
  r,
  sub,
} from './rational.ts';

describe('rationnels', () => {
  it('normalise et calcule exactement', () => {
    expect(r(6, -8)).toEqual({ n: -3, d: 4 });
    expect(add(dec(1, 1), dec(2, 1))).toEqual(dec(3, 1)); // 0,1 + 0,2 = 0,3 exactement
    expect(sub(r(1, 2), r(1, 3))).toEqual(r(1, 6));
    expect(mul(dec(6, 1), r(7))).toEqual(dec(42, 1));
    expect(div(dec(42, 1), dec(6, 1))).toEqual(r(7));
    expect(cmp(r(-8), r(-3))).toBe(-1);
    expect(() => r(1, 0)).toThrow(RangeError);
  });
  it('formate à la française', () => {
    expect(fmt(dec(-35, 2))).toBe('−0,35');
    expect(fmt(r(12345))).toBe('12 345');
    expect(fmt(r(1200))).toBe('1200');
    expect(fmt(r(3, 4))).toBe('0,75');
    expect(fmtSigned(r(3))).toBe('(+3)');
    expect(frac(r(-2, 3))).toBe('−{2/3}');
    expect(() => fmt(r(1, 3))).toThrow();
    expect(isDecimal(r(7, 40))).toBe(true);
  });
  it('lit les saisies élèves', () => {
    expect(parseDecimal('3,5')).toEqual(dec(35, 1));
    expect(parseDecimal('−0.25')).toEqual(dec(-25, 2));
    expect(parseDecimal(' 1 200 ')).toEqual(r(1200));
    expect(parseDecimal(',5')).toEqual(dec(5, 1));
    expect(parseDecimal('3,,2')).toBeNull();
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('abc')).toBeNull();
  });
  it('convertit les nombres JS propres', () => {
    expect(fromNumber(0.1 + 0.2 - 0.0000000000000001)).toEqual(dec(3, 1));
    expect(fromNumber(-2.5)).toEqual(dec(-25, 1));
  });
});
