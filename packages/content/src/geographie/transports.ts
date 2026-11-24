import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * CM2, thème 1 « Se déplacer » (lot ge-cm2-01). Chaque fait cite une source du registre avec sa citation exacte :
 * programme du cycle 3, INSEE (déplacements domicile-travail, données 2017), ADEME, Union européenne, CNRTL.
 * Les textes à lire du niveau 5 sont écrits pour l’exercice.
 */

const INSEE = 'insee-domicile-travail';
const ADEME = 'ademe-trajets';

// Programme du cycle 3, classe de CM2.
const Q_INFRA = 'L’élève découvre aussi les aménagements liés aux infrastructures de communication';
const Q_DURABLE =
  'On étudie les déplacements dans le cadre du développement durable : la lutte contre la pollution, le recyclage, les moyens de transport';

// INSEE.
const Q_VOITURE =
  '74 % des actifs en emploi qui déclarent se déplacer pour rejoindre leur lieu de travail utilisent leur voiture, 16 % prennent les transports en commun et 8 % ont recours aux modes de transport doux (6 % à la marche et 2 % au vélo)';
const Q_DOUX =
  'Le recours aux modes de transport doux (marche et vélo) est spécifique aux petites et très petites distances';
const Q_PARIS =
  '44 % des actifs en emploi y résidant utilisent métro, bus, tramway, RER ou train pour aller travailler';
const Q_TRAIN = 'Le train est en effet un mode de transport utilisé pour les longues distances';
const Q_HORS = 'hors des aires d’attraction des villes, 90 % des actifs utilisent leur voiture';

// CNRTL.
const Q_TRAJET = "Fait d'aller d'un lieu à un autre, à pied ou en utilisant un moyen de transport";
const Q_VAPORETTO = 'Petit vapeur assurant le service des voyageurs, en Italie, notamment à Venise';
const Q_GARE =
  "Ensemble des installations et bâtiments établis à certains points d'une ligne de chemin de fer, destinés à permettre l'embarquement et/ou le débarquement des voyageurs et/ou des marchandises";
const Q_AUTOROUTE = 'Voie de circulation automobile à double chaussée séparée, conçue pour un trafic rapide et intense';
const Q_AEROPORT = "Lieu aménagé pour le départ, l'arrivée, les escales des lignes aériennes";
const Q_PORT =
  "Lieu aménagé sur le littoral maritime, sur le bord d'un lac ou en certains endroits d'un cours d'eau important, pour recevoir et abriter les bateaux";
const Q_PAQUEBOT =
  'Grand navire de la marine marchande assurant, généralement de façon régulière, le transport de passagers';
const Q_AUTOBUS = "Grand véhicule automobile destiné au transport en commun à l'intérieur d'une agglomération";
const Q_TRAMWAY = 'moyen de transport public urbain constitué de voitures roulant sur des rails';
const Q_TELEPHERIQUE =
  "Dispositif de transport de personnes ou de marchandises constitué d'un câble tracteur et d'un ou de plusieurs câbles porteurs";

// Union européenne.
const Q_SCHENGEN =
  'L’espace Schengen est une zone de libre circulation sans frontières entre les 29 pays qui le composent';
const Q_CONTROLES =
  'Les autorités nationales peuvent toutefois effectuer des contrôles de police aux frontières entre ces pays et dans les zones frontalières';
const Q_PASSAGERS =
  'droits des passagers à l’échelle de l’UE pour entrer dans l’UE ou en sortir ou vous déplacer sur son territoire en avion, en train, en autobus/autocar ou en bateau';
const Q_RESEAU = 'en développant un réseau d’infrastructures modernes qui accélère et sécurise les déplacements';
const Q_CEINTURE = 'le port de la ceinture de sécurité est obligatoire dans tous les véhicules';

// ADEME.
const Q_TIERS = 'Les transports émettent 1/3 des gaz à effet de serre de la France';
const Q_SEUL = 'Les 3/4 de nos trajets domicile-travail s’effectuent en voiture, le plus souvent seul';
const Q_TGV =
  'pour un aller-retour Paris-Turin, une personne émet environ 152 kg équivalent CO₂ en avion, contre 3,3 kg seulement en TGV';
const Q_NOUVELLES =
  'de nouvelles mobilités se dessinent, notamment avec le développement des pistes cyclables, du covoiturage, de l’autopartage';
const Q_BOUGER =
  'cela permet aussi de réduire les émissions de gaz à effet de serre et les pollutions générées par les transports';

// ——— Notion 1 : au quotidien ———

