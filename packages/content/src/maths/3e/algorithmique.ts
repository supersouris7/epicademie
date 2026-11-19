import { choice, num, traps } from '../../build.ts';
import { fmt, r } from '../../rational.ts';
import type { Block } from '../../types.ts';
import { bossOf, NAMES } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Algorithmique ———

const boucleConditionnelle = S(
  'm3-boucle-conditionnelle',
  'Boucle « répéter jusqu’à »',
  'Utiliser une boucle conditionnelle',
  [
    '« répéter jusqu’à condition » : on refait le bloc tant que la condition est **fausse**, et on s’arrête dès qu’elle devient vraie.',
  ],
  (rng) => {
    const step = rng.int(3, 9);
    const limit = rng.int(20, 60);
    const start = rng.int(0, 5);
    let v = start;
    let turns = 0;
    while (!(v > limit)) {
      v += step;
      turns++;
    }
    const program: Block[] = [
      { op: 'set', variable: 'n', expr: String(start) },
      { op: 'until', cond: `n > ${limit}`, body: [{ op: 'change', variable: 'n', by: String(step) }] },
      { op: 'say', expr: 'n' },
    ];
    return {
      prompt: 'Que dit le lutin à la fin ?',
      figure: { kind: 'blocks', program },
      answer: num(v),
      traps: traps(r(v), [
        [v - step, `Avec ${v - step}, la condition « n > ${limit} » est encore fausse : la boucle continue.`],
      ]),
      hint: `Ajoute ${step} jusqu’à dépasser ${limit}.`,
      steps: [
        `n vaut ${start}, puis ${Array.from({ length: Math.min(turns, 6) }, (_, i) => start + step * (i + 1)).join(', ')}${turns > 6 ? '…' : ''}.`,
        `La première valeur > ${limit} est **${v}**.`,
      ],
      targetSeconds: 40,
    };
  },
);

const conditionsComposees = S(
  'm3-conditions-composees',
  'Conditions composées (et, ou)',
  'Utiliser des conditions composées',
  ['« A et B » est vrai si **les deux** sont vraies. « A ou B » est vrai si **au moins une** est vraie.'],
  (rng) => {
    const x = rng.int(0, 30);
    const lo = rng.int(5, 12);
    const hi = rng.int(15, 25);
    const useAnd = rng.int(0, 1) === 1;
    const cond = useAnd ? `x > ${lo} et x < ${hi}` : `x < ${lo} ou x > ${hi}`;
    const truth = useAnd ? x > lo && x < hi : x < lo || x > hi;
    const program: Block[] = [
      { op: 'set', variable: 'x', expr: String(x) },
      { op: 'if', cond, then: [{ op: 'say', expr: '1' }], else: [{ op: 'say', expr: '0' }] },
    ];
    return {
      prompt: 'Que dit le lutin ?',
      figure: { kind: 'blocks', program },
      answer: num(truth ? 1 : 0),
      traps: traps(r(truth ? 1 : 0), [
        [truth ? 0 : 1, useAnd ? '« et » : les deux conditions doivent être vraies.' : '« ou » : une seule suffit.'],
      ]),
      hint: `Teste chaque condition avec x = ${x}.`,
      steps: [`Avec x = ${x} : « ${cond} » est ${truth ? 'vraie' : 'fausse'}.`, `Le lutin dit **${truth ? 1 : 0}**.`],
      targetSeconds: 30,
    };
  },
);

const structurer = S(
  'm3-structurer',
  'Programme complet avec variables',
  'Approfondir la notion de variables',
  ['Suis chaque variable ligne par ligne ; dans une boucle, note leurs valeurs à chaque tour.'],
  (rng) => {
    const times = rng.int(3, 5);
    const program: Block[] = [
      { op: 'set', variable: 'a', expr: '1' },
      { op: 'set', variable: 'b', expr: '0' },
      {
        op: 'repeat',
        times,
        body: [
          { op: 'change', variable: 'b', by: 'a' },
          { op: 'set', variable: 'a', expr: 'a × 2' },
        ],
      },
      { op: 'say', expr: 'b' },
    ];
    let a = 1;
    let b = 0;
    for (let i = 0; i < times; i++) {
      b += a;
      a *= 2;
    }
    return {
      prompt: 'Que dit le lutin à la fin ?',
      figure: { kind: 'blocks', program },
      answer: num(b),
      traps: traps(r(b), [
        [a, 'Le lutin dit b, pas a.'],
        [times, 'b reçoit a à chaque tour, et a double.'],
      ]),
      hint: 'Fais un tableau : a et b à chaque tour.',
      steps: [
        `Tours : b = ${Array.from({ length: times }, (_, i) => 2 ** i).join(' + ')} et a double à chaque fois.`,
        `b = **${b}**.`,
      ],
      targetSeconds: 50,
    };
  },
);

