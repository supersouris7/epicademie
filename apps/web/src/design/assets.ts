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
    gen: '1024x1536',
    final: [768, 1152],
    framing:
      'personnage en pied, trois quarts tourné vers la droite, pieds à 92 % de la hauteur, tête vers 10 %, même échelle pour toutes les poses',
  },
  boss: {
    gen: '1024x1024',
    final: [768, 768],
    framing:
      'boss en pied, trois quarts face tourné vers la gauche (il fait face au joueur), base à 92 % de la hauteur, occupe 80 % du cadre',
  },
  minion: {
    gen: '1024x1024',
    final: [384, 384],
    framing: 'petit ennemi en pied, tourné vers la gauche, base à 90 % de sa case, occupe 70 % de la case',
    grid: { gen: '1024x1024', cols: 3, rows: 3 },
  },
  weapon: {
    gen: '1536x1024',
    final: [768, 512],
    framing: 'lanceur vu de profil, canon pointé vers la droite, poignée en bas à gauche, occupe 85 % de la largeur',
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
    framing: 'île d’arène isométrique flottante vue de trois quarts plongée, centrée, occupe 85 % de la largeur',
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
  'scène de combat épique et joyeuse : à gauche Questy lève le poing, au centre Alex tire avec son blaster, à droite Zoé tire avec son blaster, face au Golem des Équations (golem de pierre violette moussue aux runes lumineuses) tout à droite ; en arrière-plan un château-académie violet flottant aux bannières à livre, ciel lavande, îles flottantes',
  'Bandeau de l’écran d’accueil et du choix du joueur.',
  2,
  { reference: QUESTY_REF },
);

// ─── Héros ─────────────────────────────────────────────────────────────────

export interface CharacterSpec {
  readonly id: string;
  readonly name: string;
  readonly look: string;
  readonly weapon: string;
}

export const CHARACTERS: readonly CharacterSpec[] = [
  {
    id: 'alex',
    name: 'Alex',
    look: 'Alex, garçon de 12 ans, cheveux châtains en épis, bandeau orange avec grosses lunettes d’aviateur orange à verres violets relevées sur le front, yeux marron, sourire confiant, veste sans manches violette à empiècements orange sur t-shirt blanc, mitaines noires, pantalon cargo violet foncé, baskets violettes à semelle orange, sac à dos orange',
    weapon: 'blaster jouet violet et orange tirant un rayon jaune-orange',
  },
  {
    id: 'zoe',
    name: 'Zoé',
    look: 'Zoé, fille de 12 ans, longue queue de cheval rose vif, casquette blanche à visière violette avec un petit insigne orange, casque audio violet et cyan sur les oreilles, yeux bleus, sourire espiègle, veste blanche à manches violettes, short cargo violet foncé sur leggings, baskets violettes, sac à dos orange',
    weapon: 'blaster jouet blanc et cyan tirant un anneau d’énergie cyan',
  },
  {
    id: 'leo',
    name: 'Léo',
    look: 'Léo, garçon de 12 ans, cheveux blonds en épis, lunettes rondes noires, casque audio orange et noir, yeux bleus, sourire malin, blouse de laboratoire blanche ouverte sur un sweat bleu, pantalon bleu marine, baskets blanches',
    weapon: 'lance-formules jouet violet et orange avec un écran',
  },
  {
    id: 'mia',
    name: 'Mia',
    look: 'Mia, fille de 12 ans, longs cheveux bleu roi, lunettes d’aviateur orange posées sur la tête, casque audio fin cyan, yeux bleus, sourire assuré, veste blanche à bandes bleues sur t-shirt bleu, pantalon bleu marine, baskets bleues, sac à dos orange',
    weapon: 'canon jouet bleu et orange tirant des mini-globes',
  },
];

