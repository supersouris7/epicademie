import { num, traps } from '../../build.ts';
import { fmt, mul, r } from '../../rational.ts';
import { big, bossOf } from '../kit.ts';
import { S, C, exactDecimal } from './commun.ts';

// ——— Division ———

const divisionEuclidienne = S(
  'm6-division-euclidienne',
  'Division euclidienne',
  'Effectuer la division euclidienne d’un nombre entier par un nombre entier inférieur à 100',
  [
    'Diviser 87 par 4 : combien de fois 4 dans 87 ? 21 fois (4 × 21 = 84), et il reste 3. On écrit 87 = 4 × 21 + 3.',
    'Le reste est toujours **plus petit** que le diviseur.',
  ],
  (rng, level) => {
    const d = level === 1 ? rng.int(2, 9) : rng.int(11, level === 2 ? 25 : 99);
    const q = rng.int(level === 1 ? 5 : 3, level === 1 ? 30 : 60);
    const rest = rng.int(1, d - 1);
    const n = d * q + rest;
    const askRest = rng.int(0, 1) === 1;
    return {
      prompt: `Dans la division euclidienne de ${big(n)} par ${d}, quel est le **${askRest ? 'reste' : 'quotient'}** ?`,
      answer: num(askRest ? rest : q),
      traps: traps(
        r(askRest ? rest : q),
        askRest
          ? [[q, `${q} est le quotient. Le reste est ce qui « reste » : ${big(n)} − ${d} × ${q}.`]]
          : [
              [rest, `${rest} est le reste.`],
              [q + 1, `${d} × ${q + 1} = ${big(d * (q + 1))} dépasse ${big(n)}.`],
            ],
      ),
      hint: `Cherche le plus grand multiple de ${d} qui ne dépasse pas ${big(n)}.`,
      steps: [
        `${d} × ${q} = ${big(d * q)} et ${d} × ${q + 1} = ${big(d * (q + 1))}, trop grand.`,
        `${big(n)} = ${d} × ${q} + ${rest} : ${askRest ? `le reste est **${rest}**` : `le quotient est **${q}**`}.`,
      ],
      targetSeconds: 30,
    };
  },
  { mental: true },
);

const divisionDecimale = S(
  'm6-division-decimale',
  'Division décimale par un entier',
  'Diviser un nombre décimal par un nombre entier non nul inférieur à 10',
  [
    'On divise comme d’habitude ; quand on « descend » le premier chiffre après la virgule, on met la virgule dans le quotient.',
    '7,5 ÷ 3 = 2,5 car 3 × 2,5 = 7,5.',
  ],
  (rng, level) => {
    const d = rng.int(2, 9);
    const q = exactDecimal(rng, 1, level === 1 ? 9 : 99, level === 3 ? 2 : 1);
    const n = mul(q, r(d));
    return {
      prompt: `Calcule ${fmt(n)} ÷ ${d}.`,
      answer: num(q),
      traps: traps(q, [
        [mul(q, r(10)), 'Place la virgule dans le quotient quand tu abaisses le premier chiffre après la virgule.'],
      ]),
      hint: `Cherche le nombre qui, multiplié par ${d}, donne ${fmt(n)}.`,
      steps: [
        `On pose la division de ${fmt(n)} par ${d}, en plaçant la virgule au bon moment.`,
        `${fmt(n)} ÷ ${d} = **${fmt(q)}** (vérification : ${d} × ${fmt(q)} = ${fmt(n)}).`,
      ],
      targetSeconds: 30,
    };
  },
  { mental: true },
);

