/** Icônes : ressources, navigation, outils, statuts. */
import {
  circle,
  fill,
  flat,
  gearPath,
  glyph,
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
import { textPath } from '../font.ts';
import type { SvgAsset } from '../types.ts';

const HEART =
  'M32 56C14 45 5 34 5 22.5 5 13 12 6.5 20 6.5c5.5 0 9.5 3 12 7.5 2.5-4.5 6.5-7.5 12-7.5 8 0 15 6.5 15 16C59 34 50 45 32 56Z';
const BOLT = 'M37 4 11 36h17l-6 24 31-36H35Z';
const SHIELD = 'M32 5 54 13v17c0 14-9 24-22 30C19 54 10 44 10 30V13Z';
/** Petit livre ouvert (emblème de la marque, gravé sur la pièce). */
const BOOK = 'M19 25c5-2.5 9-2 13 1 4-3 8-3.5 13-1v15c-5-2.5-9-2-13 1-4-3-8-3.5-13-1Z';

export const RESOURCES: SvgAsset[] = [
  {
    id: 'resource-coin',
    file: 'icons/resources/coin.svg',
    title: 'Pièce',
    usage: 'Monnaie du joueur (compteur de ressources, récompenses de fin de partie).',
    body:
      toon('coin-a', circle(32, 32, 26), 'gold-400', 'gold-600') +
      ring(circle(32, 31, 17), 'gold-600', 3) +
      stroke(BOOK, 'gold-600', 3) +
      stroke('M32 26v14', 'gold-600', 3) +
      shine('M15 22a19 19 0 0 1 9-9'),
  },
  {
    id: 'resource-gem',
    file: 'icons/resources/gem.svg',
    title: 'Gemme',
    usage: 'Monnaie rare (réservée aux futures récompenses).',
    body:
      flat(poly(regular(32, 32, 27, 6)), 'violet-600', 0) +
      fill(
        poly([
          [32, 5],
          [55.4, 18.5],
          [43, 25],
          [21, 25],
          [8.6, 18.5],
        ]),
        'violet-300',
      ) +
      fill(
        poly([
          [55.4, 18.5],
          [55.4, 45.5],
          [43, 39],
          [43, 25],
        ]),
        'violet-700',
      ) +
      fill(
        poly([
          [32, 59],
          [8.6, 45.5],
          [21, 39],
          [43, 39],
          [55.4, 45.5],
        ]),
        'violet-800',
      ) +
      fill(
        poly([
          [21, 25],
          [43, 25],
          [43, 39],
          [21, 39],
        ]),
        'violet-500',
      ) +
      outline(poly(regular(32, 32, 27, 6))) +
      outline(path('M21 25h22v14H21ZM8.6 18.5 21 25M55.4 18.5 43 25M8.6 45.5 21 39M55.4 45.5 43 39'), 2.5) +
      shine('M24 30v4', 4, 0.7),
  },
  {
    id: 'resource-energy',
    file: 'icons/resources/energy.svg',
    title: 'Énergie',
    usage: 'Jauge d’énergie (modes à venir), bonus de rapidité.',
    body: toon('energy-a', path(BOLT), 'gold-400', 'orange-500', { dx: -2, dy: -3 }) + shine('M33 11 21 27', 3.5),
  },
  {
    id: 'resource-life',
    file: 'icons/resources/life.svg',
    title: 'Vie',
    usage: 'Cœur plein : vies restantes (mode Survie), barre de santé.',
    body: toon('life-a', path(HEART), 'red-500', 'red-700') + shine('M13 19c1-4 4-6.5 8-6.5', 4.5),
  },
  {
    id: 'resource-life-empty',
    file: 'icons/resources/life-empty.svg',
    title: 'Vie perdue',
    usage: 'Cœur vide : vie perdue.',
    body: toon('life-e', path(HEART), 'gray-300', 'gray-500'),
  },
  {
    id: 'resource-xp',
    file: 'icons/resources/xp.svg',
    title: 'Expérience (XP)',
    usage: 'Badge XP au bout de la barre d’expérience, gains d’XP.',
    body:
      toon('xp-a', poly(regular(32, 32, 28, 6, 0)), 'cyan-500', 'cyan-700') +
      lettering(textPath('XP', 32, 42, 27, 0.5).d, 'white', 5),
  },
];

const navGlyph = (id: string, title: string, usage: string, body: string): SvgAsset => ({
  id: `nav-${id}`,
  file: `icons/navigation/${id}.svg`,
  title,
  usage,
  body,
});

export const NAVIGATION: SvgAsset[] = [
  navGlyph('home', 'Accueil', 'Retour à l’accueil.', glyph(path('M8 31 32 9l24 22h-6v24H38V41H26v14H14V31Z'))),
  navGlyph('back', 'Retour', 'Revenir à l’écran précédent.', glyph(path('M7 32 29 11v12h26v18H29v12Z'))),
  navGlyph('next', 'Suivant', 'Question suivante, continuer.', glyph(path('M57 32 35 11v12H9v18h26v12Z'))),
  navGlyph(
    'play',
    'Jouer',
    'Lancer une partie.',
    glyph(path('M19 9c0-2 2-3 4-2l32 21.5c2 1.3 2 3.7 0 5L23 57c-2 1-4 0-4-2Z')),
  ),
  navGlyph(
    'settings',
    'Paramètres',
    'Ouvrir les paramètres.',
    glyph(path(`${gearPath(32, 32, 27, 20, 8)}M41 32a9 9 0 1 0-18 0 9 9 0 1 0 18 0Z`)).replace(
      '<path ',
      '<path fill-rule="evenodd" ',
    ),
  ),
  navGlyph(
    'menu',
    'Menu',
    'Liste, menu.',
    [14, 32, 50].map((y) => glyph(circle(13, y, 5)) + glyph(rect(23, y - 5, 33, 10, 5))).join(''),
  ),
  navGlyph(
    'info',
    'Information',
    'À propos, aide.',
    glyph(circle(32, 14, 7)) + glyph(path('M24 26h13v22h5v9H22v-9h5V35h-3Z')),
  ),
  navGlyph('close', 'Fermer', 'Fermer, quitter la partie.', line('M17 17l30 30M47 17 17 47', 'white', 9)),
  navGlyph('check', 'Valider', 'Valider, confirmer.', line('M12 34l13 13 27-29', 'white', 9)),
  navGlyph(
    'retry',
    'Réessayer',
    'Rejouer, recommencer.',
    line('M51 32a19 19 0 1 1-6-14', 'white', 8) + glyph(path('M53 7 54 27 35 22Z')),
  ),
  navGlyph(
    'lock',
    'Verrouillé',
    'Contenu verrouillé.',
    line('M21 30V21a11 11 0 0 1 22 0v9', 'white', 6) +
      toon('lock-a', rect(12, 28, 40, 30, 7), 'gold-400', 'gold-600') +
      fill(path('M32 37a4.5 4.5 0 0 1 2.5 8.2V50h-5v-4.8A4.5 4.5 0 0 1 32 37Z'), 'ink'),
  ),
  navGlyph(
    'fullscreen',
    'Plein écran',
    'Passer en plein écran.',
    line('M10 24V10h14M54 24V10H40M10 40v14h14M54 40v14H40', 'white', 7),
  ),
  navGlyph(
    'fullscreen-exit',
    'Quitter le plein écran',
    'Sortir du plein écran.',
    line('M24 10v14H10M40 10v14h14M24 54V40H10M40 54V40h14', 'white', 7),
  ),
  navGlyph(
    'team',
    'Multijoueur',
    'Modes à plusieurs.',
    glyph(circle(44, 19, 9)) +
      glyph(path('M30 50c0-9 6-15 14-15s14 6 14 15v4H30Z')) +
      glyph(circle(22, 22, 10.5)) +
      glyph(path('M5 55c0-10 7-17 17-17s17 7 17 17v4H5Z')),
  ),
  navGlyph(
    'progress',
    'Progrès',
    'Tableau de bord des progrès.',
    glyph(rect(7, 36, 13, 21, 3)) + glyph(rect(25.5, 24, 13, 33, 3)) + glyph(rect(44, 10, 13, 47, 3)),
  ),
  navGlyph(
    'phone',
    'Télécommande',
    'Smartphone utilisé comme manette.',
    flat(rect(16, 5, 32, 54, 8), 'white') +
      flat(rect(22, 13, 20, 30, 2), 'cyan-500', 0) +
      flat(circle(32, 51, 3.5), 'ink', 0),
  ),
  navGlyph('plus', 'Ajouter', 'Ajouter, nouveau.', glyph(path('M25 8h14v17h17v14H39v17H25V39H8V25h17Z'))),
  navGlyph(
    'hint',
    'Je n’ai pas compris',
    'Demander une explication.',
    line('M22 21c0-6 4.5-10 10-10s10 4 10 9.5c0 8-10 8-10 15', 'white', 8) + glyph(circle(32, 50, 5.5)),
  ),
  navGlyph(
    'lesson',
    'Leçon',
    'Ouvrir la leçon.',
    glyph(path('M5 14c9-5 18-5 27 1 9-6 18-6 27-1v38c-9-5-18-5-27 1-9-6-18-6-27-1Z')) + outline(path('M32 15v38'), 4),
  ),
  navGlyph(
    'dice',
    'Au hasard',
    'Tirer un avatar au hasard.',
    flat(rect(8, 8, 48, 48, 12), 'white') +
      [
        [21, 21],
        [43, 21],
        [32, 32],
        [21, 43],
        [43, 43],
      ]
        .map(([x, y]) => flat(circle(x ?? 0, y ?? 0, 4.5), 'ink', 0))
        .join(''),
  ),
];

export const TOOLS: SvgAsset[] = [
  {
    id: 'tool-pencil',
    file: 'icons/tools/pencil.svg',
    title: 'Brouillon',
    usage: 'Onglet et bouton du brouillon.',
    body:
      toon('pen-a', path('M42 8l14 14-30 30-14-14Z'), 'orange-400', 'orange-600') +
      flat(path('M12 38l14 14-17 4Z'), 'cream-200') +
      fill(path('M9.8 49.5l4.7 4.7-6 1.5Z'), 'ink') +
      flat(path('M42 8l5-5c2-2 4-2 6 0l8 8c2 2 2 4 0 6l-5 5Z'), 'pink-500'),
  },
  {
    id: 'tool-calculator',
    file: 'icons/tools/calculator.svg',
    title: 'Calculatrice',
    usage: 'Onglet et bouton de la calculatrice.',
    body: calculator('calc-t'),
  },
  {
    id: 'tool-conversion',
    file: 'icons/tools/conversion.svg',
    title: 'Tableau de conversion',
    usage: 'Onglet et bouton du tableau de conversion.',
    body:
      toon('conv-a', rect(5, 12, 54, 40, 7), 'white', 'cream-300') +
      fill(rect(7, 14, 50, 11), 'cyan-500') +
      outline(path('M5 25h54M5 38h54M23 12v40M41 12v40'), 3) +
      outline(rect(5, 12, 54, 40, 7)) +
      flat(path('M30 41h4v9h-4Z'), 'red-500', 0),
  },
];

/** Corps de calculatrice (réutilisé par l'icône de matière « maths »). */
export function calculator(uid: string): string {
  return (
    toon(uid, rect(11, 4, 42, 56, 9), 'blue-500', 'blue-700') +
    flat(rect(17, 10, 30, 13, 3), 'cyan-300', 3) +
    stroke('M37 16.5h5', 'blue-700', 3) +
    [0, 1, 2]
      .flatMap((row) =>
        [0, 1, 2].map((col) => {
          const x = 17 + col * 11;
          const y = 28 + row * 10;
          const accent = col === 2 && row === 2;
          return flat(rect(x, y, 8, 7, 2), accent ? 'orange-500' : 'white', 2.5);
        }),
      )
      .join('') +
    shine('M15 13v10', 3, 0.45)
  );
}

export const STATUS: SvgAsset[] = [
  {
    id: 'status-shield',
    file: 'icons/status/shield.svg',
    title: 'Bouclier',
    usage: 'Protection, joker anti-erreur.',
    body:
      toon('shield-a', path(SHIELD), 'cyan-500', 'cyan-700') +
      fill(path('M32 12v41c-9-5-15-12-15-23V18Z'), 'white', 0.3) +
      outline(path(SHIELD)),
  },
  {
    id: 'status-heal',
    file: 'icons/status/heal.svg',
    title: 'Soin',
    usage: 'Récupérer une vie.',
    body:
      toon('heal-a', path('M24 6h16v18h18v16H40v18H24V40H6V24h18Z'), 'green-500', 'green-700') +
      shine('M28 11v14', 3.5),
  },
  {
    id: 'status-boost',
    file: 'icons/status/boost.svg',
    title: 'Bonus',
    usage: 'Bonus, montée de niveau.',
    body: line('M12 36l20-18 20 18M12 52l20-18 20 18', 'cyan-500', 9),
  },
  {
    id: 'status-malus',
    file: 'icons/status/malus.svg',
    title: 'Malus',
    usage: 'Malus, perte.',
    body: line('M12 12l20 18 20-18M12 28l20 18 20-18', 'red-500', 9),
  },
  {
    id: 'status-timer',
    file: 'icons/status/timer.svg',
    title: 'Chrono',
    usage: 'Temps limité, contre-la-montre.',
    body:
      flat(path('M17 9h30c0 13-10 16-10 23s10 10 10 23H17c0-13 10-16 10-23S17 22 17 9Z'), 'cyan-300') +
      fill(path('M21 53c2-7 9-9 11-12 2 3 9 5 11 12Z'), 'gold-400') +
      fill(path('M23 17h18c-2 5-7 7-9 9-2-2-7-4-9-9Z'), 'gold-400') +
      outline(path('M17 9h30c0 13-10 16-10 23s10 10 10 23H17c0-13 10-16 10-23S17 22 17 9Z')) +
      flat(rect(11, 4, 42, 8, 4), 'brown-500') +
      flat(rect(11, 52, 42, 8, 4), 'brown-500'),
  },
  {
    id: 'status-target',
    file: 'icons/status/target.svg',
    title: 'Cible',
    usage: 'Objectif, précision.',
    body:
      flat(circle(32, 32, 22), 'white', 0) +
      ring(circle(32, 32, 22), 'red-500', 8) +
      flat(circle(32, 32, 7), 'red-500', 0) +
      line('M32 3v13M32 48v13M3 32h13M48 32h13', 'red-500', 5) +
      outline(circle(32, 32, 26)) +
      outline(circle(32, 32, 18), 3),
  },
  {
    id: 'status-freeze',
    file: 'icons/status/freeze.svg',
    title: 'Gel',
    usage: 'Temps gelé (bonus de chrono).',
    body: line(
      'M32 6v52M9.5 19l45 26M9.5 45l45-26M25 10l7 7 7-7M25 54l7-7 7 7M8 28l10-2-3-9M56 36l-10 2 3 9M8 36l10 2-3 9M56 28l-10-2 3-9',
      'cyan-300',
      5,
    ),
  },
  {
    id: 'status-streak',
    file: 'icons/status/streak.svg',
    title: 'Série',
    usage: 'Série de bonnes réponses, série de jours.',
    body:
      toon(
        'streak-a',
        path('M33 4c3 10 18 16 18 34 0 11-8 20-19 20S13 50 13 39c0-9 5-14 9-17 0 6 3 9 6 9-2-10 0-19 5-27Z'),
        'orange-500',
        'red-500',
      ) +
      fill(path('M32 30c2 6 10 9 10 17 0 6-4 9-10 9s-10-3-10-9c0-4 2-6 4-7 0 3 2 4 3 4-1-5 0-10 3-14Z'), 'gold-400'),
  },
  {
    id: 'status-correct',
    file: 'icons/status/correct.svg',
    title: 'Bonne réponse',
    usage: 'Réponse juste.',
    body: toon('ok-a', circle(32, 32, 27), 'green-500', 'green-700') + line('M18 33l9 9 19-20', 'white', 7),
  },
  {
    id: 'status-wrong',
    file: 'icons/status/wrong.svg',
    title: 'Mauvaise réponse',
    usage: 'Réponse fausse.',
    body: toon('ko-a', circle(32, 32, 27), 'red-500', 'red-700') + line('M22 22l20 20M42 22 22 42', 'white', 7),
  },
  {
    id: 'status-hint',
    file: 'icons/status/hint.svg',
    title: 'Je n’ai pas compris',
    usage: 'Bulle d’aide « Je n’ai pas compris ».',
    body:
      toon(
        'hint-a',
        path('M10 8h44c3 0 5 2 5 5v30c0 3-2 5-5 5H30l-12 11v-11h-8c-3 0-5-2-5-5V13c0-3 2-5 5-5Z'),
        'violet-500',
        'violet-700',
      ) +
      line('M25 21c0-5 3.5-7.5 7.5-7.5s7.5 2.5 7.5 7c0 6-7.5 6-7.5 11', 'white', 6) +
      glyph(circle(32.5, 40, 4)),
  },
  {
    id: 'status-alert',
    file: 'icons/status/alert.svg',
    title: 'Attention',
    usage: 'Notion à revoir, avertissement.',
    body:
      toon(
        'alert-a',
        path('M10 8h44c3 0 5 2 5 5v30c0 3-2 5-5 5H30l-12 11v-11h-8c-3 0-5-2-5-5V13c0-3 2-5 5-5Z'),
        'orange-500',
        'orange-700',
      ) +
      line('M32 15v15', 'white', 7) +
      glyph(circle(32, 39.5, 4.5)),
  },
];
