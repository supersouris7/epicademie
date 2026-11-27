import { choice, fraction, num, objective, traps } from '../../build.ts';
import { add, dec, fmt, frac, mul, r, rawFrac } from '../../rational.ts';
import type { BossContent, Lesson, Skill } from '../../types.ts';

/**
 * Combat de boss (docs/SPEC.md §6.2 bis) : le boss perd ses 2 premières vies sur des **problèmes en
 * contexte** et la dernière sur une **question piège** (les mauvaises réponses proposées sont les erreurs
 * typiques). Même modèle pédagogique que l'entraînement : indice, explication en bulles, mémo.
 */

const MINUS = '−';
const signed = (n: number) => (n < 0 ? `${MINUS}${Math.abs(n)}` : String(n));
const NAMES = ['Alex', 'Tao', 'Lina', 'Ayla', 'Inès', 'Noah', 'Jade', 'Sacha'];

// ——— Fractions ———

const fractionsLesson = (text: string, memo: string[]): Lesson => ({ memo, source: objective(text) });

const fractionDunNombre: Skill = {
  id: 'm5-boss-fractions-part',
  title: 'Problème : une fraction d’une quantité',
  lesson: fractionsLesson('Utiliser une fraction pour exprimer une proportion, calculer la fraction d’une quantité', [
    'Pour prendre {3/4} de 20 : on partage 20 en 4 parts égales (20 ÷ 4 = 5), puis on prend 3 parts (3 × 5 = 15).',
  ]),
  generate(rng) {
    const d = rng.pick([3, 4, 5, 6, 8]);
    const n = rng.int(1, d - 1);
    const part = rng.int(3, 12);
    const total = d * part;
    const value = n * part;
    const who = rng.pick(NAMES);
    const f = rawFrac(n, d);
    const ctx = rng.pick([
      {
        prompt: `Dans la classe de ${who}, il y a ${total} élèves. Les ${f} des élèves viennent à vélo. Combien d’élèves viennent à vélo ?`,
        unit: 'élèves',
      },
      {
        prompt: `${who} a ${total} cartes dans sa collection. Les ${f} sont des cartes rares. Combien a-t-on de cartes rares ?`,
        unit: 'cartes',
      },
      {
        prompt: `Le trajet de ${who} dure ${total} minutes. Les ${f} du trajet se font en bus. Combien de minutes en bus ?`,
        unit: 'minutes',
      },
    ]);
    return {
      prompt: ctx.prompt,
      answer: num(value),
      traps: traps(r(value), [
        [part, `${total} ÷ ${d} = ${part}, c’est **une seule** part. Il en faut ${n}.`],
        [total - value, `Tu as calculé ce qui **n’est pas** concerné.`],
      ]),
      hint: `Partage d’abord les ${total} ${ctx.unit} en ${d} parts égales.`,
      steps: [
        `Le dénominateur ${d} dit : on partage ${total} en ${d} parts égales. Une part : ${total} ÷ ${d} = ${part}.`,
        `Le numérateur ${n} dit : on prend ${n} part${n > 1 ? 's' : ''}. ${n} × ${part} = **${value}**.`,
      ],
      targetSeconds: 40,
    };
  },
};

