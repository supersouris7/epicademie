/** Matières, récompenses, cadres de HUD, effets et emplacements provisoires. */
import { c, type PaletteName } from '../../../src/design/palette.ts';
import { textPath } from '../font.ts';
import {
  circle,
  fill,
  flat,
  lettering,
  line,
  outline,
  path,
  poly,
  rect,
  regular,
  ring,
  shine,
  stroke,
  toon,
} from '../svg.ts';
import type { SvgAsset } from '../types.ts';
import { calculator } from './icons.ts';

const FLASK = 'M24 5h16v6h-2v12l15 25c3 5-1 11-7 11H14c-6 0-10-6-7-11l15-25V11h-2Z';

export const SUBJECTS: SvgAsset[] = [
  {
    id: 'subject-maths',
    file: 'icons/subjects/maths.svg',
    title: 'Mathématiques',
    usage: 'Icône de la matière maths (choix de matière, progrès).',
    body: calculator('maths-a'),
  },
  {
    id: 'subject-physique',
    file: 'icons/subjects/physique.svg',
    title: 'Physique-chimie',
    usage: 'Icône de la matière physique-chimie.',
    body:
      flat(path(FLASK), 'white') +
      `<clipPath id="phy-c"><path d="${FLASK}"/></clipPath>` +
      `<g clip-path="url(#phy-c)">${fill(path('M0 38h64v26H0Z'), 'violet-500')}${fill(path('M0 52h64v12H0Z'), 'violet-700')}</g>` +
      outline(path(FLASK)) +
      outline(path('M15 38h34'), 3) +
      flat(circle(26, 46, 3.5), 'violet-100', 2.5) +
      flat(circle(37, 50, 2.5), 'violet-100', 2.5) +
      flat(circle(33, 29, 3), 'violet-300', 2.5) +
      shine('M28 14v11', 3, 0.8),
  },
  {
    id: 'subject-anglais',
    file: 'icons/subjects/anglais.svg',
    title: 'Anglais',
    usage: 'Icône de la matière anglais (drapeau stylisé du Royaume-Uni).',
    body:
      `<clipPath id="uk-c"><rect x="4" y="12" width="56" height="40" rx="8"/></clipPath>` +
      `<g clip-path="url(#uk-c)">` +
      fill(rect(4, 12, 56, 40), 'blue-700') +
      stroke('M4 12l56 40M60 12 4 52', 'white', 9, 'butt') +
      stroke('M4 12l56 40M60 12 4 52', 'red-500', 3.5, 'butt') +
      stroke('M32 12v40M4 32h56', 'white', 13, 'butt') +
      stroke('M32 12v40M4 32h56', 'red-500', 7, 'butt') +
      `</g>` +
      outline(rect(4, 12, 56, 40, 8)) +
      shine('M10 18h12', 3, 0.5),
  },
  {
    id: 'subject-espagnol',
    file: 'icons/subjects/espagnol.svg',
    title: 'Espagnol',
    usage: 'Icône de la matière espagnol (drapeau stylisé de l’Espagne).',
    body:
      `<clipPath id="es-c"><rect x="4" y="12" width="56" height="40" rx="8"/></clipPath>` +
      `<g clip-path="url(#es-c)">${fill(rect(4, 12, 56, 40), 'red-500')}${fill(rect(4, 22, 56, 20), 'gold-400')}</g>` +
      outline(rect(4, 12, 56, 40, 8)) +
      shine('M10 17h12', 3, 0.5),
  },
  {
    id: 'subject-histoire',
    file: 'icons/subjects/histoire.svg',
    title: 'Histoire',
    usage: 'Icône de la matière histoire (tour de château : le Moyen Âge est au programme de 5e).',
    body:
      toon('hist-a', path('M10 58V22h8v6h6v-6h8v6h4v-6h8v6h6v-6h8v36Z'), 'cream-300', 'bronze-500') +
      flat(path('M26 58V44a6 6 0 0 1 12 0v14Z'), 'brown-700') +
      flat(rect(16, 34, 6, 8, 2), 'ink', 0) +
      flat(rect(42, 34, 6, 8, 2), 'ink', 0) +
      line('M32 22V6', 'white', 2) +
      flat(path('M33 5l13 5-13 5Z'), 'red-500', 3),
  },
  {
    id: 'subject-geographie',
    file: 'icons/subjects/geographie.svg',
    title: 'Géographie',
    usage: 'Icône de la matière géographie (globe).',
    body:
      `<clipPath id="geo-c"><circle cx="32" cy="32" r="27"/></clipPath>` +
      `<g clip-path="url(#geo-c)">` +
      fill(circle(32, 32, 27), 'cyan-500') +
      fill(path('M30 66a34 34 0 0 0 34-34h4v34Z'), 'cyan-700') +
      fill(
        path('M12 14c7 2 10 7 7 12s3 9 8 9 5 7 0 11-4 9-2 14H4V10ZM40 6c-3 5 2 10 8 10s8 5 5 10l2 4 9-4V4Z'),
        'green-500',
      ) +
      `</g>` +
      outline(path('M12 14c7 2 10 7 7 12s3 9 8 9 5 7 0 11-4 9-2 14M40 6c-3 5 2 10 8 10s8 5 5 10l2 4'), 3) +
      outline(circle(32, 32, 27)) +
      shine('M17 15a22 22 0 0 1 9-6', 4, 0.7),
  },
];

