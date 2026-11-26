import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * Quatrième, thème 3 « Des espaces transformés par la mondialisation » (lot ge-4e-03). Les trois notions suivent les
 * trois sous-thèmes du programme : mers et océans, territoire des États-Unis, grand ensemble africain (choix retenu :
 * Afrique de l’Ouest). Les firmes transnationales et les échanges y sont intégrés. Chaque fait cite une source du
 * registre avec sa citation exacte : programme du cycle 4, glossaire et dossiers de Géoconfluences (ENS de Lyon,
 * DGESCO). Les textes à lire du niveau 5 sont écrits pour l’exercice (lieux, entreprises et personnes fictifs).
 */

const MARITIMISATION = 'geoconfluences-maritimisation';
const CONTENEUR = 'geoconfluences-conteneur';
const PASSAGE = 'geoconfluences-passage-strategique';
const ZEE = 'geoconfluences-zee';
const HAUTE_MER = 'geoconfluences-haute-mer';
const STOCK = 'geoconfluences-stock-halieutique';
const OCEAN = 'geoconfluences-ocean';
const CADRAGE_US = 'geoconfluences-dossier-etats-unis';
const RUST = 'geoconfluences-rust-belt';
const SUN = 'geoconfluences-sunbelt';
const TECHNOPOLE = 'geoconfluences-technopole';
const MEGALOPOLE = 'geoconfluences-megalopole';
const FTN = 'geoconfluences-firme-transnationale';
const RELOC = 'geoconfluences-delocalisation';
const DESINDUS = 'geoconfluences-desindustrialisation';
const INTERFACE = 'geoconfluences-interface';
const DETROIT_DICO = 'cnrtl-detroit-geographie';
const CORRIDOR = 'geoconfluences-corridor';
const CADRAGE_AF = 'geoconfluences-dossier-afrique';
const SAHEL = 'geoconfluences-sahel';
const INFORMEL = 'geoconfluences-informel';
const TERRES = 'geoconfluences-accaparement';

// Programme du cycle 4, géographie, classe de 4e, thème 3.
const P_LIGNES =
  'Intensément parcourus par les lignes de transport maritimes, essentielles au fonctionnement économique du monde';
const P_LITTORAUX = 'bordés par les littoraux qui concentrent les populations et les activités';
const P_ROLES =
  'les mers et les océans sont aussi des régulateurs climatiques, des zones exploitées pour la pêche et d’autres ressources, au centre de conflits d’intérêts nombreux';
const P_FRAGILES = 'Ce sont des milieux fragiles, dont la conservation est un problème majeur pour les sociétés';
const P_US =
  'd’adaptation d’une grande puissance attractive (qui accueille des flux migratoires importants) aux nouvelles conditions économiques et sociales issues de la mondialisation';
const P_AFRIQUE =
  'Le continent africain, quant à lui, est celui où cette mondialisation produit les effets les plus importants et où les potentiels de développement, mais aussi les fragilités sont manifestes';

// Mers et océans.
const G_OCEAN = "L'Océan mondial couvre 70,8 % de la surface de la Terre";
const G_MARITIMISATION =
  'la maritimisation est le rôle croissant joué par les mers et les océans dans l’organisation du Monde';
const G_TRAFIC =
  'le trafic maritime mondial est passé de 2,6 milliards de tonnes en 1970 à 11,07 milliards de tonnes en 2019';
const G_BOITES = 'Les conteneurs sont des boîtes métalliques de dimensions normalisées';
const G_EPINE = 'La conteneurisation est devenue l’épine dorsale de la mondialisation';
const G_PASSAGE = 'Ce sont principalement des détroits ou des canaux';
const G_DETROIT_DICO = 'Espace de mer étroit entre deux terres, qui met en communication deux étendues marines';
const G_ZEE = "dispose de l'exclusivité d'exploitation des ressources";
const G_200 = '200 milles marins internationaux (370 km)';
const G_VASTE =
  'Les États-Unis possèdent la plus vaste ZEE du monde (11,3 millions de km²) devant la France (10,2 millions de km² dont 97% outre-mer)';
const G_CONFLITS =
  'la ZEE est un enjeu géopolitique majeur pour de nombreux pays, et une source de conflits pour son contrôle';
const G_HAUTE = 'la partie de la mer située en dehors des zones de souveraineté et des ZEE des États côtiers';
const G_SURPECHE =
  'Dans le monde en 2020, 50 % des stocks suivis par la FAO sont pleinement exploités (57 % en 2009), 34 % sont surexploités';

// États-Unis.
const G_SELECTIVE =
  'la puissance états-unienne se caractérise par une valorisation sélective de certains types d’espaces, comme les métropoles, et de certaines régions, comme les littoraux';
const G_INEGALITES =
  'favorisant les grandes métropoles et les façades littorales, elle est également une source d’inégalités spatiales fortes';
const G_RUST = 'la région industrielle du Nord-Est des États-Unis';
const G_DECLIN = "évoque le déclin des industries lourdes (sidérurgie) et de l'industrie automobile";
const G_DETROIT = "dont Détroit est l'exemple le plus connu";
const G_SUN =
  'les États du pourtour méridional caractérisés par un climat chaud, un dynamisme économique et une forte croissance démographique depuis les années 1970-1980';
const G_SILICON = "Silicon Valley dans le sud de San Francisco, près de l'université de Stanford";
const G_TECHNO = 'des activités qui ont en commun de recourir à des technologies innovantes';
const G_BOSWASH = "la conurbation s'étendant le long de la côte atlantique de Boston à Washington";
const G_FTN = 'Les entreprises transnationales sont les entreprises installées dans plusieurs pays';
const G_SIEGE =
  "le siège dans les grandes métropoles riches, les activités de haute technologie dans les espaces attirant la main d'œuvre qualifiée, la production là où la main d'œuvre est la moins chère";
const G_RELOC =
  'La relocalisation des entreprises vise à mettre à profit les avantages comparatifs de sa nouvelle destination';
const G_OUVERTURE = "une conséquence de l'ouverture des échanges mondiaux";
const G_INTERFACE =
  'Une interface est une bande de contact entre deux espaces de nature différente, engendrant des échanges entre ces deux espaces';

// Afrique de l’Ouest.
const G_CEDEAO =
  "La CEDEAO est sans doute celle qui va le plus loin dans l'intégration des territoires, notamment par l'application d'un principe de libre circulation";
const G_PORTS = 'Les ports et les corridors sont incontestablement des hauts lieux de la mondialisation';
const G_INVESTIR =
  'les investissements dans les grandes infrastructures portuaires et logistiques continentales sont une tendance généralisée';
const G_CORRIDOR =
  "essentiel à l'intégration de la sous-région ouest-africaine aux réseaux de la mondialisation, il repose sur l'intégration entre elles de métropoles portuaires concurrentes";
const G_AXE =
  'Un corridor, au sens général, est un espace géographique dans lequel les régions sont parfaitement interconnectées par des liaisons terrestres ou maritimes plurimodales';
const G_URBAIN = "le continent africain s'urbanise à un rythme soutenu";
const G_SAHEL = 'des écosystèmes fragiles en raison de l’irrégularité des pluies';
const G_TRANSITION = 'de transition entre le Sahara et les régions à climat plus humides au sud';
const G_INSECURITE = 'soumise à des problèmes majeurs d’insécurité, de terrorisme et de lutte armée';
const G_INFORMEL = 'un emploi sans contrat de travail et sans protection sociale';
const G_TERRES = 'les terres accaparées se trouveraient pour moitié en Afrique';

// ——— Notion 1 : mers et océans ———

