import { choice, distinct, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { big, NAMES } from '../kit.ts';
import type { Contexte } from './contexte.ts';
import { cinqNiveaux, parNiveau } from './niveaux.ts';
import { inWords } from './outils.ts';

/**
 * « Les nombres entiers » au CM1, 5 niveaux (lot ma-cm1-n01). Programme du cycle 3 (17 avril 2025) :
 * nombres s'écrivant avec au plus six chiffres (≤ 999 999) ; seuls les critères de divisibilité par 2,
 * 5 et 10 sont au programme, le reste passe par les tables.
 */

/** Rangs d'un nombre, des unités aux centaines de mille. */
const RANGS = [
  'unités',
  'dizaines',
  'centaines',
  'unités de mille',
  'dizaines de mille',
  'centaines de mille',
] as const;
const rang = (p: number) => RANGS[p] ?? RANGS[0];
/** « 1 centaine », « 3 centaines ». */
const compte = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`;
/** « des centaines ». */
const des = (p: number) => `des ${rang(p)}`;

/** `count` chiffres de 1 à 9, tous différents. */
const chiffres = (rng: Rng, count: number) => rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, count);
const nombre = (digits: readonly number[]) => Number(digits.join(''));
/** Chiffre au rang `p` (0 = unités). */
const chiffreAu = (n: number, p: number) => Math.floor(n / 10 ** p) % 10;

/** Mélange jusqu'à ce que les éléments ne soient pas déjà dans l'ordre demandé. */
function aRanger<T>(rng: Rng, items: readonly T[], key: (t: T) => number): { items: T[]; correct: number[] } {
  for (;;) {
    const shown = rng.shuffle([...items]);
    const correct = shown
      .map((t, i) => ({ k: key(t), i }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.i);
    if (correct.some((c, i) => c !== i)) return { items: shown, correct };
  }
}

// ——— Lire et écrire les grands nombres ———

const lireNiveau1 = (rng: Rng): QuestionDraft => {
  const [m = 1, c = 2, d = 3, u = 4] = chiffres(rng, 4);
  const n = nombre([m, c, d, u]);
  return {
    prompt: `Comment s’écrit ${big(n)} en lettres ?`,
    ...choice(rng, inWords(n), [
      { label: inWords(nombre([m, d, c, u])), why: 'Tu as échangé les centaines et les dizaines.' },
      { label: inWords(nombre([u, c, d, m])), why: 'Lis de gauche à droite : le premier chiffre donne les milliers.' },
    ]),
    hint: 'Lis d’abord les milliers, puis les centaines, les dizaines et les unités.',
    steps: [
      `${big(n)} = ${compte(m, 'millier')} + ${compte(c, 'centaine')} + ${compte(d, 'dizaine')} + ${compte(u, 'unité')}.`,
      `On écrit **${inWords(n)}**.`,
    ],
    targetSeconds: 25,
  };
};

const lireNiveau2 = (rng: Rng): QuestionDraft => {
  const a = rng.int(12, 999);
  const [t = 1, u = 2] = chiffres(rng, 2);
  const b = t * 10 + u;
  const n = a * 1000 + b;
  return {
    prompt: `Quel nombre s’écrit « ${inWords(n)} » ?`,
    ...choice(rng, big(n), [
      { label: big(Number(`${a}${b}`)), why: 'Après « mille », il faut toujours 3 chiffres : ajoute le 0 qui manque.' },
      { label: big(a * 1000 + b * 10), why: 'Le 0 est au rang des centaines, pas à celui des unités.' },
      { label: big(a * 1000 + u * 10 + t), why: 'Tu as échangé les dizaines et les unités.' },
    ]),
    hint: 'Écris les milliers, puis exactement 3 chiffres.',
    steps: [`Avant « mille » : ${a}. Après : ${b}, écrit avec 3 chiffres : 0${b}.`, `On obtient **${big(n)}**.`],
    targetSeconds: 25,
  };
};

const lireNiveau3 = (rng: Rng): QuestionDraft => {
  const a = nombre(chiffres(rng, rng.int(2, 3)));
  const b = nombre(chiffres(rng, 3));
  const n = a * 1000 + b;
  return {
    prompt: `Écris en chiffres : « ${inWords(n)} ».`,
    answer: num(n),
    traps: traps(r(n), [
      [b * 1000 + a, 'Tu as inversé les deux tranches : ce qui est avant « mille » s’écrit en premier.'],
      [a * 1000 + Math.floor(b / 10), 'Il manque un chiffre après les milliers : il en faut 3.'],
    ]),
    hint: 'Écris le nombre de milliers, puis la suite avec 3 chiffres.',
    steps: [`Milliers : ${a}. Reste : ${b}.`, `On colle les deux tranches : **${big(n)}**.`],
    targetSeconds: 35,
  };
};

const lireNiveau4 = (rng: Rng): QuestionDraft => {
  const a = rng.int(1, 9) * 100 + rng.int(0, 1) * rng.int(1, 9);
  const b = rng.int(1, 99);
  const n = a * 1000 + b;
  return {
    prompt: `Attention aux zéros ! Écris en chiffres : « ${inWords(n)} ».`,
    answer: num(n),
    traps: traps(r(n), [
      [Number(`${a}${b}`), 'Il manque des zéros : après les milliers, il faut toujours 3 chiffres.'],
      [a * 1000 + b * 10, 'Les zéros se placent avant ces chiffres, pas après.'],
    ]),
    hint: 'Chaque rang vide se remplace par un 0.',
    steps: [
      `Milliers : ${a}. Après les milliers : ${b}, écrit ${String(b).padStart(3, '0')}.`,
      `On obtient **${big(n)}**.`,
    ],
    targetSeconds: 35,
  };
};

const lireNiveau5 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const n = rng.int(10, 998) * 1000 + 999;
    return {
      prompt: `À l’entrée du parc, la voix annonce : « Visiteur numéro ${inWords(n)} ! » Écris en chiffres le numéro du visiteur suivant.`,
      answer: num(n + 1),
      traps: traps(r(n + 1), [
        [n, 'C’est le numéro annoncé : le suivant compte 1 de plus.'],
        [n - 999, 'Quand on dépasse 999, on ajoute aussi 1 millier.'],
      ]),
      hint: 'Écris d’abord le nombre annoncé, puis ajoute 1.',
      steps: [
        `La voix dit ${big(n)}.`,
        `Après 999 unités, on passe au millier suivant : ${big(n)} + 1 = **${big(n + 1)}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const k = rng.int(10, 98) * 10 + 9;
  const u = rng.int(1, 999);
  const n = k * 1000 + u;
  return {
    prompt: `Une ville compte ${inWords(n)} habitants. Mille personnes de plus s’y installent. Écris en chiffres le nouveau nombre d’habitants.`,
    answer: num(n + 1000),
    traps: traps(r(n + 1000), [
      [n, 'N’oublie pas les mille nouveaux habitants.'],
      [n + 100, 'Mille, c’est 1 au rang des unités de mille, pas au rang des centaines.'],
    ]),
    hint: 'Écris le nombre de départ, puis ajoute 1 au rang des milliers.',
    steps: [`Au départ : ${big(n)}.`, `${big(n)} + 1 000 = **${big(n + 1000)}**.`],
    targetSeconds: 60,
  };
};

