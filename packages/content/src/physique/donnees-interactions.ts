/**
 * Faits du chapitre « Mouvement et interactions » (4e). Chaque fait cite son identifiant de source (registre
 * `sources.ts`) et la citation exacte : programmes du cycle 4 et de seconde (physique-chimie), Dictionnaire de
 * l'Académie française, Trésor de la langue française informatisé et résumé de la brochure sur le SI (BIPM). Les
 * situations et les valeurs des exercices (distances, durées, forces, échelles) sont inventées : ce ne sont pas
 * des faits. La relation P = m × g et la gravitation sont réservées au lot de 3e.
 */
import { PROGRAMME, referencesDe, type Fait } from './donnees-matiere.ts';

const fait = (id: string, source: string, citation: string): Fait => ({ id, source, citation });
const prog = (id: string, citation: string) => fait(id, PROGRAMME, citation);
const SECONDE = 'seconde-pc-2019';

export const FAITS_INTERACTIONS: readonly Fait[] = [
  // Vitesse.
  prog('vitesse-caracteres', 'Vitesse : direction, sens et valeur.'),
  prog('relation', 'Utiliser la relation liant vitesse, distance et durée dans le cas d’un mouvement uniforme.'),
  prog(
    'variation',
    'Mouvements uniformes et mouvements dont la vitesse varie au cours du temps en direction ou en valeur.',
  ),
  fait(
    'direction',
    'academie-direction',
    'Droite suivant laquelle se déplace ou s’oriente un corps, s’exerce une force.',
  ),
  fait(
    'sens',
    'academie-sens',
    'Chacun des deux trajets, d’un point A à un point B, ou d’un point B à un point A, que l’on peut prendre comme référence pour caractériser une droite, un cercle, etc. auxquels ces deux points appartiennent.',
  ),
  fait('metre-par-seconde', 'academie-metre', 'Mètre par seconde, unité de vitesse (symb. m/s).'),
  fait('kilometre-par-heure', 'academie-kilometre', 'unité de mesure de la vitesse d’un mobile (symb. km/h)'),
  fait('heure', 'bipm-si-resume', '1 h = 3600 s'),
  // Interactions.
  prog('contact-distance', 'Action de contact et action à distance.'),
  prog('identifier', 'Identifier les actions mises en jeu (de contact ou à distance) et les modéliser par des forces.'),
  prog('interaction-force', 'Associer la notion d’interaction à la notion de force.'),
  fait('interaction', 'academie-interaction', 'Action réciproque de deux ou plusieurs corps.'),
  fait('contact', 'academie-contact', 'Action ou état de deux corps qui se touchent.'),
  fait('a-distance', 'academie-distance', 'À distance, sans contact ni proximité physique.'),
  fait('gravitation', 'academie-action', 'La gravitation est une action à distance.'),
  fait('poids', 'academie-poids', 'Force d’attraction gravitationnelle exercée par la Terre sur un corps'),
  fait('aimant', 'cnrtl-aimant', 'qui attire à elle, à plusieurs pouces de distance, des particules de fer'),
  prog(
    'diagramme',
    'L’étude mécanique d’un système peut être l’occasion d’utiliser les diagrammes « objet-interaction ».',
  ),
  fait('suspente', 'cnrtl-suspente', 'Chacune des cordes qui relient la voilure d’un parachute au harnais.'),
  // Forces.
  prog(
    'modeliser-force',
    'Modéliser une action exercée sur un objet par une force caractérisée par un point d’application, une direction, un sens et une valeur',
  ),
  prog('force-caracteres', 'Force : direction, sens et valeur.'),
  fait('representer', SECONDE, 'Représenter une force par un vecteur ayant une norme, une direction, un sens.'),
  fait('vecteur', 'cnrtl-vecteur', 'Segment de droite orienté.'),
  fait('vecteur-lie', 'cnrtl-vecteur', 'Vecteur dont l’origine est fixe.'),
  fait(
    'newton',
    'academie-newton',
    'Unité du Système international correspondant à la force qui communique à une masse d’un kilogramme une accélération d’un mètre par seconde carrée (symb. N).',
  ),
  fait('dynamometre', 'academie-dynamometre', 'Appareil destiné à mesurer l’intensité d’une force ou d’un couple.'),
  // Mouvement et force.
  fait(
    'force-effets',
    'academie-force',
    'Toute cause dont l’action provoque la déformation d’un corps ou en modifie le mouvement',
  ),
  fait(
    'equilibre',
    'academie-equilibre',
    'État de repos d’un corps ou d’un système soumis à l’action de forces qui s’annulent.',
  ),
  fait('faire-equilibre', 'academie-equilibre', 'Faire équilibre, opposer à une force une force égale.'),
  prog('equilibre-programme', 'Expérimenter des situations d’équilibre statique (balance, ressort, muscles).'),
  fait(
    'variation-force',
    SECONDE,
    'Relier la variation entre deux instants voisins du vecteur vitesse d’un système modélisé par un point matériel à l’existence d’actions extérieures modélisées par des forces',
  ),
];

export const referencesInteractions = referencesDe(FAITS_INTERACTIONS);
