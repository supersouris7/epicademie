import { choice, distinct, nonZero, num, objective, traps, trueFalse } from '../../build.ts';
import { abs, add, cmp, dec, fmt, fmtSigned, neg, r, sub, type Rational } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { Chapter, Level, Skill } from '../../types.ts';

/** Relatif aléatoire : entier (niveaux 1-2) ou décimal à une décimale (niveau 3). */
function relatif(rng: Rng, level: Level, max = level === 1 ? 10 : 20): Rational {
  return level === 3 ? dec(nonZero(rng, -max * 10, max * 10), 1) : r(nonZero(rng, -max, max));
}

const vocab: Skill = {
  id: 'm5-relatifs-vocab',
  mental: true,
  title: 'Opposé, valeur absolue, signe',
  lesson: {
    memo: [
      'L’**opposé**, c’est le nombre « en miroir » de l’autre côté de zéro : l’opposé de −7 est 7, l’opposé de 3 est −3.',
      'La **valeur absolue**, c’est la distance jusqu’à zéro. Une distance n’est jamais négative : la valeur absolue de −3,5 est 3,5.',
      'Zéro est positif **et** négatif, mais pas « strictement » : strictement veut dire « différent de zéro ».',
    ],
    source: objective(
      'Définir l’opposé et la valeur absolue d’un nombre. Définir la notion de nombre positif, strictement positif, négatif, strictement négatif',
    ),
  },
  generate(rng, level) {
    if (level === 3) {
      const statements: { text: string; isTrue: boolean; why: string; hint?: string }[] = [
        {
          text: '0 est un nombre positif.',
          isTrue: true,
          why: '0 ≥ 0 : zéro est positif (et aussi négatif), mais pas strictement positif.',
        },
        {
          text: '0 est strictement positif.',
          isTrue: false,
          why: '« Strictement positif » veut dire > 0 : zéro ne l’est pas.',
        },
        {
          text: `${fmt(dec(-rng.int(11, 99), 1))} est strictement négatif.`,
          isTrue: true,
          why: 'Il est inférieur à 0 : il est strictement négatif.',
          hint: 'Ce nombre est-il plus petit que 0 ?',
        },
        {
          text: 'La valeur absolue d’un nombre peut être négative.',
          isTrue: false,
          why: 'La valeur absolue est une distance : elle est toujours positive.',
          hint: 'La valeur absolue, c’est une distance. Une distance peut-elle être négative ?',
        },
        {
          text: 'L’opposé d’un nombre négatif est positif.',
          isTrue: true,
          why: 'L’opposé change le signe : l’opposé de −5 est 5.',
          hint: 'Prends un exemple : quel est l’opposé de −5 ?',
        },
      ];
      const s = rng.pick(statements);
      return {
        prompt: `Vrai ou faux : ${s.text}`,
        ...trueFalse(s.isTrue, s.why),
        hint: s.hint ?? 'Relis bien chaque mot : « strictement » veut dire « sans le zéro ».',
        steps: [s.why, `Donc c’est **${s.isTrue ? 'vrai' : 'faux'}**.`],
      };
    }
    const x = relatif(rng, level === 1 ? 1 : 3);
    if (level === 1) {
      const o = neg(x);
      return {
        prompt: `Quel est l’**opposé** de ${fmt(x)} ?`,
        answer: num(o),
        traps: traps(o, [[x, 'L’opposé change le signe du nombre.']]),
        hint: 'L’opposé, c’est le nombre en miroir de l’autre côté de zéro.',
        steps: [
          `${fmt(x)} est à ${fmt(abs(x))} de zéro, ${x.n < 0 ? 'à gauche' : 'à droite'}.`,
          `Son opposé est à la même distance, mais de l’autre côté : on change juste le signe.`,
          `L’opposé de ${fmt(x)} est **${fmt(o)}**.`,
        ],
        targetSeconds: 8,
      };
    }
    const a = abs(x);
    return {
      prompt: `Quelle est la **valeur absolue** de ${fmt(x)} ?`,
      answer: num(a),
      traps: traps(a, [[neg(a), 'La valeur absolue est une distance à zéro : elle est toujours positive.']]),
      hint: 'La valeur absolue, c’est une distance jusqu’à zéro. Une distance peut-elle être négative ?',
      steps: [
        `La valeur absolue, c’est la distance entre le nombre et zéro.`,
        `${fmt(x)} est à ${fmt(a)} de zéro. Une distance est toujours positive.`,
        `La valeur absolue de ${fmt(x)} est **${fmt(a)}**.`,
      ],
      targetSeconds: 10,
    };
  },
};

