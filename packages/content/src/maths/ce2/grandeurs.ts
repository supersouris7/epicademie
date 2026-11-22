import { num, traps } from '../../build.ts';
import { dec, fmt, r } from '../../rational.ts';
import type { EvalChapter } from '../../types.ts';
import { chapter, NAMES, skill } from './kit.ts';

/**
 * Domaine « Grandeurs et mesures » du CE2. Programme du cycle 2 (CE2), BO n°41 du 31 octobre 2024 :
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
  { big: 'm', small: 'dm', factor: 10, what: 'longueur' },
  { big: 'dm', small: 'cm', factor: 10, what: 'longueur' },
  { big: 't', small: 'kg', factor: 1000, what: 'masse' },
  { big: 'L', small: 'dL', factor: 10, what: 'contenance' },
];

const convertir = skill(
  'mce2-conversion',
  'Convertir des longueurs, des masses, des contenances',
  'Connaitre les relations entre les unités de longueur (m, dm, cm, mm, km), de masse (g, kg, t) et de contenance (L, dL, cL) et effectuer des conversions',
  [
    '1 m = 10 dm = 100 cm ; 1 km = 1 000 m ; 1 cm = 10 mm.',
    '1 kg = 1 000 g ; 1 t = 1 000 kg ; 1 L = 10 dL = 100 cL. Pour passer à la plus petite unité, on multiplie.',
  ],
  (rng, level) => {
    const c = rng.pick(CONVERSIONS.slice(0, level === 1 ? 3 : CONVERSIONS.length));
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

/** Montant en centimes écrit « 4,56 € » (deux décimales, comme sur une étiquette). */
const eur = (cents: number) => `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, '0')} €`;

const monnaie = skill(
  'mce2-monnaie',
  'Monnaie : rendre, additionner, soustraire',
  'Simuler des achats et rendre la monnaie ; poser et effectuer des additions et des soustractions de montants en euro (écriture à virgule)',
  [
    '1 € = 100 centimes. La virgule sépare les euros des centimes : 3,05 € = 3 € et 5 centimes.',
    'Pour rendre la monnaie, on avance par étapes jusqu’à la somme donnée. Pour additionner ou soustraire, on aligne les virgules.',
  ],
  (rng, level) => {
    const name = rng.pick(NAMES);
    if (level === 1) {
      const price = rng.int(37, 489);
      const paid = Math.ceil(price / 500) * 500;
      const back = paid - price;
      return {
        prompt: `${name} paie avec ${eur(paid)} un achat de ${eur(price)}. Quelle somme le marchand rend-il ?`,
        answer: num(dec(back, 2), '€'),
        traps: traps(dec(back, 2), [
          [dec(paid + price, 2), 'On rend de l’argent : c’est ce qu’il manque pour arriver à la somme donnée.'],
        ]),
        hint: `Avance par étapes : d’abord jusqu’à l’euro rond après ${eur(price)}, puis jusqu’à ${eur(paid)}.`,
        steps: [
          `On cherche ce qu’il faut ajouter à ${eur(price)} pour arriver à ${eur(paid)}.`,
          `${eur(paid)} − ${eur(price)} = **${eur(back)}**.`,
        ],
        targetSeconds: 40,
      };
    }
    const e1 = rng.int(level === 2 ? 1 : 2, level === 2 ? 20 : 90);
    const c1 = rng.int(1, 99);
    const a = e1 * 100 + c1;
    if (level === 2) {
      const b = rng.int(1, 30) * 100 + rng.int(1, 19) * 5;
      const sum = a + b;
      const noCarry = (Math.floor(a / 100) + Math.floor(b / 100)) * 100 + (((a % 100) + (b % 100)) % 100);
      return {
        prompt: `Pose et calcule ${eur(a)} + ${eur(b)}.`,
        answer: num(dec(sum, 2), '€'),
        traps: traps(dec(sum, 2), [[dec(noCarry, 2), 'Attention à la retenue : 100 centimes font 1 €.']]),
        hint: 'Aligne les virgules, additionne les centimes puis les euros sans oublier la retenue.',
        steps: [
          `On aligne les virgules : centimes ${a % 100} + ${b % 100} = ${(a % 100) + (b % 100)}.`,
          `${eur(a)} + ${eur(b)} = **${eur(sum)}**.`,
        ],
        targetSeconds: 50,
      };
    }
    const b = rng.int(1, e1 - 1) * 100 + rng.int(0, 99);
    const diff = a - b;
    const noBorrow = Math.abs(Math.floor(a / 100) - Math.floor(b / 100)) * 100 + Math.abs((a % 100) - (b % 100));
    return {
      prompt: `Pose et calcule ${eur(a)} − ${eur(b)}.`,
      answer: num(dec(diff, 2), '€'),
      traps: traps(dec(diff, 2), [
        [dec(noBorrow, 2), 'Quand les centimes du haut sont trop petits, on emprunte 1 € (100 centimes).'],
      ]),
      hint: 'Aligne les virgules, soustrais les centimes (en empruntant si besoin), puis les euros.',
      steps: [
        `On aligne les virgules et on soustrait les centimes, puis les euros.`,
        `${eur(a)} − ${eur(b)} = **${eur(diff)}**.`,
      ],
      targetSeconds: 55,
    };
  },
);

