import { choice, distinct, fraction, num, objective, traps, trueFalse } from '../build.ts';
import { add, dec, div, fmt, frac, mul, r, type Rational } from '../rational.ts';
import type { Block, Chapter, Skill } from '../types.ts';

/* ───────────────────────── Statistiques ───────────────────────── */

const SPORTS = ['Foot', 'Basket', 'Danse', 'Natation', 'Judo', 'Tennis'];

const effectifs: Skill = {
  id: 'm5-effectifs-frequences',
  tools: ['calculatrice'],
  title: 'Effectifs et fréquences',
  lesson: {
    body: [
      'L’**effectif** d’une valeur est le nombre de fois où elle apparaît ; l’effectif total est la somme des effectifs.',
      '**Fréquence** = effectif ÷ effectif total. Elle s’écrit en fraction, en décimal ou en pourcentage : {6/24} = 0,25 = 25 %.',
    ],
    example: { question: 'Sur 24 votes, Chloé en a 6. Fréquence ?', steps: ['6 ÷ 24 = {6/24} = 0,25 = 25 %.'] },
    source: objective(
      'Calculer des effectifs et des fréquences (exprimées sous forme décimale, fractionnaire ou de pourcentage)',
    ),
  },
  generate(rng, level) {
    const cats = rng.shuffle(SPORTS).slice(0, 4);
    // Effectif total 20, 25 ou 50 pour des pourcentages exacts.
    const total = rng.pick([20, 25, 50]);
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < total; i++) {
      const k = rng.int(0, 3);
      counts[k] = (counts[k] ?? 0) + 1;
    }
    const rows = [
      ['Sport', ...cats],
      ['Effectif', ...counts.map(String)],
    ];
    const k = rng.int(0, 3);
    const c = counts[k] ?? 0;
    const cat = cats[k] ?? '';
    if (level === 1) {
      return {
        prompt: 'Quel est l’effectif total de la classe ?',
        figure: { kind: 'table', rows, header: true },
        answer: num(total),
        traps: traps(r(total), [[Math.max(...counts), 'L’effectif total est la **somme** de tous les effectifs.']]),
        steps: [`${counts.join(' + ')} = **${total}**`],
        targetSeconds: 20,
      };
    }
    const f = r(c, total);
    if (level === 2) {
      return {
        prompt: `Quelle est la fréquence de « ${cat} » ? (en fraction)`,
        figure: { kind: 'table', rows, header: true },
        answer: fraction(f),
        traps: traps(f, [[r(total, c || 1), 'C’est effectif ÷ total, pas l’inverse.']]),
        steps: [`Fréquence = effectif ÷ total = {${c}/${total}}${f.d !== total ? ` = ${frac(f)}` : ''}.`],
      };
    }
    const pct = mul(f, r(100));
    return {
      prompt: `Quelle est la fréquence de « ${cat} », en pourcentage ?`,
      figure: { kind: 'table', rows, header: true },
      answer: num(pct, '%'),
      traps: traps(pct, [
        [f, 'C’est la fréquence en décimal : en pourcentage on multiplie par 100.'],
        [c, 'C’est l’effectif ; la fréquence se rapporte au total.'],
      ]),
      steps: [`Fréquence = ${c} ÷ ${total} = ${fmt(f)}.`, `En pourcentage : ${fmt(f)} × 100 = **${fmt(pct)} %**`],
    };
  },
};

const moyenne: Skill = {
  id: 'm5-moyenne',
  tools: ['calculatrice'],
  title: 'Moyenne',
  lesson: {
    body: [
      'Moyenne = **somme des valeurs ÷ nombre de valeurs**.',
      'La moyenne est toujours comprise entre la plus petite et la plus grande valeur.',
    ],
    example: { question: 'Notes : 12, 15, 9, 14.', steps: ['Somme : 12 + 15 + 9 + 14 = 50.', '50 ÷ 4 = 12,5.'] },
    source: objective('Calculer et interpréter la moyenne simple d’une série de données'),
  },
  generate(rng, level) {
    const n = level === 1 ? rng.pick([2, 4, 5]) : rng.pick([4, 5]);
    const values = Array.from({ length: n }, () => rng.int(level === 3 ? 0 : 5, 20));
    const sum = values.reduce((s, v) => s + v, 0);
    const mean = r(sum, n);
    const what = rng.pick(['les notes de Jade', 'les points marqués par Sacha', 'les températures relevées (en °C)']);
    return {
      prompt: `Voici ${what} : ${values.join(' ; ')}. Calcule la moyenne.`,
      answer: num(mean),
      traps: traps(mean, [
        [sum, `${sum} est la somme ; il faut la diviser par le nombre de valeurs (${n}).`],
        [r(sum, n + 1), `Il y a ${n} valeurs, pas ${n + 1}.`],
        [r(sum, n - 1), `Il y a ${n} valeurs, pas ${n - 1}.`],
      ]),
      steps: [`Somme : ${values.join(' + ')} = ${sum}.`, `Moyenne : ${sum} ÷ ${n} = **${fmt(mean)}**`],
      targetSeconds: 45,
    };
  },
};