export const algorithmique = C(
  'm3-algorithmique',
  'informatique',
  'Algorithmique',
  [conditionsComposees, boucleConditionnelle, structurer],
  bossOf(
    [
      S(
        'm3-boss-algo-epargne',
        'Problème : l’épargne',
        'Utiliser une boucle conditionnelle',
        ['« répéter jusqu’à épargne ≥ objectif » : on compte les tours de boucle.'],
        (rng) => {
          const per = rng.int(5, 15);
          const goal = rng.int(60, 200);
          const months = Math.ceil(goal / per);
          return {
            prompt: `${rng.pick(NAMES)} met ${per} € de côté chaque mois, en partant de 0, jusqu’à avoir au moins ${goal} €. Combien de mois faut-il ?`,
            figure: {
              kind: 'blocks',
              program: [
                { op: 'set', variable: 'épargne', expr: '0' },
                { op: 'set', variable: 'mois', expr: '0' },
                {
                  op: 'until',
                  cond: `épargne ≥ ${goal}`,
                  body: [
                    { op: 'change', variable: 'épargne', by: String(per) },
                    { op: 'change', variable: 'mois', by: '1' },
                  ],
                },
                { op: 'say', expr: 'mois' },
              ],
            },
            answer: num(months),
            traps: traps(r(months), [
              [Math.floor(goal / per), 'Il faut **atteindre** l’objectif : un mois de plus si besoin.'],
            ]),
            hint: `Combien de fois ${per} pour atteindre ${goal} ?`,
            steps: [
              `${goal} ÷ ${per} ≈ ${fmt(r(Math.round((goal / per) * 100), 100))}.`,
              `Il faut **${months}** mois.`,
            ],
            targetSeconds: 45,
          };
        },
      ),
      S(
        'm3-boss-algo-acces',
        'Problème : le manège',
        'Utiliser des conditions composées',
        ['Accès au manège : taille ≥ 1,30 m **et** âge ≥ 10 ans. Il faut les deux.'],
        (rng) => {
          const t = r(rng.int(120, 145), 100);
          const age = rng.int(7, 14);
          const ok = t.n / t.d >= 1.3 && age >= 10;
          return {
            prompt: `Règle : on monte si taille ≥ 1,30 m et âge ≥ 10 ans. Noah mesure ${fmt(t)} m et a ${age} ans. Peut-il monter ?`,
            ...choice(
              rng,
              ok ? 'Oui' : 'Non',
              [{ label: ok ? 'Non' : 'Oui', why: '« et » : les deux conditions doivent être vraies.' }],
              true,
            ),
            hint: 'Teste les deux conditions.',
            steps: [
              `Taille ≥ 1,30 : ${t.n / t.d >= 1.3 ? 'vrai' : 'faux'}. Âge ≥ 10 : ${age >= 10 ? 'vrai' : 'faux'}.`,
              `**${ok ? 'Oui' : 'Non'}**.`,
            ],
            targetSeconds: 30,
          };
        },
      ),
    ],
    [
      S(
        'm3-boss-algo-piege',
        'Piège : la boucle infinie',
        'Utiliser une boucle conditionnelle',
        ['Si la condition d’arrêt ne devient jamais vraie, la boucle ne s’arrête jamais.'],
        (rng) => {
          const s = rng.int(2, 5);
          return {
            prompt: `n part de 0. « répéter jusqu’à n = 7 : ajouter ${s * 2} à n ». La boucle s’arrête-t-elle ?`,
            ...choice(rng, 'Non, jamais', [
              { label: 'Oui, quand n dépasse 7', why: 'La condition est « n = 7 », pas « n > 7 ».' },
              { label: 'Oui, au bout de 7 tours', why: `n vaut toujours un multiple de ${s * 2}, jamais 7.` },
            ]),
            hint: `Quelles valeurs prend n ? 0, ${s * 2}, ${s * 4}…`,
            steps: [
              `n prend les valeurs 0, ${s * 2}, ${s * 4}… (que des nombres pairs).`,
              'n ne vaut jamais 7 : **non, jamais** (boucle infinie).',
            ],
            targetSeconds: 30,
          };
        },
      ),
    ],
  ),
);
