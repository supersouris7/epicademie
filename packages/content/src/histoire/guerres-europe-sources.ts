/**
 * Preuves du chapitre « Des guerres mondiales à l’Union européenne » : chacune cite un identifiant du registre
 * (`sources.ts`) et la citation exacte du texte. Les preuves sans `who` viennent du programme du cycle 3.
 */
import type { Preuve } from './kit.ts';

const programme = (quote: string) => ({ source: 'cycle3-2020', quote });
const de = (who: string) => (source: string, quote: string) => ({ source, who, quote });
const an = de('L’Assemblée nationale');
const vp = de('Le site officiel Vie-publique');
const eduscol = de('Éduscol, le site de l’Éducation nationale,');
const ue = de('L’Union européenne');
const parlement = de('Le Parlement européen');
const academie = de('L’Académie française');

export const PREUVES = {
  // Les deux guerres (programme)
  siecle: programme('Deux guerres mondiales au vingtième siècle'),
  ampleur: programme('on présente l’ampleur des deux conflits en les situant dans leurs contextes européen et mondial'),
  resistanceProgramme: programme('On évoque la Résistance, la France combattante et la collaboration'),
  persecutions: programme(
    'On aborde le génocide des Juifs ainsi que les persécutions à l’encontre d’autres populations',
  ),
  rassembles: programme(
    'des pays européens, autrefois en guerre les uns contre les autres, sont aujourd’hui rassemblés au sein de l’Union européenne',
  ),
  traces: programme('lieux de mémoire et du souvenir, paysages montrant les reconstructions, dates de commémoration'),

  // La Première Guerre mondiale
  dates1418: vp('vie-publique-1914-bilan', 'la guerre de 1914-1918, conflit si meurtrier'),
  grandeGuerre: vp(
    'vie-publique-1914-bilan',
    'Après cinquante-deux mois de durs combats, la Grande Guerre s’achève enfin',
  ),
  morts: vp(
    'vie-publique-1914-bilan',
    'Le conflit a fait plus de 9 millions de morts et disparus (1,4 million pour la France)',
  ),
  civils: vp(
    'vie-publique-1914-civils',
    'Si les civils ne sont pas au cœur même des combats de la Grande Guerre, ils sont affectés de bien des manières par la violence de guerre',
  ),
  lens: vp('vie-publique-1914-civils', 'En 1918, la ville de Lens est détruite'),
  marne: an('an-1914-chronologie', 'Première bataille de la Marne (6 -14 septembre 1914)'),
  verdun: an('an-1914-chronologie', 'Verdun (21 février-18 décembre 1916)'),
  etatsUnis: an('an-1914-1917', 'l’entrée en guerre des États-Unis, font de 1917 une année de crise'),
  rethondes: an(
    'an-1914-chronologie',
    'Wagon stationné en forêt de Compiègne à Rethondes le 11 novembre 1918 pour la signature de l’Armistice',
  ),
  cessez: vp(
    'vie-publique-11-novembre',
    'Le 11 novembre à 5h45 du matin, l’armistice est signé dans les conditions demandées. Les hostilités sont suspendues le même jour à 11 heures',
  ),
  armistice: vp(
    'vie-publique-11-novembre',
    'Un armistice est une suspension provisoire des combats dans le but de négocier une fin des hostilités',
  ),
  versailles: vp(
    'vie-publique-11-novembre',
    'la signature des traités de paix à Versailles, le 28 juin 1919, que la sortie de guerre est actée',
  ),
  poilus: vp(
    'vie-publique-monuments',
    'Les statues de soldats ("poilus", dont la familiarité chaleureuse qui remonte aux premiers jours de 1915 est significative)',
  ),

  // La Seconde Guerre mondiale
  pologne: an('an-montee-nazisme', "Le 1er septembre 1939 commence l'invasion allemande de la Pologne"),
  france1939: an('an-montee-nazisme', 'Le 3 septembre 1939 la France entre en guerre'),
  defaite: eduscol(
    'eduscol-journee-resistance',
    'La défaite de juin 1940 provoque en France un effondrement politique, social et moral',
  ),
  appel: eduscol(
    'eduscol-journee-resistance',
    'Au micro de la BBC à Londres le 18 juin 1940, le général de Gaulle appelle les soldats à le rejoindre pour poursuivre les combats',
  ),
  franceLibre: eduscol(
    'eduscol-journee-resistance',
    'Le général de Gaulle forme alors à l’été 1940 un embryon d’armée, les Forces françaises libres (FFL), et une organisation politique, la France libre',
  ),
  combattante: eduscol(
    'eduscol-journee-resistance',
    'la France libre devient « la France combattante » en juillet 1942',
  ),
  clandestins: eduscol(
    'eduscol-journee-resistance',
    'convaincre la population de lutter contre l’occupant en publiant tracts et journaux clandestins',
  ),
  moulin: eduscol(
    'eduscol-journee-resistance',
    'En 1943, Jean Moulin reçoit la mission de rassembler toutes les composantes de la Résistance',
  ),
  vichy: an(
    'an-1940-1958',
    "Après l'effondrement de la IIIème République le 10 juillet 1940, le régime autoritaire de Vichy se met en place",
  ),
  collaboration: academie(
    'academie-collaboration',
    "En France, pendant l'occupation allemande, de 1940 à 1944, le fait de se mettre au service de l'occupant",
  ),
  livrer: vp('vie-publique-vel-dhiv', "Le gouvernement de Vichy accepte de livrer à l'occupant des milliers de Juifs"),
  rafle: vp(
    'vie-publique-vel-dhiv',
    'Les 16 et 17 juillet 1942, 12 884 hommes et femmes juifs installés en région parisienne, dont environ 4 000 enfants, sont arrêtés par la police parisienne',
  ),
  shoah: vp(
    'vie-publique-genocide',
    "Au cours de la Shoah, l'Allemagne nazie a tué systématiquement plus de 6 millions de juifs",
  ),
  motShoah: eduscol(
    'eduscol-genocides',
    "On préfèrera donc l'utilisation du mot « Shoah » au mot « Holocauste » pour désigner le génocide des Juifs par les nazis",
  ),
  roms: parlement(
    'europarl-roms-2015',
    "plus de 500 000 Roms ont été exterminés par les nazis et d'autres régimes ainsi que leurs alliés au cours de la Deuxième Guerre mondiale",
  ),
  debarquement: vp(
    'vie-publique-debarquement',
    'Le 6 juin 2024 sera commémoré le 80e anniversaire du débarquement allié en Normandie en 1944',
  ),
  victoire: vp(
    'vie-publique-8-mai',
    "Victoire des forces alliées sur l'Allemagne nazie et fin de la Seconde Guerre mondiale en Europe, le 8 mai 1945",
  ),
  japon: vp('vie-publique-8-mai', 'la signature de la capitulation japonaise le 2 septembre 1945'),

  // La construction européenne
  paix: ue('ue-histoire-1945-1959', 'Pour mettre fin aux guerres qui ensanglantent régulièrement le continent'),
  schuman: ue(
    'ue-declaration-schuman',
    'Cette déclaration a été prononcée par Robert Schuman, ministre des affaires étrangères français, le 9 mai 1950',
  ),
  ceca: ue('ue-histoire-1945-1959', '18 avril 1951 – Communauté européenne du charbon et de l’acier'),
  six: ue(
    'ue-histoire-1945-1959',
    'Ces six pays sont l’Allemagne, la France, l’Italie, les Pays-Bas, la Belgique et le Luxembourg',
  ),
  armes: ue(
    'ue-histoire-1945-1959',
    "aucun d'entre eux ne peut fabriquer seul des armes de guerre pour attaquer les autres",
  ),
  rome: ue('ue-histoire-1945-1959', 'En 1957, le traité de Rome établit la Communauté économique européenne (CEE)'),
  maastricht: ue('ue-histoire-1990-1999', '7 février 1992 – Traité de Maastricht'),
  union: ue(
    'ue-histoire-1990-1999',
    'L’«Union européenne» est officiellement créée par le traité, qui entre en vigueur le 1er novembre 1993',
  ),
  euro: ue('ue-histoire-1990-1999', '1er janvier 1999 – Naissance de l’euro'),
  drapeau: ue('ue-drapeau', "Il est composé d'un cercle de 12 étoiles dorées sur fond bleu"),
  etoiles: ue('ue-drapeau', "Le nombre d'étoiles n'est pas lié au nombre de pays de l'Union européenne"),
  hymne: ue(
    'ue-hymne',
    "La mélodie symbolisant l'Union européenne est celle de la Neuvième symphonie composée en 1823 par Ludwig van Beethoven",
  ),
  devise: ue('ue-devise', "«Unie dans la diversité», la devise de l'Union européenne"),
  journeeEurope: ue(
    'ue-journee-europe',
    "Chaque année, le 9 mai, la Journée de l’Europe célèbre la paix et l'unité en Europe",
  ),

  // Lieux de mémoire
  definition: eduscol(
    'eduscol-lieux-memoire',
    "des lieux liés à des événements exceptionnels du passé, parfois érigés dans un contexte traumatique (comme une guerre), dont la collectivité a choisi d'entretenir le souvenir",
  ),
  sites: eduscol(
    'eduscol-lieux-memoire',
    "les tranchées de la Première Guerre mondiale, les plages du Débarquement de Normandie, les camps d'internement",
  ),
  recueillement: eduscol(
    'eduscol-lieux-memoire',
    "un lieu de mémoire est un lieu de souvenir et souvent de recueillement, ce n'est pas un endroit comme un autre",
  ),
  monuments: vp('vie-publique-11-novembre', 'de 1920 à 1925, 36 000 monuments aux morts sont édifiés'),
  noms: vp('vie-publique-monuments', 'chacun des morts a droit à son nom gravé publiquement dans sa commune'),
  inconnu: vp(
    'vie-publique-11-novembre',
    'le Soldat inconnu est inhumé le 28 janvier 1921 sous la voûte de l’Arc de Triomphe à Paris',
  ),
  flamme: vp(
    'vie-publique-11-novembre',
    'Le 11 novembre 1923, le ministre de la guerre et des pensions, André Maginot, allume pour la première fois une flamme du souvenir',
  ),
  tousMorts: vp(
    'vie-publique-11-novembre',
    'la loi du 28 février 2012 étend l’hommage à tous les "morts pour la France" des conflits anciens ou actuels',
  ),
  ferie8mai: vp('vie-publique-8-mai', 'le 8 mai devient à nouveau un jour férié'),
  deportation: vp(
    'vie-publique-vel-dhiv',
    "Depuis la loi du 14 avril 1954, le dernier dimanche d'avril est consacré au souvenir des victimes et des héros de la Déportation",
  ),
  monumentVelHiv: vp(
    'vie-publique-vel-dhiv',
    "La cérémonie se tient chaque année au monument commémoratif de la rafle du Vél' d'Hiv', quai de Grenelle à Paris",
  ),
  journeeResistance: eduscol(
    'eduscol-journee-resistance',
    'La Journée nationale de la Résistance a été instaurée le 19 juillet 2013',
  ),
  mai27: eduscol(
    'eduscol-journee-resistance',
    'La Journée nationale de la Résistance a été choisie en référence à la première réunion du Conseil de la Résistance (appelé quelques mois plus tard le Conseil national de la Résistance) qui s’est déroulée clandestinement dans Paris occupé le 27 mai 1943',
  ),
  janvier27: eduscol(
    'eduscol-genocides',
    "la France et l'Allemagne ont retenu la date du 27 janvier, jour anniversaire de la découverte du camp d'Auschwitz (27 janvier 1945)",
  ),
} satisfies Record<string, Preuve & { readonly source: string }>;
