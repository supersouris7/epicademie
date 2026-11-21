import { SVG_ASSETS } from '../assets.generated.ts';
import { type Priority, a, chunk } from './kinds.ts';

/** Catalogue des images — Icônes */

export type IconRow = readonly [file: string, prompt: string, priority: Priority, fallback?: keyof typeof SVG_ASSETS];

/** Pictogrammes blancs, posés par l'application sur une tuile ou un bouton. */
export const GLYPHS: readonly IconRow[] = [
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
export const ICONS: readonly (readonly [sheet: string, rows: readonly IconRow[]])[] = [
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
    // Combat de boss : icône de chaque matière, qui est aussi sa relique (gagnée en battant ses boss).
    'reliques',
    [
      ['icons/subjects/boss-maths', 'cristal violet au π et aux signes + − × ÷ sur socle doré', 1],
      ['icons/subjects/boss-anglais', 'livre violet et doré au drapeau britannique, marque-page rouge', 1],
      ['icons/subjects/boss-espagnol', 'éventail rouge et jaune aux armes de l’Espagne', 1],
      ['icons/subjects/boss-physique', 'fiole bleue à l’atome, bulles', 1],
      ['icons/subjects/boss-histoire', 'casque de légionnaire à crête rouge et lauriers dorés', 1],
      ['icons/subjects/boss-geographie', 'boussole dorée et carte au trésor', 1],
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
      ['rewards/medals/bronze', 'médaille de bronze, atome gravé, lauriers, ruban rouge et or', 1, 'medal-bronze'],
      ['rewards/medals/argent', 'médaille d’argent, atome gravé, lauriers, ruban rouge et or', 1, 'medal-argent'],
      ['rewards/medals/or', 'médaille d’or, atome gravé, lauriers, ruban rouge et or', 1, 'medal-or'],
      [
        'rewards/medals/diamant',
        'médaille de diamant bleu-violet, cristal au sommet, lauriers de glace',
        1,
        'medal-platine',
      ],
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
      ['rewards/chests/commun', 'coffre commun : métal gris à bandes orange, lumières cyan', 2, 'chest-closed'],
      ['rewards/chests/rare', 'coffre rare : bleu à ferrures blanches, fiole lumineuse', 2, 'chest-closed'],
      ['rewards/chests/epique', 'coffre épique : violet à ferrures dorées, livre ouvert', 2, 'chest-closed'],
      [
        'rewards/chests/legendaire',
        'coffre légendaire : or et violet, ailes, diamant bleu, halo doré',
        2,
        'chest-closed',
      ],
      ['rewards/chests/commun-ouvert', 'coffre commun ouvert, lumière dorée', 2, 'chest-open'],
      ['rewards/chests/rare-ouvert', 'coffre rare ouvert, lumière bleue', 2, 'chest-open'],
      ['rewards/chests/epique-ouvert', 'coffre épique ouvert, lumière violette', 2, 'chest-open'],
      ['rewards/chests/legendaire-ouvert', 'coffre légendaire ouvert, lumière dorée', 2, 'chest-open'],
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

export const iconAssets = [
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