// ——— Valeur d’un chiffre ———

const valeurNiveau1 = (rng: Rng): QuestionDraft => {
  const digits = chiffres(rng, 4);
  const n = nombre(digits);
  const p = rng.int(0, 3);
  const good = chiffreAu(n, p);
  const others = rng.shuffle([0, 1, 2, 3].filter((q) => q !== p)).slice(0, 2);
  return {
    prompt: `Dans ${big(n)}, quel est le chiffre ${des(p)} ?`,
    ...choice(
      rng,
      String(good),
      others.map((q) => ({ label: String(chiffreAu(n, q)), why: `Ça, c’est le chiffre ${des(q)}.` })),
    ),
    hint: 'Pars de la droite : unités, dizaines, centaines, puis unités de mille.',
    steps: [`De droite à gauche : unités, dizaines, centaines, milliers.`, `Le chiffre ${des(p)} est **${good}**.`],
    targetSeconds: 15,
  };
};

const valeurNiveau2 = (rng: Rng): QuestionDraft => {
  const n = nombre(chiffres(rng, 6));
  const p = rng.int(2, 4);
  const d = chiffreAu(n, p);
  const v = d * 10 ** p;
  return {
    prompt: `Dans ${big(n)}, quelle est la valeur du chiffre ${d} ?`,
    ...choice(rng, big(v), [
      { label: String(d), why: `${d} est le chiffre : ici, il vaut plus, car il est au rang ${des(p)}.` },
      { label: big(v * 10), why: `Un zéro de trop : le ${d} est au rang ${des(p)}.` },
      { label: big(v / 10), why: `Il manque un zéro : le ${d} est au rang ${des(p)}.` },
    ]),
    hint: `Cherche le rang du ${d}, en partant de la droite.`,
    steps: [`Le ${d} est au rang ${des(p)}.`, `${d} × ${big(10 ** p)} = **${big(v)}**.`],
    targetSeconds: 20,
  };
};

