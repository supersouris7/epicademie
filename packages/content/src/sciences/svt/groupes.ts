import type { Skill } from '../../types.ts';
import { avecFiches, communs, compter, fiches, Maj } from './classification-kit.ts';
import { CLASSER } from './donnees-classification.ts';
import { PROGRAMME } from './donnees.ts';
import { qcm } from './kit.ts';
import { associer, choisir, completer, ecrire, generer, ranger, type Modele } from './nutrition-kit.ts';

// ——— Groupes emboîtés : des boîtes les unes dans les autres, de la plus large à l'espèce ———

const NIVEAU1: readonly Modele[] = [
  choisir(
    'Comment la classification actuelle organise-t-elle les êtres vivants ?',
    'En groupes emboîtés les uns dans les autres',
    [
      ['En une échelle avec les meilleurs en haut', 'L’idée d’une échelle des êtres est aujourd’hui reconnue fausse.'],
      ['En liste par ordre alphabétique', 'L’ordre des noms ne dit rien des caractères partagés.'],
    ],
    'Imagine des boîtes.',
    'La classification organise le vivant en groupes emboîtés.',
  ),
  choisir(
    'Les mammifères ont des vertèbres. Dans quelle boîte la boîte des mammifères se range-t-elle ?',
    'La boîte des vertébrés',
    [
      ['La boîte des oiseaux', 'Les mammifères n’ont pas de plumes.'],
      ['La boîte des insectes', 'Les insectes n’ont pas de vertèbres.'],
    ],
    'Le caractère « vertèbres » définit la boîte plus grande.',
    'Les mammifères sont rangés dans la boîte des vertébrés.',
  ),
  choisir(
    'Quelle est la plus petite boîte de la classification ?',
    'L’espèce',
    [
      ['Les vertébrés', 'Cette boîte contient de nombreuses boîtes plus petites.'],
      ['Les mammifères', 'Les mammifères contiennent plusieurs groupes, puis des espèces.'],
    ],
    'Elle réunit des individus capables de se reproduire entre eux.',
    'La boîte la plus petite est l’espèce.',
  ),
  choisir(
    'Dans des groupes emboîtés, que peut contenir une grande boîte ?',
    'Des boîtes plus petites',
    [
      ['Seulement un être vivant', 'Une grande boîte réunit beaucoup d’êtres vivants.'],
      ['Des êtres vivants sans aucun caractère commun', 'Les membres d’un groupe partagent au moins un caractère.'],
    ],
    'Pense à des tiroirs dans une armoire.',
    'Une boîte peut en contenir de plus petites et faire partie d’un ensemble plus grand.',
  ),
];

const CHAINES: readonly { readonly boites: readonly [string, string, string, string]; readonly exemple: string }[] = [
  { boites: ['vertébrés', 'mammifères', 'primates', 'hominidés'], exemple: 'le gorille' },
  { boites: ['vertébrés', 'mammifères', 'carnivores', 'canidés'], exemple: 'le loup' },
  { boites: ['vertébrés', 'mammifères', 'primates', 'hominidés'], exemple: 'le chimpanzé' },
];

const NIVEAU2: readonly Modele[] = [
  choisir(
    'Le hérisson est un mammifère. Que peut-on affirmer à coup sûr ?',
    'C’est aussi un vertébré',
    [
      ['C’est aussi un oiseau', 'La boîte des oiseaux est une autre boîte : le hérisson n’a pas de plumes.'],
      ['C’est aussi un insecte', 'Un insecte n’a pas de vertèbres.'],
      ['Tous les vertébrés sont des hérissons', 'La grande boîte contient bien d’autres animaux.'],
    ],
    'Dans quelle boîte la boîte des mammifères se trouve-t-elle ?',
    'Tout membre de la boîte des mammifères est aussi dans la boîte des vertébrés.',
  ),
  choisir(
    'Un animal est un vertébré. Est-ce forcément un mammifère ?',
    'Non : la boîte des vertébrés contient aussi d’autres groupes',
    [
      ['Oui : les deux mots désignent la même boîte', 'Les mammifères forment une boîte plus petite.'],
      ['Oui, s’il est assez grand', 'La taille ne définit aucune de ces boîtes.'],
      ['Non : un vertébré n’a pas de vertèbres', 'Un vertébré a justement des vertèbres.'],
    ],
    'La grande boîte contient-elle une seule petite boîte ?',
    'Les oiseaux, par exemple, sont des vertébrés sans être des mammifères.',
  ),
  choisir(
    'Les araignées appartiennent aux arachnides. Dans quel grand groupe les arachnides se rangent-ils ?',
    'Les arthropodes',
    [
      ['Les vertébrés', 'Les araignées n’ont pas de vertèbres.'],
      ['Les insectes', 'Les insectes sont une autre boîte, à six pattes.'],
      ['Les mammifères', 'Les araignées n’ont pas de mamelles.'],
    ],
    'Leur squelette est à l’extérieur et articulé.',
    'Les arachnides, comme les insectes, sont des arthropodes.',
  ),
  associer(
    'Associe chaque animal à la plus petite boîte proposée où il entre',
    [
      ['Le loup', 'les canidés'],
      ['Le chimpanzé', 'les primates'],
      ['L’araignée', 'les arachnides'],
    ],
    'Choisis la boîte la plus précise pour chacun.',
    'Chaque animal se range dans la boîte la plus petite qui le contient, puis dans les plus grandes.',
  ),
];

