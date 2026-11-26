import { choice, distinct, fraction, num, traps } from '../../build.ts';
import { r, rawFrac } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { Figure, QuestionDraft, Skill } from '../../types.ts';
import { NAMES } from '../kit.ts';
import type { Contexte } from './contexte.ts';
import { cinqNiveaux, parNiveau } from './niveaux.ts';

/**
 * « Les fractions » au CM1, 5 niveaux (lot ma-cm1-n01). Programme du cycle 3 (17 avril 2025) :
 * dénominateurs ≤ 20 ; comme opérateur, au CM1, seules les fractions unitaires (« un tiers de 12 billes »).
 */

/** Noms des parts, au pluriel, par dénominateur. */
const PARTS: Readonly<Record<number, string>> = {
  3: 'tiers',
  4: 'quarts',
  5: 'cinquièmes',
  6: 'sixièmes',
  7: 'septièmes',
  8: 'huitièmes',
  9: 'neuvièmes',
  10: 'dixièmes',
  11: 'onzièmes',
  12: 'douzièmes',
};
const MOTS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze'];

const s = (n: number) => (n > 1 ? 's' : '');

/** Bande partagée en `d` cases égales, `n` cases pleines (formes, pas seulement des couleurs). */
const bande = (n: number, d: number) => Array.from({ length: d }, (_, i) => (i < n ? '■' : '□'));
const figureBande = (n: number, d: number): Figure => ({ kind: 'table', header: false, rows: [bande(n, d)] });

// ——— Lire et représenter ———

const lireNiveau1 = (rng: Rng): QuestionDraft => {
  const d = rng.int(3, 8);
  const n = rng.int(1, d - 1);
  return {
    prompt: 'La bande est partagée en parts égales. Quelle fraction de la bande est pleine (■) ?',
    figure: figureBande(n, d),
    ...choice(rng, rawFrac(n, d), [
      { label: rawFrac(n, d - n), why: 'En bas, on écrit le nombre de parts en tout, pas seulement les parts vides.' },
      { label: rawFrac(d, n), why: 'C’est à l’envers : les parts prises vont en haut.' },
    ]),
    hint: 'Compte toutes les cases, puis les cases pleines.',
    steps: [`${d} parts égales en tout, ${n} pleine${s(n)}.`, `La fraction est **${rawFrac(n, d)}**.`],
    targetSeconds: 15,
  };
};

const lireNiveau2 = (rng: Rng): QuestionDraft => {
  const d = rng.int(3, 12);
  const n = rng.int(2, d - 1);
  return {
    prompt: `Quelle fraction se lit « ${MOTS[n]} ${PARTS[d]} » ?`,
    ...choice(rng, rawFrac(n, d), [
      { label: rawFrac(d, n), why: `« ${PARTS[d]} » donne le nombre du bas, pas celui du haut.` },
      { label: rawFrac(n, d + n), why: `Le nombre du bas est donné par « ${PARTS[d]} » : c’est ${d}.` },
      { label: rawFrac(n - 1, d), why: `On a pris ${MOTS[n]} parts : le nombre du haut est ${n}.` },
    ]),
    hint: 'Le premier mot donne le nombre du haut, le second le nombre du bas.',
    steps: [`« ${MOTS[n]} » : ${n} en haut. « ${PARTS[d]} » : ${d} en bas.`, `C’est **${rawFrac(n, d)}**.`],
    targetSeconds: 20,
  };
};

const lireNiveau3 = (rng: Rng): QuestionDraft => {
  const d = rng.int(5, 12);
  const n = rng.int(1, d - 1);
  const what = rng.pick(['une pizza', 'une tarte', 'un gâteau', 'un ruban']);
  return {
    prompt: `On partage ${what} en ${d} parts égales. Tu en prends ${n}. Écris la fraction que tu as prise.`,
    answer: fraction(r(n, d)),
    traps: traps(r(n, d), [
      [r(d, n), 'Le nombre de parts en tout va en bas.'],
      [r(n, d - n), 'En bas : toutes les parts, même celles que tu as prises.'],
    ]),
    hint: 'En bas : les parts en tout. En haut : les parts prises.',
    steps: [`${d} parts égales : dénominateur ${d}. ${n} prise${s(n)} : numérateur ${n}.`, `**${rawFrac(n, d)}**.`],
    targetSeconds: 25,
  };
};

