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
    memo: [
      '**Effectif** = « combien ». 6 élèves font du judo : l’effectif du judo est 6. L’effectif total, c’est tout le monde.',
      '**Fréquence** = « combien sur le total » : 6 sur 24 → {6/24}. En pourcentage : 6 ÷ 24 = 0,25 = 25 %.',
    ],
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
        hint: 'L’effectif total, c’est tout le monde : additionne tous les effectifs.',
        steps: [
          'L’effectif total, c’est le nombre d’élèves en tout : on additionne toutes les cases.',
          `${counts.join(' + ')} = **${total}**`,
        ],
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
        hint: `La fréquence, c’est « combien sur le total ». Combien font « ${cat} » ? Et combien d’élèves en tout ?`,
        steps: [
          `« ${cat} » : ${c} élèves. En tout : ${total} élèves.`,
          `Fréquence = ${c} sur ${total}, c’est-à-dire **{${c}/${total}}**${f.d !== total ? ` (ou **${frac(f)}** en simplifiant)` : ''}.`,
        ],
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
      hint: `Calcule ${c} ÷ ${total}, puis multiplie par 100 pour avoir un pourcentage.`,
      steps: [
        `« ${cat} » : ${c} élèves sur ${total}.`,
        `${c} ÷ ${total} = ${fmt(f)}.`,
        `Un pourcentage, c’est « sur 100 » : ${fmt(f)} × 100 = **${fmt(pct)} %**`,
      ],
    };
  },
};

const moyenne: Skill = {
  id: 'm5-moyenne',
  tools: ['calculatrice'],
  title: 'Moyenne',
  lesson: {
    memo: [
      'La moyenne, c’est ce que chacun aurait si on mettait tout en commun et qu’on **partageait équitablement**.',
      'On additionne tout, puis on divise par le nombre de valeurs : 12, 15, 9, 14 → 50 ÷ 4 = 12,5.',
      'Vérifie : la moyenne est toujours entre la plus petite et la plus grande valeur.',
    ],
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
      hint: `Additionne toutes les valeurs, puis partage entre les ${n} valeurs.`,
      steps: [
        `On met tout en commun : ${values.join(' + ')} = ${sum}.`,
        `On partage équitablement entre les ${n} valeurs : ${sum} ÷ ${n} = ${fmt(mean)}.`,
        `Vérification : ${fmt(mean)} est bien entre ${Math.min(...values)} et ${Math.max(...values)}. La moyenne est **${fmt(mean)}**.`,
      ],
      targetSeconds: 45,
    };
  },
};

const diagrammes: Skill = {
  id: 'm5-diagrammes',
  title: 'Lire un diagramme',
  lesson: {
    memo: [
      'Avant de lire, regarde le **titre** et l’**axe vertical** : de combien en combien avance-t-il ?',
      'Pour lire une barre, suis le haut de la barre à l’horizontale jusqu’à l’axe, avec ta règle ou ton doigt.',
    ],
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
        hint: `Pose ton doigt en haut de la barre « ${b.label} » et glisse à l’horizontale jusqu’à l’axe de gauche.`,
        steps: [
          `On repère la barre « ${b.label} ».`,
          'On suit le haut de la barre à l’horizontale jusqu’à l’axe de gauche.',
          `On lit **${b.value}** livres.`,
        ],
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
        hint: 'Cherche la barre la plus haute.',
        steps: [
          'Le jour où on a emprunté le plus de livres, c’est celui de la barre la plus haute.',
          `La plus haute est celle de **${max.label}**, avec ${max.value} livres.`,
        ],
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
      hint: 'Lis chaque barre, puis additionne tout.',
      steps: [
        `On lit chaque barre : ${bars.map((b) => `${b.label} ${b.value}`).join(', ')}.`,
        `On additionne : ${values.join(' + ')} = **${total}**`,
      ],
      targetSeconds: 40,
    };
  },
};

/* ───────────────────────── Probabilités ───────────────────────── */

