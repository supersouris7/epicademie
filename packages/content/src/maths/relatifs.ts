import { choice, distinct, nonZero, num, objective, traps, trueFalse } from '../build.ts';
import { abs, add, cmp, dec, fmt, fmtSigned, neg, r, sub, type Rational } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { Chapter, Level, Skill } from '../types.ts';

/** Relatif aléatoire : entier (niveaux 1-2) ou décimal à une décimale (niveau 3). */
function relatif(rng: Rng, level: Level, max = level === 1 ? 10 : 20): Rational {
  return level === 3 ? dec(nonZero(rng, -max * 10, max * 10), 1) : r(nonZero(rng, -max, max));
}

const vocab: Skill = {
  id: 'm5-relatifs-vocab',
  title: 'Opposé, valeur absolue, signe',
  lesson: {
    body: [
      'L’**opposé** de a est le nombre −a : même distance à zéro, de l’autre côté (opposé de −7 : 7).',
      'La **valeur absolue** d’un nombre est sa distance à zéro, toujours positive : |−3,5| = 3,5.',
      'Un nombre est **positif** s’il est ≥ 0, **strictement positif** s’il est > 0. Zéro est à la fois positif et négatif, mais ni strictement positif ni strictement négatif.',
    ],
    example: {
      question: 'Opposé et valeur absolue de −4,2 ?',
      steps: ['Opposé : 4,2.', 'Valeur absolue : 4,2 (distance à zéro).'],
    },
    source: objective(
      'Définir l’opposé et la valeur absolue d’un nombre. Définir la notion de nombre positif, strictement positif, négatif, strictement négatif',
    ),
  },
  generate(rng, level) {
    if (level === 3) {
      const statements: { text: string; isTrue: boolean; why: string }[] = [
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
        },
        {
          text: 'La valeur absolue d’un nombre peut être négative.',
          isTrue: false,
          why: 'La valeur absolue est une distance : elle est toujours positive.',
        },
        {
          text: 'L’opposé d’un nombre négatif est positif.',
          isTrue: true,
          why: 'L’opposé change le signe : l’opposé de −5 est 5.',
        },
      ];
      const s = rng.pick(statements);
      return { prompt: `Vrai ou faux : ${s.text}`, ...trueFalse(s.isTrue, s.why), steps: [s.why] };
    }
    const x = relatif(rng, level === 1 ? 1 : 3);
    if (level === 1) {
      const o = neg(x);
      return {
        prompt: `Quel est l’**opposé** de ${fmt(x)} ?`,
        answer: num(o),
        traps: traps(o, [[x, 'L’opposé change le signe du nombre.']]),
        steps: [`L’opposé de ${fmt(x)} est **${fmt(o)}** (même distance à zéro, signe contraire).`],
        targetSeconds: 8,
      };
    }
    const a = abs(x);
    return {
      prompt: `Quelle est la **valeur absolue** de ${fmt(x)} ?`,
      answer: num(a),
      traps: traps(a, [[neg(a), 'La valeur absolue est une distance à zéro : elle est toujours positive.']]),
      steps: [`${fmt(x)} est à ${fmt(a)} unités de zéro : sa valeur absolue est **${fmt(a)}**.`],
      targetSeconds: 10,
    };
  },
};