const quotidien: Notion = {
  classe: 'CM2',
  id: 'gcm2-quotidien',
  title: 'Se déplacer au quotidien',
  hint: 'Pense à la distance : le lieu est-il tout près, ou loin ? Qui partage le véhicule ?',
  memo: [
    'Un **trajet**, c’est aller d’un lieu à un autre. Ton **mode de transport** dépend souvent de la distance.',
    'En France, en 2017, la plupart des **actifs** vont travailler en voiture. Les **modes doux** (marche, vélo) servent surtout aux petites distances.',
    'Ailleurs, on se déplace parfois autrement : à Venise, en Italie, un bateau appelé vaporetto transporte des voyageurs.',
  ],
  faits: [
    {
      q: 'En France, en 2017, quel transport sert le plus pour aller travailler ?',
      a: 'la voiture',
      wrong: [
        { label: 'le vélo', why: 'Le vélo ne sert qu’à 2 actifs sur 100.' },
        { label: 'la marche', why: 'La marche concerne 6 actifs sur 100.' },
        { label: 'les transports en commun', why: 'Ils concernent 16 actifs sur 100, bien moins que la voiture.' },
      ],
      gap: ['En 2017, la plupart des actifs vont travailler en ', '.', ['voiture', 'automobile', 'auto']],
      quote: Q_VOITURE,
      explain: 'La voiture concerne 74 actifs sur 100, loin devant les autres transports.',
      src: INSEE,
    },
    {
      q: 'La marche et le vélo servent surtout pour quels trajets ?',
      a: 'les petites distances',
      wrong: [
        {
          label: 'les très longues distances',
          why: 'Marcher très loin prend trop de temps : ils servent près de chez soi.',
        },
        { label: 'les voyages entre deux pays', why: 'Ils sont surtout utilisés pour de petites distances.' },
        { label: 'les trajets en avion', why: 'La marche et le vélo ne sont pas des trajets aériens.' },
      ],
      gap: ['La marche et le vélo sont surtout utilisés pour les petites ', '.', ['distances', 'distance']],
      quote: Q_DOUX,
      explain: 'Les modes doux sont liés aux petites et très petites distances.',
      src: INSEE,
    },
    {
      q: 'Dans le dictionnaire, qu’est-ce qu’un trajet ?',
      a: 'le fait d’aller d’un lieu à un autre',
      wrong: [
        { label: 'le fait de rester chez soi', why: 'Rester chez soi, c’est ne pas se déplacer.' },
        { label: 'un billet pour voyager', why: 'Le billet est un papier. Le trajet est le déplacement.' },
        { label: 'un véhicule à moteur', why: 'Un trajet peut aussi se faire à pied.' },
      ],
      gap: ['Faire un trajet, c’est aller d’un lieu à un ', '.', ['autre']],
      quote: Q_TRAJET,
      explain: 'Un trajet se fait à pied ou avec un moyen de transport.',
      src: 'cnrtl-trajet',
    },
    {
      q: 'À Venise, en Italie, qu’est-ce qu’un vaporetto ?',
      a: 'un bateau qui transporte des voyageurs',
      wrong: [
        { label: 'un train sous la terre', why: 'Le vaporetto va sur l’eau : c’est un petit bateau.' },
        { label: 'un bus à deux étages', why: 'Un bus roule sur la route. Le vaporetto est un bateau.' },
        { label: 'un petit avion', why: 'Le vaporetto ne vole pas : il navigue.' },
      ],
      gap: ['À Venise, le vaporetto est un petit ', ' pour les voyageurs.', ['bateau', 'navire']],
      quote: Q_VAPORETTO,
      explain: 'Le dictionnaire parle d’un petit « vapeur », un bateau, qui assure le service des voyageurs.',
      src: 'cnrtl-vaporetto',
    },
    {
      q: 'Dans l’aire de Paris, qu’utilisent 44 actifs sur 100 pour aller travailler ?',
      a: 'les transports en commun',
      wrong: [
        { label: 'le cheval', why: 'Le cheval n’est pas cité : on parle du métro, du bus et du train.' },
        { label: 'le bateau', why: 'Les transports cités sont le métro, le bus, le tramway, le RER et le train.' },
        {
          label: 'l’avion',
          why: 'Pour aller travailler chaque jour, ces actifs prennent métro, bus, tramway ou train.',
        },
      ],
      gap: ['Près de Paris, beaucoup d’actifs prennent les transports en ', ' : métro, bus, train.', ['commun']],
      quote: Q_PARIS,
      explain: 'Métro, bus, tramway, RER et train sont des transports en commun.',
      src: INSEE,
    },
  ],
  paires3: [
    ['Trajet', 'Aller d’un lieu à un autre'],
    ['Modes doux', 'La marche et le vélo'],
    ['Vaporetto', 'Bateau pour voyageurs à Venise'],
  ],
  paires5: [
    ['Trajet', 'Aller d’un lieu à un autre'],
    ['Modes doux', 'La marche et le vélo'],
    ['Vaporetto', 'Bateau pour voyageurs à Venise'],
    ['Transports en commun', 'Métro, bus ou tramway partagés'],
    ['Quotidien', 'Qui se passe tous les jours'],
  ],
  libres: [
    {
      q: 'En France, quel véhicule sert le plus pour aller travailler (en 2017) ?',
      accepted: ['la voiture', 'voiture', 'l’automobile', 'automobile', 'l’auto', 'auto'],
      traps: [
        { text: 'vélo', why: 'Le vélo ne concerne que 2 actifs sur 100.' },
        { text: 'train', why: 'Les transports en commun, train compris, restent loin derrière la voiture.' },
      ],
      quote: Q_VOITURE,
      explain: '74 actifs sur 100 utilisent leur voiture.',
      src: INSEE,
    },
    {
      q: 'Quel mot désigne le fait d’aller d’un lieu à un autre (il commence par « tra ») ?',
      accepted: ['trajet', 'un trajet', 'le trajet'],
      traps: [
        { text: 'travail', why: 'Le travail est une activité. Aller d’un lieu à un autre, c’est un trajet.' },
        { text: 'train', why: 'Le train est un véhicule, pas le déplacement lui-même.' },
      ],
      quote: Q_TRAJET,
      explain: 'Le mot est trajet.',
      src: 'cnrtl-trajet',
    },
    {
      q: 'Dans quelle ville italienne le vaporetto transporte-t-il des voyageurs ?',
      accepted: ['Venise', 'à Venise'],
      traps: [
        { text: 'Rome', why: 'Le dictionnaire cite surtout Venise pour le vaporetto.' },
        { text: 'Paris', why: 'Paris est en France, pas en Italie.' },
      ],
      quote: Q_VAPORETTO,
      explain: 'Le vaporetto circule en Italie, notamment à Venise.',
      src: 'cnrtl-vaporetto',
    },
  ],
  docs: [
    {
      title: 'Deux trajets du matin',
      lines: [
        'Un garçon habite tout près de son école. Il y va à pied.',
        'Sa tante habite hors de la zone d’attraction des villes. Son travail est loin.',
      ],
      qs: [
        {
          q: 'Pourquoi la marche convient-elle au garçon ?',
          a: 'parce que la distance est petite',
          wrong: [
            { label: 'parce que la distance est très longue', why: 'Le texte dit qu’il habite tout près.' },
            { label: 'parce qu’il prend le train', why: 'Il va à pied : il ne prend pas le train.' },
          ],
          quote: Q_DOUX,
          explain: 'La marche sert surtout pour les petites distances.',
          src: INSEE,
        },
        {
          q: 'Dans sa zone, comment la plupart des actifs vont-ils travailler ?',
          a: 'en voiture',
          wrong: [
            { label: 'en métro', why: 'Le métro sert surtout dans l’aire de Paris et les grandes villes.' },
            { label: 'à pied', why: 'Le travail de la tante est loin : la marche sert surtout tout près.' },
          ],
          quote: Q_HORS,
          explain: 'Loin de l’influence des villes, 90 actifs sur 100 prennent la voiture.',
          src: INSEE,
        },
      ],
    },
    {
      title: 'Un matin à Venise',
      lines: [
        'Une habitante de Venise, en Italie, attend au bord de l’eau.',
        'Un vaporetto arrive. Elle monte avec les autres voyageurs.',
      ],
      qs: [
        {
          q: 'Comment cette habitante se déplace-t-elle ce matin ?',
          a: 'en bateau avec d’autres voyageurs',
          wrong: [
            { label: 'seule dans sa voiture', why: 'Elle monte dans un vaporetto avec d’autres voyageurs.' },
            { label: 'en avion', why: 'Elle attend au bord de l’eau : le vaporetto est un bateau.' },
          ],
          quote: Q_VAPORETTO,
          explain: 'Le vaporetto assure le service des voyageurs à Venise : c’est un bateau.',
          src: 'cnrtl-vaporetto',
        },
      ],
    },
  ],
};

