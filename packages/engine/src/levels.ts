/** XP nécessaire pour passer du niveau `level` au niveau `level + 1`. */
export function xpToNextLevel(level: number): number {
  if (!Number.isInteger(level) || level < 1) throw new RangeError(`Niveau invalide : ${level}`);
  return Math.round(100 * level ** 1.5);
}

export interface LevelProgress {
  readonly level: number;
  /** XP accumulé dans le niveau courant. */
  readonly xpInLevel: number;
  /** XP total requis pour finir le niveau courant. */
  readonly xpForNext: number;
  readonly title: string;
}

const TITLES: readonly (readonly [minLevel: number, title: string])[] = [
  [50, 'Légende'],
  [35, 'Champion'],
  [20, 'Héros'],
  [10, 'Aventurier'],
  [5, 'Explorateur'],
  [1, 'Apprenti'],
];

export function titleForLevel(level: number): string {
  return TITLES.find(([min]) => level >= min)?.[1] ?? 'Apprenti';
}

export function levelFromXp(totalXp: number): LevelProgress {
  if (!Number.isFinite(totalXp) || totalXp < 0) throw new RangeError(`XP invalide : ${totalXp}`);
  let level = 1;
  let remaining = Math.floor(totalXp);
  while (remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level);
    level += 1;
  }
  return { level, xpInLevel: remaining, xpForNext: xpToNextLevel(level), title: titleForLevel(level) };
}
