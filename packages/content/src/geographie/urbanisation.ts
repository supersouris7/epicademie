import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * Quatrième, thème 1 « L’urbanisation du monde » (lot ge-4e-01) : centres et périphéries, villes inégalement
 * connectées aux réseaux de la mondialisation, vocabulaire de la géographie urbaine. Chaque fait cite une source du
 * registre avec sa citation exacte : programme du cycle 4 et glossaire de Géoconfluences (ENS de Lyon, DGESCO). Les
 * textes à lire du niveau 5 sont écrits pour l’exercice (villes fictives).
 */

const CBD = 'geoconfluences-cbd';
const CENTRE = 'geoconfluences-centre-peripherie';
const PAVILLON = 'geoconfluences-habitat-pavillonnaire';
const PERIURB = 'geoconfluences-periurbanisation';
const INFORMEL = 'geoconfluences-bidonville';
const GENTRI = 'geoconfluences-gentrification';
const FERME = 'geoconfluences-gated-community';
const BANLIEUE = 'geoconfluences-banlieue';
const FRAGMENT = 'geoconfluences-fragmentation';
const METROPOLISATION = 'geoconfluences-metropolisation';
const MONDIALES = 'geoconfluences-villes-mondiales';
const ARCHIPEL = 'geoconfluences-archipel';
const AMM = 'geoconfluences-amm';
const HUB = 'geoconfluences-hub';
const SHRINK = 'geoconfluences-shrinking-city';
const RESEAU = 'geoconfluences-reseau';
const MONDIALISATION = 'geoconfluences-mondialisation';
const METROPOLE = 'geoconfluences-metropole';
const MEGAPOLE = 'geoconfluences-megapoles';
const MEGALOPOLE = 'geoconfluences-megalopole';
const CONURBATION = 'geoconfluences-conurbation';
const MITAGE = 'geoconfluences-mitage';
const URBAIN = 'geoconfluences-urbain';

// Programme du cycle 4, géographie, classe de 4e, thème 1.
const P_DIFFERENCES =
  'la connexion des villes aux grands réseaux de la mondialisation et aux différences que cela crée entre villes connectées et bien intégrées à une mondialisation qu’elles entraînent et des villes plus à l’écart';
const P_1945 = 'Le monde s’urbanise à grande vitesse depuis 1945';
const P_MOITIE =
  'Plus de la moitié de l’humanité habite les villes, depuis 2007, et probablement les 2/3 à l’horizon 2050';
const P_ECART =
  'des villes plus à l’écart, voire confrontées à des phénomènes de « rétrécissement » (Shrinking Cities, comme Detroit)';

// Centres, périphéries et paysages.
const G_CBD = 'un espace où se concentrent des activités à très forte valeur ajoutée financière';
const G_TOURS =
  'les prix très élevés du foncier ont conduit urbanistes et architectes à concevoir des immeubles très élevés';
const G_CBD_AMERIQUE = 'Le sigle CBD est à réserver aux villes nord-américaines';
const G_DEPENDANT = "la périphérie correspond donc aux espaces dépendant d'un centre";
const G_PAVILLON =
  'un paysage caractéristique des périphéries urbaines et de la seconde moitié du XXe siècle, dans lequel les logements individuels dominent';
const G_PERIURB =
  'La périurbanisation correspond à l’extension des surfaces artificialisées en périphéries des agglomérations urbaines';
const G_AUTO = "avec la démocratisation de l’automobile, et l'attrait du logement individuel";
const G_PRECAIRE = "un ensemble d'habitations précaires, dans des secteurs non viabilisés";
const G_TITRE = 'dont les habitants ne possèdent pas de titre de propriété';
const G_GENTRI =
  'La gentrification désigne une forme particulière d’embourgeoisement d’un espace populaire qui passe par la transformation de l’habitat, des commerces ou de l’espace public';
const G_EVICTION = 'la hausse des prix immobiliers qui évince progressivement les classes populaires';
const G_FERME =
  "un quartier homogène socialement, généralement habité par des populations aisées, clos, et accessible par un nombre minimal d'entrées gardées";
const G_EXTERIEUR = 'périphérie périurbaine pour les espaces les plus extérieurs et relâchés de l’agglomération';
const G_RICHES =
  'ce sont souvent des communes de banlieue qui sont les plus riches de leur agglomération, comme Neuilly-sur-Seine à Paris';

// Connexion à la mondialisation.
const G_METROPOLISATION =
  "La métropolisation désigne le processus de concentration de populations, d'activités, de valeur dans des villes de grande taille";
const G_MONDIALES = "l'expression renvoie alors aux métropoles capables de commander l'économie mondiale";
const G_INSERTION =
  "l'expression ne désigne plus un absolu mais un degré d'insertion dans la mondialisation, fondé principalement sur des critères économiques";
const G_ARCHIPEL =
  'La notion d’archipel métropolitain mondial désigne ainsi le fonctionnement mondialisé des grandes métropoles, reliées entre elles par des flux intenses et de toute nature';
const G_ECHANGES = "qui ont parfois plus d'échanges entre elles qu'avec leur arrière-pays immédiat";
const G_COMPTE = 'les espaces laissés-pour-compte de la mondialisation';
const G_HUB = "Un hub est le noyau pivot d'un système de transport";
const G_CORRESPONDANCE = 'la plateforme de correspondance ou de regroupement des compagnies aériennes';
const G_RESEAU = "Les réseaux sont les supports des flux d'échanges";
const G_MATERIEL = 'les axes qui les supportent restent toujours matériels (câbles, serveurs, centres de données';
const G_SHRINK =
  "une manifestation spatiale de la mondialisation pour les villes n'arrivant pas à trouver leur place dans l'internationalisation de la compétitivité économique et peinant à se connecter aux réseaux globaux";
const G_VILLES_US = 'Détroit, Cleveland, Pittsburgh et Buffalo plus de 30 %';
const G_TROIS =
  "démographique, par la perte de population ; économique, par la perte d'activités, de fonctions, de revenus et d'emplois ; et social";

// Vocabulaire.
const G_MONDIALISATION =
  "La mondialisation est un processus continu d'intensification et de fluidification des échanges";
const G_PROCESSUS = 'La notion d’urbanisation apporte une dimension dynamique, c’est un processus';
const G_AGGLO = 'Ville-centre et banlieue forment ensemble, en géographie urbaine classique, une agglomération urbaine';
const G_BANLIEUE = "les communes autonomes urbanisées sous l'influence d'une ville-centre";
const G_METROPOLE =
  'La métropole est avant tout un ensemble urbain de grande importance qui exerce des fonctions de commandement, d’organisation et d’impulsion';
const G_TAILLE = 'Le poids et la croissance démographiques ne sont pas des critères déterminants';
const G_MEGAPOLE = "des populations égales ou supérieures à 10 millions d'habitants";
const G_MEGALOPOLE =
  "Une mégalopole est un réseau de villes à vaste échelle, intégrant des villes multimillionnaires reliées par un tissu dense d'axes de transport";
