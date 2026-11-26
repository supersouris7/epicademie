import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { compter } from './classification-kit.ts';
import { ARBRE, CLASSER } from './donnees-classification.ts';
import { PROGRAMME } from './donnees.ts';
import { qcm } from './kit.ts';
import { associer, choisir, completer, ecrire, generer, surDocument, type Modele } from './nutrition-kit.ts';

// ——— L'espèce : ressemblance, reproduction, descendance fertile, nom scientifique ———

const NIVEAU1: readonly Modele[] = [
  choisir(
    'Que doivent pouvoir faire deux individus pour être reconnus de la même espèce ?',
    'Se reproduire entre eux et avoir des petits fertiles',
    [
      ['Vivre dans le même pays', 'Le pays ne définit pas l’espèce.'],
      ['Avoir exactement la même taille', 'Les individus d’une espèce diffèrent entre eux.'],
    ],
    'Pense à la génération suivante.',
    'Les membres d’une espèce produisent ensemble une descendance fertile.',
  ),
  choisir(
    'Qu’est-ce qu’une descendance fertile ?',
    'Des petits qui pourront à leur tour avoir des petits',
    [
      ['Des petits très nombreux', 'Le nombre ne dit pas s’ils pourront se reproduire.'],
      ['Des petits qui mangent beaucoup', 'La nourriture n’a rien à voir avec ce mot.'],
    ],
    'Pense à la génération d’après.',
    'Fertile signifie capable de se reproduire à son tour.',
  ),
  choisir(
    'Dans la classification, quelle place occupe l’espèce ?',
    'La plus petite unité',
    [
      ['La plus grande boîte', 'La plus grande boîte contient toutes les autres.'],
      ['Une boîte qui contient les vertébrés', 'Les vertébrés réunissent de nombreuses espèces.'],
    ],
    'On y range des individus très proches.',
    'L’espèce est la plus petite unité de la classification.',
  ),
  choisir(
    'Deux chats de couleurs différentes ont des petits fertiles. Que peut-on dire ?',
    'Ils sont de la même espèce',
    [
      ['Ils sont d’espèces différentes à cause de leur couleur', 'Des individus d’une espèce peuvent différer.'],
      ['La couleur suffit à créer deux espèces', 'La couleur seule ne définit pas une espèce.'],
    ],
    'Regarde leurs petits.',
    'La variation existe au sein d’une espèce.',
  ),
];

const NIVEAU2: readonly Modele[] = [
  choisir(
    'Un mulet naît d’un âne et d’une jument et ne peut pas se reproduire. Que peut-on en déduire ?',
    'L’âne et le cheval sont d’espèces différentes',
    [
      ['L’âne et le cheval sont de la même espèce', 'Leur descendant ne peut pas se reproduire.'],
      ['Le mulet est une espèce à part entière qui se reproduit', 'Le mulet ne peut pas se reproduire.'],
      ['Le mulet n’est pas un être vivant', 'C’est un animal bien vivant.'],
    ],
    'La descendance est-elle fertile ?',
    'Le mulet est un hybride stérile : ses deux parents ne forment pas une seule espèce.',
  ),
  choisir(
    'Pourquoi la ressemblance ne suffit-elle pas pour dire que deux animaux sont de la même espèce ?',
    'Il faut aussi qu’ils aient ensemble une descendance fertile',
    [
      [
        'Parce que deux animaux qui se ressemblent vivent toujours loin l’un de l’autre',
        'Le lieu de vie n’est pas la raison.',
      ],
      [
        'Parce que les animaux d’une espèce sont toujours très différents',
        'Ils peuvent se ressembler, mais ce n’est pas suffisant seul.',
      ],
      ['Parce que la ressemblance n’existe pas', 'La ressemblance existe bien, elle ne suffit pas.'],
    ],
    'Pense à la reproduction.',
    'Il faut plus qu’une ressemblance : la descendance doit être fertile.',
  ),
  choisir(
    'Dans le nom scientifique « Homo sapiens », que représente « Homo » ?',
    'Le nom de genre',
    [
      ['Le nom d’espèce', 'C’est le second mot qui désigne l’espèce.'],
      ['Le nom de la famille', 'Le nom scientifique d’une espèce ne commence pas par la famille.'],
      ['Un prénom', 'Ce n’est pas le prénom d’un individu.'],
    ],
    'Il s’écrit avec une majuscule.',
    'Dans un nom en deux mots, le premier est le genre, le second l’espèce.',
  ),
  associer(
    'Associe chaque élément à sa description',
    [
      ['Espèce', 'plus petite unité de la classification'],
      ['Descendance fertile', 'petits capables de se reproduire'],
      ['Hybride stérile', 'petit d’un croisement qui n’a pas de descendants'],
    ],
    'Commence par le mot le plus familier.',
    'La fertilité des petits aide à reconnaître une espèce.',
  ),
];