const lireNiveau4 = (rng: Rng): QuestionDraft => {
  const d = rng.int(13, 20);
  const n = rng.int(2, d - 2);
  const rest = d - n;
  return {
    prompt: `Un mur a ${d} carreaux de même taille. ${n} carreaux sont peints. Écris la fraction du mur qui n’est PAS peinte.`,
    answer: fraction(r(rest, d)),
    traps: traps(r(rest, d), [
      [r(n, d), 'Ça, c’est la partie peinte.'],
      [r(rest, n), `En bas : tous les carreaux du mur, soit ${d}.`],
    ]),
    hint: 'Commence par compter les carreaux non peints.',
    steps: [`Non peints : ${d} − ${n} = ${rest} carreaux sur ${d}.`, `**${rawFrac(rest, d)}**.`],
    targetSeconds: 35,
  };
};

const lireNiveau5 = (rng: Rng): QuestionDraft => {
  const rows = rng.int(2, 4);
  const cols = rng.int(3, Math.floor(20 / rows));
  const d = rows * cols;
  const a = rng.int(1, Math.floor(d / 2) - 1);
  const b = rng.int(1, Math.floor(d / 2) - 1);
  const rest = d - a - b;
  const [x, y] = distinct(rng, 2, () => rng.pick(NAMES));
  return {
    prompt: `Une tablette a ${rows} rangées de ${cols} carrés égaux. ${x} en mange ${a}, ${y} en mange ${b}. Quelle fraction de la tablette reste-t-il ?`,
    answer: fraction(r(rest, d)),
    traps: traps(r(rest, d), [
      [r(a + b, d), 'Ça, c’est la partie mangée.'],
      [r(rest, rows + cols), `La tablette compte ${rows} × ${cols} carrés, pas ${rows} + ${cols}.`],
    ]),
    hint: 'Combien de carrés en tout ? Combien en reste-t-il ?',
    steps: [
      `En tout : ${rows} × ${cols} = ${d} carrés.`,
      `Il reste ${d} − ${a} − ${b} = ${rest} carré${s(rest)} : **${rawFrac(rest, d)}**.`,
    ],
    targetSeconds: 70,
  };
};

// ——— Fraction plus grande que 1 ———

const grandeNiveau1 = (rng: Rng): QuestionDraft => {
  const d = rng.int(3, 9);
  const good = rawFrac(d + rng.int(1, d - 1), d);
  return {
    prompt: 'Quelle fraction est plus grande que 1 ?',
    ...choice(rng, good, [
      { label: rawFrac(rng.int(1, d - 1), d), why: 'Le nombre du haut est plus petit que celui du bas : moins de 1.' },
      { label: rawFrac(d, d), why: `Avec ${d} parts sur ${d}, on a exactement 1, pas plus.` },
    ]),
    hint: `1, c’est toutes les parts : ${rawFrac(d, d)}. Qui en prend davantage ?`,
    steps: [`${rawFrac(d, d)} = 1.`, `**${good}** a plus de ${d} parts : elle dépasse 1.`],
    targetSeconds: 15,
  };
};

const grandeNiveau2 = (rng: Rng): QuestionDraft => {
  const d = rng.int(4, 9);
  const e = rng.int(1, 3);
  const rest = rng.pick(Array.from({ length: d - 1 }, (_, i) => i + 1).filter((x) => x !== e));
  const n = e * d + rest;
  const other = rest === 1 ? 2 : rest - 1;
  const good = `${e} + ${rawFrac(rest, d)}`;
  return {
    prompt: `${rawFrac(n, d)} est égale à…`,
    ...choice(rng, good, [
      { label: `${e + 1} + ${rawFrac(rest, d)}`, why: `${e + 1} unités demandent ${(e + 1) * d} parts : trop.` },
      { label: `${e} + ${rawFrac(other, d)}`, why: `Après ${e * d} parts, il en reste ${rest}, pas ${other}.` },
      { label: `${rest} + ${rawFrac(e, d)}`, why: 'Tu as échangé le nombre d’unités et les parts qui restent.' },
    ]),
    hint: `Combien de fois ${d} tient dans ${n} ?`,
    steps: [`${n} = ${e} × ${d} + ${rest}.`, `${rawFrac(n, d)} = **${good}**.`],
    targetSeconds: 25,
  };
};

