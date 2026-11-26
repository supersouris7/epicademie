import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import {
  associer,
  choisir,
  completer,
  ecart,
  ecrire,
  generer,
  ranger,
  surDocument,
  type Modele,
} from './nutrition-kit.ts';

// ——— Le corps en activité : le devenir des aliments dans le tube digestif (digestion et absorption) ———

const NIVEAU1: readonly Modele[] = [
  choisir(
    'Quel liquide, sécrété dans la bouche, participe au début de la digestion ?',
    'La salive',
    [
      ['La bile', 'La bile se déverse dans l’intestin, pas dans la bouche.'],
      ['Le sang', 'Le sang circule dans les vaisseaux : il n’est pas un liquide de la digestion buccale.'],
    ],
    'Il humecte la bouche.',
    'La salive humecte la bouche et sert à la digestion buccale.',
  ),
  choisir(
    'Dans quel organe en forme de poche les aliments sont-ils brassés ?',
    'L’estomac',
    [
      ['L’œsophage', 'L’œsophage conduit les aliments vers l’estomac.'],
      ['Les poumons', 'Les poumons appartiennent à l’appareil respiratoire.'],
    ],
    'Il se situe après l’œsophage.',
    'Dans l’estomac, les aliments sont brassés et transformés en bouillie.',
  ),
  choisir(
    'Que deviennent les aliments au cours de la digestion ?',
    'Ils sont transformés en nutriments',
    [
      ['Ils passent entiers dans le sang', 'Ils doivent d’abord être transformés.'],
      ['Ils sont changés en air', 'La digestion ne produit pas d’air : elle donne des nutriments.'],
    ],
    'Cherche les petites substances assimilables par le corps.',
    'La digestion transforme les aliments en nutriments.',
  ),
  choisir(
    'Que font les dents sur les aliments ?',
    'Elles les broient',
    [
      ['Elles les absorbent', 'L’absorption est le passage vers le sang : elle a lieu dans l’intestin.'],
      ['Elles les transportent jusqu’à l’estomac', 'C’est l’œsophage qui conduit les aliments à l’estomac.'],
    ],
    'La mastication est une action mécanique.',
    'Mastiquer, c’est broyer les aliments avec les dents pour les avaler et les digérer.',
  ),
];

const NIVEAU2: readonly Modele[] = [
  choisir(
    'Au niveau de quelle partie du tube digestif les nutriments passent-ils dans le sang ?',
    'L’intestin grêle',
    [
      ['L’estomac', 'L’estomac brasse les aliments en bouillie : le passage cherché se fait plus loin.'],
      ['L’œsophage', 'L’œsophage ne fait que conduire les aliments.'],
      ['La bouche', 'La bouche broie et humecte les aliments.'],
    ],
    'Cet organe vient après l’estomac.',
    'Les nutriments passent dans le sang au niveau de l’intestin grêle.',
  ),
  choisir(
    'Quel conduit mène les aliments du pharynx à l’estomac ?',
    'L’œsophage',
    [
      ['La trachée', 'La trachée conduit l’air vers les bronches.'],
      ['L’intestin grêle', 'Il vient après l’estomac.'],
      ['Une artère', 'Une artère transporte du sang.'],
    ],
    'On le traverse juste après avoir avalé.',
    'L’œsophage conduit les aliments dans l’estomac après la déglutition.',
  ),
  choisir(
    'La digestion est un ensemble de transformations subies par les aliments. De quels ordres sont-elles ?',
    'Mécaniques et chimiques',
    [
      ['Seulement mécaniques', 'Broyer ne suffit pas : des transformations chimiques ont aussi lieu.'],
      ['Seulement chimiques', 'La mastication et le brassage sont des actions mécaniques.'],
      ['Seulement électriques', 'La digestion n’est pas un phénomène électrique.'],
    ],
    'Pense aux dents, puis aux liquides digestifs.',
    'La digestion associe des actions mécaniques et chimiques.',
  ),
  associer(
    'Associe chaque élément à son action',
    [
      ['Les dents', 'broient les aliments'],
      ['La salive', 'humecte la bouche et participe à la digestion buccale'],
      ['L’estomac', 'brasse les aliments et les change en bouillie'],
    ],
    'Pense à ce qui se passe dans la bouche, puis après.',
    'Chaque élément intervient à une étape différente de la digestion.',
  ),
];