const G_BOSWASH = "la conurbation s'étendant le long de la côte atlantique de Boston à Washington";
const G_CONURBATION =
  'Le terme de conurbation désigne un ensemble de villes devenues coalescentes par extension de leurs périphéries';
const G_MITAGE =
  "Le mitage est l'éparpillement, sans plan d'urbanisme réellement cohérent, d'infrastructures, de zones d'habitat, de zones d'activité, dans des espaces initialement ruraux";

// ——— Notion 1 : centres, périphéries et paysages ———

const espaces: Notion = {
  classe: '4e',
  id: 'g4-centres-peripheries',
  title: 'Espaces et paysages de l’urbanisation : centres et périphéries',
  hint: 'Repère de quoi on parle : un lieu (au centre ou autour), un paysage, un changement ou une date.',
  memo: [
    'L’**urbanisation** transforme le monde à grande vitesse depuis 1945 : plus de la moitié de l’humanité vit en ville depuis 2007. Une ville s’organise souvent entre un centre et des **périphéries**, qui dépendent de lui.',
    'Les paysages changent : tours du **quartier d’affaires** (le CBD en Amérique du Nord), **habitat pavillonnaire** né de la **périurbanisation**, **quartier informel** fait d’habitations fragiles.',
    'Les quartiers se transforment et se séparent aussi : **gentrification** d’un quartier populaire, ou **quartier résidentiel fermé** pour des habitants aisés.',
  ],
  faits: [
    {
      q: 'Depuis quelle année plus de la moitié de l’humanité habite-t-elle les villes ?',
      a: '2007',
      wrong: [
        {
          label: '1945',
          why: '1945 marque le début de l’urbanisation à grande vitesse, pas le passage de la moitié.',
        },
        { label: '2050', why: '2050 est l’horizon d’une estimation : environ les deux tiers de citadins.' },
        { label: '1789', why: 'La majorité urbaine mondiale est bien plus récente : elle date du XXIe siècle.' },
      ],
      gap: ['Depuis l’année ', ', plus de la moitié de l’humanité habite les villes.', ['2007']],
      choix: ['2007', '1945', '1900'],
      quote: P_MOITIE,
      explain: 'Le programme date ce basculement de 2007 et estime la part à environ deux tiers vers 2050.',
    },
    {
      q: 'Dans les villes nord-américaines, comment appelle-t-on le centre où se concentrent les activités financières ?',
      a: 'le CBD, ou quartier des affaires',
      wrong: [
        {
          label: 'la banlieue résidentielle',
          why: 'La banlieue entoure la ville-centre ; la résidence n’est pas la finance.',
        },
        {
          label: 'le quartier informel',
          why: 'Un quartier informel regroupe des habitations précaires, pas des sièges financiers.',
        },
        {
          label: 'le lotissement périurbain',
          why: 'Un lotissement périurbain est un ensemble de maisons loin du centre.',
        },
      ],
      gap: ['En Amérique du Nord, le quartier des affaires est désigné par le sigle ', '.', ['CBD']],
      choix: ['CBD', 'ONU', 'IDH'],
      quote: G_CBD,
      explain: 'Le CBD rassemble des sièges d’entreprises et des activités de finance, près du cœur de la ville.',
      src: CBD,
    },
    {
      q: 'Quel élément du paysage caractérise un quartier des affaires comme le CBD ?',
      a: 'des immeubles très élevés',
      wrong: [
        { label: 'des champs et des pâturages', why: 'Ce paysage agricole appartient à l’espace rural.' },
        {
          label: 'des maisons individuelles avec jardin',
          why: 'C’est le paysage pavillonnaire, typique des périphéries.',
        },
        {
          label: 'des habitations de matériaux de récupération',
          why: 'Elles caractérisent les quartiers informels précaires.',
        },
      ],
      gap: ['Au quartier des affaires, le sol coûte cher : on construit des immeubles très ', '.', ['élevés']],
      choix: ['élevés', 'bas', 'dispersés'],
      quote: G_TOURS,
      explain: 'Le prix très élevé du sol pousse à construire en hauteur : la silhouette de la ville se verticalise.',
      src: CBD,
    },
    {
      q: 'Dans le modèle centre-périphérie, qu’est-ce qu’une périphérie ?',
      a: 'un espace qui dépend d’un centre',
      wrong: [
        { label: 'un espace qui commande le centre', why: 'C’est le centre qui commande ; la périphérie en dépend.' },
        {
          label: 'le point situé exactement au milieu d’un territoire',
          why: 'En géographie, un centre se définit par son rôle, pas par sa place au milieu.',
        },
        {
          label: 'un lieu sans aucun lien avec un centre',
          why: 'La périphérie forme un couple avec le centre : ils sont liés.',
        },
      ],
      gap: ['Les périphéries sont des espaces qui ', ' d’un centre.', ['dépendent']],
      choix: ['dépendent', 'commandent', 's’isolent'],
      quote: G_DEPENDANT,
      explain: 'Centre et périphérie vont ensemble : l’un a la capacité de commander, l’autre en dépend.',
      src: CENTRE,
    },
    {
      q: 'Quel paysage typique des périphéries urbaines est dominé par les logements individuels ?',
      a: 'l’habitat pavillonnaire',
      wrong: [
        {
          label: 'le quartier des affaires',
          why: 'Le quartier des affaires concentre bureaux et finance dans des immeubles hauts.',
        },
        {
          label: 'le grand ensemble d’immeubles',
          why: 'Un grand ensemble est un habitat collectif, pas individuel.',
        },
        { label: 'le port industriel', why: 'Un port industriel accueille des marchandises et des usines.' },
      ],
      gap: [
        'En périphérie, les maisons individuelles entourées d’un terrain forment l’habitat ',
        '.',
        ['pavillonnaire'],
      ],
      choix: ['pavillonnaire', 'collectif', 'informel'],
      quote: G_PAVILLON,
      explain: 'Le pavillon est une maison individuelle entourée d’un terrain, très répandue en périphérie.',
      src: PAVILLON,
    },
    {
      q: 'Comment appelle-t-on l’extension des surfaces artificialisées en périphérie des agglomérations ?',
      a: 'la périurbanisation',
      wrong: [
        { label: 'la gentrification', why: 'La gentrification transforme socialement un quartier populaire.' },
        { label: 'l’exode rural', why: 'L’exode rural désigne un départ de population des campagnes.' },
        { label: 'la désindustrialisation', why: 'Elle désigne le recul de l’industrie, pas l’avancée du bâti.' },
      ],
      gap: ['La ', ' fait avancer routes, maisons et parkings en périphérie des villes.', ['périurbanisation']],
      choix: ['périurbanisation', 'gentrification', 'désindustrialisation'],
      quote: G_PERIURB,
      explain: 'Routes, parkings et bâtiments remplacent des sols agricoles ou naturels autour de la ville.',
      src: PERIURB,
    },
    {
      q: 'Qu’est-ce qui caractérise un quartier informel (bidonville) ?',
      a: 'des habitations précaires sur des secteurs non équipés',
      wrong: [
        {
          label: 'des maisons de luxe gardées à l’entrée',
          why: 'C’est le portrait d’un quartier résidentiel fermé.',
        },
        {
          label: 'des bureaux de grandes entreprises',
          why: 'Les bureaux se concentrent dans les quartiers des affaires.',
        },
        { label: 'des maisons toutes autorisées et raccordées', why: 'Un quartier informel manque justement de cela.' },
      ],
      gap: ['Un quartier informel réunit des habitations ', ', dans des secteurs non viabilisés.', ['précaires']],
      choix: ['précaires', 'luxueuses', 'gardées'],
      quote: G_PRECAIRE,
      explain: '« Non viabilisé » : le terrain manque d’équipements comme l’eau ou les égouts.',
      src: INFORMEL,
    },
    {
      q: 'Un quartier populaire ancien est rénové, les prix montent et des ménages plus aisés s’installent. Quel processus est-ce ?',
      a: 'la gentrification',
      wrong: [
        { label: 'la périurbanisation', why: 'La périurbanisation étend la ville sur sa périphérie.' },
        { label: 'le rétrécissement urbain', why: 'Une ville rétrécissante perd des habitants et des emplois.' },
        { label: 'le mitage', why: 'Le mitage éparpille des constructions dans la campagne.' },
      ],
      gap: ['L’embourgeoisement d’un quartier populaire s’appelle la ', '.', ['gentrification']],
      choix: ['gentrification', 'périurbanisation', 'mondialisation'],
      quote: G_GENTRI,
      explain: 'Le quartier change d’habitants et d’aspect : c’est un embourgeoisement d’un espace populaire.',
      src: GENTRI,
    },
  ],
  paires3: [
    ['Quartier des affaires', 'Bureaux et finance dans des immeubles élevés'],
    ['Habitat pavillonnaire', 'Maisons individuelles des périphéries'],
    ['Quartier informel', 'Habitations précaires sur un terrain non équipé'],
  ],
  paires5: [
    ['Quartier des affaires', 'Bureaux et finance dans des immeubles élevés'],
    ['Habitat pavillonnaire', 'Maisons individuelles des périphéries'],
    ['Quartier informel', 'Habitations précaires sur un terrain non équipé'],
    ['Gentrification', 'Embourgeoisement d’un quartier populaire'],
    ['Quartier résidentiel fermé', 'Enclave close aux entrées gardées'],
  ],
  ordre: ['La ville-centre', 'La banlieue', 'L’espace périurbain', 'L’espace rural'],
  consigne: {
    prompt: 'Dans le modèle simplifié d’une grande ville, remets ces espaces dans l’ordre, du centre vers l’extérieur.',
    hint: 'Pars du cœur de la ville : en t’éloignant, les constructions se desserrent peu à peu.',
    why: 'La banlieue touche la ville-centre ; le périurbain est plus extérieur et moins dense ; au-delà vient le rural.',
    fin: 'En partant du cœur, on commence par',
    quote: G_EXTERIEUR,
    src: BANLIEUE,
  },
  sources: [FRAGMENT, BANLIEUE],
  libres: [
    {
      q: 'Comment appelle-t-on l’embourgeoisement d’un quartier populaire, qui évince peu à peu ses habitants les plus modestes ?',
      accepted: ['gentrification', 'la gentrification', 'une gentrification'],
      traps: [
        { text: 'périurbanisation', why: 'La périurbanisation étend la ville en périphérie.' },
        {
          text: 'métropolisation',
          why: 'La métropolisation concentre populations et activités dans de grandes villes.',
        },
      ],
      quote: G_EVICTION,
      explain: 'La gentrification fait monter les prix : les habitants modestes doivent souvent partir.',
      src: GENTRI,
    },
    {
      q: 'Comment appelle-t-on l’extension du bâti et des routes en périphérie des agglomérations, liée à l’essor de l’automobile ?',
      accepted: ['périurbanisation', 'la périurbanisation', 'étalement urbain', 'l’étalement urbain'],
      traps: [
        { text: 'gentrification', why: 'La gentrification touche l’habitat et la population d’un quartier populaire.' },
        { text: 'exode rural', why: 'L’exode rural est un départ des campagnes vers les villes.' },
      ],
      quote: G_AUTO,
      explain: 'L’automobile et le désir d’une maison individuelle ont poussé la ville à s’étendre.',
      src: PERIURB,
    },
    {
      q: 'Dans le modèle centre-périphérie, comment nomme-t-on les espaces dépendant d’un centre ?',
      accepted: ['périphérie', 'périphéries', 'la périphérie', 'les périphéries', 'une périphérie', 'des périphéries'],
      traps: [
        { text: 'le centre', why: 'Le centre est l’espace qui commande, pas celui qui dépend.' },
        { text: 'la capitale', why: 'Une capitale est une ville qui dirige un État, ce n’est pas l’espace dépendant.' },
      ],
      quote: G_DEPENDANT,
      explain: 'Les espaces dépendant d’un centre forment sa périphérie.',
      src: CENTRE,
    },
    {
      q: 'Quel sigle anglais désigne le quartier des affaires d’une ville nord-américaine ?',
      accepted: ['CBD', 'le CBD', 'C.B.D.'],
      traps: [
        { text: 'AMM', why: 'L’AMM désigne les grandes métropoles reliées à l’échelle mondiale.' },
        { text: 'ONU', why: 'L’ONU est l’Organisation des Nations unies.' },
      ],
      quote: G_CBD_AMERIQUE,
      explain: 'CBD signifie Central Business District : ailleurs, on préfère dire quartier des affaires.',
      src: CBD,
    },
    {
      q: 'Depuis quelle année le monde s’urbanise-t-il à grande vitesse ?',
      accepted: ['1945', 'en 1945', 'depuis 1945'],
      traps: [
        { text: '2007', why: 'En 2007, la moitié de l’humanité est devenue urbaine : l’essor a commencé avant.' },
        { text: '2050', why: '2050 est l’horizon d’une estimation, pas un début.' },
      ],
      quote: P_1945,
      explain: 'Le programme fait commencer cette urbanisation rapide en 1945.',
    },
  ],
  docs: [
    {
      title: 'Traverser la ville de Port-Sélis (ville fictive)',
      lines: [
        'Au cœur de la ville, des tours de bureaux abritent des banques et des sièges d’entreprises.',
        'Plus loin, des quartiers d’immeubles et de commerces touchent la ville-centre.',
        'Au-delà, des lotissements de maisons avec jardin s’installent sur d’anciens champs, desservis par la voiture.',
      ],
      qs: [
        {
          q: 'D’après la ligne 1, quel espace de la ville est décrit ?',
          a: 'le quartier des affaires',
          wrong: [
            { label: 'un quartier informel', why: 'Un quartier informel réunit des habitations précaires.' },
            { label: 'l’espace rural', why: 'Les tours de bureaux ne relèvent pas de l’espace rural.' },
            { label: 'un lotissement pavillonnaire', why: 'Les lotissements sont décrits à la ligne 3.' },
          ],
          quote: G_CBD,
          explain: 'Banques, sièges d’entreprises et tours : ce sont les marques d’un quartier des affaires.',
          src: CBD,
        },
        {
          q: 'Quel processus la ligne 3 illustre-t-elle ?',
          a: 'la périurbanisation',
          wrong: [
            { label: 'la gentrification', why: 'La ligne 3 ne parle pas d’un quartier populaire qui s’embourgeoise.' },
            { label: 'le rétrécissement urbain', why: 'Ici la ville s’étend, elle ne rétrécit pas.' },
            { label: 'la désindustrialisation', why: 'Aucune usine ne ferme dans ce texte.' },
          ],
          quote: G_PERIURB,
          explain: 'Des maisons s’installent sur d’anciens champs en périphérie : la ville s’étale.',
          src: PERIURB,
        },
      ],
    },
    {
      title: 'Le quartier de la Verrerie change (cas fictif)',
      lines: [
        'Autrefois, ce quartier ancien accueillait surtout des familles ouvrières.',
        'Depuis les rénovations, des cadres s’y installent et de nouvelles boutiques, plus chères, ouvrent.',
        'Les loyers montent : plusieurs familles modestes déménagent vers la périphérie.',
      ],
      qs: [
        {
          q: 'Comment un géographe nomme-t-il l’ensemble de ces changements ?',
          a: 'une gentrification',
          wrong: [
            { label: 'un mitage', why: 'Le mitage éparpille des constructions dans la campagne.' },
            {
              label: 'une périurbanisation du quartier',
              why: 'Le quartier lui-même se transforme ; il ne s’étend pas.',
            },
            { label: 'un rétrécissement urbain', why: 'Il ne s’agit pas d’une ville qui perd emplois et habitants.' },
          ],
          quote: G_GENTRI,
          explain: 'Rénovation, arrivée de ménages aisés, nouveaux commerces : le quartier s’embourgeoise.',
          src: GENTRI,
        },
        {
          q: 'D’après la ligne 3, quelle conséquence a la hausse des prix ?',
          a: 'les familles modestes sont peu à peu évincées',
          wrong: [
            { label: 'les familles modestes deviennent propriétaires', why: 'La ligne 3 dit qu’elles déménagent.' },
            { label: 'le quartier perd toutes ses boutiques', why: 'La ligne 2 annonce de nouvelles boutiques.' },
            { label: 'les loyers redeviennent bas', why: 'La ligne 3 dit que les loyers montent.' },
          ],
          quote: G_EVICTION,
          explain: 'Quand les prix montent, les habitants les plus modestes doivent partir : c’est une éviction.',
          src: GENTRI,
        },
      ],
    },
    {
      title: 'Deux voisinages à Altamira-Nord (ville fictive)',
      lines: [
        'Quartier A : un mur l’entoure ; un gardien contrôle l’unique entrée ; les habitants sont aisés.',
        'Quartier B : sur une pente, des familles ont bâti elles-mêmes des abris sans titre de propriété ni réseau d’eau.',
        'Un habitant de la banlieue voisine, plutôt riche, précise : « Banlieue ne veut pas dire quartier pauvre. »',
      ],
      qs: [
        {
          q: 'À quel type de quartier correspond le quartier A ?',
          a: 'un quartier résidentiel fermé',
          wrong: [
            { label: 'un quartier informel', why: 'Le quartier informel manque d’équipements et de titres.' },
            { label: 'un quartier des affaires', why: 'Le texte parle d’habitants, pas de bureaux.' },
            { label: 'un espace rural', why: 'Un mur et un gardien dans une ville ne décrivent pas la campagne.' },
          ],
          quote: G_FERME,
          explain: 'Clôture, entrée gardée et habitants aisés : c’est un quartier résidentiel fermé.',
          src: FERME,
        },
        {
          q: 'À quel type de quartier correspond le quartier B ?',
          a: 'un quartier informel',
          wrong: [
            { label: 'un quartier résidentiel fermé', why: 'Aucun mur ni gardien à la ligne 2.' },
            { label: 'un quartier gentrifié', why: 'Aucun embourgeoisement n’est décrit.' },
            { label: 'un quartier des affaires', why: 'Il s’agit de logements, pas de bureaux.' },
          ],
          quote: G_TITRE,
          explain: 'Abris construits par les familles, sans titre ni réseau : c’est un quartier informel.',
          src: INFORMEL,
        },
        {
          q: 'Pourquoi la remarque de la ligne 3 est-elle juste en géographie ?',
          a: 'des communes de banlieue peuvent être parmi les plus riches',
          wrong: [
            { label: 'la banlieue se trouve toujours au centre', why: 'La banlieue entoure la ville-centre.' },
            {
              label: 'toutes les banlieues sont aisées',
              why: 'Les banlieues sont très diverses : on ne généralise pas.',
            },
            { label: 'la banlieue est un autre mot pour campagne', why: 'La banlieue est un territoire urbanisé.' },
          ],
          quote: G_RICHES,
          explain:
            'La banlieue est un lieu, pas un niveau de richesse : certaines communes de banlieue sont très riches.',
          src: BANLIEUE,
        },
      ],
    },
  ],
};