const diagrammes: Skill = {
  id: 'm5-diagrammes',
  title: 'Lire un diagramme',
  lesson: {
    body: [
      'On lit la **légende**, les **axes** et l’échelle de l’axe vertical avant de lire une valeur.',
      'Pour comparer, on regarde la hauteur des barres ; pour un pourcentage, on rapporte une valeur au total.',
    ],
    example: { question: 'Barres : Lundi 12, Mardi 8, Mercredi 20. Total ?', steps: ['12 + 8 + 20 = 40.'] },
    source: objective(
      'Lire et interpréter des informations présentées sous forme de tableaux, de diagrammes et de graphiques',
    ),
  },
  generate(rng, level) {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
    const values = distinct(rng, 5, () => rng.int(1, 12) * 2);
    const bars = days.map((label, i) => ({ label, value: values[i] ?? 0 }));
    const figure = { kind: 'bars' as const, title: 'Livres empruntés au CDI', bars };
    if (level === 1) {
      const i = rng.int(0, 4);
      const b = bars[i] ?? { label: 'Lun', value: 0 };
      return {
        prompt: `Combien de livres ont été empruntés ${b.label === 'Lun' ? 'lundi' : b.label === 'Mar' ? 'mardi' : b.label === 'Mer' ? 'mercredi' : b.label === 'Jeu' ? 'jeudi' : 'vendredi'} ?`,
        figure,
        answer: num(b.value),
        steps: [`On lit la hauteur de la barre « ${b.label} » sur l’axe vertical : **${b.value}**.`],
        targetSeconds: 15,
      };
    }
    if (level === 2) {
      const max = bars.reduce((m, b) => (b.value > m.value ? b : m));
      return {
        prompt: 'Quel jour a-t-on emprunté le plus de livres ?',
        figure,
        ...choice(
          rng,
          max.label,
          bars
            .filter((b) => b.label !== max.label)
            .map((b) => ({ label: b.label, why: `La barre la plus haute est celle de ${max.label} (${max.value}).` })),
          true,
        ),
        steps: [`La barre la plus haute est « ${max.label} » : **${max.value}** livres.`],
      };
    }
    const total = values.reduce((s, v) => s + v, 0);
    return {
      prompt: 'Combien de livres ont été empruntés en tout sur la semaine ?',
      figure,
      answer: num(total),
      traps: traps(r(total), [
        [Math.max(...values), 'C’est seulement la plus grande barre ; il faut additionner toutes les barres.'],
      ]),
      steps: [`${values.join(' + ')} = **${total}**`],
      targetSeconds: 40,
    };
  },
};

/* ───────────────────────── Probabilités ───────────────────────── */

const probaVocab: Skill = {
  id: 'm5-probas-vocab',
  title: 'Vocabulaire des probabilités',
  lesson: {
    body: [
      'Une **expérience aléatoire** a plusieurs résultats possibles, les **issues** ; on ne peut pas prévoir lequel sortira.',
      'Un **évènement** est un ensemble d’issues. Impossible : probabilité 0. Certain : probabilité 1.',
      'Toute probabilité est comprise entre 0 et 1.',
    ],
    example: {
      question: 'Obtenir 7 avec un dé à 6 faces ?',
      steps: ['Aucune face ne porte 7 : évènement impossible, probabilité 0.'],
    },
    source: objective(
      'Utiliser le vocabulaire des probabilités dans des contextes concrets : expérience aléatoire, issue, évènement',
    ),
  },
  generate(rng, level) {
    const items = [
      {
        t: 'Obtenir 7 en lançant un dé à six faces est un évènement…',
        a: 'impossible',
        w: ['certain', 'probable', 'équiprobable'],
      },
      {
        t: 'Obtenir un nombre entre 1 et 6 en lançant un dé à six faces est un évènement…',
        a: 'certain',
        w: ['impossible', 'peu probable', 'rare'],
      },
      {
        t: 'Lancer une pièce et regarder la face obtenue est…',
        a: 'une expérience aléatoire',
        w: ['un évènement certain', 'un calcul', 'un évènement impossible'],
      },
      {
        t: 'Avec un dé, « obtenir 4 » est…',
        a: 'une issue',
        w: ['une expérience aléatoire', 'un évènement impossible', 'une probabilité'],
      },
      {
        t: 'Une probabilité est toujours…',
        a: 'comprise entre 0 et 1',
        w: ['supérieure à 1', 'un nombre entier', 'égale à {1/2}'],
      },
    ];
    const pool = level === 1 ? items.slice(0, 2) : items;
    const it = rng.pick(pool);
    return {
      prompt: it.t,
      ...choice(
        rng,
        it.a,
        it.w.map((label) => ({ label, why: `La bonne réponse : ${it.a}.` })),
      ),
      steps: [`${it.t} **${it.a}**.`],
      targetSeconds: 15,
    };
  },
};

