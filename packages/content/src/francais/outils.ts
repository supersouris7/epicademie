import type { Rng } from '../rng.ts';
import type { Rich, Trap } from '../types.ts';

/** Petits outils communs aux générateurs de français. */

/** Élément d'une liste à un indice valide (échec franc sinon). */
export function at<T>(items: readonly T[], i: number): T {
  const v = items[i];
  if (v === undefined) throw new RangeError(`indice hors liste : ${i}`);
  return v;
}

export const pickN = <T>(rng: Rng, items: readonly T[], n: number): T[] => rng.shuffle(items).slice(0, n);

export const document = (title: string, lines: readonly string[]) => ({
  kind: 'document' as const,
  title,
  lines,
});

export const textTrap = (text: string, why: string): Trap => ({ text, why });

/** Première lettre en minuscule (un groupe sujet placé après « Ce matin, »). */
export const lowerFirst = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);

/** Une écriture en minuscules, sans doublon, pour comparer des propositions. */
export const same = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

/** Une réponse écrite avec ou sans point final. */
export const avecOuSansPoint = (s: string) => [s, s.replace(/\.$/, '')];

/** Pièges écrits, sans doublon ni écriture qui serait une réponse juste. */
export function textTraps(accepted: readonly string[], list: readonly (readonly [string, Rich])[]): Trap[] {
  const out: Trap[] = [];
  const seen = [...accepted];
  for (const [text, why] of list) {
    if (seen.some((s) => same(s, text))) continue;
    seen.push(text);
    out.push(textTrap(text, why));
  }
  return out;
}

/** Colonne de droite mélangée (jamais déjà en face) et paires attendues. */
export function appariement(rng: Rng, droite: readonly string[]) {
  let order = rng.shuffle(droite.map((_, i) => i));
  if (order.every((v, i) => v === i)) order = [...order.slice(1), at(order, 0)];
  return { right: order.map((i) => at(droite, i)), pairs: droite.map((_, i) => order.indexOf(i)) };
}

/** Texte à trous dont chaque trou se choisit dans la même liste. */
export const listes = (options: readonly string[], justes: readonly string[]) =>
  justes.map((juste) => ({ mode: 'list' as const, options: [...options], correct: options.indexOf(juste) }));

/** Texte à trous à saisir. */
export const saisies = (mots: readonly string[]) => mots.map((mot) => ({ mode: 'text' as const, accepted: [mot] }));

/** Ordres des deux colonnes d'une association, jamais déjà face à face. */
export function colonnes<T>(rng: Rng, items: readonly T[]): { gauche: T[]; droite: T[] } {
  const gauche = rng.shuffle(items);
  const droite = rng.shuffle(items);
  return { gauche, droite: droite.every((x, i) => x === gauche[i]) ? [...droite.slice(1), at(droite, 0)] : droite };
}

/** Segments d'un texte à trous : un libellé avant chaque trou, un point à la fin. */
export const segments = (libelles: readonly string[]) => [...libelles.map((l, i) => (i === 0 ? l : `. ${l}`)), '.'];