const perimetre = skill(
  'mce2-perimetre',
  'Périmètre d’un polygone',
  'Savoir ce qu’est le périmètre d’une figure plane ; déterminer le périmètre d’un polygone en utilisant une règle graduée',
  [
    'Le **périmètre** d’une figure est la longueur de son contour.',
    'On additionne les longueurs de tous les côtés. Dans un rectangle, les côtés opposés sont égaux.',
  ],
  (rng, level) => {
    if (level === 1) {
      const sides = [rng.int(3, 9), rng.int(3, 9), rng.int(3, 9)];
      const total = sides.reduce((x, y) => x + y, 0);
      return {
        prompt: 'Quel est le périmètre de ce triangle (en cm) ?',
        figure: {
          kind: 'polygon',
          vertices: [
            { name: 'A', x: 0, y: 0 },
            { name: 'B', x: 6, y: 0 },
            { name: 'C', x: 2, y: 4 },
          ],
          sideLabels: sides.map((x) => `${x} cm`),
        },
        answer: num(total, 'cm'),
        traps: traps(r(total), [[sides[0] ?? 0, 'Le périmètre, c’est le tour complet : additionne les trois côtés.']]),
        hint: 'Additionne les longueurs des trois côtés.',
        steps: [`${sides.join(' + ')}.`, `Le périmètre est **${total} cm**.`],
        targetSeconds: 25,
      };
    }
    const long = rng.int(4, 12);
    const wide = rng.int(2, long - 1);
    const total = 2 * (long + wide);
    const square = level === 3 && rng.int(0, 1) === 0;
    if (square)
      return {
        prompt: `Un carré a un côté de ${long} cm. Quel est son périmètre (en cm) ?`,
        answer: num(4 * long, 'cm'),
        traps: traps(r(4 * long), [[long * 2, 'Un carré a quatre côtés égaux.']]),
        hint: 'Les quatre côtés d’un carré ont la même longueur.',
        steps: [`Les 4 côtés mesurent ${long} cm.`, `${long} + ${long} + ${long} + ${long} = **${4 * long} cm**.`],
        targetSeconds: 25,
      };
    return {
      prompt: `Un rectangle mesure ${long} cm de longueur et ${wide} cm de largeur. Quel est son périmètre (en cm) ?`,
      answer: num(total, 'cm'),
      traps: traps(r(total), [[long + wide, 'Il y a quatre côtés : deux longueurs et deux largeurs.']]),
      hint: 'Un rectangle a deux longueurs et deux largeurs.',
      steps: [
        `Côtés : ${long}, ${wide}, ${long} et ${wide}.`,
        `${long} + ${wide} + ${long} + ${wide} = **${total} cm**.`,
      ],
      targetSeconds: 35,
    };
  },
);

const hm = (min: number) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;

const dureeEcoulee = skill(
  'mce2-duree-ecoulee',
  'Heures et minutes : durées',
  'Comparer et mesurer des durées écoulées entre deux instants affichés sur une horloge (intervalles situés dans une même journée) ; heure et minute',
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
  'Résoudre des problèmes à une ou deux étapes impliquant des durées',
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
  chapter('mce2-mesures', 'grandeurs', 'Longueurs, masses, contenances, monnaie', [convertir, perimetre, monnaie]),
  chapter('mce2-durees', 'grandeurs', 'Lire l’heure, heures et minutes', [dureeEcoulee, heureFinale]),
];
