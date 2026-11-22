import { choice, fraction, num, traps } from '../../build.ts';
import { fmt, r } from '../../rational.ts';
import type { EvalChapter } from '../../types.ts';
import { chapter, NAMES, skill } from './kit.ts';

/**
 * Domaine « Nombres et calculs » du CE2. Programme du cycle 2 (CE2), BO n°16 du 17 avril 2025 :
 * nombres entiers jusqu'à 10 000, faits numériques, calcul posé, problèmes, fractions simples.
 */

const RANKS = ['unités', 'dizaines', 'centaines', 'milliers'] as const;
/** Chiffres de n, du rang des unités vers celui des milliers. */
const digitsOf = (n: number) => RANKS.map((_, i) => Math.floor(n / 10 ** i) % 10);

// ——— Nombres entiers ———

const decomposer = skill(
  'mce2-decomposer',
  'Lire et décomposer un nombre',
  'Comprendre et utiliser des nombres entiers pour dénombrer, ordonner, repérer, comparer ; composer, décomposer les nombres jusqu’à 10 000',
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
  'Comparer, ranger, encadrer, intercaler des nombres entiers',
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

// ——— Calcul mental ———

const tables = skill(
  'mce2-tables',
  'Tables de multiplication',
  'Mémoriser les tables de multiplication de 2 à 9 ; calculer mentalement',
  [
    '7 × 8 = 8 × 7 : on peut retourner une multiplication.',
    'Une division est une multiplication à l’envers : 56 ÷ 7 = 8 car 8 × 7 = 56.',
  ],
  (rng, level) => {
    const a = rng.int(2, 9);
    const b = level === 1 ? rng.pick([2, 5, 10]) : rng.int(2, 9);
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

const complements = skill(
  'mce2-complements',
  'Compléments à 10, 100, 1 000',
  'Mémoriser des faits numériques : compléments à la dizaine, à la centaine, au millier',
  ['Complément : ce qu’il manque pour arriver à un nombre rond. 7 + 3 = 10 ; 40 + 60 = 100 ; 600 + 400 = 1 000.'],
  (rng, level) => {
    const target = level === 1 ? 10 : level === 2 ? 100 : rng.pick([100, 1000]);
    const k =
      level === 1
        ? rng.int(1, 9)
        : level === 2
          ? rng.int(1, 9) * 10
          : target === 100
            ? rng.int(1, 9) * 10 + rng.int(1, 9)
            : rng.int(1, 9) * 100 + rng.int(1, 9) * 10;
    const res = target - k;
    return {
      prompt: `Complète : ${fmt(k)} + ? = ${fmt(target)}.`,
      answer: num(res),
      traps: traps(r(res), [
        [res + 10, 'Vérifie en additionnant : le total doit être exactement ' + fmt(target) + '.'],
        [target + k, 'On cherche ce qui manque, pas la somme.'],
      ]),
      hint: `Cherche d’abord ce qu’il faut pour arriver à la dizaine ou à la centaine suivante de ${fmt(k)}.`,
      steps: [
        `On cherche ce qu’il manque à ${fmt(k)} pour faire ${fmt(target)}.`,
        `${fmt(k)} + ${fmt(res)} = ${fmt(target)} : **${fmt(res)}**.`,
      ],
      targetSeconds: 12,
    };
  },
  { mental: true },
);

const doublesMoities = skill(
  'mce2-doubles-moities',
  'Doubles et moitiés',
  'Calculer mentalement : doubles et moitiés de nombres usuels',
  [
    'Le **double**, c’est deux fois le nombre : double de 35 = 70.',
    'La **moitié**, c’est le partage en 2 parts égales : moitié de 70 = 35.',
  ],
  (rng, level) => {
    const half = rng.int(0, 1) === 0 && level > 1;
    const x = level === 1 ? rng.int(2, 25) : level === 2 ? rng.int(10, 50) : rng.int(2, 49) * 10;
    if (half) {
      const even = x * 2;
      return {
        prompt: `Quelle est la moitié de ${fmt(even)} ?`,
        answer: num(x),
        traps: traps(r(x), [[even * 2, 'La moitié est plus petite que le nombre.']]),
        hint: 'Partage le nombre en deux parts égales, dizaines puis unités.',
        steps: [`Moitié de ${fmt(even)} : ${fmt(even)} ÷ 2.`, `= **${fmt(x)}**.`],
        targetSeconds: 15,
      };
    }
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
  'Calculer avec des nombres entiers : addition posée (jusqu’à 10 000), avec retenue',
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
  'Calculer avec des nombres entiers : soustraction posée (jusqu’à 10 000)',
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
  'Multiplier par un nombre à un chiffre',
  'Calculer avec des nombres entiers : multiplication d’un nombre à plusieurs chiffres par un nombre à un chiffre',
  [
    'On multiplie chaque rang : 347 × 6 = 300 × 6 + 40 × 6 + 7 × 6 = 1 800 + 240 + 42.',
    'En posant l’opération, on n’oublie pas les retenues.',
  ],
  (rng, level) => {
    const k = level === 1 ? rng.int(2, 5) : rng.int(2, 9);
    const a = level === 1 ? rng.int(12, 99) : rng.int(100, level === 2 ? 499 : 999);
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
  'Résoudre des problèmes en utilisant des nombres entiers et le calcul : problèmes additifs à une étape',
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
  'Résoudre des problèmes en utilisant des nombres entiers et le calcul : groupements et partages égaux',
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
  'Résoudre des problèmes en une ou deux étapes, en utilisant des nombres entiers et le calcul',
  [
    'Un problème en deux étapes : on cherche d’abord ce qui manque pour répondre, puis on calcule la réponse.',
    'On écrit chaque étape avec son calcul.',
  ],
  (rng) => {
    const name = rng.pick(NAMES);
    const price = rng.int(3, 9);
    const n = rng.int(2, 6);
    const extra = rng.int(2, 9);
    if (rng.int(0, 1) === 0) {
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

// ——— Fractions simples ———

const NAMES_FRAC = { 2: 'la moitié', 3: 'le tiers', 4: 'le quart' } as const;

const fractionDeQuantite = skill(
  'mce2-fraction-quantite',
  'Moitié, tiers, quart d’une quantité',
  'Nommer, lire, écrire, représenter des fractions simples : moitié, tiers, quart ; partager une quantité',
  [
    'La moitié : on partage en 2 parts égales. Le tiers : en 3. Le quart : en 4.',
    'Le quart de 20 : 20 ÷ 4 = 5, car 4 × 5 = 20.',
  ],
  (rng, level) => {
    const den: 2 | 3 | 4 = level === 1 ? 2 : rng.pick([2, 3, 4] as const);
    const q = rng.int(2, level === 3 ? 12 : 9);
    const total = den * q;
    return {
      prompt:
        level === 3
          ? `Un sachet contient ${total} bonbons. ${rng.pick(NAMES)} en reçoit ${NAMES_FRAC[den]}. Combien de bonbons reçoit-il ?`
          : `Quel est ${NAMES_FRAC[den]} de ${total} ?`,
      answer: num(q),
      traps: traps(r(q), [
        [total - q, 'Le partage donne une seule part, pas le reste.'],
        [total * den, 'Partager rend plus petit.'],
      ]),
      hint: `Partage ${total} en ${den} parts égales.`,
      steps: [
        `${NAMES_FRAC[den]} : on partage en ${den} parts égales.`,
        `${total} ÷ ${den} : ${den} × ${q} = ${total}, donc **${q}**.`,
      ],
      demo: { kind: 'fraction', parts: [{ num: 1, den }] },
      targetSeconds: 20,
    };
  },
);

const fractionFigure = skill(
  'mce2-fraction-figure',
  'Fractions d’une figure',
  'Nommer, lire, écrire, représenter des fractions simples : fractions d’une figure partagée en parts égales',
  [
    'Une fraction se lit avec le nombre de parts égales : 2 parts → des moitiés, 3 → des tiers, 4 → des quarts.',
    '{3/4} : on a partagé en 4 parts égales et on en prend 3 (trois quarts).',
  ],
  (rng, level) => {
    const den = rng.pick([2, 3, 4]);
    if (level === 3) {
      const word = (['moitié', 'tiers', 'quart'] as const)[den - 2] ?? 'moitié';
      const { answer, traps: t } = choice(rng, word, [
        ...(['moitié', 'tiers', 'quart'] as const)
          .filter((w) => w !== word)
          .map((label) => ({ label, why: `Compte les parts égales : ${den} parts.` })),
      ]);
      return {
        prompt: `Une tarte est partagée en ${den} parts égales. Une part s’appelle un(e) … de la tarte.`,
        answer,
        traps: t,
        hint: 'Compte le nombre de parts égales : 2, 3 ou 4 ?',
        steps: [
          `${den} parts égales : on en prend 1.`,
          `Une part est **${word === 'moitié' ? 'la moitié' : 'le ' + word}** : {1/${den}}.`,
        ],
        targetSeconds: 20,
      };
    }
    const taken = level === 1 ? 1 : rng.int(1, den - 1);
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

export const CE2_NOMBRES: readonly EvalChapter[] = [
  chapter('mce2-nombres', 'nombres', 'Nombres jusqu’à 10 000', [decomposer, comparer]),
  chapter('mce2-calcul-mental', 'nombres', 'Calcul mental : tables, compléments, doubles', [
    tables,
    complements,
    doublesMoities,
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
  ]),
  chapter('mce2-fractions', 'nombres', 'Moitié, tiers, quart', [fractionDeQuantite, fractionFigure]),
];
