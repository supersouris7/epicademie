import { choice, num, traps } from '../../build.ts';
import { fmt, mul, r } from '../../rational.ts';
import { bossOf, sgn } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Fonctions ———

const programmeCalcul = S(
  'm4-programme-calcul',
  'Programme de calcul',
  'Savoir appliquer un programme de calcul à deux (plusieurs) étapes à un nombre simple puis à une variable',
  ['On applique les étapes **dans l’ordre**. Avec x : « multiplier par 3 puis ajouter 4 » donne 3x + 4.'],
  (rng, level) => {
    const a = rng.int(2, 6);
    const b = rng.int(1, 9);
    if (level === 3) {
      const good = `${a}(x + ${b})`;
      return {
        prompt: `Programme : choisir x, ajouter ${b}, multiplier le résultat par ${a}. Quelle expression obtient-on ?`,
        ...choice(rng, good, [
          { label: `${a}x + ${b}`, why: `On ajoute ${b} **avant** de multiplier : il faut des parenthèses.` },
          { label: `x + ${a * b}`, why: 'Toute la somme est multipliée.' },
        ]),
        hint: 'Écris chaque étape : x, puis x + …, puis (x + …) × …',
        steps: [`x → x + ${b} → (x + ${b}) × ${a}.`, `Expression : **${good}**.`],
        targetSeconds: 30,
      };
    }
    const x = level === 1 ? rng.int(1, 10) : -rng.int(1, 10);
    const res = (x + b) * a;
    return {
      prompt: `Programme : choisir un nombre, ajouter ${b}, multiplier par ${a}. Quel résultat avec ${sgn(x)} ?`,
      answer: num(res),
      traps: traps(r(res), [[x * a + b, `On ajoute ${b} **d’abord**.`]]),
      hint: 'Fais les étapes dans l’ordre.',
      steps: [`${sgn(x)} + ${b} = ${sgn(x + b)}.`, `${sgn(x + b)} × ${a} = **${sgn(res)}**.`],
      targetSeconds: 25,
    };
  },
  { mental: true },
);

const remonter = S(
  'm4-remonter-programme',
  'Remonter un programme de calcul',
  'Savoir retrouver le nombre de départ après avoir remonté un programme de calcul simple',
  [
    'On part de la fin et on fait les **opérations inverses** dans l’ordre inverse : « ×3 puis +4 » se remonte par « −4 puis ÷3 ».',
  ],
  (rng) => {
    const a = rng.int(2, 9);
    const b = rng.int(1, 15);
    const x = rng.int(1, 12);
    const res = a * x + b;
    return {
      prompt: `Programme : multiplier par ${a}, puis ajouter ${b}. On obtient ${res}. Quel était le nombre de départ ?`,
      answer: num(x),
      traps: traps(r(x), [
        [r(res, a), `Remonte d’abord le « + ${b} ».`],
        [r(res - b), `Il faut encore diviser par ${a}.`],
      ]),
      hint: `Opérations inverses dans l’ordre inverse : −${b}, puis ÷${a}.`,
      steps: [`${res} − ${b} = ${res - b}.`, `${res - b} ÷ ${a} = **${x}**.`],
      targetSeconds: 30,
    };
  },
  { mental: true },
);

const formuleGrandeur = S(
  'm4-formule',
  'Une grandeur en fonction d’une autre',
  'Produire une formule littérale représentant la dépendance d’une grandeur en fonction d’une autre',
  ['Prix = 2 × nombre de cafés + 5 (pour une entrée à 5 €) : on écrit P = 2n + 5, puis on remplace n par la valeur.'],
  (rng) => {
    const per = rng.int(2, 9);
    const fixed = rng.int(3, 20);
    const n = rng.int(2, 15);
    return {
      prompt: `Une salle de jeux coûte ${fixed} € l’entrée plus ${per} € par partie. Avec la formule P = ${per}n + ${fixed}, combien paie-t-on pour ${n} parties ?`,
      answer: num(per * n + fixed, '€'),
      traps: traps(r(per * n + fixed), [
        [per * n, `N’oublie pas l’entrée (${fixed} €).`],
        [(per + fixed) * n, 'L’entrée ne se paie qu’une fois.'],
      ]),
      hint: `Remplace n par ${n}.`,
      steps: [`P = ${per} × ${n} + ${fixed}.`, `= ${per * n} + ${fixed} = **${per * n + fixed} €**.`],
      targetSeconds: 30,
    };
  },
);

