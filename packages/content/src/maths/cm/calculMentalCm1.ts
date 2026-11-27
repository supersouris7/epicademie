import { choice, distinct, fraction, num, traps } from '../../build.ts';
import { dec, fmt, r, rawFrac } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { big, NAMES } from '../kit.ts';
import type { Contexte } from './contexte.ts';
import { associer, cinqNiveaux, parNiveau } from './niveaux.ts';

/**
 * « Calcul mental » au CM1, 5 niveaux (lot ma-cm1-n02). Programme du cycle 3 (17 avril 2025) : ajouter ou
 * soustraire 8, 9, 18, 19, 28, 29, 38 ou 39 ; multiplier un entier par 10, 100 ou 1 000, par 4, 5 ou 8 ;
 * décimaux au centième au plus.
 */

// ——— Tables de multiplication ———

const tableNiveau1 = (rng: Rng): QuestionDraft => {
  const a = rng.pick([2, 5, 10]);
  const b = rng.int(3, 9);
  return {
    prompt: `Combien font ${b} × ${a} ?`,
    ...choice(rng, String(a * b), [
      { label: String(a + b), why: 'C’est une multiplication, pas une addition.' },
      { label: String(a * b + a), why: `Il y a une fois ${a} de trop.` },
    ]),
    hint: `Compte de ${a} en ${a}.`,
    steps: [`${b} × ${a}, c’est ${b} fois ${a}.`, `On trouve **${a * b}**.`],
    targetSeconds: 8,
  };
};

const tableNiveau2 = (rng: Rng): QuestionDraft => {
  const a = rng.int(3, 9);
  const b = rng.int(6, 9);
  const p = a * b;
  return {
    prompt: `Combien font ${a} × ${b} ?`,
    ...choice(rng, String(p), [
      { label: String(p + a), why: `Il y a une fois ${a} de trop.` },
      { label: String(p - a), why: `Il manque une fois ${a}.` },
      { label: String(p + 1), why: `${p + 1} n’est pas le résultat : repars d’un calcul sûr, comme ${a} × 5.` },
    ]),
    hint: `Pars de ${a} × 5, puis ajuste.`,
    steps: [`${a} × 5 = ${a * 5}, puis on ajoute ${b - 5} fois ${a}.`, `${a} × ${b} = **${p}**.`],
    targetSeconds: 10,
  };
};

const tableNiveau3 = (rng: Rng): QuestionDraft => {
  const a = rng.int(2, 10);
  const b = rng.int(2, 10);
  return {
    prompt: `Calcule ${a} × ${b}.`,
    answer: num(a * b),
    traps: traps(r(a * b), [
      [a + b, 'C’est une multiplication, pas une addition.'],
      [a * (b - 1), `Il manque une fois ${a}.`],
      [a * (b + 1), `Il y a une fois ${a} de trop.`],
    ]),
    hint: `Pars d’un résultat facile, comme ${a} × 5 ou ${a} × 10, puis ajuste.`,
    steps: [`${a} × ${b}, c’est ${b} fois ${a}.`, `On trouve **${a * b}**.`],
    targetSeconds: 8,
  };
};

const tableNiveau4 = (rng: Rng): QuestionDraft => {
  const a = rng.int(3, 9);
  const b = rng.int(3, 9);
  const p = a * b;
  const first = rng.int(0, 1) === 0;
  return {
    prompt: first ? `Complète : … × ${a} = ${p}` : `Complète : ${a} × … = ${p}`,
    answer: num(b),
    traps: traps(r(b), [
      [p - a, 'On cherche un nombre à multiplier, pas la différence.'],
      [b + 1, `Vérifie : ${a} × ${b + 1} dépasse ${p}.`],
      [b - 1, `Vérifie : ${a} × ${b - 1} n’atteint pas ${p}.`],
    ]),
    hint: `Récite la table de ${a} jusqu’à trouver ${p}.`,
    steps: [`Dans la table de ${a}, on cherche ${p}.`, `${a} × ${b} = ${p} : il faut **${b}**.`],
    targetSeconds: 15,
  };
};

const tableNiveau5 = (rng: Rng): QuestionDraft => {
  const boxes = rng.int(4, 9);
  const per = rng.int(4, 9);
  const extra = rng.int(2, 9);
  const total = boxes * per + extra;
  return {
    prompt: `${rng.pick(NAMES)} remplit ${boxes} boîtes avec ${per} billes chacune. Il reste ${extra} billes hors des boîtes. Combien de billes y a-t-il en tout ?`,
    answer: num(total),
    traps: traps(r(total), [
      [boxes * per, 'N’oublie pas les billes restées hors des boîtes.'],
      [boxes + per + extra, 'Chaque boîte contient plusieurs billes : il faut multiplier.'],
    ]),
    hint: 'Compte d’abord les billes dans les boîtes.',
    steps: [
      `Dans les boîtes : ${boxes} × ${per} = ${boxes * per}.`,
      `${boxes * per} + ${extra} = **${total}** billes.`,
    ],
    targetSeconds: 40,
  };
};

