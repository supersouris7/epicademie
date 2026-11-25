import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * Sixième, thème 3 « Habiter les littoraux » (lot ge-6e-03). Chaque fait cite une source du registre avec sa citation
 * exacte : programme du cycle 3, ressource Éduscol du thème, Géoconfluences, ministère chargé de l’écologie et Trésor de
 * la langue française (CNRTL). Les textes à lire du niveau 5 sont écrits pour l’exercice.
 */

const EDUSCOL = 'eduscol-habiter-littoraux';
const ZIP = 'geoconfluences-zip';
const PORT = 'geoconfluences-port';
const CONTENEUR = 'geoconfluences-conteneur';
const ARRIERE = 'geoconfluences-arriere-pays';
const LITTORALISATION = 'geoconfluences-littoralisation';
const INTERFACE = 'geoconfluences-interface';
const LITTORAL = 'geoconfluences-littoral';
const STATION = 'geoconfluences-station-touristique';
const SURTOURISME = 'geoconfluences-surtourisme';
const CONSERVATOIRE = 'geoconfluences-conservatoire-littoral';
const ALEA = 'geoconfluences-alea';
const VULNERABILITE = 'geoconfluences-vulnerabilite';
const ENJEUX = 'geoconfluences-enjeux';
const DIGUE = 'geoconfluences-digue';
const TRAIT = 'geoconfluences-trait-de-cote';
const ESTRAN = 'geoconfluences-estran';
const MANGROVE = 'geoconfluences-mangrove';
const POLDER = 'geoconfluences-polder';
const RISQUES = 'ecologie-risques-littoraux';

// Programme du cycle 3.
const P_CONCENTRENT =
  'Les littoraux concentrent une part accrue de la population mondiale et sont des espaces aménagés pour des usages et pratiques très variés';
const P_PROTECTION =
  'C’est l’occasion de sensibiliser les élèves à la richesse de la faune et de la flore des littoraux et aux questions liées à leur protection';

// Ressource Éduscol « Habiter les littoraux ».
const E_VOIE =
  'la mondialisation des échanges, qui s’effectuent massivement par voie maritime, et qui explique la croissance des organisations portuaires';
const E_AVAL =
  'Les fonctions portuaires, autrefois localisées au cœur des villes, dans des sites d’abri (fonds d’estuaires, grandes baies ou rades), se sont progressivement déplacées et étendues de l’amont vers l’aval';
const E_NAVIRES =
  'la création de sites artificiels en pleine mer afin de développer leurs activités et accueillir des navires toujours plus grands (pétroliers, vraquiers, porte-conteneurs)';
const E_MOTEUR = 'depuis plus d’un siècle et demi, un puissant moteur de transformation des littoraux';
const E_REGARD =
  'un changement du regard porté par les sociétés sur leur littoral, désormais désiré et approprié, mis en valeur dans un but touristique ou résidentiel';
const E_HABITER =
  'Habiter un littoral, une ville portuaire, une ville ou une station touristique, c’est y résider, mais également travailler, consommer, avoir des loisirs';
const E_TEMPORAIRE =
  'Les populations sont de plus en plus nombreuses à désirer y habiter, de manière permanente ou temporaire, débouchant sur une urbanisation croissante de larges portions des littoraux';
const E_PAYSAGES =
  'modifient par leurs pratiques et les aménagements touristiques (le front de mer, la plage, la station) les paysages et les espaces';
const E_ACCES =
  'aménagements et services, accessibilité (aéroports, gares...) qui expliquent leur développement touristique';
const E_EMPLOIS =
  'Les activités multiples et diversifiées qui se localisent sur les littoraux génèrent de nombreux emplois';
const E_TENSION =
  'l’artificialisation des côtes, le bétonnage, la pollution due aux industries et aux transports, ou la surexploitation touristique mettent en tension le développement économique et la biodiversité';
const E_PECHE =
  'La pêche et l’aquaculture font vivre des millions de personnes mais peuvent être concurrencées par d’autres activités ou menacer la biodiversité';
const E_ARBITRAGES =
  'la cohabitation des différentes fonctions et des différents acteurs sur les littoraux provoque des concurrences et des conflits d’usage et nécessite donc des arbitrages';
const E_COEXISTER = 'zones industrialo-portuaires et stations balnéaires peuvent coexister';
const E_PROTEGER =
  'dans le cadre de la loi littoral en France, de l’action du Conservatoire du littoral ou encore dans la constitution de réserves naturelles et de parcs littoraux ou marins';
const E_CONTACT =
  'l’espace de contact terre/mer directement ou indirectement soumis aux actions marines et aux influences maritimes';

// Géoconfluences (ENS de Lyon, DGESCO).
const G_ZIP =
  'Une zone industrialo-portuaire est un espace qui associe des activités portuaires et industrielles dans un système économique et spatial complexe';
const G_ZIP_AVAL =
  'Les logiques économiques ont conduit au développement de zones industrialo-portuaires dans les parties aval des estuaires plus anciennement aménagés';
const G_ZIP_FREIN =
  'la protection des espaces littoraux et des zones humides peut être un frein à ces puissantes dynamiques';
const G_PORT_SPECIAL = 'ports vraquiers, ports pétroliers ou encore ports à conteneurs';
const G_PORT_TRIPTYQUE = 'un lieu de contact entre un avant-pays (foreland) et un arrière-pays (hinterland)';
const G_CONTENEUR = 'Les conteneurs sont des boîtes métalliques de dimensions normalisées';
const G_ARRIERE = 'L’arrière-pays (hinterland) est l’aire d’attraction et de desserte continentale d’un port';
const G_AVANT = 'desservis par les lignes ou dessertes régulières qui touchent un port ou un aéroport';
const G_LITTORALISATION =
  'La littoralisation est un processus de concentration des populations et des activités humaines le long ou à proximité des littoraux';
const G_INTERFACE =
  'Une interface est une bande de contact entre deux espaces de nature différente, engendrant des échanges entre ces deux espaces';
const G_RARE = 'c’est un espace d’étendue limitée, donc un « bien rare » et de plus en plus convoité';
const G_STATION =
  'Une station touristique est un lieu qui se définit par l’omniprésence de l’activité touristique, qui est créatrice du lieu';
const G_STATION_POP = 'habitée par une population permanente, dont l’activité n’est pas forcément liée au tourisme';
const G_SURTOURISME =
  'désigne les effets négatifs produits par une fréquentation touristique excessive dans certains lieux';
const G_CONSERVATOIRE =
  'une politique d’acquisition des sols pour préserver quelques-uns des espaces littoraux les plus fragiles et menacés';
const G_ALEA =
  'L’aléa ne devient un risque qu’en présence d’enjeux humains, économiques et environnementaux, possédant une certaine vulnérabilité (fragilité)';
const G_ALEA_DEF =
  'L’aléa (hazard en anglais) est la possibilité que se produise un événement impliquant une perturbation de l’équilibre d’un milieu';
const G_ILE =
  'un typhon sur un atoll désert de l’océan Pacifique n’est pas un risque, mais un cyclone sur des secteurs habités de l’île de La Réunion est un risque majeur';
const G_VULNERABILITE =
  'La vulnérabilité exprime le niveau d’effet prévisible d’un phénomène naturel (un aléa) sur des enjeux (les sociétés humaines et leurs activités)';
const G_ENJEUX =
  'les enjeux recouvrent les personnes, biens, équipements, environnements, susceptibles d’être affectés par un phénomène';
const G_DIGUE = 'à protéger des marées et de la houle';
const G_TRAIT =
  'il peut reculer lorsque le littoral est soumis à des effets d’érosion ou avancer, dans le cas d’accumulation de sédiments';
const G_ESTRAN = 'est l’espace alternativement couvert et découvert par la marée';
const G_MANGROVE = 'La mangrove est une formation végétale des littoraux intertropicaux';
const G_MANGROVE_UTILE =
  'Les mangroves sont des réservoirs de biodiversité et des milieux très utiles pour la protection des sols face à l’érosion';
const G_POLDER = 'espace clos, conquis sur les eaux au moyen d’endiguements, puis asséché par le drainage';

// Ministère chargé de l’écologie, « La prévention des risques littoraux et des tsunamis en France ».
const M_SUBMERSION =
  'La submersion marine est une inondation temporaire des zones côtières par la mer dans des conditions météorologiques et de marée défavorables';
const M_RECUL =
  'Le recul du trait de côte est un phénomène naturel qui s’est aggravé sous la pression des activités humaines';
const M_TSUNAMI = 'Les tsunamis sont causés par des séismes sous-marins';
const M_INSTALLATION =
  'Les risques liés aux submersions marines ou au recul du trait de côte sont aujourd’hui en France toujours plus prégnants du fait de l’installation croissante des populations en zones côtières';
const M_PPR =
  'Ils définissent des zones de danger et des zones de précaution dans lesquelles il peut y avoir des interdictions ou des prescriptions';
const M_SOUPLE =
  'techniques plus souples visant à préserver les fonctionnalités naturelles de certaines structures (dunes, récifs, ...) dans leur rôle de protection';
const M_VIGILANCE = 'une vigilance « vagues-submersion »';

// Trésor de la langue française informatisé (CNRTL).
const C_LITTORAL =
  'Partie d’un pays située au contact de la mer et comprenant l’espace soumis aux forces marines agissant au contact des terres';
const C_ESTUAIRE = 'Partie aval d’un fleuve, large embouchure, où la marée et les courants se font sentir';
const C_RADE =
  'Bassin naturel ou artificiel de vastes dimensions, ayant une issue vers la mer, où les navires trouvent un bon mouillage';
