import { choice, fraction, num, traps } from '../../build.ts';
import { fmt, frac, r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

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

export const probabilites = C(
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
