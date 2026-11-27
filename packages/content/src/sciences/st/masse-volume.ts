import { choice, num, traps } from '../../build.ts';
import { add, dec, fmt, mul, r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME, SI } from './donnees.ts';

// ——— Masse et volume (programme du cycle 3 : balance, tarer, unités de masse, déplacement de liquide) ———

type Unite = 'mg' | 'g' | 'kg' | 't';
const ORDRE_UNITES: readonly Unite[] = ['mg', 'g', 'kg', 't'];

/** Objets du quotidien et unité usuelle de leur masse (ordres de grandeur, pas des faits du programme). */
const OBJETS: readonly { txt: string; valeur: number; unite: Unite }[] = [
  { txt: 'Une pomme a une masse d’environ', valeur: 150, unite: 'g' },
  { txt: 'Une baguette a une masse d’environ', valeur: 250, unite: 'g' },
  { txt: 'Un élève de CM1 a une masse d’environ', valeur: 32, unite: 'kg' },
  { txt: 'Un sac de pommes de terre a une masse d’environ', valeur: 5, unite: 'kg' },
  { txt: 'Un camion chargé a une masse d’environ', valeur: 12, unite: 't' },
  { txt: 'Un moustique a une masse d’environ', valeur: 2, unite: 'mg' },
];

const GRANDEURS = [
  { scene: 'On pose une pomme sur une balance.', bonne: 'la masse' },
  { scene: 'On pèse un paquet de farine.', bonne: 'la masse' },
  {
    scene: 'On plonge un caillou dans un verre gradué : on regarde de combien le niveau de l’eau monte.',
    bonne: 'le volume',
  },
  { scene: 'On verse du lait dans un verre doseur pour lire combien de millilitres il y en a.', bonne: 'le volume' },
] as const;

const POURQUOI_GRANDEUR: Record<string, string> = {
  'la masse': 'La masse, c’est « combien ça pèse » : on la lit sur une balance.',
  'le volume':
    'Le volume, c’est la place qu’un corps occupe : on le lit sur un verre gradué ou avec le niveau de l’eau.',
  'la température': 'La température se mesure avec un thermomètre, ni avec une balance ni avec un verre gradué.',
};