const EXPRESSIONS = [
  ['joie', 'grand sourire, yeux plissés de joie'],
  ['rire', 'éclat de rire, bouche grande ouverte, un œil fermé'],
  ['surprise', 'bouche en O, sourcils très hauts, yeux ronds'],
  ['determination', 'regard déterminé, sourcils froncés, sourire en coin'],
  ['effort', 'grimace d’effort, un œil fermé, dents serrées (dessin animé, aucune blessure)'],
  ['tristesse', 'moue triste, sourcils relevés au centre, regard vers le bas'],
] as const;

export const ANIMATION_STATES = ['idle', 'run', 'shoot', 'hurt', 'victory', 'defeat'] as const;
export type AnimationState = (typeof ANIMATION_STATES)[number];

const POSES: Record<AnimationState, string> = {
  idle: 'attente : debout, détendu, arme tenue à deux mains vers le bas',
  run: 'course : grande foulée vers la droite, un pied décollé, buste penché en avant',
  shoot: 'tir : bras tendus, arme pointée vers la droite, éclair à la bouche du canon',
  hurt: 'touché : recule d’un pas, bras levés, grimace (dessin animé, aucune blessure)',
  victory: 'victoire : saute sur place, poing levé, grand sourire',
  defeat: 'défaite : assis par terre, étourdi, petites spirales au-dessus de la tête',
};

const characterAssets = CHARACTERS.flatMap((ch) => {
  const base = `characters/${ch.id}`;
  const ref = { reference: `characters-${ch.id}-portrait`, fallback: 'placeholder-character' } as const;
  return [
    a(
      'portrait',
      `${base}/portrait.webp`,
      `${ch.name} — portrait`,
      `${ch.look}. Expression énergique.`,
      'Avatar et carte du personnage.',
      2,
      {
        fallback: 'placeholder-character',
      },
    ),
    ...EXPRESSIONS.map(([id, desc]) =>
      a(
        'expression',
        `${base}/expression-${id}.webp`,
        `${ch.name} — ${id}`,
        `${ch.look}. Expression : ${desc}.`,
        'Réactions pendant les parties.',
        2,
        ref,
      ),
    ),
    ...ANIMATION_STATES.map((state) =>
      a(
        'pose',
        `${base}/pose-${state}.webp`,
        `${ch.name} — pose ${state}`,
        `${ch.look}. Tient un ${ch.weapon}. Pose ${POSES[state]}.`,
        'Images clés d’animation (combats).',
        3,
        ref,
      ),
    ),
  ];
});

// ─── Boss et ennemis (repris des planches) ─────────────────────────────────

const BOSSES = [
  [
    'maths',
    'golem-des-equations',
    'Golem des Équations',
    'golem massif de blocs de pierre violette et grise couverts de mousse verte, cristaux violets sur les épaules, runes géométriques violettes lumineuses sur la poitrine et les poings, yeux violets brillants en colère',
  ],
  [
    'maths',
    'geomatrix',
    'Géomatrix',
    'golem de cubes de cristal bleu et violet, symboles géométriques cyan lumineux gravés, petits cubes flottant autour, yeux orange',
  ],
  [
    'physics',
    'molecor',
    'Molécor',
    'robot-fiole : grande fiole remplie de liquide vert fluo bouillonnant avec deux yeux en colère dans le liquide, carapace et bras mécaniques violets, tuyaux',
  ],
  [
    'physics',
    'professeur-molecule',
    'Professeur Molécule',
    'blob de slime vert fluo dans une fiole renversée à poignées métalliques, tuyaux, yeux verts lumineux',
  ],
  [
    'biology',
    'florion',
    'Florion',
    'golem-arbre au tronc sculpté en visage sévère, feuillage vert dense, racines en jambes, petit champignon rouge, yeux verts lumineux',
  ],
  [
    'french',
    'scriptor',
    'Scriptor',
    'parchemin vivant enroulé au visage aux yeux orange, cape violette à bordure dorée, grande plume rose, feuilles volantes',
  ],
  [
    'french',
    'ombre-des-livres',
    'L’Ombre des Livres',
    'silhouette encapuchonnée violette au visage d’ombre et yeux violets lumineux, livres ouverts flottant autour, volutes d’encre violette',
  ],
  [
    'history',
    'chronos',
    'Chronos',
    'horloge géante dorée à engrenages, visage blanc aux yeux rouges dans le cadran, bras mécaniques, petit globe au-dessus',
  ],
  [
    'history',
    'globotron',
    'Globotron',
    'robot dont la tête est un globe terrestre à visière noire et yeux jaunes, casque audio cyan, corps violet et argent',
  ],
  [
    'general',
    'ia-des-connaissances',
    'IA des Connaissances',
    'robot cubique bleu à écran-visage aux yeux cyan en colère, cubes de données violets en orbite',
  ],
  [
    'general',
    'araignee-mecanique',
    'Araignée mécanique',
    'robot araignée blanc et violet à six pattes orange pointues, cœur-réacteur orange lumineux',
  ],
] as const;