const probaCalcul: Skill = {
  id: 'm5-probas-calcul',
  title: 'Calculer une probabilité',
  advice: 'brouillon',
  lesson: {
    body: [
      'Si toutes les issues ont la même chance (équiprobabilité) : P = **nombre d’issues favorables ÷ nombre d’issues possibles**.',
      '« Une chance sur quatre » ⇔ probabilité {1/4} = 0,25 = 25 %.',
    ],
    example: {
      question: 'Urne : 3 boules rouges, 5 bleues. P(rouge) ?',
      steps: ['8 boules en tout, 3 rouges.', 'P = {3/8}.'],
    },
    source: objective('Attribuer des probabilités dans des cas simples (équiprobabilité)'),
  },
  generate(rng, level) {
    if (level === 1) {
      const events = [
        { t: 'obtenir 3', fav: 1 },
        { t: 'obtenir un nombre pair', fav: 3 },
        { t: 'obtenir un nombre strictement supérieur à 4', fav: 2 },
        { t: 'obtenir un multiple de 3', fav: 2 },
      ];
      const e = rng.pick(events);
      const p = r(e.fav, 6);
      return {
        prompt: `On lance un dé équilibré à six faces. Quelle est la probabilité d’${e.t} ?`,
        answer: fraction(p),
        traps: traps(p, [
          [r(6, e.fav), 'C’est favorables ÷ possibles, pas l’inverse.'],
          [r(e.fav, 5), 'Un dé a 6 faces, donc 6 issues possibles.'],
        ]),
        steps: [
          `Issues possibles : 6. Issues favorables : ${e.fav}.`,
          `P = {${e.fav}/6}${p.d !== 6 ? ` = ${frac(p)}` : ''}`,
        ],
      };
    }
    if (level === 2) {
      const red = rng.int(1, 8);
      const blue = rng.int(1, 8);
      const p = r(red, red + blue);
      return {
        prompt: `Une urne contient ${red} boule${red > 1 ? 's' : ''} rouge${red > 1 ? 's' : ''} et ${blue} boule${blue > 1 ? 's' : ''} bleue${blue > 1 ? 's' : ''}. On tire une boule au hasard. Quelle est la probabilité qu’elle soit rouge ?`,
        answer: fraction(p),
        traps: traps(p, [
          [r(red, blue), `On divise par le nombre **total** de boules (${red + blue}), pas par le nombre de bleues.`],
        ]),
        steps: [`${red + blue} boules en tout, dont ${red} rouges.`, `P(rouge) = {${red}/${red + blue}}`],
      };
    }
    const n = rng.pick([2, 4, 5, 10]);
    const p = r(1, n);
    return {
      prompt: `Il y a « une chance sur ${n} » de gagner. Écris cette probabilité sous forme décimale.`,
      answer: num(p),
      traps: traps(p, [
        [r(n), `Une chance sur ${n}, c’est 1 ÷ ${n}.`],
        [mul(p, r(100)), 'C’est le pourcentage ; on demande l’écriture décimale.'],
      ]),
      steps: [`P = {1/${n}} = 1 ÷ ${n} = **${fmt(p)}**`],
    };
  },
};

