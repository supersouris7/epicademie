import { a, chunk } from './kinds.ts';

/** Catalogue des images — Questy, le robot mascotte */

export const QUESTY_LOOK =
  'Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais';

/** Une tête par humeur ; mêmes clés que src/components/mascot/moods.ts. */
export const QUESTY_MOODS = [
  ['happy', 'content', 'LED cyan, yeux en arcs souriants et grand sourire'],
  ['ok', 'ça roule', 'LED vertes, yeux ronds et petit sourire tranquille'],
  ['laugh', 'mort de rire', 'LED cyan, yeux en chevrons fermés > < et bouche grande ouverte'],
  ['love', 'amoureux', 'LED roses, yeux en cœurs et sourire'],
  ['wow', 'bluffé', 'LED cyan, yeux ronds écarquillés et bouche en O'],
  ['proud', 'champion', 'LED dorées, yeux plissés satisfaits et sourire en coin'],
  ['cool', 'trop cool', 'LED cyan, lunettes de soleil en pixels et sourire'],
  ['wink', 'clin d’œil', 'LED cyan, un œil fermé en arc, un œil rond, sourire'],
  ['angry', 'très énervé', 'LED rouges, sourcils en V très froncés et bouche en zigzag'],
  ['sad', 'triste', 'LED bleu pâle, yeux tombants et larmes en pixels'],
  ['dizzy', 'sonné', 'LED violettes, yeux en croix et bouche ondulée'],
  ['sleepy', 'endormi', 'LED bleu nuit, yeux fermés en traits et petite bulle de sommeil'],
] as const;

export type QuestyMood = (typeof QUESTY_MOODS)[number][0];

export const QUESTY_POSES = [
  ['idle', 'debout, souriant, bras le long du corps', 1],
  ['salut', 'fait coucou de la main droite levée, clin d’œil', 1],
  ['hero', 'pose de héros : poing levé, petite cape orange qui flotte, regard déterminé', 1],
  ['bravo', 'saute de joie, les deux bras levés', 1],
  ['pouce', 'pouce levé, sourire', 1],
  ['montre', 'montre quelque chose du doigt vers la droite', 1],
  ['reflexion', 'main au menton, regard en coin, petit point d’interrogation en LED au-dessus', 1],
  ['lecture', 'assis en tailleur, lit un livre violet ouvert', 1],
  ['surprise', 'recule, mains levées, yeux ronds', 1],
  ['triste', 'assis, tête basse, larmes en LED', 1],
  ['ko', 'allongé sur le ventre, yeux en croix, petite spirale au-dessus de la tête', 1],
  ['course', 'court vers la droite, une jambe en l’air, traînées de vitesse', 2],
  ['jetpack', 'vole avec un petit jetpack orange aux flammes cyan', 2],
  ['tir', 'tire vers la droite avec un blaster violet et orange, rayon cyan', 2],
  ['bouclier', 'se protège derrière un bouclier bleu', 2],
  ['dort', 'assis, endormi, bulle de sommeil', 2],
] as const;

export const QUESTY_ACCESSORIES = [
  ['visiere', 'visière-écran de rechange noire à reflet cyan'],
  ['sac', 'sac à dos violet à poches orange et écusson cyan'],
  ['bouclier', 'bouclier orange à cœur de cristal cyan'],
  ['batterie', 'batterie cyan et orange avec éclair'],
  ['livre', 'livre violet épais à reliure dorée'],
  ['blaster', 'blaster jouet violet et orange à canon cyan'],
  ['hologramme', 'socle de téléportation orange et violet avec anneau holographique cyan'],
  ['jetpack', 'jetpack orange à deux réacteurs aux flammes cyan'],
  ['tablette', 'tablette holographique cyan avec un graphique'],
] as const;

export const QUESTY_REF = 'characters-questy-model-sheet';

export const questyAssets = [
  a(
    'sheet',
    'characters/questy/model-sheet.webp',
    'Questy — fiche de modèle',
    `${QUESTY_LOOK}. Fiche de modèle montrant Questy sous 5 angles alignés : face, trois quarts gauche, profil gauche, dos, trois quarts droite ; visage LED cyan souriant sur les vues de face`,
    'Référence de cohérence (non affichée).',
    1,
  ),
  ...QUESTY_MOODS.map(([id, label, face], i) =>
    a(
      'head',
      `characters/questy/head-${id}.webp`,
      `Questy — tête « ${label} »`,
      `tête de Questy (oreillettes orange, antenne à boule orange, visière noire), visage : ${face}`,
      `Avatar de Questy, humeur « ${label} ».`,
      1,
      { reference: QUESTY_REF, sheet: chunk('questy-tetes', i, 6, QUESTY_MOODS.length) },
    ),
  ),
  ...QUESTY_POSES.map(([id, pose, priority]) =>
    a(
      'mascot',
      `characters/questy/pose-${id}.webp`,
      `Questy — pose ${id}`,
      `${QUESTY_LOOK}. Pose : ${pose}.`,
      'Questy dans les menus, les bulles d’aide et les résultats.',
      priority,
      { reference: QUESTY_REF },
    ),
  ),
  ...QUESTY_ACCESSORIES.map(([id, prompt]) =>
    a(
      'icon',
      `characters/questy/accessories/${id}.webp`,
      `Accessoire ${id}`,
      `${prompt}.`,
      'Accessoires de Questy (récompenses à venir).',
      3,
      { sheet: 'questy-accessoires' },
    ),
  ),
];

/** Illustration principale (après Questy et les héros, qu'elle met en scène). */
export const keyArt = a(
  'keyart',
  'branding/key-art.webp',
  'Illustration principale',
  'scène de combat épique et joyeuse : les cinq héros alignés de gauche à droite (Alex avec son canon à plasma, Lina avec son lance-ballons, Pixel le chat avec son canon-poisson au premier plan, Ayla avec sa bombe-blaster, Tao avec son arbalète) et Questy qui lève le poing au milieu, tous face au Golem des Équations tout à droite ; en arrière-plan un château-académie violet flottant aux bannières à livre, ciel lavande, îles flottantes',
  'Bandeau de l’écran d’accueil et du choix du joueur.',
  2,
  { reference: QUESTY_REF },
);
