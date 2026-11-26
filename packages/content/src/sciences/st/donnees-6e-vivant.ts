/**
 * Faits du chapitre « Le vivant » (6e, lot st-6e-03). Chaque fait cite son identifiant de source (registre
 * `sources.ts`) et la citation exacte : programme du cycle 3, Trésor de la langue française informatisé (CNRTL),
 * Dictionnaire de l'Académie française et ministère chargé de la transition écologique. Les faits de classification
 * (Muséum) et de temps géologiques sont repris des registres de SVT, déjà cités. Les organismes désignés par une
 * lettre, les relevés, les fiches et les mesures des exercices sont inventés et annoncés comme tels.
 */
import { FAITS_CLASSIFICATION } from '../svt/donnees-classification.ts';
import { FAITS_TERRE } from '../svt/donnees-terre.ts';
import { PROGRAMME, type Fait } from './donnees.ts';

const fait = (id: string, source: string, citation: string): Fait => ({ id, source, citation });
const prog = (id: string, citation: string) => fait(id, PROGRAMME, citation);
const tl = (id: string, article: string, citation: string) => fait(id, `cnrtl-${article}`, citation);
const POLLINISATEURS = 'ecologie-pollinisateurs';

const FAITS_PROPRES: readonly Fait[] = [
  // La cellule.
  prog(
    'observations',
    'Réaliser et représenter des observations microscopiques de cellules (issues de tissus animaux et végétaux, et d’organismes unicellulaires).',
  ),
  prog('unite', 'Identifier la cellule comme l’unité structurale commune à tous les êtres vivants.'),
  tl('cellule', 'cellule', 'Élément fondamental du tissu vivant.'),
  tl('microscope', 'microscope', "Instrument d'optique à très fort grossissement"),
  tl('membrane', 'membrane', "Limite extérieure de l'ectoplasma cellulaire"),
  tl('cytoplasme', 'cytoplasme', 'Portion protoplasmique de la cellule comprise entre le noyau et la membrane.'),
  tl('noyau', 'noyau', 'Corps sphérique ou ovoïde observé dans presque toutes les cellules'),
  tl('unicellulaire', 'unicellulaire', "Qui est constitué d'une seule cellule."),
  tl('paramecie', 'unicellulaire', 'Corps unicellulaire de la paramécie'),
  tl('pluricellulaire', 'unicellulaire', "l'organisme pluricellulaire de l'homme"),
  tl('levure', 'levure', 'Champignon unicellulaire'),
  tl('bacterie', 'bacterie', 'Micro-organisme uni-cellulaire'),
  tl(
    'tissu',
    'tissu',
    'Ensemble de cellules végétales de morphologie et de composition semblables, ayant une même fonction',
  ),
  // Classification.
  prog(
    'types-classification',
    'Mettre en relation différents types de classification des êtres vivants (utilitaire, écologique, phylogénétique, etc.) et les objectifs de chacun.',
  ),
  prog('arbres', 'Lire et interpréter des arbres de parenté simples.'),
  tl('utilitaire', 'utilitaire', "Qui a pour fin l'utilité, qui vise le pratique, l'utile."),
  tl(
    'ecologie',
    'ecologie',
    'Science qui étudie les relations entre les êtres vivants (humains, animaux, végétaux) et le milieu organique ou inorganique dans lequel ils vivent.',
  ),
  fait('phylogenie', 'mnhn-classer-le-vivant', 'une illustration des relations de parenté entre espèces'),
  // Reproduction.
  prog(
    'fruit-graines',
    'Mettre en évidence le rôle de la pollinisation dans la transformation de la fleur en fruit et des ovules en graines.',
  ),
  prog(
    'cooperation',
    'Illustrer la notion de coopération (interaction mutualiste) avec l’exemple de la pollinisation.',
  ),
  prog('abondance', 'Relier l’évolution de l’abondance de pollinisateurs à ses conséquences sur certaines cultures.'),
  prog('impact-pesticides', 'Comprendre l’impact de l’utilisation des pesticides sur l’abondance des pollinisateurs.'),
  prog(
    'organes',
    'Connaître et localiser les principaux organes de l’appareil reproducteur des êtres humains en les associant à leurs fonctions.',
  ),
  prog(
    'interne-vivipare',
    'Caractériser les processus impliqués dans la reproduction humaine, en particulier la fécondation interne et le développement vivipare impliquant des échanges placentaires.',
  ),
  prog(
    'sexualite',
    'Identifier la dimension biologique de la sexualité humaine et la distinguer de ses autres dimensions (psycho-émotionnelle, juridique et sociale).',
  ),
  tl(
    'pollinisation',
    'pollinisation',
    "le transport du pollen de l'étamine aux stigmates du pistil chez les angiospermes",
  ),
  tl('pollen', 'pollen', 'Poussière très fine (généralement jaune) produite dans les loges des anthères'),
  tl('etamine', 'etamine', 'Organe mâle de la fleur'),
  tl(
    'pistil',
    'pistil',
    "Organe reproducteur femelle, situé au centre de la fleur, généralement composé de l'ovaire, du style et du stigmate.",
  ),
  tl('graine', 'graine', "La graine, qui provient du développement de l'ovule"),
  tl('fecondation', 'fecondation', 'une fusion des gamètes mâle et femelle en une cellule unique'),
  tl('pesticide', 'pesticide', '(Produit) utilisé contre les parasites animaux et végétaux des cultures.'),
  fait(
    'role-pollinisateurs',
    POLLINISATEURS,
    'Les insectes pollinisateurs jouent un rôle majeur aussi bien dans la reproduction de plantes sauvages que pour la production agricole.',
  ),
  fait('part', POLLINISATEURS, '35 % de ce que nous mangeons dépend ainsi de la pollinisation par les insectes.'),
  fait(
    'cultures',
    POLLINISATEURS,
    'des espèces fruitières (pomme, poire, fraise…), maraîchères (tomate sous serre, melon, courgette…), et des espèces de grande culture (colza, tournesol…)',
  ),
  fait(
    'declin',
    POLLINISATEURS,
    'les populations d’insectes pollinisateurs sauvages et des colonies d’abeilles domestiques déclinent',
  ),
  fait('facteurs', POLLINISATEURS, 'les rotations culturales et l’utilisation de produits phytosanitaires'),
  tl('testicule', 'testicule', 'production de spermatozoïdes'),
  tl('spermatozoide', 'spermatozoide', "Cellule reproductrice mâle, arrivée à maturité et apte à féconder l'ovule."),
  tl('ovaire', 'ovaire', 'qui produisent des ovules et sécrètent des hormones sexuelles'),
  tl(
    'trompe',
    'trompe',
    "conduit reliant l'ovaire à l'utérus et permettant le passage de l'ovule produit par l'ovaire jusque dans la cavité utérine",
  ),
  tl('uterus', 'uterus', "et où s'effectue la gestation"),
  tl('vagin', 'vagin', "Canal musculo-muqueux qui s'étend de l'utérus à la vulve"),
  tl('penis', 'penis', 'Organe copulateur du mâle'),
  fait(
    'nourriture-pollinisation',
    'ecologie-rencontre-pollinisateurs',
    'C’est en recherchant de la nourriture (nectar, pollen), un abri ou un partenaire que ces animaux pollinisent involontairement les fleurs.',
  ),
  // Développement et puberté.
  prog('cycle', 'Décrire le cycle de vie d’une plante à fleurs et celui d’un animal.'),
  prog(
    'puberte-programme',
    'Caractériser les modifications morphologiques, comportementales et physiologiques de la puberté.',
  ),
  tl(
    'metamorphose',
    'metamorphose',
    'Ensemble des modifications morphologiques et structurales subies par certains organismes (la grenouille, le papillon, etc.) au cours de leur développement post-embryonnaire',
  ),
  tl(
    'nymphe',
    'nymphe',
    "Insecte arrivé au deuxième stade de son évolution au cours duquel il passe de l'état de larve à celui d'insecte parfait.",
  ),
  tl('ovipare', 'ovipare', 'Qui pond des oeufs qui éclosent après avoir été pondus.'),
  tl('vivipare', 'vivipare', 'dont les petits accomplissent leur évolution embryonnaire dans le corps de la mère'),
  tl(
    'embryon-humain',
    'embryon',
    "Dans l'espèce humaine, conventionnellement, l'embryon existe depuis la segmentation jusqu'à la huitième semaine du développement intra-utérin",
  ),
  tl('foetus', 'foetus', 'au cours du développement prénatal, après le stade embryonnaire'),
  tl('placenta', 'placenta', 'assure les échanges nutritifs et gazeux entre la mère et le foetus'),
  tl('cordon', 'placenta', 'relié au foetus par le cordon ombilical'),
  tl('gestation', 'gestation', "à partir du moment où elle est enceinte jusqu'à l'accouchement"),
  tl(
    'puberte',
    'puberte',
    "les glandes génitales deviennent fonctionnelles et où les caractères sexuels secondaires se manifestent, notamment l'apparition de la pilosité",
  ),
  tl('menstruation', 'menstruation', "caractérisé par un écoulement sanguin d'origine utérine"),
  tl('mue', 'mue', 'dans le timbre et la hauteur de la voix'),
  tl(
    'adolescence',
    'adolescence',
    "les transformations phys. et psychiques qui se produisent entre l'enfance et l'âge adulte",
  ),
  // Biodiversité actuelle et passée.
  fait(
    'non-aviens',
    'insu-dinosaures',
    'On parle de dinosaures non-aviens, c’est à dire du groupe n’incluant pas les oiseaux.',
  ),
  prog(
    'cle-programme',
    'Déterminer des espèces biologiques actuelles ou fossiles, en utilisant une clé de détermination.',
  ),
  prog(
    'intraspecifique',
    'Caractériser la diversité intraspécifique et discuter des attributs utilisés pour regrouper les individus au sein d’une espèce.',
  ),
  prog(
    'echelles',
    'Distinguer différentes échelles de temps : l’échelle des temps géologiques (notion de temps long) et celle de l’histoire de l’être humain.',
  ),
  prog(
    'paleoenvironnement',
    'Exploiter la reconstitution d’un paléoenvironnement en un lieu donné afin de comparer la biodiversité actuelle et passée.',
  ),
  prog(
    'crises-programme',
    'Exploiter des documents pour mettre en évidence l’existence de grandes crises biologiques à placer sur une échelle des temps.',
  ),
];