const NIVEAU3: readonly Modele[] = [
  (rng) => {
    const c = rng.pick(CHAINES);
    return ranger(
      `Range les boîtes qui contiennent ${c.exemple}, de la plus grande à la plus petite.`,
      c.boites,
      'La plus grande boîte contient toutes les autres.',
      'On part du plus grand groupe pour aller vers le plus précis.',
    )(rng);
  },
  ranger(
    'Range ces boîtes de la plus grande à la plus petite.',
    ['arthropodes', 'arachnides', 'araignées'],
    'Les araignées sont un groupe d’arachnides.',
    'Les araignées sont des arachnides, qui sont des arthropodes.',
  ),
  completer(
    'Range pour le hérisson ces deux groupes : mammifères et vertébrés.',
    ['On ouvre d’abord le grand tiroir des ', ', puis, à l’intérieur, le tiroir plus petit des ', '.'],
    [
      ['vertébrés', 'vertebres', 'Vertébrés'],
      ['mammifères', 'mammiferes', 'Mammifères'],
    ],
    'Le hérisson a des vertèbres et des mamelles.',
    'La boîte des mammifères est à l’intérieur de celle des vertébrés.',
  ),
  ecrire(
    'Écris le nom de la plus petite boîte de la classification.',
    ['espèce', 'l’espèce', 'une espèce', 'espece', 'l’espece', 'une espece'],
    [
      ['famille', 'Une famille réunit plusieurs genres, donc plusieurs espèces.'],
      ['groupe', 'Toutes les boîtes sont des groupes : cherche le nom de la plus petite.'],
    ],
    'Ses membres peuvent se reproduire entre eux.',
    'La boîte la plus petite est l’espèce.',
  ),
];

const NIVEAU4: readonly Modele[] = [
  ranger(
    'Range les boîtes qui contiennent le loup commun, de la plus grande à la plus petite.',
    ['Vertébrés', 'Mammifères', 'Carnivores', 'Canidés', 'Loup commun (espèce)'],
    'Dans la classification, la boîte « famille » est plus petite que la boîte « ordre ».',
    'Le loup est un vertébré, un mammifère, de l’ordre des Carnivores et de la famille des Canidés.',
  ),
  associer(
    'Associe chaque boîte à celle qui la contient directement dans cette liste',
    [
      ['Mammifères', 'Vertébrés'],
      ['Primates', 'Mammifères'],
      ['Hominidés', 'Primates'],
      ['Arachnides', 'Arthropodes'],
      ['Araignées', 'Arachnides'],
    ],
    'Pour chacune, cherche la boîte juste plus grande.',
    'Chaque boîte est contenue dans une boîte plus grande.',
  ),
  choisir(
    'Deux espèces sont rangées ensemble dans une toute petite boîte. Deux autres ne se rejoignent que dans une très grande boîte. Lesquelles sont les plus proches parentes ?',
    'Les deux espèces de la toute petite boîte',
    [
      ['Les deux espèces de la très grande boîte', 'Plus la boîte commune est grande, plus la parenté est éloignée.'],
      ['Les deux paires sont aussi proches', 'La taille de la boîte commune renseigne sur la parenté.'],
      ['On ne peut rien dire de la parenté avec des boîtes', 'Les boîtes sont organisées selon la parenté.'],
      ['Celles qui vivent au même endroit', 'Le milieu de vie ne donne pas le degré de parenté.'],
    ],
    'Relie la taille de la boîte à la proximité.',
    'Plus des espèces sont apparentées, plus la boîte qui les réunit est petite.',
  ),
  ecrire(
    'Les humains appartiennent à la famille qui réunit aussi orangs-outans, gorilles, bonobos et chimpanzés. Écris son nom (au pluriel).',
    ['hominidés', 'les hominidés', 'hominides', 'les hominides', 'hominidé'],
    [
      ['primates', 'Les primates forment une boîte plus grande, qui contient les babouins aussi.'],
      ['mammifères', 'Cette boîte est bien plus grande.'],
      ['vertébrés', 'Cette boîte est la plus grande de toutes celles-là.'],
    ],
    'On appelle souvent ses membres les « grands singes ».',
    'Les hominidés réunissent les grands singes, humains compris.',
  ),
];

