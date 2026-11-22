import { a } from './kinds.ts';

/**
 * Catalogue des images — Arènes du combat (images du client, 22/11/2026). Une arène est tirée au hasard
 * à chaque combat ; chacune existe en 4 cadrages tirés de la même image (`assets:arenas`).
 */

export const ARENAS = [
  ['jungle', 'Arène de la jungle', 'temple en ruine, cascades, pont de corde et portail de cristal violet'],
  ['espace', 'Arène de la station spatiale', 'pont d’une station spatiale, planète et vaisseaux dans le ciel étoilé'],
  ['volcan', 'Arène du volcan', 'plateforme de pierre fissurée de lave, volcan en éruption'],
  ['glace', 'Arène des glaces', 'lac gelé cerné de cristaux, ruines de glace sous les aurores boréales'],
  ['academie', 'Arène de l’académie', 'parvis de l’académie, bâtiments, banderoles et collines'],
] as const;

/** Variantes d'une arène : proportions (largeur / hauteur), de la plus haute à la plus large. */
export const ARENA_VARIANTS = [
  { suffix: '-portrait', kind: 'arenaTall', ratio: 1080 / 1200 },
  { suffix: '', kind: 'arena', ratio: 1600 / 900 },
  { suffix: '-large', kind: 'arenaWide', ratio: 1920 / 738 },
  { suffix: '-pano', kind: 'arenaPano', ratio: 2640 / 600 },
] as const;

const USE: Record<string, string> = {
  arenaTall: 'smartphone et fenêtres étroites',
  arena: 'tablette et ordinateur',
  arenaWide: 'ordinateur, TV (cadre large)',
  arenaPano: 'écrans très larges',
};

export const envAssets = ARENAS.flatMap(([id, name, look]) =>
  ARENA_VARIANTS.map((v) =>
    a(
      v.kind,
      `environments/arenas/${id}${v.suffix}.webp`,
      `${name}${v.suffix}`,
      look,
      `Décor du combat : ${USE[v.kind]}.`,
      2,
    ),
  ),
);
