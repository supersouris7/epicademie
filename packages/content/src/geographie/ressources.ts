import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * Cinquième, thème 2 « Des ressources limitées, à gérer et à renouveler » (lot ge-5e-02). Chaque fait cite une source
 * du registre avec sa citation exacte : programme du cycle 4 et glossaire de Géoconfluences. Les textes à lire du
 * niveau 5 sont écrits pour l’exercice.
 */

const PROG = 'cycle4-2020';
const RESSOURCE = 'geoconfluences-ressource';
const ENERGIE = 'geoconfluences-energie';
const RENOUVELABLE = 'geoconfluences-energie-renouvelable';
const HYDROCARBURE = 'geoconfluences-hydrocarbure';
const BOUQUET = 'geoconfluences-bouquet-energetique';
const TRANSITION = 'geoconfluences-transition-energetique';
const EAU = 'geoconfluences-eau';
const ACCES = 'geoconfluences-eau-acces';
const IRRIGATION = 'geoconfluences-irrigation';
const BASSIN = 'geoconfluences-bassin-versant';
const SECURITE = 'geoconfluences-securite-alimentaire';
const REVOLUTION = 'geoconfluences-revolution-verte';
const VIVRIERE = 'geoconfluences-agriculture-vivriere';
const ALIMENTATION = 'geoconfluences-transition-alimentaire';
const DESERT = 'geoconfluences-desert-alimentaire';
const SOBRIETE = 'geoconfluences-sobriete';
const AMONT = 'cnrtl-amont';
const AVAL = 'cnrtl-aval';
const RENDEMENT = 'cnrtl-rendement';
const SOUS_ALIM = 'cnrtl-sous-alimentation';
const DURABLE = 'geoconfluences-developpement-durable';
const RECYCLAGE = 'geoconfluences-recyclage';
const ODD = 'geoconfluences-odd';

// Programme du cycle 4, géographie, classe de 5e, thème 2.
const P_NOURRIR =
  'L’alimentation : comment nourrir une humanité en croissance démographique et aux besoins alimentaires accrus ?';
const P_RURAUX =
  'On peut ainsi insister sur l’importance des espaces ruraux et agricoles, en tant qu’ils contribuent à la fourniture des ressources essentielles, notamment alimentaires';
const P_MAL = 'une partie de l’humanité est toujours sous-alimentée ou mal alimentée';

// Géoconfluences (ENS de Lyon, DGESCO) et Trésor de la langue française (CNRTL).
const G_ENERGIE =
  'L’énergie est l’ensemble des éléments utilisés pour produire de la chaleur, de l’électricité ou du mouvement';
const G_PRIMAIRE =
  'On distingue aussi l’énergie primaire, libérée directement par une source d’énergie (lors de la combustion du pétrole par exemple), de l’énergie secondaire (par exemple l’électricité), obtenue par une action anthropique à partir d’une énergie primaire';
const G_CATEGORIES =
  'Deux grandes catégories de ressources énergétiques ont toujours coexisté ou alterné : renouvelables (solaire, éolienne, etc.) ou fossiles';
const G_CUMUL =
  'Historiquement, le développement d’une nouvelle source d’énergie ne fait jamais disparaître les précédentes';
const G_RENOUV =
  'Une énergie est dite renouvelable lorsqu’elle est dérivée de processus naturels en perpétuel renouvellement';
const G_BOIS = 'Certaines énergies, comme le bois, sont à la fois renouvelables et combustibles';
const G_HYDRO = 'le mot sert à désigner principalement le gaz naturel et le pétrole';
const G_TRANSPORT = 'Leur transport se fait par des conduites ou par bateau (pétroliers, méthaniers)';
const G_SERRE =
  'Leur rejet massif dans l’atmosphère entraîne l’augmentation de l’effet de serre et le changement climatique global';
const G_BOUQUET =
  'Le bouquet énergétique est la part relative des différentes sources d’énergie dans la consommation d’un espace donné';

const G_RARETE =
  'Cette rareté est liée à la faible part d’eau douce par rapport à l’eau salée et à la très inégale distribution de la ressource';
const G_ACCES =
  'L’accès à l’eau désigne la capacité d’une population à accéder à une eau potable en quantité suffisante pour satisfaire ses besoins principaux';
const G_POTABLE =
  'L’eau potable est une eau qui ne contient pas d’agents pathogènes ou d’agents chimiques à des concentrations pouvant nuire à la santé';
const G_ABONDANTE = 'la ressource en eau est très abondante, mais l’accès à l’eau potable est très difficile';
const G_REVENU = 'l’accès à l’eau est fortement lié au revenu par habitant et au niveau de développement d’un espace';
const G_IRRIG = 'L’irrigation est l’apport d’eau à une parcelle agricole';
const G_SECTEUR = 'L’agriculture est de loin le premier secteur consommateur d’eau à l’échelle mondiale';
const G_GOUTTE = 'Le goutte-à-goutte, plus économe et plus précis';
const G_SEL = 'Les apports excessifs d’eau sur le sol finissent par augmenter la salinité de ce dernier';

const C_AMONT = 'Partie comprise entre ce point et la source';
const C_AVAL = 'Partie comprise entre ce point et l’embouchure';
const C_RENDEMENT = 'Production récoltée sur une culture relativement à la surface cultivée';
const C_SOUS_ALIM = 'Situation d’insuffisance alimentaire pendant une durée plus ou moins longue';
const G_NEGOCIATION =
  'La gestion de la ressource (réserves, bassins versants, cours des grands fleuves) implique nécessairement une négociation entre acteurs';
const G_INEGAL = 'la révolution verte a rendu les riches beaucoup plus riches, et les pauvres un peu moins pauvres';
const G_CRISES =
  'Par leur dépendance à la production locale, les systèmes vivriers sont particulièrement vulnérables aux crises, notamment climatiques';
const G_FLUX = 'à un système reposant sur des énergies de flux (éolien, solaire, biomasse…)';
const G_VALORISATION =
  'Il implique une valorisation matérielle des déchets collectés qui va de pair avec une valorisation économique : le déchet devient alors une ressource';

const G_SECURITE =
  'la sécurité alimentaire existe lorsque tous les êtres humains ont, à tout moment, un accès physique et économique à une nourriture suffisante, saine et nutritive';
const G_QUALITE = 'La sécurité alimentaire ne se limite pas à une question de faim, mais également de qualité';
const G_RICHES =
  'l’insécurité alimentaire peut aussi concerner des quartiers pauvres des villes riches ou des populations marginalisées des pays riches';
const G_REVOL = 'un ensemble d’innovations agricoles mises au point dans les années 1960';
const G_VARIETES = 'de nouvelles variétés de céréales (riz, blé) à hauts rendements';
const G_VIVRIERE =
  'Une agriculture vivrière est une agriculture dont l’essentiel de la production est consommé sur place, par la famille productrice ou au moins au sein du village';
const G_FAMINE = 'la première est marquée par une sortie de la famine consécutive à une hausse du revenu';
const G_DIVERS =
  'La deuxième phase est caractérisée par une diversification alimentaire : la consommation de céréales diminue';
const G_INVERSION =
  'La troisième phase voit enfin se produire un début d’inversion des tendances de la phase précédente';
const G_DESERT =
  'un espace où les habitants ne peuvent se procurer des aliments sains (fruits, légumes, viande et produits laitiers frais) à des prix abordables';

const G_DURABLE =
  'mode de développement qui répond aux besoins du présent sans compromettre la capacité des générations futures de répondre aux leurs';
const G_BRUNDTLAND = 'a été introduit en 1987 par le rapport dit Brundtland';
const G_RIO =
  'Il fut adopté lors du Sommet de la Terre (Conférence mondiale des Nations Unies sur l’environnement) de Rio en juin 1992';
const G_PILIERS = 'un état d’équilibre entre trois piliers, le social, l’économique et l’environnemental';
const G_ODD = 'par l’Organisation des Nations Unies (ONU) en 2015, à atteindre pour 2030';
const G_RECYCL =
  'Le recyclage est un mode de gestion des déchets au même titre que l’incinération, la mise en décharge ou le réemploi';
const G_DECHET = 'le déchet devient alors une ressource';
const G_LIMITE = 'Toutes les matières ne peuvent pas être recyclées';
const G_TRANSITION =
  'La transition énergétique désigne le passage d’un système reposant sur des énergies de stock (pétrole, charbon, gaz, uranium) très centralisées entre les mains de gros opérateurs, à un système reposant sur des énergies de flux (éolien, solaire, biomasse…) décentralisées avec de nombreux producteurs, auquel s’ajoutent des actions en matière de sobriété et d’efficacité énergétiques';
const G_BESOIN = 'il n’y a pas de ressource sans besoin des sociétés';
const G_RARE = 'La raréfaction d’une ressource provoque une tension entre les besoins et sa disponibilité';

// ——— Notion 1 : l’énergie ———

