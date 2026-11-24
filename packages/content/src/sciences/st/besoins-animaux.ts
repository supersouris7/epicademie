import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Les besoins des animaux : nourriture, régimes, chaînes alimentaires, besoins qui varient ———

type Regime = 'herbivore' | 'carnivore' | 'omnivore';

const REGIMES: Record<Regime, { sens: string; accepte: readonly string[] }> = {
  herbivore: { sens: 'des végétaux', accepte: ['herbivore', 'un herbivore', 'herbivores'] },
  carnivore: { sens: 'la chair d’autres animaux', accepte: ['carnivore', 'un carnivore', 'carnivores'] },
  omnivore: { sens: 'des végétaux et des animaux', accepte: ['omnivore', 'un omnivore', 'omnivores'] },
};
const CLES = Object.keys(REGIMES) as Regime[];

interface Repas {
  readonly qui: string;
  readonly menu: string;
  readonly regime: Regime;
  readonly dur?: true;
}

/** Menus donnés par l’énoncé (exemples d’élevage ou de balade) : le régime se déduit du menu. */
const REPAS: readonly Repas[] = [
  { qui: 'Le lapin de Noé', menu: 'de l’herbe, des carottes et des feuilles', regime: 'herbivore' },
  { qui: 'La chenille du jardin', menu: 'des feuilles de chou', regime: 'herbivore' },
  { qui: 'Le mouton du pré', menu: 'de l’herbe et du foin', regime: 'herbivore' },
  { qui: 'Le renard de l’histoire', menu: 'des lapins et des mulots', regime: 'carnivore' },
  { qui: 'La chouette de l’histoire', menu: 'des mulots', regime: 'carnivore' },
  { qui: 'La coccinelle du rosier', menu: 'des pucerons', regime: 'carnivore', dur: true },
  { qui: 'La grenouille de la mare', menu: 'des mouches et des vers', regime: 'carnivore', dur: true },
  { qui: 'Le sanglier de la forêt', menu: 'des glands, des racines et des vers', regime: 'omnivore', dur: true },
  { qui: 'L’ours du film', menu: 'des baies et des poissons', regime: 'omnivore' },
  { qui: 'La poule de la ferme', menu: 'des graines et des vers', regime: 'omnivore', dur: true },
];

const faux = (x: Regime) => ({
  label: x,
  why: `Un ${x} mange ${REGIMES[x].sens}. Compare avec le menu de l’animal.`,
});
const explique = (m: Repas) => [
  `Menu : ${m.menu}.`,
  `Un ${m.regime} mange ${REGIMES[m.regime].sens}.`,
  `Régime : **${m.regime}**.`,
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const m = rng.pick(REPAS.filter((x) => !x.dur));
  const { answer, traps: tr } = choice(rng, m.regime, CLES.filter((x) => x !== m.regime).map(faux));
  return {
    prompt: `${m.qui} mange seulement ${m.menu}. Quel est son régime ?`,
    answer,
    traps: tr,
    hint: 'Son repas vient-il de plantes, d’animaux, ou des deux ?',
    steps: explique(m),
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const trois = CLES.map((k) => rng.pick(REPAS.filter((m) => m.regime === k)));
    return {
      prompt: `Associe chaque menu au bon régime : ${trois.map((m) => m.menu).join(' ; ')}.`,
      answer: association(
        rng,
        trois.map((m) => [maj(m.menu), m.regime] as const),
      ),
      hint: 'Trie d’abord le menu qui mélange plantes et animaux.',
      steps: [...trois.map((m) => `${maj(m.menu)} : ${m.regime}.`), 'Chaque menu est relié à **son** régime.'],
      targetSeconds: 45,
    };
  }
  const bebe = rng.pick(['Un chiot', 'Un poussin', 'Un jeune lapin', 'Un chaton']);
  const bon = 'de nourriture venant d’autres êtres vivants';
  const { answer, traps: tr } = choice(rng, bon, [
    {
      label: 'de lumière seulement',
      why: 'La lumière sert aux végétaux pour fabriquer leur matière. Un animal doit manger.',
    },
    {
      label: 'de sels minéraux pris par des racines',
      why: 'Un animal n’a pas de racines : ce sont les végétaux qui en ont.',
    },
    { label: 'de rien du tout, il grandit tout seul', why: 'Pour fabriquer de la matière et grandir, il faut manger.' },
  ]);
  return {
    prompt: `${bebe} grandit. Pour fabriquer sa matière, de quoi a-t-il besoin ?`,
    answer,
    traps: tr,
    hint: 'Pense à ce que tu vois dans sa gamelle ou son bec : d’où cela vient-il ?',
    steps: [
      'Grandir, c’est fabriquer de la matière.',
      'Un animal fabrique sa matière grâce à ce qu’il mange.',
      `Il a besoin **${bon}**.`,
    ],
    targetSeconds: 30,
  };
};