// ——— Notion 2 : de ville en ville en France ———

const villes: Notion = {
  classe: 'CM2',
  id: 'gcm2-ville-en-ville',
  title: 'De ville en ville en France',
  hint: 'Pense au chemin : une voie ferrée, une grande route ? Et l’endroit où l’on monte.',
  memo: [
    'Pour aller d’une ville à une autre, on utilise des **réseaux** : voies ferrées et routes.',
    'La **gare** sert à monter dans le train ou à en descendre. L’**autoroute** est faite pour rouler vite, en deux sens séparés.',
    'Ces aménagements sont des **infrastructures**. Exemple : le train est utilisé pour les longues distances.',
  ],
  faits: [
    {
      q: 'Où les voyageurs montent-ils dans un train ?',
      a: 'à la gare',
      wrong: [
        { label: 'au port', why: 'Le port accueille les bateaux, pas les trains.' },
        { label: 'sur l’autoroute', why: 'L’autoroute est réservée à la circulation automobile.' },
        { label: 'à l’aéroport', why: 'L’aéroport sert aux lignes aériennes.' },
      ],
      gap: ['Les voyageurs montent dans le train à la ', '.', ['gare']],
      quote: Q_GARE,
      explain: 'La gare permet aux voyageurs et aux marchandises de monter et de descendre.',
      src: 'cnrtl-gare',
    },
    {
      q: 'Quelle voie est faite pour un trafic automobile rapide, avec deux chaussées séparées ?',
      a: 'l’autoroute',
      wrong: [
        { label: 'le trottoir', why: 'Le trottoir sert aux piétons, pas au trafic rapide.' },
        { label: 'la voie ferrée', why: 'La voie ferrée sert aux trains.' },
        { label: 'la piste cyclable', why: 'La piste cyclable est faite pour les vélos.' },
      ],
      gap: [
        'Une ',
        ' est une voie rapide pour les automobiles, à deux chaussées séparées.',
        ['autoroute', 'auto-route'],
      ],
      quote: Q_AUTOROUTE,
      explain: 'L’autoroute est une voie à double chaussée séparée, conçue pour rouler vite.',
      src: 'cnrtl-autoroute',
    },
    {
      q: 'Selon l’INSEE, pour quelles distances le train est-il utilisé ?',
      a: 'les longues distances',
      wrong: [
        { label: 'les trajets de quelques pas', why: 'Pour quelques pas, on marche. Le train sert loin.' },
        { label: 'aucune distance', why: 'Le train transporte bien des voyageurs, surtout loin.' },
        { label: 'seulement la cour de l’école', why: 'Aucun train ne va d’un bout à l’autre d’une cour !' },
      ],
      gap: ['Le train est un mode de transport utilisé pour les longues ', '.', ['distances', 'distance']],
      quote: Q_TRAIN,
      explain: 'Pour aller travailler loin, le train est un mode de transport utilisé.',
      src: INSEE,
    },
    {
      q: 'Au CM2, quels aménagements découvre-t-on avec les déplacements ?',
      a: 'les infrastructures de communication',
      wrong: [
        { label: 'les terrains de jeux', why: 'Les jeux ne servent pas à aller de ville en ville.' },
        { label: 'les salles de cinéma', why: 'Le cinéma est un lieu de loisirs, pas une voie de transport.' },
        { label: 'les piscines', why: 'Une piscine ne sert pas à se déplacer entre les villes.' },
      ],
      gap: ['On découvre les aménagements liés aux ', ' de communication.', ['infrastructures', 'infrastructure']],
      quote: Q_INFRA,
      explain: 'Routes, voies ferrées et gares sont des infrastructures de communication.',
    },
  ],
  paires3: [
    ['Gare', 'On y monte dans le train'],
    ['Autoroute', 'Voie rapide pour les automobiles'],
    ['Train', 'Utilisé pour les longues distances'],
  ],
  paires5: [
    ['Gare', 'On y monte dans le train'],
    ['Autoroute', 'Voie rapide pour les automobiles'],
    ['Aéroport', 'Départ et arrivée des avions de ligne'],
    ['Port', 'Il reçoit et abrite les bateaux'],
    ['Trajet', 'Aller d’un lieu à un autre'],
  ],
  libres: [
    {
      q: 'Comment appelle-t-on le lieu d’une ligne de chemin de fer où l’on monte dans le train ?',
      accepted: ['gare', 'la gare', 'une gare'],
      traps: [
        { text: 'port', why: 'Le port est pour les bateaux.' },
        { text: 'aéroport', why: 'L’aéroport est pour les avions.' },
      ],
      quote: Q_GARE,
      explain: 'Les voyageurs embarquent et débarquent à la gare.',
      src: 'cnrtl-gare',
    },
    {
      q: 'Quelle route à deux chaussées séparées est faite pour rouler vite ?',
      accepted: ['autoroute', 'l’autoroute', 'une autoroute'],
      traps: [
        { text: 'sentier', why: 'Un sentier est un petit chemin : on n’y roule pas vite.' },
        { text: 'rue', why: 'Une rue traverse la ville. La voie rapide à deux chaussées est l’autoroute.' },
      ],
      quote: Q_AUTOROUTE,
      explain: 'C’est l’autoroute.',
      src: 'cnrtl-autoroute',
    },
    {
      q: 'Quel véhicule sur rails est utilisé pour les longues distances ?',
      accepted: ['train', 'le train', 'un train', 'TGV', 'le TGV'],
      traps: [
        { text: 'vélo', why: 'Le vélo n’a pas de rails et sert surtout près de chez soi.' },
        { text: 'trottinette', why: 'La trottinette ne roule pas sur des rails.' },
      ],
      quote: Q_TRAIN,
      explain: 'Le train est utilisé pour les longues distances.',
      src: INSEE,
    },
  ],
  docs: [
    {
      title: 'Voyage chez les grands-parents',
      lines: [
        'Une fille habite une ville. Ses grands-parents habitent une autre ville, très loin.',
        'Elle rejoint des bâtiments au bord des rails. Puis elle monte dans son train.',
      ],
      qs: [
        {
          q: 'Quel lieu la fille rejoint-elle avant de monter ?',
          a: 'la gare',
          wrong: [
            { label: 'le port', why: 'Le texte parle de rails et d’un train, pas de bateaux.' },
            { label: 'l’aéroport', why: 'Elle prend un train, pas un avion.' },
          ],
          quote: Q_GARE,
          explain: 'Au bord des rails, les installations pour monter dans le train forment la gare.',
          src: 'cnrtl-gare',
        },
        {
          q: 'Pourquoi le train convient-il à ce voyage ?',
          a: 'parce qu’il est utilisé pour les longues distances',
          wrong: [
            { label: 'parce qu’il roule sur l’eau', why: 'Le train roule sur des rails.' },
            { label: 'parce que le voyage est tout petit', why: 'Les grands-parents habitent très loin.' },
          ],
          quote: Q_TRAIN,
          explain: 'La ville est loin : le train sert pour les longues distances.',
          src: INSEE,
        },
      ],
    },
    {
      title: 'En route vers une autre ville',
      lines: [
        'La famille part en voiture vers une autre ville.',
        'Elle roule sur une voie à deux chaussées séparées, sans carrefour.',
      ],
      qs: [
        {
          q: 'Sur quelle infrastructure la famille roule-t-elle ?',
          a: 'une autoroute',
          wrong: [
            { label: 'une voie ferrée', why: 'La voiture ne roule pas sur des rails.' },
            { label: 'une piste cyclable', why: 'Une piste cyclable est réservée aux vélos.' },
          ],
          quote: Q_AUTOROUTE,
          explain: 'Deux chaussées séparées et un trafic automobile rapide : c’est une autoroute.',
          src: 'cnrtl-autoroute',
        },
      ],
    },
  ],
};