const energie: Notion = {
  classe: '5e',
  id: 'g5-energie',
  title: 'L’énergie, une ressource à ménager',
  hint: 'Demande-toi d’où vient l’énergie : un stock qui s’épuise ou un phénomène naturel qui recommence ?',
  memo: [
    'L’**énergie** sert à produire de la chaleur, de l’électricité ou du mouvement. Deux familles : les **énergies fossiles** (pétrole, gaz, charbon) et les **énergies renouvelables** (soleil, vent).',
    'Le **bouquet énergétique** d’un pays, c’est la part de chaque source dans sa consommation. Exemple : du pétrole, du nucléaire, de l’éolien.',
    'L’enjeu au programme : des ressources à ménager et à mieux utiliser.',
  ],
  faits: [
    {
      q: 'À quoi sert l’énergie ?',
      a: 'à produire de la chaleur, de l’électricité ou du mouvement',
      wrong: [
        {
          label: 'à mesurer la distance entre deux lieux',
          why: 'Mesurer une distance relève de l’échelle d’une carte, pas de l’énergie.',
        },
        {
          label: 'à compter les habitants d’un pays',
          why: 'Compter les habitants, c’est le travail d’un recensement.',
        },
        {
          label: 'à fabriquer uniquement de l’électricité',
          why: 'L’électricité n’est qu’un des usages : il y a aussi la chaleur et le mouvement.',
        },
      ],
      gap: ['L’énergie sert à produire de la chaleur, de l’électricité ou du ', '.', ['mouvement']],
      choix: ['mouvement', 'relief', 'peuplement'],
      quote: G_ENERGIE,
      explain: 'Se chauffer, s’éclairer, se déplacer : ces trois usages demandent de l’énergie.',
      src: ENERGIE,
    },
    {
      q: 'Parmi ces sources d’énergie, laquelle est renouvelable ?',
      a: 'le vent',
      wrong: [
        { label: 'le charbon', why: 'Le charbon est une énergie fossile, issue d’un stock du sous-sol.' },
        { label: 'le pétrole', why: 'Le pétrole est une énergie fossile, issue d’un stock du sous-sol.' },
        {
          label: 'le gaz naturel',
          why: 'Le gaz naturel est une énergie fossile : malgré son nom, son stock ne se renouvelle pas à notre échelle.',
        },
      ],
      gap: ['Le solaire et l’éolien sont des énergies ', '.', ['renouvelables']],
      choix: ['renouvelables', 'fossiles', 'de stock'],
      quote: G_CATEGORIES,
      explain: 'Le vent se reforme sans cesse, alors que les stocks fossiles diminuent quand on les exploite.',
      src: ENERGIE,
    },
    {
      q: 'Quand dit-on qu’une énergie est renouvelable ?',
      a: 'quand elle vient de processus naturels qui se renouvellent sans cesse',
      wrong: [
        {
          label: 'quand elle est extraite d’un stock enfoui dans le sous-sol',
          why: 'Un stock du sous-sol qu’on exploite correspond aux énergies fossiles.',
        },
        {
          label: 'quand elle est transportée par bateau',
          why: 'Le mode de transport ne dit rien sur le renouvellement de la source.',
        },
        {
          label: 'quand elle ne produit jamais aucun effet sur l’environnement',
          why: 'Renouvelable ne veut pas dire sans effet : le bois, par exemple, émet des gaz en brûlant.',
        },
      ],
      gap: ['Une énergie renouvelable vient de processus naturels en perpétuel ', '.', ['renouvellement']],
      choix: ['renouvellement', 'épuisement', 'déplacement'],
      quote: G_RENOUV,
      explain: 'Le soleil, le vent ou l’eau qui coule recommencent : la source se reconstitue.',
      src: RENOUVELABLE,
    },
    {
      q: 'Dans le langage courant, que désigne surtout le mot « hydrocarbures » ?',
      a: 'le pétrole et le gaz naturel',
      wrong: [
        { label: 'le soleil et le vent', why: 'Ce sont des énergies renouvelables, pas des hydrocarbures.' },
        { label: 'l’eau douce et l’eau salée', why: 'Malgré « hydro », le mot ne désigne pas l’eau.' },
        { label: 'le bois et la paille', why: 'Ce sont des matières végétales, pas des hydrocarbures du sous-sol.' },
      ],
      gap: ['Le mot « hydrocarbures » désigne surtout le gaz naturel et le ', '.', ['pétrole']],
      choix: ['pétrole', 'vent', 'bois'],
      quote: G_HYDRO,
      explain: 'Ces composés sont présents dans le sous-sol : ils font partie des énergies fossiles.',
      src: HYDROCARBURE,
    },
    {
      q: 'On brûle d’énormes quantités d’hydrocarbures : quelle conséquence ont les gaz rejetés dans l’atmosphère ?',
      a: 'il augmente l’effet de serre et change le climat',
      wrong: [
        {
          label: 'il augmente la part d’eau douce',
          why: 'Brûler des hydrocarbures ne crée pas de réserve d’eau douce.',
        },
        {
          label: 'il renouvelle les stocks de pétrole',
          why: 'Brûler du pétrole consomme le stock, sans le reconstituer.',
        },
        {
          label: 'il fait reculer le changement climatique',
          why: 'C’est l’inverse : ce rejet aggrave le changement climatique.',
        },
      ],
      gap: ['Les rejets massifs liés aux hydrocarbures augmentent l’effet de ', '.', ['serre']],
      choix: ['serre', 'vent', 'marée'],
      quote: G_SERRE,
      explain: 'C’est une raison de ménager ces énergies et de développer d’autres sources.',
      src: HYDROCARBURE,
    },
    {
      q: 'Qu’est-ce que le bouquet énergétique d’un pays ?',
      a: 'la part de chaque source d’énergie dans sa consommation',
      wrong: [
        {
          label: 'la liste des fleurs cultivées pour produire de l’énergie',
          why: 'Ici, « bouquet » est une image : il s’agit d’un mélange de sources.',
        },
        {
          label: 'le nombre de ses centrales les plus anciennes',
          why: 'Le bouquet mesure des parts de sources, pas l’âge des centrales.',
        },
        {
          label: 'la quantité de pétrole encore cachée sous terre',
          why: 'Cela correspond à un stock, pas à la répartition de la consommation.',
        },
      ],
      gap: [
        'Le bouquet énergétique indique la part des différentes sources d’énergie dans la ',
        ' d’un espace.',
        ['consommation'],
      ],
      choix: ['consommation', 'superficie', 'frontière'],
      quote: G_BOUQUET,
      explain: 'On compare les parts : pétrole, gaz, charbon, nucléaire, renouvelables.',
      src: BOUQUET,
    },
  ],
  paires3: [
    ['le pétrole', 'une énergie fossile'],
    ['le vent', 'une énergie renouvelable'],
    ['l’électricité', 'une énergie secondaire, obtenue à partir d’une autre'],
  ],
  paires5: [
    ['énergie primaire', 'libérée directement par une source d’énergie'],
    ['énergie secondaire', 'obtenue par l’action humaine à partir d’une énergie primaire'],
    ['hydrocarbures', 'surtout le pétrole et le gaz naturel'],
    ['bouquet énergétique', 'part de chaque source dans la consommation d’un espace'],
    ['méthanier', 'navire qui transporte du gaz'],
  ],
  libres: [
    {
      q: 'comment appelle-t-on les énergies comme le pétrole, le gaz et le charbon ?',
      accepted: [
        'énergies fossiles',
        'les énergies fossiles',
        'fossiles',
        'des énergies fossiles',
        'énergie fossile',
        'fossile',
      ],
      traps: [
        { text: 'renouvelables', why: 'Les énergies renouvelables se reconstituent, comme le vent ou le soleil.' },
        { text: 'secondaires', why: 'Une énergie secondaire est obtenue à partir d’une autre, comme l’électricité.' },
      ],
      quote: G_CATEGORIES,
      explain: 'Deux familles : renouvelables ou fossiles. Pétrole, gaz et charbon sont dans la seconde.',
      src: ENERGIE,
    },
    {
      q: 'l’électricité obtenue à partir du charbon est-elle une énergie primaire ou secondaire ?',
      accepted: ['secondaire', 'énergie secondaire', 'une énergie secondaire'],
      traps: [
        {
          text: 'primaire',
          why: 'L’énergie primaire est libérée directement par la source, ici le charbon qui brûle.',
        },
        {
          text: 'renouvelable',
          why: 'La question porte sur primaire ou secondaire ; le charbon n’est pas renouvelable.',
        },
      ],
      quote: G_PRIMAIRE,
      explain: 'L’électricité est fabriquée par les humains à partir d’une autre énergie.',
      src: ENERGIE,
    },
    {
      q: 'quel nom courant donne-t-on à l’ensemble du pétrole et du gaz naturel (un mot) ?',
      accepted: ['hydrocarbures', 'les hydrocarbures', 'des hydrocarbures', 'hydrocarbure'],
      traps: [
        { text: 'charbon', why: 'Le charbon est une autre énergie fossile.' },
        {
          text: 'fossiles',
          why: 'Les énergies fossiles comptent aussi le charbon : le mot cherché ne le désigne pas.',
        },
        { text: 'biomasse', why: 'La biomasse désigne des matières comme le bois, qui se renouvellent.' },
      ],
      quote: G_HYDRO,
      explain: 'Le mot « hydrocarbures » sert surtout à nommer le gaz naturel et le pétrole.',
      src: HYDROCARBURE,
    },
    {
      q: 'comment appelle-t-on la part des différentes sources d’énergie consommées par un pays (deux mots) ?',
      accepted: [
        'bouquet énergétique',
        'le bouquet énergétique',
        'mix énergétique',
        'le mix énergétique',
        'un bouquet énergétique',
        'un mix énergétique',
      ],
      traps: [
        {
          text: 'transition énergétique',
          why: 'La transition est un passage d’un système à un autre, pas une répartition.',
        },
        { text: 'effet de serre', why: 'L’effet de serre concerne l’atmosphère et le climat.' },
      ],
      quote: G_BOUQUET,
      explain: 'On dit « bouquet énergétique », souvent appelé aussi « mix énergétique ».',
      src: BOUQUET,
    },
  ],
  docs: [
    {
      title: 'L’île de Corvane et son électricité',
      lines: [
        'Sur l’île imaginaire de Corvane, l’électricité vient surtout d’une centrale qui brûle du pétrole.',
        'Le pétrole arrive par bateau depuis un autre pays.',
        'Cette année, des éoliennes ont été installées sur les crêtes ventées.',
        'La centrale reste en service les jours sans vent.',
      ],
      qs: [
        {
          q: 'D’après le texte, quelle énergie nouvelle est renouvelable ?',
          a: 'l’énergie du vent',
          wrong: [
            { label: 'le pétrole', why: 'Le pétrole (ligne 2) est une énergie fossile importée.' },
            {
              label: 'l’électricité venue de la centrale au pétrole',
              why: 'Elle vient d’une énergie fossile (ligne 1).',
            },
            { label: 'le bateau', why: 'Le bateau transporte le pétrole, ce n’est pas une énergie.' },
          ],
          quote: G_CATEGORIES,
          explain: 'La ligne 3 cite des éoliennes : elles utilisent le vent, une source renouvelable.',
          src: ENERGIE,
        },
        {
          q: 'Que montre la ligne 4 sur le bouquet énergétique de l’île ?',
          a: 'la nouvelle source s’ajoute au pétrole sans le remplacer complètement',
          wrong: [
            { label: 'le pétrole a totalement disparu', why: 'La centrale au pétrole reste en service (ligne 4).' },
            {
              label: 'l’île ne consomme plus d’électricité',
              why: 'Rien dans le texte ne le dit : la centrale fonctionne encore.',
            },
            {
              label: 'le vent est une énergie fossile',
              why: 'Le vent est renouvelable, il n’est pas un stock du sous-sol.',
            },
          ],
          quote: G_CUMUL,
          explain: 'Comme souvent dans l’histoire, la nouvelle source s’ajoute aux anciennes.',
          src: ENERGIE,
        },
      ],
    },
    {
      title: 'Le bois du village de Salmor',
      lines: [
        'Dans le village imaginaire de Salmor, les maisons sont chauffées au bois coupé dans la forêt voisine.',
        'La commune replante des arbres après chaque coupe.',
        'Le bois qui brûle dégage de la fumée et des gaz.',
      ],
      qs: [
        {
          q: 'Quelle affirmation est juste à propos de ce bois ?',
          a: 'il est renouvelable et combustible, et sa combustion émet des gaz',
          wrong: [
            {
              label: 'il est renouvelable, donc sa combustion n’émet rien',
              why: 'La ligne 3 montre l’inverse : renouvelable ne veut pas dire sans émission.',
            },
            {
              label: 'il est fossile, car il brûle',
              why: 'Brûler ne suffit pas à être fossile : le bois pousse de nouveau.',
            },
            { label: 'il ne produit aucune chaleur', why: 'La ligne 1 dit qu’il chauffe les maisons.' },
          ],
          quote: G_BOIS,
          explain: 'Le bois est à la fois renouvelable (ligne 2) et combustible (ligne 3).',
          src: RENOUVELABLE,
        },
      ],
    },
    {
      title: 'Un méthanier au port',
      lines: [
        'Un grand navire accoste dans un port imaginaire avec sa cargaison de gaz.',
        'Le gaz alimentera une centrale qui produit de l’électricité pour la région.',
        'Le gaz vient d’un gisement situé sous le sol d’un autre continent.',
      ],
      qs: [
        {
          q: 'Dans cette chaîne, qu’est-ce qui est l’énergie secondaire ?',
          a: 'l’électricité produite par la centrale',
          wrong: [
            {
              label: 'le gaz dans le gisement',
              why: 'Le gaz est la source de départ, avant toute transformation en électricité.',
            },
            { label: 'le navire', why: 'Le navire transporte la ressource.' },
            { label: 'le port', why: 'Le port est un lieu de débarquement, pas une énergie.' },
          ],
          quote: G_PRIMAIRE,
          explain: 'L’électricité (ligne 2) est obtenue par les humains à partir du gaz.',
          src: ENERGIE,
        },
        {
          q: 'Comment ce gaz a-t-il été transporté jusqu’au port ?',
          a: 'par bateau',
          wrong: [
            { label: 'par le vent', why: 'Le vent ne transporte pas le gaz.' },
            { label: 'par un câble électrique', why: 'Un câble transporte de l’électricité, pas du gaz.' },
            { label: 'par la forêt', why: 'La forêt n’est pas un moyen de transport.' },
          ],
          quote: G_TRANSPORT,
          explain:
            'La ligne 1 montre le navire. Les hydrocarbures voyagent par bateau ou par conduites (de longs tuyaux).',
          src: HYDROCARBURE,
        },
      ],
    },
  ],
};