interface Chaine {
  readonly maillons: readonly string[];
  readonly texte: string;
}

const CHAINES: readonly Chaine[] = [
  {
    maillons: ['l’herbe', 'la sauterelle', 'la grenouille', 'le héron'],
    texte: 'La grenouille mange la sauterelle. Le héron mange la grenouille. La sauterelle mange l’herbe.',
  },
  {
    maillons: ['la salade', 'l’escargot', 'le hérisson'],
    texte: 'Le hérisson mange l’escargot. L’escargot mange la salade.',
  },
  {
    maillons: ['les glands', 'le mulot', 'la chouette'],
    texte: 'La chouette mange le mulot. Le mulot mange les glands.',
  },
  {
    maillons: ['le rosier', 'le puceron', 'la coccinelle', 'la mésange'],
    texte: 'La mésange mange la coccinelle. Le puceron se nourrit du rosier. La coccinelle mange le puceron.',
  },
];

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const c = rng.pick(CHAINES);
    return {
      prompt: `${c.texte} Construis la chaîne alimentaire : commence par le végétal, puis ajoute celui qui le mange, et ainsi de suite.`,
      answer: ordre(rng, c.maillons),
      hint: 'Au début de la chaîne, il y a toujours un végétal.',
      steps: [
        'Le végétal est à la base de la chaîne.',
        'On ajoute ensuite celui qui mange le maillon d’avant.',
        `Chaîne : **${c.maillons.join(' → ')}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const m = rng.pick(REPAS);
  const { answer, traps: tr } = saisie(
    REGIMES[m.regime].accepte,
    CLES.filter((x) => x !== m.regime).map((x) => [x, faux(x).why] as const),
  );
  return {
    prompt: `${m.qui} mange seulement ${m.menu}. Écris le nom de son régime.`,
    answer,
    traps: tr,
    hint: 'Les trois mots finissent par « -vore ».',
    steps: explique(m),
    targetSeconds: 30,
  };
};

const RESEAUX: readonly { texte: string; base: string; pieges: readonly string[] }[] = [
  {
    texte:
      'La buse mange le mulot et le lézard. Le mulot mange des graines de blé. Le lézard mange des sauterelles. La sauterelle mange des feuilles de blé.',
    base: 'le blé',
    pieges: ['la buse', 'le mulot', 'la sauterelle'],
  },
  {
    texte:
      'La mésange mange des chenilles. La chenille mange les feuilles du chêne. L’épervier mange la mésange. L’écureuil mange les glands du chêne.',
    base: 'le chêne',
    pieges: ['l’épervier', 'la chenille', 'la mésange'],
  },
  {
    texte:
      'Le brochet mange le gardon. Le gardon mange de petits animaux de la mare. Ces petits animaux mangent des algues.',
    base: 'les algues',
    pieges: ['le brochet', 'le gardon'],
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const n = rng.pick(RESEAUX);
    const nu = n.base.replace(/^(le |la |les |l’)/, '');
    const { answer, traps: tr } = saisie(
      [n.base, nu],
      n.pieges.map(
        (p) => [p, `${maj(p)} mange un autre être vivant : la base, c’est le végétal, en début de chaîne.`] as const,
      ),
    );
    return {
      prompt: `${n.texte} Quel végétal est à la base de ce réseau ? Écris-le.`,
      answer,
      traps: tr,
      hint: 'Remonte chaque chaîne : qui est mangé sans manger un autre être vivant ?',
      steps: [
        'Un réseau alimentaire réunit plusieurs chaînes.',
        'Les végétaux sont à la base de ces chaînes.',
        `À la base : **${n.base}**.`,
      ],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const m = rng.pick(REPAS.filter((x) => x.dur));
    const { answer, traps: tr } = saisie(
      REGIMES[m.regime].accepte,
      CLES.filter((x) => x !== m.regime).map(
        (x) => [x, `Attention à la taille ou à l’allure de l’animal : seul le menu compte. ${faux(x).why}`] as const,
      ),
    );
    return {
      prompt: `Piège possible ! ${m.qui} mange ${m.menu}. Quel est son régime ? Écris un mot.`,
      answer,
      traps: tr,
      hint: 'Les petites bêtes aussi sont des animaux.',
      steps: explique(m),
      targetSeconds: 35,
    };
  }
  const animal = rng.pick(['chiens', 'lapins', 'chats']);
  return {
    prompt: `Deux ${animal} adultes se ressemblent. Moka court toute la journée, Filou dort presque tout le temps. Complète.`,
    answer: {
      kind: 'cloze',
      parts: [
        'Les besoins en nourriture les plus grands sont ceux de ',
        ', parce que son ',
        ' physique est plus forte.',
      ],
      blanks: [
        { mode: 'list', options: ['Filou', 'Moka'], correct: 1 },
        { mode: 'text', accepted: ['activité', 'activite'] },
      ],
    },
    hint: 'Qui dépense le plus en bougeant ? Le second mot commence par « acti ».',
    steps: [
      'Les besoins alimentaires changent avec la croissance et avec l’activité physique.',
      'Moka bouge beaucoup plus.',
      'Réponses : **Moka** et **activité**.',
    ],
    targetSeconds: 45,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const nom = rng.pick(['Pixel', 'Nougat', 'Réglisse']);
  const petit = rng.pick([120, 140, 150]);
  const grand = petit + rng.pick([90, 110, 130]);
  const course = grand + rng.pick([60, 80]);
  const figure = {
    kind: 'document' as const,
    title: `Le carnet de ${nom}, chien (exemple inventé)`,
    lines: [
      `À 2 mois, ${nom} reçoit ${petit} g de nourriture par jour.`,
      `Adulte et au repos, ${nom} reçoit ${grand} g par jour.`,
      `Adulte, les jours de grande randonnée, ${nom} reçoit ${course} g par jour.`,
      'Sa pâtée contient de la viande, des carottes et du riz.',
    ],
  };
  const sujet = `Lis le carnet de ${nom} (${petit} g, ${grand} g, ${course} g).`;
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: `${sujet} Combien de grammes en plus reçoit-il un jour de randonnée qu’un jour de repos, une fois adulte ?`,
      figure,
      answer: num(course - grand, 'g'),
      traps: traps(r(course - grand), [
        [course - petit, 'Tu as comparé avec le chiot de 2 mois. Compare les deux jours de l’adulte.'],
        [course + grand, 'On cherche un écart : il faut soustraire.'],
      ]),
      hint: 'Soustrais la ration du repos de celle de la randonnée.',
      steps: ['On compare deux jours de l’adulte.', `${course} − ${grand}.`, `En plus : **${course - grand} g**.`],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const bon = 'Son activité physique est plus grande';
    const { answer, traps: tr } = choice(rng, bon, [
      { label: 'Il est redevenu un chiot', why: 'Un adulte ne redevient pas jeune : c’est l’effort qui change.' },
      { label: 'Il n’a plus besoin de manger', why: 'Au contraire, sa ration augmente.' },
      { label: 'La pâtée remplace la lumière', why: 'Un animal a besoin de nourriture pour fabriquer sa matière.' },
    ]);
    return {
      prompt: `${sujet} Pourquoi reçoit-il plus à manger les jours de randonnée ?`,
      figure,
      answer,
      traps: tr,
      hint: 'Qu’est-ce qui est différent ce jour-là ?',
      steps: [
        'Les besoins alimentaires changent avec l’activité physique.',
        'Pendant la randonnée, il bouge beaucoup.',
        `Explication : **${bon}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const { answer, traps: tr } = saisie(REGIMES.omnivore.accepte, [
    ['carnivore', 'La pâtée contient de la viande, mais aussi des carottes et du riz.'],
    ['herbivore', 'La pâtée contient des végétaux, mais aussi de la viande.'],
  ]);
  return {
    prompt: `${sujet} D’après la composition de sa pâtée seulement, quel mot décrit ce menu : herbivore, carnivore ou omnivore ?`,
    figure,
    answer,
    traps: tr,
    hint: 'Relis la dernière ligne : d’où viennent les aliments ?',
    steps: [
      'La viande vient d’un animal ; les carottes et le riz viennent de végétaux.',
      'Manger les deux, c’est être omnivore.',
      'Ce menu est **omnivore**.',
    ],
    targetSeconds: 50,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const besoinsAnimaux: Skill = {
  id: 'vcm1-besoins-animaux',
  title: 'Les besoins des animaux',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un animal fabrique sa matière grâce à sa nourriture, prise à d’autres êtres vivants. Il est **herbivore** (végétaux), **carnivore** (animaux) ou **omnivore** (les deux).',
      'Les liens « qui mange qui » forment des **chaînes alimentaires**, avec un végétal à la base. Et les besoins changent avec la **croissance** et l’activité physique : qui court beaucoup mange plus !',
    ],
    source: `${PROGRAMME} : « Relier la production de matière par les animaux à leur consommation de nourriture provenant d’autres êtres vivants » ; « Représenter les liens alimentaires entre les êtres vivants par des chaînes formant un réseau » ; « Exploiter des données pour expliquer la variation des besoins alimentaires au cours de la croissance et selon l’activité physique » ; régimes : CNRTL et Académie française.`,
    sources: [PROGRAMME, 'cnrtl-herbivore', 'cnrtl-carnivore', 'cnrtl-omnivore'],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
