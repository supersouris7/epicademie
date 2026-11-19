import { choice, distinct, num, traps } from '../../build.ts';
import { add, cmp, dec, fmt, mul, r, rawFrac, sub, toNumber, type Rational } from '../../rational.ts';
import { big, bossOf, NAMES } from '../kit.ts';
import { S, C, exactDecimal } from './commun.ts';

const RANKS = [
  'unités',
  'dizaines',
  'centaines',
  'unités de mille',
  'dizaines de mille',
  'centaines de mille',
  'millions',
  'dizaines de millions',
  'centaines de millions',
  'milliards',
];
const DEC_RANKS = ['dixièmes', 'centièmes', 'millièmes'];

/** Écriture avec 2 chiffres après la virgule (3,4 → 3,40 ; 3 → 3,00), pour comparer. */
const two = (x: Rational) => toNumber(x).toFixed(2).replace('.', ',');

// ——— Nombres entiers et décimaux ———

const rang = S(
  'm6-rang',
  'Valeur d’un chiffre selon son rang',
  'Connaître et utiliser la valeur des chiffres selon leur rang dans l’écriture d’un nombre',
  [
    'Chaque chiffre a une **valeur** selon sa place : dans 4 725,38, le 7 est le chiffre des centaines et le 3 celui des dixièmes.',
    'Lis le nombre de droite à gauche depuis la virgule : unités, dizaines, centaines… et après la virgule : dixièmes, centièmes, millièmes.',
  ],
  (rng, level) => {
    if (level === 3) {
      // Nombre de dizaines / centaines dans un nombre entier (pas seulement le chiffre).
      const n = rng.int(10_000, 999_999);
      const unit = rng.pick([
        { name: 'dizaines', div: 10 },
        { name: 'centaines', div: 100 },
        { name: 'milliers', div: 1000 },
      ]);
      const answer = Math.floor(n / unit.div);
      const digit = Math.floor(n / unit.div) % 10;
      return {
        prompt: `Combien y a-t-il de **${unit.name}** en tout dans ${big(n)} ?`,
        answer: num(answer),
        traps: traps(r(answer), [
          [
            digit,
            `${digit} est seulement le **chiffre** des ${unit.name}. On demande le **nombre** de ${unit.name} en tout.`,
          ],
        ]),
        hint: `Le nombre de ${unit.name}, c’est tout ce qui est écrit à partir du chiffre des ${unit.name}, en allant vers la gauche.`,
        steps: [
          `Le chiffre des ${unit.name} est ${digit}, mais il y a aussi des ${unit.name} dans les rangs plus à gauche.`,
          `On garde tous les chiffres jusqu’à celui des ${unit.name} : ${big(n)} contient **${big(answer)}** ${unit.name}.`,
        ],
        targetSeconds: 25,
      };
    }
    const intDigits = level === 1 ? rng.int(4, 7) : rng.int(3, 6);
    const decDigits = level === 1 ? 0 : rng.int(1, 3);
    const digits = Array.from({ length: intDigits + decDigits }, (_, i) => (i === 0 ? rng.int(1, 9) : rng.int(0, 9)));
    // Chiffres tous différents sur la position demandée pour éviter l'ambiguïté.
    const pos = rng.int(0, intDigits + decDigits - 1);
    const value = digits[pos] ?? 0;
    const isInt = pos < intDigits;
    const rankName = isInt ? (RANKS[intDigits - 1 - pos] ?? '') : (DEC_RANKS[pos - intDigits] ?? '');
    const shown = fmt(r(Number(digits.join('')), 10 ** decDigits));
    const others = RANKS.slice(0, intDigits).map((x, i) => ({ x, d: digits[intDigits - 1 - i] ?? 0 }));
    const wrong = others.find((o) => o.d !== value);
    return {
      prompt: `Quel est le chiffre des **${rankName}** dans ${shown} ?`,
      answer: num(value),
      traps: wrong ? traps(r(value), [[wrong.d, `${wrong.d} est le chiffre des ${wrong.x}.`]]) : [],
      hint: isInt
        ? 'Pars de la virgule (ou de la fin du nombre) et remonte vers la gauche : unités, dizaines, centaines…'
        : 'Juste après la virgule : dixièmes, puis centièmes, puis millièmes.',
      steps: [
        isInt
          ? `On part du chiffre des unités et on remonte vers la gauche jusqu’aux ${rankName}.`
          : `Après la virgule, on compte : 1er chiffre = dixièmes, 2e = centièmes, 3e = millièmes.`,
        `Le chiffre des ${rankName} est **${value}**.`,
      ],
      targetSeconds: 12,
    };
  },
  { mental: true },
);