const NIVEAU3: readonly Modele[] = [
  completer(
    'Complète la description d’une espèce.',
    ['Une espèce réunit des individus qui se ressemblent, se reproduisent entre eux et ont une descendance ', '.'],
    [['fertile', 'féconde', 'feconde']],
    'Les petits doivent pouvoir faire des petits.',
    'La descendance fertile est un critère de l’espèce.',
  ),
  ecrire(
    'Écris le mot : plus petite unité de la classification, qui réunit des individus féconds entre eux.',
    ['espèce', 'une espèce', 'l’espèce', 'espece', 'une espece', 'l’espece'],
    [
      ['genre', 'Le genre peut regrouper plusieurs espèces.'],
      ['famille', 'La famille est une boîte plus grande.'],
    ],
    'On dit « l’… humaine ».',
    'L’espèce est la plus petite unité de la classification.',
  ),
  ecrire(
    'Dans « Erinaceus europaeus » (un hérisson), écris le mot qui désigne le genre.',
    ['Erinaceus', 'erinaceus'],
    [
      ['europaeus', 'C’est le second mot : il désigne l’espèce à l’intérieur du genre.'],
      ['hérisson', 'C’est le nom courant, pas le nom de genre.'],
    ],
    'Un nom scientifique va du plus large au plus précis.',
    'Le premier mot d’un nom scientifique est le genre.',
  ),
  completer(
    'Complète : l’écriture d’un nom scientifique.',
    ['Le premier mot est le ', ' et prend une majuscule ; le second désigne l’', ' et reste en minuscules.'],
    [['genre'], ['espèce', 'espece']],
    'Le nom va du plus large au plus précis.',
    'Genre puis espèce : par exemple Homo sapiens.',
  ),
];