const valeurNiveau3 = (rng: Rng): QuestionDraft => {
  const n = nombre(chiffres(rng, rng.int(5, 6)));
  const p = rng.int(1, String(n).length - 1);
  const d = chiffreAu(n, p);
  const v = d * 10 ** p;
  return {
    prompt: `Combien vaut le chiffre ${d} dans le nombre ${big(n)} ? Écris sa valeur.`,
    answer: num(v),
    traps: traps(r(v), [
      [d, `${d} est le chiffre seul : sa valeur dépend de sa place.`],
      [v * 10, 'Un zéro de trop : compte les chiffres placés à droite.'],
      [v / 10, 'Il manque un zéro : compte les chiffres placés à droite.'],
    ]),
    hint: `Compte les chiffres à droite du ${d} : c’est le nombre de zéros.`,
    steps: [`Le ${d} est au rang ${des(p)}.`, `Il vaut ${d} × ${big(10 ** p)} = **${big(v)}**.`],
    targetSeconds: 25,
  };
};

const valeurNiveau4 = (rng: Rng): QuestionDraft => {
  const digits = chiffres(rng, 6);
  digits[rng.int(1, 5)] = 0;
  const n = nombre(digits);
  const p = rng.int(1, 4);
  const old = chiffreAu(n, p);
  const next = rng.pick([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== old));
  const res = n + (next - old) * 10 ** p;
  const wrongRank = n + (next - chiffreAu(n, p - 1)) * 10 ** (p - 1);
  return {
    prompt: `Dans ${big(n)}, remplace le chiffre ${des(p)} par ${next}. Quel nombre obtiens-tu ?`,
    answer: num(res),
    traps: traps(r(res), [
      [wrongRank, `Tu as changé le chiffre ${des(p - 1)}, pas celui ${des(p)}.`],
      [n + next * 10 ** p, 'Remplacer, ce n’est pas ajouter : l’ancien chiffre disparaît.'],
    ]),
    hint: `Repère le rang ${des(p)} en partant de la droite. Les autres chiffres ne bougent pas.`,
    steps: [`Le chiffre ${des(p)} est ${old}.`, `On met ${next} à sa place, sans toucher au reste : **${big(res)}**.`],
    targetSeconds: 35,
  };
};

const valeurNiveau5 = (rng: Rng): QuestionDraft => {
  const n = rng.int(100_000, 899_999);
  const k = rng.int(2, 8);
  const j = rng.int(2, 9);
  const res = n + k * 10_000 + j * 100;
  const who = rng.pick(NAMES);
  return {
    prompt: `${who} a ${big(n)} points dans un jeu. Bonus : ${k} jetons de 10 000 points et ${j} jetons de 100 points. Quel est son nouveau score ?`,
    answer: num(res),
    traps: traps(r(res), [
      [n + k * 1000 + j * 100, `Un jeton de 10 000 change le rang des dizaines de mille, pas des unités de mille.`],
      [n + k * 10_000, `Tu as oublié les ${j} jetons de 100.`],
      [n + k + j, 'Chaque jeton vaut beaucoup plus qu’un point.'],
    ]),
    hint: 'Calcule la valeur de chaque sorte de jetons, puis ajoute rang par rang.',
    steps: [
      `${k} jetons de 10 000 = ${big(k * 10_000)} ; ${j} jetons de 100 = ${j * 100}.`,
      `${big(n)} + ${big(k * 10_000)} + ${j * 100} = **${big(res)}**.`,
    ],
    targetSeconds: 60,
  };
};

