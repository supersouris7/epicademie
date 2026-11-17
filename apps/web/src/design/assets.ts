/**
 * Catalogue central des assets graphiques d'Academy Fighters.
 *
 * Source unique pour :
 * - l'arborescence (public/assets et assets-src/originals) ;
 * - le guide de génération ChatGPT (docs/ASSETS-CHATGPT.md, généré par scripts/assets/plan.ts) ;
 * - l'affichage (`assetSrc(id)` : image finale si livrée, sinon SVG provisoire).
 *
 * Règle : aucune image ne contient de texte (sauf le logo et le badge XP). Les libellés sont écrits
 * par l'application, pour rester lisibles et modifiables.
 *
 * Statuts : `disponible` (image finale présente), `provisoire` (SVG de remplacement), `manquant`.
 */
import { AVAILABLE } from './assets.available.ts';
import { SVG_ASSETS } from './assets.generated.ts';

export type AssetStatus = 'disponible' | 'provisoire' | 'manquant';
/** 1 = interface actuelle, 2 = prochains modes (boss, personnages), 3 = plus tard. */
export type Priority = 1 | 2 | 3;

/** Formats de génération acceptés par les modèles GPT Image. */
export type GenSize = '1024x1024' | '1536x1024' | '1024x1536';

export interface AssetKind {
  readonly gen: GenSize;
  /** Dimensions finales en pixels (WebP), après détourage et redimensionnement. */
  readonly final: readonly [number, number];
  /** Consignes de cadrage communes à ce type d'asset. */
  readonly framing: string;
  /** Fond opaque (illustration plein cadre) au lieu d'un fond transparent. */
  readonly opaque?: boolean;
  /** Découpe en 9 parts (cadres et boutons étirables). */
  readonly nineSlice?: boolean;
  /** Grille utilisée quand plusieurs assets de ce type sont générés sur une même planche. */
  readonly grid?: { readonly gen: GenSize; readonly cols: number; readonly rows: number };
}

const NINE_SLICE =
  'forme vue parfaitement de face, sans perspective ; les 4 coins sont identiques par symétrie ; entre les coins, les bords sont droits et réguliers (aucun ornement au milieu des bords) ; le centre est une couleur unie sans motif, pour pouvoir étirer l’élément';