const probaFrequence: Skill = {
  id: 'm5-probas-frequences',
  title: 'Échelle de probabilité et fréquences',
  lesson: {
    body: [
      'Sur l’échelle de probabilité : 0 = impossible, {1/2} = une chance sur deux (pile ou face), 1 = certain. Très peu probable : proche de 0 ; presque sûr : proche de 1.',
      'En répétant une expérience, on calcule la **fréquence** d’un résultat : nombre d’apparitions ÷ nombre de lancers. Elle se rapproche de la probabilité quand on répète beaucoup.',
    ],
    example: { question: 'Sur 50 lancers, 23 piles. Fréquence ?', steps: ['23 ÷ 50 = 0,46.'] },
    source: objective(
      'Positionner sur une échelle de probabilité des évènements. Répéter matériellement une expérience aléatoire simple. Enregistrer les résultats observés dans un tableau d’effectifs et de fréquences',
    ),
  },
  generate(rng, level) {
    if (level <= 2) {
      const items = [
        { t: 'obtenir pile en lançant une pièce équilibrée', a: '{1/2}' },
        { t: 'obtenir 10 fois de suite la valeur 1 avec un dé', a: 'proche de 0' },
        { t: 'ne pas trouver la bonne combinaison au loto', a: 'proche de 1' },
        { t: 'obtenir 2 en lançant un dé équilibré', a: '{1/6}' },
        { t: 'un évènement impossible', a: '0' },
        { t: 'un évènement certain', a: '1' },
      ];
      const it = rng.pick(items);
      const all = ['0', 'proche de 0', '{1/6}', '{1/2}', 'proche de 1', '1'];
      return {
        prompt: `Où placer « ${it.t} » sur l’échelle de probabilité ?`,
        ...choice(
          rng,
          it.a,
          all
            .filter((x) => x !== it.a)
            .slice(0, 3)
            .map((label) => ({ label, why: `La bonne position est ${it.a}.` })),
        ),
        steps: [`« ${it.t} » : **${it.a}**.`],
      };
    }
    const throws = rng.pick([20, 25, 50]);
    const success = rng.int(Math.round(throws * 0.3), Math.round(throws * 0.7));
    const f = r(success, throws);
    return {
      prompt: `On lance ${throws} fois une pièce et on obtient ${success} fois pile. Quelle est la fréquence de « pile » (en décimal) ?`,
      answer: num(f),
      traps: traps(f, [
        [dec(5, 1), '0,5 est la probabilité théorique ; la fréquence observée se calcule avec les résultats obtenus.'],
        [r(throws, success), 'Fréquence = nombre de piles ÷ nombre de lancers.'],
      ]),
      steps: [`Fréquence = ${success} ÷ ${throws} = **${fmt(f)}**`],
    };
  },
};

/* ───────────────────────── Proportionnalité ───────────────────────── */

const reconnaitre: Skill = {
  id: 'm5-propor-reconnaitre',
  title: 'Reconnaître la proportionnalité',
  lesson: {
    body: [
      'Un tableau est de proportionnalité si l’on passe de la 1re ligne à la 2e en **multipliant toujours par le même nombre** (le coefficient).',
      'Graphiquement : une situation de proportionnalité est représentée par des points **alignés avec l’origine**.',
    ],
    example: {
      question: '2 → 6 ; 5 → 15 ; 7 → 21 ?',
      steps: ['6 ÷ 2 = 3 ; 15 ÷ 5 = 3 ; 21 ÷ 7 = 3.', 'Même coefficient 3 : proportionnel.'],
    },
    source: objective(
      'Reconnaitre une situation de proportionnalité à partir d’un tableau ou d’un graphique. Reconnaitre graphiquement qu’un nuage de points est ou n’est pas associé à une situation de proportionnalité',
    ),
  },
  generate(rng, level) {
    const k = level === 1 ? rng.int(2, 9) : dec(rng.int(12, 45), 1);
    const xs = distinct(rng, 3, () => rng.int(1, 10)).toSorted((a, b) => a - b);
    const isProp = rng.next() < 0.5;
    const ys: Rational[] = xs.map((x) => mul(r(x), typeof k === 'number' ? r(k) : k));
    if (!isProp) {
      const i = rng.int(1, 2);
      ys[i] = add(ys[i] ?? r(0), r(rng.pick([1, 2, -1])));
    }
    if (level === 3) {
      return {
        prompt: 'Ce graphique représente-t-il une situation de proportionnalité ?',
        figure: {
          kind: 'chart',
          xLabel: 'Quantité',
          yLabel: 'Prix (€)',
          points: [
            { x: 0, y: isProp ? 0 : 2 },
            ...xs.map((x, i) => ({ x, y: (ys[i]?.n ?? 0) / (ys[i]?.d ?? 1) + (isProp ? 0 : 2) })),
          ],
          line: true,
        },
        ...trueFalse(
          isProp,
          isProp
            ? 'Les points sont alignés avec l’origine : proportionnel.'
            : 'La droite ne passe pas par l’origine : pas proportionnel.',
        ),
        steps: [
          isProp
            ? 'Points alignés **et** droite passant par l’origine ⇒ **proportionnel**.'
            : 'La droite ne passe pas par l’origine (0 ; 0) ⇒ **pas proportionnel**.',
        ],
      };
    }
    const ratios = xs.map((x, i) => div(ys[i] ?? r(0), r(x)));
    return {
      prompt: 'Ce tableau est-il un tableau de proportionnalité ?',
      figure: {
        kind: 'table',
        header: true,
        rows: [
          ['Quantité', ...xs.map(String)],
          ['Prix (€)', ...ys.map((y) => fmt(y))],
        ],
      },
      ...trueFalse(
        isProp,
        isProp ? 'On multiplie toujours par le même nombre.' : 'Les quotients prix ÷ quantité ne sont pas tous égaux.',
      ),
      steps: [
        `Quotients : ${xs.map((x, i) => `${fmt(ys[i] ?? r(0))} ÷ ${x} = ${(ratios[i]?.d ?? 1) <= 1000 && 10 ** 6 % (ratios[i]?.d ?? 1) === 0 ? fmt(ratios[i] ?? r(0)) : '≈ ' + ((ratios[i]?.n ?? 0) / (ratios[i]?.d ?? 1)).toFixed(2).replace('.', ',')}`).join(' ; ')}.`,
        isProp ? 'Tous égaux ⇒ **proportionnel**.' : 'Pas tous égaux ⇒ **pas proportionnel**.',
      ],
      targetSeconds: 40,
    };
  },
};

