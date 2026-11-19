import { choice, distinct, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

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

export const donnees = C(
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
