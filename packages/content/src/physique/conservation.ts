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
    ['la vaporisation, dans un récipient fermé', 'liquide → gaz'],
    ['la liquéfaction, dans un récipient fermé', 'gaz → liquide'],
  ] as const);
  const bon = 'La masse se conserve, mais pas forcément le volume';
  const { answer, traps: t } = choice(rng, bon, [
    {
      label: 'Le volume se conserve, mais pas la masse',
      why: 'C’est l’inverse : la masse se conserve, pas le volume.',
    },
    {
      label: 'La masse et le volume se conservent toujours',
      why: 'Le volume peut changer lors d’un changement d’état.',
    },
    {
      label: 'Ni la masse ni le volume ne se conservent',
      why: 'La masse, elle, se conserve : aucune matière ne se perd.',
    },
  ]);
  return {
    prompt: `Que se passe-t-il pour la masse et le volume d’une substance pendant ${nom} (${sens}) ?`,
    answer,
    traps: t,
    hint: 'Distingue ce qui compte la matière et ce qui mesure la place occupée.',
    steps: ['Un changement d’état ne fait ni perdre ni gagner de matière.', `Réponse : **${bon.toLowerCase()}**.`],
    targetSeconds: 35,
  };
};

const SOLIDES = ['sel', 'sucre'] as const;

const niveau3 = (rng: Rng): QuestionDraft => {
  const solide = rng.pick(SOLIDES);
  const eau = rng.int(2, 18) * 25;
  const s = rng.int(1, 8) * 5;
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
      prompt: `Un flacon fermé vide pèse ${flacon} g. Avec de l’eau, il pèse ${total} g. On congèle toute l’eau. Quelle est la masse de la glace, en grammes ?`,
      answer: num(eau, 'g'),
      traps: traps(r(eau), [
        [total, 'C’est la masse du flacon et de son contenu : il faut retirer celle du flacon.'],
        [flacon, 'C’est la masse du flacon vide.'],
      ]),
      hint: 'La masse de l’eau ne change pas ; trouve-la avant la congélation.',
      steps: [`Masse d’eau : ${total} − ${flacon} = ${eau} g.`, `La masse se conserve : la glace pèse **${eau} g**.`],
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
      texte: 'Dans un récipient fermé, la masse est la même avant et après l’ébullition et la liquéfaction.',
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

const niveau5 = (rng: Rng): QuestionDraft => {
  const rho = rng.int(2, 6);
  const rho2 = rng.pick([1, 2, 3, 4, 5, 6].filter((x) => x !== rho));
  const v2 = rng.int(2, 8) * rho;
  const m = rho2 * v2;
  const v1 = m / rho;
  const figure = {
    kind: 'document' as const,
    title: 'Expérience (données de l’exercice)',
    lines: [
      'Un récipient fermé contient une substance W, un corps pur.',
      `Au départ, à l’état solide : masse volumique ${rho} g/cm³, volume ${v1} cm³.`,
      `Après la fusion : volume ${v2} cm³.`,
    ],
  };
  if (rng.int(0, 1) === 0) {
    return {
      prompt: 'Lis l’expérience. Quelle est la masse de la substance liquide, en grammes ?',
      figure,
      answer: num(m, 'g'),
      traps: traps(r(m), [
        [rho * v2, 'La masse volumique du solide ne vaut pas pour le liquide : calcule la masse avant la fusion.'],
        [v2, 'C’est un volume : il faut la masse.'],
      ]),
      hint: 'Calcule la masse avant la fusion : elle ne change pas ensuite.',
      steps: [`Avant : m = ${rho} × ${v1} = ${m} g.`, 'La fusion conserve la masse.', `Masse du liquide : **${m} g**.`],
      targetSeconds: 100,
    };
  }
  return {
    prompt: 'Lis l’expérience. Quelle est la masse volumique de la substance après la fusion, en g/cm³ ?',
    figure,
    answer: num(rho2, 'g/cm³'),
    traps: traps(r(rho2), [
      [rho, 'Le volume a changé : la masse volumique change, même si la masse reste la même.'],
      [m, 'C’est la masse : il faut encore la diviser par le nouveau volume.'],
    ]),
    hint: 'La masse reste la même ; divise-la par le nouveau volume.',
    steps: [`Masse : ${rho} × ${v1} = ${m} g, conservée après la fusion.`, `ρ = ${m} ÷ ${v2} = **${rho2} g/cm³**.`],
    targetSeconds: 120,
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
    ...references('conservation-changement', 'conservation-melange', 'masse-volumique'),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
