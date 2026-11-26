import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, saisie } from './outils.ts';

// ——— Les relations dans un écosystème : milieu de vie, êtres vivants, prédation, coopération ———

interface Chasse {
  readonly predateur: string;
  readonly proie: string;
}

/** Scènes inventées : la capture est donnée par l'énoncé. */
const CHASSES: readonly Chasse[] = [
  { predateur: 'la mésange', proie: 'la chenille' },
  { predateur: 'le héron', proie: 'la grenouille' },
  { predateur: 'la coccinelle', proie: 'le puceron' },
  { predateur: 'la chouette', proie: 'le mulot' },
  { predateur: 'le brochet', proie: 'le gardon' },
  { predateur: 'l’araignée', proie: 'la mouche' },
];

interface Entraide {
  readonly qui: string;
  readonly texte: string;
}

/** Exemples de coopération sourcés : pollinisation (programme), anémone et bernard-l'hermite (Académie), lichen (TLFi). */
const ENTRAIDES: readonly Entraide[] = [
  {
    qui: 'L’abeille et la fleur',
    texte: 'L’abeille visite les fleurs et transporte leur pollen. Les deux y gagnent.',
  },
  {
    qui: 'L’anémone de mer et le bernard-l’hermite',
    texte: 'L’anémone de mer et le bernard-l’hermite vivent ensemble. Chacun tire profit de l’autre sans lui nuire.',
  },
  {
    qui: 'L’algue et le champignon du lichen',
    texte: 'Dans un lichen, une algue et un champignon vivent ensemble, et chacun en profite.',
  },
];

const PREDATION = 'la prédation';
const COOPERATION = 'la coopération';

const chasse = (c: Chasse) => `${maj(c.predateur)} attrape ${c.proie} pour s’en nourrir.`;

const niveau1 = (rng: Rng): QuestionDraft => {
  const entraide = rng.int(0, 1) === 0;
  const texte = entraide ? rng.pick(ENTRAIDES).texte : chasse(rng.pick(CHASSES));
  const bon = entraide ? COOPERATION : PREDATION;
  const { answer, traps: tr } = choice(rng, bon, [
    entraide
      ? { label: PREDATION, why: 'Personne ne mange personne ici : les deux y gagnent.' }
      : { label: COOPERATION, why: 'L’un mange l’autre : la proie n’y gagne rien.' },
    { label: 'la germination', why: 'La germination, c’est une graine qui commence à pousser, pas une relation.' },
  ]);
  return {
    prompt: `${texte} Comment s’appelle cette relation ?`,
    answer,
    traps: tr,
    hint: 'Demande-toi : est-ce que l’un mange l’autre, ou est-ce que les deux y gagnent ?',
    steps: [
      entraide ? 'Les deux êtres vivants tirent un avantage.' : 'Un animal capture un autre pour le manger.',
      `C’est **${bon}**.`,
    ],
    targetSeconds: 25,
  };
};

