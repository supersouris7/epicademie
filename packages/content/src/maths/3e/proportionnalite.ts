import { choice, num, traps } from '../../build.ts';
import { fmt, r } from '../../rational.ts';
import { bossOf, sgn } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Proportionnalité et pourcentages ———

const evolution = S(
  'm3-evolution',
  'Traduire une évolution en pourcentage',
  'Traduire une augmentation ou une diminution en pourcentages',
  ['Taux d’évolution = {valeur finale − valeur initiale/valeur initiale} × 100. De 80 à 100 : +20 ÷ 80 = +25 %.'],
  (rng) => {
    const v0 = rng.pick([20, 40, 50, 80, 200, 250]);
    const t = rng.pick([-50, -25, -20, -10, 10, 20, 25, 50, 75]);
    const v1 = (v0 * (100 + t)) / 100;
    return {
      prompt: `Un prix passe de ${v0} € à ${fmt(r(v1 * 100, 100))} €. De quel pourcentage a-t-il évolué ? (négatif si baisse)`,
      answer: num(t, '%'),
      traps: traps(r(t), [
        [
          r(Math.round((v1 - v0) * 100), 100),
          `${fmt(r(Math.round((v1 - v0) * 100), 100))} €, c’est l’évolution en euros : divise par ${v0} puis × 100.`,
        ],
        [-t, 'Attention au sens : hausse ou baisse ?'],
      ]),
      hint: `(${fmt(r(v1 * 100, 100))} − ${v0}) ÷ ${v0} × 100.`,
      steps: [
        `Écart : ${fmt(r(Math.round((v1 - v0) * 100), 100))} €. Divisé par ${v0} : ${fmt(r(t, 100))}.`,
        `Soit **${sgn(t)} %**.`,
      ],
      targetSeconds: 40,
    };
  },
  { advice: 'calculatrice' },
);

const partageRatio = S(
  'm3-partage-ratio',
  'Partager selon un ratio',
  'Partager une masse en trois parts selon un certain ratio (automatisme)',
  ['Ratio 2 : 3 : 5 → 10 parts égales. 200 g partagés : une part = 20 g, donc 40 g, 60 g et 100 g.'],
  (rng) => {
    const parts = [rng.int(1, 4), rng.int(1, 4), rng.int(1, 5)];
    const total = parts.reduce((a, b) => a + b, 0);
    const unitPart = rng.int(5, 40);
    const k = rng.int(0, 2);
    return {
      prompt: `On partage ${total * unitPart} g de farine en trois parts selon le ratio ${parts.join(' : ')}. Combien pèse la part n°${k + 1} ?`,
      answer: num((parts[k] ?? 0) * unitPart, 'g'),
      traps: traps(r((parts[k] ?? 0) * unitPart), [
        [r(total * unitPart, 3), 'Les parts ne sont pas égales : elles suivent le ratio.'],
      ]),
      hint: `Le ratio fait ${total} parts égales en tout.`,
      steps: [
        `${total * unitPart} ÷ ${total} = ${unitPart} g par part.`,
        `${parts[k]} part${(parts[k] ?? 0) > 1 ? 's' : ''} : **${(parts[k] ?? 0) * unitPart} g**.`,
      ],
      targetSeconds: 40,
    };
  },
);

const lineaireProportionnalite = S(
  'm3-lineaire-proportionnalite',
  'Proportionnalité et fonction linéaire',
  'Relier fonctions linéaires et proportionnalité',
  ['Une situation de proportionnalité de coefficient k se traduit par la fonction linéaire f(x) = kx.'],
  (rng) => {
    const price = r(rng.int(12, 40), 10);
    return {
      prompt: `L’essence coûte ${fmt(price)} € le litre. Quelle fonction donne le prix f(x) pour x litres ?`,
      ...choice(rng, `f(x) = ${fmt(price)}x`, [
        { label: `f(x) = x + ${fmt(price)}`, why: 'Le prix est proportionnel au nombre de litres : on multiplie.' },
        { label: `f(x) = {x/${fmt(price)}}`, why: 'Chaque litre coûte ' + fmt(price) + ' € : on multiplie.' },
      ]),
      hint: 'Prix = prix d’un litre × nombre de litres.',
      steps: ['C’est une situation de proportionnalité : fonction linéaire.', `**f(x) = ${fmt(price)}x**.`],
      targetSeconds: 25,
    };
  },
);

