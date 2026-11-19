import { choice, nonZero, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import { bossOf, MINUS, par, sgn } from '../kit.ts';
import { S, C, lin } from './commun.ts';

// ——— Fonctions ———

const imageAntecedent = S(
  'm3-image-antecedent',
  'Image et antécédent',
  'Définir et connaitre le vocabulaire : image, antécédents',
  [
    'f(3) = 7 : **7 est l’image** de 3 et **3 est un antécédent** de 7.',
    'Image : on remplace x. Antécédent : on résout f(x) = valeur.',
  ],
  (rng, level) => {
    const a = nonZero(rng, -5, 5);
    const b = rng.int(-9, 9);
    const x = rng.int(-6, 6);
    const y = a * x + b;
    if (level === 3) {
      return {
        prompt: `f(x) = ${lin(a, b)}. Quel est l’antécédent de ${sgn(y)} par f ?`,
        answer: num(x),
        traps: traps(r(x), [
          [a * y + b, 'Ça, c’est l’**image** de ' + sgn(y) + '. On cherche x tel que f(x) = ' + sgn(y) + '.'],
        ]),
        hint: `Résous ${lin(a, b)} = ${sgn(y)}.`,
        steps: [
          `${lin(a, 0)} = ${sgn(y)} − ${par(b)} = ${sgn(y - b)}.`,
          `x = ${sgn(y - b)} ÷ ${par(a)} = **${sgn(x)}**.`,
        ],
        targetSeconds: 35,
      };
    }
    return {
      prompt: `f(x) = ${lin(a, b)}. Calcule l’image de ${sgn(x)}.`,
      answer: num(y),
      traps: traps(r(y), [[a + x + b, `${lin(a, 0)} signifie ${sgn(a)} × x.`]]),
      hint: `Remplace x par ${sgn(x)}.`,
      steps: [`f(${sgn(x)}) = ${sgn(a)} × ${par(x)} ${b < 0 ? MINUS : '+'} ${Math.abs(b)}.`, `= **${sgn(y)}**.`],
      targetSeconds: 25,
    };
  },
);

const lineaire = S(
  'm3-lineaire',
  'Fonctions linéaires',
  'Définir et utiliser les fonctions linéaires',
  [
    'Une fonction **linéaire** s’écrit f(x) = ax : elle traduit une situation de **proportionnalité** ; sa droite passe par l’origine.',
    'Si f(4) = 12, alors a = 12 ÷ 4 = 3.',
  ],
  (rng) => {
    const a = nonZero(rng, -6, 9);
    const x = nonZero(rng, -6, 9);
    return {
      prompt: `f est une fonction linéaire et f(${sgn(x)}) = ${sgn(a * x)}. Quel est son coefficient a ?`,
      answer: num(a),
      traps: traps(r(a), [
        [a * x - x, 'f(x) = ax : on divise, on ne soustrait pas.'],
        [r(x, a * x), 'C’est l’inverse : a = f(x) ÷ x.'],
      ]),
      hint: 'f(x) = a × x : a = f(x) ÷ x.',
      steps: [`a = ${sgn(a * x)} ÷ ${par(x)}.`, `a = **${sgn(a)}**.`],
      targetSeconds: 25,
    };
  },
);

const affineGraphique = S(
  'm3-affine-graphique',
  'Fonction affine : lire a et b',
  'Déterminer graphiquement les coefficients d’une fonction affine',
  [
    'f(x) = ax + b : **b** est l’ordonnée à l’origine (où la droite coupe l’axe vertical) ; **a** est ce dont on monte quand x augmente de 1.',
  ],
  (rng, level) => {
    const a = rng.int(1, 3);
    const b = rng.int(0, 6);
    const pts = Array.from({ length: 6 }, (_, x) => ({ x, y: a * x + b }));
    const askB = level === 1;
    return {
      prompt: `La droite représente f(x) = ax + b. Combien vaut ${askB ? 'b' : 'a'} ?`,
      figure: { kind: 'chart', xLabel: 'x', yLabel: 'f(x)', points: pts, line: true },
      answer: num(askB ? b : a),
      traps: traps(r(askB ? b : a), [
        [
          askB ? a : b,
          askB ? 'b se lit sur l’axe vertical, quand x = 0.' : 'a : de combien monte la droite quand x augmente de 1 ?',
        ],
      ]),
      hint: askB
        ? 'Où la droite coupe-t-elle l’axe vertical (x = 0) ?'
        : 'Quand x augmente de 1, de combien f(x) augmente-t-il ?',
      steps: [
        askB ? `Pour x = 0, la droite est à la hauteur ${b}.` : `De x = 0 à x = 1, f passe de ${b} à ${a + b}.`,
        `${askB ? 'b' : 'a'} = **${askB ? b : a}**.`,
      ],
      targetSeconds: 30,
    };
  },
);

const affineCalcul = S(
  'm3-affine',
  'Fonctions affines',
  'Définir et utiliser les fonctions affines',
  ['f(x) = ax + b. Avec deux points : a = {f(x₂) − f(x₁)/x₂ − x₁}, puis b = f(x₁) − a × x₁.'],
  (rng) => {
    const a = nonZero(rng, -5, 5);
    const b = rng.int(-9, 9);
    const x1 = rng.int(-3, 2);
    const x2 = x1 + rng.int(1, 4);
    return {
      prompt: `f est affine, f(${sgn(x1)}) = ${sgn(a * x1 + b)} et f(${sgn(x2)}) = ${sgn(a * x2 + b)}. Calcule a.`,
      answer: num(a),
      traps: traps(r(a), [
        [r(x2 - x1, a * (x2 - x1)), 'C’est à l’envers : écart des images ÷ écart des x.'],
        [a * (x2 - x1), `Divise par l’écart des x (${x2 - x1}).`],
      ]),
      hint: 'a = (écart des images) ÷ (écart des x).',
      steps: [
        `a = (${sgn(a * x2 + b)} − ${par(a * x1 + b)}) ÷ (${sgn(x2)} − ${par(x1)}) = ${sgn(a * (x2 - x1))} ÷ ${x2 - x1}.`,
        `a = **${sgn(a)}**.`,
      ],
      targetSeconds: 40,
    };
  },
);

const fonctionCarre = S(
  'm3-fonction-carre',
  'La fonction carré',
  'Représenter la fonction carré',
  ['f(x) = x^2 : l’image est toujours positive ou nulle ; f(−3) = f(3) = 9 (la courbe est symétrique).'],
  (rng) => {
    const x = nonZero(rng, -9, 9);
    return {
      prompt: `f(x) = x^2. Calcule f(${sgn(x)}).`,
      answer: num(x * x),
      traps: traps(r(x * x), [
        [-(x * x), 'Un carré est toujours positif : (−a)^2 = a^2.'],
        [2 * x, 'x^2 = x × x, pas 2 × x.'],
      ]),
      hint: `Le carré de ${sgn(x)}, c’est ${par(x)} × ${par(x)}.`,
      steps: [`f(${sgn(x)}) = ${par(x)} × ${par(x)}.`, `= **${x * x}**.`],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

export const fonctions = C(
  'm3-fonctions',
  'fonctions',
  'Fonctions linéaires et affines',
  [imageAntecedent, lineaire, affineGraphique, affineCalcul, fonctionCarre],
  bossOf(
    [
      S(
        'm3-boss-fonctions-forfaits',
        'Problème : deux abonnements',
        'Résoudre graphiquement des équations et des inéquations linéaires',
        [
          'Abonnement A : f(x) = 3x (linéaire). B : g(x) = 2x + 10 (affine). Même prix quand 3x = 2x + 10, soit x = 10.',
        ],
        (rng) => {
          const pa = rng.int(3, 6);
          const pb = pa - rng.int(1, 2);
          const fee = (pa - pb) * rng.int(4, 12);
          const x = fee / (pa - pb);
          return {
            prompt: `Piscine : tarif A à ${pa} € l’entrée ; tarif B avec carte à ${fee} € puis ${pb} € l’entrée. À partir de combien d’entrées le tarif B devient-il plus avantageux (strictement) ?`,
            answer: num(x + 1),
            traps: traps(r(x + 1), [[x, `Pour ${x} entrées, les deux tarifs sont égaux : il en faut une de plus.`]]),
            hint: `Résous ${pa}x = ${fee} + ${pb}x.`,
            steps: [
              `${pa}x = ${fee} + ${pb}x ⟺ ${pa - pb}x = ${fee} ⟺ x = ${x} (prix égaux).`,
              `B est moins cher à partir de **${x + 1}** entrées.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm3-boss-fonctions-taxi',
        'Problème : retrouver la formule',
        'Définir et utiliser les fonctions affines',
        ['Prix = a × distance + b : a est le prix par km (pente), b la prise en charge.'],
        (rng) => {
          const a = rng.int(1, 3);
          const b = rng.int(2, 6);
          const d1 = rng.int(2, 5);
          const d2 = d1 + rng.int(3, 8);
          return {
            prompt: `Un taxi facture ${a * d1 + b} € pour ${d1} km et ${a * d2 + b} € pour ${d2} km (fonction affine). Combien coûte la prise en charge (prix pour 0 km) ?`,
            answer: num(b, '€'),
            traps: traps(r(b), [[a, 'Ça, c’est le prix par km (a). La prise en charge est b.']]),
            hint: 'Trouve d’abord le prix par km : écart de prix ÷ écart de distance.',
            steps: [
              `a = (${a * d2 + b} − ${a * d1 + b}) ÷ (${d2} − ${d1}) = ${a} € par km.`,
              `b = ${a * d1 + b} − ${a} × ${d1} = **${b} €**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
    ],
    [
      S(
        'm3-boss-fonctions-piege',
        'Piège : image ou antécédent ?',
        'Définir et connaitre le vocabulaire : image, antécédents',
        ['f(2) = 5 : 5 est l’**image** de 2, et 2 est **un antécédent** de 5 (pas l’inverse !).'],
        (rng) => {
          const x = rng.int(2, 9);
          const y = rng.int(10, 30);
          return {
            prompt: `f(${x}) = ${y}. Quelle phrase est juste ?`,
            ...choice(rng, `${y} est l’image de ${x}`, [
              { label: `${x} est l’image de ${y}`, why: 'L’image est le résultat, f(x).' },
              { label: `${y} est un antécédent de ${x}`, why: 'L’antécédent est le nombre de départ, x.' },
            ]),
            hint: 'f(nombre de départ) = image.',
            steps: [`f(${x}) = ${y} : on part de ${x} et on obtient ${y}.`, `**${y} est l’image de ${x}**.`],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);
