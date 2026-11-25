import type { Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { zoneName } from '../cartes.ts';
import { notion, type Notion } from './kit.ts';

/**
 * Sixième, thème 4 « Le monde habité » (lot ge-6e-04). Chaque fait cite une source du registre avec sa citation
 * exacte : programme du cycle 3, ressource d’accompagnement Éduscol du thème et glossaire de Géoconfluences.
 * Les textes à lire du niveau 5 sont écrits pour l’exercice.
 */

const EDUSCOL = 'eduscol-monde-habite';
const DENSITE = 'geoconfluences-densite';
const ECOUMENE = 'geoconfluences-ecoumene';
const PEUPLEMENT = 'geoconfluences-population-peuplement';
const MEGALOPOLE = 'geoconfluences-megalopole';
const HABITAT = 'geoconfluences-habitat';
const LITTORALISATION = 'geoconfluences-littoralisation';

// Programme du cycle 3.
const P_INEGAL = 'Où sont les femmes et les hommes sur la Terre ? Comment expliquer l’inégal peuplement de la Terre ?';
const P_PERMANENCES =
  'montrant les permanences des grands foyers de population et leurs évolutions dans la longue durée';

// Ressource Éduscol « Le monde habité » (mars 2016).
const E_MOYENNE = 'une faible densité moyenne (51 hab./km²) et de grands contrastes de répartition des hommes';
const E_TROIS_QUARTS =
  'Les trois quarts de l’humanité se distribuent en trois principaux foyers de peuplement : Asie orientale, monde indien et Méditerranée-Europe';
const E_SECONDAIRES =
  'Le dernier quart de l’humanité se distribue dans le reste du monde en plusieurs foyers secondaires (Amérique : la façade atlantique nord-orientale avec la mégalopole, l’estuaire du Saint Laurent et la région des grands lacs, Sud-est brésilien ; Afrique subsaharienne : golfe de Guinée et Nigéria)';
const E_MARGES =
  'incluant leurs marges immédiates (péninsules et archipels asiatiques, Maghreb-Machrek) et les espaces qui les relient (Iran, Croissant fertile)';
const E_NEOLITHIQUE = 'la mise en place des principaux foyers de peuplement dès le Néolithique';
const E_AGRICULTURE =
  'ils correspondent aux espaces de sédentarisation en lien avec une augmentation de la production liée à la naissance de l’agriculture';
const E_XIXE =
  'les migrations de masse qui se sont enclenchées au XIXe quand les Européens se sont déplacés vers des colonies de peuplement secondaires, en Amérique, en Australie, en Afrique du Sud';
const E_DYNAMIQUES =
  'l’urbanisation, dont le rythme s’est accéléré et la littoralisation du peuplement, comme phénomène majeur et généralisé qui affecte toutes les régions peuplées';
const E_MILIEUX =
  'en l’absence de corrélation systématique entre densités humaines et milieux aux conditions a priori favorables';
const E_VIDES =
  'les « vides humains » n’excluent pas ponctuellement une forte présence des hommes à grande échelle (oasis, villes, fronts pionniers)';
const E_HISTOIRE = 'Force est donc de rechercher des clés d’explication du peuplement du côté des facteurs historiques';
const E_SORTIE =
  'la diffusion des hommes sur la Terre dans les débuts de l’humanité, depuis la « sortie d’Afrique » vers - 100 000 ans';
const E_DENSEMENT = 'qu’il y a des espaces très densément peuplés et d’autres relativement vides d’hommes';
const E_SURVALORISER = 'Survaloriser les facteurs explicatifs climatiques et morphologiques';
const E_FAIBLEMENT =
  'En dépit des perspectives de forte croissance de la population mondiale, le monde reste dans son ensemble faiblement peuplé';
const E_ETATS_UNIS =
  'Si l’on mettait les 9 milliards d’habitants prévus avant la fin du siècle dans le territoire des États-Unis, la densité de la population serait celle de l’Ile de France';
const E_TOTALEMENT = 'Renforcer l’idée d’espaces totalement vides, alors que l’ensemble du monde est habité';
const E_FORMES = 'les formes de peuplement (continu/discontinu, dispersé/groupé)';
const E_MARGES_ECOUMENE = 'les espaces très peu peuplés, souvent localisés aux marges de l’écoumène';
const E_URBANISATION_METROPOLE =
  'Cette approche permet d’établir une corrélation entre le fort peuplement et les grandes villes et d’esquisser le mouvement d’urbanisation comme l’une des dynamiques contemporaines du peuplement';

// Glossaire de Géoconfluences (ENS de Lyon, DGESCO).
const G_RAPPORT =
  'c’est le rapport entre un indicateur statistique, un nombre d’« individus » (au sens statistique : nombre d’habitants, de médecins, de logements, d’unités de production, etc.) ou d’autres paramètres (tels que le déroulé linéaire d’un réseau autoroutier par exemple) et une surface';
const G_UNITE =
  'La densité de population, ou densité démographique, habituellement exprimées en habitants par kilomètre carré (hab./km²)';
const G_RELATIVE =
  'La qualification des densités (fortes, moyennes ou faibles) est toujours relative à un type d’espace, aux ressources d’un lieu donné, à une certaine époque';
const G_ECOUMENE =
  'désigne pour les géographes l’espace de vie des hommes à la surface de la planète, l’ensemble des espaces terrestres habités par l’humanité';
const G_LIMITES =
  'Les limites de l’écoumène font référence aux espaces interdisant l’occupation permanente, comme le continent antarctique';
const G_PEUPLEMENT =
  'Elle s’intéresse au peuplement (la répartition de la population) mais aussi aux dynamiques territoriales à l’œuvre';
const G_INEGALE =
  'Elle part du constat de l’inégale intensité de l’occupation de cet espace et en recherche les facteurs explicatifs puisés, pour partie seulement, dans l’histoire';
const G_MEGALOPOLE =
  'Une mégalopole est un réseau de villes à vaste échelle, intégrant des villes multimillionnaires reliées par un tissu dense d’axes de transport';
const G_BOSWASH =
  'La Megalopolis qualifie à l’origine la conurbation s’étendant le long de la côte atlantique de Boston à Washington';
const G_HABITAT =
  'des études détaillées sur la disposition des habitations dans les villages (habitat groupé ou dispersé)';
const G_LITTORALISATION =
  'La littoralisation est un processus de concentration des populations et des activités humaines le long ou à proximité des littoraux';

// ——— Notion 1 : la répartition de la population mondiale ———

const repartition: Notion = {
  classe: '6e',
  id: 'g6-repartition-population',
  title: 'La répartition de la population mondiale',
  hint: 'Pense aux contrastes entre espaces très peuplés et espaces presque vides, puis à ce qui les explique.',
  memo: [
    'La population mondiale est très inégalement répartie : des espaces très peuplés côtoient des **vides humains**.',
    'L’**écoumène**, l’espace habité, couvre presque toute la Terre ; seul un espace comme l’Antarctique interdit l’occupation permanente.',
    'Le climat et le relief n’expliquent pas tout : l’histoire du **peuplement** compte. Aujourd’hui, l’**urbanisation** et la **littoralisation** progressent partout.',
  ],
  faits: [
    {
      q: 'Comment la population mondiale est-elle répartie sur la Terre ?',
      a: 'de façon très inégale : des espaces très peuplés, d’autres presque vides',
      wrong: [
        {
          label: 'de façon égale sur toutes les terres émergées',
          why: 'La carte montre de grands contrastes : la répartition n’est pas égale.',
        },
        {
          label: 'uniquement dans les villes',
          why: 'Une grande partie de l’humanité vit aussi dans les campagnes.',
        },
        {
          label: 'uniquement dans les régions au climat doux',
          why: 'Des régions au climat doux sont peu peuplées : le climat n’explique pas tout.',
        },
      ],
      gap: ['Il y a des espaces très densément peuplés et d’autres relativement vides d’', '.', ['hommes']],
      choix: ['hommes', 'eau', 'routes'],
      quote: E_DENSEMENT,
      explain: 'C’est le premier constat du thème : le peuplement est très inégal.',
      src: EDUSCOL,
    },
    {
      q: 'Quel espace de la Terre interdit l’occupation humaine permanente ?',
      a: 'le continent antarctique',
      wrong: [
        { label: 'l’Europe', why: 'L’Europe fait partie des espaces les plus peuplés du monde.' },
        { label: 'l’Asie orientale', why: 'L’Asie orientale est l’un des trois grands foyers de peuplement.' },
        {
          label: 'le Sahara',
          why: 'Le Sahara est très peu peuplé, mais des oasis et des villes y sont habitées en permanence.',
        },
      ],
      gap: [
        'Les limites de l’écoumène correspondent aux espaces interdisant l’occupation permanente, comme le continent ',
        '.',
        ['antarctique'],
      ],
      choix: ['antarctique', 'européen', 'asiatique'],
      quote: G_LIMITES,
      explain: 'Le froid extrême y empêche toute population permanente : il marque la limite de l’écoumène.',
      src: ECOUMENE,
    },
    {
      q: 'Le climat et le relief suffisent-ils à expliquer la répartition de la population ?',
      a: 'non : il faut aussi chercher des facteurs historiques',
      wrong: [
        {
          label: 'oui : le climat explique à lui seul toute la carte',
          why: 'Des milieux favorables sont peu peuplés : le climat ne suffit pas.',
        },
        {
          label: 'oui : le relief explique à lui seul toute la carte',
          why: 'Le relief compte, mais il ne suffit pas à expliquer les grands foyers.',
        },
        {
          label: 'non : seule la taille des pays compte',
          why: 'Un grand pays peut être peu peuplé ; la taille n’explique pas le peuplement.',
        },
      ],
      gap: ['Il faut rechercher des clés d’explication du peuplement du côté des facteurs ', '.', ['historiques']],
      choix: ['historiques', 'sportifs', 'touristiques'],
      quote: E_HISTOIRE,
      explain: 'Les grands foyers sont habités depuis très longtemps : leur histoire explique leur poids actuel.',
      src: EDUSCOL,
    },
    {
      q: 'Quelles grandes dynamiques transforment aujourd’hui le peuplement dans toutes les régions peuplées ?',
      a: 'l’urbanisation et la littoralisation',
      wrong: [
        {
          label: 'l’abandon des villes et des côtes',
          why: 'C’est l’inverse : les villes et les côtes attirent de plus en plus d’habitants.',
        },
        {
          label: 'le retour général à la vie nomade',
          why: 'La grande majorité des humains sont sédentaires et le restent.',
        },
        {
          label: 'l’installation massive en Antarctique',
          why: 'L’Antarctique reste hors de l’écoumène : aucune population permanente n’y vit.',
        },
      ],
      gap: ['Deux dynamiques majeures du peuplement sont l’urbanisation et la ', '.', ['littoralisation']],
      choix: ['littoralisation', 'désertification', 'glaciation'],
      quote: E_DYNAMIQUES,
      explain: 'Les habitants se concentrent de plus en plus dans les villes et près des côtes.',
      src: EDUSCOL,
    },
    {
      q: 'Le monde est-il surpeuplé dans son ensemble ?',
      a: 'non : il reste dans son ensemble faiblement peuplé',
      wrong: [
        {
          label: 'oui : il n’y a plus de place nulle part',
          why: 'C’est une idée reçue : de très vastes espaces restent peu peuplés.',
        },
        {
          label: 'oui : toutes les régions sont très denses',
          why: 'Les fortes densités se concentrent dans quelques foyers seulement.',
        },
        {
          label: 'non : personne n’habite les villes',
          why: 'Les villes regroupent au contraire une part croissante de l’humanité.',
        },
      ],
      gap: [
        'Malgré la croissance de la population mondiale, le monde reste dans son ensemble faiblement ',
        '.',
        ['peuplé'],
      ],
      choix: ['peuplé', 'exploré', 'cultivé'],
      quote: E_FAIBLEMENT,
      explain: 'La population est très concentrée dans certains foyers ; ailleurs, les densités restent basses.',
      src: EDUSCOL,
    },
    {
      q: 'Les espaces presque vides d’hommes sont-ils totalement inhabités ?',
      a: 'non : on y trouve par endroits des oasis, des villes ou des fronts pionniers',
      wrong: [
        { label: 'oui : personne n’y vit jamais', why: 'L’ensemble du monde est habité, même de façon très diffuse.' },
        {
          label: 'oui : ils sont interdits par la loi',
          why: 'Aucune loi n’interdit d’y vivre : ce sont des contraintes qui limitent le peuplement.',
        },
        {
          label: 'non : ils sont aussi peuplés que les villes',
          why: 'Ils restent très peu peuplés, avec seulement quelques points de forte présence.',
        },
      ],
      gap: [
        'Les vides humains n’excluent pas une forte présence des hommes dans des ',
        ', des villes ou des fronts pionniers.',
        ['oasis'],
      ],
      choix: ['oasis', 'glaciers', 'océans'],
      quote: E_VIDES,
      explain: 'Un « vide » humain n’est jamais totalement vide : quelques lieux y concentrent des habitants.',
      src: EDUSCOL,
    },
  ],
  paires3: [
    ['Écoumène', 'Espace habité par l’humanité'],
    ['Vide humain', 'Espace très peu peuplé'],
    ['Littoralisation', 'Concentration des hommes près des côtes'],
  ],
  paires5: [
    ['Écoumène', 'Espace habité par l’humanité'],
    ['Vide humain', 'Espace très peu peuplé'],
    ['Urbanisation', 'Concentration de la population dans les villes'],
    ['Littoralisation', 'Concentration des hommes près des côtes'],
    ['Facteur historique', 'Explication tirée du passé des sociétés'],
  ],
  libres: [
    {
      q: 'Quel continent marque la limite de l’écoumène, car il interdit l’occupation permanente ?',
      accepted: ['Antarctique', 'l’Antarctique', 'le continent antarctique', 'continent antarctique'],
      traps: [
        {
          text: 'Arctique',
          why: 'L’Arctique est un océan, bordé de terres habitées ; le continent est l’Antarctique.',
        },
        { text: 'Afrique', why: 'L’Afrique est un continent habité, avec de grands foyers de peuplement.' },
      ],
      quote: G_LIMITES,
      explain: 'L’Antarctique n’a aucune population permanente : il est hors de l’écoumène.',
      src: ECOUMENE,
    },
    {
      q: 'Quel nom désigne la concentration des populations et des activités près des côtes ?',
      accepted: ['littoralisation', 'la littoralisation'],
      traps: [
        {
          text: 'urbanisation',
          why: 'L’urbanisation est la concentration dans les villes, pas forcément sur les côtes.',
        },
        {
          text: 'sédentarisation',
          why: 'La sédentarisation est le fait de se fixer en un lieu, sans lien avec la mer.',
        },
      ],
      quote: G_LITTORALISATION,
      explain: 'Le mot vient de « littoral » : la bande de contact entre la terre et la mer.',
      src: LITTORALISATION,
    },
    {
      q: 'En plus du climat et du relief, quels facteurs expliquent la répartition des hommes ?',
      accepted: ['historiques', 'les facteurs historiques', 'facteurs historiques', 'l’histoire', 'histoire'],
      traps: [
        { text: 'climatiques', why: 'Le climat est déjà cité : il ne suffit pas à expliquer le peuplement.' },
        { text: 'morphologiques', why: 'Le relief (la morphologie) est déjà cité : il ne suffit pas non plus.' },
      ],
      quote: E_SURVALORISER,
      explain: 'Éduscol met en garde contre l’excès d’explications par le climat et le relief : l’histoire compte.',
      src: EDUSCOL,
    },
    {
      q: 'Quel nom désigne la concentration croissante de la population dans les villes ?',
      accepted: ['urbanisation', 'l’urbanisation'],
      traps: [
        { text: 'littoralisation', why: 'La littoralisation est la concentration près des côtes.' },
        { text: 'métropole', why: 'Une métropole est une grande ville, pas le mouvement de la population.' },
      ],
      quote: E_URBANISATION_METROPOLE,
      explain:
        'Le fort peuplement va avec les grandes villes : l’urbanisation est une dynamique actuelle du peuplement.',
      src: EDUSCOL,
    },
  ],
  docs: [
    {
      title: 'Un planisphère de la population',
      lines: [
        'Sur le planisphère, de grandes taches sombres couvrent l’Asie orientale, l’Inde et l’Europe.',
        'D’autres régions restent très claires : le Sahara, le nord du Canada, l’intérieur de l’Australie.',
        'Le professeur précise : même dans ces régions claires, on trouve des oasis, des villes et des villages.',
        'Seul l’Antarctique n’accueille aucune population permanente.',
      ],
      qs: [
        {
          q: 'Que montre ce planisphère de la répartition de la population ?',
          a: 'une répartition très inégale',
          wrong: [
            {
              label: 'une répartition égale partout',
              why: 'Le texte oppose des taches sombres et des régions claires.',
            },
            {
              label: 'une population présente seulement en Europe',
              why: 'Le texte cite aussi l’Asie orientale et l’Inde.',
            },
          ],
          quote: P_INEGAL,
          explain: 'Taches sombres et régions claires : c’est l’inégal peuplement de la Terre.',
        },
        {
          q: 'D’après la ligne 3, les régions claires sont-elles totalement vides ?',
          a: 'non : on y trouve des oasis, des villes et des villages',
          wrong: [
            { label: 'oui : personne n’y vit', why: 'La ligne 3 cite des oasis, des villes et des villages.' },
            { label: 'oui : elles sont recouvertes par la mer', why: 'Le Sahara ou le Canada sont des terres.' },
          ],
          quote: E_VIDES,
          explain: 'Un vide humain n’est jamais totalement vide.',
          src: EDUSCOL,
        },
      ],
    },
    {
      title: 'Pourquoi ici et pas ailleurs ?',
      lines: [
        'Une élève compare deux cartes : celle des climats et celle de la population.',
        'Elle remarque que certaines régions au climat doux sont peu peuplées.',
        'Elle remarque aussi que les régions les plus peuplées sont habitées depuis des millénaires.',
        'Elle conclut que le passé des sociétés aide à comprendre la carte actuelle.',
      ],
      qs: [
        {
          q: 'Que remarque l’élève en comparant la carte des climats à celle de la population ?',
          a: 'un climat favorable ne suffit pas à expliquer un fort peuplement',
          wrong: [
            {
              label: 'le climat explique à lui seul toute la carte',
              why: 'Ligne 2 : des régions au climat doux sont peu peuplées.',
            },
            { label: 'les deux cartes sont identiques', why: 'Si elles l’étaient, l’élève n’aurait rien à expliquer.' },
          ],
          quote: E_MILIEUX,
          explain: 'Un milieu favorable n’est pas toujours très peuplé.',
          src: EDUSCOL,
        },
        {
          q: 'Quel type de facteur l’élève ajoute-t-elle au climat ?',
          a: 'un facteur historique',
          wrong: [
            { label: 'un facteur de relief', why: 'Le texte ne parle pas du relief ; il parle du passé.' },
            { label: 'un facteur de température', why: 'La température fait partie du climat, déjà étudié.' },
          ],
          quote: E_HISTOIRE,
          explain: 'Ligne 4 : le passé des sociétés explique la carte actuelle.',
          src: EDUSCOL,
        },
      ],
    },
    {
      title: 'Vers les villes et les côtes',
      lines: [
        'Dans de nombreux pays, des habitants quittent les campagnes pour s’installer en ville.',
        'Beaucoup de très grandes villes se trouvent au bord de la mer.',
        'De nouveaux quartiers et de nouvelles activités s’étendent le long des côtes.',
        'Ces deux mouvements touchent toutes les régions peuplées du monde.',
      ],
      qs: [
        {
          q: 'Quelle dynamique décrit la ligne 1 ?',
          a: 'l’urbanisation',
          wrong: [
            { label: 'la littoralisation', why: 'La ligne 1 ne parle pas des côtes, mais du départ vers la ville.' },
            { label: 'la sédentarisation', why: 'Ces habitants vivaient déjà en un lieu fixe, à la campagne.' },
          ],
          quote: E_DYNAMIQUES,
          explain: 'Quitter la campagne pour la ville, c’est l’urbanisation.',
          src: EDUSCOL,
        },
        {
          q: 'Quelle dynamique décrit la ligne 3 ?',
          a: 'la littoralisation',
          wrong: [
            { label: 'l’exode vers les montagnes', why: 'La ligne 3 parle des côtes, pas des montagnes.' },
            { label: 'la sédentarisation', why: 'Le texte parle de la concentration près de la mer.' },
          ],
          quote: G_LITTORALISATION,
          explain: 'Habitants et activités se concentrent le long des côtes.',
          src: LITTORALISATION,
        },
      ],
    },
  ],
};

// ——— Notion 2 : les foyers de peuplement ———

/** Foyers situés sans ambiguïté sur un continent de la carte (Méditerranée-Europe chevauche deux continents). */
const FOYERS = [
  { nom: 'Asie orientale', zone: 'asie', type: 'principal' },
  { nom: 'monde indien', zone: 'asie', type: 'principal' },
  { nom: 'golfe de Guinée et Nigéria', zone: 'afrique', type: 'secondaire' },
  { nom: 'façade atlantique nord-orientale des États-Unis', zone: 'amerique-nord', type: 'secondaire' },
  { nom: 'Sud-Est brésilien', zone: 'amerique-sud', type: 'secondaire' },
] as const;

const CONTINENTS = ['asie', 'amerique-nord', 'amerique-sud', 'europe', 'afrique', 'oceanie'] as const;
const continent = (id: string) => zoneName('monde', id) ?? id;

function carteFoyers(rng: Rng, level: Level): QuestionDraft | undefined {
  if (level === 5) return undefined;
  const f = rng.pick(FOYERS);
  const others = rng.shuffle(CONTINENTS.filter((c) => c !== f.zone));
  const why = (z: string) => `Tu as choisi ${continent(z)} : le foyer « ${f.nom} » se trouve sur un autre continent.`;
  const hint = 'Repère d’abord la région citée, puis le continent qui la porte sur le planisphère.';
  const steps = [
    `Cherchons ce que dit la ressource Éduscol : « ${f.type === 'principal' ? E_TROIS_QUARTS : E_SECONDAIRES} ».`,
    `Le foyer « ${f.nom} » est un foyer ${f.type} de peuplement.`,
    `Il se trouve sur le continent : **${continent(f.zone)}**.`,
  ];
  if (level <= 2) {
    return {
      prompt:
        level === 1
          ? `Sur quel continent se trouve le foyer de peuplement « **${f.nom}** » ?`
          : `Attention aux pièges ! Sur quel continent faut-il placer le foyer « **${f.nom}** » ?`,
      figure: { kind: 'map', map: 'monde' },
      ...choice(
        rng,
        continent(f.zone),
        others.slice(0, level === 1 ? 2 : 3).map((z) => ({ label: continent(z), why: why(z) })),
      ),
      hint,
      steps,
      targetSeconds: 25,
    };
  }
  const traps: Trap[] = others.slice(0, 2).map((z) => ({ zone: z, why: why(z) }));
  return {
    prompt:
      level === 3
        ? `Touche sur le planisphère le continent du foyer de peuplement « **${f.nom}** ».`
        : `Sans aide : touche le continent où se trouve le foyer « **${f.nom}** ».`,
    figure: { kind: 'map', map: 'monde' },
    answer: { kind: 'zone', map: 'monde', zone: f.zone },
    traps,
    hint,
    steps,
    targetSeconds: 30,
  };
}

const foyers: Notion = {
  classe: '6e',
  id: 'g6-foyers-peuplement',
  title: 'Les foyers de peuplement',
  hint: 'Pense aux trois grandes concentrations d’Asie et d’Europe, puis aux foyers plus petits ailleurs.',
  memo: [
    'Un **foyer de peuplement** est un espace où la population se concentre. Trois foyers principaux réunissent les trois quarts de l’humanité : Asie orientale, monde indien, Méditerranée-Europe.',
    'Le dernier quart vit surtout dans des **foyers secondaires** : Nord-Est des États-Unis, Sud-Est brésilien, golfe de Guinée.',
    'Ces foyers sont très anciens : ils se forment dès le **Néolithique**, avec l’agriculture et la **sédentarisation**.',
  ],
  faits: [
    {
      q: 'Quelle part de l’humanité vit dans les trois principaux foyers de peuplement ?',
      a: 'les trois quarts',
      wrong: [
        { label: 'un dixième', why: 'C’est beaucoup trop peu : ces foyers rassemblent la majorité de l’humanité.' },
        { label: 'la totalité', why: 'Un quart de l’humanité vit ailleurs, dans des foyers secondaires.' },
        { label: 'un quart', why: 'Un quart, c’est la part qui vit hors de ces trois foyers.' },
      ],
      gap: ['Les ', ' de l’humanité vivent dans les trois principaux foyers de peuplement.', ['trois quarts']],
      choix: ['trois quarts', 'un dixième', 'un quart'],
      quote: E_TROIS_QUARTS,
      explain: 'Trois espaces seulement regroupent la plus grande partie de la population mondiale.',
      src: EDUSCOL,
    },
    {
      q: 'Lequel de ces espaces est l’un des trois principaux foyers de peuplement ?',
      a: 'l’Asie orientale',
      wrong: [
        { label: 'le Sahara', why: 'Le Sahara est un vide humain, ponctué de quelques oasis.' },
        { label: 'l’Antarctique', why: 'L’Antarctique n’a aucune population permanente.' },
        {
          label: 'le Sud-Est brésilien',
          why: 'Le Sud-Est brésilien est peuplé, mais c’est un foyer secondaire.',
        },
      ],
      gap: ['Les trois principaux foyers sont l’Asie orientale, le monde ', ' et la Méditerranée-Europe.', ['indien']],
      choix: ['indien', 'arctique', 'saharien'],
      quote: E_TROIS_QUARTS,
      explain: 'Asie orientale, monde indien et Méditerranée-Europe sont les trois grands foyers.',
      src: EDUSCOL,
    },
    {
      q: 'Quel type de foyer de peuplement forment le golfe de Guinée et le Nigéria ?',
      a: 'un foyer secondaire',
      wrong: [
        { label: 'un des trois foyers principaux', why: 'Les trois foyers principaux sont en Asie et en Europe.' },
        { label: 'un vide humain', why: 'Cette région est très peuplée : ce n’est pas un vide.' },
        {
          label: 'un espace interdit à l’occupation permanente',
          why: 'Seuls des espaces comme l’Antarctique interdisent l’occupation permanente.',
        },
      ],
      gap: ['Le golfe de Guinée et le Nigéria forment un foyer ', ' de peuplement.', ['secondaire']],
      choix: ['secondaire', 'principal', 'vide'],
      quote: E_SECONDAIRES,
      explain: 'Hors des trois grands foyers, la population se regroupe dans des foyers secondaires.',
      src: EDUSCOL,
    },
    {
      q: 'Depuis quand les principaux foyers de peuplement se sont-ils mis en place ?',
      a: 'dès le Néolithique',
      wrong: [
        { label: 'au XXe siècle', why: 'Ces foyers sont bien plus anciens : ils remontent à la préhistoire.' },
        { label: 'au XIXe siècle', why: 'Au XIXe siècle se forment des foyers secondaires, par migrations.' },
        { label: 'depuis l’an 2000', why: 'Ces foyers existent depuis des millénaires.' },
      ],
      gap: ['Les principaux foyers de peuplement se sont mis en place dès le ', '.', ['Néolithique']],
      choix: ['Néolithique', 'XXe siècle', 'XIXe siècle'],
      quote: E_NEOLITHIQUE,
      explain: 'Ces foyers sont habités sans interruption depuis le Néolithique : c’est leur permanence.',
      src: EDUSCOL,
    },
    {
      q: 'Quel changement explique la formation des grands foyers au Néolithique ?',
      a: 'la naissance de l’agriculture et la sédentarisation',
      wrong: [
        {
          label: 'l’invention du chemin de fer',
          why: 'Le chemin de fer date du XIXe siècle, bien après le Néolithique.',
        },
        {
          label: 'la construction des grandes métropoles',
          why: 'Les métropoles sont venues bien plus tard, dans des foyers déjà peuplés.',
        },
        {
          label: 'l’arrivée des Européens en Amérique',
          why: 'Ces migrations sont récentes ; elles ont formé des foyers secondaires.',
        },
      ],
      gap: ['Les foyers correspondent aux espaces de sédentarisation liés à la naissance de l’', '.', ['agriculture']],
      choix: ['agriculture', 'industrie', 'imprimerie'],
      quote: E_AGRICULTURE,
      explain: 'L’agriculture produit plus de nourriture : la population se fixe et augmente au même endroit.',
      src: EDUSCOL,
    },
    {
      q: 'Au XIXe siècle, vers quelles régions des Européens ont-ils migré en masse ?',
      a: 'vers l’Amérique, l’Australie et l’Afrique du Sud',
      wrong: [
        { label: 'vers l’Antarctique', why: 'L’Antarctique n’a jamais reçu de population permanente.' },
        {
          label: 'vers le centre du Sahara',
          why: 'Ces migrations visaient des colonies de peuplement, pas le désert.',
        },
        { label: 'nulle part : ils sont tous restés en Europe', why: 'Des migrations de masse ont bien eu lieu.' },
      ],
      gap: [
        'Au XIXe siècle, des migrations de masse conduisent des ',
        ' vers l’Amérique, l’Australie et l’Afrique du Sud.',
        ['Européens', 'les Européens'],
      ],
      quote: E_XIXE,
      explain: 'Ces migrations expliquent une partie des foyers secondaires d’aujourd’hui.',
      src: EDUSCOL,
    },
  ],
  paires3: [
    ['Asie orientale', 'Asie'],
    ['Golfe de Guinée', 'Afrique'],
    ['Sud-Est brésilien', 'Amérique du Sud'],
  ],
  paires5: [
    ['Foyer principal', 'Asie orientale'],
    ['Foyer secondaire', 'Golfe de Guinée'],
    ['Néolithique', 'Naissance de l’agriculture'],
    ['XIXe siècle', 'Migrations de masse des Européens'],
    ['Vers - 100 000 ans', 'Sortie d’Afrique des premiers hommes'],
  ],
  ordre: [
    'La sortie d’Afrique des premiers hommes (vers - 100 000 ans)',
    'La formation des grands foyers au Néolithique',
    'Les migrations de masse des Européens au XIXe siècle',
    'L’accélération actuelle de l’urbanisation',
  ],
  consigne: {
    prompt: 'Remets ces étapes du peuplement de la Terre dans l’ordre, de la plus ancienne à la plus récente.',
    hint: 'Commence par les débuts de l’humanité.',
    why: 'On range les étapes du peuplement de la plus ancienne à la plus récente.',
    fin: 'La plus ancienne est',
    quote: E_SORTIE,
    src: EDUSCOL,
  },
  libres: [
    {
      q: 'Cite l’un des trois principaux foyers de peuplement du monde.',
      accepted: [
        'Asie orientale',
        'l’Asie orientale',
        'monde indien',
        'le monde indien',
        'Méditerranée-Europe',
        'la Méditerranée-Europe',
      ],
      traps: [
        { text: 'Amérique du Nord', why: 'Le Nord-Est des États-Unis est un foyer secondaire, pas principal.' },
        { text: 'Antarctique', why: 'L’Antarctique est hors de l’écoumène : personne n’y vit en permanence.' },
      ],
      quote: E_TROIS_QUARTS,
      explain: 'Les trois foyers principaux sont l’Asie orientale, le monde indien et la Méditerranée-Europe.',
      src: EDUSCOL,
    },
    {
      q: 'Quel foyer de peuplement secondaire se trouve en Afrique subsaharienne ?',
      accepted: [
        'golfe de Guinée',
        'le golfe de Guinée',
        'Nigéria',
        'le Nigéria',
        'Nigeria',
        'golfe de Guinée et Nigéria',
        'le golfe de Guinée et le Nigéria',
      ],
      traps: [
        { text: 'Sahara', why: 'Le Sahara est un vide humain, pas un foyer de peuplement.' },
        {
          text: 'Maghreb',
          why: 'Le Maghreb est au nord du Sahara : il borde le foyer Méditerranée-Europe.',
        },
      ],
      quote: E_SECONDAIRES,
      explain: 'En Afrique subsaharienne, le foyer secondaire est le golfe de Guinée, avec le Nigéria.',
      src: EDUSCOL,
    },
    {
      q: 'À quelle période de la préhistoire les grands foyers de peuplement se mettent-ils en place ?',
      accepted: ['Néolithique', 'le Néolithique', 'au Néolithique'],
      traps: [
        {
          text: 'Paléolithique',
          why: 'Au Paléolithique, les hommes se diffusent sur la Terre ; les foyers se fixent ensuite.',
        },
        { text: 'Moyen Âge', why: 'Le Moyen Âge est bien plus récent : les foyers existaient déjà.' },
      ],
      quote: E_NEOLITHIQUE,
      explain: 'Les foyers se mettent en place au Néolithique, avec l’agriculture.',
      src: EDUSCOL,
    },
    {
      q: 'Quel phénomène, lié à la naissance de l’agriculture, a fixé les hommes dans les foyers de peuplement ?',
      accepted: ['sédentarisation', 'la sédentarisation'],
      traps: [
        { text: 'nomadisme', why: 'Le nomadisme est l’inverse : se déplacer sans cesse.' },
        { text: 'urbanisation', why: 'L’urbanisation est bien plus récente ; elle concerne les villes.' },
      ],
      quote: E_AGRICULTURE,
      explain: 'Se sédentariser, c’est se fixer en un lieu : l’agriculture le permet.',
      src: EDUSCOL,
    },
  ],
  docs: [
    {
      title: 'Trois grandes taches sur la carte',
      lines: [
        'Sur un planisphère de la population, trois grandes taches très sombres se détachent.',
        'La première couvre l’est de la Chine, la Corée et le Japon.',
        'La deuxième couvre l’Inde et les pays voisins.',
        'La troisième s’étend sur l’Europe et sur les rives de la Méditerranée.',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on les trois grandes taches décrites dans ce texte ?',
          a: 'les trois principaux foyers de peuplement',
          wrong: [
            { label: 'trois foyers secondaires', why: 'Les foyers secondaires sont en Amérique et en Afrique.' },
            { label: 'trois vides humains', why: 'Des taches très sombres montrent au contraire un fort peuplement.' },
          ],
          quote: E_TROIS_QUARTS,
          explain: 'Asie orientale, monde indien et Méditerranée-Europe : ce sont les trois foyers principaux.',
          src: EDUSCOL,
        },
        {
          q: 'Quel foyer de peuplement décrit la ligne 2 ?',
          a: 'l’Asie orientale',
          wrong: [
            { label: 'le monde indien', why: 'Le monde indien est décrit à la ligne 3.' },
            { label: 'la Méditerranée-Europe', why: 'La Méditerranée-Europe est décrite à la ligne 4.' },
          ],
          quote: E_MARGES,
          explain: 'La Chine de l’Est, la Corée et le Japon forment le foyer d’Asie orientale.',
          src: EDUSCOL,
        },
      ],
    },
    {
      title: 'Un peuplement très ancien',
      lines: [
        'Au Néolithique, des groupes humains commencent à cultiver des plantes et à élever des animaux.',
        'Ils ne se déplacent plus sans cesse : ils construisent des villages.',
        'Les récoltes nourrissent plus de monde : la population augmente au même endroit.',
        'Ces régions sont restées très peuplées jusqu’à aujourd’hui.',
      ],
      qs: [
        {
          q: 'Quel phénomène décrit la ligne 2 ?',
          a: 'la sédentarisation',
          wrong: [
            { label: 'le nomadisme', why: 'Le nomadisme, c’est se déplacer sans cesse : c’est l’inverse.' },
            { label: 'la littoralisation', why: 'Le texte ne parle pas des côtes.' },
          ],
          quote: E_AGRICULTURE,
          explain: 'Se fixer dans des villages, c’est se sédentariser.',
          src: EDUSCOL,
        },
        {
          q: 'Que montre la ligne 4 sur les foyers de peuplement ?',
          a: 'leur permanence sur un temps très long',
          wrong: [
            { label: 'leur disparition récente', why: 'La ligne 4 dit qu’ils sont restés très peuplés.' },
            { label: 'leur création au XIXe siècle', why: 'La ligne 1 les fait remonter au Néolithique.' },
          ],
          quote: P_PERMANENCES,
          explain: 'Le programme insiste sur la permanence des grands foyers dans la longue durée.',
        },
      ],
    },
    {
      title: 'Ailleurs dans le monde',
      lines: [
        'En Amérique du Nord, la population se concentre sur la façade atlantique du Nord-Est.',
        'Au Brésil, elle se concentre dans le Sud-Est du pays.',
        'En Afrique, le golfe de Guinée et le Nigéria sont très peuplés.',
        'Ces foyers et le reste du monde rassemblent le dernier quart de l’humanité.',
      ],
      qs: [
        {
          q: 'Quel type de foyers ce texte présente-t-il ?',
          a: 'des foyers secondaires',
          wrong: [
            { label: 'des foyers principaux', why: 'Les foyers principaux sont en Asie et en Europe.' },
            { label: 'des vides humains', why: 'Le texte décrit des espaces très peuplés.' },
          ],
          quote: E_SECONDAIRES,
          explain: 'Amérique et Afrique subsaharienne accueillent des foyers secondaires.',
          src: EDUSCOL,
        },
        {
          q: 'D’après la ligne 4, quelle part de l’humanité vit hors des trois foyers principaux ?',
          a: 'un quart',
          wrong: [
            { label: 'les trois quarts', why: 'Les trois quarts vivent au contraire dans les foyers principaux.' },
            { label: 'la moitié', why: 'La ligne 4 parle du « dernier quart ».' },
          ],
          quote: E_SECONDAIRES,
          explain: 'Trois quarts dans les foyers principaux, un quart ailleurs.',
          src: EDUSCOL,
        },
      ],
    },
  ],
  carte: carteFoyers,
};

