import { choice, distinct, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Chapter, Figure } from '../../types.ts';
import { bossOf } from '../kit.ts';
import type { Contexte } from './contexte.ts';

export function buildDonnees({ S, C, cm2, id }: Contexte): Chapter {
  // ——— Données ———

  const lireDonnees = S(
    id('lire-donnees'),
    'Lire un tableau, un diagramme',
    'Lire et interpréter les données d’un tableau à simple ou double entrée, d’un diagramme en barres ou d’une courbe',
    ['Dans un diagramme en barres, la **hauteur** de la barre donne le nombre.'],
    (rng, level) => {
      const labels = distinct(rng, 4, () => rng.pick(['Vélo', 'Bus', 'À pied', 'Voiture', 'Trottinette', 'Train']));
      const values = labels.map(() => rng.int(2, 12));
      const figure: Figure = {
        kind: 'bars',
        title: 'Comment viens-tu à l’école ?',
        bars: labels.map((label, i) => ({ label, value: values[i] ?? 0 })),
        unit: 'élèves',
      };
      if (level === 1) {
        const i = rng.int(0, 3);
        return {
          prompt: `Combien d’élèves viennent « ${labels[i]} » ?`,
          figure,
          answer: num(values[i] ?? 0),
          traps: [],
          hint: 'Lis la hauteur de la barre.',
          steps: ['On lit la hauteur de la barre.', `**${values[i]}** élèves.`],
          targetSeconds: 15,
        };
      }
      const total = values.reduce((a, b) => a + b, 0);
      return {
        prompt: 'Combien d’élèves ont répondu en tout ?',
        figure,
        answer: num(total),
        traps: traps(r(total), [[Math.max(...values), 'Additionne toutes les barres.']]),
        hint: 'Additionne les hauteurs de toutes les barres.',
        steps: [`${values.join(' + ')}.`, `= **${total}**.`],
        targetSeconds: 25,
      };
    },
  );

  const problemeDonnees = S(
    id('probleme-donnees'),
    'Résoudre un problème avec un tableau',
    cm2
      ? 'Résoudre des problèmes en une ou deux étapes en utilisant les données d’un tableau, d’un diagramme en barres, d’un diagramme circulaire ou d’une courbe'
      : 'Résoudre des problèmes en une ou plusieurs étapes en utilisant les données d’un tableau à simple ou double entrée, d’un diagramme en barres ou d’une courbe',
    ['Repère les cases utiles du tableau, puis calcule.'],
    (rng) => {
      const items = ['Pomme', 'Banane', 'Poire', 'Kiwi'];
      const prices = items.map(() => rng.int(1, 4));
      const i = rng.int(0, 3);
      const n = rng.int(2, 6);
      return {
        prompt: `Combien coûtent ${n} ${items[i]?.toLowerCase()}s ?`,
        figure: {
          kind: 'table',
          header: true,
          rows: [
            ['Fruit', ...items],
            ['Prix (€)', ...prices.map(String)],
          ],
        },
        answer: num(n * (prices[i] ?? 0), '€'),
        traps: traps(r(n * (prices[i] ?? 0)), [[n + (prices[i] ?? 0), 'C’est une multiplication.']]),
        hint: 'Lis le prix d’un fruit, puis multiplie.',
        steps: [
          `Une ${items[i]?.toLowerCase()} coûte ${prices[i]} €.`,
          `${n} × ${prices[i]} = **${n * (prices[i] ?? 0)} €**.`,
        ],
        targetSeconds: 30,
      };
    },
  );

  const donnees = C(
    id('donnees'),
    'donnees',
    'Tableaux et diagrammes',
    [lireDonnees, problemeDonnees],
    bossOf(
      [
        S(
          id('boss-donnees-meteo'),
          'Problème : la météo',
          'Lire et interpréter les données d’un tableau',
          ['Cherche la plus grande (ou la plus petite) valeur du tableau.'],
          (rng) => {
            const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
            const t = distinct(rng, 5, () => rng.int(5, 25));
            const min = Math.min(...t);
            const day = days[t.indexOf(min)] ?? '';
            return {
              prompt: 'Quel jour a-t-il fait le plus froid ?',
              figure: {
                kind: 'table',
                header: true,
                rows: [
                  ['Jour', ...days],
                  ['Température (°C)', ...t.map(String)],
                ],
              },
              ...choice(
                rng,
                day,
                days
                  .filter((d) => d !== day)
                  .slice(0, 3)
                  .map((d) => ({ label: d, why: 'Le plus froid : la plus petite température.' })),
              ),
              hint: 'Cherche la plus petite température.',
              steps: [`La plus petite température est ${min} °C.`, `C’est **${day}**.`],
              targetSeconds: 25,
            };
          },
        ),
        S(
          id('boss-donnees-ecart'),
          'Problème : l’écart',
          'Résoudre des problèmes en une ou plusieurs étapes en utilisant les données d’un tableau',
          ['L’écart entre deux valeurs : la plus grande moins la plus petite.'],
          (rng) => {
            const labels = distinct(rng, 3, () => rng.pick(['Foot', 'Danse', 'Judo', 'Tennis', 'Basket']));
            const values = labels.map(() => rng.int(3, 20));
            const max = Math.max(...values);
            const min = Math.min(...values);
            return {
              prompt: 'Combien d’élèves de plus dans le sport le plus pratiqué que dans le moins pratiqué ?',
              figure: {
                kind: 'bars',
                title: 'Sports pratiqués',
                bars: labels.map((label, i) => ({ label, value: values[i] ?? 0 })),
                unit: 'élèves',
              },
              answer: num(max - min),
              traps: traps(r(max - min), [[max + min, 'On cherche l’écart : une soustraction.']]),
              hint: 'Plus haute barre − plus basse barre.',
              steps: [`Plus haute : ${max} ; plus basse : ${min}.`, `${max} − ${min} = **${max - min}**.`],
              targetSeconds: 35,
            };
          },
        ),
      ],
      [
        S(
          id('boss-donnees-piege'),
          'Piège : lire la bonne barre',
          'Lire et interpréter les données d’un diagramme en barres',
          ['Vérifie l’étiquette sous la barre avant de lire sa hauteur.'],
          (rng) => {
            const a = rng.int(4, 12);
            const b = rng.int(4, 12) + 1;
            return {
              prompt: `Le diagramme montre ${a} chats et ${b === a ? b + 1 : b} chiens. Combien de chats ?`,
              answer: num(a),
              traps: traps(r(a), [[b === a ? b + 1 : b, 'Ça, c’est le nombre de chiens.']]),
              hint: 'Lis bien la question : on veut les chats.',
              steps: ['On repère la barre des chats.', `**${a}** chats.`],
              targetSeconds: 15,
            };
          },
        ),
      ],
    ),
  );

  return donnees;
}