// ——— Notion 3 : en Europe et dans le monde ———

const europeMonde: Notion = {
  classe: 'CM2',
  id: 'gcm2-europe-monde',
  title: 'En Europe et dans le monde',
  hint: 'Pense au grand voyage : par les airs ou sur l’eau ? Y a-t-il une frontière à passer ?',
  memo: [
    'Pour aller loin, on part souvent d’un **aéroport** (avions) ou d’un **port** (bateaux).',
    'Dans l’**espace Schengen**, on passe d’un pays à l’autre sans contrôles aux **frontières**. La police peut tout de même en faire.',
    'L’Union européenne protège les droits des **passagers**. Exemple : en avion, en train, en car ou en bateau.',
  ],
  faits: [
    {
      q: 'Quel lieu est aménagé pour le départ et l’arrivée des lignes aériennes ?',
      a: 'l’aéroport',
      wrong: [
        { label: 'le port', why: 'Le port reçoit les bateaux.' },
        { label: 'la gare', why: 'La gare est liée au chemin de fer.' },
        { label: 'le garage', why: 'Un garage abrite des voitures, pas des lignes aériennes.' },
      ],
      gap: ['Les avions de ligne partent de l’', '.', ['aéroport', 'aeroport']],
      quote: Q_AEROPORT,
      explain: 'L’aéroport sert au départ, à l’arrivée et aux escales des lignes aériennes.',
      src: 'cnrtl-aeroport',
    },
    {
      q: 'Quel lieu au bord de l’eau reçoit et abrite les bateaux ?',
      a: 'le port',
      wrong: [
        { label: 'l’aéroport', why: 'L’aéroport est fait pour les lignes aériennes.' },
        { label: 'la gare', why: 'La gare est sur une ligne de chemin de fer.' },
        { label: 'l’autoroute', why: 'L’autoroute est une voie pour les automobiles.' },
      ],
      gap: ['Les bateaux sont reçus et abrités dans un ', '.', ['port']],
      quote: Q_PORT,
      explain: 'Le port reçoit les bateaux et leur permet de charger et décharger.',
      src: 'cnrtl-port',
    },
    {
      q: 'Qu’est-ce qu’un paquebot ?',
      a: 'un grand navire qui transporte des passagers',
      wrong: [
        { label: 'un avion très rapide', why: 'Un paquebot navigue : c’est un navire.' },
        { label: 'un train de nuit', why: 'Le paquebot va sur l’eau, pas sur des rails.' },
        { label: 'un colis à envoyer', why: 'Le mot ressemble à « paquet », mais c’est un navire.' },
      ],
      gap: ['Un paquebot est un grand navire qui transporte des ', '.', ['passagers', 'voyageurs']],
      quote: Q_PAQUEBOT,
      explain: 'Un paquebot est un grand navire qui assure le transport de passagers.',
      src: 'cnrtl-paquebot',
    },
    {
      q: 'Qu’est-ce que l’espace Schengen ?',
      a: 'une zone où l’on circule sans frontières entre ses pays',
      wrong: [
        { label: 'une fusée qui part dans l’espace', why: 'Ici, « espace » veut dire une zone sur la Terre.' },
        { label: 'une gare en Europe', why: 'C’est une zone formée de plusieurs pays.' },
        { label: 'un pays sans habitants', why: 'Il réunit 29 pays, avec leurs habitants.' },
      ],
      gap: [
        'Dans l’espace Schengen, on circule librement, sans ',
        ' entre les pays.',
        ['frontières', 'frontière', 'frontieres', 'frontiere'],
      ],
      quote: Q_SCHENGEN,
      explain: 'C’est une zone de libre circulation sans frontières entre les 29 pays qui la composent.',
      src: 'ue-voyager',
    },
    {
      q: 'Dans l’espace Schengen, la police peut-elle faire des contrôles aux frontières entre ces pays ?',
      a: 'oui, elle peut en effectuer',
      wrong: [
        { label: 'non, jamais', why: 'Les autorités nationales peuvent effectuer des contrôles de police.' },
        { label: 'seulement dans les avions vides', why: 'Rien de tel : la police peut contrôler aux frontières.' },
        { label: 'non, la police n’existe pas là', why: 'La police existe et peut contrôler.' },
      ],
      gap: ['Les autorités peuvent effectuer des contrôles de ', ' aux frontières.', ['police']],
      quote: Q_CONTROLES,
      explain: 'Les voyages sont libres, mais des contrôles de police restent possibles.',
      src: 'ue-voyager',
    },
    {
      q: 'Dans l’Union européenne, quelle règle vaut dans tous les pays pour la route ?',
      a: 'la ceinture de sécurité est obligatoire',
      wrong: [
        { label: 'la même vitesse partout', why: 'Les limites de vitesse peuvent changer selon les pays.' },
        {
          label: 'un code de la route unique',
          why: 'Il n’existe pas de loi européenne unique sur le code de la route.',
        },
        {
          label: 'le téléphone à la main permis',
          why: 'Au contraire, le téléphone sans kit mains libres est interdit au volant.',
        },
      ],
      gap: ['Dans l’Union européenne, le port de la ', ' de sécurité est obligatoire.', ['ceinture']],
      quote: Q_CEINTURE,
      explain: 'Tous les pays de l’Union européenne imposent la ceinture de sécurité.',
      src: 'ue-route',
    },
  ],
  paires3: [
    ['Aéroport', 'Départ et arrivée des avions de ligne'],
    ['Port', 'Il reçoit et abrite les bateaux'],
    ['Paquebot', 'Grand navire pour des passagers'],
  ],
  paires5: [
    ['Aéroport', 'Départ et arrivée des avions de ligne'],
    ['Port', 'Il reçoit et abrite les bateaux'],
    ['Paquebot', 'Grand navire pour des passagers'],
    ['Espace Schengen', 'Zone de libre circulation entre des pays'],
    ['Passager', 'Personne qui est transportée'],
  ],
  libres: [
    {
      q: 'Comment appelle-t-on le lieu d’où partent les avions de ligne ?',
      accepted: ['aéroport', 'l’aéroport', 'un aéroport', 'aeroport'],
      traps: [
        { text: 'port', why: 'Le port est pour les bateaux. Pour les avions, ajoute « aéro ».' },
        { text: 'gare', why: 'La gare est liée au train.' },
      ],
      quote: Q_AEROPORT,
      explain: 'Les lignes aériennes partent de l’aéroport.',
      src: 'cnrtl-aeroport',
    },
    {
      q: 'Quel grand navire transporte régulièrement des passagers (il commence par « paq ») ?',
      accepted: ['paquebot', 'le paquebot', 'un paquebot'],
      traps: [
        { text: 'paquet', why: 'Un paquet est un colis. Le navire est un paquebot.' },
        { text: 'barque', why: 'Une barque est petite, et son nom ne commence pas par « paq ».' },
      ],
      quote: Q_PAQUEBOT,
      explain: 'C’est le paquebot.',
      src: 'cnrtl-paquebot',
    },
    {
      q: 'Quel est le nom de l’espace de libre circulation entre 29 pays d’Europe ?',
      accepted: ['Schengen', 'espace Schengen', 'l’espace Schengen'],
      traps: [
        { text: 'zone euro', why: 'La zone euro concerne la monnaie, pas la circulation.' },
        {
          text: 'Union européenne',
          why: 'L’espace sans contrôles porte un autre nom : il compte aussi des pays hors de l’Union.',
        },
      ],
      quote: Q_SCHENGEN,
      explain: 'C’est l’espace Schengen.',
      src: 'ue-voyager',
    },
  ],
  docs: [
    {
      title: 'Un voyage en Europe',
      lines: [
        'Un élève part de France en autocar vers un autre pays de l’Union européenne.',
        'Au départ, sa mère lui demande d’attacher sa ceinture.',
        'Les deux pays sont dans l’espace Schengen.',
      ],
      qs: [
        {
          q: 'Pourquoi la ceinture est-elle une bonne consigne dans les deux pays ?',
          a: 'parce qu’elle est obligatoire dans toute l’Union européenne',
          wrong: [
            { label: 'parce qu’elle remplace le billet', why: 'La ceinture protège : elle ne remplace pas un billet.' },
            {
              label: 'parce qu’elle n’est exigée qu’en avion',
              why: 'Elle est obligatoire dans les véhicules, autocars compris.',
            },
          ],
          quote: Q_CEINTURE,
          explain: 'La ceinture est obligatoire dans tous les pays de l’Union, aussi dans les autocars.',
          src: 'ue-route',
        },
        {
          q: 'À la frontière entre ces deux pays, qu’est-ce qui reste possible ?',
          a: 'un contrôle de police',
          wrong: [
            { label: 'rien : tout contrôle est interdit', why: 'La police peut encore contrôler.' },
            { label: 'un changement obligatoire de ceinture', why: 'Aucune règle ne demande de changer de ceinture.' },
          ],
          quote: Q_CONTROLES,
          explain: 'La circulation est libre, mais la police peut contrôler.',
          src: 'ue-voyager',
        },
      ],
    },
    {
      title: 'Les droits du voyageur',
      lines: [
        'Une élève voyage en bateau dans l’Union européenne avec son père.',
        'Son père dit : « Les passagers ont des droits. »',
      ],
      qs: [
        {
          q: 'Dans quels transports l’Union européenne prévoit-elle des droits pour les passagers ?',
          a: 'en avion, en train, en car et en bateau',
          wrong: [
            { label: 'seulement en avion', why: 'Le train, le car et le bateau sont aussi concernés.' },
            { label: 'seulement à vélo', why: 'Les droits cités concernent l’avion, le train, le car et le bateau.' },
          ],
          quote: Q_PASSAGERS,
          explain: 'Les droits des passagers couvrent l’avion, le train, l’autobus ou autocar et le bateau.',
          src: 'ue-voyager',
        },
        {
          q: 'À quoi sert un réseau d’infrastructures modernes, d’après l’Union européenne ?',
          a: 'à rendre les déplacements plus rapides et plus sûrs',
          wrong: [
            { label: 'à empêcher tous les voyages', why: 'Au contraire, il accélère les déplacements.' },
            { label: 'à rallonger les trajets', why: 'Il accélère les déplacements : il ne les rallonge pas.' },
          ],
          quote: Q_RESEAU,
          explain: 'Un tel réseau accélère et sécurise les déplacements.',
          src: 'ue-transports',
        },
      ],
    },
  ],
};

