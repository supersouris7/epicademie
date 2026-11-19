import { a } from './kinds.ts';

/** Catalogue des images — Kit d'interface (cadres, boutons, tuiles) */

export const BUTTONS = [
  ['orange', 'orange vif à reflet jaune en haut', 'Action principale (« Jouer »).'],
  ['violet', 'violet à reflet violet clair', 'Actions secondaires (« Collection », « Paramètres »).'],
  ['cyan', 'cyan à reflet bleu clair', 'Progression, information.'],
  ['vert', 'vert à reflet vert clair', 'Valider, bonne réponse.'],
  ['rouge', 'rouge à reflet rose', 'Quitter, supprimer.'],
  ['verrouille', 'gris violacé terne', 'Bouton verrouillé ou désactivé.'],
] as const;

export const TILES = [
  ['violet', 'violet'],
  ['cyan', 'cyan'],
  ['orange', 'orange'],
  ['vert', 'vert'],
  ['rouge', 'rouge'],
  ['bleu', 'bleu roi'],
  ['rose', 'rose'],
  ['verrouille', 'gris violacé terne'],
  ['compteur', 'violet très foncé, en forme de capsule allongée horizontale (fond des compteurs de ressources)'],
] as const;

export const uiAssets = [
  a(
    'frame',
    'hud/frames/panel.webp',
    'Panneau',
    'panneau rectangulaire au fond crème clair, épaisse bordure violette, coins renforcés orange, petit liseré intérieur violet clair',
    'Fond des panneaux de menu (GamePanel).',
    1,
  ),
  a(
    'frame',
    'hud/frames/panel-tab.webp',
    'Panneau à onglet',
    'panneau rectangulaire au fond crème clair, bordure violette, avec en haut à gauche un onglet de titre violet foncé vide qui dépasse du cadre',
    'Panneaux titrés (« Héros », « Boss », « Objets »).',
    1,
  ),
  a(
    'frame',
    'hud/frames/bubble.webp',
    'Bulle de dialogue',
    'bulle de dialogue rectangulaire au fond crème clair, bordure violette, coins orange, pointe triangulaire en bas à gauche',
    'Paroles de Questy.',
    1,
  ),
  a(
    'frame',
    'hud/frames/hud-frame.webp',
    'Cadre HUD',
    'cadre tech rectangulaire violet aux coins coupés orange et petits voyants cyan au milieu du haut et du bas, intérieur entièrement vide (transparent)',
    'Cadre de la zone de question et des écrans de jeu.',
    2,
  ),
  a(
    'frame',
    'hud/frames/ribbon.webp',
    'Bannière',
    'bannière de titre horizontale violette vide à extrémités repliées en queue d’aronde violet foncé',
    'Titre de l’écran de résultats.',
    2,
    { fallback: 'hud-ribbon' },
  ),
  a(
    'ring',
    'hud/frames/avatar-ring.webp',
    'Anneau d’avatar',
    'anneau épais violet à quatre encoches orange (haut, bas, gauche, droite) et liseré violet clair',
    'Cadre rond des avatars et du portrait du boss.',
    1,
  ),
  a(
    'card',
    'hud/frames/hero-card.webp',
    'Cadre de carte de héros',
    'cadre de carte de collection à coins arrondis, bordure violette épaisse à coins dorés, bandeau violet foncé vide en bas',
    'Cartes de personnage.',
    2,
  ),
  a(
    'card',
    'hud/frames/boss-card.webp',
    'Cadre de carte de boss',
    'cadre de carte de collection à coins arrondis, bordure rouge foncé et violette à pointes métalliques, bandeau vide en bas',
    'Cartes de boss.',
    2,
  ),
  ...BUTTONS.map(([id, color, usage]) =>
    a(
      'button',
      `hud/buttons/${id}.webp`,
      `Bouton ${id}`,
      `bouton capsule ${color}, épais contour violet très foncé, bas plus sombre donnant du relief, reflet net en haut`,
      usage,
      1,
      { sheet: 'boutons' },
    ),
  ),
  ...TILES.map(([id, color]) =>
    a(
      'tile',
      `hud/tiles/${id}.webp`,
      `Tuile ${id}`,
      `tuile ${color} en relief, épais contour violet très foncé, bas plus sombre, reflet en haut`,
      'Fond des boutons-icônes, des tuiles de matière et des compteurs.',
      1,
      { sheet: 'tuiles' },
    ),
  ),
];