const droite: Skill = {
  id: 'm5-relatifs-droite',
  title: 'Relatifs sur une droite graduée',
  lesson: {
    memo: [
      'À gauche de zéro, les nombres sont **négatifs**. À droite, ils sont positifs.',
      'Regarde ce que vaut **un petit trait**, puis compte les traits depuis zéro.',
    ],
    source: objective(
      'Lire l’abscisse d’un nombre relatif sur une droite graduée et placer un nombre relatif d’abscisse donnée',
    ),
  },
  generate(rng, level) {
    const sub = level === 1 ? 1 : level === 2 ? 2 : 10;
    const min = level === 3 ? -2 : -6;
    const max = level === 3 ? 2 : 6;
    const steps = (max - min) * sub;
    const ticks = distinct(rng, 3, () => {
      let t = 0;
      while (t === 0 || min * sub + t === 0) t = rng.int(1, steps - 1);
      return t;
    }).map((t) => r(min * sub + t, sub));
    const names = ['A', 'B', 'C'];
    const points = ticks.map((t, i) => ({ name: names[i] ?? '?', at: t.n / t.d }));
    const figure = { kind: 'numberLine' as const, min, max, subdivisions: sub, labels: [min, 0, max], points };
    const target = ticks[0] ?? r(0);
    if (rng.next() < 0.5) {
      return {
        prompt: 'Quelle est l’abscisse du point **A** ?',
        figure,
        answer: num(target),
        traps: traps(target, [[neg(target), 'Attention au côté du zéro : à gauche, les nombres sont négatifs.']]),
        hint: 'Combien vaut un petit trait ? Puis compte les traits entre 0 et A.',
        steps: [
          sub === 1
            ? `Regarde entre 0 et 1 : un petit trait vaut 1.`
            : `Compte les espaces entre 0 et 1 : il y en a ${sub}. Un trait vaut ${fmt(r(1, sub))}.`,
          `Compte les traits de 0 jusqu’à A : il y en a ${Math.abs(target.n * (sub / target.d))}.`,
          `Regarde le côté : A est ${target.n < 0 ? 'à gauche de zéro, donc négatif' : 'à droite de zéro, donc positif'}.`,
          `Écris l’abscisse de A : **${fmt(target)}**.`,
        ],
      };
    }
    const correct = 'A';
    const wrong = points.slice(1).map((p) => ({
      label: p.name,
      why: `Le point ${p.name} a pour abscisse ${fmt(r(Math.round(p.at * sub), sub))}.`,
    }));
    return {
      prompt: `Quel point a pour abscisse **${fmt(target)}** ?`,
      figure,
      ...choice(rng, correct, wrong, true),
      hint: `${fmt(target)} est-il à gauche ou à droite de zéro ? Et à combien de traits ?`,
      steps: [
        `Regarde la droite : un petit trait vaut ${fmt(r(1, sub))}.`,
        `Cherche le côté : ${fmt(target)} est ${target.n < 0 ? 'négatif, donc à gauche' : 'positif, donc à droite'} de zéro.`,
        `Avance depuis 0 jusqu’à la distance ${fmt(abs(target))}.`,
        `Lis le nom du point placé là : c’est **A**.`,
      ],
    };
  },
};

