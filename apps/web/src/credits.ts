/** Crédits tiers (métadonnées relevées dans @dicebear/styles 10.6.0 et @fontsource). */
export interface Credit {
  readonly work: string;
  readonly author: string;
  readonly license: string;
  readonly licenseUrl: string;
  readonly sourceUrl: string;
}

const CC_BY = 'https://creativecommons.org/licenses/by/4.0/';

export const CREDITS: readonly Credit[] = [
  {
    work: 'Avatars « Fun Emoji »',
    author: 'Davis Uche',
    license: 'CC BY 4.0',
    licenseUrl: CC_BY,
    sourceUrl: 'https://www.figma.com/community/file/968125295144990435',
  },
  {
    work: 'Avatars « Adventurer Neutral »',
    author: 'Lisa Wischofsky',
    license: 'CC BY 4.0',
    licenseUrl: CC_BY,
    sourceUrl: 'https://www.figma.com/community/file/1184595184137881796',
  },
  {
    work: 'Avatars « Pixelbot »',
    author: 'DiceBear',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://www.dicebear.com',
  },
  {
    work: 'Effets sonores « Interface Sounds »',
    author: 'Kenney (kenney.nl)',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://kenney.nl/assets/interface-sounds',
  },
  {
    work: 'Moteur d’avatars DiceBear',
    author: 'Florian Körner',
    license: 'MIT',
    licenseUrl: 'https://github.com/dicebear/dicebear/blob/10.x/LICENSE',
    sourceUrl: 'https://www.dicebear.com',
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
