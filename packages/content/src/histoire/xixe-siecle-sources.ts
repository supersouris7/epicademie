/**
 * Preuves du chapitre « L’Europe et le monde au XIXe siècle » (4e) : chacune cite un identifiant du registre
 * (`sources.ts`) et la citation exacte du texte. Sources : le programme du cycle 4, des ressources d’accompagnement
 * Éduscol, des pages de la BnF Essentiels, du Sénat et de l’Assemblée nationale, et le Dictionnaire de l’Académie
 * française.
 */
import type { Preuve } from './kit.ts';

const programme = (quote: string) => ({ source: 'cycle4-2020', quote });
const eduscol = (quote: string) => ({
  source: 'eduscol-4e-xixe',
  who: 'La ressource d’accompagnement d’Éduscol',
  quote,
});
const colonies = (quote: string) => ({
  source: 'eduscol-college-colonies',
  who: 'La ressource d’Éduscol sur les colonies',
  quote,
});
const lycee = (quote: string) => ({
  source: 'eduscol-lycee-dominations-coloniales',
  who: 'La ressource d’Éduscol sur les dominations coloniales',
  quote,
});
const esclavageProgrammes = (quote: string) => ({
  source: 'eduscol-esclavage-programmes',
  who: 'Le document d’Éduscol sur l’esclavage dans les programmes',
  quote,
});
const bnf = (source: string, quote: string) => ({ source, who: 'La Bibliothèque nationale de France', quote });
const album = (quote: string) => bnf('bnf-esclavage', quote);
const senat = (quote: string) => ({ source: 'senat-schoelcher', who: 'Le Sénat', quote });
const assemblee = (quote: string) => ({ source: 'an-ferry-1885', who: 'L’Assemblée nationale', quote });
const academie = (word: string, quote: string) => ({
  source: `academie-${word}`,
  who: 'Le Dictionnaire de l’Académie française',
  quote,
});

