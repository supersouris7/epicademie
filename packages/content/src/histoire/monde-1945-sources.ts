/**
 * Preuves du chapitre de 3e « Le monde depuis 1945 » : chacune cite un identifiant du registre (`sources.ts`) et la
 * citation exacte du texte. Les preuves sans `who` viennent du programme du cycle 4. La guerre d'Algérie sert
 * d'exemple d'accès à l'indépendance (le programme en demande un au choix).
 */
import type { Preuve } from './kit.ts';

const programme = (quote: string) => ({ source: 'cycle4-2020', quote });
const de = (who: string, source: string) => (quote: string) => ({ source, who, quote });
const vp = (source: string) => de('Le site officiel Vie-publique', `vie-publique-${source}`);
const ue = (source: string) => de('L’Union européenne', `ue-${source}`);
const onu = (source: string) => de('L’Organisation des Nations unies', `un-${source}`);

const gf = vp('guerre-froide');
const etats = vp('nouveaux-etats');
const peuples = vp('droit-des-peuples');
const algerie = vp('algerie-1962');
const evian = vp('guerre-algerie-19-mars');
const veto = vp('veto-onu');
const paris = vp('accord-paris');
const peres = vp('peres-europe');
const ue1945 = ue('histoire-1945-1959');
const ue1960 = ue('histoire-1960-1969');
const ue1970 = ue('histoire-1970-1979');
const ue1980 = ue('histoire-1980-1989');
const ue1990 = ue('histoire-1990-1999');
const ue2000 = ue('histoire-2000-2009');
const ue2010 = ue('histoire-2010-2019');
const schuman = ue('declaration-schuman');