// ——— Ajouter ou soustraire 8, 9, 18, 19… ———

const NEUFS = [9, 19, 29, 39] as const;
const TOUS = [8, 9, 18, 19, 28, 29, 38, 39] as const;
/** Dizaine ronde juste au-dessus et correction à faire. */
const rond = (k: number) => ({ round: k + (k % 10 === 9 ? 1 : 2), corr: k % 10 === 9 ? 1 : 2 });

const neufNiveau1 = (rng: Rng): QuestionDraft => {
  const k = rng.pick([9, 19]);
  const n = rng.int(21, 79);
  const { round } = rond(k);
  return {
    prompt: `Pour calculer ${n} + ${k} de tête, que peux-tu faire ?`,
    ...choice(rng, `Ajouter ${round}, puis enlever 1`, [
      { label: `Ajouter ${round}, puis ajouter 1`, why: `${round} dépasse déjà ${k} : il faut enlever 1.` },
      { label: `Enlever ${round}, puis ajouter 1`, why: 'C’est une addition : le nombre doit grandir.' },
    ]),
    hint: `${k} est tout près de ${round}.`,
    steps: [`${k}, c’est ${round} moins 1.`, `**Ajouter ${round}, puis enlever 1**.`],
    targetSeconds: 15,
  };
};

const neufNiveau2 = (rng: Rng): QuestionDraft => {
  const k = rng.pick(NEUFS);
  const n = rng.int(23, 59);
  const res = n + k;
  return {
    prompt: `Combien font ${n} + ${k} ?`,
    ...choice(rng, String(res), [
      { label: String(res + 1), why: `Tu as ajouté ${k + 1} : il faut encore enlever 1.` },
      { label: String(res + 2), why: 'Après la dizaine ronde, on enlève 1 : on ne l’ajoute pas.' },
      { label: String(res - 10), why: 'Il manque une dizaine.' },
    ]),
    hint: `Ajoute ${k + 1}, puis corrige.`,
    steps: [`${n} + ${k + 1} = ${res + 1}.`, `On enlève 1 : **${res}**.`],
    targetSeconds: 15,
  };
};

const neufNiveau3 = (rng: Rng): QuestionDraft => {
  const k = rng.pick(TOUS);
  const n = rng.int(100, 899);
  const { round, corr } = rond(k);
  const res = n + k;
  return {
    prompt: `Calcule ${n} + ${k}.`,
    answer: num(res),
    traps: traps(r(res), [
      [n + round, `Tu as ajouté ${round} : il faut enlever ${corr}.`],
      [n + round + corr, `${round} dépasse ${k} : on enlève ${corr}, on ne l’ajoute pas.`],
    ]),
    hint: `Ajoute la dizaine ronde la plus proche de ${k}, puis corrige.`,
    steps: [`${n} + ${round} = ${n + round}.`, `On enlève ${corr} : **${res}**.`],
    targetSeconds: 15,
  };
};

const neufNiveau4 = (rng: Rng): QuestionDraft => {
  const k = rng.pick(TOUS);
  const n = rng.int(103, 987);
  const { round, corr } = rond(k);
  const res = n - k;
  return {
    prompt: `Calcule ${n} − ${k}.`,
    answer: num(res),
    traps: traps(r(res), [
      [n - round, `Tu as enlevé ${round}, c’est ${corr} de trop : rajoute ${corr}.`],
      [n - round - corr, `Après avoir enlevé ${round}, on rajoute ${corr} : on ne l’enlève pas.`],
    ]),
    hint: `Enlève la dizaine ronde la plus proche de ${k}, puis corrige.`,
    steps: [`${n} − ${round} = ${n - round}.`, `On rajoute ${corr} : **${res}**.`],
    targetSeconds: 20,
  };
};

const neufNiveau5 = (rng: Rng): QuestionDraft => {
  const [a = 19, b = 29] = distinct(rng, 2, () => rng.pick(TOUS));
  const n = rng.int(60, 450);
  const res = n + a - b;
  return {
    prompt: `${rng.pick(NAMES)} a ${n} points. Le tour suivant rapporte ${a} points. Ensuite, un piège en fait perdre ${b}. Quel est le score final ?`,
    answer: num(res),
    traps: traps(r(res), [
      [n + a + b, `Les ${b} points sont perdus : il faut les enlever.`],
      [n + a, 'Il reste le piège : enlève les points perdus.'],
    ]),
    hint: 'Fais un calcul après l’autre : d’abord le gain, puis la perte.',
    steps: [`Après le gain : ${n} + ${a} = ${n + a}.`, `Après la perte : ${n + a} − ${b} = **${res}**.`],
    targetSeconds: 45,
  };
};