const grandeNiveau3 = (rng: Rng): QuestionDraft => {
  const d = rng.int(2, 10);
  const e = rng.int(2, 4);
  const rest = rng.int(1, d - 1);
  const n = e * d + rest;
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `Complète : ${rawFrac(n, d)} = … + ${rawFrac(rest, d)}. Quel est l’entier ?`,
      answer: num(e),
      traps: traps(r(e), [
        [n - rest, `${n - rest} est un nombre de parts. Regroupe-les par ${d} pour trouver les unités.`],
        [n, `${n} est le numérateur, pas le nombre d’unités.`],
      ]),
      hint: `Combien de fois ${d} tient dans ${n} ?`,
      steps: [`${n} = ${d} × ${e} + ${rest}.`, `${rawFrac(n, d)} = **${e}** + ${rawFrac(rest, d)}.`],
      targetSeconds: 25,
    };
  }
  return {
    prompt: `Écris ${e} + ${rawFrac(rest, d)} avec une seule fraction.`,
    answer: fraction(r(n, d)),
    traps: traps(r(n, d), [
      [r(e + rest, d), `${e} unités, ce sont ${e * d} parts, pas ${e}.`],
      [r(e * rest, d), 'On ajoute les parts, on ne les multiplie pas.'],
    ]),
    hint: `Transforme ${e} en parts : combien de parts dans ${e} unités ?`,
    steps: [`${e} = ${rawFrac(e * d, d)}.`, `${rawFrac(e * d, d)} + ${rawFrac(rest, d)} = **${rawFrac(n, d)}**.`],
    targetSeconds: 30,
  };
};

const grandeNiveau4 = (rng: Rng): QuestionDraft => {
  const d = rng.int(11, 20);
  const e = rng.int(2, 5);
  const rest = rng.int(1, d - 1);
  const n = e * d + rest;
  const trou = (v: number) => ({ mode: 'text' as const, accepted: [String(v)] });
  return {
    prompt: `Écris ${rawFrac(n, d)} comme un entier plus une fraction plus petite que 1.`,
    answer: {
      kind: 'cloze',
      parts: ['Entier : ', ` ; numérateur de la fraction (dénominateur ${d}) : `, ''],
      blanks: [trou(e), trou(rest)],
    },
    hint: `Combien de paquets de ${d} parts peux-tu faire avec ${n} parts ?`,
    steps: [`${n} = ${d} × ${e} + ${rest}.`, `${rawFrac(n, d)} = **${e} + ${rawFrac(rest, d)}**.`],
    targetSeconds: 50,
  };
};

const grandeNiveau5 = (rng: Rng): QuestionDraft => {
  const d = rng.pick([4, 6, 8, 10]);
  const e = rng.int(2, 4);
  const rest = rng.int(1, d - 1);
  const n = e * d + rest;
  const who = rng.pick(NAMES);
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `Au goûter de ${who}, chaque tarte est coupée en ${d} parts égales. On mange ${e} tartes entières et ${rest} part${s(rest)}. Quelle fraction de tarte a-t-on mangée ?`,
      answer: fraction(r(n, d)),
      traps: traps(r(n, d), [
        [r(e + rest, d), `Une tarte entière compte ${d} parts, pas 1.`],
        [r(rest, d), `Tu as oublié les ${e} tartes entières.`],
      ]),
      hint: `Compte toutes les parts mangées. Une tarte entière, c’est ${d} parts.`,
      steps: [
        `${e} tartes = ${e} × ${d} = ${e * d} parts. Avec ${rest} de plus : ${n} parts.`,
        `Chaque part est ${rawFrac(1, d)} de tarte : **${rawFrac(n, d)}**.`,
      ],
      targetSeconds: 60,
    };
  }
  return {
    prompt: `${who} verse ${rawFrac(n, d)} L de sirop dans des bouteilles de 1 L. Combien de bouteilles sont remplies à ras bord ?`,
    answer: num(e),
    traps: traps(r(e), [
      [e + 1, 'La dernière bouteille n’est pas pleine.'],
      [n, `${n} compte les parts de ${rawFrac(1, d)} L, pas les bouteilles.`],
    ]),
    hint: `Combien de ${rawFrac(1, d)} L faut-il pour remplir 1 L ?`,
    steps: [
      `1 L = ${rawFrac(d, d)} L. ${rawFrac(n, d)} = ${e} + ${rawFrac(rest, d)}.`,
      `Les bouteilles pleines : **${e}**.`,
    ],
    targetSeconds: 60,
  };
};