const COMPOSANTS = ['Le milieu de vie', 'Un être vivant', 'Une interaction'] as const;
const EXEMPLES: readonly (readonly [string, string, string])[] = [
  ['L’eau et la vase de la mare', 'La grenouille', 'Le héron mange la grenouille'],
  ['La terre et les pierres du talus', 'Le lézard', 'La mésange mange la chenille'],
  ['Le tronc mort et l’air de la forêt', 'Le mulot', 'La chouette mange le mulot'],
];

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const e = rng.pick(EXEMPLES);
    return {
      prompt: `Un écosystème a trois parties. Associe : ${e.join(' ; ')}.`,
      answer: association(
        rng,
        e.map((x, i) => [x, COMPOSANTS[i] ?? ''] as const),
      ),
      hint: 'Un être vivant est seul. Une interaction met deux vivants en relation.',
      steps: [
        'Un écosystème, c’est un milieu de vie, des êtres vivants et leurs interactions.',
        'Chaque exemple est relié à **sa** partie.',
      ],
      targetSeconds: 50,
    };
  }
  const c = rng.pick(CHASSES);
  const demande = rng.pick(['proie', 'prédateur'] as const);
  const bon = demande === 'proie' ? c.proie : c.predateur;
  const autre = demande === 'proie' ? c.predateur : c.proie;
  const tiers = rng.pick(CHASSES.filter((x) => x !== c));
  const { answer, traps: tr } = choice(rng, bon, [
    {
      label: autre,
      why: demande === 'proie' ? 'C’est celui qui capture : le prédateur.' : 'C’est celui qui est mangé : la proie.',
    },
    { label: tiers.predateur, why: 'Cet animal n’apparaît pas dans la scène.' },
    { label: tiers.proie, why: 'Cet animal n’apparaît pas dans la scène.' },
  ]);
  return {
    prompt: `${chasse(c)} Dans cette scène, qui est ${demande === 'proie' ? 'la proie' : 'le prédateur'} ?`,
    answer,
    traps: tr,
    hint: 'Le prédateur capture. La proie est capturée.',
    steps: ['Le prédateur capture la proie pour s’en nourrir.', `Réponse : **${bon}**.`],
    targetSeconds: 35,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  const c = rng.pick(CHASSES);
  if (t === 0) {
    return {
      prompt: `${chasse(c)} Complète.`,
      answer: {
        kind: 'cloze',
        parts: [`${maj(c.predateur)} est le `, `. ${maj(c.proie)} est la `, '.'],
        blanks: [
          { mode: 'text', accepted: ['prédateur', 'predateur'] },
          { mode: 'text', accepted: ['proie'] },
        ],
      },
      hint: 'L’un chasse, l’autre est chassé.',
      steps: [
        'Celui qui capture est le prédateur.',
        'Celui qui est capturé est la **proie** : le premier est le **prédateur**.',
      ],
      targetSeconds: 40,
    };
  }
  if (t === 1) {
    const demande = rng.pick(['proie', 'prédateur'] as const);
    const accepte =
      demande === 'proie'
        ? ['proie', 'la proie', 'une proie']
        : ['prédateur', 'le prédateur', 'un prédateur', 'predateur', 'le predateur'];
    const { answer, traps: tr } = saisie(accepte, [
      demande === 'proie'
        ? ['prédateur', 'Le prédateur capture ; ici on cherche celui qui est mangé.']
        : ['proie', 'La proie est capturée ; ici on cherche celui qui capture.'],
      ['végétal', 'Le mot cherché décrit le rôle dans une chasse.'],
    ]);
    return {
      prompt: `${chasse(c)} Comment appelle-t-on ${demande === 'proie' ? c.proie : c.predateur} dans cette relation ? Écris un mot.`,
      answer,
      traps: tr,
      hint: 'Les deux mots du mémo : l’un chasse, l’autre est chassé.',
      steps: ['On regarde qui capture et qui est capturé.', `Le mot est **${demande}**.`],
      targetSeconds: 35,
    };
  }
  const e = rng.pick(ENTRAIDES);
  const { answer, traps: tr } = saisie(
    ['coopération', 'la coopération', 'cooperation', 'une coopération', 'mutualisme', 'le mutualisme', 'entraide'],
    [
      ['prédation', 'Personne ne mange personne : les deux y gagnent.'],
      ['compétition', 'Ils ne se disputent rien ici : les deux y gagnent.'],
    ],
  );
  return {
    prompt: `${e.texte} Écris le nom de cette relation.`,
    answer,
    traps: tr,
    hint: 'Demande-toi qui y gagne dans cette scène.',
    steps: ['Les deux êtres vivants profitent de la relation.', 'C’est la **coopération**.'],
    targetSeconds: 35,
  };
};

