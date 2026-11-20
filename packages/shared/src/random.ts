/**
 * Tirages au hasard sur des listes, à partir d'une source de hasard fournie par l'appelant
 * (`() => number` dans [0, 1)). La source est injectée pour que chaque usage reste
 * reproductible : générateur à graine des exercices, dés du serveur, tests.
 */

/** Source de hasard : un flottant dans [0, 1). */
export type RandomSource = () => number;

/** Indice dans [0, length) correspondant au tirage `r` ∈ [0, 1) (robuste à r = 1 inclus). */
export function indexFor(length: number, r: number): number {
  if (length <= 0) throw new RangeError('Liste vide');
  return Math.floor(r * length) % length;
}

/** Élément de la liste correspondant au tirage `r` ∈ [0, 1). */
export function pickAt<T>(items: readonly T[], r: number): T {
  return items[indexFor(items.length, r)] as T;
}

/** Copie mélangée de la liste (Fisher-Yates : toutes les permutations équiprobables). */
export function shuffleWith<T>(items: readonly T[], random: RandomSource): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}
