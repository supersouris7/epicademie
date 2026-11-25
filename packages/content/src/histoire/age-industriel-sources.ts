/**
 * Preuves du chapitre « L'âge industriel en France » : chacune cite un identifiant du registre (`sources.ts`) et la
 * citation exacte du texte. Les preuves sans `who` viennent du programme du cycle 3.
 */
import type { Preuve } from './kit.ts';

const programme = (quote: string) => ({ source: 'cycle3-2020', quote });
const bnf = (source: string, quote: string) => ({ source, who: 'La Bibliothèque nationale de France', quote });
const senat = (source: string, quote: string) => ({ source, who: 'Le Sénat', quote });

export const PREUVES = {
  // Énergies et machines
  energies: programme('Les énergies majeures de l’âge industriel (charbon puis pétrole) et les machines'),
  duree: programme(
    'l’industrialisation est un processus qui s’inscrit dans la durée, qui touche tous les secteurs de la production',
  ),
  environnement: programme('de profonds changements sociaux et environnementaux'),
  papin: bnf('bnf-papin', 'En 1687, Denis Papin donne la première description d’une machine à vapeur'),
  watt: bnf('bnf-watt', 'En 1765, il finalise une chambre de condensation pour la vapeur et dépose un brevet en 1769'),
  pilier: bnf('bnf-watt', 'la machine à vapeur est le pilier de la révolution industrielle jusqu’au 20e siècle'),
  lenoir: bnf(
    'bnf-automobile',
    'les expérimentations s’accélèrent à partir de 1860, notamment grâce aux progrès de la machine à vapeur, liée au train. Cette année-là, Jean-Joseph Étienne Lenoir invente un moteur à combustion interne',
  ),
  essence: bnf(
    'bnf-automobile',
    'En 1884, la première automobile à essence est construite par un ingénieur textile, Édouard Delamare-Debouteville',
  ),
  triomphe: bnf('bnf-expo-1855', 'cette manifestation qui voit le triomphe de la machine'),
  coudre: bnf('bnf-expo-1855', "Le clou de l'exposition est une machine à coudre"),
  chantier: {
    source: 'bnf-paris-travaux',
    who: 'Émile Zola, cité par la Bibliothèque nationale de France,',
    quote: 'tout marchait à la vapeur, des sifflements aigus déchiraient l’air',
  },
  navigation: bnf('bnf-photo-industrialisation', 'avec le développement de la navigation à vapeur'),

  // Le travail à la mine, à l'usine, à l'atelier, au grand magasin
  lieux: programme('Le travail à la mine, à l’usine, à l’atelier, au grand magasin'),
  unites: bnf(
    'bnf-travail-photo',
    'multiples unités de production, usines, ateliers, chantiers, qui constituent chacune un cadre de travail',
  ),
  outils: bnf(
    'bnf-travail-photo',
    'Pénétrer à l’intérieur des bâtiments lui permet alors de détailler les machines et outils de production',
  ),
  metiers: bnf(
    'bnf-siecle-industrie',
    "Les transformations de l'économie entraînent l'apparition de nouveaux métiers, et d'un nouveau rapport au travail",
  ),
  berlines: {
    source: 'bnf-germinal',
    who: 'Émile Zola, cité par la Bibliothèque nationale de France,',
    quote: 'On entend brusquement un roulement lointain, c’est un train de berlines qui arrive',
  },
  enfant: {
    source: 'bnf-germinal',
    who: 'Émile Zola, cité par la Bibliothèque nationale de France,',
    quote: 'Un enfant est assis sur la première berline, c’est le conducteur',
  },
  cheval: {
    source: 'bnf-germinal',
    who: 'Émile Zola, cité par la Bibliothèque nationale de France,',
    quote: 'on aperçoit vaguement le cheval blanc qui traîne',
  },
  anzin: bnf(
    'bnf-germinal',
    "Il s'est notamment livré à une enquête sociale de terrain en se rendant dans les mines d'Anzin",
  ),
  germinal: bnf('bnf-germinal', 'le roman est publié en librairie chez Charpentier, le 2 mars 1885'),
  courrieres: bnf('bnf-mineur', 'Les catastrophes minières, comme celle de Courrières (1906), la plus meurtrière'),
  huitHeures: senat('senat-republique', "L'instauration de la journée de travail à huit heures pour les mineurs"),
  jardiniere: bnf(
    'bnf-grands-magasins',
    'ce type de commerce ne se développe qu’après 1820 avec La Belle Jardinière (1824)',
  ),
  louvre: bnf('bnf-grands-magasins', 'En 1855 ouvre un grand magasin, les Galeries du Louvre'),
  geants: bnf('bnf-grands-magasins', 'Deux géants émergent alors : Au Bon Marché et Au Louvre'),
  repas: bnf('bnf-grands-magasins', 'Chaque employé a droit à deux repas [gratuits] complets par jour'),
  pratiques: bnf(
    'bnf-zola',
    'prix fixes et affichés, grandes « expositions » de blanc ou de nouveautés, publicité dans la presse ou sur affiches',
  ),

  // La ville industrielle
  ville: programme('La ville industrielle'),
  villes: bnf(
    'bnf-photo-industrialisation',
    'Les villes, enfin, qui concentrent les activités industrielles, commerciales et financières, connaissent un développement sans précédent',
  ),
  logement: bnf(
    'bnf-siecle-industrie',
    'des usines éclosent partout et nécessitent une main-d’œuvre nombreuse. Mais où trouve-t-elle à se loger ?',
  ),
  haussmann: bnf(
    'bnf-paris-travaux',
    'De 1853 à 1870, le préfet de la Seine, Georges Eugène Haussmann, remodèle la ville de Paris',
  ),
  reseaux: bnf(
    'bnf-paris-travaux',
    "Percement de rues, édification de nouveaux monuments, création des réseaux d'eau et de gaz, plantation de parcs et jardins",
  ),
  assainir: bnf('bnf-paris-travaux', 'assainissons les quartiers populaires qui manquent d’air et de jour'),
  expulsion: bnf(
    'bnf-paris-travaux',
    'pour les petites gens, le prix à payer est l’expulsion : la misère s’installe alors dans les banlieues des faubourgs',
  ),
  electricite: bnf(
    'bnf-paris-travaux',
    'Grâce au nouvel éclairage électrique, les travaux se poursuivent désormais la nuit',
  ),
  cites: bnf(
    'bnf-logement',
    'ce sont bien souvent les grands patrons qui, dans des actions que l’on peut qualifier de paternalistes ou de philanthropiques, construisent ces cités',
  ),
  hbm: bnf('bnf-logement', 'avec la loi HBM (Habitations à bon marché), votée en 1894'),
  metroTravaux: bnf(
    'bnf-metro',
    'Dès novembre 1898, la ville de Paris entreprit les travaux préparatoires à la construction de la première ligne du métropolitain',
  ),
  metroLigne: bnf(
    'bnf-metro',
    'La première ligne, reliant la Porte Maillot et la Porte de Vincennes fut ouverte le 19 juillet 1900',
  ),
  abonnements: bnf(
    'bnf-metro',
    'la création d’abonnements ouvriers pour que les mal-logés puissent s’installer en banlieue',
  ),

  // Le monde rural
  rural: programme('Le monde rural'),
  mondes: programme('qui entraîne des évolutions des mondes urbain et rural'),
  seuil: senat(
    'senat-communes-rurales',
    "La distinction statistique entre les communes rurales et urbaines débute en 1846 autour d'un seuil de 2 000 habitants",
  ),
  paysans: senat(
    'senat-espace-rural',
    "L'urbanisation et l'industrialisation de la France, tardives, ont été alimentées par la main-d'oeuvre paysanne",
  ),
  labour: bnf('bnf-labourage', 'Deux attelages de six bœufs tirent les charrues, aiguillonnés par les laboureurs'),
  tableau: bnf(
    'bnf-labourage',
    "Ce tableau a été commandé par l'État à Rosa Bonheur en 1848 et achevé l'année suivante",
  ),
  vignes: bnf('bnf-labourage', 'les exploitations vinicoles, très nombreuses dans la Nièvre'),
  denrees: bnf(
    'bnf-mines-usines',
    "Charbon, minerais, mais aussi pierres précieuses et denrées agricoles alimentent les bouches d'une industrie de plus en plus gourmande",
  ),
  engrais: bnf(
    'bnf-richesses',
    "Ces accumulations de déjections aviaires remontant à des milliers d'années ont contribué à la révolution agricole nord-américaine et européenne en permettant une énorme augmentation des rendements",
  ),
  scotte: bnf('bnf-train-scotte', 'Conçu notamment pour les zones rurales, d’abord comme transport de marchandises'),
  sansRail: bnf('bnf-train-scotte', 'dans des lieux où le chemin de fer ne passait pas encore'),
} satisfies Record<string, Preuve & { readonly source: string }>;
