import { choice, num, traps } from '../../build.ts';
import { fmt, r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Pourcentages ———

const pourcentageSens = S(
  'm6-pourcentage-sens',
  'Sens d’un pourcentage',
  'Connaître la définition d’un pourcentage',
  [
    '**25 %**, c’est {25/100} : 25 sur 100. C’est aussi 0,25 et {1/4}.',
    '50 % = la moitié ; 25 % = le quart ; 10 % = le dixième ; 100 % = le tout.',
  ],
  (rng, level) => {
    const pairs = [
      { p: 50, f: '{1/2}', d: r(1, 2) },
      { p: 25, f: '{1/4}', d: r(1, 4) },
      { p: 75, f: '{3/4}', d: r(3, 4) },
      { p: 10, f: '{1/10}', d: r(1, 10) },
      { p: 20, f: '{1/5}', d: r(1, 5) },
    ];
    const x = rng.pick(pairs);
    if (level === 1) {
      return {
        prompt: `Écris ${x.p} % sous forme décimale.`,
        answer: num(r(x.p, 100)),
        traps: traps(r(x.p, 100), [[x.p, `${x.p} % = ${x.p} ÷ 100.`]]),
        hint: `${x.p} % = {${x.p}/100}.`,
        steps: [`${x.p} % = {${x.p}/100} = ${x.p} ÷ 100.`, `= **${fmt(r(x.p, 100))}**.`],
        targetSeconds: 12,
      };
    }
    return {
      prompt: `Quelle fraction est égale à ${x.p} % ?`,
      ...choice(
        rng,
        x.f,
        pairs
          .filter((y) => y.p !== x.p)
          .slice(0, 3)
          .map((y) => ({ label: y.f, why: `${y.f} = ${y.p} %.` })),
      ),
      hint: `${x.p} % = {${x.p}/100} : simplifie.`,
      steps: [`${x.p} % = {${x.p}/100}.`, `{${x.p}/100} = **${x.f}**.`],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const appliquerPourcentage = S(
  'm6-appliquer-pourcentage',
  'Appliquer un pourcentage',
  'Comprendre le sens d’un pourcentage',
  ['10 % de 80 = 80 ÷ 10 = 8. 50 % = la moitié, 25 % = le quart.', 'Pour 30 % : 3 fois 10 %. 30 % de 80 = 3 × 8 = 24.'],
  (rng, level) => {
    const p = level === 1 ? rng.pick([10, 50, 25]) : rng.pick([20, 30, 40, 60, 75, 5]);
    const base = level === 1 ? rng.int(2, 20) * 4 * 10 : rng.int(2, 30) * 20;
    const res = (base * p) / 100;
    return {
      prompt: `Calcule ${p} % de ${base}.`,
      answer: num(res),
      traps: traps(r(res), [[base - res, `Tu as enlevé ${p} %. On demande ${p} % **de** ${base}.`]]),
      hint: p % 10 === 0 ? `Calcule d’abord 10 % de ${base}.` : `${p} % = {${p}/100}.`,
      steps: [
        p % 10 === 0 ? `10 % de ${base} = ${base / 10}.` : `${p} % de ${base} = ${base} × ${p} ÷ 100.`,
        `${p} % de ${base} = **${res}**.`,
      ],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

export const pourcentages = C(
  'm6-pourcentages',
  'nombres',
  'Pourcentages',
  [pourcentageSens, appliquerPourcentage],
  bossOf(
    [
      S(
        'm6-boss-pourcentages-soldes',
        'Problème : les soldes',
        'Comprendre le sens d’un pourcentage',
        ['Une réduction de 20 % sur 50 € : 20 % de 50 = 10 €, le prix devient 50 − 10 = 40 €.'],
        (rng) => {
          const p = rng.pick([10, 20, 25, 50]);
          const price = rng.int(2, 15) * 20;
          const off = (price * p) / 100;
          return {
            prompt: `Un jeu coûte ${price} €. Pendant les soldes, il est réduit de ${p} %. Quel est son nouveau prix ?`,
            answer: num(price - off, '€'),
            traps: traps(r(price - off), [
              [off, 'Ça, c’est la réduction. Il faut l’enlever au prix.'],
              [price - p, `On n’enlève pas ${p} €, mais ${p} % du prix.`],
            ]),
            hint: `Calcule d’abord ${p} % de ${price}.`,
            steps: [
              `Réduction : ${p} % de ${price} = ${off} €.`,
              `Nouveau prix : ${price} − ${off} = **${price - off} €**.`,
            ],
            targetSeconds: 45,
          };
        },
      ),
      S(
        'm6-boss-pourcentages-sondage',
        'Problème : le sondage',
        'Comprendre le sens d’un pourcentage',
        ['Si 15 élèves sur 50 aiment le judo : {15/50} = {30/100} = 30 %.'],
        (rng) => {
          const total = rng.pick([20, 25, 50]);
          const k = 100 / total;
          const part = rng.int(1, total - 1);
          return {
            prompt: `Sur ${total} élèves, ${part} viennent à pied. Quel pourcentage des élèves vient à pied ?`,
            answer: num(part * k, '%'),
            traps: traps(r(part * k), [[part, `${part} élèves sur ${total}, ce n’est pas ${part} sur 100.`]]),
            hint: `Écris {${part}/${total}} avec le dénominateur 100.`,
            steps: [`{${part}/${total}} = {${part * k}/100} (× ${k} en haut et en bas).`, `C’est **${part * k} %**.`],
            targetSeconds: 45,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-pourcentages-piege',
        'Piège : 50 % de réduction deux fois',
        'Comprendre le sens d’un pourcentage',
        ['Deux réductions de 50 % ne font pas 100 % : la 2e porte sur le nouveau prix.'],
        (rng) => {
          const price = rng.int(2, 10) * 40;
          return {
            prompt: `Un article à ${price} € est réduit de 50 %, puis le nouveau prix est encore réduit de 50 %. L’article devient-il gratuit ?`,
            ...choice(rng, `Non, il coûte ${price / 4} €`, [
              {
                label: 'Oui, 50 % + 50 % = 100 %',
                why: 'La 2e réduction porte sur le nouveau prix, pas sur le prix de départ.',
              },
              { label: `Non, il coûte ${price / 2} €`, why: 'Il y a deux réductions de moitié.' },
            ]),
            hint: 'Calcule le prix après la 1re réduction, puis après la 2e.',
            steps: [
              `Après la 1re réduction : ${price} ÷ 2 = ${price / 2} €.`,
              `Après la 2e : ${price / 2} ÷ 2 = ${price / 4} € : **non, il coûte ${price / 4} €**.`,
            ],
            targetSeconds: 30,
          };
        },
      ),
    ],
  ),
);