const C_DOCKER = 'Ouvrier qui travaille sur les docks au chargement ou au déchargement des navires';
const C_VRAQUIER = 'Cargo transportant des produits en vrac';
const C_BALNEAIRE = 'Qui concerne les bains, leur est propre';
const C_TSUNAMI =
  'immense vague ayant pour origine un tremblement de terre, une éruption volcanique sous-marine ou la chute dans la mer de grands pans de falaises ou de glaciers';

// ——— Notion 1 : littoral industrialo-portuaire ———

const industrialoPortuaire: Notion = {
  classe: '6e',
  id: 'g6-littoral-industrialo-portuaire',
  title: 'Habiter un littoral industrialo-portuaire',
  hint: 'Pense aux navires, aux marchandises, aux usines et aux liens avec la mer comme avec l’intérieur des terres.',
  memo: [
    'Une **zone industrialo-portuaire** associe un port et des industries. Le commerce mondial passe massivement par la mer.',
    'Pour accueillir des navires toujours plus grands, les ports se sont étendus vers l’**aval**, parfois sur des sites gagnés en mer.',
    'Le port relie un **avant-pays** (côté mer) et un **arrière-pays** (côté terres). On y habite, on y travaille, et les usages se concurrencent.',
  ],
  faits: [
    {
      q: 'Qu’est-ce qu’une zone industrialo-portuaire ?',
      a: 'un espace qui associe des activités du port et des industries',
      wrong: [
        {
          label: 'un lieu créé surtout pour les vacances à la plage',
          why: 'Ce lieu est une station touristique, pas une zone d’industrie et de port.',
        },
        {
          label: 'une réserve naturelle où toute activité est absente',
          why: 'La zone industrialo-portuaire est au contraire un espace d’activités économiques.',
        },
        {
          label: 'un quartier de bureaux loin de toute voie d’eau',
          why: 'Elle a besoin de l’eau : elle se trouve sur un littoral ou sur une voie d’eau.',
        },
      ],
      gap: ['Une zone industrialo-portuaire associe des activités portuaires et ', '.', ['industrielles']],
      choix: ['industrielles', 'balnéaires', 'agricoles'],
      quote: G_ZIP,
      explain: 'Les navires apportent ou emportent des marchandises que des usines proches peuvent transformer.',
      src: ZIP,
    },
    {
      q: 'Par quelle voie la plus grande partie des échanges mondiaux de marchandises s’effectue-t-elle ?',
      a: 'par la voie maritime',
      wrong: [
        {
          label: 'par la voie ferrée',
          why: 'Le train transporte des marchandises, mais les échanges mondiaux passent surtout par la mer.',
        },
        {
          label: 'par la voie aérienne',
          why: 'L’avion existe, mais les échanges mondiaux passent surtout par la mer.',
        },
        {
          label: 'par la route',
          why: 'La route dessert l’intérieur des terres ; entre les continents, c’est la mer qui domine.',
        },
      ],
      gap: ['Les échanges mondiaux s’effectuent massivement par voie ', '.', ['maritime']],
      choix: ['maritime', 'ferrée', 'aérienne'],
      quote: E_VOIE,
      explain: 'Cette place du transport par mer explique la croissance des ports et des industries sur les littoraux.',
      src: EDUSCOL,
    },
    {
      q: 'Comment les activités portuaires installées au cœur des villes ont-elles évolué ?',
      a: 'elles se sont déplacées et étendues vers l’aval',
      wrong: [
        {
          label: 'elles se sont resserrées au centre des villes',
          why: 'C’est l’inverse : elles ont quitté les centres pour s’étendre plus loin.',
        },
        {
          label: 'elles sont remontées vers les sources des fleuves',
          why: 'Remonter vers l’amont éloignerait de la mer : le déplacement va vers l’aval.',
        },
        {
          label: 'elles ont toutes disparu des littoraux',
          why: 'Les ports se sont déplacés et ont grandi : ils n’ont pas disparu.',
        },
      ],
      gap: ['Les fonctions portuaires se sont étendues de l’amont vers l’', '.', ['aval']],
      choix: ['aval', 'ouest', 'centre-ville'],
      quote: E_AVAL,
      explain: 'L’aval est le côté vers la mer : le port y trouve de la place et se rapproche des grands navires.',
      src: EDUSCOL,
    },
    {
      q: 'Pourquoi certains ports créent-ils des sites artificiels en pleine mer ?',
      a: 'pour développer leurs activités et accueillir de plus grands navires',
      wrong: [
        {
          label: 'pour interdire aux navires d’approcher des côtes',
          why: 'Un port cherche au contraire à accueillir les navires.',
        },
        {
          label: 'pour remplacer le transport par mer par le transport par avion',
          why: 'Ces sites servent aux navires : le transport maritime reste leur raison d’être.',
        },
        {
          label: 'pour rendre à la mer les terrains du centre-ville',
          why: 'Le site artificiel gagne de la place sur la mer ; il ne vise pas à rendre des terrains.',
        },
      ],
      gap: ['Les sites artificiels en pleine mer permettent d’accueillir des ', ' toujours plus grands.', ['navires']],
      choix: ['navires', 'avions', 'trains'],
      quote: E_NAVIRES,
      explain: 'Pétroliers, vraquiers et porte-conteneurs sont toujours plus grands : le port doit s’adapter.',
      src: EDUSCOL,
    },
    {
      q: 'Dans quelle partie d’estuaires anciennement aménagés des zones industrialo-portuaires se sont-elles développées ?',
      a: 'la partie aval, vers la mer',
      wrong: [
        {
          label: 'la partie amont, près de la source',
          why: 'La source est loin de la mer : les grandes zones sont en aval.',
        },
        {
          label: 'la partie la plus haute des montagnes voisines',
          why: 'Un port a besoin de l’eau navigable, pas des sommets.',
        },
        {
          label: 'les seuls centres historiques des villes',
          why: 'Les centres manquent de place : le développement se fait en aval.',
        },
      ],
      gap: ['Des zones industrialo-portuaires se sont développées dans les parties ', ' des estuaires.', ['aval']],
      choix: ['aval', 'amont', 'montagneuses'],
      quote: G_ZIP_AVAL,
      explain: 'Des raisons économiques poussent les installations vers l’aval, plus proche de la mer.',
      src: ZIP,
    },
    {
      q: 'Qu’est-ce qui peut freiner l’extension des zones industrialo-portuaires ?',
      a: 'la protection des littoraux et des zones humides',
      wrong: [
        {
          label: 'la hausse des échanges par la mer',
          why: 'Davantage d’échanges maritimes pousse au contraire les ports à grandir.',
        },
        {
          label: 'l’arrivée de navires plus grands',
          why: 'De grands navires incitent à aménager de nouveaux sites portuaires.',
        },
        {
          label: 'la présence d’usines près des quais',
          why: 'Les usines font partie de la zone industrialo-portuaire.',
        },
      ],
      gap: ['La ', ' des zones humides peut freiner l’extension des zones industrialo-portuaires.', ['protection']],
      choix: ['protection', 'pollution', 'disparition'],
      quote: G_ZIP_FREIN,
      explain: 'Industrie et protection de la nature veulent le même espace : il faut choisir et arbitrer.',
      src: ZIP,
    },
    {
      q: 'Que sont les conteneurs que l’on voit empilés dans les ports ?',
      a: 'des boîtes métalliques aux dimensions normalisées',
      wrong: [
        {
          label: 'des maisons de vacances posées sur les quais',
          why: 'Les conteneurs servent à grouper des marchandises.',
        },
        { label: 'des barrières contre les vagues', why: 'La protection contre les vagues est le rôle d’une digue.' },
        {
          label: 'des navires qui transportent du pétrole',
          why: 'Un navire qui transporte du pétrole est un pétrolier.',
        },
      ],
      gap: ['Les conteneurs sont des boîtes ', ' de dimensions normalisées.', ['métalliques', 'metalliques']],
      choix: ['métalliques', 'flottantes', 'naturelles'],
      quote: G_CONTENEUR,
      explain: 'Des dimensions identiques permettent de passer vite du navire au train ou au camion.',
      src: CONTENEUR,
    },
    {
      q: 'Que fait-on, entre autres, quand on habite un littoral ou une ville portuaire ?',
      a: 'on y réside, on y travaille, on y consomme et on a des loisirs',
      wrong: [
        { label: 'on y dort seulement, sans autre activité', why: 'Habiter, ce n’est pas seulement résider.' },
        { label: 'on y passe en bateau sans jamais s’arrêter', why: 'Passer au large n’est pas habiter le lieu.' },
        {
          label: 'on y travaille sans pouvoir y vivre',
          why: 'Résider, consommer et avoir des loisirs font aussi partie de l’habiter.',
        },
      ],
      gap: ['Habiter un littoral, c’est y résider, mais aussi ', ', consommer et avoir des loisirs.', ['travailler']],
      choix: ['travailler', 'hiberner', 'disparaître'],
      quote: E_HABITER,
      explain: 'Un docker, un ouvrier ou un habitant voisin du port habitent le même littoral de façons différentes.',
      src: EDUSCOL,
    },
    {
      q: 'Entre quels deux espaces un port est-il un lieu de contact ?',
      a: 'un avant-pays et un arrière-pays',
      wrong: [
        {
          label: 'un désert et une montagne',
          why: 'Un port met en relation le côté de la mer et le côté des terres desservies.',
        },
        {
          label: 'une station balnéaire et un hôtel',
          why: 'Ce sont des lieux du tourisme, pas les deux espaces qui définissent un port.',
        },
        {
          label: 'un centre-ville et sa banlieue seulement',
          why: 'Les relations d’un port dépassent la ville : elles vont au-delà des mers et loin dans les terres.',
        },
      ],
      gap: ['Un port est un lieu de contact entre un avant-pays et un ', '-pays.', ['arrière', 'arriere']],
      choix: ['arrière', 'sous', 'outre'],
      quote: G_PORT_TRIPTYQUE,
      explain: 'L’avant-pays est du côté des lignes maritimes, l’arrière-pays du côté des terres.',
      src: PORT,
    },
    {
      q: 'Que désigne l’avant-pays d’un port ?',
      a: 'les territoires desservis par les lignes régulières qui touchent ce port',
      wrong: [
        {
          label: 'les quartiers construits juste devant la mairie',
          why: 'Le mot ne désigne pas un quartier : il concerne les liaisons du port.',
        },
        { label: 'les terres de l’intérieur que le port dessert', why: 'Ces terres forment l’arrière-pays.' },
        { label: 'la bande couverte puis découverte par la marée', why: 'Cette bande est l’estran.' },
      ],
      gap: [
        'L’avant-pays d’un port regroupe les territoires desservis par les ',
        ' régulières qui le touchent.',
        ['lignes'],
      ],
      choix: ['lignes', 'marées', 'usines'],
      quote: G_AVANT,
      explain: 'Les lignes régulières relient le port à des territoires parfois très lointains.',
      src: ARRIERE,
    },
    {
      q: 'Les ports sont souvent spécialisés. Lequel de ces exemples est une spécialité portuaire ?',
      a: 'un port à conteneurs',
      wrong: [
        { label: 'un port de haute montagne sans navire', why: 'Un port accueille des navires.' },
        { label: 'un port réservé aux avions', why: 'Les avions utilisent un aéroport.' },
        { label: 'un port réservé aux skieurs', why: 'Le ski n’est pas une activité portuaire.' },
      ],
      gap: ['On distingue les ports vraquiers, les ports pétroliers et les ports à ', '.', ['conteneurs']],
      choix: ['conteneurs', 'voyelles', 'skis'],
      quote: G_PORT_SPECIAL,
      explain: 'Les navires se spécialisent, et les ports ou leurs terminaux aussi.',
      src: PORT,
    },
  ],
  paires3: [
    ['Docker', 'Charge et décharge les navires'],
    ['Conteneur', 'Boîte métallique de taille normalisée'],
    ['Pétrolier', 'Navire qui transporte du pétrole'],
  ],
  paires5: [
    ['Zone industrialo-portuaire', 'Espace associant port et industries'],
    ['Arrière-pays', 'Territoires desservis par le port côté terres'],
    ['Avant-pays', 'Territoires desservis par le port côté mer'],
    ['Vraquier', 'Cargo de produits en vrac'],
    ['Porte-conteneurs', 'Navire chargé de boîtes normalisées'],
  ],
  libres: [
    {
      q: 'Comment appelle-t-on l’ouvrier qui charge et décharge les navires sur les quais ?',
      accepted: ['docker', 'un docker', 'dockers', 'des dockers'],
      traps: [
        { text: 'vraquier', why: 'Le vraquier est un cargo, pas un ouvrier.' },
        { text: 'capitaine', why: 'Le capitaine commande le navire ; il ne désigne pas l’ouvrier des quais.' },
      ],
      quote: C_DOCKER,
      explain: 'Le docker travaille sur les quais et les entrepôts.',
      src: 'cnrtl-docker',
    },
    {
      q: 'Comment appelle-t-on la zone qu’un port dessert à l’intérieur du continent (mot avec un trait d’union) ?',
      accepted: ['arrière-pays', 'l’arrière-pays', 'arriere-pays', 'arrière pays', 'hinterland', 'l’hinterland'],
      traps: [
        {
          text: 'avant-pays',
          why: 'L’avant-pays regroupe les territoires atteints par les lignes qui touchent le port, côté mer.',
        },
        { text: 'estran', why: 'L’estran est la bande couverte puis découverte par la marée.' },
      ],
      quote: G_ARRIERE,
      explain: 'L’arrière-pays envoie et reçoit des marchandises par le port.',
      src: ARRIERE,
    },
    {
      q: 'Quel nom, abrégé en ZIP, désigne un espace qui réunit port et industries ? Écris « zone … ».',
      accepted: [
        'zone industrialo-portuaire',
        'zone industrialo portuaire',
        'une zone industrialo-portuaire',
        'industrialo-portuaire',
      ],
      traps: [
        { text: 'zone touristique', why: 'Le tourisme n’est pas l’activité qui définit cet espace.' },
        { text: 'zone humide', why: 'Une zone humide est un milieu entre terre et eau, comme un marais.' },
      ],
      quote: G_ZIP,
      explain: '« Industrialo-portuaire » associe l’industrie et le port.',
      src: ZIP,
    },
    {
      q: 'Quel cargo transporte des produits en vrac, c’est-à-dire sans emballage ?',
      accepted: ['vraquier', 'un vraquier'],
      traps: [
        { text: 'pétrolier', why: 'Le pétrolier transporte du pétrole ; on attend le cargo de produits en vrac.' },
        { text: 'porte-conteneurs', why: 'Le porte-conteneurs transporte des boîtes normalisées.' },
      ],
      quote: C_VRAQUIER,
      explain: 'Le vraquier est le cargo des produits en vrac.',
      src: 'cnrtl-vraquier',
    },
  ],
  docs: [
    {
      title: 'Une journée sur les quais',
      lines: [
        'À l’aube, un navire chargé de boîtes métalliques accoste en aval de la vieille ville.',
        'Une ouvrière manœuvre une grue ; les boîtes partent ensuite par train vers des villes de l’intérieur.',
        'Près des quais, une usine transforme des produits arrivés par la mer.',
      ],
      qs: [
        {
          q: 'Quel type de littoral ce texte décrit-il ?',
          a: 'un littoral industrialo-portuaire',
          wrong: [
            {
              label: 'un littoral surtout touristique',
              why: 'Il n’y a ni plage ni vacanciers : on charge des navires et on produit.',
            },
            {
              label: 'un littoral sans aucune activité',
              why: 'Navire, grue, train et usine montrent une forte activité.',
            },
          ],
          quote: G_ZIP,
          explain: 'Le port et l’usine sont réunis : c’est la définition d’une zone industrialo-portuaire.',
          src: ZIP,
        },
        {
          q: 'Vers quels lieux partent les boîtes transportées par le train ?',
          a: 'vers l’arrière-pays du port',
          wrong: [
            {
              label: 'vers l’avant-pays, de l’autre côté de la mer',
              why: 'Le train va vers l’intérieur des terres : ce n’est pas le côté de la mer.',
            },
            {
              label: 'vers l’estran découvert par la marée',
              why: 'L’estran est une bande au bord de l’eau, pas la destination des villes de l’intérieur.',
            },
          ],
          quote: G_ARRIERE,
          explain: 'L’arrière-pays est l’espace continental que le port dessert.',
          src: ARRIERE,
        },
      ],
    },
    {
      title: 'Un projet dans un estuaire',
      lines: [
        'Une entreprise portuaire veut construire de nouveaux quais sur des marais en aval du fleuve.',
        'Des pêcheurs et une association craignent pour les oiseaux et les poissons.',
        'La commune doit réunir tout le monde avant de décider.',
      ],
      qs: [
        {
          q: 'Quel type de situation ce texte montre-t-il ?',
          a: 'un conflit d’usages qui demande un arbitrage entre acteurs',
          wrong: [
            {
              label: 'un accord total sur le projet de quais',
              why: 'Pêcheurs et association s’inquiètent : il n’y a pas d’accord total.',
            },
            {
              label: 'un lieu que personne ne souhaite utiliser',
              why: 'L’entreprise, les pêcheurs et l’association tiennent tous à cet espace.',
            },
          ],
          quote: E_ARBITRAGES,
          explain: 'Plusieurs acteurs veulent des usages différents du même espace : il faut arbitrer.',
          src: EDUSCOL,
        },
        {
          q: 'Pourquoi la protection des marais peut-elle gêner le projet ?',
          a: 'protéger cette zone humide limite la place disponible pour les quais',
          wrong: [
            {
              label: 'les marais attirent toujours plus d’usines',
              why: 'Le texte oppose le projet d’usages industriels et la protection des animaux.',
            },
            {
              label: 'un port n’a jamais besoin d’espace',
              why: 'Les quais occupent de la place : c’est justement l’enjeu.',
            },
          ],
          quote: G_ZIP_FREIN,
          explain: 'La protection des zones humides peut freiner l’extension du port.',
          src: ZIP,
        },
      ],
    },
    {
      title: 'Une ville qui change',
      lines: [
        'Autrefois, les bateaux accostaient au cœur de la ville, au fond d’un estuaire.',
        'Aujourd’hui, de grands quais occupent des kilomètres vers la mer.',
        'Une métropole s’est développée autour : bureaux, logements et entrepôts s’y côtoient.',
      ],
      qs: [
        {
          q: 'Qu’est-ce qui explique le déplacement des quais vers la mer ?',
          a: 'le besoin de place pour des navires et des activités plus importants',
          wrong: [
            {
              label: 'la disparition du commerce par la mer',
              why: 'De grands quais montrent au contraire un commerce actif.',
            },
            {
              label: 'l’interdiction de construire des quais près de la mer',
              why: 'Le texte montre que les nouveaux quais sont bâtis vers la mer.',
            },
          ],
          quote: E_NAVIRES,
          explain: 'Des navires toujours plus grands demandent de nouveaux sites.',
          src: EDUSCOL,
        },
      ],
    },
  ],
};

