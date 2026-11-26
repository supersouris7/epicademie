import { choice, distinct, num, traps } from '../../build.ts';
import { dec, fmt, r, rawFrac } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { NAMES } from '../kit.ts';
import type { Contexte } from './contexte.ts';
import { aRanger, associer, cinqNiveaux, parNiveau, signes } from './niveaux.ts';

/**
 * « Les nombres décimaux » au CM1, 5 niveaux (lot ma-cm1-n02). Programme du cycle 3 (17 avril 2025) :
 * les décimaux ne vont pas au-delà des centièmes (dénominateurs 10 et 100).
 */

/** Écriture d'un nombre donné en centièmes : 358 → « 3,58 ». */
const c = (centiemes: number) => fmt(dec(centiemes, 2));
/** Même nombre avec toujours deux chiffres après la virgule : 350 → « 3,50 ». */
const deuxChiffres = (centiemes: number) => (centiemes / 100).toFixed(2).replace('.', ',');
const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`;
/** `count` chiffres de 1 à 9, tous différents. */
const chiffres = (rng: Rng, count: number) => rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, count);
/** Réponses écrites acceptées pour un nombre donné en centièmes (virgule ou point, zéros inutiles). */
const ecritures = (centiemes: number) => {
  const forms = [c(centiemes), deuxChiffres(centiemes)];
  if (centiemes % 10 === 0) forms.push((centiemes / 100).toFixed(1).replace('.', ','));
  return { mode: 'text' as const, accepted: [...new Set(forms.flatMap((f) => [f, f.replace(',', '.')]))] };
};

// ——— Fractions décimales et virgule ———

const fractionNiveau1 = (rng: Rng): QuestionDraft => {
  const n = rng.int(2, 9);
  return {
    prompt: `Quel nombre à virgule est égal à ${rawFrac(n, 10)} ?`,
    ...choice(rng, c(n * 10), [
      { label: String(n * 10), why: `${rawFrac(n, 10)} est plus petit que 1 : ce ne peut pas être ${n * 10}.` },
      { label: c(n), why: `${c(n)}, ce sont des centièmes. Ici, on a des dixièmes.` },
    ]),
    hint: 'Un dixième s’écrit avec un seul chiffre après la virgule.',
    steps: [`${rawFrac(n, 10)}, c’est ${n} dixièmes.`, `${rawFrac(n, 10)} = **${c(n * 10)}**.`],
    targetSeconds: 15,
  };
};

const fractionNiveau2 = (rng: Rng): QuestionDraft => {
  const [a = 3, b = 7] = chiffres(rng, 2);
  const paires = [
    [rawFrac(a, 10), c(a * 10)],
    [rawFrac(a, 100), c(a)],
    [rawFrac(a * 10 + b, 10), c(a * 100 + b * 10)],
    [rawFrac(b, 100), c(b)],
  ] as const;
  return {
    prompt: `Associe chaque fraction à son écriture à virgule : ${paires.map((p) => p[0]).join(' ; ')}.`,
    answer: associer(rng, paires),
    traps: [],
    hint: 'Regarde le nombre du bas : 10 pour des dixièmes, 100 pour des centièmes.',
    steps: [
      'Sur 10 : un chiffre après la virgule. Sur 100 : deux chiffres après la virgule.',
      `**${paires.map(([f, v]) => `${f} = ${v}`).join(' ; ')}**.`,
    ],
    targetSeconds: 40,
  };
};

const fractionNiveau3 = (rng: Rng): QuestionDraft => {
  const u = rng.int(1, 50);
  const [t = 3, h = 7] = chiffres(rng, 2);
  const x = u * 100 + t * 10 + h;
  return {
    prompt: `Écris avec une virgule : ${u} + ${rawFrac(t, 10)} + ${rawFrac(h, 100)}.`,
    answer: num(dec(x, 2)),
    traps: traps(dec(x, 2), [
      [dec(u * 100 + h * 10 + t, 2), 'Les dixièmes viennent juste après la virgule, puis les centièmes.'],
      [dec((u + t + h) * 100, 2), 'Les dixièmes et les centièmes ne sont pas des unités : on ne les ajoute pas ainsi.'],
    ]),
    hint: 'Place les unités avant la virgule, puis les dixièmes, puis les centièmes.',
    steps: [`${pluriel(u, 'unité')}, ${pluriel(t, 'dixième')} et ${pluriel(h, 'centième')}.`, `On écrit **${c(x)}**.`],
    targetSeconds: 25,
  };
};

const fractionNiveau4 = (rng: Rng): QuestionDraft => {
  const u = rng.int(1, 40);
  const h = rng.int(1, 9);
  if (rng.int(0, 1) === 0) {
    const x = u * 100 + h;
    return {
      prompt: `Attention au piège ! Écris avec une virgule : ${u} + ${rawFrac(h, 100)}.`,
      answer: num(dec(x, 2)),
      traps: traps(dec(x, 2), [
        [dec(u * 100 + h * 10, 2), 'Tu as écrit des dixièmes. Il n’y en a pas : mets un 0 à leur place.'],
        [dec((u + h) * 100, 2), 'Des centièmes ne s’ajoutent pas aux unités comme des unités.'],
      ]),
      hint: 'Combien y a-t-il de dixièmes ici ? Garde leur place.',
      steps: [`${pluriel(u, 'unité')}, 0 dixième et ${pluriel(h, 'centième')}.`, `On écrit **${c(x)}**.`],
      targetSeconds: 30,
    };
  }
  const zeroTenth = rng.int(0, 1) === 0;
  const [t, k] = zeroTenth ? [0, h] : [h, 0];
  const x = u * 100 + t * 10 + k;
  const exact = (v: number) => ({ mode: 'text' as const, accepted: [String(v)] });
  return {
    prompt: `Décompose ${deuxChiffres(x)} chiffre par chiffre : combien d’unités, de dixièmes et de centièmes ?`,
    answer: {
      kind: 'cloze',
      parts: [`${deuxChiffres(x)} = `, ' unités + ', ' dixièmes + ', ' centièmes'],
      blanks: [exact(u), exact(t), exact(k)],
    },
    hint: 'Chaque rang a son chiffre. Un 0 compte aussi.',
    steps: [
      'Avant la virgule : les unités. Après : les dixièmes, puis les centièmes.',
      `**${pluriel(u, 'unité')}, ${pluriel(t, 'dixième')} et ${pluriel(k, 'centième')}**.`,
    ],
    targetSeconds: 35,
  };
};

const fractionNiveau5 = (rng: Rng): QuestionDraft => {
  const who = rng.pick(NAMES);
  const u = rng.int(1, 9);
  const t = rng.int(1, 8);
  const h = rng.int(11, 29);
  const x = u * 100 + t * 10 + h;
  return {
    prompt: `${who} colle bout à bout des rubans : ${u} m, puis ${rawFrac(t, 10)} m, puis ${rawFrac(h, 100)} m. Quelle longueur obtient-on, en mètres, avec une virgule ?`,
    answer: num(dec(x, 2), 'm'),
    traps: traps(dec(x, 2), [
      [
        dec(u * 1000 + t * 100 + h, 3),
        `${h} centièmes, c’est plus de 10 centièmes : on ne les écrit pas à la suite des dixièmes.`,
      ],
      [dec(u * 100 + t + h, 2), `${rawFrac(t, 10)} vaut ${t * 10} centièmes, pas ${t}.`],
    ]),
    hint: '10 centièmes font 1 dixième. Fais l’échange avant d’écrire.',
    steps: [
      `${h} centièmes = ${pluriel(Math.floor(h / 10), 'dixième')} et ${pluriel(h % 10, 'centième')}.`,
      `${u} + ${c(t * 10)} + ${c(h)} = ${c(x)}.`,
      `La longueur est **${c(x)} m**.`,
    ],
    targetSeconds: 60,
  };
};

// ——— Dixièmes, centièmes ———

const rangNiveau1 = (rng: Rng): QuestionDraft => {
  const [u = 1, t = 2, h = 3] = chiffres(rng, 3);
  const tenths = rng.int(0, 1) === 0;
  const [name, good] = tenths ? ['dixièmes', t] : ['centièmes', h];
  return {
    prompt: `Dans ${c(u * 100 + t * 10 + h)}, quel est le chiffre des **${name}** ?`,
    ...choice(rng, String(good), [
      { label: String(u), why: `${u} est avant la virgule : c’est le chiffre des unités.` },
      { label: String(tenths ? h : t), why: `Ça, c’est le chiffre des ${tenths ? 'centièmes' : 'dixièmes'}.` },
    ]),
    hint: 'Après la virgule : d’abord les dixièmes, ensuite les centièmes.',
    steps: [`Les ${name} sont au ${tenths ? '1er' : '2e'} rang après la virgule.`, `Le chiffre est **${good}**.`],
    targetSeconds: 12,
  };
};

const rangNiveau2 = (rng: Rng): QuestionDraft => {
  const k = rng.int(2, 9);
  const unit = rng.int(0, 1) === 0;
  const [from, to, good] = unit ? [pluriel(k, 'unité'), 'dixièmes', k * 10] : [`${k} dixièmes`, 'centièmes', k * 10];
  return {
    prompt: `${from}, c’est combien de ${to} ?`,
    ...choice(rng, String(good), [
      { label: String(k), why: `Les ${to} sont 10 fois plus petits : il en faut plus.` },
      { label: String(k * 100), why: 'Entre deux rangs voisins, on multiplie par 10, pas par 100.' },
      { label: String(k + 10), why: 'On ne rajoute pas 10 : chaque part en donne 10 plus petites.' },
    ]),
    hint: `Cherche d’abord combien de ${to} il y a dans ${unit ? 'une seule unité' : 'un seul dixième'}.`,
    steps: [`1 ${unit ? 'unité' : 'dixième'} = 10 ${to}.`, `${k} × 10 = **${good}** ${to}.`],
    targetSeconds: 20,
  };
};

const rangNiveau3 = (rng: Rng): QuestionDraft => {
  const [u = 1, t = 2, h = 3] = chiffres(rng, 3);
  const tenths = rng.int(0, 1) === 0;
  const x = tenths ? u * 100 + t * 10 : u * 100 + t * 10 + h;
  const good = tenths ? u * 10 + t : x;
  const name = tenths ? 'dixièmes' : 'centièmes';
  return {
    prompt: `Combien y a-t-il de ${name} **en tout** dans ${c(x)} ?`,
    answer: num(good),
    traps: traps(r(good), [
      [tenths ? t : h, `Ça, c’est seulement le chiffre des ${name}. Compte aussi ceux des unités.`],
      [
        tenths ? u * 100 + t : u * 10 + t,
        tenths ? 'Une unité contient 10 dixièmes.' : 'Là, tu as compté les dixièmes. On demande les centièmes.',
      ],
    ]),
    hint: `Compte d’abord les ${name} contenus dans les unités.`,
    steps: [
      `${pluriel(u, 'unité')} = ${u * (tenths ? 10 : 100)} ${name}.`,
      tenths ? `${u * 10} + ${t} = **${good}** dixièmes.` : `${u * 100} + ${t * 10} + ${h} = **${good}** centièmes.`,
    ],
    targetSeconds: 30,
  };
};

const rangNiveau4 = (rng: Rng): QuestionDraft => {
  const tenths = rng.int(0, 1) === 0;
  const n = tenths ? rng.int(11, 99) * 10 + rng.int(1, 9) : rng.int(1, 9) * 100 + rng.int(1, 9);
  const d = tenths ? 10 : 100;
  const name = tenths ? 'dixièmes' : 'centièmes';
  const value = r(n, d);
  return {
    prompt: `Quel nombre est égal à ${n} ${name} ? Écris-le avec une virgule.`,
    answer: num(value),
    traps: traps(value, [
      [r(n, d * 10), `Il faut ${d} ${name} pour faire 1 unité : la virgule est mal placée.`],
      [r(n, d / 10), `Ton nombre est 10 fois trop grand. Il faut ${d} ${name} pour faire 1.`],
    ]),
    hint: `Combien de paquets de ${d} ${name} peux-tu faire ?`,
    steps: [
      `${d} ${name} = 1 unité.`,
      `${n} ${name} = ${pluriel(Math.floor(n / d), 'unité')} et ${pluriel(n % d, tenths ? 'dixième' : 'centième')}.`,
      `C’est **${fmt(value)}**.`,
    ],
    targetSeconds: 35,
  };
};

const rangNiveau5 = (rng: Rng): QuestionDraft => {
  const [u = 1, t = 2, h = 3] = chiffres(rng, 3);
  const x = u * 100 + t * 10 + h;
  const good = u * 10 + t;
  const who = rng.pick(NAMES);
  return {
    prompt: `${who} a un fil de ${c(x)} m. Chaque bracelet utilise un dixième de mètre. Combien de bracelets complets peut-on faire ?`,
    answer: num(good),
    traps: traps(r(good), [
      [x, 'Ça, ce sont les centièmes de mètre. Un bracelet utilise un dixième de mètre.'],
      [t, 'N’oublie pas les mètres entiers : chacun contient 10 dixièmes.'],
      [good + 1, 'Le morceau qui reste est trop court pour un bracelet complet.'],
    ]),
    hint: 'Cherche combien de dixièmes entiers il y a dans la longueur du fil.',
    steps: [
      `${u} m = ${u * 10} dixièmes de mètre, plus ${pluriel(t, 'dixième')}.`,
      `Il reste ${pluriel(h, 'centième')} : pas assez pour un bracelet.`,
      `On fait **${good}** bracelets.`,
    ],
    targetSeconds: 60,
  };
};

// ——— Comparer des nombres décimaux ———

const WHY_ENTIERE = 'Compare d’abord les nombres avant la virgule.';

const comparerNiveau1 = (rng: Rng): QuestionDraft => {
  const [u = 1, v = 2] = distinct(rng, 2, () => rng.int(0, 30));
  const a = u * 100 + rng.int(1, 9) * 10;
  const b = v * 100 + rng.int(1, 9) * 10;
  const sign = a < b ? '<' : '>';
  return {
    prompt: `Quel signe faut-il ? ${c(a)} … ${c(b)}`,
    ...signes(sign, WHY_ENTIERE, 'Les nombres avant la virgule sont différents : ils ne sont pas égaux.'),
    hint: 'Regarde d’abord ce qui est avant la virgule.',
    steps: [`Avant la virgule : ${u} et ${v}.`, `${c(a)} **${sign}** ${c(b)}.`],
    targetSeconds: 15,
  };
};

const comparerNiveau2 = (rng: Rng): QuestionDraft => {
  const u = rng.int(1, 20);
  const t = rng.int(3, 9);
  const k = rng.int(1, 9);
  const best = u * 100 + t * 10;
  const others = [u * 100 + (t - 1) * 10 + k, u * 100 + t, u * 100 + (t - 2) * 10];
  return {
    prompt: `Quel est le plus grand nombre : ${rng
      .shuffle([best, ...others])
      .map(c)
      .join(' ; ')} ?`,
    ...choice(
      rng,
      c(best),
      others.map((v) => ({
        label: c(v),
        why: `${c(best)} a ${t} dixièmes ; ${c(v)} en a ${Math.floor(v / 10) % 10}. Le nombre de chiffres ne décide pas.`,
      })),
    ),
    hint: 'Les unités sont égales : compare les dixièmes.',
    steps: ['Même partie avant la virgule : on compare les dixièmes.', `Le plus grand est **${c(best)}**.`],
    targetSeconds: 25,
  };
};

const comparerNiveau3 = (rng: Rng): QuestionDraft => {
  const u = rng.int(0, 20);
  const [s = 2, t = 5] = chiffres(rng, 2).sort((a, b) => a - b);
  const values = [u * 100 + s, u * 100 + s * 10 + t, u * 100 + t * 10, (u + 1) * 100 + s];
  const { items, correct } = aRanger(rng, values, (v) => v);
  return {
    prompt: `Range du plus petit au plus grand : ${items.map(c).join(' ; ')}.`,
    answer: { kind: 'order', items: items.map(c), correct },
    hint: 'Écris tous les nombres avec deux chiffres après la virgule.',
    steps: [
      `On compare : ${values.map(deuxChiffres).join(' ; ')}.`,
      `**${[...values]
        .sort((a, b) => a - b)
        .map(c)
        .join(' < ')}**.`,
    ],
    targetSeconds: 45,
  };
};

const comparerNiveau4 = (rng: Rng): QuestionDraft => {
  const u = rng.int(0, 30);
  const t = rng.pick([0, 9, rng.int(1, 8)]);
  const x = u * 100 + t * 10 + rng.int(1, 9);
  const low = u * 100 + t * 10;
  const high = low + 10;
  return {
    prompt: `Encadre ${c(x)} entre les deux nombres les plus proches qui ont au plus un chiffre après la virgule.`,
    answer: { kind: 'cloze', parts: ['', ` < ${c(x)} < `, ''], blanks: [ecritures(low), ecritures(high)] },
    hint: 'Garde seulement les dixièmes pour le nombre d’en dessous. Puis ajoute un dixième.',
    steps: [
      `En dessous : ${c(low)}. Un dixième de plus : ${c(low)} + 0,1 = ${c(high)}.`,
      `**${c(low)} < ${c(x)} < ${c(high)}**.`,
    ],
    targetSeconds: 50,
  };
};

const comparerNiveau5 = (rng: Rng): QuestionDraft => {
  const u = rng.int(8, 15);
  const [s = 2, t = 5] = chiffres(rng, 2).sort((a, b) => a - b);
  const times = rng.shuffle([u * 100 + s, u * 100 + s * 10 + t, u * 100 + t * 10, (u - 1) * 100 + 90 + s]);
  const runners = distinct(rng, 4, () => rng.pick(NAMES)).map((name, i) => ({ name, v: times[i] ?? 0 }));
  const { items, correct } = aRanger(rng, runners, (x) => x.v);
  return {
    prompt: `Course : ${runners.map((x) => `${x.name} met ${c(x.v)} s`).join(', ')}. Range les enfants, du plus rapide au plus lent.`,
    figure: { kind: 'table', header: false, rows: runners.map((x) => [x.name, `${c(x.v)} s`]) },
    answer: { kind: 'order', items: items.map((x) => x.name), correct },
    hint: 'Le plus rapide a le temps le plus petit.',
    steps: [
      'Plus le temps est petit, plus on est rapide. On compare unités, dixièmes, puis centièmes.',
      `**${correct.map((i) => `${items[i]?.name} (${c(items[i]?.v ?? 0)} s)`).join(', puis ')}**.`,
    ],
    targetSeconds: 70,
  };
};

// ——— Partie entière et arrondi à l’unité ———

const entiereNiveau1 = (rng: Rng): QuestionDraft => {
  const [u = 1, t = 2] = chiffres(rng, 2);
  return {
    prompt: `Quelle est la **partie entière** de ${c(u * 100 + t * 10)} ?`,
    ...choice(rng, String(u), [
      { label: String(t), why: `${t} est après la virgule : ce sont les dixièmes.` },
      { label: `${u}${t}`, why: 'Tu as enlevé la virgule : le nombre a changé.' },
    ]),
    hint: 'Regarde ce qui est avant la virgule.',
    steps: ['La partie entière est le nombre écrit avant la virgule.', `C’est **${u}**.`],
    targetSeconds: 10,
  };
};

const entiereNiveau2 = (rng: Rng): QuestionDraft => {
  const lo = rng.int(10, 98);
  const t = rng.pick([1, 2, 3, 4, 6, 7, 8, 9]);
  const up = t >= 5;
  const good = up ? lo + 1 : lo;
  return {
    prompt: `Quel est l’**arrondi** à l’unité de ${c(lo * 100 + t * 10)} ?`,
    ...choice(rng, String(good), [
      { label: String(up ? lo : lo + 1), why: `Il y a ${pluriel(t, 'dixième')} : l’autre entier est plus proche.` },
      { label: String(up ? lo + 2 : lo - 1), why: 'Cet entier n’est pas un voisin direct du nombre.' },
      { label: String(lo * 10 + t), why: 'Tu as enlevé la virgule : arrondir donne un nombre proche.' },
    ]),
    hint: 'Entre les deux entiers voisins, lequel est le plus près ?',
    steps: [
      `Le nombre est entre ${lo} et ${lo + 1}, avec ${pluriel(t, 'dixième')}.`,
      `L’entier le plus proche est **${good}**.`,
    ],
    targetSeconds: 20,
  };
};

const entiereNiveau3 = (rng: Rng): QuestionDraft => {
  const lo = rng.int(1, 99);
  const t = rng.int(1, 9);
  const x = lo * 100 + t * 10;
  const good = t >= 5 ? lo + 1 : lo;
  return {
    prompt: `Arrondis ${c(x)} à l’unité.`,
    answer: num(good),
    traps: traps(r(good), [
      [
        t >= 5 ? lo : lo + 1,
        `Regarde les dixièmes : ${t}. ${t >= 5 ? 'À partir de 5, on monte.' : 'Sous 5, on garde.'}`,
      ],
      [lo * 10 + t, 'Ne supprime pas la virgule : l’arrondi reste proche du nombre.'],
    ]),
    hint: 'Regarde le chiffre des dixièmes : moins de 5, ou 5 et plus ?',
    steps: [`${c(x)} est entre ${lo} et ${lo + 1} ; chiffre des dixièmes : ${t}.`, `L’arrondi est **${good}**.`],
    targetSeconds: 20,
  };
};

const entiereNiveau4 = (rng: Rng): QuestionDraft => {
  const lo = rng.pick([0, 9, 19, 29, rng.int(1, 60)]);
  const t = rng.pick([0, 4, 5, 9]);
  const h = rng.int(t === 4 ? 5 : 1, 9);
  const x = lo * 100 + t * 10 + h;
  const good = t >= 5 ? lo + 1 : lo;
  return {
    prompt: `Quel entier est le plus proche de ${c(x)} ?`,
    answer: num(good),
    traps: traps(r(good), [
      [t >= 5 ? lo : lo + 1, `Les dixièmes décident ici : le chiffre des dixièmes est ${t}.`],
      [t * 10 + h, 'Ça, c’est ce qui est après la virgule.'],
    ]),
    hint: 'Compare ce nombre à la moitié entre ses deux entiers voisins.',
    steps: [
      `${c(x)} est entre ${lo} et ${lo + 1}. Le milieu est ${lo},5.`,
      `${c(x)} est ${t >= 5 ? 'après' : 'avant'} le milieu : l’entier le plus proche est **${good}**.`,
    ],
    targetSeconds: 35,
  };
};

const entiereNiveau5 = (rng: Rng): QuestionDraft => {
  const who = rng.pick(NAMES);
  const prix = () => {
    const e = rng.int(2, 19);
    const cents = rng.pick([5, 10, 20, 25, 75, 80, 90, 95]);
    return { e, v: e * 100 + cents, round: cents >= 50 ? e + 1 : e };
  };
  const [a, b] = [prix(), prix()];
  const good = a.round + b.round;
  return {
    prompt: `${who} achète un livre à ${deuxChiffres(a.v)} € et un jeu à ${deuxChiffres(b.v)} €. Arrondis chaque prix à l’unité, puis additionne. Quel total approché trouves-tu, en euros ?`,
    answer: num(good, '€'),
    traps: traps(r(good), [
      [a.e + b.e, 'Tu as gardé les parties entières : arrondis chaque prix à l’entier le plus proche.'],
      [a.e + b.e + 2, 'On ne monte pas toujours : regarde les dixièmes de chaque prix.'],
    ]),
    hint: 'Pour chaque prix, cherche l’euro entier le plus proche.',
    steps: [
      `${deuxChiffres(a.v)} € s’arrondit à ${a.round} € ; ${deuxChiffres(b.v)} € à ${b.round} €.`,
      `${a.round} + ${b.round} = **${good} €**.`,
    ],
    targetSeconds: 60,
  };
};

// ——— Décimaux sur une demi-droite graduée ———

/** Droite de `min` à `max` ; `parUnite` intervalles par unité. */
const droite = (
  min: number,
  max: number,
  parUnite: number,
  labels: number[],
  points: { name: string; at: number }[],
) => ({
  kind: 'numberLine' as const,
  min,
  max,
  subdivisions: parUnite,
  labels,
  points,
});

const droiteNiveau1 = (rng: Rng): QuestionDraft => {
  const u = rng.int(1, 8);
  const k = rng.int(2, 9);
  const at = u * 100 + k * 10;
  return {
    prompt: 'Chaque petit trait avance d’un dixième. Quel nombre est au point A ?',
    figure: droite(u, u + 1, 10, [u, u + 1], [{ name: 'A', at: at / 100 }]),
    ...choice(rng, c(at), [
      { label: String(u + k), why: 'Un petit trait vaut un dixième, pas 1.' },
      { label: c(u * 100 + k), why: 'Un petit trait vaut un dixième, pas un centième.' },
    ]),
    hint: `Pars de ${u} et compte les petits intervalles.`,
    steps: [`A est ${k} dixièmes après ${u}.`, `A est au nombre **${c(at)}**.`],
    targetSeconds: 20,
  };
};

const droiteNiveau2 = (rng: Rng): QuestionDraft => {
  const u = rng.int(1, 7);
  const k = rng.int(2, 9);
  const at = (u + 1) * 100 + k * 10;
  return {
    prompt: 'Entre deux entiers, il y a 10 intervalles égaux. Quel nombre est au point A ?',
    figure: droite(u, u + 2, 10, [u, u + 1, u + 2], [{ name: 'A', at: at / 100 }]),
    ...choice(rng, c(at), [
      { label: c(at - 100), why: `A est après ${u + 1}, pas entre ${u} et ${u + 1}.` },
      { label: c((u + 1) * 100 + k), why: 'Chaque intervalle vaut un dixième, pas un centième.' },
      { label: c(at + 10), why: 'Compte les intervalles, pas le trait de départ.' },
    ]),
    hint: 'Repère l’entier juste avant A, puis compte les intervalles.',
    steps: [`A est ${k} dixièmes après ${u + 1}.`, `A est au nombre **${c(at)}**.`],
    targetSeconds: 25,
  };
};

const droiteNiveau3 = (rng: Rng): QuestionDraft => {
  const u = rng.int(0, 28);
  const k = rng.int(1, 9);
  const at = u * 100 + k * 10;
  return {
    prompt: 'Les 10 intervalles sont égaux. Écris le nombre du point A avec une virgule.',
    figure: droite(u, u + 1, 10, [u, u + 1], [{ name: 'A', at: at / 100 }]),
    answer: num(dec(at, 2)),
    traps: traps(dec(at, 2), [
      [u + k, 'Un intervalle ne vaut pas 1 : l’unité est partagée en 10.'],
      [dec(u * 100 + k, 2), 'L’unité est partagée en 10 : ce sont des dixièmes.'],
    ]),
    hint: 'Trouve d’abord combien vaut un intervalle.',
    steps: [
      `De ${u} à ${u + 1}, il y a 10 intervalles : chacun vaut 0,1.`,
      `A est ${k} intervalle${k > 1 ? 's' : ''} après ${u} : **${c(at)}**.`,
    ],
    targetSeconds: 25,
  };
};

const droiteNiveau4 = (rng: Rng): QuestionDraft => {
  // Bornes dont l'écart, calculé en machine, permet de tracer les 10 intervalles.
  let t = rng.int(1, 98);
  while (Math.floor(((t + 1) / 10 - t / 10) * 100) !== 10) t = rng.int(1, 98);
  const [min, max] = [t / 10, (t + 1) / 10];
  const k = rng.int(1, 9);
  const at = t * 10 + k;
  return {
    prompt: 'Zoom ! Les 10 intervalles sont égaux. Quel nombre repère le point A ?',
    figure: droite(min, max, 100, [min, max], [{ name: 'A', at: at / 100 }]),
    answer: num(dec(at, 2)),
    traps: traps(dec(at, 2), [
      [dec(t * 10 + k * 10, 2), 'Entre ces deux nombres, un intervalle vaut un centième, pas un dixième.'],
      [dec(k, 2), `La droite ne commence pas à 0 : pars de ${c(t * 10)}.`],
    ]),
    hint: 'Calcule l’écart entre les deux nombres écrits, puis partage-le en 10.',
    steps: [
      `Entre ${c(t * 10)} et ${c(t * 10 + 10)}, il y a un dixième, partagé en 10 : chaque intervalle vaut 0,01.`,
      `A est ${k} centième${k > 1 ? 's' : ''} après ${c(t * 10)} : **${c(at)}**.`,
    ],
    targetSeconds: 45,
  };
};

const droiteNiveau5 = (rng: Rng): QuestionDraft => {
  const a = rng.int(2, 8);
  const b = rng.int(12, 19);
  const good = b - a;
  return {
    prompt:
      'La droite montre un sentier en kilomètres. A est la fontaine, B est le refuge. Quelle distance les sépare, en km ?',
    figure: droite(
      0,
      2,
      10,
      [0, 1, 2],
      [
        { name: 'A', at: a / 10 },
        { name: 'B', at: b / 10 },
      ],
    ),
    answer: num(dec(good, 1), 'km'),
    traps: traps(dec(good, 1), [
      [good, 'Tu as compté les intervalles : chacun vaut un dixième de kilomètre.'],
      [dec(b, 1), 'C’est la distance du départ à B. Retire le trajet avant A.'],
    ]),
    hint: 'Lis la position de A et celle de B, puis cherche l’écart.',
    steps: [
      `A est à ${fmt(dec(a, 1))} km et B à ${fmt(dec(b, 1))} km.`,
      `De A à B, il y a ${good} dixièmes de km.`,
      `La distance est **${fmt(dec(good, 1))} km**.`,
    ],
    targetSeconds: 60,
  };
};

/** Les cinq notions du chapitre, avec les identifiants d'origine. */
export function decimauxCm1({ S, id }: Contexte): readonly Skill[] {
  const N = cinqNiveaux(S);
  return [
    N(
      id('fraction-decimale'),
      'Fractions décimales et virgule',
      'Passer d’une écriture sous forme d’une fraction décimale ou d’une somme de fractions décimales à une écriture à virgule et réciproquement',
      [
        'Une **fraction décimale** a 10 ou 100 en bas : {1/10} = 0,1 et {1/100} = 0,01.',
        'La virgule est un code : 35,78 veut dire 35 + {7/10} + {8/100}.',
      ],
      parNiveau([fractionNiveau1, fractionNiveau2, fractionNiveau3, fractionNiveau4, fractionNiveau5]),
      { mental: true },
    ),
    N(
      id('chiffres-decimaux'),
      'Dixièmes, centièmes',
      'Connaître et utiliser les relations entre unités simples, dixièmes et centièmes',
      [
        'Juste après la virgule : les **dixièmes**, puis les **centièmes**.',
        '1 unité = 10 dixièmes = 100 centièmes. Dans 3,5, il y a 35 dixièmes.',
      ],
      parNiveau([rangNiveau1, rangNiveau2, rangNiveau3, rangNiveau4, rangNiveau5]),
      { mental: true },
    ),
    N(
      id('comparer-decimaux'),
      'Comparer des nombres décimaux',
      'Comparer, encadrer, intercaler, ordonner, par ordre croissant ou décroissant, des nombres décimaux donnés par leur écriture à virgule en utilisant les symboles =, < et >',
      [
        'Compare d’abord la **partie entière**, puis les dixièmes, puis les centièmes.',
        '2,5 > 2,15 car 5 dixièmes, c’est plus que 1 dixième. Plus de chiffres ne veut pas dire plus grand !',
      ],
      parNiveau([comparerNiveau1, comparerNiveau2, comparerNiveau3, comparerNiveau4, comparerNiveau5]),
      { mental: true },
    ),
    N(
      id('arrondi'),
      'Partie entière et arrondi à l’unité',
      'Savoir donner la partie entière et l’arrondi à l’entier d’un nombre décimal',
      [
        'La **partie entière** de 7,8 est 7 : c’est ce qui est avant la virgule.',
        'L’**arrondi** à l’unité est l’entier le plus proche : pour 7,8, c’est 8. À partir de 5 dixièmes, on monte.',
      ],
      parNiveau([entiereNiveau1, entiereNiveau2, entiereNiveau3, entiereNiveau4, entiereNiveau5]),
      { mental: true },
    ),
    N(
      id('droite-decimale'),
      'Décimaux sur une demi-droite graduée',
      'Placer un nombre décimal en écriture à virgule sur une demi-droite graduée et repérer un point d’une demi-droite graduée par un nombre décimal',
      [
        'Sur une **demi-droite graduée**, trouve d’abord combien vaut un **intervalle**.',
        'De 2 à 3 avec 10 intervalles : chacun vaut un dixième (0,1).',
      ],
      parNiveau([droiteNiveau1, droiteNiveau2, droiteNiveau3, droiteNiveau4, droiteNiveau5]),
    ),
  ];
}