// ——— Notion 3 : la densité de population ———

const densite: Notion = {
  classe: '6e',
  id: 'g6-densite',
  title: 'La densité de population',
  hint: 'Densité = nombre d’habitants ÷ surface en km². Le résultat s’écrit en hab./km².',
  memo: [
    'La **densité** de population se calcule en divisant le nombre d’habitants par la surface ; elle s’exprime en habitants par kilomètre carré (hab./km²).',
    'Exemple : 1 000 habitants sur 20 km², c’est 1 000 ÷ 20 = 50 hab./km².',
    'Une densité n’est élevée ou basse que par comparaison. La **densité moyenne** du monde reste faible.',
  ],
  faits: [
    {
      q: 'Comment calcule-t-on la densité de population d’un territoire ?',
      a: 'on divise le nombre d’habitants par la surface',
      wrong: [
        {
          label: 'on additionne les habitants et les kilomètres carrés',
          why: 'On n’additionne pas des habitants et des surfaces : on fait un rapport.',
        },
        {
          label: 'on compte seulement les habitants des villes',
          why: 'La densité concerne tous les habitants du territoire.',
        },
        {
          label: 'on multiplie le nombre d’habitants par la surface',
          why: 'Multiplier donnerait un nombre énorme sans sens : on divise.',
        },
      ],
      gap: ['La densité est le rapport entre un nombre d’habitants et une ', '.', ['surface']],
      choix: ['surface', 'altitude', 'durée'],
      quote: G_RAPPORT,
      explain: 'Un rapport, c’est une division : habitants ÷ surface.',
      src: DENSITE,
    },
    {
      q: 'Dans quelle unité exprime-t-on habituellement la densité de population ?',
      a: 'en habitants par kilomètre carré',
      wrong: [
        { label: 'en kilomètres', why: 'Le kilomètre mesure une distance, pas un peuplement.' },
        { label: 'en habitants par an', why: 'Cette unité mesurerait une évolution dans le temps.' },
        {
          label: 'en kilomètres carrés par habitant',
          why: 'C’est l’inverse : on divise les habitants par la surface.',
        },
      ],
      gap: ['La densité de population s’exprime en habitants par kilomètre ', '.', ['carré']],
      choix: ['carré', 'cube', 'heure'],
      quote: G_UNITE,
      explain: 'On note hab./km² : habitants par kilomètre carré.',
      src: DENSITE,
    },
    {
      q: 'Un territoire de 10 km² compte 2 000 habitants. Quelle est sa densité ?',
      a: '200 hab./km²',
      wrong: [
        { label: '20 hab./km²', why: 'Erreur de calcul : 2 000 ÷ 10 = 200, pas 20.' },
        { label: '20 000 hab./km²', why: 'Tu as multiplié : 2 000 × 10. Il fallait diviser.' },
        { label: '0,005 hab./km²', why: 'Tu as divisé la surface par les habitants : c’est l’inverse.' },
      ],
      gap: ['2 000 habitants sur 10 km² : la densité est de ', ' hab./km².', ['200']],
      quote: G_UNITE,
      explain: '2 000 ÷ 10 = 200 habitants par kilomètre carré.',
      src: DENSITE,
    },
    {
      q: 'Selon la ressource Éduscol de 2016, quelle est la densité moyenne de la population mondiale ?',
      a: '51 hab./km²',
      wrong: [
        {
          label: '5 100 hab./km²',
          why: 'Ce serait une densité de très grande ville : la moyenne mondiale est faible.',
        },
        { label: '1 hab./km²', why: 'C’est trop peu : la moyenne mondiale est de 51 hab./km².' },
        { label: '510 hab./km²', why: 'C’est dix fois trop : la moyenne mondiale reste faible.' },
      ],
      gap: ['Selon Éduscol (2016), la densité moyenne du monde est de ', ' hab./km².', ['51']],
      quote: E_MOYENNE,
      explain: 'La moyenne est faible, mais elle cache de très grands contrastes.',
      src: EDUSCOL,
    },
    {
      q: 'Une densité « élevée » ou « basse » est-elle une valeur fixe, la même partout ?',
      a: 'non : elle se juge selon le type d’espace et l’époque',
      wrong: [
        { label: 'oui : une loi mondiale la fixe', why: 'Aucune loi ne fixe ce qu’est une densité élevée.' },
        {
          label: 'oui : au-dessus de 10 habitants, c’est toujours élevé',
          why: 'Le même chiffre peut paraître élevé à la campagne et bas en ville.',
        },
        { label: 'non : la densité ne se mesure pas', why: 'La densité se mesure : habitants ÷ surface.' },
      ],
      gap: ['La qualification des densités est toujours ', ' à un type d’espace et à une époque.', ['relative']],
      choix: ['relative', 'égale', 'interdite'],
      quote: G_RELATIVE,
      explain: 'On compare toujours une densité à celle d’autres espaces.',
      src: DENSITE,
    },
    {
      q: 'Selon Éduscol, quelle densité aurait-on si 9 milliards d’habitants vivaient sur le territoire des États-Unis ?',
      a: 'celle de l’Île-de-France',
      wrong: [
        { label: 'celle de l’Antarctique', why: 'L’Antarctique n’a aucune population permanente.' },
        { label: 'celle du Sahara', why: 'Le Sahara est un vide humain : sa densité est très basse.' },
        { label: 'une densité nulle', why: 'Avec 9 milliards d’habitants, la densité ne peut pas être nulle.' },
      ],
      gap: [
        'Avec 9 milliards d’habitants sur le territoire des États-Unis, la densité serait celle de l’',
        '.',
        ['Île-de-France'],
      ],
      choix: ['Île-de-France', 'Antarctique', 'Sahara'],
      quote: E_ETATS_UNIS,
      explain: 'Cet exemple montre que le monde, dans son ensemble, n’est pas surpeuplé.',
      src: EDUSCOL,
    },
  ],
  paires3: [
    ['Densité', 'Nombre d’habitants par km²'],
    ['Densité élevée', 'Beaucoup d’habitants sur peu d’espace'],
    ['Densité basse', 'Peu d’habitants sur beaucoup d’espace'],
  ],
  paires5: [
    ['100 habitants sur 4 km²', '25 hab./km²'],
    ['300 habitants sur 3 km²', '100 hab./km²'],
    ['1 000 habitants sur 2 km²', '500 hab./km²'],
    ['60 habitants sur 6 km²', '10 hab./km²'],
    ['4 000 habitants sur 1 km²', '4 000 hab./km²'],
  ],
  ordre: [
    'Territoire A : 50 habitants sur 10 km²',
    'Territoire B : 600 habitants sur 20 km²',
    'Territoire C : 1 000 habitants sur 5 km²',
    'Territoire D : 9 000 habitants sur 10 km²',
  ],
  consigne: {
    prompt: 'Range ces territoires de la densité la plus basse à la plus élevée.',
    hint: 'Calcule d’abord chaque densité : habitants ÷ km².',
    why: 'On calcule chaque densité : A = 5, B = 30, C = 200, D = 900 hab./km².',
    fin: 'La densité la plus basse est celle du',
    quote: G_UNITE,
    src: DENSITE,
  },
  libres: [
    {
      q: 'Calcule la densité d’un territoire de 50 km² peuplé de 5 000 habitants (nombre seul, en hab./km²).',
      accepted: ['100', '100 hab./km²', '100 habitants par km²'],
      traps: [
        { text: '250000', why: 'Tu as multiplié 5 000 par 50 : il fallait diviser.' },
        { text: '0,01', why: 'Tu as divisé la surface par les habitants : c’est l’inverse.' },
      ],
      quote: G_UNITE,
      explain: '5 000 ÷ 50 = 100 hab./km².',
      src: DENSITE,
    },
    {
      q: 'Quelle opération fait-on pour obtenir une densité : addition, soustraction, multiplication ou division ?',
      accepted: ['division', 'une division', 'la division'],
      traps: [
        { text: 'multiplication', why: 'Multiplier habitants et surface ne donne pas une densité.' },
        { text: 'addition', why: 'On n’additionne pas des habitants et des kilomètres carrés.' },
      ],
      quote: G_RAPPORT,
      explain: 'La densité est un rapport : on divise le nombre d’habitants par la surface.',
      src: DENSITE,
    },
    {
      q: 'Un territoire compte 3 000 habitants et sa densité est de 30 hab./km². Quelle est sa surface (nombre seul, en km²) ?',
      accepted: ['100', '100 km²'],
      traps: [
        { text: '90000', why: 'Tu as multiplié 3 000 par 30 : il fallait diviser.' },
        { text: '10', why: 'Vérifie : 3 000 ÷ 10 = 300, pas 30. La surface est 3 000 ÷ 30.' },
      ],
      quote: G_UNITE,
      explain: 'Si densité = habitants ÷ surface, alors surface = habitants ÷ densité : 3 000 ÷ 30 = 100 km².',
      src: DENSITE,
    },
    {
      q: 'Quel mot désigne le nombre d’habitants par kilomètre carré ?',
      accepted: ['densité', 'la densité', 'densité de population', 'la densité de population', 'densité démographique'],
      traps: [
        { text: 'population', why: 'La population est le nombre d’habitants, sans tenir compte de la surface.' },
        { text: 'superficie', why: 'La superficie est la surface du territoire, sans les habitants.' },
      ],
      quote: G_UNITE,
      explain: 'La densité met en rapport les habitants et la surface.',
      src: DENSITE,
    },
  ],
  docs: [
    {
      title: 'Deux îles',
      lines: [
        'L’île A mesure 100 km² et compte 20 000 habitants.',
        'L’île B mesure 1 000 km² et compte aussi 20 000 habitants.',
        'Les deux îles ont donc le même nombre d’habitants.',
        'Pourtant, en se promenant, on croise beaucoup plus de monde sur l’île A.',
      ],
      qs: [
        {
          q: 'Quelle est la densité de l’île A ?',
          a: '200 hab./km²',
          wrong: [
            { label: '20 hab./km²', why: '20 hab./km², c’est la densité de l’île B : 20 000 ÷ 1 000.' },
            { label: '2 000 000 hab./km²', why: 'Tu as multiplié 20 000 par 100 : il fallait diviser.' },
          ],
          quote: G_UNITE,
          explain: 'Ligne 1 : 20 000 ÷ 100 = 200 hab./km².',
          src: DENSITE,
        },
        {
          q: 'Quelle île a la densité la plus élevée ?',
          a: 'l’île A',
          wrong: [
            { label: 'l’île B', why: 'L’île B est dix fois plus grande pour le même nombre d’habitants.' },
            {
              label: 'les deux îles ont la même densité',
              why: 'Même nombre d’habitants, mais pas la même surface : les densités diffèrent.',
            },
          ],
          quote: G_UNITE,
          explain: 'Île A : 200 hab./km² ; île B : 20 hab./km².',
          src: DENSITE,
        },
      ],
    },
    {
      title: 'Une Terre trop pleine ?',
      lines: [
        'Un article affirme : « La Terre est pleine, il n’y a plus de place ! »',
        'Une géographe répond que la densité moyenne du monde reste faible.',
        'Elle ajoute que les habitants sont surtout regroupés dans quelques foyers.',
        'De très vastes espaces restent peu peuplés.',
      ],
      qs: [
        {
          q: 'Que répond la géographe à l’idée d’une Terre pleine ?',
          a: 'le monde reste dans son ensemble faiblement peuplé',
          wrong: [
            { label: 'la Terre est partout surpeuplée', why: 'Ligne 2 : la densité moyenne reste faible.' },
            { label: 'personne n’habite la Terre', why: 'Ligne 3 : les habitants sont regroupés dans des foyers.' },
          ],
          quote: E_FAIBLEMENT,
          explain: 'L’idée d’une Terre surpeuplée est une idée reçue.',
          src: EDUSCOL,
        },
        {
          q: 'Pourquoi peut-on avoir l’impression d’une Terre très peuplée ?',
          a: 'parce que les habitants sont regroupés dans quelques foyers très denses',
          wrong: [
            {
              label: 'parce que chaque kilomètre carré est occupé',
              why: 'Ligne 4 : de vastes espaces restent peu peuplés.',
            },
            { label: 'parce que la Terre rétrécit', why: 'La surface de la Terre ne change pas.' },
          ],
          quote: E_MOYENNE,
          explain: 'Une moyenne faible cache de grands contrastes : certains foyers sont très denses.',
          src: EDUSCOL,
        },
      ],
    },
    {
      title: 'Deux villages',
      lines: [
        'Une professeure présente deux villages de même surface : 10 km² chacun.',
        'Le premier compte 300 habitants ; le second en compte 3 000.',
        'Elle explique qu’une densité se juge toujours par comparaison.',
        'Au cœur d’une grande métropole, une densité de 300 hab./km² paraîtrait très basse.',
      ],
      qs: [
        {
          q: 'Quelle est la densité du second village ?',
          a: '300 hab./km²',
          wrong: [
            { label: '30 hab./km²', why: '30 hab./km², c’est la densité du premier village : 300 ÷ 10.' },
            { label: '30 000 hab./km²', why: 'Tu as multiplié 3 000 par 10 : il fallait diviser.' },
          ],
          quote: G_UNITE,
          explain: '3 000 ÷ 10 = 300 hab./km².',
          src: DENSITE,
        },
        {
          q: 'Selon la professeure, comment juge-t-on si une densité est élevée ?',
          a: 'en la comparant à celle d’autres espaces',
          wrong: [
            {
              label: 'en la comparant toujours au même chiffre fixe',
              why: 'Ligne 4 : 300 hab./km² est élevé ici, bas là.',
            },
            { label: 'en comptant seulement les maisons', why: 'La densité de population compte les habitants.' },
          ],
          quote: G_RELATIVE,
          explain: 'Une densité est toujours relative à un type d’espace.',
          src: DENSITE,
        },
      ],
    },
  ],
};

