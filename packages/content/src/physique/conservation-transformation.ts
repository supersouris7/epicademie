import { choice, num, traps } from '../build.ts';
import { dec, fmt, r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { references } from './donnees-atomes.ts';

// ——— La conservation de la masse lors d’une transformation chimique (4e) ———

/** Masses dans les proportions des réactions : carbone/dioxygène/dioxyde 3/8/11, dihydrogène/dioxygène/eau 1/8/9. */
const REACTIONS = [
  { a: 'carbone', b: 'dioxygène', c: 'dioxyde de carbone', de: 'de dioxyde de carbone', ra: 3, rb: 8 },
  { a: 'dihydrogène', b: 'dioxygène', c: 'eau', de: 'd’eau', ra: 1, rb: 8 },
] as const;

const tirer = (rng: Rng) => {
  const x = rng.pick(REACTIONS);
  const k = rng.int(1, 6);
  return { ...x, ma: x.ra * k, mb: x.rb * k, mc: (x.ra + x.rb) * k };
};

const niveau1 = (rng: Rng): QuestionDraft => {
  const x = rng.pick(REACTIONS);
  const m = rng.int(10, 60) * 5;
  const { answer, traps: t } = choice(rng, `${m} g`, [
    { label: `Moins de ${m} g`, why: 'Dans un récipient fermé, aucune matière ne s’échappe.' },
    { label: `Plus de ${m} g`, why: 'Aucune matière n’entre dans un récipient fermé.' },
  ]);
  return {
    prompt: `Dans un flacon fermé de ${m} g (contenu compris), le ${x.a} réagit avec le ${x.b}. Quelle masse indique la balance après la réaction ?`,
    answer,
    traps: t,
    hint: 'Rien n’entre ni ne sort du flacon.',
    steps: ['La masse se conserve lors d’une transformation chimique.', `La balance indique toujours **${m} g**.`],
    targetSeconds: 30,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const x = rng.pick(REACTIONS);
  const bon = 'Les atomes sont conservés : ils se redistribuent';
  const { answer, traps: t } = choice(rng, bon, [
    { label: 'Les molécules sont conservées telles quelles', why: 'Les molécules changent : de nouvelles se forment.' },
    {
      label: 'Des atomes sont créés pour compenser',
      why: 'Aucun atome n’est créé au cours d’une transformation chimique.',
    },
    { label: 'Les produits ont toujours le même volume', why: 'La conservation concerne la masse, pas le volume.' },
  ]);
  return {
    prompt: `Quand le ${x.a} réagit avec le ${x.b} dans un récipient fermé, pourquoi la masse totale reste-t-elle la même ?`,
    answer,
    traps: t,
    hint: 'Qu’arrive-t-il aux atomes pendant la transformation ?',
    steps: ['Une transformation chimique redistribue les atomes sans en créer ni en détruire.', `**${bon}**.`],
    targetSeconds: 40,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const x = tirer(rng);
  return {
    prompt: `On fait réagir entièrement ${x.ma} g de ${x.a} avec ${x.mb} g de ${x.b}. Le seul produit est ${x.c === 'eau' ? 'l’eau' : `le ${x.c}`}. Quelle masse ${x.de} se forme, en grammes ?`,
    answer: num(x.mc, 'g'),
    traps: traps(r(x.mc), [
      [x.mb - x.ma, 'On additionne les masses des réactifs : rien ne disparaît.'],
      [x.mb, `Il faut aussi compter la masse du ${x.a}.`],
      [x.ma, `Il faut aussi compter la masse du ${x.b}.`],
    ]),
    hint: 'La masse des produits est égale à la masse des réactifs consommés.',
    steps: [
      'La masse des produits formés est égale à celle des réactifs consommés.',
      `${x.ma} + ${x.mb} = **${x.mc} g**.`,
    ],
    targetSeconds: 50,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const x = tirer(rng);
  const cherche = rng.pick(['a', 'b'] as const);
  const autre = cherche === 'a' ? { nom: x.b, m: x.mb } : { nom: x.a, m: x.ma };
  const voulu = cherche === 'a' ? { nom: x.a, m: x.ma } : { nom: x.b, m: x.mb };
  const mg = rng.int(0, 1) === 0;
  const f = mg ? 1000 : 1;
  return {
    prompt: `La réaction forme ${mg ? x.mc * 1000 : x.mc} ${mg ? 'mg' : 'g'} ${x.de}, seul produit, en consommant ${autre.m} g de ${autre.nom}. Quelle masse de ${voulu.nom} a été consommée, en grammes ?`,
    answer: num(voulu.m, 'g'),
    traps: traps(r(voulu.m), [
      [x.mc + autre.m, 'On soustrait : la masse des produits contient déjà celle de ce réactif.'],
      [x.mc * f - autre.m, 'Mets d’abord les deux masses dans la même unité.'],
      [x.mc, `C’est la masse totale produite : il faut en retirer celle du ${autre.nom}.`],
    ]),
    hint: 'Masse des réactifs = masse des produits. Vérifie les unités.',
    steps: [
      ...(mg ? [`${x.mc * 1000} mg = ${x.mc} g.`] : []),
      `Masse des réactifs = ${x.mc} g, donc ${x.mc} − ${autre.m} = **${voulu.m} g**.`,
    ],
    targetSeconds: 80,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const recipient = rng.int(8, 20) * 10;
  const contenu = rng.int(30, 80);
  const gaz = dec(rng.int(5, 25) * 2 + 1, 1);
  const gazN = gaz.n / gaz.d;
  const avant = recipient + contenu;
  const apres = dec(Math.round((avant - gazN) * 10), 1);
  const ouvert = rng.int(0, 1) === 0;
  const figure = {
    kind: 'document' as const,
    title: 'Expérience (données de l’exercice)',
    lines: [
      `Un récipient ${ouvert ? 'ouvert' : 'fermé'} contient deux substances qui réagissent et produisent un gaz.`,
      `Avant la réaction, la balance indique ${avant} g (récipient compris).`,
      ouvert
        ? `Après la réaction, tout le gaz formé s’est échappé : la balance indique ${fmt(apres)} g.`
        : `La réaction a lieu sans que rien ne s’échappe. Le récipient vide a une masse de ${recipient} g.`,
    ],
  };
  if (ouvert)
    return {
      prompt: 'Lis l’expérience. Quelle masse de gaz s’est échappée, en grammes ?',
      figure,
      answer: num(gaz, 'g'),
      traps: traps(gaz, [
        [apres, 'C’est la lecture après la réaction : calcule la différence avec la lecture d’avant.'],
        [0, 'La masse totale se conserve, mais le gaz échappé n’est plus sur la balance.'],
      ]),
      hint: 'La balance ne pèse plus ce qui est parti.',
      steps: [
        'La matière ne disparaît pas : le gaz parti n’est plus sur la balance.',
        `${avant} − ${fmt(apres)} = **${fmt(gaz)} g**.`,
      ],
      targetSeconds: 100,
    };
  return {
    prompt:
      'Lis l’expérience. Quelle est la masse de l’ensemble des substances dans le récipient après la réaction, en grammes ?',
    figure,
    answer: num(contenu, 'g'),
    traps: traps(r(contenu), [
      [avant, 'C’est la masse récipient compris : retire celle du récipient.'],
      [recipient, 'C’est la masse du récipient vide.'],
    ]),
    hint: 'La masse avant la réaction suffit : que devient-elle après ?',
    steps: [
      `Masse des substances avant : ${avant} − ${recipient} = ${contenu} g.`,
      `Rien ne s’échappe, la masse se conserve : **${contenu} g**.`,
    ],
    targetSeconds: 100,
  };
};

export const conservationTransformation: Skill = {
  id: 'p4-conservation-masse',
  title: 'La conservation de la masse',
  levels: 5,
  version: 1,
  advice: 'brouillon',
  lesson: {
    memo: [
      'Lors d’une transformation chimique, la **conservation de la masse** s’applique : la masse des réactifs consommés est égale à la masse des produits formés, car les atomes sont seulement redistribués.',
      'Exemple : 3 g de carbone réagissent avec 8 g de dioxygène et forment 11 g de dioxyde de carbone.',
      'Dans un récipient ouvert, un gaz qui s’échappe n’est plus pesé : la balance baisse, mais la matière n’a pas disparu.',
    ],
    ...references('conservation-transformation', 'redistribution', 'co2-complete', 'eau-combinaison'),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