const quatrieme: Skill = {
  id: 'm5-propor-calcul',
  tools: ['calculatrice'],
  title: 'Calculer avec la proportionnalité',
  lesson: {
    body: [
      '**Linéarité** : si 4 personnes → 300 g, alors 2 personnes → 150 g (÷ 2) et 6 personnes → 150 + 300 = 450 g.',
      '**Retour à l’unité** : on calcule pour 1, puis on multiplie : 3 kg à 7,50 € → 1 kg à 2,50 €.',
    ],
    example: {
      question: 'Recette pour 4 : 200 g de farine. Pour 6 ?',
      steps: ['Pour 2 : 100 g.', 'Pour 6 = 4 + 2 : 200 + 100 = 300 g.'],
    },
    source: objective(
      'Dans des situations simples, mobiliser une procédure adaptée (propriété de linéarité pour la multiplication ou l’addition, retour à l’unité) pour résoudre un problème lié à la proportionnalité',
    ),
  },
  generate(rng, level) {
    if (level === 3) {
      const unit = dec(rng.int(15, 60) * 5, 2);
      const qty = dec(rng.int(11, 59), 1);
      const price = mul(unit, qty);
      return {
        prompt: `Les tomates coûtent ${fmt(unit)} € le kilogramme. Combien coûtent ${fmt(qty)} kg de tomates (en €) ?`,
        answer: num(price, '€'),
        traps: traps(price, [[add(unit, qty), 'On multiplie le prix d’un kilogramme par la masse.']]),
        steps: [`Prix = ${fmt(unit)} × ${fmt(qty)} = **${fmt(price)}** €`],
      };
    }
    const people = 4;
    const target = level === 1 ? rng.pick([2, 8, 12]) : rng.pick([6, 10, 3]);
    const q = rng.int(2, 9) * (level === 2 ? 20 : 25);
    const v = mul(r(q), r(target, people));
    const ingr = rng.pick(['g de farine', 'g de sucre', 'mL de lait']);
    return {
      prompt: `Une recette pour ${people} personnes demande ${q} ${ingr}. Combien en faut-il pour ${target} personnes ?`,
      answer: num(v),
      traps: traps(v, [
        [q + (target - people), `Ce n’est pas une addition : la quantité est proportionnelle au nombre de personnes.`],
      ]),
      steps: [
        `Pour 1 personne : ${q} ÷ ${people} = ${fmt(r(q, people))}.`,
        `Pour ${target} personnes : ${fmt(r(q, people))} × ${target} = **${fmt(v)}**`,
      ],
    };
  },
};

const pourcentages: Skill = {
  id: 'm5-pourcentages',
  tools: ['calculatrice'],
  title: 'Pourcentages',
  lesson: {
    body: [
      'Prendre t % d’un nombre, c’est le multiplier par {t/100}.',
      '50 % = la moitié ; 10 % = diviser par 10 ; 1 % = diviser par 100 ; 25 % = le quart.',
      'Pourcentage d’une part : part ÷ total × 100.',
    ],
    example: { question: '6 voix sur 24 : quel pourcentage ?', steps: ['6 ÷ 24 = 0,25.', '0,25 × 100 = 25 %.'] },
    source:
      objective('Utiliser des proportions, des pourcentages. Calculer, appliquer des proportions, des pourcentages') +
      ' ; automatisme : « Prendre 1 %, 10 % ou 50 % d’un nombre »',
  },
  generate(rng, level) {
    if (level === 3) {
      const total = rng.pick([20, 25, 40, 50]);
      const part = rng.int(1, total - 1);
      const pct = mul(r(part, total), r(100));
      return {
        prompt: `Lors d’une élection, un candidat obtient ${part} voix sur ${total}. Quel pourcentage des voix obtient-il ?`,
        answer: num(pct, '%'),
        traps: traps(pct, [
          [r(part, total), 'C’est la proportion ; en pourcentage on multiplie par 100.'],
          [part, 'C’est le nombre de voix, pas le pourcentage.'],
        ]),
        steps: [`${part} ÷ ${total} = ${fmt(r(part, total))}.`, `× 100 : **${fmt(pct)} %**`],
      };
    }
    const t = rng.pick(level === 1 ? [10, 50] : [1, 10, 25, 50, 20]);
    const x = rng.int(2, 40) * (level === 1 ? 10 : 4);
    const v = mul(r(x), r(t, 100));
    return {
      prompt: `Calcule ${t} % de ${x}.`,
      answer: num(v),
      traps: traps(v, [
        [r(x, t), `${t} % de ${x} = ${x} × ${t} ÷ 100, pas ${x} ÷ ${t}.`],
        [x - t, 'Un pourcentage n’est pas une soustraction.'],
      ]),
      steps: [`${t} % de ${x} = ${x} × {${t}/100} = **${fmt(v)}**`],
      targetSeconds: 15,
    };
  },
};

