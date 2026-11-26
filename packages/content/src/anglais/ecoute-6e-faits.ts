/**
 * Anglais 6e, « Écouter et comprendre » (lot an-6e-08) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté :
 * programme d'anglais du collège (annexe 3 de l'arrêté du 5 mai 2025) et pages LearnEnglish Teens du British Council
 * (copies d'archive web.archive.org consultées le 26/11/2026). Les espaces et retours à la ligne sont réduits à une
 * espace. Les faits sur les nombres, l'heure et les fêtes déjà vérifiés pour le CM1 et le CM2 sont repris tels quels.
 *
 * Programme (6e, A1 / A1+) : compter jusqu'à 100, heures entières, demies et quarts, ordinaux et dates, années
 * (A1+), informations d'un message ou d'une invitation, cinq axes culturels. Les messages, annonces et prénoms des
 * exercices sont inventés.
 */
import { FAITS as FAITS_CM1 } from './ecoute-faits.ts';
import { FAITS as FAITS_CM2 } from './ecoute-cm2-faits.ts';
import { FAITS as FAITS_PRESENTATION, type Fait } from './presentation-faits.ts';

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const PROG = 'anglais-college-2025';
const PATRICK = 'bc-teens-saint-patrick';
const THANKS = 'bc-teens-thanksgiving';

/** Faits repris des lots précédents : mots-nombres, heure, ordinaux, fêtes. */
const REPRIS: readonly Fait[] = [
  ...FAITS_PRESENTATION.filter((f) => f.id.startsWith('nombre-')),
  ...FAITS_CM1.filter((f) => ['bck-flashcards-10-1000', 'bck-worksheet-10-100'].includes(f.sourceId)),
  ...FAITS_CM2.filter((f) =>
    [
      'heure-o-clock',
      'heure-quarter-past',
      'heure-half-past',
      'heure-quarter-to',
      'heure-cinq-minutes',
      'heure-to',
      'date-ordinal-chant',
      'date-ordinal-ecrit',
      'date-second',
      'halloween-date',
      'halloween-coutumes',
      'bonfire-date',
      'bonfire-feux',
      'christmas-date',
      'christmas-cadeaux',
      'pancake-date',
      'pancake-crepes',
    ].includes(f.id),
  ),
];

