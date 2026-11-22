import { choice, fraction, num, traps } from '../../build.ts';
import { fmt, r } from '../../rational.ts';
import type { EvalChapter } from '../../types.ts';
import { chapter, NAMES, skill } from './kit.ts';

/**
 * Domaine « Nombres et calculs » du CE2. Programme du cycle 2 (CE2), BO n°41 du 31 octobre 2024 :
 * nombres entiers jusqu'à 10 000, faits numériques, calcul posé, problèmes, fractions simples.
 */

const RANKS = ['unités', 'dizaines', 'centaines', 'milliers'] as const;
/** Chiffres de n, du rang des unités vers celui des milliers. */
const digitsOf = (n: number) => RANKS.map((_, i) => Math.floor(n / 10 ** i) % 10);

// ——— Nombres entiers ———

const decomposer = skill(
  'mce2-decomposer',
  'Lire et décomposer un nombre',
  'Connaitre la valeur des chiffres en fonction de leur position dans un nombre ; connaitre et utiliser diverses représentations d’un nombre et passer de l’une à l’autre (nombres jusqu’à 10 000)',
  [
    'Dans 3 456, le chiffre 3 est celui des **milliers**, 4 des centaines, 5 des dizaines, 6 des unités.',
    '3 456 = 3 000 + 400 + 50 + 6. Dans 3 456 il y a 345 dizaines en tout.',
  ],
  (rng, level) => {
    const n = rng.int(1000, 9999);
    const [u, d, c, m] = digitsOf(n) as [number, number, number, number];
    if (level === 1) {
      const rank = rng.int(0, 3);
      const digit = digitsOf(n)[rank] ?? 0;
      const other = digitsOf(n)[rank === 3 ? 2 : rank + 1] ?? 0;
      return {
        prompt: `Dans ${fmt(n)}, quel est le chiffre des ${RANKS[rank]} ?`,
        answer: num(digit),
        traps: traps(r(digit), [
          [other, 'Attention au rang : unités, dizaines, centaines, milliers, de droite à gauche.'],
        ]),
        hint: 'Écris le nombre dans un tableau : milliers, centaines, dizaines, unités.',
        steps: [
          `${fmt(n)} : ${m} millier${m > 1 ? 's' : ''}, ${c} centaines, ${d} dizaines, ${u} unités.`,
          `Le chiffre des ${RANKS[rank]} est **${digit}**.`,
        ],
        targetSeconds: 12,
      };
    }
    if (level === 2) {
      return {
        prompt: `${fmt(n)} = ${m} milliers + ? centaines + ${d} dizaines + ${u} unités. Quel nombre remplace ? `,
        answer: num(c),
        traps: traps(r(c), [[c * 100, 'On demande le nombre de centaines, pas la valeur en unités.']]),
        hint: 'Regarde le troisième chiffre en partant de la droite.',
        steps: [`${fmt(n)} = ${m} 000 + ${c} 00 + ${d}0 + ${u}.`, `Il y a **${c}** centaines.`],
        targetSeconds: 20,
      };
    }
    return {
      prompt: `Combien y a-t-il de dizaines en tout dans ${fmt(n)} ?`,
      answer: num(Math.floor(n / 10)),
      traps: traps(r(Math.floor(n / 10)), [[d, 'Le chiffre des dizaines n’est pas le nombre total de dizaines.']]),
      hint: 'Une dizaine, c’est 10 unités : enlève le chiffre des unités.',
      steps: [`${fmt(n)} = ${fmt(n - u)} + ${u}.`, `${fmt(n - u)} ÷ 10 : il y a **${Math.floor(n / 10)}** dizaines.`],
      targetSeconds: 30,
    };
  },
);

const comparer = skill(
  'mce2-comparer',
  'Comparer et ranger des nombres',
  'Comparer, encadrer, intercaler des nombres entiers en utilisant les symboles (=, <, >) ; ordonner des nombres dans l’ordre croissant ou décroissant',
  [
    'On compare d’abord le nombre de chiffres, puis les chiffres de gauche à droite.',
    '3 450 < 3 540 : les milliers sont égaux, mais 4 centaines < 5 centaines.',
  ],
  (rng, level) => {
    if (level === 1) {
      const a = rng.int(1000, 9999);
      const b = rng.int(1000, 9999);
      const [big, small] = a >= b ? [a, b] : [b, a];
      return {
        prompt: `Quel est le plus grand nombre : ${fmt(a)} ou ${fmt(b)} ?`,
        answer: num(big),
        traps: traps(r(big), [[small, 'Compare les chiffres de gauche à droite, en commençant par les milliers.']]),
        hint: 'Compare d’abord les chiffres des milliers.',
        steps: [
          `On compare ${fmt(a)} et ${fmt(b)} chiffre par chiffre, en commençant par la gauche.`,
          `Le plus grand est **${fmt(big)}**.`,
        ],
        targetSeconds: 12,
      };
    }
    if (level === 2) {
      const base = rng.int(10, 90) * 100;
      const list = [base + rng.int(1, 9) * 10, base + rng.int(10, 40) * 10 + 5, base - rng.int(1, 9) * 7];
      const sorted = [...list].sort((x, y) => x - y);
      const label = (xs: number[]) => xs.map(fmt).join(' < ');
      const { answer, traps: t } = choice(rng, label(sorted), [
        {
          label: label([...sorted].reverse()),
          why: '« < » veut dire « plus petit que » : on commence par le plus petit.',
        },
        {
          label: label([sorted[1] ?? 0, sorted[0] ?? 0, sorted[2] ?? 0]),
          why: 'Compare bien chaque nombre avec les autres.',
        },
      ]);
      return {
        prompt: `Range ces nombres du plus petit au plus grand : ${list.map(fmt).join(' ; ')}.`,
        answer,
        traps: t,
        hint: 'Trouve d’abord le plus petit, puis le plus grand.',
        steps: [
          `Plus petit : ${fmt(sorted[0] ?? 0)}. Plus grand : ${fmt(sorted[2] ?? 0)}.`,
          `Dans l’ordre : **${label(sorted)}**.`,
        ],
        targetSeconds: 30,
      };
    }
    const before = rng.int(0, 1) === 0;
    const n = before ? rng.int(2, 9) * 1000 : rng.int(11, 98) * 100 - 1;
    const res = before ? n - 1 : n + 1;
    return {
      prompt: `Quel nombre vient juste ${before ? 'avant' : 'après'} ${fmt(n)} ?`,
      answer: num(res),
      traps: traps(r(res), [
        [before ? n - 10 : n + 10, 'Juste avant ou après, c’est 1 de moins ou de plus.'],
        [before ? n + 1 : n - 1, before ? 'Avant, c’est plus petit.' : 'Après, c’est plus grand.'],
      ]),
      hint: before ? 'Enlève 1 : attention aux zéros.' : 'Ajoute 1 : attention aux 9.',
      steps: [
        `${before ? 'Avant' : 'Après'} ${fmt(n)}, on ${before ? 'enlève' : 'ajoute'} 1.`,
        `Le nombre est **${fmt(res)}**.`,
      ],
      targetSeconds: 20,
    };
  },
);