export const proportionnalite = C(
  'm3-proportionnalite',
  'fonctions',
  'Pourcentages et ratios',
  [evolution, partageRatio, lineaireProportionnalite],
  bossOf(
    [
      S(
        'm3-boss-propor-population',
        'Problème : la population',
        'Traduire une augmentation ou une diminution en pourcentages',
        ['+10 % deux années de suite : × 1,1 × 1,1 = × 1,21, soit +21 % (pas +20 %).'],
        (rng) => {
          const t = rng.pick([10, 20]);
          const k = (100 + t) / 100;
          const tot = Math.round((k * k - 1) * 100);
          return {
            prompt: `Une ville gagne ${t} % d’habitants par an, deux années de suite. De quel pourcentage a-t-elle augmenté en deux ans ?`,
            answer: num(tot, '%'),
            traps: traps(r(tot), [
              [
                2 * t,
                `La 2e hausse s’applique à une population déjà augmentée : × ${fmt(r(100 + t, 100))} × ${fmt(r(100 + t, 100))}.`,
              ],
            ]),
            hint: `Multiplie par ${fmt(r(100 + t, 100))} deux fois.`,
            steps: [
              `${fmt(r(100 + t, 100))} × ${fmt(r(100 + t, 100))} = ${fmt(r(Math.round(k * k * 100), 100))}.`,
              `Hausse de **${tot} %**.`,
            ],
            targetSeconds: 50,
          };
        },
        { advice: 'calculatrice' },
      ),
      S(
        'm3-boss-propor-heritage',
        'Problème : le partage selon l’âge',
        'Partager une somme entre deux personnes âgées de 20 et 30 ans proportionnellement à leur âge (automatisme)',
        ['Partager proportionnellement à 20 et 30 ans : ratio 20 : 30 = 2 : 3, donc 5 parts.'],
        (rng) => {
          const a = rng.int(8, 14);
          const b = rng.int(a + 1, 18);
          const unitPart = rng.int(2, 10) * 5;
          const total = (a + b) * unitPart;
          return {
            prompt: `Deux frères de ${a} et ${b} ans se partagent ${total} € proportionnellement à leur âge. Combien reçoit l’aîné ?`,
            answer: num(b * unitPart, '€'),
            traps: traps(r(b * unitPart), [
              [r(total, 2), 'Le partage suit les âges, il n’est pas équitable.'],
              [a * unitPart, 'Ça, c’est la part du plus jeune.'],
            ]),
            hint: `${a} + ${b} = ${a + b} parts.`,
            steps: [
              `Une part : ${total} ÷ ${a + b} = ${unitPart} €.`,
              `L’aîné : ${b} × ${unitPart} = **${b * unitPart} €**.`,
            ],
            targetSeconds: 50,
          };
        },
      ),
    ],
    [
      S(
        'm3-boss-propor-piege',
        'Piège : −50 % puis +50 %',
        'Traduire une augmentation ou une diminution en pourcentages',
        ['−50 % puis +50 % : × 0,5 × 1,5 = × 0,75. On a perdu 25 % !'],
        (rng) => {
          const p = rng.int(2, 10) * 40;
          return {
            prompt: `Une action vaut ${p} €. Elle perd 50 %, puis regagne 50 %. Combien vaut-elle ?`,
            answer: num((p * 3) / 4, '€'),
            traps: traps(r((p * 3) / 4), [[p, 'Les 50 % de hausse portent sur la valeur déjà divisée par deux.']]),
            hint: 'Calcule étape par étape.',
            steps: [`−50 % : ${p / 2} €. +50 % de ${p / 2} : + ${p / 4} €.`, `Valeur finale : **${(p * 3) / 4} €**.`],
            targetSeconds: 35,
          };
        },
      ),
    ],
  ),
);