const grandsNombres = S(
  'm6-grands-nombres',
  'Grands nombres (jusqu’au milliard)',
  'Connaître des grands nombres entiers',
  [
    'Un **million**, c’est mille milliers : 1 000 000. Un **milliard**, c’est mille millions : 1 000 000 000.',
    'Pour lire un grand nombre, on fait des **tranches de 3 chiffres** en partant de la droite : milliards, millions, milliers, unités.',
  ],
  (rng, level) => {
    if (level === 1) {
      const m = rng.int(2, 9);
      const k = rng.int(101, 999);
      const u = rng.int(101, 999);
      const n = m * 1_000_000 + k * 1000 + u;
      const opts = [
        { label: `${m} millions ${k} mille ${u}`, ok: true },
        { label: `${m} milliards ${k} millions ${u}`, ok: false },
        { label: `${m} mille ${k} cent ${u}`, ok: false },
      ];
      return {
        prompt: `Comment se lit ${big(n)} ?`,
        ...choice(rng, opts[0]?.label ?? '', [
          { label: opts[1]?.label ?? '', why: 'Il n’y a que 7 chiffres : on ne dépasse pas les millions.' },
          {
            label: opts[2]?.label ?? '',
            why: 'Fais des tranches de 3 chiffres depuis la droite : la 3e tranche, ce sont les millions.',
          },
        ]),
        hint: 'Fais des tranches de 3 chiffres en partant de la droite : unités, milliers, millions.',
        steps: [`Tranches de 3 chiffres : ${m} | ${k} | ${u}.`, `On lit : **${m} millions ${k} mille ${u}**.`],
        targetSeconds: 15,
      };
    }
    if (level === 2) {
      const unit = rng.pick([
        { name: 'millions', v: 1_000_000 },
        { name: 'milliers', v: 1000 },
      ]);
      const a = rng.int(2, 999);
      return {
        prompt: `Combien font ${a} ${unit.name} ? Écris le nombre en chiffres.`,
        answer: num(a * unit.v),
        traps: traps(r(a * unit.v), [
          [
            a * (unit.v / 1000),
            `Un ${unit.name === 'millions' ? 'million' : 'millier'} a ${unit.name === 'millions' ? '6' : '3'} zéros.`,
          ],
        ]),
        hint: unit.name === 'millions' ? 'Un million = 1 000 000 : 6 zéros.' : 'Un millier = 1 000 : 3 zéros.',
        steps: [
          `1 ${unit.name === 'millions' ? 'million' : 'millier'} = ${big(unit.v)}.`,
          `${a} × ${big(unit.v)} = **${big(a * unit.v)}**.`,
        ],
        targetSeconds: 15,
      };
    }
    // Milliards : combien de millions dans un milliard, etc.
    const q = rng.pick([
      { prompt: 'Combien y a-t-il de **millions** dans un milliard ?', a: 1000, wrong: 100 },
      { prompt: 'Combien y a-t-il de **milliers** dans un million ?', a: 1000, wrong: 100 },
      { prompt: 'Combien de zéros faut-il pour écrire **un milliard** en chiffres ?', a: 9, wrong: 6 },
      { prompt: 'Combien y a-t-il de **milliers** dans un milliard ?', a: 1_000_000, wrong: 1000 },
    ]);
    return {
      prompt: q.prompt,
      answer: num(q.a),
      traps: traps(r(q.a), [[q.wrong, 'Compte les tranches de 3 zéros : mille (3), million (6), milliard (9).']]),
      hint: 'Mille = 1 000 (3 zéros), un million = 1 000 000 (6 zéros), un milliard = 9 zéros.',
      steps: [
        'Chaque nouvelle « tranche » vaut mille fois la précédente : mille, million, milliard.',
        `Réponse : **${big(q.a)}**.`,
      ],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const ecrituresDecimales = S(
  'm6-ecritures-decimales',
  'Fractions décimales et écriture à virgule',
  'Associer et utiliser différentes écritures d’un nombre décimal : écriture à virgule, fraction, nombre mixte, pourcentage',
  [
    '{1/10} = 0,1 ; {1/100} = 0,01 ; {1/1000} = 0,001.',
    '{4107/1000} = 4 + {107/1000} = 4,107 : le dénominateur 1 000 dit qu’il y a **3 chiffres** après la virgule.',
  ],
  (rng, level) => {
    const d = level === 1 ? rng.int(1, 2) : rng.int(2, 3);
    const n = rng.int(level === 1 ? 2 : 101, level === 1 ? 99 : 9999);
    const den = 10 ** d;
    const value = r(n, den);
    if (level === 3) {
      // Somme de fractions décimales → écriture à virgule.
      const u = rng.int(1, 9);
      const t = rng.int(1, 9);
      const m = rng.int(1, 9);
      const v = add(add(r(u), r(t, 10)), r(m, 1000));
      return {
        prompt: `Écris avec une virgule : ${u} + ${rawFrac(t, 10)} + ${rawFrac(m, 1000)}.`,
        answer: num(v),
        traps: traps(v, [
          [
            add(add(r(u), r(t, 10)), r(m, 100)),
            `${rawFrac(m, 1000)}, ce sont des **millièmes** : 3e chiffre après la virgule.`,
          ],
        ]),
        hint: 'Dixièmes : 1er chiffre après la virgule ; centièmes : 2e ; millièmes : 3e. Pas de centièmes ? On met un 0.',
        steps: [
          `${u} unités, ${t} dixièmes, 0 centième et ${m} millièmes.`,
          `On écrit chaque chiffre à sa place : **${fmt(v)}**.`,
        ],
        targetSeconds: 20,
      };
    }
    return {
      prompt: `Écris ${rawFrac(n, den)} avec une virgule.`,
      answer: num(value),
      traps: traps(value, [
        [
          r(n, den * 10),
          `${den} a ${d} zéro${d > 1 ? 's' : ''} : il faut ${d} chiffre${d > 1 ? 's' : ''} après la virgule.`,
        ],
        [
          r(n, den / 10 || 1),
          `${den} a ${d} zéro${d > 1 ? 's' : ''} : il faut ${d} chiffre${d > 1 ? 's' : ''} après la virgule.`,
        ],
      ]),
      hint: `Le dénominateur ${den} a ${d} zéro${d > 1 ? 's' : ''} : combien de chiffres après la virgule ?`,
      steps: [
        `Diviser par ${den}, c’est décaler la virgule de ${d} rang${d > 1 ? 's' : ''} vers la gauche.`,
        `${rawFrac(n, den)} = **${fmt(value)}**.`,
      ],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const comparerDecimaux = S(
  'm6-comparer-decimaux',
  'Comparer et ranger des décimaux',
  'Comparer deux nombres décimaux',
  [
    'Compare d’abord les **parties entières**. Si elles sont égales, compare les dixièmes, puis les centièmes…',
    'Piège : 2,15 n’est pas plus grand que 2,5 ! Écris 2,50 pour comparer 50 centièmes et 15 centièmes.',
  ],
  (rng, level) => {
    if (level === 3) {
      const base = rng.int(1, 9);
      const vals = distinct(
        rng,
        4,
        () => add(r(base), dec(rng.pick([rng.int(1, 9), rng.int(10, 99), rng.int(100, 999)]), rng.int(1, 3))),
        fmt,
      ).map((v) => ({ v, s: fmt(v) }));
      const sorted = [...vals].sort((a, b) => cmp(b.v, a.v));
      const biggest = sorted[0]?.s ?? '';
      const longest = [...vals].sort((a, b) => b.s.length - a.s.length || cmp(b.v, a.v))[0]?.s ?? '';
      return {
        prompt: `Quel est le **plus grand** de ces nombres : ${vals.map((x) => x.s).join(' ; ')} ?`,
        ...choice(
          rng,
          biggest,
          vals
            .filter((x) => x.s !== biggest)
            .map((x) => ({
              label: x.s,
              why:
                x.s === longest
                  ? 'Plus de chiffres après la virgule ne veut pas dire plus grand : compare chiffre par chiffre.'
                  : 'Compare les dixièmes, puis les centièmes.',
            })),
        ),
        hint: 'Les parties entières sont égales : compare les dixièmes, puis les centièmes… (ajoute des 0 pour avoir autant de chiffres).',
        steps: [
          `Toutes les parties entières valent ${base}.`,
          `On compare chiffre par chiffre après la virgule : le plus grand est **${biggest}**.`,
        ],
        targetSeconds: 25,
      };
    }
    const a = exactDecimal(rng, 0, level === 1 ? 20 : 9, rng.int(1, 2));
    let b = exactDecimal(rng, Math.floor(toNumber(a)), Math.floor(toNumber(a)) + (level === 1 ? 2 : 1), rng.int(1, 3));
    if (cmp(a, b) === 0) b = add(b, r(1, 100));
    const sign = cmp(a, b) < 0 ? '<' : '>';
    return {
      prompt: `Compare : ${fmt(a)} … ${fmt(b)}`,
      ...choice(
        rng,
        sign,
        [
          {
            label: sign === '<' ? '>' : '<',
            why: 'Compare d’abord les parties entières, puis les dixièmes, puis les centièmes.',
          },
        ],
        true,
      ),
      hint: 'Ajoute des zéros pour avoir le même nombre de chiffres après la virgule, puis compare.',
      steps: [
        `On compare les parties entières, puis chiffre par chiffre après la virgule.`,
        `${fmt(a)} **${sign}** ${fmt(b)}.`,
      ],
      targetSeconds: 10,
    };
  },
  { mental: true },
);

const arrondir = S(
  'm6-arrondir',
  'Arrondir un décimal',
  'Donner la valeur arrondie à l’unité, au dixième ou au centième, d’un nombre décimal',
  [
    'Pour arrondir au dixième, regarde le chiffre **juste après** (les centièmes) : de 0 à 4 on garde, de 5 à 9 on monte d’un dixième.',
    'Exemple : 3,47 arrondi au dixième donne 3,5 (car 7 ≥ 5).',
  ],
  (rng, level) => {
    const place = level === 1 ? 0 : level === 2 ? 1 : rng.int(1, 2);
    const d = place + rng.int(1, 2);
    const x = exactDecimal(rng, 0, 99, d);
    const v = Math.round(toNumber(x) * 10 ** d);
    const factor = 10 ** (d - place);
    const down = Math.floor(v / factor);
    const nextDigit = Math.floor((v % factor) / (factor / 10));
    const up = nextDigit >= 5;
    const rounded = r(up ? down + 1 : down, 10 ** place);
    const other = r(up ? down : down + 1, 10 ** place);
    const placeName = ['à l’unité', 'au dixième', 'au centième'][place] ?? '';
    return {
      prompt: `Arrondis ${fmt(x)} ${placeName}.`,
      answer: num(rounded),
      traps: traps(rounded, [
        [other, `Le chiffre qui suit est ${nextDigit} : ${up ? 'de 5 à 9, on monte' : 'de 0 à 4, on garde'}.`],
      ]),
      hint: `Regarde le chiffre juste après celui ${['des unités', 'des dixièmes', 'des centièmes'][place] ?? ''} : 5 ou plus, on monte.`,
      steps: [
        `${fmt(x)} est entre ${fmt(r(down, 10 ** place))} et ${fmt(r(down + 1, 10 ** place))}.`,
        `Le chiffre suivant est ${nextDigit} : ${up ? 'on monte' : 'on garde'}. L’arrondi est **${fmt(rounded)}**.`,
      ],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const encadrer = S(
  'm6-encadrer',
  'Encadrer, intercaler, droite graduée',
  'Encadrer un nombre décimal par deux nombres décimaux, intercaler un nombre décimal entre deux nombres décimaux',
  [
    'Entre 2,3 et 2,4, il y a 2,31 ; 2,35 ; 2,399… On trouve toujours un décimal entre deux décimaux !',
    'Sur une droite graduée, regarde d’abord ce que vaut **un petit trait**.',
  ],
  (rng, level) => {
    if (level === 1) {
      const x = exactDecimal(rng, 1, 50, 1);
      const lo = Math.floor(toNumber(x));
      return {
        prompt: `Complète l’encadrement par deux entiers qui se suivent : … < ${fmt(x)} < ${lo + 1}`,
        answer: num(lo),
        traps: traps(r(lo), [[lo + 1, 'Le nombre manquant est **plus petit** que ' + fmt(x) + '.']]),
        hint: 'Quelle est la partie entière du nombre ?',
        steps: [`La partie entière de ${fmt(x)} est ${lo}.`, `**${lo}** < ${fmt(x)} < ${lo + 1}.`],
        targetSeconds: 10,
      };
    }
    if (level === 2) {
      // Droite graduée : lire un point.
      const start = rng.int(0, 8);
      const tick = rng.pick([r(1, 10), r(1, 100)]);
      const k = rng.int(1, 9);
      const origin = tick.d === 10 ? r(start) : add(r(start), r(rng.int(1, 9), 10));
      const at = add(origin, mul(tick, r(k)));
      const end = add(origin, mul(tick, r(10)));
      return {
        prompt: `Sur la droite, la graduation va de ${fmt(origin)} à ${fmt(end)} en 10 petits traits. Quel nombre est au point A, ${k} traits après ${fmt(origin)} ?`,
        figure: {
          kind: 'numberLine',
          min: toNumber(origin),
          max: toNumber(end),
          subdivisions: Math.round(10 / toNumber(sub(end, origin))),
          labels: [toNumber(origin), toNumber(end)],
          points: [{ name: 'A', at: toNumber(at) }],
        },
        answer: num(at),
        traps: traps(at, [
          [add(origin, r(k)), `Un petit trait ne vaut pas 1 : l’écart ${fmt(sub(end, origin))} est partagé en 10.`],
        ]),
        hint: `Un petit trait vaut ${fmt(sub(end, origin))} ÷ 10. Compte les traits depuis ${fmt(origin)}.`,
        steps: [
          `De ${fmt(origin)} à ${fmt(end)}, il y a ${fmt(sub(end, origin))}, partagé en 10 : un trait vaut ${fmt(tick)}.`,
          `${k} traits après ${fmt(origin)} : ${fmt(origin)} + ${k} × ${fmt(tick)} = **${fmt(at)}**.`,
        ],
        targetSeconds: 25,
      };
    }
    const a = exactDecimal(rng, 1, 30, 1);
    const b = add(a, r(1, 10));
    const ok = add(a, r(rng.int(1, 9), 100));
    return {
      prompt: `Quel nombre est compris entre ${fmt(a)} et ${fmt(b)} ?`,
      ...choice(rng, fmt(ok), [
        { label: fmt(add(a, r(rng.int(2, 9), 10))), why: `Ce nombre dépasse ${fmt(b)}.` },
        { label: fmt(sub(a, r(rng.int(1, 9), 100))), why: `Ce nombre est plus petit que ${fmt(a)}.` },
        { label: fmt(b), why: `${fmt(b)} n’est pas **strictement** entre les deux : c’est une borne.` },
      ]),
      hint: `Écris ${fmt(a)} = ${two(a)} et ${fmt(b)} = ${two(b)} : quels centièmes sont entre les deux ?`,
      steps: [
        `${fmt(a)} = ${two(a)} et ${fmt(b)} = ${two(b)} : il y a 9 centièmes possibles entre les deux.`,
        `**${fmt(ok)}** est bien entre ${fmt(a)} et ${fmt(b)}.`,
      ],
      targetSeconds: 20,
    };
  },
);

export const numeration = C(
  'm6-numeration',
  'nombres',
  'Nombres entiers et décimaux',
  [rang, grandsNombres, ecrituresDecimales, comparerDecimaux, arrondir, encadrer],
  bossOf(
    [
      S(
        'm6-boss-numeration-podium',
        'Problème : le podium',
        'Ordonner une liste de nombres décimaux',
        [
          'Pour classer des temps, le plus **petit** temps gagne ! Compare les parties entières, puis les dixièmes, puis les centièmes.',
        ],
        (rng) => {
          const who = distinct(rng, 3, () => rng.pick(NAMES));
          const base = rng.int(10, 14);
          const times = distinct(rng, 3, () => add(r(base), dec(rng.int(1, 99), 2)), fmt);
          const best = times.reduce((m, t) => (cmp(t, m) < 0 ? t : m));
          const winner = who[times.indexOf(best)] ?? '';
          return {
            prompt: `Au 100 m, ${who.map((w, i) => `${w} court en ${fmt(times[i] ?? r(0))} s`).join(', ')}. Qui gagne la course ?`,
            ...choice(
              rng,
              winner,
              who.filter((w) => w !== winner).map((w) => ({ label: w, why: 'Le gagnant met le **moins** de temps.' })),
            ),
            hint: 'Le gagnant est celui qui met le moins de temps : cherche le plus petit nombre.',
            steps: [
              `Tous les temps commencent par ${base} : on compare les dixièmes puis les centièmes.`,
              `Le plus petit temps est ${fmt(best)} s : **${winner}** gagne.`,
            ],
            targetSeconds: 35,
          };
        },
      ),
      S(
        'm6-boss-numeration-population',
        'Problème : les habitants',
        'Connaître des grands nombres entiers',
        ['Un million = 1 000 000. Pour écrire « 2 millions 300 mille », on écrit 2 300 000.'],
        (rng) => {
          const m = rng.int(1, 12);
          const k = rng.int(1, 9) * 100;
          const n = m * 1_000_000 + k * 1000;
          const city = rng.pick(['une région', 'un pays', 'une grande ville']);
          return {
            prompt: `${city.charAt(0).toUpperCase() + city.slice(1)} compte ${m} million${m > 1 ? 's' : ''} ${k} mille habitants. Écris ce nombre en chiffres.`,
            answer: num(n),
            traps: traps(r(n), [[m * 1_000_000 + k, `${k} mille, c’est ${big(k * 1000)}, pas ${k}.`]]),
            hint: 'Écris la tranche des millions, puis celle des milliers, puis 000 pour les unités.',
            steps: [
              `${m} million${m > 1 ? 's' : ''} = ${big(m * 1_000_000)} et ${k} mille = ${big(k * 1000)}.`,
              `En tout : **${big(n)}** habitants.`,
            ],
            targetSeconds: 35,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-numeration-piege',
        'Piège : la virgule',
        'Comparer deux nombres décimaux',
        ['Plus de chiffres après la virgule ne veut pas dire plus grand : 3,9 > 3,125.'],
        (rng) => {
          const u = rng.int(1, 9);
          const big1 = add(r(u), r(rng.int(5, 9), 10));
          const long = add(r(u), dec(rng.int(101, 499), 3));
          return {
            prompt: `Lequel est le plus grand : ${fmt(big1)} ou ${fmt(long)} ?`,
            ...choice(rng, fmt(big1), [
              { label: fmt(long), why: `${fmt(long)} a plus de chiffres, mais ses dixièmes sont plus petits.` },
            ]),
            hint: 'Compare les dixièmes, pas le nombre de chiffres.',
            steps: [
              `Les parties entières sont égales (${u}). On compare les dixièmes.`,
              `**${fmt(big1)}** a plus de dixièmes : c’est le plus grand.`,
            ],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);