export const PREUVES = {
  // ——— Indépendances et nouveaux États ———
  programmeEmpires: programme(
    'L’effondrement rapide des empires coloniaux est un fait majeur du second XXe siècle. On étudiera les modalités d’accès à l’indépendance à travers un exemple au choix.',
  ),
  decolonisation: etats(
    "la décolonisation, au lendemain de la Seconde Guerre mondiale, et donc l'accession à l'indépendance de nouveaux États",
  ),
  resolution1514: etats(
    "la résolution 1514 adoptée en 1960 (Déclaration sur l'octroi de l'indépendance aux pays et aux peuples coloniaux)",
  ),
  charte: peuples(
    'La Charte des Nations unies, signée en 1945 et codifiant les grands principes des relations internationales, reconnaît explicitement le "principe de l’égalité de droits des peuples et de leur droit à disposer d’eux-mêmes"',
  ),
  tiersPopulation: onu('decolonisation')(
    "750 millions de personnes — soit près du tiers de la population mondiale — vivaient dans des territoires qui n'étaient pas autonomes",
  ),
  bandung: gf('la Conférence de Bandung en 1955 est la première conférence afro-asiatique'),
  tiersMonde: gf(
    'Elle marque l’émergence sur la scène internationale des pays du Tiers-Monde, terme forgé par Alfred Sauvy, en 1952.',
  ),
  nonAlignement: gf(
    'Il s’agit de défendre un discours anticolonialiste et de peser en échappant à la bipolarisation du monde (non-alignement).',
  ),
  algerie1830: peuples(
    'Colonie française depuis 1830, l’Algérie voit s’intensifier des appels à l’indépendance après la 2e guerre mondiale.',
  ),
  fln: peuples(
    'En 1954, le Front de libération nationale (FLN) lance une série d’attentats meurtriers contre la présence française.',
  ),
  violences: peuples(
    'Attentats commis par le FLN et répression sanglante de l’armée française se succèdent, particulièrement en 1957 lors de la bataille d’Alger.',
  ),
  accords: evian("Le 18 mars 1962, à l'Hôtel du Parc d'Évian, des accords sont signés"),
  guerreAlgerie: evian('La Guerre d’Algérie (1954-1962)'),
  referendum: peuples(
    'Lors du référendum organisé en juillet 1962, les Algériens se prononcent à plus de 90% pour l’indépendance.',
  ),
  harkis: de(
    'Le Sénat',
    'senat-harkis-2022',
  )(
    "Au commencement de la guerre d'Algérie, les autorités françaises amorcent le recrutement de supplétifs d'origine algérienne pour appuyer l'armée. À côté des harkis, recrutés par contrat journalier, équipés et encadrés par l'armée",
  ),
  independance: algerie("5 juillet 1962 Proclamation de l'indépendance de l'Algérie"),
  nationalisation: algerie(
    "24 février 1971 Nationalisation du pétrole et du gaz algériens jusqu'alors exploités par des sociétés françaises",
  ),

  // ——— La guerre froide ———
  programmeGuerreFroide: programme(
    'La guerre froide, l’autre fait majeur de la période, s’inscrit dans une confrontation Est-Ouest qui crée des modèles antagonistes et engendre des crises aux enjeux locaux et mondiaux.',
  ),
  programmeOpinion: programme(
    'États-Unis et URSS se livrent une guerre idéologique et culturelle, une guerre d’opinion et d’information pour affirmer leur puissance.',
  ),
  superpuissances: gf(
    'Face à l’effondrement de ces régions apparaissent deux superpuissances, les États-Unis et l’Union des républiques socialistes soviétique (URSS).',
  ),
  indirect: gf(
    'La Guerre froide est caractérisée par des affrontements localisés sans conflit direct entre les deux superpuissances qui usent de la dissuasion nucléaire.',
  ),
  rideau: gf("désigne la frontière symbolique qui divise l'Europe en deux camps distincts"),
  fulton: de('Le Trésor de la langue française', 'cnrtl-rideau')('rendu célèbre par Churchill en 1946'),
  truman: gf(
    'énoncée le 12 mars 1947, la doctrine Truman (du nom du 33e président des États-Unis de 1945 à 1953, Harry Truman) définit l’existence de deux mondes incompatibles',
  ),
  endiguement: gf(
    'Une politique d’endiguement (containment), consistant à aider les pays menacés par l’expansion soviétique, est alors menée, à l’instar du Plan Marshall (1948-1952) en Europe',
  ),
  bipolarite: gf(
    "La Guerre froide renvoie donc à la nouvelle bipolarité du monde, sur la base d'un conflit idéologique, politique, économique et militaire.",
  ),
  dissuasion: gf(
    'la capacité de chaque camp à détruire l’autre explique que chacun prenne soin d’éviter la dégradation des crises',
  ),
  cuba: gf('la crise de Cuba (1962), qui marque l’apogée de la Guerre froide'),
  detente: gf('à partir de la période dite de "Détente" des années 1970'),
  finGuerreFroide: gf(
    'La chute du mur de Berlin en 1989 puis la disparition de l’URSS en 1991 marquent la fin de la Guerre froide.',
  ),
  vetoBlocage: gf(
    'le Conseil de sécurité est bloqué par le droit de veto sur les questions stratégiques pour l’un ou l’autre des deux Grands',
  ),
  otan: ue1945('4 avril 1949 – Création de l’OTAN'),
  otanAlliance: ue1945(
    'Il s’agit d’une alliance intergouvernementale pour la sécurité entre les États-Unis, le Canada et 10 pays d’Europe occidentale.',
  ),
  mur: ue1960(
    'Le gouvernement communiste d’Allemagne de l’Est construit un mur à Berlin, qui devient le symbole de la séparation de l’Europe de l’Est et de l’Europe de l’Ouest pendant la guerre froide.',
  ),
  murDate: ue1960('Août 1961 – Construction du mur de Berlin'),
  chuteMur: ue1980('9 novembre 1989 – Chute du mur de Berlin'),

  // ——— Le projet européen ———
  contexte: ue1945('cette période marque également le début d’une guerre froide qui divise le continent'),
  schuman9mai: ue1945(
    '9 mai 1950 – Un plan pour une nouvelle coopération politique en Europe Robert Schuman, ministre français des affaires étrangères, présente un plan pour une coopération plus poussée.',
  ),
  realisations: schuman(
    "«L'Europe ne se fera pas d'un coup, ni dans une construction d'ensemble: elle se fera par des réalisations concrètes créant d'abord une solidarité de fait».",
  ),
  guerreImpossible: schuman('«non seulement impensable, mais matériellement impossible»'),
  monnet: peres('il conçoit le projet de la CECA, qu’il propose à Robert Schuman de défendre politiquement'),
  fondateurs: ue1945('Ces six pays sont l’Allemagne, la France, l’Italie, les Pays-Bas, la Belgique et le Luxembourg.'),
  ceca: ue1945('18 avril 1951 – Communauté européenne du charbon et de l’acier'),
  rome: ue1945('En 1957, le traité de Rome établit la Communauté économique européenne (CEE)'),
  euratom: ue1945('la Communauté européenne de l’énergie atomique (Euratom)'),
  pac: ue1960(
    'La première politique agricole commune confère aux pays de la CEE un contrôle conjoint de la production alimentaire.',
  ),
  neuf: ue1970(
    'Le Danemark, l’Irlande et le Royaume-Uni adhèrent aux Communautés européennes le 1er janvier 1973, portant le nombre de pays membres à 9.',
  ),
  suffrage: ue1970(
    'Les citoyens européens élisent les membres du Parlement européen au suffrage direct pour la première fois.',
  ),
  suffrageDate: ue1970('Juin 1979 – Premières élections du Parlement européen au suffrage direct'),
  erasmus: ue1980(
    'Le programme Erasmus est lancé pour soutenir financièrement les étudiants souhaitant étudier dans un autre pays européen.',
  ),
  maastricht: ue1990('7 février 1992 – Traité de Maastricht'),
  union: ue1990(
    'L’«Union européenne» est officiellement créée par le traité, qui entre en vigueur le 1er novembre 1993.',
  ),
  schengen: ue1990(
    "Les voyageurs peuvent se déplacer dans l'ensemble de ces pays sans contrôle des passeports aux frontières.",
  ),
  euro: ue1990('1er janvier 1999 – Naissance de l’euro'),
  billets: ue2000('1er janvier 2002 – Lancement des billets et pièces en euros dans 12 pays'),
  elargissement2004: ue2000('mettant fin à la division de l’Europe après la Seconde Guerre mondiale'),
  brexit: ue2010('Le Royaume-Uni quitte l’UE le 31 janvier 2020.'),

  vingtSept: vp('elargissement-ue')(
    'Après le retrait du Royaume-Uni de l’Union européenne le 31 janvier 2020, le nombre des États membres est passé de 28 à 27 pays.',
  ),

  // ——— Enjeux et conflits après 1989 ———
  programmeConflits: programme(
    'Quelle est la nature des rivalités et des conflits dans le monde contemporain et sur quels territoires se développent-ils ?',
  ),
  programmeClimat: programme(
    'L’exemple d’une grande conférence mondiale pour le climat ou d’un sommet mondial pour le développement durable permet d’illustrer le niveau global de l’action politique, les avancées et les difficultés d’une coopération internationale et le rôle des différents acteurs impliqués.',
  ),
  urss1991: etats("disparition de l'URSS en 1991 et accession à l'indépendance de nouvelles républiques"),
  soudan: etats("l'indépendance du Kosovo en 2008 et du Soudan du Sud en 2011"),
  yougoslavie: ue1990(
    'Dans les Balkans, la Yougoslavie commence à se disloquer. Les guerres qui s’ensuivent font des dizaines de milliers de victimes',
  ),
  golfe: vp('bipolarite')(
    'Elle désigne également la puissance américaine dès la fin de la Guerre froide, s’exprimant à partir de la Guerre du Golfe de 1991',
  ),
  postBipolaire: vp('monde-actuel')(
    'Le spécialiste des relations internationales Bertrand Badie parle de système "post-bipolaire"',
  ),
  attaques: ue2000(
    'Deux avions de ligne sont détournés et percutent les tours jumelles du World Trade Center à New York, ainsi que le Pentagone à Washington.',
  ),
  attaquesDate: ue2000('11 septembre 2001 – Attaques terroristes aux États-Unis'),
  terrorismeDef: de(
    'Le Trésor de la langue française',
    'cnrtl-terrorisme',
  )(
    "Ensemble des actes de violence qu'une organisation politique exécute dans le but de désorganiser la société existante et de créer un climat d'insécurité tel que la prise du pouvoir soit possible",
  ),
  onuMission: vp('onu')(
    'L’Organisation des Nations unies (ONU) est créée en 1945 pour assurer le "maintien de la paix et de la sécurité internationales"',
  ),
  membresPermanents: veto(
    "Les cinq membres permanents du Conseil de sécurité des Nations unies (Chine, États-Unis, Fédération de Russie, France et Royaume-Uni) disposent d'un droit de veto",
  ),
  vetoRejet: veto(
    "il suffit qu'un membre permanent émette un vote négatif (droit de veto) pour qu'une décision soit rejetée",
  ),
  casquesBleus: vp('maintien-paix')(
    'Depuis 1948, les OMP se matérialisent par le déploiement des Casques bleus, qui sont des personnels militaires, policiers ou encore civils.',
  ),
  hausseMissions: onu('casques-bleus')(
    'Avec la fin de la guerre froide, le nombre de missions de maintien de la paix a rapidement augmenté.',
  ),
  rio: onu('conference-rio')(
    "La Conférence des Nations Unies sur l'environnement et le développement (CNUED), aussi connue sous le nom de Sommet Planète Terre ou Conférence de Rio a eu lieu à Rio de Janeiro, au Brésil, du 3 au 14 juin 1992.",
  ),
  durable: onu('conference-rio')(
    'La CNUED a proclamé le concept du développement durable comme un objectif atteignable pour chacun de par le monde',
  ),
  accordParis: paris(
    'L’accord de Paris sur le climat a été adopté le 12 décembre 2015 à l’issue des négociations de la COP21',
  ),
  deuxDegres: paris(
    'contenir d’ici 2100 le réchauffement climatique bien en-dessous de 2°C par rapport aux niveaux préindustriels',
  ),
  limites: paris("accord contraignant, il n’est cependant pas assorti d'un mécanisme coercitif ou de sanction"),
} satisfies Record<string, Preuve & { readonly source: string }>;
