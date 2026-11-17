import { describe, expect, it } from 'vitest';
import {
  conversionDemo,
  conversionNeeded,
  emptyConversion,
  measureKind,
  readConversion,
  type ConversionState,
} from './conversion.ts';

const table = (cells: Record<number, string>, comma: number | null): ConversionState => {
  const empty = emptyConversion('longueur');
  return { ...empty, digits: empty.digits.map((_, i) => cells[i] ?? null), comma };
};

describe('lecture du tableau de conversion', () => {
  it('lit chiffres et virgule comme sur le cahier', () => {
    expect(readConversion(table({ 3: '2', 4: '5' }, 3))).toBe('2,5');
    expect(readConversion(table({ 3: '2', 4: '5' }, null))).toBe('25');
    expect(readConversion(table({ 2: '1' }, 4))).toBe('100');
    expect(readConversion(table({ 5: '7' }, 2))).toBe('0,007');
  });
  it('zéros inutiles retirés, tableau vide', () => {
    expect(readConversion(table({ 1: '0', 2: '3', 3: '5', 4: '0' }, 3))).toBe('35');
    expect(readConversion(table({}, 2))).toBeNull();
  });
});

describe('grandeur de la question', () => {
  it('longueurs, aires, volumes et contenances', () => {
    expect(measureKind('Complète : 3,5 km = … m')).toBe('longueur');
    expect(measureKind('Un champ de 120 m^2 de surface')).toBe('aire');
    expect(measureKind('Calcule l’aire d’un disque de rayon 5 cm, en cm^2', 'cm^2')).toBe('aire');
    expect(measureKind('Complète : 3 dm^3 = … L')).toBe('volume');
    expect(measureKind('Une bouteille de 75 cL')).toBe('volume');
  });
  it('pas de mesure : calculs, lettres', () => {
    expect(measureKind('Calcule 3 × m pour m = 4.')).toBeNull();
    expect(measureKind('Calcule 12 + 7.')).toBeNull();
  });
});

describe('démonstration de conversion', () => {
  it('place le nombre puis le lit dans l’unité demandée', () => {
    const d = conversionDemo('longueur', '3,5', 'm', 'cm');
    expect(d && readConversion(d.before)).toBe('3,5');
    expect(d && readConversion(d.after)).toBe('350');
    const v = conversionDemo('volume', '2,8', 'mL', 'dm^3');
    expect(v?.padRight).toBe(1);
    expect(v && readConversion(v.after)).toBe('0,0028');
    const a = conversionDemo('aire', '450', 'cm^2', 'dm^2');
    expect(a && readConversion(a.after)).toBe('4,5');
    const l = conversionDemo('volume', '5', 'L', 'cL');
    expect(l && readConversion(l.after)).toBe('500');
  });
  it('unité inconnue', () => {
    expect(conversionDemo('longueur', '3', 'm', 'L')).toBeNull();
  });
});

describe('tableau de conversion utile', () => {
  it('seulement quand deux unités d’une même grandeur se mêlent', () => {
    expect(conversionNeeded('Complète : 3 mL = … L', 'L')).toBe('volume');
    expect(conversionNeeded('Complète : 4,5 m = … cm', 'cm')).toBe('longueur');
    expect(conversionNeeded('Un terrain de 3 hm^2 : combien de m^2 ?', 'm^2')).toBe('aire');
    expect(conversionNeeded('Calcule l’aire de ce triangle (en cm^2).', 'cm^2')).toBeNull();
    expect(conversionNeeded('Calcule l’aire d’un disque de rayon 5 cm, en cm^2', 'cm^2')).toBeNull();
    expect(conversionNeeded('Calcule 3 × 4.')).toBeNull();
  });
});
