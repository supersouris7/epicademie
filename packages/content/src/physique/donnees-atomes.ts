/**
 * Faits du chapitre « Atomes et transformations » (4e). Chaque fait cite son identifiant de source (registre
 * `sources.ts`) et la citation exacte : programme du cycle 4 (physique-chimie), Dictionnaire de l’Académie française
 * Trésor de la langue française informatisé (CNRTL) et ressource Éduscol. Les masses, volumes et nombres de molécules des exercices sont
 * des données de l’exercice (masses choisies dans les proportions des réactions citées), pas des faits à retenir.
 */
import { PROGRAMME, referencesDe, type Fait } from './donnees-matiere.ts';

const fait = (id: string, source: string, citation: string): Fait => ({ id, source, citation });
const prog = (id: string, citation: string) => fait(id, PROGRAMME, citation);

export const FAITS: readonly Fait[] = [
  // Atomes et molécules.
  prog('notions', 'Notions de molécules, atomes, ions.'),
  fait('atome-molecules', 'academie-atome', 'Les molécules sont constituées par des associations d’atomes.'),
  fait(
    'atome-partie',
    'academie-atome',
    'L’atome est la plus petite partie d’un corps simple susceptible d’entrer dans une combinaison chimique.',
  ),
  fait('molecule-association', 'academie-molecule', 'Association d’atomes, assemblés par des liaisons chimiques'),
  fait('molecule-simple', 'academie-molecule', 'Les molécules d’un corps simple sont formées d’atomes semblables.'),
  fait(
    'molecule-eau',
    'academie-molecule',
    'Une molécule d’eau est constituée de deux atomes d’hydrogène et d’un atome d’oxygène.',
  ),
  fait(
    'deux-atomes',
    'cnrtl-molecule',
    's’il existe deux atomes dans la molécule d’oxygène, de chlore, d’hydrogène, de soufre',
  ),
  // Formules et symboles.
  prog('formules-programme', 'Interpréter une formule chimique en termes atomiques.'),
  prog('symboles-programme', 'Associer leurs symboles aux éléments à l’aide de la classification périodique.'),
  prog(
    'tableau-programme',
    'Utilisation du tableau périodique pour retrouver, à partir du nom de l’élément, le symbole et le numéro atomique et réciproquement.',
  ),
  fait(
    'formule-brute',
    'academie-formule',
    'Formule brute ou formule condensée d’un corps, qui indique la nature et le nombre des atomes de chaque molécule.',
  ),
  fait('symbole-carbone', 'academie-carbone', 'symb. C ; n° at. 6'),
  fait('symbole-hydrogene', 'academie-hydrogene', 'symb. H ; n° at. 1'),
  fait('symbole-azote', 'academie-azote', 'symb. N ; n° at. 7'),
  fait('symbole-oxygene', 'academie-oxygene', 'symb. O ; n° at. 8'),
  fait('formule-eau', 'cnrtl-eau', 'de formule chimique H2O'),
  fait('formule-dioxyde', 'academie-dioxyde', 'Dioxyde de carbone, gaz carbonique, de formule CO2'),
  fait('formule-methane', 'academie-methane', 'Hydrocarbure saturé, de formule CH4.'),
  fait('formule-protoxyde', 'cnrtl-azote', 'Protoxyde d’azote de formule N2O.'),
  fait(
    'formule-monoxyde',
    'academie-carbone',
    'Monoxyde ou oxyde de carbone, gaz de formule CO, incolore, inodore, très toxique, qui se dégage lors de la combustion incomplète de nombreux combustibles.',
  ),
  fait('monoxyde-un-atome', 'academie-monoxyde', 'Oxyde dont la molécule ne contient qu’un atome d’oxygène.'),
  // Transformation chimique.
  prog(
    'distinguer',
    'Distinguer transformation chimique et mélange, transformation chimique et transformation physique.',
  ),
  prog('redistribution', 'Interpréter une transformation chimique comme une redistribution des atomes.'),
  prog(
    'equation',
    'Utiliser une équation de réaction chimique fournie pour décrire une transformation chimique observée.',
  ),
  fait(
    'transformation-chimique',
    'cnrtl-transformation',
    'Modification d’une substance, impliquant un changement dans sa composition chimique',
  ),
  fait(
    'reaction',
    'academie-reaction',
    'au cours de laquelle la structure des molécules, des atomes ou des ions se modifie.',
  ),
  fait(
    'reactif',
    'academie-reactif',
    'Chacune des molécules ou chacun des ions qui interviennent dans une réaction chimique.',
  ),
  fait('produit', 'academie-produit', 'Ce qui résulte d’une transformation'),
  fait(
    'melange-sans-combinaison',
    'cnrtl-melange',
    'Association de plusieurs corps où les constituants gardent leurs propriétés spécifiques et sans qu’il y ait combinaison de leurs molécules.',
  ),
  fait(
    'reactifs-consommes',
    'eduscol-ethanol-4e',
    'Au cours d’une transformation chimique, des espèces chimiques sont consommées (les réactifs) et de nouvelles espèces chimiques sont formées (les produits).',
  ),
  fait('conservation-atomes', 'eduscol-ethanol-4e', 'Il y a conservation des atomes.'),
  // Combustions.
  fait(
    'dioxygene-reactif',
    'eduscol-ethanol-4e',
    'Une combustion est un exemple de transformation chimique, dont l’un des réactifs est souvent le dioxygène de l’air.',
  ),
  prog('combustions-programme', 'Combustions dans l’air.'),
  fait(
    'combustion',
    'academie-combustion',
    'Ensemble des phénomènes qui se produisent lorsque l’oxygène ou un autre comburant entre en combinaison avec un ou plusieurs corps en dégageant de la chaleur.',
  ),
  fait(
    'comburant',
    'cnrtl-comburant',
    '(Corps) qui en se combinant avec un autre corps permet la combustion de celui-ci.',
  ),
  fait('combustible', 'academie-combustible', 'Matière dont la combustion produit de l’énergie calorifique.'),
  fait('air-oxygene', 'academie-oxygene', 'qui constitue environ un cinquième de l’air atmosphérique'),
  fait('co2-complete', 'academie-dioxyde', 'produit de l’oxydation complète du carbone'),
  fait('eau-combinaison', 'cnrtl-eau', 'formé par combinaison d’hydrogène et d’oxygène'),
  // Conservation de la masse.
  prog('conservation-transformation', 'Conservation de la masse lors d’une transformation chimique.'),
];