const comparer: Skill = {
  id: 'm5-relatifs-comparer',
  mental: true,
  title: 'Comparer et ranger des relatifs',
  lesson: {
    memo: [
      'Pense à un thermomètre : −8 °C, il fait plus froid que −3 °C. Donc −8 < −3.',
      'Sur la droite graduée, le plus grand est toujours **le plus à droite**. Un négatif est toujours plus petit qu’un positif.',
    ],
    source: objective('Comparer et ranger dans l’ordre croissant et décroissant des nombres décimaux relatifs'),
  },
  generate(rng, level) {
    if (level === 3) {
      const values = distinct(
        rng,
        4,
        () => relatif(rng, 3, 10),
        (v) => `${v.n}/${v.d}`,
      );
      const sorted = values.toSorted(cmp);
      const askMin = rng.next() < 0.5;
      const target = (askMin ? sorted[0] : sorted[3]) ?? r(0);
      const confusedAbs = values.toSorted((a, b) => cmp(abs(a), abs(b)))[askMin ? 0 : 3] ?? r(0);
      return {
        prompt: `Quel est le **plus ${askMin ? 'petit' : 'grand'}** de ces nombres ?`,
        ...choice(
          rng,
          fmt(target),
          values
            .filter((v) => cmp(v, target) !== 0)
            .map((v) => ({
              label: fmt(v),
              why:
                cmp(v, confusedAbs) === 0
                  ? 'Tu as comparé les distances à zéro : pour les négatifs, c’est l’inverse.'
                  : `${fmt(target)} est ${askMin ? 'plus à gauche' : 'plus à droite'} sur la droite graduée.`,
            })),
        ),
        hint: askMin
          ? 'Le plus petit, c’est le plus à gauche sur la droite graduée (le plus « froid »).'
          : 'Le plus grand, c’est le plus à droite sur la droite graduée (le plus « chaud »).',
        steps: [
          `Imagine les nombres sur un thermomètre : plus on est loin sous zéro, plus il fait froid.`,
          `On les range du plus froid au plus chaud : ${sorted.map((v) => fmt(v)).join(' < ')}.`,
          `Le plus ${askMin ? 'petit' : 'grand'} est **${fmt(target)}**.`,
        ],
      };
    }
    const a = relatif(rng, level);
    let b = relatif(rng, level);
    if (level === 2 && rng.next() < 0.6) b = neg(abs(r(nonZero(rng, 1, 15)))); // souvent deux négatifs
    const c = cmp(a, b);
    const signs = ['<', '=', '>'];
    const correct = signs[c + 1] ?? '=';
    const absCmp = cmp(abs(a), abs(b));
    return {
      prompt: `Compare : ${fmt(a)} … ${fmt(b)}`,
      ...choice(
        rng,
        correct,
        signs
          .filter((s) => s !== correct)
          .map((s) => ({
            label: s,
            why:
              signs[absCmp + 1] === s && a.n < 0 && b.n < 0
                ? 'Pour deux négatifs, le plus petit est celui qui est le plus loin de zéro.'
                : `${fmt(a)} est ${c < 0 ? 'à gauche' : 'à droite'} de ${fmt(b)} sur la droite graduée.`,
          })),
        true,
      ),
      hint: 'Pense à des températures : laquelle est la plus froide ?',
      steps: [
        a.n < 0 && b.n < 0
          ? `Deux négatifs : comme des températures sous zéro. ${fmt(abs(a)) === fmt(abs(b)) ? '' : `${fmt(cmp(abs(a), abs(b)) > 0 ? a : b)} °C, c’est plus froid, car plus loin sous zéro.`}`
          : a.n < 0 !== b.n < 0
            ? `Un nombre négatif est toujours plus petit qu’un nombre positif.`
            : `Deux positifs : on compare comme d’habitude.`,
        `Sur la droite graduée, ${fmt(a)} est ${c < 0 ? 'à gauche' : c > 0 ? 'à droite' : 'au même endroit'} de ${fmt(b)}.`,
        `Donc **${fmt(a)} ${correct} ${fmt(b)}**.`,
      ],
      targetSeconds: 10,
    };
  },
};

/** Somme des distances à zéro d'un tas de nombres de même signe (« 3 + 5 = 8 », « 4 » ou « 0 »). */
function pile(list: readonly Rational[]): string {
  if (list.length === 0) return '0';
  const total = list.reduce((s, t) => add(s, abs(t)), r(0));
  return list.length === 1 ? fmt(total) : `${list.map((t) => fmt(abs(t))).join(' + ')} = ${fmt(total)}`;
}

/** Gain ou perte, pour raconter un relatif avec de l'argent. */
const money = (x: Rational) => (x.n < 0 ? `je perds ${fmt(abs(x))} €` : `je gagne ${fmt(x)} €`);