const probaVocab: Skill = {
  id: 'm5-probas-vocab',
  title: 'Vocabulaire des probabilités',
  lesson: {
    memo: [
      'Lancer un dé, c’est une **expérience aléatoire** : on ne peut pas savoir à l’avance ce qui va sortir.',
      'Chaque résultat possible (1, 2, 3…) est une **issue**. « Obtenir 7 » avec un dé est **impossible** (probabilité 0) ; « obtenir entre 1 et 6 » est **certain** (probabilité 1).',
    ],
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
      hint: 'Imagine que tu fais vraiment l’expérience : qu’est-ce qui peut arriver ?',
      steps: [
        'On imagine qu’on fait vraiment l’expérience.',
        it.a === 'impossible'
          ? 'Aucune face du dé ne porte 7 : ça ne peut jamais arriver.'
          : it.a === 'certain'
            ? 'Toutes les faces portent un nombre entre 1 et 6 : ça arrive à tous les coups.'
            : it.a === 'une expérience aléatoire'
              ? 'On ne peut pas savoir à l’avance si on aura pile ou face : c’est le hasard.'
              : it.a === 'une issue'
                ? '« Obtenir 4 », c’est un des résultats possibles du lancer.'
                : 'Une probabilité va de 0 (jamais) à 1 (à coup sûr).',
        `${it.t} **${it.a}**.`,
      ],
      targetSeconds: 15,
    };
  },
};

const probaCalcul: Skill = {
  id: 'm5-probas-calcul',
  title: 'Calculer une probabilité',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Probabilité = **ce qui m’arrange** sur **tout ce qui peut arriver**.',
      'Urne de 3 boules rouges et 5 bleues : 3 rouges m’arrangent, sur 8 boules en tout → {3/8}.',
      '« Une chance sur 4 », c’est {1/4} = 0,25 = 25 %.',
    ],
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
        hint: `Combien de faces t’arrangent pour « ${e.t} » ? Et combien de faces en tout ?`,
        steps: [
          'Tout ce qui peut arriver : les 6 faces du dé.',
          `Ce qui m’arrange (« ${e.t} ») : ${e.fav === 1 ? 'la face 3' : e.fav === 3 ? 'les faces 2, 4 et 6' : e.t.includes('supérieur') ? 'les faces 5 et 6' : 'les faces 3 et 6'}, soit ${e.fav} face${e.fav > 1 ? 's' : ''}.`,
          `P = ${e.fav} sur 6 = **{${e.fav}/6}**${p.d !== 6 ? ` (ou **${frac(p)}** en simplifiant)` : ''}`,
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
        hint: 'Combien de boules rouges ? Et combien de boules en tout (rouges + bleues) ?',
        steps: [
          `Tout ce qui peut sortir : ${red} + ${blue} = ${red + blue} boules.`,
          `Ce qui m’arrange : les ${red} boule${red > 1 ? 's' : ''} rouge${red > 1 ? 's' : ''}.`,
          `P(rouge) = ${red} sur ${red + blue} = **{${red}/${red + blue}}**${p.d !== red + blue ? ` (ou **${frac(p)}**)` : ''}`,
        ],
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
      hint: `« Une chance sur ${n} », c’est la fraction {1/${n}}, c’est-à-dire 1 ÷ ${n}.`,
      steps: [
        `« Une chance sur ${n} » s’écrit {1/${n}}.`,
        `La barre de fraction est une division : 1 ÷ ${n} = **${fmt(p)}**`,
      ],
    };
  },
};

const probaFrequence: Skill = {
  id: 'm5-probas-frequences',
  title: 'Échelle de probabilité et fréquences',
  lesson: {
    memo: [
      'L’échelle va de **0 (jamais)** à **1 (à coup sûr)**. Au milieu, {1/2} : une chance sur deux, comme pile ou face.',
      'La **fréquence**, c’est ce qu’on a vraiment observé : 23 piles sur 50 lancers → 23 ÷ 50 = 0,46. Si on lance beaucoup, elle se rapproche de 0,5.',
    ],
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
        hint: 'Ça arrive jamais (0), rarement (proche de 0), une fois sur deux ({1/2}), presque toujours (proche de 1) ou toujours (1) ?',
        steps: [
          'L’échelle va de 0 (jamais) à 1 (toujours), avec {1/2} au milieu (une fois sur deux).',
          it.a === '{1/2}'
            ? 'Pile ou face : une chance sur deux.'
            : it.a === '{1/6}'
              ? 'Une face sur les 6 du dé : une chance sur 6.'
              : it.a === 'proche de 0'
                ? 'C’est possible, mais il faudrait beaucoup de chance : ça n’arrive presque jamais.'
                : it.a === 'proche de 1'
                  ? 'Gagner au loto est très rare, donc perdre arrive presque toujours.'
                  : it.a === '0'
                    ? 'Impossible : ça n’arrive jamais.'
                    : 'Certain : ça arrive à tous les coups.',
          `On le place à **${it.a}**.`,
        ],
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
      hint: 'La fréquence, c’est ce qu’on a observé : nombre de piles ÷ nombre de lancers.',
      steps: [
        `La fréquence, c’est ce qu’on a vraiment observé : ${success} piles sur ${throws} lancers.`,
        `${success} ÷ ${throws} = **${fmt(f)}** (proche de 0,5, la probabilité théorique, mais pas forcément égale).`,
      ],
    };
  },
};