const fractionGourde: Skill = {
  id: 'm5-boss-fractions-reste',
  title: 'Problème : ce qu’il reste',
  version: 2,
  lesson: fractionsLesson(
    'Additionner et soustraire des fractions dont les dénominateurs sont multiples l’un de l’autre',
    [
      'Pour ajouter ou enlever, il faut le même **dénominateur** (le nombre du bas).',
      'Pour enlever {1/4} de {5/8} : écris {1/4} = {2/8}, puis {5/8} − {2/8} = {3/8}.',
    ],
  ),
  generate(rng) {
    const d = rng.pick([6, 8, 10, 12]);
    const small = rng.pick([2, 3, 4, 5, 6].filter((k) => d % k === 0 && k < d));
    const n = rng.int(d / 2 + 1, d - 1);
    const drunk = 1;
    const drunkOver = drunk * (d / small);
    const rest = n - drunkOver;
    const who = rng.pick(NAMES);
    const value = r(rest, d);
    return {
      prompt: `${who} a ${rawFrac(n, d)} de litre d’eau dans sa gourde. ${who} en boit ${rawFrac(drunk, small)} de litre. Quelle fraction de litre reste-t-il ?`,
      answer: fraction(value),
      traps: traps(value, [
        [r(n - drunk, d - small), 'On ne soustrait pas les dénominateurs : il faut un dénominateur commun.'],
        [r(n - drunk, d), `${rawFrac(drunk, small)} n’est pas ${rawFrac(drunk, d)} : mets-le d’abord en ${d}ᵉˢ.`],
      ]),
      hint: `Les nombres du bas sont différents. Écris ${rawFrac(drunk, small)} avec ${d} en bas.`,
      demo: {
        kind: 'fraction',
        parts: [
          { num: n, den: d },
          { num: drunk, den: small },
          { num: drunkOver, den: d },
        ],
      },
      steps: [
        `Regarde les nombres du bas : ${d} et ${small} sont différents.`,
        `Mets le même nombre en bas : multiplie ${rawFrac(drunk, small)} par ${d / small} en haut et en bas.`,
        `Enlève les parts : ${rawFrac(n, d)} − ${rawFrac(drunkOver, d)} = ${rawFrac(rest, d)}.`,
        rawFrac(rest, d) === frac(value)
          ? `Écris la réponse : il reste **${frac(value)}** de litre.`
          : `Simplifie si tu veux : il reste **${frac(value)}** de litre.`,
      ],
      targetSeconds: 50,
    };
  },
};

const fractionTrajet: Skill = {
  id: 'm5-boss-fractions-trajet',
  title: 'Problème : les morceaux d’un trajet',
  lesson: fractionsLesson('Résoudre des problèmes avec des additions et soustractions de fractions', [
    'Le trajet entier vaut 1. Si on a déjà fait {1/2} et {1/4}, on a fait {3/4} : il reste 1 − {3/4} = {1/4}.',
  ]),
  generate(rng) {
    const [a, b] = rng.pick([
      [2, 4],
      [3, 6],
      [2, 8],
      [4, 8],
      [3, 12],
      [4, 12],
    ] as const);
    const den = b;
    const aOver = den / a;
    const bN = rng.int(1, Math.max(1, den - aOver - 1));
    const done = aOver + bN;
    const value = r(den - done, den);
    const who = rng.pick(NAMES);
    return {
      prompt: `Pour aller au collège, ${who} fait ${rawFrac(1, a)} du trajet à pied, puis ${rawFrac(bN, b)} du trajet en bus. Quelle fraction du trajet lui reste-t-il à faire ?`,
      answer: fraction(value),
      traps: traps(value, [
        [r(done, den), `${rawFrac(done, den)}, c’est ce qui est **déjà fait**. On cherche ce qui reste.`],
        [r(1 + bN, a + b), 'On n’additionne pas les dénominateurs.'],
      ]),
      hint: 'Calcule d’abord ce qui est déjà fait (même dénominateur !), puis enlève-le du trajet entier, qui vaut 1.',
      steps: [
        `${rawFrac(1, a)} = ${rawFrac(aOver, den)}. Déjà fait : ${rawFrac(aOver, den)} + ${rawFrac(bN, den)} = ${rawFrac(done, den)}.`,
        `Le trajet entier vaut 1 = ${rawFrac(den, den)}.`,
        `Il reste ${rawFrac(den, den)} − ${rawFrac(done, den)} = **${frac(value)}**.`,
      ],
      targetSeconds: 60,
    };
  },
};