// ——— Notion 2 : des villes inégalement connectées ———

const connexion: Notion = {
  classe: '4e',
  id: 'g4-villes-connectees',
  title: 'Des villes inégalement connectées aux réseaux de la mondialisation',
  hint: 'Pense aux liaisons d’une ville avec le reste du monde (voyageurs, marchandises, argent, informations) : en a-t-elle beaucoup ou peu ?',
  memo: [
    'La **mondialisation** relie les villes par des **réseaux** qui portent des **flux**. La **métropolisation** concentre habitants et activités dans les grandes villes. Les **villes mondiales** commandent une grande part de l’économie.',
    'Les grandes métropoles reliées entre elles forment l’**archipel métropolitain mondial** ; un **hub** est un nœud où convergent des lignes de transport.',
    'D’autres villes restent à l’écart : une **ville rétrécissante** perd habitants et emplois, comme Detroit aux États-Unis.',
  ],
  faits: [
    {
      q: 'Face à la mondialisation, quelle différence observe-t-on entre les villes ?',
      a: 'certaines sont bien connectées, d’autres plus à l’écart',
      wrong: [
        {
          label: 'toutes sont connectées de la même façon',
          why: 'Au contraire, les villes ne sont pas toutes aussi bien reliées.',
        },
        {
          label: 'seules les villes côtières existent dans la mondialisation',
          why: 'La différence porte sur la connexion aux réseaux ; des villes de l’intérieur participent aussi à la mondialisation.',
        },
        {
          label: 'les villes n’ont plus aucun lien entre elles',
          why: 'Les grands réseaux relient justement les villes.',
        },
      ],
      gap: ['Face à la mondialisation, les villes sont inégalement ', ' aux grands réseaux.', ['connectées']],
      choix: ['connectées', 'peuplées', 'anciennes'],
      quote: P_DIFFERENCES,
      explain: 'Les unes sont intégrées et entraînent la mondialisation, les autres restent plus à l’écart.',
    },
    {
      q: 'Que sont capables de faire les villes mondiales ?',
      a: 'commander l’économie mondiale',
      wrong: [
        {
          label: 'produire la majorité des céréales',
          why: 'La production agricole se fait surtout dans les campagnes.',
        },
        {
          label: 'rester coupées des réseaux internationaux',
          why: 'Au contraire, elles sont très insérées dans la mondialisation.',
        },
        {
          label: 'diriger tous les États du monde',
          why: 'Leur pouvoir est d’abord économique : chaque État reste souverain.',
        },
      ],
      gap: ['Les villes mondiales sont des métropoles capables de commander l’', ' mondiale.', ['économie']],
      choix: ['économie', 'agriculture', 'météo'],
      quote: G_MONDIALES,
      explain: 'On y trouve les centres de décision de grandes entreprises et de la finance.',
      src: MONDIALES,
    },
    {
      q: 'Quelle image désigne les grandes métropoles reliées entre elles par des flux intenses ?',
      a: 'l’archipel métropolitain mondial',
      wrong: [
        { label: 'la zone économique exclusive', why: 'La ZEE est un espace maritime appartenant à un État riverain.' },
        { label: 'la ville rétrécissante', why: 'Une ville rétrécissante perd des habitants et des emplois.' },
        { label: 'l’espace rural isolé', why: 'Il s’agit de grandes villes très reliées, pas de campagnes isolées.' },
      ],
      gap: ['Les grandes métropoles reliées entre elles forment l’', ' métropolitain mondial.', ['archipel']],
      choix: ['archipel', 'estran', 'désert'],
      quote: G_ARCHIPEL,
      explain: 'Comme des îles reliées entre elles, ces métropoles échangent beaucoup.',
      src: ARCHIPEL,
    },
    {
      q: 'Dans un réseau de transport, qu’est-ce qu’un hub ?',
      a: 'le nœud central vers lequel convergent les lignes',
      wrong: [
        { label: 'une ligne sans aucune correspondance', why: 'Le hub sert justement aux correspondances.' },
        { label: 'une ville qui a perdu tous ses habitants', why: 'Le hub est un point d’échanges très actif.' },
        { label: 'un quartier réservé au logement', why: 'Le hub concerne les transports, pas le logement.' },
      ],
      gap: ['Le nœud de transport vers lequel convergent les lignes s’appelle un ', '.', ['hub']],
      choix: ['hub', 'CBD', 'mitage'],
      quote: G_HUB,
      explain:
        'Les lignes arrivent au hub et en repartent : on y change d’avion ou des marchandises y changent de transport.',
      src: HUB,
    },
    {
      q: 'Que portent les réseaux dans la mondialisation ?',
      a: 'les flux d’échanges',
      wrong: [
        { label: 'les reliefs du sol', why: 'Le relief appartient au milieu naturel.' },
        { label: 'les saisons', why: 'Les saisons ne circulent pas par des réseaux.' },
        {
          label: 'les frontières des communes',
          why: 'Les frontières limitent des territoires, elles ne circulent pas.',
        },
      ],
      gap: ['Les réseaux sont les supports des ', ' d’échanges.', ['flux']],
      choix: ['flux', 'reliefs', 'climats'],
      quote: G_RESEAU,
      explain: 'Personnes, marchandises, capitaux et informations circulent par des réseaux.',
      src: RESEAU,
    },
    {
      q: 'Qu’est-ce qui caractérise une ville rétrécissante (shrinking city) ?',
      a: 'elle perd des habitants et des activités',
      wrong: [
        { label: 'elle gagne beaucoup d’habitants chaque année', why: 'C’est l’inverse d’un rétrécissement.' },
        { label: 'ses bâtiments sont devenus plus petits', why: 'Le mot parle de la population et de l’économie.' },
        { label: 'elle est entièrement entourée de murs', why: 'Cela évoque un quartier fermé, pas un déclin urbain.' },
      ],
      gap: ['Une ville rétrécissante perd des habitants et des ', '.', ['emplois']],
      choix: ['emplois', 'frontières', 'saisons'],
      quote: G_TROIS,
      explain: 'Le déclin touche à la fois la population, l’économie et la vie sociale.',
      src: SHRINK,
    },
    {
      q: 'Laquelle de ces villes est un exemple de ville rétrécissante ?',
      a: 'Detroit',
      wrong: [
        { label: 'Singapour', why: 'Singapour est un grand nœud d’échanges, très connecté.' },
        { label: 'Londres', why: 'Londres est une ville mondiale, très insérée dans la mondialisation.' },
        { label: 'Tokyo', why: 'Tokyo fait partie des grandes villes mondiales.' },
      ],
      gap: ['Detroit est un exemple de ville confrontée au « ', ' ».', ['rétrécissement']],
      choix: ['rétrécissement', 'littoral', 'tourisme'],
      quote: P_ECART,
      explain:
        'Detroit, aux États-Unis, est un exemple connu de « shrinking city », c’est-à-dire de ville rétrécissante.',
    },
  ],
  paires3: [
    ['Ville mondiale', 'Métropole capable de commander l’économie mondiale'],
    ['Hub', 'Nœud où convergent les lignes de transport'],
    ['Ville rétrécissante', 'Ville qui perd habitants et emplois'],
  ],
  paires5: [
    ['Ville mondiale', 'Métropole capable de commander l’économie mondiale'],
    ['Hub', 'Nœud où convergent les lignes de transport'],
    ['Ville rétrécissante', 'Ville qui perd habitants et emplois'],
    ['Réseau', 'Ensemble de lignes qui porte les flux'],
    ['Archipel métropolitain mondial', 'Grandes métropoles reliées entre elles'],
  ],
  sources: [MONDIALISATION],
  libres: [
    {
      q: 'Quel mot anglais désigne le nœud d’un réseau de transport où l’on fait des correspondances, comme dans certains grands aéroports ?',
      accepted: ['hub', 'un hub', 'le hub'],
      traps: [
        { text: 'CBD', why: 'Le CBD est un quartier des affaires.' },
        { text: 'megacity', why: 'Megacity désigne une mégapole, une ville géante.' },
      ],
      quote: G_CORRESPONDANCE,
      explain: 'Le hub regroupe les passagers ou les marchandises avant de les répartir.',
      src: HUB,
    },
    {
      q: 'Cite une ville des États-Unis qui illustre le « rétrécissement » urbain (shrinking city).',
      accepted: [
        'Detroit',
        'Détroit',
        'Cleveland',
        'Pittsburgh',
        'Buffalo',
        'Baltimore',
        'Cincinnati',
        'Philadelphie',
        'Saint-Louis',
        'Saint Louis',
      ],
      traps: [
        { text: 'New York', why: 'New York est une ville mondiale, très reliée au reste du monde.' },
        { text: 'Los Angeles', why: 'Los Angeles compte parmi les villes mondiales les plus citées.' },
      ],
      quote: G_VILLES_US,
      explain: 'Detroit est l’exemple le plus connu : ces villes industrielles ont perdu beaucoup d’habitants.',
      src: SHRINK,
    },
    {
      q: 'Comment appelle-t-on le processus de concentration des populations et des activités dans les grandes villes ?',
      accepted: ['métropolisation', 'la métropolisation', 'une métropolisation'],
      traps: [
        { text: 'périurbanisation', why: 'La périurbanisation étend la ville en périphérie.' },
        { text: 'mondialisation', why: 'La mondialisation intensifie les échanges à l’échelle du monde.' },
      ],
      quote: G_METROPOLISATION,
      explain: 'La métropolisation renforce le poids des plus grandes villes.',
      src: METROPOLISATION,
    },
    {
      q: 'Quel mot désigne les lignes et les relations qui servent de supports aux flux d’échanges entre les villes ?',
      accepted: ['réseaux', 'réseau', 'les réseaux', 'un réseau', 'des réseaux', 'le réseau'],
      traps: [
        { text: 'flux', why: 'Les flux sont ce qui circule ; on demande leurs supports.' },
        { text: 'frontières', why: 'Les frontières séparent des États, elles ne portent pas les flux.' },
      ],
      quote: G_RESEAU,
      explain: 'Un réseau relie des lieux : routes, câbles ou lignes aériennes portent les flux.',
      src: RESEAU,
    },
  ],
  docs: [
    {
      title: 'Deux villes, deux trajectoires (cas fictifs)',
      lines: [
        'Néo-Marine : son aéroport relie de nombreux continents et ses bureaux accueillent des sièges d’entreprises.',
        'Ferrolac : ses usines ont fermé, des milliers d’habitants sont partis et des logements restent vides.',
        'Ferrolac dispose de peu de liaisons avec les grandes places d’affaires étrangères.',
      ],
      qs: [
        {
          q: 'D’après les lignes 2 et 3, comment qualifier Ferrolac ?',
          a: 'une ville rétrécissante, à l’écart des réseaux mondiaux',
          wrong: [
            {
              label: 'une ville mondiale au sommet de la hiérarchie',
              why: 'Elle perd des habitants et des activités.',
            },
            { label: 'un hub aérien international', why: 'La ligne 3 dit qu’elle a peu de liaisons.' },
            { label: 'un quartier des affaires en plein essor', why: 'Les usines ferment et les logements se vident.' },
          ],
          quote: G_SHRINK,
          explain: 'Perte d’habitants, d’activités et peu de connexions : c’est un cas de rétrécissement.',
          src: SHRINK,
        },
        {
          q: 'Quel indice de la ligne 1 montre que Néo-Marine est insérée dans la mondialisation ?',
          a: 'elle accueille des sièges d’entreprises et des liaisons lointaines',
          wrong: [
            { label: 'elle a des logements vides', why: 'Cela concerne Ferrolac.' },
            { label: 'ses usines ont fermé', why: 'C’est la situation de Ferrolac.' },
            { label: 'elle n’a aucune liaison avec l’étranger', why: 'La ligne 1 dit qu’elle relie des continents.' },
          ],
          quote: G_INSERTION,
          explain:
            'Une ville mondiale se juge à son degré d’insertion : sièges d’entreprises et liaisons lointaines en sont des signes.',
          src: MONDIALES,
        },
      ],
    },
    {
      title: 'Un réseau de métropoles (cas fictif)',
      lines: [
        'Chaque jour, trois grandes métropoles lointaines échangent capitaux, voyageurs et données.',
        'L’une d’elles échange davantage avec ces deux villes qu’avec les campagnes qui l’entourent.',
        'Sur la carte, de nombreux territoires voisins restent presque sans liaisons.',
      ],
      qs: [
        {
          q: 'Quelle expression décrit le lien entre ces trois métropoles ?',
          a: 'l’archipel métropolitain mondial',
          wrong: [
            {
              label: 'la conurbation',
              why: 'Une conurbation réunit des villes proches dont les constructions se touchent.',
            },
            { label: 'le mitage', why: 'Le mitage concerne des constructions dispersées à la campagne.' },
            { label: 'la périurbanisation', why: 'La périurbanisation étend une ville sur sa périphérie.' },
          ],
          quote: G_ECHANGES,
          explain:
            'Des métropoles reliées surtout entre elles, comme des îles : voilà l’archipel métropolitain mondial.',
          src: AMM,
        },
        {
          q: 'Que montrent les territoires de la ligne 3 ?',
          a: 'des espaces laissés à l’écart de la mondialisation',
          wrong: [
            { label: 'les centres de commandement de l’économie', why: 'Ils sont presque sans liaisons.' },
            { label: 'des hubs très fréquentés', why: 'Un hub concentre au contraire les liaisons.' },
            { label: 'des villes mondiales', why: 'Les villes mondiales sont très reliées.' },
          ],
          quote: G_COMPTE,
          explain: 'L’image de l’archipel fait apparaître, en creux, les espaces peu reliés.',
          src: AMM,
        },
      ],
    },
    {
      title: 'Données et câbles (cas fictif)',
      lines: [
        'Une entreprise de la ville de Kaléo envoie chaque jour des milliers de messages à l’étranger.',
        'Son directeur affirme : « Ces informations sont immatérielles, elles n’ont besoin de rien. »',
        'La professeure répond que des câbles et des centres de données les font circuler.',
      ],
      qs: [
        {
          q: 'Pourquoi la professeure a-t-elle raison ?',
          a: 'les flux immatériels reposent sur des équipements matériels',
          wrong: [
            {
              label: 'les messages voyagent uniquement par bateau',
              why: 'Les données circulent par des câbles et des serveurs.',
            },
            { label: 'les réseaux n’existent que dans les campagnes', why: 'Les réseaux relient aussi les villes.' },
            {
              label: 'les informations ne franchissent aucune frontière',
              why: 'La ligne 1 montre des envois à l’étranger.',
            },
          ],
          quote: G_MATERIEL,
          explain: 'Même immatériels, les flux ont besoin de câbles, de serveurs et de centres de données.',
          src: RESEAU,
        },
      ],
    },
  ],
};

