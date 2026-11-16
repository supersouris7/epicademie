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

const TITLES: readonly (readonly [minLevel: number, masculin: string, feminin: string])[] = [
  [50, 'Légende', 'Légende'],
  [35, 'Champion', 'Championne'],
  [20, 'Héros', 'Héroïne'],
  [10, 'Aventurier', 'Aventurière'],
  [5, 'Explorateur', 'Exploratrice'],
  [1, 'Apprenti', 'Apprentie'],
];

export function titleForLevel(level: number, gender: 'fille' | 'garcon' | null = null): string {
  const t = TITLES.find(([min]) => level >= min) ?? TITLES[TITLES.length - 1];
  return (gender === 'fille' ? t?.[2] : t?.[1]) ?? 'Apprenti';
}

export function levelFromXp(totalXp: number, gender: 'fille' | 'garcon' | null = null): LevelProgress {
  if (!Number.isFinite(totalXp) || totalXp < 0) throw new RangeError(`XP invalide : ${totalXp}`);
  let level = 1;
  let remaining = Math.floor(totalXp);
  while (remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level);
    level += 1;
  }
  return { level, xpInLevel: remaining, xpForNext: xpToNextLevel(level), title: titleForLevel(level, gender) };
}
