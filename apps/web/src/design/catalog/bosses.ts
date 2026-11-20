import { a } from './kinds.ts';

/**
 * Catalogue des images — boss et mobs. Refonte du 20/11/2026 : un seul boss, le Sorcier π
 * (planches fournies par l'utilisateur, découpées par `assets:sprites`) ; les mobs sont gardés.
 */

export const SORCIER_LOOK =
  'sorcier en armure dorée, capuche violette marquée π, visage d’ombre aux yeux lumineux, cube violet aux signes + − × ÷ sur la poitrine, cape violette et or';

/** Poses fixes du Sorcier π (planche de 8 poses, dans l'ordre de lecture). */
export const SORCIER_POSES = ['idle', 'attack', 'shield', 'hurt', 'defeat', 'cast', 'charge', 'victory'] as const;
export type SorcierPose = (typeof SORCIER_POSES)[number];

/** Têtes du Sorcier π (planche de 12) : six calmes (yeux bleus), six en rage (yeux rouges). */
export const BOSS_HEADS = [
  ['menace', 'yeux bleus plissés'],
  ['concentre', 'yeux bleus grands ouverts'],
  ['surprise', 'yeux bleus ronds'],
  ['moqueur', 'yeux bleus mi-clos'],
  ['perplexe', 'yeux bleus ronds, regard fixe'],
  ['colere', 'yeux bleus en colère'],
  ['inquiet', 'yeux rouges ronds'],
  ['rage-menace', 'yeux rouges plissés'],
  ['rage-surprise', 'yeux rouges ronds, lueur'],
  ['furieux', 'yeux rouges furieux'],
  ['rage-cri', 'yeux rouges grands ouverts'],
  ['rage-plisse', 'yeux rouges mi-clos'],
] as const;
export type BossHead = (typeof BOSS_HEADS)[number][0];

/** Expressions utilisées par le combat et les dialogues. */
export const BOSS_EXPRESSIONS = [
  'menace',
  'moqueur',
  'colere',
  'surprise',
  'perplexe',
  'rire',
  'clin-oeil',
  'amour',
  'triste',
  'inquiet',
  'furieux',
  'concentre',
  'ko',
] as const;
export type BossExpression = (typeof BOSS_EXPRESSIONS)[number];

/** Tête du Sorcier π affichée pour chaque expression (la plus proche parmi les 12 livrées). */
export const BOSS_FACE: Record<BossExpression, BossHead> = {
  menace: 'menace',
  moqueur: 'moqueur',
  colere: 'colere',
  surprise: 'surprise',
  perplexe: 'perplexe',
  rire: 'moqueur',
  'clin-oeil': 'moqueur',
  amour: 'concentre',
  triste: 'perplexe',
  inquiet: 'inquiet',
  furieux: 'furieux',
  concentre: 'concentre',
  ko: 'rage-surprise',
};

const SORCIER = 'bosses/sorcier-pi';
export const sorcierAssets = [
  a(
    'boss',
    `${SORCIER}/anim-idle.webp`,
    'Sorcier π — animation sur place',
    `${SORCIER_LOOK}, 8 images du calme à la rage`,
    'Combat : bande de 8 images (4 calmes, 4 en rage).',
    1,
  ),
  ...SORCIER_POSES.map((pose) =>
    a(
      'boss',
      `${SORCIER}/pose-${pose}.webp`,
      `Sorcier π — pose ${pose}`,
      `${SORCIER_LOOK}, pose ${pose}`,
      'Combat : pose fixe.',
      1,
    ),
  ),
  ...BOSS_HEADS.map(([id, look]) =>
    a(
      'expression',
      `${SORCIER}/head-${id}.webp`,
      `Sorcier π — ${id}`,
      `${SORCIER_LOOK}, tête seule, ${look}`,
      'Portrait du HUD de combat.',
      1,
    ),
  ),
  a('portrait', `${SORCIER}/portrait.webp`, 'Sorcier π — portrait', SORCIER_LOOK, 'Liste des boss, résultats.', 1),
];

/** Mob des maths (planche livrée le 18/11/2026) : le cube-robot π, tourné vers le héros. */
export const PI_BOT_POSES = ['idle', 'attack', 'shield', 'run', 'jump', 'victory'] as const;
export const PI_BOT_HEADS = [
  'menace',
  'moqueur',
  'joie',
  'rire',
  'surprise',
  'triste',
  'etourdi',
  'colere',
  'reflexion',
  'idee',
  'amour',
  'dort',
] as const;
export type PiBotHead = (typeof PI_BOT_HEADS)[number];
export const PI_BOT_LOOK =
  'cube-robot violet et doré à visage noir aux yeux cyan lumineux, π doré sur le côté, × sur le dessus, ÷ sur la poitrine, gros poings';
export const piBotAssets = [
  ...PI_BOT_POSES.map((state) =>
    a(
      'boss',
      `bosses/minions/pi-bot${state === 'idle' ? '' : `-${state}`}.webp`,
      `Mob π-bot — ${state}`,
      `${PI_BOT_LOOK}, pose ${state}`,
      'Mob des maths en combat.',
      1,
      { fallback: 'placeholder-boss' },
    ),
  ),
  ...PI_BOT_HEADS.map((e) =>
    a(
      'portrait',
      `bosses/minions/pi-bot-head-${e}.webp`,
      `Mob π-bot — tête ${e}`,
      `${PI_BOT_LOOK}, ${e}`,
      'Bandeau du combat.',
      2,
    ),
  ),
];

export const MINIONS = [
  [
    'calculatrice',
    'calculatrice grise vivante sur deux petites pattes, écran aux yeux bleus (sans chiffres), touches colorées',
  ],
  ['cube-bot', 'petit robot cube blanc à écran-visage bleu, deux petits bras'],
  ['equerre', 'équerre jaune vivante, yeux rouges, petites jambes'],
  ['compas', 'compas argenté vivant qui marche sur ses deux pointes, yeux violets'],
  ['de', 'petit dé blanc vivant aux points violets, yeux et sourire moqueur, petits bras'],
  ['camembert', 'diagramme circulaire vivant (disque coupé en parts rouge, jaune, bleu), yeux méchants'],
  ['courbe', 'petite courbe néon cyan vivante qui ondule comme un ver, yeux jaunes'],
  ['bug', 'insecte en pixels verts (bug informatique), six pattes, antennes'],
  ['bloc-code', 'bloc de programmation orange arrondi et vivant (comme une brique de code), yeux blancs'],
] as const;

export const minionAssets = MINIONS.map(([id, look]) =>
  a(
    'minion',
    `bosses/minions/${id}.webp`,
    `Mob ${id}`,
    `${look}. Mignon mais espiègle`,
    'Mobs envoyés par le boss.',
    1,
    {
      fallback: 'placeholder-boss',
      sheet: 'mobs',
    },
  ),
);
