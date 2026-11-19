import { choice, num, traps } from '../../build.ts';
import { dec, fmt, mul, r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Distances, cercles, médiatrice ———

const milieuDistance = S(
  'm6-milieu',
  'Distance et milieu d’un segment',
  'Connaître et utiliser la définition du milieu d’un segment',
  ['Le **milieu** M de [AB] est sur le segment et à égale distance de A et de B : AM = MB = AB ÷ 2.'],
  (rng, level) => {
    const ab = level === 1 ? 2 * rng.int(2, 15) : dec(rng.int(21, 199), 1);
    const AB = typeof ab === 'number' ? r(ab) : ab;
    const askWhole = level === 3;
    const half = mul(AB, r(1, 2));
    return {
      prompt: askWhole
        ? `M est le milieu de [AB] et AM = ${fmt(half)} cm. Combien mesure AB ?`
        : `M est le milieu du segment [AB] et AB = ${fmt(AB)} cm. Combien mesure AM ?`,
      answer: num(askWhole ? AB : half, 'cm'),
      traps: traps(askWhole ? AB : half, [
        [
          askWhole ? half : AB,
          askWhole ? 'AB est le segment entier : deux fois AM.' : 'AM n’est que la moitié du segment.',
        ],
      ]),
      hint: 'Le milieu partage le segment en deux longueurs égales.',
      steps: [
        askWhole ? 'AB = AM + MB = 2 × AM.' : 'AM = AB ÷ 2.',
        `${askWhole ? 'AB' : 'AM'} = **${fmt(askWhole ? AB : half)} cm**.`,
      ],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const cercleVocabulaire = S(
  'm6-cercle',
  'Cercle : rayon, diamètre, corde',
  'Connaître les définitions d’un cercle, d’un disque, d’un rayon, d’un diamètre, d’une corde',
  [
    'Tous les points du **cercle** sont à la même distance du centre : c’est le **rayon**.',
    'Le **diamètre** passe par le centre : il vaut 2 rayons. Une **corde** relie deux points du cercle.',
  ],
  (rng, level) => {
    if (level === 1) {
      const rad = rng.int(2, 15);
      const askD = rng.int(0, 1) === 1;
      return {
        prompt: askD
          ? `Un cercle a un rayon de ${rad} cm. Quel est son diamètre ?`
          : `Un cercle a un diamètre de ${2 * rad} cm. Quel est son rayon ?`,
        answer: num(askD ? 2 * rad : rad, 'cm'),
        traps: traps(
          r(askD ? 2 * rad : rad),
          [[askD ? rad / 2 : 4 * rad, 'Le diamètre vaut **deux** rayons.']].filter(([v]) => Number.isInteger(v)) as [
            number,
            string,
          ][],
        ),
        hint: 'Diamètre = 2 × rayon.',
        steps: ['Le diamètre vaut deux rayons.', `Réponse : **${askD ? 2 * rad : rad} cm**.`],
        targetSeconds: 10,
      };
    }
    const rad = rng.int(3, 9);
    const dist = rng.pick([rad - rng.int(1, 2), rad, rad + rng.int(1, 3)]);
    const where = dist < rad ? 'À l’intérieur du cercle' : dist === rad ? 'Sur le cercle' : 'À l’extérieur du cercle';
    return {
      prompt: `Un cercle a pour centre O et pour rayon ${rad} cm. Le point P est tel que OP = ${dist} cm. Où est P ?`,
      ...choice(
        rng,
        where,
        ['À l’intérieur du cercle', 'Sur le cercle', 'À l’extérieur du cercle']
          .filter((w) => w !== where)
          .map((w) => ({ label: w, why: `Compare OP = ${dist} cm au rayon ${rad} cm.` })),
        true,
      ),
      hint: 'Compare la distance OP au rayon.',
      steps: [
        `Les points du cercle sont exactement à ${rad} cm de O.`,
        `OP = ${dist} cm : P est **${where.toLowerCase()}**.`,
      ],
      targetSeconds: 15,
    };
  },
);

const mediatrice = S(
  'm6-mediatrice',
  'Médiatrice d’un segment',
  'Comprendre et utiliser la propriété caractéristique de la médiatrice d’un segment',
  [
    'La **médiatrice** de [AB] est la droite perpendiculaire à [AB] qui passe par son milieu.',
    'Tout point de la médiatrice est **à égale distance** de A et de B : MA = MB.',
  ],
  (rng, level) => {
    const d = rng.int(3, 12);
    if (level === 1) {
      return {
        prompt: `M est sur la médiatrice de [AB] et MA = ${d} cm. Combien mesure MB ?`,
        answer: num(d, 'cm'),
        traps: traps(r(d), [[2 * d, 'Un point de la médiatrice est à **égale** distance de A et de B.']]),
        hint: 'Que sais-tu des distances d’un point de la médiatrice aux extrémités ?',
        steps: ['Un point de la médiatrice est à égale distance de A et de B.', `MB = MA = **${d} cm**.`],
        targetSeconds: 12,
      };
    }
    const e = d + rng.int(1, 3);
    const on = rng.int(0, 1) === 1;
    return {
      prompt: `N est un point tel que NA = ${d} cm et NB = ${on ? d : e} cm. N est-il sur la médiatrice de [AB] ?`,
      ...choice(
        rng,
        on ? 'Oui' : 'Non',
        [
          {
            label: on ? 'Non' : 'Oui',
            why: on
              ? 'NA = NB : N est bien à égale distance de A et B.'
              : 'NA ≠ NB : N n’est pas à égale distance de A et B.',
          },
        ],
        true,
      ),
      hint: 'Un point est sur la médiatrice exactement quand il est à égale distance de A et de B.',
      steps: [
        `NA = ${d} cm et NB = ${on ? d : e} cm : ${on ? 'égales' : 'différentes'}.`,
        `Donc **${on ? 'oui' : 'non'}**, N ${on ? 'est' : 'n’est pas'} sur la médiatrice.`,
      ],
      targetSeconds: 15,
    };
  },
);

export const cercles = C(
  'm6-cercles',
  'geometrie',
  'Distances, cercles et médiatrice',
  [milieuDistance, cercleVocabulaire, mediatrice],
  bossOf(
    [
      S(
        'm6-boss-cercles-chevre',
        'Problème : la chèvre',
        'Résoudre des problèmes mettant en jeu des distances à un point',
        [
          'Une chèvre attachée par une corde à un piquet peut aller partout à une distance **inférieure ou égale** à la longueur de la corde : dans un disque.',
        ],
        (rng) => {
          const rope = rng.int(3, 10);
          const herb = rope + rng.pick([-2, -1, 1, 2]);
          const can = herb <= rope;
          return {
            prompt: `Une chèvre est attachée à un piquet par une corde de ${rope} m. Une touffe d’herbe est à ${herb} m du piquet. La chèvre peut-elle la manger ?`,
            ...choice(
              rng,
              can ? 'Oui' : 'Non',
              [{ label: can ? 'Non' : 'Oui', why: `Compare ${herb} m à la longueur de la corde (${rope} m).` }],
              true,
            ),
            hint: 'La chèvre peut aller jusqu’à la longueur de la corde, pas plus loin.',
            steps: [
              `La chèvre atteint tous les points à ${rope} m ou moins du piquet.`,
              `${herb} m ${can ? '≤' : '>'} ${rope} m : **${can ? 'oui' : 'non'}**.`,
            ],
            targetSeconds: 25,
          };
        },
      ),
      S(
        'm6-boss-cercles-tresor',
        'Problème : le trésor',
        'Résoudre des problèmes en s’appuyant sur la propriété caractéristique de la médiatrice',
        ['Un point à égale distance de deux arbres est sur la médiatrice du segment qui les relie.'],
        (rng) => {
          const d = rng.int(4, 15);
          return {
            prompt: `Le trésor est à égale distance du chêne et du pin. Il est à ${d} pas du chêne. À combien de pas du pin est-il ?`,
            answer: num(d),
            traps: traps(r(d), [[2 * d, 'À **égale** distance : la même.']]),
            hint: '« À égale distance » : même distance des deux arbres.',
            steps: [
              'Le trésor est sur la médiatrice du segment chêne–pin : même distance aux deux arbres.',
              `Il est à **${d}** pas du pin.`,
            ],
            targetSeconds: 20,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-cercles-piege',
        'Piège : rayon ou diamètre ?',
        'Connaître les définitions d’un cercle, d’un disque, d’un rayon, d’un diamètre, d’une corde',
        ['Le compas s’ouvre de la longueur du **rayon**, pas du diamètre.'],
        (rng) => {
          const D = 2 * rng.int(3, 10);
          return {
            prompt: `Pour tracer un cercle de ${D} cm de diamètre, de combien faut-il écarter le compas ?`,
            answer: num(D / 2, 'cm'),
            traps: traps(r(D / 2), [[D, 'L’écartement du compas, c’est le rayon : la moitié du diamètre.']]),
            hint: 'La pointe est au centre, la mine sur le cercle : c’est quelle longueur ?',
            steps: [
              'Entre la pointe (centre) et la mine (cercle), il y a un rayon.',
              `Rayon = ${D} ÷ 2 = **${D / 2} cm**.`,
            ],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);