const mers: Notion = {
  classe: '4e',
  id: 'g4-mers-oceans',
  title: 'Mers et océans : un monde maritimisé',
  hint: 'Demande-toi ce qui circule sur la mer, ce qu’on y prélève et qui a le droit de le faire.',
  memo: [
    'La **maritimisation** est le rôle croissant des mers et des océans dans le monde : le trafic maritime est passé de 2,6 à 11,07 milliards de tonnes entre 1970 et 2019, grâce notamment au **conteneur**.',
    'Chaque État côtier exploite seul les ressources de sa **zone économique exclusive** (jusqu’à 370 km) ; au-delà commence la **haute mer**.',
    'Détroits et canaux sont des **passages stratégiques**, et la pêche excessive (**surpêche**) menace des milieux fragiles.',
  ],
  faits: [
    {
      q: 'Que désigne la maritimisation au sens large ?',
      a: 'le rôle croissant des mers et des océans dans l’organisation du monde',
      wrong: [
        {
          label: 'la montée du niveau de la mer sur les côtes',
          why: 'La maritimisation ne désigne pas une hausse de l’eau, mais le rôle des mers dans le monde.',
        },
        {
          label: 'le retrait des sociétés vers l’intérieur des terres',
          why: 'C’est le contraire : la mer prend une place de plus en plus grande.',
        },
        {
          label: 'la transformation d’une ville-port en station de vacances',
          why: 'La mise en tourisme d’un port est un phénomène local, pas la maritimisation.',
        },
      ],
      gap: ['La maritimisation est le rôle ', ' des mers et des océans dans l’organisation du monde.', ['croissant']],
      choix: ['croissant', 'secondaire', 'en recul'],
      quote: G_MARITIMISATION,
      explain: 'Les mers relient les territoires : leur place dans les échanges et les stratégies grandit.',
      src: MARITIMISATION,
    },
    {
      q: 'Comment le trafic maritime mondial a-t-il évolué entre 1970 et 2019 ?',
      a: 'il est passé de 2,6 à 11,07 milliards de tonnes',
      wrong: [
        {
          label: 'il est passé de 11,07 à 2,6 milliards de tonnes',
          why: 'L’évolution est inversée : le trafic a fortement augmenté.',
        },
        {
          label: 'il est resté stable autour de 2,6 milliards de tonnes',
          why: '2,6 milliards est la valeur de 1970 ; le trafic a ensuite été multiplié par plus de quatre.',
        },
        {
          label: 'il est passé de 2,6 à 3 milliards de tonnes',
          why: 'La hausse est bien plus forte que cela.',
        },
      ],
      gap: ['En 2019, le trafic maritime mondial atteint ', ' milliards de tonnes.', ['11,07']],
      choix: ['11,07', '2,6', '1,1'],
      quote: G_TRAFIC,
      explain: 'Le trafic de 2019 est plus de quatre fois celui de 1970.',
      src: MARITIMISATION,
    },
    {
      q: 'Qu’est-ce qu’un conteneur ?',
      a: 'une boîte métallique de taille normalisée pour les marchandises',
      wrong: [
        { label: 'un navire spécialisé dans la pêche', why: 'Le conteneur est une boîte, pas un bateau.' },
        {
          label: 'un quai où accostent les paquebots',
          why: 'Le quai est une partie du port, pas la boîte transportée.',
        },
        {
          label: 'un traité qui fixe les limites en mer',
          why: 'Les limites en mer relèvent du droit de la mer, pas du conteneur.',
        },
      ],
      gap: ['Les conteneurs sont des boîtes métalliques de dimensions ', '.', ['normalisées']],
      choix: ['normalisées', 'libres', 'différentes pour chaque navire'],
      quote: G_BOITES,
      explain: 'La taille standard permet de passer du navire au train ou au camion sans vider la boîte.',
      src: CONTENEUR,
    },
    {
      q: 'Que sont principalement les points de passage obligé du transport maritime ?',
      a: 'les détroits et les canaux',
      wrong: [
        { label: 'les plaines et les plateaux', why: 'Ce sont des formes de relief terrestre.' },
        { label: 'les cols de montagne', why: 'Un col se franchit à pied ou par la route, pas en navire.' },
        {
          label: 'le centre des océans, loin de toute côte',
          why: 'Au large, les navires ont de la place : le passage n’est pas étroit.',
        },
      ],
      gap: ['Les passages stratégiques sont principalement des détroits ou des ', '.', ['canaux']],
      choix: ['canaux', 'golfes', 'estuaires'],
      quote: G_PASSAGE,
      explain: 'Un passage étroit que les navires doivent emprunter est stratégique : le bloquer gêne le commerce.',
      src: PASSAGE,
    },
    {
      q: 'Dans une zone économique exclusive (ZEE), qui peut exploiter les ressources ?',
      a: 'l’État côtier, seul ou avec des accords de partage',
      wrong: [
        {
          label: 'n’importe quel navire, sans autorisation',
          why: 'La ZEE réserve l’exploitation à l’État riverain.',
        },
        {
          label: 'uniquement les Nations unies',
          why: 'Le droit de la mer fixe les règles, mais l’exploitation revient à l’État côtier.',
        },
        {
          label: 'aucun État, car les ressources y sont interdites',
          why: 'L’exploitation est autorisée, mais réservée.',
        },
      ],
      gap: ['Dans sa ZEE, l’État riverain a l’', ' de l’exploitation des ressources.', ['exclusivité']],
      choix: ['exclusivité', 'interdiction', 'obligation'],
      quote: G_ZEE,
      explain: '« Exclusive » signifie réservée : l’État côtier décide qui pêche ou fore.',
      src: ZEE,
    },
    {
      q: 'Jusqu’à quelle distance de la ligne de base (la limite sur la côte d’où l’on mesure) s’étend en principe une ZEE ?',
      a: '200 milles marins, soit 370 km',
      wrong: [
        { label: '2 000 milles marins', why: 'C’est dix fois trop.' },
        { label: '20 kilomètres', why: 'C’est beaucoup trop court.' },
        { label: '200 mètres', why: 'La ZEE se compte en milles marins, très loin au large.' },
      ],
      gap: ['La ZEE s’étend jusqu’à ', ' milles marins de la ligne de base.', ['200']],
      choix: ['200', '20', '2 000'],
      quote: G_200,
      explain: 'Si une autre côte est plus proche, on partage en principe à mi-distance.',
      src: ZEE,
    },
    {
      q: 'Selon Géoconfluences, quel pays possède la plus vaste ZEE du monde ?',
      a: 'les États-Unis',
      wrong: [
        { label: 'la Suisse', why: 'La Suisse n’a pas de côte : elle n’a pas de ZEE.' },
        { label: 'l’Autriche', why: 'L’Autriche n’a pas de côte.' },
        { label: 'la France', why: 'La France arrive juste derrière, surtout grâce à ses outre-mer.' },
        { label: 'le Brésil', why: 'Le Brésil cherche à agrandir sa ZEE, mais il n’a pas la plus vaste.' },
      ],
      gap: ['La plus vaste zone économique exclusive du monde est celle des ', '.', ['États-Unis']],
      choix: ['États-Unis', 'Pays-Bas', 'Émirats arabes unis'],
      quote: G_VASTE,
      explain:
        'Les territoires lointains donnent de grands espaces maritimes : 11,3 millions de km² pour les États-Unis.',
      src: ZEE,
    },
    {
      q: 'Qu’est-ce que la haute mer ?',
      a: 'la partie de la mer située en dehors des souverainetés et des ZEE',
      wrong: [
        {
          label: 'la bande d’eau réservée à un seul État côtier',
          why: 'Il s’agit alors de la ZEE ou des eaux territoriales.',
        },
        {
          label: 'la mer la plus profonde, quel que soit son statut',
          why: 'La haute mer est une notion juridique, pas une profondeur.',
        },
        { label: 'la marée haute le long des plages', why: 'La haute mer n’est pas un moment de la marée.' },
      ],
      gap: ['En théorie, la haute mer appartient à ', '.', ['aucun État']],
      choix: ['aucun État', 'l’État côtier le plus proche', 'un seul grand État'],
      quote: G_HAUTE,
      explain: 'Aucun État ne peut s’approprier la haute mer en théorie.',
      src: HAUTE_MER,
    },
    {
      q: 'En 2020, que dit-on des stocks de poissons suivis par la FAO (l’organisation de l’ONU pour l’alimentation et l’agriculture) ?',
      a: '34 % d’entre eux sont surexploités',
      wrong: [
        { label: 'tous sont sous-exploités', why: 'Très peu le sont : environ 6 % en 2020.' },
        { label: 'aucun n’est surexploité', why: 'Environ un tiers le sont.' },
        { label: '3 % d’entre eux sont surexploités', why: 'C’est environ dix fois trop peu.' },
      ],
      gap: ['En 2020, ', ' % des stocks de poissons suivis par la FAO sont surexploités.', ['34']],
      choix: ['34', '6', '50'],
      quote: G_SURPECHE,
      explain: 'La surpêche prélève plus de poissons que le stock ne peut en renouveler.',
      src: STOCK,
    },
    {
      q: 'Outre le transport, quels rôles le programme donne-t-il aux mers et aux océans ?',
      a: 'ils régulent le climat et fournissent des ressources comme la pêche',
      wrong: [
        { label: 'ils ne servent qu’aux loisirs', why: 'Le programme cite des rôles bien plus larges.' },
        {
          label: 'ils sont sans conflits ni enjeux',
          why: 'Ils sont au contraire au centre de conflits d’intérêts nombreux.',
        },
        {
          label: 'ils sont des milieux que rien ne peut abîmer',
          why: 'Ce sont des milieux fragiles.',
        },
      ],
      gap: ['Les mers et les océans sont des régulateurs ', '.', ['climatiques']],
      choix: ['climatiques', 'politiques', 'agricoles'],
      quote: P_ROLES,
      explain: 'Climat, pêche, autres ressources : plusieurs usages se rencontrent sur le même espace.',
    },
    {
      q: 'Qu’est-ce qui borde les mers et concentre populations et activités ?',
      a: 'les littoraux',
      wrong: [
        { label: 'les déserts froids', why: 'Ils sont peu peuplés.' },
        { label: 'les hautes montagnes', why: 'Les sommets sont peu peuplés et loin de la mer.' },
        { label: 'les calottes glaciaires', why: 'Presque personne n’y vit.' },
      ],
      gap: ['Les ', ' concentrent les populations et les activités au bord des mers.', ['littoraux']],
      choix: ['littoraux', 'sommets', 'glaciers'],
      quote: P_LITTORAUX,
      explain: 'Ports, villes et usines s’installent près des routes maritimes.',
    },
  ],
  paires3: [
    ['conteneur', 'boîte normalisée pour transporter des marchandises'],
    ['ZEE', 'espace de mer où un État côtier exploite seul les ressources'],
    ['détroit', 'passage naturel étroit entre deux terres'],
  ],
  paires5: [
    ['maritimisation', 'rôle croissant des mers dans le monde'],
    ['haute mer', 'espace marin hors des ZEE et des souverainetés'],
    ['surpêche', 'pêche qui dépasse ce que les stocks peuvent renouveler'],
    ['canal', 'passage creusé par l’homme que des navires empruntent'],
    ['littoral', 'espace au contact de la terre et de la mer'],
  ],
  ordre: ['le littoral', 'les eaux territoriales', 'la zone économique exclusive', 'la haute mer'],
  consigne: {
    prompt: 'Remets ces espaces dans l’ordre, de la côte vers le large.',
    hint: 'Pars de la terre ferme, puis demande-toi quels droits l’État côtier garde quand on s’éloigne.',
    why: 'Le littoral est au bord. Viennent les eaux territoriales (la bande de mer la plus proche, où l’État est souverain), puis la ZEE, située avant les eaux internationales (la haute mer).',
    fin: 'Le plus proche de la terre est',
    quote: 'située entre les eaux territoriales et les eaux internationales',
    src: ZEE,
  },
  libres: [
    {
      q: 'Quel sigle désigne la zone de mer où un État côtier exploite seul les ressources ?',
      accepted: ['ZEE', 'la ZEE', 'zone économique exclusive', 'la zone économique exclusive'],
      traps: [
        { text: 'haute mer', why: 'La haute mer n’appartient à aucun État.' },
        { text: 'littoral', why: 'Le littoral est le contact entre terre et mer, pas une zone juridique au large.' },
      ],
      quote: G_ZEE,
      explain: 'La zone économique exclusive réserve les ressources à l’État riverain.',
      src: ZEE,
    },
    {
      q: 'Quel mot désigne un passage maritime naturel et étroit entre deux terres ?',
      accepted: ['détroit', 'un détroit', 'le détroit', 'détroits', 'des détroits'],
      traps: [
        { text: 'canal', why: 'Un canal est creusé par l’homme ; ici le passage est naturel.' },
        { text: 'isthme', why: 'Un isthme est une bande de terre, pas un passage maritime.' },
      ],
      quote: G_DETROIT_DICO,
      explain: 'Un détroit relie deux étendues de mer ; certains sont des passages très fréquentés par les navires.',
      src: DETROIT_DICO,
    },
    {
      q: 'Quel processus désigne le rôle croissant des mers et des océans dans le monde ?',
      accepted: ['maritimisation', 'la maritimisation'],
      traps: [
        {
          text: 'littoralisation',
          why: 'La littoralisation est la concentration des hommes et des activités près des côtes.',
        },
        { text: 'urbanisation', why: 'L’urbanisation est la croissance des villes.' },
      ],
      quote: G_MARITIMISATION,
      explain: 'La maritimisation met la mer au cœur des échanges et des stratégies.',
      src: MARITIMISATION,
    },
    {
      q: 'Quelle boîte métallique normalisée est devenue l’épine dorsale de la mondialisation ?',
      accepted: [
        'conteneur',
        'le conteneur',
        'un conteneur',
        'conteneurs',
        'les conteneurs',
        'container',
        'le container',
        'un container',
        'containers',
      ],
      traps: [
        { text: 'porte-conteneurs', why: 'Le porte-conteneurs est le navire qui transporte les boîtes.' },
        { text: 'cargaison', why: 'La cargaison est tout ce que transporte un navire, pas la boîte.' },
      ],
      quote: G_EPINE,
      explain: 'Le conteneur passe d’un mode de transport à l’autre sans être vidé.',
      src: CONTENEUR,
    },
  ],
  docs: [
    {
      title: 'Journal de bord (récit fictif)',
      lines: [
        'Le navire Alba charge des milliers de boîtes métalliques toutes de même taille.',
        'Il doit traverser un passage étroit creusé par l’homme, où la file d’attente dure deux jours.',
        'À l’arrivée, les boîtes partent sur des trains sans être ouvertes.',
      ],
      qs: [
        {
          q: 'Quel équipement permet de transférer la marchandise sur un train sans l’ouvrir ?',
          a: 'le conteneur',
          wrong: [
            { label: 'la ZEE', why: 'La ZEE est un espace de mer, pas un équipement.' },
            { label: 'le filet de pêche', why: 'Aucune pêche n’est évoquée.' },
            { label: 'la haute mer', why: 'C’est un statut juridique de la mer.' },
          ],
          quote: G_BOITES,
          explain: 'Les boîtes de même taille passent du navire au train.',
          src: CONTENEUR,
        },
        {
          q: 'Comment qualifier le passage étroit creusé par l’homme ?',
          a: 'un canal, passage stratégique',
          wrong: [
            { label: 'un détroit naturel', why: 'Le texte précise que le passage est creusé par l’homme.' },
            { label: 'une zone économique exclusive', why: 'La ZEE est une vaste bande de mer, pas un chenal.' },
            { label: 'un littoral touristique', why: 'Il s’agit d’une route de transport, pas d’une plage.' },
          ],
          quote: G_PASSAGE,
          explain: 'Les passages stratégiques sont surtout des détroits ou des canaux.',
          src: PASSAGE,
        },
      ],
    },
    {
      title: 'Litige au large (cas fictif)',
      lines: [
        'Deux États, Nara et Velm, ont chacun une côte face à la même petite mer.',
        'Un gisement de gaz est découvert à 120 km de Nara et à 130 km de Velm.',
        'Chacun affirme qu’il se trouve dans son espace réservé.',
      ],
      qs: [
        {
          q: 'Pour quel espace les deux États se disputent-ils les ressources ?',
          a: 'la zone économique exclusive',
          wrong: [
            { label: 'la haute mer', why: 'Le gisement est à moins de 370 km des deux côtes.' },
            { label: 'une mégalopole', why: 'C’est un ensemble de villes, pas un espace maritime.' },
            { label: 'un conteneur', why: 'C’est une boîte à marchandises.' },
          ],
          quote: G_CONFLITS,
          explain: 'Le contrôle d’une ZEE est une source de conflits.',
          src: ZEE,
        },
      ],
    },
    {
      title: 'Campagne de pêche (récit fictif)',
      lines: [
        'Dans le port de Lume, les pêcheurs rapportent chaque année moins de poissons.',
        'Les plus grands navires restent au large des semaines entières et prennent d’énormes quantités.',
        'Les jeunes poissons n’ont plus le temps de se reproduire.',
      ],
      qs: [
        {
          q: 'Quel problème le texte décrit-il ?',
          a: 'la surpêche',
          wrong: [
            { label: 'la conteneurisation', why: 'Il n’est pas question de boîtes de marchandises.' },
            { label: 'la désindustrialisation', why: 'Le texte parle de poissons, pas d’usines.' },
            { label: 'un nouveau canal', why: 'Aucun passage n’est creusé.' },
          ],
          quote: G_SURPECHE,
          explain: 'On prélève plus que le stock ne peut renouveler.',
          src: STOCK,
        },
        {
          q: 'Que montre cette situation sur les mers et les océans ?',
          a: 'ce sont des milieux fragiles à protéger',
          wrong: [
            { label: 'leurs ressources sont illimitées', why: 'Les prises baissent : les ressources s’épuisent.' },
            { label: 'la pêche n’a aucun effet sur eux', why: 'Le texte montre le contraire.' },
          ],
          quote: P_FRAGILES,
          explain: 'Leur conservation est un problème majeur pour les sociétés.',
        },
      ],
    },
    {
      title: 'Une ville-port (portrait fictif)',
      lines: [
        'Sur la côte de Sérane, le port reçoit des navires venus de trois continents.',
        'Autour des quais se sont installés des usines, des entrepôts et de nouveaux quartiers.',
        'La plupart des habitants vivent à moins de vingt kilomètres du rivage.',
      ],
      qs: [
        {
          q: 'Quel type d’espace concentre ici les habitants et les activités ?',
          a: 'le littoral',
          wrong: [
            { label: 'la haute mer', why: 'Personne n’habite en haute mer.' },
            { label: 'un massif montagneux', why: 'Le texte parle d’une côte.' },
            { label: 'un désert', why: 'Le texte décrit un espace très occupé.' },
          ],
          quote: P_LITTORAUX,
          explain: 'La proximité des routes maritimes attire les activités.',
        },
        {
          q: 'Que montre l’arrivée de navires venus de trois continents ?',
          a: 'les lignes maritimes relient des territoires très éloignés',
          wrong: [
            { label: 'le port échange seulement avec ses voisins', why: 'Les navires viennent de trois continents.' },
            {
              label: 'la mer sépare ce port du reste du monde',
              why: 'La mer le relie au contraire à d’autres continents.',
            },
          ],
          quote: P_LIGNES,
          explain: 'Les lignes de transport maritimes sont essentielles à l’économie du monde.',
        },
      ],
    },
    {
      title: 'La planète bleue (note fictive)',
      lines: [
        'L lit que l’Océan mondial couvre 70,8 % de la surface de la Terre.',
        'L cherche ce que cela change quand on compare les mers et les terres.',
      ],
      qs: [
        {
          q: 'Que peut-on en déduire ?',
          a: 'l’océan couvre plus de deux fois la surface des terres',
          wrong: [
            {
              label: 'les terres couvrent plus de surface que l’océan',
              why: 'Les terres n’occupent que 29,2 % de la surface.',
            },
            {
              label: 'l’océan et les terres se partagent la surface à égalité',
              why: '70,8 % dépasse largement la moitié.',
            },
            { label: 'l’océan recouvre toute la planète', why: 'Il reste 29,2 % pour les terres.' },
          ],
          quote: G_OCEAN,
          explain: '100 − 70,8 = 29,2 % pour les terres : l’océan couvre plus du double.',
          src: OCEAN,
        },
      ],
    },
  ],
};