// ——— Notion 2 : littoral touristique ———

const touristique: Notion = {
  classe: '6e',
  id: 'g6-littoral-touristique',
  title: 'Habiter un littoral touristique',
  hint: 'Qui vient, qui vit sur place toute l’année, quels aménagements, et quels effets sur la nature ?',
  memo: [
    'Le tourisme transforme beaucoup les littoraux : front de mer, plages, **station balnéaire**, routes, gares et aéroports.',
    'On y habite de façon **permanente** ou **temporaire** : résidents, saisonniers, touristes. L’activité crée des emplois.',
    'Trop d’aménagements ou de visiteurs menacent la **biodiversité** et créent des conflits d’usage ; des mesures protègent certains lieux.',
  ],
  faits: [
    {
      q: 'Quel changement a rendu le littoral attractif pour le tourisme et la résidence ?',
      a: 'le regard des sociétés sur leur littoral a changé : il est devenu désiré',
      wrong: [
        {
          label: 'la mer a disparu et laissé place à des villes',
          why: 'La mer est toujours là : c’est le regard porté sur elle qui change.',
        },
        {
          label: 'les littoraux sont restés partout sans aménagement',
          why: 'Le tourisme transforme au contraire fortement les littoraux.',
        },
        {
          label: 'les voyages ont cessé partout dans le monde',
          why: 'Le tourisme suppose des voyages.',
        },
      ],
      gap: [
        'Le littoral est désormais ',
        ' et approprié, mis en valeur pour le tourisme ou la résidence.',
        ['désiré', 'desire'],
      ],
      choix: ['désiré', 'oublié', 'interdit'],
      quote: E_REGARD,
      explain: 'La façon de voir un lieu compte : ce qui est désiré attire des habitants et des visiteurs.',
      src: EDUSCOL,
    },
    {
      q: 'Qu’est-ce qu’une station touristique ?',
      a: 'un lieu créé et marqué par le tourisme',
      wrong: [
        {
          label: 'un port réservé aux marchandises',
          why: 'Un port de marchandises n’a pas le tourisme pour activité principale.',
        },
        { label: 'un champ cultivé loin de la mer', why: 'Un champ relève de l’agriculture, pas du tourisme.' },
        {
          label: 'une zone d’usines au bord d’un estuaire',
          why: 'Les usines au bord de l’eau forment un espace industriel.',
        },
      ],
      gap: ['Une station touristique est un lieu où l’activité ', ' est omniprésente.', ['touristique']],
      choix: ['touristique', 'minière', 'agricole'],
      quote: G_STATION,
      explain: 'Le tourisme a créé le lieu et y reste l’activité principale.',
      src: STATION,
    },
    {
      q: 'Qui peut habiter une station touristique ?',
      a: 'des touristes de passage, mais aussi une population permanente',
      wrong: [
        {
          label: 'uniquement des touristes, personne à l’année',
          why: 'Une population permanente habite aussi la station.',
        },
        {
          label: 'uniquement des ouvriers d’une usine',
          why: 'La station est définie par le tourisme et peut accueillir bien d’autres habitants.',
        },
        { label: 'personne, car la station est vide', why: 'La station est un lieu ouvert, habité.' },
      ],
      gap: ['Une station est aussi habitée par une population ', ', présente toute l’année.', ['permanente']],
      choix: ['permanente', 'imaginaire', 'flottante'],
      quote: G_STATION_POP,
      explain: 'Les rythmes sont différents : ceux qui restent et ceux qui séjournent.',
      src: STATION,
    },
    {
      q: 'Quels aménagements touristiques modifient les paysages d’un littoral ?',
      a: 'le front de mer, la plage et la station',
      wrong: [
        {
          label: 'les mines de charbon de haute montagne',
          why: 'Elles ne sont pas des aménagements touristiques du littoral.',
        },
        {
          label: 'les champs de blé de l’intérieur des terres',
          why: 'Les champs de l’intérieur ne sont pas un aménagement touristique du littoral.',
        },
        {
          label: 'les dunes laissées sans aucune intervention',
          why: 'Un espace laissé sans intervention n’est pas un aménagement.',
        },
      ],
      gap: ['Les aménagements touristiques, comme le front de mer et la plage, modifient les ', '.', ['paysages']],
      choix: ['paysages', 'saisons', 'marées'],
      quote: E_PAYSAGES,
      explain: 'Les pratiques et les constructions des acteurs du tourisme changent l’apparence des lieux.',
      src: EDUSCOL,
    },
    {
      q: 'Qu’est-ce qui aide à expliquer le développement touristique d’un littoral ?',
      a: 'son accessibilité par des gares ou des aéroports, et ses services',
      wrong: [
        {
          label: 'l’absence totale de moyens de transport',
          why: 'Sans transport, les visiteurs arrivent difficilement.',
        },
        {
          label: 'le seul nom de ses rivières',
          why: 'Un nom n’amène pas de visiteurs : l’accès et les services comptent.',
        },
        { label: 'l’interdiction d’y construire des services', why: 'Des services favorisent au contraire l’accueil.' },
      ],
      gap: ['Les gares et les ', ' facilitent l’arrivée des touristes sur un littoral.', ['aéroports', 'aeroports']],
      choix: ['aéroports', 'frontières', 'déserts'],
      quote: E_ACCES,
      explain: 'Un littoral bien relié au reste du monde peut accueillir plus de visiteurs.',
      src: EDUSCOL,
    },
    {
      q: 'Qu’appelle-t-on le surtourisme ?',
      a: 'les effets négatifs d’une fréquentation touristique excessive',
      wrong: [
        { label: 'le manque total de visiteurs dans un lieu', why: 'C’est l’inverse : il y en a trop.' },
        {
          label: 'un voyage de très longue durée',
          why: 'La durée du voyage n’est pas en cause : il s’agit de l’excès de visiteurs.',
        },
        {
          label: 'la construction d’un port de marchandises',
          why: 'Cela concerne le port, pas la fréquentation touristique.',
        },
      ],
      gap: ['Le surtourisme désigne les effets négatifs d’une fréquentation touristique ', '.', ['excessive']],
      choix: ['excessive', 'absente', 'secrète'],
      quote: G_SURTOURISME,
      explain: 'Trop de visiteurs peut gêner l’environnement, les habitants ou la visite elle-même.',
      src: SURTOURISME,
    },
    {
      q: 'Quel organisme français achète des terrains pour sauvegarder des espaces littoraux ?',
      a: 'le Conservatoire du littoral',
      wrong: [
        {
          label: 'la compagnie d’un grand port',
          why: 'Un port aménage pour les navires ; acheter des terrains pour les préserver est le rôle du Conservatoire.',
        },
        {
          label: 'une agence de voyages',
          why: 'Une agence organise des séjours ; elle n’a pas pour rôle de préserver des terrains.',
        },
        { label: 'un hôtel de bord de mer', why: 'Un hôtel accueille des touristes.' },
      ],
      gap: [
        'Des terrains fragiles du bord de mer sont achetés pour être préservés par le ',
        ' du littoral.',
        ['Conservatoire', 'conservatoire'],
      ],
      choix: ['Conservatoire', 'Marché', 'Club'],
      quote: G_CONSERVATOIRE,
      explain: 'En protégeant des terrains, on limite l’urbanisation et on préserve des milieux naturels.',
      src: CONSERVATOIRE,
    },
    {
      q: 'Quel effet les activités du littoral, comme le bétonnage ou une fréquentation trop forte, peuvent-elles avoir ?',
      a: 'mettre en tension l’économie et la biodiversité',
      wrong: [
        {
          label: 'faire apparaître toujours de nouvelles espèces',
          why: 'Le bétonnage et la surexploitation fragilisent les êtres vivants.',
        },
        {
          label: 'supprimer tous les emplois liés au tourisme',
          why: 'Le tourisme crée des emplois : la tension oppose économie et nature.',
        },
        { label: 'arrêter la marée sur toute la côte', why: 'Un aménagement ne stoppe pas la marée.' },
      ],
      gap: [
        'Le bétonnage et la surexploitation touristique mettent en tension le développement et la ',
        '.',
        ['biodiversité', 'biodiversite'],
      ],
      choix: ['biodiversité', 'géologie', 'monnaie'],
      quote: E_TENSION,
      explain: 'La faune et la flore des littoraux sont riches : il faut les prendre en compte et les protéger.',
      src: EDUSCOL,
    },
    {
      q: 'Quelle activité est un puissant moteur de transformation des littoraux depuis plus d’un siècle et demi ?',
      a: 'le tourisme',
      wrong: [
        { label: 'l’élevage de montagne', why: 'La montagne n’est pas le littoral.' },
        {
          label: 'l’exploitation des forêts polaires',
          why: 'Ces forêts ne sont pas l’activité qui transforme les littoraux.',
        },
        { label: 'la culture des oasis', why: 'Les oasis se trouvent dans les déserts.' },
      ],
      gap: ['Le ', ' est un puissant moteur de transformation des littoraux.', ['tourisme']],
      choix: ['tourisme', 'ski', 'désert'],
      quote: E_MOTEUR,
      explain:
        'Le tourisme balnéaire attire des visiteurs de près ou de loin et fait construire de nombreux aménagements.',
      src: EDUSCOL,
    },
    {
      q: 'Quel effet les activités multiples des littoraux ont-elles sur le travail ?',
      a: 'elles génèrent de nombreux emplois',
      wrong: [
        {
          label: 'elles suppriment toute forme de travail',
          why: 'Au contraire, ces activités ont besoin de travailleurs.',
        },
        { label: 'elles ne concernent que des robots', why: 'Des habitants travaillent dans ces activités.' },
        {
          label: 'elles n’emploient que des personnes vivant très loin',
          why: 'Les habitants du littoral y travaillent aussi.',
        },
      ],
      gap: ['Les activités des littoraux génèrent de nombreux ', '.', ['emplois']],
      choix: ['emplois', 'séismes', 'déserts'],
      quote: E_EMPLOIS,
      explain: 'Hôtels, commerces, ports ou pêche donnent du travail à des habitants.',
      src: EDUSCOL,
    },
  ],
  paires3: [
    ['Résident permanent', 'Habite le lieu toute l’année'],
    ['Touriste', 'Séjourne un temps puis repart'],
    ['Station balnéaire', 'Lieu de tourisme au bord de la mer'],
  ],
  paires5: [
    ['Front de mer', 'Promenade et bâtiments face à la mer'],
    ['Surtourisme', 'Effets d’un nombre excessif de visiteurs'],
    ['Biodiversité', 'Diversité des êtres vivants'],
    ['Conservatoire du littoral', 'Protège des terrains du bord de mer'],
    ['Conflit d’usages', 'Désaccord sur l’emploi d’un même espace'],
  ],
  libres: [
    {
      q: 'Quel mot désigne les effets négatifs d’un nombre excessif de touristes dans un lieu ?',
      accepted: ['surtourisme', 'le surtourisme', 'sur-tourisme'],
      traps: [
        { text: 'tourisme', why: 'Le tourisme est l’activité ; le préfixe « sur » indique l’excès.' },
        { text: 'urbanisation', why: 'L’urbanisation est la construction de villes et d’équipements.' },
      ],
      quote: G_SURTOURISME,
      explain: 'Le préfixe « sur » signale une fréquentation excessive.',
      src: SURTOURISME,
    },
    {
      q: 'Une station située au bord de la mer, tournée vers les bains, est dite station … (un adjectif).',
      accepted: ['balnéaire', 'balneaire'],
      traps: [
        { text: 'portuaire', why: 'Portuaire concerne un port.' },
        { text: 'industrielle', why: 'Industrielle concerne la fabrication de produits.' },
      ],
      quote: C_BALNEAIRE,
      explain: 'Balnéaire concerne les bains : la station balnéaire accueille les baigneurs.',
      src: 'cnrtl-balneaire',
    },
    {
      q: 'Comment appelle-t-on l’établissement public qui protège des terrains du bord de mer en France (le … du littoral) ?',
      accepted: ['Conservatoire', 'le Conservatoire', 'Conservatoire du littoral', 'le Conservatoire du littoral'],
      traps: [
        {
          text: 'parc',
          why: 'Un parc est un espace protégé ; l’établissement qui achète des terrains porte un autre nom.',
        },
        { text: 'musée', why: 'Un musée conserve des objets, pas des terrains du littoral.' },
      ],
      quote: G_CONSERVATOIRE,
      explain: 'Le Conservatoire achète des terrains pour les préserver.',
      src: CONSERVATOIRE,
    },
    {
      q: 'Selon le programme, quelle richesse des littoraux, avec la flore, invite à les protéger (un mot) ?',
      accepted: ['faune', 'la faune'],
      traps: [
        { text: 'flore', why: 'La flore désigne les plantes : elle est déjà citée dans la question.' },
        { text: 'houille', why: 'La houille est un charbon, pas un ensemble d’êtres vivants.' },
      ],
      quote: P_PROTECTION,
      explain: 'La faune désigne les animaux d’un milieu, la flore ses plantes.',
    },
  ],
  docs: [
    {
      title: 'Une lagune protégée',
      lines: [
        'Des familles vivent de la pêche et de l’élevage de coquillages dans une lagune.',
        'Un projet de base de loisirs prévoit des bateaux à moteur au même endroit.',
        'La région envisage d’y créer une réserve naturelle.',
      ],
      qs: [
        {
          q: 'Quel risque le projet de loisirs fait-il courir aux pêcheurs et aux éleveurs ?',
          a: 'que leurs activités soient concurrencées par une autre',
          wrong: [
            {
              label: 'qu’ils n’aient plus aucun voisin',
              why: 'Le projet apporte au contraire d’autres usagers.',
            },
            {
              label: 'que la lagune se transforme en montagne',
              why: 'Un projet de loisirs ne change pas la lagune en montagne.',
            },
          ],
          quote: E_PECHE,
          explain: 'La pêche et l’aquaculture peuvent être concurrencées par d’autres activités.',
          src: EDUSCOL,
        },
        {
          q: 'À quoi peut servir la réserve naturelle envisagée ?',
          a: 'à encadrer les usages pour protéger le milieu',
          wrong: [
            {
              label: 'à construire le plus possible au bord de l’eau',
              why: 'Une réserve sert à protéger, pas à multiplier les constructions.',
            },
            {
              label: 'à faire disparaître la faune et la flore',
              why: 'La protection vise à les préserver.',
            },
          ],
          quote: E_PROTEGER,
          explain: 'Les réserves et les parcs font partie des moyens de protection des littoraux.',
          src: EDUSCOL,
        },
      ],
    },
    {
      title: 'Une saison dans une station',
      lines: [
        'En été, la population d’une petite commune du bord de mer est multipliée par les vacanciers.',
        'Des hôtels, une promenade et un parking longent la plage ; une gare accueille les visiteurs.',
        'Une cuisinière saisonnière y travaille l’été et un pêcheur y vit toute l’année.',
      ],
      qs: [
        {
          q: 'Comment ce littoral est-il habité ?',
          a: 'de façon permanente par certains et temporaire par d’autres',
          wrong: [
            {
              label: 'uniquement par des habitants permanents',
              why: 'Les vacanciers et la saisonnière sont là pour un temps.',
            },
            {
              label: 'par des marchandises et sans personne',
              why: 'Des personnes y vivent, y travaillent et y séjournent.',
            },
          ],
          quote: E_TEMPORAIRE,
          explain: 'Les habitants permanents et temporaires partagent le même espace.',
          src: EDUSCOL,
        },
        {
          q: 'Quel élément facilite l’arrivée des visiteurs ?',
          a: 'la gare, qui améliore l’accessibilité',
          wrong: [
            {
              label: 'le métier de pêcheur',
              why: 'La pêche est une activité : elle ne transporte pas les visiteurs.',
            },
            {
              label: 'le parking, qui remplace tous les transports',
              why: 'Un parking sert à garer des véhicules : il ne remplace pas les transports.',
            },
          ],
          quote: E_ACCES,
          explain: 'Les gares et les aéroports rendent un littoral accessible.',
          src: EDUSCOL,
        },
      ],
    },
    {
      title: 'Deux projets pour une même plage',
      lines: [
        'Un promoteur propose de construire un grand complexe hôtelier derrière la plage.',
        'Des habitants défendent les dunes où nichent des oiseaux.',
        'Des commerçants espèrent de nouveaux emplois pour l’été.',
      ],
      qs: [
        {
          q: 'Que doit faire la société face à ces demandes ?',
          a: 'arbitrer entre des usages et des acteurs différents',
          wrong: [
            {
              label: 'ignorer tous les habitants',
              why: 'Les habitants font partie des acteurs concernés.',
            },
            {
              label: 'considérer qu’il n’y a aucun désaccord',
              why: 'Les attentes s’opposent : il y a bien un désaccord.',
            },
          ],
          quote: E_ARBITRAGES,
          explain: 'Des concurrences entre usages demandent des décisions : ce sont des arbitrages.',
          src: EDUSCOL,
        },
        {
          q: 'Pourquoi les défenseurs des dunes s’inquiètent-ils ?',
          a: 'le bétonnage pourrait fragiliser la biodiversité',
          wrong: [
            {
              label: 'un hôtel apporte forcément plus d’oiseaux',
              why: 'Construire sur ces espaces peut abîmer les milieux de vie.',
            },
            {
              label: 'les commerçants ne veulent aucun emploi',
              why: 'Les commerçants espèrent au contraire des emplois.',
            },
          ],
          quote: E_TENSION,
          explain: 'L’artificialisation et le bétonnage mettent en tension économie et biodiversité.',
          src: EDUSCOL,
        },
      ],
    },
    {
      title: 'Une côte à deux visages',
      lines: [
        'D’un côté d’une baie, de grands quais et des cuves reçoivent des navires.',
        'De l’autre, des plages et des hôtels accueillent des vacanciers.',
        'Les habitants traversent la baie pour travailler ou pour se promener.',
      ],
      qs: [
        {
          q: 'Qu’illustre ce paysage ?',
          a: 'une zone portuaire et une station balnéaire peuvent coexister sur un même littoral',
          wrong: [
            {
              label: 'un littoral ne peut avoir qu’une seule activité',
              why: 'Le texte montre un port et des plages sur la même baie.',
            },
            {
              label: 'ce littoral est totalement vide',
              why: 'Des navires, des vacanciers et des habitants l’occupent.',
            },
          ],
          quote: E_COEXISTER,
          explain: 'Les littoraux sont variés : plusieurs activités peuvent se côtoyer.',
          src: EDUSCOL,
        },
      ],
    },
  ],
};

