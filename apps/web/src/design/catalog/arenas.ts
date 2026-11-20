import { a } from './kinds.ts';

/** Catalogue des images — Kit combat : arènes (livrées le 18/11/2026, une tirée au hasard à chaque combat) */

export const ARENAS = [
  [
    'espace',
    'Arène de la station spatiale',
    'plateforme d’une station spatiale de l’académie, planète et vaisseaux dans le ciel étoilé',
  ],
  ['academie', 'Arène de l’académie', 'terrasse de l’académie au milieu des collines, cascades et observatoires'],
  ['volcan', 'Arène du volcan', 'plateforme de pierre fissurée de lave, volcan en éruption et forteresse'],
] as const;

export const envAssets = ARENAS.flatMap(([id, name, look]) => [
  a('arena', `environments/arenas/${id}.webp`, name, look, 'Décor du combat de boss.', 2),
  a(
    'arenaTall',
    `environments/arenas/${id}-portrait.webp`,
    `${name} (portrait)`,
    look,
    'Décor du combat sur téléphone (cadre plus haut que large).',
    2,
    { reference: `environments-arenas-${id}` },
  ),
  a(
    'arenaWide',
    `environments/arenas/${id}-large.webp`,
    `${name} (panorama)`,
    look,
    'Décor du combat sur tablette en paysage (cadre très large).',
    2,
    { reference: `environments-arenas-${id}` },
  ),
]);

/** Variantes d'une arène et leurs proportions (largeur / hauteur), de la plus haute à la plus large. */
export const ARENA_VARIANTS = [
  { suffix: '-portrait', ratio: 960 / 1280 },
  { suffix: '', ratio: 1536 / 864 },
  { suffix: '-large', ratio: 1536 / 640 },
] as const;