// ——— Multiplier par 10, 100, 1 000 ———

const PUISSANCES = [10, 100, 1000] as const;
const zeros = (k: number) => String(k).length - 1;
const rangs = (k: number) => `${zeros(k)} rang${k > 10 ? 's' : ''}`;

const dixNiveau1 = (rng: Rng): QuestionDraft => {
  const n = rng.int(12, 98);
  return {
    prompt: `Combien font ${n} × 10 ?`,
    ...choice(rng, big(n * 10), [
      { label: big(n + 10), why: 'C’est une multiplication par 10, pas une addition.' },
      { label: big(n * 100), why: '× 10 : un seul rang, pas deux.' },
    ]),
    hint: 'Chaque chiffre monte d’un rang.',
    steps: ['× 10 : les unités deviennent des dizaines.', `${n} × 10 = **${big(n * 10)}**.`],
    targetSeconds: 10,
  };
};

const dixNiveau2 = (rng: Rng): QuestionDraft => {
  const [a = 12, b = 34, d = 56] = distinct(rng, 3, () => rng.int(2, 9) * 10 + rng.int(1, 9));
  const paires = [
    [`${a} × 10`, big(a * 10)],
    [`${a} × 100`, big(a * 100)],
    [`${b} × 100`, big(b * 100)],
    [`${d} × 1000`, big(d * 1000)],
  ] as const;
  return {
    prompt: `Associe chaque calcul à son résultat : ${paires.map((p) => p[0]).join(' ; ')}.`,
    answer: associer(rng, paires),
    traps: [],
    hint: 'Compte les zéros de 10, 100 ou 1000.',
    steps: [
      '× 10 : un rang. × 100 : deux rangs. × 1000 : trois rangs.',
      `**${paires.map(([x, y]) => `${x} = ${y}`).join(' ; ')}**.`,
    ],
    targetSeconds: 35,
  };
};

const dixNiveau3 = (rng: Rng): QuestionDraft => {
  const k = rng.pick(PUISSANCES);
  const n = rng.int(11, 999);
  const res = n * k;
  return {
    prompt: `Calcule ${n} × ${big(k)}.`,
    answer: num(res),
    traps: traps(r(res), [
      [k === 10 ? res * 10 : res / 10, `Compte bien : × ${big(k)} fait monter les chiffres de ${rangs(k)}.`],
      [n + k, 'C’est une multiplication, pas une addition.'],
    ]),
    hint: `Les chiffres montent de ${rangs(k)}.`,
    steps: [`× ${big(k)} : les chiffres montent de ${rangs(k)}.`, `${n} × ${big(k)} = **${big(res)}**.`],
    targetSeconds: 12,
  };
};

const dixNiveau4 = (rng: Rng): QuestionDraft => {
  const k = rng.pick(PUISSANCES);
  const n = rng.int(2, 9) * 100 + rng.pick([0, rng.int(1, 9), rng.int(1, 9) * 10]);
  const res = n * k;
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `Complète : ${n} × … = ${big(res)}`,
      answer: num(k),
      traps: traps(r(k), [
        [k * 10, 'Un zéro de trop : compare les deux nombres rang par rang.'],
        [k / 10, 'Il manque un zéro : compare les deux nombres rang par rang.'],
      ]),
      hint: 'De combien de rangs les chiffres sont-ils montés ?',
      steps: [`Les chiffres sont montés de ${rangs(k)}.`, `Le nombre cherché est **${big(k)}**.`],
      targetSeconds: 25,
    };
  }
  return {
    prompt: `Complète : … × ${big(k)} = ${big(res)}`,
    answer: num(n),
    traps: traps(r(n), [
      [n * 10, 'Ton nombre est trop grand : vérifie en le multipliant.'],
      [r(n, 10), 'Ton nombre est trop petit : vérifie en le multipliant.'],
    ]),
    hint: `Fais descendre les chiffres de ${rangs(k)}.`,
    steps: [`On cherche le nombre avant la montée de ${rangs(k)}.`, `**${n}** × ${big(k)} = ${big(res)}.`],
    targetSeconds: 30,
  };
};

