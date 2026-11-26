/**
 * Faits du chapitre « Électricité » (4e). Chaque fait cite son identifiant de source (registre `sources.ts`) et la
 * citation exacte : programmes de physique-chimie du cycle 4 (en vigueur), de seconde et du collège de 2008 (antérieur,
 * cité pour l'énoncé des lois), fiche Éduscol « Électricité », résumé de la brochure sur le SI (BIPM), Dictionnaire de
 * l'Académie française et Trésor de la langue française informatisé. Les montages, les mesures et les valeurs des
 * exercices sont inventés : ce ne sont pas des faits. La puissance et l'énergie électriques sont réservées à la 3e.
 */
import { PROGRAMME, referencesDe, type Fait } from './donnees-matiere.ts';

const fait = (id: string, source: string, citation: string): Fait => ({ id, source, citation });
const prog = (id: string, citation: string) => fait(id, PROGRAMME, citation);
const COLLEGE = 'college-pc-2008';
const FICHE = 'eduscol-electricite-lois';
const BIPM = 'bipm-si-resume';

export const FAITS_ELECTRICITE: readonly Fait[] = [
  // Programme en vigueur.
  prog('exploiter', 'Exploiter les lois de l’électricité.'),
  prog('dipoles', 'Dipôles en série, dipôles en dérivation.'),
  prog(
    'serie-programme',
    'L’intensité du courant électrique est la même en tout point d’un circuit qui ne compte que des dipôles en série.',
  ),
  prog('additivite-tensions', 'Loi d’additivité des tensions (circuit à une seule maille).'),
  prog('additivite-intensites', 'Loi d’additivité des intensités (circuit à deux mailles).'),
  prog('ohm-programme', 'Relation tension-courant : loi d’Ohm.'),
  prog('unicite-programme', 'Loi d’unicité des tensions.'),
  prog('securite', 'Mettre en relation les lois de l’électricité et les règles de sécurité dans ce domaine.'),
  // Tension.
  fait(
    'tension',
    'cnrtl-tension',
    'Différence de potentiel existant entre les deux pôles d’un ensemble et se mesurant en volts',
  ),
  fait('volt', BIPM, 'différence de potentiel électrique volt V W/A'),
  fait(
    'voltmetre',
    'cnrtl-voltmetre',
    'servant à mesurer la différence de potentiel entre deux points d’un circuit électrique',
  ),
  fait(
    'voltmetre-derivation',
    COLLEGE,
    'La tension électrique aux bornes d’un dipôle se mesure avec un voltmètre branché en dérivation à ses bornes.',
  ),
  fait(
    'voltmetre-bornes',
    FICHE,
    'Pour qu’il indique une valeur positive le courant doit entrer dans l’appareil par la borne V et en sortir par la borne COM.',
  ),
  fait(
    'tension-sans-courant',
    COLLEGE,
    'Une tension peut exister entre deux points d’une portion de circuit non parcourue par un courant.',
  ),
  fait(
    'fil-sans-tension',
    COLLEGE,
    'Certains dipôles (fil, interrupteur fermé) peuvent être parcourus par un courant sans tension notable entre leurs bornes.',
  ),
  fait(
    'nominale',
    COLLEGE,
    'Pour fonctionner normalement une lampe, un moteur, doit avoir à ses bornes une tension proche de sa tension nominale.',
  ),
  fait('surtension', 'cnrtl-surtension', 'Tension anormalement élevée dans un dispositif électrique'),
  fait('sous-tension', 'cnrtl-sous-tension', 'Tension inférieure à la normale.'),
  fait(
    'borne',
    'cnrtl-borne',
    'Partie d’un appareil électrique à laquelle on attache un fil pour le relier à un circuit extérieur.',
  ),
  fait('milli', BIPM, '10 1 déca da 10−1 déci d 10 2 hecto h 10−2 centi c 10 3 kilo k 10−3 milli m'),
  // Intensité.
  fait(
    'intensite',
    'cnrtl-intensite',
    'Quantité d’électricité traversant, par seconde, un milieu conducteur donné et exprimée en ampères.',
  ),
  fait('ampere', 'academie-ampere', 'Unité de mesure de l’intensité du courant électrique (symb. A).'),
  fait('amperemetre', 'academie-amperemetre', 'Appareil mesurant l’intensité d’un courant électrique.'),
  fait(
    'amperemetre-serie',
    COLLEGE,
    'L’intensité d’un courant électrique se mesure avec un ampèremètre branché en série.',
  ),
  fait(
    'amperemetre-bornes',
    FICHE,
    'Pour qu’il indique une valeur positive le courant doit entrer dans l’appareil par la borne A et en sortir par la borne COM.',
  ),
  fait(
    'ordre-dipoles',
    COLLEGE,
    'L’intensité du courant dans un circuit série est indépendante de l’ordre des dipôles.',
  ),
  fait(
    'limite-fil',
    COLLEGE,
    'L’intensité du courant électrique qui parcourt un fil conducteur ne doit pas dépasser une valeur déterminée par un critère de sécurité.',
  ),
  fait(
    'court-circuit',
    'cnrtl-court-circuit',
    'une augmentation de l’intensité du courant et une élévation dangereuse de la température des conducteurs',
  ),
  fait(
    'circuit-ouvert',
    'cnrtl-circuit',
    'Circuit dans lequel une interruption dans l’un des éléments empêche le passage du courant',
  ),
  // Lois des circuits.
  fait('noeud', 'academie-noeud', 'Point d’un circuit auquel plusieurs conducteurs sont reliés.'),
  fait('maille', 'cnrtl-maille', 'Parcours fermé formé de branches, dans un réseau électrique.'),
  fait('lois-seconde', 'seconde-pc-2019', 'Loi des nœuds. Loi des mailles.'),
  fait(
    'loi-noeuds',
    FICHE,
    'La somme des intensités des courants qui arrivent à un nœud est égale à la somme des intensités des courants qui en repartent.',
  ),
  fait(
    'loi-mailles',
    FICHE,
    'Dans une maille comportant un générateur, la tension aux bornes du générateur est égale à la somme des tensions aux bornes des récepteurs.',
  ),
  fait('unicite', COLLEGE, 'La tension est la même aux bornes de deux dipôles en dérivation.'),
  // Loi d'Ohm.
  fait(
    'ohm-relation',
    FICHE,
    'Si la tension UR aux bornes d’un dipôle est proportionnelle à l’intensité IR du courant électrique qui le traverse, alors ce dipôle est un conducteur ohmique et sa résistance est donnée par la relation : UR = R × IR.',
  ),
  fait(
    'resistance',
    'academie-resistance',
    'propriété qu’a un corps de s’opposer au passage du courant, produisant ainsi un échauffement ; grandeur, exprimée en ohms, qui caractérise cette propriété.',
  ),
  fait(
    'ohm-unite',
    'academie-ohm',
    'Un ohm mesure la résistance d’un conducteur traversé par un courant d’un ampère lorsqu’une différence de potentiel d’un volt est appliquée à ses extrémités.',
  ),
  fait('ohm-bipm', BIPM, 'résistance électrique ohm Ω V/A'),
  fait(
    'resistance-intensite',
    COLLEGE,
    'plus la « résistance » est grande, plus l’intensité du courant électrique est petite.',
  ),
  fait(
    'ohmmetre',
    FICHE,
    'Un ohmmètre ne doit jamais être utilisé dans un circuit électrique alimenté par un générateur.',
  ),
];

export const referencesElectricite = referencesDe(FAITS_ELECTRICITE);