const demiDroite = skill(
  'mce2-demi-droite',
  'Placer un nombre sur une demi-droite graduée',
  'Savoir placer des nombres sur une demi-droite graduée ; savoir placer un nombre ou déterminer le nombre correspondant à un point sur une portion de demi-droite graduée de un en un, de dix en dix ou de cent en cent',
  [
    'Regarde d’abord de combien on avance à **chaque petit trait** : 1 ? 10 ? 100 ?',
    'Compte les traits depuis le nombre écrit, puis multiplie par la valeur d’un trait.',
  ],
  (rng, level) => {
    const step = level === 1 ? 1 : level === 2 ? 10 : 100;
    const start = rng.int(1, 9) * step * 10;
    const k = rng.int(1, 9);
    const at = start + k * step;
    return {
      prompt: `Sur cette demi-droite, chaque petit trait vaut ${fmt(step)}. Quel nombre est au point A ?`,
      figure: {
        kind: 'numberLine',
        min: start,
        max: start + 10 * step,
        subdivisions: 1 / step,
        labels: [start, start + 10 * step],
        points: [{ name: 'A', at }],
      },
      answer: num(at),
      traps: traps(r(at), [[start + k, `Un trait vaut ${fmt(step)}, pas 1.`]]),
      hint: `Compte les traits depuis ${fmt(start)} : chacun vaut ${fmt(step)}.`,
      steps: [`A est ${k} traits après ${fmt(start)}.`, `${fmt(start)} + ${k} × ${fmt(step)} = **${fmt(at)}**.`],
      targetSeconds: 25,
    };
  },
);

// ——— Calcul mental ———

const tables = skill(
  'mce2-tables',
  'Tables de multiplication',
  'Connaitre dans les deux sens les tables de multiplication (égalités à trou du type 7 × … = 42)',
  [
    '7 × 8 = 8 × 7 : on peut retourner une multiplication.',
    'Une division est une multiplication à l’envers : 56 ÷ 7 = 8 car 8 × 7 = 56.',
  ],
  (rng, level) => {
    const a = rng.int(2, 9);
    const b = level === 1 ? rng.pick([2, 3, 4, 5]) : rng.int(2, 9);
    if (level === 3) {
      return {
        prompt: `Complète : ${a} × ? = ${a * b}.`,
        answer: num(b),
        traps: traps(r(b), [[a * b - a, 'Cherche par quel nombre multiplier, pas la différence.']]),
        hint: `Récite la table de ${a} jusqu’à trouver ${a * b}.`,
        steps: [`On cherche le nombre de fois ${a} dans ${a * b}.`, `${a} × ${b} = ${a * b}, donc **${b}**.`],
        targetSeconds: 12,
      };
    }
    return {
      prompt: `Calcule ${a} × ${b}.`,
      answer: num(a * b),
      traps: traps(r(a * b), [[a + b, 'C’est une multiplication, pas une addition.']]),
      hint: `Compte de ${a} en ${a}, ${b} fois.`,
      steps: [`${a} × ${b} : ${b} fois ${a}.`, `= **${a * b}**.`],
      targetSeconds: 8,
    };
  },
  { mental: true },
);

const tablesAddition = skill(
  'mce2-tables-addition',
  'Tables d’addition',
  'Connaitre dans les deux sens les tables d’addition (égalités à trou du type 4 + … = 12 ; 10 = 7 + …)',
  [
    'On connaît les tables d’addition dans les deux sens : 4 + 8 = 12, donc 12 − 8 = 4 et 12 − 4 = 8.',
    'Pour trouver ce qui manque, on cherche le nombre à ajouter.',
  ],
  (rng, level) => {
    const total = level === 1 ? rng.int(5, 10) : rng.int(11, 20);
    const a = rng.int(2, total - 2);
    const b = total - a;
    const reversed = level === 3;
    return {
      prompt: reversed ? `Complète : ${total} = ${a} + … .` : `Complète : ${a} + … = ${total}.`,
      answer: num(b),
      traps: traps(r(b), [[total + a, 'On cherche ce qu’il manque pour arriver au total.']]),
      hint: `Cherche le nombre à ajouter à ${a} pour arriver à ${total}.`,
      steps: [`On cherche ce qu’il manque à ${a} pour faire ${total}.`, `${a} + ${b} = ${total}, donc **${b}**.`],
      targetSeconds: 8,
    };
  },
  { mental: true },
);