export const KINDS = {
  icon: {
    gen: '1024x1024',
    final: [256, 256],
    framing: 'objet seul, centré, vu de face, marge de 10 % autour',
    grid: { gen: '1024x1024', cols: 3, rows: 3 },
  },
  glyph: {
    gen: '1024x1024',
    final: [256, 256],
    framing:
      'pictogramme blanc plein à contour violet très foncé épais, centré, vu de face, sans fond ni tuile, marge de 15 % autour',
    grid: { gen: '1024x1024', cols: 3, rows: 3 },
  },
  logo: {
    gen: '1536x1024',
    final: [1200, 800],
    framing: 'logo centré, marge de 8 %, lettrage parfaitement lisible et orthographié exactement',
  },
  keyart: {
    gen: '1536x1024',
    final: [1536, 1024],
    framing: 'illustration plein cadre, composition lisible en petit, sans aucun texte ni interface',
    opaque: true,
  },
  background: {
    gen: '1536x1024',
    final: [1536, 1024],
    framing:
      'décor plein cadre sans personnage ni texte, détails concentrés en haut et sur les côtés, zone centrale calme et un peu floue pour poser des menus par-dessus',
    opaque: true,
  },
  frame: {
    gen: '1536x1024',
    final: [768, 512],
    framing: `cadre d’interface vide, ${NINE_SLICE}`,
    nineSlice: true,
  },
  button: {
    gen: '1536x1024',
    final: [768, 256],
    framing: `bouton capsule vide (sans texte ni icône), très large et peu haut (rapport 3:1), ${NINE_SLICE}`,
    nineSlice: true,
    grid: { gen: '1536x1024', cols: 2, rows: 3 },
  },
  tile: {
    gen: '1024x1024',
    final: [256, 256],
    framing: 'tuile carrée aux coins arrondis, vide (sans icône), vue de face, marge de 8 %',
    grid: { gen: '1024x1024', cols: 3, rows: 3 },
  },
  ring: {
    gen: '1024x1024',
    final: [384, 384],
    framing: 'anneau de cadre rond vu de face, centre entièrement vide (transparent), marge de 6 %',
  },
  card: {
    gen: '1024x1536',
    final: [384, 576],
    framing: 'cadre de carte de collection vu de face, intérieur vide (transparent), bandeau vide en bas pour le nom',
  },
  mascot: {
    gen: '1024x1024',
    final: [512, 512],
    framing: 'Questy en pied, centré, base des pieds à 92 % de la hauteur, occupe 80 % de la hauteur',
  },
  head: {
    gen: '1024x1024',
    final: [384, 384],
    framing:
      'tête seule de face (sans le corps), centrée, occupe 80 % de sa case, même angle et même taille d’une tête à l’autre',
    grid: { gen: '1536x1024', cols: 3, rows: 2 },
  },
  sheet: {
    gen: '1536x1024',
    final: [1536, 1024],
    framing:
      'fiche de modèle (référence pour les autres images, non affichée dans le jeu) : mêmes proportions sur toutes les vues, alignées sur une même ligne de sol',
  },
  portrait: {
    gen: '1024x1024',
    final: [512, 512],
    framing:
      'tête et haut des épaules, trois quarts face, visage centré dans un cercle imaginaire de 80 % de la largeur (recadrage rond)',
  },
  expression: {
    gen: '1024x1024',
    final: [384, 384],
    framing: 'même cadrage exact que le portrait de référence, seule l’expression change',
  },
  pose: {
    gen: '1536x1024',
    final: [512, 512],
    framing:
      'personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur de sa case, tête vers 8 %, même échelle et même ligne de sol dans toutes les cases',
    grid: { gen: '1536x1024', cols: 3, rows: 2 },
  },
  boss: {
    gen: '1536x1024',
    final: [512, 512],
    framing:
      'boss en pied, trois quarts face tourné vers la gauche (il fait face au héros), base à 92 % de la hauteur de sa case, occupe 85 % de la case, même échelle dans toutes les cases',
    grid: { gen: '1536x1024', cols: 2, rows: 2 },
  },
  minion: {
    gen: '1024x1024',
    final: [384, 384],
    framing: 'petit ennemi en pied, tourné vers la gauche, base à 90 % de sa case, occupe 70 % de la case',
    grid: { gen: '1024x1024', cols: 3, rows: 3 },
  },
  weapon: {
    gen: '1536x1024',
    final: [384, 256],
    framing:
      'arme seule vue de profil, canon pointé vers la droite, poignée en bas à gauche, occupe 85 % de la largeur de sa case',
    grid: { gen: '1536x1024', cols: 3, rows: 2 },
  },
  projectile: {
    gen: '1024x1024',
    final: [256, 256],
    framing: 'projectile en mouvement vers la droite avec courte traînée à gauche, centré',
    grid: { gen: '1024x1024', cols: 3, rows: 3 },
  },
  effect: {
    gen: '1024x1024',
    final: [512, 512],
    framing: 'effet centré, bords nets (pas de grand halo flou)',
    grid: { gen: '1024x1024', cols: 3, rows: 3 },
  },
  arena: {
    gen: '1536x1024',
    final: [1536, 1024],
    framing:
      'décor de combat plein cadre vu de face, à hauteur de personnage, sol plat et dégagé sur le quart inférieur (les combattants seront posés à gauche et à droite), centre calme et lisible, aucun personnage',
    opaque: true,
  },
  floor: {
    gen: '1024x1024',
    final: [256, 256],
    framing: 'tuile carrée vue de dessus, remplit tout le cadre, motif raccordable sur les 4 bords',
    opaque: true,
  },
  platform: {
    gen: '1536x1024',
    final: [512, 256],
    framing: 'plateforme flottante vue de face légèrement plongée, centrée, occupe 85 % de la largeur',
  },
  prop: {
    gen: '1024x1024',
    final: [384, 384],
    framing: 'objet de décor posé au sol, trois quarts face, base à 90 % de sa case',
    grid: { gen: '1024x1024', cols: 3, rows: 3 },
  },
} as const satisfies Record<string, AssetKind>;

export type KindId = keyof typeof KINDS;

export interface PlannedAsset {
  readonly id: string;
  readonly kind: KindId;
  /** Chemin final servi (WebP), relatif à public/assets. */
  readonly file: string;
  readonly name: string;
  /** Description visuelle précise pour le générateur d'images. */
  readonly prompt: string;
  readonly usage: string;
  readonly priority: Priority;
  /** SVG provisoire affiché en attendant. */
  readonly fallback?: keyof typeof SVG_ASSETS;
  /** Asset à joindre comme référence (identifiant). */
  readonly reference?: string;
  /** Planche de génération groupée (découpée à l'import selon la grille du type). */
  readonly sheet?: string;
}

type Extra = Partial<Pick<PlannedAsset, 'fallback' | 'reference' | 'sheet'>>;