// ——— Notion 3 : risques littoraux ———

const risques: Notion = {
  classe: '6e',
  id: 'g6-risques-littoraux',
  title: 'Les risques sur les littoraux',
  hint: 'Distingue le phénomène possible, les personnes et les biens exposés, et les moyens de se protéger.',
  memo: [
    'Un **aléa** est un phénomène possible (tempête, tsunami). Il devient un **risque** quand des personnes ou des biens y sont exposés et fragiles.',
    'Les littoraux connaissent la **submersion marine** (la mer inonde la côte un temps) et le recul du **trait de côte** par l’**érosion**.',
    'La **prévention** réduit les dommages : alertes, plans, digues, et protection des dunes, des récifs ou des mangroves.',
  ],
  faits: [
    {
      q: 'Qu’est-ce qu’une submersion marine ?',
      a: 'une inondation temporaire des zones côtières par la mer',
      wrong: [
        { label: 'la disparition de la mer pendant un été', why: 'C’est l’inverse : l’eau de mer envahit les terres.' },
        { label: 'un séisme qui secoue seulement les montagnes', why: 'La submersion est une inondation du littoral.' },
        {
          label: 'un recul de la côte dû à l’usure des roches',
          why: 'Cette usure s’appelle l’érosion : elle n’est pas une inondation.',
        },
      ],
      gap: ['La submersion marine est une inondation ', ' des zones côtières par la mer.', ['temporaire']],
      choix: ['temporaire', 'éternelle', 'souterraine'],
      quote: M_SUBMERSION,
      explain: 'Elle survient quand la météo et la marée sont défavorables.',
      src: RISQUES,
    },
    {
      q: 'Comment le recul du trait de côte s’est-il aggravé ?',
      a: 'sous la pression des activités humaines',
      wrong: [
        { label: 'parce que la côte ne bouge jamais', why: 'Le trait de côte peut reculer ou avancer.' },
        {
          label: 'à cause de la seule baisse du tourisme',
          why: 'Le texte met en cause la pression des activités humaines.',
        },
        {
          label: 'par la disparition de tous les habitants',
          why: 'Le phénomène est aggravé par la présence et les activités humaines.',
        },
      ],
      gap: ['Le recul du trait de côte, naturel, s’est aggravé sous la pression des activités ', '.', ['humaines']],
      choix: ['humaines', 'lunaires', 'volcaniques'],
      quote: M_RECUL,
      explain: 'Un phénomène naturel peut être renforcé par les aménagements et les usages des sociétés.',
      src: RISQUES,
    },
    {
      q: 'Selon le ministère chargé de l’écologie, qu’est-ce qui cause les tsunamis ?',
      a: 'un séisme sous-marin',
      wrong: [
        { label: 'une simple pluie d’été', why: 'Une pluie ne provoque pas la grande vague d’un tsunami.' },
        { label: 'le passage d’un navire', why: 'Un navire ne produit pas un tsunami.' },
        { label: 'la marée de chaque jour', why: 'La marée est un autre phénomène, régulier.' },
      ],
      gap: ['Les tsunamis sont causés par des ', ' sous-marins.', ['séismes', 'seismes']],
      choix: ['séismes', 'navires', 'nuages'],
      quote: M_TSUNAMI,
      explain: 'Un tremblement de terre sous la mer peut soulever des vagues qui atteignent les côtes.',
      src: RISQUES,
    },
    {
      q: 'Quand un aléa devient-il un risque ?',
      a: 'quand des enjeux vulnérables sont exposés',
      wrong: [
        { label: 'dès qu’il se produit, même sur un lieu désert', why: 'Sans enjeux exposés, il n’y a pas de risque.' },
        { label: 'seulement quand il dure plusieurs années', why: 'La durée ne définit pas le risque.' },
        { label: 'quand il est filmé par les médias', why: 'La présence des médias ne crée pas le risque.' },
      ],
      gap: [
        'Un aléa devient un risque en présence d’enjeux ayant une certaine ',
        '.',
        ['vulnérabilité', 'vulnerabilite'],
      ],
      choix: ['vulnérabilité', 'longitude', 'température'],
      quote: G_ALEA,
      explain: 'Aléa et enjeux fragiles doivent se rencontrer pour qu’on parle de risque.',
      src: ALEA,
    },
    {
      q: 'Qu’appelle-t-on les « enjeux » dans l’étude des risques ?',
      a: 'les personnes, les biens et les milieux qui peuvent être touchés',
      wrong: [
        { label: 'les vagues elles-mêmes', why: 'Les vagues sont le phénomène, c’est-à-dire l’aléa.' },
        {
          label: 'les règles d’un jeu de plage',
          why: 'En géographie des risques, le mot a un sens précis lié à ce qui est exposé.',
        },
        { label: 'la date des prochaines vacances', why: 'Une date n’est pas un élément exposé.' },
      ],
      gap: ['Les ', ' sont les personnes, biens et milieux qui peuvent être touchés par un phénomène.', ['enjeux']],
      choix: ['enjeux', 'aléas', 'reliefs'],
      quote: G_ENJEUX,
      explain: 'Plus des personnes et des biens sont exposés, plus il y a d’enjeux.',
      src: ENJEUX,
    },
    {
      q: 'Pourquoi les risques littoraux sont-ils de plus en plus importants en France, selon le ministère chargé de l’écologie ?',
      a: 'parce que de plus en plus de personnes s’installent près des côtes',
      wrong: [
        { label: 'parce que les côtes se vident', why: 'C’est l’inverse : les installations augmentent.' },
        { label: 'parce que la mer a disparu', why: 'La mer est toujours là : c’est l’exposition qui grandit.' },
        { label: 'parce que les alertes sont interdites', why: 'Des systèmes d’alerte existent au contraire.' },
      ],
      gap: [
        'Les risques littoraux augmentent avec l’installation croissante des ',
        ' en zones côtières.',
        ['populations'],
      ],
      choix: ['populations', 'rivières', 'falaises'],
      quote: M_INSTALLATION,
      explain: 'Plus d’habitants près de la mer signifie plus d’enjeux exposés.',
      src: RISQUES,
    },
    {
      q: 'À quoi servent les zones de danger et de précaution des plans de prévention des risques ?',
      a: 'à encadrer les constructions, avec des interdictions ou des obligations',
      wrong: [
        {
          label: 'à encourager toute construction au bord de l’eau',
          why: 'Le plan vise à limiter les constructions dans les zones les plus dangereuses.',
        },
        {
          label: 'à interdire aux habitants de tout le pays de voyager',
          why: 'Le plan concerne l’usage des terrains.',
        },
        { label: 'à supprimer les marées', why: 'Un plan n’agit pas sur la marée.' },
      ],
      gap: [
        'Les plans de prévention peuvent prévoir des ',
        ' de construire dans les zones de danger.',
        ['interdictions', 'interdiction'],
      ],
      choix: ['interdictions', 'récompenses', 'vacances'],
      quote: M_PPR,
      explain: 'Prévenir, c’est limiter les dommages avant que le phénomène arrive.',
      src: RISQUES,
    },
    {
      q: 'Quel milieu naturel des littoraux tropicaux protège les sols contre l’érosion ?',
      a: 'la mangrove',
      wrong: [
        { label: 'le parking', why: 'Un parking est un aménagement, pas un milieu naturel.' },
        { label: 'la toundra', why: 'La toundra est une végétation de climat froid.' },
        { label: 'la zone industrialo-portuaire', why: 'C’est un espace d’activités humaines.' },
      ],
      gap: ['La ', ' est une végétation des littoraux tropicaux, utile contre l’érosion.', ['mangrove']],
      choix: ['mangrove', 'toundra', 'steppe'],
      quote: G_MANGROVE_UTILE,
      explain: 'Protéger les milieux naturels protège aussi les habitants et la biodiversité.',
      src: MANGROVE,
    },
    {
      q: 'Qu’exprime la vulnérabilité face à un aléa ?',
      a: 'le niveau des effets prévisibles sur les sociétés et leurs activités',
      wrong: [
        {
          label: 'la vitesse du vent pendant une tempête',
          why: 'La vitesse du vent décrit le phénomène, pas la fragilité des sociétés.',
        },
        { label: 'la date exacte du prochain tsunami', why: 'La vulnérabilité ne donne pas de date.' },
        { label: 'la hauteur d’une montagne proche', why: 'La hauteur d’un relief n’est pas la définition.' },
      ],
      gap: [
        'La ',
        ' exprime le niveau d’effet prévisible d’un phénomène naturel sur les sociétés.',
        ['vulnérabilité', 'vulnerabilite'],
      ],
      choix: ['vulnérabilité', 'marée', 'latitude'],
      quote: G_VULNERABILITE,
      explain: 'Pour un même aléa, les dommages attendus peuvent être très différents selon ce qui est exposé.',
      src: VULNERABILITE,
    },
  ],
  paires3: [
    ['Submersion marine', 'La mer inonde la côte un moment'],
    ['Tsunami', 'Grande vague née souvent d’un séisme en mer'],
    ['Érosion', 'Usure de la côte qui la fait reculer'],
  ],
  paires5: [
    ['Aléa', 'Phénomène possible qui perturbe un milieu'],
    ['Enjeux', 'Personnes et biens qui peuvent être touchés'],
    ['Vulnérabilité', 'Fragilité face au phénomène'],
    ['Prévention', 'Agir avant pour réduire les dommages'],
    ['Digue', 'Ouvrage qui protège de la mer'],
  ],
  libres: [
    {
      q: 'Quel mot désigne la possibilité qu’un événement, comme une tempête, perturbe un milieu ?',
      accepted: ['aléa', 'l’aléa', 'alea', 'un aléa'],
      traps: [
        { text: 'enjeu', why: 'Les enjeux sont ce qui peut être touché.' },
        { text: 'prévention', why: 'La prévention est ce qu’on fait pour limiter les dommages.' },
      ],
      quote: G_ALEA_DEF,
      explain: 'L’aléa est le phénomène possible ; le risque demande en plus des enjeux exposés.',
      src: ALEA,
    },
    {
      q: 'Quel ouvrage surélevé protège une côte contre les marées et la houle ?',
      accepted: ['digue', 'une digue', 'la digue', 'des digues', 'digues'],
      traps: [
        { text: 'dune', why: 'La dune est un tas de sable naturel ; on attend un ouvrage construit.' },
        { text: 'quai', why: 'Un quai sert à accoster et à charger les navires.' },
      ],
      quote: G_DIGUE,
      explain: 'La digue retient l’eau et protège les terrains situés derrière elle.',
      src: DIGUE,
    },
    {
      q: 'Comment appelle-t-on la limite entre la terre et la mer, qui peut reculer ou avancer ? (le trait de …)',
      accepted: ['côte', 'trait de côte', 'le trait de côte', 'cote'],
      traps: [
        { text: 'plage', why: 'La plage est un espace, pas la ligne de limite.' },
        { text: 'frontière', why: 'Une frontière sépare des États.' },
      ],
      quote: G_TRAIT,
      explain: 'Le trait de côte se déplace avec l’érosion ou l’accumulation de sable et de boue.',
      src: TRAIT,
    },
    {
      q: 'Comment appelle-t-on la grande vague provoquée par exemple par un séisme sous la mer ?',
      accepted: ['tsunami', 'un tsunami', 'le tsunami', 'raz de marée', 'raz-de-marée'],
      traps: [
        { text: 'marée', why: 'La marée est la montée et la descente régulière de la mer.' },
        { text: 'houle', why: 'La houle est un mouvement des vagues, pas cette vague exceptionnelle.' },
      ],
      quote: C_TSUNAMI,
      explain: 'Un tsunami peut provoquer de graves dégâts quand il atteint une côte.',
      src: 'cnrtl-tsunami',
    },
  ],
  docs: [
    {
      title: 'Deux îles et un même cyclone',
      lines: [
        'Un cyclone passe sur un petit îlot sans habitants.',
        'La semaine suivante, un cyclone de même force touche une île où des villes longent la côte.',
        'Sur la seconde île, des maisons et des routes sont endommagées.',
      ],
      qs: [
        {
          q: 'Pourquoi la seconde situation est-elle un risque majeur ?',
          a: 'des personnes et des biens vulnérables sont exposés au cyclone',
          wrong: [
            {
              label: 'le cyclone y est forcément plus fort',
              why: 'Le texte indique une force identique : ce sont les enjeux qui diffèrent.',
            },
            {
              label: 'l’îlot désert a davantage de maisons',
              why: 'L’îlot est sans habitants : il n’a pas ces enjeux.',
            },
          ],
          quote: G_ILE,
          explain: 'Sans enjeux, le même phénomène n’est pas un risque.',
          src: ALEA,
        },
        {
          q: 'Dans ce texte, que représentent les maisons et les routes ?',
          a: 'des enjeux',
          wrong: [
            { label: 'l’aléa', why: 'L’aléa est le cyclone lui-même.' },
            { label: 'la prévention', why: 'La prévention regroupe les actions menées avant le phénomène.' },
          ],
          quote: G_ENJEUX,
          explain: 'Les biens et équipements exposés sont des enjeux.',
          src: ENJEUX,
        },
      ],
    },
    {
      title: 'Une commune basse au bord de l’océan',
      lines: [
        'Des maisons sont construites derrière une dune, sur un terrain plus bas que la mer à marée haute.',
        'La nuit, une tempête et une forte marée font entrer l’eau dans les rues.',
        'La mairie réfléchit à des règles pour les futures constructions et à l’entretien de la dune.',
      ],
      qs: [
        {
          q: 'Quel phénomène le texte décrit-il ?',
          a: 'une submersion marine',
          wrong: [
            { label: 'un séisme de montagne', why: 'L’eau vient de la mer : ce n’est pas un séisme.' },
            { label: 'une crue d’un torrent', why: 'La mer, avec la tempête et la marée, inonde la commune.' },
          ],
          quote: M_SUBMERSION,
          explain: 'Météo et marée défavorables peuvent provoquer une inondation temporaire par la mer.',
          src: RISQUES,
        },
        {
          q: 'Pourquoi entretenir la dune ?',
          a: 'elle joue un rôle de protection naturelle',
          wrong: [
            { label: 'elle sert de port aux grands navires', why: 'Une dune de sable n’est pas un port.' },
            {
              label: 'elle supprime les tempêtes',
              why: 'La dune n’arrête pas le vent ; elle protège contre l’eau et l’érosion.',
            },
          ],
          quote: M_SOUPLE,
          explain: 'On peut protéger la côte en préservant des structures naturelles comme les dunes.',
          src: RISQUES,
        },
      ],
    },
    {
      title: 'Une alerte avant la tempête',
      lines: [
        'La veille d’une grosse tempête, un bulletin signale un danger de vagues et d’inondation par la mer.',
        'Les habitants rangent le matériel et évitent le bord de l’eau.',
        'Des voisins vérifient que les personnes âgées sont bien informées.',
      ],
      qs: [
        {
          q: 'À quoi sert ce bulletin ?',
          a: 'à prévenir à l’avance pour réduire les dommages',
          wrong: [
            {
              label: 'à empêcher la tempête de se former',
              why: 'Une alerte informe ; elle ne supprime pas la tempête.',
            },
            { label: 'à vendre des billets pour voir les vagues', why: 'L’alerte vise la sécurité.' },
          ],
          quote: M_VIGILANCE,
          explain: 'La vigilance « vagues-submersion » permet de se préparer.',
          src: RISQUES,
        },
      ],
    },
  ],
};

