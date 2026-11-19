import { choice, distinct, num, traps } from '../../build.ts';
import { fmt, r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Proportionnalité ———

const reconnaitre = S(
  'm6-propor-reconnaitre',
  'Reconnaître la proportionnalité',
  'Identifier si une situation relève du « modèle » de la proportionnalité',
  [
    'Deux grandeurs sont **proportionnelles** si quand l’une est multipliée par 2, 3, 10…, l’autre l’est aussi.',
    'L’âge et la taille ne sont pas proportionnels ; le prix et la quantité de pommes (à prix fixe) le sont.',
  ],
  (rng) => {
    const q = rng.pick([
      { s: 'Le prix payé et le nombre de baguettes achetées (même prix par baguette)', yes: true },
      { s: 'L’âge d’un enfant et sa taille', yes: false },
      { s: 'Le périmètre d’un carré et la longueur de son côté', yes: true },
      { s: 'L’aire d’un carré et la longueur de son côté', yes: false },
      { s: 'La distance parcourue et la durée, à vitesse constante', yes: true },
      { s: 'Le prix d’un taxi (avec une prise en charge fixe) et la distance', yes: false },
    ]);
    return {
      prompt: `Ces deux grandeurs sont-elles proportionnelles ? ${q.s}.`,
      ...choice(
        rng,
        q.yes ? 'Oui' : 'Non',
        [
          {
            label: q.yes ? 'Non' : 'Oui',
            why: q.yes ? 'Si on double l’une, l’autre double aussi.' : 'Doubler l’une ne double pas l’autre.',
          },
        ],
        true,
      ),
      hint: 'Si on double la première grandeur, la seconde double-t-elle forcément ?',
      steps: [
        q.yes
          ? 'Si on double la première, la seconde double aussi.'
          : 'Si on double la première, la seconde ne double pas forcément.',
        `**${q.yes ? 'Oui' : 'Non'}**.`,
      ],
      targetSeconds: 20,
    };
  },
);

const linearite = S(
  'm6-propor-linearite',
  'Fois plus, fois moins (linéarité)',
  'Résoudre un problème de proportionnalité en choisissant une procédure adaptée : propriété de linéarité pour la multiplication ou l’addition, retour à l’unité',
  [
    '« 3 fois plus de pains, je paie 3 fois plus. » Si 4 pains coûtent 7 €, 12 pains coûtent 3 × 7 = 21 €.',
    'On peut aussi additionner : prix de 5 = prix de 2 + prix de 3.',
  ],
  (rng, level) => {
    const a = rng.int(2, 6);
    const k = rng.int(2, level === 1 ? 4 : 6);
    const price = rng.int(3, 15);
    const item = rng.pick(['croissants', 'cahiers', 'bouteilles', 'tickets']);
    if (level === 3) {
      const u = rng.int(2, 6);
      let b = rng.int(2, 6);
      if (b === a) b++;
      return {
        prompt: `Le prix est proportionnel au nombre de ${item}. ${a} ${item} coûtent ${a * u} € et ${b} ${item} coûtent ${b * u} €. Combien coûtent ${a + b} ${item} ?`,
        answer: num((a + b) * u, '€'),
        traps: traps(r((a + b) * u), [[a * u * b * u, 'On additionne les quantités : on additionne aussi les prix.']]),
        hint: `${a + b} = ${a} + ${b} : additionne les prix.`,
        steps: [`${a + b} ${item}, c’est ${a} ${item} + ${b} ${item}.`, `${a * u} + ${b * u} = **${(a + b) * u} €**.`],
        targetSeconds: 30,
      };
    }
    return {
      prompt: `${a} ${item} coûtent ${price} €. Combien coûtent ${a * k} ${item} ?`,
      answer: num(price * k, '€'),
      traps: traps(r(price * k), [
        [price + (a * k - a), `Ce n’est pas une addition : il y a ${k} fois plus de ${item}.`],
      ]),
      hint: `${a * k}, c’est combien de fois ${a} ?`,
      steps: [
        `${a * k} = ${k} × ${a} : il y a ${k} fois plus de ${item}.`,
        `On paie ${k} fois plus : ${k} × ${price} = **${price * k} €**.`,
      ],
      targetSeconds: 20,
    };
  },
);

const retourUnite = S(
  'm6-propor-unite',
  'Retour à l’unité',
  'Résoudre un problème de proportionnalité en choisissant une procédure adaptée : propriété de linéarité pour la multiplication ou l’addition, retour à l’unité',
  [
    'On cherche d’abord le prix (ou la quantité) pour **un seul**, puis on multiplie : 5 kg coûtent 15 €, 1 kg coûte 3 €, 7 kg coûtent 21 €.',
  ],
  (rng) => {
    const unit = rng.int(2, 9);
    const a = rng.int(3, 9);
    let b = rng.int(2, 12);
    if (b === a) b++;
    return {
      prompt: `${a} kg de pommes coûtent ${a * unit} €. Combien coûtent ${b} kg ?`,
      answer: num(b * unit, '€'),
      traps: traps(r(b * unit), [[unit, `${unit} €, c’est le prix d’**un** kilo.`]]),
      hint: 'Calcule d’abord le prix d’un seul kilo.',
      steps: [`1 kg : ${a * unit} ÷ ${a} = ${unit} €.`, `${b} kg : ${b} × ${unit} = **${b * unit} €**.`],
      targetSeconds: 25,
    };
  },
);

const tableau = S(
  'm6-propor-tableau',
  'Compléter un tableau de proportionnalité',
  'Représenter une situation de proportionnalité à l’aide d’un tableau ou de notations symboliques',
  [
    'Dans un tableau de proportionnalité, on passe d’une colonne à une autre en multipliant (ou en additionnant des colonnes).',
  ],
  (rng) => {
    const unit = rng.int(2, 9);
    const xs = distinct(rng, 3, () => rng.int(2, 12)).sort((p, q) => p - q);
    const hidden = rng.int(0, 2);
    const x = xs[hidden] ?? 2;
    return {
      prompt: 'Le prix est proportionnel au nombre de places. Complète la case « ? ».',
      figure: {
        kind: 'table',
        header: true,
        rows: [
          ['Nombre de places', ...xs.map(String)],
          ['Prix (€)', ...xs.map((v, i) => (i === hidden ? '?' : String(v * unit)))],
        ],
      },
      answer: num(x * unit, '€'),
      traps: traps(r(x * unit), [[x + unit, 'On multiplie par le prix d’une place, on n’ajoute pas.']]),
      hint: 'Trouve le prix d’une place avec une colonne complète.',
      steps: [
        `Une place coûte ${unit} € (par exemple ${xs[(hidden + 1) % 3]} places → ${(xs[(hidden + 1) % 3] ?? 0) * unit} €).`,
        `${x} places : ${x} × ${unit} = **${x * unit} €**.`,
      ],
      targetSeconds: 30,
    };
  },
);

const echelles = S(
  'm6-echelles',
  'Problèmes d’échelles',
  'S’initier à la résolution de problèmes d’échelles',
  ['Échelle 1/1 000 : 1 cm sur le plan représente 1 000 cm, soit 10 m, en vrai.'],
  (rng) => {
    const scale = rng.pick([100, 1000, 10000, 100000]);
    const plan = rng.int(2, 12);
    const realCm = plan * scale;
    const unit = scale >= 100000 ? 'km' : 'm';
    const real = unit === 'km' ? r(realCm, 100000) : r(realCm, 100);
    return {
      prompt: `Sur un plan à l’échelle {1/${scale}}, deux points sont à ${plan} cm. Quelle est la distance réelle, en ${unit} ?`,
      answer: num(real, unit),
      traps: traps(real, [[r(realCm), `${fmt(r(realCm))} est en cm : convertis en ${unit}.`]]),
      hint: `1 cm sur le plan = ${fmt(r(scale))} cm en vrai.`,
      steps: [
        `${plan} cm sur le plan = ${plan} × ${fmt(r(scale))} = ${fmt(r(realCm))} cm en vrai.`,
        `${fmt(r(realCm))} cm = **${fmt(real)} ${unit}**.`,
      ],
      targetSeconds: 40,
    };
  },
  { advice: 'calculatrice' },
);

export const proportionnalite = C(
  'm6-proportionnalite',
  'fonctions',
  'Proportionnalité',
  [reconnaitre, linearite, retourUnite, tableau, echelles],
  bossOf(
    [
      S(
        'm6-boss-propor-recette',
        'Problème : la recette',
        'Résoudre un problème de proportionnalité en choisissant une procédure adaptée',
        ['Recette pour 4, on cuisine pour 6 : 6 = 4 + 2 (4 personnes et la moitié de 4).'],
        (rng) => {
          const base = 4;
          const g = 2 * rng.int(50, 150);
          const people = rng.pick([2, 6, 8, 10, 12]);
          const res = (g / base) * people;
          return {
            prompt: `Une recette pour ${base} personnes demande ${g} g de farine. Combien en faut-il pour ${people} personnes ?`,
            answer: num(res, 'g'),
            traps: traps(r(res), [
              [g + (people - base), 'Les quantités sont proportionnelles : on ne fait pas une addition de personnes.'],
            ]),
            hint: `Calcule d’abord pour 1 personne, ou pour 2 (la moitié de ${base}).`,
            steps: [
              `Pour 2 personnes : ${g} ÷ 2 = ${g / 2} g.`,
              `Pour ${people} personnes : ${people / 2} × ${g / 2} = **${res} g**.`,
            ],
            targetSeconds: 45,
          };
        },
      ),
      S(
        'm6-boss-propor-carte',
        'Problème : la carte de randonnée',
        'S’initier à la résolution de problèmes d’échelles',
        ['Échelle 1/25 000 : 1 cm sur la carte = 25 000 cm = 250 m en vrai.'],
        (rng) => {
          const cm = rng.int(2, 16);
          const m = cm * 250;
          return {
            prompt: `Sur une carte à l’échelle {1/25000}, un sentier mesure ${cm} cm. Quelle est sa longueur réelle, en m ?`,
            answer: num(m, 'm'),
            traps: traps(r(m), [[cm * 25000, `${cm * 25000} est en cm : convertis en m.`]]),
            hint: '1 cm sur la carte = 25 000 cm en vrai, soit 250 m.',
            steps: [`1 cm = 250 m en vrai.`, `${cm} × 250 = **${m} m**.`],
            targetSeconds: 45,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-propor-piege',
        'Piège : l’âge et la taille',
        'Identifier si une situation relève du « modèle » de la proportionnalité',
        ['Tout n’est pas proportionnel : un enfant de 10 ans ne mesure pas deux fois plus qu’à 5 ans.'],
        (rng) => {
          const h = rng.int(105, 115);
          return {
            prompt: `À 5 ans, Noah mesurait ${h} cm. Combien mesurera-t-il à 20 ans ?`,
            ...choice(rng, 'On ne peut pas savoir avec la proportionnalité', [
              { label: `${h * 4} cm`, why: 'La taille n’est pas proportionnelle à l’âge (personne ne mesure 4 m !).' },
              { label: `${h * 2} cm`, why: 'La taille n’est pas proportionnelle à l’âge.' },
            ]),
            hint: 'La taille double-t-elle quand l’âge double ?',
            steps: [
              `${h * 4} cm, ce serait plus de 4 m : absurde.`,
              'La taille n’est pas proportionnelle à l’âge : **on ne peut pas savoir avec la proportionnalité**.',
            ],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);