// ——— Comparer des fractions ———

const comparerNiveau1 = (rng: Rng): QuestionDraft => {
  const d = rng.int(4, 8);
  const [a = 1, b = 2] = distinct(rng, 2, () => rng.int(1, d - 1));
  const sign = a < b ? '<' : '>';
  const why = 'Les parts ont la même taille : compte combien on en prend.';
  return {
    prompt: `Les bandes A et B ont la même longueur. A montre ${rawFrac(a, d)}, B montre ${rawFrac(b, d)}. Compare : ${rawFrac(a, d)} … ${rawFrac(b, d)}`,
    figure: {
      kind: 'table',
      header: true,
      rows: [
        ['A', ...bande(a, d)],
        ['B', ...bande(b, d)],
      ],
    },
    ...choice(
      rng,
      sign,
      [
        { label: sign === '<' ? '>' : '<', why },
        { label: '=', why: 'Les deux bandes n’ont pas le même nombre de cases pleines.' },
      ],
      true,
    ),
    hint: 'Quelle bande a le plus de cases pleines ?',
    steps: [why, `${rawFrac(a, d)} **${sign}** ${rawFrac(b, d)}.`],
    targetSeconds: 15,
  };
};

const comparerNiveau2 = (rng: Rng): QuestionDraft => {
  const n = rng.int(1, 5);
  const dens = distinct(rng, 4, () => rng.int(n + 1, 20));
  const min = Math.min(...dens);
  return {
    prompt: `Quelle est la plus grande fraction : ${dens.map((d) => rawFrac(n, d)).join(' ; ')} ?`,
    ...choice(
      rng,
      rawFrac(n, min),
      dens
        .filter((d) => d !== min)
        .map((d) => ({
          label: rawFrac(n, d),
          why: `Partager en ${d} donne des parts plus petites que partager en ${min}.`,
        })),
    ),
    hint: 'Même nombre de parts : lesquelles sont les plus grosses ?',
    steps: ['Plus on partage l’unité, plus les parts sont petites.', `La plus grande est **${rawFrac(n, min)}**.`],
    targetSeconds: 30,
  };
};

const comparerNiveau3 = (rng: Rng): QuestionDraft => {
  const d = rng.int(4, 12);
  const nums = distinct(rng, 4, () => rng.int(1, 2 * d - 1));
  const sorted = [...nums].sort((a, b) => a - b);
  if (sorted.every((v, i) => v === nums[i])) nums.reverse();
  const correct = nums.map((_, i) => i).sort((i, j) => (nums[i] ?? 0) - (nums[j] ?? 0));
  const items = nums.map((n) => rawFrac(n, d));
  return {
    prompt: `Range dans l’ordre croissant : ${items.join(' ; ')}.`,
    answer: { kind: 'order', items, correct },
    hint: 'Même dénominateur : compare les numérateurs.',
    steps: [
      `Toutes les parts sont des ${rawFrac(1, d)} : on compare leur nombre.`,
      `**${correct.map((i) => rawFrac(nums[i] ?? 0, d)).join(' < ')}**.`,
    ],
    targetSeconds: 35,
  };
};

