/**
 * Équilibrage des duels selon l'âge : le plus jeune joue au niveau de référence ;
 * les plus âgés reçoivent des questions plus difficiles et/ou moins de temps.
 */
export interface DuelHandicap {
  /** Niveaux ajoutés au niveau de référence (le résultat est borné à 3). */
  readonly levelBonus: 0 | 1 | 2;
  /** Multiplicateur du temps de réponse (1 = normal). */
  readonly timeFactor: number;
}

export const ADULT_AGE = 18;

export function handicapFor(age: number, youngest: number): DuelHandicap {
  if (age >= ADULT_AGE && youngest < ADULT_AGE) return { levelBonus: 2, timeFactor: 0.5 };
  const gap = age - youngest;
  if (gap >= 6) return { levelBonus: 2, timeFactor: 0.6 };
  if (gap >= 3) return { levelBonus: 1, timeFactor: 0.75 };
  if (gap >= 1) return { levelBonus: 0, timeFactor: 0.9 };
  return { levelBonus: 0, timeFactor: 1 };
}

/** Handicaps de tous les joueurs (âges inconnus = pas de handicap). */
export function duelHandicaps(ages: readonly (number | null)[]): DuelHandicap[] {
  const known = ages.filter((a): a is number => a !== null);
  const youngest = known.length ? Math.min(...known) : 0;
  return ages.map((a) => (a === null ? { levelBonus: 0, timeFactor: 1 } : handicapFor(a, youngest)));
}

export const duelLevel = (base: 1 | 2 | 3, h: DuelHandicap) => Math.min(3, base + h.levelBonus) as 1 | 2 | 3;