/** Galons de rang gravés sur les médailles : 1 bronze, 2 argent, 3 or ; diamant pour platine. */
const chevrons = (n: number, color: PaletteName) =>
  Array.from({ length: n }, (_, i) => {
    const y = 37 - (n - 1) * 3.5 + i * 7;
    return stroke(`M24 ${y}l8-6 8 6`, color, 4);
  }).join('');

function medal(
  id: string,
  title: string,
  base: PaletteName,
  shade: PaletteName,
  light: PaletteName,
  ribbon: PaletteName,
  ribbonShade: PaletteName,
  emblem: string,
): SvgAsset {
  return {
    id: `medal-${id}`,
    file: `rewards/medals/${id}.svg`,
    title,
    usage: 'Médaille d’une notion (tableau de bord des progrès, bilan de fin de partie).',
    body:
      flat(path('M14 3h12l9 20H23Z'), ribbon, 3) +
      flat(path('M50 3H38l-9 20h12Z'), ribbonShade, 3) +
      toon(`${id}-a`, circle(32, 38, 22), base, shade) +
      ring(circle(32, 38, 15), light, 3) +
      emblem +
      shine('M16.5 33a16 16 0 0 1 6-8', 4, 0.75),
  };
}

export const MEDALS: SvgAsset[] = [
  medal(
    'bronze',
    'Médaille de bronze',
    'bronze-500',
    'bronze-700',
    'bronze-300',
    'red-500',
    'red-700',
    chevrons(1, 'bronze-700'),
  ),
  medal(
    'argent',
    'Médaille d’argent',
    'silver-300',
    'silver-500',
    'silver-100',
    'cyan-500',
    'cyan-700',
    chevrons(2, 'silver-500'),
  ),
  medal('or', 'Médaille d’or', 'gold-400', 'gold-600', 'gold-200', 'violet-500', 'violet-700', chevrons(3, 'gold-600')),
  medal(
    'platine',
    'Médaille de platine',
    'platinum-300',
    'platinum-500',
    'platinum-100',
    'pink-500',
    'pink-700',
    flat(
      poly([
        [32, 28],
        [41, 38],
        [32, 48],
        [23, 38],
      ]),
      'white',
      3,
    ) +
      fill(
        poly([
          [32, 28],
          [41, 38],
          [32, 38],
        ]),
        'platinum-100',
      ),
  ),
  {
    id: 'medal-none',
    file: 'rewards/medals/none.svg',
    title: 'Pas encore de médaille',
    usage: 'Emplacement de médaille non gagnée.',
    body: `<circle cx="32" cy="38" r="20" fill="none" stroke="${c('gray-500')}" stroke-width="4" stroke-dasharray="6 6" stroke-linecap="round"/>`,
  },
];

const CHEST_BASE = 'M8 32h48v22c0 3-2 5-5 5H13c-3 0-5-2-5-5Z';