const NIVEAU3: readonly Modele[] = [
  ranger(
    'Range dans l’ordre le trajet des aliments dans le tube digestif.',
    ['bouche', 'œsophage', 'estomac', 'intestin grêle', 'gros intestin'],
    'Suis le chemin depuis le moment où tu mâches.',
    'Le tube digestif va de la bouche au gros intestin, sa dernière partie.',
  ),
  completer(
    'Complète la définition.',
    ['La ', ' transforme les aliments en ', ', que le corps peut utiliser.'],
    [['digestion'], ['nutriments', 'nutriment']],
    'Le premier mot désigne le phénomène, le second ce qui en sort.',
    'La digestion donne des nutriments.',
  ),
  ecrire(
    'Écris le nom du passage des produits de la digestion de l’intestin vers le sang.',
    ['absorption', 'l’absorption', 'absorption intestinale', "l'absorption"],
    [
      ['digestion', 'La digestion transforme les aliments ; on cherche le passage vers le sang.'],
      ['respiration', 'La respiration concerne les échanges de gaz.'],
    ],
    'Le mot commence par « ab ».',
    'L’absorption est le passage dans le sang des produits de la digestion.',
  ),
  ecrire(
    'Écris le nom du segment du tube digestif au niveau duquel les nutriments passent dans le sang.',
    ['intestin grêle', 'l’intestin grêle', "l'intestin grêle", 'intestin grele'],
    [
      [
        'gros intestin',
        'Le gros intestin est la dernière partie du tube digestif ; cherche le segment qui le précède.',
      ],
      ['estomac', 'L’estomac brasse les aliments : le passage des nutriments dans le sang se fait plus loin.'],
    ],
    'Il s’étend de la sortie de l’estomac au gros intestin.',
    'L’intestin grêle absorbe les produits de la digestion.',
  ),
];

const NIVEAU4: readonly Modele[] = [
  associer(
    'Associe chaque organe à sa description',
    [
      ['Le foie', 'sécrète la bile'],
      ['Le pancréas', 'déverse des enzymes digestives dans l’intestin grêle'],
      ['L’œsophage', 'conduit les aliments vers l’estomac'],
      ['L’estomac', 'brasse les aliments en forme de poche'],
      ['Le gros intestin', 'dernière partie du tube digestif'],
    ],
    'Sépare les glandes qui déversent des liquides des segments du tube.',
    'Certains organes sont des segments du tube, d’autres déversent des liquides dans celui-ci.',
  ),
  choisir(
    'Quel organe sécrète la bile, déversée dans l’intestin au moment de la digestion ?',
    'Le foie',
    [
      ['L’estomac', 'L’estomac brasse les aliments : la bile ne vient pas de lui.'],
      ['Les glandes salivaires', 'Elles produisent la salive.'],
      ['Le cœur', 'Le cœur propulse le sang.'],
    ],
    'La bile s’accumule dans une vésicule rattachée à cet organe.',
    'La bile est sécrétée par le foie.',
  ),
  ecrire(
    'Écris le nom des minuscules saillies de la paroi de l’intestin grêle qui contiennent des capillaires sanguins.',
    ['villosités', 'les villosités', 'villosité', 'villosités intestinales', 'villosites'],
    [
      ['alvéoles', 'Les alvéoles sont dans les poumons.'],
      ['capillaires', 'Les capillaires sont à l’intérieur des saillies cherchées.'],
    ],
    'Le mot évoque un aspect velu ou velouté.',
    'Les villosités intestinales contiennent un réseau de capillaires sanguins.',
  ),
  ecrire(
    'Écris le nom des matières éliminées par l’organisme à la fin du trajet des aliments (au pluriel).',
    ['excréments', 'les excréments', 'matières fécales', 'les matières fécales', 'excrements'],
    [
      ['nutriments', 'Les nutriments passent dans le sang : on cherche ce qui est éliminé.'],
      ['bile', 'La bile est un liquide qui sert à la digestion.'],
    ],
    'Cherche le mot désignant ce que le corps rejette.',
    'Les excréments sont les matières éliminées par l’organisme.',
  ),
];