const DOUBLES: readonly (readonly number[])[] = [
  Array.from({ length: 20 }, (_, i) => i + 1),
  [20, 25, 30, 35, 40, 45, 50, 60, 75],
  [100, 150, 200, 250, 300, 400, 500, 600],
];
const MOITIES: readonly (readonly number[])[] = [
  Array.from({ length: 20 }, (_, i) => 2 * (i + 1)),
  [40, 50, 60, 70, 80, 90, 100, 120, 150],
  [200, 300, 400, 500, 600, 800, 1000, 1200],
];

const doublesMoities = skill(
  'mce2-doubles-moities',
  'Doubles et moitiés',
  'Connaitre des faits multiplicatifs usuels : doubles des nombres de 1 à 20, de 25, 75, 150, 250… ; moitiés des nombres pairs de 2 à 40, des dizaines et des centaines entières usuelles',
  [
    'Le **double**, c’est deux fois le nombre : double de 35 = 70.',
    'La **moitié**, c’est le partage en 2 parts égales : moitié de 70 = 35.',
  ],
  (rng, level) => {
    const i = level - 1;
    if (rng.int(0, 1) === 0) {
      const x = rng.pick(MOITIES[i] ?? []);
      return {
        prompt: `Quelle est la moitié de ${fmt(x)} ?`,
        answer: num(x / 2),
        traps: traps(r(x / 2), [[x * 2, 'La moitié est plus petite que le nombre.']]),
        hint: 'Partage le nombre en deux parts égales, par exemple dizaines puis unités.',
        steps: [`Moitié de ${fmt(x)} : ${fmt(x)} ÷ 2.`, `= **${fmt(x / 2)}**.`],
        targetSeconds: 15,
      };
    }
    const x = rng.pick(DOUBLES[i] ?? []);
    return {
      prompt: `Quel est le double de ${fmt(x)} ?`,
      answer: num(x * 2),
      traps: traps(r(x * 2), [[x + 2, 'Le double, c’est 2 fois le nombre, pas + 2.']]),
      hint: 'Double les dizaines, double les unités, puis rassemble.',
      steps: [`Double de ${fmt(x)} : ${fmt(x)} + ${fmt(x)}.`, `= **${fmt(x * 2)}**.`],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const procedures = skill(
  'mce2-procedures',
  'Procédures de calcul mental',
  'Apprendre des procédures de calcul mental : ajouter 8, 9, 18, 19, 28, 29, 38 ou 39 ; soustraire 9, 19, 29 ou 39 ; multiplier par 4 ou par 8',
  [
    '+ 9 : on ajoute 10 puis on enlève 1. + 38 : on ajoute 40 puis on enlève 2. − 29 : on enlève 30 puis on rajoute 1.',
    '× 4 : le double du double. × 8 : on double trois fois.',
  ],
  (rng, level) => {
    if (level === 3) {
      const k = rng.pick([4, 8]);
      const n = rng.int(12, 40);
      const steps = k === 4 ? [n * 2, n * 4] : [n * 2, n * 4, n * 8];
      return {
        prompt: `Calcule ${n} × ${k}.`,
        answer: num(n * k),
        traps: traps(r(n * k), [[n * k - n, `Il manque une fois ${n}.`]]),
        hint: `Double ${n}${k === 8 ? ' trois fois de suite' : ' puis double encore'}.`,
        steps: [`${n} → ${steps.join(' → ')}.`, `${n} × ${k} = **${n * k}**.`],
        targetSeconds: 20,
      };
    }
    const minus = level === 2;
    const k = minus ? rng.pick([9, 19, 29, 39]) : rng.pick([8, 9, 18, 19, 28, 29, 38, 39]);
    const n = rng.int(minus ? 45 : 20, 199);
    const round = k + (k % 10 === 9 ? 1 : 2);
    const res = minus ? n - k : n + k;
    return {
      prompt: `Calcule ${n} ${minus ? '−' : '+'} ${k}.`,
      answer: num(res),
      traps: traps(r(res), [
        [
          minus ? n - round : n + round,
          `Tu as ${minus ? 'enlevé' : 'ajouté'} ${round} : il faut corriger de ${round - k}.`,
        ],
      ]),
      hint: `${minus ? 'Enlève' : 'Ajoute'} ${round}, puis corrige.`,
      steps: [
        `${n} ${minus ? '−' : '+'} ${round} = ${minus ? n - round : n + round}.`,
        `On corrige de ${round - k} : **${res}**.`,
      ],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

// ——— Opérations posées ———

/** Valeur obtenue en additionnant colonne par colonne sans retenue (erreur classique). */
const noCarryAdd = (a: number, b: number) => {
  const da = digitsOf(a);
  const db = digitsOf(b);
  return da.reduce((acc, d, i) => acc + ((d + (db[i] ?? 0)) % 10) * 10 ** i, 0);
};

const addition = skill(
  'mce2-addition',
  'Additions posées',
  'Poser et effectuer des additions et des soustractions en colonnes (nombres entiers inférieurs ou égaux à 10 000)',
  [
    'On aligne les chiffres : unités sous unités, dizaines sous dizaines… On additionne de droite à gauche.',
    '8 + 7 = 15 : j’écris 5 et je retiens 1 dizaine.',
  ],
  (rng, level) => {
    const lo = level === 1 ? 100 : 1000;
    const hi = level === 1 ? 499 : level === 2 ? 4999 : 6999;
    const a = rng.int(lo, hi);
    const b = rng.int(lo, hi);
    const [da, db] = [digitsOf(a), digitsOf(b)];
    let carry = 0;
    const cols: string[] = [];
    for (let i = 0; i < 4 && (a >= 10 ** i || b >= 10 ** i); i++) {
      const s = (da[i] ?? 0) + (db[i] ?? 0) + carry;
      cols.push(
        `${RANKS[i]} : ${da[i]} + ${db[i]}${carry ? ' + 1' : ''} = ${s}${s > 9 ? ` (j’écris ${s % 10}, je retiens 1)` : ''}`,
      );
      carry = s > 9 ? 1 : 0;
    }
    return {
      prompt: `Pose et calcule ${fmt(a)} + ${fmt(b)}.`,
      answer: num(a + b),
      traps: traps(r(a + b), [[noCarryAdd(a, b), 'Tu as oublié une retenue.']]),
      hint: 'Aligne les unités, puis additionne de droite à gauche sans oublier les retenues.',
      steps: [
        cols.slice(0, 2).join(' ; ') + '.',
        cols.slice(2).join(' ; ') || 'Pas d’autre colonne.',
        `${fmt(a)} + ${fmt(b)} = **${fmt(a + b)}**.`,
      ],
      targetSeconds: 40,
    };
  },
);

const soustraction = skill(
  'mce2-soustraction',
  'Soustractions posées',
  'Poser et effectuer des additions et des soustractions en colonnes (nombres entiers inférieurs ou égaux à 10 000)',
  [
    'On met le plus grand nombre en haut. Si le chiffre du haut est trop petit, on « emprunte » une dizaine (ou une centaine…) à la colonne de gauche.',
    'On vérifie en additionnant : résultat + petit nombre = grand nombre.',
  ],
  (rng, level) => {
    const hi = level === 1 ? 999 : 9999;
    const b = rng.int(level === 1 ? 100 : 1000, hi - 100);
    const a = rng.int(b + 1, hi);
    const [da, db] = [digitsOf(a), digitsOf(b)];
    const noBorrow = da.reduce((acc, d, i) => acc + Math.abs(d - (db[i] ?? 0)) * 10 ** i, 0);
    return {
      prompt: `Pose et calcule ${fmt(a)} − ${fmt(b)}.`,
      answer: num(a - b),
      traps: traps(r(a - b), [
        [noBorrow, 'Dans chaque colonne, on enlève toujours le petit chiffre au grand : il faut parfois emprunter.'],
        [a + b, 'C’est une soustraction.'],
      ]),
      hint: 'Aligne les unités ; si le chiffre du haut est trop petit, emprunte à la colonne de gauche.',
      steps: [
        `On met ${fmt(a)} en haut et ${fmt(b)} en dessous, unités sous unités.`,
        `On soustrait colonne par colonne, de droite à gauche, en empruntant si besoin.`,
        `Vérification : ${fmt(a - b)} + ${fmt(b)} = ${fmt(a)}. Résultat : **${fmt(a - b)}**.`,
      ],
      targetSeconds: 45,
    };
  },
);

const multiplication = skill(
  'mce2-multiplication',
  'Multiplications posées',
  'Poser et effectuer des multiplications d’un nombre à deux ou trois chiffres par un nombre à un ou deux chiffres',
  [
    'On multiplie chaque rang : 347 × 6 = 300 × 6 + 40 × 6 + 7 × 6 = 1 800 + 240 + 42.',
    'Avec un nombre à deux chiffres, on fait une ligne pour les unités et une ligne pour les dizaines (on décale d’un rang).',
  ],
  (rng, level) => {
    if (level === 3) {
      const a = rng.int(100, 350);
      const b = rng.int(12, 28);
      const [t, u] = [Math.floor(b / 10) * 10, b % 10];
      return {
        prompt: `Pose et calcule ${fmt(a)} × ${b}.`,
        answer: num(a * b),
        traps: traps(r(a * b), [
          [
            a * u + a * (t / 10),
            `La ligne des dizaines se décale d’un rang : on multiplie par ${t}, pas par ${t / 10}.`,
          ],
        ]),
        hint: 'Multiplie d’abord par les unités, puis par les dizaines du petit nombre, et additionne.',
        steps: [
          `${fmt(a)} × ${u} = ${fmt(a * u)} (ligne des unités).`,
          `${fmt(a)} × ${t} = ${fmt(a * t)} (ligne des dizaines, décalée).`,
          `${fmt(a * u)} + ${fmt(a * t)} = **${fmt(a * b)}**.`,
        ],
        targetSeconds: 70,
      };
    }
    const k = level === 1 ? rng.int(2, 5) : rng.int(2, 9);
    const a = level === 1 ? rng.int(12, 99) : rng.int(100, 499);
    const [u, d, c] = digitsOf(a) as [number, number, number];
    const parts = [c * 100, d * 10, u]
      .filter((v, i) => v > 0 || (i === 2 && a < 10))
      .map((v) => `${fmt(v)} × ${k} = ${fmt(v * k)}`);
    const noCarry = digitsOf(a).reduce((acc, dg, i) => acc + ((dg * k) % 10) * 10 ** i, 0);
    return {
      prompt: `Calcule ${fmt(a)} × ${k}.`,
      answer: num(a * k),
      traps: traps(r(a * k), [[noCarry, 'Tu as oublié les retenues.']]),
      hint: 'Décompose le grand nombre en centaines, dizaines et unités.',
      steps: [`On décompose ${fmt(a)} : ${parts.join(' ; ')}.`, `On additionne : **${fmt(a * k)}**.`],
      targetSeconds: 40,
    };
  },
);

// ——— Problèmes ———

const problemeAdditif = skill(
  'mce2-probleme-additif',
  'Problèmes avec une addition ou une soustraction',
  'Résoudre des problèmes additifs en une étape de types parties-tout et comparaison',
  [
    'Je gagne, j’ajoute : addition. Je perds, je donne : soustraction.',
    'Pour trouver une différence entre deux nombres, je soustrais le petit au grand.',
  ],
  (rng, level) => {
    const name = rng.pick(NAMES);
    const a = rng.int(level === 1 ? 20 : 150, level === 1 ? 90 : 900);
    const b = rng.int(level === 1 ? 5 : 20, level === 1 ? 19 : 140);
    const kind = rng.int(0, 2);
    if (kind === 0)
      return {
        prompt: `${name} a ${a} billes. Il en gagne ${b}. Combien en a-t-il maintenant ?`,
        answer: num(a + b, 'billes'),
        traps: traps(r(a + b), [[a - b, 'Il en gagne : on ajoute.']]),
        hint: 'Gagner, c’est en avoir plus.',
        steps: [`${a} billes, plus ${b} billes.`, `${a} + ${b} = **${a + b}** billes.`],
        targetSeconds: 25,
      };
    if (kind === 1)
      return {
        prompt: `${name} a ${a + b} images. Il en donne ${b}. Combien lui en reste-t-il ?`,
        answer: num(a, 'images'),
        traps: traps(r(a), [[a + 2 * b, 'Il en donne : il en a moins.']]),
        hint: 'Donner, c’est en avoir moins.',
        steps: [`Au départ ${a + b} images, il en donne ${b}.`, `${a + b} − ${b} = **${a}** images.`],
        targetSeconds: 25,
      };
    return {
      prompt: `Dans la classe de ${name}, il y a ${a + b} élèves à la cantine et ${a} élèves à l’étude. Combien d’élèves de plus à la cantine ?`,
      answer: num(b, 'élèves'),
      traps: traps(r(b), [[2 * a + b, 'On cherche l’écart, pas le total.']]),
      hint: 'Pour trouver combien de plus, on cherche l’écart entre les deux nombres.',
      steps: [`On compare ${a + b} et ${a}.`, `${a + b} − ${a} = **${b}** élèves de plus.`],
      targetSeconds: 30,
    };
  },
);

const problemeMultiplicatif = skill(
  'mce2-probleme-multiplicatif',
  'Problèmes avec une multiplication ou un partage',
  'Résoudre des problèmes multiplicatifs en une étape (valeur du tout, valeur d’une part, nombre de parts dans un partage équitable)',
  [
    'Des groupes égaux : on multiplie. 4 sacs de 6 billes : 4 × 6 = 24 billes.',
    'Un partage en parts égales : on cherche le nombre manquant dans la table. 24 billes pour 4 enfants : 4 × ? = 24.',
  ],
  (rng, level) => {
    const name = rng.pick(NAMES);
    const k = rng.int(2, level === 1 ? 5 : 9);
    const q = rng.int(2, level === 1 ? 6 : 9);
    const kind = rng.int(0, 2);
    if (kind === 0)
      return {
        prompt: `${name} achète ${k} paquets de ${q} cartes. Combien de cartes a-t-il en tout ?`,
        answer: num(k * q, 'cartes'),
        traps: traps(r(k * q), [[k + q, 'Des paquets égaux : on multiplie.']]),
        hint: 'Plusieurs paquets identiques : pense à la multiplication.',
        steps: [`${k} paquets de ${q} cartes.`, `${k} × ${q} = **${k * q}** cartes.`],
        targetSeconds: 20,
      };
    if (kind === 1)
      return {
        prompt: `${name} partage ${k * q} bonbons entre ${k} amis, chacun reçoit autant. Combien de bonbons par ami ?`,
        answer: num(q, 'bonbons'),
        traps: traps(r(q), [[k * q * k, 'On partage : le résultat est plus petit.']]),
        hint: `Cherche dans la table de ${k} le nombre qui donne ${k * q}.`,
        steps: [`${k * q} bonbons partagés entre ${k} amis.`, `${k} × ${q} = ${k * q}, donc **${q}** bonbons chacun.`],
        targetSeconds: 25,
      };
    return {
      prompt: `Il faut ${k * q} chaises, rangées par ${q}. Combien de rangées ?`,
      answer: num(k, 'rangées'),
      traps: traps(r(k), [[k * q - q, 'On cherche le nombre de rangées.']]),
      hint: `Combien de fois ${q} dans ${k * q} ?`,
      steps: [`On range ${k * q} chaises par ${q}.`, `${q} × ${k} = ${k * q} : **${k}** rangées.`],
      targetSeconds: 25,
    };
  },
);

const problemeDeuxEtapes = skill(
  'mce2-probleme-deux-etapes',
  'Problèmes en deux étapes',
  'Résoudre des problèmes additifs en deux étapes ; résoudre des problèmes mixtes en deux ou trois étapes',
  [
    'Un problème en deux étapes : on cherche d’abord ce qui manque pour répondre, puis on calcule la réponse.',
    'On écrit chaque étape avec son calcul.',
  ],
  (rng) => {
    const name = rng.pick(NAMES);
    const price = rng.int(3, 9);
    const n = rng.int(2, 6);
    const extra = rng.int(2, 9);
    const kind = rng.int(0, 2);
    if (kind === 2) {
      const first = rng.int(100, 400);
      const more = rng.int(20, 90);
      const other = rng.pick(NAMES.filter((n) => n !== name));
      return {
        prompt: `${name} a ${first} billes. ${other} en a ${more} de plus que ${name}. Combien les deux enfants ont-ils de billes en tout ?`,
        answer: num(2 * first + more, 'billes'),
        traps: traps(r(2 * first + more), [[first + more, `Il faut aussi compter les billes de ${name}.`]]),
        hint: `Cherche d’abord le nombre de billes de ${other}.`,
        steps: [
          `${other} : ${first} + ${more} = ${first + more} billes.`,
          `${first} + ${first + more} = **${2 * first + more}** billes.`,
        ],
        targetSeconds: 50,
      };
    }
    if (kind === 0) {
      const total = price * n + extra;
      return {
        prompt: `${name} achète ${n} cahiers à ${price} € et un stylo à ${extra} €. Combien paie-t-il en tout ?`,
        answer: num(total, '€'),
        traps: traps(r(total), [[price + n + extra, 'Les cahiers sont identiques : multiplie d’abord.']]),
        hint: 'Calcule d’abord le prix des cahiers.',
        steps: [`${n} cahiers : ${n} × ${price} = ${n * price} €.`, `${n * price} + ${extra} = **${total}** €.`],
        targetSeconds: 45,
      };
    }
    const given = price * n + extra;
    return {
      prompt: `${name} a ${given} €. Il achète ${n} jouets à ${price} €. Combien lui reste-t-il ?`,
      answer: num(extra, '€'),
      traps: traps(r(extra), [[given + price * n, 'Il dépense de l’argent : il lui en reste moins.']]),
      hint: 'Calcule d’abord ce qu’il dépense.',
      steps: [`${n} jouets : ${n} × ${price} = ${n * price} €.`, `${given} − ${n * price} = **${extra}** €.`],
      targetSeconds: 45,
    };
  },
);

const problemeFoisPlus = skill(
  'mce2-probleme-fois-plus',
  'Problèmes : « fois plus »',
  'Résoudre des problèmes de comparaison multiplicative en une étape (« fois plus », « fois moins »)',
  [
    '« 4 fois plus cher » : on multiplie par 4. Ce n’est pas la même chose que « 4 € de plus » : on additionne.',
    'Un schéma en barres aide : 4 barres de la taille du casque.',
  ],
  (rng) => {
    const k = rng.int(2, 9);
    const base = rng.int(3, 30);
    return {
      prompt: `Une trottinette coûte ${k} fois plus cher qu’un casque. Le casque coûte ${base} €. Combien coûte la trottinette ?`,
      answer: num(k * base, '€'),
      traps: traps(r(k * base), [[k + base, '« fois plus » veut dire qu’on multiplie, pas qu’on ajoute.']]),
      hint: `Le prix du casque est répété ${k} fois.`,
      steps: [`${k} fois plus cher : ${k} fois le prix du casque.`, `${k} × ${base} = **${k * base} €**.`],
      targetSeconds: 30,
    };
  },
);

// ——— Fractions ———

const DENS_12 = [2, 3, 4, 5, 6, 8, 10, 12] as const;

const fractionFigure = skill(
  'mce2-fraction-figure',
  'Fractions d’un tout',
  'Réinvestir les fractions d’un tout étudiées au CE1 (dénominateur inférieur ou égal à douze, fraction inférieure ou égale à un)',
  [
    'Une fraction se lit avec le nombre de parts égales : {1/2} la moitié, {1/3} un tiers, {1/4} un quart.',
    '{3/4} : on a partagé en 4 parts égales et on en prend 3.',
  ],
  (rng, level) => {
    const den = level === 1 ? rng.pick([2, 3, 4]) : rng.pick(DENS_12.filter((d) => d > 2));
    const taken = level === 1 ? 1 : rng.int(1, den - 1);
    if (level === 3) {
      const left = den - taken;
      return {
        prompt: `Un gâteau est partagé en ${den} parts égales. Léa en mange ${taken}. Quelle fraction du gâteau reste-t-il ?`,
        answer: fraction(r(left, den)),
        traps: taken === left ? [] : [{ value: r(taken, den), why: 'C’est la part mangée : on cherche ce qui reste.' }],
        hint: 'Compte les parts qui restent, sur le nombre total de parts égales.',
        steps: [
          `Le gâteau a ${den} parts, Léa en mange ${taken} : il en reste ${den} − ${taken} = ${left}.`,
          `Il reste **{${left}/${den}}** du gâteau.`,
        ],
        demo: { kind: 'fraction', parts: [{ num: left, den }] },
        targetSeconds: 30,
      };
    }
    return {
      prompt: `Une pizza est partagée en ${den} parts égales. Léa en mange ${taken}. Quelle fraction de la pizza a-t-elle mangée ?`,
      answer: fraction(r(taken, den)),
      traps: [{ value: r(den, taken), why: 'Le dénominateur (en bas) est le nombre total de parts égales.' }],
      hint: 'En bas, on écrit en combien de parts égales on a partagé ; en haut, combien on en prend.',
      steps: [
        `${den} parts égales : dénominateur ${den}. Léa en prend ${taken} : numérateur ${taken}.`,
        `Elle a mangé **{${taken}/${den}}** de la pizza.`,
      ],
      demo: { kind: 'fraction', parts: [{ num: taken, den }] },
      targetSeconds: 25,
    };
  },
);

/** Égalités du type {1/2} = {?/8} : fraction de départ et dénominateurs multiples (≤ 12). */
const EQUALS: readonly { num: number; den: number; mult: readonly number[] }[] = [
  { num: 1, den: 2, mult: [2, 3, 4, 5, 6] },
  { num: 1, den: 3, mult: [2, 3, 4] },
  { num: 1, den: 4, mult: [2, 3] },
  { num: 3, den: 4, mult: [2, 3] },
  { num: 2, den: 3, mult: [2, 3, 4] },
  { num: 1, den: 5, mult: [2] },
  { num: 3, den: 5, mult: [2] },
];

const fractionsEgales = skill(
  'mce2-fractions-egales',
  'Égalités de fractions',
  'Savoir établir des égalités de fractions inférieures ou égales à 1',
  [
    'Si on fait des parts 2 fois plus petites et qu’on en prend 2 fois plus, on prend la même quantité : {1/2} = {2/4} = {4/8}.',
    'On multiplie le numérateur et le dénominateur par le même nombre.',
  ],
  (rng, level) => {
    const e = rng.pick(EQUALS);
    const m = rng.pick(e.mult);
    if (level === 3) {
      const good = `{${e.num * m}/${e.den * m}}`;
      const bad = [
        {
          label: `{${e.num * m}/${e.den * m + 1}}`,
          why: 'Quand on multiplie le dénominateur, on multiplie aussi le numérateur.',
        },
        { label: `{${e.num + m}/${e.den * m}}`, why: 'On multiplie le numérateur, on ne lui ajoute pas le nombre.' },
        { label: `{${e.num * m + 1}/${e.den * m}}`, why: 'Multiplie le haut et le bas par le même nombre.' },
      ];
      const { answer, traps: t } = choice(rng, good, bad);
      return {
        prompt: `Quelle fraction est égale à {${e.num}/${e.den}} ?`,
        answer,
        traps: t,
        hint: 'Fais des parts plus petites, et prends-en plus pour garder la même quantité.',
        steps: [
          `Le dénominateur est multiplié par ${m} : ${e.den} → ${e.den * m}.`,
          `Le numérateur aussi : ${e.num} → ${e.num * m}. C’est **${good}**.`,
        ],
        targetSeconds: 30,
      };
    }
    return {
      prompt: `Complète : {${e.num}/${e.den}} = {? / ${e.den * m}}.`,
      answer: num(e.num * m),
      traps: traps(r(e.num * m), [[e.num + m, 'On multiplie le numérateur par le même nombre que le dénominateur.']]),
      hint: 'Par combien a-t-on multiplié le dénominateur ? Fais pareil avec le numérateur.',
      steps: [
        `${e.den} × ${m} = ${e.den * m} : le dénominateur est multiplié par ${m}.`,
        `Le numérateur aussi : ${e.num} × ${m} = **${e.num * m}**.`,
      ],
      targetSeconds: 25,
    };
  },
);

const fractionsComparer = skill(
  'mce2-fractions-comparer',
  'Comparer des fractions',
  'Comparer des fractions inférieures à 1 : même dénominateur, même numérateur, dénominateur multiple de l’autre',
  [
    'Même dénominateur : la plus grande a le plus grand numérateur ({7/12} > {5/12}).',
    'Même numérateur : les parts les plus petites donnent la plus petite fraction ({5/12} < {5/8}).',
  ],
  (rng, level) => {
    let a: [number, number];
    let b: [number, number];
    let why: string;
    if (level === 1) {
      const den = rng.pick([4, 5, 6, 8, 10, 12]);
      const n1 = rng.int(1, den - 2);
      a = [n1, den];
      b = [rng.int(n1 + 1, den - 1), den];
      why = 'Le dénominateur est le même : on compare les numérateurs.';
    } else if (level === 2) {
      const n = rng.int(2, 7);
      const d1 = rng.int(n + 1, 8);
      a = [n, d1];
      b = [n, rng.int(d1 + 1, 12)];
      why = 'Le numérateur est le même : plus on partage en parts, plus les parts sont petites.';
    } else {
      const d = rng.pick([2, 3, 4, 5, 6]);
      const m = rng.pick([2, 3].filter((x) => d * x <= 12));
      const n1 = rng.int(1, d - 1);
      a = [n1, d];
      b = [rng.int(1, d * m - 1), d * m];
      while (b[0] * d === a[0] * b[1]) b = [rng.int(1, d * m - 1), d * m];
      why = `On met les deux fractions sur le même dénominateur : {${a[0]}/${a[1]}} = {${a[0] * m}/${a[1] * m}}.`;
    }
    const bigger = a[0] * b[1] > b[0] * a[1] ? a : b;
    const smaller = bigger === a ? b : a;
    const f = (x: [number, number]) => `{${x[0]}/${x[1]}}`;
    const { answer, traps: t } = choice(rng, f(bigger), [{ label: f(smaller), why }]);
    return {
      prompt: `Quelle fraction est la plus grande : ${f(a)} ou ${f(b)} ?`,
      answer,
      traps: t,
      hint:
        level === 1
          ? 'Les parts sont de même taille : compare le nombre de parts prises.'
          : level === 2
            ? 'Compare la taille des parts : plus il y en a pour faire un tout, plus elles sont petites.'
            : 'Mets les deux fractions sur le même dénominateur.',
      steps: [why, `La plus grande est **${f(bigger)}**.`],
      targetSeconds: 30,
    };
  },
);

const fractionsAddition = skill(
  'mce2-fractions-addition',
  'Additionner et soustraire des fractions',
  'Additionner et soustraire des fractions de même dénominateur ; résoudre des problèmes avec des fractions de même dénominateur',
  [
    'Même dénominateur : on additionne (ou soustrait) les numérateurs et le dénominateur ne change pas.',
    '{1/10} + {3/10} = {4/10} : un dixième plus trois dixièmes font quatre dixièmes.',
  ],
  (rng, level) => {
    const den = rng.pick([4, 5, 6, 8, 10, 12]);
    if (level === 3) {
      const a = rng.int(1, 2);
      const b = rng.int(1, 2);
      const c = rng.int(1, 2);
      const left = den - a - b - c;
      const names = [rng.pick(NAMES)];
      return {
        prompt: `${names[0]} fait un gâteau. Il en mange {${a}/${den}}, Ayla en mange {${b}/${den}} et Tao en mange {${c}/${den}}. Quelle fraction du gâteau reste-t-il ?`,
        answer: fraction(r(left, den)),
        traps:
          a + b + c === left
            ? []
            : [{ value: r(a + b + c, den), why: 'C’est la part mangée : on cherche ce qui reste.' }],
        hint: 'Additionne ce qui a été mangé, puis cherche ce qui manque pour faire le gâteau entier.',
        steps: [
          `Mangé : {${a}/${den}} + {${b}/${den}} + {${c}/${den}} = {${a + b + c}/${den}}.`,
          `Le gâteau entier fait {${den}/${den}} : il reste {${den}/${den}} − {${a + b + c}/${den}} = **{${left}/${den}}**.`,
        ],
        targetSeconds: 50,
      };
    }
    const minus = level === 2;
    const x = rng.int(minus ? 2 : 1, den - (minus ? 1 : 2));
    const y = minus ? rng.int(1, x - 1) : rng.int(1, den - x - 1);
    const res = minus ? x - y : x + y;
    return {
      prompt: `Calcule {${x}/${den}} ${minus ? '−' : '+'} {${y}/${den}}.`,
      answer: fraction(r(res, den)),
      traps: [{ value: r(res, den * 2), why: 'Le dénominateur ne change pas : on ne l’additionne pas.' }],
      hint: 'Les parts sont de même taille : combine les numérateurs.',
      steps: [
        `Même dénominateur ${den} : on ${minus ? 'soustrait' : 'additionne'} les numérateurs, ${x} ${minus ? '−' : '+'} ${y} = ${res}.`,
        `Le résultat est **{${res}/${den}}**.`,
      ],
      targetSeconds: 25,
    };
  },
);

const fractionsLongueur = skill(
  'mce2-fractions-longueur',
  'Fractions d’une unité de longueur',
  'Partager une unité de longueur en fractions d’unité et mesurer des longueurs non entières par rapport à cette unité',
  [
    'On partage l’unité en parts égales : une règle graduée en quarts a 4 intervalles entre 0 et 1.',
    'Un point au 3e trait est à {3/4} d’unité.',
  ],
  (rng, level) => {
    const den = level === 1 ? rng.pick([2, 4]) : level === 2 ? rng.pick([5, 10]) : rng.pick([3, 6, 8, 12]);
    const taken = rng.int(1, den - 1);
    return {
      prompt: `L’unité de longueur est partagée en ${den} intervalles égaux. Quelle fraction d’unité indique le point A ?`,
      figure: {
        kind: 'numberLine',
        min: 0,
        max: 1,
        subdivisions: den,
        labels: [0, 1],
        points: [{ name: 'A', at: taken / den }],
      },
      answer: fraction(r(taken, den)),
      traps: [
        { value: r(taken, den + 1), why: `Il y a ${den} intervalles égaux entre 0 et 1 : c’est le dénominateur.` },
      ],
      hint: 'Compte les intervalles entre 0 et 1, puis ceux entre 0 et le point A.',
      steps: [
        `Entre 0 et 1, il y a ${den} intervalles égaux : on a des parts de {1/${den}}.`,
        `A est au ${taken}e trait : **{${taken}/${den}}** d’unité.`,
      ],
      targetSeconds: 30,
    };
  },
);

export const CE2_NOMBRES: readonly EvalChapter[] = [
  chapter('mce2-nombres', 'nombres', 'Nombres jusqu’à 10 000', [decomposer, comparer, demiDroite]),
  chapter('mce2-calcul-mental', 'nombres', 'Calcul mental : tables, doubles, procédures', [
    tablesAddition,
    tables,
    doublesMoities,
    procedures,
  ]),
  chapter('mce2-operations', 'nombres', 'Additions, soustractions et multiplications posées', [
    addition,
    soustraction,
    multiplication,
  ]),
  chapter('mce2-problemes', 'nombres', 'Problèmes additifs et multiplicatifs', [
    problemeAdditif,
    problemeMultiplicatif,
    problemeDeuxEtapes,
    problemeFoisPlus,
  ]),
  chapter('mce2-fractions', 'nombres', 'Fractions d’un tout et d’une unité', [
    fractionFigure,
    fractionsEgales,
    fractionsComparer,
    fractionsAddition,
    fractionsLongueur,
  ]),
];
