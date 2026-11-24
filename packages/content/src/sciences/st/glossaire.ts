import type { SubjectTerm } from '../../types.ts';

/** Glossaire sciences et technologie (CM1 à 6e) : chaque terme en gras d'un mémo y est défini. */
export const GLOSSAIRE: readonly SubjectTerm[] = [
  {
    id: 'st-solide',
    word: 'solide',
    forms: ['solide', 'solides'],
    definition: 'État de la matière où le corps garde sa forme et son volume.',
    example: 'Un caillou reste un caillou, que tu le poses dans un verre ou dans un bol.',
  },
  {
    id: 'st-liquide',
    word: 'liquide',
    forms: ['liquide', 'liquides'],
    definition: 'État de la matière où le corps garde son volume, mais prend la forme de son récipient.',
    example: 'L’eau prend la forme du verre, puis celle de la bouteille.',
  },
  {
    id: 'st-gaz',
    word: 'gaz',
    forms: ['gaz', 'gazeux', 'gazeuse'],
    definition: 'État de la matière où le corps n’a ni forme ni volume propres : il remplit tout l’espace disponible.',
    example: 'L’air d’un ballon remplit tout le ballon.',
  },
  {
    id: 'st-etat-physique',
    word: 'état physique',
    forms: ['état physique', 'états physiques', 'état', 'états'],
    definition: 'La façon dont la matière se présente : solide, liquide ou gaz.',
    example: 'L’eau a trois états physiques : la glace, l’eau et la vapeur.',
  },
  {
    id: 'st-changement-etat',
    word: 'changement d’état',
    forms: ['changement d’état', 'changements d’état'],
    definition: 'Passage d’un état physique à un autre, sans que la matière change de nature.',
    example: 'Un glaçon qui fond passe de l’état solide à l’état liquide : c’est toujours de l’eau.',
  },
  {
    id: 'st-reversible',
    word: 'réversible',
    forms: ['réversible', 'réversibles', 'réversibilité'],
    definition: 'Qui peut se faire dans les deux sens, pour revenir au point de départ.',
    example: 'L’eau gèle en glace, puis la glace fond en eau : le changement d’état est réversible.',
  },
  {
    id: 'st-masse',
    word: 'masse',
    forms: ['masse', 'masses'],
    definition:
      'Ce qui dit combien un corps pèse. Elle se mesure avec une balance, en kilogrammes, grammes ou milligrammes.',
    example: 'Une pomme a une masse d’environ 150 g.',
  },
  {
    id: 'st-balance',
    word: 'balance',
    forms: ['balance', 'balances'],
    definition: 'Instrument qui sert à mesurer la masse d’un corps.',
    example: 'On pose la farine sur la balance pour lire sa masse.',
  },
  {
    id: 'st-tare',
    word: 'tare',
    forms: ['tare', 'tarer', 'tarant', 'tarée'],
    definition: 'Remettre la balance à zéro avec un récipient posé dessus, pour ne peser que ce qu’on y met.',
    example: 'Tu poses un bol, tu appuies sur « tare » : la balance affiche 0 g, puis tu verses le sucre.',
  },
  {
    id: 'st-volume',
    word: 'volume',
    forms: ['volume', 'volumes'],
    definition: 'La place qu’un corps occupe. Il se mesure par exemple en litres ou en millilitres.',
    example: 'Un verre peut contenir 25 cL d’eau : c’est son volume maximal.',
  },
  {
    id: 'st-deplacement',
    word: 'déplacement de liquide',
    forms: ['déplacement de liquide', 'déplacement d’eau'],
    definition:
      'Façon de mesurer le volume d’un solide : on le plonge dans un liquide et on regarde de combien le niveau monte.',
    example: 'Le niveau passe de 100 mL à 130 mL : le caillou a un volume de 30 mL.',
  },
  {
    id: 'st-melange',
    word: 'mélange',
    forms: ['mélange', 'mélanges'],
    definition: 'Ensemble de plusieurs matières réunies ensemble.',
    example: 'Du sable et de l’eau forment un mélange.',
  },
  {
    id: 'st-tamisage',
    word: 'tamisage',
    forms: ['tamisage', 'tamiser', 'tamis'],
    definition:
      'Technique qui sépare des grains de tailles différentes avec un tamis (une passoire à trous très fins).',
    example: 'Dans un tamis, le sable fin passe et les graviers restent.',
  },
  {
    id: 'st-decantation',
    word: 'décantation',
    forms: ['décantation', 'décanter'],
    definition: 'Technique qui laisse un solide tomber au fond d’un liquide au repos, puis on verse le liquide.',
    example: 'La terre d’une eau boueuse tombe au fond du seau.',
  },
  {
    id: 'st-filtration',
    word: 'filtration',
    forms: ['filtration', 'filtrer', 'filtre'],
    definition: 'Technique qui fait passer un mélange dans un filtre : le liquide traverse, le solide reste.',
    example: 'Dans un entonnoir garni de papier filtre, l’eau passe et le sable reste.',
  },
  {
    id: 'st-dissoudre',
    word: 'dissoudre',
    forms: ['dissoudre', 'dissout', 'dissolvent', 'se dissoudre', 'se dissout', 'dissolution'],
    definition: 'Se mélanger complètement à l’eau, au point de ne plus se voir.',
    example: 'Le sucre se dissout dans le thé : on ne le voit plus, mais il est toujours là.',
  },
  {
    id: 'st-evaporation',
    word: 'évaporation',
    forms: ['évaporation', 'évaporer', 's’évapore'],
    definition: 'Passage de l’eau liquide à la vapeur d’eau. Elle permet de récupérer un solide dissous.',
    example: 'Quand l’eau salée s’évapore, le sel reste dans l’assiette.',
  },
];