const bossAssets = BOSSES.flatMap(([subject, id, name, look]) => {
  const ref = { reference: `bosses-${subject}-${id}`, fallback: 'placeholder-boss' } as const;
  return [
    a(
      'boss',
      `bosses/${subject}/${id}.webp`,
      name,
      `${look}. Pose de combat menaçante mais comique, adaptée aux 11-13 ans.`,
      'Combat de boss, carte de boss.',
      2,
      {
        fallback: 'placeholder-boss',
      },
    ),
    a(
      'portrait',
      `bosses/${subject}/${id}-portrait.webp`,
      `${name} — portrait`,
      `${look}. Tête seule, de face, l’air menaçant.`,
      'Portrait rond de la barre de vie du boss.',
      2,
      ref,
    ),
    a(
      'boss',
      `bosses/${subject}/${id}-hurt.webp`,
      `${name} — touché`,
      `${look}. Touché : recule, grimace comique, petites étincelles.`,
      'Combat de boss : réaction au coup.',
      3,
      ref,
    ),
  ];
});

const MINIONS = [
  ['cube-bot', 'petit robot cube blanc à écran bleu, deux petits bras'],
  ['equerre', 'équerre jaune vivante avec un rapporteur, yeux rouges'],
  ['calculatrice', 'calculatrice grise vivante sur pattes, écran-yeux bleus'],
  ['fiole', 'petite fiole verte vivante, yeux jaunes'],
  ['molecule', 'molécule violette et rose (boules reliées), yeux méchants'],
  ['feuille', 'boule de feuilles vertes épineuses, yeux rouges'],
  ['parchemin', 'petit parchemin vivant, yeux orange'],
  ['livre', 'livre violet vivant à lunettes rondes'],
  ['globe', 'globe terrestre vivant sur pied avec règle'],
  ['casque', 'casque grec argenté à crête rouge vivant, yeux jaunes dans la fente'],
] as const;

const minionAssets = MINIONS.map(([id, look], i) =>
  a(
    'minion',
    `bosses/minions/${id}.webp`,
    `Ennemi ${id}`,
    `${look}. Mignon mais espiègle.`,
    'Petits ennemis (modes à venir).',
    3,
    {
      fallback: 'placeholder-boss',
      sheet: chunk('ennemis', i, 9, MINIONS.length),
    },
  ),
);

// ─── Armes, projectiles, effets ───────────────────────────────────────────