const comparerNiveau4 = (rng: Rng): QuestionDraft => {
  const d = rng.int(5, 20);
  const frac = (v: number) => ({ label: rawFrac(v, d), v });
  const items = [
    frac(rng.int(1, d - 1)),
    { label: '1', v: d },
    frac(d + rng.int(1, d - 1)),
    { label: '2', v: 2 * d },
    frac(2 * d + rng.int(1, d - 1)),
  ];
  let shown = rng.shuffle(items);
  while (shown.every((x, i) => i === 0 || (shown[i - 1]?.v ?? 0) < x.v)) shown = rng.shuffle(items);
  const correct = shown.map((_, i) => i).sort((i, j) => (shown[i]?.v ?? 0) - (shown[j]?.v ?? 0));
  const labels = shown.map((x) => x.label);
  return {
    prompt: `Range du plus petit au plus grand : ${labels.join(' ; ')}.`,
    answer: { kind: 'order', items: labels, correct },
    hint: `Écris 1 et 2 avec le même dénominateur : ${rawFrac(d, d)} et ${rawFrac(2 * d, d)}.`,
    steps: [
      `1 = ${rawFrac(d, d)} et 2 = ${rawFrac(2 * d, d)}.`,
      `**${correct.map((i) => shown[i]?.label).join(' < ')}**.`,
    ],
    targetSeconds: 60,
  };
};

const comparerNiveau5 = (rng: Rng): QuestionDraft => {
  const names = distinct(rng, 3, () => rng.pick(NAMES));
  const same = rng.int(0, 1) === 0;
  const d = rng.int(7, 12);
  const values = distinct(rng, 3, () => (same ? rng.int(1, d - 1) : rng.int(2, 10)));
  const parts = values.map((v) => (same ? rawFrac(v, d) : rawFrac(1, v)));
  // Plus grande part d'abord : numérateur le plus grand, ou dénominateur le plus petit.
  const size = (i: number) => (same ? (values[i] ?? 0) : -(values[i] ?? 0));
  const base = [0, 1, 2];
  const wanted = [...base].sort((i, j) => size(j) - size(i));
  const shown = wanted.every((w, i) => w === i) ? [1, 0, 2] : base;
  const correct = [0, 1, 2].sort((i, j) => size(shown[j] ?? 0) - size(shown[i] ?? 0));
  const phrases = base.map((i) => `${names[i]} en mange ${parts[i]}`).join(', ');
  return {
    prompt: `Trois tablettes de chocolat identiques. ${phrases}. Range les enfants, de celui qui mange le plus à celui qui mange le moins.`,
    answer: { kind: 'order', items: shown.map((i) => names[i] ?? ''), correct },
    hint: same
      ? 'Les parts ont la même taille : qui en prend le plus ?'
      : 'Chacun prend une seule part : qui a la plus grosse ?',
    steps: [
      same
        ? 'Même dénominateur : le plus grand numérateur donne la plus grande part.'
        : 'Même numérateur : le plus petit dénominateur donne la plus grande part.',
      `**${wanted.map((i) => `${names[i]} (${parts[i]})`).join(', puis ')}**.`,
    ],
    targetSeconds: 70,
  };
};

// ——— Additionner et soustraire ———

const addNiveau1 = (rng: Rng): QuestionDraft => {
  const d = rng.int(4, 9);
  const a = rng.int(1, d - 2);
  const b = rng.int(1, d - a - 1);
  return {
    prompt: `${rawFrac(a, d)} + ${rawFrac(b, d)} = ?`,
    ...choice(rng, rawFrac(a + b, d), [
      { label: rawFrac(a + b, 2 * d), why: `On garde le dénominateur ${d} : les parts ne changent pas de taille.` },
      { label: rawFrac(a + b + 1, d), why: `Recompte les parts : ${a} + ${b} = ${a + b}.` },
    ]),
    hint: `Ajoute les parts : des ${rawFrac(1, d)} plus des ${rawFrac(1, d)}.`,
    steps: [`${a} + ${b} = ${a + b} parts, de même taille.`, `**${rawFrac(a + b, d)}**.`],
    targetSeconds: 15,
  };
};

const addNiveau2 = (rng: Rng): QuestionDraft => {
  const d = rng.int(5, 12);
  const minus = rng.int(0, 1) === 0;
  const a = rng.int(3, d - 1);
  const b = rng.int(1, a - 1);
  const res = minus ? a - b : a + b;
  const other = minus ? a + b : a - b;
  const op = minus ? '−' : '+';
  return {
    prompt: `Quel est le résultat de ${rawFrac(a, d)} ${op} ${rawFrac(b, d)} ?`,
    ...choice(rng, rawFrac(res, d), [
      {
        label: rawFrac(other, d),
        why: `Regarde le signe : ici, c’est ${minus ? 'une soustraction' : 'une addition'}.`,
      },
      { label: rawFrac(res, 2 * d), why: `Le dénominateur reste ${d} : on ne l’ajoute pas.` },
      { label: rawFrac(res + 1, d), why: 'Recompte les parts avec les numérateurs.' },
    ]),
    hint: 'Calcule avec les numérateurs et garde le dénominateur.',
    steps: [`${a} ${op} ${b} = ${res}, et on garde ${d}.`, `**${rawFrac(res, d)}**.`],
    targetSeconds: 20,
  };
};

