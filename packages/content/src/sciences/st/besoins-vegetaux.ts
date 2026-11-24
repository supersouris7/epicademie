import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, ordre, saisie } from './outils.ts';

// ——— Les besoins des végétaux : eau, lumière, sels minéraux, expériences (programme du cycle 3) ———

type Besoin = 'eau' | 'lumiere' | 'sels';

interface Fiche {
  readonly nom: string;
  readonly accepte: readonly string[];
  /** Scènes où la plante manque de ce besoin seulement. */
  readonly scenes: readonly string[];
  /** Pot témoin puis pot test : une seule différence. */
  readonly temoin: string;
  readonly test: string;
}

const BESOINS: Record<Besoin, Fiche> = {
  eau: {
    nom: 'd’eau',
    accepte: ['eau', 'l’eau', 'de l’eau', 'd’eau'],
    scenes: [
      'Personne n’a arrosé la plante depuis des semaines. La terre est toute sèche.',
      'Le radis est au soleil, dans une terre avec des sels minéraux. Mais on oublie toujours de l’arroser.',
    ],
    temoin: 'arrosé chaque semaine',
    test: 'jamais arrosé',
  },
  lumiere: {
    nom: 'de lumière',
    accepte: ['lumière', 'la lumière', 'de la lumière', 'de lumière', 'lumiere', 'la lumiere'],
    scenes: [
      'La plante est arrosée, mais on l’a enfermée dans un placard tout noir.',
      'On a posé une boîte fermée, sans aucun trou, sur le haricot bien arrosé.',
    ],
    temoin: 'posé près de la fenêtre',
    test: 'enfermé dans un placard noir',
  },
  sels: {
    nom: 'de sels minéraux',
    accepte: [
      'sels minéraux',
      'les sels minéraux',
      'des sels minéraux',
      'de sels minéraux',
      'sel minéral',
      'sels mineraux',
      'les sels mineraux',
      'des sels mineraux',
      'de sels mineraux',
      'sel mineral',
    ],
    scenes: [
      'La plante pousse dans du sable lavé, sans sels minéraux. Elle a de la lumière et de l’eau pure, sans aucune substance dissoute.',
      'Les racines trempent dans de l’eau pure, qui ne contient rien d’autre. La plante est près de la fenêtre.',
    ],
    temoin: 'arrosé avec de l’eau qui contient des sels minéraux',
    test: 'arrosé avec de l’eau pure, sans sels minéraux',
  },
};
const CLES = Object.keys(BESOINS) as Besoin[];

/** Autre besoin que l’on peut changer en même temps (« jamais arrosé » et « eau pure » se contrediraient). */
const compatibles = (b: Besoin): readonly Besoin[] => (b === 'lumiere' ? ['eau', 'sels'] : ['lumiere']);

/** Quand les sels sont testés, la terre fausserait l’expérience : elle en apporte. Même support partout. */
const SABLE = 'le même sable lavé, sans sels minéraux';
const support = (b: Besoin, ...autres: readonly Besoin[]) => {
  if (b === 'sels') return ` Chaque pot contient ${SABLE}.`;
  // Sels changés dans un autre pot seulement : le témoin doit en recevoir.
  return autres.includes('sels')
    ? ` Chaque pot contient ${SABLE}. Sauf mention contraire, on arrose avec de l’eau qui contient des sels minéraux.`
    : '';
};

/** « Soleil » au lieu de « lumière » : erreur fréquente, expliquée. */
const soleil = (b: Besoin) =>
  b === 'lumiere'
    ? ['soleil', 'le soleil', 'du soleil', 'de soleil'].map(
        (t) => [t, 'Le Soleil est un astre. La plante a besoin de ce qu’il envoie : écris ce mot.'] as const,
      )
    : [];

const ANIMAL = {
  label: 'de nourriture prise à un animal',
  why: 'Ce sont les animaux qui mangent d’autres êtres vivants. La plante a besoin de lumière, d’eau et de sels minéraux.',
};
const mauvais = (b: Besoin) => ({
  label: BESOINS[b].nom,
  why: `Dans cette situation, la plante ne manque pas ${BESOINS[b].nom} : relis ce qui a changé.`,
});