const WEAPONS = [
  ['blaster-alex', 'Blaster d’Alex', 'blaster violet et orange à canon court', 'rayon d’énergie jaune-orange'],
  ['blaster-zoe', 'Blaster de Zoé', 'blaster blanc et cyan à canon annelé', 'anneau d’énergie cyan'],
  ['lance-livre', 'Lance-Livre', 'gros lanceur violet et or dont le canon est un livre ouvert', 'livre ouvert volant'],
  ['lance-formules', 'Lance-Formules', 'lanceur argenté et orange avec un écran', 'cube bleu lumineux'],
  [
    'rayon-labo',
    'Rayon de Laboratoire',
    'pistolet-rayon orange à réservoir de cristal violet',
    'bulle de liquide vert',
  ],
  ['canon-atlas', 'Canon Atlas', 'canon bleu et orange portant un globe terrestre', 'mini globe terrestre'],
  ['plume-laser', 'Plume Laser', 'grande plume violette lumineuse montée sur une poignée', 'plume violette'],
  ['bio-scanner', 'Bio-Scanner', 'lanceur vert à capsule contenant une feuille', 'feuille verte'],
  ['projecteur-tech', 'Projecteur Tech', 'lanceur violet à écran', 'éclair violet'],
] as const;

const weaponAssets = [
  ...WEAPONS.map(([id, name, look]) =>
    a(
      'weapon',
      `weapons/${id}.webp`,
      name,
      `${look}. Jouet futuriste aux formes rondes et inoffensives.`,
      'Équipement des personnages.',
      3,
    ),
  ),
  ...WEAPONS.map(([id, name, , shot]) =>
    a('projectile', `projectiles/${id}.webp`, `Projectile ${name}`, `${shot}.`, 'Tirs (combat de boss).', 3, {
      sheet: 'projectiles',
    }),
  ),
];

const EFFECTS = [
  ['impacts/hit-burst', 'éclat d’impact orange et jaune', 'fx-hit-burst'],
  ['impacts/eclat-violet', 'éclat d’impact violet à cœur blanc'],
  ['impacts/anneau-cyan', 'anneau d’onde de choc cyan vu de trois quarts'],
  ['impacts/explosion', 'petite explosion orange avec cailloux'],
  ['impacts/eclat-feuilles', 'gerbe de feuilles vertes'],
  ['impacts/cristaux', 'éclats de cristal bleu glacé'],
  ['particles/puff', 'nuage de fumée violette cartoon (disparition)', 'fx-puff'],
  ['particles/pixels', 'nuée de petits carrés cyan (téléportation)'],
  ['particles/etourdi', 'trois petites spirales dorées en orbite (étourdi)'],
  ['transitions/portail', 'tourbillon de portail violet vu de face'],
  ['particles/poussiere', 'petit nuage de poussière blanche (course)'],
  ['particles/confettis', 'gerbe de confettis violets, orange, cyan et roses'],
] as const satisfies readonly (readonly [string, string, (keyof typeof SVG_ASSETS)?])[];

const effectAssets = EFFECTS.map(([id, look, fallback], i) =>
  a(
    'effect',
    `effects/${id}.webp`,
    `Effet ${id.split('/')[1] ?? id}`,
    `${look}.`,
    'Effets de combat, récompenses, transitions.',
    fallback ? 2 : 3,
    {
      sheet: chunk('effets', i, 9, EFFECTS.length),
      ...(fallback ? { fallback } : {}),
    },
  ),
);

// ─── Environnements ────────────────────────────────────────────────────────