/** Faits déjà cités par les chapitres de SVT, repris tels quels. */
const repris = (liste: readonly Fait[], ids: readonly string[]) =>
  ids.map((id) => {
    const f = liste.find((x) => x.id === id);
    if (!f) throw new Error(`Fait inconnu : ${id}`);
    return f;
  });

export const FAITS_VIVANT: readonly Fait[] = [
  ...FAITS_PROPRES,
  ...repris(FAITS_CLASSIFICATION, [
    'caracteres-communs',
    'presence',
    'invertebres',
    'cle',
    'vertebres-mamelles',
    'plume',
    'insecte-pattes',
    'araignee-pattes',
    'araignee-pas-insecte',
    'arthropode-exosquelette',
    'emboitement',
    'boite-parente',
    'araignee-arachnide',
    'primate-mammiferes',
    'hominides',
    'arbre-role',
    'attribut-ancetre',
    'ressemblance',
    'tous-parents',
    'espece-criteres',
  ]),
  ...repris(FAITS_TERRE, ['fossile-definition', 'age-terre', 'crises', 'fin-primaire', 'fin-cretace', 'quaternaire']),
];

/** Source rédigée et identifiants de sources d'une notion, à partir des faits qu'elle utilise. */
export function referencesVivant(...ids: readonly string[]) {
  const faits = repris(FAITS_VIVANT, ids);
  return {
    source: `Programme du cycle 3, 6e (BOEN n° 31 du 30 juillet 2020 et n° 25 du 22 juin 2023) et textes cités : ${faits.map((f) => `« ${f.citation} »`).join(' ; ')}.`,
    sources: [...new Set([PROGRAMME, ...faits.map((f) => f.source)])],
  };
}