const NIVEAU4: readonly Modele[] = [
  associer(
    'Associe chaque situation à la conclusion',
    [
      ['Petits fertiles ensemble', 'une même espèce'],
      ['Petits stériles ensemble', 'deux espèces différentes'],
      ['Seulement une ressemblance', 'on ne peut pas conclure'],
      ['Premier mot d’un nom scientifique', 'le genre'],
      ['Second mot d’un nom scientifique', 'l’espèce dans le genre'],
    ],
    'Demande-toi toujours si les petits peuvent se reproduire.',
    'La reproduction compte plus que l’apparence.',
  ),
  choisir(
    'Deux populations d’une même espèce restent séparées pendant très longtemps. Que peut-il se produire ?',
    'Elles finissent par ne plus pouvoir se reproduire entre elles',
    [
      ['Elles deviennent forcément identiques', 'Sans échanges, les populations divergent.'],
      ['L’une devient l’ancêtre de l’autre', 'Elles descendent toutes deux d’une même population.'],
      ['Rien ne peut jamais changer', 'Les êtres vivants changent au fil des générations.'],
      ['Elles forment aussitôt la même famille', 'La séparation les rend au contraire de plus en plus différentes.'],
    ],
    '« Dès qu’on cesse d’échanger… »',
    'Séparées longtemps, elles divergent et peuvent ne plus pouvoir se reproduire entre elles.',
  ),
  ecrire(
    'Un mulet ne peut pas avoir de petits. Écris l’adjectif qui le qualifie.',
    ['stérile', 'sterile', 'infertile', 'infécond', 'infecond'],
    [
      ['fertile', 'Fertile signifie justement qu’on peut avoir des petits.'],
      ['hybride', 'Il est bien un hybride, mais on cherche l’adjectif qui dit qu’il ne se reproduit pas.'],
    ],
    'C’est le contraire de « fertile ».',
    'La plupart des hybrides entre espèces sont stériles.',
  ),
  ecrire(
    'Un animal issu du croisement de deux espèces différentes, comme le mulet, est appelé un…',
    ['hybride', 'un hybride'],
    [
      ['mutant', 'Le mot « mutant » ne dit pas que les parents sont de deux espèces différentes.'],
      ['ancêtre', 'Un ancêtre est un être du passé dont on descend.'],
    ],
    'Le mot désigne le résultat d’un croisement entre deux lignées différentes.',
    'Le mulet est un hybride de l’âne et de la jument.',
  ),
];

const POPULATIONS = ['Rouge', 'Verte', 'Bleue', 'Dorée', 'Grise', 'Brune'] as const;

type Resultat = 'fertiles' | 'steriles' | 'aucun';

const PHRASES: Readonly<Record<Resultat, (n: number) => string>> = {
  fertiles: (n) => `${n} petits, tous capables d’avoir des petits à leur tour`,
  steriles: (n) => `${n} petits, aucun ne peut avoir de petits`,
  aucun: () => 'aucun petit, même après plusieurs essais',
};

const RESUMES: Readonly<Record<Resultat, string>> = {
  fertiles: 'petits fertiles',
  steriles: 'petits stériles',
  aucun: 'aucun petit',
};

/** Croisements imaginés entre une population témoin et d'autres : le document les détaille. */
const croisements = (rng: Rng, resultats: readonly Resultat[]) => {
  const [temoin = '', ...noms] = rng.shuffle(POPULATIONS);
  const liste = rng.shuffle(resultats).map((resultat, k) => ({ nom: noms[k] ?? '', resultat }));
  const nom = (r: Resultat) => liste.find((c) => c.resultat === r)?.nom ?? '';
  return {
    temoin,
    liste,
    fertile: nom('fertiles'),
    sterile: nom('steriles'),
    aucun: nom('aucun'),
    lignes: liste.map((c) => `Population ${temoin} × population ${c.nom} : ${PHRASES[c.resultat](rng.int(3, 9))}.`),
  };
};

const UN_DE_CHAQUE = ['fertiles', 'steriles', 'aucun'] as const;

const doc = (c: ReturnType<typeof croisements>, q: QuestionDraft): QuestionDraft =>
  surDocument('Croisements imaginés dans des conditions naturelles', c.lignes, {
    ...q,
    prompt: `Croisements avec la population ${c.temoin} (${c.liste.map((x) => `${x.nom} : ${RESUMES[x.resultat]}`).join(' ; ')}). ${q.prompt}`,
  });

const memeEspece: Modele = (rng) => {
  const c = croisements(rng, UN_DE_CHAQUE);
  return doc(
    c,
    qcm(
      rng,
      {
        prompt: `Quelle population appartient à la même espèce que la population ${c.temoin} ?`,
        bonne: `La population ${c.fertile}`,
        fausses: [
          [`La population ${c.sterile}`, 'Les petits existent, mais ils ne peuvent pas se reproduire.'],
          [`La population ${c.aucun}`, 'Aucun petit n’est obtenu avec cette population.'],
        ],
        indice: 'Cherche des petits qui pourront à leur tour en avoir.',
        explication: ['Une même espèce donne une descendance fertile.'],
      },
      60,
    ),
  );
};