const dixNiveau5 = (rng: Rng): QuestionDraft => {
  const a = rng.int(12, 85);
  const b = rng.int(11, 60);
  const res = a * 100 + b * 10;
  return {
    prompt: `L’école reçoit ${a} cartons de 100 feuilles et ${b} paquets de 10 feuilles. Combien de feuilles reçoit-elle ?`,
    answer: num(res),
    traps: traps(r(res), [
      [a * 10 + b * 100, 'Les cartons contiennent 100 feuilles, les paquets 10 : ne les échange pas.'],
      [a * 100 + b, `Chaque paquet contient 10 feuilles : il faut calculer ${b} × 10.`],
    ]),
    hint: 'Calcule les feuilles des cartons, puis celles des paquets.',
    steps: [`${a} × 100 = ${big(a * 100)} et ${b} × 10 = ${b * 10}.`, `${big(a * 100)} + ${b * 10} = **${big(res)}**.`],
    targetSeconds: 50,
  };
};

// ——— Multiplier par 4, 5 ou 8 ———

const METHODE: Readonly<Record<number, string>> = {
  4: 'Doubler, puis doubler encore',
  5: 'Multiplier par 10, puis prendre la moitié',
  8: 'Doubler trois fois',
};
const calculParEtapes = (n: number, k: number) =>
  k === 5
    ? `${n} × 10 = ${n * 10}, et la moitié de ${n * 10} est ${n * 5}.`
    : `On double : ${n} → ${n * 2} → ${n * 4}${k === 8 ? ` → ${n * 8}` : ''}.`;
const astuce = (n: number, k: number) =>
  k === 5 ? `Calcule ${n} × 10, puis prends la moitié.` : `Double ${n}${k === 8 ? ' trois fois' : ' deux fois'}.`;

const quatreNiveau1 = (rng: Rng): QuestionDraft => {
  const k = rng.pick([4, 5, 8]);
  const n = rng.int(13, 45);
  const autres: Readonly<Record<number, readonly [string, string][]>> = {
    4: [
      ['Doubler une seule fois', 'Doubler une fois, c’est multiplier par 2.'],
      ['Ajouter 4', 'Multiplier par 4, ce n’est pas ajouter 4.'],
    ],
    5: [
      ['Multiplier par 10, puis doubler', 'Doubler donnerait × 20 : il faut prendre la moitié.'],
      ['Ajouter 5', 'Multiplier par 5, ce n’est pas ajouter 5.'],
    ],
    8: [
      ['Doubler deux fois', 'Doubler deux fois, c’est multiplier par 4.'],
      ['Ajouter 8', 'Multiplier par 8, ce n’est pas ajouter 8.'],
    ],
  };
  return {
    prompt: `Quelle astuce permet de calculer ${n} × ${k} ?`,
    ...choice(
      rng,
      METHODE[k] ?? '',
      (autres[k] ?? []).map(([label, why]) => ({ label, why })),
    ),
    hint: k === 5 ? '5, c’est la moitié de 10.' : `Combien de fois faut-il doubler pour faire × ${k} ?`,
    steps: [calculParEtapes(n, k), `La bonne astuce : **${METHODE[k]}**.`],
    targetSeconds: 20,
  };
};

const quatreNiveau2 = (rng: Rng): QuestionDraft => {
  const k = rng.pick([4, 5, 8]);
  const n = rng.int(12, 25);
  const res = n * k;
  return {
    prompt: `Combien font ${n} × ${k} ?`,
    ...choice(rng, String(res), [
      { label: String(res - n), why: `Il manque une fois ${n}.` },
      { label: String(res + n), why: `Il y a une fois ${n} de trop.` },
      { label: String(n + k), why: 'C’est une multiplication, pas une addition.' },
    ]),
    hint: astuce(n, k),
    steps: [calculParEtapes(n, k), `${n} × ${k} = **${res}**.`],
    targetSeconds: 25,
  };
};

const quatreNiveau3 = (rng: Rng): QuestionDraft => {
  const k = rng.pick([4, 5, 8]);
  const n = rng.int(26, 99);
  const res = n * k;
  return {
    prompt: `Calcule ${n} × ${k}.`,
    answer: num(res),
    traps: traps(r(res), [
      [res - n, `Il manque une fois ${n}.`],
      [k === 5 ? n * 10 : n * (k / 2), k === 5 ? 'Il reste à prendre la moitié.' : 'Il manque un doublement.'],
    ]),
    hint: astuce(n, k),
    steps: [calculParEtapes(n, k), `${n} × ${k} = **${res}**.`],
    targetSeconds: 25,
  };
};

const quatreNiveau4 = (rng: Rng): QuestionDraft => {
  const k = rng.pick([4, 5, 8]);
  const n = rng.int(10, 24) * 10 + rng.pick([3, 5, 7, 9]);
  const res = n * k;
  return {
    prompt: `Grand calcul de tête : ${n} × ${k} = ?`,
    answer: num(res),
    traps: traps(r(res), [
      [res - 10, 'Presque ! Reprends la retenue des dizaines.'],
      [k === 5 ? n * 10 : n * (k / 2), k === 5 ? 'Il reste à prendre la moitié.' : 'Il manque un doublement.'],
    ]),
    hint: astuce(n, k),
    steps: [calculParEtapes(n, k), `${n} × ${k} = **${big(res)}**.`],
    targetSeconds: 40,
  };
};