const coefficient: Skill = {
  id: 'm5-coefficient',
  tools: ['calculatrice'],
  title: 'Prix unitaire, vitesse, échelle',
  lesson: {
    body: [
      '**Prix unitaire** = prix total ÷ quantité. **Vitesse moyenne** = distance ÷ durée (en km/h si km et h).',
      '**Échelle** 1/100 000 : 1 cm sur la carte représente 100 000 cm = 1 km en réalité.',
    ],
    example: { question: '150 km en 2 h : vitesse moyenne ?', steps: ['150 ÷ 2 = 75 km/h.'] },
    source: objective(
      'Utiliser un coefficient de proportionnalité dans des contextes concrets (prix unitaire, vitesse moyenne, échelle, etc.)',
    ),
  },
  generate(rng, level) {
    if (level === 1) {
      const unit = dec(rng.int(5, 40) * 5, 2);
      const n = rng.int(2, 8);
      const total = mul(unit, r(n));
      return {
        prompt: `${n} cahiers coûtent ${fmt(total)} €. Quel est le prix d’un cahier (en €) ?`,
        answer: num(unit, '€'),
        traps: traps(unit, [[mul(total, r(n)), 'On cherche le prix pour **un** cahier : on divise.']]),
        steps: [`Prix unitaire = ${fmt(total)} ÷ ${n} = **${fmt(unit)}** €`],
      };
    }
    if (level === 2) {
      const v = rng.int(4, 18) * 5;
      const h = rng.pick([2, 3, 4, dec(15, 1), dec(5, 1)] as const);
      const H = typeof h === 'number' ? r(h) : h;
      const d = mul(r(v), H);
      return {
        prompt: `Un car parcourt ${fmt(d)} km en ${fmt(H)} h. Quelle est sa vitesse moyenne (en km/h) ?`,
        answer: num(v, 'km/h'),
        traps: traps(r(v), [[mul(d, H), 'Vitesse = distance ÷ durée.']]),
        steps: [`v = ${fmt(d)} ÷ ${fmt(H)} = **${v}** km/h`],
      };
    }
    const scale = rng.pick([25000, 50000, 100000]);
    const cm = dec(rng.int(2, 24), 0);
    const realKm = mul(cm, r(scale, 100000));
    return {
      prompt: `Sur une carte à l’échelle 1/${fmt(scale)}, deux villages sont à ${fmt(cm)} cm. Quelle est la distance réelle (en km) ?`,
      answer: num(realKm, 'km'),
      traps: traps(realKm, [
        [mul(cm, r(scale)), `${fmt(mul(cm, r(scale)))} est en **cm** : il faut convertir en km (÷ 100 000).`],
        [mul(cm, r(scale, 1000)), 'Conversion : 1 km = 100 000 cm.'],
      ]),
      steps: [
        `Distance réelle : ${fmt(cm)} × ${fmt(scale)} = ${fmt(mul(cm, r(scale)))} cm.`,
        `En km (÷ 100 000) : **${fmt(realKm)}** km`,
      ],
    };
  },
};

/* ───────────────────────── Fonctions ───────────────────────── */