const droite: Skill = {
  id: 'm5-relatifs-droite',
  title: 'Relatifs sur une droite graduée',
  lesson: {
    body: [
      'Sur une droite graduée, les nombres négatifs sont **à gauche de zéro**, les positifs à droite.',
      'On repère d’abord ce que vaut **une graduation** (1 ? 0,5 ? 0,1 ?), puis on compte depuis zéro.',
    ],
    example: {
      question: 'Graduations de 0,5 en 0,5 ; le point A est 3 graduations à gauche de 0.',
      steps: ['3 × 0,5 = 1,5.', 'À gauche de zéro : A a pour abscisse −1,5.'],
    },
    source: objective(
      'Lire l’abscisse d’un nombre relatif sur une droite graduée et placer un nombre relatif d’abscisse donnée',
    ),
  },
  generate(rng, level) {
    const sub = level === 1 ? 1 : level === 2 ? 2 : 10;
    const min = level === 3 ? -2 : -6;
    const max = level === 3 ? 2 : 6;
    const steps = (max - min) * sub;
    const ticks = distinct(rng, 3, () => rng.int(1, steps - 1)).map((t) => r(min * sub + t, sub));
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
        steps: [
          `Une graduation vaut ${fmt(r(1, sub))}.`,
          `A est à ${fmt(abs(target))} de zéro, ${target.n < 0 ? 'à gauche' : 'à droite'} : son abscisse est **${fmt(target)}**.`,
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
      steps: [
        `Une graduation vaut ${fmt(r(1, sub))} : ${fmt(target)} est ${target.n < 0 ? 'à gauche' : 'à droite'} de zéro, c’est le point **A**.`,
      ],
    };
  },
};

const comparer: Skill = {
  id: 'm5-relatifs-comparer',
  title: 'Comparer et ranger des relatifs',
  lesson: {
    body: [
      'Sur la droite graduée, le plus grand nombre est **le plus à droite**.',
      'Un négatif est toujours plus petit qu’un positif. Entre deux négatifs, le plus petit est celui qui a la **plus grande** distance à zéro : −8 < −3.',
    ],
    example: { question: 'Compare −2,5 et −2,05.', steps: ['Distances à zéro : 2,5 > 2,05.', 'Donc −2,5 < −2,05.'] },
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
        steps: [
          `Dans l’ordre croissant : ${sorted.map((v) => fmt(v)).join(' < ')}.`,
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
      steps: [
        `Sur la droite graduée, ${fmt(a)} est ${c < 0 ? 'à gauche' : c > 0 ? 'à droite' : 'au même endroit'} de ${fmt(b)} : **${fmt(a)} ${correct} ${fmt(b)}**.`,
      ],
      targetSeconds: 10,
    };
  },
};

function additionSteps(a: Rational, b: Rational): string[] {
  const s = add(a, b);
  if (a.n < 0 === b.n < 0) {
    return [
      `Même signe : on additionne les distances à zéro (${fmt(abs(a))} + ${fmt(abs(b))} = ${fmt(add(abs(a), abs(b)))}) et on garde le signe.`,
      `${fmtSigned(a)} + ${fmtSigned(b)} = **${fmt(s)}**`,
    ];
  }
  const big = cmp(abs(a), abs(b)) >= 0 ? a : b;
  return [
    `Signes contraires : on soustrait les distances à zéro (${fmt(abs(big))} − ${fmt(abs(big === a ? b : a))} = ${fmt(abs(s))}).`,
    `On prend le signe du nombre le plus éloigné de zéro (${fmt(big)}) : ${fmtSigned(a)} + ${fmtSigned(b)} = **${fmt(s)}**`,
  ];
}

const addition: Skill = {
  id: 'm5-relatifs-addition',
  title: 'Additionner deux relatifs',
  lesson: {
    body: [
      '**Même signe** : on additionne les distances à zéro et on garde le signe : (−4) + (−3) = −7.',
      '**Signes contraires** : on soustrait les distances à zéro et on prend le signe du nombre le plus éloigné de zéro : (−7) + (+3) = −4.',
      'Deux opposés ont une somme nulle : (−5) + (+5) = 0.',
    ],
    example: {
      question: 'Calcule (+2,5) + (−6).',
      steps: ['Signes contraires : 6 − 2,5 = 3,5.', '−6 est plus loin de zéro : le résultat est −3,5.'],
    },
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
      steps: additionSteps(a, b),
      targetSeconds: 15,
    };
  },
};