export const references = referencesDe(FAITS);

// ——— Molécules étudiées (formules citées ci-dessus) ———

export type Symbole = 'C' | 'H' | 'N' | 'O';

export const ELEMENTS: Readonly<Record<Symbole, { nom: string; de: string; numero: number }>> = {
  C: { nom: 'carbone', de: 'de carbone', numero: 6 },
  H: { nom: 'hydrogène', de: 'd’hydrogène', numero: 1 },
  N: { nom: 'azote', de: 'd’azote', numero: 7 },
  O: { nom: 'oxygène', de: 'd’oxygène', numero: 8 },
};

export const SYMBOLES: readonly Symbole[] = ['C', 'H', 'N', 'O'];

export interface Molecule {
  /** « l’eau », « le méthane »… */
  readonly nom: string;
  /** « d’eau », « de méthane »… */
  readonly de: string;
  readonly formule: string;
  /** Atomes dans l’ordre de la formule. */
  readonly atomes: readonly (readonly [Symbole, number])[];
}

const molecule = (nom: string, de: string, atomes: Molecule['atomes']): Molecule => ({
  nom,
  de,
  atomes,
  formule: atomes.map(([s, n]) => s + (n > 1 ? '₀₁₂₃₄'.charAt(n) : '')).join(''),
});

export const MOLECULES: readonly Molecule[] = [
  molecule('l’eau', 'd’eau', [
    ['H', 2],
    ['O', 1],
  ]),
  molecule('le dioxyde de carbone', 'de dioxyde de carbone', [
    ['C', 1],
    ['O', 2],
  ]),
  molecule('le méthane', 'de méthane', [
    ['C', 1],
    ['H', 4],
  ]),
  molecule('le monoxyde de carbone', 'de monoxyde de carbone', [
    ['C', 1],
    ['O', 1],
  ]),
  molecule('le dioxygène', 'de dioxygène', [['O', 2]]),
  molecule('le dihydrogène', 'de dihydrogène', [['H', 2]]),
  molecule('le protoxyde d’azote', 'de protoxyde d’azote', [
    ['N', 2],
    ['O', 1],
  ]),
];

export const total = (m: Molecule) => m.atomes.reduce((s, [, n]) => s + n, 0);
export const compte = (m: Molecule, s: Symbole) => m.atomes.find(([x]) => x === s)?.[1] ?? 0;
/** « 2 atomes d’hydrogène et 1 atome d’oxygène ». */
export const composition = (m: Molecule) =>
  m.atomes.map(([s, n]) => `${n} atome${n > 1 ? 's' : ''} ${ELEMENTS[s].de}`).join(' et ');