// ——— Notion 4 : vocabulaire ———

const vocabulaire: Notion = {
  classe: '6e',
  id: 'g6-vocabulaire-littoraux',
  title: 'Le vocabulaire des littoraux',
  hint: 'Demande-toi si le mot désigne un espace, un port, un bateau ou un phénomène.',
  memo: [
    'Le **littoral** est l’espace de contact entre la terre et la mer : c’est une **interface**, où des échanges se font.',
    'Un **estuaire** est la large embouchure d’un fleuve touchée par la marée ; une **rade** est un grand bassin où les navires s’abritent.',
    'La **littoralisation** est la concentration des habitants et des activités près des côtes. L’**estran** est couvert puis découvert par la marée.',
  ],
  faits: [
    {
      q: 'Qu’est-ce que le littoral ?',
      a: 'l’espace de contact entre la terre et la mer',
      wrong: [
        { label: 'le sommet d’une montagne', why: 'Le littoral est au bord de la mer, pas en altitude.' },
        { label: 'le fond des océans loin de toute terre', why: 'Le littoral touche la terre.' },
        {
          label: 'la frontière entre deux pays voisins',
          why: 'Une frontière sépare des États ; le littoral touche la mer.',
        },
      ],
      gap: ['Le littoral est l’espace de contact entre la terre et la ', '.', ['mer']],
      choix: ['mer', 'forêt', 'montagne'],
      quote: E_CONTACT,
      explain: 'La mer et ses influences agissent sur cet espace.',
      src: EDUSCOL,
    },
    {
      q: 'Qu’est-ce qu’une interface ?',
      a: 'une bande de contact entre deux espaces, avec des échanges',
      wrong: [
        { label: 'un mur qui interdit tout passage', why: 'Une interface suppose au contraire des passages.' },
        { label: 'une île isolée sans aucune relation', why: 'Une interface met deux espaces en relation.' },
        { label: 'le nombre d’habitants par kilomètre carré', why: 'Ce nombre est la densité.' },
      ],
      gap: ['Une ', ' est une bande de contact entre deux espaces différents, avec des échanges.', ['interface']],
      choix: ['interface', 'frontière', 'densité'],
      quote: G_INTERFACE,
      explain: 'Le littoral est une interface entre la terre et la mer.',
      src: INTERFACE,
    },
    {
      q: 'Comment appelle-t-on la concentration des populations et des activités près des côtes ?',
      a: 'la littoralisation',
      wrong: [
        {
          label: 'la métropolisation',
          why: 'La métropolisation concerne la concentration dans les très grandes villes.',
        },
        {
          label: 'la désertification',
          why: 'La désertification ne désigne pas l’arrivée d’habitants et d’activités près des côtes.',
        },
        { label: 'la poldérisation', why: 'La poldérisation gagne des terres sur l’eau.' },
      ],
      gap: ['La ', ' est la concentration des populations et des activités près des littoraux.', ['littoralisation']],
      choix: ['littoralisation', 'désertification', 'poldérisation'],
      quote: G_LITTORALISATION,
      explain: 'Les littoraux concentrent une part croissante des habitants et des activités.',
      src: LITTORALISATION,
    },
    {
      q: 'Qu’est-ce qu’un estuaire ?',
      a: 'la large embouchure d’un fleuve où la marée se fait sentir',
      wrong: [
        { label: 'la source d’un fleuve en montagne', why: 'La source est le début du fleuve, loin de la mer.' },
        { label: 'un lac fermé sans relation avec la mer', why: 'L’estuaire est ouvert vers la mer.' },
        { label: 'une digue construite devant un port', why: 'Une digue est un ouvrage construit.' },
      ],
      gap: ['L’', ' est la large embouchure d’un fleuve où la marée se fait sentir.', ['estuaire']],
      choix: ['estuaire', 'estran', 'archipel'],
      quote: C_ESTUAIRE,
      explain: 'Fleuve, mer et terre s’y rencontrent.',
      src: 'cnrtl-estuaire',
    },
    {
      q: 'Que désigne une rade ?',
      a: 'un vaste bassin ouvert sur la mer où les navires peuvent s’abriter',
      wrong: [
        { label: 'un navire qui transporte du pétrole', why: 'Ce navire est un pétrolier.' },
        { label: 'un terrain asséché gagné sur la mer', why: 'Ce terrain est un polder.' },
        { label: 'une vague provoquée par un séisme', why: 'Cette vague est un tsunami.' },
      ],
      gap: ['Une ', ' est un vaste bassin ouvert sur la mer, où les navires s’abritent.', ['rade']],
      choix: ['rade', 'digue', 'dune'],
      quote: C_RADE,
      explain: 'Les ports se sont souvent installés dans des sites abrités comme les rades.',
      src: 'cnrtl-rade',
    },
    {
      q: 'Qu’est-ce que l’estran ?',
      a: 'la bande tantôt couverte, tantôt découverte par la marée',
      wrong: [
        {
          label: 'le haut des falaises toujours hors d’eau',
          why: 'L’estran est recouvert par la mer à certaines heures.',
        },
        { label: 'la partie profonde de la haute mer', why: 'La haute mer est toujours couverte d’eau.' },
        { label: 'la ligne de bateaux devant un port', why: 'L’estran est un espace du rivage.' },
      ],
      gap: ['L’', ' est l’espace tour à tour couvert et découvert par la marée.', ['estran']],
      choix: ['estran', 'estuaire', 'arrière-pays'],
      quote: G_ESTRAN,
      explain: 'La marée monte et descend : l’estran change avec elle.',
      src: ESTRAN,
    },
    {
      q: 'Qu’est-ce qu’un polder ?',
      a: 'un espace conquis sur l’eau, endigué puis asséché',
      wrong: [
        { label: 'une plage laissée intacte', why: 'Le polder est un terrain aménagé et protégé par des digues.' },
        { label: 'un navire de marchandises', why: 'Un polder est un terrain, pas un navire.' },
        { label: 'une forêt de palétuviers', why: 'Cette forêt des côtes tropicales est la mangrove.' },
      ],
      gap: ['Un ', ' est un terrain gagné sur l’eau grâce à des digues et au drainage.', ['polder']],
      choix: ['polder', 'lagon', 'estran'],
      quote: G_POLDER,
      explain: 'Les digues empêchent le retour de l’eau, et le drainage évacue ce qui reste.',
      src: POLDER,
    },
    {
      q: 'Qu’est-ce que la mangrove ?',
      a: 'une végétation des côtes des régions tropicales',
      wrong: [
        { label: 'une végétation des régions polaires', why: 'La mangrove pousse dans les régions chaudes.' },
        { label: 'une roche qui forme les falaises', why: 'La mangrove est faite de plantes.' },
        { label: 'un port réservé aux navires de pêche', why: 'La mangrove est un milieu naturel.' },
      ],
      gap: ['La ', ' est une formation végétale des littoraux intertropicaux.', ['mangrove']],
      choix: ['mangrove', 'toundra', 'rade'],
      quote: G_MANGROVE,
      explain: 'Les palétuviers de la mangrove abritent une riche faune.',
      src: MANGROVE,
    },
    {
      q: 'Selon le programme, que concentrent de plus en plus les littoraux ?',
      a: 'une part accrue de la population mondiale',
      wrong: [
        { label: 'la totalité des glaciers de la planète', why: 'Les glaciers ne sont pas ce que le programme cite.' },
        { label: 'une part de plus en plus faible des habitants', why: 'C’est l’inverse : la part augmente.' },
        { label: 'uniquement des espaces sans usage', why: 'Les littoraux sont aménagés pour des usages très variés.' },
      ],
      gap: ['Les littoraux concentrent une part accrue de la ', ' mondiale.', ['population']],
      choix: ['population', 'neige', 'monnaie'],
      quote: P_CONCENTRENT,
      explain: 'Les littoraux attirent et sont aménagés pour des usages variés.',
    },
  ],
  paires3: [
    ['Littoral', 'Contact entre la terre et la mer'],
    ['Estuaire', 'Large embouchure d’un fleuve'],
    ['Polder', 'Terrain gagné sur l’eau'],
  ],
  paires5: [
    ['Interface', 'Bande de contact avec des échanges'],
    ['Rade', 'Grand bassin où les navires s’abritent'],
    ['Estran', 'Bande couverte puis découverte par la marée'],
    ['Littoralisation', 'Concentration près des côtes'],
    ['Arrière-pays', 'Terres desservies par un port'],
  ],
  libres: [
    {
      q: 'Quel mot désigne la large embouchure d’un fleuve où la marée se fait sentir ?',
      accepted: ['estuaire', 'un estuaire', 'l’estuaire'],
      traps: [
        {
          text: 'delta',
          why: 'Le delta est une autre forme d’embouchure ; on attend celle qui est large et touchée par la marée.',
        },
        { text: 'estran', why: 'L’estran est la bande du rivage que la marée découvre.' },
      ],
      quote: C_ESTUAIRE,
      explain: 'L’estuaire est à la rencontre du fleuve et de la mer.',
      src: 'cnrtl-estuaire',
    },
    {
      q: 'Quel mot désigne la concentration des habitants et des activités près des côtes ?',
      accepted: ['littoralisation', 'la littoralisation'],
      traps: [
        {
          text: 'urbanisation',
          why: 'L’urbanisation désigne la croissance des villes, pas précisément près des côtes.',
        },
        { text: 'métropolisation', why: 'La métropolisation concerne les très grandes villes.' },
      ],
      quote: G_LITTORALISATION,
      explain: 'Le mot est formé sur « littoral ».',
      src: LITTORALISATION,
    },
    {
      q: 'Quel mot désigne le terrain gagné sur la mer, entouré de digues et asséché ?',
      accepted: ['polder', 'un polder', 'des polders', 'polders'],
      traps: [
        { text: 'lagon', why: 'Le lagon est une étendue d’eau au centre d’un atoll.' },
        { text: 'rade', why: 'La rade est un bassin d’eau où les navires s’abritent.' },
      ],
      quote: G_POLDER,
      explain: 'La poldérisation permet de gagner des terres sur l’eau.',
      src: POLDER,
    },
    {
      q: 'Quel mot désigne l’espace situé entre mer et terre, soumis aux forces de la mer (il commence par « litt ») ?',
      accepted: ['littoral', 'le littoral', 'un littoral'],
      traps: [
        { text: 'littérature', why: 'La littérature désigne les œuvres écrites.' },
        { text: 'estran', why: 'L’estran n’est que la partie découverte par la marée.' },
      ],
      quote: C_LITTORAL,
      explain: 'Le littoral s’étend au contact de la mer.',
      src: 'cnrtl-littoral',
    },
  ],
  docs: [
    {
      title: 'Au bord d’un grand fleuve',
      lines: [
        'Près de la mer, le fleuve s’élargit : à marée haute, l’eau salée remonte.',
        'Des quais, des marais et des villes bordent ses rives.',
        'Marchandises et personnes passent de la mer vers l’intérieur des terres, et inversement.',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on cette forme de littoral ?',
          a: 'un estuaire',
          wrong: [
            { label: 'un polder', why: 'Un polder est un terrain asséché derrière des digues.' },
            { label: 'une île', why: 'Une île est entourée d’eau : le texte décrit un fleuve qui rejoint la mer.' },
          ],
          quote: C_ESTUAIRE,
          explain: 'Un fleuve large où la marée se fait sentir est un estuaire.',
          src: 'cnrtl-estuaire',
        },
        {
          q: 'Pourquoi ce lieu est-il une interface ?',
          a: 'la mer et les terres y échangent des marchandises et des personnes',
          wrong: [
            { label: 'aucun échange ne s’y produit', why: 'Le texte décrit des passages dans les deux sens.' },
            { label: 'il ne touche ni la mer ni la terre', why: 'Le fleuve rejoint la mer et longe des villes.' },
          ],
          quote: G_INTERFACE,
          explain: 'Contact entre deux espaces et échanges : voilà une interface.',
          src: INTERFACE,
        },
      ],
    },
    {
      title: 'Une promenade à marée basse',
      lines: [
        'Le matin, des enfants ramassent des coquillages sur un sol mouillé et rocheux.',
        'L’après-midi, la mer recouvre entièrement ce même endroit.',
        'Plus haut, des maisons restent toujours au sec.',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on l’endroit où les enfants ramassent des coquillages ?',
          a: 'l’estran',
          wrong: [
            { label: 'l’arrière-pays', why: 'L’arrière-pays est loin à l’intérieur des terres.' },
            { label: 'la rade', why: 'La rade est un grand bassin d’eau pour les navires.' },
          ],
          quote: G_ESTRAN,
          explain: 'Tour à tour sec et couvert par la mer : c’est l’estran.',
          src: ESTRAN,
        },
      ],
    },
    {
      title: 'Une côte qui s’est peuplée',
      lines: [
        'Au fil des années, de nombreuses familles se sont installées près de la mer.',
        'Des ports, des usines et des hôtels ont été construits.',
        'Les terrains disponibles sont devenus rares et recherchés.',
      ],
      qs: [
        {
          q: 'Quel mot de géographie résume cette évolution ?',
          a: 'la littoralisation',
          wrong: [
            { label: 'la désertification', why: 'Le texte décrit au contraire un lieu qui se peuple.' },
            {
              label: 'l’exode rural vers les montagnes',
              why: 'Les familles vont vers la mer, pas vers les montagnes.',
            },
          ],
          quote: G_LITTORALISATION,
          explain: 'Habitants et activités se concentrent près des côtes.',
          src: LITTORALISATION,
        },
        {
          q: 'Pourquoi les terrains deviennent-ils si recherchés ?',
          a: 'le littoral est un espace d’étendue limitée et très convoité',
          wrong: [
            { label: 'le littoral est un espace sans limites', why: 'Le littoral est une bande d’étendue limitée.' },
            {
              label: 'personne ne veut s’installer au bord de la mer',
              why: 'Le texte montre que beaucoup s’y installent.',
            },
          ],
          quote: G_RARE,
          explain: 'Un espace limité et désiré devient un bien rare.',
          src: LITTORAL,
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [industrialoPortuaire, touristique, risques, vocabulaire];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n));
