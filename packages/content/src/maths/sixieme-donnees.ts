import { choice, distinct, fraction, num, traps } from '../build.ts';
import { fmt, frac, r } from '../rational.ts';
import type { Block, Chapter } from '../types.ts';
import { bossOf, chapterOf, NAMES, skillsOf } from './kit.ts';

/** Programme de 6e (cycle 3, BO n°16 du 17 avril 2025) : données, probabilités, proportionnalité, informatique. */
const S = skillsOf('6e');
const C = chapterOf('6e');

const SPORTS = ['Foot', 'Basket', 'Judo', 'Danse', 'Natation', 'Tennis'];

// ——— Organisation et gestion de données ———

const lireDiagramme = S(
  'm6-lire-diagramme',
  'Lire un tableau ou un diagramme',
  'L’élève sait lire un tableau, un diagramme en barres, un diagramme circulaire ou une courbe dans des cas adaptés à une lecture immédiate (automatisme)',
  [
    'Dans un diagramme en barres, la **hauteur** de la barre donne la valeur : lis-la sur l’axe vertical.',
    'Pour comparer, regarde la barre la plus haute (le plus grand) ou la plus basse (le plus petit).',
  ],
  (rng, level) => {
    const labels = distinct(rng, 4, () => rng.pick(SPORTS));
    const values = labels.map(() => rng.int(2, 12));
    const bars = labels.map((label, i) => ({ label, value: values[i] ?? 0 }));
    const figure = { kind: 'bars' as const, title: 'Sport préféré des élèves', bars, unit: 'élèves' };
    if (level === 1) {
      const i = rng.int(0, 3);
      return {
        prompt: `Combien d’élèves préfèrent le ${(labels[i] ?? '').toLowerCase()} ?`,
        figure,
        answer: num(values[i] ?? 0),
        traps: [],
        hint: 'Lis la hauteur de la barre sur l’axe vertical.',
        steps: [`On repère la barre « ${labels[i]} » et on lit sa hauteur.`, `**${values[i]}** élèves.`],
        targetSeconds: 15,
      };
    }
    const total = values.reduce((a, b) => a + b, 0);
    if (level === 2) {
      return {
        prompt: 'Combien d’élèves ont répondu en tout ?',
        figure,
        answer: num(total),
        traps: traps(r(total), [
          [Math.max(...values), 'C’est seulement la plus haute barre : additionne toutes les barres.'],
        ]),
        hint: 'Additionne les hauteurs de toutes les barres.',
        steps: [`${values.join(' + ')}.`, `= **${total}** élèves.`],
        targetSeconds: 25,
      };
    }
    const [i, j] = distinct(rng, 2, () => rng.int(0, 3));
    const a = values[i ?? 0] ?? 0;
    const b = values[j ?? 1] ?? 0;
    return {
      prompt: `Combien d’élèves de plus préfèrent le ${(labels[i ?? 0] ?? '').toLowerCase()} plutôt que le ${(labels[j ?? 1] ?? '').toLowerCase()} ? (Réponds 0 s’il n’y en a pas plus.)`,
      figure,
      answer: num(Math.max(0, a - b)),
      traps: traps(r(Math.max(0, a - b)), [[a + b, 'On cherche l’**écart** : c’est une soustraction.']]),
      hint: 'Fais la différence des deux hauteurs.',
      steps: [
        `${labels[i ?? 0]} : ${a} ; ${labels[j ?? 1]} : ${b}.`,
        a > b ? `${a} − ${b} = **${a - b}**.` : `Il n’y en a pas plus : **0**.`,
      ],
      targetSeconds: 25,
    };
  },
);

const filtrerTableau = S(
  'm6-filtrer-tableau',
  'Filtrer les données d’un tableau',
  'Faire un choix en filtrant les données d’un tableau selon un critère',
  ['Pour **filtrer**, on garde seulement les lignes qui respectent la condition, puis on compte (ou on choisit).'],
  (rng) => {
    const fruits = distinct(rng, 5, () =>
      rng.pick(['Pomme', 'Banane', 'Kiwi', 'Orange', 'Poire', 'Fraise', 'Mangue', 'Raisin']),
    );
    const sugar = fruits.map(() => rng.int(5, 20));
    const limit = rng.int(9, 15);
    const count = sugar.filter((g) => g < limit).length;
    return {
      prompt: `Combien de ces fruits ont **moins de ${limit} g** de sucre pour 100 g ?`,
      figure: {
        kind: 'table',
        header: true,
        rows: [
          ['Fruit', ...fruits],
          ['Sucre (g / 100 g)', ...sugar.map(String)],
        ],
      },
      answer: num(count),
      traps: traps(r(count), [
        [5 - count, 'Tu as compté ceux qui en ont **plus**.'],
        [sugar.filter((g) => g <= limit).length, `« Moins de ${limit} » : ${limit} lui-même ne compte pas.`],
      ]),
      hint: `Passe chaque fruit en revue : sa valeur est-elle plus petite que ${limit} ?`,
      steps: [
        `Fruits avec moins de ${limit} g : ${fruits.filter((_, k) => (sugar[k] ?? 0) < limit).join(', ') || 'aucun'}.`,
        `Il y en a **${count}**.`,
      ],
      targetSeconds: 35,
    };
  },
);