const addNiveau3 = (rng: Rng): QuestionDraft => {
  const d = rng.int(5, 12);
  const a = rng.int(2, 2 * d - 1);
  const b = rng.int(1, d - 1);
  const minus = a > b && rng.int(0, 1) === 0;
  const res = minus ? a - b : a + b;
  const op = minus ? '−' : '+';
  return {
    prompt: `Calcule ${rawFrac(a, d)} ${op} ${rawFrac(b, d)}.`,
    answer: fraction(r(res, d)),
    traps: traps(r(res, d), [
      [r(res, 2 * d), `On garde le dénominateur ${d} : on ne l’ajoute pas.`],
      [r(Math.abs(minus ? a + b : a - b), d), `Regarde bien le signe ${op}.`],
    ]),
    hint: 'Même dénominateur : calcule avec les numérateurs.',
    steps: [`${a} ${op} ${b} = ${res}, et on garde ${d}.`, `**${rawFrac(res, d)}**.`],
    targetSeconds: 25,
  };
};

const addNiveau4 = (rng: Rng): QuestionDraft => {
  const d = rng.int(11, 20);
  const a = rng.int(2, d - 2);
  if (rng.int(0, 1) === 0) {
    const c = rng.int(a + 1, 2 * d - 1);
    const res = c - a;
    return {
      prompt: `Complète : ${rawFrac(a, d)} + … = ${rawFrac(c, d)}. Les deux fractions ont ${d} pour dénominateur. Écris le numérateur qui manque.`,
      answer: num(res),
      traps: traps(r(res), [
        [c + a, 'Il faut chercher ce qui manque : soustrais au lieu d’ajouter.'],
        [c, `${c} est le numérateur du total : une partie est déjà là.`],
      ]),
      hint: `De ${a} à ${c}, combien de parts faut-il ajouter ?`,
      steps: [`On cherche ce qui manque : ${c} − ${a} = ${res}.`, `Le numérateur est **${res}**.`],
      targetSeconds: 35,
    };
  }
  const res = d - a;
  return {
    prompt: `Calcule 1 − ${rawFrac(a, d)}.`,
    answer: fraction(r(res, d)),
    traps: traps(r(res, d), [
      [r(a - 1, d), `1 vaut ${rawFrac(d, d)} : écris-le ainsi avant de soustraire.`],
      [r(d + a, d), 'C’est une soustraction : le résultat est plus petit que 1.'],
    ]),
    hint: `Écris 1 sous la forme d’une fraction de dénominateur ${d}.`,
    steps: [`1 = ${rawFrac(d, d)}.`, `${rawFrac(d, d)} − ${rawFrac(a, d)} = **${rawFrac(res, d)}**.`],
    targetSeconds: 35,
  };
};

const addNiveau5 = (rng: Rng): QuestionDraft => {
  const d = rng.pick([8, 10, 12]);
  const litres = rng.int(1, 2);
  const a = rng.int(2, Math.floor(d / 2));
  const b = rng.int(1, Math.floor(d / 2) - 1);
  const res = litres * d - a - b;
  const who = rng.pick(NAMES);
  return {
    prompt: `${who} a ${litres} L de jus. Le matin, on en boit ${rawFrac(a, d)} L. À midi, on en boit ${rawFrac(b, d)} L. Quelle quantité de jus reste-t-il, en litres ?`,
    answer: fraction(r(res, d)),
    traps: traps(r(res, d), [
      [r(a + b, d), 'Ça, c’est ce qui a été bu.'],
      [r(litres * d - a, d), 'Tu as oublié le jus bu à midi.'],
    ]),
    hint: `Écris ${litres} L avec le dénominateur ${d}, puis retire ce qui est bu.`,
    steps: [
      `Bu : ${rawFrac(a, d)} + ${rawFrac(b, d)} = ${rawFrac(a + b, d)} L.`,
      `${litres} L = ${rawFrac(litres * d, d)} L.`,
      `${rawFrac(litres * d, d)} − ${rawFrac(a + b, d)} = **${rawFrac(res, d)} L**.`,
    ],
    targetSeconds: 70,
  };
};