// ——— Notion 2 : les États-Unis dans la mondialisation ———

const etatsUnis: Notion = {
  classe: '4e',
  id: 'g4-etats-unis-mondialisation',
  title: 'Les États-Unis : un territoire qui s’adapte à la mondialisation',
  hint: 'Demande-toi quels espaces profitent des échanges mondiaux et lesquels sont en difficulté.',
  memo: [
    'Puissance attractive, les États-Unis s’adaptent à la mondialisation : les **métropoles** et les **littoraux** sont les espaces les plus favorisés.',
    'La vieille région industrielle du Nord-Est, la **Rust Belt**, a connu un déclin ; au sud, la **Sun Belt** attire habitants et activités, et la Silicon Valley est un **technopôle**.',
    'Les **firmes transnationales** répartissent leurs activités entre pays : des **relocalisations** transforment les territoires.',
  ],
  faits: [
    {
      q: 'Quels espaces des États-Unis sont les plus valorisés par la mondialisation ?',
      a: 'les métropoles et les littoraux',
      wrong: [
        {
          label: 'les petites communes isolées de l’intérieur',
          why: 'Ces espaces restent plutôt en marge de la production de richesses.',
        },
        {
          label: 'les déserts et les hautes montagnes',
          why: 'La puissance se concentre dans les métropoles et sur les littoraux.',
        },
        {
          label: 'tous les espaces exactement de la même façon',
          why: 'La valorisation est sélective : elle crée des inégalités.',
        },
      ],
      gap: ['La puissance états-unienne valorise surtout les métropoles et les ', '.', ['littoraux']],
      choix: ['littoraux', 'campagnes isolées', 'montagnes'],
      quote: G_SELECTIVE,
      explain: 'La mondialisation choisit ses lieux : grandes villes et façades maritimes.',
      src: CADRAGE_US,
    },
    {
      q: 'Quel effet la mondialisation a-t-elle sur le territoire des États-Unis ?',
      a: 'elle crée de fortes inégalités entre les espaces',
      wrong: [
        { label: 'elle efface toutes les différences', why: 'Certains espaces sont favorisés, d’autres non.' },
        { label: 'elle ne touche aucune région', why: 'L’insertion dans les échanges transforme le territoire.' },
        {
          label: 'elle favorise uniquement les campagnes',
          why: 'Elle favorise d’abord métropoles et façades littorales.',
        },
      ],
      gap: ['La mondialisation est aussi une source d’', ' spatiales fortes.', ['inégalités']],
      choix: ['inégalités', 'égalités', 'ressemblances'],
      quote: G_INEGALITES,
      explain: 'Les atouts des uns accentuent l’écart avec les autres.',
      src: CADRAGE_US,
    },
    {
      q: 'Qu’est-ce que la Rust Belt ?',
      a: 'la vieille grande région industrielle du Nord-Est',
      wrong: [
        { label: 'la ceinture ensoleillée du Sud', why: 'C’est la Sun Belt.' },
        { label: 'la vallée des nouvelles technologies de Californie', why: 'C’est la Silicon Valley.' },
        { label: 'la ceinture agricole du Midwest uniquement', why: 'Il s’agit d’une région industrielle.' },
      ],
      gap: ['La Rust Belt est la région industrielle du ', ' des États-Unis.', ['Nord-Est']],
      choix: ['Nord-Est', 'Sud-Ouest', 'Sud'],
      quote: G_RUST,
      explain:
        'On l’appelait auparavant la Manufacturing Belt. Malgré la crise, elle reste une grande région industrielle.',
      src: RUST,
    },
    {
      q: 'Que rappelle le nom « Rust Belt » (« ceinture de la rouille ») ?',
      a: 'le déclin des industries lourdes et automobiles',
      wrong: [
        { label: 'l’essor du tourisme balnéaire', why: 'La rouille évoque des usines abandonnées.' },
        { label: 'la découverte de mines d’or', why: 'Le nom ne vient pas d’un métal précieux découvert.' },
        { label: 'l’arrivée des entreprises informatiques', why: 'Il s’agit du déclin d’anciennes industries.' },
      ],
      gap: ['Le nom Rust Belt évoque le ', ' des industries lourdes et automobiles.', ['déclin']],
      choix: ['déclin', 'succès', 'transport'],
      quote: G_DECLIN,
      explain: 'La rouille renvoie aux usines et aux machines qui ont fermé.',
      src: RUST,
    },
    {
      q: 'Quelle ville de la Rust Belt est l’exemple le plus connu de rétrécissement urbain (une ville qui perd des habitants) ?',
      a: 'Détroit',
      wrong: [
        { label: 'Miami', why: 'Miami est une métropole de la Sun Belt.' },
        { label: 'Atlanta', why: 'Atlanta est une métropole du Sud en croissance.' },
        { label: 'Los Angeles', why: 'Los Angeles est dans la Sun Belt.' },
      ],
      gap: ['La ville de ', ' est l’exemple le plus connu de rétrécissement urbain.', ['Détroit']],
      choix: ['Détroit', 'Miami', 'Atlanta'],
      quote: G_DETROIT,
      explain: 'La crise de l’industrie a fait fuir des emplois et des habitants.',
      src: RUST,
    },
    {
      q: 'Comment désigne-t-on le pourtour sud des États-Unis, au climat chaud et dynamique ?',
      a: 'la Sun Belt',
      wrong: [
        { label: 'la Rust Belt', why: 'La Rust Belt est la vieille région industrielle du Nord-Est.' },
        { label: 'la Megalopolis', why: 'Elle s’étire sur la côte atlantique de Boston à Washington.' },
        { label: 'la mégalopole japonaise', why: 'Elle se trouve au Japon.' },
      ],
      gap: ['La ', ' est la « ceinture de soleil » du sud des États-Unis.', ['Sun Belt']],
      choix: ['Sun Belt', 'Rust Belt', 'Megalopolis'],
      quote: G_SUN,
      explain: 'Climat chaud, économie dynamique et forte croissance démographique depuis les années 1970-1980.',
      src: SUN,
    },
    {
      q: 'Où se situe la Silicon Valley ?',
      a: 'au sud de San Francisco, près de l’université de Stanford',
      wrong: [
        { label: 'au centre de Détroit', why: 'Détroit est liée à l’industrie automobile.' },
        { label: 'entre Boston et Washington', why: 'Cet espace est la Megalopolis.' },
        { label: 'sur la côte de l’Alaska', why: 'La Silicon Valley se trouve en Californie.' },
      ],
      gap: ['La Silicon Valley est au sud de ', ', près de l’université de Stanford.', ['San Francisco']],
      choix: ['San Francisco', 'Chicago', 'New York'],
      quote: G_SILICON,
      explain: 'Université, recherche et entreprises innovantes sont réunies.',
      src: TECHNOPOLE,
    },
    {
      q: 'Qu’est-ce qu’une firme transnationale ?',
      a: 'une entreprise installée dans plusieurs pays',
      wrong: [
        { label: 'une entreprise présente dans un seul village', why: 'Elle doit être implantée dans plusieurs pays.' },
        { label: 'une organisation d’États', why: 'Une firme est une entreprise, pas un regroupement d’États.' },
        { label: 'un port à conteneurs', why: 'C’est une infrastructure, pas une entreprise.' },
      ],
      gap: ['Une firme transnationale est une entreprise installée dans ', ' pays.', ['plusieurs']],
      choix: ['plusieurs', 'aucun', 'un seul'],
      quote: G_FTN,
      explain: 'Elle agit à travers les frontières.',
      src: FTN,
    },
    {
      q: 'Dans sa logique d’organisation, où une firme transnationale place-t-elle souvent sa production ?',
      a: 'là où la main-d’œuvre est la moins chère',
      wrong: [
        { label: 'toujours dans la même ville que son siège', why: 'Les activités sont réparties entre territoires.' },
        { label: 'là où les salaires sont les plus élevés', why: 'Elle cherche à réduire le coût du travail.' },
        { label: 'uniquement en haute mer', why: 'La production s’installe dans des pays.' },
      ],
      gap: ['La production est souvent placée là où la main-d’œuvre est la moins ', '.', ['chère']],
      choix: ['chère', 'nombreuse', 'jeune'],
      quote: G_SIEGE,
      montre:
        'Cherchons ce que dit le site de géographie Géoconfluences : le siège dans les grandes métropoles riches, la haute technologie là où la main-d’œuvre est qualifiée, la production là où elle est la moins chère.',
      explain: 'La firme répartit ses activités pour profiter des différences entre pays.',
      src: FTN,
    },
    {
      q: 'Que cherche une entreprise qui relocalise ses activités ?',
      a: 'des avantages de sa nouvelle destination : coût, fiscalité, marchés',
      wrong: [
        { label: 'à réduire volontairement ses clients', why: 'Elle cherche au contraire de nouveaux marchés.' },
        { label: 'à payer plus d’impôts', why: 'La fiscalité avantageuse fait partie de ses motifs.' },
        { label: 'à quitter tout échange mondial', why: 'La relocalisation fait partie de la mondialisation.' },
      ],
      gap: ['La relocalisation vise à profiter des ', ' de la nouvelle destination.', ['avantages']],
      choix: ['avantages', 'inconvénients', 'frontières fermées'],
      quote: G_RELOC,
      explain: 'Coût du travail, lois, fiscalité et nouveaux marchés guident ce choix.',
      src: RELOC,
    },
    {
      q: 'Comment le programme décrit-il la puissance des États-Unis face à la mondialisation ?',
      a: 'une grande puissance attractive qui s’adapte à de nouvelles conditions',
      wrong: [
        {
          label: 'un pays fermé aux migrants',
          why: 'Le programme souligne qu’il accueille des flux migratoires importants.',
        },
        {
          label: 'un territoire qui ne change jamais',
          why: 'Le programme étudie justement son adaptation.',
        },
        { label: 'un pays sans lien avec la mondialisation', why: 'Il est au cœur des échanges mondiaux.' },
      ],
      gap: ['Les États-Unis sont une grande puissance ', ' qui accueille de nombreux migrants.', ['attractive']],
      choix: ['attractive', 'isolée', 'fermée'],
      quote: P_US,
      explain: 'L’attractivité et l’adaptation sont les deux idées clés du sous-thème.',
    },
  ],
  paires3: [
    ['Rust Belt', 'vieille région industrielle du Nord-Est'],
    ['Sun Belt', 'pourtour sud au climat chaud et dynamique'],
    ['firme transnationale', 'entreprise installée dans plusieurs pays'],
  ],
  paires5: [
    ['Silicon Valley', 'pôle d’innovation au sud de San Francisco'],
    ['Megalopolis', 'grand ensemble urbain de Boston à Washington'],
    ['relocalisation', 'déplacement d’activités pour profiter d’avantages ailleurs'],
    ['interface', 'bande de contact et d’échanges entre deux espaces'],
    ['Détroit', 'exemple célèbre de ville qui perd des habitants'],
  ],
  libres: [
    {
      q: 'Comment appelle-t-on la « ceinture de la rouille », vieille grande région industrielle du Nord-Est des États-Unis ?',
      accepted: ['Rust Belt', 'la Rust Belt', 'rustbelt', 'la rustbelt'],
      traps: [
        { text: 'Sun Belt', why: 'La Sun Belt est le pourtour sud, ensoleillé et dynamique.' },
        { text: 'Silicon Valley', why: 'C’est un pôle de nouvelles technologies en Californie.' },
      ],
      quote: G_DECLIN,
      explain: 'La rouille évoque le déclin des vieilles industries.',
      src: RUST,
    },
    {
      q: 'Comment appelle-t-on le pourtour sud des États-Unis, au climat chaud et à la forte croissance ?',
      accepted: ['Sun Belt', 'la Sun Belt', 'sunbelt', 'la sunbelt'],
      traps: [
        { text: 'Rust Belt', why: 'La Rust Belt est au Nord-Est et a connu un déclin.' },
        { text: 'Megalopolis', why: 'La Megalopolis est sur la côte atlantique du Nord-Est.' },
      ],
      quote: G_SUN,
      explain: 'La « ceinture de soleil » regroupe les États du pourtour méridional.',
      src: SUN,
    },
    {
      q: 'Quelle ville de la Rust Belt est l’exemple le plus connu de rétrécissement urbain ?',
      accepted: ['Détroit', 'Detroit', 'la ville de Détroit'],
      traps: [
        { text: 'Pittsburgh', why: 'Pittsburgh est citée pour sa reconversion réussie.' },
        { text: 'Miami', why: 'Miami est une métropole de la Sun Belt.' },
      ],
      quote: G_DETROIT,
      explain: 'Détroit a perdu des emplois et des habitants.',
      src: RUST,
    },
    {
      q: 'Quel mot désigne un site réunissant des activités innovantes, des centres de recherche et des entreprises, comme la Silicon Valley ?',
      accepted: ['technopôle', 'un technopôle', 'le technopôle', 'technopole', 'un technopole'],
      traps: [
        { text: 'mégalopole', why: 'Une mégalopole est un vaste réseau de villes.' },
        { text: 'bidonville', why: 'Un bidonville est un quartier d’habitat précaire.' },
      ],
      quote: G_TECHNO,
      explain: 'Un technopôle réunit des activités de technologies innovantes.',
      src: TECHNOPOLE,
    },
  ],
  docs: [
    {
      title: 'Deux villes (portrait fictif)',
      lines: [
        'À Fordale, au Nord-Est, deux usines d’acier ont fermé et des milliers d’habitants sont partis.',
        'À Solville, au Sud, les nouveaux bureaux se multiplient et la population augmente vite.',
        'Les deux villes sont dans le même pays.',
      ],
      qs: [
        {
          q: 'À quel grand espace des États-Unis Fordale fait-elle penser ?',
          a: 'la Rust Belt',
          wrong: [
            { label: 'la Sun Belt', why: 'La Sun Belt est dynamique et située au sud.' },
            { label: 'la haute mer', why: 'C’est un espace marin.' },
            { label: 'la Silicon Valley', why: 'C’est un pôle de technologies en Californie.' },
          ],
          quote: G_DECLIN,
          explain: 'Fermetures d’usines et départs d’habitants au Nord-Est.',
          src: RUST,
        },
        {
          q: 'Quel grand espace Solville illustre-t-elle ?',
          a: 'la Sun Belt',
          wrong: [
            { label: 'la Rust Belt', why: 'Solville connaît une forte croissance, pas un déclin.' },
            { label: 'la ZEE', why: 'La ZEE est un espace marin.' },
            { label: 'le Sahel', why: 'Le Sahel est en Afrique.' },
          ],
          quote: G_SUN,
          explain: 'Sud, dynamisme et croissance démographique.',
          src: SUN,
        },
      ],
    },
    {
      title: 'Une entreprise change de lieu (cas fictif)',
      lines: [
        'La firme imaginaire Orion garde son siège dans une grande métropole.',
        'Elle ferme une usine au Nord-Est et en ouvre une dans un pays où les salaires sont plus bas.',
        'Ses produits sont vendus dans de nombreux pays.',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on ce type d’entreprise ?',
          a: 'une firme transnationale',
          wrong: [
            { label: 'une organisation intergouvernementale', why: 'Orion est une entreprise.' },
            { label: 'un technopôle', why: 'Un technopôle est un site d’activités innovantes.' },
          ],
          quote: G_FTN,
          explain: 'Elle est installée dans plusieurs pays.',
          src: FTN,
        },
        {
          q: 'Quel processus touche le territoire quitté, au Nord-Est ?',
          a: 'une désindustrialisation',
          wrong: [
            { label: 'une littoralisation', why: 'Rien n’indique une concentration sur les côtes.' },
            { label: 'une industrialisation', why: 'Une usine ferme : l’industrie recule.' },
          ],
          quote: G_OUVERTURE,
          explain: 'L’ouverture des échanges met les territoires en concurrence.',
          src: DESINDUS,
        },
      ],
    },
    {
      title: 'La côte atlantique (carte lue par M)',
      lines: [
        'Sur sa carte, M repère de grandes villes qui se suivent de Boston jusqu’à Washington.',
        'Des autoroutes et des voies ferrées les relient entre elles.',
      ],
      qs: [
        {
          q: 'Comment désigne-t-on cet ensemble urbain ?',
          a: 'la Megalopolis (mégalopole)',
          wrong: [
            { label: 'la Sun Belt', why: 'La Sun Belt est au sud.' },
            { label: 'un bidonville', why: 'Un bidonville est un quartier précaire.' },
            { label: 'une interface désertique', why: 'Il s’agit d’un ensemble de villes.' },
          ],
          quote: G_BOSWASH,
          explain: 'Une conurbation réunit des villes qui finissent par se rejoindre : ici de Boston à Washington.',
          src: MEGALOPOLE,
        },
      ],
    },
    {
      title: 'Un port d’une côte (note fictive)',
      lines: [
        'N décrit une côte des États-Unis où s’échangent chaque jour des marchandises venues de la mer et de l’intérieur.',
        'Les ports, les entrepôts et les routes se concentrent sur cette bande.',
      ],
      qs: [
        {
          q: 'Quel mot désigne cette bande de contact et d’échanges ?',
          a: 'une interface',
          wrong: [
            { label: 'une diaspora', why: 'La diaspora est une population dispersée.' },
            { label: 'une steppe', why: 'La steppe est une végétation.' },
            { label: 'un conteneur', why: 'Un conteneur est une boîte à marchandises.' },
          ],
          quote: G_INTERFACE,
          explain: 'La côte met en contact deux espaces différents et engendre des échanges.',
          src: INTERFACE,
        },
      ],
    },
  ],
};