const donnees = C(
  'm6-donnees',
  'donnees',
  'Organisation de données',
  [lireDiagramme, filtrerTableau],
  bossOf(
    [
      S(
        'm6-boss-donnees-meteo',
        'Problème : la semaine météo',
        'Faire un choix en filtrant les données d’un tableau selon un critère',
        ['Lis chaque ligne du tableau et garde celles qui respectent la condition.'],
        (rng) => {
          const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
          const temps = days.map(() => rng.int(8, 24));
          const max = Math.max(...temps);
          const hot = days[temps.indexOf(max)] ?? '';
          return {
            prompt: 'Quel jour a-t-il fait le plus chaud ?',
            figure: {
              kind: 'table',
              header: true,
              rows: [
                ['Jour', ...days],
                ['Température (°C)', ...temps.map(String)],
              ],
            },
            ...choice(
              rng,
              hot,
              days
                .filter((d) => d !== hot)
                .slice(0, 3)
                .map((d) => ({ label: d, why: 'Cherche la plus grande température.' })),
            ),
            hint: 'Cherche la plus grande température du tableau.',
            steps: [`La plus grande température est ${max} °C.`, `C’est **${hot}**.`],
            targetSeconds: 30,
          };
        },
      ),
      S(
        'm6-boss-donnees-club',
        'Problème : les inscriptions',
        'Lire et interpréter les données d’un tableau à simple ou double entrée, d’un diagramme en barres ou d’une courbe',
        ['Additionne les barres, puis compare à la question posée.'],
        (rng) => {
          const labels = distinct(rng, 3, () => rng.pick(SPORTS));
          const values = labels.map(() => rng.int(5, 15));
          const total = values.reduce((a, b) => a + b, 0);
          const places = total + rng.int(3, 12);
          return {
            prompt: `Le club a ${places} places. Combien de places reste-t-il après ces inscriptions ?`,
            figure: {
              kind: 'bars',
              title: 'Inscriptions au club',
              bars: labels.map((label, i) => ({ label, value: values[i] ?? 0 })),
              unit: 'élèves',
            },
            answer: num(places - total),
            traps: traps(r(places - total), [[total, 'Ça, c’est le nombre d’inscrits.']]),
            hint: 'Compte tous les inscrits, puis enlève-les des places.',
            steps: [
              `Inscrits : ${values.join(' + ')} = ${total}.`,
              `Places restantes : ${places} − ${total} = **${places - total}**.`,
            ],
            targetSeconds: 45,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-donnees-piege',
        'Piège : l’axe qui ne part pas de 0',
        'Lire et interpréter les données d’un tableau à simple ou double entrée, d’un diagramme en barres ou d’une courbe',
        [
          'Une barre deux fois plus haute ne veut pas dire deux fois plus si l’axe ne commence pas à 0 : **lis les nombres**.',
        ],
        (rng) => {
          const a = rng.int(40, 50);
          const b = a + rng.int(2, 5);
          return {
            prompt: `Sur un graphique, l’axe commence à ${a - 5}. La barre A vaut ${a} et la barre B vaut ${b} ; la barre B paraît deux fois plus haute. B est-il le double de A ?`,
            ...choice(rng, 'Non', [{ label: 'Oui', why: `Lis les valeurs : ${b} n’est pas le double de ${a}.` }], true),
            hint: 'Ne regarde pas la taille des barres : lis les nombres.',
            steps: [`Le double de ${a} est ${2 * a}.`, `B vaut ${b} : **non**, ce n’est pas le double.`],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);

// ——— Probabilités ———

const probaEntre01 = S(
  'm6-proba-0-1',
  'Une probabilité entre 0 et 1',
  'Savoir que la probabilité d’un évènement est un nombre compris entre 0 et 1',
  ['Une probabilité est un nombre **entre 0 et 1** : 0 = impossible, 1 = certain, {1/2} = une chance sur deux.'],
  (rng) => {
    const q = rng.pick([
      { p: 'obtenir 7 avec un dé à 6 faces', a: '0', why: 'Le dé n’a pas de face 7 : c’est impossible.' },
      {
        p: 'obtenir un nombre plus petit que 7 avec un dé à 6 faces',
        a: '1',
        why: 'Toutes les faces sont plus petites que 7 : c’est certain.',
      },
      { p: 'obtenir « pile » avec une pièce', a: '{1/2}', why: '1 chance sur 2.' },
      { p: 'tirer une boule rouge dans un sac qui ne contient que des boules rouges', a: '1', why: 'C’est certain.' },
      {
        p: 'tirer une boule verte dans un sac de boules rouges et bleues',
        a: '0',
        why: 'Il n’y a pas de boule verte : impossible.',
      },
    ]);
    return {
      prompt: `Quelle est la probabilité de ${q.p} ?`,
      ...choice(
        rng,
        q.a,
        ['0', '{1/2}', '1', '2']
          .filter((x) => x !== q.a)
          .map((x) => ({ label: x, why: x === '2' ? 'Une probabilité ne dépasse jamais 1.' : q.why })),
      ),
      hint: '0 = impossible ; 1 = certain ; entre les deux sinon.',
      steps: [q.why, `La probabilité est **${q.a}**.`],
      targetSeconds: 15,
    };
  },
);

const probaCalcul = S(
  'm6-proba-calcul',
  'Calculer une probabilité',
  'Calculer des probabilités dans des situations simples d’équiprobabilité',
  [
    'Si toutes les issues ont la même chance : probabilité = **nombre d’issues favorables ÷ nombre total d’issues**.',
    '3 boules rouges sur 10 boules : probabilité {3/10}.',
  ],
  (rng, level) => {
    if (level === 1) {
      const target = rng.pick([
        { t: 'un nombre pair', n: 3 },
        { t: 'un 6', n: 1 },
        { t: 'un nombre plus grand que 4', n: 2 },
        { t: 'un multiple de 3', n: 2 },
      ]);
      return {
        prompt: `On lance un dé équilibré à 6 faces. Quelle est la probabilité d’obtenir ${target.t} ?`,
        answer: fraction(r(target.n, 6)),
        traps: traps(r(target.n, 6), [
          [r(1, target.n === 1 ? 2 : target.n), 'Compte les faces qui conviennent, sur 6 faces en tout.'],
        ]),
        hint: 'Compte les faces qui conviennent, sur 6 faces en tout.',
        steps: [`Faces qui conviennent : ${target.n} sur 6.`, `Probabilité : **${frac(r(target.n, 6))}**.`],
        targetSeconds: 20,
      };
    }
    const red = rng.int(1, 9);
    const blue = rng.int(1, 9);
    const green = level === 3 ? rng.int(1, 6) : 0;
    const total = red + blue + green;
    return {
      prompt: `Un sac contient ${red} boules rouges, ${blue} bleues${green ? ` et ${green} vertes` : ''}. On tire une boule au hasard. Quelle est la probabilité qu’elle soit rouge ?`,
      answer: fraction(r(red, total)),
      traps: traps(r(red, total), [
        [r(red, Math.max(1, blue + green)), `Le dénominateur, c’est le nombre **total** de boules (${total}).`],
      ]),
      hint: 'Nombre de boules rouges ÷ nombre total de boules.',
      steps: [
        `Il y a ${total} boules, dont ${red} rouges.`,
        `Probabilité : ${frac(r(red, total)) === `{${red}/${total}}` ? '' : `{${red}/${total}} = `}**${frac(r(red, total))}**.`,
      ],
      targetSeconds: 25,
    };
  },
);

const frequences = S(
  'm6-frequences',
  'Fréquences et probabilité',
  'Comparer des résultats d’une expérience aléatoire répétée à une probabilité calculée',
  [
    'La **fréquence** d’un résultat = nombre de fois où il sort ÷ nombre de lancers.',
    'Plus on fait de lancers, plus la fréquence se rapproche de la probabilité.',
  ],
  (rng, level) => {
    const n = rng.pick([20, 50, 100]);
    const k = rng.int(Math.round(n * 0.35), Math.round(n * 0.65));
    if (level === 3) {
      return {
        prompt: `On lance une pièce. Avec quel nombre de lancers la fréquence de « pile » sera-t-elle sans doute la plus proche de {1/2} ?`,
        ...choice(rng, '1 000 lancers', [
          { label: '10 lancers', why: 'Avec peu de lancers, la fréquence varie beaucoup.' },
          { label: '50 lancers', why: 'Plus il y a de lancers, plus la fréquence se rapproche de la probabilité.' },
        ]),
        hint: 'Avec beaucoup de lancers, le hasard « s’équilibre ».',
        steps: [
          'Plus on répète l’expérience, plus la fréquence se rapproche de la probabilité.',
          'Donc avec **1 000 lancers**.',
        ],
        targetSeconds: 20,
      };
    }
    const f = r(k, n);
    return {
      prompt: `On lance une pièce ${n} fois et on obtient ${k} fois « pile ». Quelle est la fréquence de « pile » (en écriture décimale) ?`,
      answer: num(f),
      traps: traps(f, [[r(1, 2), 'Ça, c’est la probabilité. La fréquence se calcule avec les résultats obtenus.']]),
      hint: `Fréquence = ${k} ÷ ${n}.`,
      steps: [`Fréquence = nombre de « pile » ÷ nombre de lancers = ${k} ÷ ${n}.`, `= **${fmt(f)}**.`],
      targetSeconds: 25,
    };
  },
);

const probabilites = C(
  'm6-probabilites',
  'donnees',
  'Probabilités',
  [probaEntre01, probaCalcul, frequences],
  bossOf(
    [
      S(
        'm6-boss-probas-roue',
        'Problème : la roue de la fête',
        'Calculer des probabilités dans des situations simples d’équiprobabilité',
        ['Roue de 8 secteurs égaux dont 2 gagnants : probabilité de gagner {2/8} = {1/4}.'],
        (rng) => {
          const n = rng.pick([6, 8, 10, 12]);
          const win = rng.int(1, n / 2);
          return {
            prompt: `Une roue est partagée en ${n} secteurs égaux. ${win} secteur${win > 1 ? 's sont gagnants' : ' est gagnant'}. Quelle est la probabilité de gagner ?`,
            answer: fraction(r(win, n)),
            traps: traps(r(win, n), [
              [r(win, n - win), `Le dénominateur, c’est le nombre **total** de secteurs (${n}).`],
            ]),
            hint: 'Secteurs gagnants ÷ nombre total de secteurs.',
            steps: [
              `${win} secteur${win > 1 ? 's' : ''} gagnant${win > 1 ? 's' : ''} sur ${n}.`,
              `Probabilité : **${frac(r(win, n))}**.`,
            ],
            targetSeconds: 30,
          };
        },
      ),
      S(
        'm6-boss-probas-sacs',
        'Problème : quel sac choisir ?',
        'Calculer des probabilités dans des situations simples d’équiprobabilité',
        ['Pour comparer deux sacs, compare les probabilités, pas le nombre de boules gagnantes.'],
        (rng) => {
          const a = [rng.int(1, 4), rng.int(5, 10)] as const;
          const b0 = rng.int(2, 8);
          let b1 = rng.int(9, 20);
          if (a[0] * b1 === b0 * a[1]) b1++;
          const b = [b0, b1] as const;
          const pa = a[0] / a[1];
          const pb = b[0] / b[1];
          const best = pa > pb ? 'Le sac A' : 'Le sac B';
          return {
            prompt: `Sac A : ${a[0]} boule${a[0] > 1 ? 's' : ''} gagnante${a[0] > 1 ? 's' : ''} sur ${a[1]}. Sac B : ${b[0]} gagnantes sur ${b[1]}. Quel sac donne le plus de chances de gagner ?`,
            ...choice(
              rng,
              best,
              [
                {
                  label: pa > pb ? 'Le sac B' : 'Le sac A',
                  why: 'Compare les fractions gagnantes ÷ total, pas les nombres de boules gagnantes.',
                },
              ],
              true,
            ),
            hint: 'Calcule la probabilité de gagner avec chaque sac.',
            steps: [
              `A : ${a[0]} ÷ ${a[1]} ≈ ${fmt(r(Math.round(pa * 100), 100))}. B : ${b[0]} ÷ ${b[1]} ≈ ${fmt(r(Math.round(pb * 100), 100))}.`,
              `**${best}** donne le plus de chances.`,
            ],
            targetSeconds: 45,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-probas-piege',
        'Piège : le dé a-t-il de la mémoire ?',
        'Comparer des résultats d’une expérience aléatoire répétée à une probabilité calculée',
        ['Le dé « ne se souvient pas » : après trois 6, la probabilité d’un 6 reste {1/6}.'],
        (rng) => ({
          prompt:
            'On a obtenu 6 trois fois de suite avec un dé équilibré. Quelle est la probabilité d’obtenir 6 au lancer suivant ?',
          ...choice(rng, '{1/6}', [
            { label: '0', why: 'Le dé ne se souvient pas des lancers précédents.' },
            { label: '{1/2}', why: 'Il y a toujours 6 faces équilibrées.' },
            { label: '{4/6}', why: 'Chaque lancer est indépendant des précédents.' },
          ]),
          hint: 'Le dé change-t-il après les lancers précédents ?',
          steps: ['Chaque lancer est indépendant : le dé ne se souvient de rien.', 'La probabilité reste **{1/6}**.'],
          targetSeconds: 20,
        }),
      ),
    ],
  ),
);

// ——— Proportionnalité ———

const reconnaitre = S(
  'm6-propor-reconnaitre',
  'Reconnaître la proportionnalité',
  'Identifier si une situation relève du « modèle » de la proportionnalité',
  [
    'Deux grandeurs sont **proportionnelles** si quand l’une est multipliée par 2, 3, 10…, l’autre l’est aussi.',
    'L’âge et la taille ne sont pas proportionnels ; le prix et la quantité de pommes (à prix fixe) le sont.',
  ],
  (rng) => {
    const q = rng.pick([
      { s: 'Le prix payé et le nombre de baguettes achetées (même prix par baguette)', yes: true },
      { s: 'L’âge d’un enfant et sa taille', yes: false },
      { s: 'Le périmètre d’un carré et la longueur de son côté', yes: true },
      { s: 'L’aire d’un carré et la longueur de son côté', yes: false },
      { s: 'La distance parcourue et la durée, à vitesse constante', yes: true },
      { s: 'Le prix d’un taxi (avec une prise en charge fixe) et la distance', yes: false },
    ]);
    return {
      prompt: `Ces deux grandeurs sont-elles proportionnelles ? ${q.s}.`,
      ...choice(
        rng,
        q.yes ? 'Oui' : 'Non',
        [
          {
            label: q.yes ? 'Non' : 'Oui',
            why: q.yes ? 'Si on double l’une, l’autre double aussi.' : 'Doubler l’une ne double pas l’autre.',
          },
        ],
        true,
      ),
      hint: 'Si on double la première grandeur, la seconde double-t-elle forcément ?',
      steps: [
        q.yes
          ? 'Si on double la première, la seconde double aussi.'
          : 'Si on double la première, la seconde ne double pas forcément.',
        `**${q.yes ? 'Oui' : 'Non'}**.`,
      ],
      targetSeconds: 20,
    };
  },
);

const linearite = S(
  'm6-propor-linearite',
  'Fois plus, fois moins (linéarité)',
  'Résoudre un problème de proportionnalité en choisissant une procédure adaptée : propriété de linéarité pour la multiplication ou l’addition, retour à l’unité',
  [
    '« 3 fois plus de pains, je paie 3 fois plus. » Si 4 pains coûtent 7 €, 12 pains coûtent 3 × 7 = 21 €.',
    'On peut aussi additionner : prix de 5 = prix de 2 + prix de 3.',
  ],
  (rng, level) => {
    const a = rng.int(2, 6);
    const k = rng.int(2, level === 1 ? 4 : 6);
    const price = rng.int(3, 15);
    const item = rng.pick(['croissants', 'cahiers', 'bouteilles', 'tickets']);
    if (level === 3) {
      const u = rng.int(2, 6);
      let b = rng.int(2, 6);
      if (b === a) b++;
      return {
        prompt: `Le prix est proportionnel au nombre de ${item}. ${a} ${item} coûtent ${a * u} € et ${b} ${item} coûtent ${b * u} €. Combien coûtent ${a + b} ${item} ?`,
        answer: num((a + b) * u, '€'),
        traps: traps(r((a + b) * u), [[a * u * b * u, 'On additionne les quantités : on additionne aussi les prix.']]),
        hint: `${a + b} = ${a} + ${b} : additionne les prix.`,
        steps: [`${a + b} ${item}, c’est ${a} ${item} + ${b} ${item}.`, `${a * u} + ${b * u} = **${(a + b) * u} €**.`],
        targetSeconds: 30,
      };
    }
    return {
      prompt: `${a} ${item} coûtent ${price} €. Combien coûtent ${a * k} ${item} ?`,
      answer: num(price * k, '€'),
      traps: traps(r(price * k), [
        [price + (a * k - a), `Ce n’est pas une addition : il y a ${k} fois plus de ${item}.`],
      ]),
      hint: `${a * k}, c’est combien de fois ${a} ?`,
      steps: [
        `${a * k} = ${k} × ${a} : il y a ${k} fois plus de ${item}.`,
        `On paie ${k} fois plus : ${k} × ${price} = **${price * k} €**.`,
      ],
      targetSeconds: 20,
    };
  },
);

const retourUnite = S(
  'm6-propor-unite',
  'Retour à l’unité',
  'Résoudre un problème de proportionnalité en choisissant une procédure adaptée : propriété de linéarité pour la multiplication ou l’addition, retour à l’unité',
  [
    'On cherche d’abord le prix (ou la quantité) pour **un seul**, puis on multiplie : 5 kg coûtent 15 €, 1 kg coûte 3 €, 7 kg coûtent 21 €.',
  ],
  (rng) => {
    const unit = rng.int(2, 9);
    const a = rng.int(3, 9);
    let b = rng.int(2, 12);
    if (b === a) b++;
    return {
      prompt: `${a} kg de pommes coûtent ${a * unit} €. Combien coûtent ${b} kg ?`,
      answer: num(b * unit, '€'),
      traps: traps(r(b * unit), [[unit, `${unit} €, c’est le prix d’**un** kilo.`]]),
      hint: 'Calcule d’abord le prix d’un seul kilo.',
      steps: [`1 kg : ${a * unit} ÷ ${a} = ${unit} €.`, `${b} kg : ${b} × ${unit} = **${b * unit} €**.`],
      targetSeconds: 25,
    };
  },
);

const tableau = S(
  'm6-propor-tableau',
  'Compléter un tableau de proportionnalité',
  'Représenter une situation de proportionnalité à l’aide d’un tableau ou de notations symboliques',
  [
    'Dans un tableau de proportionnalité, on passe d’une colonne à une autre en multipliant (ou en additionnant des colonnes).',
  ],
  (rng) => {
    const unit = rng.int(2, 9);
    const xs = distinct(rng, 3, () => rng.int(2, 12)).sort((p, q) => p - q);
    const hidden = rng.int(0, 2);
    const x = xs[hidden] ?? 2;
    return {
      prompt: 'Le prix est proportionnel au nombre de places. Complète la case « ? ».',
      figure: {
        kind: 'table',
        header: true,
        rows: [
          ['Nombre de places', ...xs.map(String)],
          ['Prix (€)', ...xs.map((v, i) => (i === hidden ? '?' : String(v * unit)))],
        ],
      },
      answer: num(x * unit, '€'),
      traps: traps(r(x * unit), [[x + unit, 'On multiplie par le prix d’une place, on n’ajoute pas.']]),
      hint: 'Trouve le prix d’une place avec une colonne complète.',
      steps: [
        `Une place coûte ${unit} € (par exemple ${xs[(hidden + 1) % 3]} places → ${(xs[(hidden + 1) % 3] ?? 0) * unit} €).`,
        `${x} places : ${x} × ${unit} = **${x * unit} €**.`,
      ],
      targetSeconds: 30,
    };
  },
);

const echelles = S(
  'm6-echelles',
  'Problèmes d’échelles',
  'S’initier à la résolution de problèmes d’échelles',
  ['Échelle 1/1 000 : 1 cm sur le plan représente 1 000 cm, soit 10 m, en vrai.'],
  (rng) => {
    const scale = rng.pick([100, 1000, 10000, 100000]);
    const plan = rng.int(2, 12);
    const realCm = plan * scale;
    const unit = scale >= 100000 ? 'km' : 'm';
    const real = unit === 'km' ? r(realCm, 100000) : r(realCm, 100);
    return {
      prompt: `Sur un plan à l’échelle {1/${scale}}, deux points sont à ${plan} cm. Quelle est la distance réelle, en ${unit} ?`,
      answer: num(real, unit),
      traps: traps(real, [[r(realCm), `${fmt(r(realCm))} est en cm : convertis en ${unit}.`]]),
      hint: `1 cm sur le plan = ${fmt(r(scale))} cm en vrai.`,
      steps: [
        `${plan} cm sur le plan = ${plan} × ${fmt(r(scale))} = ${fmt(r(realCm))} cm en vrai.`,
        `${fmt(r(realCm))} cm = **${fmt(real)} ${unit}**.`,
      ],
      targetSeconds: 40,
    };
  },
  { advice: 'calculatrice' },
);

const proportionnalite = C(
  'm6-proportionnalite',
  'fonctions',
  'Proportionnalité',
  [reconnaitre, linearite, retourUnite, tableau, echelles],
  bossOf(
    [
      S(
        'm6-boss-propor-recette',
        'Problème : la recette',
        'Résoudre un problème de proportionnalité en choisissant une procédure adaptée',
        ['Recette pour 4, on cuisine pour 6 : 6 = 4 + 2 (4 personnes et la moitié de 4).'],
        (rng) => {
          const base = 4;
          const g = 2 * rng.int(50, 150);
          const people = rng.pick([2, 6, 8, 10, 12]);
          const res = (g / base) * people;
          return {
            prompt: `Une recette pour ${base} personnes demande ${g} g de farine. Combien en faut-il pour ${people} personnes ?`,
            answer: num(res, 'g'),
            traps: traps(r(res), [
              [g + (people - base), 'Les quantités sont proportionnelles : on ne fait pas une addition de personnes.'],
            ]),
            hint: `Calcule d’abord pour 1 personne, ou pour 2 (la moitié de ${base}).`,
            steps: [
              `Pour 2 personnes : ${g} ÷ 2 = ${g / 2} g.`,
              `Pour ${people} personnes : ${people / 2} × ${g / 2} = **${res} g**.`,
            ],
            targetSeconds: 45,
          };
        },
      ),
      S(
        'm6-boss-propor-carte',
        'Problème : la carte de randonnée',
        'S’initier à la résolution de problèmes d’échelles',
        ['Échelle 1/25 000 : 1 cm sur la carte = 25 000 cm = 250 m en vrai.'],
        (rng) => {
          const cm = rng.int(2, 16);
          const m = cm * 250;
          return {
            prompt: `Sur une carte à l’échelle {1/25000}, un sentier mesure ${cm} cm. Quelle est sa longueur réelle, en m ?`,
            answer: num(m, 'm'),
            traps: traps(r(m), [[cm * 25000, `${cm * 25000} est en cm : convertis en m.`]]),
            hint: '1 cm sur la carte = 25 000 cm en vrai, soit 250 m.',
            steps: [`1 cm = 250 m en vrai.`, `${cm} × 250 = **${m} m**.`],
            targetSeconds: 45,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-propor-piege',
        'Piège : l’âge et la taille',
        'Identifier si une situation relève du « modèle » de la proportionnalité',
        ['Tout n’est pas proportionnel : un enfant de 10 ans ne mesure pas deux fois plus qu’à 5 ans.'],
        (rng) => {
          const h = rng.int(105, 115);
          return {
            prompt: `À 5 ans, Noah mesurait ${h} cm. Combien mesurera-t-il à 20 ans ?`,
            ...choice(rng, 'On ne peut pas savoir avec la proportionnalité', [
              { label: `${h * 4} cm`, why: 'La taille n’est pas proportionnelle à l’âge (personne ne mesure 4 m !).' },
              { label: `${h * 2} cm`, why: 'La taille n’est pas proportionnelle à l’âge.' },
            ]),
            hint: 'La taille double-t-elle quand l’âge double ?',
            steps: [
              `${h * 4} cm, ce serait plus de 4 m : absurde.`,
              'La taille n’est pas proportionnelle à l’âge : **on ne peut pas savoir avec la proportionnalité**.',
            ],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);

// ——— Pensée informatique ———

type Move = 'haut' | 'bas' | 'gauche' | 'droite';
const DELTA: Record<Move, readonly [number, number]> = { haut: [0, 1], bas: [0, -1], gauche: [-1, 0], droite: [1, 0] };

const sequence = S(
  'm6-sequence',
  'Exécuter une séquence d’instructions',
  'Produire et exécuter une séquence d’instructions',
  ['Exécute les instructions **dans l’ordre**, une par une, en partant de la case de départ.'],
  (rng, level) => {
    const lim = 5;
    for (;;) {
      let x = rng.int(-2, 2);
      let y = rng.int(-2, 2);
      const start = { x, y };
      const n = level === 1 ? 2 : level === 2 ? 3 : 4;
      const moves = Array.from({ length: n }, () => ({
        d: rng.pick(['haut', 'bas', 'gauche', 'droite'] as Move[]),
        k: rng.int(1, 3),
      }));
      for (const m of moves) {
        x += DELTA[m.d][0] * m.k;
        y += DELTA[m.d][1] * m.k;
      }
      if (Math.abs(x) > lim || Math.abs(y) > lim || (x === start.x && y === start.y)) continue;
      const dir = (d: Move) => (d === 'haut' || d === 'bas' ? `vers le ${d}` : `vers la ${d}`);
      const text = moves.map((m) => `avancer de ${m.k} ${dir(m.d)}`).join(', puis ');
      return {
        prompt: `Le robot part du point R. Programme : ${text}. Touche le point d’arrivée.`,
        figure: {
          kind: 'grid',
          xMin: -lim,
          xMax: lim,
          yMin: -lim,
          yMax: lim,
          axes: false,
          points: [{ name: 'R', x: start.x, y: start.y, color: 'accent' }],
          pick: true,
        },
        answer: { kind: 'point', x, y },
        traps: [],
        hint: 'Suis les instructions une par une, avec ton doigt.',
        steps: [
          'On part de R et on applique chaque instruction dans l’ordre.',
          'Le robot arrive sur **le nœud entouré en vert**.',
        ],
        targetSeconds: 35,
      };
    }
  },
);

const repeter = S(
  'm6-repeter',
  'Répéter une séquence',
  'Répéter à la main une séquence d’instructions pour accomplir une tâche imposée',
  ['« Répéter 4 fois : avancer de 2 » fait avancer de 4 × 2 = 8 en tout.'],
  (rng, level) => {
    const times = rng.int(2, level === 1 ? 4 : 8);
    const step = rng.int(1, 5);
    const start = rng.int(0, 10);
    const program: Block[] = [
      { op: 'set', variable: 'score', expr: String(start) },
      { op: 'repeat', times, body: [{ op: 'change', variable: 'score', by: String(step) }] },
      { op: 'say', expr: 'score' },
    ];
    const res = start + times * step;
    return {
      prompt: 'Quel nombre le lutin dit-il à la fin ?',
      figure: { kind: 'blocks', program },
      answer: num(res),
      traps: traps(r(res), [
        [start + step, `La boucle répète l’ajout ${times} fois.`],
        [times * step, `N’oublie pas la valeur de départ (${start}).`],
      ]),
      hint: `On part de ${start} et on ajoute ${step}, ${times} fois.`,
      steps: [
        `score commence à ${start}, puis on ajoute ${step} à chaque tour, ${times} fois : + ${times * step}.`,
        `${start} + ${times * step} = **${res}**.`,
      ],
      targetSeconds: 25,
    };
  },
);

const instructions = S(
  'm6-instructions',
  'Écrire un chemin',
  'Programmer la construction d’un chemin simple',
  ['Pour aller d’un point à un autre sur un quadrillage, compte les cases à droite/à gauche, puis en haut/en bas.'],
  (rng) => {
    const dx = rng.int(-4, 4) || 3;
    const dy = rng.int(-4, 4) || -2;
    const good = `${Math.abs(dx)} vers la ${dx > 0 ? 'droite' : 'gauche'}, puis ${Math.abs(dy)} vers le ${dy > 0 ? 'haut' : 'bas'}`;
    const wrong1 = `${Math.abs(dx)} vers la ${dx > 0 ? 'gauche' : 'droite'}, puis ${Math.abs(dy)} vers le ${dy > 0 ? 'haut' : 'bas'}`;
    const wrong2 = `${Math.abs(dy)} vers la ${dx > 0 ? 'droite' : 'gauche'}, puis ${Math.abs(dx)} vers le ${dy > 0 ? 'haut' : 'bas'}`;
    return {
      prompt: 'Quel programme mène le robot de R à T ?',
      figure: {
        kind: 'grid',
        xMin: -5,
        xMax: 5,
        yMin: -5,
        yMax: 5,
        axes: false,
        points: [
          { name: 'R', x: 0, y: 0, color: 'accent' },
          { name: 'T', x: dx, y: dy },
        ],
      },
      ...choice(rng, good, [
        { label: wrong1, why: 'Regarde dans quel sens se trouve T.' },
        { label: wrong2, why: 'Compte bien les cases dans chaque direction.' },
      ]),
      hint: 'Compte les cases horizontalement, puis verticalement.',
      steps: [
        `T est à ${Math.abs(dx)} case${Math.abs(dx) > 1 ? 's' : ''} ${dx > 0 ? 'à droite' : 'à gauche'} et ${Math.abs(dy)} ${dy > 0 ? 'plus haut' : 'plus bas'}.`,
        `Programme : **${good}**.`,
      ],
      targetSeconds: 25,
    };
  },
);

const informatique = C(
  'm6-informatique',
  'informatique',
  'Pensée informatique',
  [sequence, repeter, instructions],
  bossOf(
    [
      S(
        'm6-boss-info-tirelire',
        'Problème : la tirelire',
        'Répéter à la main une séquence d’instructions pour accomplir une tâche imposée',
        ['Suis le programme bloc par bloc ; la boucle répète son contenu.'],
        (rng) => {
          const start = rng.int(5, 30);
          const weeks = rng.int(3, 10);
          const add = rng.int(2, 6);
          const res = start + weeks * add;
          return {
            prompt: `Ce programme calcule l’argent de ${rng.pick(NAMES)} après ${weeks} semaines. Que dit le lutin ?`,
            figure: {
              kind: 'blocks',
              program: [
                { op: 'set', variable: 'argent', expr: String(start) },
                { op: 'repeat', times: weeks, body: [{ op: 'change', variable: 'argent', by: String(add) }] },
                { op: 'say', expr: 'argent' },
              ],
            },
            answer: num(res),
            traps: traps(r(res), [[weeks * add, `N’oublie pas les ${start} € du départ.`]]),
            hint: `Départ : ${start}. Chaque tour : + ${add}.`,
            steps: [
              `${weeks} tours de boucle : + ${weeks} × ${add} = + ${weeks * add}.`,
              `${start} + ${weeks * add} = **${res}**.`,
            ],
            targetSeconds: 35,
          };
        },
      ),
      S(
        'm6-boss-info-carre',
        'Problème : tracer un carré',
        'Programmer la construction d’un chemin simple',
        ['Pour tracer un carré : répéter 4 fois « avancer, tourner d’un quart de tour ».'],
        (rng) => {
          const side = rng.int(20, 100);
          return {
            prompt: `Un robot répète 4 fois : « avancer de ${side} pas, tourner de 90° ». Quelle distance a-t-il parcourue en tout, en pas ?`,
            answer: num(4 * side),
            traps: traps(r(4 * side), [[side, 'Le programme est répété 4 fois.']]),
            hint: `Chaque répétition avance de ${side} pas.`,
            steps: [`4 répétitions de ${side} pas.`, `4 × ${side} = **${4 * side} pas** (il a tracé un carré).`],
            targetSeconds: 25,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-info-piege',
        'Piège : l’ordre des instructions',
        'Identifier une instruction ou une séquence d’instructions',
        ['L’ordre compte : « ajouter 3 puis multiplier par 2 » ne donne pas la même chose que l’inverse.'],
        (rng) => {
          const x = rng.int(2, 9);
          const res = (x + 3) * 2;
          return {
            prompt: `Programme : choisir ${x}, ajouter 3, puis multiplier par 2. Quel résultat ?`,
            answer: num(res),
            traps: traps(r(res), [[x * 2 + 3, 'Respecte l’ordre : on ajoute 3 **d’abord**.']]),
            hint: 'Fais les étapes dans l’ordre écrit.',
            steps: [`${x} + 3 = ${x + 3}.`, `${x + 3} × 2 = **${res}**.`],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);

export const SIXIEME_DONNEES: readonly Chapter[] = [donnees, probabilites, proportionnalite, informatique];
