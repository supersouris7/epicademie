/**
 * Faits du chapitre « Organisation de la matière » (5e). Chaque fait cite son identifiant de source (registre
 * `sources.ts`) et la citation exacte : programme du cycle 4 (physique-chimie), programme du cycle 3 pour la
 * conservation de la masse d'un mélange, et articles du Trésor de la langue française informatisé (CNRTL).
 * Les valeurs numériques des exercices (substances A, B, C…, solubilités, volumes) sont des données inventées,
 * annoncées comme données de l'exercice : ce ne sont pas des faits.
 */
export interface Fait {
  readonly id: string;
  /** Identifiant dans le registre des sources. */
  readonly source: string;
  /** Citation exacte. */
  readonly citation: string;
}

export const PROGRAMME = 'cycle4-2020';
export const PROGRAMME_C3 = 'cycle3-2020';

const fait = (id: string, source: string, citation: string): Fait => ({ id, source, citation });
const prog = (id: string, citation: string) => fait(id, PROGRAMME, citation);
const tlfi = (id: string, mot: string, citation: string) => fait(id, `cnrtl-${mot}`, citation);

export const FAITS: readonly Fait[] = [
  // États et changements d'état.
  prog('etats-programme', 'Caractériser les différents états de la matière (solide, liquide et gaz).'),
  prog('changements-programme', 'Caractériser les différents changements d’état d’un corps pur.'),
  prog('microscopique-programme', 'Interpréter les changements d’état au niveau microscopique.'),
  tlfi(
    'solide',
    'solide',
    'État de la matière dans lequel les molécules sont fortement liées les unes aux autres, et caractérisé à l’échelle macroscopique par un volume et une forme déterminés',
  ),
  tlfi(
    'liquide-etat',
    'liquide',
    'État de la matière présenté par les corps qui n’ont pas de forme propre et dont le volume est invariable',
  ),
  tlfi(
    'liquide-molecules',
    'liquide',
    'Qui coule ou a tendance à couler en raison de la faible cohésion des molécules.',
  ),
  tlfi('gaz', 'gaz', 'expansible et occupant la totalité de l’espace du récipient qui le contient'),
  tlfi('fusion', 'fusion', 'Passage d’un corps solide à l’état liquide sous l’effet de la chaleur.'),
  tlfi('solidification', 'solidification', 'Passage d’un corps de l’état liquide à l’état solide.'),
  tlfi(
    'vaporisation',
    'vaporisation',
    'Opération par laquelle une substance passe de l’état liquide ou solide à l’état gazeux, sous l’effet de la chaleur',
  ),
  tlfi('liquefaction', 'liquefaction', '[À propos d’un gaz] Passage à l’état liquide'),
  tlfi('condensation', 'condensation', 'Passage de l’état gazeux à l’état liquide et, plus rarement, à l’état solide.'),
  tlfi(
    'ebullition',
    'ebullition',
    'Phénomène accompagnant le passage d’un corps de l’état liquide à l’état gazeux et qui consiste en la formation dans la masse du liquide de bulles de vapeur qui viennent crever à la surface.',
  ),
  tlfi('evaporation', 'evaporation', 'Passage progressif de l’eau à l’état gazeux à partir de la surface libre'),
  tlfi(
    'sublimation',
    'sublimation',
    'faire passer un corps directement de l’état solide à l’état gazeux, sans passer par l’état liquide',
  ),
  // Corps purs et mélanges.
  tlfi(
    'corps-pur',
    'pur',
    'Corps dans lequel n’existe aucune matière étrangère décelable par un réactif physique ou chimique.',
  ),
  tlfi(
    'melange',
    'melange',
    'Association de plusieurs corps où les constituants gardent leurs propriétés spécifiques et sans qu’il y ait combinaison de leurs molécules.',
  ),
  tlfi('homogene', 'homogene', 'Dont la composition uniforme ne permet pas de distinguer les constituants.'),
  tlfi('heterogene', 'heterogene', 'Dont les éléments sont de nature différente'),
  tlfi('azote', 'azote', 'qui entre pour environ 4/5 dans la composition de l’air atmosphérique'),
  prog('identifier-corps-purs', 'exploiter la température de changement d’état pour identifier des corps purs.'),
  // Masse volumique.
  tlfi('masse-volumique', 'volumique', 'Masse volumique. Masse de l’unité de volume.'),
  prog(
    'masse-volumique-mesure',
    'Proposer et mettre en œuvre un protocole expérimental pour déterminer une masse volumique d’un liquide ou d’un solide.',
  ),
  prog('masse-volumique-especes', 'Exploiter des mesures de masse volumique pour différencier des espèces chimiques.'),
  prog('proportionnalite', 'la proportionnalité entre masse et volume pour une substance donnée.'),
  prog(
    'quotient-4e',
    'L’introduction de la grandeur quotient masse volumique se fait progressivement à partir de la classe de 4e.',
  ),
  prog('masse-volumique-temperature', 'La variation de la masse volumique avec la température'),
  fait(
    'volume-deplacement',
    PROGRAMME_C3,
    'Mesurer le volume d’un liquide et mesurer celui d’un solide par déplacement de liquide.',
  ),
  // Solubilité et miscibilité.
  prog('solubilite-programme', 'Estimer expérimentalement une valeur de solubilité dans l’eau.'),
  tlfi('soluble', 'soluble', 'Qui peut se dissoudre dans un solvant approprié'),
  tlfi('insoluble', 'insoluble', 'Qui ne peut être dissous, solubilisé.'),
  tlfi('solvant', 'solvant', 'Substance le plus souvent liquide qui a la propriété de dissoudre une autre substance.'),
  tlfi('solute', 'solute', 'Substance dissoute dans un solvant.'),
  tlfi(
    'saturee',
    'sature',
    'Qui renferme, à une température et sous une pression données, le poids maximum d’une substance pouvant y être dissoute.',
  ),
  tlfi(
    'solubilite',
    'solubilite',
    'Masse nécessaire de substance dissoute dans une masse ou un volume donné de solvant, à une température et une pression déterminées pour arriver à une solution saturée.',
  ),
  tlfi('miscible', 'miscible', 'Qui peut se mélanger à un autre corps de façon homogène.'),
  // Conservation de la masse.
  prog(
    'conservation-changement',
    'la conservation de la masse (mais non conservation du volume) d’une substance lors d’un changement d’état.',
  ),
  fait(
    'conservation-melange',
    PROGRAMME_C3,
    'Mettre en évidence expérimentalement que la masse totale se conserve lors du mélange d’un solide dans un liquide.',
  ),
];

export const getFait = (id: string): Fait => {
  const f = FAITS.find((x) => x.id === id);
  if (!f) throw new Error(`Fait inconnu : ${id}`);
  return f;
};

/** Référence et identifiants de sources d'une notion, à partir des faits qu'elle utilise. */
export const references = (...ids: readonly string[]) => {
  const faits = ids.map(getFait);
  return {
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) et définitions citées : ${faits.map((f) => `« ${f.citation} »`).join(' ; ')}.`,
    sources: [...new Set([PROGRAMME, ...faits.map((f) => f.source)])],
  };
};
