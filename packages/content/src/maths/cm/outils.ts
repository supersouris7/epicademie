import { dec, type Rational } from '../../rational.ts';
import type { Rng } from '../../rng.ts';

/**
 * Programmes du CM1 et du CM2 (cycle 3, BO n°16 du 17 avril 2025). Les deux années ont la même structure ;
 * les bornes changent : nombres jusqu'à 999 999 (CM1) ou 999 999 999 (CM2), décimaux jusqu'aux centièmes
 * (CM1) ou millièmes (CM2), fractions de dénominateur ≤ 20 (CM1) ou ≤ 60 (CM2)…
 */

export type CM = 'cm1' | 'cm2';

export const UNITS = [
  '',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
];
export const TENS = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

/** Nombre de 0 à 99 en lettres (orthographe de 1990 : traits d'union partout). */
export function under100(n: number): string {
  if (n <= 16) return UNITS[n] ?? '';
  if (n < 20) return `dix-${UNITS[n - 10] ?? ''}`;
  if (n < 70) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (u === 0) return TENS[t] ?? '';
    return u === 1 ? `${TENS[t]}-et-un` : `${TENS[t]}-${UNITS[u]}`;
  }
  if (n < 80) return n === 71 ? 'soixante-et-onze' : `soixante-${under100(n - 60)}`;
  if (n === 80) return 'quatre-vingts';
  return `quatre-vingt-${under100(n - 80)}`;
}
/** 0 à 999 en lettres. */
export function under1000(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h === 0) return under100(rest);
  const head = h === 1 ? 'cent' : `${UNITS[h]}-cent${rest === 0 ? 's' : ''}`;
  return rest === 0 ? head : `${head}-${under100(rest)}`;
}
/** Entier jusqu'à 999 999 999 en lettres (« mille » invariable, « millions » au pluriel, « cents » final). */
export function inWords(n: number): string {
  if (n === 0) return 'zéro';
  const m = Math.floor(n / 1_000_000);
  const k = Math.floor((n % 1_000_000) / 1000);
  const u = n % 1000;
  const parts: string[] = [];
  if (m) parts.push(`${under1000(m)}-million${m > 1 ? 's' : ''}`);
  if (k) parts.push(k === 1 ? 'mille' : `${under1000(k).replace(/(cent|vingt)s$/, '$1')}-mille`);
  if (u) parts.push(under1000(u));
  return parts.join('-');
}

/** Décimal à `d` décimales dont le dernier chiffre n'est pas nul. */
export function exactDecimal(rng: Rng, min: number, max: number, d: number): Rational {
  for (;;) {
    const v = rng.int(min * 10 ** d, max * 10 ** d);
    if (d === 0 || v % 10 !== 0) return dec(v, d);
  }
}

/** Heures et minutes écrites « 2 h 05 » / « 45 min ». */
export const hm = (min: number) =>
  min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;