// ——— Notion 3 : le vocabulaire ———

const vocabulaire: Notion = {
  classe: '4e',
  id: 'g4-vocabulaire-urbanisation',
  title: 'Le vocabulaire de l’urbanisation du monde',
  hint: 'Cherche le critère du mot : la taille de la ville, son pouvoir, sa forme dans l’espace ou un changement en cours.',
  memo: [
    'La **métropole** se reconnaît à ses fonctions de commandement ; la **mégapole** à sa population (10 millions d’habitants ou plus).',
    'Quand des villes se rejoignent en s’étendant, c’est une **conurbation** ; un très vaste réseau de grandes villes forme une **mégalopole**.',
    'La ville-centre et la **banlieue** forment une **agglomération** ; le **mitage** éparpille des constructions dans la campagne.',
  ],
  faits: [
    {
      q: 'Qu’est-ce qui définit avant tout une métropole ?',
      a: 'ses fonctions de commandement et d’organisation',
      wrong: [
        {
          label: 'sa seule population',
          why: 'Géoconfluences précise que la population ne suffit pas à définir une métropole.',
        },
        { label: 'la présence d’un port', why: 'Un port ne suffit pas : on regarde le pouvoir de commandement.' },
        { label: 'son ancienneté', why: 'L’âge d’une ville ne la rend pas métropole.' },
      ],
      gap: ['Une métropole exerce des fonctions de ', ' sur une région.', ['commandement']],
      choix: ['commandement', 'pêche', 'repos'],
      quote: G_METROPOLE,
      explain: 'Une métropole commande, organise et fait avancer une région reliée au reste du monde.',
      src: METROPOLE,
    },
    {
      q: 'À partir de combien d’habitants une agglomération est-elle une mégapole selon l’ONU ?',
      a: '10 millions',
      wrong: [
        { label: '1 million', why: 'Un million est très inférieur au seuil de l’ONU.' },
        { label: '100 000', why: 'Cent mille habitants n’est pas le seuil d’une ville géante.' },
        { label: '100 millions', why: 'Le seuil de l’ONU est dix fois plus bas.' },
      ],
      gap: ['Selon l’ONU, une mégapole compte au moins ', ' millions d’habitants.', ['10']],
      choix: ['10', '1', '100'],
      quote: G_MEGAPOLE,
      explain: 'Les mégapoles sont des villes géantes ; d’autres géographes retiennent parfois un seuil différent.',
      src: MEGAPOLE,
    },
    {
      q: 'Comment appelle-t-on un vaste réseau de grandes villes reliées par un tissu dense d’axes de transport ?',
      a: 'une mégalopole',
      wrong: [
        { label: 'un hameau', why: 'Un hameau est un tout petit groupe de maisons.' },
        { label: 'un quartier informel', why: 'Un quartier informel est une partie d’une ville.' },
        { label: 'une mégapole', why: 'Une mégapole est une seule ville géante, pas un réseau de villes.' },
      ],
      gap: ['Une ', ' est un réseau de villes à vaste échelle.', ['mégalopole']],
      choix: ['mégalopole', 'mégapole', 'banlieue'],
      quote: G_MEGALOPOLE,
      explain: 'La mégalopole relie plusieurs grandes villes sur une vaste étendue.',
      src: MEGALOPOLE,
    },
    {
      q: 'Comment appelle-t-on des villes qui finissent par se rejoindre à force de s’étendre ?',
      a: 'une conurbation',
      wrong: [
        { label: 'une gentrification', why: 'La gentrification embourgeoise un quartier.' },
        { label: 'une désindustrialisation', why: 'Elle désigne le recul de l’industrie.' },
        { label: 'un mitage', why: 'Le mitage disperse des constructions, il ne soude pas des villes.' },
      ],
      gap: ['Des villes soudées par l’extension de leurs périphéries forment une ', '.', ['conurbation']],
      choix: ['conurbation', 'banlieue', 'gentrification'],
      quote: G_CONURBATION,
      explain: 'En s’étendant, plusieurs villes se touchent et se répartissent des fonctions.',
      src: CONURBATION,
    },
    {
      q: 'Quel ensemble la ville-centre et sa banlieue forment-elles ?',
      a: 'une agglomération urbaine',
      wrong: [
        {
          label: 'une mégalopole',
          why: 'La mégalopole réunit de nombreuses grandes villes sur une très vaste étendue.',
        },
        { label: 'un quartier informel', why: 'Un quartier informel est un type d’habitat.' },
        { label: 'un hub', why: 'Un hub est un nœud de transport.' },
      ],
      gap: ['La ville-centre et la banlieue forment une ', ' urbaine.', ['agglomération']],
      choix: ['agglomération', 'campagne', 'frontière'],
      quote: G_AGGLO,
      explain: 'L’agglomération réunit la ville-centre et les communes urbanisées qui l’entourent.',
      src: BANLIEUE,
    },
    {
      q: 'Comment appelle-t-on l’éparpillement de constructions, sans plan cohérent, dans des espaces au départ ruraux ?',
      a: 'le mitage',
      wrong: [
        { label: 'la gentrification', why: 'La gentrification concerne un quartier populaire.' },
        { label: 'la métropolisation', why: 'La métropolisation concentre dans les grandes villes.' },
        { label: 'le rétrécissement', why: 'Le rétrécissement est une perte d’habitants et d’activités.' },
      ],
      gap: ['Des maisons et des zones d’activité éparpillées dans la campagne : c’est le ', '.', ['mitage']],
      choix: ['mitage', 'hub', 'quartier d’affaires'],
      quote: G_MITAGE,
      explain: 'Comme des trous de mites dans un tissu, les constructions parsèment des champs et des bois.',
      src: MITAGE,
    },
    {
      q: 'Pourquoi dit-on que l’urbanisation est un processus ?',
      a: 'elle désigne un changement qui se déroule dans le temps',
      wrong: [
        { label: 'elle désigne un bâtiment précis', why: 'Un processus est une évolution, pas un objet.' },
        { label: 'elle désigne une frontière fixe', why: 'Une frontière n’est pas l’évolution des villes.' },
        { label: 'elle désigne un seul quartier', why: 'Le mot s’applique à un mouvement d’ensemble.' },
      ],
      gap: ['L’urbanisation a une dimension dynamique : c’est un ', '.', ['processus']],
      choix: ['processus', 'quartier', 'bâtiment'],
      quote: G_PROCESSUS,
      explain: 'Un processus avance dans le temps : ici, la part et l’espace des villes évoluent.',
      src: URBAIN,
    },
  ],
  paires3: [
    ['Mégapole', 'Agglomération d’au moins 10 millions d’habitants'],
    ['Conurbation', 'Villes soudées par leurs périphéries'],
    ['Mitage', 'Constructions éparpillées dans la campagne'],
  ],
  paires5: [
    ['Mégapole', 'Agglomération d’au moins 10 millions d’habitants'],
    ['Conurbation', 'Villes soudées par leurs périphéries'],
    ['Mitage', 'Constructions éparpillées dans la campagne'],
    ['Métropole', 'Ville qui exerce des fonctions de commandement'],
    ['Mégalopole', 'Vaste réseau de grandes villes bien reliées'],
  ],
  sources: [MONDIALISATION],
  libres: [
    {
      q: 'Comment appelle-t-on une ville géante, d’au moins 10 millions d’habitants selon l’ONU ?',
      accepted: ['mégapole', 'une mégapole', 'la mégapole', 'mégapoles', 'mégaville', 'une mégaville', 'megacity'],
      traps: [
        { text: 'mégalopole', why: 'La mégalopole est un réseau de plusieurs villes, pas une seule ville géante.' },
        { text: 'métropole', why: 'Une métropole se définit par ses fonctions, pas par ce seuil.' },
      ],
      quote: G_MEGAPOLE,
      explain: 'La mégapole se définit par le nombre d’habitants.',
      src: MEGAPOLE,
    },
    {
      q: 'Quel mot désigne le processus continu d’intensification des échanges à travers le monde ?',
      accepted: ['mondialisation', 'la mondialisation', 'une mondialisation'],
      traps: [
        { text: 'urbanisation', why: 'L’urbanisation concerne le développement des villes.' },
        { text: 'métropolisation', why: 'La métropolisation concentre dans les grandes villes.' },
      ],
      quote: G_MONDIALISATION,
      explain: 'La mondialisation intensifie et fluidifie les échanges de personnes, de biens et d’informations.',
      src: MONDIALISATION,
    },
    {
      q: 'Comment appelle-t-on l’ensemble des communes urbanisées autour d’une ville-centre et sous son influence ?',
      accepted: [
        'banlieue',
        'la banlieue',
        'les banlieues',
        'banlieues',
        'une banlieue',
        'périphérie',
        'la périphérie',
      ],
      traps: [
        { text: 'mégalopole', why: 'La mégalopole réunit de grandes villes sur une vaste étendue.' },
        { text: 'campagne', why: 'Ces communes sont urbanisées, elles ne forment pas la campagne.' },
        { text: 'agglomération', why: 'L’agglomération comprend aussi la ville-centre ; on demande ce qui l’entoure.' },
      ],
      quote: G_BANLIEUE,
      explain: 'La banlieue est faite de communes urbanisées liées à la ville-centre.',
      src: BANLIEUE,
    },
    {
      q: 'Quel mot désigne l’ensemble urbain formé par une ville-centre et sa banlieue ?',
      accepted: [
        'agglomération',
        'une agglomération',
        'l’agglomération',
        'agglomération urbaine',
        'une agglomération urbaine',
      ],
      traps: [
        { text: 'banlieue', why: 'La banlieue n’est qu’une partie : elle ne comprend pas la ville-centre.' },
        { text: 'mégalopole', why: 'La mégalopole réunit de grandes villes sur une vaste étendue.' },
      ],
      quote: G_AGGLO,
      explain: 'Ville-centre et banlieue réunies forment une agglomération urbaine.',
      src: BANLIEUE,
    },
  ],
  docs: [
    {
      title: 'Les mots d’un exposé (cas fictifs)',
      lines: [
        'Ville A : 14 millions d’habitants regroupés dans une seule agglomération.',
        'Région B : trois villes voisines se sont étendues jusqu’à se toucher.',
        'Zone C : des maisons et des hangars isolés se sont multipliés au milieu des prés, sans plan d’ensemble.',
      ],
      qs: [
        {
          q: 'Quel mot convient à la ville A ?',
          a: 'une mégapole',
          wrong: [
            { label: 'une mégalopole', why: 'Il n’y a qu’une agglomération, pas un réseau de villes.' },
            { label: 'une conurbation', why: 'La ligne 1 ne parle pas de plusieurs villes soudées.' },
            { label: 'un mitage', why: 'La population est regroupée, pas éparpillée.' },
          ],
          quote: G_MEGAPOLE,
          explain: '14 millions dépassent le seuil des 10 millions : c’est une mégapole.',
          src: MEGAPOLE,
        },
        {
          q: 'Quel mot convient à la région B ?',
          a: 'une conurbation',
          wrong: [
            { label: 'un mitage', why: 'Le mitage disperse des constructions ; ici des villes se soudent.' },
            { label: 'une mégapole', why: 'Il s’agit de trois villes soudées, sans indication de population.' },
            { label: 'une gentrification', why: 'Aucun quartier ne s’embourgeoise ici.' },
          ],
          quote: G_CONURBATION,
          explain: 'Des villes qui se rejoignent par leurs périphéries forment une conurbation.',
          src: CONURBATION,
        },
        {
          q: 'Quel mot convient à la zone C ?',
          a: 'le mitage',
          wrong: [
            { label: 'la conurbation', why: 'Aucune ville ne se soude à une autre.' },
            {
              label: 'la métropolisation',
              why: 'Les activités se dispersent, elles ne se concentrent pas dans une grande ville.',
            },
            { label: 'la gentrification', why: 'Il s’agit de campagne, pas d’un quartier populaire ancien.' },
          ],
          quote: G_MITAGE,
          explain: 'Éparpillement sans plan dans des espaces ruraux : c’est le mitage.',
          src: MITAGE,
        },
      ],
    },
    {
      title: 'Un très grand ensemble urbain (récit fictif)',
      lines: [
        'Une voyageuse longe une côte : elle traverse plusieurs grandes villes reliées par autoroutes et voies ferrées.',
        'Entre elles, il reste aussi des forêts et des espaces agricoles.',
        'Son guide cite en exemple l’ensemble qui s’étend de Boston à Washington.',
      ],
      qs: [
        {
          q: 'Quel mot désigne ce type d’ensemble urbain ?',
          a: 'une mégalopole',
          wrong: [
            { label: 'une mégapole', why: 'La mégapole est une seule ville géante.' },
            { label: 'un quartier des affaires', why: 'C’est un quartier d’une ville, pas un réseau.' },
            { label: 'une ville rétrécissante', why: 'Le texte ne décrit pas une perte d’habitants.' },
          ],
          quote: G_MEGALOPOLE,
          explain: 'Plusieurs grandes villes très reliées sur une vaste étendue : c’est une mégalopole.',
          src: MEGALOPOLE,
        },
        {
          q: 'À la ligne 3, de quel exemple célèbre est-il question ?',
          a: 'la mégalopole du Nord-Est des États-Unis',
          wrong: [
            {
              label: 'la dorsale européenne',
              why: 'Elle se situe en Europe ; Boston et Washington sont aux États-Unis.',
            },
            { label: 'la mégalopole japonaise', why: 'Elle se trouve au Japon.' },
            { label: 'la ville de Detroit', why: 'Detroit est une seule ville, citée pour son rétrécissement.' },
          ],
          quote: G_BOSWASH,
          explain:
            'De Boston à Washington, sur la côte atlantique : c’est le premier ensemble à avoir été appelé ainsi.',
          src: MEGALOPOLE,
        },
      ],
    },
    {
      title: 'Métropole ou non ? (cas fictifs)',
      lines: [
        'Ville D : très peuplée, mais peu d’entreprises ou d’institutions y prennent des décisions.',
        'Ville E : moins peuplée, elle abrite des sièges d’organisations, des laboratoires et des liaisons internationales.',
        'La question posée en classe : laquelle exerce le plus de fonctions de métropole ?',
      ],
      qs: [
        {
          q: 'Quelle ville exerce le plus de fonctions de métropole ?',
          a: 'la ville E',
          wrong: [
            { label: 'la ville D', why: 'Être très peuplée ne suffit pas : on regarde le commandement.' },
            { label: 'les deux de façon identique', why: 'La ville E concentre bien plus de fonctions.' },
          ],
          quote: G_METROPOLE,
          explain: 'La métropole se juge à ses fonctions de commandement et à ses liens avec le monde.',
          src: METROPOLE,
        },
        {
          q: 'Pourquoi la population de la ville D ne suffit-elle pas à en faire une métropole ?',
          a: 'le nombre d’habitants n’est pas un critère déterminant',
          wrong: [
            {
              label: 'une métropole doit être très petite',
              why: 'Une métropole peut être très grande ; c’est seulement que la taille ne suffit pas.',
            },
            { label: 'une métropole se définit par son climat', why: 'Le climat ne définit pas une métropole.' },
          ],
          quote: G_TAILLE,
          explain: 'Certaines très grandes agglomérations exercent peu de fonctions métropolitaines.',
          src: METROPOLE,
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [espaces, connexion, vocabulaire];

export const SKILLS: readonly Skill[] = NOTIONS.map(notion);