const qcmBesoin = (rng: Rng, b: Besoin, prompt: string, avecIntrus: boolean): QuestionDraft => {
  const wrong = [...CLES.filter((x) => x !== b).map(mauvais), ...(avecIntrus ? [ANIMAL] : [])];
  const { answer, traps: tr } = choice(rng, BESOINS[b].nom, wrong);
  return {
    prompt,
    answer,
    traps: tr,
    hint: 'Cherche ce que la plante n’a plus.',
    steps: [
      'Pour vivre et grandir, une plante a des besoins.',
      'On cherche ce qui lui manque ici.',
      `Elle manque **${BESOINS[b].nom}**.`,
    ],
    targetSeconds: 25,
  };
};

const niveau1 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 3) === 0) {
    const { answer, traps: tr } = choice(rng, 'les racines', [
      {
        label: 'les fleurs',
        why: 'Les fleurs servent à la reproduction. Ce sont les racines qui boivent dans le sol.',
      },
      {
        label: 'les fruits',
        why: 'Les fruits viennent après les fleurs. Ce sont les racines qui boivent dans le sol.',
      },
    ]);
    return {
      prompt: 'Quelle partie de la plante prend l’eau et les sels minéraux dans le sol ?',
      answer,
      traps: tr,
      hint: 'C’est la partie qui est le plus souvent cachée sous la terre.',
      steps: ['Cette partie fixe la plante dans le sol.', 'Elle l’alimente aussi en eau.', 'Ce sont **les racines**.'],
      targetSeconds: 20,
    };
  }
  const b = rng.pick(CLES);
  return qcmBesoin(rng, b, `${rng.pick(BESOINS[b].scenes)} De quoi la plante manque-t-elle ?`, false);
};

const experience = (b: Besoin) =>
  `Deux pots avec la même plante.${support(b)} Pot A : ${BESOINS[b].temoin}. Pot B : ${BESOINS[b].test}. Tout le reste est pareil.`;

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const b = rng.pick(CLES);
    return qcmBesoin(rng, b, `${experience(b)} Quel besoin teste-t-on ? La plante B manque…`, true);
  }
  const ordreAleatoire = rng.shuffle(CLES);
  return {
    prompt: `Chaque pot contient ${SABLE}. Associe chaque pot au besoin testé : ${ordreAleatoire.map((b) => BESOINS[b].test).join(' ; ')}.`,
    answer: association(
      rng,
      ordreAleatoire.map((b) => [`Pot ${BESOINS[b].test}`, `Besoin ${BESOINS[b].nom}`] as const),
    ),
    hint: 'Pour chaque pot, demande-toi ce qu’on lui enlève.',
    steps: [
      'Chaque expérience enlève une seule chose à la plante.',
      'Ce qu’on enlève, c’est le besoin testé.',
      'Chaque pot est relié à **son** besoin.',
    ],
    targetSeconds: 45,
  };
};

