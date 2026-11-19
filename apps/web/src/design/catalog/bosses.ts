import { a } from './kinds.ts';

/** Catalogue des images — Kit combat : boss (un par domaine des maths) et mobs */

export const BOSSES = [
  [
    'golem-des-equations',
    'Golem des Équations',
    'nombres et calculs',
    'golem de pierre grise en armure, grande capuche et cape violettes bordées d’or, π doré sur le front, visage noir aux yeux cyan lumineux, cristaux bleus aux épaules, cube violet lumineux aux signes + − × ÷ sur la poitrine',
  ],
  [
    'geomatrix',
    'Géomatrix',
    'géométrie',
    'golem fait de cubes et de pyramides de cristal bleu et violet, arêtes cyan lumineuses, petits cubes flottant autour de lui, yeux orange',
  ],
  [
    'probabot',
    'Probabot',
    'données et probabilités',
    'robot trapu dont le corps est un énorme dé blanc aux points violets, une face-écran avec des yeux rouges en colère, bras mécaniques dorés qui jonglent avec deux petits dés, roues chenilles',
  ],
  [
    'courbix',
    'Courbix',
    'proportionnalité et fonctions',
    'serpent mécanique géant dont le long corps segmenté ondule comme une courbe de graphique, segments violets reliés par des articulations cyan lumineuses, tête-écran aux yeux jaunes, crête en antennes',
  ],
  [
    'ia-des-connaissances',
    'IA des Connaissances',
    'programmation',
    'gros robot cubique bleu nuit flottant, écran-visage aux yeux cyan en colère, câbles comme des tentacules, cubes de données violets en orbite',
  ],
] as const;

export const BOSS_STATES = [
  ['idle', 'Pose de combat menaçante mais comique'],
  ['attack', 'Attaque : se penche vers la gauche et lance une grosse onde d’énergie rouge'],
  ['hurt', 'Touché : recule, grimace comique, petites étincelles'],
  ['ko', 'Vaincu : affalé, étourdi, petites spirales au-dessus de la tête'],
] as const;

export const bossAssets = BOSSES.flatMap(([id, name, domain, look]) => [
  ...BOSS_STATES.map(([state, pose]) =>
    a(
      'boss',
      `bosses/maths/${id}${state === 'idle' ? '' : `-${state}`}.webp`,
      `${name} — ${state}`,
      `${name}, boss du domaine « ${domain} » : ${look}. ${pose}`,
      'Combat de boss.',
      1,
      { fallback: 'placeholder-boss', sheet: `${id}-etats` },
    ),
  ),
  a(
    'portrait',
    `bosses/maths/${id}-portrait.webp`,
    `${name} — portrait`,
    `${name} (exactement comme sur sa planche d’états) : ${look}. Tête seule, de face, l’air menaçant mais drôle`,
    'Portrait rond de la barre de vie du boss.',
    2,
    { reference: `bosses-maths-${id}`, fallback: 'placeholder-boss' },
  ),
]);

/** Boss des maths (kit livré le 18/11/2026) : poses en plus, 13 expressions et illustration du menu. */
export const BOSS_EXPRESSIONS = [
  ['menace', 'yeux plissés menaçants'],
  ['moqueur', 'yeux fermés en arc, sourire moqueur'],
  ['colere', 'yeux rouges, veine de colère'],
  ['surprise', 'grands yeux ronds, traits de surprise'],
  ['perplexe', 'regard en coin, point d’interrogation'],
  ['rire', 'éclat de rire, yeux fermés'],
  ['clin-oeil', 'clin d’œil, étoile scintillante'],
  ['amour', 'yeux en cœur, petits cœurs'],
  ['triste', 'yeux tombants, larme'],
  ['inquiet', 'yeux ronds, goutte de sueur'],
  ['furieux', 'yeux blancs, éclairs'],
  ['concentre', 'yeux mi-clos, anneaux d’énergie'],
  ['ko', 'yeux en croix, étoiles qui tournent'],
] as const;
export type BossExpression = (typeof BOSS_EXPRESSIONS)[number][0];

