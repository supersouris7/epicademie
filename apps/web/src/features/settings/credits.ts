/** Crédits tiers (sons et polices ; les images du jeu sont fournies par l'éditeur). */
export interface Credit {
  readonly work: string;
  readonly author: string;
  readonly license: string;
  readonly licenseUrl: string;
  readonly sourceUrl: string;
}

export const CREDITS: readonly Credit[] = [
  {
    work: 'Effets sonores « Interface Sounds »',
    author: 'Kenney (kenney.nl)',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://kenney.nl/assets/interface-sounds',
  },
  {
    work: 'Bruitages synthétisés (script apps/web/scripts/sounds.mjs)',
    author: 'Épicadémie',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://github.com/supersouris7/questeo/blob/main/apps/web/scripts/sounds.mjs',
  },
  {
    work: 'Police Lilita One',
    author: 'Juan Montoreano',
    license: 'SIL OFL 1.1',
    licenseUrl: 'https://openfontlicense.org',
    sourceUrl: 'https://fonts.google.com/specimen/Lilita+One',
  },
  {
    work: 'Police Nunito',
    author: 'The Nunito Project Authors',
    license: 'SIL OFL 1.1',
    licenseUrl: 'https://openfontlicense.org',
    sourceUrl: 'https://fonts.google.com/specimen/Nunito',
  },
];