export const REWARDS: SvgAsset[] = [
  {
    id: 'chest-closed',
    file: 'rewards/chests/chest-closed.svg',
    title: 'Coffre fermé',
    usage: 'Récompense à ouvrir (sans-faute).',
    body:
      toon('chc-a', path(CHEST_BASE), 'violet-500', 'violet-700') +
      toon('chc-b', path('M8 32V23c0-9 7-15 16-15h16c9 0 16 6 16 15v9Z'), 'violet-300', 'violet-500') +
      flat(rect(5, 28, 54, 8, 3), 'gold-400') +
      flat(path('M26 30h12v12c0 2-2 4-6 6-4-2-6-4-6-6Z'), 'gold-400') +
      fill(circle(32, 38, 2.5), 'ink') +
      shine('M15 20a10 10 0 0 1 6-6', 3.5, 0.7),
  },
  {
    id: 'chest-open',
    file: 'rewards/chests/chest-open.svg',
    title: 'Coffre ouvert',
    usage: 'Récompense obtenue.',
    body:
      toon('cho-l', path('M10 26 6 8c0-3 2-5 5-5h42c3 0 5 2 5 5l-4 18Z'), 'violet-300', 'violet-500') +
      flat(path('M10 34c4-8 9-10 14-8 3-5 10-6 14-1 5-3 11-1 15 9Z'), 'gold-400') +
      flat(circle(22, 28, 5), 'gold-400', 3) +
      flat(circle(42, 27, 5), 'gold-400', 3) +
      toon('cho-a', path(CHEST_BASE), 'violet-500', 'violet-700') +
      flat(rect(5, 30, 54, 8, 3), 'gold-400') +
      flat(path('M26 32h12v12c0 2-2 4-6 6-4-2-6-4-6-6Z'), 'gold-400') +
      fill(circle(32, 40, 2.5), 'ink'),
  },
  {
    id: 'trophy',
    file: 'rewards/collectibles/trophy.svg',
    title: 'Trophée',
    usage: 'Record battu, progrès.',
    body:
      outline(path('M15 14H6c0 12 6 18 14 18M49 14h9c0 12-6 18-14 18'), 9) +
      stroke('M15 14H6c0 12 6 18 14 18M49 14h9c0 12-6 18-14 18', 'gold-400', 4) +
      toon('tro-a', path('M14 6h36v12c0 13-8 22-18 22S14 31 14 18Z'), 'gold-400', 'gold-600') +
      flat(rect(27, 39, 10, 9), 'gold-600') +
      toon('tro-b', rect(16, 48, 32, 11, 4), 'violet-500', 'violet-700') +
      shine('M21 12v8', 4, 0.7),
  },
];

export const HUD: SvgAsset[] = [
  {
    id: 'hud-level-badge',
    file: 'hud/frames/level-badge.svg',
    title: 'Badge de niveau',
    usage: 'Fond du numéro de niveau (barre d’XP, cartes de personnage).',
    body:
      toon('lvl-a', poly(regular(32, 32, 29, 6, -90)), 'gold-400', 'orange-500') +
      ring(poly(regular(32, 32, 21, 6, -90)), 'gold-200', 3),
  },
  {
    id: 'hud-ribbon',
    file: 'hud/frames/ribbon.svg',
    title: 'Bannière',
    usage: 'Bannière de titre (écran de résultats, annonces).',
    viewBox: '0 0 240 64',
    body:
      flat(path('M30 18H4l12 17L4 52h34Z'), 'violet-700') +
      flat(path('M210 18h26l-12 17 12 17h-34Z'), 'violet-700') +
      toon(
        'rib-a',
        path('M24 8h192c3 0 5 2 5 5v32c0 3-2 5-5 5H24c-3 0-5-2-5-5V13c0-3 2-5 5-5Z'),
        'violet-500',
        'violet-700',
        {
          dx: 0,
          dy: -5,
        },
      ) +
      shine('M30 16h180', 3, 0.35),
  },
];

export const EFFECTS: SvgAsset[] = [
  {
    id: 'fx-hit-burst',
    file: 'effects/impacts/hit-burst.svg',
    title: 'Impact',
    usage: 'Impact d’un coup réussi (bonne réponse, coup porté au boss).',
    body:
      flat(
        poly(
          Array.from({ length: 16 }, (_, i) => {
            const r = i % 2 ? 13 : 29;
            const t = (i * Math.PI) / 8 - Math.PI / 2;
            return [
              Math.round((32 + r * Math.cos(t)) * 10) / 10,
              Math.round((32 + r * Math.sin(t)) * 10) / 10,
            ] as const;
          }),
        ),
        'orange-500',
      ) +
      fill(
        poly(
          Array.from({ length: 16 }, (_, i) => {
            const r = i % 2 ? 7 : 16;
            const t = (i * Math.PI) / 8 - Math.PI / 2;
            return [
              Math.round((32 + r * Math.cos(t)) * 10) / 10,
              Math.round((32 + r * Math.sin(t)) * 10) / 10,
            ] as const;
          }),
        ),
        'gold-200',
      ),
  },
  {
    id: 'fx-puff',
    file: 'effects/particles/puff.svg',
    title: 'Nuage',
    usage: 'Disparition, défaite d’un ennemi.',
    body:
      toon(
        'puff-a',
        path(
          'M14 50c-7 0-11-5-11-10s4-10 10-10c0-9 7-15 15-15 6 0 11 3 13 8 2-1 4-2 7-2 7 0 12 6 12 13 0 9-6 16-14 16Z',
        ),
        'violet-300',
        'violet-500',
      ) + shine('M18 26a10 10 0 0 1 8-7', 3.5, 0.7),
  },
];