function additionSteps(a: Rational, b: Rational): string[] {
  const s = add(a, b);
  const story = `Imagine : ${money(a)}, puis ${money(b)}.`;
  if (a.n < 0 === b.n < 0) {
    return [
      story,
      a.n < 0
        ? `Je perds deux fois : en tout, je perds ${fmt(abs(a))} + ${fmt(abs(b))} = ${fmt(abs(s))} €.`
        : `Je gagne deux fois : en tout, je gagne ${fmt(a)} + ${fmt(b)} = ${fmt(s)} €.`,
      `${fmtSigned(a)} + ${fmtSigned(b)} = **${fmt(s)}**`,
    ];
  }
  const big = cmp(abs(a), abs(b)) >= 0 ? a : b;
  const small = big === a ? b : a;
  return [
    story,
    `Le gain et la perte se compensent en partie : ${fmt(abs(big))} − ${fmt(abs(small))} = ${fmt(abs(s))}.`,
    s.n === 0
      ? `Tout se compense : ${fmtSigned(a)} + ${fmtSigned(b)} = **0**`
      : `${big.n < 0 ? 'J’ai plus perdu que gagné : le résultat est négatif' : 'J’ai plus gagné que perdu : le résultat est positif'}. ${fmtSigned(a)} + ${fmtSigned(b)} = **${fmt(s)}**`,
  ];
}

const addition: Skill = {
  id: 'm5-relatifs-addition',
  mental: true,
  title: 'Additionner deux relatifs',
  lesson: {
    memo: [
      'Pense à de l’argent : + c’est un gain, − c’est une perte.',
      '(−4) + (−3) : je perds 4 €, puis je perds 3 €. J’ai perdu 7 € en tout → **−7**.',
      '(−7) + (+3) : je perds 7 €, je regagne 3 €. Il me manque encore 4 € → **−4**.',
    ],
    source: objective('Additionner deux nombres décimaux relatifs'),
  },
  generate(rng, level) {
    const a = relatif(rng, level);
    let b = relatif(rng, level);
    if (a.n < 0 === b.n < 0 && rng.next() < 0.6) b = neg(b); // privilégie les signes contraires
    const s = add(a, b);
    return {
      prompt: `Calcule ${fmtSigned(a)} + ${fmtSigned(b)}.`,
      answer: num(s),
      traps: traps(s, [
        [neg(s), 'Le signe est faux : on prend le signe du nombre le plus éloigné de zéro.'],
        [
          a.n < 0 === b.n < 0 ? sub(abs(a), abs(b)) : add(abs(a), abs(b)),
          a.n < 0 === b.n < 0
            ? 'Même signe : on additionne les distances à zéro.'
            : 'Signes contraires : on soustrait les distances à zéro, on ne les additionne pas.',
        ],
        [neg(add(abs(a), abs(b))), 'Signes contraires : on soustrait les distances à zéro.'],
      ]),
      hint: 'Pense à de l’argent : + c’est un gain, − c’est une perte. Au total, tu as gagné ou perdu ?',
      steps: additionSteps(a, b),
      targetSeconds: 15,
    };
  },
};

const soustraction: Skill = {
  id: 'm5-relatifs-soustraction',
  mental: true,
  title: 'Soustraire deux relatifs',
  lesson: {
    memo: [
      'Soustraire un nombre, c’est **ajouter son opposé** : on transforme le − en + et on change le signe du nombre qui suit.',
      '(+3) − (−5) devient (+3) + (+5) = 8. Enlever une dette de 5 €, c’est comme gagner 5 € !',
    ],
    source: objective('Soustraire deux nombres décimaux relatifs'),
  },
  generate(rng, level) {
    const a = relatif(rng, level);
    const b = relatif(rng, level);
    const d = sub(a, b);
    return {
      prompt: `Calcule ${fmtSigned(a)} − ${fmtSigned(b)}.`,
      answer: num(d),
      traps: traps(d, [
        [
          add(a, b),
          `Soustraire ${fmtSigned(b)}, c’est ajouter son **opposé** ${fmtSigned(neg(b))} : il faut changer son signe.`,
        ],
        [neg(d), 'Le signe du résultat est faux.'],
      ]),
      hint: `Transforme d’abord la soustraction : − ${fmtSigned(b)} devient + ${fmtSigned(neg(b))}.`,
      steps: [
        `Soustraire, c’est ajouter l’opposé. L’opposé de ${fmtSigned(b)} est ${fmtSigned(neg(b))}.`,
        `Le calcul devient une addition : ${fmtSigned(a)} + ${fmtSigned(neg(b))}.`,
        ...additionSteps(a, neg(b)).slice(1),
      ],
      targetSeconds: 18,
    };
  },
};