// ——— Fraction d'une quantité (fractions unitaires) ———

const NOMS_UNITAIRES: Readonly<Record<number, string>> = {
  2: 'La moitié',
  3: 'Un tiers',
  4: 'Un quart',
  5: 'Un cinquième',
  10: 'Un dixième',
};

const quantiteQcm = (rng: Rng, level: 1 | 2): QuestionDraft => {
  const d = rng.pick(level === 1 ? [2, 3, 4] : [3, 4, 5, 10]);
  const part = rng.int(level === 1 ? 2 : 5, level === 1 ? 5 : 12);
  const total = d * part;
  const what = rng.pick(['billes', 'images', 'perles', 'bonbons']);
  const wrong = [
    { label: String(total - d), why: `On ne retire pas ${d} : on partage en ${d} parts égales.` },
    { label: String(d), why: `${d} est le nombre de parts, pas ce qu’il y a dans une part.` },
    { label: String(total - part), why: 'Ça, c’est tout le reste : on ne garde qu’une part.' },
    { label: String(total), why: 'Ça, c’est la quantité entière : on n’en prend qu’une part.' },
    { label: String(part + 1), why: `Vérifie : ${d} parts de ${part + 1} dépassent ${total}.` },
  ].filter((w, i, all) => w.label !== String(part) && all.findIndex((x) => x.label === w.label) === i);
  const nom = NOMS_UNITAIRES[d] ?? rawFrac(1, d);
  return {
    prompt: `${nom} de ${total} ${what}, ça fait combien de ${what} ?`,
    ...choice(rng, String(part), wrong.slice(0, level + 1)),
    hint: `Partage les ${total} ${what} en ${d} tas égaux.`,
    steps: [`On partage en ${d} : ${total} ÷ ${d} = ${part}.`, `**${part}** ${what}.`],
    targetSeconds: 20,
  };
};

const quantiteNiveau3 = (rng: Rng): QuestionDraft => {
  const d = rng.int(3, 10);
  const part = rng.int(3, 12);
  const total = d * part;
  return {
    prompt: `Combien font ${rawFrac(1, d)} de ${total} ?`,
    answer: num(part),
    traps: traps(r(part), [
      [total - part, 'Tu as calculé ce qui reste.'],
      [total * d, `On partage ${total} en ${d} : le résultat est plus petit.`],
      [total - d, `Prendre ${rawFrac(1, d)}, ce n’est pas retirer ${d}.`],
    ]),
    hint: `Partage ${total} en ${d} parts égales.`,
    steps: [`${total} ÷ ${d} = ${part}, car ${d} × ${part} = ${total}.`, `**${part}**.`],
    targetSeconds: 20,
  };
};

const GRANDEURS = [
  { quoi: 'Un parcours mesure', unit: 'm', mot: 'mètres' },
  { quoi: 'Un sac de farine pèse', unit: 'g', mot: 'grammes' },
  { quoi: 'Une cuve contient', unit: 'L', mot: 'litres' },
] as const;

const quantiteNiveau4 = (rng: Rng): QuestionDraft => {
  const d = rng.pick([4, 5, 8, 10, 20]);
  const part = rng.int(3, 12) * 5;
  const total = d * part;
  const g = rng.pick(GRANDEURS);
  return {
    prompt: `${g.quoi} ${total} ${g.unit}. Combien font ${rawFrac(1, d)} de cette quantité, en ${g.mot} ?`,
    answer: num(part, g.unit),
    traps: traps(r(part), [
      [total - part, 'Tu as trouvé tout le reste, pas une seule part.'],
      [total - d, `On ne retire pas ${d} : on partage en ${d}.`],
    ]),
    hint: `Partage ${total} en ${d} parts égales.`,
    steps: [`${total} ÷ ${d} = ${part}.`, `**${part} ${g.unit}**.`],
    targetSeconds: 35,
  };
};