/* ───────────────────────── Proportionnalité ───────────────────────── */

const reconnaitre: Skill = {
  id: 'm5-propor-reconnaitre',
  title: 'Reconnaître la proportionnalité',
  lesson: {
    memo: [
      'Proportionnel = si on achète 2 fois plus, on paie 2 fois plus. Le prix d’**un** objet est toujours le même.',
      'Dans un tableau : on divise chaque prix par sa quantité. Si on trouve toujours le même nombre, c’est proportionnel.',
      'Sur un graphique : les points sont sur une **droite qui passe par 0**.',
    ],
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
        hint: 'Deux conditions : les points sont-ils alignés ? Et la droite passe-t-elle par 0 (le coin en bas à gauche) ?',
        steps: [
          'Pour être proportionnel, il faut une droite **et** qu’elle passe par 0 (0 objet = 0 €).',
          isProp
            ? 'Ici, les points sont alignés et la droite part de 0.'
            : 'Ici, les points sont alignés, mais la droite ne part pas de 0 : 0 objet ne coûte pas 0 €.',
          isProp ? 'Donc c’est **proportionnel** : vrai.' : 'Donc ce n’est **pas proportionnel** : faux.',
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
      hint: 'Calcule le prix d’un seul objet dans chaque colonne (prix ÷ quantité). Est-ce toujours le même ?',
      steps: [
        'On calcule le prix d’un seul objet dans chaque colonne : prix ÷ quantité.',
        `${xs.map((x, i) => `${fmt(ys[i] ?? r(0))} ÷ ${x} = ${(ratios[i]?.d ?? 1) <= 1000 && 10 ** 6 % (ratios[i]?.d ?? 1) === 0 ? fmt(ratios[i] ?? r(0)) : '≈ ' + ((ratios[i]?.n ?? 0) / (ratios[i]?.d ?? 1)).toFixed(2).replace('.', ',')}`).join(' ; ')}.`,
        isProp
          ? 'Le prix d’un objet est toujours le même : c’est **proportionnel**.'
          : 'Le prix d’un objet change d’une colonne à l’autre : ce n’est **pas proportionnel**.',
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
    memo: [
      'Astuce n°1, **passer par 1** : 3 kg coûtent 7,50 € → 1 kg coûte 7,50 ÷ 3 = 2,50 €. Ensuite on multiplie.',
      'Astuce n°2, **couper ou doubler** : recette pour 4 avec 200 g → pour 2, la moitié (100 g) → pour 6 = 4 + 2, 200 + 100 = 300 g.',
    ],
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
        hint: `1 kg coûte ${fmt(unit)} €. Pour ${fmt(qty)} kg, on paie ${fmt(qty)} fois ce prix.`,
        steps: [
          `1 kg coûte ${fmt(unit)} €.`,
          `Pour ${fmt(qty)} kg, on paie ${fmt(qty)} fois plus : ${fmt(unit)} × ${fmt(qty)}.`,
          `À la calculatrice : **${fmt(price)}** €`,
        ],
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
      hint: `Combien faut-il pour 1 personne ? Puis multiplie par ${target}.`,
      steps: [
        target % people === 0
          ? `${target} personnes, c’est ${target / people} fois plus que ${people} : on multiplie par ${target / people}.`
          : `On passe par 1 personne : ${q} ÷ ${people} = ${fmt(r(q, people))}.`,
        target % people === 0
          ? `${q} × ${target / people} = ${fmt(v)}.`
          : `Pour ${target} personnes : ${fmt(r(q, people))} × ${target} = ${fmt(v)}.`,
        `Il en faut **${fmt(v)}** ${ingr.split(' ')[0]}.`,
      ],
    };
  },
};

const pourcentages: Skill = {
  id: 'm5-pourcentages',
  tools: ['calculatrice'],
  title: 'Pourcentages',
  lesson: {
    memo: [
      '« Pour cent » veut dire « sur 100 ». 50 % = la moitié, 25 % = le quart, 10 % = un dixième (÷ 10), 1 % = ÷ 100.',
      '20 % de 80 : 10 % de 80 = 8, donc 20 % = 2 × 8 = 16.',
      'Pour trouver un pourcentage : part ÷ total, puis × 100. 6 sur 24 → 0,25 → 25 %.',
    ],
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
        hint: `Calcule ${part} ÷ ${total}, puis multiplie par 100.`,
        steps: [
          `Il a ${part} voix sur ${total}.`,
          `${part} ÷ ${total} = ${fmt(r(part, total))}.`,
          `« Pour cent » = sur 100 : ${fmt(r(part, total))} × 100 = **${fmt(pct)} %**`,
        ],
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
      hint:
        t === 50
          ? '50 %, c’est la moitié.'
          : t === 25
            ? '25 %, c’est le quart.'
            : t === 10
              ? '10 %, c’est diviser par 10.'
              : t === 1
                ? '1 %, c’est diviser par 100.'
                : `${t} %, c’est ${t / 10} fois 10 %. Et 10 %, c’est diviser par 10.`,
      steps:
        t === 50 || t === 25 || t === 10 || t === 1
          ? [
              `${t} %, c’est ${t === 50 ? 'la moitié : on divise par 2' : t === 25 ? 'le quart : on divise par 4' : t === 10 ? 'un dixième : on divise par 10' : 'un centième : on divise par 100'}.`,
              `${x} ÷ ${100 / t} = **${fmt(v)}**`,
            ]
          : [
              `${t} %, c’est ${t / 10} fois 10 %.`,
              `10 % de ${x} = ${x} ÷ 10 = ${fmt(r(x, 10))}.`,
              `${t} % = ${t / 10} × ${fmt(r(x, 10))} = **${fmt(v)}**`,
            ],
      targetSeconds: 15,
    };
  },
};