export const PREUVES = {
  // L’Europe de la « révolution industrielle »
  debuts: eduscol('La « révolution industrielle » commence en Angleterre dans le dernier tiers du XVIIIe siècle.'),
  premiere: eduscol(
    'la période de la première révolution industrielle, marquée par le charbon, le moteur à vapeur et les progrès de l’industrie textile et de la métallurgie du fer',
  ),
  seconde: eduscol(
    'à partir des années 1870, celle de la seconde révolution industrielle marquée par l’électricité, le pétrole, le moteur à explosion',
  ),
  caracteres: eduscol(
    'Les caractéristiques de l’industrie sont bien connues : division du travail et effectifs importants de salariés',
  ),
  diffusion: eduscol(
    'la France, le Nord de l’Italie et la Belgique (en Wallonie) s’industrialisent à partir des années 1820 et 1830, l’Allemagne et les États-Unis à partir du milieu du siècle',
  ),
  urbain: eduscol(
    'la France reste jusqu’aux années 1930 un pays majoritairement rural, alors que l’Angleterre est majoritairement urbaine depuis 1851',
  ),
  emigration: eduscol(
    'Les régions qui ne se développent pas économiquement voient alors leurs habitants tenter l’aventure de l’émigration, comme en Irlande ou en Italie.',
  ),
  famine: eduscol(
    '1848 est par ailleurs la dernière année de la grande famine irlandaise, qui a commencé en 1845 et accroît le mouvement d’émigration vers les États-Unis.',
  ),
  condition: eduscol(
    'Le nouveau monde ouvrier connaît des conditions de vie et de travail extrêmement pénibles jusqu’au milieu du siècle',
  ),
  femmes: eduscol('En France, elles représentent le tiers des ouvriers.'),
  questionSociale: eduscol('c’est le sort des ouvriers que l’on a en vue lorsqu’on évoque « la question sociale »'),
  syndicalisme: eduscol('l’Angleterre est pionnière dans l’essor d’un syndicalisme'),
  crise: eduscol(
    'La crise de 1873, qui marque le début d’une longue phase de ralentissement de la croissance jusqu’en 1896, commence par une crise bancaire.',
  ),
  juin1848: eduscol('l’ampleur des clivages sociaux : les journées de juin 1848 en France'),
  revolution1848: programme(
    'La révolution de 1848, qui traverse l’Europe, fait évoluer à la fois l’idée de nationalité et celle du droit au travail.',
  ),
  transports: bnf(
    'bnf-revolution-transports',
    "la profonde révolution des transports qui naît avec l'industrialisation",
  ),
  salariat: academie(
    'salariat',
    'Régime économique dans lequel le travail est rémunéré par un salaire ; état, statut de salarié.',
  ),
  socialisme: academie(
    'socialisme',
    'Doctrine, fondée sur la critique du capitalisme, qui se développa en Europe à partir du xixe siècle à la suite de la révolution industrielle, et qui visait à instaurer une société plus égalitaire',
  ),

  // Conquêtes et sociétés coloniales
  domination: programme('De nouvelles conquêtes coloniales renforcent la domination européenne sur le monde.'),
  superiorite: eduscol(
    'Les progrès technologiques de l’Europe lui fournissent une supériorité militaire et maritime considérable.',
  ),
  motifs: eduscol(
    'Les États rivaux cherchent à la fois des conquêtes prestigieuses, des points d’appui stratégiques, des sources de matières premières et des débouchés.',
  ),
  algerie: eduscol(
    'La conquête de l’Algérie par la France, commencée en 1830, doit asseoir son statut de puissance méditerranéenne',
  ),
  troisQuarts: eduscol(
    'la reprise de l’expansion coloniale qui aboutit à la colonisation des trois quarts de la planète',
  ),
  contacts: eduscol(
    'témoignent aussi de résistances et de contacts avec les élites locales qui préparent les futurs mouvements d’émancipation',
  ),
  acteurs: eduscol('L’action de Jules Ferry, comme celle de Joseph Gallieni à Madagascar ou d’Hubert Lyautey au Maroc'),
  violence: colonies(
    'réalisée par la violence (guerres de conquête) ou obtenue par l’acceptation de pouvoirs locaux (protectorats, traités inégaux…)',
  ),
  resistances: colonies('Ces conquêtes ne se sont pas faites sans de vives résistances'),
  inegalite: colonies(
    'Ils sont caractérisés par la hiérarchie des pouvoirs, l’inégalité des droits et une inégalité de la considération qui va jusqu’au racisme.',
  ),
  berlin: lycee('La conférence de Berlin, en 1885, est un moment clé du partage colonial de l’Afrique.'),
  adoua: lycee('la victoire des Abyssins sur les Italiens à Adoua en mars 1896'),
  protectorats: assemblee(
    'La Tunisie, en 1881, l’Annam en 1883 et le Tonkin en 1885 deviennent des protectorats français.',
  ),
  ferry: assemblee(
    "à des idées économiques, à des idées de civilisation de la plus haute portée et à des idées d'ordre politique et patriotique",
  ),
  clemenceau: assemblee('face à un adversaire de taille qu’est George Clemenceau'),
  colonie: academie(
    'colonie',
    "Territoire situé hors d'Europe et conquis entre le XVe siècle et le début du XXe par une puissance européenne",
  ),
  peuplement: academie(
    'colonie',
    "Colonie de peuplement, où s'installaient en nombre des colons originaires de la métropole.",
  ),
  metropole: academie('metropole', "Se dit d'un État considéré relativement à ses colonies"),
  protectorat: academie(
    'protectorat',
    "Régime de tutelle par lequel un État puissant, en échange de sa protection, contrôlait l'administration, la sécurité intérieure et les relations extérieures d'un autre État",
  ),
  indigene: academie(
    'indigene',
    "Relatif aux populations autochtones d'un pays placé sous un régime colonial ou de protectorat.",
  ),

  // L’abolition de l’esclavage
  aboutissement: programme('On présente également l’aboutissement du long processus d’abolition de l’esclavage.'),
  codeNoir: album('La vie des esclaves est régie depuis 1685 par le Code noir qui se prête à tous les abus.'),
  voix: album('Des voix prestigieuses appellent à l’abolition au nom des principes de liberté et d’égalité.'),
  trois: album(
    'Abrogé par la Convention en 1794, rétabli par Napoléon en 1802, l’esclavage ne sera définitivement aboli en France qu’en 1848.',
  ),
  principe: album(
    'c’est la République qui a aboli l’esclavage en vertu du principe que tous les hommes sont libres et égaux en droits',
  ),
  traiteAnglaise: album('en 1808, l’Angleterre a interdit la traite à ses ressortissants'),
  traiteFrancaise: album('interdit la traite en 1818 mais n’accepte le droit de visite qu’en 1831'),
  angleterre: album(
    'C’est en Angleterre que le mouvement abolitionniste, d’inspiration plus religieuse, trouve un écho populaire',
  ),
  amis: album('Sous la pression de la Société des Amis des Noirs, la Révolution française'),
  chefDeFile: album('Schoelcher s’implique dans le combat abolitionniste, dont il devint le chef de file en France.'),
  decret: album('fait promulguer le décret du 27 avril 1848 qui abolit définitivement l’esclavage en France'),
  afrique: album(
    'Si la traite atlantique disparaît progressivement au cours du 19e siècle, le nombre d’esclaves sur le continent africain augmente à la même période.',
  ),
  revolte: esclavageProgrammes(
    'une révolte d’esclaves en août 1791 conduit à l’indépendance et à la proclamation de la République d’Haïti',
  ),
  haiti: esclavageProgrammes('1804 : indépendance de Saint-Domingue qui devient Haïti.'),
  saintDomingue1793: esclavageProgrammes(
    '1794 : abolition de l’esclavage dans les colonies par la République française (1793 à Saint-Domingue), rétabli en 1802',
  ),
  decretSenat: senat(
    "il réussit, en dépit des oppositions, à imposer le fameux décret d'abolition de l'esclavage dans tous les territoires français en 1848",
  ),
  ecoles: senat("il a obtenu dès 1848 l'ouverture d'écoles gratuites et obligatoires dans les colonies"),
  rejoint: eduscol(
    'Cette année 1848 est enfin celle où la France rejoint l’Angleterre en abolissant l’esclavage dans ses colonies.',
  ),
  affranchi: academie('affranchi', 'Qui est libéré de sa servitude.'),
  abolitionnisme: academie('abolitionnisme', "Doctrine favorable à l'abolition de l'esclavage."),
} satisfies Record<string, Preuve & { readonly source: string }>;