const quatreNiveau5 = (rng: Rng): QuestionDraft => {
  const k = rng.pick([4, 5, 8]);
  const n = rng.int(14, 65);
  const m = rng.int(6, 40);
  const res = n * k + m;
  return {
    prompt: `Un théâtre a ${k} rangées de ${n} places, et ${m} places au balcon. Combien de places a-t-il en tout ?`,
    answer: num(res),
    traps: traps(r(res), [
      [n * k, 'N’oublie pas les places du balcon.'],
      [n + k + m, `Il y a ${k} rangées de ${n} places : il faut multiplier.`],
    ]),
    hint: 'Compte d’abord les places des rangées.',
    steps: [calculParEtapes(n, k), `${n * k} + ${m} = **${res}** places.`],
    targetSeconds: 50,
  };
};

// ——— Fractions usuelles et décimaux ———

/** Fraction usuelle et sa valeur en centièmes. */
const USUELLES = [
  [1, 2, 50],
  [1, 4, 25],
  [3, 4, 75],
  [1, 10, 10],
  [1, 5, 20],
  [1, 100, 1],
  [2, 5, 40],
  [3, 2, 150],
] as const;
type Usuelle = (typeof USUELLES)[number];
const ecrit = (h: number) => fmt(dec(h, 2));
const explique = ([n, d, h]: Usuelle) =>
  n === 1
    ? `${rawFrac(1, d)}, c’est 1 partagé en ${d} : ${ecrit(h)}.`
    : `${rawFrac(n, d)}, c’est ${n} fois ${rawFrac(1, d)}, donc ${n} fois ${ecrit(h / n)}.`;

/** Erreur « le trait devient une virgule » (3/4 lu 3,4), à laquelle on ajoute `plus` centièmes. */
const virgule = (n: number, d: number, plus: number) =>
  d < 10 ? [[dec(n * 100 + d * 10 + plus, 2), 'Le trait de fraction ne devient pas une virgule.'] as const] : [];

const usuelleNiveau1 = (rng: Rng): QuestionDraft => {
  const q = rng.pick(USUELLES.slice(0, 2).concat(USUELLES.slice(4, 5)));
  const [n, d, h] = q;
  return {
    prompt: `Quel nombre à virgule est égal à ${rawFrac(n, d)} ?`,
    ...choice(rng, ecrit(h), [
      { label: `${n},${d}`, why: 'Le trait de fraction ne devient pas une virgule.' },
      { label: `0,${d}`, why: `0,${d}, c’est ${d} dixièmes, pas ${rawFrac(n, d)}.` },
    ]),
    hint: `Imagine une unité partagée en ${d} parts égales.`,
    steps: [explique(q), `${rawFrac(n, d)} = **${ecrit(h)}**.`],
    targetSeconds: 12,
  };
};

const usuelleNiveau2 = (rng: Rng): QuestionDraft => {
  const choisies = rng.shuffle([...USUELLES]).slice(0, 4);
  const paires = choisies.map(([n, d, h]) => [rawFrac(n, d), ecrit(h)] as const);
  return {
    prompt: `Associe chaque fraction à son écriture à virgule : ${paires.map((p) => p[0]).join(' ; ')}.`,
    answer: associer(rng, paires),
    traps: [],
    hint: 'Commence par les fractions que tu connais par cœur.',
    steps: [choisies.map(explique).join(' '), `**${paires.map(([f, v]) => `${f} = ${v}`).join(' ; ')}**.`],
    targetSeconds: 35,
  };
};

const usuelleNiveau3 = (rng: Rng): QuestionDraft => {
  const q = rng.pick(USUELLES);
  const [n, d, h] = q;
  return {
    prompt: `Écris ${rawFrac(n, d)} avec une virgule.`,
    answer: num(dec(h, 2)),
    traps: traps(dec(h, 2), [
      ...virgule(n, d, 0),
      [dec(d, 1), 'Le nombre du bas dit en combien on partage : ce n’est pas la réponse.'],
      [dec(n, 1), `${rawFrac(n, d)} ne veut pas dire ${n} dixième${n > 1 ? 's' : ''} ici.`],
    ]),
    hint: n === 1 ? `Imagine 1 unité partagée en ${d} parts égales.` : `Pense à ${rawFrac(1, d)}, puis prends-en ${n}.`,
    steps: [explique(q), `${rawFrac(n, d)} = **${ecrit(h)}**.`],
    targetSeconds: 15,
  };
};

const usuelleNiveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const [n, d, h] = rng.pick(USUELLES);
    return {
      prompt: `Écris ${ecrit(h)} sous la forme d’une fraction.`,
      answer: fraction(r(n, d)),
      traps: traps(r(n, d), [
        [r(d, n), 'La fraction est à l’envers.'],
        [r(h, 10), 'Regarde le rang du dernier chiffre : dixièmes ou centièmes ?'],
        [r(h, 1000), 'Regarde le rang du dernier chiffre : dixièmes ou centièmes ?'],
      ]),
      hint: 'Lis le nombre en dixièmes ou en centièmes.',
      steps: [`${ecrit(h)} = ${rawFrac(h, 100)}.`, `On peut écrire **${rawFrac(n, d)}**.`],
      targetSeconds: 25,
    };
  }
  const [petit, d, k] = rng.pick([
    ['quarts', 4, 2],
    ['dixièmes', 10, 5],
    ['dixièmes', 10, 2],
    ['centièmes', 100, 25],
    ['centièmes', 100, 50],
  ] as const);
  // Combien de petites parts dans un demi, un cinquième ou un quart.
  const grand = d / k;
  const nom = grand === 2 ? 'un demi' : grand === 5 ? 'un cinquième' : 'un quart';
  return {
    prompt: `Dans ${nom} (${rawFrac(1, grand)}), combien y a-t-il de ${petit} ?`,
    answer: num(k),
    traps: traps(r(k), [
      [d, `${d} ${petit} font une unité entière.`],
      [grand, `${grand} est le nombre du bas de ${rawFrac(1, grand)}.`],
    ]),
    hint: `Combien de ${petit} dans une unité ? Partage-les ensuite.`,
    steps: [`1 unité = ${d} ${petit}.`, `${d} ÷ ${grand} = **${k}**.`],
    targetSeconds: 30,
  };
};

const usuelleNiveau5 = (rng: Rng): QuestionDraft => {
  const q = rng.pick(USUELLES.filter((u) => u[2] < 100 && u[1] !== 100));
  const [n, d, h] = q;
  const water = rng.pick([20, 25, 30, 50, 60, 75]);
  const total = h + water;
  return {
    prompt: `${rng.pick(NAMES)} verse ${rawFrac(n, d)} L de jus, puis ${ecrit(water)} L d’eau dans un pichet. Combien de litres contient le pichet ?`,
    answer: num(dec(total, 2), 'L'),
    traps: traps(dec(total, 2), [
      ...virgule(n, d, water),
      [dec(water, 2), 'N’oublie pas le jus.'],
      [dec(h, 2), 'N’oublie pas l’eau.'],
    ]),
    hint: 'Écris d’abord la fraction avec une virgule, puis additionne.',
    steps: [explique(q), `${ecrit(h)} + ${ecrit(water)} = **${ecrit(total)} L**.`],
    targetSeconds: 60,
  };
};

/** Les cinq notions historiques du chapitre, avec les identifiants d'origine. */
export function calculMentalCm1({ S, id }: Contexte): readonly Skill[] {
  const N = cinqNiveaux(S);
  return [
    N(
      id('tables'),
      'Tables de multiplication',
      'Connaître des faits numériques usuels relatifs aux nombres entiers',
      [
        '7 × 8 = 8 × 7 : tu peux retourner une multiplication.',
        'Astuce pour × 9 : fais × 10, puis enlève une fois. 6 × 9 = 60 − 6 = 54.',
      ],
      parNiveau([tableNiveau1, tableNiveau2, tableNiveau3, tableNiveau4, tableNiveau5]),
      { mental: true },
    ),
    N(
      id('ajouter-9'),
      'Ajouter ou soustraire 9, 19, 29…',
      'Ajouter ou soustraire 8, 9, 18, 19, 28, 29, 38 ou 39, à un nombre',
      [
        '+ 19 : ajoute 20, puis enlève 1. + 18 : ajoute 20, puis enlève 2.',
        '− 29 : enlève 30, puis rajoute 1. Exemple : 74 − 29 = 44 + 1 = 45.',
      ],
      parNiveau([neufNiveau1, neufNiveau2, neufNiveau3, neufNiveau4, neufNiveau5]),
      { mental: true },
    ),
    N(
      id('fois-10'),
      'Multiplier par 10, 100, 1 000',
      'Multiplier un nombre entier par 10, 100 ou 1 000',
      [
        '× 10 : chaque **chiffre** monte d’un rang. × 100 : deux rangs. × 1000 : trois rangs.',
        'Les places vides prennent un 0 : 45 × 100 = 4500.',
      ],
      parNiveau([dixNiveau1, dixNiveau2, dixNiveau3, dixNiveau4, dixNiveau5]),
      { mental: true },
    ),
    N(
      id('fois-4-5-8'),
      'Multiplier par 4, 5 ou 8',
      'Multiplier un nombre entier par 4 ou par 8 » ; « Multiplier un nombre entier par 5',
      [
        '× 4 : prends le **double** du double. × 8 : double trois fois.',
        '× 5 : fais × 10, puis prends la **moitié**. 18 × 5 = 180 ÷ 2 = 90.',
      ],
      parNiveau([quatreNiveau1, quatreNiveau2, quatreNiveau3, quatreNiveau4, quatreNiveau5]),
      { mental: true },
    ),
    N(
      id('fractions-usuelles'),
      'Fractions usuelles et décimaux',
      'Connaître l’écriture décimale de fractions usuelles » ; « Connaître quelques relations entre des fractions usuelles',
      [
        'À savoir par cœur : {1/2} = 0,5 ; {1/4} = 0,25 ; {3/4} = 0,75 ; {1/5} = 0,2 ; {1/10} = 0,1.',
        'Une même quantité peut s’écrire avec une autre **fraction** : un demi, c’est aussi deux quarts.',
      ],
      parNiveau([usuelleNiveau1, usuelleNiveau2, usuelleNiveau3, usuelleNiveau4, usuelleNiveau5]),
      { mental: true },
    ),
  ];
}