// ——— Comparer et ranger ———

const comparerNiveau1 = (rng: Rng): QuestionDraft => {
  const small = rng.int(1000, 9999);
  const large = rng.int(10_000, 99_999);
  const swap = rng.int(0, 1) === 1;
  const [a, b] = swap ? [large, small] : [small, large];
  const sign = a < b ? '<' : '>';
  const why = 'Compte les chiffres : le nombre qui en a le plus est le plus grand.';
  return {
    prompt: `Quel signe faut-il ? ${big(a)} … ${big(b)}`,
    ...choice(
      rng,
      sign,
      [
        { label: sign === '<' ? '>' : '<', why },
        { label: '=', why: 'Ces deux nombres ne sont pas égaux : ils n’ont pas autant de chiffres.' },
      ],
      true,
    ),
    hint: 'Compte les chiffres de chaque nombre.',
    steps: [why, `${big(a)} **${sign}** ${big(b)}.`],
    targetSeconds: 15,
  };
};

const comparerNiveau2 = (rng: Rng): QuestionDraft => {
  const head = rng.int(10, 99);
  const tails = distinct(rng, 4, () => nombre(chiffres(rng, 3)));
  const values = tails.map((t) => head * 1000 + t);
  const max = Math.max(...values);
  return {
    prompt: `Quel est le plus grand nombre : ${values.map(big).join(' ; ')} ?`,
    ...choice(
      rng,
      big(max),
      values
        .filter((v) => v !== max)
        .map((v) => ({ label: big(v), why: `Compare de gauche à droite : ${big(max)} est plus grand.` })),
    ),
    hint: 'Les milliers sont égaux : regarde les centaines.',
    steps: ['Même nombre de chiffres : on compare de gauche à droite.', `Le plus grand est **${big(max)}**.`],
    targetSeconds: 30,
  };
};

const comparerNiveau3 = (rng: Rng): QuestionDraft => {
  const [x = 1, y = 2, z = 3] = chiffres(rng, 3);
  const head = rng.int(1, 9) * 10_000;
  const values = [
    head + x * 1000 + y * 100 + z,
    head + y * 1000 + x * 100 + z,
    head + x * 1000 + z * 100 + y,
    head + z * 1000 + y * 100 + x,
  ];
  const { items, correct } = aRanger(rng, values, (v) => v);
  return {
    prompt: `Range dans l’ordre croissant (du plus petit au plus grand) : ${items.map(big).join(' ; ')}.`,
    answer: { kind: 'order', items: items.map(big), correct },
    hint: 'Compare d’abord les unités de mille, puis les centaines.',
    steps: [
      'On compare chiffre par chiffre depuis la gauche.',
      `**${[...values]
        .sort((a, b) => a - b)
        .map(big)
        .join(' < ')}**.`,
    ],
    targetSeconds: 45,
  };
};

const comparerNiveau4 = (rng: Rng): QuestionDraft => {
  const step = rng.pick([1000, 10_000]);
  let n = rng.int(100_001, 989_999);
  while (n % step === 0) n++;
  const low = Math.floor(n / step) * step;
  const high = low + step;
  const accepted = (v: number) => ({ mode: 'text' as const, accepted: [String(v), big(v)] });
  return {
    prompt: `Encadre ${big(n)} entre les deux multiples de ${big(step)} les plus proches.`,
    answer: { kind: 'cloze', parts: ['', ` < ${big(n)} < `, ''], blanks: [accepted(low), accepted(high)] },
    hint: `Garde les chiffres à gauche et mets des zéros : tu as le nombre d’en dessous. Puis ajoute ${big(step)}.`,
    steps: [
      `En dessous : ${big(low)}. Au-dessus : ${big(low)} + ${big(step)} = ${big(high)}.`,
      `**${big(low)} < ${big(n)} < ${big(high)}**.`,
    ],
    targetSeconds: 50,
  };
};

