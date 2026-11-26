/**
 * Faits du chapitre « Mouvement » (5e). Chaque fait cite son identifiant de source (registre `sources.ts`) et la
 * citation exacte : programmes des cycles 3 et 4, Trésor de la langue française informatisé (CNRTL) et
 * Dictionnaire de l’Académie française. Les situations et les valeurs des exercices (distances, durées,
 * positions) sont inventées : ce ne sont pas des faits.
 */
import { PROGRAMME, PROGRAMME_C3, referencesDe, type Fait } from './donnees-matiere.ts';

const fait = (id: string, source: string, citation: string): Fait => ({ id, source, citation });
const prog = (id: string, citation: string) => fait(id, PROGRAMME, citation);

export const FAITS_MOUVEMENT: readonly Fait[] = [
  prog('caracteriser', 'Caractériser le mouvement d’un objet.'),
  prog('formes', 'Mouvements rectilignes et circulaires.'),
  prog(
    'planetes',
    'trajectoires des planètes, qu’on peut considérer dans un premier modèle simplifié comme circulaires et parcourues à vitesse constante.',
  ),
  prog('relativite', 'Relativité du mouvement dans des cas simples.'),
  prog(
    'observateur',
    'Comprendre la relativité des mouvements dans des cas simples (train qui démarre le long d’un quai) et appréhender la notion d’observateur immobile ou en mouvement.',
  ),
  prog('vitesse-caracteres', 'Vitesse : direction, sens et valeur.'),
  prog(
    'uniforme-programme',
    'Mouvements uniformes et mouvements dont la vitesse varie au cours du temps en direction ou en valeur.',
  ),
  prog('relation', 'Utiliser la relation liant vitesse, distance et durée dans le cas d’un mouvement uniforme.'),
  fait(
    'point-de-vue',
    PROGRAMME_C3,
    'L’étude du mouvement d’un objet nécessite toujours la mention du point de vue selon lequel ce mouvement est décrit et caractérisé.',
  ),
  fait('trajectoire-definition', 'cnrtl-trajectoire', 'Courbe décrite par le centre de gravité d’un mobile.'),
  fait('rectiligne', 'academie-rectiligne', 'Qui est en ligne droite. Trajectoire, mouvement rectilignes.'),
  fait('circulaire', 'academie-circulaire', 'Qui décrit un cercle.'),
  fait(
    'mouvement-definition',
    'academie-mouvement',
    'Changement de la position d’un corps dans l’espace, considéré en fonction du temps et par rapport à un système de référence.',
  ),
  fait(
    'referentiel-definition',
    'academie-referentiel',
    'ensemble de points immobiles les uns par rapport aux autres qui définit l’espace dans lequel on étudie les mouvements d’un solide',
  ),
  fait('uniforme-definition', 'cnrtl-uniforme', 'soit constante au cours du temps (ex: mouvement uniforme)'),
  fait(
    'circulaire-uniforme',
    'cnrtl-mouvement',
    'Mouvement d’un point matériel qui décrit un cercle avec une vitesse constante',
  ),
  fait('accelere', 'academie-accelere', 'Qui a une vitesse accrue par rapport à la normale.'),
  fait(
    'accelere-mecanique',
    'academie-accelere',
    'Mouvement uniformément accéléré, dont la vitesse s’accroît d’une quantité constante à chaque unité de temps.',
  ),
  fait('ralentir', 'academie-ralentir', 'Rendre plus lent un mouvement, un rythme, un mécanisme, etc.'),
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
  fait(
    'vitesse-definition',
    'cnrtl-vitesse',
    'Espace parcouru par un mobile dans l’unité de temps choisi; rapport entre ces deux éléments.',
  ),
  fait(
    'vitesse-moyenne',
    'academie-moyenne',
    'vitesse moyenne, quotient de la distance parcourue par le temps mis à la parcourir.',
  ),
];

export const referencesMouvement = referencesDe(FAITS_MOUVEMENT);
