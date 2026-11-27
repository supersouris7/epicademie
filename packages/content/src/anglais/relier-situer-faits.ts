/**
 * Anglais 5e, « Relier et situer » (lot an-5e-05) : données citées. Chaque fait porte l'identifiant de sa source
 * (registre `sources.ts`) et une citation exacte du texte consulté le 27/11/2026 (copies d'archive web.archive.org
 * des pages du British Council ; programme d'anglais du collège). Les espaces et retours à la ligne sont réduits à
 * une espace.
 *
 * Programme (5e) : opposition (but, whereas, however), in the foreground / background, at the top / bottom, on the
 * right / left, adverbes de degré very, much, too. Les traductions françaises et les phrases des exercices sont
 * écrites pour le jeu.
 */
import type { Fait } from './presentation-faits.ts';

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const PROG = 'anglais-college-2025';
const PHOTO = 'bct-describe-picture';
const TOO = 'bck-too-adjective';
const INT = 'bc-intensifiers';

export const FAITS: readonly Fait[] = [
  fait(
    'programme-contraste',
    PROG,
    'Exprimer une opposition, une concession ou un contraste : but, whereas, however, or, etc.',
    'but, whereas et however expriment l’opposition (programme de 5e).',
  ),
  fait(
    'however-phrase',
    PROG,
    'However, Tom is the one I prefer',
    'However ouvre une phrase et se fait suivre d’une virgule.',
  ),
  fait(
    'however-point-virgule',
    PROG,
    'reach their destination; however, they managed to sail back',
    'however suit aussi un point-virgule, avec une virgule après.',
  ),
  fait(
    'programme-situer',
    PROG,
    'Situer dans l’espace : in the foreground/in the background, at the top/bottom, on the right/left',
    'Les expressions de position sur une image sont au programme.',
  ),
  fait(
    'arriere-plan',
    PROG,
    'people taking pictures in the background',
    'in the background situe des personnes sur une photographie.',
  ),
  fait(
    'photo-oral',
    PHOTO,
    'In some speaking exams you have to talk about photos or pictures.',
    'Décrire une image est une tâche d’oral.',
  ),
  fait(
    'photo-expliquer',
    PHOTO,
    'so you can explain which part of the picture you are talking about',
    'Ces expressions disent de quelle partie de l’image on parle.',
  ),
  fait('photo-haut', PHOTO, 'At the top/bottom of the picture', 'at the top, at the bottom.'),
  fait('photo-cotes', PHOTO, 'On the left/right of the picture', 'on the left, on the right.'),
  fait(
    'programme-degre',
    PROG,
    'Faire varier le degré d’intensité de la qualité à l’aide d’adverbes de degré : very, much, too, etc.',
    'very, much et too sont au programme de 5e (« Classe de cinquième », « La phrase et son organisation »).',
  ),
  fait(
    'too-sens',
    TOO,
    'We can use too + adjective to say when something is more than we want.',
    'too + adjectif : plus que ce que l’on veut.',
  ),
  fait(
    'very-renforce',
    INT,
    'We use words like very, really and extremely to make adjectives stronger',
    'very renforce un adjectif.',
  ),
  fait(
    'much-comparatif',
    INT,
    'We use these words and phrases as intensifiers with comparative adjectives',
    'much renforce un adjectif au comparatif.',
  ),
  fait('much-exemple', INT, 'He is much older than me.', 'much + comparatif + than.'),
];
