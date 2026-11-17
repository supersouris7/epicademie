import { abs, cmp, div, eq, mul, neg, r, sub, type Rational } from './rational.ts';
import type { Rich } from './types.ts';

const POWERS = [10, 100, 1000, 10_000, 100_000, 1_000_000];
const RANKS = ['un rang', 'deux rangs', 'trois rangs', 'quatre rangs', 'cinq rangs', 'six rangs'];

/**
 * Erreur reconnue automatiquement quand aucun piège prévu ne correspond : virgule décalée,
 * signe oublié, fraction à l'envers, petite erreur de calcul. Phrases adressées à l'enfant.
 */
export function diagnose(given: Rational, expected: Rational): Rich | undefined {
  if (expected.n === 0) return undefined;
  if (given.n !== 0) {
    const ratio = div(given, expected);
    for (const [i, p] of POWERS.entries()) {
      const rank = RANKS[i] ?? '';
      if (eq(ratio, r(p)))
        return `Tes chiffres sont bons, mais ton nombre est ${p.toLocaleString('fr-FR')} fois trop grand : la virgule est décalée de ${rank}.`;
      if (eq(ratio, r(1, p)))
        return `Tes chiffres sont bons, mais ton nombre est ${p.toLocaleString('fr-FR')} fois trop petit : la virgule est décalée de ${rank}.`;
    }
    if (eq(given, neg(expected))) return 'C’est le bon nombre, mais pas le bon signe !';
    if (expected.d !== 1 && eq(given, r(expected.d, expected.n)))
      return 'Tu as mis la fraction à l’envers : numérateur et dénominateur sont inversés.';
  }
  // Petite erreur : moins de 10 % d'écart, mais pas la bonne valeur.
  const gap = abs(sub(given, expected));
  if (cmp(mul(gap, r(10)), abs(expected)) <= 0)
    return 'Tu n’es pas loin ! La méthode a l’air bonne, une petite erreur de calcul s’est glissée.';
  return undefined;
}
