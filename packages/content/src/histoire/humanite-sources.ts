/**
 * Faits du chapitre « L'humanité et ses migrations » : chacun cite un identifiant du registre (`sources.ts`) et la
 * citation exacte du texte (programme du cycle 3, communiqués du CNRS, BnF Essentiels, TLFi du CNRTL).
 */
import type { Preuve } from './kit.ts';

const programme = (quote: string): Preuve => ({ source: 'cycle3-2020', quote });
const cnrs = (source: string, quote: string): Preuve => ({ source, who: 'Le CNRS', quote });
const bnf = (source: string, quote: string): Preuve => ({ source, who: 'La Bibliothèque nationale de France', quote });
const tlfi = (source: string, quote: string): Preuve => ({ source, who: 'Le Trésor de la langue française', quote });

export const PREUVES = {
  // Programme
  oscillations: programme(
    'ont connu de fortes oscillations climatiques, qui ont profondément transformé l’environnement et amené les groupes humains à adapter leurs modes de vie',
  ),
  migrations: programme(
    'L’histoire des premières grandes migrations de l’humanité peut être conduite rapidement à partir de l’observation de cartes et de la mention de quelques sites de fouilles',
  ),
  environnement: programme(
    'L’étude du néolithique interroge l’intervention des femmes et des hommes sur leur environnement',
  ),
  moments: programme(
    'La sédentarisation des communautés humaines comme l’entrée des activités humaines dans l’agriculture et l’élevage se produisent à des moments différents selon les espaces géographiques observés',
  ),
  orient: programme(
    'L’étude des premiers États et des premières écritures se place dans le cadre de l’Orient ancien et peut concerner l’Égypte ou la Mésopotamie',
  ),

  // Les débuts de l'humanité
  prehistoire: tlfi(
    'cnrtl-prehistoire',
    'Période de l’histoire de l’humanité comprenant l’ensemble des événements antérieurs à l’apparition de l’écriture et à l’emploi des métaux',
  ),
  migration: tlfi('cnrtl-migration', 'Déplacement de personnes d’un lieu dans un autre'),
  sahel: cnrs(
    'cnrs-sahelanthropus',
    'Du haut de ses 7 millions d’années, Sahelanthropus tchadensis est considérée comme la plus vieille espèce représentante de l’humanité',
  ),
  tchad: cnrs('cnrs-sahelanthropus', 'à Toros-Ménalla dans le désert du Djourab (Tchad)'),
  outils: cnrs(
    'cnrs-outils-olduvai',
    '27 outils en os standardisés datant de plus de 1,5 million d’années viennent d’être identifiés dans les gorges d’Olduvai, en Tanzanie',
  ),
  somme: cnrs(
    'cnrs-moulin-quignon',
    'Plus de 260 objets en silex dont 5 bifaces ou « haches taillées » datant d’il y a 650 à 670 000 ans y ont été mis au jour',
  ),
  sapiens: cnrs('cnrs-ancetre-commun', 'Notre espèce, Homo sapiens, est apparue en Afrique il y a environ 300 000 ans'),
  chine: cnrs('cnrs-sapiens-chine', 'Nos ancêtres étaient déjà présents au nord de la Chine il y a environ 45 000 ans'),
  paysages: cnrs(
    'cnrs-paysages-sapiens',
    'nos ancêtres adaptaient leurs pratiques aux contraintes de leur environnement changeant',
  ),
  pluies: cnrs(
    'cnrs-paysages-sapiens',
    'Les précipitations étaient aussi plus régulièrement réparties au cours de l’année',
  ),

  // La « révolution » néolithique
  neolithique: tlfi('cnrtl-neolithique', 'qui appartient à l’époque de la pierre polie, période de la préhistoire'),
  sedentaire: tlfi('cnrtl-sedentaire', 'Qui est attaché de manière fixe permanente à un lieu, une ville, un pays'),
  nomade: tlfi('cnrtl-nomade', 'Qui n’a pas de demeure, d’établissement fixe'),
  agriculture: tlfi(
    'cnrtl-agriculture',
    'la culture des terres en vue de la production des végétaux utiles à l’homme et à l’élevage des animaux',
  ),
  elevage: tlfi('cnrtl-elevage', 'Art d’élever des animaux domestiques'),
  domestication: tlfi('cnrtl-domestication', 'Apprivoisement des animaux'),
  chevres: cnrs('cnrs-domestication-chevre', 'Domestiqués depuis 10 500 ans au Proche et au Moyen-Orient'),
  croissant: cnrs(
    'cnrs-domestication-chevre',
    'plusieurs foyers de domestication de chèvres provenant de trois lignées différentes ont coexisté, en parallèle, dans le Croissant fertile',
  ),
  ane: cnrs(
    'cnrs-domestication-ane',
    'l’âne aurait été domestiqué pour la première fois en Afrique, 5000 ans avant notre ère',
  ),
  paysans: cnrs(
    'cnrs-premiers-paysans',
    'il y a 7 500 ans, des pionniers venus de loin ont bouleversé notre histoire en implantant l’agriculture sur notre territoire et en batissant les premiers villages',
  ),

  // Premiers États, premières écritures
  invention: bnf(
    'bnf-cuneiforme',
    'Au cours de la seconde moitié du 4e millénaire, entre 3500 et 3300 avant notre ère, la complexité du nouvel ordre social, liée au développement du phénomène urbain, a entraîné l’invention d’un outil de communication nouveau : l’écriture',
  ),
  citesEtats: bnf(
    'bnf-cuneiforme',
    'L’écriture est apparue simultanément dans plusieurs « cités-États » de Mésopotamie. Uruk (actuelle Warka, en Irak), située dans le sud',
  ),
  etat: bnf(
    'bnf-cuneiforme',
    'cette invention s’inscrit dans le grand courant des découvertes liées à l’émergence de la notion d’État',
  ),
  archives: bnf(
    'bnf-cuneiforme',
    'C’est principalement à Uruk, en Basse-Mésopotamie, l’ancien pays de Sumer, qu’ils ont été trouvés, au début de ce siècle, sous forme de milliers de tablettes d’argile inscrites qui représentent les archives administratives',
  ),
  memoire: bnf('bnf-cuneiforme', 'Simple aide-mémoire à l’origine'),
  calame: bnf(
    'bnf-cuneiforme',
    'comme il est difficile de tracer des lignes courbes sur l’argile fraîche, on les décompose en lignes droites, bientôt imprimées et non plus incisées au moyen d’un calame de roseau, à bout triangulaire, qui produit des impressions en forme de coins. C’est ainsi que la graphie devient « cunéiforme »',
  ),
  argile: bnf(
    'bnf-cuneiforme',
    'l’argile, seule véritable ressource de la Mésopotamie d’alors, est le support privilégié et imposé de l’écriture cunéiforme',
  ),
  egypte: bnf(
    'bnf-ecritures-egypte',
    'L’écriture est apparue en Égypte vers 3200-3150 av. J.-C. Les signes de base en sont les hiéroglyphes',
  ),
  fin: bnf('bnf-ecritures-egypte', 'ont été utilisés jusque vers l’an 400 de notre ère'),
  administratif: bnf(
    'bnf-ecritures-egypte',
    'Ils ont été gravés sur des tablettes et des morceaux de poteries livrant des dates et des informations administratives',
  ),
  papyrus: bnf('bnf-ecritures-egypte', 'Le papyrus resta le support essentiel du livre en Égypte'),
  pharaon: tlfi('cnrtl-pharaon', 'Titre donné aux souverains absolus de l’Égypte ancienne'),
  scribe: tlfi('cnrtl-scribe', 'Celui qui occupait les fonctions de rédacteur ou de copiste des textes'),
} satisfies Record<string, Preuve>;