const formuleValeurs: Skill = {
  id: 'm5-fonctions-formule',
  title: 'Grandeur en fonction d’une autre',
  lesson: {
    body: [
      '« Le périmètre P **en fonction** du côté c » : une formule donne P à partir de c, par exemple P = 4 × c.',
      'Pour remplir un tableau de valeurs, on remplace la variable par chaque valeur.',
    ],
    example: { question: 'Prix = 3 × n + 2 (n tickets). Pour n = 5 ?', steps: ['3 × 5 + 2 = 17.'] },
    source: objective(
      'Introduire l’expression « en fonction de ». Traduire la relation de dépendance entre deux grandeurs par un tableau de valeurs à partir d’une formule',
    ),
  },
  generate(rng, level) {
    const forms = [
      {
        f: (c: number) => 4 * c,
        txt: 'P = 4 × c',
        what: 'Le périmètre P d’un carré en fonction de son côté c',
        v: 'c',
      },
      {
        f: (n: number) => 3 * n + 2,
        txt: 'P = 3 × n + 2',
        what: 'Le prix P (en €) en fonction du nombre n de tickets',
        v: 'n',
      },
      {
        f: (t: number) => 60 * t,
        txt: 'd = 60 × t',
        what: 'La distance d (en km) en fonction de la durée t (en h)',
        v: 't',
      },
      { f: (x: number) => x * x, txt: 'A = x^2', what: 'L’aire A d’un carré en fonction de son côté x', v: 'x' },
    ];
    const f = rng.pick(level === 1 ? forms.slice(0, 2) : forms);
    const x = rng.int(2, level === 3 ? 12 : 9);
    const v = f.f(x);
    return {
      prompt: `${f.what} est donné par ${f.txt}. Calcule la valeur pour ${f.v} = ${x}.`,
      answer: num(v),
      steps: [`On remplace ${f.v} par ${x} dans ${f.txt}.`, `Résultat : **${v}**`],
      targetSeconds: 20,
    };
  },
};

const lireGraphique: Skill = {
  id: 'm5-fonctions-graphique',
  title: 'Lire un graphique',
  lesson: {
    body: [
      'Pour lire une image : on part de la valeur sur l’axe horizontal, on monte jusqu’à la courbe, puis on lit sur l’axe vertical.',
      'Pour lire un antécédent, on fait le chemin inverse.',
    ],
    example: {
      question: 'Température à 14 h ?',
      steps: ['On part de 14 sur l’axe horizontal, on monte jusqu’à la courbe, on lit 18 °C.'],
    },
    source: objective('Lire et interpréter un graphique cartésien donné par une courbe ou un nuage de points'),
  },
  generate(rng, level) {
    const hours = [8, 10, 12, 14, 16, 18];
    let t = rng.int(4, 10);
    const temps = hours.map((_, i) => {
      if (i > 0) t += rng.pick([-2, 2, 4, 2, -2, 0]);
      return t;
    });
    const points = hours.map((x, i) => ({ x, y: temps[i] ?? 0 }));
    const figure = { kind: 'chart' as const, xLabel: 'Heure (h)', yLabel: 'Température (°C)', points, line: true };
    const i = rng.int(0, 5);
    const p = points[i] ?? { x: 8, y: 0 };
    if (level === 3) {
      const max = points.reduce((m, q) => (q.y > m.y ? q : m));
      return {
        prompt: 'À quelle heure la température a-t-elle été la plus élevée ?',
        figure,
        answer: num(max.x, 'h'),
        traps: traps(r(max.x), [[max.y, `${max.y} est la température maximale ; on demande l’**heure**.`]]),
        steps: [`Le point le plus haut a pour abscisse ${max.x} : à **${max.x} h** (${max.y} °C).`],
      };
    }
    return {
      prompt: `Quelle température faisait-il à ${p.x} h (en °C) ?`,
      figure,
      answer: num(p.y, '°C'),
      traps: traps(r(p.y), [[p.x, 'Ça, c’est l’heure : on lit la température sur l’axe vertical.']]),
      steps: [`On part de ${p.x} h sur l’axe horizontal, on monte jusqu’à la courbe, on lit **${p.y} °C**.`],
      targetSeconds: 20,
    };
  },
};

/* ───────────────────────── Pensée informatique ───────────────────────── */

const blocsValeur: Skill = {
  id: 'm5-blocs-valeur',
  title: 'Prévoir le résultat d’un programme',
  advice: 'brouillon',
  lesson: {
    body: [
      'On exécute les blocs **dans l’ordre**, en notant la valeur des variables après chaque bloc.',
      '« mettre a à … » remplace la valeur ; « ajouter 2 à a » augmente a de 2.',
    ],
    example: {
      question: 'a ← 4 ; a ← a × 3 ; ajouter 2 à a ; dire a.',
      steps: ['a = 4, puis 12, puis 14.', 'Le lutin dit 14.'],
    },
    source: objective(
      'Prévoir la valeur d’une expression informatique avant son exécution. Identifier les entrées et sorties d’un programme',
    ),
  },
  generate(rng, level) {
    const input = rng.int(2, 9);
    const m = rng.int(2, 5);
    const k = rng.int(1, 9);
    const program: Block[] = [
      { op: 'ask', text: 'Choisis un nombre', answer: input },
      { op: 'set', variable: 'a', expr: `réponse × ${m}` },
      { op: 'change', variable: 'a', by: String(k) },
    ];
    let a = input * m + k;
    const s = rng.int(1, 5);
    if (level >= 2) {
      program.push({ op: 'set', variable: 'b', expr: `a − ${s}` });
      program.push({ op: 'say', expr: 'b' });
      a = a - s;
    } else {
      program.push({ op: 'say', expr: 'a' });
    }
    if (level === 3) {
      program.splice(program.length - 1, 0, { op: 'set', variable: 'b', expr: 'b × 2' });
      a *= 2;
    }
    return {
      prompt: `On répond ${input} à la question. Que dit le lutin à la fin ?`,
      figure: { kind: 'blocks', program },
      answer: num(a),
      traps: traps(r(a), [
        [input * m, `N’oublie pas le bloc « ajouter ${k} à a ».`],
        [input + m + k, `« réponse × ${m} » est une multiplication.`],
      ]),
      steps: [
        `réponse = ${input} ; a = ${input} × ${m} = ${input * m} ; puis a = ${input * m + k}.`,
        ...(level >= 2
          ? [
              `b = ${input * m + k} − ${s} = ${input * m + k - s}${level === 3 ? `, puis b = ${input * m + k - s} × 2 = ${(input * m + k - s) * 2}` : ''}.`,
            ]
          : []),
        `Le lutin dit **${a}**.`,
      ],
      targetSeconds: 40,
    };
  },
};

