import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, saisie } from './outils.ts';

// ——— Sécurité électrique : risques domestiques et bons gestes (cours moyen) ———

interface Geste {
  readonly texte: string;
  /** Le même geste raconté (document du niveau 5). */
  readonly recit: string;
  readonly why: string;
}

export const DANGERS: readonly Geste[] = [
  {
    texte: 'utiliser un appareil branché avec les mains mouillées',
    recit: 'Il utilise un appareil branché avec les mains mouillées.',
    why: 'Avec la peau humide, le courant de la maison peut électrocuter.',
  },
  {
    texte: 'utiliser un sèche-cheveux branché dans la baignoire',
    recit: 'Dans la baignoire, il utilise un sèche-cheveux branché.',
    why: 'Dans une baignoire, le courant de la maison peut électrocuter.',
  },
  {
    texte: 'enfoncer un clou dans une prise',
    recit: 'Il enfonce un clou dans une prise.',
    why: 'La prise est reliée au réseau électrique et le métal conduit le courant.',
  },
  {
    texte: 'toucher un fil dont la gaine est abîmée',
    recit: 'Il touche un fil dont la gaine est abîmée.',
    why: 'La gaine isole le fil. Abîmée, elle ne protège plus.',
  },
];
export const BONS_GESTES: readonly Geste[] = [
  {
    texte: 'te sécher les mains avant de toucher un appareil',
    recit: 'Il se sèche les mains avant de toucher un appareil.',
    why: 'Une peau humide augmente le risque : les mains sèches, c’est mieux.',
  },
  {
    texte: 'prévenir un adulte quand un fil est abîmé',
    recit: 'Il voit un fil abîmé et prévient un adulte.',
    why: 'Une installation en mauvais état est dangereuse : un adulte doit agir.',
  },
  {
    texte: 'faire tes expériences de circuit avec une pile',
    recit: 'Pour son expérience de circuit, il prend une pile.',
    why: 'En classe, le circuit se fait avec une pile, jamais avec la prise.',
  },
  {
    texte: 'laisser la prise tranquille quand tu joues',
    recit: 'Il joue et laisse la prise tranquille.',
    why: 'La prise est reliée au réseau électrique : ce n’est pas un jouet.',
  },
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const bon = rng.pick(BONS_GESTES);
  const faux = rng.shuffle(DANGERS).slice(0, 2);
  const { answer, traps: tr } = choice(
    rng,
    bon.texte,
    faux.map((f) => ({ label: f.texte, why: f.why })),
  );
  return {
    prompt: 'Quel geste est le bon réflexe ?',
    answer,
    traps: tr,
    hint: 'Écarte ce qui mélange l’eau, le métal ou un fil abîmé avec l’électricité.',
    steps: ['On cherche le geste qui protège.', bon.why, `Le bon réflexe : **${bon.texte}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const danger = rng.pick(DANGERS);
  const faux = rng.shuffle(BONS_GESTES).slice(0, 3);
  const { answer, traps: tr } = choice(
    rng,
    danger.texte,
    faux.map((f) => ({ label: f.texte, why: `C’est un bon geste. ${f.why}` })),
  );
  return {
    prompt: 'Attention, un seul de ces gestes est dangereux. Lequel ?',
    answer,
    traps: tr,
    hint: 'Cherche un geste où le courant pourrait passer par ton corps.',
    steps: ['Trois gestes protègent, un seul met en danger.', danger.why, `Le danger : **${danger.texte}**.`],
    targetSeconds: 30,
  };
};

const PHRASES = [
  {
    debut: 'En classe, pour faire une expérience de circuit électrique, tu utilises une',
    fin: '.',
    bon: 'pile',
    faux: [['prise', 'La prise délivre le courant de la maison, qui peut tuer. En classe, on prend une pile.']],
    why: 'Le programme prévoit un circuit avec une pile.',
  },
  {
    debut: 'L’enveloppe isolante qui entoure un fil électrique s’appelle la',
    fin: '.',
    bon: 'gaine',
    faux: [['prise', 'La prise est le dispositif au mur relié au réseau ; l’enveloppe du fil est la gaine.']],
    why: 'La gaine isole le fil.',
  },
  {
    debut: 'Si le courant traverse le corps, cela peut être',
    fin: ' : on parle d’électrocution.',
    bon: 'mortel',
    faux: [['sans danger', 'Non, au contraire : le courant sur le corps peut tuer.']],
    why: 'L’électrocution est l’action, qui peut être mortelle, du courant sur le corps.',
  },
] as const;

const niveau3 = (rng: Rng): QuestionDraft => {
  const p = rng.pick(PHRASES);
  const { answer, traps: tr } = saisie(
    p.bon === 'mortel' ? [p.bon, 'mortelle', 'dangereux'] : [p.bon, `une ${p.bon}`, `la ${p.bon}`],
    p.faux,
  );
  return {
    prompt: `Complète : ${p.debut} …${p.fin}`,
    answer,
    traps: tr,
    hint: 'Pense aux règles de sécurité vues avec l’électricité.',
    steps: [p.why, `Réponse : **${p.bon}**.`],
    targetSeconds: 30,
  };
};

const PAIRES: readonly (readonly [string, string])[] = [
  ['un disjoncteur', 'coupe le circuit en cas d’anomalie'],
  ['un court-circuit', 'peut chauffer dangereusement les fils'],
  ['la gaine', 'isole le fil'],
  ['l’électrocution', 'action du courant sur le corps, parfois mortelle'],
  ['la prise', 'reliée au réseau électrique'],
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Relie chaque mot de la sécurité électrique à ce qui le décrit.',
      answer: association(rng, PAIRES),
      hint: 'Commence par les mots qui désignent un objet de la maison.',
      steps: [
        'Disjoncteur, gaine et prise sont des objets ; court-circuit et électrocution sont des dangers.',
        'Chaque mot est relié à **sa** description.',
      ],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const gestes = rng.shuffle([...rng.shuffle(DANGERS).slice(0, 2), ...rng.shuffle(BONS_GESTES).slice(0, 2)]);
    return {
      prompt: `Classe ces gestes : ${gestes.map((g, i) => `${i + 1}) ${g.texte}`).join(' ; ')}.`,
      answer: {
        kind: 'cloze',
        parts: [...gestes.map((_, i) => `${i === 0 ? '' : ' ; '}Geste ${i + 1} : `), '.'],
        blanks: gestes.map((g) => ({
          mode: 'list' as const,
          options: ['dangereux', 'bon réflexe'],
          correct: DANGERS.includes(g) ? 0 : 1,
        })),
      },
      hint: 'L’eau, le métal dans une prise et un fil abîmé sont des alertes.',
      steps: [
        'Un geste est dangereux s’il laisse le courant atteindre ton corps.',
        `**${gestes.map((g, i) => `${i + 1} : ${DANGERS.includes(g) ? 'dangereux' : 'bon réflexe'}`).join(' ; ')}**.`,
      ],
      targetSeconds: 60,
    };
  }
  const x = rng.pick([
    {
      q: 'Quel appareil coupe un circuit électrique en cas d’anomalie ?',
      bon: ['disjoncteur', 'le disjoncteur', 'un disjoncteur'],
      faux: [
        ['prise', 'La prise permet de brancher un appareil ; elle ne coupe pas tout seule.'],
        ['gaine', 'La gaine isole le fil ; elle ne coupe pas le circuit.'],
      ],
      reponse: 'le disjoncteur',
    },
    {
      q: 'Comment appelle-t-on l’action, parfois mortelle, du courant électrique sur le corps ?',
      bon: ['électrocution', 'une électrocution', 'l’électrocution', 'electrocution'],
      faux: [
        [
          'court-circuit',
          'Un court-circuit est un contact entre deux conducteurs d’un circuit, pas un effet sur le corps.',
        ],
        ['disjoncteur', 'Le disjoncteur est un appareil qui protège le circuit.'],
      ],
      reponse: 'l’électrocution',
    },
    {
      q: 'Un contact entre deux fils fait chauffer dangereusement un circuit. Comment l’appelle-t-on ?',
      bon: ['court-circuit', 'un court-circuit', 'le court-circuit', 'court circuit'],
      faux: [
        ['disjoncteur', 'Le disjoncteur coupe le circuit en cas d’anomalie ; ce n’est pas le contact lui-même.'],
        ['électrocution', 'L’électrocution est l’action du courant sur un corps.'],
      ],
      reponse: 'le court-circuit',
    },
  ] as const);
  const { answer, traps: tr } = saisie(x.bon, x.faux);
  return {
    prompt: x.q,
    answer,
    traps: tr,
    hint: 'Pense aux mots du mémo : un appareil qui protège, un effet sur le corps, un contact entre fils.',
    steps: ['On cherche le mot exact.', `C’est **${x.reponse}**.`],
    targetSeconds: 35,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const nb = rng.int(1, 3);
  const gestes = rng.shuffle([...rng.shuffle(DANGERS).slice(0, nb), ...rng.shuffle(BONS_GESTES).slice(0, 4 - nb)]);
  const figure = {
    kind: 'document' as const,
    title: 'Une soirée d’un enfant à la maison',
    lines: gestes.map((g) => g.recit),
  };
  if (rng.int(0, 1) === 0 || nb !== 1) {
    return {
      prompt: 'Lis le récit. Combien de gestes dangereux y trouves-tu ?',
      figure,
      answer: num(nb),
      traps: traps(r(nb), [
        [gestes.length, 'Tu as compté toutes les lignes. Certains gestes protègent.'],
        [gestes.length - nb, 'C’est le nombre de bons réflexes. On demande les dangers.'],
      ]),
      hint: 'Vérifie ligne par ligne : eau, métal dans une prise, fil abîmé.',
      steps: [
        `Les dangers : ${gestes
          .filter((g) => DANGERS.includes(g))
          .map((g) => g.texte)
          .join(' ; ')}.`,
        `Il y en a **${nb}**.`,
      ],
      targetSeconds: 60,
    };
  }
  const ligne = gestes.findIndex((g) => DANGERS.includes(g)) + 1;
  const danger = gestes[ligne - 1] ?? rng.pick(DANGERS);
  return {
    prompt: 'Lis le récit. Un seul geste est dangereux. Quel est le numéro de sa ligne ?',
    figure,
    answer: num(ligne),
    traps: traps(r(ligne), [
      [ligne === 1 ? 2 : 1, 'Cette ligne décrit un bon réflexe. Relis chaque geste.'],
      [ligne === 4 ? 3 : 4, 'Cette ligne décrit un bon réflexe. Cherche l’eau, le métal ou le fil abîmé.'],
    ]),
    hint: 'Les lignes sont numérotées : cherche celle qui met l’enfant en danger.',
    steps: [danger.why, `C’est la ligne **${ligne}**.`],
    targetSeconds: 55,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const securiteElectrique: Skill = {
  id: 'tcm2-securite-electrique',
  title: 'La sécurité électrique',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le courant de la maison peut tuer : c’est l’**électrocution**. Mains mouillées, bain, objet dans une prise, fil à la **gaine** abîmée : stop, et préviens un adulte !',
      'Un **court-circuit** peut faire chauffer les fils ; le **disjoncteur** coupe le circuit en cas d’anomalie. Pour tes expériences, prends une pile, jamais la prise.',
    ],
    source: `${PROGRAMME} : « Rechercher des informations sur les règles de sécurité électrique et les prendre en compte dans son activité » ; « sensibilisation des élèves aux risques électriques domestiques » ; circuit « associant un générateur (pile) ». Académie française : électrocution, « Action, qui peut être mortelle, du courant électrique sur un organisme » ; disjoncteur, « Interrupteur qui assure en cas d’anomalie la coupure d’un circuit électrique » ; prise, « relié de façon permanente au réseau électrique » ; métal, « généralement bon conducteur de la chaleur et de l’électricité ». CNRTL : électrocution, « Les courants domestiques : 120 et 240 volts peuvent provoquer l’électrocution si la peau du sujet est humide […] (sujet dans une baignoire) » ; court-circuit, « une élévation dangereuse de la température des conducteurs » ; gaine, « Enveloppe isolante d’un fil, d’un câble ». Ministère de la Transition écologique : « Une installation électrique défaillante représente un risque important d’électrisation ».`,
    sources: [
      PROGRAMME,
      'academie-electrocution',
      'cnrtl-electrocution',
      'academie-disjoncteur',
      'academie-prise',
      'academie-metal',
      'cnrtl-court-circuit',
      'cnrtl-gaine',
      'ecologie-securite-installations',
    ],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