const STADES = ['des Pins', 'du Lac', 'des Tilleuls', 'du Moulin'];

const comparerNiveau5 = (rng: Rng): QuestionDraft => {
  const head = rng.int(11, 98);
  const [x = 1, y = 2, z = 3] = chiffres(rng, 3);
  const values = rng.shuffle([
    head * 1000 + x * 100 + y * 10 + z,
    head * 1000 + y * 100 + x * 10 + z,
    head * 1000 + x * 100 + z * 10 + y,
    (head + 1) * 1000 + rng.int(0, 99),
  ]);
  const stades = STADES.map((name, i) => ({ name: `Stade ${name}`, v: values[i] ?? 0 }));
  const { items, correct } = aRanger(rng, stades, (s) => -s.v);
  return {
    prompt:
      'Voici les spectateurs de la saison. Range les stades, de celui qui en a accueilli le plus à celui qui en a accueilli le moins.',
    figure: { kind: 'table', header: true, rows: stades.map((s) => [s.name, `${big(s.v)} spectateurs`]) },
    answer: { kind: 'order', items: items.map((s) => s.name), correct },
    hint: 'Ordre décroissant : cherche d’abord le plus grand nombre, en comparant de gauche à droite.',
    steps: [
      'On compare les nombres chiffre par chiffre depuis la gauche.',
      `**${correct.map((i) => `${items[i]?.name} (${big(items[i]?.v ?? 0)})`).join(', puis ')}**.`,
    ],
    targetSeconds: 70,
  };
};

// ——— Demi-droite graduée ———

/** Droite de 10 intervalles égaux, de `start` à `start + 10 × step`. */
const droite = (start: number, step: number, labels: readonly number[], points: { name: string; at: number }[]) => ({
  kind: 'numberLine' as const,
  min: start,
  max: start + 10 * step,
  subdivisions: 1 / step,
  labels: labels.map((i) => start + i * step),
  points,
});

const droiteSimple = (rng: Rng, level: 1 | 2): QuestionDraft => {
  const step = level === 1 ? 10 : 100;
  const start = rng.int(1, 9) * step * 10;
  const k = rng.int(2, 9);
  const at = start + k * step;
  const wrong = [
    { label: big(start + k), why: `Chaque petit trait vaut ${step}, pas 1.` },
    { label: big(at + step), why: 'Tu as compté un trait de trop : compte les intervalles, pas le trait de départ.' },
    { label: big(at - step), why: 'Il manque un trait : compte les intervalles jusqu’à A.' },
  ];
  return {
    prompt: `Chaque petit trait avance de ${step}. Quel nombre est au point A ?`,
    figure: droite(start, step, [0, 10], [{ name: 'A', at }]),
    ...choice(rng, big(at), level === 1 ? wrong.slice(0, 2) : wrong),
    hint: `Pars de ${big(start)} et avance de ${step} à chaque trait.`,
    steps: [`A est ${k} traits après ${big(start)}.`, `${big(start)} + ${k} × ${step} = **${big(at)}**.`],
    targetSeconds: 20,
  };
};

const droiteNiveau3 = (rng: Rng): QuestionDraft => {
  const step = rng.pick([100, 1000, 10_000]);
  const start = rng.int(1, 8) * step * 10;
  const k = rng.int(2, 9);
  const at = start + k * step;
  return {
    prompt: 'Les 10 intervalles de cette demi-droite sont égaux. Quel nombre repère le point A ?',
    figure: droite(start, step, [0, 10], [{ name: 'A', at }]),
    answer: num(at),
    traps: traps(r(at), [
      [start + k, 'Un intervalle vaut plus que 1 : partage l’écart entre les deux nombres écrits en 10.'],
      [k * step, `La droite ne commence pas à 0 : ajoute ${big(start)}.`],
    ]),
    hint: 'Calcule l’écart entre les deux nombres écrits, puis partage-le en 10.',
    steps: [
      `Écart : ${big(10 * step)}. Un intervalle vaut ${big(10 * step)} ÷ 10 = ${big(step)}.`,
      `${big(start)} + ${k} × ${big(step)} = **${big(at)}**.`,
    ],
    targetSeconds: 35,
  };
};