const blocsBoucle: Skill = {
  id: 'm5-blocs-boucle',
  title: 'Boucle « répéter »',
  advice: 'brouillon',
  lesson: {
    body: [
      '« répéter n fois » exécute les blocs à l’intérieur **n fois de suite**.',
      'x ← 2 ; répéter 4 fois : ajouter 3 à x → x vaut 2 + 4 × 3 = 14.',
    ],
    example: { question: 'x ← 1 ; répéter 3 fois : x ← x × 2.', steps: ['1 → 2 → 4 → 8.', 'x vaut 8.'] },
    source: objective(
      'Effectuer une boucle inconditionnelle simple permettant de répéter une séquence linéaire d’instructions un nombre précis de fois',
    ),
  },
  generate(rng, level) {
    const start = rng.int(0, 10);
    const n = rng.int(2, level === 1 ? 4 : 6);
    if (level === 3) {
      const m = 2;
      const begin = rng.int(1, 3);
      const v = begin * m ** n;
      return {
        prompt: 'Que dit le lutin à la fin ?',
        figure: {
          kind: 'blocks',
          program: [
            { op: 'set', variable: 'x', expr: String(begin) },
            { op: 'repeat', times: n, body: [{ op: 'set', variable: 'x', expr: 'x × 2' }] },
            { op: 'say', expr: 'x' },
          ],
        },
        answer: num(v),
        traps: traps(r(v), [
          [begin * 2 * n, `x est **doublé** à chaque tour (× 2 répété ${n} fois), on n’ajoute pas.`],
        ]),
        steps: [
          `x : ${Array.from({ length: n + 1 }, (_, i) => begin * 2 ** i).join(' → ')}.`,
          `Le lutin dit **${v}**.`,
        ],
      };
    }
    const k = rng.int(2, 9);
    const v = start + n * k;
    return {
      prompt: 'Que dit le lutin à la fin ?',
      figure: {
        kind: 'blocks',
        program: [
          { op: 'set', variable: 'x', expr: String(start) },
          { op: 'repeat', times: n, body: [{ op: 'change', variable: 'x', by: String(k) }] },
          { op: 'say', expr: 'x' },
        ],
      },
      answer: num(v),
      traps: traps(r(v), [
        [start + k, `Le bloc est répété ${n} fois, pas une seule.`],
        [n * k, `x commence à ${start}.`],
      ]),
      steps: [
        `x commence à ${start}, puis on ajoute ${k} ${n} fois : ${start} + ${n} × ${k}.`,
        `Le lutin dit **${v}**.`,
      ],
      targetSeconds: 30,
    };
  },
};

export const statistiques: Chapter = {
  id: 'm5-statistiques',
  subject: 'maths',
  domain: 'donnees',
  title: 'Statistiques',
  skills: [effectifs, moyenne, diagrammes],
};
export const probabilites: Chapter = {
  id: 'm5-probabilites',
  subject: 'maths',
  domain: 'donnees',
  title: 'Probabilités',
  skills: [probaVocab, probaCalcul, probaFrequence],
};
export const proportionnalite: Chapter = {
  id: 'm5-proportionnalite',
  subject: 'maths',
  domain: 'fonctions',
  title: 'Proportionnalité',
  skills: [reconnaitre, quatrieme, pourcentages, coefficient],
};
export const fonctions: Chapter = {
  id: 'm5-fonctions',
  subject: 'maths',
  domain: 'fonctions',
  title: 'Fonctions',
  skills: [formuleValeurs, lireGraphique],
};
export const algorithmique: Chapter = {
  id: 'm5-algorithmique',
  subject: 'maths',
  domain: 'informatique',
  title: 'Programmation',
  skills: [blocsValeur, blocsBoucle],
};
