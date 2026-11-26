/**
 * Preuves du chapitre « Société, culture et politique dans la France du XIXe siècle » (4e) : chacune cite un identifiant
 * du registre (`sources.ts`) et la citation exacte du texte. Sources : le programme du cycle 4, la ressource
 * d’accompagnement Éduscol du thème, des pages de l’Assemblée nationale, du Sénat, de vie-publique.fr, de la BnF et le
 * Dictionnaire de l’Académie française. Les faits déjà cités par les chapitres voisins sont repris tels quels.
 */
import type { Preuve } from './kit.ts';
import { PREUVES as REPUBLIQUE } from './temps-republique-sources.ts';
import { PREUVES as XIXE } from './xixe-siecle-sources.ts';

const programme = (quote: string) => ({ source: 'cycle4-2020', quote });
const eduscol = (quote: string) => ({
  source: 'eduscol-4e-france-xixe',
  who: 'La ressource d’accompagnement d’Éduscol',
  quote,
});
const an = (source: string, quote: string) => ({ source, who: 'L’Assemblée nationale', quote });
const censitaire = (quote: string) => an('an-monarchie-censitaire', quote);
const decret = (quote: string) => an('an-decret-suffrage-1848', quote);
const empire = (quote: string) => an('an-second-empire-suffrage', quote);
const publique = (source: string, quote: string) => ({ source, who: 'Le site officiel vie-publique.fr', quote });
const deuxieme = (quote: string) => publique('vie-publique-iie-republique', quote);
const troisieme = (quote: string) => publique('vie-publique-iiie-republique', quote);
const loi1905 = (quote: string) => publique('vie-publique-loi-1905', quote);
const bnf = (quote: string) => ({ source: 'bnf-zola-dreyfus', who: 'La Bibliothèque nationale de France', quote });
const academie = (word: string, quote: string) => ({
  source: `academie-${word}`,
  who: 'Le Dictionnaire de l’Académie française',
  quote,
});

