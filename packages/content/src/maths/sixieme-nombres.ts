import { choice, distinct, fraction, num, traps } from '../build.ts';
import { add, cmp, dec, fmt, frac, mul, r, rawFrac, sub, toNumber, type Rational } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { Chapter } from '../types.ts';
import { big, bossOf, chapterOf, NAMES, skillsOf } from './kit.ts';

/** Programme de 6e (cycle 3, BO n°16 du 17 avril 2025) : nombres, calcul, fractions, algèbre. */
const S = skillsOf('6e');
const C = chapterOf('6e');

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
/** Décimal dont le dernier chiffre n'est pas 0 (pour avoir vraiment `d` décimales). */
function exactDecimal(rng: Rng, min: number, max: number, d: number): Rational {
  if (max <= min) throw new Error('exactDecimal : intervalle vide');
  for (;;) {
    const v = rng.int(min * 10 ** d, max * 10 ** d);
    if (v % 10 !== 0 || d === 0) return dec(v, d);
  }
}

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

const numeration = C(
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

// ——— Calcul avec les décimaux ———

const addDecimaux = S(
  'm6-add-decimaux',
  'Additionner et soustraire des décimaux',
  'Additionner et soustraire des nombres décimaux',
  [
    'On aligne les **virgules** : unités sous unités, dixièmes sous dixièmes.',
    'Ajoute des zéros pour avoir autant de chiffres après la virgule : 12,5 − 3,27 = 12,50 − 3,27.',
  ],
  (rng, level) => {
    const a = exactDecimal(rng, 1, level === 1 ? 20 : 100, level === 1 ? 1 : 2);
    const b = exactDecimal(rng, 1, level === 1 ? 20 : 50, level === 3 ? 1 : level === 1 ? 1 : 2);
    const minus = level === 3 || rng.int(0, 1) === 1;
    const [x, y] = minus && cmp(a, b) < 0 ? [b, a] : [a, b];
    const res = minus ? sub(x, y) : add(x, y);
    return {
      prompt: `Calcule ${fmt(x)} ${minus ? '−' : '+'} ${fmt(y)}.`,
      answer: num(res),
      hint: 'Pose l’opération en alignant les virgules (ajoute des zéros si besoin).',
      steps: [
        `On aligne les virgules : ${fmt(x)} et ${fmt(y)}, avec autant de chiffres après la virgule.`,
        `${fmt(x)} ${minus ? '−' : '+'} ${fmt(y)} = **${fmt(res)}**.`,
      ],
      targetSeconds: 25,
    };
  },
  { mental: true },
);

const fois10 = S(
  'm6-fois-10',
  'Multiplier et diviser par 10, 100, 1 000 ou par 0,1…',
  'Multiplier un nombre entier ou un nombre décimal par 0,1, par 0,01, et par 0,001',
  [
    '× 10 : chaque chiffre devient 10 fois plus grand, il glisse d’un rang vers la gauche. ÷ 10 : il glisse vers la droite.',
    'Multiplier par 0,1, c’est **diviser par 10** ; par 0,01, c’est diviser par 100.',
  ],
  (rng, level) => {
    const x = exactDecimal(rng, 0, 999, rng.int(0, 2));
    const k = rng.pick([10, 100, 1000]);
    const kind =
      level === 1 ? 'mul' : level === 2 ? rng.pick(['mul', 'div'] as const) : rng.pick(['p01', 'div'] as const);
    if (kind === 'p01') {
      const f = r(1, k);
      const res = mul(x, f);
      return {
        prompt: `Calcule ${fmt(x)} × ${fmt(f)}.`,
        answer: num(res),
        traps: traps(res, [[mul(x, r(k)), `× ${fmt(f)}, c’est **diviser** par ${k}, pas multiplier.`]]),
        hint: `Multiplier par ${fmt(f)}, c’est diviser par ${k}.`,
        steps: [
          `× ${fmt(f)} revient à ÷ ${k} : les chiffres glissent de ${String(k).length - 1} rang${k > 10 ? 's' : ''} vers la droite.`,
          `${fmt(x)} × ${fmt(f)} = **${fmt(res)}**.`,
        ],
        targetSeconds: 15,
      };
    }
    const res = kind === 'mul' ? mul(x, r(k)) : mul(x, r(1, k));
    const wrong = kind === 'mul' ? mul(x, r(1, k)) : mul(x, r(k));
    return {
      prompt: `Calcule ${fmt(x)} ${kind === 'mul' ? '×' : '÷'} ${big(k)}.`,
      answer: num(res),
      traps: traps(res, [
        [wrong, kind === 'mul' ? '× : le nombre devient plus grand.' : '÷ : le nombre devient plus petit.'],
      ]),
      hint: `${kind === 'mul' ? '×' : '÷'} ${big(k)} : les chiffres glissent de ${String(k).length - 1} rang${k > 10 ? 's' : ''} vers la ${kind === 'mul' ? 'gauche' : 'droite'}.`,
      steps: [
        `Chaque chiffre devient ${big(k)} fois plus ${kind === 'mul' ? 'grand' : 'petit'} : il glisse de ${String(k).length - 1} rang${k > 10 ? 's' : ''}.`,
        `${fmt(x)} ${kind === 'mul' ? '×' : '÷'} ${big(k)} = **${fmt(res)}**.`,
      ],
      targetSeconds: 12,
    };
  },
  { mental: true },
);

const produitDecimaux = S(
  'm6-produit-decimaux',
  'Multiplier deux décimaux',
  'Calculer le produit de deux nombres décimaux',
  [
    'On calcule **sans les virgules**, puis on met dans le résultat autant de chiffres après la virgule qu’il y en a en tout dans les deux nombres.',
    '2,5 × 1,3 : 25 × 13 = 325, et 1 + 1 = 2 chiffres après la virgule → 3,25.',
  ],
  (rng, level) => {
    const da = level === 1 ? 1 : rng.int(1, 2);
    const db = level === 3 ? 1 : 0;
    const a = exactDecimal(rng, 0, level === 1 ? 9 : 20, da);
    const b = level === 1 ? r(rng.int(2, 9)) : exactDecimal(rng, 1, 9, Math.max(db, 1));
    const res = mul(a, b);
    const ia = Math.round(toNumber(a) * 10 ** da);
    const ib = Math.round(toNumber(b) * b.d);
    const decs = da + (b.d === 1 ? 0 : String(b.d).length - 1);
    return {
      prompt: `Calcule ${fmt(a)} × ${fmt(b)}.`,
      answer: num(res),
      traps: traps(res, [
        [
          r(ia * ib, 10 ** Math.max(0, decs - 1)),
          `Il faut ${decs} chiffre${decs > 1 ? 's' : ''} après la virgule en tout.`,
        ],
      ]),
      hint: 'Calcule sans les virgules, puis compte les chiffres après la virgule dans les deux nombres.',
      steps: [
        `Sans les virgules : ${ia} × ${ib} = ${ia * ib}.`,
        `${decs} chiffre${decs > 1 ? 's' : ''} après la virgule en tout : ${fmt(a)} × ${fmt(b)} = **${fmt(res)}**.`,
      ],
      targetSeconds: 30,
    };
  },
  { mental: true },
);

const ordreGrandeur = S(
  'm6-ordre-grandeur',
  'Ordre de grandeur',
  'Contrôler les résultats à l’aide d’ordres de grandeur',
  [
    'Un **ordre de grandeur**, c’est un calcul facile avec des nombres arrondis : 48,7 × 3,1 ≈ 50 × 3 = 150.',
    'Il sert à vérifier un résultat : si on trouve 1 509, il y a une erreur de virgule !',
  ],
  (rng) => {
    const a = exactDecimal(rng, 11, 99, 1);
    const b = exactDecimal(rng, 2, 9, 1);
    const ra = Math.round(toNumber(a) / 10) * 10;
    const rb = Math.round(toNumber(b));
    const est = ra * rb;
    const exact = mul(a, b);
    const opts = [est, est * 10, Math.round(est / 10)];
    return {
      prompt: `Sans poser l’opération, quel est l’ordre de grandeur de ${fmt(a)} × ${fmt(b)} ?`,
      ...choice(
        rng,
        big(est),
        opts.slice(1).map((o) => ({
          label: big(o),
          why: 'Arrondis chaque nombre puis multiplie : la virgule ne doit pas sauter.',
        })),
      ),
      hint: `Arrondis ${fmt(a)} à la dizaine et ${fmt(b)} à l’unité.`,
      steps: [
        `${fmt(a)} ≈ ${ra} et ${fmt(b)} ≈ ${rb}.`,
        `${ra} × ${rb} = **${big(est)}** (le vrai résultat est ${fmt(exact)}).`,
      ],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

const problemesMultiplication = S(
  'm6-problemes-multiplication',
  'Problèmes : multiplier des décimaux',
  'Résoudre des problèmes mettant en jeu des multiplications entre des nombres décimaux',
  [
    'Prix de plusieurs kilos = prix d’un kilo × nombre de kilos, même si ce nombre est décimal (2,5 kg).',
    'Aire d’un rectangle = longueur × largeur, aussi avec des décimaux.',
  ],
  (rng, level) => {
    const kind = rng.pick(['prix', 'aire'] as const);
    if (kind === 'prix') {
      const price = exactDecimal(rng, 1, 9, level === 1 ? 1 : 2);
      const kg = level === 1 ? r(rng.int(2, 6)) : exactDecimal(rng, 1, 4, 1);
      const res = mul(price, kg);
      const item = rng.pick(['pommes', 'tomates', 'cerises', 'carottes']);
      return {
        prompt: `Les ${item} coûtent ${fmt(price)} € le kilo. Combien paie-t-on pour ${fmt(kg)} kg ?`,
        answer: num(res, '€'),
        traps: traps(res, [
          [
            add(price, kg),
            'On paie le prix d’un kilo **autant de fois** qu’il y a de kilos : c’est une multiplication.',
          ],
        ]),
        hint: 'Prix total = prix d’un kilo × nombre de kilos.',
        steps: [
          `On multiplie le prix d’un kilo par le nombre de kilos : ${fmt(price)} × ${fmt(kg)}.`,
          `${fmt(price)} × ${fmt(kg)} = **${fmt(res)} €**.`,
        ],
        targetSeconds: 40,
      };
    }
    const L = exactDecimal(rng, 2, 12, 1);
    const l = level === 1 ? r(rng.int(2, 6)) : exactDecimal(rng, 1, 5, 1);
    const res = mul(L, l);
    return {
      prompt: `Un tapis rectangulaire mesure ${fmt(L)} m sur ${fmt(l)} m. Quelle est son aire, en m^2 ?`,
      answer: num(res, 'm^2'),
      traps: traps(res, [[mul(add(L, l), r(2)), 'Ça, c’est le périmètre. L’aire = longueur × largeur.']]),
      hint: 'Aire d’un rectangle = longueur × largeur.',
      steps: [`Aire = longueur × largeur = ${fmt(L)} × ${fmt(l)}.`, `= **${fmt(res)} m^2**.`],
      targetSeconds: 40,
    };
  },
);

const calcul = C(
  'm6-calcul',
  'nombres',
  'Calculer avec les décimaux',
  [addDecimaux, fois10, produitDecimaux, ordreGrandeur, problemesMultiplication],
  bossOf(
    [
      S(
        'm6-boss-calcul-courses',
        'Problème : les courses',
        'Résoudre des problèmes mettant en jeu des multiplications entre des nombres décimaux',
        ['Calcule le prix de chaque article (prix × quantité), puis additionne, puis compare au budget.'],
        (rng) => {
          const who = rng.pick(NAMES);
          const p1 = exactDecimal(rng, 1, 5, 2);
          const q1 = rng.int(2, 4);
          const p2 = exactDecimal(rng, 2, 9, 1);
          const total = add(mul(p1, r(q1)), p2);
          const budget = r(Math.ceil(toNumber(total) / 5) * 5 + 5);
          const rest = sub(budget, total);
          return {
            prompt: `${who} a ${fmt(budget)} €. Il achète ${q1} cahiers à ${fmt(p1)} € et un stylo à ${fmt(p2)} €. Combien lui reste-t-il ?`,
            answer: num(rest, '€'),
            traps: traps(rest, [
              [sub(budget, add(p1, p2)), `Il y a ${q1} cahiers : multiplie d’abord ${fmt(p1)} par ${q1}.`],
              [total, 'Ça, c’est ce qu’il dépense. On demande ce qui **reste**.'],
            ]),
            hint: `Calcule d’abord le prix des ${q1} cahiers, puis la dépense totale.`,
            steps: [
              `Cahiers : ${q1} × ${fmt(p1)} = ${fmt(mul(p1, r(q1)))} €. Avec le stylo : ${fmt(total)} €.`,
              `Il reste ${fmt(budget)} − ${fmt(total)} = **${fmt(rest)} €**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm6-boss-calcul-carrelage',
        'Problème : le carrelage',
        'Résoudre des problèmes mettant en jeu des multiplications entre des nombres décimaux',
        ['Aire d’un rectangle = longueur × largeur, puis prix total = aire × prix au m^2.'],
        (rng) => {
          const L = r(rng.int(3, 6));
          const l = exactDecimal(rng, 2, 4, 1);
          const price = r(rng.int(12, 30));
          const area = mul(L, l);
          const total = mul(area, price);
          return {
            prompt: `Une pièce rectangulaire mesure ${fmt(L)} m sur ${fmt(l)} m. Le carrelage coûte ${fmt(price)} € le m^2. Combien coûte le carrelage de la pièce ?`,
            answer: num(total, '€'),
            traps: traps(total, [
              [mul(price, mul(add(L, l), r(2))), 'Tu as utilisé le périmètre : le carrelage couvre une **aire**.'],
            ]),
            hint: 'Calcule d’abord l’aire de la pièce.',
            steps: [
              `Aire : ${fmt(L)} × ${fmt(l)} = ${fmt(area)} m^2.`,
              `Prix : ${fmt(area)} × ${fmt(price)} = **${fmt(total)} €**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-calcul-piege',
        'Piège : multiplier rend-il toujours plus grand ?',
        'Comprendre le sens de la multiplication de deux nombres décimaux',
        ['Multiplier par un nombre plus petit que 1 rend **plus petit** : 8 × 0,5 = 4.'],
        (rng) => {
          const x = r(rng.int(12, 80));
          const f = dec(rng.int(1, 9), 1);
          const res = mul(x, f);
          return {
            prompt: `${fmt(x)} × ${fmt(f)} est-il plus grand ou plus petit que ${fmt(x)} ?`,
            ...choice(
              rng,
              'Plus petit',
              [
                {
                  label: 'Plus grand',
                  why: `Multiplier par ${fmt(f)}, qui est plus petit que 1, rend le nombre plus petit.`,
                },
              ],
              true,
            ),
            hint: `${fmt(f)} est-il plus grand ou plus petit que 1 ?`,
            steps: [
              `${fmt(f)} < 1 : on prend moins d’une fois ${fmt(x)}.`,
              `${fmt(x)} × ${fmt(f)} = ${fmt(res)} : c’est **plus petit**.`,
            ],
            targetSeconds: 15,
          };
        },
      ),
    ],
  ),
);

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

const division = C(
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

// ——— Fractions ———

const fractionQuotient = S(
  'm6-fraction-quotient',
  'La fraction, un quotient',
  'Comprendre et connaître la définition du quotient d’un entier a par un entier b non nul',
  ['{3/7}, c’est le nombre qui, multiplié par 7, donne 3 : 7 × {3/7} = 3.', '{a/b} = a ÷ b : {3/4} = 3 ÷ 4 = 0,75.'],
  (rng, level) => {
    if (level === 1) {
      const b = rng.int(3, 13);
      const a = rng.int(1, 20);
      return {
        prompt: `Complète : ${b} × … = ${a}`,
        answer: fraction(r(a, b)),
        traps: traps(r(a, b), [
          [
            r(b, a),
            'Le nombre cherché est a ÷ b : le numérateur est le résultat, le dénominateur le nombre qu’on multiplie.',
          ],
        ]),
        hint: `Le nombre qui, multiplié par ${b}, donne ${a}, c’est ${a} ÷ ${b} : écris-le en fraction.`,
        steps: [
          `Par définition, ${rawFrac(a, b)} est le nombre qui, multiplié par ${b}, donne ${a}.`,
          `${b} × **${rawFrac(a, b)}** = ${a}.`,
        ],
        targetSeconds: 15,
      };
    }
    const b = rng.pick([2, 4, 5, 8, 10, 20, 25]);
    const a = rng.int(1, b * 3);
    const v = r(a, b);
    return {
      prompt: `Donne l’écriture décimale de ${rawFrac(a, b)}.`,
      answer: num(v),
      hint: `${rawFrac(a, b)} = ${a} ÷ ${b}.`,
      steps: [`Une fraction est un quotient : ${rawFrac(a, b)} = ${a} ÷ ${b}.`, `${a} ÷ ${b} = **${fmt(v)}**.`],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

const fractionsEgales = S(
  'm6-fractions-egales',
  'Égalités de fractions',
  'Établir des égalités de fractions',
  [
    'On ne change pas une fraction en multipliant (ou divisant) **le numérateur et le dénominateur par le même nombre** : {2/3} = {8/12}.',
  ],
  (rng, level) => {
    const b = rng.int(2, 9);
    const a = rng.int(1, b - 1);
    const k = rng.int(2, level === 1 ? 5 : 9);
    const askTop = level !== 1 || rng.int(0, 1) === 1;
    const missing = askTop ? a * k : b * k;
    return {
      prompt: askTop ? `Complète : ${rawFrac(a, b)} = {…/${b * k}}` : `Complète : ${rawFrac(a, b)} = {${a * k}/…}`,
      answer: num(missing),
      traps: traps(r(missing), [
        [
          askTop ? a + (b * k - b) : b + (a * k - a),
          'On ne fait pas une addition : on multiplie en haut **et** en bas par le même nombre.',
        ],
      ]),
      hint: askTop
        ? `Par combien a-t-on multiplié ${b} pour obtenir ${b * k} ?`
        : `Par combien a-t-on multiplié ${a} pour obtenir ${a * k} ?`,
      steps: [
        `${askTop ? `${b} × ${k} = ${b * k}` : `${a} × ${k} = ${a * k}`} : on a multiplié par ${k}.`,
        `On fait pareil de l’autre côté : ${askTop ? a : b} × ${k} = **${missing}**.`,
      ],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const comparerFractions = S(
  'm6-comparer-fractions',
  'Comparer et ranger des fractions',
  'Comparer et encadrer des fractions',
  [
    'Même dénominateur : la plus grande fraction a le plus grand numérateur ({5/8} > {3/8}).',
    'Sinon, on les écrit avec le même dénominateur : {2/3} = {8/12} et {3/4} = {9/12}.',
  ],
  (rng, level) => {
    if (level === 3) {
      const d = rng.int(2, 9);
      const n = rng.int(d + 1, 5 * d - 1);
      if (n % d === 0) return comparerFractions.generate(rng, level);
      const lo = Math.floor(n / d);
      return {
        prompt: `Entre quels entiers consécutifs se trouve ${rawFrac(n, d)} ? Donne le plus petit.`,
        answer: num(lo),
        traps: traps(r(lo), [[lo + 1, `${lo + 1} = {${(lo + 1) * d}/${d}} est plus grand que ${rawFrac(n, d)}.`]]),
        hint: `Combien de fois ${d} dans ${n} ?`,
        steps: [
          `${n} = ${d} × ${lo} + ${n - d * lo}, donc ${rawFrac(n, d)} = ${lo} + ${rawFrac(n - d * lo, d)}.`,
          `**${lo}** < ${rawFrac(n, d)} < ${lo + 1}.`,
        ],
        targetSeconds: 20,
      };
    }
    const d1 = rng.int(2, 6);
    const k = level === 1 ? 1 : rng.int(2, 3);
    const d2 = d1 * k;
    const a = rng.int(1, d1 - 1 || 1);
    let b = rng.int(1, d2 - 1);
    if (a * k === b) b = b === 1 ? 2 : b - 1;
    const sign = cmp(r(a, d1), r(b, d2)) < 0 ? '<' : '>';
    return {
      prompt: `Compare : ${rawFrac(a, d1)} … ${rawFrac(b, d2)}`,
      ...choice(
        rng,
        sign,
        [
          {
            label: sign === '<' ? '>' : '<',
            why: 'Mets les deux fractions au même dénominateur avant de comparer les numérateurs.',
          },
        ],
        true,
      ),
      hint:
        k === 1
          ? 'Même dénominateur : compare les numérateurs.'
          : `Écris ${rawFrac(a, d1)} avec le dénominateur ${d2}.`,
      steps: [
        k === 1 ? 'Même dénominateur : on compare les numérateurs.' : `${rawFrac(a, d1)} = ${rawFrac(a * k, d2)}.`,
        `${rawFrac(a * k, d2)} ${sign} ${rawFrac(b, d2)}, donc ${rawFrac(a, d1)} **${sign}** ${rawFrac(b, d2)}.`,
      ],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

const additionFractions = S(
  'm6-addition-fractions',
  'Additionner et soustraire des fractions',
  'Additionner et soustraire des fractions',
  [
    'Même dénominateur : on additionne les numérateurs et on **garde** le dénominateur : {2/7} + {3/7} = {5/7}.',
    'Sinon, on met d’abord au même dénominateur : {1/2} + {1/4} = {2/4} + {1/4} = {3/4}.',
  ],
  (rng, level) => {
    const d = rng.int(3, 12);
    const k = level === 1 ? 1 : rng.int(2, 3);
    const d2 = d * k;
    const a = rng.int(1, d - 1);
    const b = rng.int(1, d2 - 1);
    const minus = level === 3 && a * k > b;
    const res = minus ? sub(r(a, d), r(b, d2)) : add(r(a, d), r(b, d2));
    const raw = minus ? a * k - b : a * k + b;
    return {
      prompt: `Calcule ${rawFrac(a, d)} ${minus ? '−' : '+'} ${rawFrac(b, d2)}.`,
      answer: fraction(res),
      traps: traps(res, [
        [r(minus ? a - b : a + b, minus ? Math.max(1, d2 - d) : d + d2), 'On n’additionne pas les dénominateurs !'],
      ]),
      hint:
        k === 1
          ? 'Même dénominateur : additionne les numérateurs.'
          : `Écris ${rawFrac(a, d)} avec le dénominateur ${d2}.`,
      steps: [
        k === 1 ? 'Même dénominateur : on travaille sur les numérateurs.' : `${rawFrac(a, d)} = ${rawFrac(a * k, d2)}.`,
        `${rawFrac(a * k, d2)} ${minus ? '−' : '+'} ${rawFrac(b, d2)} = ${rawFrac(raw, d2)}${frac(res) === rawFrac(raw, d2) ? '' : ` = ${frac(res)}`} : **${frac(res)}**.`,
      ],
      targetSeconds: 30,
    };
  },
  { mental: true },
);

const fractionEntier = S(
  'm6-fraction-fois-entier',
  'Fraction d’un nombre, fraction × entier',
  'Utiliser une multiplication pour appliquer une fraction à un nombre entier',
  [
    'Prendre {3/4} de 20 : 20 ÷ 4 = 5, puis 3 × 5 = 15. C’est aussi {3/4} × 20.',
    'Multiplier une fraction par un entier : on multiplie le numérateur. 4 × {2/9} = {8/9}.',
  ],
  (rng, level) => {
    if (level === 1) {
      const n = rng.int(2, 6);
      const d = rng.int(n + 1, 15);
      const a = rng.int(1, d - 1);
      const res = mul(r(n), r(a, d));
      return {
        prompt: `Calcule ${n} × ${rawFrac(a, d)}.`,
        answer: fraction(res),
        traps: traps(res, [[r(n * a, n * d), 'On multiplie seulement le numérateur.']]),
        hint: 'Multiplie le numérateur, garde le dénominateur.',
        steps: [`${n} × ${rawFrac(a, d)} = {${n} × ${a}/${d}} = ${rawFrac(n * a, d)}.`, `Résultat : **${frac(res)}**.`],
        targetSeconds: 15,
      };
    }
    const d = rng.pick([2, 3, 4, 5, 6, 8, 10]);
    const a = rng.int(1, d - 1);
    const part = rng.int(2, level === 2 ? 12 : 40);
    const total = d * part;
    return {
      prompt: `Calcule ${rawFrac(a, d)} de ${total}.`,
      answer: num(a * part),
      traps: traps(r(a * part), [[part, `${total} ÷ ${d} = ${part}, c’est une seule part : il en faut ${a}.`]]),
      hint: `Partage ${total} en ${d} parts égales.`,
      steps: [
        `Une part : ${total} ÷ ${d} = ${part}.`,
        `${a} part${a > 1 ? 's' : ''} : ${a} × ${part} = **${a * part}**.`,
      ],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

const problemesFractions = S(
  'm6-problemes-fractions',
  'Problèmes avec des fractions',
  'Résoudre des problèmes mettant en jeu des fractions',
  [
    'Le tout vaut 1 (ou {4/4}, {5/5}…). Ce qui reste = 1 − ce qu’on a pris.',
    'Une fraction d’une quantité : on divise par le dénominateur, puis on multiplie par le numérateur.',
  ],
  (rng, level) => {
    const d = rng.pick([4, 5, 6, 8, 10]);
    const a = rng.int(1, d - 2);
    const total = d * rng.int(2, level === 1 ? 5 : 12);
    const who = rng.pick(NAMES);
    const restPart = d - a;
    const res = (total / d) * restPart;
    return {
      prompt: `${who} a ${total} billes. Il en donne ${rawFrac(a, d)} à sa sœur. Combien de billes lui reste-t-il ?`,
      answer: num(res),
      traps: traps(r(res), [[(total / d) * a, `Ça, c’est ce qu’il **donne**. On demande ce qui reste.`]]),
      hint: `Calcule ${rawFrac(a, d)} de ${total}, puis enlève-le.`,
      steps: [
        `Il donne ${rawFrac(a, d)} de ${total} = ${(total / d) * a} billes.`,
        `Il lui reste ${total} − ${(total / d) * a} = **${res}** billes.`,
      ],
      targetSeconds: 40,
    };
  },
);

const fractions = C(
  'm6-fractions',
  'nombres',
  'Fractions',
  [fractionQuotient, fractionsEgales, comparerFractions, additionFractions, fractionEntier, problemesFractions],
  bossOf(
    [
      S(
        'm6-boss-fractions-gateau',
        'Problème : le gâteau',
        'Résoudre des problèmes mettant en jeu des fractions',
        ['Pour additionner {1/4} et {3/8}, on écrit {1/4} = {2/8}. Le reste du gâteau = 1 − ce qui est mangé.'],
        (rng) => {
          const [d1, d2] = rng.pick([
            [4, 8],
            [3, 6],
            [2, 8],
            [5, 10],
            [3, 12],
          ] as const);
          const a = 1;
          const b = rng.int(1, d2 / 2 - 1 || 1);
          const eaten = add(r(a, d1), r(b, d2));
          const rest = sub(r(1), eaten);
          return {
            prompt: `Lina mange ${rawFrac(a, d1)} du gâteau et Tao ${rawFrac(b, d2)}. Quelle fraction du gâteau reste-t-il ?`,
            answer: fraction(rest),
            traps: traps(rest, [[eaten, 'Ça, c’est ce qui est **mangé**.']]),
            hint: `Mets tout en ${d2}ᵉˢ : le gâteau entier vaut {${d2}/${d2}}.`,
            steps: [
              `${rawFrac(a, d1)} = ${rawFrac(d2 / d1, d2)}, donc ils mangent ${rawFrac(d2 / d1 + b, d2)}.`,
              `Il reste {${d2}/${d2}} − ${rawFrac(d2 / d1 + b, d2)} = **${frac(rest)}**.`,
            ],
            targetSeconds: 50,
          };
        },
      ),
      S(
        'm6-boss-fractions-classe',
        'Problème : la classe',
        'Utiliser une multiplication pour appliquer une fraction à un nombre entier',
        ['{2/5} de 30 : 30 ÷ 5 = 6, puis 2 × 6 = 12.'],
        (rng) => {
          const d = rng.pick([3, 4, 5, 6]);
          const a = rng.int(1, d - 1);
          const n = d * rng.int(5, 8);
          return {
            prompt: `Il y a ${n} élèves dans le collège-club. Les ${rawFrac(a, d)} font du foot. Combien d’élèves font du foot ?`,
            answer: num((n / d) * a),
            traps: traps(r((n / d) * a), [
              [n / d, 'Ça, c’est une seule part.'],
              [n - (n / d) * a, 'Ça, ce sont ceux qui **ne** font **pas** de foot.'],
            ]),
            hint: `Partage ${n} en ${d} parts égales.`,
            steps: [`${n} ÷ ${d} = ${n / d}.`, `${a} × ${n / d} = **${(n / d) * a}** élèves.`],
            targetSeconds: 40,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-fractions-piege',
        'Piège : additionner les dénominateurs',
        'Additionner et soustraire des fractions',
        ['{1/2} + {1/2} = 1, pas {2/4} ! On ne touche pas au dénominateur quand il est le même.'],
        (rng) => {
          const d = rng.int(3, 9);
          const a = rng.int(1, d - 2);
          const b = rng.int(1, d - a - 1 || 1);
          const ok = rawFrac(a + b, d);
          return {
            prompt: `Combien font ${rawFrac(a, d)} + ${rawFrac(b, d)} ?`,
            ...choice(rng, ok, [
              {
                label: rawFrac(a + b, 2 * d),
                why: `On n’additionne pas les dénominateurs : des ${d}ᵉˢ plus des ${d}ᵉˢ donnent des ${d}ᵉˢ.`,
              },
              { label: rawFrac(a * b, d), why: 'On additionne les numérateurs, on ne les multiplie pas.' },
            ]),
            hint: `Des ${d}ᵉˢ plus des ${d}ᵉˢ, ça donne des ${d}ᵉˢ.`,
            steps: [
              `${a} ${d}ᵉˢ + ${b} ${d}ᵉˢ = ${a + b} ${d}ᵉˢ.`,
              `Donc ${rawFrac(a, d)} + ${rawFrac(b, d)} = **${ok}**.`,
            ],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);

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

const pourcentages = C(
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

// ——— Pensée algébrique ———

const egaliteTrous = S(
  'm6-egalites-trous',
  'Égalités à trous',
  'Compléter des égalités à trous multiplicatives',
  [
    'Le signe = veut dire « vaut la même chose ». Dans 7 × … = 56, cherche le nombre qui, multiplié par 7, donne 56 : 56 ÷ 7 = 8.',
    'Dans 178 − … = 6 × 8, calcule d’abord le côté connu : 6 × 8 = 48, puis 178 − 48 = 130.',
  ],
  (rng, level) => {
    if (level === 3) {
      const a = rng.int(5, 9);
      const b = rng.int(5, 9);
      const x = rng.int(20, 90);
      const n = a * b + x;
      return {
        prompt: `Complète : ${n} − … = ${a} × ${b}`,
        answer: num(x),
        traps: traps(r(x), [[n - a - b, `Le côté droit vaut ${a} × ${b} = ${a * b}, pas ${a + b}.`]]),
        hint: `Calcule d’abord ${a} × ${b}.`,
        steps: [`${a} × ${b} = ${a * b}. On cherche ${n} − … = ${a * b}.`, `${n} − ${a * b} = **${x}**.`],
        targetSeconds: 25,
      };
    }
    const a = rng.int(2, 12);
    const x = rng.int(2, 12);
    const plus = level === 1;
    return {
      prompt: plus ? `Complète : ${a} + … = ${a + x * 3}` : `Complète : ${a} × … = ${a * x}`,
      answer: num(plus ? x * 3 : x),
      traps: traps(r(plus ? x * 3 : x), [
        [plus ? a + a + x * 3 : a * a * x, 'On cherche le nombre manquant : fais l’opération inverse.'],
      ]),
      hint: plus ? 'Que faut-il ajouter ? Fais une soustraction.' : 'Fais une division.',
      steps: [
        plus ? `On fait l’opération inverse : ${a + x * 3} − ${a}.` : `On fait l’opération inverse : ${a * x} ÷ ${a}.`,
        `Le nombre manquant est **${plus ? x * 3 : x}**.`,
      ],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const problemesAlgebriques = S(
  'm6-problemes-algebriques',
  'Problèmes algébriques (modèle en barres)',
  'Utiliser des modèles pré-algébriques pour résoudre des problèmes algébriques',
  [
    'Dessine des **barres** : 3 stylos identiques et un cahier à 4 € coûtent 10 € → les 3 barres valent 10 − 4 = 6 €, une barre vaut 2 €.',
  ],
  (rng, level) => {
    const n = rng.int(2, level === 1 ? 4 : 6);
    const unit = rng.int(2, 9);
    const extra = rng.int(1, 9);
    const total = n * unit + extra;
    const item = rng.pick(['stylos', 'gommes', 'cahiers', 'badges']);
    return {
      prompt: `${n} ${item} identiques et un sac à ${extra} € coûtent ${total} € en tout. Combien coûte un ${item.slice(0, -1)} ?`,
      answer: num(unit, '€'),
      traps: traps(r(unit), [
        [r(total, n), `Enlève d’abord le prix du sac (${extra} €).`],
        [total - extra, `${total - extra} € est le prix des ${n} ${item} ensemble.`],
      ]),
      hint: `Enlève le prix du sac, puis partage entre les ${n} ${item}.`,
      steps: [
        `Sans le sac : ${total} − ${extra} = ${total - extra} € pour ${n} ${item}.`,
        `Un ${item.slice(0, -1)} : ${total - extra} ÷ ${n} = **${unit} €**.`,
      ],
      targetSeconds: 40,
    };
  },
);

const motifs = S(
  'm6-motifs',
  'Suites de motifs',
  'Identifier la structure d’un motif évolutif en repérant une régularité et en identifiant une structure',
  [
    'Regarde ce qui **s’ajoute** d’une étape à la suivante : si on ajoute toujours 3 carreaux, l’étape 10 a 3 × 10 + (ce qu’il y a au départ).',
  ],
  (rng, level) => {
    const step = rng.int(2, 4);
    const start = rng.int(1, 3);
    const count = (k: number) => start + step * (k - 1);
    const target = level === 1 ? 4 : level === 2 ? rng.int(6, 10) : rng.int(15, 30);
    const shapes = [1, 2, 3].map((k) =>
      Array.from({ length: count(k) }, (_, i) => [i % 6, Math.floor(i / 6)] as [number, number]),
    );
    return {
      prompt: `Étape 1 : ${count(1)} carreaux, étape 2 : ${count(2)}, étape 3 : ${count(3)}. Combien de carreaux à l’étape ${target} ?`,
      figure: { kind: 'pattern', steps: shapes },
      answer: num(count(target)),
      traps: traps(r(count(target)), [
        [
          step * target,
          `Au départ il y a ${start} carreau${start > 1 ? 'x' : ''}, et on en ajoute ${step} à chaque étape **suivante**.`,
        ],
      ]),
      hint: `On ajoute ${step} carreaux à chaque étape. Combien d’ajouts entre l’étape 1 et l’étape ${target} ?`,
      steps: [
        `De l’étape 1 à l’étape ${target}, on ajoute ${target - 1} fois ${step} carreaux.`,
        `${count(1)} + ${target - 1} × ${step} = **${count(target)}** carreaux.`,
      ],
      targetSeconds: 30,
    };
  },
);

const algebre = C(
  'm6-algebre',
  'nombres',
  'Pensée algébrique',
  [egaliteTrous, problemesAlgebriques, motifs],
  bossOf(
    [
      S(
        'm6-boss-algebre-cinema',
        'Problème : le cinéma',
        'Utiliser des modèles pré-algébriques pour résoudre des problèmes algébriques',
        [
          '2 adultes et 3 enfants : si une place enfant coûte 2 € de moins, dessine les barres et enlève les différences.',
        ],
        (rng) => {
          const child = rng.int(4, 8);
          const diff = rng.int(2, 4);
          const adult = child + diff;
          const total = 2 * adult + 3 * child;
          return {
            prompt: `Au cinéma, une place adulte coûte ${diff} € de plus qu’une place enfant. 2 adultes et 3 enfants paient ${total} €. Combien coûte une place enfant ?`,
            answer: num(child, '€'),
            traps: traps(r(child), [
              [r(total, 5), `Les places adulte coûtent ${diff} € de plus : enlève d’abord 2 × ${diff} €.`],
              [adult, 'Ça, c’est le prix d’une place adulte.'],
            ]),
            hint: `Si les adultes payaient le prix enfant, on paierait ${2 * diff} € de moins.`,
            steps: [
              `Sans le supplément des adultes : ${total} − 2 × ${diff} = ${total - 2 * diff} € pour 5 places enfant.`,
              `Une place enfant : ${total - 2 * diff} ÷ 5 = **${child} €**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm6-boss-algebre-tables',
        'Problème : les tables de la fête',
        'Identifier la structure d’un motif évolutif en repérant une régularité et en identifiant une structure',
        ['Une table seule : 4 places. Deux tables collées : 6 places. Chaque table ajoutée apporte 2 places.'],
        (rng) => {
          const n = rng.int(5, 15);
          const seats = 2 * n + 2;
          return {
            prompt: `Une table carrée accueille 4 personnes. Quand on colle les tables en ligne, 2 tables accueillent 6 personnes, 3 tables 8 personnes. Combien de personnes avec ${n} tables ?`,
            answer: num(seats),
            traps: traps(r(seats), [[4 * n, 'En collant les tables, on perd les places entre elles.']]),
            hint: 'Chaque table ajoutée apporte 2 places.',
            steps: [
              `On part de 4 places et on ajoute 2 places pour chacune des ${n - 1} autres tables.`,
              `4 + 2 × ${n - 1} = **${seats}** personnes.`,
            ],
            targetSeconds: 50,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-algebre-piege',
        'Piège : le signe égal',
        'Compléter des égalités à trous multiplicatives',
        ['Le signe = relie deux expressions égales : dans 5 + 3 = … + 6, on cherche 2 (et pas 8).'],
        (rng) => {
          const a = rng.int(4, 12);
          const b = rng.int(3, 9);
          const c = rng.int(1, a + b - 1);
          const x = a + b - c;
          return {
            prompt: `Complète : ${a} + ${b} = … + ${c}`,
            answer: num(x),
            traps: traps(r(x), [
              [a + b, `${a} + ${b} = ${a + b}, mais à droite il y a déjà « + ${c} ».`],
              [a + b + c, 'Le signe = veut dire « vaut la même chose » des deux côtés.'],
            ]),
            hint: 'Les deux côtés doivent valoir la même chose.',
            steps: [
              `À gauche : ${a} + ${b} = ${a + b}.`,
              `À droite, il faut ${a + b} : … + ${c} = ${a + b}, donc **${x}**.`,
            ],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);

export const SIXIEME_NOMBRES: readonly Chapter[] = [numeration, calcul, division, fractions, pourcentages, algebre];