// ——— Notion 2 : l’eau ———

const eau: Notion = {
  classe: '5e',
  id: 'g5-eau',
  title: 'L’eau, une ressource inégalement accessible',
  hint: 'Distingue la quantité d’eau présente sur place et la possibilité, pour les habitants, d’en boire sans danger.',
  memo: [
    'L’eau douce est rare face à l’eau salée et très inégalement répartie. L’**accès à l’eau** ne dépend pas seulement de la quantité : on peut vivre près de l’eau sans **eau potable**.',
    'L’agriculture est le premier secteur consommateur d’eau, surtout avec l’**irrigation**. Le **goutte-à-goutte** l’économise.',
    'Un **bassin versant** est l’espace dont toutes les eaux rejoignent le même cours d’eau, lac ou mer. Un même fleuve peut opposer les territoires d’**amont** et d’**aval** : il faut partager.',
  ],
  faits: [
    {
      q: 'Qu’est-ce que l’eau potable ?',
      a: 'une eau sans microbes ni produits à des doses dangereuses pour la santé',
      wrong: [
        { label: 'une eau très salée', why: 'Une eau salée ne convient pas pour boire.' },
        {
          label: 'une eau qui sert uniquement à arroser les champs',
          why: 'L’eau d’irrigation n’est pas définie comme potable.',
        },
        {
          label: 'une eau de pluie, toujours sans danger',
          why: 'Rien ne garantit qu’une eau de pluie soit sans danger.',
        },
      ],
      gap: ['L’eau potable ne doit pas nuire à la ', '.', ['santé']],
      choix: ['santé', 'frontière', 'vitesse'],
      quote: G_POTABLE,
      explain: 'Boire une eau contaminée peut rendre malade : la potabilité protège la santé.',
      src: ACCES,
    },
    {
      q: 'Pourquoi la ressource en eau est-elle dite rare alors que l’eau est partout sur Terre ?',
      a: 'l’eau douce est une petite part, et elle est inégalement répartie',
      wrong: [
        { label: 'toute l’eau de la Terre a disparu', why: 'L’eau est l’un des éléments les plus présents sur Terre.' },
        {
          label: 'l’eau salée est trop peu abondante',
          why: 'C’est l’eau douce qui est la petite part, pas l’eau salée.',
        },
        {
          label: 'l’eau douce est répartie de la même façon partout',
          why: 'Sa répartition est au contraire très inégale.',
        },
      ],
      gap: ['La rareté vient de la faible part d’eau douce par rapport à l’eau ', '.', ['salée']],
      choix: ['salée', 'potable', 'chaude'],
      quote: G_RARETE,
      explain: 'Il faut regarder la qualité (douce ou salée) et la répartition entre les territoires.',
      src: EAU,
    },
    {
      q: 'Que désigne l’accès à l’eau pour une population ?',
      a: 'la capacité d’obtenir assez d’eau potable pour ses besoins principaux',
      wrong: [
        { label: 'la distance entre le pays et l’océan', why: 'Être près de la mer ne donne pas d’eau potable.' },
        {
          label: 'la quantité de pluie tombée en un an',
          why: 'C’est la disponibilité de l’eau, différente de l’accès.',
        },
        {
          label: 'le nombre de piscines d’une ville',
          why: 'Des loisirs ne mesurent pas l’accès aux besoins principaux.',
        },
      ],
      gap: ['L’accès à l’eau est la capacité d’accéder à une eau ', ' en quantité suffisante.', ['potable']],
      choix: ['potable', 'salée', 'gelée'],
      quote: G_ACCES,
      explain: 'L’accès combine qualité (potable) et quantité (suffisante).',
      src: ACCES,
    },
    {
      q: 'À quoi est fortement lié l’accès à l’eau ?',
      a: 'au revenu par habitant et au niveau de développement',
      wrong: [
        {
          label: 'uniquement à la longueur des fleuves',
          why: 'La ressource peut abonder sans que les habitants y aient accès.',
        },
        { label: 'à la couleur du drapeau', why: 'Le drapeau n’a aucun rapport avec l’eau.' },
        {
          label: 'à la seule température de l’air',
          why: 'Le climat joue sur la disponibilité, mais le revenu compte fortement.',
        },
      ],
      gap: ['L’accès à l’eau est fortement lié au ', ' par habitant.', ['revenu']],
      choix: ['revenu', 'relief', 'drapeau'],
      quote: G_REVENU,
      explain: 'Deux pays aussi arrosés peuvent offrir un accès très différent, selon leurs moyens.',
      src: ACCES,
    },
    {
      q: 'Qu’est-ce que l’irrigation ?',
      a: 'l’apport d’eau à une parcelle agricole',
      wrong: [
        {
          label: 'la pluie qui tombe sur les champs',
          why: 'La pluie seule relève de l’agriculture pluviale, sans apport humain.',
        },
        { label: 'le dessèchement d’un marais', why: 'Enlever l’eau est l’inverse d’en apporter.' },
        { label: 'le transport des récoltes', why: 'L’irrigation concerne l’eau, pas le transport.' },
      ],
      gap: ['L’irrigation est l’apport d’eau à une parcelle ', '.', ['agricole']],
      choix: ['agricole', 'urbaine', 'industrielle'],
      quote: G_IRRIG,
      explain: 'Les humains contrôlent l’eau des cultures au lieu de dépendre seulement de la pluie.',
      src: IRRIGATION,
    },
    {
      q: 'Dans le monde, quel secteur consomme de loin le plus d’eau ?',
      a: 'l’agriculture',
      wrong: [
        { label: 'les écoles', why: 'Les écoles utilisent peu d’eau face aux cultures.' },
        { label: 'les loisirs', why: 'Les loisirs consomment de l’eau, mais beaucoup moins.' },
        { label: 'le transport aérien', why: 'L’avion n’est pas le secteur principal de consommation d’eau.' },
      ],
      gap: ['Le premier secteur consommateur d’eau dans le monde est l’', '.', ['agriculture']],
      choix: ['agriculture', 'aviation', 'informatique'],
      quote: G_SECTEUR,
      explain: 'Pour économiser l’eau, il faut donc agir d’abord sur les champs.',
      src: IRRIGATION,
    },
    {
      q: 'Quelle technique d’irrigation économise l’eau en l’apportant avec précision ?',
      a: 'le goutte-à-goutte',
      wrong: [
        { label: 'l’apport excessif d’eau sur le sol', why: 'Un excès d’eau gaspille et peut rendre le sol salé.' },
        { label: 'l’inondation sans contrôle', why: 'Sans contrôle, l’eau est gaspillée.' },
        { label: 'l’arrêt de toute culture', why: 'Ce n’est pas une technique d’irrigation.' },
      ],
      gap: ['Pour économiser l’eau, on peut utiliser le ', ', plus précis.', ['goutte-à-goutte']],
      choix: ['goutte-à-goutte', 'barrage', 'méthanier'],
      quote: G_GOUTTE,
      explain: 'L’eau arrive au pied de la plante, en petites quantités.',
      src: IRRIGATION,
    },
    {
      q: 'Sur un fleuve, que désigne l’aval d’un point donné ?',
      a: 'la partie comprise entre ce point et l’embouchure',
      wrong: [
        { label: 'la partie comprise entre ce point et la source', why: 'Du côté de la source, c’est l’amont.' },
        { label: 'la nappe d’eau située sous ce point', why: 'Une nappe est une réserve souterraine, pas l’aval.' },
        {
          label: 'les montagnes qui entourent ce point',
          why: 'L’aval désigne une partie du cours d’eau, pas un relief.',
        },
      ],
      gap: ['L’aval est la partie du fleuve comprise entre un point et l’', '.', ['embouchure']],
      choix: ['embouchure', 'irrigation', 'altitude'],
      quote: C_AVAL,
      explain: 'L’eau descend vers l’embouchure : les usages d’amont se ressentent en aval.',
      src: AVAL,
    },
  ],
  paires3: [
    ['eau potable', 'eau sans danger pour la santé'],
    ['irrigation', 'apport d’eau aux cultures'],
    ['goutte-à-goutte', 'technique d’arrosage économe'],
  ],
  paires5: [
    ['accès à l’eau', 'capacité d’obtenir assez d’eau potable'],
    ['bassin versant', 'espace dont toute l’eau rejoint un même fleuve, lac ou mer'],
    ['amont', 'partie d’un fleuve située vers sa source'],
    ['aval', 'partie d’un fleuve située vers son embouchure'],
    ['salinisation', 'augmentation du sel dans le sol'],
  ],
  libres: [
    {
      q: 'quel mot de géographie, commençant par « i », désigne l’apport d’eau à une parcelle agricole ?',
      accepted: ['irrigation', 'l’irrigation', 'une irrigation'],
      traps: [
        { text: 'salinisation', why: 'La salinisation est l’augmentation du sel dans le sol.' },
        { text: 'pluie', why: 'La pluie tombe naturellement ; on cherche un apport organisé.' },
      ],
      quote: G_IRRIG,
      explain: 'Apporter de l’eau aux champs, c’est irriguer.',
      src: IRRIGATION,
    },
    {
      q: 'comment qualifie-t-on une eau que l’on peut boire sans danger ?',
      accepted: ['potable', 'eau potable', 'une eau potable'],
      traps: [
        { text: 'douce', why: 'Une eau douce est peu salée, mais elle peut contenir des microbes.' },
        { text: 'salée', why: 'L’eau salée ne se boit pas.' },
      ],
      quote: G_POTABLE,
      explain: 'Douce ne veut pas dire potable : il faut aussi l’absence de dangers pour la santé.',
      src: ACCES,
    },
    {
      q: 'en parlant d’un fleuve, quel mot désigne le territoire situé du côté de la source par rapport à un autre ?',
      accepted: ['amont', 'en amont', 'l’amont'],
      traps: [
        { text: 'aval', why: 'L’aval est du côté de l’embouchure, vers où l’eau coule.' },
        { text: 'embouchure', why: 'L’embouchure est l’endroit où le fleuve se jette.' },
      ],
      quote: C_AMONT,
      explain: 'L’amont est du côté de la source : l’eau prélevée et consommée en amont peut manquer en aval.',
      src: AMONT,
    },
    {
      q: 'quel secteur consomme le plus d’eau dans le monde ?',
      accepted: ['agriculture', 'l’agriculture', 'le secteur agricole', 'agricole'],
      traps: [
        { text: 'industrie', why: 'L’industrie utilise de l’eau, mais moins que les cultures.' },
        { text: 'tourisme', why: 'Le tourisme n’est pas le premier consommateur.' },
      ],
      quote: G_SECTEUR,
      explain: 'Les cultures irriguées demandent d’énormes quantités d’eau.',
      src: IRRIGATION,
    },
  ],
  docs: [
    {
      title: 'Le quartier de Lourma',
      lines: [
        'À Lourma, ville imaginaire d’une région tropicale, il pleut beaucoup toute l’année.',
        'Dans le quartier le plus pauvre, aucune maison n’a l’eau courante.',
        'Les habitants marchent longtemps pour rapporter une eau sans danger.',
      ],
      qs: [
        {
          q: 'Que montre cet exemple ?',
          a: 'l’eau peut être abondante alors que l’accès à l’eau potable est difficile',
          wrong: [
            { label: 'il manque de pluie dans la région', why: 'La ligne 1 dit au contraire qu’il pleut beaucoup.' },
            { label: 'tous les habitants ont un accès facile', why: 'Les lignes 2 et 3 montrent des difficultés.' },
            {
              label: 'l’eau de pluie suffit toujours à boire sans danger',
              why: 'Le texte montre qu’il faut aller chercher une eau sans danger.',
            },
          ],
          quote: G_ABONDANTE,
          explain: 'Compare la ligne 1 (ressource abondante) et les lignes 2-3 (accès difficile).',
          src: ACCES,
        },
        {
          q: 'Qu’est-ce qui peut expliquer les difficultés d’accès à l’eau dans ce quartier ?',
          a: 'le faible revenu de ses habitants',
          wrong: [
            { label: 'la couleur des toits', why: 'La couleur des toits n’explique pas l’absence d’eau courante.' },
            { label: 'l’absence totale de pluie', why: 'Il pleut beaucoup (ligne 1).' },
            { label: 'la trop grande richesse du quartier', why: 'La ligne 2 parle du quartier le plus pauvre.' },
          ],
          quote: G_REVENU,
          explain: 'La ligne 2 précise que c’est le quartier le plus pauvre.',
          src: ACCES,
        },
      ],
    },
    {
      title: 'Un fleuve partagé',
      lines: [
        'Deux États imaginaires se partagent le fleuve Ardel.',
        'L’État A, près de la source, construit des canaux pour irriguer de nouveaux champs.',
        'L’État B, plus près de la mer, voit le débit du fleuve diminuer.',
        'Les deux gouvernements ouvrent des discussions.',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on la position de l’État A par rapport à l’État B ?',
          a: 'en amont',
          wrong: [
            { label: 'en aval', why: 'L’aval est vers la mer : c’est la position de l’État B (ligne 3).' },
            { label: 'sur le littoral', why: 'La ligne 2 place l’État A près de la source, pas de la mer.' },
            { label: 'en dehors du bassin versant', why: 'Le fleuve traverse ses terres (ligne 1).' },
          ],
          quote: C_AMONT,
          explain:
            'La ligne 2 place l’État A près de la source : il est en amont ; l’État B, vers la mer, est en aval.',
          src: AMONT,
        },
        {
          q: 'Que cherche la discussion de la ligne 4 ?',
          a: 'à partager la ressource pour éviter que la tension devienne un conflit',
          wrong: [
            {
              label: 'à arrêter le fleuve de couler',
              why: 'Personne ne peut décider cela ; il s’agit de se partager l’eau.',
            },
            { label: 'à rendre l’eau salée', why: 'Le sel n’est pas l’enjeu de ce partage.' },
            { label: 'à supprimer la frontière', why: 'Le texte parle de discussions sur l’eau, pas de frontière.' },
          ],
          quote: G_NEGOCIATION,
          explain: 'La négociation peut mener à une coopération ; sinon la tension peut devenir un conflit.',
          src: ACCES,
        },
      ],
    },
    {
      title: 'Les champs de Tamérit',
      lines: [
        'Dans l’oasis imaginaire de Tamérit, il pleut très rarement.',
        'Les agriculteurs inondent leurs parcelles avec beaucoup d’eau.',
        'Après plusieurs années, une croûte de sel blanchit le sol.',
        'Un voisin installe des tuyaux qui déposent l’eau goutte par goutte au pied des plants.',
      ],
      qs: [
        {
          q: 'Quel problème la ligne 3 illustre-t-elle ?',
          a: 'la salinisation du sol due à des apports d’eau excessifs',
          wrong: [
            { label: 'l’abandon des champs à cause du gel', why: 'Aucun gel dans le texte.' },
            {
              label: 'la submersion par la mer',
              why: 'Rien dans le texte ne parle de la mer : c’est l’eau d’arrosage qui agit.',
            },
            { label: 'le recul du trait de côte', why: 'Il s’agit d’un sol agricole, pas d’une côte.' },
          ],
          quote: G_SEL,
          explain: 'L’eau douce contient un peu de sel : trop d’eau finit par saler le sol.',
          src: IRRIGATION,
        },
        {
          q: 'Pourquoi le voisin (ligne 4) fait-il un choix plus durable ?',
          a: 'il économise l’eau avec un apport plus précis',
          wrong: [
            { label: 'il utilise davantage d’eau', why: 'Le goutte-à-goutte est au contraire plus économe.' },
            { label: 'il cultive sans aucune eau', why: 'Ses plants reçoivent de l’eau, en petite quantité.' },
            { label: 'il attend uniquement la pluie', why: 'Il apporte lui-même l’eau avec des tuyaux.' },
          ],
          quote: G_GOUTTE,
          explain: 'Le goutte-à-goutte apporte juste ce qu’il faut, au bon endroit.',
          src: IRRIGATION,
        },
      ],
    },
  ],
  sources: [AMONT, AVAL, BASSIN, IRRIGATION],
};