// ——— Ajouter ou soustraire sans retenue (objectif absent du lot, ajouté) ———

/** Rangs travaillés : valeur d'un chiffre en centièmes. */
const POSITIONS = [
  { w: 10_000, nom: 'centaine' },
  { w: 1000, nom: 'dizaine' },
  { w: 100, nom: 'unité' },
  { w: 10, nom: 'dixième' },
  { w: 1, nom: 'centième' },
] as const;

/** Calcul sans retenue au rang `p` (indice dans POSITIONS) ; `n` et `res` sont en centièmes. */
function sansRetenue(rng: Rng, p: number, minus: boolean) {
  const { w, nom } = POSITIONS[p] ?? POSITIONS[2];
  const digit = minus ? rng.int(1, 9) : rng.int(1, 8);
  const k = minus ? rng.int(1, digit) : rng.int(1, 9 - digit);
  const base = rng.int(1, 9) * 1000 + rng.int(1, 9) * 100 + rng.int(1, 9) * 10 + rng.int(1, 9);
  const n = base - (Math.floor(base / w) % 10) * w + digit * w;
  const res = minus ? n - k * w : n + k * w;
  const quoi = `${k} ${nom}${k > 1 ? 's' : ''}`;
  // Rang voisin, jamais plus grand que le chiffre disponible : le piège reste positif.
  const voisin = w === 1 ? 10 : w / 10;
  return { w, nom, digit, k, n, res, quoi, voisin, op: minus ? '−' : '+' };
}

const etapes = (q: ReturnType<typeof sansRetenue>) => [
  `Seul le chiffre des ${q.nom}s change : ${q.digit} ${q.op} ${q.k} = ${Math.floor(q.res / q.w) % 10}.`,
  `${ecrit(q.n)} ${q.op} ${q.quoi} = **${ecrit(q.res)}**.`,
];

const retenueNiveau1 = (rng: Rng): QuestionDraft => {
  const q = sansRetenue(rng, 2, false);
  return {
    prompt: `Combien font ${ecrit(q.n)} + ${q.quoi} ?`,
    ...choice(rng, ecrit(q.res), [
      { label: ecrit(q.n + q.k * 10), why: 'Tu as changé les dixièmes. Ajoute aux unités.' },
      { label: ecrit(q.n + q.k * 1000), why: 'Tu as changé les dizaines. Ajoute aux unités.' },
    ]),
    hint: 'Repère le chiffre juste avant la virgule.',
    steps: etapes(q),
    targetSeconds: 15,
  };
};

const retenueNiveau2 = (rng: Rng): QuestionDraft => {
  const q = sansRetenue(rng, rng.int(3, 4), false);
  const autre = q.w === 10 ? 1 : 10;
  return {
    prompt: `Combien font ${ecrit(q.n)} + ${q.quoi} ?`,
    ...choice(rng, ecrit(q.res), [
      { label: ecrit(q.n + q.k * autre), why: `Ce n’est pas le bon rang : on ajoute des ${q.nom}s.` },
      { label: ecrit(q.n + q.k * 100), why: `Tu as ajouté des unités, pas des ${q.nom}s.` },
      { label: ecrit(q.n + q.k * 1000), why: `Tu as ajouté des dizaines, pas des ${q.nom}s.` },
    ]),
    hint: 'Après la virgule : dixièmes, puis centièmes.',
    steps: etapes(q),
    targetSeconds: 20,
  };
};

