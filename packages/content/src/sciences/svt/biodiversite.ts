import { num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { associer, choisir, completer, ecrire, generer, surDocument, type Modele } from './nutrition-kit.ts';

// ——— Biodiversité : trois niveaux, espèce, menaces, espèces exotiques envahissantes ———

const NIVEAU1: readonly Modele[] = [
  choisir(
    'Que désigne la biodiversité ?',
    'La diversité des milieux de vie et des êtres vivants, avec leurs interactions',
    [
      ['La quantité de pluie tombée dans un lieu', 'La pluie concerne la météo, pas le vivant.'],
      ['Le nombre de rochers d’un paysage', 'La biodiversité concerne le vivant et ses milieux.'],
    ],
    'Le mot réunit « biologique » et « diversité ».',
    'La biodiversité recouvre les milieux naturels, les formes de vie et leurs interactions.',
  ),
  choisir(
    'L’espèce humaine fait-elle partie de la biodiversité ?',
    'Oui, elle est l’une des espèces',
    [
      [
        'Non, la biodiversité ne concerne que les animaux sauvages',
        'La diversité des espèces inclut l’espèce humaine.',
      ],
      ['Non, elle ne concerne que les plantes', 'La biodiversité comprend toutes les formes de vie.'],
    ],
    'Les êtres humains sont des êtres vivants.',
    'La diversité des espèces inclut l’espèce humaine.',
  ),
  choisir(
    'Lequel fait partie de la biodiversité ?',
    'Les bactéries du sol',
    [
      ['Un caillou', 'Un caillou n’est pas une forme de vie.'],
      ['Le vent', 'Le vent n’est pas un être vivant.'],
    ],
    'Cherche un être vivant.',
    'Les bactéries sont des formes de vie, au même titre que plantes et animaux.',
  ),
  choisir(
    'Que peut faire une pollution de l’eau pour la biodiversité ?',
    'La menacer',
    [
      ['La créer à partir de rien', 'Une pollution ne crée pas les êtres vivants.'],
      ['La protéger toujours', 'La pollution est une cause de dégradation.'],
    ],
    'Demande-toi ce que devient un milieu de vie pollué.',
    'Les pollutions de l’eau, des sols et de l’air font partie des causes d’érosion.',
  ),
];

const NIVEAU2: readonly Modele[] = [
  choisir(
    'Deux coquelicots d’une même prairie n’ont pas exactement les mêmes caractères. De quel niveau de biodiversité s’agit-il ?',
    'La diversité génétique des individus d’une espèce',
    [
      ['La diversité des milieux de vie', 'Ce niveau compare des milieux, comme mer et forêt.'],
      ['La diversité des espèces', 'Les deux coquelicots appartiennent à la même espèce.'],
      ['La diversité des climats', 'Le climat n’est pas un niveau de biodiversité.'],
    ],
    'On compare deux individus de la même espèce.',
    'La diversité génétique concerne les individus au sein de chaque espèce.',
  ),
  choisir(
    'Une région compte une forêt, une mare et une prairie. De quel niveau de biodiversité parle-t-on ?',
    'La diversité des milieux de vie',
    [
      ['La diversité des espèces', 'Les trois lieux cités sont des milieux, pas des espèces.'],
      ['La diversité génétique', 'Elle compare des individus d’une même espèce.'],
      ['La diversité des saisons', 'Les saisons ne sont pas un niveau de biodiversité.'],
    ],
    'Les trois éléments sont des lieux.',
    'La diversité des milieux de vie est un niveau de la biodiversité.',
  ),
  choisir(
    'Qu’est-ce qu’une espèce endémique ?',
    'Une espèce dont l’aire de répartition est limitée à un territoire',
    [
      ['Une espèce présente partout sur la Terre', 'C’est le contraire : son aire est limitée.'],
      ['Une espèce introduite par l’être humain', 'Une espèce introduite vient d’ailleurs.'],
      ['Une espèce qui a disparu', 'Endémique n’indique pas la disparition.'],
    ],
    'Pense à une plante qui ne vit que sur une île.',
    'Endémique : dont l’aire de répartition est limitée à un territoire.',
  ),
  choisir(
    'Une espèce animale introduite par l’être humain s’étend et menace les espèces locales. Comment la qualifie-t-on ?',
    'Exotique envahissante',
    [
      ['Endémique', 'Une espèce endémique a une aire limitée à son territoire d’origine.'],
      ['Locale', 'Elle vient d’un autre territoire.'],
      ['Disparue', 'Elle s’étend, elle n’a pas disparu.'],
    ],
    'Elle vient d’ailleurs et gagne du terrain.',
    'Une espèce exotique envahissante est introduite hors de son aire et menace écosystèmes ou espèces locales.',
  ),
  choisir(
    'Deux animaux se ressemblent beaucoup, mais leurs petits, quand ils en ont ensemble, ne peuvent jamais se reproduire. Que peut-on penser ?',
    'Ils n’appartiennent probablement pas à la même espèce',
    [
      [
        'Ils sont forcément de la même espèce, car ils se ressemblent',
        'La ressemblance ne suffit pas : il faut une descendance elle aussi féconde.',
      ],
      ['Ils ne sont pas des êtres vivants', 'Ils se reproduisent : ce sont des êtres vivants.'],
      ['Ils sont endémiques, donc de la même espèce', 'Endémique parle du territoire occupé, pas de la reproduction.'],
      ['Ils forment un écosystème à eux seuls', 'Un écosystème réunit un milieu et une communauté d’êtres vivants.'],
    ],
    'Pense à la fécondité des petits.',
    'Les membres d’une espèce produisent entre eux des êtres semblables et également féconds.',
  ),
  associer(
    'Associe chaque exemple au niveau de biodiversité',
    [
      ['Mer et forêt', 'diversité des milieux de vie'],
      ['Chêne et renard', 'diversité des espèces'],
      ['Deux personnes différentes', 'diversité génétique des individus'],
    ],
    'Demande-toi si l’on compare des lieux, des espèces ou des individus.',
    'La biodiversité s’étudie à trois niveaux liés.',
  ),
];

const NIVEAU3: readonly Modele[] = [
  completer(
    'Complète les trois niveaux de la biodiversité.',
    [
      'La biodiversité comprend la diversité des milieux de vie, des ',
      ' qui les habitent, et la diversité ',
      ' des individus.',
    ],
    [
      ['espèces', 'especes'],
      ['génétique', 'genetique'],
    ],
    'Un niveau concerne les groupes d’êtres vivants, l’autre les différences entre individus.',
    'Les trois niveaux sont les milieux, les espèces et la diversité génétique.',
  ),
  ecrire(
    'Écris le mot : unité de classification des êtres vivants qui ont les mêmes caractères et sont féconds entre eux.',
    ['espèce', 'une espèce', 'l’espèce', 'espece', 'une espece', 'l’espece'],
    [
      ['biocénose', 'La biocénose réunit les êtres vivants d’un milieu, souvent de nombreuses sortes.'],
      ['individu', 'Un individu est un seul être vivant.'],
    ],
    'On dit par exemple « l’… humaine ».',
    'L’espèce groupe des êtres vivants semblables et féconds entre eux.',
  ),
  choisir(
    'Parmi ces actions, laquelle est une surexploitation d’espèces sauvages ?',
    'La surpêche',
    [
      ['La plantation d’une haie', 'Planter une haie n’épuise pas une population sauvage.'],
      ['L’observation des oiseaux', 'Observer ne prélève pas les animaux.'],
      ['La création d’une mare', 'Créer une mare ajoute un milieu de vie.'],
    ],
    '« Sur- » indique qu’on prélève trop.',
    'La surpêche, la déforestation et le braconnage surexploitent des espèces sauvages.',
  ),
];

const NIVEAU4: readonly Modele[] = [
  associer(
    'Associe chaque situation à sa cause d’érosion de la biodiversité',
    [
      ['Une route coupe une forêt en deux', 'fragmentation des milieux'],
      ['On pêche plus vite que les poissons ne se renouvellent', 'surexploitation'],
      ['Des déchets chimiques arrivent dans une rivière', 'pollution'],
      ['Les températures changent et obligent des espèces à migrer', 'changement climatique'],
      ['Un animal venu d’ailleurs chasse les espèces locales', 'espèce exotique envahissante'],
    ],
    'Cherche l’action ou le changement en cause.',
    'La biodiversité subit plusieurs causes d’érosion qui peuvent s’ajouter.',
  ),
  ecrire(
    'Toutes les espèces introduites ne posent pas problème. Quel adjectif qualifie celles qui s’étendent et menacent les espèces locales ? (une espèce exotique…)',
    ['envahissante', 'envahissantes', 'invasive', 'espèce exotique envahissante'],
    [
      ['endémique', 'Une espèce endémique a une aire limitée à son territoire.'],
      [
        'introduite',
        'Toute espèce arrivée avec l’être humain est introduite ; on cherche celles qui menacent les autres.',
      ],
    ],
    'L’adjectif évoque une invasion.',
    'Une espèce exotique envahissante est introduite hors de son aire et menace le milieu ou les espèces locales.',
  ),
  ecrire(
    'Écris le mot qui qualifie une espèce dont l’aire de répartition est limitée à un seul territoire.',
    ['endémique', 'endemique', 'une espèce endémique'],
    [
      ['envahissante', 'Une espèce envahissante s’étend hors de son aire d’origine.'],
      ['exotique', 'Exotique veut dire venue d’ailleurs.'],
    ],
    'Le mot commence par « en ».',
    'Une espèce endémique vit seulement dans une aire limitée.',
  ),
  ecrire(
    'Deux individus d’une même espèce ne sont pas identiques. Quel adjectif complète « la diversité … des individus » ?',
    ['génétique', 'genetique'],
    [
      ['spécifique', 'La diversité spécifique compare des espèces différentes.'],
      ['climatique', 'Le climat ne désigne pas un niveau de la biodiversité.'],
    ],
    'L’adjectif a un rapport avec ce que les parents transmettent.',
    'Au sein d’une espèce, les individus diffèrent : c’est la diversité génétique.',
  ),
];

/** Inventaire inventé : espèces et effectifs relevés sur deux parcelles. */
const inventaire = (rng: Parameters<Modele>[0]) => {
  const communes = rng.int(2, 4);
  const a = communes + rng.int(5, 8);
  const b = communes + rng.int(1, 3);
  const na = rng.int(20, 30);
  const nb = na + rng.int(30, 60);
  return {
    a,
    b,
    na,
    nb,
    lines: [
      'Inventaire imaginé, sur deux parcelles de même surface, le même jour.',
      `Parcelle A (prairie avec haies) : ${a} espèces, ${na} individus en tout.`,
      `Parcelle B (pelouse tondue) : ${b} espèces, ${nb} individus en tout.`,
    ],
    releve: `Parcelle A : ${a} espèces, ${na} individus. Parcelle B : ${b} espèces, ${nb} individus.`,
  };
};

const NIVEAU5: readonly Modele[] = [
  (rng) => {
    const i = inventaire(rng);
    return surDocument(
      'Inventaire de deux parcelles',
      i.lines,
      choisir(
        `${i.releve} Quelle parcelle a la plus grande diversité d’espèces ?`,
        'La parcelle A',
        [
          ['La parcelle B', 'La parcelle B a plus d’individus, mais moins d’espèces différentes.'],
          ['Les deux sont égales', 'Les nombres d’espèces relevés sont différents.'],
        ],
        'La diversité des espèces compte les espèces, pas les individus.',
        'La diversité des espèces se mesure au nombre d’espèces différentes.',
      )(rng),
    );
  },
  (rng) => {
    const i = inventaire(rng);
    return surDocument('Inventaire de deux parcelles', i.lines, {
      prompt: `${i.releve} Combien d’espèces la parcelle A a-t-elle de plus que la parcelle B ?`,
      answer: num(i.a - i.b),
      traps: traps(r(i.a - i.b), [
        [i.nb - i.na, 'Tu as comparé les individus. La question porte sur les espèces.'],
        [i.a + i.b, 'On cherche un écart : il faut soustraire.'],
      ]),
      hint: 'Utilise seulement les nombres d’espèces.',
      steps: ['On soustrait les nombres d’espèces.', `${i.a} − ${i.b} = **${i.a - i.b}**.`],
      targetSeconds: 60,
    });
  },
  (rng) => {
    const i = inventaire(rng);
    return surDocument(
      'Inventaire de deux parcelles',
      i.lines,
      choisir(
        `${i.releve} Quel projet détruit le plus probablement une partie de la diversité de la parcelle A ?`,
        'Arracher les haies et construire un parking sur la prairie',
        [
          ['Faire un nouvel inventaire l’an prochain', 'Observer ne détruit pas le milieu.'],
          ['Laisser les haies en place', 'Conserver les haies ne détruit pas le milieu.'],
          ['Compter les individus plus lentement', 'La façon de compter ne change pas le milieu.'],
        ],
        'Cherche une destruction de milieu naturel.',
        'La destruction et la fragmentation des milieux font reculer la biodiversité.',
      )(rng),
    );
  },
];

export const biodiversite: Skill = {
  id: 'v5-biodiversite',
  title: 'La biodiversité',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **biodiversité** a trois niveaux : les milieux de vie, les **espèces** et la **diversité génétique** des individus (les différences héritées au sein d’une espèce). Exemple : une forêt, ses espèces, et deux chênes différents. Une espèce **endémique** ne vit que sur un territoire limité.',
      'Elle recule à cause de la destruction et de la **fragmentation** (le découpage) des milieux, de la surexploitation, des pollutions, du changement climatique et des **espèces exotiques envahissantes**.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « la biodiversité (diversité des espèces) ».`,
    sources: [
      PROGRAMME,
      'ecologie-biodiversite',
      'ecologie-especes-envahissantes',
      'academie-espece',
      'cnrtl-espece',
      'academie-endemique',
    ],
  },
  generate: generer([NIVEAU1, NIVEAU2, NIVEAU3, NIVEAU4, NIVEAU5]),
};