const droiteNiveau4 = (rng: Rng): QuestionDraft => {
  const step = rng.pick([20, 50, 200, 500, 2000, 5000]);
  const start = rng.int(1, 9) * step * 10;
  const k = rng.pick([0, 1, 3, 4, 5, 6, 8, 9, 10]);
  const at = start + k * step;
  const [first, second] = [start + 2 * step, start + 7 * step];
  return {
    prompt: 'Les traits sont réguliers. Trouve combien vaut un intervalle, puis le nombre au point A.',
    figure: droite(start, step, [2, 7], [{ name: 'A', at }]),
    answer: num(at),
    traps: traps(r(at), [
      [first + k * step, `Le point A se compte depuis le premier trait, pas depuis ${big(first)}.`],
      [first + (k - 2), `Un intervalle ne vaut pas 1 : il y en a 5 entre ${big(first)} et ${big(second)}.`],
    ]),
    hint: `Compte les intervalles entre ${big(first)} et ${big(second)}.`,
    steps: [
      `De ${big(first)} à ${big(second)}, il y a 5 intervalles : ${big(5 * step)} ÷ 5 = ${big(step)} chacun.`,
      `A est ${Math.abs(k - 2)} intervalle${Math.abs(k - 2) > 1 ? 's' : ''} ${k < 2 ? 'avant' : 'après'} ${big(first)} : **${big(at)}**.`,
    ],
    targetSeconds: 50,
  };
};

const droiteNiveau5 = (rng: Rng): QuestionDraft => {
  const step = rng.pick([100, 200, 500]);
  const a = rng.int(1, 4);
  const b = rng.int(a + 3, 9);
  const res = (b - a) * step;
  return {
    prompt: `La demi-droite montre un parcours, en mètres, depuis le départ. A est le point d’eau et B est la cabane. Quelle distance sépare A et B, en mètres ?`,
    figure: droite(
      0,
      step,
      [0, 5],
      [
        { name: 'A', at: a * step },
        { name: 'B', at: b * step },
      ],
    ),
    answer: num(res, 'm'),
    traps: traps(r(res), [
      [b - a, 'Tu as compté les intervalles : chacun mesure plusieurs mètres.'],
      [b * step, 'C’est la distance du départ à B. Retire la partie avant A.'],
    ]),
    hint: 'Trouve la longueur d’un intervalle grâce aux deux nombres écrits.',
    steps: [
      `5 intervalles font ${big(5 * step)} m : un intervalle vaut ${step} m.`,
      `A est à ${big(a * step)} m et B à ${big(b * step)} m.`,
      `${big(b * step)} − ${big(a * step)} = **${big(res)} m**.`,
    ],
    targetSeconds: 70,
  };
};

// ——— Multiples et diviseurs ———

const CRITERE: Readonly<Record<number, string>> = {
  2: 'Un multiple de 2 se termine par 0, 2, 4, 6 ou 8.',
  5: 'Un multiple de 5 se termine par 0 ou 5.',
  10: 'Un multiple de 10 se termine par 0.',
};

const multiplesNiveau1 = (rng: Rng): QuestionDraft => {
  const k = rng.pick([2, 5, 10]);
  const good = k * rng.int(21, 190);
  const base = rng.int(10, 90) * 10;
  const bad = k === 2 ? [base + 3, base + 7] : k === 5 ? [base + 2, base + 8] : [base + 5, base + 4];
  const why = (v: number) => `${v} se termine par ${v % 10}. ${CRITERE[k]}`;
  return {
    prompt: `Quel nombre est un multiple de ${k} ?`,
    ...choice(
      rng,
      String(good),
      bad.map((v) => ({ label: String(v), why: why(v) })),
    ),
    hint: 'Regarde le chiffre des unités.',
    steps: [CRITERE[k] ?? '', `La bonne réponse est **${good}**.`],
    targetSeconds: 15,
  };
};