const piegeAddition: Skill = {
  id: 'm5-boss-fractions-piege-addition',
  title: 'Piège : additionner des fractions',
  lesson: fractionsLesson('Additionner des fractions', [
    'On n’additionne **jamais** les dénominateurs : {1/2} + {1/2} = {2/2} = 1, pas {2/4}.',
    'On met d’abord au même dénominateur, puis on additionne seulement les numérateurs.',
  ]),
  generate(rng) {
    const d = rng.pick([3, 4, 5]);
    const n1 = 1;
    const k = 2;
    const n2 = rng.int(1, d * k - 3);
    const den = d * k;
    const sumN = n1 * k + n2;
    const value = r(sumN, den);
    const { answer, traps: t } = choice(rng, frac(value), [
      { label: rawFrac(n1 + n2, d + den), why: 'On a additionné les dénominateurs : c’est le piège !' },
      {
        label: rawFrac(n1 + n2, den),
        why: `${rawFrac(n1, d)} n’est pas ${rawFrac(n1, den)} : il vaut ${rawFrac(k, den)}.`,
      },
      { label: rawFrac(n1 * n2, d * den), why: 'C’est une multiplication, pas une addition.' },
    ]);
    return {
      prompt: `Le boss te défie : ${rawFrac(n1, d)} + ${rawFrac(n2, den)} = ?`,
      answer,
      traps: t,
      hint: `Les dénominateurs sont différents : écris d’abord ${rawFrac(n1, d)} avec le dénominateur ${den}.`,
      steps: [
        `On ne peut additionner que des parts de même taille : des ${den}ᵉˢ avec des ${den}ᵉˢ.`,
        `${rawFrac(n1, d)} = ${rawFrac(k, den)}, donc ${rawFrac(k, den)} + ${rawFrac(n2, den)} = **${rawFrac(sumN, den)}**${rawFrac(sumN, den) !== frac(value) ? ` = **${frac(value)}**` : ''}.`,
      ],
      targetSeconds: 40,
    };
  },
};

const piegeComparer: Skill = {
  id: 'm5-boss-fractions-piege-comparer',
  title: 'Piège : comparer des fractions',
  version: 2,
  lesson: fractionsLesson('Comparer des fractions', [
    'Avec le même nombre en haut, regarde la taille des parts.',
    'Plus on coupe en beaucoup de parts, plus elles sont petites : {3/8} est plus petit que {3/4}.',
  ]),
  generate(rng) {
    // Même numérateur (2 ou 3), trois dénominateurs : le piège est de choisir le plus grand nombre du bas.
    const n = rng.pick([2, 3]);
    const [a, b, c] = rng
      .shuffle([4, 5, 6, 8, 10, 12])
      .slice(0, 3)
      .toSorted((x, y) => x - y) as [number, number, number];
    const shown = rng.shuffle([a, b, c]).map((d) => rawFrac(n, d));
    const { answer, traps: t } = choice(rng, rawFrac(n, a), [
      {
        label: rawFrac(n, c),
        why: `${c} est le plus grand nombre du bas : les parts sont donc les **plus petites**.`,
      },
      { label: rawFrac(n, b), why: `Les parts sont plus petites qu’avec ${a} parts.` },
      { label: 'Elles sont égales', why: 'Le nombre de parts est le même, mais pas leur taille.' },
    ]);
    return {
      prompt: `Quelle fraction est la plus grande : ${shown.join(' ; ')} ?`,
      answer,
      traps: t,
      hint: 'Imagine le même gâteau coupé de trois façons. Quand les parts sont-elles les plus grosses ?',
      demo: { kind: 'fraction', shape: 'cake', parts: [a, b, c].map((den) => ({ num: n, den })) },
      steps: [
        `Regarde le nombre du haut : on prend ${n} parts à chaque fois.`,
        `Imagine un gâteau coupé en ${a}, en ${b} ou en ${c}.`,
        `Compare la taille : les parts sont les plus grosses quand on coupe en ${a}.`,
        `Choisis donc **${rawFrac(n, a)}**, la plus grande.`,
      ],
      targetSeconds: 25,
    };
  },
};

// ——— Nombres relatifs ———

const relLesson = (memo: string[]): Lesson => ({
  memo,
  source: objective('Résoudre des problèmes mobilisant addition et soustraction de nombres décimaux relatifs'),
});