/** Silhouettes neutres affichées tant que les illustrations PNG n'ont pas été fournies. */
export const PLACEHOLDERS: SvgAsset[] = [
  {
    id: 'placeholder-character',
    file: 'characters/placeholder.svg',
    title: 'Personnage à venir',
    usage: 'Emplacement provisoire d’un personnage (illustration manquante).',
    status: 'provisoire',
    body:
      flat(rect(4, 4, 56, 56, 12), 'violet-100', 0) +
      fill(circle(32, 25, 12), 'violet-300') +
      fill(path('M12 60c0-13 9-21 20-21s20 8 20 21Z'), 'violet-300') +
      `<rect x="4" y="4" width="56" height="56" rx="12" fill="none" stroke="${c('violet-300')}" stroke-width="3" stroke-dasharray="6 5"/>`,
  },
  {
    id: 'placeholder-boss',
    file: 'bosses/placeholder.svg',
    title: 'Boss à venir',
    usage: 'Emplacement provisoire d’un boss (illustration manquante).',
    status: 'provisoire',
    body:
      flat(rect(4, 4, 56, 56, 12), 'violet-100', 0) +
      fill(
        path('M14 58c-2-12 0-22 6-28-4-4-4-10 0-14 4 2 7 4 8 7h8c1-3 4-5 8-7 4 4 4 10 0 14 6 6 8 16 6 28Z'),
        'violet-300',
      ) +
      fill(path('M23 36l7 3-7 2ZM41 36l-7 3 7 2Z'), 'violet-100') +
      `<rect x="4" y="4" width="56" height="56" rx="12" fill="none" stroke="${c('violet-300')}" stroke-width="3" stroke-dasharray="6 5"/>`,
  },
];

/** Logo et emblème de la marque. */
const SHIELD = 'M60 6h80c6 0 10 4 10 10v26c0 26-20 44-50 54C70 86 50 68 50 42V16c0-6 4-10 10-10Z';

function book(x: number, y: number, s: number): string {
  const t = (d: string) => `<g transform="translate(${x} ${y}) scale(${s})">${d}</g>`;
  return t(
    flat(path('M2 6c8-5 16-5 22 0 6-5 14-5 22 0v24c-8-4-16-4-22 1-6-5-14-5-22-1Z'), 'cream-50', 3) +
      fill(path('M24 6v25'), 'ink') +
      outline(path('M24 6v25'), 3) +
      stroke('M7 12c4-2 9-2 13 0M7 18c4-2 9-2 13 0M28 12c4-2 9-2 13 0M28 18c4-2 9-2 13 0', 'violet-300', 2.5) +
      flat(path('M36 2h6v14l-3-3-3 3Z'), 'red-500', 2),
  );
}

export function brandAssets(): SvgAsset[] {
  const academy = textPath('ACADEMY', 160, 122, 50, 1.5);
  const fighters = textPath('FIGHTERS', 160, 184, 60, 1.5);
  const gradient =
    `<linearGradient id="af-logo-g" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${c('gold-400')}"/>` +
    `<stop offset="0.55" stop-color="${c('orange-500')}"/>` +
    `<stop offset="1" stop-color="${c('orange-600')}"/>` +
    `</linearGradient>`;
  /** Mot en relief : contour encre épais, liseré intérieur coloré, remplissage. */
  const word = (d: string, inner: PaletteName, fillPaint: string) =>
    `<path d="${d}" fill="none" stroke="${c('ink')}" stroke-width="16" stroke-linejoin="round" transform="translate(0 4)"/>` +
    `<path d="${d}" fill="none" stroke="${c('ink')}" stroke-width="16" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${c(inner)}" stroke-width="8" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="${fillPaint}"/>`;
  const shield = (uid: string, stroke: number) =>
    toon(uid, path(SHIELD), 'violet-500', 'violet-700', { dx: 0, dy: -8, stroke }) +
    ring(path('M64 16h72v26c0 19-14 33-36 41C78 75 64 61 64 42Z'), 'violet-300', 3);
  return [
    {
      id: 'brand-emblem',
      file: 'branding/emblem.svg',
      title: 'Academy Fighters',
      usage: 'Emblème de l’application (icône d’onglet, écran d’accueil de l’appareil).',
      body:
        `<g transform="translate(-28.5 2) scale(0.6)">${shield('emb-a', 7)}</g>` +
        book(14, 15, 0.75) +
        lettering(textPath('AF', 32, 50, 17, 0.5).d, 'gold-400', 4),
    },
    {
      id: 'brand-logo',
      file: 'branding/logo.svg',
      title: 'Academy Fighters',
      usage: 'Logo principal (écran de choix du joueur, À propos).',
      viewBox: '0 0 320 200',
      body:
        `<defs>${gradient}</defs>` +
        `<g transform="translate(30 -2) scale(1.3)">${shield('logo-a', 5)}</g>` +
        book(130, 20, 1.3) +
        word(academy.d, 'violet-700', c('white')) +
        word(fighters.d, 'violet-800', 'url(#af-logo-g)'),
    },
  ];
}