const diviseursDe = (n: number) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((d) => n % d === 0);
const COMPOSES = [18, 24, 28, 30, 36, 40, 42, 48, 54, 56, 60, 63, 72, 80];

const multiplesNiveau2 = (rng: Rng): QuestionDraft => {
  const n = rng.pick(COMPOSES);
  const good = rng.pick(diviseursDe(n).filter((d) => d > 2));
  const bad = rng.shuffle([3, 4, 5, 6, 7, 8, 9, 10].filter((d) => n % d !== 0)).slice(0, 3);
  return {
    prompt: `Quel nombre est un diviseur de ${n} ?`,
    ...choice(
      rng,
      String(good),
      bad.map((d) => ({
        label: String(d),
        why: `${n} ÷ ${d} ne tombe pas juste : ${n} = ${d} × ${Math.floor(n / d)} + ${n % d}.`,
      })),
    ),
    hint: `Cherche dans quelle table on trouve ${n}.`,
    steps: [`${n} = ${good} × ${n / good}, sans reste.`, `**${good}** est un diviseur de ${n}.`],
    targetSeconds: 25,
  };
};

const multiplesNiveau3 = (rng: Rng): QuestionDraft => {
  const k = rng.int(3, 9);
  const q = rng.int(3, 12);
  const x = k * q + rng.int(1, k - 1);
  const res = k * (q + 1);
  return {
    prompt: `Écris le plus petit multiple de ${k} qui est plus grand que ${x}.`,
    answer: num(res),
    traps: traps(r(res), [
      [k * q, `${k * q} est plus petit que ${x}.`],
      [x + k, `${x + k} n’est pas dans la table de ${k}.`],
      [res + k, 'Il y en a un plus petit.'],
    ]),
    hint: `Récite la table de ${k} jusqu’à dépasser ${x}.`,
    steps: [`${k} × ${q} = ${k * q} : encore trop petit.`, `${k} × ${q + 1} = **${res}**.`],
    targetSeconds: 25,
  };
};

const multiplesNiveau4 = (rng: Rng): QuestionDraft => {
  const n = rng.pick([...COMPOSES, 12, 14, 15, 16, 20, 21, 32, 35, 45, 50, 64, 70, 90]);
  const list = diviseursDe(n);
  return {
    prompt: `Parmi les nombres de 1 à 10, combien sont des diviseurs de ${n} ?`,
    answer: num(list.length),
    traps: traps(r(list.length), [
      [list.length - 1, 'Vérifie que tu as bien compté 1 : il divise tous les nombres entiers.'],
      [list.length + 1, 'Un nombre de trop : chaque division doit tomber juste.'],
    ]),
    hint: `Essaie les nombres un par un : ${n} est-il dans leur table ?`,
    steps: [`Les diviseurs de ${n} jusqu’à 10 : ${list.join(', ')}.`, `Il y en a **${list.length}**.`],
    targetSeconds: 60,
  };
};

const multiplesNiveau5 = (rng: Rng): QuestionDraft => {
  const k = rng.int(4, 9);
  const q = rng.int(5, 12);
  const rest = rng.int(1, k - 1);
  const n = k * q + rest;
  const who = rng.pick(NAMES);
  if (rng.int(0, 1) === 0) {
    const res = k - rest;
    return {
      prompt: `${who} a ${n} cartes et les range par paquets de ${k}. Combien de cartes faut-il ajouter, au minimum, pour que tous les paquets soient complets ?`,
      answer: num(res),
      traps: traps(r(res), [
        [rest, `${rest} est le nombre de cartes en trop, pas le nombre à ajouter.`],
        [q + 1, 'C’est le nombre de paquets, pas le nombre de cartes à ajouter.'],
      ]),
      hint: `Cherche le multiple de ${k} juste après ${n}.`,
      steps: [
        `${k} × ${q + 1} = ${k * (q + 1)} est le multiple de ${k} juste après ${n}.`,
        `${k * (q + 1)} − ${n} = **${res}**.`,
      ],
      targetSeconds: 60,
    };
  }
  return {
    prompt: `${who} partage ${n} billes en sachets de ${k}. Combien de billes restent hors des sachets complets ?`,
    answer: num(rest),
    traps: traps(r(rest), [
      [q, 'C’est le nombre de sachets complets, pas les billes qui restent.'],
      [k - rest, 'Ça, c’est ce qui manque pour remplir un sachet de plus.'],
    ]),
    hint: `Cherche le multiple de ${k} juste avant ${n}.`,
    steps: [`${k} × ${q} = ${k * q} est le multiple de ${k} juste avant ${n}.`, `${n} − ${k * q} = **${rest}**.`],
    targetSeconds: 60,
  };
};