const steriles: Modele = (rng) => {
  const c = croisements(rng, UN_DE_CHAQUE);
  return doc(
    c,
    qcm(
      rng,
      {
        prompt: `Pourquoi les populations ${c.temoin} et ${c.sterile} ne sont-elles pas de la même espèce ?`,
        bonne: 'Leurs petits ne peuvent pas avoir de petits à leur tour',
        fausses: [
          ['Elles n’ont jamais eu de petits ensemble', 'Dans ce croisement, des petits sont nés.'],
          ['Leurs petits sont trop nombreux', 'Le nombre de petits ne compte pas.'],
          ['Leurs noms de couleur sont différents', 'Le nom d’une population ne définit pas une espèce.'],
        ],
        indice: 'Relis ce que deviennent les petits.',
        explication: ['La descendance doit être fertile pour que les parents soient d’une même espèce.'],
      },
      60,
    ),
  );
};

const nombreMemeEspece: Modele = (rng) => {
  const fertiles = rng.int(1, 3);
  const c = croisements(rng, [...Array.from({ length: fertiles }, (): Resultat => 'fertiles'), 'steriles', 'aucun']);
  return doc(
    c,
    compter(
      `Combien de ces populations forment avec la population ${c.temoin} une même espèce ?`,
      fertiles,
      [
        [fertiles + 1, 'Tu as compté un croisement dont les petits ne peuvent pas se reproduire.'],
        [fertiles + 2, 'Toutes les populations ne donnent pas une descendance fertile.'],
      ],
      'Une descendance fertile est indispensable.',
      ['On ne garde que les croisements dont les petits sont fertiles.'],
    ),
  );
};

const nomEspece: Modele = (rng) => {
  const c = croisements(rng, UN_DE_CHAQUE);
  return doc(
    c,
    qcm(
      rng,
      {
        prompt: `La population ${c.temoin} porte un nom scientifique en deux mots. La population ${c.fertile} étant de la même espèce, quel nom lui donne-t-on ?`,
        bonne: 'Le même nom en deux mots',
        fausses: [
          [
            'Seulement le même nom de genre, avec un autre nom d’espèce',
            'Les deux populations sont de la même espèce : le second mot ne change pas.',
          ],
          ['Un nom en deux mots entièrement différent', 'Une même espèce porte un seul nom scientifique.'],
          ['Aucun nom, car sa couleur diffère', 'La couleur ne change pas le nom d’espèce.'],
        ],
        indice: 'Une espèce a un seul nom scientifique.',
        explication: ['Les deux populations forment une même espèce : le genre et l’espèce sont les mêmes.'],
      },
      60,
    ),
  );
};

const NIVEAU5: readonly Modele[] = [memeEspece, steriles, nombreMemeEspece, nomEspece];

export const espece: Skill = {
  id: 'v5-espece',
  title: 'La notion d’espèce',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'L’**espèce** est la plus petite unité de la classification : ses individus peuvent se reproduire entre eux et leurs petits sont **fertiles**. Se ressembler ne suffit pas ; des individus d’une espèce peuvent aussi différer.',
      'Exemple : le mulet, **hybride** d’un âne et d’une jument, est stérile : l’âne et le cheval sont deux espèces. Chaque espèce a un nom en deux mots, comme Homo sapiens (genre, puis espèce).',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « la classification du vivant » ; Muséum national d’Histoire naturelle ; Dictionnaire de l’Académie française, article « espèce ».`,
    sources: [PROGRAMME, CLASSER, 'mnhn-espece', ARBRE, 'academie-espece', 'academie-mulet', 'academie-hybride'],
  },
  generate: generer([NIVEAU1, NIVEAU2, NIVEAU3, NIVEAU4, NIVEAU5]),
};