const ENV = [
  [
    'arena',
    'environments/arenas/arene-tech',
    'Arène tech',
    'arène circulaire violette à piliers dorés et néons cyan, cercle lumineux au sol',
    2,
  ],
  [
    'arena',
    'environments/arenas/arene-academie',
    'Arène académie',
    'arène circulaire en dalles crème avec bannières violettes à livre, portail surmonté d’un livre géant',
    2,
  ],
  [
    'arena',
    'environments/arenas/arene-nature',
    'Arène nature',
    'arène circulaire d’herbe avec arbres, piliers de pierre moussus, portail bleu lumineux',
    3,
  ],
  [
    'platform',
    'environments/tiles/plateforme-herbe',
    'Plateforme herbe',
    'bloc de pierre grise surmonté d’herbe verte',
    3,
  ],
  ['platform', 'environments/tiles/plateforme-violette', 'Plateforme violette', 'bloc de pierre violette', 3],
  ['platform', 'environments/tiles/plateforme-pierre', 'Plateforme pierre', 'bloc de pavés gris', 3],
  ['platform', 'environments/tiles/plateforme-glace', 'Plateforme glace', 'bloc de glace bleue cristalline', 3],
  [
    'platform',
    'environments/tiles/plateforme-lave',
    'Plateforme lave',
    'bloc de roche noire fissurée de lave orange',
    3,
  ],
  ['floor', 'environments/tiles/sol-dalles', 'Sol dalles', 'dalles de pierre grise', 3],
  ['floor', 'environments/tiles/sol-violet', 'Sol violet', 'dalle violette à cercle lumineux central', 3],
  ['floor', 'environments/tiles/sol-grille', 'Sol grille', 'grille métallique sombre', 3],
  ['floor', 'environments/tiles/sol-energie', 'Sol énergie', 'dalle cyan lumineuse', 3],
  ['floor', 'environments/tiles/sol-herbe', 'Sol herbe', 'herbe avec petites fleurs jaunes', 3],
  ['floor', 'environments/tiles/sol-sable', 'Sol sable', 'sable clair', 3],
] as const;

const PROPS = [
  ['banniere', 'bannière violette suspendue portant un livre ouvert'],
  ['lampadaire', 'lampadaire noir avec petit drapeau violet'],
  ['arche', 'arche de pierre moussue'],
  ['bibliotheque', 'bibliothèque en bois remplie de livres colorés'],
  ['pile-livres', 'pile de livres colorés'],
  ['globe', 'globe terrestre sur pied doré'],
  ['telescope', 'télescope doré sur trépied'],
  ['tableau', 'tableau noir sur pied avec un triangle dessiné à la craie'],
  ['eprouvettes', 'porte-éprouvettes en bois avec liquides colorés'],
  ['terrarium', 'cloche de verre avec une plante'],
  ['cristaux', 'grappe de cristaux violets'],
  ['colonne', 'colonne grecque brisée avec lierre'],
  ['casier', 'casier d’école violet'],
  ['sac-a-dos', 'sac à dos orange et violet'],
  ['portail-violet', 'portail de pierre à tourbillon violet'],
  ['portail-bleu', 'portail de pierre à tourbillon bleu'],
  ['portail-vert', 'portail de pierre moussue à tourbillon vert'],
  ['portail-orange', 'portail à engrenages dorés à tourbillon orange'],
  ['barriere-energie', 'barrière d’énergie hexagonale cyan'],
  ['barriere-laser', 'deux poteaux reliés par des lasers rouges'],
  ['caisse', 'caisse en bois'],
  ['rocher', 'rochers gris'],
  ['marqueur-cible', 'marqueur de sol rouge en forme de viseur'],
  ['marqueur-zone', 'disque de sol bleu lumineux'],
  ['marqueur-soin', 'disque de sol vert à croix'],
  ['marqueur-alerte', 'disque de sol orange à point d’exclamation'],
] as const;

const envAssets = [
  ...ENV.map(([kind, file, name, prompt, priority]) =>
    a(kind, `${file}.webp`, name, `${prompt}.`, 'Décors des combats (modes à venir).', priority),
  ),
  ...PROPS.map(([id, prompt], i) =>
    a('prop', `environments/props/${id}.webp`, `Décor ${id}`, `${prompt}.`, 'Décors des combats (modes à venir).', 3, {
      sheet: chunk('decors', i, 9, PROPS.length),
    }),
  ),
];

export const PLANNED_ASSETS: readonly PlannedAsset[] = [
  ...brandAssets,
  ...uiAssets,
  ...iconAssets,
  ...questyAssets,
  ...characterAssets,
  keyArt,
  ...bossAssets,
  ...minionAssets,
  ...weaponAssets,
  ...effectAssets,
  ...envAssets,
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