const ascenseur: Skill = {
  id: 'm5-boss-relatifs-ascenseur',
  title: 'Problème : l’ascenseur',
  lesson: relLesson([
    'Le rez-de-chaussée, c’est l’étage 0 ; les parkings sont aux étages −1, −2… Monter, c’est ajouter ; descendre, c’est enlever.',
  ]),
  generate(rng) {
    const start = rng.int(-3, 6);
    const up = rng.int(2, 8);
    const down = rng.int(1, start + up + 4);
    const end = start + up - down;
    const who = rng.pick(NAMES);
    return {
      prompt: `${who} prend l’ascenseur à l’étage ${signed(start)}. L’ascenseur monte de ${up} étages, puis descend de ${down} étages. À quel étage arrive ${who} ?`,
      answer: num(end),
      traps: traps(r(end), [
        [start + up + down, 'Descendre, c’est **enlever** des étages.'],
        [-end, 'Attention au signe : on est sous le rez-de-chaussée.'],
      ]),
      hint: 'Le rez-de-chaussée est l’étage 0, les parkings sont en dessous. Monter : on ajoute ; descendre : on enlève.',
      steps: [
        `On part de ${signed(start)} et on monte de ${up} : ${signed(start)} + ${up} = ${signed(start + up)}.`,
        `On descend de ${down} : ${signed(start + up)} − ${down} = ${signed(end)}.`,
        `Arrivée à l’étage **${signed(end)}**${end < 0 ? ' : au parking' : ''}.`,
      ],
      targetSeconds: 40,
    };
  },
};

const score: Skill = {
  id: 'm5-boss-relatifs-score',
  title: 'Problème : le score',
  lesson: relLesson(['Un score peut être négatif : à −5 points, il faut gagner 5 points pour revenir à 0.']),
  generate(rng) {
    const start = -rng.int(3, 20);
    const win = rng.int(2, 15);
    const lose = rng.int(5, 20);
    const end = start + win - lose;
    const who = rng.pick(NAMES);
    return {
      prompt: `Dans un jeu, ${who} a un score de ${signed(start)} points. ${who} gagne ${win} points, puis en perd ${lose}. Quel est le score maintenant ?`,
      answer: num(end),
      traps: traps(r(end), [
        [-start + win - lose, `Le score de départ est **négatif** : ${signed(start)}, pas ${-start}.`],
        [start - win - lose, 'Gagner des points, c’est **ajouter**.'],
      ]),
      hint: 'Pars du score de départ (il est négatif), ajoute les points gagnés, enlève les points perdus.',
      steps: [
        `${signed(start)} + ${win} = ${signed(start + win)} (on remonte vers 0).`,
        `${signed(start + win)} − ${lose} = **${signed(end)}** points.`,
      ],
      targetSeconds: 40,
    };
  },
};

const plongeur: Skill = {
  id: 'm5-boss-relatifs-plongeur',
  title: 'Problème : le plongeur',
  lesson: relLesson(['Sous l’eau, l’altitude est négative : −12 m, c’est 12 m sous la surface.']),
  generate(rng) {
    const start = -rng.int(8, 25);
    const up = rng.int(2, 6);
    const down = rng.int(5, 15);
    const end = start + up - down;
    const who = rng.pick(NAMES);
    return {
      prompt: `${who} plonge à l’altitude ${signed(start)} m, remonte de ${up} m, puis redescend de ${down} m. Quelle est l’altitude atteinte (en m) ?`,
      answer: num(end, 'm'),
      traps: traps(r(end), [
        [-(start + up - down), 'Il est sous l’eau : son altitude est **négative**.'],
        [start - up + down, 'Remonter, c’est ajouter ; redescendre, c’est enlever.'],
      ]),
      hint: 'Dessine une droite verticale avec la surface à 0. Remonter fait augmenter l’altitude.',
      steps: [
        `On remonte : ${signed(start)} + ${up} = ${signed(start + up)} m.`,
        `On redescend : ${signed(start + up)} − ${down} = **${signed(end)}** m.`,
      ],
      targetSeconds: 40,
    };
  },
};