const lireGraphique = S(
  'm4-lire-graphique',
  'Lire un graphique',
  'Représenter l’expression d’une grandeur en fonction d’une autre par un graphique',
  [
    'Pour lire sur un graphique : pars de la valeur sur l’axe horizontal, monte jusqu’à la courbe, puis lis sur l’axe vertical.',
  ],
  (rng) => {
    const a = rng.int(1, 3);
    const b = rng.int(0, 4);
    const pts = Array.from({ length: 7 }, (_, x) => ({ x, y: a * x + b }));
    const x = rng.int(1, 6);
    return {
      prompt: `Ce graphique donne le prix (en €) en fonction du nombre de tickets. Combien coûtent ${x} tickets ?`,
      figure: { kind: 'chart', xLabel: 'Tickets', yLabel: 'Prix (€)', points: pts, line: true },
      answer: num(a * x + b, '€'),
      traps: traps(r(a * x + b), [[x, 'Lis la valeur sur l’axe **vertical** (le prix).']]),
      hint: `Pars de ${x} sur l’axe horizontal, monte jusqu’à la droite.`,
      steps: [
        `Au-dessus de ${x}, la droite est à la hauteur ${a * x + b}.`,
        `${x} tickets coûtent **${a * x + b} €**.`,
      ],
      targetSeconds: 25,
    };
  },
);

export const fonctions = C(
  'm4-fonctions',
  'fonctions',
  'Programmes de calcul et fonctions',
  [programmeCalcul, remonter, formuleGrandeur, lireGraphique],
  bossOf(
    [
      S(
        'm4-boss-fonctions-taxi',
        'Problème : le taxi',
        'Produire une formule littérale représentant la dépendance d’une grandeur en fonction d’une autre',
        ['Prix = prise en charge + prix au km × distance.'],
        (rng) => {
          const base = rng.pick([3, 4, 5]);
          const km = r(rng.pick([12, 15, 18, 20]), 10);
          const d = rng.int(4, 25);
          const res = mul(km, r(d));
          const total = r(res.n * 1 + base * res.d, res.d);
          return {
            prompt: `Un taxi coûte ${base} € de prise en charge plus ${fmt(km)} € par km. Combien coûte une course de ${d} km ?`,
            answer: num(total, '€'),
            traps: traps(total, [[res, `N’oublie pas la prise en charge (${base} €).`]]),
            hint: `Prix = prise en charge + prix au km × nombre de km.`,
            steps: [`${fmt(km)} × ${d} = ${fmt(res)} €.`, `${fmt(res)} + ${base} = **${fmt(total)} €**.`],
            targetSeconds: 45,
          };
        },
        { advice: 'calculatrice' },
      ),
      S(
        'm4-boss-fonctions-mystere',
        'Problème : le nombre mystère',
        'Savoir retrouver le nombre de départ après avoir remonté un programme de calcul simple',
        ['On remonte : opérations inverses, dans l’ordre inverse.'],
        (rng) => {
          const x = rng.int(2, 15);
          const a = rng.int(2, 5);
          const b = rng.int(2, 9);
          const res = (x - b) * a;
          return {
            prompt: `Je choisis un nombre, je lui retire ${b}, puis je multiplie par ${a}. J’obtiens ${sgn(res)}. Quel nombre ai-je choisi ?`,
            answer: num(x),
            traps: traps(r(x), [
              [r(res, a), `Il faut encore ajouter ${b}.`],
              [r(res + b, a), 'Remonte dans l’ordre inverse : d’abord ÷, puis +.'],
            ]),
            hint: `Divise par ${a}, puis ajoute ${b}.`,
            steps: [`${sgn(res)} ÷ ${a} = ${sgn(res / a)}.`, `${sgn(res / a)} + ${b} = **${x}**.`],
            targetSeconds: 45,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-fonctions-piege',
        'Piège : l’ordre des étapes',
        'Savoir appliquer un programme de calcul à deux (plusieurs) étapes à un nombre simple puis à une variable',
        ['« Ajouter 2 puis multiplier par 5 » donne 5(x + 2) = 5x + 10, pas 5x + 2.'],
        (rng) => {
          const a = rng.int(3, 7);
          const b = rng.int(2, 6);
          const good = `${a}x + ${a * b}`;
          return {
            prompt: `Programme : ajouter ${b} à x, puis multiplier par ${a}. Quelle expression développée obtient-on ?`,
            ...choice(rng, good, [
              { label: `${a}x + ${b}`, why: `Le ${b} est aussi multiplié par ${a}.` },
              { label: `${a + b}x`, why: 'On ne mélange pas les x et les nombres.' },
            ]),
            hint: `Écris ${a}(x + ${b}) puis développe.`,
            steps: [`${a}(x + ${b}) = ${a}x + ${a} × ${b}.`, `= **${good}**.`],
            targetSeconds: 30,
          };
        },
      ),
    ],
  ),
);