// ——— Notion 3 : l’Afrique de l’Ouest ———

const afrique: Notion = {
  classe: '4e',
  id: 'g4-afrique-ouest-mondialisation',
  title: 'L’Afrique de l’Ouest dans la mondialisation',
  hint: 'Demande-toi ce qui représente un atout pour le développement et ce qui rend la région fragile.',
  memo: [
    'En Afrique, la mondialisation fait apparaître des potentiels mais aussi des fragilités : en Afrique de l’Ouest, des ports et des **corridors** relient les territoires au monde.',
    'La **CEDEAO** cherche à rapprocher les États, notamment par un principe de **libre circulation**.',
    'La région compte aussi des milieux fragiles, comme au **Sahel**, et une part d’**emploi informel**.',
  ],
  faits: [
    {
      q: 'Quels deux aspects le programme met-il en avant pour le continent africain face à la mondialisation ?',
      a: 'des potentiels de développement et des fragilités',
      wrong: [
        { label: 'uniquement des fragilités', why: 'Le programme souligne aussi des potentiels.' },
        { label: 'uniquement des réussites', why: 'Le programme souligne aussi des fragilités.' },
        {
          label: 'aucun effet de la mondialisation',
          why: 'Le programme dit que les effets y sont les plus importants.',
        },
      ],
      gap: ['En Afrique, les potentiels de développement mais aussi les ', ' sont manifestes.', ['fragilités']],
      choix: ['fragilités', 'certitudes', 'égalités'],
      quote: P_AFRIQUE,
      explain: 'Atouts et difficultés existent ensemble : il faut regarder les deux.',
    },
    {
      q: 'Que cherche à favoriser la CEDEAO avec son principe de libre circulation ?',
      a: 'l’intégration des territoires de ses États',
      wrong: [
        { label: 'la fermeture de toutes les frontières', why: 'La libre circulation va dans le sens contraire.' },
        { label: 'la disparition des ports', why: 'Les ports restent des lieux importants.' },
        { label: 'la division des États en petites provinces', why: 'Il s’agit de rapprocher les États.' },
      ],
      gap: ['La CEDEAO applique un principe de libre ', '.', ['circulation']],
      choix: ['circulation', 'fermeture', 'surveillance'],
      quote: G_CEDEAO,
      montre:
        'Cherchons ce que dit un dossier de Géoconfluences (2017) : la CEDEAO est sans doute l’organisation qui va le plus loin dans l’intégration des territoires, notamment par la libre circulation, même si des difficultés demeurent.',
      explain:
        'Circuler librement rapproche les États, malgré des difficultés : trois États du Sahel se sont mis en marge de la CEDEAO.',
      src: CADRAGE_AF,
    },
    {
      q: 'Selon Géoconfluences, quels lieux sont des hauts lieux de la mondialisation en Afrique ?',
      a: 'les ports et les corridors',
      wrong: [
        { label: 'les glaciers et les sommets', why: 'Ils ne jouent pas ce rôle dans les échanges.' },
        { label: 'les villages sans aucune route', why: 'Ils restent à l’écart des grands flux.' },
        { label: 'les seules zones désertiques vides', why: 'Les échanges passent par des ports et des axes.' },
      ],
      gap: ['Les ports et les ', ' sont des hauts lieux de la mondialisation en Afrique.', ['corridors']],
      choix: ['corridors', 'pâturages', 'villages isolés'],
      quote: G_PORTS,
      explain: 'Les ports ouvrent sur la mer ; les corridors les relient à l’intérieur.',
      src: CADRAGE_AF,
    },
    {
      q: 'Dans quel domaine les investissements sont-ils une tendance généralisée en Afrique ?',
      a: 'les grandes infrastructures portuaires et logistiques',
      wrong: [
        { label: 'la fermeture des ports', why: 'Les investissements vont au contraire vers les ports.' },
        { label: 'les stations de ski', why: 'Le dossier ne parle pas de sports d’hiver.' },
        { label: 'la suppression des routes', why: 'On investit dans les transports et la logistique.' },
      ],
      gap: ['On investit beaucoup dans les infrastructures ', ' et logistiques.', ['portuaires']],
      choix: ['portuaires', 'enneigées', 'abandonnées'],
      quote: G_INVESTIR,
      explain: 'Des ports modernes accroissent les échanges avec le monde.',
      src: CADRAGE_AF,
    },
    {
      q: 'Le grand projet de corridor Abidjan-Lagos repose sur l’intégration de quels types de villes ?',
      a: 'des métropoles portuaires concurrentes',
      wrong: [
        { label: 'des stations de montagne', why: 'Abidjan et Lagos sont sur la côte.' },
        { label: 'des villages isolés du désert', why: 'Le corridor relie de grandes villes côtières.' },
        { label: 'des capitales européennes', why: 'Le corridor est en Afrique de l’Ouest.' },
      ],
      gap: ['Le projet de corridor Abidjan-Lagos repose sur des métropoles ', ' concurrentes.', ['portuaires']],
      choix: ['portuaires', 'sahariennes', 'européennes'],
      quote: G_CORRIDOR,
      explain: 'Ces ports se disputent les trafics tout en gagnant à être reliés.',
      src: CADRAGE_AF,
    },
    {
      q: 'Que se passe-t-il pour les villes du continent africain ?',
      a: 'le continent s’urbanise à un rythme soutenu',
      wrong: [
        { label: 'les villes disparaissent toutes', why: 'La population urbaine augmente.' },
        { label: 'le continent n’a aucune ville', why: 'De grandes métropoles existent.' },
        { label: 'l’urbanisation est arrêtée', why: 'Le rythme est au contraire soutenu.' },
      ],
      gap: ['Le continent africain s’urbanise à un rythme ', '.', ['soutenu']],
      choix: ['soutenu', 'nul', 'inversé'],
      quote: G_URBAIN,
      explain: 'La croissance des villes transforme l’organisation des territoires.',
      src: CADRAGE_AF,
    },
    {
      q: 'Pourquoi les écosystèmes (les milieux et les êtres vivants qui y vivent) du Sahel sont-ils fragiles ?',
      a: 'notamment parce que les pluies sont irrégulières',
      wrong: [
        { label: 'parce qu’il pleut partout tous les jours', why: 'La saison des pluies est courte et irrégulière.' },
        { label: 'parce que la région est couverte de glace', why: 'Le Sahel est une zone chaude et sèche.' },
        { label: 'parce qu’elle est entièrement recouverte par la mer', why: 'C’est une région de terres.' },
      ],
      gap: ['Au Sahel, les écosystèmes sont fragiles en raison de l’irrégularité des ', '.', ['pluies']],
      choix: ['pluies', 'marées', 'neiges'],
      quote: G_SAHEL,
      explain: 'Une année sèche fragilise l’agriculture et la végétation.',
      src: SAHEL,
    },
    {
      q: 'Quels problèmes majeurs touchent aujourd’hui le Sahel selon Géoconfluences ?',
      a: 'l’insécurité, le terrorisme et la lutte armée',
      wrong: [
        {
          label: 'la surpêche et la montée des eaux',
          why: 'Ce sont des problèmes de la mer : la source parle ici de sécurité.',
        },
        { label: 'l’excès de neige et les avalanches', why: 'Le climat y est chaud et sec.' },
        { label: 'le surtourisme balnéaire', why: 'La source ne parle pas d’un excès de touristes, mais de sécurité.' },
      ],
      gap: ['Le Sahel est soumis à des problèmes d’', ', de terrorisme et de lutte armée.', ['insécurité']],
      choix: ['insécurité', 'abondance', 'enneigement'],
      quote: G_INSECURITE,
      explain: 'Ces tensions pèsent sur les habitants et sur le développement.',
      src: SAHEL,
    },
    {
      q: 'Qu’est-ce qu’un emploi informel ?',
      a: 'un emploi sans contrat de travail et sans protection sociale',
      wrong: [
        { label: 'un emploi toujours interdit par la loi', why: 'L’informel ne se confond pas avec l’illégal.' },
        { label: 'un emploi avec contrat et protection sociale', why: 'C’est la définition inverse.' },
        { label: 'un emploi réservé aux touristes', why: 'La définition ne dépend pas des visiteurs.' },
      ],
      gap: ['L’emploi informel est sans contrat de travail et sans protection ', '.', ['sociale']],
      choix: ['sociale', 'marine', 'climatique'],
      quote: G_INFORMEL,
      explain: 'Les travailleurs ont alors peu de garanties.',
      src: INFORMEL,
    },
    {
      q: 'Des investisseurs achètent ou louent de grandes surfaces : ce sont des terres accaparées. Quelle part de ces terres dans le monde se trouverait en Afrique ?',
      a: 'environ la moitié',
      wrong: [
        { label: 'aucune', why: 'L’Afrique est au contraire très concernée.' },
        { label: 'la totalité', why: 'Les autres continents sont aussi concernés.' },
        { label: 'environ 5 %', why: 'La part avancée est bien plus élevée.' },
      ],
      gap: ['Les terres accaparées se trouveraient pour ', ' en Afrique.', ['moitié']],
      choix: ['moitié', 'un dixième', 'aucune part'],
      quote: G_TERRES,
      explain: 'Des acteurs achètent ou louent de grandes surfaces, souvent pour l’agriculture.',
      src: TERRES,
    },
  ],
  paires3: [
    ['CEDEAO', 'organisation d’États d’Afrique de l’Ouest'],
    ['corridor', 'grand axe de transport reliant des territoires'],
    ['emploi informel', 'travail sans contrat ni protection sociale'],
  ],
  paires5: [
    ['Sahel', 'zone de transition entre le Sahara et des régions plus humides'],
    ['urbanisation', 'croissance de la part des habitants qui vivent en ville'],
    ['accaparement des terres', 'acquisition de grandes surfaces par des investisseurs'],
    ['port', 'porte d’entrée des marchandises par la mer'],
    ['intégration régionale', 'rapprochement entre des États voisins'],
  ],
  libres: [
    {
      q: 'Quel est le sigle de l’organisation ouest-africaine qui applique un principe de libre circulation ?',
      accepted: ['CEDEAO', 'la CEDEAO', 'CDEAO', 'la CDEAO', 'ECOWAS'],
      traps: [
        { text: 'ONU', why: 'L’ONU réunit des États du monde entier.' },
        { text: 'ZEE', why: 'La ZEE est un espace marin.' },
      ],
      quote: G_CEDEAO,
      montre:
        'Cherchons ce que dit un dossier de Géoconfluences (2017) : la CEDEAO va loin dans l’intégration des territoires, notamment par la libre circulation.',
      explain: 'La CEDEAO réunit des États d’Afrique de l’Ouest.',
      src: CADRAGE_AF,
    },
    {
      q: 'Quel mot désigne la zone de transition entre le Sahara et les régions plus humides au sud ?',
      accepted: ['Sahel', 'le Sahel'],
      traps: [
        { text: 'Sahara', why: 'Le Sahara est le désert au nord de cette zone.' },
        { text: 'corridor', why: 'Un corridor est un axe de transport.' },
      ],
      quote: G_TRANSITION,
      explain: 'Le Sahel borde le Sahara au sud.',
      src: SAHEL,
    },
    {
      q: 'Comment qualifie-t-on un emploi sans contrat de travail et sans protection sociale ?',
      accepted: ['informel', 'informelle', 'un emploi informel', 'emploi informel', 'l’emploi informel'],
      traps: [
        { text: 'salarié', why: 'Un salarié déclaré a un contrat.' },
        { text: 'saisonnier', why: 'Un emploi saisonnier dépend de la saison, pas de l’absence de contrat.' },
      ],
      quote: G_INFORMEL,
      explain: 'C’est l’emploi informel.',
      src: INFORMEL,
    },
    {
      q: 'Quel mot désigne un grand axe de transport qui relie des ports et des territoires ?',
      accepted: ['corridor', 'un corridor', 'le corridor', 'corridors'],
      traps: [
        { text: 'détroit', why: 'Un détroit est un passage maritime étroit.' },
        { text: 'bidonville', why: 'C’est un quartier précaire.' },
      ],
      quote: G_AXE,
      montre:
        'Cherchons ce que dit le site de géographie Géoconfluences : un corridor est un espace où les régions sont bien reliées par des routes de terre ou de mer.',
      explain: 'Les corridors relient les ports à l’arrière-pays (les terres situées derrière le port).',
      src: CORRIDOR,
    },
  ],
  docs: [
    {
      title: 'Un axe côtier (projet fictif)',
      lines: [
        'En Afrique de l’Ouest, les ports de Kora et de Sélia veulent attirer les mêmes navires.',
        'Une grande route et une voie ferrée doivent les relier.',
        'Les marchandises circuleraient plus vite entre les deux pays.',
      ],
      qs: [
        {
          q: 'Quel mot convient pour cet axe de transport ?',
          a: 'un corridor',
          wrong: [
            { label: 'un détroit', why: 'Le projet est une route et une voie ferrée.' },
            { label: 'une diaspora', why: 'La diaspora est une population dispersée.' },
            { label: 'une friche', why: 'Une friche est un espace abandonné.' },
          ],
          quote: G_PORTS,
          explain: 'Il relie des ports et des territoires.',
          src: CADRAGE_AF,
        },
        {
          q: 'Quelle relation le texte décrit-il entre les deux ports ?',
          a: 'ils sont concurrents mais peuvent gagner à se relier',
          wrong: [
            { label: 'ils n’ont aucun lien et n’en auront jamais', why: 'Le projet vise à les relier.' },
            { label: 'ce sont deux villes de montagne', why: 'Ce sont des ports.' },
          ],
          quote: G_CORRIDOR,
          explain: 'La concurrence n’empêche pas la volonté d’intégration.',
          src: CADRAGE_AF,
        },
      ],
    },
    {
      title: 'Au marché (récit fictif)',
      lines: [
        'P vend des fruits au bord de la route, tous les jours, au vu de tous.',
        'Elle n’a signé aucun contrat et n’a pas de protection en cas de maladie.',
      ],
      qs: [
        {
          q: 'Comment qualifier le travail de P ?',
          a: 'un emploi informel',
          wrong: [
            { label: 'un emploi salarié protégé', why: 'Elle n’a ni contrat ni protection.' },
            { label: 'un crime organisé', why: 'L’informel ne se confond pas avec l’illégal.' },
            { label: 'une activité touristique', why: 'Elle vend des fruits aux habitants.' },
          ],
          quote: G_INFORMEL,
          explain: 'Sans contrat ni protection sociale.',
          src: INFORMEL,
        },
      ],
    },
    {
      title: 'Un village du Sahel (cas fictif)',
      lines: [
        'Au village de Dari, les pluies arrivent tard certaines années et manquent d’autres fois.',
        'Les cultures et les pâturages souffrent alors beaucoup.',
      ],
      qs: [
        {
          q: 'Quelle fragilité le texte montre-t-il ?',
          a: 'des milieux fragiles à cause de pluies irrégulières',
          wrong: [
            { label: 'une trop grande abondance d’eau chaque année', why: 'Les pluies manquent certaines années.' },
            { label: 'la concurrence entre deux ports', why: 'Le texte parle de pluies et de cultures.' },
          ],
          quote: G_SAHEL,
          explain: 'L’irrégularité des pluies fragilise le milieu.',
          src: SAHEL,
        },
      ],
    },
    {
      title: 'De grandes terres louées (cas fictif)',
      lines: [
        'Une société étrangère obtient un très grand domaine agricole pour des cultures destinées à l’exportation.',
        'Des paysans voisins craignent de perdre l’accès à leurs champs.',
      ],
      qs: [
        {
          q: 'Quel phénomène ce cas illustre-t-il ?',
          a: 'l’accaparement des terres',
          wrong: [
            { label: 'la surpêche', why: 'Il s’agit de terres, pas de poissons.' },
            { label: 'la libre circulation', why: 'La libre circulation concerne les déplacements entre États.' },
            { label: 'la métropolisation', why: 'Il n’est pas question de grandes villes.' },
          ],
          quote: G_TERRES,
          explain: 'De grandes surfaces passent sous le contrôle d’investisseurs.',
          src: TERRES,
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [mers, etatsUnis, afrique];

export const SKILLS: readonly Skill[] = NOTIONS.map(notion);
