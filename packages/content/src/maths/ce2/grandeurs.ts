import { num, traps } from '../../build.ts';
import { fmt, r } from '../../rational.ts';
import type { EvalChapter } from '../../types.ts';
import { chapter, NAMES, skill } from './kit.ts';

/**
 * Domaine « Grandeurs et mesures » du CE2. Programme du cycle 2 (CE2), BO n°16 du 17 avril 2025 :
 * longueurs, masses, contenances, monnaie, durées.
 */

interface Conversion {
  readonly big: string;
  readonly small: string;
  readonly factor: number;
  /** Mot de la grandeur, pour l'énoncé. */
  readonly what: string;
}
const CONVERSIONS: readonly Conversion[] = [
  { big: 'm', small: 'cm', factor: 100, what: 'longueur' },
  { big: 'cm', small: 'mm', factor: 10, what: 'longueur' },
  { big: 'kg', small: 'g', factor: 1000, what: 'masse' },
  { big: 'km', small: 'm', factor: 1000, what: 'longueur' },
  { big: 'L', small: 'cL', factor: 100, what: 'contenance' },
];

const convertir = skill(
  'mce2-conversion',
  'Convertir des longueurs, des masses, des contenances',
  'Comparer, estimer, mesurer des longueurs, des masses, des contenances ; utiliser le lexique, les unités et leurs relations (m, cm, mm, km, kg, g, L, cL)',
  [
    '1 m = 100 cm ; 1 km = 1 000 m ; 1 cm = 10 mm.',
    '1 kg = 1 000 g ; 1 L = 100 cL. Pour passer à la plus petite unité, on multiplie.',
  ],
  (rng, level) => {
    const c = rng.pick(CONVERSIONS.slice(0, level === 1 ? 3 : 5));
    const k = rng.int(2, 9);
    if (level === 3) {
      const rest = rng.int(1, 9) * (c.factor >= 1000 ? 100 : c.factor === 100 ? 10 : 1);
      const total = k * c.factor + rest;
      return {
        prompt: `${k} ${c.big} ${rest} ${c.small} = ? ${c.small}`,
        answer: num(total, c.small),
        traps: traps(r(total), [
          [Number(`${k}${rest}`), `1 ${c.big} = ${fmt(c.factor)} ${c.small} : convertis d’abord les ${c.big}.`],
        ]),
        hint: `Convertis les ${c.big} en ${c.small}, puis ajoute le reste.`,
        steps: [
          `${k} ${c.big} = ${fmt(k * c.factor)} ${c.small}.`,
          `${fmt(k * c.factor)} + ${rest} = **${fmt(total)} ${c.small}**.`,
        ],
        targetSeconds: 30,
      };
    }
    const reverse = level === 2 && rng.int(0, 1) === 1;
    const value = reverse ? k * c.factor : k;
    return {
      prompt: reverse ? `${fmt(value)} ${c.small} = ? ${c.big}` : `${value} ${c.big} = ? ${c.small}`,
      answer: reverse ? num(k, c.big) : num(k * c.factor, c.small),
      traps: traps(r(reverse ? k : k * c.factor), [
        [reverse ? k * c.factor * 10 : k * c.factor * 10, `1 ${c.big} = ${fmt(c.factor)} ${c.small}.`],
      ]),
      hint: `Combien de ${c.small} dans 1 ${c.big} ?`,
      steps: [
        `1 ${c.big} = ${fmt(c.factor)} ${c.small}.`,
        reverse
          ? `${fmt(value)} ÷ ${fmt(c.factor)} = **${k} ${c.big}**.`
          : `${value} × ${fmt(c.factor)} = **${fmt(k * c.factor)} ${c.small}**.`,
      ],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const monnaie = skill(
  'mce2-monnaie',
  'Monnaie : rendre et compter',
  'Utiliser les unités de mesure et résoudre des problèmes de monnaie : l’euro et le centime',
  ['1 € = 100 centimes.', 'Pour rendre la monnaie : on cherche ce qu’il manque entre le prix et la somme donnée.'],
  (rng, level) => {
    const name = rng.pick(NAMES);
    if (level === 1) {
      const price = rng.int(2, 9);
      const paid = price < 5 ? 5 : 10;
      return {
        prompt: `${name} paie avec ${paid} € un objet à ${price} €. Combien d’euros le marchand rend-il ?`,
        answer: num(paid - price, '€'),
        traps: traps(r(paid - price), [[paid + price, 'On rend de l’argent : c’est la différence.']]),
        hint: `Cherche ce qu’il manque à ${price} pour arriver à ${paid}.`,
        steps: [
          `On cherche ce qu’il faut ajouter à ${price} € pour faire ${paid} €.`,
          `${paid} − ${price} = **${paid - price} €**.`,
        ],
        targetSeconds: 15,
      };
    }
    if (level === 2) {
      const e = rng.int(1, 9);
      const c = rng.int(1, 9) * 5;
      return {
        prompt: `${e} € ${c} centimes, c’est combien de centimes ?`,
        answer: num(e * 100 + c, 'centimes'),
        traps: traps(r(e * 100 + c), [[Number(`${e}${c}`), '1 € = 100 centimes : convertis les euros.']]),
        hint: 'Convertis les euros en centimes, puis ajoute.',
        steps: [`${e} € = ${e * 100} centimes.`, `${e * 100} + ${c} = **${e * 100 + c} centimes**.`],
        targetSeconds: 20,
      };
    }
    const n = rng.int(2, 5);
    const e = rng.int(1, 4);
    const c = rng.pick([20, 50, 70]);
    const total = n * (e * 100 + c);
    return {
      prompt: `${name} achète ${n} gommes à ${e} € ${c} centimes. Combien de centimes paie-t-il ?`,
      answer: num(total, 'centimes'),
      traps: traps(r(total), [[n + e * 100 + c, 'Les gommes sont toutes au même prix : multiplie.']]),
      hint: 'Convertis le prix d’une gomme en centimes, puis multiplie.',
      steps: [`Une gomme : ${e * 100 + c} centimes.`, `${n} × ${e * 100 + c} = **${total} centimes**.`],
      targetSeconds: 40,
    };
  },
);

const hm = (min: number) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;

const dureeEcoulee = skill(
  'mce2-duree-ecoulee',
  'Heures et minutes : durées',
  'Comparer, estimer, mesurer des durées ; lire l’heure ; utiliser les unités (heure, minute) et leurs relations',
  [
    '1 h = 60 min. Une demi-heure = 30 min. Un quart d’heure = 15 min.',
    'Pour une durée entre deux heures, on passe par l’heure ronde : de 14 h 40 à 15 h = 20 min, puis jusqu’à 15 h 10 : + 10 min.',
  ],
  (rng, level) => {
    if (level === 1) {
      const h = rng.int(1, 4);
      const m = rng.pick([0, 15, 30, 45]);
      return {
        prompt:
          `Combien de minutes dans ${h} h ${m === 0 ? '' : String(m)} ${m === 0 ? '' : 'min'}`
            .replace(/\s+/g, ' ')
            .trim() + ' ?',
        answer: num(h * 60 + m, 'min'),
        traps: traps(r(h * 60 + m), [[h * 100 + m, '1 h = 60 min, pas 100.']]),
        hint: '1 heure = 60 minutes.',
        steps: [`${h} h = ${h * 60} min.`, `${h * 60} + ${m} = **${h * 60 + m} min**.`],
        targetSeconds: 15,
      };
    }
    const start = rng.int(8 * 12, 17 * 12) * 5;
    const dur = level === 2 ? rng.int(1, 11) * 5 + 60 * rng.int(0, 1) : rng.int(2, 19) * 5 + 60 * rng.int(1, 2);
    return {
      prompt: `Un spectacle commence à ${hm(start)} et finit à ${hm(start + dur)}. Combien de minutes dure-t-il ?`,
      answer: num(dur, 'min'),
      traps: traps(r(dur), [
        [
          (Math.floor((start + dur) / 60) - Math.floor(start / 60)) * 100 + ((start + dur) % 60) - (start % 60),
          'Une heure, c’est 60 min : passe par l’heure ronde.',
        ],
      ]),
      hint: 'Compte jusqu’à l’heure ronde, puis ce qui reste.',
      steps: [
        `De ${hm(start)} à ${hm(start + dur)} : on passe par l’heure ronde.`,
        `Le spectacle dure **${dur} min**.`,
      ],
      targetSeconds: 35,
    };
  },
  { mental: true },
);

const heureFinale = skill(
  'mce2-heure-finale',
  'Calculer une heure d’arrivée',
  'Lire l’heure et calculer des instants et des durées en heures et minutes',
  ['Heure d’arrivée = heure de départ + durée.', '9 h 45 + 30 min : 9 h 45 + 15 min = 10 h, puis + 15 min = 10 h 15.'],
  (rng, level) => {
    const start = rng.int(8 * 12, 18 * 12) * 5;
    const dur = level === 1 ? rng.pick([15, 30, 45]) : level === 2 ? rng.int(2, 11) * 5 : 60 + rng.int(2, 11) * 5;
    const end = start + dur;
    const h = Math.floor(end / 60);
    const m = String(end % 60).padStart(2, '0');
    return {
      prompt:
        `Le bus part à ${hm(start)}. Le trajet dure ${dur >= 60 ? `${hm(dur).replace(' 00', '')} ` : ''}${dur >= 60 ? '' : `${dur} min`}`.trimEnd() +
        `. À quelle heure arrive-t-il ? (écris par exemple 10 h 05)`,
      answer: {
        kind: 'text',
        accepted: [`${h} h ${m}`, `${h}h${m}`, `${h} h${m}`, `${h}h ${m}`, `${h}:${m}`, `${h} h ${m} min`],
      },
      traps: [],
      hint: `Ajoute d’abord ce qu’il faut pour arriver à l’heure ronde après ${hm(start)}.`,
      steps: [`${hm(start)} + ${dur} min : on passe par l’heure ronde.`, `Il arrive à **${h} h ${m}**.`],
      targetSeconds: 40,
    };
  },
);

export const CE2_GRANDEURS: readonly EvalChapter[] = [
  chapter('mce2-mesures', 'grandeurs', 'Longueurs, masses, contenances, monnaie', [convertir, monnaie]),
  chapter('mce2-durees', 'grandeurs', 'Lire l’heure, heures et minutes', [dureeEcoulee, heureFinale]),
];