const coefficient: Skill = {
  id: 'm5-coefficient',
  tools: ['calculatrice'],
  title: 'Prix unitaire, vitesse, échelle',
  lesson: {
    memo: [
      '**Prix d’un seul** : on partage le prix total. 4 cahiers à 10 € → 10 ÷ 4 = 2,50 € le cahier.',
      '**Vitesse** en km/h = combien de km en **1 heure** : 150 km en 2 h → 150 ÷ 2 = 75 km/h.',
      '**Échelle** 1/100 000 : 1 cm sur la carte = 100 000 cm en vrai = 1 km.',
    ],
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
        hint: `On cherche le prix d’un seul cahier : partage ${fmt(total)} € entre les ${n} cahiers.`,
        steps: [
          `${n} cahiers coûtent ${fmt(total)} €. Pour un seul, on partage : ${fmt(total)} ÷ ${n}.`,
          `${fmt(total)} ÷ ${n} = **${fmt(unit)}** €`,
        ],
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
        hint: `La vitesse en km/h, c’est le nombre de km parcourus en 1 heure. Partage ${fmt(d)} km sur ${fmt(H)} h.`,
        steps: [
          `km/h veut dire : combien de km en 1 heure ?`,
          `${fmt(d)} km en ${fmt(H)} h, donc en 1 h : ${fmt(d)} ÷ ${fmt(H)}.`,
          `${fmt(d)} ÷ ${fmt(H)} = **${v}** km/h`,
        ],
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
      hint: `1 cm sur la carte = ${fmt(scale)} cm en vrai. Calcule en cm, puis convertis en km (1 km = 100 000 cm).`,
      steps: [
        `L’échelle 1/${fmt(scale)} veut dire : 1 cm sur la carte = ${fmt(scale)} cm en vrai.`,
        `${fmt(cm)} cm sur la carte = ${fmt(cm)} × ${fmt(scale)} = ${fmt(mul(cm, r(scale)))} cm en vrai.`,
        `1 km = 100 000 cm, donc on divise par 100 000 : **${fmt(realKm)}** km`,
      ],
    };
  },
};