const MOTS: readonly (readonly [string, string])[] = [
  ['L’ensemble d’un milieu, de ses êtres vivants et de leurs liens', 'Écosystème'],
  ['Celui qui capture un animal pour s’en nourrir', 'Prédateur'],
  ['L’être vivant capturé pour servir de nourriture', 'Proie'],
  ['Une relation où les deux y gagnent', 'Coopération'],
  ['L’endroit où vivent des êtres vivants', 'Milieu de vie'],
];

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    const m = rng.shuffle(MOTS);
    return {
      prompt: `Associe chaque description à son mot : ${m.map((x) => x[0]).join(' ; ')}.`,
      answer: association(rng, m),
      hint: 'Commence par les mots que tu connais le mieux.',
      steps: ['Chaque mot a un sens précis.', 'Chaque description est reliée à **son** mot.'],
      targetSeconds: 70,
    };
  }
  const entraide = rng.int(0, 1) === 0;
  const scene = entraide ? rng.pick(ENTRAIDES).texte : chasse(rng.pick(CHASSES));
  const accepte = entraide
    ? ['coopération', 'la coopération', 'cooperation', 'mutualisme', 'le mutualisme', 'entraide']
    : ['prédation', 'la prédation', 'predation', 'une prédation'];
  const { answer, traps: tr } = saisie(accepte, [
    entraide
      ? ['prédation', 'Aucun des deux ne mange l’autre.']
      : ['coopération', 'La proie n’y gagne rien : ce n’est pas une coopération.'],
    ['écosystème', 'L’écosystème est l’ensemble ; on demande le nom de la relation.'],
  ]);
  return {
    prompt: `${scene} Nomme précisément la relation, sans propositions.`,
    answer,
    traps: tr,
    hint: 'Qui y gagne dans cette scène ?',
    steps: [
      'On regarde si les deux profitent de la relation.',
      `La relation est la **${entraide ? 'coopération' : 'prédation'}**.`,
    ],
    targetSeconds: 45,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const nb = rng.int(2, 3);
  const choisies = rng.shuffle(CHASSES).slice(0, nb);
  const entraides = rng.shuffle(ENTRAIDES).slice(0, 3 - nb + 1);
  const lignes = rng.shuffle([...choisies.map(chasse), ...entraides.map((e) => e.texte)]);
  const figure = { kind: 'document' as const, title: 'Carnet d’un naturaliste (exemple inventé)', lines: lignes };
  const sujet = `Lis le carnet (${lignes.length} observations).`;
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: `${sujet} Combien d’observations décrivent une prédation ?`,
      figure,
      answer: num(nb),
      traps: traps(r(nb), [
        [lignes.length, 'Toutes les lignes ne sont pas des chasses : certaines montrent une coopération.'],
        [entraides.length, 'Tu as compté les coopérations. Compte les chasses.'],
      ]),
      hint: 'Repère les lignes où un animal en attrape un autre pour le manger.',
      steps: ['Une prédation : un animal capture un autre pour le manger.', `On en compte **${nb}**.`],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const c = rng.pick(choisies);
    const { answer, traps: tr } = saisie(
      ['prédation', 'la prédation', 'predation'],
      [['coopération', 'La proie n’y gagne rien.']],
    );
    return {
      prompt: `${sujet} Quel nom donne-t-on à la relation entre ${c.predateur} et ${c.proie} ?`,
      figure,
      answer,
      traps: tr,
      hint: 'Relis la ligne qui parle de ces deux animaux.',
      steps: [`${maj(c.predateur)} capture ${c.proie} pour s’en nourrir.`, 'C’est la **prédation**.'],
      targetSeconds: 50,
    };
  }
  const bon = 'Le milieu de vie, les êtres vivants et les interactions';
  const { answer, traps: tr } = choice(rng, bon, [
    { label: 'Seulement les animaux', why: 'Il manque les végétaux, les autres vivants et le milieu.' },
    { label: 'Seulement le milieu de vie', why: 'Un écosystème contient aussi des êtres vivants et leurs relations.' },
    { label: 'Les animaux et les objets fabriqués', why: 'Les objets fabriqués ne définissent pas un écosystème.' },
  ]);
  return {
    prompt: `${sujet} Pour décrire entièrement cet écosystème, que faut-il présenter ?`,
    figure,
    answer,
    traps: tr,
    hint: 'Il y a trois parties à ne pas oublier.',
    steps: ['Un écosystème a trois parties.', `On présente : **${bon}**.`],
    targetSeconds: 60,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const relations: Skill = {
  id: 'vcm2-relations',
  title: 'Les relations dans un écosystème',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **écosystème**, c’est un milieu de vie, des êtres vivants et les liens entre eux.',
      'Dans la **prédation**, un **prédateur** capture une **proie** pour la manger. Dans la **coopération**, les deux y gagnent : l’abeille et la fleur, par exemple !',
    ],
    source: `${PROGRAMME} : « Caractériser, à partir d’un exemple, un écosystème par son milieu de vie, l’ensemble des êtres vivants et les interactions en son sein » ; « Décrire plusieurs types de relations entre espèces au sein d’un écosystème (coopérations, prédation, etc.) » ; pollinisation, exemple de coopération ; proie, prédateur, mutualisme : Académie française.`,
    sources: [
      PROGRAMME,
      'academie-ecosysteme',
      'academie-proie',
      'academie-predateur',
      'academie-mutualisme',
      'cnrtl-symbiose',
    ],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