/** Les cinq notions du chapitre, avec les identifiants d'origine. */
export function nombresCm1({ S, id }: Contexte): readonly Skill[] {
  const N = cinqNiveaux(S);
  return [
    N(
      id('lire-nombres'),
      'Lire et écrire les grands nombres',
      'Connaître la suite écrite et la suite orale des nombres jusqu’à 999 999',
      [
        'Coupe le nombre en deux tranches depuis la droite : les milliers, puis 3 **chiffres**.',
        '« Quarante-mille-six » s’écrit 40 006 : chaque rang vide prend un 0.',
      ],
      parNiveau([lireNiveau1, lireNiveau2, lireNiveau3, lireNiveau4, lireNiveau5]),
    ),
    N(
      id('valeur-chiffre'),
      'Valeur d’un chiffre',
      'Connaître la valeur des chiffres en fonction de leur position dans un nombre',
      [
        'La place d’un **chiffre** change sa valeur : dans 254 708, le 4 vaut 4 000.',
        'De droite à gauche : unités, dizaines, centaines, unités de mille, dizaines de mille, centaines de mille.',
      ],
      parNiveau([valeurNiveau1, valeurNiveau2, valeurNiveau3, valeurNiveau4, valeurNiveau5]),
      { mental: true },
    ),
    N(
      id('comparer-entiers'),
      'Comparer et ranger des nombres',
      'Comparer, encadrer, intercaler des nombres entiers en utilisant les symboles =, < et > » ; « Ordonner des nombres dans l’ordre croissant ou décroissant',
      [
        'Le nombre qui a le plus de **chiffres** est le plus grand. À égalité, compare depuis la gauche.',
        '**Ordre croissant** : du plus petit au plus grand. 980 < 1 020 : le signe s’ouvre vers le plus grand.',
      ],
      parNiveau([comparerNiveau1, comparerNiveau2, comparerNiveau3, comparerNiveau4, comparerNiveau5]),
      { mental: true },
    ),
    N(
      id('demi-droite'),
      'Repérer un nombre sur une demi-droite graduée',
      'Savoir placer des nombres et repérer des points sur une demi-droite graduée',
      [
        'Sur une **demi-droite graduée**, les traits sont réguliers : trouve d’abord combien vaut un intervalle.',
        'De 200 à 300 avec 10 intervalles : chacun vaut 10.',
      ],
      parNiveau([
        (rng) => droiteSimple(rng, 1),
        (rng) => droiteSimple(rng, 2),
        droiteNiveau3,
        droiteNiveau4,
        droiteNiveau5,
      ]),
    ),
    N(
      id('multiples'),
      'Multiples et diviseurs',
      'Savoir déterminer si un nombre entier donné est un multiple d’un nombre entier inférieur ou égal à 10 » ; « Savoir déterminer si un nombre entier inférieur ou égal à 10 est un diviseur d’un nombre entier donné',
      [
        '63 = 7 × 9 : 63 est un **multiple** de 7, et 7 est un **diviseur** de 63.',
        'Astuce : un multiple de 2 finit par 0, 2, 4, 6, 8 ; de 5 par 0 ou 5 ; de 10 par 0.',
      ],
      parNiveau([multiplesNiveau1, multiplesNiveau2, multiplesNiveau3, multiplesNiveau4, multiplesNiveau5]),
      { mental: true },
    ),
  ];
}