const soustraction: Skill = {
  id: 'm5-relatifs-soustraction',
  title: 'Soustraire deux relatifs',
  lesson: {
    body: [
      'Soustraire un nombre, c’est **ajouter son opposé** : a − b = a + (−b).',
      '(+3) − (−5) = (+3) + (+5) = 8 ; (−2) − (+4) = (−2) + (−4) = −6.',
    ],
    example: {
      question: 'Calcule (−1,5) − (−4).',
      steps: ['On ajoute l’opposé : (−1,5) + (+4).', 'Signes contraires : 4 − 1,5 = 2,5, signe + : 2,5.'],
    },
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
      steps: [
        `Soustraire, c’est ajouter l’opposé : ${fmtSigned(a)} − ${fmtSigned(b)} = ${fmtSigned(a)} + ${fmtSigned(neg(b))}.`,
        ...additionSteps(a, neg(b)).slice(0, 1),
        `= **${fmt(d)}**`,
      ],
      targetSeconds: 18,
    };
  },
};

const sommes: Skill = {
  id: 'm5-relatifs-sommes',
  title: 'Enchaîner additions et soustractions',
  lesson: {
    body: [
      'On transforme les soustractions en additions de l’opposé, puis on regroupe : d’abord les positifs, puis les négatifs.',
      'Écriture simplifiée : on enlève les parenthèses et les signes + d’addition : (+5) + (−3) − (−2) = 5 − 3 + 2.',
    ],
    example: {
      question: 'Calcule −3 + 7 − 5 + 2.',
      steps: ['Positifs : 7 + 2 = 9. Négatifs : −3 − 5 = −8.', '9 − 8 = 1.'],
    },
    source: objective(
      'Additionner plusieurs nombres décimaux relatifs. Simplifier l’écriture de sommes comportant des parenthèses. Enchainer additions et soustractions de décimaux relatifs',
    ),
  },
  generate(rng, level) {
    const count = level === 1 ? 3 : 4;
    const terms = Array.from({ length: count }, () => relatif(rng, level === 3 ? 2 : level));
    const total = terms.reduce((s, t) => add(s, t), r(0));
    const withParens = level >= 2;
    // Écriture : chaque terme t est écrit soit « + (t) », soit « − (−t) » (niveau ≥ 2).
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
    const pos = terms.filter((t) => t.n > 0).reduce((s, t) => add(s, t), r(0));
    const negs = terms.filter((t) => t.n < 0).reduce((s, t) => add(s, t), r(0));
    return {
      prompt: `Calcule ${text}.`,
      answer: num(total),
      traps: traps(total, [
        [wrong, 'Soustraire un nombre, c’est ajouter son opposé : le signe dans la parenthèse doit changer.'],
        [neg(total), 'Le signe du résultat est faux.'],
      ]),
      steps: [
        ...(withParens
          ? [
              `Écriture simplifiée : ${terms.map((t, i) => (i === 0 ? fmt(t) : `${t.n < 0 ? '−' : '+'} ${fmt(abs(t))}`)).join(' ')}.`,
            ]
          : []),
        `Positifs : ${fmt(pos)} ; négatifs : ${fmt(negs)}.`,
        `${fmt(pos)} + ${fmtSigned(negs)} = **${fmt(total)}**`,
      ],
      targetSeconds: 30,
    };
  },
};

const problemes: Skill = {
  id: 'm5-relatifs-problemes',
  title: 'Problèmes avec des relatifs',
  lesson: {
    body: [
      'Températures, altitudes, soldes… on traduit l’énoncé par une addition ou une soustraction de relatifs.',
      'L’**écart** entre deux valeurs = la plus grande − la plus petite.',
    ],
    example: {
      question: 'Il fait −6 °C le matin et 4 °C l’après-midi. De combien la température a-t-elle augmenté ?',
      steps: ['4 − (−6) = 4 + 6 = 10.', 'Elle a augmenté de 10 °C.'],
    },
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
        steps: [`${fmt(t0)} + ${rise} = **${fmt(t1)}** °C`],
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
        steps: [
          `Écart = plus grande − plus petite = ${high} − (${fmt(low)}).`,
          `= ${high} + ${Math.abs(low)} = **${gap}** °C`,
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
      steps: [`${fmt(depth)} + ${up} = **${fmt(final)}** m`],
    };
  },
};

export const relatifs: Chapter = {
  id: 'm5-relatifs',
  subject: 'maths',
  title: 'Nombres relatifs',
  skills: [vocab, droite, comparer, addition, soustraction, sommes, problemes],
};