const piegePlusPetit: Skill = {
  id: 'm5-boss-relatifs-piege-comparer',
  title: 'Piège : le plus petit relatif',
  version: 2,
  lesson: relLesson([
    'Entre deux négatifs, le plus petit est le **plus loin de zéro** : −8 < −3.',
    'Ajoute un zéro pour comparer : −2,5 = −2,50, plus loin de zéro que −2,45.',
  ]),
  generate(rng) {
    // Trois négatifs très proches, écrits avec un ou deux chiffres après la virgule, et un positif.
    const unit = rng.int(1, 9);
    const tenth = rng.int(2, 8);
    const far = dec(-(unit * 100 + tenth * 10), 2);
    const middle = dec(-(unit * 100 + tenth * 10 - rng.int(1, 4)), 2);
    const near = dec(-(unit * 100 + rng.int(1, 9)), 2);
    const pos = rng.int(1, 9);
    const { answer, traps: t } = choice(rng, fmt(far), [
      { label: fmt(middle), why: `Compare les centièmes : ${fmt(middle)} est plus près de zéro.` },
      { label: fmt(near), why: `${fmt(near)} est le plus près de zéro des négatifs : il est plus grand.` },
      { label: String(pos), why: `${pos} est positif : il est plus grand que les négatifs.` },
    ]);
    const shown = rng.shuffle([fmt(far), fmt(middle), fmt(near), String(pos)]);
    return {
      prompt: `Quel est le plus petit de ces nombres : ${shown.join(' ; ')} ?`,
      answer,
      traps: t,
      hint: 'Pense à un thermomètre. Quelle température est la plus froide ?',
      steps: [
        `Écarte ${pos} : un nombre positif est plus grand que les négatifs.`,
        `Écris les négatifs avec deux chiffres après la virgule.`,
        `Cherche le plus loin de zéro : c’est le plus froid.`,
        `Choisis **${fmt(far)}**, le plus petit.`,
      ],
      targetSeconds: 25,
    };
  },
};

const piegeMoinsMoins: Skill = {
  id: 'm5-boss-relatifs-piege-soustraction',
  title: 'Piège : soustraire un négatif',
  lesson: relLesson(['Soustraire un nombre négatif, c’est **ajouter** son opposé : 5 − (−3) = 5 + 3 = 8.']),
  generate(rng) {
    const a = rng.int(2, 12);
    const b = rng.int(2, 9);
    const value = a + b;
    const { answer, traps: t } = choice(rng, String(value), [
      { label: String(a - b), why: `− (${MINUS}${b}) devient + ${b} : on **ajoute** ${b}.` },
      { label: signed(-value), why: `Le résultat est positif : on part de ${a} et on monte.` },
      { label: signed(b - a), why: 'On a mélangé l’ordre et les signes.' },
    ]);
    return {
      prompt: `Le boss te défie : ${a} − (${MINUS}${b}) = ?`,
      answer,
      traps: t,
      hint: `Soustraire un nombre négatif, c’est ajouter son opposé.`,
      steps: [
        `Enlever une dette de ${b} €, c’est comme gagner ${b} € : − (${MINUS}${b}) = + ${b}.`,
        `${a} − (${MINUS}${b}) = ${a} + ${b} = **${value}**.`,
      ],
      targetSeconds: 25,
    };
  },
};

// ——— Proportionnalité ———

const propLesson = (memo: string[]): Lesson => ({
  memo,
  source: objective(
    'Dans des situations simples, mobiliser une procédure adaptée (propriété de linéarité, retour à l’unité) pour résoudre un problème lié à la proportionnalité',
  ),
});