const sommes: Skill = {
  id: 'm5-relatifs-sommes',
  mental: true,
  title: 'Enchaîner additions et soustractions',
  version: 2,
  lesson: {
    memo: [
      'Enlève d’abord les parenthèses : + (−3) devient − 3, et − (−2) devient + 2.',
      'Fais deux tas, les gains et les pertes, puis compare-les.',
      'Dans −3 + 7 − 5 + 2, les gains font 9, les pertes 8 : il reste 1.',
    ],
    source: objective(
      'Additionner plusieurs nombres décimaux relatifs. Simplifier l’écriture de sommes comportant des parenthèses. Enchainer additions et soustractions de décimaux relatifs',
    ),
  },
  generate(rng, level) {
    // Une difficulté par niveau : 3 nombres, puis 4 nombres, puis les parenthèses.
    const count = level === 1 ? 3 : 4;
    const terms = Array.from({ length: count }, () => relatif(rng, 1));
    const total = terms.reduce((s, t) => add(s, t), r(0));
    const withParens = level === 3;
    // Écriture : chaque terme t est écrit soit « + (t) », soit « − (−t) » (avec parenthèses).
    let text = withParens ? fmtSigned(terms[0] ?? r(0)) : fmt(terms[0] ?? r(0));
    let wrong = terms[0] ?? r(0);
    for (const t of terms.slice(1)) {
      if (withParens && rng.next() < 0.5) {
        text += ` − ${fmtSigned(neg(t))}`;
        wrong = sub(wrong, t); // oubli du changement de signe
      } else {
        text += withParens ? ` + ${fmtSigned(t)}` : ` ${t.n < 0 ? '−' : '+'} ${fmt(abs(t))}`;
        wrong = add(wrong, t);
      }
    }
    const gains = terms.filter((t) => t.n > 0);
    const losses = terms.filter((t) => t.n < 0);
    const pos = gains.reduce((s, t) => add(s, t), r(0));
    const negs = losses.reduce((s, t) => add(s, t), r(0));
    const short = terms.map((t, i) => (i === 0 ? fmt(t) : `${t.n < 0 ? '−' : '+'} ${fmt(abs(t))}`)).join(' ');
    return {
      prompt: `Calcule ${text}.`,
      answer: num(total),
      traps: traps(total, [
        withParens
          ? [wrong, 'Soustraire un nombre, c’est ajouter son opposé : change le signe dans la parenthèse.']
          : [add(pos, abs(negs)), 'Les nombres avec un signe − sont des pertes : on les enlève.'],
        [neg(total), 'Le signe du résultat est faux.'],
      ]),
      steps: [
        ...(withParens ? [`Enlève les parenthèses : ${short}.`] : [`Regarde les signes : + est un gain, − une perte.`]),
        `Additionne les gains : ${pile(gains)}. Additionne les pertes : ${pile(losses)}.`,
        cmp(pos, abs(negs)) >= 0
          ? `Enlève les pertes aux gains : ${fmt(pos)} − ${fmt(abs(negs))} = ${fmt(total)}.`
          : `Les pertes gagnent : calcule ${fmt(abs(negs))} − ${fmt(pos)} = ${fmt(abs(total))}.`,
        total.n < 0 ? `Mets le signe − : la réponse est **${fmt(total)}**.` : `Écris la réponse : **${fmt(total)}**.`,
      ],
      hint: withParens
        ? 'Enlève d’abord les parenthèses. Puis regroupe les gains et les pertes.'
        : 'Regroupe les gains d’un côté, les pertes de l’autre.',
      targetSeconds: 30,
    };
  },
};