const glucose = (rng: Parameters<Modele>[0]) => {
  const entree = rng.int(8, 10);
  const sortie = entree + rng.int(3, 6);
  const repas = rng.pick(['du pain', 'des pâtes', 'des fruits', 'du riz']);
  return {
    entree,
    sortie,
    lines: [
      `Après un repas contenant ${repas}, on mesure le glucose du sang (unité du capteur).`,
      `Sang qui arrive à la paroi de l’intestin grêle : glucose ${entree}.`,
      `Sang qui repart de la paroi de l’intestin grêle : glucose ${sortie}.`,
    ],
    releve: `Après un repas avec ${repas}, glucose du sang : ${entree} à l’arrivée à l’intestin grêle, ${sortie} au départ.`,
  };
};

const NIVEAU5: readonly Modele[] = [
  (rng) => {
    const g = glucose(rng);
    return surDocument(
      'Glucose du sang et intestin',
      g.lines,
      ecart(
        `${g.releve} De combien d’unités le glucose augmente-t-il au passage dans la paroi de l’intestin ?`,
        g.sortie,
        g.entree,
        'Compare la valeur de départ et la valeur d’arrivée.',
        'On retire la valeur d’arrivée à la paroi de la valeur au départ.',
      ),
    );
  },
  (rng) => {
    const g = glucose(rng);
    return surDocument(
      'Glucose du sang et intestin',
      g.lines,
      choisir(
        `${g.releve} Quel phénomène cette mesure met-elle en évidence ?`,
        'L’absorption du glucose',
        [
          [
            'La respiration pulmonaire',
            'La mesure porte sur le glucose et sur l’intestin, pas sur des gaz et les poumons.',
          ],
          ['La mastication', 'La mastication broie les aliments dans la bouche.'],
          ['La fabrication de glucose par le sang', 'Le sang transporte le glucose venu de la digestion.'],
        ],
        'Le sang repart avec plus de glucose qu’à son arrivée.',
        'Le glucose, un nutriment issu de la digestion, passe de l’intestin dans le sang.',
      )(rng),
    );
  },
  (rng) => {
    const g = glucose(rng);
    return surDocument(
      'Glucose du sang et intestin',
      g.lines,
      choisir(
        `${g.releve} Par quelles structures de la paroi le glucose passe-t-il dans le sang ?`,
        'Les villosités et leurs capillaires sanguins',
        [
          ['Les alvéoles et leurs capillaires', 'Les alvéoles sont dans les poumons.'],
          ['Les dents de la paroi intestinale', 'Il n’y a pas de dents dans l’intestin.'],
          ['La trachée et les bronches', 'Ce sont des conduits d’air.'],
        ],
        'Cherche les minuscules saillies de la paroi de l’intestin.',
        'Les villosités contiennent un réseau de capillaires sanguins, où passe le glucose.',
      )(rng),
    );
  },
];

export const digestionAliments: Skill = {
  id: 'v5-digestion',
  title: 'La digestion et l’absorption',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Dans le **tube digestif**, la **digestion** transforme les aliments (broyage et réactions chimiques) en **nutriments**.',
      'Au niveau de l’**intestin grêle**, les nutriments passent dans le sang : c’est l’**absorption**. La paroi y porte des **villosités** riches en capillaires.',
    ],
    source:
      'Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Système digestif, digestion, absorption ; aliments et nutriments. »',
    sources: [
      PROGRAMME,
      'bo-svt-college-2008',
      'cnrtl-digestion',
      'cnrtl-mastication',
      'cnrtl-salive',
      'cnrtl-oesophage',
      'cnrtl-estomac',
      'cnrtl-intestin',
      'cnrtl-chyle',
      'academie-nutriment',
      'academie-absorption',
      'cnrtl-villosite',
      'academie-bile',
      'academie-pancreas',
      'academie-excrement',
    ],
  },
  generate: generer([NIVEAU1, NIVEAU2, NIVEAU3, NIVEAU4, NIVEAU5]),
};
