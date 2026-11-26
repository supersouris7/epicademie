/**
 * Faits du chapitre « La matière » (6e, lot st-6e-01). Chaque fait cite son identifiant de source (registre
 * `sources.ts`) et la citation exacte : programme du cycle 3 (colonnes « fin de cours moyen » et « fin de sixième »),
 * programme du cycle 4 pour les unités de volume, Trésor de la langue française informatisé (CNRTL), Dictionnaire de
 * l'Académie française, ministère chargé de la transition écologique et Agence européenne des produits chimiques (ECHA).
 * Les valeurs numériques des exercices (solides A, B, liquides X, Y, températures d'un corps A, masses, volumes)
 * sont des données inventées, annoncées comme données de l'exercice : ce ne sont pas des faits.
 */
import type { Fait } from './donnees.ts';

const PROGRAMME = 'cycle3-2020';

const fait = (id: string, source: string, citation: string): Fait => ({ id, source, citation });
const prog = (id: string, citation: string) => fait(id, PROGRAMME, citation);
const tlfi = (id: string, mot: string, citation: string) => fait(id, `cnrtl-${mot}`, citation);
const echa = (id: string, citation: string) => fait(id, 'echa-pictogrammes', citation);

export const FAITS_MATIERE: readonly Fait[] = [
  // États et changements d'état.
  prog(
    'etats',
    'Différencier les états physiques solide (forme et volume propres), liquide (volume propre et absence de forme propre) et gazeux (ni forme propre ni volume propre).',
  ),
  prog('reversibles', 'Observer des changements d’état physique et leur réversibilité.'),
  prog('temperatures', 'Mesurer des températures de changement d’état.'),
  prog(
    'paliers',
    'Relever l’évolution de la température au cours du temps lors du refroidissement ou de l’échauffement d’un corps et identifier les éventuels paliers de température lors des changements d’état.',
  ),
  tlfi('fusion', 'fusion', 'Passage d’un corps solide à l’état liquide sous l’effet de la chaleur.'),
  tlfi('solidification', 'solidification', 'Passage d’un corps de l’état liquide à l’état solide.'),
  tlfi(
    'vaporisation',
    'vaporisation',
    'Opération par laquelle une substance passe de l’état liquide ou solide à l’état gazeux, sous l’effet de la chaleur',
  ),
  tlfi('liquefaction', 'liquefaction', '[À propos d’un gaz] Passage à l’état liquide'),
  tlfi('evaporation', 'evaporation', 'Passage progressif de l’eau à l’état gazeux à partir de la surface libre'),
  tlfi(
    'ebullition',
    'ebullition',
    'Phénomène accompagnant le passage d’un corps de l’état liquide à l’état gazeux et qui consiste en la formation dans la masse du liquide de bulles de vapeur qui viennent crever à la surface.',
  ),
  tlfi('eau-reperes', 'centigrade', 'zéro étant la température de la glace fondante et cent celle de l’eau bouillante'),
  // Masse et volume.
  prog(
    'vocabulaire',
    'Décrire un échantillon de matière à l’aide du vocabulaire scientifique et des grandeurs physiques : masse, volume.',
  ),
  prog(
    'balance',
    'Mesurer la masse d’un solide ou d’un liquide à l’aide d’une balance, en tarant la balance le cas échéant.',
  ),
  prog('deplacement', 'Mesurer le volume d’un liquide et mesurer celui d’un solide par déplacement de liquide.'),
  prog('volume-gaz', 'Mesurer un volume de gaz par déplacement de liquide.'),
  prog('conversions', 'Effectuer des conversions d’unités de masse et de volume.'),
  prog('meme-volume', 'Comparer et mesurer les masses de corps différents, mais de même volume et réciproquement.'),
  prog('proportionnalite', 'Exploiter la relation de proportionnalité entre masse et volume d’un corps homogène.'),
  prog(
    'position-liquides',
    'Mettre en évidence expérimentalement un critère pour prévoir la position respective de deux couches liquides non miscibles superposées (comparaison de leurs masses pour un même volume).',
  ),
  fait('litre', 'cycle4-2020', 'Correspondance entre unités de volume et de contenance (1 L = 1 dm3, 1 000 L = 1 m3).'),
  fait('kilo', 'si-prefixes-bipm', 'kilo | k | 10³'),
  fait('milli', 'si-prefixes-bipm', 'milli | m | 10⁻³'),
  tlfi('tonne', 'tonne', 'Unité de mesure de masse valant 1 000 kilogrammes (symb. t).'),
  tlfi('quintal', 'quintal', 'Poids de cent kilogrammes (symb. q).'),
  tlfi('surnager', 'surnager', 'Rester à la surface d’un liquide plus dense.'),
  // Mélanges : liquides et air.
  prog('separation-liquides', 'Mettre en œuvre une technique de séparation de liquides non miscibles.'),
  tlfi(
    'decanter',
    'decanter',
    'Le séparer des matières qu’il contient en suspension et qui se déposent au fond du récipient. Ampoule à décanter',
  ),
  tlfi('miscible', 'miscible', 'Qui peut se mélanger à un autre corps de façon homogène.'),
  tlfi('homogene', 'homogene', 'Dont la composition uniforme ne permet pas de distinguer les constituants.'),
  tlfi(
    'melange',
    'melange',
    'Association de plusieurs corps où les constituants gardent leurs propriétés spécifiques et sans qu’il y ait combinaison de leurs molécules.',
  ),
  prog(
    'air-programme',
    'Rechercher et exploiter des informations relatives à la composition de l’air et citer des gaz qui contribuent à l’effet de serre.',
  ),
  fait(
    'air-composition',
    'academie-air',
    'L’air sec contient 78 % d’azote, 21 % d’oxygène, 1 % d’argon et de gaz rares.',
  ),
  fait(
    'air-vapeur',
    'academie-air',
    'L’air atmosphérique contient toujours de la vapeur d’eau et du dioxyde de carbone ou gaz carbonique.',
  ),
  fait(
    'serre-naturels',
    'ecologie-effet-de-serre',
    'Certains gaz à effet de serre sont naturellement présents dans l’air (vapeur d’eau, dioxyde de carbone).',
  ),
  fait(
    'serre-methane',
    'ecologie-effet-de-serre',
    'Le méthane (CH4) : les élevages des ruminants, les rizières inondées, les décharges d’ordures et les exploitations pétrolières et gazières constituent les principales sources de méthane induites par les activités humaines.',
  ),
  // Dissolution, saturation, conservation de la masse.
  prog(
    'dissoudre',
    'Observer que certains solides peuvent se dissoudre dans l’eau et qu’il est possible de les récupérer par évaporation.',
  ),
  prog(
    'conservation',
    'Mettre en évidence expérimentalement que la masse totale se conserve lors du mélange d’un solide dans un liquide.',
  ),
  prog(
    'saturation',
    'Observer le phénomène de saturation lors du mélange d’un solide dans l’eau et en rendre compte quantitativement.',
  ),
  tlfi('soluble', 'soluble', 'Qui peut se dissoudre dans un solvant approprié'),
  tlfi('insoluble', 'insoluble', 'Qui ne peut être dissous, solubilisé.'),
  tlfi('solvant', 'solvant', 'Substance le plus souvent liquide qui a la propriété de dissoudre une autre substance.'),
  tlfi('solute', 'solute', 'Substance dissoute dans un solvant.'),
  tlfi(
    'saturee',
    'sature',
    'Qui renferme, à une température et sous une pression données, le poids maximum d’une substance pouvant y être dissoute.',
  ),
  // Transformations chimiques et sécurité.
  prog(
    'transformation-programme',
    'Réaliser un mélange pour lequel les changements observés peuvent être interprétés par une transformation chimique (changement de couleur, production d’un gaz, etc.).',
  ),
  tlfi(
    'transformation-chimique',
    'transformation',
    'Modification d’une substance, impliquant un changement dans sa composition chimique',
  ),
  tlfi(
    'transformation-physique',
    'transformation',
    'Tout changement dans un corps ou une substance qui n’implique pas de modification de sa composition chimique',
  ),
  tlfi(
    'effervescence',
    'effervescence',
    'Phénomène accompagnant la mise en contact de certaines substances, qui consiste en un dégagement rapide de bulles gazeuses à travers un liquide.',
  ),
  tlfi(
    'rouille',
    'rouille',
    'Produit de corrosion (hydroxyde de fer) de couleur brun orangé qui se forme sur un métal ferreux exposé à l’air humide.',
  ),
  tlfi(
    'combustion',
    'combustion',
    'Phénomène résultant de la combinaison d’un corps avec l’oxygène de l’air (ou celui contenu dans un produit chimique) et s’accompagnant d’un dégagement de chaleur avec ou sans flammes.',
  ),
  prog(
    'menagers',
    'Rechercher et exploiter des informations sur les contraintes de sécurité relatives à la manipulation des produits ménagers et sur les conséquences de ces produits sur l’environnement.',
  ),
  prog(
    'pictogrammes-programme',
    'Associer les pictogrammes de sécurité visibles dans le laboratoire de chimie aux dangers et aux risques qui leur correspondent.',
  ),
  echa(
    'picto-definition',
    'Un pictogramme de danger est une image apposée sur une étiquette qui comprend un symbole de mise en garde et des couleurs spécifiques destinés à fournir des informations sur l’atteinte qu’une substance ou un mélange particulier peut porter à la santé humaine ou à l’environnement.',
  ),
  echa('picto-flamme', 'Symbol: Flame Que signifie ce pictogramme? Gaz extrêmement inflammable. Gaz inflammable.'),
  echa(
    'picto-comburant',
    'Symbol: Flame over circle Que signifie ce pictogramme? Peut provoquer ou aggraver un incendie; comburant.',
  ),
  echa(
    'picto-corrosion',
    'Symbol: Corrosion Que signifie ce pictogramme? Peut être corrosif pour les métaux. Provoque des brûlures de la peau et des lésions oculaires graves.',
  ),
  echa(
    'picto-toxique',
    'Symbol: Skulls and Crossbones Que signifie ce pictogramme? Mortel en cas d’ingestion. Mortel par contact cutané. Mortel par inhalation.',
  ),
  echa(
    'picto-exclamation',
    'Provoque une sévère irritation des yeux. Provoque une irritation cutanée. Nocif en cas d’ingestion.',
  ),
  echa(
    'picto-environnement',
    'Symbol: Environment Que signifie ce pictogramme? Très toxique pour les organismes aquatiques, entraîne des effets néfastes à long terme.',
  ),
  echa('picto-explosif', 'Symbol: Exploding bomb Que signifie ce pictogramme? Explosif instable.'),
  echa(
    'conseil-flamme',
    'Tenir à l’écart de la chaleur/des étincelles/des flammes nues/des surfaces chaudes. – Ne pas fumer.',
  ),
  echa('conseil-corrosion', 'Conserver uniquement dans le récipient d’origine.'),
  echa('conseil-environnement', 'Éviter le rejet dans l’environnement.'),
  echa('conseil-toxique', 'Ne pas manger, boire ou fumer en manipulant ce produit.'),
];

/** Référence et identifiants de sources d'une notion, à partir des faits qu'elle utilise. */
export function references(...ids: readonly string[]) {
  const faits = ids.map((id) => {
    const f = FAITS_MATIERE.find((x) => x.id === id);
    if (!f) throw new Error(`Fait inconnu : ${id}`);
    return f;
  });
  return {
    source: `Programme du cycle 3, 6e (BOEN n° 31 du 30 juillet 2020 et n° 25 du 22 juin 2023) et textes cités : ${faits.map((f) => `« ${f.citation} »`).join(' ; ')}.`,
    sources: [...new Set([PROGRAMME, ...faits.map((f) => f.source)])],
  };
}