const recette: Skill = {
  id: 'm5-boss-propor-recette',
  title: 'Problème : la recette',
  lesson: propLesson([
    'Recette pour 6 → pour 9 : on passe par 3 (la moitié de 6), puis 9 = 6 + 3, on additionne les quantités.',
  ]),
  generate(rng) {
    const base = rng.pick([4, 6, 8]);
    const half = base / 2;
    const target = rng.pick([base + half, half * 5, half]);
    const unit = rng.int(2, 8) * 10;
    const q = unit * base;
    const v = (q / base) * target;
    const ingr = rng.pick(['g de farine', 'g de chocolat', 'mL de lait']);
    return {
      prompt: `Pour un gâteau de ${base} parts, il faut ${q} ${ingr}. Combien en faut-il pour ${target} parts ?`,
      answer: num(v),
      traps: traps(r(v), [
        [q + (target - base), 'Ce n’est pas une addition : la quantité est proportionnelle au nombre de parts.'],
      ]),
      hint: `Combien faut-il pour ${half} parts (la moitié de ${base}) ?`,
      steps: [
        `Pour ${half} parts, c’est la moitié : ${q} ÷ 2 = ${q / 2}.`,
        `${target} parts, c’est ${target / half} fois ${half} parts : ${q / 2} × ${target / half} = **${v}** ${ingr.split(' ')[0]}.`,
      ],
      targetSeconds: 50,
    };
  },
};

const vitesse: Skill = {
  id: 'm5-boss-propor-vitesse',
  title: 'Problème : la trottinette',
  lesson: propLesson([
    'À vitesse constante, la distance est proportionnelle à la durée : 2 fois moins de temps, 2 fois moins de distance.',
  ]),
  generate(rng) {
    const kmh = rng.pick([12, 15, 18, 24, 30]);
    const minutes = rng.pick([10, 20, 30].filter((m) => (kmh * m) % 60 === 0));
    const d = (kmh * minutes) / 60;
    const who = rng.pick(NAMES);
    return {
      prompt: `${who} roule en trottinette à vitesse constante : ${kmh} km en 1 heure. Quelle distance parcourt ${who} en ${minutes} minutes (en km) ?`,
      answer: num(d, 'km'),
      traps: traps(r(d), [
        [r(kmh * minutes, 100), '1 heure = 60 minutes, pas 100.'],
        [kmh - (60 - minutes), 'Ce n’est pas une soustraction : distance et durée sont proportionnelles.'],
      ]),
      hint: `1 heure = 60 minutes. Combien de fois ${minutes} minutes entrent dans 60 minutes ?`,
      steps: [
        `1 h = 60 min. ${minutes} min, c’est ${60 / minutes} fois moins que 60 min.`,
        `Donc ${60 / minutes} fois moins de distance : ${kmh} ÷ ${60 / minutes} = **${fmt(d)}** km.`,
      ],
      targetSeconds: 50,
    };
  },
};

const soldes: Skill = {
  id: 'm5-boss-propor-soldes',
  title: 'Problème : les soldes',
  advice: 'calculatrice',
  lesson: propLesson([
    'Une remise de 25 % sur 40 € : 25 % de 40 = 40 × 25 ÷ 100 = 10 €. Nouveau prix : 40 − 10 = 30 €.',
  ]),
  generate(rng) {
    const pct = rng.pick([10, 20, 25, 50]);
    const price = rng.int(2, 12) * 20;
    const off = (price * pct) / 100;
    const v = price - off;
    const thing = rng.pick(['un jeu vidéo', 'un skate', 'des baskets', 'un casque audio']);
    return {
      prompt: `Pendant les soldes, ${thing} à ${price} € est affiché à −${pct} %. Quel est son nouveau prix (en €) ?`,
      answer: num(v, '€'),
      traps: traps(r(v), [
        [off, `${fmt(off)} €, c’est la **remise**. Il faut l’enlever du prix.`],
        [price - pct, `On n’enlève pas ${pct} € mais ${pct} % du prix.`],
      ]),
      hint: `Calcule d’abord la remise : ${pct} % de ${price} €. Puis enlève-la du prix.`,
      steps: [
        `La remise : ${pct} % de ${price} = ${price} × ${pct} ÷ 100 = ${fmt(off)} €.`,
        `Nouveau prix : ${price} − ${fmt(off)} = **${fmt(v)}** €.`,
      ],
      targetSeconds: 50,
    };
  },
};