const PROTOCOLE = (b: Besoin) => [
  `Préparer deux pots avec la même plante${b === 'sels' ? `, dans ${SABLE}` : ''}`,
  `Changer une seule chose : un pot ${b === 'eau' ? 'n’est' : 'est'} ${BESOINS[b].test}`,
  'Attendre plusieurs jours en observant',
  'Comparer les deux plantes et conclure',
];

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  const b = rng.pick(CLES);
  if (t === 0) {
    const etapes = PROTOCOLE(b);
    return {
      prompt: `Tu mènes l’enquête sur le besoin ${BESOINS[b].nom}. Remets les étapes de l’expérience dans l’ordre.`,
      answer: ordre(rng, etapes),
      hint: 'On prépare avant de changer, et on conclut tout à la fin.',
      steps: ['Une expérience suit une démarche logique.', `Ordre : **${etapes.join(' → ')}**.`],
      targetSeconds: 50,
    };
  }
  if (t === 1) {
    return {
      prompt: 'Complète la phrase sur les racines.',
      answer: {
        kind: 'cloze',
        parts: ['Les racines fixent la plante dans le sol. Elles prennent l’', ' et les sels ', '.'],
        blanks: [
          { mode: 'text', accepted: ['eau'] },
          { mode: 'text', accepted: ['minéraux', 'mineraux'] },
        ],
      },
      hint: 'Que boit la plante ? Et quels sels trouve-t-on dans le sol ? Relis le mémo.',
      steps: [
        'Les racines servent à la fixation et à l’alimentation de la plante.',
        'Les racines prennent l’**eau** et les sels **minéraux**.',
      ],
      targetSeconds: 35,
    };
  }
  const { answer, traps: tr } = saisie(BESOINS[b].accepte, [
    ...CLES.filter((x) => x !== b).map((x) => [BESOINS[x].accepte[0] ?? '', mauvais(x).why] as const),
    ...soleil(b),
  ]);
  return {
    prompt: `${rng.pick(BESOINS[b].scenes)} Écris ce qui manque à la plante.`,
    answer,
    traps: tr,
    hint: 'Pense aux trois besoins du mémo.',
    steps: ['On cherche ce qui manque.', `Il manque **${BESOINS[b].accepte[1]}** à la plante.`],
    targetSeconds: 30,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const b = rng.pick(CLES);
  if (rng.int(0, 1) === 0) {
    const { answer, traps: tr } = saisie(BESOINS[b].accepte, [
      ...CLES.filter((x) => x !== b).map(
        (x) =>
          [
            BESOINS[x].accepte[0] ?? '',
            `C’est pareil pour les deux pots sur ce point : on ne teste pas le besoin ${BESOINS[x].nom}.`,
          ] as const,
      ),
      ...soleil(b),
    ]);
    const plante = rng.pick(['des haricots', 'des radis', 'des lentilles']);
    return {
      prompt: `Lina sème ${plante} dans deux pots de même taille, avec ${b === 'sels' ? SABLE : 'la même terre'}. Pot A : ${BESOINS[b].temoin}. Pot B : ${BESOINS[b].test}. Quel besoin teste-t-elle ? Écris-le.`,
      answer,
      traps: tr,
      hint: 'Barre tout ce qui est pareil. Que reste-t-il ?',
      steps: [
        'On cherche la seule différence entre les deux pots.',
        `Pot A : ${BESOINS[b].temoin}. Pot B : ${BESOINS[b].test}.`,
        `Besoin testé : **${BESOINS[b].accepte[1]}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const x = rng.pick(compatibles(b));
  const y = rng.pick(CLES.filter((k) => k !== b));
  const bon = `un pot ${BESOINS[b].test}, tout le reste pareil`;
  const { answer, traps: tr } = choice(rng, bon, [
    {
      label: `un pot ${BESOINS[b].test} et ${BESOINS[x].test}`,
      why: 'Deux choses changent à la fois : on ne saura pas laquelle a gêné la plante.',
    },
    {
      label: `un pot ${BESOINS[y].test}, tout le reste pareil`,
      why: `Ce pot teste le besoin ${BESOINS[y].nom}, pas le besoin ${BESOINS[b].nom}.`,
    },
    {
      label: `un pot ${BESOINS[b].temoin}, tout le reste pareil`,
      why: 'Ce pot est identique au pot témoin : rien ne change, on ne teste rien.',
    },
  ]);
  return {
    prompt: `Le pot témoin est ${BESOINS[b].temoin}, avec tout ce qu’il faut.${support(b, x, y)} Pour tester le besoin ${BESOINS[b].nom}, avec quel pot le comparer ?`,
    answer,
    traps: tr,
    hint: 'Une bonne expérience ne change qu’une seule chose.',
    steps: [
      'Pour tester un besoin, on ne change qu’une chose.',
      `Ici, on change seulement ce qui concerne le besoin ${BESOINS[b].nom}.`,
      `Il faut **${bon}**.`,
    ],
    targetSeconds: 60,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  // À l’obscurité, une plante peut s’allonger plus que le témoin : la hauteur ne compare que l’eau et les sels.
  const b = rng.pick(t === 0 ? CLES.filter((k) => k !== 'lumiere') : CLES);
  const x = rng.pick(compatibles(b));
  const bas = rng.pick([4, 5, 6]);
  const haut = bas + rng.pick([7, 9, 11]);
  const etatA = `${haut} cm, feuilles vertes`;
  const etatB = b === 'lumiere' ? 'tige longue et fine, feuilles jaunes' : `${bas} cm, plante abîmée`;
  const figure = {
    kind: 'document' as const,
    title: 'Carnet d’expérience (exemple inventé)',
    lines: [
      `Trois pots avec la même plante, de 3 cm au départ.${support(b, x)}`,
      `Pot A : ${BESOINS[b].temoin}, avec tout ce qu’il faut. Après 15 jours : ${etatA}.`,
      `Pot B : ${BESOINS[b].test}, le reste comme A. Après 15 jours : ${etatB}.`,
      `Pot C : ${BESOINS[b].test} et ${BESOINS[x].test}. Après 15 jours : plante abîmée.`,
    ],
  };
  const sujet = `Lis le carnet (pot B ${BESOINS[b].test} ; après 15 jours, A : ${etatA} ; B : ${etatB}).${support(b, x)}`;
  if (t === 0) {
    return {
      prompt: `${sujet} De combien de centimètres la plante A dépasse-t-elle la plante B ?`,
      figure,
      answer: num(haut - bas, 'cm'),
      traps: traps(r(haut - bas), [
        [haut + bas, 'On compare deux hauteurs : il faut soustraire, pas additionner.'],
        [haut - 3, 'Tu as calculé ce que la plante A a grandi depuis le départ. Compare A avec B.'],
      ]),
      hint: 'Fais une soustraction entre les deux hauteurs après 15 jours.',
      steps: ['On compare les hauteurs de A et de B.', `${haut} − ${bas}.`, `Écart : **${haut - bas} cm**.`],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const wrong = CLES.filter((k) => k !== b).map((k) => ({
      label: `La plante a besoin ${BESOINS[k].nom}`,
      why: `Entre A et B, rien ne change à ce sujet : la comparaison ne dit rien du besoin ${BESOINS[k].nom}.`,
    }));
    const bon = `La plante a besoin ${BESOINS[b].nom}`;
    const { answer, traps: tr } = choice(rng, bon, [
      ...wrong,
      {
        label: 'La plante n’a aucun besoin',
        why: 'La plante B va moins bien que la plante A : il lui manquait quelque chose.',
      },
    ]);
    return {
      prompt: `${sujet} Que peux-tu conclure en comparant A et B ?`,
      figure,
      answer,
      traps: tr,
      hint: 'Cherche la seule différence entre A et B.',
      steps: [
        'Entre A et B, une seule chose change.',
        'La plante B va moins bien que la plante A.',
        `Conclusion : **${bon}**.`,
      ],
      targetSeconds: 60,
    };
  }
  const { answer, traps: tr } = choice(rng, 'A et C', [
    { label: 'A et B', why: 'Entre A et B, une seule chose change : cette comparaison permet de conclure.' },
    { label: 'Aucune', why: 'Regarde A et C : combien de choses changent entre ces deux pots ?' },
  ]);
  return {
    prompt: `${sujet} Quelle comparaison ne permet pas de savoir ce qui a gêné la plante ?`,
    figure,
    answer,
    traps: tr,
    hint: 'Compte les différences entre les pots.',
    steps: [
      'Pour conclure, il faut une seule différence.',
      'Entre A et C, deux choses changent à la fois.',
      'On ne peut pas conclure avec **A et C**.',
    ],
    targetSeconds: 60,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const besoinsVegetaux: Skill = {
  id: 'vcm1-besoins-vegetaux',
  title: 'Les besoins des végétaux',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **végétal** a notamment besoin de lumière, d’eau et de **sels minéraux**. Ses **racines** prennent l’eau et les sels minéraux.',
      'Pour vérifier un besoin, fais une expérience : deux pots pareils, et une seule chose qui change. Tu compares avec le **pot témoin** !',
    ],
    source: `${PROGRAMME} : « Expérimenter pour identifier quelques besoins des végétaux » ; racines, eau et sels minéraux ; plante privée de lumière (« étioler ») : Trésor de la langue française (CNRTL).`,
    sources: [PROGRAMME, 'cnrtl-racine', 'cnrtl-etioler'],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