// ——— Notion 3 : l’alimentation ———

const alimentation: Notion = {
  classe: '5e',
  id: 'g5-alimentation',
  title: 'Nourrir une humanité en croissance',
  hint: 'Pense à ce que l’on mange, à qui peut l’obtenir et à la façon de le produire.',
  memo: [
    'La **sécurité alimentaire** : chacun peut obtenir à tout moment une nourriture suffisante, saine et nutritive. Une partie de l’humanité reste sous-alimentée ou mal alimentée.',
    'La **révolution verte** a augmenté les **rendements** avec de nouvelles semences, l’irrigation et les engrais.',
    'Les espaces ruraux et agricoles fournissent notre nourriture. L’**agriculture vivrière** nourrit d’abord la famille ou le village.',
    'La **transition alimentaire** dans les pays industrialisés : quand les revenus montent, on sort d’abord de la famine (plus de céréales), puis on mange plus de viande, de sucre et de graisses ; enfin, ces tendances commencent à s’inverser.',
    'Même dans un pays riche, on peut manquer de nourriture saine (insécurité alimentaire), par exemple dans un **désert alimentaire**, où les aliments frais sont difficiles à trouver à bon prix.',
  ],
  faits: [
    {
      q: 'Quand parle-t-on de sécurité alimentaire ?',
      a: 'quand chacun a accès à tout moment à une nourriture suffisante et saine',
      wrong: [
        {
          label: 'quand les magasins vendent seulement des produits importés',
          why: 'L’origine des produits ne suffit pas à définir la sécurité alimentaire.',
        },
        {
          label: 'quand les aliments sont gardés sous clé',
          why: '« Sécurité » ne parle pas ici d’un coffre, mais d’accès à la nourriture.',
        },
        {
          label: 'quand un pays produit beaucoup, même si certains ne mangent pas',
          why: 'Il faut que tous y aient accès, pas seulement que la production soit forte.',
        },
      ],
      gap: [
        'La sécurité alimentaire suppose un accès physique et économique à une nourriture ',
        ', saine et nutritive.',
        ['suffisante'],
      ],
      choix: ['suffisante', 'importée', 'rare'],
      quote: G_SECURITE,
      explain: 'Trois idées : accès, quantité et qualité, à tout moment et pour tous.',
      src: SECURITE,
    },
    {
      q: 'D’après le programme, quelle situation touche encore une partie de l’humanité ?',
      a: 'être sous-alimentée ou mal alimentée',
      wrong: [
        { label: 'ne plus avoir besoin de manger', why: 'Les êtres humains ont toujours besoin de nourriture.' },
        {
          label: 'vivre sans aucune agriculture partout dans le monde',
          why: 'L’agriculture existe ; le problème est l’accès et la qualité.',
        },
        { label: 'avoir partout la même alimentation', why: 'Les alimentations restent très diverses.' },
      ],
      gap: ['Une partie de l’humanité est toujours sous-alimentée ou ', ' alimentée.', ['mal']],
      choix: ['mal', 'trop vite', 'bien'],
      quote: P_MAL,
      explain: 'Sous-alimenté : pas assez à manger. Mal alimenté : une nourriture déséquilibrée.',
      src: PROG,
    },
    {
      q: 'Pourquoi la question de l’alimentation est-elle plus pressante aujourd’hui ?',
      a: 'la population augmente et les besoins alimentaires sont accrus',
      wrong: [
        {
          label: 'la population diminue partout',
          why: 'Le programme parle d’une humanité en croissance démographique.',
        },
        { label: 'les humains n’ont plus besoin de céréales', why: 'Les céréales restent une base de l’alimentation.' },
        { label: 'les champs ont tous disparu', why: 'Les espaces agricoles existent toujours.' },
      ],
      gap: ['Il faut nourrir une humanité en croissance ', ' et aux besoins accrus.', ['démographique']],
      choix: ['démographique', 'touristique', 'portuaire'],
      quote: P_NOURRIR,
      explain: 'Plus de bouches à nourrir et des besoins plus grands : la production doit répondre.',
      src: PROG,
    },
    {
      q: 'Quel rôle les espaces ruraux et agricoles jouent-ils d’abord pour les ressources ?',
      a: 'ils contribuent à fournir des ressources essentielles, surtout alimentaires',
      wrong: [
        { label: 'ils concentrent surtout des bureaux', why: 'Les bureaux se concentrent plutôt dans les villes.' },
        { label: 'ils ne produisent rien d’utile', why: 'Ils fournissent au contraire des ressources essentielles.' },
        {
          label: 'ils servent uniquement de réserves de pétrole',
          why: 'Leur rôle majeur au programme est la production alimentaire.',
        },
      ],
      gap: [
        'Les espaces ruraux et agricoles contribuent à fournir des ressources essentielles, notamment ',
        '.',
        ['alimentaires'],
      ],
      choix: ['alimentaires', 'électroniques', 'financières'],
      quote: P_RURAUX,
      explain: 'Les campagnes produisent une grande partie de ce que les villes consomment.',
      src: PROG,
    },
    {
      q: 'Qu’est-ce que la révolution verte asiatique ?',
      a: 'un ensemble d’innovations agricoles des années 1960',
      wrong: [
        { label: 'une guerre pour protéger les forêts', why: 'Il s’agit d’innovations agricoles, pas d’un conflit.' },
        {
          label: 'le retour à des champs sans aucune technique',
          why: 'C’est au contraire un ensemble de nouvelles techniques.',
        },
        { label: 'la fin de l’agriculture en Asie', why: 'L’agriculture y a au contraire fortement progressé.' },
      ],
      gap: ['La révolution verte s’appuie sur des innovations mises au point dans les années ', '.', ['1960']],
      choix: ['1960', '1760', '2020'],
      quote: G_REVOL,
      explain: 'Semences nouvelles, irrigation et engrais ont été combinés.',
      src: REVOLUTION,
    },
    {
      q: 'Quelle nouveauté fait partie de la révolution verte ?',
      a: 'des variétés de céréales à hauts rendements',
      wrong: [
        { label: 'l’abandon du riz et du blé', why: 'Le riz et le blé sont justement au cœur de cette révolution.' },
        {
          label: 'le remplacement des champs par des usines',
          why: 'Les champs restent cultivés, avec d’autres moyens.',
        },
        {
          label: 'l’interdiction des engrais',
          why: 'Les engrais chimiques font au contraire partie de la révolution verte.',
        },
      ],
      gap: ['La révolution verte a diffusé de nouvelles variétés de céréales à hauts ', '.', ['rendements']],
      choix: ['rendements', 'reliefs', 'tarifs'],
      quote: G_VARIETES,
      explain: 'Un rendement élevé, c’est plus de récolte sur la même surface.',
      src: REVOLUTION,
    },
    {
      q: 'Qu’est-ce qu’une agriculture vivrière ?',
      a: 'une agriculture dont la production est surtout consommée sur place',
      wrong: [
        {
          label: 'une agriculture qui exporte toute sa récolte',
          why: 'C’est l’inverse : l’essentiel reste sur place.',
        },
        { label: 'une agriculture sans aucune culture', why: 'Il y a bien une production agricole.' },
        {
          label: 'une agriculture qui produit surtout des fibres textiles à vendre',
          why: 'La production vivrière nourrit d’abord les producteurs.',
        },
      ],
      gap: ['En agriculture vivrière, l’essentiel de la production est consommé sur ', '.', ['place']],
      choix: ['place', 'mer', 'Internet'],
      quote: G_VIVRIERE,
      explain: 'La famille ou le village mange ce qu’il produit.',
      src: VIVRIERE,
    },
    {
      q: 'La sécurité alimentaire se limite-t-elle à la question de la faim ?',
      a: 'non, la qualité de la nourriture compte aussi',
      wrong: [
        {
          label: 'oui, seule la quantité compte',
          why: 'Manger assez ne suffit pas : la nourriture doit aussi être saine.',
        },
        {
          label: 'oui, dès que les magasins sont ouverts',
          why: 'Des magasins ouverts ne garantissent ni l’accès pour tous ni la qualité.',
        },
        {
          label: 'non, elle concerne seulement la police des marchés',
          why: '« Sécurité » désigne ici l’accès à la nourriture.',
        },
      ],
      gap: ['La sécurité alimentaire est une question de faim, mais également de ', '.', ['qualité']],
      choix: ['qualité', 'frontière', 'vitesse'],
      quote: G_QUALITE,
      explain: 'On regarde la quantité et la qualité des aliments.',
      src: SECURITE,
    },
    {
      q: 'Qu’est-ce que la sous-alimentation ?',
      a: 'une situation d’insuffisance alimentaire qui dure plus ou moins longtemps',
      wrong: [
        {
          label: 'le fait de produire trop de nourriture',
          why: 'La sous-alimentation désigne un manque, pas un excès.',
        },
        { label: 'la culture de plantes sous la terre', why: '« Sous » veut dire ici « pas assez ».' },
        {
          label: 'la vente de produits à bas prix',
          why: 'Il ne s’agit pas d’un prix, mais d’un manque de nourriture.',
        },
      ],
      gap: ['La sous-alimentation est une situation d’', ' alimentaire.', ['insuffisance']],
      choix: ['insuffisance', 'abondance', 'exportation'],
      quote: C_SOUS_ALIM,
      explain: 'Elle peut durer et menacer la santé.',
      src: SOUS_ALIM,
    },
    {
      q: 'Dans la transition alimentaire des pays industrialisés, que se passe-t-il pendant la deuxième phase, après la sortie de la famine ?',
      a: 'l’alimentation se diversifie et on mange moins de céréales',
      wrong: [
        { label: 'la famine commence', why: 'La sortie de la famine correspond à la première phase.' },
        { label: 'les tendances commencent à s’inverser', why: 'Cette inversion caractérise la troisième phase.' },
        {
          label: 'les habitants ne mangent que des céréales',
          why: 'Au contraire, la consommation de céréales diminue.',
        },
      ],
      gap: ['La deuxième phase est une diversification : la consommation de ', ' diminue.', ['céréales']],
      choix: ['céréales', 'viande', 'sucre'],
      quote: G_DIVERS,
      explain: 'Sucre, graisses et viande prennent plus de place.',
      src: ALIMENTATION,
    },
    {
      q: 'Dans la transition alimentaire des pays industrialisés, qu’observe-t-on lors de la troisième phase ?',
      a: 'un début d’inversion des tendances précédentes',
      wrong: [
        { label: 'un retour immédiat à la famine', why: 'Le modèle ne décrit pas un retour à la famine.' },
        { label: 'la sortie de la famine', why: 'C’est la première phase.' },
        { label: 'le début de la diversification', why: 'La diversification marque la deuxième phase.' },
      ],
      gap: ['La troisième phase voit un début d’', ' des tendances de la phase précédente.', ['inversion']],
      choix: ['inversion', 'accélération', 'irrigation'],
      quote: G_INVERSION,
      explain: 'Les habitudes commencent à changer dans l’autre sens.',
      src: ALIMENTATION,
    },
  ],
  paires3: [
    ['sécurité alimentaire', 'accès de tous à une nourriture suffisante et saine'],
    ['agriculture vivrière', 'production surtout consommée sur place'],
    ['révolution verte', 'innovations pour augmenter les récoltes'],
  ],
  paires5: [
    ['rendement', 'quantité récoltée sur une surface donnée'],
    ['désert alimentaire', 'espace où les aliments sains sont difficiles à obtenir à bon prix'],
    ['insécurité alimentaire', 'manque d’accès à une nourriture suffisante et saine'],
    ['sous-alimentation', 'ne pas avoir assez à manger'],
    ['transition alimentaire', 'changement de la façon de produire et de consommer'],
  ],
  consigne: {
    prompt: 'Remets dans l’ordre les trois phases de la transition alimentaire décrite pour les pays industrialisés.',
    hint: 'Quand les revenus montent, quel besoin est satisfait en premier ?',
    why: 'Le modèle distingue d’abord la sortie de la famine, ensuite la diversification, enfin un début d’inversion.',
    fin: 'La première phase est',
    quote: G_FAMINE,
    src: ALIMENTATION,
  },
  ordre: [
    'sortie de la famine, avec plus de céréales',
    'diversification : plus de viande, de sucre et de graisses',
    'début d’inversion de ces tendances',
  ],
  libres: [
    {
      q: 'quelle expression désigne l’accès de tous à une nourriture suffisante, saine et nutritive (deux mots) ?',
      accepted: ['sécurité alimentaire', 'la sécurité alimentaire', 'une sécurité alimentaire'],
      traps: [
        { text: 'révolution verte', why: 'La révolution verte désigne des innovations agricoles.' },
        { text: 'insécurité alimentaire', why: 'C’est la situation contraire.' },
      ],
      quote: G_SECURITE,
      explain: 'Tous, à tout moment : c’est la sécurité alimentaire.',
      src: SECURITE,
    },
    {
      q: 'comment appelle-t-on l’agriculture dont la récolte nourrit surtout la famille ou le village (un adjectif) ?',
      accepted: ['vivrière', 'agriculture vivrière', 'une agriculture vivrière', 'vivriere'],
      traps: [
        { text: 'commerciale', why: 'Une agriculture commerciale vend l’essentiel de sa production.' },
        { text: 'irriguée', why: 'Irriguée parle de l’eau, pas de la destination des récoltes.' },
      ],
      quote: G_VIVRIERE,
      explain: 'Vivrière : elle sert d’abord à vivre sur place.',
      src: VIVRIERE,
    },
    {
      q: 'quel nom donne-t-on aux innovations agricoles qui ont accru les rendements en Asie à partir des années 1960 (deux mots) ?',
      accepted: ['révolution verte', 'la révolution verte', 'une révolution verte'],
      traps: [
        { text: 'transition énergétique', why: 'Elle concerne les sources d’énergie.' },
        { text: 'agriculture vivrière', why: 'Elle désigne une production consommée sur place.' },
      ],
      quote: G_REVOL,
      explain: 'La révolution verte associe semences, irrigation et engrais.',
      src: REVOLUTION,
    },
    {
      q: 'comment nomme-t-on la quantité récoltée sur une surface donnée (un mot) ?',
      accepted: ['rendement', 'le rendement', 'un rendement', 'rendements'],
      traps: [
        { text: 'surface', why: 'La surface est l’étendue du champ, pas ce qu’on y récolte.' },
        { text: 'production', why: 'La production est la quantité totale ; ici, on la rapporte à la surface.' },
        { text: 'revenu', why: 'Le revenu est de l’argent gagné.' },
      ],
      quote: C_RENDEMENT,
      explain: 'Doubler le rendement, c’est récolter deux fois plus sur la même surface.',
      src: RENDEMENT,
    },
  ],
  docs: [
    {
      title: 'Une vallée change de semences',
      lines: [
        'Dans une vallée imaginaire d’Asie, les agriculteurs adoptent de nouvelles variétés de riz.',
        'Ils creusent des canaux et utilisent des engrais chimiques.',
        'Les récoltes augmentent nettement.',
        'Les petits paysans sans argent pour acheter les engrais en profitent moins.',
      ],
      qs: [
        {
          q: 'Quel changement la vallée connaît-elle ?',
          a: 'une révolution verte',
          wrong: [
            {
              label: 'une déprise agricole',
              why: 'La déprise est un abandon ; ici les récoltes augmentent (ligne 3).',
            },
            { label: 'une agriculture sans irrigation', why: 'La ligne 2 mentionne des canaux.' },
            { label: 'une transition énergétique', why: 'Le texte parle de culture et non de sources d’énergie.' },
          ],
          quote: G_VARIETES,
          explain: 'Semences, canaux et engrais (lignes 1-2) sont les ingrédients de la révolution verte.',
          src: REVOLUTION,
        },
        {
          q: 'Que révèle la ligne 4 ?',
          a: 'les gains ne profitent pas autant à tous les agriculteurs',
          wrong: [
            { label: 'tout le monde y gagne de la même façon', why: 'La ligne 4 dit que certains en profitent moins.' },
            { label: 'les récoltes baissent', why: 'La ligne 3 dit qu’elles augmentent.' },
            {
              label: 'les paysans n’ont plus besoin d’argent',
              why: 'Au contraire, il en faut pour acheter les engrais.',
            },
          ],
          quote: G_INEGAL,
          explain: 'La production monte, mais les inégalités entre paysans restent.',
          src: REVOLUTION,
        },
      ],
    },
    {
      title: 'Un quartier sans produits frais',
      lines: [
        'Dans une grande ville imaginaire d’un pays riche, un quartier pauvre n’a aucun magasin de produits frais.',
        'Les fruits et légumes les plus proches se vendent loin et cher.',
        'Sur place, on trouve surtout des plats très transformés.',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on un tel espace ?',
          a: 'un désert alimentaire',
          wrong: [
            {
              label: 'un front pionnier',
              why: 'Un front pionnier est une zone mise en culture, pas un quartier sans produits frais.',
            },
            { label: 'une exploitation vivrière', why: 'Personne n’y produit sa nourriture d’après le texte.' },
            { label: 'une zone industrialo-portuaire', why: 'Rien dans le texte ne parle d’un port.' },
          ],
          quote: G_DESERT,
          explain: 'Les lignes 1 et 2 : des aliments sains sont difficiles à obtenir à bon prix.',
          src: DESERT,
        },
        {
          q: 'Que montre cet exemple sur l’insécurité alimentaire ?',
          a: 'elle peut exister aussi dans les pays riches',
          wrong: [
            { label: 'elle n’existe que dans les pays pauvres', why: 'La ligne 1 se passe dans un pays riche.' },
            { label: 'elle ne concerne que la quantité', why: 'La qualité des aliments (lignes 2-3) compte aussi.' },
            { label: 'elle disparaît dès qu’une ville est grande', why: 'La grande ville n’empêche pas le problème.' },
          ],
          quote: G_RICHES,
          explain: 'L’échelle du quartier révèle des inégalités au sein d’un même pays.',
          src: SECURITE,
        },
      ],
    },
    {
      title: 'Un village au rythme des saisons',
      lines: [
        'Dans un village imaginaire, les familles cultivent du mil sur de petits champs.',
        'Presque toute la récolte est mangée au village.',
        'Une année de sécheresse, la réserve s’épuise avant la moisson suivante.',
      ],
      qs: [
        {
          q: 'Quel type d’agriculture est décrit ?',
          a: 'une agriculture vivrière',
          wrong: [
            {
              label: 'une agriculture qui exporte presque tout',
              why: 'La ligne 2 dit que la récolte reste au village.',
            },
            { label: 'une agriculture qui produit seulement des fibres', why: 'Le mil est une nourriture (ligne 1).' },
            { label: 'une agriculture sans récolte', why: 'Il y a bien une récolte (ligne 2).' },
          ],
          quote: G_VIVRIERE,
          explain: 'La production consommée sur place définit l’agriculture vivrière.',
          src: VIVRIERE,
        },
        {
          q: 'Pourquoi la ligne 3 montre-t-elle une fragilité ?',
          a: 'le village dépend de sa production locale, vulnérable aux crises climatiques',
          wrong: [
            { label: 'le village vend trop de mil à l’étranger', why: 'La récolte est mangée sur place (ligne 2).' },
            {
              label: 'la sécheresse n’a aucun effet sur les cultures',
              why: 'La réserve s’épuise à cause de la sécheresse.',
            },
            { label: 'les familles ne mangent pas de mil', why: 'Le mil est justement leur nourriture.' },
          ],
          quote: G_CRISES,
          explain: 'Si la récolte manque, peu d’autres sources compensent.',
          src: VIVRIERE,
        },
      ],
    },
  ],
  sources: [RENDEMENT, SOUS_ALIM, DESERT],
};