const retenueNiveau3 = (rng: Rng): QuestionDraft => {
  const q = sansRetenue(rng, rng.int(0, 4), rng.int(0, 1) === 0);
  const sens = q.op === '+' ? 1 : -1;
  const inverse = q.n - sens * q.k * q.w;
  const contraire = sens > 0 ? 'Il fallait ajouter, pas soustraire.' : 'Il fallait soustraire, pas ajouter.';
  return {
    prompt: `Calcule ${ecrit(q.n)} ${q.op} ${q.quoi}.`,
    answer: num(dec(q.res, 2)),
    traps: traps(dec(q.res, 2), [
      [dec(q.n + sens * q.k * q.voisin, 2), `Ce n’est pas le bon rang : vise les ${q.nom}s.`],
      // L'opération contraire n'est proposée comme erreur que si elle reste positive.
      ...(inverse < 0 ? [] : [[dec(inverse, 2), contraire] as const]),
    ]),
    hint: `Un seul chiffre change : celui des ${q.nom}s.`,
    steps: etapes(q),
    targetSeconds: 20,
  };
};

const retenueNiveau4 = (rng: Rng): QuestionDraft => {
  const q = sansRetenue(rng, rng.int(0, 4), rng.int(0, 1) === 0);
  const ajout = q.k * q.w;
  return {
    prompt: `Quel nombre manque ? ${ecrit(q.n)} ${q.op} … = ${ecrit(q.res)}`,
    answer: num(dec(ajout, 2)),
    traps: traps(dec(ajout, 2), [
      [q.k, `Regarde le rang du chiffre qui change : combien vaut ${q.k} à cette place ?`],
      [dec(q.res, 2), 'Ça, c’est le résultat. On cherche ce qui a changé.'],
      [dec(q.n + q.res, 2), 'On cherche l’écart entre les deux nombres.'],
    ]),
    hint: 'Compare les deux nombres chiffre par chiffre.',
    steps: [
      `Seul le chiffre des ${q.nom}s change : il manque ${q.quoi}.`,
      `Le nombre manquant est **${ecrit(ajout)}**.`,
    ],
    targetSeconds: 35,
  };
};

const retenueNiveau5 = (rng: Rng): QuestionDraft => {
  const u = rng.int(1, 4);
  const t = rng.int(1, 4);
  const h = rng.int(2, 8);
  const [a, b] = [rng.int(1, 5), rng.int(1, 9 - t)];
  const start = u * 100 + t * 10 + h;
  const res = start + a * 100 + b * 10;
  return {
    prompt: `${rng.pick(NAMES)} remplit un seau : il contient ${ecrit(start)} L. On ajoute ${a} L, puis ${b} dixième${b > 1 ? 's' : ''} de litre. Quelle quantité d’eau y a-t-il, en litres ?`,
    answer: num(dec(res, 2), 'L'),
    traps: traps(dec(res, 2), [
      [dec(start + a * 100 + b, 2), 'Les dixièmes sont juste après la virgule, pas au 2e rang.'],
      [dec(start + a * 100, 2), 'Il reste à ajouter les dixièmes.'],
      [dec(start + (a + b) * 100, 2), 'Les dixièmes ne sont pas des litres entiers.'],
    ]),
    hint: 'Ajoute les litres aux unités, puis les dixièmes aux dixièmes.',
    steps: [
      `${ecrit(start)} + ${a} = ${ecrit(start + a * 100)}.`,
      `${ecrit(start + a * 100)} + ${ecrit(b * 10)} = **${ecrit(res)} L**.`,
    ],
    targetSeconds: 50,
  };
};

/** Notion nouvelle du chapitre (version 1), à ajouter après les notions existantes. */
export function sansRetenueCm1({ S, id }: Contexte): Skill {
  const s = S(
    id('ajouter-sans-retenue'),
    'Ajouter ou soustraire sans retenue',
    'Ajouter ou soustraire un nombre entier inférieur à 10, d’unités, de dizaines, de centaines, de dixièmes ou de centièmes à un nombre décimal, lorsqu’il n’y a pas de retenue',
    [
      'Regarde le rang : ajouter 3 **dixièmes**, c’est changer seulement le **chiffre** des dixièmes.',
      '45,62 + 3 dixièmes = 45,92. Les autres chiffres ne bougent pas.',
    ],
    parNiveau([retenueNiveau1, retenueNiveau2, retenueNiveau3, retenueNiveau4, retenueNiveau5]),
    { mental: true },
  );
  return { ...s, levels: 5, lesson: { ...s.lesson, sources: ['maths-cycle3-2025'] } };
}