/* ───────────────────────── Fonctions ───────────────────────── */

const formuleValeurs: Skill = {
  id: 'm5-fonctions-formule',
  title: 'Grandeur en fonction d’une autre',
  lesson: {
    memo: [
      'Une formule, c’est une machine : on met un nombre dedans, elle en ressort un autre.',
      'P = 3 × n + 2 avec n = 5 : on remplace n par 5 → 3 × 5 + 2 = 17.',
    ],
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
      hint: `Remplace ${f.v} par ${x} dans la formule ${f.txt}, puis calcule (× avant +).`,
      steps: [
        `La formule est une machine : on y met ${f.v} = ${x}.`,
        `${f.txt} devient ${f.txt.split(' = ')[0]} = ${(f.txt.split(' = ')[1] ?? '').replace(f.v, String(x)).replace(/x\^2/, `${x} × ${x}`).replace(`${x}^2`, `${x} × ${x}`)}.`,
        `On calcule : **${v}**`,
      ],
      targetSeconds: 20,
    };
  },
};

const lireGraphique: Skill = {
  id: 'm5-fonctions-graphique',
  title: 'Lire un graphique',
  lesson: {
    memo: [
      'Lire un graphique, c’est un trajet en « L » : on part de l’axe du bas, on **monte** jusqu’à la courbe, puis on va **à gauche** lire sur l’axe vertical.',
      'Pour trouver le moment le plus chaud, on cherche le point **le plus haut** de la courbe, et on descend lire l’heure en bas.',
    ],
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
        hint: 'Cherche le point le plus haut de la courbe, puis descends tout droit lire l’heure sur l’axe du bas.',
        steps: [
          'La température la plus élevée, c’est le point le plus haut de la courbe.',
          `Ce point est à ${max.y} °C. On descend tout droit jusqu’à l’axe du bas.`,
          `On lit l’heure : **${max.x} h**.`,
        ],
      };
    }
    return {
      prompt: `Quelle température faisait-il à ${p.x} h (en °C) ?`,
      figure,
      answer: num(p.y, '°C'),
      traps: traps(r(p.y), [[p.x, 'Ça, c’est l’heure : on lit la température sur l’axe vertical.']]),
      hint: `Pars de ${p.x} h sur l’axe du bas, monte jusqu’à la courbe, puis va à gauche lire la température.`,
      steps: [
        `On part de ${p.x} h sur l’axe du bas.`,
        'On monte tout droit jusqu’à la courbe.',
        `On va à gauche jusqu’à l’axe vertical et on lit **${p.y} °C**.`,
      ],
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
    memo: [
      'Joue l’ordinateur : lis les blocs **un par un, de haut en bas**, et note au brouillon la valeur de chaque variable.',
      '« mettre a à … » **remplace** la valeur. « ajouter 2 à a » **augmente** a de 2.',
    ],
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
      hint: 'Fais comme l’ordinateur : lis les blocs un par un et note la valeur de a (et de b) après chacun.',
      steps: [
        `On joue l’ordinateur, bloc par bloc. La réponse vaut ${input}.`,
        `a = ${input} × ${m} = ${input * m}, puis on ajoute ${k} : a = ${input * m + k}.`,
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
    memo: [
      '« répéter 4 fois » : on fait ce qu’il y a dedans **4 fois de suite**, comme 4 tours de manège.',
      'Note x au brouillon après chaque tour : x ← 2, puis + 3 à chaque tour : 5, 8, 11, 14.',
    ],
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
        hint: 'Note x après chaque tour de boucle : à chaque tour, x est doublé.',
        steps: [
          `x commence à ${begin}. À chaque tour, x est multiplié par 2 (doublé), et il y a ${n} tours.`,
          `Tour par tour : ${Array.from({ length: n + 1 }, (_, i) => begin * 2 ** i).join(' → ')}.`,
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
      hint: `x commence à ${start}. Combien ajoute-t-on à chaque tour, et combien de tours ?`,
      steps: [
        `x commence à ${start}. À chaque tour, on ajoute ${k}, et il y a ${n} tours.`,
        `Tour par tour : ${Array.from({ length: n + 1 }, (_, i) => start + i * k).join(' → ')}.`,
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
