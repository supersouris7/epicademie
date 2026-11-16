/**
 * Humeurs de Questy : visages en pixels LED (grille 16×16, même rendu que les avatars pixelbot).
 * Chaque motif est centré automatiquement ; `#` = pixel allumé.
 */
export interface Mood {
  readonly label: string;
  /** Couleur des LED. */
  readonly glow: string;
  /** Fond de l'écran (teinte sombre assortie). */
  readonly screen: string;
  readonly pixels: readonly string[];
}

export const MOODS = {
  ok: {
    label: 'Ça roule',
    glow: '#5ef38c',
    screen: '#04291c',
    pixels: [
      '.##....##.', //
      '.##....##.',
      '..........',
      '..........',
      '.#......#.',
      '..######..',
    ],
  },
  happy: {
    label: 'Content',
    glow: '#4cc9f0',
    screen: '#0b1f4d',
    pixels: [
      '..#....#..', //
      '.#.#..#.#.',
      '..........',
      '.########.',
      '.#......#.',
      '..######..',
    ],
  },
  laugh: {
    label: 'Mort de rire',
    glow: '#67e8f9',
    screen: '#06303a',
    pixels: [
      '.#......#.', //
      '..#....#..',
      '.#......#.',
      '..........',
      '.########.',
      '.##....##.',
      '..######..',
    ],
  },
  love: {
    label: 'Amoureux',
    glow: '#ff7ac8',
    screen: '#4a0629',
    pixels: [
      '##.##..##.##', //
      '#####..#####',
      '.###....###.',
      '..#......#..',
      '............',
      '...#....#...',
      '....####....',
    ],
  },
  wow: {
    label: 'Bluffé',
    glow: '#fde047',
    screen: '#352805',
    pixels: [
      '.##....##.', //
      '#..#..#..#',
      '#..#..#..#',
      '.##....##.',
      '..........',
      '....##....',
      '...#..#...',
      '....##....',
    ],
  },
  proud: {
    label: 'Champion',
    glow: '#ffc83d',
    screen: '#3a2600',
    pixels: [
      '.#......#.', //
      '###....###',
      '.#......#.',
      '..........',
      '.########.',
      '..######..',
    ],
  },
  cool: {
    label: 'Trop cool',
    glow: '#e0f2fe',
    screen: '#0b1324',
    pixels: [
      '##########', //
      '.###..###.',
      '..#....#..',
      '..........',
      '.......##.',
      '..######..',
    ],
  },
  wink: {
    label: 'Clin d’œil',
    glow: '#7dd3fc',
    screen: '#0c2340',
    pixels: [
      '.##........', //
      '.##....###.',
      '...........',
      '...........',
      '.#.......#.',
      '..#######..',
      '......##...',
    ],
  },
  angry: {
    label: 'Très énervé',
    glow: '#ff3b3b',
    screen: '#420707',
    pixels: [
      '.##......##.', //
      '..###..###..',
      '....#..#....',
      '............',
      '..##....##..',
      '..##....##..',
      '............',
      '...######...',
      '..#......#..',
    ],
  },
  sad: {
    label: 'Triste',
    glow: '#a5b4fc',
    screen: '#1a1745',
    pixels: [
      '....#..#....', //
      '..##....##..',
      '............',
      '..##....##..',
      '..##....##..',
      '..#.........',
      '..#.........',
      '....####....',
      '...#....#...',
    ],
  },
  dizzy: {
    label: 'Sonné',
    glow: '#fdba74',
    screen: '#3d1405',
    pixels: [
      '.#.#....#.#.', //
      '..#......#..',
      '.#.#....#.#.',
      '............',
      '............',
      '..##..##..##',
      '.#..##..##..',
    ],
  },
  sleepy: {
    label: 'Endormi',
    glow: '#c4b5fd',
    screen: '#24104d',
    pixels: [
      '.......###.', //
      '.........#.',
      '........#..',
      '.......###.',
      '...........',
      '.###...###.',
      '...........',
      '.....#.....',
      '....#.#....',
      '.....#.....',
    ],
  },
} as const satisfies Record<string, Mood>;

export type MoodId = keyof typeof MOODS;
export const MOOD_IDS = Object.keys(MOODS) as MoodId[];

export const GRID = 16;

/** Coordonnées (colonne, ligne) des pixels allumés, motif centré dans la grille. */
export function litPixels(mood: Mood): [number, number][] {
  const height = mood.pixels.length;
  const width = Math.max(...mood.pixels.map((r) => r.length));
  const top = Math.floor((GRID - height) / 2);
  const left = Math.floor((GRID - width) / 2);
  const out: [number, number][] = [];
  mood.pixels.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '#') out.push([left + x, top + y]);
    }
  });
  return out;
}