const a = (
  kind: KindId,
  file: string,
  name: string,
  prompt: string,
  usage: string,
  priority: Priority,
  extra: Extra = {},
): PlannedAsset => ({
  id: file.replace(/\.webp$/, '').replace(/\//g, '-'),
  kind,
  file,
  name,
  prompt,
  usage,
  priority,
  ...extra,
});

/** Découpe une liste en planches nommées `nom-1`, `nom-2`… de `size` éléments. */
const chunk = (name: string, index: number, size: number, total: number) =>
  total > size ? `${name}-${Math.floor(index / size) + 1}` : name;

// ─── Marque et illustrations plein cadre ──────────────────────────────────

const brandAssets = [
  a(
    'logo',
    'branding/logo.webp',
    'Logo Academy Fighters',
    'logo de jeu vidéo : grand blason-bouclier violet à bordure orange et liseré cyan, livre ouvert doré posé sur le haut du blason ; lettrage « ACADEMY » en blanc à contour violet foncé sur la première ligne, « FIGHTERS » plus grand en dégradé jaune-orange à contour violet foncé sur la seconde, lettres très épaisses légèrement inclinées, effet de relief',
    'Écran de choix du joueur, À propos.',
    1,
    { fallback: 'brand-logo' },
  ),
  a(
    'icon',
    'branding/emblem.webp',
    'Emblème',
    'blason-bouclier violet à bordure orange épaisse portant un livre ouvert blanc et un chevron cyan en bas, sans texte, lisible à 32 px',
    'Icône de l’application et de l’onglet.',
    1,
    { fallback: 'brand-emblem' },
  ),
  a(
    'background',
    'environments/backgrounds/accueil.webp',
    'Fond d’accueil',
    'château-académie violet aux toits pointus et bannières portant un livre, sur une île flottante, autres petites îles flottantes, ciel lavande et nuages roses, lumière douce',
    'Fond des menus (accueil, choix du mode).',
    1,
  ),
  a(
    'background',
    'environments/backgrounds/combat.webp',
    'Fond de combat',
    'plaine rocheuse violette au pied du château-académie, cristaux violets, rochers moussus, ciel lavande crépusculaire',
    'Fond des combats de boss.',
    2,
  ),
];

// ─── Kit d'interface (cadres, boutons, tuiles) ─────────────────────────────

const BUTTONS = [
  ['orange', 'orange vif à reflet jaune en haut', 'Action principale (« Jouer »).'],
  ['violet', 'violet à reflet violet clair', 'Actions secondaires (« Collection », « Paramètres »).'],
  ['cyan', 'cyan à reflet bleu clair', 'Progression, information.'],
  ['vert', 'vert à reflet vert clair', 'Valider, bonne réponse.'],
  ['rouge', 'rouge à reflet rose', 'Quitter, supprimer.'],
  ['verrouille', 'gris violacé terne', 'Bouton verrouillé ou désactivé.'],
] as const;

const TILES = [
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

const uiAssets = [
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

// ─── Icônes ────────────────────────────────────────────────────────────────

type IconRow = readonly [file: string, prompt: string, priority: Priority, fallback?: keyof typeof SVG_ASSETS];

/** Pictogrammes blancs, posés par l'application sur une tuile ou un bouton. */
const GLYPHS: readonly IconRow[] = [
  ['icons/navigation/home', 'maison', 1, 'nav-home'],
  ['icons/navigation/back', 'flèche épaisse vers la gauche', 1, 'nav-back'],
  ['icons/navigation/next', 'flèche épaisse vers la droite', 1, 'nav-next'],
  ['icons/navigation/play', 'triangle « lecture » arrondi', 1, 'nav-play'],
  ['icons/navigation/settings', 'engrenage', 1, 'nav-settings'],
  ['icons/navigation/close', 'croix épaisse', 1, 'nav-close'],
  ['icons/navigation/check', 'coche épaisse', 1, 'nav-check'],
  ['icons/navigation/retry', 'flèche circulaire « recommencer »', 1, 'nav-retry'],
  ['icons/navigation/plus', 'signe plus épais', 1, 'nav-plus'],
  ['icons/navigation/menu', 'liste : trois puces et trois barres', 1, 'nav-menu'],
  ['icons/navigation/info', 'lettre i minuscule', 1, 'nav-info'],
  ['icons/navigation/fullscreen', 'quatre coins pointant vers l’extérieur (plein écran)', 1, 'nav-fullscreen'],
  [
    'icons/navigation/fullscreen-exit',
    'quatre coins pointant vers l’intérieur (quitter le plein écran)',
    1,
    'nav-fullscreen-exit',
  ],
  ['icons/navigation/team', 'trois silhouettes de joueurs (multijoueur)', 1, 'nav-team'],
  ['icons/navigation/target', 'viseur rond (défis)', 1],
  ['icons/navigation/sound-on', 'haut-parleur avec ondes', 1],
  ['icons/navigation/sound-off', 'haut-parleur barré', 1],
  ['icons/navigation/edit', 'crayon (modifier)', 1],
  ['icons/navigation/swap', 'deux flèches circulaires opposées (changer de joueur)', 1],
  ['icons/navigation/hint', 'point d’interrogation (je n’ai pas compris)', 1, 'nav-hint'],
  ['icons/navigation/lesson', 'livre ouvert (leçon)', 1, 'nav-lesson'],
  ['icons/navigation/calendar', 'calendrier (défi du jour)', 2],
  ['icons/navigation/history', 'horloge avec flèche circulaire (historique)', 2],
  ['icons/navigation/inventory', 'sac à dos (inventaire)', 3],
  ['icons/navigation/collection', 'deux cartes superposées avec une silhouette (collection)', 3],
  ['icons/navigation/mail', 'enveloppe (messages)', 3],
  ['icons/navigation/ranking', 'couronne (classement)', 3],
];

/** Icônes en couleur, utilisables seules. */
const ICONS: readonly (readonly [sheet: string, rows: readonly IconRow[]])[] = [
  [
    'ressources',
    [
      ['icons/resources/coin', 'pièce d’or épaisse avec un petit livre ouvert gravé au centre', 1, 'resource-coin'],
      ['icons/resources/gem', 'gemme violette hexagonale à facettes', 1, 'resource-gem'],
      ['icons/resources/energy', 'éclair jaune et orange', 1, 'resource-energy'],
      ['icons/resources/life', 'cœur rose-rouge brillant', 1, 'resource-life'],
      ['icons/resources/life-empty', 'cœur gris éteint (même forme que le cœur rouge)', 1, 'resource-life-empty'],
      [
        'icons/resources/xp',
        'badge hexagonal cyan à contour violet portant les lettres « XP » blanches (seule exception à la règle sans texte)',
        1,
        'resource-xp',
      ],
      ['icons/resources/streak', 'flamme orange et jaune (série)', 1, 'status-streak'],
      ['icons/resources/level', 'badge hexagonal doré vide (on y écrira le niveau)', 1, 'hud-level-badge'],
      [
        'icons/resources/progression',
        'histogramme de trois barres orange avec flèche montante dorée',
        1,
        'nav-progress',
      ],
    ],
  ],
  [
    'statuts',
    [
      ['icons/status/correct', 'pastille ronde verte avec coche blanche', 1, 'status-correct'],
      ['icons/status/wrong', 'pastille ronde rouge avec croix blanche', 1, 'status-wrong'],
      ['icons/status/hint', 'bulle de dialogue violette avec point d’interrogation blanc', 1, 'status-hint'],
      ['icons/status/alert', 'bulle de dialogue orange avec point d’exclamation blanc', 1, 'status-alert'],
      ['icons/status/boost', 'double chevron cyan vers le haut', 1, 'status-boost'],
      ['icons/status/malus', 'double chevron rouge vers le bas', 1, 'status-malus'],
      ['icons/status/locked', 'cadenas doré fermé', 1, 'nav-lock'],
      ['icons/status/due', 'réveil orange (notion à réviser aujourd’hui)', 1],
      ['icons/status/new', 'pastille ronde rose avec un point d’exclamation blanc (nouveauté)', 2],
    ],
  ],
  [
    'outils',
    [
      ['icons/tools/pencil', 'crayon orange à gomme rose', 1, 'tool-pencil'],
      ['icons/tools/calculator', 'calculatrice bleue à écran cyan et touches blanches', 1, 'tool-calculator'],
      [
        'icons/tools/conversion',
        'petit tableau à 3 colonnes à en-tête cyan avec une virgule rouge',
        1,
        'tool-conversion',
      ],
      ['icons/tools/eraser', 'gomme rose et bleue', 1],
      ['icons/tools/undo', 'flèche courbe blanche vers la gauche (annuler)', 1],
      ['icons/tools/trash', 'poubelle grise (tout effacer)', 1],
      ['icons/tools/dice', 'dé blanc à cinq points', 1, 'nav-dice'],
      ['icons/tools/phone', 'smartphone à écran cyan (télécommande)', 2, 'nav-phone'],
      ['icons/tools/qr', 'carré stylisé évoquant un QR code, violet foncé sur fond blanc (pas un vrai code)', 2],
    ],
  ],
  [
    'matieres',
    [
      ['icons/subjects/maths', 'calculatrice blanche', 1, 'subject-maths'],
      ['icons/subjects/physique', 'fiole de laboratoire au liquide violet', 1, 'subject-physique'],
      ['icons/subjects/anglais', 'drapeau britannique stylisé ondulant', 1, 'subject-anglais'],
      ['icons/subjects/espagnol', 'drapeau espagnol stylisé ondulant', 1, 'subject-espagnol'],
      [
        'icons/subjects/histoire',
        'tour de château fort avec fanion (le Moyen Âge est au programme de 5e)',
        1,
        'subject-histoire',
      ],
      ['icons/subjects/geographie', 'globe terrestre bleu et vert', 1, 'subject-geographie'],
    ],
  ],
  [
    'modes',
    [
      ['icons/modes/entrainement', 'haltère violet et orange', 1],
      ['icons/modes/boss', 'tête de mort cartoon blanche dans un hexagone rouge', 1],
      ['icons/modes/chrono', 'chronomètre cyan', 1],
      ['icons/modes/survie', 'cœur rouge protégé par un bouclier', 1],
      ['icons/modes/arene', 'deux blasters jouets croisés', 1],
      ['icons/modes/raid', 'trois casques de héros côte à côte', 1],
      ['icons/modes/quiz', 'buzzer rouge de jeu télévisé', 1],
      ['icons/modes/course', 'drapeau à damier et éclair', 1],
    ],
  ],
  [
    'medailles',
    [
      ['rewards/medals/bronze', 'médaille de bronze à ruban rouge, un galon gravé', 1, 'medal-bronze'],
      ['rewards/medals/argent', 'médaille d’argent à ruban cyan, deux galons gravés', 1, 'medal-argent'],
      ['rewards/medals/or', 'médaille d’or à ruban violet, trois galons gravés', 1, 'medal-or'],
      ['rewards/medals/platine', 'médaille de platine bleu glacé à ruban rose, diamant au centre', 1, 'medal-platine'],
      ['rewards/medals/none', 'emplacement de médaille vide : cercle gris en pointillés', 1, 'medal-none'],
      ['rewards/collectibles/trophy', 'trophée doré sur socle violet', 1, 'trophy'],
      ['rewards/collectibles/record', 'badge rond doré à bordure crantée (record battu)', 2],
      ['rewards/collectibles/crown', 'couronne dorée à gemmes violettes (champion)', 2],
      ['rewards/collectibles/key', 'clé dorée (déverrouillage)', 3],
    ],
  ],
  [
    'coffres',
    [
      ['rewards/chests/commun', 'coffre en métal gris à bandes orange', 2, 'chest-closed'],
      ['rewards/chests/rare', 'coffre violet à ferrures dorées, lueur violette dans la serrure', 2, 'chest-closed'],
      ['rewards/chests/epique', 'coffre tech cyan et violet aux lignes lumineuses', 2, 'chest-closed'],
      ['rewards/chests/ouvert', 'coffre violet ouvert débordant de pièces d’or', 2, 'chest-open'],
      ['rewards/chests/carte-mystere', 'carte violette à cadre doré portant un grand point d’interrogation', 3],
      ['rewards/chests/cadeau', 'paquet cadeau rouge à ruban doré', 3],
    ],
  ],
  [
    'objets',
    [
      ['icons/items/soin', 'trousse de soin rouge à croix blanche', 2, 'status-heal'],
      ['icons/items/bouclier', 'bouclier bleu à emblème cyan', 2, 'status-shield'],
      ['icons/items/temps', 'sablier doré à sable cyan (temps en plus)', 2, 'status-timer'],
      ['icons/items/precision', 'cible rouge et blanche avec viseur', 2, 'status-target'],
      ['icons/items/vitesse', 'basket violette ailée', 2],
      ['icons/items/collecte', 'aimant en U rouge à pointes argentées', 2],
      ['icons/items/boost-xp', 'canette violette et dorée marquée d’un éclair', 2],
      ['icons/items/gel', 'flocon de neige cyan glacé', 2, 'status-freeze'],
      ['icons/items/batterie', 'batterie cyan et orange avec éclair', 2],
    ],
  ],
];

const iconAssets = [
  ...GLYPHS.map(([file, prompt, priority, fallback], i) =>
    a(
      'glyph',
      `${file}.webp`,
      prompt,
      `${prompt}.`,
      'Pictogramme de bouton (posé sur une tuile ou un bouton).',
      priority,
      {
        sheet: chunk('pictogrammes', i, 9, GLYPHS.length),
        ...(fallback ? { fallback } : {}),
      },
    ),
  ),
  ...ICONS.flatMap(([sheet, rows]) =>
    rows.map(([file, prompt, priority, fallback], i) =>
      a(
        'icon',
        `${file}.webp`,
        prompt,
        `${prompt}.`,
        fallback ? SVG_ASSETS[fallback].usage : 'Icône de jeu.',
        priority,
        {
          sheet: chunk(sheet, i, 9, rows.length),
          ...(fallback ? { fallback } : {}),
        },
      ),
    ),
  ),
];

// ─── Questy, le robot mascotte ─────────────────────────────────────────────

export const QUESTY_LOOK =
  'Questy, petit robot mascotte chibi : grosse tête ronde blanche légèrement violacée, grande visière-écran noire arrondie où son visage s’affiche en LED lumineuses, deux oreillettes rondes orange sur les côtés de la tête, une antenne fine terminée par une boule orange, petit corps blanc avec plastron orange en forme d’écusson, épaulières et coudes orange, mains blanches arrondies, pieds violets arrondis ; contour violet très foncé épais';

/** Une tête par humeur ; mêmes clés que src/components/mascot/moods.ts. */
const QUESTY_MOODS = [
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

const QUESTY_POSES = [
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

const QUESTY_ACCESSORIES = [
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

const QUESTY_REF = 'characters-questy-model-sheet';

const questyAssets = [
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
const keyArt = a(
  'keyart',
  'branding/key-art.webp',
  'Illustration principale',
  'scène de combat épique et joyeuse : les cinq héros alignés de gauche à droite (Alex avec son gantelet-canon, Lina avec son lance-ballons, Pixel le chat avec son canon-poisson au premier plan, Ayla avec sa bombe-blaster, Tao avec son arbalète) et Questy qui lève le poing au milieu, tous face au Golem des Équations tout à droite ; en arrière-plan un château-académie violet flottant aux bannières à livre, ciel lavande, îles flottantes',
  'Bandeau de l’écran d’accueil et du choix du joueur.',
  2,
  { reference: QUESTY_REF },
);

// ─── Kit combat : héros ───────────────────────────────────────────────────

export interface CharacterSpec {
  readonly id: string;
  readonly name: string;
  /** Rôle, pour la carte du héros. */
  readonly role: string;
  readonly look: string;
  readonly weapon: string;
}

/** Cinq héros très différents (silhouette, style, arme) : deux garçons, deux filles, un chat. */
export const CHARACTERS: readonly CharacterSpec[] = [
  {
    id: 'alex',
    name: 'Alex',
    role: 'L’inventeur',
    look: 'Alex, garçon de 12 ans à la peau mate, cheveux bruns bouclés en bataille, grosses lunettes de soudeur cyan relevées sur le front, sourire malin avec une dent un peu écartée, salopette de mécanicien bleu canard aux nombreuses poches remplies d’outils, t-shirt orange, clé à molette accrochée à la ceinture, bottes de chantier marron ; son bras droit porte un énorme gantelet mécanique orange et gris (bien plus gros que son autre bras) ; un petit drone rond à hélice flotte au-dessus de son épaule gauche',
    weapon:
      'énorme gantelet-canon mécanique orange et gris porté au bras droit, avec une bouche de canon ronde au poing et des pistons sur l’avant-bras',
  },
  {
    id: 'tao',
    name: 'Tao',
    role: 'L’explorateur',
    look: 'Tao, garçon de 12 ans, mince et agile, cheveux noirs raides en épis, bandana vert noué sur le front aux pans qui volent, yeux en amande pétillants, grand sourire, gilet sans manches beige sable à poches multiples sur t-shirt vert forêt, short cargo marron, grosses chaussures de randonnée orange, boussole dorée autour du cou, petit sac à dos avec une corde enroulée',
    weapon:
      'arbalète-tech compacte vert et or tenue à deux mains, avec une lunette de visée ronde et des branches recourbées lumineuses',
  },
  {
    id: 'lina',
    name: 'Lina',
    role: 'La sportive',
    look: 'Lina, fille de 12 ans, grande et tonique, peau foncée, tresses fines relevées en haute couronne avec des perles dorées, bandeau éponge blanc, regard déterminé et sourire franc, maillot de sport rouge vif à bandes blanches (sans numéro ni texte), short de sport blanc, chaussettes hautes rouges, baskets épaisses blanches et rouges, protège-poignets',
    weapon:
      'gros lance-ballons rouge et blanc porté sur l’épaule comme un bazooka jouet, à large bouche ronde et réservoir d’air transparent',
  },
  {
    id: 'ayla',
    name: 'Ayla',
    role: 'La graffeuse',
    look: 'Ayla, fille de 12 ans, petite et vive, peau claire avec des taches de rousseur, cheveux violets courts en coupe asymétrique avec une longue mèche turquoise, casque audio jaune fluo autour du cou, sourire espiègle, veste bomber noire couverte de patchs colorés (formes, étoiles, éclairs), t-shirt jaune, pantalon baggy gris, rangers noires lacées de turquoise, éclaboussures de peinture turquoise et jaune sur les vêtements',
    weapon:
      'bombe-blaster : pistolet de peinture turquoise et jaune monté sur une bombe aérosol géante, buse ronde à l’avant',
  },
  {
    id: 'pixel',
    name: 'Pixel',
    role: 'Le chat ninja',
    look: 'Pixel, chat noir et blanc (pelage « smoking » : dos noir, museau, poitrail et pattes blancs) qui se tient debout sur deux pattes comme un héros, de la taille d’un enfant de 8 ans, grands yeux vert émeraude, oreille gauche avec une petite encoche, moustaches blanches, longue queue noire au bout blanc, bandeau rouge de ninja noué sur le front aux pans qui volent, foulard rouge au cou avec un grelot doré',
    weapon:
      'canon-poisson : petit canon argenté en forme de poisson stylisé, la bouche du poisson sert de canon, nageoires bleues en guise de poignée',
  },
];

export const ANIMATION_STATES = ['idle', 'run', 'shoot', 'hurt', 'victory', 'defeat'] as const;
export type AnimationState = (typeof ANIMATION_STATES)[number];

const POSES: Record<AnimationState, string> = {
  idle: 'attente : debout, détendu, arme prête',
  run: 'course : grande foulée vers la droite, un pied décollé, buste penché en avant',
  shoot: 'tir : arme pointée vers la droite, petit éclair à la bouche du canon',
  hurt: 'touché : recule d’un pas, grimace comique (dessin animé, aucune blessure)',
  victory: 'victoire : saute de joie, poing ou patte levé',
  defeat: 'défaite : assis par terre, étourdi, petites spirales au-dessus de la tête',
};

const characterAssets = CHARACTERS.flatMap((ch) => {
  const base = `characters/${ch.id}`;
  const ref = { reference: `characters-${ch.id}-model-sheet`, fallback: 'placeholder-character' } as const;
  return [
    a(
      'sheet',
      `${base}/model-sheet.webp`,
      `${ch.name} — fiche de modèle`,
      `${ch.look}. Arme : ${ch.weapon}. Fiche de modèle : 4 vues alignées (face, trois quarts gauche, profil, dos), plus l’arme seule en grand à droite`,
      'Référence de cohérence (non affichée).',
      1,
    ),
    a(
      'portrait',
      `${base}/portrait.webp`,
      `${ch.name} — portrait`,
      `${ch.look}. Expression énergique.`,
      'Avatar et carte du héros.',
      1,
      ref,
    ),
    ...ANIMATION_STATES.map((state) =>
      a(
        'pose',
        `${base}/pose-${state}.webp`,
        `${ch.name} — pose ${state}`,
        `${ch.name} (exactement comme sur sa fiche de modèle), avec son arme. Pose ${POSES[state]}`,
        'Combat : une image par état, enchaînées par animation.',
        1,
        { ...ref, sheet: `${ch.id}-poses` },
      ),
    ),
  ];
});

/** « de Tao », « d’Alex », « d’Ayla ». */
const de = (name: string) => (/^[AEIOUYÀÉ]/i.test(name) ? `d’${name}` : `de ${name}`);

const weaponAssets = CHARACTERS.map((ch) =>
  a(
    'weapon',
    `weapons/${ch.id}.webp`,
    `Arme ${de(ch.name)}`,
    `arme ${de(ch.name)} : ${ch.weapon}`,
    'Carte du héros, arsenal.',
    2,
    {
      sheet: 'armes',
    },
  ),
);

// ─── Kit combat : boss (un par domaine des maths) et mobs ─────────────────

const BOSSES = [
  [
    'golem-des-equations',
    'Golem des Équations',
    'nombres et calculs',
    'golem massif de blocs de pierre violette et grise couverts de mousse verte, cristaux violets sur les épaules, runes géométriques violettes lumineuses sur la poitrine et les poings, yeux violets brillants en colère',
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

const BOSS_STATES = [
  ['idle', 'Pose de combat menaçante mais comique'],
  ['attack', 'Attaque : se penche vers la gauche et lance une grosse onde d’énergie rouge'],
  ['hurt', 'Touché : recule, grimace comique, petites étincelles'],
  ['ko', 'Vaincu : affalé, étourdi, petites spirales au-dessus de la tête'],
] as const;

const bossAssets = BOSSES.flatMap(([id, name, domain, look]) => [
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

const MINIONS = [
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

const minionAssets = MINIONS.map(([id, look]) =>
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

// ─── Kit combat : effets (les blancs sont recolorés par l'application) ─────

const EFFECTS = [
  ['impacts/hit-burst', 'éclat d’impact étoilé BLANC pur (sera recoloré par l’application)', 'fx-hit-burst'],
  ['impacts/anneau', 'anneau d’onde de choc BLANC pur vu de trois quarts (sera recoloré)'],
  ['impacts/etincelles', 'gerbe d’étincelles BLANCHES en étoile (sera recolorée)'],
  ['impacts/flash', 'flash de bouche de canon BLANC et jaune pâle, en étoile, vu de profil vers la droite'],
  ['impacts/explosion', 'petite explosion cartoon orange et jaune avec fumée'],
  ['particles/puff', 'nuage de fumée violette cartoon (disparition d’un mob)', 'fx-puff'],
  ['particles/bouclier', 'bulle de bouclier hexagonale cyan translucide (vue de face, vide au centre)'],
  ['particles/soin', 'croix verte lumineuse entourée de petits cœurs et d’étincelles vertes'],
  ['particles/etourdi', 'trois petites spirales dorées en orbite (étourdi)'],
  ['impacts/onde-boss', 'onde d’attaque rouge et orange en forme de croissant, se déplaçant vers la gauche'],
  ['particles/confettis', 'gerbe de confettis violets, orange, cyan et jaunes'],
  ['transitions/portail', 'tourbillon de portail violet vu de face'],
] as const satisfies readonly (readonly [string, string, (keyof typeof SVG_ASSETS)?])[];

const effectAssets = EFFECTS.map(([id, look, fallback], i) =>
  a(
    'effect',
    `effects/${id}.webp`,
    `Effet ${id.split('/')[1] ?? id}`,
    look,
    'Effets de combat, récompenses, transitions.',
    1,
    {
      sheet: chunk('effets', i, 9, EFFECTS.length),
      ...(fallback ? { fallback } : {}),
    },
  ),
);

// ─── Kit combat : arènes (une par boss) ───────────────────────────────────

const ARENAS = [
  [
    'nombres',
    'Arène des nombres',
    'cour d’une académie futuriste violette, tableaux noirs géants couverts de symboles abstraits à la craie (aucun chiffre ni lettre lisible), colonnes et bannières violettes, ciel lavande',
  ],
  [
    'geometrie',
    'Arène de la géométrie',
    'plateau de cristal bleu et violet sous un ciel indigo, formes géométriques géantes flottantes (cubes, pyramides, sphères) aux arêtes lumineuses',
  ],
  [
    'donnees',
    'Arène des données',
    'salle de jeux futuriste : dés géants, roues de loterie et grands diagrammes en barres lumineux en relief, néons dorés',
  ],
  [
    'fonctions',
    'Arène des fonctions',
    'paysage néon de collines aux courbes lisses sous un ciel nocturne, quadrillage lumineux cyan au sol comme une feuille de graphique',
  ],
  [
    'informatique',
    'Arène de la programmation',
    'salle de serveurs futuriste aux baies clignotantes cyan, câbles lumineux, grands blocs de code colorés empilés',
  ],
] as const;

const envAssets = ARENAS.map(([id, name, look]) =>
  a('arena', `environments/arenas/${id}.webp`, name, look, 'Décor du combat de boss.', 2),
);

export const PLANNED_ASSETS: readonly PlannedAsset[] = [
  ...brandAssets,
  ...uiAssets,
  ...iconAssets,
  ...questyAssets,
  ...characterAssets,
  ...weaponAssets,
  ...bossAssets,
  ...minionAssets,
  ...effectAssets,
  ...envAssets,
  keyArt,
];

// ─── Manifeste ─────────────────────────────────────────────────────────────

export interface ManifestEntry {
  readonly id: string;
  readonly category: string;
  readonly path: string;
  readonly format: 'svg' | 'webp' | 'composant';
  readonly size: string;
  readonly usage: string;
  readonly status: AssetStatus;
  readonly priority?: Priority;
}

const available = new Set<string>(AVAILABLE);
const dir = (file: string) => file.split('/').slice(0, -1).join('/');

/** Manifeste complet (page de prévisualisation, tests). */
export const MANIFEST: readonly ManifestEntry[] = [
  ...PLANNED_ASSETS.map((p): ManifestEntry => {
    const k = KINDS[p.kind];
    return {
      id: p.id,
      category: dir(p.file),
      path: `/assets/${p.file}`,
      format: 'webp',
      size: `${k.final[0]}×${k.final[1]}`,
      usage: p.usage,
      status: available.has(p.file) ? 'disponible' : p.fallback ? 'provisoire' : 'manquant',
      priority: p.priority,
    };
  }),
  ...Object.entries(SVG_ASSETS).map(([id, s]): ManifestEntry => ({
    id: `svg-${id}`,
    category: s.category,
    path: s.path,
    format: 'svg',
    size: s.viewBox,
    usage: `${s.usage} (remplaçant vectoriel provisoire)`,
    status: 'provisoire',
  })),
  {
    id: 'questy-led',
    category: 'characters/questy',
    path: 'src/components/mascot/Questy.tsx',
    format: 'composant',
    size: 'vectoriel',
    usage: 'Questy LED dessiné en code : remplaçant des têtes de Questy tant qu’elles ne sont pas livrées.',
    status: 'provisoire',
  },
];

const byId = new Map(PLANNED_ASSETS.map((p) => [p.id, p]));

/** URL à afficher : image finale si livrée, sinon SVG provisoire, sinon null. */
export function assetSrc(id: string): string | null {
  const p = byId.get(id);
  if (!p) return null;
  if (available.has(p.file)) return `/assets/${p.file}`;
  return p.fallback ? SVG_ASSETS[p.fallback].path : null;
}