const problemes: Skill = {
  id: 'm5-relatifs-problemes',
  title: 'Problèmes avec des relatifs',
  lesson: {
    memo: [
      'Fais un petit dessin : un thermomètre ou une droite verticale avec le zéro au milieu.',
      'Quand ça monte, on ajoute ; quand ça descend, on enlève.',
      'Pour un **écart** entre −6 °C et 4 °C : de −6 à 0, ça fait 6 ; de 0 à 4, ça fait 4. Écart : 6 + 4 = 10 °C.',
    ],
    source: objective('Résoudre des problèmes mobilisant addition et soustraction de nombres décimaux relatifs'),
  },
  generate(rng, level) {
    const kind = rng.int(0, 2);
    if (kind === 0) {
      const t0 = -rng.int(2, 12);
      const rise = rng.int(3, 15);
      const t1 = t0 + rise;
      return {
        prompt: `À 6 h, il fait ${fmt(t0)} °C. À midi, la température a monté de ${rise} °C. Quelle température fait-il à midi (en °C) ?`,
        answer: num(t1, '°C'),
        traps: traps(r(t1), [
          [t0 - rise, 'La température **monte** : on ajoute.'],
          [-(Math.abs(t0) + rise), `On calcule ${fmt(t0)} + ${rise}, pas −(${Math.abs(t0)} + ${rise}).`],
        ]),
        hint: `Imagine un thermomètre : pars de ${fmt(t0)} et monte de ${rise} graduations.`,
        steps: [
          `La température monte : on part de ${fmt(t0)} °C et on ajoute ${rise}.`,
          t1 >= 0
            ? `Pour remonter jusqu’à 0, il faut ${Math.abs(t0)} °C. Il reste ${rise} − ${Math.abs(t0)} = ${t1} °C au-dessus de zéro.`
            : `On monte de ${rise}, mais pas assez pour atteindre 0 (il faudrait ${Math.abs(t0)}).`,
          `${fmt(t0)} + ${rise} = **${fmt(t1)}** °C`,
        ],
      };
    }
    if (kind === 1 || level === 1) {
      const low = -rng.int(3, 20);
      const high = rng.int(1, 15);
      const gap = high - low;
      return {
        prompt: `La nuit, il a fait ${fmt(low)} °C ; le jour, ${high} °C. Quel est l’écart de température (en °C) ?`,
        answer: num(gap, '°C'),
        traps: traps(r(gap), [[high + low, `L’écart est ${high} − (${fmt(low)}) = ${high} + ${Math.abs(low)}.`]]),
        hint: 'Coupe le trajet en deux : de la température la plus basse jusqu’à 0, puis de 0 jusqu’à la plus haute.',
        steps: [
          `Sur le thermomètre, on va de ${fmt(low)} °C à ${high} °C.`,
          `De ${fmt(low)} jusqu’à 0 : ${Math.abs(low)} °C. De 0 jusqu’à ${high} : ${high} °C.`,
          `L’écart est ${Math.abs(low)} + ${high} = **${gap}** °C.`,
        ],
      };
    }
    const depth = -rng.int(20, 300);
    const up = rng.int(10, Math.abs(depth) + 200);
    const final = depth + up;
    return {
      prompt: `Un sous-marin est à l’altitude ${fmt(depth)} m. Il remonte de ${up} m. Quelle est sa nouvelle altitude (en m) ?`,
      answer: num(final, 'm'),
      traps: traps(r(final), [[depth - up, 'Il **remonte** : son altitude augmente, on ajoute.']]),
      hint: `Il remonte : son altitude augmente. Pars de ${fmt(depth)} et ajoute ${up}.`,
      steps: [
        `${fmt(depth)} m, c’est ${Math.abs(depth)} m sous la surface. Il remonte de ${up} m : on ajoute.`,
        final >= 0
          ? `Il lui faut ${Math.abs(depth)} m pour atteindre la surface (0 m). Il dépasse de ${up} − ${Math.abs(depth)} = ${final} m.`
          : `Il reste sous la surface : ${Math.abs(depth)} − ${up} = ${Math.abs(final)} m de profondeur.`,
        `${fmt(depth)} + ${up} = **${fmt(final)}** m`,
      ],
    };
  },
};

export const relatifs: Chapter = {
  id: 'm5-relatifs',
  subject: 'maths',
  grade: '5e',
  domain: 'nombres',
  title: 'Nombres relatifs',
  skills: [vocab, droite, comparer, addition, soustraction, sommes, problemes],
};