// ——— Notion 4 : gérer et renouveler ———

const gererRenouveler: Notion = {
  classe: '5e',
  id: 'g5-gerer-renouveler',
  title: 'Gérer et renouveler les ressources',
  hint: 'Pense au temps long : comment utiliser une ressource sans la gaspiller ?',
  memo: [
    'Le **développement durable** répond aux besoins du présent sans compromettre ceux des générations futures. Il cherche un équilibre entre le social, l’économie et l’environnement.',
    'Pour ménager les ressources : consommer moins (**sobriété**), mieux utiliser, **recycler** et développer les énergies renouvelables.',
    'La **transition énergétique** : passer d’énergies tirées de stocks (pétrole, gaz, charbon, uranium) à des énergies de flux, qui se renouvellent (vent, soleil, **biomasse**), en consommant mieux.',
    'L’idée de développement durable apparaît en 1987 (rapport Brundtland) et est adoptée au Sommet de la Terre de Rio en 1992. L’ONU a fixé en 2015 des objectifs à atteindre pour 2030, les **ODD**. Exemple : l’eau propre et l’**assainissement**.',
  ],
  faits: [
    {
      q: 'Qu’est-ce que le développement durable ?',
      a: 'répondre aux besoins du présent sans compromettre ceux des générations futures',
      wrong: [
        {
          label: 'produire le plus possible, sans se soucier de l’avenir',
          why: 'Cela compromet les ressources de demain.',
        },
        {
          label: 'arrêter toute activité économique',
          why: 'Le développement durable ne supprime pas l’économie : il la concilie avec le reste.',
        },
        {
          label: 'protéger la nature sans penser aux besoins des habitants',
          why: 'Il faut aussi répondre aux besoins sociaux et économiques.',
        },
      ],
      gap: [
        'Le développement durable répond aux besoins du présent sans compromettre la capacité des générations ',
        ' de répondre aux leurs.',
        ['futures'],
      ],
      choix: ['futures', 'passées', 'urbaines'],
      quote: G_DURABLE,
      explain: 'L’idée clé : agir aujourd’hui en laissant des moyens à demain.',
      src: DURABLE,
    },
    {
      q: 'Quels sont les trois piliers du développement durable ?',
      a: 'le social, l’économique et l’environnemental',
      wrong: [
        { label: 'le pétrole, le gaz et le charbon', why: 'Ce sont des énergies fossiles, pas des piliers.' },
        { label: 'la ville, la campagne et le littoral', why: 'Ce sont des types d’espaces.' },
        { label: 'le local, le régional et le mondial', why: 'Ce sont des échelles géographiques.' },
      ],
      gap: ['Les trois piliers sont le social, l’économique et l’', '.', ['environnemental']],
      choix: ['environnemental', 'administratif', 'militaire'],
      quote: G_PILIERS,
      explain: 'Un projet durable cherche un équilibre entre ces trois dimensions.',
      src: DURABLE,
    },
    {
      q: 'En quelle année l’ONU a-t-elle fixé les objectifs de développement durable (ODD) ?',
      a: 'en 2015',
      wrong: [
        { label: 'en 1987', why: '1987 est la date du rapport Brundtland.' },
        { label: 'en 2030', why: '2030 est l’échéance pour les atteindre.' },
        { label: 'en 1960', why: 'Les années 1960 sont celles de la révolution verte.' },
      ],
      gap: ['Les ODD ont été fixés en 2015, à atteindre pour ', '.', ['2030']],
      choix: ['2030', '1987', '2100'],
      quote: G_ODD,
      explain: 'Les ODD fixent un cap commun avec une échéance.',
      src: ODD,
    },
    {
      q: 'Qu’est-ce que le recyclage ?',
      a: 'un mode de gestion des déchets qui en récupère la matière',
      wrong: [
        {
          label: 'le simple enfouissement de tous les déchets',
          why: 'La mise en décharge est un autre mode de gestion.',
        },
        { label: 'le fait de brûler les déchets', why: 'C’est l’incinération, un autre mode de gestion.' },
        { label: 'l’extraction de pétrole', why: 'Extraire du pétrole prélève un stock du sous-sol.' },
      ],
      gap: ['Grâce au recyclage, le déchet devient une ', '.', ['ressource']],
      choix: ['ressource', 'frontière', 'tension'],
      quote: G_VALORISATION,
      explain: 'La matière récupérée évite de gaspiller des ressources déjà utilisées.',
      src: RECYCLAGE,
    },
    {
      q: 'Quelle limite du recyclage faut-il connaître ?',
      a: 'toutes les matières ne peuvent pas être recyclées',
      wrong: [
        { label: 'il supprime tout besoin de gérer les ressources', why: 'Le recyclage aide, mais ne suffit pas.' },
        { label: 'il est interdit en France', why: 'Des collectivités l’encouragent.' },
        { label: 'il transforme tous les déchets en eau potable', why: 'Ce n’est pas ce que fait le recyclage.' },
      ],
      gap: ['Toutes les matières ne peuvent pas être ', '.', ['recyclées']],
      choix: ['recyclées', 'irriguées', 'cartographiées'],
      quote: G_LIMITE,
      explain: 'Il faut aussi réduire la consommation et mieux utiliser les ressources.',
      src: RECYCLAGE,
    },
    {
      q: 'Qu’est-ce que la transition énergétique ?',
      a: 'le passage à un système qui repose davantage sur le vent, le soleil ou la biomasse',
      wrong: [
        {
          label: 'le passage à l’usage exclusif du charbon',
          why: 'Le charbon est une énergie de stock, qu’on cherche à dépasser.',
        },
        { label: 'le transport du gaz par bateau', why: 'C’est un mode de transport, pas un changement de système.' },
        {
          label: 'l’augmentation de la part des seules énergies de stock',
          why: 'La transition va vers les énergies de flux.',
        },
      ],
      gap: ['La transition énergétique ajoute des actions de ', ' et d’efficacité énergétiques.', ['sobriété']],
      choix: ['sobriété', 'surconsommation', 'conquête'],
      quote: G_TRANSITION,
      explain: 'On passe d’énergies de stock à des énergies de flux, en consommant mieux.',
      src: TRANSITION,
    },
    {
      q: 'Qu’est-ce qui fait qu’un élément de la nature devient une ressource ?',
      a: 'une société en a besoin et sait l’utiliser',
      wrong: [
        { label: 'il est ancien', why: 'L’âge ne suffit pas à faire une ressource.' },
        { label: 'il est situé loin de toute ville', why: 'La distance ne crée pas le besoin.' },
        { label: 'il est coloré', why: 'La couleur n’a pas de rôle.' },
      ],
      gap: ['Il n’y a pas de ressource sans ', ' des sociétés.', ['besoin']],
      choix: ['besoin', 'frontière', 'distance'],
      quote: G_BESOIN,
      explain: 'Ce sont les sociétés qui font la ressource : elles peuvent donc aussi choisir de la ménager.',
      src: RESSOURCE,
    },
    {
      q: 'Lors de quel événement le développement durable a-t-il été adopté en 1992 ?',
      a: 'le Sommet de la Terre à Rio',
      wrong: [
        { label: 'la révolution verte en Inde', why: 'Il s’agit d’innovations agricoles des années 1960.' },
        { label: 'le rapport Brundtland', why: 'Ce rapport de 1987 introduit la notion, avant son adoption.' },
        { label: 'l’échéance des objectifs de l’ONU', why: 'Cette échéance est fixée à 2030.' },
      ],
      gap: ['Le développement durable fut adopté au Sommet de la Terre de ', ' en 1992.', ['Rio']],
      choix: ['Rio', 'Paris', 'Pékin'],
      quote: G_RIO,
      explain: 'La notion, introduite en 1987, est adoptée à Rio en 1992.',
      src: DURABLE,
    },
  ],
  paires3: [
    ['recycler', 'donner une nouvelle vie à la matière d’un déchet'],
    ['sobriété', 'consommer moins de ressources'],
    ['développement durable', 'penser au présent et aux générations futures'],
  ],
  paires5: [
    ['1987', 'rapport Brundtland'],
    ['1992', 'Sommet de la Terre à Rio'],
    ['2015', 'objectifs de développement durable de l’ONU'],
    ['2030', 'échéance fixée pour ces objectifs'],
    ['transition énergétique', 'passage à des énergies de flux'],
  ],
  consigne: {
    prompt: 'Remets ces étapes du développement durable dans l’ordre chronologique.',
    hint: 'Le rapport qui lance l’expression vient avant le sommet qui l’adopte.',
    why: 'Le rapport Brundtland (1987) précède le Sommet de la Terre de Rio (1992), puis les ODD (2015) et leur échéance (2030).',
    fin: 'La première étape est',
    quote: G_BRUNDTLAND,
    src: DURABLE,
  },
  ordre: [
    'le rapport Brundtland introduit le développement durable',
    'le Sommet de la Terre de Rio adopte le développement durable',
    'l’ONU fixe les objectifs de développement durable',
    'année prévue pour atteindre les objectifs de l’ONU',
  ],
  libres: [
    {
      q: 'comment appelle-t-on le développement qui répond aux besoins du présent sans compromettre ceux des générations futures (deux mots) ?',
      accepted: ['développement durable', 'le développement durable', 'un développement durable', 'durable'],
      traps: [
        { text: 'développement économique', why: 'L’économie n’est qu’un des trois piliers.' },
        { text: 'développement humain', why: 'Le développement humain ne mentionne pas les générations futures.' },
      ],
      quote: G_DURABLE,
      explain: 'C’est la définition du développement durable.',
      src: DURABLE,
    },
    {
      q: 'quel mode de gestion des déchets permet d’en réutiliser la matière (un mot) ?',
      accepted: ['recyclage', 'le recyclage', 'recycler'],
      traps: [
        { text: 'incinération', why: 'L’incinération brûle les déchets.' },
        {
          text: 'réemploi',
          why: 'Le réemploi redonne un usage à l’objet ; ici, on cherche le mode qui récupère sa matière.',
        },
        { text: 'décharge', why: 'La mise en décharge les entasse sans en récupérer la matière.' },
      ],
      quote: G_RECYCL,
      explain: 'Recycler, c’est transformer un déchet en nouvelle matière utile.',
      src: RECYCLAGE,
    },
    {
      q: 'quelle organisation internationale a fixé les objectifs de développement durable (son sigle) ?',
      accepted: ['ONU', 'l’ONU', 'Organisation des Nations Unies', 'les Nations Unies', 'Nations Unies'],
      traps: [
        { text: 'UE', why: 'L’Union européenne est une autre organisation.' },
        { text: 'OTAN', why: 'L’OTAN est une alliance militaire.' },
      ],
      quote: G_ODD,
      explain: 'L’ONU a adopté les ODD en 2015.',
      src: ODD,
    },
    {
      q: 'pour quelle année les objectifs de développement durable doivent-ils être atteints ?',
      accepted: ['2030', 'en 2030', 'l’année 2030'],
      traps: [
        { text: '2015', why: '2015 est l’année où ils ont été fixés.' },
        { text: '1992', why: '1992 est l’année du Sommet de la Terre de Rio.' },
      ],
      quote: G_ODD,
      explain: 'Fixés en 2015, ils visent 2030.',
      src: ODD,
    },
  ],
  docs: [
    {
      title: 'La commune de Veyrac et ses déchets',
      lines: [
        'La commune imaginaire de Veyrac trie le verre pour le fondre et fabriquer de nouvelles bouteilles.',
        'Elle propose aussi un atelier pour réparer les objets avant de les jeter.',
        'Certains emballages mélangés ne peuvent pas encore être recyclés.',
      ],
      qs: [
        {
          q: 'Que devient le verre trié ?',
          a: 'une nouvelle ressource',
          wrong: [
            { label: 'un déchet enterré', why: 'La ligne 1 dit qu’on le refond pour de nouvelles bouteilles.' },
            { label: 'une énergie fossile', why: 'Le verre trié n’est pas du charbon ni du pétrole.' },
            { label: 'une frontière', why: 'Rien à voir avec le tri.' },
          ],
          quote: G_DECHET,
          explain: 'Le recyclage (ligne 1) transforme le déchet en ressource.',
          src: RECYCLAGE,
        },
        {
          q: 'Que montre la ligne 3 ?',
          a: 'le recyclage ne peut pas tout résoudre',
          wrong: [
            { label: 'tous les déchets sont recyclables', why: 'La ligne 3 dit le contraire.' },
            { label: 'le tri est inutile', why: 'La ligne 1 montre qu’il permet de refaire des bouteilles.' },
            { label: 'la commune ne produit aucun déchet', why: 'Les emballages mélangés restent à traiter.' },
          ],
          quote: G_LIMITE,
          explain: 'Pour ménager les ressources, il faut aussi réduire et réparer.',
          src: RECYCLAGE,
        },
      ],
    },
    {
      title: 'Un projet de parc solaire',
      lines: [
        'Un village imaginaire envisage un parc de panneaux solaires sur un ancien parking.',
        'Le projet fournirait de l’électricité et créerait deux emplois.',
        'Les habitants demandent qu’il évite de détruire la prairie voisine, riche en insectes.',
      ],
      qs: [
        {
          q: 'Quels piliers du développement durable apparaissent dans ce débat ?',
          a: 'le social, l’économique et l’environnemental',
          wrong: [
            { label: 'uniquement l’économique', why: 'La ligne 3 parle aussi de la nature et des habitants.' },
            { label: 'uniquement l’environnemental', why: 'La ligne 2 parle d’emplois et d’électricité.' },
            { label: 'aucun des trois', why: 'Chacune des dimensions est présente.' },
          ],
          quote: G_PILIERS,
          explain: 'Emplois (économique), habitants (social), prairie (environnemental) : les trois piliers.',
          src: DURABLE,
        },
        {
          q: 'Pourquoi ce projet relève-t-il de la transition énergétique ?',
          a: 'il développe une énergie qui se renouvelle sans cesse, le solaire',
          wrong: [
            { label: 'il extrait du pétrole', why: 'Aucun pétrole dans ce projet.' },
            { label: 'il augmente la part du charbon', why: 'Le charbon n’apparaît pas.' },
            { label: 'il supprime tout besoin d’électricité', why: 'Il en produit au contraire.' },
          ],
          quote: G_FLUX,
          explain: 'La ligne 1 : le solaire, une énergie qui se renouvelle, s’ajoute au système.',
          src: TRANSITION,
        },
      ],
    },
    {
      title: 'La nappe de Cressan',
      lines: [
        'Dans la plaine imaginaire de Cressan, les agriculteurs pompent chaque été dans la même réserve d’eau souterraine.',
        'Le niveau de la réserve baisse d’année en année.',
        'Un accord limite les prélèvements et finance des arrosages plus précis.',
      ],
      qs: [
        {
          q: 'Quel est le problème décrit aux lignes 1 et 2 ?',
          a: 'une tension entre les besoins et la quantité disponible',
          wrong: [
            {
              label: 'un excès d’eau qui inonde la plaine',
              why: 'Le niveau baisse : il manque de plus en plus d’eau.',
            },
            { label: 'une réserve qui augmente sans fin', why: 'La ligne 2 dit qu’elle diminue.' },
            {
              label: 'une disparition des besoins des agriculteurs',
              why: 'Ils pompent chaque été, leurs besoins sont forts.',
            },
          ],
          quote: G_RARE,
          explain: 'Quand une ressource se raréfie, les besoins dépassent plus facilement ce qui est disponible.',
          src: RESSOURCE,
        },
        {
          q: 'Pourquoi l’accord de la ligne 3 va-t-il vers le développement durable ?',
          a: 'il aide à préserver de l’eau pour les besoins de demain',
          wrong: [
            { label: 'il pousse à pomper deux fois plus', why: 'Au contraire, il limite les prélèvements.' },
            { label: 'il interdit toute agriculture', why: 'Il finance des arrosages plus précis.' },
            { label: 'il supprime la réserve', why: 'Le but est de la ménager.' },
          ],
          quote: G_DURABLE,
          explain: 'Limiter et mieux utiliser (ligne 3), c’est penser aux besoins futurs.',
          src: DURABLE,
        },
      ],
    },
  ],
  sources: [SOBRIETE],
};

export const NOTIONS: readonly Notion[] = [energie, eau, alimentation, gererRenouveler];

export const SKILLS: readonly Skill[] = NOTIONS.map(notion);