export const GOLEM_LOOK = BOSSES[0][3];
export const golemExtras = [
  ...(
    [
      ['shield', 'Bouclier : bulle d’énergie violette hexagonale autour de lui'],
      ['summon', 'Invocation : bras levés, cube d’opérations au-dessus de la tête, débris en lévitation'],
    ] as const
  ).map(([state, pose]) =>
    a(
      'boss',
      `bosses/maths/golem-des-equations-${state}.webp`,
      `Golem des Équations — ${state}`,
      `Golem des Équations : ${GOLEM_LOOK}. ${pose}`,
      state === 'summon' ? 'Arrivée du boss en combat.' : 'Bilan d’une défaite : le boss se protège.',
      2,
      { reference: 'bosses-maths-golem-des-equations', fallback: 'placeholder-boss' },
    ),
  ),
  ...BOSS_EXPRESSIONS.map(([id, look]) =>
    a(
      'portrait',
      `bosses/maths/golem-des-equations-head-${id}.webp`,
      `Golem des Équations — tête ${id}`,
      `Tête du Golem des Équations (${GOLEM_LOOK}) : ${look}`,
      'Tête du boss qui réagit (barre de vie, gros plan, face-à-face, bilan).',
      2,
      { reference: 'bosses-maths-golem-des-equations' },
    ),
  ),
  // Mode rage (dernière vie) : deux grandes images de la transformation, et son apparence en combat.
  a(
    'bossArt',
    'bosses/maths/golem-des-equations-rage-debut.webp',
    'Golem des Équations — début de rage',
    `Golem des Équations qui s’énerve : aura rouge naissante, yeux rouges, bras écartés : ${GOLEM_LOOK}`,
    'Scène de rage quand il ne reste qu’une vie au boss (1re image).',
    2,
    { reference: 'bosses-maths-golem-des-equations' },
  ),
  a(
    'bossArt',
    'bosses/maths/golem-des-equations-rage.webp',
    'Golem des Équations — rage',
    `Golem des Équations en rage : éclairs rouges partout, gueule hérissée de crocs, bras écartés : ${GOLEM_LOOK}`,
    'Scène de rage quand il ne reste qu’une vie au boss (2e image).',
    2,
    { reference: 'bosses-maths-golem-des-equations' },
  ),
  a(
    'boss',
    'bosses/maths/golem-des-equations-rage-combat.webp',
    'Golem des Équations — en rage (combat)',
    `Golem des Équations en rage dans l’arène, poings serrés, aura de flammes rouges : ${GOLEM_LOOK}`,
    'Apparence du boss dans l’arène en mode rage (attente, attaque, touché).',
    2,
    { reference: 'bosses-maths-golem-des-equations', fallback: 'placeholder-boss' },
  ),
  a(
    'bossArt',
    'bosses/maths/golem-des-equations-art.webp',
    'Golem des Équations — illustration',
    `Golem des Équations en pied, de face, mains ouvertes, cube d’opérations brillant devant lui, signes + − × ÷ en lévitation dans un anneau violet : ${GOLEM_LOOK}`,
    'Écran rouge « Choisir mon chapitre » : le boss en grand qui provoque (sans son nom).',
    1,
    { reference: 'bosses-maths-golem-des-equations' },
  ),
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

/** L'Empereur du Savoir : le grand boss, maître des gardiens des reliques. */
export const empereurAssets = [
  a(
    'bossSquare',
    'bosses/empereur/empereur.webp',
    'L’Empereur du Savoir',
    'grand boss en armure violette et dorée, couronne à pointes, crinière blanche, cœur de galaxie, cape violette',
    'Scène du grand boss (1er temps, sans reliques).',
    2,
  ),
  a(
    'bossSquare',
    'bosses/empereur/empereur-reliques.webp',
    'L’Empereur du Savoir et les reliques',
    'le même grand boss entouré des six reliques des matières dans un anneau violet',
    'Scène du grand boss (2e temps, avec les reliques).',
    2,
  ),
  a(
    'banner',
    'bosses/empereur/banniere.webp',
    'Bannière du Combat de boss',
    'l’Empereur du Savoir en buste, mains lumineuses, ciel violet étoilé et cristaux flottants',
    'Bannière de l’écran Combat de boss.',
    2,
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