const piegeTaille: Skill = {
  id: 'm5-boss-propor-piege-taille',
  title: 'Piège : est-ce proportionnel ?',
  lesson: propLesson([
    'Avant de calculer, demande-toi : si l’une double, l’autre double-t-elle **toujours** ? Ta taille ne double pas quand ton âge double !',
  ]),
  generate(rng) {
    const age = rng.pick([6, 8, 10]);
    const h = dec(rng.int(115, 145), 2);
    const who = rng.pick(NAMES);
    const { answer, traps: t } = choice(rng, 'On ne peut pas savoir', [
      {
        label: `${fmt(mul(h, r(2)))} m`,
        why: `La taille n’est pas proportionnelle à l’âge : personne ne mesure ${fmt(mul(h, r(2)))} m à ${age * 2} ans !`,
      },
      { label: `${fmt(add(h, dec(1, 1)))} m`, why: 'Rien dans l’énoncé ne permet de calculer la taille future.' },
      { label: `${fmt(h)} m`, why: `${who} grandit encore : sa taille va changer.` },
    ]);
    return {
      prompt: `À ${age} ans, ${who} mesure ${fmt(h)} m. Combien mesurera ${who} à ${age * 2} ans ?`,
      answer,
      traps: t,
      hint: 'Si l’âge double, est-ce que la taille double forcément ?',
      steps: [
        'La taille ne grandit pas au même rythme que l’âge : ce n’est **pas** une situation de proportionnalité.',
        `Donc on ne peut pas calculer : la bonne réponse est **On ne peut pas savoir**.`,
      ],
      targetSeconds: 25,
    };
  },
};

const piegeAdditif: Skill = {
  id: 'm5-boss-propor-piege-additif',
  title: 'Piège : ajouter au lieu de multiplier',
  lesson: propLesson([
    'Dans une situation de proportionnalité, on **multiplie** (ou on divise) : 3 cahiers → 6 €, donc 1 cahier → 2 €, et 5 cahiers → 10 €.',
  ]),
  generate(rng) {
    const unit = rng.int(2, 6);
    const n1 = rng.int(2, 4);
    const n2 = n1 + rng.int(1, 4);
    const p1 = unit * n1;
    const v = unit * n2;
    const thing = rng.pick(['cahiers', 'stylos', 'croissants', 'billes']);
    return {
      prompt: `${n1} ${thing} coûtent ${p1} €. Combien coûtent ${n2} ${thing} (en €) ?`,
      answer: num(v, '€'),
      traps: traps(r(v), [
        [
          p1 + (n2 - n1),
          `Le piège ! On n’ajoute pas ${n2 - n1} € parce qu’on achète ${n2 - n1} ${thing} de plus : chacun coûte ${unit} €.`,
        ],
      ]),
      hint: `Commence par trouver le prix de 1 ${thing.slice(0, -1)}.`,
      steps: [
        `1 ${thing.slice(0, -1)} coûte ${p1} ÷ ${n1} = ${unit} €.`,
        `${n2} ${thing} coûtent ${n2} × ${unit} = **${v}** €.`,
      ],
      targetSeconds: 30,
    };
  },
};

/** Problèmes et pièges du boss, par chapitre (v1 : 3 chapitres). */
export const BOSS_CONTENT: Readonly<Record<string, BossContent>> = {
  'm5-fractions': {
    problems: [fractionDunNombre, fractionGourde, fractionTrajet],
    traps: [piegeAddition, piegeComparer],
  },
  'm5-relatifs': { problems: [ascenseur, score, plongeur], traps: [piegePlusPetit, piegeMoinsMoins] },
  'm5-proportionnalite': { problems: [recette, vitesse, soldes], traps: [piegeTaille, piegeAdditif] },
};
