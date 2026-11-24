/**
 * Faits des chapitres « La matière » et « Mouvement et énergie » (CM1). Chaque fait cite son identifiant de source (registre `sources.ts`) et la
 * citation exacte du texte officiel (programme du cycle 3, Éduscol, domaine « Matière, mouvement, énergie,
 * information »). Les exemples du quotidien (un caillou, une pomme, la buée…) illustrent ces faits : ils ne sont pas des faits.
 */
export interface Fait {
  readonly id: string;
  /** Identifiant dans le registre des sources. */
  readonly source: string;
  /** Citation exacte. */
  readonly citation: string;
}

export const PROGRAMME = 'cycle3-2020';
export const SI = 'si-prefixes-bipm';

export const FAITS: readonly Fait[] = [
  {
    id: 'etats-trois',
    source: PROGRAMME,
    citation:
      'Différencier les états physiques solide (forme et volume propres), liquide (volume propre et absence de forme propre) et gazeux (ni forme propre ni volume propre).',
  },
  {
    id: 'etats-reversibles',
    source: PROGRAMME,
    citation: 'Observer des changements d’état physique et leur réversibilité.',
  },
  {
    id: 'etats-eau',
    source: PROGRAMME,
    citation: 'Identifier les différents états physiques de la matière dans la nature, en particulier ceux de l’eau.',
  },
  {
    id: 'masse-balance',
    source: PROGRAMME,
    citation:
      'Mesurer la masse d’un solide ou d’un liquide à l’aide d’une balance, en tarant la balance le cas échéant.',
  },
  {
    id: 'masse-unites',
    source: PROGRAMME,
    citation:
      'Effectuer des conversions d’unités de masse (en se limitant à des unités usuelles : tonne, quintal, kilogramme, gramme et milligramme).',
  },
  {
    id: 'volume-deplacement',
    source: PROGRAMME,
    citation: 'Mesurer le volume d’un liquide et mesurer celui d’un solide par déplacement de liquide.',
  },
  {
    id: 'si-kilo',
    source: SI,
    citation: 'kilo | k | 10³',
  },
  {
    id: 'si-milli',
    source: SI,
    citation: 'milli | m | 10⁻³',
  },
  {
    id: 'melanges-separer',
    source: PROGRAMME,
    citation:
      'Séparer les constituants d’un mélange de solides ou d’un mélange solide-liquide par tamisage, décantation, filtration.',
  },
  {
    id: 'melanges-dissoudre',
    source: PROGRAMME,
    citation:
      'Observer que certains solides peuvent se dissoudre dans l’eau et qu’il est possible de les récupérer par évaporation.',
  },
  {
    id: 'melanges-sel',
    source: PROGRAMME,
    citation: 'La séparation par évaporation trouve une application immédiate dans la récolte du sel',
  },
  {
    id: 'melanges-masse',
    source: PROGRAMME,
    citation:
      'Mettre en évidence expérimentalement que la masse totale se conserve lors du mélange d’un solide dans un liquide.',
  },
  {
    id: 'energie-ressources',
    source: PROGRAMME,
    citation:
      'Rechercher des informations relatives à différentes ressources en énergie (Soleil, eau, vent, pétrole, bois, charbon, dihydrogène, combustible nucléaire (uranium), etc.)',
  },
  {
    id: 'energie-soleil',
    source: PROGRAMME,
    citation:
      'L’importance de l’énergie reçue du Soleil pour la vie sur Terre et pour les activités humaines est mentionnée.',
  },
  {
    id: 'energie-soleil-lumiere',
    source: PROGRAMME,
    citation: 'la Terre reçoit de l’énergie du Soleil par la lumière qu’il émet',
  },
  {
    id: 'energie-usages',
    source: PROGRAMME,
    citation: '(chauffage, moyens de transport, production d’électricité, etc.)',
  },
  {
    id: 'energie-formes-cm',
    source: PROGRAMME,
    citation:
      'Identifier différentes formes d’énergie : énergie de pesanteur (dépendant de l’altitude sur Terre), énergie cinétique (liée au mouvement) et énergie électrique, par exemple dans le contexte de la production d’électricité par une centrale hydro-électrique ou une éolienne.',
  },
  {
    id: 'energie-chute',
    source: PROGRAMME,
    citation: 'au cours de la chute d’un objet, son énergie de pesanteur est convertie en énergie cinétique',
  },
  {
    id: 'energie-moulin',
    source: PROGRAMME,
    citation:
      'conversion d’énergie potentielle en énergie cinétique dans un dispositif mécanique (moulin à eau par exemple)',
  },
  {
    id: 'energie-lampe',
    source: PROGRAMME,
    citation:
      'transfert d’énergie électrique vers une lampe ou un autre appareil électrique alimentés par une pile électrique',
  },
  {
    id: 'energie-experience',
    source: PROGRAMME,
    citation: 'Réaliser expérimentalement un dispositif de conversion d’énergie.',
  },
  {
    id: 'mouvement-point-de-vue',
    source: PROGRAMME,
    citation:
      'L’étude du mouvement d’un objet nécessite toujours la mention du point de vue selon lequel ce mouvement est décrit et caractérisé.',
  },
  {
    id: 'mouvement-train',
    source: PROGRAMME,
    citation: 'le train se déplace en ligne droite par rapport à une personne sur le quai de la gare',
  },
  {
    id: 'mouvement-toupie',
    source: PROGRAMME,
    citation: 'un point coloré sur une toupie ou un disque décrit un cercle par rapport à l’axe de rotation',
  },
  {
    id: 'mouvement-identifier',
    source: PROGRAMME,
    citation: 'Observer et identifier le mouvement rectiligne ou circulaire d’un objet, en précisant le point de vue.',
  },
  {
    id: 'mouvement-distance',
    source: PROGRAMME,
    citation: 'Mesurer une distance lors du déplacement d’un objet.',
  },
  {
    id: 'mouvement-duree',
    source: PROGRAMME,
    citation: 'Mesurer une durée, comme intervalle entre deux instants, lors du déplacement d’un objet.',
  },
  {
    id: 'mouvement-conversions',
    source: PROGRAMME,
    citation: 'Effectuer des conversions d’unités de distance et de temps.',
  },
];