export const FAITS: readonly Fait[] = [
  fait(
    'programme-comprendre',
    PROG,
    'L’élève s’entraine à écouter attentivement pour comprendre d’abord le sens général, en repérant des mots clés et des informations simples pour les mettre en lien.',
    'Comprendre un message : le sens général, des mots-clés, des informations simples reliées entre elles.',
  ),
  fait(
    'programme-formulaire',
    PROG,
    'compléter un formulaire, la légende d’une carte, une liste, etc.',
    'On comprend un message pour compléter un formulaire ou une liste.',
  ),
  fait(
    'programme-titre',
    PROG,
    'Il peut comprendre et relier à un titre ou à un thème des expressions isolées dans des énoncés très simples, courts et concrets à propos de sujets familiers et quotidiens',
    '(A1+) Relier un énoncé court à un titre ou à un thème.',
  ),
  fait(
    'programme-etapes',
    PROG,
    'indiquer une chronologie : first, then, finally',
    'first, then et finally indiquent la chronologie.',
  ),
  fait(
    'programme-annonce',
    PROG,
    'The carnival starts at 2pm outside the city hall. Entry costs 5 euros but it’s free for children. It finishes at 5pm.',
    'Relever le lieu, l’horaire et le prix d’une annonce.',
  ),
  fait('programme-compter', PROG, 'A1 jusque 100.', 'Compter jusqu’à 100 est au programme.'),
  fait(
    'programme-ordinaux',
    PROG,
    'A1+ connaitre certains nombres ordinaux (the 21st century, the fifth, etc.).',
    '(A1+) Certains nombres ordinaux : the fifth, the 21st.',
  ),
  fait(
    'programme-heure',
    PROG,
    'A1 les heures entières, demi-heures et quarts d’heure.',
    'L’heure : heures entières, demies et quarts.',
  ),
  fait(
    'programme-dates',
    PROG,
    'Exprimer les dates : indiquer la date du jour en utilisant les ordinaux, (A1+) dire l’année : 1989, 2024, etc.',
    'La date se dit avec un ordinal ; (A1+) dire l’année.',
  ),
  fait(
    'programme-heure-minutes',
    PROG,
    'five past one, twenty to three',
    '(A1+) Heures avec des minutes : five past one, twenty to three.',
  ),
  fait(
    'programme-axes',
    PROG,
    'Les cinq axes culturels doivent obligatoirement être traités dans l’année.',
    'Les cinq axes culturels sont tous au programme de 6e.',
  ),
  fait(
    'programme-highlands',
    PROG,
    'Les Highlands en Écosse',
    'Les Highlands sont en Écosse (axe « Pays et paysages »).',
  ),
  fait(
    'programme-mississippi',
    PROG,
    'À la découverte du fleuve Mississippi',
    'Le Mississippi est un fleuve (axe « Pays et paysages »).',
  ),
  fait(
    'programme-kenya',
    PROG,
    'I want to go to Nairobi National Park in Kenya. My dream is to see black rhinos and giraffes in the wild.',
    'Au Kenya, le parc national de Nairobi permet de voir des rhinocéros noirs et des girafes.',
  ),
  fait(
    'programme-harry',
    PROG,
    'Harry Potter is a famous British wizard. He is eleven years old. He has short black hair and round glasses. He is a pupil of Hogwarts.',
    'Harry Potter, sorcier britannique, est élève à Hogwarts (Poudlard).',
  ),
  fait(
    'programme-finn',
    PROG,
    'Finn McCool is a wise giant and a popular hero from Ireland.',
    'Finn McCool est un géant, héros populaire d’Irlande.',
  ),
  fait(
    'programme-finn-chaussee',
    PROG,
    'he builds the Giant’s Causeway to go to Scotland.',
    'Dans la légende, Finn McCool construit la Chaussée des Géants pour aller en Écosse.',
  ),
  fait(
    'programme-seuss',
    PROG,
    'L’univers poétique et farfelu du Dr. Seuss',
    'L’univers du Dr. Seuss est un objet d’étude (axe « Imaginaire, contes et légendes »).',
  ),
  fait(
    'programme-grinch',
    PROG,
    'The Grinch can’t stand Christmas. He hates Christmas dinner and Christmas carols.',
    'Le Grinch déteste Noël.',
  ),
  fait(
    'patrick-date',
    PATRICK,
    "Saint Patrick's Day is a national Irish holiday that is celebrated on 17 March every year.",
    'Saint Patrick’s Day, fête nationale irlandaise, a lieu le 17 mars.',
  ),
  fait(
    'patrick-fete',
    PATRICK,
    'parades, Irish dancing, Irish traditional music, and everyone dressed in green.',
    'Pour Saint Patrick’s Day : défilés, danse et musique irlandaises, vêtements verts.',
  ),
  fait('patrick-dublin', PATRICK, 'Dublin, the capital of Ireland.', 'Dublin est la capitale de l’Irlande.'),
  fait(
    'patrick-trefle',
    PATRICK,
    'many Irish people wear a shamrock on their clothing, as it is the iconic symbol of Ireland.',
    'Le trèfle (shamrock) est un symbole de l’Irlande.',
  ),
  fait(
    'thanksgiving-americain',
    THANKS,
    'Thanksgiving has been an American tradition since 1863',
    'Thanksgiving est une tradition américaine.',
  ),
  fait('thanksgiving-novembre', THANKS, 'Thursday of November', 'Thanksgiving a lieu un jeudi de novembre.'),
  fait(
    'thanksgiving-dinde',
    THANKS,
    'Turkey is traditionally eaten on Thanksgiving',
    'On mange traditionnellement de la dinde à Thanksgiving.',
  ),
  ...REPRIS,
];