// ——— Notion 4 : le vocabulaire du monde habité ———

const vocabulaire: Notion = {
  classe: '6e',
  id: 'g6-vocabulaire-monde-habite',
  title: 'Le vocabulaire du monde habité',
  hint: 'Relie chaque mot à ce qu’il décrit : la répartition, l’espace habité, la forme de l’habitat.',
  memo: [
    'Le **peuplement** est la répartition de la population sur un espace ; on le mesure avec la densité.',
    'L’écoumène est l’espace habité ; une **mégalopole** est un vaste réseau de grandes villes reliées entre elles.',
    'L’habitat peut être **groupé** (maisons rassemblées en village) ou **dispersé** (fermes isolées les unes des autres).',
  ],
  faits: [
    {
      q: 'Que désigne le peuplement en géographie ?',
      a: 'la répartition de la population sur un espace',
      wrong: [
        { label: 'la hauteur des montagnes', why: 'La hauteur des montagnes relève du relief.' },
        { label: 'la liste des pays du monde', why: 'Une liste de pays ne dit pas où vivent les habitants.' },
        {
          label: 'le nombre de naissances dans une année',
          why: 'C’est une donnée démographique : le peuplement, lui, regarde la répartition sur l’espace.',
        },
      ],
      gap: ['Le peuplement désigne la ', ' de la population sur un espace.', ['répartition']],
      choix: ['répartition', 'naissance', 'richesse'],
      quote: G_PEUPLEMENT,
      explain: 'Étudier le peuplement, c’est regarder où vivent les hommes et pourquoi.',
      src: PEUPLEMENT,
    },
    {
      q: 'Que désigne l’écoumène ?',
      a: 'l’ensemble des espaces terrestres habités par l’humanité',
      wrong: [
        {
          label: 'une grande ville très peuplée',
          why: 'Une grande ville est une partie de l’écoumène, pas l’écoumène.',
        },
        { label: 'un espace interdit aux hommes', why: 'C’est l’inverse : l’écoumène est l’espace habité.' },
        { label: 'l’ensemble des océans', why: 'L’écoumène désigne des espaces terrestres habités.' },
      ],
      gap: ['L’écoumène est l’ensemble des espaces terrestres ', ' par l’humanité.', ['habités']],
      choix: ['habités', 'interdits', 'inondés'],
      quote: G_ECOUMENE,
      explain: 'Le mot vient du grec : il désigne le monde habité.',
      src: ECOUMENE,
    },
    {
      q: 'Comment appelle-t-on un réseau de villes à vaste échelle, reliées par de nombreux axes de transport ?',
      a: 'une mégalopole',
      wrong: [
        { label: 'une oasis', why: 'Une oasis est un lieu habité au milieu d’un désert.' },
        { label: 'un vide humain', why: 'Un vide humain est un espace très peu peuplé.' },
        { label: 'un village', why: 'Un village est une petite agglomération, pas un réseau de grandes villes.' },
      ],
      gap: ['Une ', ' est un réseau de villes à vaste échelle.', ['mégalopole']],
      choix: ['mégalopole', 'oasis', 'commune'],
      quote: G_MEGALOPOLE,
      explain: 'Exemple : la mégalopole du Nord-Est des États-Unis, de Boston à Washington.',
      src: MEGALOPOLE,
    },
    {
      q: 'Quelles formes de peuplement la ressource Éduscol demande-t-elle de distinguer ?',
      a: 'continu ou discontinu, dispersé ou groupé',
      wrong: [
        { label: 'chaud ou froid', why: 'Chaud ou froid décrit un climat, pas une forme de peuplement.' },
        { label: 'riche ou pauvre', why: 'Ce sont des niveaux de richesse, pas des formes de peuplement.' },
        { label: 'haut ou bas', why: 'Haut ou bas décrit une altitude, pas une forme de peuplement.' },
      ],
      gap: ['Un peuplement peut être continu ou discontinu, dispersé ou ', '.', ['groupé']],
      choix: ['groupé', 'salé', 'pentu'],
      quote: E_FORMES,
      explain: 'Ces mots décrivent la façon dont les habitations occupent l’espace.',
      src: EDUSCOL,
    },
    {
      q: 'Comment appelle-t-on un espace très peu peuplé, souvent aux marges de l’écoumène ?',
      a: 'un vide humain',
      wrong: [
        { label: 'un foyer de peuplement', why: 'Un foyer est au contraire un espace très peuplé.' },
        { label: 'une mégalopole', why: 'Une mégalopole est un vaste réseau de grandes villes.' },
        { label: 'une métropole', why: 'Une métropole est une très grande ville.' },
      ],
      gap: ['Un espace très peu peuplé est appelé un ', ' humain.', ['vide']],
      choix: ['vide', 'foyer', 'réseau'],
      quote: E_VIDES,
      explain: 'On met souvent « vide » entre guillemets : ces espaces ne sont jamais totalement vides.',
      src: EDUSCOL,
    },
    {
      q: 'Comment appelle-t-on la disposition des habitations rassemblées dans un village ?',
      a: 'un habitat groupé',
      wrong: [
        { label: 'un habitat dispersé', why: 'Un habitat dispersé, ce sont des maisons isolées les unes des autres.' },
        { label: 'un vide humain', why: 'Un vide humain est un espace très peu peuplé, pas une forme d’habitat.' },
        { label: 'un écoumène', why: 'L’écoumène est l’ensemble des espaces habités de la Terre.' },
      ],
      gap: ['Des maisons rassemblées dans un village forment un habitat ', '.', ['groupé']],
      choix: ['groupé', 'dispersé', 'vide'],
      quote: G_HABITAT,
      explain: 'Les géographes étudient la disposition des habitations : groupée ou dispersée.',
      src: HABITAT,
    },
  ],
  paires3: [
    ['Peuplement', 'Répartition de la population'],
    ['Écoumène', 'Espace habité par l’humanité'],
    ['Mégalopole', 'Réseau de grandes villes reliées'],
  ],
  paires5: [
    ['Habitat groupé', 'Maisons rassemblées en village'],
    ['Habitat dispersé', 'Fermes isolées dans la campagne'],
    ['Foyer de peuplement', 'Espace où la population se concentre'],
    ['Vide humain', 'Espace très peu peuplé'],
    ['Densité', 'Nombre d’habitants par km²'],
  ],
  libres: [
    {
      q: 'Quel mot désigne l’ensemble des espaces terrestres habités par l’humanité ?',
      accepted: ['écoumène', 'l’écoumène', 'œkoumène', 'l’œkoumène', 'oekoumène'],
      traps: [
        { text: 'peuplement', why: 'Le peuplement est la répartition de la population, pas l’espace habité lui-même.' },
        { text: 'continent', why: 'Un continent est une grande masse de terre, habitée ou non.' },
      ],
      quote: G_ECOUMENE,
      explain: 'L’écoumène, parfois écrit œkoumène, est l’espace habité.',
      src: ECOUMENE,
    },
    {
      q: 'Quel nom donne-t-on au réseau urbain qui s’étend de Boston à Washington ?',
      accepted: ['mégalopole', 'la mégalopole', 'une mégalopole', 'Megalopolis', 'la Megalopolis', 'BosWash'],
      traps: [
        { text: 'métropole', why: 'Une métropole est une seule grande ville ; ici, c’est un réseau de villes.' },
        { text: 'banlieue', why: 'Une banlieue entoure une ville ; elle ne relie pas plusieurs grandes villes.' },
      ],
      quote: G_BOSWASH,
      explain: 'Le géographe Jean Gottmann a nommé ce réseau la Megalopolis : une mégalopole.',
      src: MEGALOPOLE,
    },
    {
      q: 'Quel mot désigne la répartition de la population sur un espace ?',
      accepted: ['peuplement', 'le peuplement'],
      traps: [
        { text: 'population', why: 'La population est l’ensemble des habitants ; le peuplement est leur répartition.' },
        { text: 'densité', why: 'La densité mesure le peuplement, mais ne le désigne pas.' },
      ],
      quote: G_PEUPLEMENT,
      explain: 'Géoconfluences précise : « le peuplement (la répartition de la population) ».',
      src: PEUPLEMENT,
    },
    {
      q: 'Des fermes isolées les unes des autres forment un habitat de quel type ?',
      accepted: ['dispersé', 'habitat dispersé', 'un habitat dispersé'],
      traps: [
        { text: 'groupé', why: 'L’habitat groupé rassemble les maisons dans un village.' },
        { text: 'continu', why: 'Continu décrit un espace habité sans coupure, pas des fermes isolées.' },
      ],
      quote: G_HABITAT,
      explain: 'Des habitations éloignées les unes des autres forment un habitat dispersé.',
      src: HABITAT,
    },
  ],
  docs: [
    {
      title: 'Carnet de voyage',
      lines: [
        'Le matin, nous traversons une campagne où les fermes sont isolées, loin les unes des autres.',
        'À midi, nous arrivons dans un village : les maisons sont serrées autour de l’église.',
        'Le soir, nous longeons la côte des États-Unis : de Boston à Washington, les villes se suivent.',
        'Des autoroutes et des voies ferrées relient toutes ces grandes villes.',
      ],
      qs: [
        {
          q: 'Quel type d’habitat décrit la ligne 1 ?',
          a: 'un habitat dispersé',
          wrong: [
            { label: 'un habitat groupé', why: 'Les fermes sont isolées : l’habitat n’est pas groupé.' },
            { label: 'une mégalopole', why: 'La ligne 1 décrit une campagne, pas un réseau de grandes villes.' },
          ],
          quote: G_HABITAT,
          explain: 'Des fermes isolées : c’est un habitat dispersé.',
          src: HABITAT,
        },
        {
          q: 'Quel ensemble urbain décrivent les lignes 3 et 4 ?',
          a: 'une mégalopole',
          wrong: [
            { label: 'un vide humain', why: 'Les villes se suivent : l’espace est très peuplé.' },
            { label: 'une oasis', why: 'Une oasis est un lieu habité dans un désert.' },
          ],
          quote: G_BOSWASH,
          explain: 'De Boston à Washington, les villes reliées forment la mégalopole du Nord-Est des États-Unis.',
          src: MEGALOPOLE,
        },
      ],
    },
    {
      title: 'Où vivent les hommes ?',
      lines: [
        'Les géographes étudient où vivent les hommes et pourquoi ils vivent là.',
        'Ils constatent que l’occupation de l’espace est d’intensité très inégale.',
        'Ils cherchent les explications, dont une partie seulement vient de l’histoire.',
        'Ils mesurent aussi le nombre d’habitants par kilomètre carré.',
      ],
      qs: [
        {
          q: 'Quel mot du vocabulaire désigne ce qu’étudient les géographes aux lignes 1 et 2 ?',
          a: 'le peuplement',
          wrong: [
            { label: 'le relief', why: 'Le relief désigne les formes du terrain, pas la répartition des hommes.' },
            { label: 'le climat', why: 'Le climat désigne le temps qu’il fait en moyenne, pas la répartition.' },
          ],
          quote: G_INEGALE,
          explain: 'Étudier où vivent les hommes et l’intensité de l’occupation, c’est étudier le peuplement.',
          src: PEUPLEMENT,
        },
        {
          q: 'Quel indicateur décrit la ligne 4 ?',
          a: 'la densité de population',
          wrong: [
            { label: 'la superficie', why: 'La superficie mesure la surface seule, sans les habitants.' },
            { label: 'la population totale', why: 'La population totale ne tient pas compte de la surface.' },
          ],
          quote: G_UNITE,
          explain: 'Le nombre d’habitants par kilomètre carré, c’est la densité.',
          src: DENSITE,
        },
      ],
    },
    {
      title: 'Un thème central',
      lines: [
        'Pour les géographes, le peuplement est un processus d’occupation de l’espace par les hommes.',
        'L’écoumène, l’espace habité, couvre aujourd’hui presque toute la Terre.',
        'Certains espaces restent très peu peuplés, aux marges de l’écoumène.',
        'Les géographes évitent pourtant de les dire « totalement vides ».',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on les espaces décrits à la ligne 3 ?',
          a: 'des vides humains',
          wrong: [
            { label: 'des foyers de peuplement', why: 'Les foyers sont au contraire très peuplés.' },
            { label: 'des mégalopoles', why: 'Une mégalopole est un réseau de grandes villes.' },
          ],
          quote: E_MARGES_ECOUMENE,
          explain: 'Des espaces très peu peuplés, aux marges de l’écoumène : ce sont des vides humains.',
          src: EDUSCOL,
        },
        {
          q: 'Pourquoi les géographes évitent-ils de dire ces espaces « totalement vides » (ligne 4) ?',
          a: 'parce que l’ensemble du monde est habité, même faiblement',
          wrong: [
            { label: 'parce que ces espaces sont très peuplés', why: 'Ligne 3 : ils restent très peu peuplés.' },
            { label: 'parce que ces espaces n’existent pas', why: 'Ces espaces existent : le Sahara, le Grand Nord…' },
          ],
          quote: E_TOTALEMENT,
          explain: 'Même très peu peuplés, ces espaces accueillent des habitants : le monde entier est habité.',
          src: EDUSCOL,
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [repartition, foyers, densite, vocabulaire];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n));