const problemesDivision = S(
  'm6-problemes-division',
  'Problèmes de partage et de groupements',
  'Résoudre des problèmes mettant en jeu des divisions euclidiennes',
  [
    'Partager en parts égales → division. Faire des groupes de taille donnée → division aussi.',
    'Attention au reste : s’il reste des élèves, il faut **une voiture de plus** !',
  ],
  (rng, level) => {
    const size = rng.int(4, 9);
    const groups = rng.int(5, 20);
    const rest = level === 1 ? 0 : rng.int(1, size - 1);
    const n = size * groups + rest;
    const ctx = rng.pick([
      ...(rest > 0 ? [{ what: 'élèves', box: 'minibus', cap: `${size} places` }] : []),
      { what: 'œufs', box: 'boîtes', cap: `${size} œufs` },
      { what: 'cartes', box: 'paquets', cap: `${size} cartes` },
    ]);
    const answer = rest > 0 && ctx.what === 'élèves' ? groups + 1 : groups;
    return {
      prompt:
        rest > 0 && ctx.what === 'élèves'
          ? `${n} élèves partent en sortie. Chaque minibus a ${ctx.cap}. Combien faut-il de minibus pour emmener tout le monde ?`
          : `On range ${n} ${ctx.what} dans des ${ctx.box} de ${ctx.cap}. Combien de ${ctx.box} pleins obtient-on ?`,
      answer: num(answer),
      traps: traps(r(answer), [
        [
          rest > 0 && ctx.what === 'élèves' ? groups : groups + 1,
          rest > 0 && ctx.what === 'élèves'
            ? `Il reste ${rest} élèves sans place : il faut un minibus de plus.`
            : 'On ne compte que les paquets **pleins**.',
        ],
      ]),
      hint: `Combien de fois ${size} dans ${n} ? Pense au reste.`,
      steps: [
        `${n} = ${size} × ${groups} + ${rest}.`,
        rest > 0 && ctx.what === 'élèves'
          ? `${groups} minibus pleins, et ${rest} élèves de plus : il faut **${answer}** minibus.`
          : `On obtient **${answer}** ${ctx.box} pleins${rest > 0 ? ` (il reste ${rest} ${ctx.what})` : ''}.`,
      ],
      targetSeconds: 40,
    };
  },
);

export const division = C(
  'm6-division',
  'nombres',
  'Division',
  [divisionEuclidienne, divisionDecimale, problemesDivision],
  bossOf(
    [
      S(
        'm6-boss-division-pizzas',
        'Problème : la part de chacun',
        'Résoudre des problèmes mettant en jeu des divisions décimales',
        ['Partager une somme en parts égales : on divise. 25,50 € pour 3 → 25,50 ÷ 3 = 8,50 €.'],
        (rng) => {
          const n = rng.int(3, 6);
          const each = exactDecimal(rng, 4, 15, 1);
          const total = mul(each, r(n));
          return {
            prompt: `${n} amis paient ensemble une addition de ${fmt(total)} € et partagent en parts égales. Combien paie chacun ?`,
            answer: num(each, '€'),
            traps: traps(each, [[mul(total, r(n)), 'On **partage** : c’est une division.']]),
            hint: `Divise ${fmt(total)} par ${n}.`,
            steps: [`Chacun paie ${fmt(total)} ÷ ${n}.`, `${fmt(total)} ÷ ${n} = **${fmt(each)} €**.`],
            targetSeconds: 40,
          };
        },
      ),
      S(
        'm6-boss-division-rubans',
        'Problème : couper un ruban',
        'Résoudre des problèmes mettant en jeu des divisions euclidiennes',
        ['Combien de morceaux de 7 cm dans 100 cm ? 100 = 7 × 14 + 2 : 14 morceaux, et il reste 2 cm.'],
        (rng) => {
          const piece = rng.int(6, 15);
          const count = rng.int(6, 20);
          const rest = rng.int(1, piece - 1);
          const total = piece * count + rest;
          return {
            prompt: `Dans un ruban de ${total} cm, on coupe des morceaux de ${piece} cm. Quelle longueur reste-t-il à la fin, en cm ?`,
            answer: num(rest, 'cm'),
            traps: traps(r(rest), [
              [count, `${count} est le nombre de morceaux. On demande la longueur qui **reste**.`],
            ]),
            hint: `Fais la division euclidienne de ${total} par ${piece}.`,
            steps: [
              `${total} = ${piece} × ${count} + ${rest}.`,
              `On obtient ${count} morceaux et il reste **${rest} cm**.`,
            ],
            targetSeconds: 45,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-division-piege',
        'Piège : le reste',
        'Effectuer la division euclidienne d’un nombre entier par un nombre entier inférieur à 100',
        ['Le reste est toujours plus petit que le diviseur.'],
        (rng) => {
          const d = rng.int(4, 9);
          const q = rng.int(5, 12);
          const rest = rng.int(1, d - 1);
          const n = d * q + rest;
          const wrongQ = q - 1;
          return {
            prompt: `Tao écrit : ${n} = ${d} × ${wrongQ} + ${rest + d}. Est-ce la division euclidienne de ${n} par ${d} ?`,
            answer: { kind: 'choice', options: ['Oui', 'Non'], correct: 1 },
            traps: [{ option: 0, why: `L’égalité est juste, mais le reste ${rest + d} est plus grand que ${d}.` }],
            hint: 'Dans une division euclidienne, le reste doit être plus petit que le diviseur.',
            steps: [
              `Le calcul est juste, mais ${rest + d} > ${d}.`,
              `**Non** : la division euclidienne est ${n} = ${d} × ${q} + ${rest}.`,
            ],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);
