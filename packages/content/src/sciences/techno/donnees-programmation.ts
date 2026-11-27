/**
 * Faits du chapitre « Programmer » (technologie 5e). Chaque fait cite son identifiant de source (registre
 * `sources.ts`) et la citation exacte du texte officiel. Les objets, programmes, seuils et durées des exercices
 * illustrent ces faits : ils ne sont pas des faits.
 */
import { PROGRAMME, type Fait } from './donnees.ts';

export const FAITS_PROGRAMMATION: readonly Fait[] = [
  // ——— Algorithme et programme ———
  {
    id: 'programme-traduire-algorithme',
    source: PROGRAMME,
    citation:
      'Comprendre et traduire en un algorithme en langage naturel le programme associé à une fonctionnalité d’un OST',
  },
  {
    id: 'programme-algorithme-probleme',
    source: PROGRAMME,
    citation:
      'concevoir un algorithme en langage naturel répondant au problème posé. Celui-ci est ensuite traduit dans un langage informatique',
  },
  {
    id: 'programme-donnees-programme',
    source: PROGRAMME,
    citation:
      'Identifier les données utilisées et produites par le programme associé à une fonctionnalité d’un OST (à partir d’un programme existant)',
  },
  {
    id: 'algorithme-def',
    source: 'academie-algorithme',
    citation: 'en appliquant dans un ordre précis une suite finie de règles',
  },
  {
    id: 'programme-def',
    source: 'academie-programme',
    citation:
      'Suite d’instructions rédigées dans un langage spécifique, qui commande à un dispositif, à un appareil ou à un système informatique d’exécuter une tâche donnée',
  },
  {
    id: 'instruction-def',
    source: 'academie-instruction',
    citation: 'Consigne formulée dans un langage de programmation, selon un code.',
  },
  // ——— Capteurs et actionneurs ———
  {
    id: 'programme-constituants',
    source: PROGRAMME,
    citation:
      'capteurs (température, présence, distance, etc.), microcontrôleur, composants d’une interface entre l’humain et la machine (IHM) : boutons, afficheurs, etc.',
  },
  {
    id: 'programme-entrees-sorties',
    source: PROGRAMME,
    citation:
      'entrées ou sorties d’un programme (données issues par exemple de capteurs IHM et sorties pouvant être en lien avec un actionneur, fichiers)',
  },
  {
    id: 'programme-chaine-information',
    source: PROGRAMME,
    citation:
      'Identifier des constituants de la chaîne d’information d’un OST (l’organisation de la chaîne d’information étant fournie)',
  },
  {
    id: 'capteur-def',
    source: 'academie-capteur',
    citation:
      'Appareil sensible à un phénomène physique, qu’il transforme en un signal, généralement électrique, transmissible à distance.',
  },
  {
    id: 'capteur-microphone',
    source: 'academie-capteur',
    citation: 'Un microphone est un capteur sensible aux sons, qu’il transforme en vibrations électriques.',
  },
  {
    id: 'actionneur-pneumatique',
    source: 'eduscol-sti-actionneurs',
    citation: 'Cet actionneur pneumatique rotatif converti l’énergie pneumatique en énergie mécanique de rotation',
  },
  {
    id: 'actionneur-verin-electrique',
    source: 'eduscol-sti-actionneurs',
    citation: 'convertir une énergie électrique en énergie mécanique de translation',
  },
  {
    id: 'moteur-def',
    source: 'academie-moteur',
    citation:
      'Appareil qui utilise une source quelconque d’énergie pour produire de l’énergie mécanique, du mouvement.',
  },
  // ——— Séquences, événements, boucles ———
  {
    id: 'programme-instructions',
    source: PROGRAMME,
    citation: 'instruction conditionnelle',
  },
  { id: 'programme-iteratives', source: PROGRAMME, citation: 'instructions itératives' },
  {
    id: 'programme-evenement',
    source: PROGRAMME,
    citation: 'déclenchement d’une séquence d’instructions par un événement',
  },
  {
    id: 'sequence-def',
    source: 'academie-sequence',
    citation:
      'Suite ou enchaînement d’éléments, d’actions, d’opérations qui obéit à un ordre déterminé, à un plan préétabli',
  },
  {
    id: 'boucle-def',
    source: 'academie-boucle',
    citation:
      'Ensemble d’instructions d’un programme dont l’exécution est répétée jusqu’à ce qu’une condition, permettant de passer à la suite de ce programme, se trouve réalisée.',
  },
  // ——— Tester et mettre au point ———
  {
    id: 'programme-analyser-tester',
    source: PROGRAMME,
    citation: 'Analyser un programme simple fourni et tester s’il répond au besoin ou au problème posé',
  },
  {
    id: 'programme-modifier-programme',
    source: PROGRAMME,
    citation: 'Modifier un programme fourni pour répondre au besoin ou à un problème posé',
  },
  {
    id: 'programme-parametres',
    source: PROGRAMME,
    citation: 'Modifier les paramètres d’un programme et identifier ou évaluer ses effets en termes de fonctionnalité',
  },
  {
    id: 'programme-protocole',
    source: PROGRAMME,
    citation: 'Vérifier le comportement et les performances d’un objet technique en suivant un protocole fourni',
  },
  {
    id: 'programme-protocole-tests',
    source: PROGRAMME,
    citation:
      'ce terme englobe l’ensemble des expérimentations, des essais et des mesures que les élèves sont amenés à mettre en œuvre pour valider leurs solutions',
  },
  {
    id: 'programme-comparer',
    source: PROGRAMME,
    citation:
      'comparer les résultats obtenus ou simulés avec des résultats attendus ou des exigences issues d’un cahier des charges',
  },
  {
    id: 'programme-mise-au-point',
    source: PROGRAMME,
    citation: 'Une phase de tests et de mise au point permet d’aboutir à un programme répondant aux besoins spécifiés.',
  },
];
