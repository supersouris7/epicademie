/**
 * Faits du chapitre « La matière » (CM1). Chaque fait cite son identifiant de source (registre `sources.ts`) et la
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
];