const niveau1 = (rng: Rng): QuestionDraft => {
  const g = rng.pick(GRANDEURS);
  const { answer, traps: t } = choice(
    rng,
    g.bonne,
    ['la masse', 'le volume', 'la température']
      .filter((x) => x !== g.bonne)
      .map((x) => ({ label: x, why: POURQUOI_GRANDEUR[x] ?? '' })),
  );
  return {
    prompt: `${g.scene} Que mesure-t-on ?`,
    answer,
    traps: t,
    hint: 'Une balance dit combien ça pèse ; le niveau de l’eau dit la place que prend le corps.',
    steps: ['On regarde l’outil ou le geste : balance, ou niveau du liquide.', `On mesure **${g.bonne}**.`],
    targetSeconds: 15,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const o = rng.pick(OBJETS);
  const place = ORDRE_UNITES.indexOf(o.unite);
  const { answer, traps: t } = choice(
    rng,
    o.unite,
    ORDRE_UNITES.filter((u) => u !== o.unite).map((u) => ({
      label: u,
      why:
        ORDRE_UNITES.indexOf(u) > place
          ? `En ${u}, ce serait beaucoup trop lourd pour cet objet.`
          : `En ${u}, ce serait beaucoup trop léger pour cet objet.`,
    })),
  );
  return {
    prompt: `${o.txt} ${o.valeur} … Quelle unité faut-il écrire ?`,
    answer,
    traps: t,
    hint: 'Imagine l’objet dans ta main : est-il aussi léger qu’une plume, ou plus lourd qu’un sac ?',
    steps: [
      'Les unités de masse, de la plus petite à la plus grande : mg, g, kg, t (la tonne : 1 t = 1 000 kg).',
      'On choisit celle qui donne un nombre raisonnable pour cet objet.',
      `Unité : **${o.unite}**.`,
    ],
    targetSeconds: 20,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const n = rng.int(2, 9);
  const type = rng.int(0, 2);
  if (type === 0) {
    const v = mul(r(n), r(1000));
    return {
      prompt: `Convertis : ${n} kg = … g`,
      answer: num(v, 'g'),
      traps: traps(v, [
        [n * 100, 'Dans 1 kg, il y a 1 000 g, pas 100 g.'],
        [n * 10, 'Dans 1 kg, il y a 1 000 g, pas 10 g.'],
        [n, 'Tu as oublié de convertir : 1 kg vaut 1 000 g.'],
      ]),
      hint: 'Le préfixe « kilo » veut dire mille.',
      steps: ['Un kilogramme vaut 1 000 grammes.', `${n} × 1 000 = **${fmt(v)} g**.`],
      targetSeconds: 20,
    };
  }
  if (type === 1) {
    const g = n * 1000;
    return {
      prompt: `Convertis : ${fmt(g)} g = … kg`,
      answer: num(n, 'kg'),
      traps: traps(r(n), [
        [n * 10, 'Tu as divisé par 100. Pour passer des g aux kg, on divise par 1 000.'],
        [n * 1000 * 1000, 'Tu as multiplié, mais des g aux kg, la masse s’exprime avec un plus petit nombre.'],
        [g, 'Tu as oublié de convertir : 1 000 g valent 1 kg.'],
      ]),
      hint: 'Il faut 1 000 g pour faire 1 kg : combien de paquets de 1 000 g ?',
      steps: ['Un kilogramme vaut 1 000 grammes.', `${fmt(g)} ÷ 1 000 = **${n} kg**.`],
      targetSeconds: 20,
    };
  }
  const v = mul(r(n), r(1000));
  return {
    prompt: `Convertis : ${n} g = … mg`,
    answer: num(v, 'mg'),
    traps: traps(v, [
      [n * 100, 'Dans 1 g, il y a 1 000 mg, pas 100 mg.'],
      [n, 'Tu as oublié de convertir : 1 g vaut 1 000 mg.'],
    ]),
    hint: 'Le préfixe « milli » veut dire mille fois plus petit.',
    steps: ['Un gramme vaut 1 000 milligrammes.', `${n} × 1 000 = **${fmt(v)} mg**.`],
    targetSeconds: 20,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 2);
  if (type === 0) {
    const v0 = rng.int(5, 20) * 10;
    const k = rng.int(2, 9) * 5;
    const v1 = v0 + k;
    return {
      prompt: `Une éprouvette graduée contient ${v0} mL d’eau. On y plonge un caillou : le niveau monte à ${v1} mL. Quel est le volume du caillou, en mL ?`,
      answer: num(k, 'mL'),
      traps: traps(r(k), [
        [v1, 'Ça, c’est le niveau final (eau + caillou), pas le volume du caillou seul.'],
        [v0 + v1, 'On ne les additionne pas : le caillou a fait monter le niveau, il faut soustraire.'],
      ]),
      hint: 'Le caillou prend la place de l’eau qui monte : compare le niveau avant et après.',
      steps: [
        'Le niveau monte parce que le caillou prend de la place.',
        `Montée du niveau : ${v1} − ${v0}.`,
        `Volume du caillou : **${k} mL**.`,
      ],
      targetSeconds: 40,
    };
  }
  if (type === 1) {
    const bol = rng.int(8, 30) * 10;
    const contenu = rng.int(5, 40) * 10;
    const total = bol + contenu;
    return {
      prompt: `Un bol vide pèse ${bol} g. On y verse de la farine : la balance affiche ${total} g. Quelle est la masse de la farine, en g ?`,
      answer: num(contenu, 'g'),
      traps: traps(r(contenu), [
        [total, 'La balance pèse le bol ET la farine : il faut retirer la masse du bol.'],
        [total + bol, 'On ne rajoute pas le bol : il est déjà compté dans l’affichage.'],
      ]),
      hint: 'Le bol est déjà sur la balance : que faut-il enlever à l’affichage ?',
      steps: [
        'La balance affiche la masse du bol plus celle de la farine.',
        `Farine = ${total} − ${bol}.`,
        `Masse de la farine : **${contenu} g**.`,
      ],
      targetSeconds: 40,
    };
  }
  const kg = dec(rng.int(1, 9) * 25 + rng.int(0, 3) * 100, 2);
  const g = mul(kg, r(1000));
  return {
    prompt: `Convertis : ${fmt(kg)} kg = … g`,
    answer: num(g, 'g'),
    traps: traps(g, [
      [mul(kg, r(100)), 'Dans 1 kg, il y a 1 000 g : multiplie par 1 000, pas par 100.'],
      [mul(kg, r(10000)), 'Tu as multiplié par 10 000 : 1 kg vaut 1 000 g.'],
    ]),
    hint: 'Le nombre est décimal, mais la règle est la même : 1 kg = 1 000 g.',
    steps: ['Un kilogramme vaut 1 000 grammes.', `${fmt(kg)} × 1 000 = **${fmt(g)} g**.`],
    targetSeconds: 40,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  // Niveau 5 : situation avec plusieurs étapes.
  const type = rng.int(0, 2);
  if (type === 0) {
    const pot = rng.int(30, 60) * 10;
    const miel = rng.int(4, 10) * 100;
    const plein = add(r(pot), r(miel));
    const kg = mul(plein, dec(1, 3));
    return {
      prompt: 'Combien de miel y a-t-il dans le pot, en g ?',
      figure: {
        kind: 'document',
        title: 'Au marché',
        lines: [`Un pot vide pèse ${pot} g.`, `Rempli de miel, il pèse ${fmt(kg)} kg sur la balance.`],
      },
      answer: num(miel, 'g'),
      traps: traps(r(miel), [
        [plein, 'Ça, c’est la masse du pot plein : retire la masse du pot.'],
        [add(plein, r(pot)), 'On n’ajoute pas le pot : il est déjà dans la masse affichée.'],
      ]),
      hint: 'Mets les deux masses dans la même unité avant de soustraire.',
      steps: [
        `Convertis : ${fmt(kg)} kg = ${fmt(plein)} g.`,
        `Retire la masse du pot : ${fmt(plein)} − ${pot}.`,
        `Masse du miel : **${miel} g**.`,
      ],
      targetSeconds: 60,
    };
  }
  if (type === 1) {
    const bol = rng.int(15, 40) * 10;
    const sucre = rng.int(3, 12) * 25;
    return {
      prompt: 'Quelle est la masse totale du bol et du sucre, en g ?',
      figure: {
        kind: 'document',
        title: 'Dans la cuisine',
        lines: [
          `On pose un bol vide sur la balance : elle affiche ${bol} g.`,
          'On appuie sur la touche « tare » : la balance affiche 0 g.',
          `On verse du sucre : la balance affiche ${sucre} g.`,
        ],
      },
      answer: num(bol + sucre, 'g'),
      traps: traps(r(bol + sucre), [
        [sucre, `Après la tare, la balance ne compte plus le bol : ${sucre} g, c’est le sucre seul.`],
        [bol, 'Ça, c’est la masse du bol vide, avant de verser le sucre.'],
      ]),
      hint: 'La tare remet l’affichage à zéro, mais le bol pèse toujours autant.',
      steps: [
        `Le bol pèse ${bol} g. Après la tare, la balance ne montre que le sucre : ${sucre} g.`,
        `Bol + sucre = ${bol} + ${sucre}.`,
        `Masse totale : **${bol + sucre} g**.`,
      ],
      targetSeconds: 60,
    };
  }
  const total = rng.int(3, 9) * 500;
  const verse = rng.int(2, 6) * 100;
  return {
    prompt: 'Combien de grammes de farine faut-il encore verser ?',
    figure: {
      kind: 'document',
      title: 'Une recette',
      lines: [`La recette demande ${fmt(dec(total, 3))} kg de farine.`, `On a déjà versé ${verse} g.`],
    },
    answer: num(total - verse, 'g'),
    traps: traps(r(total - verse), [
      [total + verse, 'On ajoute ce qu’on a déjà versé : il faut au contraire le retirer.'],
      [add(dec(total, 3), r(verse)), 'Attention aux unités : convertis les kg en g avant de calculer.'],
    ]),
    hint: 'Convertis la masse demandée en grammes, puis retire ce qui est déjà versé.',
    steps: [
      `${fmt(dec(total, 3))} kg = ${fmt(total)} g.`,
      `Reste à verser : ${fmt(total)} − ${verse}.`,
      `Il faut encore **${fmt(total - verse)} g**.`,
    ],
    targetSeconds: 60,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const masseVolume: Skill = {
  id: 'pcm1-masse-volume',
  title: 'Masse et volume',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **masse** dit combien ça pèse : on la mesure avec une **balance**, en t (tonne), kg, g ou mg. Pour ne peser que le contenu d’un bol, on appuie sur « **tare** » avec le bol posé.',
      '1 t = 1 000 kg, 1 kg = 1 000 g et 1 g = 1 000 mg. Le **volume** dit la place occupée : on le trouve par **déplacement de liquide** (le niveau monte quand on plonge un caillou).',
    ],
    source: `${PROGRAMME} : « Mesurer la masse d’un solide ou d’un liquide à l’aide d’une balance, en tarant la balance le cas échéant » ; « Mesurer le volume d’un liquide et mesurer celui d’un solide par déplacement de liquide ». Préfixes kilo (10³) et milli (10⁻³) : BIPM.`,
    sources: [PROGRAMME, SI],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