const quantiteNiveau5 = (rng: Rng): QuestionDraft => {
  const [d = 3, e = 4] = distinct(rng, 2, () => rng.pick([2, 3, 4, 5]));
  const total = d * e * rng.int(2, 5);
  const [x, y, z] = distinct(rng, 3, () => rng.pick(NAMES));
  const [a, b] = [total / d, total / e];
  const res = total - a - b;
  return {
    prompt: `${x} a ${total} images et en donne ${rawFrac(1, d)} à ${y}, puis ${rawFrac(1, e)} à ${z}. Les deux fractions portent sur les ${total} images. Combien d’images garde ${x} ?`,
    answer: num(res),
    traps: traps(r(res), [
      [a + b, 'Ça, ce sont les images données.'],
      [total - a, `N’oublie pas les images données à ${z}.`],
    ]),
    hint: 'Calcule chaque cadeau, puis retire les deux du total.',
    steps: [
      `${rawFrac(1, d)} de ${total} = ${a} et ${rawFrac(1, e)} de ${total} = ${b}.`,
      `${total} − ${a} − ${b} = **${res}**.`,
    ],
    targetSeconds: 70,
  };
};

/** Les cinq notions du chapitre, avec les identifiants d'origine. */
export function fractionsCm1({ S, id }: Contexte): readonly Skill[] {
  const N = cinqNiveaux(S);
  return [
    N(
      id('lire-fraction'),
      'Lire et représenter une fraction',
      'Savoir interpréter, représenter, écrire et lire des fractions',
      [
        'Dans la **fraction** {3/8}, le **dénominateur** 8 dit en combien de parts égales on coupe.',
        'Le **numérateur** 3 dit combien on en prend : on lit « trois huitièmes ».',
      ],
      parNiveau([lireNiveau1, lireNiveau2, lireNiveau3, lireNiveau4, lireNiveau5]),
      { mental: true },
    ),
    N(
      id('fraction-entier'),
      'Fraction plus grande que 1',
      'Savoir écrire une fraction supérieure à 1 comme la somme d’un entier et d’une fraction inférieure à 1 » ; « Savoir écrire la somme d’un entier et d’une fraction inférieure à 1 comme une unique fraction',
      [
        'Si le **numérateur** dépasse le **dénominateur**, la **fraction** dépasse 1.',
        '{7/4} = {4/4} + {3/4} = 1 + {3/4}.',
      ],
      parNiveau([grandeNiveau1, grandeNiveau2, grandeNiveau3, grandeNiveau4, grandeNiveau5]),
      { mental: true },
    ),
    N(
      id('comparer-fractions'),
      'Comparer des fractions',
      'Comparer des fractions',
      [
        'Même **dénominateur** : le plus grand **numérateur** gagne ({5/8} > {3/8}).',
        'Même numérateur : le plus petit dénominateur gagne ({1/3} > {1/5}, des parts plus grosses).',
      ],
      parNiveau([comparerNiveau1, comparerNiveau2, comparerNiveau3, comparerNiveau4, comparerNiveau5]),
      { mental: true },
    ),
    N(
      id('additionner-fractions'),
      'Additionner et soustraire des fractions',
      'Additionner et soustraire des fractions',
      [
        'Même **dénominateur** : calcule avec les **numérateurs** et garde le dénominateur.',
        '{2/7} + {3/7} = {5/7} : des septièmes plus des septièmes.',
      ],
      parNiveau([addNiveau1, addNiveau2, addNiveau3, addNiveau4, addNiveau5]),
      { mental: true },
    ),
    N(
      id('fraction-quantite'),
      'Fraction d’une quantité',
      'Déterminer une fraction d’une quantité ou d’une grandeur',
      [
        'Un tiers de 12 billes : on partage 12 en 3 tas égaux, 12 ÷ 3 = 4 billes.',
        'Le **dénominateur** de la **fraction** donne le nombre de tas.',
      ],
      parNiveau([
        (rng) => quantiteQcm(rng, 1),
        (rng) => quantiteQcm(rng, 2),
        quantiteNiveau3,
        quantiteNiveau4,
        quantiteNiveau5,
      ]),
      { mental: true },
    ),
  ];
}
