import { PROGRAMME, type Fait } from './donnees.ts';

/**
 * Faits du chapitre « Chaînes d'énergie et d'information » (technologie 4e). Chaque fait cite son identifiant de source
 * et la citation exacte du texte officiel. Les systèmes des exercices illustrent ces faits : ils n'en sont pas.
 */
export const FAITS_CHAINES: readonly Fait[] = [
  // ——— Programme ———
  {
    id: 'programme-4e-constituants',
    source: PROGRAMME,
    citation:
      'les élèves explorent et étudient les composants et les solutions techniques qui constituent les chaînes d’énergie et d’information',
  },
  {
    id: 'programme-4e-flux',
    source: PROGRAMME,
    citation: 'Les flux d’information, d’énergie et de matière sont abordés et caractérisés',
  },
  {
    id: 'programme-formes',
    source: PROGRAMME,
    citation: 'Les différentes formes d’énergie : électrique, cinétique, potentielle, thermique, lumineuse',
  },
  {
    id: 'programme-conversions',
    source: PROGRAMME,
    citation:
      'Les conversions d’énergie des constituants suivants : moteur électrique, lampe, radiateur, génératrice, vérin',
  },
  {
    id: 'programme-mecanismes',
    source: PROGRAMME,
    citation: 'Les mécanismes de transmission et de transformation de mouvements (engrenages, courroies, chaînes)',
  },
  // ——— Chaîne d'énergie ———
  {
    id: 'energie-definition',
    source: 'eduscol-sti-chaine-energie',
    citation:
      'La chaîne d’énergie est la partie du système technique qui permet de réaliser une action à partir de l’énergie qu’il reçoit.',
  },
  {
    id: 'energie-alimenter',
    source: 'eduscol-sti-chaine-energie',
    citation: 'Alimenter pour fournir l’énergie au système',
  },
  {
    id: 'energie-distribuer',
    source: 'eduscol-sti-chaine-energie',
    citation: 'Distribuer pour moduler, autoriser ou non la circulation de l’énergie',
  },
  {
    id: 'energie-convertir',
    source: 'eduscol-sti-chaine-energie',
    citation: 'Convertir pour transformer l’énergie en une autre énergie utilisable par le système',
  },
  {
    id: 'energie-transmettre',
    source: 'eduscol-sti-chaine-energie',
    citation: 'Transmettre (pour faire circuler l’énergie d’un composant à un autre)',
  },
  {
    id: 'energie-ordre',
    source: 'eduscol-sti-chaine-energie',
    citation: 'L’ordre des blocs fonctionnels de la chaine d’énergie dépend de l’ordre des composants du système',
  },
  {
    id: 'moteur-conversion',
    source: 'eduscol-sti-chaine-energie',
    citation: 'convertir l’énergie électrique en énergie mécanique de rotation',
  },
  {
    id: 'batterie',
    source: 'eduscol-sti-alimenter-distribuer',
    citation: 'A la différence d’une pile, la batterie peut être rechargée en électricité et utilisée plusieurs fois.',
  },
  {
    id: 'interrupteur',
    source: 'eduscol-sti-alimenter-distribuer',
    citation:
      'L’interrupteur est un dispositif à deux positions manœuvré manuellement pour ouvrir - fermer le circuit électrique.',
  },
  {
    id: 'relais',
    source: 'eduscol-sti-alimenter-distribuer',
    citation:
      'Le relais est un composant électromécanique qui distribue ou pas l’électricité en fonction de l’ordre reçu de la chaîne d’information.',
  },
  { id: 'lampe-conversion', source: 'eduscol-sti-formes-energie', citation: "en énergie lumineuse ? L'ampoule" },
  {
    id: 'thermique',
    source: 'eduscol-sti-formes-energie',
    citation: "La chaleur est une forme d'énergie qu'on appelle énergie thermique.",
  },
  {
    id: 'transmission',
    source: 'eduscol-sti-formes-energie',
    citation:
      "Ces 3 mécanismes peuvent transmettre l'énergie cinétique d'un endroit à un autre de l'objet ou du système.",
  },
  {
    id: 'trottinette-moteur',
    source: 'eduscol-sti-trottinette',
    citation: "C'est le moteur qui transforme l'énergie électrique en énergie cinétique (mouvement).",
  },
  {
    id: 'trottinette-courroie',
    source: 'eduscol-sti-trottinette',
    citation: "L'énergie du moteur est transmise à la roue arrière grâce à la courroie et aux poulies.",
  },
  {
    id: 'radiateur',
    source: 'academie-radiateur',
    citation: 'Appareil de chauffage qui diffuse la chaleur à l’air ambiant.',
  },
  {
    id: 'generatrice',
    source: 'academie-generatrice',
    citation: 'un appareil transformant une énergie quelconque en électricité',
  },
  {
    id: 'verin-translation',
    source: 'eduscol-sti-actionneurs',
    citation: 'convertir une énergie électrique en énergie mécanique de translation',
  },
  // ——— Chaîne d'information ———
  {
    id: 'information-definition',
    source: 'eduscol-sti-chaine-information',
    citation:
      'La chaîne d’information est la partie du système technique qui capte des données issues de l’utilisateur ou de l’environnement extérieur.',
  },
  {
    id: 'information-acquerir',
    source: 'eduscol-sti-chaine-information',
    citation: 'Fonction qui permet de prélever des informations à l’aide de capteurs.',
  },
  {
    id: 'information-traiter',
    source: 'eduscol-sti-chaine-information',
    citation: 'C’est la partie commande composée d’un microcontrôleur.',
  },
  {
    id: 'information-communiquer',
    source: 'eduscol-sti-chaine-information',
    citation: 'Cette fonction assure l’interface entre la partie commande, l’utilisateur, et la chaîne d’énergie',
  },
  {
    id: 'capteurs',
    source: 'eduscol-sti-capteurs-ihm',
    citation: 'Les capteurs sont des instruments qui mesurent différentes grandeurs physiques',
  },
  {
    id: 'microcontroleur',
    source: 'eduscol-sti-capteurs-ihm',
    citation:
      'Le microcontrôleur est un composant électronique programmable qui traite les informations provenant des capteurs',
  },
  {
    id: 'ihm',
    source: 'eduscol-sti-capteurs-ihm',
    citation: 'Un écran LCD affiche des informations',
  },
];