export const PREUVES = {
  // Une difficile conquête : voter de 1815 à 1870
  questions: programme('De 1815 à 1870, des Français votent : qui vote ? pour élire qui ? comment vote-t-on ?'),
  apprentissage: programme(
    'voir comment les Français font l’apprentissage d’un « suffrage universel » à partir de 1848.',
  ),
  cens: academie('cens', 'Le cens électoral a été exigé en France sous la Restauration et la monarchie de Juillet.'),
  censitaire: academie(
    'censitaire',
    'Suffrage censitaire, système électoral où ne sont électeurs que ceux qui paient le cens.',
  ),
  exclu: censitaire('De 1815 à 1848, le peuple se trouve officiellement exclu de la vie politique.'),
  restauration: censitaire(
    'Sous la Restauration, la grande masse des 100 000 électeurs (loi électorale de février 1817) se compose de grands propriétaires fonciers, de bourgeois et de paysans riches.',
  ),
  doubleVote: censitaire('les contribuables les plus imposés votent deux fois.'),
  glorieuses: censitaire(
    "le soulèvement du peuple de Paris les 27, 28 et 29 juillet 1830 (les Trois Glorieuses) contraint Charles X à l'abdication.",
  ),
  loi1831: censitaire(
    'les députés sont élus par les hommes de plus de 25 ans payant un cens de 200 francs (au lieu de 300 précédemment)',
  ),
  guizot: censitaire(
    "le principal ministre de l'époque, Guizot, oppose à toute réforme visant à étendre le droit du suffrage un non catégorique et absolu.",
  ),
  electeurs1846: censitaire('le nombre total des électeurs ne dépasse pas 246 000 citoyens'),
  fevrier1848: an(
    'an-revolution-1848',
    'La situation échappe à Louis-Philippe, qui abdique le 24 février en faveur de son petit-fils',
  ),
  decretUniversel: decret('le suffrage sera universel et direct'),
  conditions1848: decret(
    'sont électeurs tous les Français âgés de vingt et un ans, résidant dans la commune depuis six mois, et non judiciairement privés ou suspendus de l’exercice des droits civiques',
  ),
  masculin: decret('le « suffrage universel » n’est donc que le « suffrage universel masculin »'),
  avril1848: decret(
    'L’élection de l’Assemblée constituante a lieu le 23 avril 1848. Les électeurs se déplacent en masse',
  ),
  president: deuxieme(
    'Le 10 décembre 1848, Louis-Napoléon Bonaparte, neveu de Napoléon Ier, est élu président de la République',
  ),
  restriction1850: deuxieme(
    'les députés limitent le droit de vote (le corps électoral passe de près de 10 millions à moins de 7 millions de votants)',
  ),
  ouvriers1850: deuxieme(
    'Pour voter, il faut désormais justifier de trois années de résidence au même endroit : cela exclut une bonne partie des ouvriers',
  ),
  coupDEtat: deuxieme('c’est le coup d’État du 2 décembre 1851.'),
  empire1852: empire("l'Empire est proclamé le 2 décembre 1852 et Louis-Napoléon prend le titre de Napoléon III."),
  candidats: empire(
    'le Gouvernement qui désigne et soutient ouvertement, au travers des préfets, des candidats officiels.',
  ),
  plebiscite: empire("Le recours fréquent au plébiscite permet à l'empereur d'établir un lien direct avec le peuple"),
  plebisciteMot: academie('plebiscite', "Consultation directe de l'ensemble du corps électoral"),
  rupture: eduscol(
    'En 1848, le passage du système censitaire au suffrage universel constitue tout de même une rupture',
  ),

  // La Troisième République
  septembre1870: troisieme(
    'Deux jours après Sedan, le 4 septembre 1870, un gouvernement provisoire, constitué autour de députés parisiens, proclame la République',
  ),
  commune: troisieme(
    "le mouvement insurrectionnel, social, politique, et militaire de la Commune de Paris, du 18 mars 1871 jusqu'au 28 mai 1871, réprimé par le même Thiers.",
  ),
  unite: programme(
    'Après les événements de 1870 et 1871, l’enjeu est de réaliser l’unité nationale autour de la République',
  ),
  lieux: programme(
    "l'école, la municipalité, la caserne deviennent des lieux où se construit une culture républicaine progressiste et laïque",
  ),
  contestee: programme(
    'Mais de son installation à la loi de Séparation des Églises et de l’État, la République est encore discutée et contestée.',
  ),
  lois1875: an(
    'an-troisieme-republique-suffrage',
    'Il faut attendre 1875 avec l’adoption des trois lois constitutionnelles pour que se dessine et s’affirme la Troisième République.',
  ),
  wallon: an('an-troisieme-republique-suffrage', 'célèbre « amendement Wallon » adopté à une seule voix de majorité'),
  crise1877: troisieme(
    'La crise du 16 mai 1877, qui oppose le président de la République Mac-Mahon et la majorité républicaine de la Chambre',
  ),
  marseillaise: eduscol(
    'L’adoption de la Marseillaise comme hymne national en 1879, l’institution de la fête nationale du 14 juillet en 1880',
  ),
  ecole: REPUBLIQUE.gratuite,
  libertes: eduscol(
    'la loi de 1881 sur la liberté de la presse et de l’affichage, la loi de 1884 autorisant les syndicats, la loi de 1901 sur la liberté d’association',
  ),
  maires: eduscol(
    'La République, par la loi de 1884, permet désormais à tous les conseils municipaux d’élire leur maire',
  ),
  conscription: eduscol('la loi de 1889 sur la conscription obligatoire'),
  conscriptionMot: academie('conscription', 'Enrôlement, recrutement.'),
  isoloir: eduscol('l’isoloir n’arrive en France qu’en 1903'),
  dreyfus: eduscol('L’affaire Dreyfus (1894-1906) remet ainsi en jeu les principes fondamentaux de la République.'),
  condamnation: bnf('la condamnation du capitaine Dreyfus, en 1894'),
  injustement: bnf('Zola prend la défense du capitaine Alfred Dreyfus (1859-1935), injustement accusé de trahison.'),
  officierJuif: bnf('les soupçons se portent immédiatement sur un officier juif'),
  jaccuse: bnf('Le 13 janvier 1898, les vendeurs de journaux distribuent dans Paris'),
  rehabilite: bnf("Il faut attendre 1906 pour voir Dreyfus réhabilité et réintégré dans l'armée"),
  conscience: loi1905(
    'La loi du 9 décembre 1905 proclame en premier lieu la liberté de conscience : "La République assure la liberté de conscience".',
  ),
  separation: loi1905(
    'Elle pose en second lieu le principe de la séparation des Églises et de l’État : "La République ne reconnaît, ne salarie ni ne subventionne aucun culte"',
  ),
  concordat: loi1905(
    'Elle met fin au Concordat instauré en 1802 qui régissait les relations entre l’État et les cultes.',
  ),
  laicite: academie(
    'laicite',
    "Caractère de neutralité religieuse, d'indépendance à l'égard de toutes Églises et confessions.",
  ),

  // Conditions féminines dans une société en mutation
  statut: programme(
    'Quel statut, quelle place, quel nouveau rôle pour les femmes dans une société marquée par leur exclusion politique ?',
  ),
  diversite: programme('Femmes actives et ménagères, bourgeoises, paysannes ou ouvrières'),
  codeCivil: publique(
    'vie-publique-femmes-sphere-privee',
    'En instituant l’incapacité juridique de la femme mariée, le code civil, ou "code napoléonien" (200 ans de code civil), publié en 1804, consacre l’infériorité de la femme face à l’homme',
  ),
  autorite: publique('vie-publique-femmes-sphere-privee', 'les femmes sont soumises à l’autorité du mari.'),
  veuves: publique(
    'vie-publique-femmes-sphere-privee',
    'les filles majeures et les veuves ayant la capacité juridique de gérer leur patrimoine.',
  ),
  exclues: eduscol('Les femmes restent également exclues de la vie politique.'),
  actives: eduscol('6,2 millions de femmes sont actives en 1866, soit un tiers de la population active totale'),
  sousEvalue: eduscol(
    'ce chiffre est-il probablement sous-évalué du fait de l’activité des femmes d’agriculteurs, d’artisans et de commerçants.',
  ),
  ouvrieres: XIXE.femmes,
  greves: eduscol('Les femmes, moins syndiquées que les hommes, participent cependant aux mouvements de grève'),
  textile: eduscol('des grèves se produisent dans des secteurs où le travail féminin domine (comme dans le textile).'),
  salaire: eduscol('Elles obtiennent certains droits, comme la libre disposition de leur salaire (1907)'),
  maternite: eduscol('le congé de maternité de 8 semaines (non rémunéré), en 1909.'),
  prudhommes: eduscol('En 1907, elles deviennent électrices et éligibles aux tribunaux des prud’hommes.'),
  alphabetisation: eduscol('elles rattrapent au long du XIXe siècle leur retard d’alphabétisation sur les hommes.'),
  bacheliere: eduscol('La première bachelière est diplômée en 1861'),
  externat: eduscol('en 1881 une femme est pour la première fois reçue à l’externat de médecine.'),
  secondaire: eduscol('L’enseignement secondaire féminin se met en place en 1867 et 1880.'),
  avocates: eduscol('En 1900, les femmes ont le droit de plaider comme avocates.'),
  vote: eduscol(
    'la revendication du droit de vote, présente dès 1848, portée ensuite par des militantes comme Hubertine Auclert, ne trouve pas de débouché',
  ),
  bourgeoises: eduscol(
    'des femmes qui appartiennent aux élites ou à la moyenne bourgeoisie fondent ou s’insèrent dans des associations visant à améliorer les conditions des femmes qui travaillent.',
  ),
  niboyet: an(
    'an-femmes-revolution',
    'En 1848, Eugénie Niboyet, qui préside le club des femmes et crée « La voix des femmes »',
  ),
  auclert: REPUBLIQUE.auclert,
  fronde: an('an-vote-femmes', '1893 Création de La Fronde, journal quotidien, par Marguerite Durand.'),
  ufsf: publique('vie-publique-vote-femmes', 'l’Union française pour le suffrage des femmes (UFSF) est créée en 1909.'),
  feminisme: academie(
    'feminisme',
    "Mouvement revendicatif ayant pour objet la reconnaissance ou l'extension des droits de la femme dans la société.",
  ),
  menagere: academie(
    'menagere',
    "Femme qui s'occupe de son intérieur, qui effectue ou organise les tâches domestiques.",
  ),
} satisfies Record<string, Preuve & { readonly source: string }>;
