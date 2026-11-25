import { choice, num, traps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { references } from './donnees-matiere.ts';

// ——— Conservation de la masse : changements d'état et mélanges (5e) ———

const CHANGEMENTS: readonly { corps: string; changement: string }[] = [
  { corps: 'Un glaçon', changement: 'sa fusion complète' },
  { corps: 'Un morceau de beurre', changement: 'sa fusion complète' },
  { corps: 'Une portion d’eau liquide', changement: 'sa solidification complète' },
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CHANGEMENTS);
  const m = rng.int(2, 20) * 5;
  const { answer, traps: t } = choice(rng, `${m} g`, [
    { label: `Moins de ${m} g`, why: 'Au cours d’un changement d’état, aucune matière ne disparaît.' },
    { label: `Plus de ${m} g`, why: 'Aucune matière n’est ajoutée au cours d’un changement d’état.' },
  ]);
  return {
    prompt: `${c.corps} de ${m} g est dans un récipient fermé. Quelle est sa masse après ${c.changement} ?`,
    answer,
    traps: t,
    hint: 'La matière change d’état : y en a-t-il plus ou moins ?',
    steps: ['Au cours d’un changement d’état, la masse se conserve.', `La masse reste **${m} g**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const [nom, sens] = rng.pick([
    ['la fusion', 'solide → liquide'],
    ['la solidification', 'liquide → solide'],
    ['la vaporisation', 'liquide → gaz, sans que rien ne s’échappe'],
    ['la liquéfaction', 'gaz → liquide, sans que rien ne s’échappe'],
  ] as const);
  const masse = rng.int(0, 1) === 0;
  const bon = masse ? 'La masse reste la même' : 'Le volume peut changer';
  const { answer, traps: t } = choice(
    rng,
    bon,
    masse
      ? [
          { label: 'La masse augmente', why: 'Aucune matière n’est ajoutée au cours d’un changement d’état.' },
          { label: 'La masse diminue', why: 'Si rien ne s’échappe, aucune matière ne se perd.' },
        ]
      : [
          { label: 'Le volume reste forcément le même', why: 'C’est la masse qui se conserve, pas le volume.' },
          {
            label: 'Le volume reste le même puisque la masse se conserve',
            why: 'La conservation de la masse ne dit pas que le volume se conserve.',
          },
        ],
  );
  const grandeur = masse ? 'la masse' : 'le volume';
  return {
    prompt: `Pendant ${nom} (${sens}), que peut-on dire sur ${grandeur} de la substance ?`,
    answer,
    traps: t,
    hint: 'Distingue ce qui compte la matière et ce qui mesure la place occupée.',
    steps: [
      'Un changement d’état conserve la masse, mais pas forcément le volume.',
      `Réponse : **${bon.toLowerCase()}**.`,
    ],
    targetSeconds: 35,
  };
};

const SOLIDES = ['sel', 'sucre'] as const;

const niveau3 = (rng: Rng): QuestionDraft => {
  const solide = rng.pick(SOLIDES);
  const eau = rng.int(2, 18) * 25;
  // Le sel reste sous 30 % de la masse d'eau : au-delà, il ne se dissoudrait pas entièrement.
  const maxi = solide === 'sel' ? Math.min(8, Math.floor((eau * 3) / 50)) : 8;
  const s = rng.int(1, maxi) * 5;
  if (rng.int(0, 2) === 0) {
    const m = rng.int(10, 90);
    return {
      prompt: `On fait fondre ${m} g de glace dans un bécher. Quelle est la masse de l’eau liquide obtenue, en grammes ?`,
      answer: num(m, 'g'),
      traps: traps(r(m), [
        [m - 1, 'La masse se conserve pendant la fusion : rien ne se perd.'],
        [m * 2, 'La fusion n’ajoute aucune matière.'],
      ]),
      hint: 'La matière change d’état, sa quantité ne change pas.',
      steps: ['La masse se conserve lors d’un changement d’état.', `Masse d’eau : **${m} g**.`],
      targetSeconds: 30,
    };
  }
  return {
    prompt: `On dissout ${s} g de ${solide} dans ${eau} g d’eau. Quelle est la masse du mélange, en grammes ?`,
    answer: num(eau + s, 'g'),
    traps: traps(r(eau + s), [
      [eau, `Le ${solide} dissous est toujours là : sa masse compte.`],
      [eau - s, 'La dissolution ne fait pas perdre de masse : on additionne.'],
    ]),
    hint: 'La matière dissoute n’a pas disparu.',
    steps: ['La masse totale se conserve lors d’un mélange.', `${eau} + ${s} = **${eau + s} g**.`],
    targetSeconds: 40,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 2);
  if (type === 0) {
    const flacon = rng.int(4, 20) * 10;
    const eau = rng.int(2, 9) * 50;
    const total = flacon + eau;
    return {
      prompt: `Un flacon fermé vide a une masse de ${flacon} g. Avec de l’eau, sa masse est de ${total} g. On congèle toute l’eau. Quelle est la masse de la glace, en grammes ?`,
      answer: num(eau, 'g'),
      traps: traps(r(eau), [
        [total, 'C’est la masse du flacon et de son contenu : il faut retirer celle du flacon.'],
        [flacon, 'C’est la masse du flacon vide.'],
      ]),
      hint: 'La masse de l’eau ne change pas ; trouve-la avant la congélation.',
      steps: [
        `Masse d’eau : ${total} − ${flacon} = ${eau} g.`,
        `La masse se conserve : la masse de la glace est de **${eau} g**.`,
      ],
      targetSeconds: 60,
    };
  }
  if (type === 1) {
    const kg = rng.int(1, 3);
    const s = rng.int(2, 30) * 10;
    const total = kg * 1000 + s;
    return {
      prompt: `On dissout ${s} g de sel dans ${kg} kg d’eau. Quelle est la masse de l’eau salée, en grammes ?`,
      answer: num(total, 'g'),
      traps: traps(r(total), [
        [kg + s, 'Convertis d’abord les kilogrammes en grammes : 1 kg = 1 000 g.'],
        [kg * 1000, 'Il faut aussi compter la masse du sel dissous.'],
      ]),
      hint: 'Mets les deux masses dans la même unité.',
      steps: [`${kg} kg = ${kg * 1000} g.`, `La masse se conserve : ${kg * 1000} + ${s} = **${total} g**.`],
      targetSeconds: 70,
    };
  }
  const phrase = rng.pick([
    { texte: 'En gelant, l’eau change de volume : sa masse change donc aussi.', rep: 'non' },
    { texte: 'Le sel dissous ne se voit plus : la masse du mélange est donc seulement celle de l’eau.', rep: 'non' },
    {
      texte:
        'Si rien ne s’échappe du montage, la masse est la même après avoir fait bouillir l’eau puis liquéfié toute la vapeur.',
      rep: 'oui',
    },
  ]);
  const { answer, traps: t } = saisie(
    [phrase.rep],
    [
      [
        phrase.rep === 'oui' ? 'non' : 'oui',
        'La masse se conserve lors d’un changement d’état ou d’un mélange, même si le volume ou l’aspect changent.',
      ],
    ],
  );
  return {
    prompt: `Un élève affirme : « ${phrase.texte} » A-t-il raison ? Réponds par oui ou non.`,
    answer,
    traps: t,
    hint: 'Sépare la question de la masse de celle du volume ou de l’aspect.',
    steps: ['La masse se conserve ; le volume, lui, peut changer.', `La réponse est **${phrase.rep}**.`],
    targetSeconds: 50,
  };
};

/** Changements d'état à variation de volume réaliste (au plus 15 %) : masse et volumes pour une portion (données). */
const EXPERIENCES = [
  { corps: 'de la glace', nom: 'la fusion', apres: 'l’eau liquide', m: 92, avant: 100, ensuite: 92 },
  { corps: 'de l’eau liquide', nom: 'la solidification', apres: 'la glace', m: 92, avant: 92, ensuite: 100 },
  { corps: 'une cire solide', nom: 'la fusion', apres: 'la cire liquide', m: 90, avant: 100, ensuite: 110 },
  { corps: 'une cire liquide', nom: 'la solidification', apres: 'la cire solide', m: 90, avant: 110, ensuite: 100 },
] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  const e = rng.pick(EXPERIENCES);
  const k = rng.int(1, 6);
  const [m, avant, ensuite, boite] = [e.m * k, e.avant * k, e.ensuite * k, rng.int(4, 15) * 10];
  const figure = {
    kind: 'document' as const,
    title: 'Expérience (données de l’exercice)',
    lines: [
      `Un récipient vide a une masse de ${boite} g.`,
      `Avec ${e.corps}, sa masse est de ${boite + m} g. Volume avant : ${avant} cm³.`,
      `Après ${e.nom}, sans que rien ne s’échappe : volume ${ensuite} cm³.`,
    ],
  };
  // La masse n’est demandée que si elle diffère du volume final : sinon, recopier le volume donnerait la réponse.
  if (e.m !== e.ensuite && rng.int(0, 1) === 0) {
    return {
      prompt: `Lis l’expérience. Quelle est la masse de ${e.apres} après le changement d’état, en grammes ?`,
      figure,
      answer: num(m, 'g'),
      traps: traps(r(m), [
        [boite + m, 'C’est la masse du récipient et de son contenu : retire celle du récipient.'],
        [ensuite, 'C’est un volume en cm³ : on demande une masse.'],
      ]),
      hint: 'Trouve la masse du contenu avant le changement d’état.',
      steps: [
        `Masse avant : ${boite + m} − ${boite} = ${m} g.`,
        'Le changement d’état conserve la masse, même si le volume change.',
        `Masse obtenue : **${m} g**.`,
      ],
      targetSeconds: 100,
    };
  }
  const plus = ensuite < avant;
  const bon = `Non : après, 1 cm³ a une masse plus ${plus ? 'grande' : 'petite'}`;
  const { answer, traps: t } = choice(rng, bon, [
    {
      label: `Non : après, 1 cm³ a une masse plus ${plus ? 'petite' : 'grande'}`,
      why: `La même masse occupe un volume plus ${plus ? 'petit' : 'grand'} : compare la part de chaque cm³.`,
    },
    {
      label: 'Oui : la masse se conserve, donc 1 cm³ a la même masse',
      why: 'La masse totale se conserve, mais elle n’occupe plus le même volume.',
    },
  ]);
  return {
    prompt: 'Lis l’expérience. 1 cm³ de la substance a-t-il la même masse avant et après ?',
    figure,
    answer,
    traps: t,
    hint: 'La masse totale reste la même : dans combien de cm³ est-elle répartie, avant puis après ?',
    steps: [
      'La masse totale se conserve lors du changement d’état.',
      `Elle occupe ${avant} cm³ avant et ${ensuite} cm³ après : un volume plus ${plus ? 'petit' : 'grand'}.`,
      `**${bon}**.`,
    ],
    targetSeconds: 110,
  };
};

export const conservationMasse: Skill = {
  id: 'p5-conservation-masse',
  title: 'La conservation de la masse',
  levels: 5,
  version: 1,
  advice: 'brouillon',
  lesson: {
    memo: [
      'Lors d’un changement d’état, la **masse** se conserve, mais pas forcément le **volume** : 20 g de glace donnent 20 g d’eau liquide.',
      'Quand on mélange un solide dans un liquide, la masse totale se conserve : 100 g d’eau + 10 g de sel = 110 g, même si le sel ne se voit plus.',
    ],
    ...references('conservation-changement', 'conservation-melange'),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