/** Animaux imaginaires répartis dans les boîtes des vertébrés et des arthropodes. */
const PROFILS = ['primate', 'mammifere', 'oiseau', 'insecte', 'arachnide'] as const;

const dansLaBoite: Modele = (rng) => {
  const liste = fiches(rng, PROFILS);
  const boite = rng.pick([
    { nom: 'vertébrés', profils: ['primate', 'mammifere', 'oiseau'] },
    { nom: 'mammifères', profils: ['primate', 'mammifere'] },
    { nom: 'arthropodes', profils: ['insecte', 'arachnide'] },
  ] as const);
  const n = boite.profils.length;
  return avecFiches(
    rng,
    liste,
    compter(
      `Combien d’animaux entrent dans la boîte des ${boite.nom} ?`,
      n,
      [
        [5, 'Tous les animaux ne sont pas dans cette boîte : cherche le caractère qui la définit.'],
        [n - 1, 'Il en manque un : les boîtes plus petites comptent aussi dans la grande.'],
      ],
      'Quel caractère définit la boîte ? Cherche-le dans les fiches, y compris dans les boîtes plus petites.',
      [
        'Un animal entre dans une boîte s’il en possède le caractère.',
        `La boîte des ${boite.nom} réunit ${n} animaux.`,
      ],
    ),
  );
};

const plusPetiteBoite: Modele = (rng) => {
  const liste = fiches(rng, PROFILS);
  const [p, m, o, i, araignee] = liste;
  const cas = rng.pick([
    { a: p, b: m, bonne: 'Les mammifères' },
    { a: p, b: o, bonne: 'Les vertébrés' },
    { a: m, b: o, bonne: 'Les vertébrés' },
    { a: i, b: araignee, bonne: 'Les arthropodes' },
  ]);
  const tous: readonly (readonly [string, string])[] = [
    [
      'Les vertébrés',
      cas.bonne === 'Les arthropodes'
        ? `${Maj(cas.a.nom)} n’a pas de vertèbres.`
        : 'Il existe une boîte plus petite qui contient les deux.',
    ],
    ['Les mammifères', `Les deux animaux n’ont pas tous des mamelles : vérifie ${cas.b.nom}.`],
    ['Les primates', 'Les deux animaux n’ont pas tous un pouce opposable.'],
    ['Les arthropodes', `${Maj(cas.a.nom)} n’a pas de squelette externe.`],
  ];
  const q = qcm(
    rng,
    {
      prompt: `Quelle est la plus petite boîte qui contient à la fois ${cas.a.nom} et ${cas.b.nom} ?`,
      bonne: cas.bonne,
      fausses: tous.filter(([label]) => label !== cas.bonne),
      indice: 'Liste les caractères communs aux deux fiches, puis prends le plus précis.',
      explication: [
        `Caractères communs : ${communs(cas.a.profil, cas.b.profil).join(' et ')}.`,
        `${Maj(cas.a.nom)} et ${cas.b.nom} se rejoignent dans la boîte définie par leur caractère commun le plus précis.`,
      ],
    },
    60,
  );
  return avecFiches(rng, liste, q);
};

const NIVEAU5: readonly Modele[] = [dansLaBoite, plusPetiteBoite];

export const groupesEmboites: Skill = {
  id: 'v5-groupes-emboites',
  title: 'Les groupes emboîtés',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La classification range le vivant en **groupes emboîtés**, comme des boîtes : les mammifères sont dans la boîte des **vertébrés**, les primates dans celle des mammifères. La plus petite boîte est l’**espèce**.',
      'Un être vivant appartient donc à plusieurs boîtes à la fois. Exemple : le loup est un canidé, un carnivore, un mammifère et un vertébré.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Les grands groupes d’êtres vivants » ; programme du cycle 3 : « classification en groupes emboités » ; Muséum national d’Histoire naturelle.`,
    sources: [PROGRAMME, 'cycle3-2020', CLASSER, 'mnhn-humain', 'mnhn-arthropode', 'mnhn-araignee', 'cnrtl-primate'],
  },
  generate: generer([NIVEAU1, NIVEAU2, NIVEAU3, NIVEAU4, NIVEAU5]),
};