// ——— Notion 4 : modes de transport et développement durable ———

const transports: Notion = {
  classe: 'CM2',
  id: 'gcm2-modes-transport',
  title: 'Les modes de transport et la planète',
  hint: 'Demande-toi : combien de personnes voyagent ensemble ? Quel choix pollue moins ?',
  memo: [
    'Autobus et tramway sont des **transports en commun** : beaucoup de voyageurs les partagent.',
    'Les transports émettent des **gaz à effet de serre**. Le **développement durable** invite à lutter contre la pollution.',
    'De nouvelles **mobilités** grandissent : pistes cyclables, **covoiturage**. Exemple : deux voisins partagent une voiture.',
  ],
  faits: [
    {
      q: 'Quelle part des gaz à effet de serre de la France vient des transports ?',
      a: 'un tiers',
      wrong: [
        { label: 'aucune', why: 'Les transports émettent bien des gaz à effet de serre.' },
        { label: 'la totalité', why: 'D’autres activités en émettent aussi : les transports font un tiers.' },
        { label: 'un centième', why: 'La part est bien plus grande : un tiers.' },
      ],
      gap: ['Les transports émettent un ', ' des gaz à effet de serre de la France.', ['tiers', '1/3']],
      quote: Q_TIERS,
      explain: 'Un tiers, c’est une part sur trois.',
      src: ADEME,
    },
    {
      q: 'Sur un aller-retour Paris-Turin, quel transport émet le moins de CO₂ par personne ?',
      a: 'le TGV',
      wrong: [
        { label: 'l’avion', why: 'L’avion émet environ 152 kg, contre 3,3 kg en TGV.' },
        { label: 'les deux émettent autant', why: 'L’écart est grand : 152 kg contre 3,3 kg.' },
        { label: 'aucun n’émet de CO₂', why: 'Les deux en émettent, mais le TGV beaucoup moins.' },
      ],
      gap: ['De Paris à Turin, le ', ' émet bien moins de CO₂ que l’avion.', ['TGV', 'train']],
      quote: Q_TGV,
      explain: 'Environ 152 kg en avion contre 3,3 kg en TGV, pour une personne.',
      src: ADEME,
    },
    {
      q: 'Quel choix fait partie des nouvelles mobilités ?',
      a: 'le covoiturage',
      wrong: [
        {
          label: 'prendre l’avion pour aller à l’école',
          why: 'Ce n’est pas une nouvelle mobilité citée, et l’avion émet beaucoup.',
        },
        { label: 'rouler seul dans une très grosse voiture', why: 'Rouler seul n’est pas partager un trajet.' },
        { label: 'laisser le moteur tourner à l’arrêt', why: 'Un moteur qui tourne à l’arrêt ne déplace personne.' },
      ],
      gap: ['Partager la même voiture pour un trajet, c’est le ', '.', ['covoiturage', 'co-voiturage']],
      quote: Q_NOUVELLES,
      explain: 'L’ADEME cite les pistes cyclables, le covoiturage et l’autopartage.',
      src: ADEME,
    },
    {
      q: 'Quel grand véhicule transporte beaucoup de voyageurs à l’intérieur d’une ville et de ses environs ?',
      a: 'l’autobus',
      wrong: [
        { label: 'la trottinette', why: 'Une trottinette porte une personne.' },
        { label: 'la moto', why: 'Une moto ne transporte pas beaucoup de voyageurs.' },
        { label: 'le vélo', why: 'Un vélo n’est pas un grand véhicule de transport en commun.' },
      ],
      gap: ['L’', ' est un grand véhicule de transport en commun.', ['autobus', 'bus']],
      quote: Q_AUTOBUS,
      explain: 'L’autobus est un grand véhicule destiné au transport en commun dans une agglomération.',
      src: 'cnrtl-autobus',
    },
    {
      q: 'Quel transport public de ville roule sur des rails au niveau du sol ?',
      a: 'le tramway',
      wrong: [
        { label: 'le téléphérique', why: 'Le téléphérique est suspendu à des câbles.' },
        { label: 'le paquebot', why: 'Le paquebot est un navire.' },
        { label: 'l’autocar', why: 'Un car roule sur la route, sans rails.' },
      ],
      gap: ['Le ', ' roule sur des rails dans la ville.', ['tramway', 'tram']],
      quote: Q_TRAMWAY,
      explain: 'Le tramway est un transport public urbain sur rails.',
      src: 'cnrtl-tramway',
    },
    {
      q: 'Quel transport utilise des câbles pour porter une cabine ?',
      a: 'le téléphérique',
      wrong: [
        { label: 'le tramway', why: 'Le tramway roule sur des rails.' },
        { label: 'l’autobus', why: 'L’autobus roule sur la route.' },
        { label: 'le ferry', why: 'Un ferry est un bateau.' },
      ],
      gap: ['Une cabine suspendue à des câbles forme un ', '.', ['téléphérique', 'telepherique', 'téléférique']],
      quote: Q_TELEPHERIQUE,
      explain: 'Un câble tire la cabine et d’autres câbles la portent.',
      src: 'cnrtl-telepherique',
    },
  ],
  paires3: [
    ['Tramway', 'Roule sur des rails en ville'],
    ['Téléphérique', 'Cabine portée par des câbles'],
    ['Covoiturage', 'Voiture partagée pour un trajet'],
  ],
  paires5: [
    ['Tramway', 'Roule sur des rails en ville'],
    ['Téléphérique', 'Cabine portée par des câbles'],
    ['Covoiturage', 'Voiture partagée pour un trajet'],
    ['Autobus', 'Grand véhicule en commun sur la route'],
    ['Piste cyclable', 'Voie aménagée pour les vélos'],
  ],
  libres: [
    {
      q: 'Comment appelle-t-on le fait de partager la même voiture pour un trajet ?',
      accepted: ['covoiturage', 'le covoiturage', 'co-voiturage', 'du covoiturage'],
      traps: [
        { text: 'autoroute', why: 'L’autoroute est une voie, pas un partage.' },
        { text: 'embouteillage', why: 'Un embouteillage bloque les voitures. Ici, on les partage.' },
      ],
      quote: Q_NOUVELLES,
      explain: 'Le covoiturage fait partie des nouvelles mobilités.',
      src: ADEME,
    },
    {
      q: 'Quel transport de ville, sur rails au niveau du sol, a un nom qui commence par « tram » ?',
      accepted: ['tramway', 'le tramway', 'un tramway', 'tram', 'le tram'],
      traps: [
        { text: 'train', why: 'Son nom ne commence pas par « tram ».' },
        { text: 'métro', why: 'Son nom ne commence pas par « tram ».' },
      ],
      quote: Q_TRAMWAY,
      explain: 'C’est le tramway.',
      src: 'cnrtl-tramway',
    },
    {
      q: 'Les transports émettent des gaz à effet de … (un mot).',
      accepted: ['serre', 'de serre'],
      traps: [
        { text: 'mer', why: 'L’expression exacte est « gaz à effet de serre ».' },
        { text: 'chauffage', why: 'Ces gaz réchauffent, mais on dit « effet de serre ».' },
      ],
      quote: Q_TIERS,
      explain: 'On parle de gaz à effet de serre.',
      src: ADEME,
    },
  ],
  docs: [
    {
      title: 'Deux voisines changent',
      lines: [
        'Chaque matin, deux voisines partaient seules, chacune dans sa voiture.',
        'Elles font maintenant le trajet ensemble, dans une seule voiture.',
        'Leur enfant va au sport à vélo sur la piste cyclable.',
      ],
      qs: [
        {
          q: 'Comment s’appelle le nouveau choix des deux voisines ?',
          a: 'le covoiturage',
          wrong: [
            { label: 'le téléphérique', why: 'Elles roulent en voiture, sans câbles.' },
            { label: 'le tramway', why: 'Elles ne roulent pas sur des rails.' },
          ],
          quote: Q_NOUVELLES,
          explain: 'Partager une voiture, c’est faire du covoiturage.',
          src: ADEME,
        },
        {
          q: 'Quel effet peut avoir un trajet à vélo au lieu d’un trajet en voiture ?',
          a: 'réduire la pollution et les gaz à effet de serre',
          wrong: [
            { label: 'augmenter les gaz du moteur', why: 'Un vélo n’a pas besoin de carburant.' },
            { label: 'allonger la piste cyclable', why: 'Rouler ne rallonge pas la piste.' },
          ],
          quote: Q_BOUGER,
          explain: 'Bouger davantage réduit les émissions et les pollutions des transports.',
          src: ADEME,
        },
      ],
    },
    {
      title: 'Aller au travail',
      lines: [
        'Un quartier compte beaucoup de voitures le matin.',
        'Dans la plupart, il n’y a qu’une personne.',
        'La mairie veut agir pour le développement durable.',
      ],
      qs: [
        {
          q: 'Quelle idée aiderait à avoir moins de voitures ?',
          a: 'proposer de partager les trajets',
          wrong: [
            { label: 'demander à chacun de venir seul', why: 'Cela garde une voiture par personne.' },
            { label: 'supprimer les pistes cyclables', why: 'Sans pistes, il est plus dur de choisir le vélo.' },
          ],
          quote: Q_SEUL,
          explain: 'Beaucoup roulent seuls pour aller travailler : partager réduit le nombre de voitures.',
          src: ADEME,
        },
        {
          q: 'Au CM2, que veut-on combattre en étudiant les déplacements durables ?',
          a: 'la pollution',
          wrong: [
            { label: 'la lecture', why: 'La lecture n’a rien à voir avec les déplacements.' },
            { label: 'les vacances', why: 'On cherche à moins polluer, pas à supprimer les vacances.' },
          ],
          quote: Q_DURABLE,
          explain: 'Le programme cite la lutte contre la pollution.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [quotidien, villes, europeMonde, transports];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n));
