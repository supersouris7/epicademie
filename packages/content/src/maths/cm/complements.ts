import { choice, distinct, fraction, num, traps } from '../../build.ts';
import { dec, fmt, mul, r, rawFrac, sub, toNumber, type Rational } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { big } from '../kit.ts';
import type { Contexte } from './contexte.ts';
import { exactDecimal } from './outils.ts';

/**
 * Lot d'audit du CM1 (ma-cm1-audit) : notions du programme (BO n°16 du 17 avril 2025, CM1) absentes des
 * chapitres existants. Chacune a 5 niveaux (grille de docs/contenus/README.md §1) et cite sa source du registre.
 * Réservées au CM1 : le CM2 a ses propres bornes (lot d'audit du CM2).
 */
const PROGRAMME = 'maths-cycle3-2025';

/** Rangs de la numération, de l'unité à la centaine de mille (nom au singulier, au pluriel, valeur). */
const RANGS = [
  { un: 'unité', plus: 'unités', v: 1 },
  { un: 'dizaine', plus: 'dizaines', v: 10 },
  { un: 'centaine', plus: 'centaines', v: 100 },
  { un: 'millier', plus: 'milliers', v: 1000 },
  { un: 'dizaine de mille', plus: 'dizaines de mille', v: 10_000 },
  { un: 'centaine de mille', plus: 'centaines de mille', v: 100_000 },
] as const;

const rang = (i: number) => RANGS[i] ?? RANGS[0];
/** Montant en euros avec deux décimales (« 5,50 »). */
const euros = (x: Rational) => toNumber(x).toFixed(2).replace('.', ',');
/** « Une dizaine » / « Un millier » (début de phrase). */
const une = (x: (typeof RANGS)[number]) => `${x.un === 'millier' ? 'Un' : 'Une'} ${x.un}`;
/** « de dizaines » / « d’unités ». */
const de = (w: string) => (/^[aeiouyéè]/.test(w) ? `d’${w}` : `de ${w}`);

export function buildComplements({ S, id, g }: Contexte): Readonly<Record<string, readonly Skill[]>> {
  if (g !== 'cm1') return {};

  /** Notion à 5 niveaux : ajoute la source du programme et le niveau maximal. */
  const N: typeof S = (sid, title, objective, memo, generate, options) => {
    const s = S(sid, title, objective, memo, generate, options);
    return { ...s, levels: 5, lesson: { ...s.lesson, sources: [PROGRAMME] } };
  };

  // ——— Les nombres entiers : relations entre unités de numération ———

  const unitesNumeration = N(
    id('unites-numeration'),
    'Les unités de numération',
    'Connaître et utiliser les relations entre les unités de numération',
    [
      'Dans notre numération, 10 unités d’un rang font 1 unité du rang d’après : 10 dizaines = 1 centaine, 10 centaines = 1 millier.',
      'Dans 3 400, il y a 34 centaines : 3 milliers, c’est 30 centaines, et 4 centaines de plus.',
    ],
    (rng, level) => {
      if (level === 1) {
        const i = rng.int(1, 5);
        const low = rang(i - 1);
        return {
          prompt: `${une(rang(i))}, c’est combien ${de(low.plus)} ?`,
          ...choice(rng, `10 ${low.plus}`, [
            { label: `100 ${low.plus}`, why: 'Entre deux rangs voisins, on passe de 1 à 10 : pas à 100.' },
            { label: `2 ${low.plus}`, why: 'Dans notre numération, on regroupe par 10, pas par 2.' },
          ]),
          hint: 'On regroupe toujours par paquets de 10 pour passer au rang suivant.',
          steps: [
            `On regroupe par 10 : 10 ${low.plus} font 1 ${rang(i).un}.`,
            `${une(rang(i))}, c’est **10 ${low.plus}**.`,
          ],
          targetSeconds: 15,
        };
      }
      if (level === 2) {
        const down = rng.int(2, 3);
        const i = rng.int(down, 5);
        const low = rang(i - down);
        const good = 10 ** down;
        return {
          prompt: `${une(rang(i))}, c’est combien ${de(low.plus)} ?`,
          ...choice(
            rng,
            big(good),
            [10, 100, 1000, 10_000]
              .filter((v) => v !== good)
              .map((v) => ({
                label: big(v),
                why:
                  v === 10
                    ? 'Dix, c’est seulement le rang juste en dessous. Ici, il faut descendre de plusieurs rangs.'
                    : `On descend de ${down} rangs et chaque rang multiplie par 10 : ça fait ${big(good)}, pas ${big(v)}.`,
              })),
          ),
          hint: 'Descends rang par rang : chaque rang vaut 10 fois le rang d’en dessous. Combien de rangs ici ?',
          steps: [
            `Du rang des ${rang(i).plus} à celui des ${low.plus}, on descend de ${down} rangs.`,
            `Chaque rang vaut 10 fois le suivant : **${big(good)} ${low.plus}**.`,
          ],
          targetSeconds: 25,
        };
      }
      if (level === 3) {
        const j = rng.int(1, 3);
        const n = rng.int(1100, 99_999);
        const v = rang(j).v;
        const total = Math.floor(n / v);
        const digit = total % 10;
        return {
          prompt: `Dans ${big(n)}, combien y a-t-il de ${rang(j).plus} en tout ?`,
          answer: num(total),
          traps: traps(r(total), [
            [digit, `Ce chiffre n’est que le rang des ${rang(j).plus} : on te demande combien il y en a EN TOUT.`],
            [Math.floor(n / (v * 10)), `Tu as compté des ${rang(j + 1).plus}, pas des ${rang(j).plus}.`],
          ]),
          hint: `Combien de fois ${big(v)} tient dans ${big(n)} ? Coupe le nombre à droite du rang des ${rang(j).plus}.`,
          steps: [
            `1 ${rang(j).un} = ${big(v)}. On cherche combien de fois ${big(v)} tient dans ${big(n)}.`,
            `On garde les chiffres à gauche du rang des ${rang(j).plus} : **${big(total)}**.`,
          ],
          targetSeconds: 25,
        };
      }
      if (level === 4) {
        const a = rng.int(1, 9);
        const b = rng.int(10, 19);
        const c = rng.int(1, 9);
        const good = a * 1000 + b * 100 + c;
        return {
          prompt: `Écris en chiffres : ${a} milliers + ${b} centaines + ${c} unités.`,
          answer: num(good),
          traps: traps(r(good), [
            [a * 1000 + b * 10 + c, `${b} centaines, c’est ${big(b * 100)} (pas ${b * 10}).`],
            [a + b + c, 'Chaque rang a sa valeur : un millier vaut 1 000, une centaine vaut 100.'],
          ]),
          hint: `Calcule chaque paquet : ${a} × 1 000, puis ${b} × 100, puis ajoute.`,
          steps: [
            `${a} milliers = ${big(a * 1000)} ; ${b} centaines = ${big(b * 100)} ; ${c} unités = ${c}.`,
            `${big(a * 1000)} + ${big(b * 100)} + ${c} = **${big(good)}**.`,
          ],
          targetSeconds: 35,
        };
      }
      const n = rng.int(10_000, 99_999);
      if (rng.int(0, 1) === 0) {
        const good = Math.floor(n / 100);
        return {
          prompt: `Une usine range ses vis par boîtes de 10, et 10 boîtes font un carton de 100 vis. Elle a ${big(n)} vis. Combien de cartons complets peut-elle remplir ?`,
          answer: num(good),
          traps: traps(r(good), [
            [Math.floor(n / 1000), 'Ça, ce sont des paquets de 1 000 vis. Un carton en contient 100.'],
            [Math.floor(n / 10), 'Ça, ce sont les boîtes de 10 vis : il faut ensuite les regrouper par 10.'],
          ]),
          hint: 'Un carton = 10 boîtes de 10 vis = combien de vis ? Combien de fois ce nombre tient dans le total ?',
          steps: [
            'Un carton contient 10 × 10 = 100 vis.',
            `${big(n)} vis, c’est ${big(n)} ÷ 100 : on garde les chiffres à gauche des dizaines → **${big(good)} cartons**.`,
          ],
          targetSeconds: 45,
        };
      }
      const good = n % 1000;
      return {
        prompt: `Une usine range ses vis par palettes de 1 000 vis. Elle a ${big(n)} vis. Combien de vis restent hors des palettes complètes ?`,
        answer: num(good),
        traps: traps(r(good), [
          [Math.floor(n / 1000), 'Ça, c’est le nombre de palettes complètes, pas les vis qui restent.'],
          [n % 100, 'Une palette contient 1 000 vis : le reste peut aller jusqu’à 999.'],
        ]),
        hint: 'Combien de palettes complètes ? Retire-les du total : que reste-t-il ?',
        steps: [
          `${big(n)} = ${big(Math.floor(n / 1000))} milliers + le reste.`,
          `Le reste, c’est ce qui dépasse les milliers : **${good} vis**.`,
        ],
        targetSeconds: 45,
      };
    },
    { mental: true },
  );

  // ——— Les fractions : encadrer et repérer ———

  const encadrerFraction = N(
    id('encadrer-fraction'),
    'Encadrer une fraction',
    'Savoir encadrer une fraction par deux nombres entiers consécutifs',
    [
      'Pour encadrer {7/4}, compte combien de fois le **dénominateur** 4 tient dans le **numérateur** 7 : une fois, et il reste 3.',
      'Donc {7/4} est entre 1 et 2.',
    ],
    (rng, level) => {
      const d = level <= 2 ? rng.int(2, 6) : level === 3 ? rng.int(3, 12) : rng.int(11, 20);
      const k = level === 1 ? rng.int(1, 2) : level === 2 ? rng.int(1, 4) : rng.int(1, 9);
      const rest = rng.int(1, d - 1);
      const n = k * d + rest;
      const f = rawFrac(n, d);
      if (level <= 2) {
        const wrong = [
          {
            label: `entre ${k + 1} et ${k + 2}`,
            why: `Attention : ${f} est plus petit que ${k + 1}, car ${n} < ${(k + 1) * d}.`,
          },
          k >= 2
            ? { label: `entre ${k - 1} et ${k}`, why: `${f} est déjà plus grand que ${k} = ${rawFrac(k * d, d)}.` }
            : { label: `entre 0 et 1`, why: `${f} est plus grand que 1, car ${n} > ${d}.` },
          {
            label: `entre ${k + 2} et ${k + 3}`,
            why: `Beaucoup trop grand : ${k + 1} vaut déjà ${rawFrac((k + 1) * d, d)}.`,
          },
        ];
        return {
          prompt: `${f} est compris entre quels deux entiers consécutifs ?`,
          ...choice(rng, `entre ${k} et ${k + 1}`, level === 1 ? wrong.slice(0, 2) : wrong),
          hint: `Combien de fois ${d} tient dans ${n} ?`,
          steps: [
            `${k} = ${rawFrac(k * d, d)} et ${k + 1} = ${rawFrac((k + 1) * d, d)}.`,
            `${k * d} < ${n} < ${(k + 1) * d} : ${f} est **entre ${k} et ${k + 1}**.`,
          ],
          targetSeconds: 20,
        };
      }
      if (level === 3) {
        return {
          prompt: `Quel est le plus grand nombre entier plus petit que ${f} ?`,
          answer: num(k),
          traps: traps(r(k), [
            [k + 1, `${k + 1} = ${rawFrac((k + 1) * d, d)} est plus GRAND que ${f}.`],
            [rest, `${rest} est le reste de la division de ${n} par ${d}, pas l’entier cherché.`],
          ]),
          hint: `Combien de fois ${d} tient dans ${n} ? Tu cherches l’entier juste en dessous.`,
          steps: [
            `${n} = ${d} × ${k} + ${rest} : ${f} = ${k} + ${rawFrac(rest, d)}.`,
            `L’entier juste en dessous : **${k}**.`,
          ],
          targetSeconds: 25,
        };
      }
      if (level === 4) {
        return {
          prompt: `Quel est le plus petit nombre entier plus grand que ${f} ?`,
          answer: num(k + 1),
          traps: traps(r(k + 1), [
            [k, `${k} = ${rawFrac(k * d, d)} est plus PETIT que ${f}.`],
            [k + 2, `${k + 2} est trop grand : ${k + 1} suffit déjà pour dépasser ${f}.`],
          ]),
          hint: `Cherche d’abord combien de fois ${d} tient dans ${n}, puis passe à l’entier suivant.`,
          steps: [
            `${n} = ${d} × ${k} + ${rest} : ${f} est entre ${k} et ${k + 1}.`,
            `Le plus petit entier plus grand : **${k + 1}**.`,
          ],
          targetSeconds: 30,
        };
      }
      const what = rng.pick(['de lait', 'de jus de pomme', 'd’eau']);
      return {
        prompt: `Une recette demande ${f} L ${what}. Les bouteilles contiennent 1 L chacune. Combien de bouteilles faut-il ouvrir, au minimum ?`,
        answer: num(k + 1),
        traps: traps(r(k + 1), [
          [
            k,
            `${k} bouteille${k > 1 ? 's' : ''} ne donne${k > 1 ? 'nt' : ''} que ${k} L : il manque ${rawFrac(rest, d)} L.`,
          ],
          [n, `${n} est le numérateur : on ne compte pas ${n} L, mais ${n} parts de ${rawFrac(1, d)} L.`],
        ]),
        hint: 'Entre quels entiers est la fraction ? Il faut assez de litres entiers pour la dépasser.',
        steps: [
          `${f} = ${k} + ${rawFrac(rest, d)} : c’est entre ${k} et ${k + 1} L.`,
          `Avec ${k} bouteille${k > 1 ? 's' : ''}, il manque un peu : il en faut **${k + 1}**.`,
        ],
        targetSeconds: 45,
      };
    },
    { mental: true },
  );

  const fractionDroite = N(
    id('fraction-droite'),
    'Repérer une fraction sur une demi-droite graduée',
    'Savoir repérer un point d’une demi-droite graduée par une fraction ou par la somme d’un nombre entier et d’une fraction',
    [
      'Sur une demi-droite, l’unité est coupée en parts égales : le nombre de parts par unité est le **dénominateur**.',
      'Le **numérateur**, c’est le nombre de graduations depuis 0. Avec des quarts, le point à 7 graduations est {7/4}.',
    ],
    (rng, level) => {
      const d = level <= 2 ? rng.int(2, 5) : rng.int(3, 8);
      const len = level === 1 ? 2 : level === 2 ? 3 : level === 3 ? 3 : 4;
      const line = (points: { name: string; at: number }[]) => ({
        kind: 'numberLine' as const,
        min: 0,
        max: len,
        subdivisions: d,
        labels: Array.from({ length: len + 1 }, (_, i) => i),
        points,
      });
      let n = rng.int(1, len * d - 1);
      while (n % d === 0) n = rng.int(1, len * d - 1);
      const k = Math.floor(n / d);
      if (level <= 2) {
        const wrong = [
          {
            label: rawFrac(d, n),
            why: 'En haut, on met le nombre de graduations depuis 0 ; en bas, le nombre de parts dans UNE unité.',
          },
          {
            label: rawFrac(n, len * d),
            why: `Le dénominateur est le nombre de parts dans une unité (${d}), pas dans toute la droite.`,
          },
          {
            label: rawFrac(n > d ? n - d : n + d, d),
            why: 'Compte toutes les graduations depuis 0 : ni une unité de moins, ni une de plus.',
          },
        ];
        return {
          prompt:
            level === 1
              ? `Chaque unité est coupée en ${d} parts égales. Quelle fraction repère le point A ?`
              : `Quelle fraction repère le point A ?`,
          figure: line([{ name: 'A', at: n / d }]),
          ...choice(rng, rawFrac(n, d), level === 1 ? wrong.slice(0, 2) : wrong),
          hint: `Entre 0 et 1, combien de parts ? Puis compte les graduations depuis 0 jusqu’à A.`,
          steps: [
            `Chaque unité est coupée en ${d} parts : le dénominateur est ${d}.`,
            `A est à ${n} graduation${n > 1 ? 's' : ''} de 0 : **${rawFrac(n, d)}**.`,
          ],
          targetSeconds: 25,
        };
      }
      if (level === 3) {
        return {
          prompt: `Chaque unité est coupée en ${d} parts égales. Le point A est repéré par une fraction de dénominateur ${d}. Quel est son numérateur ?`,
          figure: line([{ name: 'A', at: n / d }]),
          answer: num(n),
          traps: traps(r(n), [
            [n - k * d, `Tu as compté depuis le dernier entier (${k}). Il faut compter depuis 0.`],
            [d, `${d}, c’est le dénominateur (le nombre de parts par unité).`],
          ]),
          hint: 'Compte toutes les graduations depuis 0 jusqu’à A.',
          steps: [
            `Depuis 0, il y a ${k} unité${k > 1 ? 's' : ''} entière${k > 1 ? 's' : ''} de ${d} parts, puis ${n - k * d} part${n - k * d > 1 ? 's' : ''}.`,
            `${k} × ${d} + ${n - k * d} = **${n}**.`,
          ],
          targetSeconds: 30,
        };
      }
      if (level === 4) {
        return {
          prompt: `Écris la fraction (numérateur et dénominateur) qui repère le point A, sans propositions.`,
          figure: line([{ name: 'A', at: n / d }]),
          answer: fraction(r(n, d)),
          traps: traps(r(n, d), [
            [r(d, n), 'Tu as inversé : en haut, les graduations depuis 0 ; en bas, les parts par unité.'],
            [
              r(n - k * d, d),
              `Il manque les ${k} unité${k > 1 ? 's' : ''} entière${k > 1 ? 's' : ''} avant le dernier entier.`,
            ],
          ]),
          hint: 'Combien de parts dans une unité ? Combien de graduations de 0 à A ?',
          steps: [
            `Dénominateur : ${d} parts par unité.`,
            `Numérateur : ${n} graduation${n > 1 ? 's' : ''} depuis 0. **${rawFrac(n, d)}**.`,
          ],
          targetSeconds: 35,
        };
      }
      let m = rng.int(n + 1, len * d);
      while ((m - n) % d === 0) m = rng.int(n + 1, len * d);
      const gap = r(m - n, d);
      return {
        prompt: `Sur cette demi-droite, quelle fraction mesure la distance de A à B ?`,
        figure: line([
          { name: 'A', at: n / d },
          { name: 'B', at: m / d },
        ]),
        answer: fraction(gap),
        traps: traps(gap, [
          [r(m, d), 'C’est la distance de 0 à B. Pour AB, retire la partie de 0 à A.'],
          [r(m + n, d), 'On soustrait les deux positions, on ne les additionne pas.'],
        ]),
        hint: 'Lis la fraction de A et celle de B, puis cherche l’écart entre les deux.',
        steps: [
          `A = ${rawFrac(n, d)} et B = ${rawFrac(m, d)}.`,
          `${m} − ${n} = ${m - n} graduations de ${rawFrac(1, d)} : **${rawFrac(m - n, d)}**.`,
        ],
        targetSeconds: 60,
      };
    },
  );

  // ——— Calcul mental ———

  const foisDizaines = N(
    id('fois-dizaines'),
    'Multiplier par des dizaines et des centaines',
    'Multiplier un nombre entier inférieur à 10 par un nombre entier de dizaines ou de centaines',
    [
      'Pour calculer 6 × 40, pense « 6 × 4 dizaines » : 6 × 4 = 24, donc 24 dizaines = 240.',
      'Pour 6 × 400, c’est 24 centaines : 2 400. Le **produit** garde tous les zéros du calcul.',
    ],
    (rng, level) => {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      if (level <= 2) {
        const unit = level === 1 ? 10 : rng.pick([10, 100]);
        const good = a * b * unit;
        const wrong = [
          {
            label: big(a * b),
            why: `${a} × ${b} = ${a * b}, mais il reste ${unit === 10 ? 'le zéro des dizaines' : 'les zéros des centaines'} à remettre.`,
          },
          {
            label: big(a * b * unit * 10),
            why: `Trop de zéros : ${b * unit} a ${unit === 10 ? 'un zéro' : 'deux zéros'}, à retrouver dans le résultat (pas un de plus).`,
          },
          { label: big(a * b * (unit === 10 ? 1000 : 10)), why: `Compte bien les zéros de ${b * unit}.` },
        ];
        return {
          prompt: `Combien font ${a} × ${big(b * unit)} ?`,
          ...choice(rng, big(good), level === 1 ? wrong.slice(0, 2) : wrong),
          hint: `Calcule ${a} × ${b}, puis pense aux ${unit === 10 ? 'dizaines' : 'centaines'}.`,
          steps: [
            `${big(b * unit)} = ${b} ${unit === 10 ? 'dizaines' : 'centaines'}. ${a} × ${b} = ${a * b}.`,
            `${a * b} ${unit === 10 ? 'dizaines' : 'centaines'} = **${big(good)}**.`,
          ],
          targetSeconds: 15,
        };
      }
      if (level === 3) {
        const unit = rng.pick([10, 100]);
        return {
          prompt: `Calcule ${a} × ${big(b * unit)}.`,
          answer: num(a * b * unit),
          traps: traps(r(a * b * unit), [
            [a * b, 'Tu as oublié les zéros.'],
            [a * b * unit * 10, 'Un zéro de trop.'],
          ]),
          hint: `${a} × ${b} d’abord, puis on remet les zéros.`,
          steps: [
            `${a} × ${b} = ${a * b}.`,
            `Avec ${unit === 10 ? 'un zéro' : 'deux zéros'} : **${big(a * b * unit)}**.`,
          ],
          targetSeconds: 12,
        };
      }
      if (level === 4) {
        const unit = rng.pick([10, 100]);
        if (rng.int(0, 1) === 0) {
          return {
            prompt: `Complète : ${a} × … = ${big(a * b * unit)}.`,
            answer: num(b * unit),
            traps: traps(r(b * unit), [
              [b, `${a} × ${b} = ${a * b}, il manque les zéros.`],
              [b * unit * 10, 'Trop de zéros.'],
            ]),
            hint: `${a} fois combien donne ${a * b} ? Puis il reste des zéros.`,
            steps: [`${a} × ${b} = ${a * b}.`, `Il faut remettre les zéros : **${big(b * unit)}**.`],
            targetSeconds: 25,
          };
        }
        const c = rng.int(2, 9);
        return {
          prompt: `Calcule ${a} × ${big(b * 100 + c * 10)}.`,
          answer: num(a * (b * 100 + c * 10)),
          traps: traps(r(a * (b * 100 + c * 10)), [
            [a * (b * 100 + c), `Le ${c} est au rang des dizaines : ${c} dizaines, pas ${c} unités.`],
            [a * b * 100, `Il faut aussi compter les ${c} dizaines.`],
          ]),
          hint: `Sépare : ${a} × ${b * 100}, puis ${a} × ${c * 10}, et ajoute.`,
          steps: [
            `${a} × ${b * 100} = ${big(a * b * 100)} et ${a} × ${c * 10} = ${a * c * 10}.`,
            `${big(a * b * 100)} + ${a * c * 10} = **${big(a * (b * 100 + c * 10))}**.`,
          ],
          targetSeconds: 25,
        };
      }
      const xy = distinct(rng, 2, () => rng.int(2, 9));
      const [x, y] = [xy[0] ?? 2, xy[1] ?? 3];
      const pq = distinct(rng, 2, () => rng.int(2, 6) * 10);
      const [p, q] = [pq[0] ?? 20, pq[1] ?? 30];
      const total = x * p + y * q;
      return {
        prompt: `Léa a ${x} sachets de ${p} billes et ${y} sachets de ${q} billes. Combien de billes a-t-elle en tout ?`,
        answer: num(total),
        traps: traps(r(total), [
          [x * p, `Tu as oublié les ${y} sachets de ${q} billes.`],
          [(x + y) * (p + q), 'Il ne faut pas mélanger : chaque sorte de sachet a sa multiplication.'],
        ]),
        hint: 'Calcule les billes de chaque sorte de sachets, puis ajoute.',
        steps: [`${x} × ${p} = ${x * p} et ${y} × ${q} = ${y * q}.`, `${x * p} + ${y * q} = **${total} billes**.`],
        targetSeconds: 50,
      };
    },
    { mental: true },
  );

  /** Niveau 4 : « … × 10 = y » ou « … ÷ 10 = y » (opération inverse). */
  const completerFois10 = (rng: Rng, times: boolean): QuestionDraft => {
    const op = times ? '×' : '÷';
    // « … × 10 = y » ou « … ÷ 10 = y » : on remonte vers le nombre de départ.
    const y = exactDecimal(rng, 2, 99, rng.int(0, 1));
    const start = times ? mul(y, r(1, 10)) : mul(y, r(10));
    return {
      prompt: `Complète : … ${op} 10 = ${fmt(y)}.`,
      answer: num(start),
      traps: traps(start, [
        [
          times ? mul(y, r(10)) : mul(y, r(1, 10)),
          `Tu as refait la même opération : ici, il faut faire l’opération inverse.`,
        ],
      ]),
      hint: `Pour trouver le nombre de départ, fais l’opération inverse de ${op} 10.`,
      steps: [
        `L’inverse de ${op} 10 est ${times ? '÷' : '×'} 10.`,
        `${fmt(y)} ${times ? '÷' : '×'} 10 = **${fmt(start)}**.`,
      ],
      targetSeconds: 25,
    };
  };

  /** Niveau 5 de « décimal × 10 » : un problème en contexte (× 10 ou ÷ 10). */
  const contexteFois10 = (rng: Rng): QuestionDraft => {
    if (rng.int(0, 1) === 0) {
      const p = exactDecimal(rng, 2, 9, 2);
      return {
        prompt: `Un ruban mesure ${fmt(p)} m. On met bout à bout 10 rubans identiques. Quelle est la longueur obtenue, en mètres ?`,
        answer: num(mul(p, r(10)), 'm'),
        traps: traps(mul(p, r(10)), [
          [mul(p, r(1, 10)), 'Il y a 10 rubans : la longueur est plus grande, pas plus petite.'],
          [mul(p, r(100)), 'Dix rubans, pas cent : un seul rang de décalage.'],
        ]),
        hint: '10 rubans identiques : on multiplie la longueur d’un ruban par 10.',
        steps: [`${fmt(p)} × 10 : les chiffres montent d’un rang.`, `**${fmt(mul(p, r(10)))} m**.`],
        targetSeconds: 35,
      };
    }
    const total = dec(rng.int(51, 899) * 10, 2);
    return {
      prompt: `10 stylos identiques coûtent ${euros(total)} €. Combien coûte un stylo ?`,
      answer: num(mul(total, r(1, 10)), '€'),
      traps: traps(mul(total, r(1, 10)), [
        [mul(total, r(10)), 'Un stylo coûte moins cher que 10 stylos : on divise.'],
        [mul(total, r(1, 100)), 'Il y a 10 stylos : un seul rang de décalage.'],
      ]),
      hint: 'Pour le prix d’un seul stylo, divise par 10.',
      steps: [`${euros(total)} ÷ 10 : les chiffres descendent d’un rang.`, `**${euros(mul(total, r(1, 10)))} €**.`],
      targetSeconds: 35,
    };
  };

  const decimalFois10 = N(
    id('decimal-fois-10'),
    'Multiplier ou diviser un décimal par 10',
    'Multiplier un nombre décimal par 10 ; diviser un nombre décimal par 10',
    [
      'Quand tu multiplies un nombre décimal par 10, chaque chiffre vaut 10 fois plus : 3,4 × 10 = 34.',
      'Quand tu divises par 10, chaque chiffre vaut 10 fois moins : 34 ÷ 10 = 3,4. La virgule ne bouge pas : ce sont les chiffres qui changent de rang.',
    ],
    (rng, level) => {
      const times = level === 1 || rng.int(0, 1) === 0;
      // × 10 : jusqu'à 2 décimales ; ÷ 10 : une décimale au plus (le résultat reste au centième, programme du CM1).
      const x = times
        ? exactDecimal(rng, 1, 99, level === 1 ? 1 : rng.int(1, 2))
        : exactDecimal(rng, 2, 99, rng.int(0, 1));
      const res = times ? mul(x, r(10)) : mul(x, r(1, 10));
      const wrongSame = times ? mul(x, r(1, 10)) : mul(x, r(10));
      const op = times ? '×' : '÷';
      if (level <= 2) {
        const trapA = {
          label: fmt(wrongSame),
          why: times
            ? 'Multiplier rend plus grand : les chiffres montent d’un rang.'
            : 'Diviser rend plus petit : les chiffres descendent d’un rang.',
        };
        const trapB = {
          label: fmt(times ? mul(x, r(100)) : mul(x, r(1, 100))),
          why: `Un seul rang de décalage pour ${op} 10, pas deux.`,
        };
        const trapC = { label: fmt(x), why: `Avec ${op} 10, le nombre change : chaque chiffre change de rang.` };
        return {
          prompt: `Combien font ${fmt(x)} ${op} 10 ?`,
          ...choice(rng, fmt(res), level === 1 ? [trapA, trapB] : [trapA, trapB, trapC]),
          hint: `Chaque chiffre ${times ? 'monte' : 'descend'} d’un rang.`,
          steps: [
            `${op} 10 : chaque chiffre ${times ? 'vaut 10 fois plus' : 'vaut 10 fois moins'}.`,
            `${fmt(x)} ${op} 10 = **${fmt(res)}**.`,
          ],
          targetSeconds: 15,
        };
      }
      if (level === 3) {
        return {
          prompt: `Calcule ${fmt(x)} ${op} 10.`,
          answer: num(res),
          traps: traps(res, [
            [wrongSame, times ? 'Multiplier rend plus grand.' : 'Diviser rend plus petit.'],
            [times ? mul(x, r(100)) : mul(x, r(1, 100)), `Un seul rang de décalage pour ${op} 10.`],
          ]),
          hint: `Les chiffres ${times ? 'montent' : 'descendent'} d’un rang.`,
          steps: [`${op} 10 : un rang ${times ? 'vers la gauche' : 'vers la droite'}.`, `**${fmt(res)}**.`],
          targetSeconds: 12,
        };
      }
      if (level === 4) return completerFois10(rng, times);
      return contexteFois10(rng);
    },
    { mental: true },
  );

  const distributivite = N(
    id('distributivite'),
    'Calculer avec la distributivité',
    'Utiliser la distributivité de la multiplication par rapport à l’addition dans des cas simples',
    [
      'Pour calculer 7 × 13, découpe 13 en 10 + 3 : 7 × 13 = 7 × 10 + 7 × 3 = 70 + 21 = 91.',
      'Chaque morceau de 13 est multiplié par 7 : n’oublie aucun morceau. La **somme** des deux produits donne le résultat.',
    ],
    (rng, level) => {
      const a = rng.int(3, 9);
      const t = rng.int(1, 4);
      const u = rng.int(2, 9);
      const b = t * 10 + u;
      if (level === 1) {
        return {
          prompt: `${a} × ${b} = ${a} × ${t * 10} + ${a} × …`,
          ...choice(rng, String(u), [
            { label: String(b), why: `${b} est le nombre en entier : on a déjà pris ${t * 10}, il reste ${u}.` },
            { label: String(t * 10), why: `${t * 10} est le morceau déjà utilisé : il reste ${u} à multiplier.` },
          ]),
          hint: `${b} = ${t * 10} + ?`,
          steps: [`${b} = ${t * 10} + ${u}.`, `Il manque ${a} × **${u}**.`],
          targetSeconds: 15,
        };
      }
      if (level === 2) {
        const good = `${a} × ${t * 10} + ${a} × ${u}`;
        return {
          prompt: `Quelle écriture permet de calculer ${a} × ${b} en découpant ${b} en ${t * 10} + ${u} ?`,
          ...choice(rng, good, [
            { label: `${a} × ${t * 10} + ${u}`, why: `Le ${u} doit lui aussi être multiplié par ${a}.` },
            { label: `${a} + ${t * 10} × ${u}`, why: `C’est ${b} qu’on découpe, pas ${a}.` },
            {
              label: `${a} × ${t * 10} × ${a} × ${u}`,
              why: 'Les deux morceaux s’ajoutent, ils ne se multiplient pas.',
            },
          ]),
          hint: `Chaque morceau de ${b} doit être multiplié par ${a}, puis on ajoute.`,
          steps: [`${b} = ${t * 10} + ${u}.`, `On multiplie chaque morceau par ${a} puis on ajoute : **${good}**.`],
          targetSeconds: 25,
        };
      }
      if (level === 3) {
        return {
          prompt: `Calcule ${a} × ${b} en calculant ${a} × ${t * 10} + ${a} × ${u}.`,
          answer: num(a * b),
          traps: traps(r(a * b), [
            [a * t * 10 + u, `Il faut multiplier le ${u} par ${a} aussi.`],
            [a * t * 10, `Il manque le produit ${a} × ${u}.`],
          ]),
          hint: `Calcule ${a} × ${t * 10} d’un côté, ${a} × ${u} de l’autre, puis ajoute.`,
          steps: [
            `${a} × ${t * 10} = ${a * t * 10} ; ${a} × ${u} = ${a * u}.`,
            `${a * t * 10} + ${a * u} = **${a * b}**.`,
          ],
          targetSeconds: 25,
        };
      }
      if (level === 4) {
        const b2 = rng.int(12, 49);
        const pick = b2 % 10 === 0 ? b2 + 1 : b2;
        return {
          prompt: `Calcule ${a} × ${pick}.`,
          answer: num(a * pick),
          traps: traps(r(a * pick), [
            [a * Math.floor(pick / 10) * 10 + (pick % 10), `Le ${pick % 10} aussi doit être multiplié par ${a}.`],
            [a * Math.floor(pick / 10) * 10, `Il manque ${a} × ${pick % 10}.`],
          ]),
          hint: `Découpe ${pick} en dizaines et unités, multiplie chaque morceau, puis ajoute.`,
          steps: [
            `${pick} = ${Math.floor(pick / 10) * 10} + ${pick % 10}.`,
            `${a * Math.floor(pick / 10) * 10} + ${a * (pick % 10)} = **${a * pick}**.`,
          ],
          targetSeconds: 25,
        };
      }
      const pq = distinct(rng, 2, () => rng.int(10, 19));
      const [p, q] = [pq[0] ?? 12, pq[1] ?? 15];
      const rows = rng.int(3, 9);
      return {
        prompt: `Une salle a ${rows} rangées de ${p} chaises. Une deuxième salle a ${rows} rangées de ${q} chaises. Combien de chaises y a-t-il en tout ?`,
        answer: num(rows * (p + q)),
        traps: traps(r(rows * (p + q)), [
          [rows * p, 'Il manque les chaises de la deuxième salle.'],
          [rows + p + q, 'Chaque rangée compte plusieurs chaises : il faut multiplier.'],
        ]),
        hint: `Chaque salle a ${rows} rangées. Tu peux calculer chaque salle, ou regrouper : ${rows} rangées de (${p} + ${q}).`,
        steps: [
          `${rows} × ${p} = ${rows * p} et ${rows} × ${q} = ${rows * q}.`,
          `${rows * p} + ${rows * q} = **${rows * (p + q)} chaises**.`,
        ],
        targetSeconds: 50,
      };
    },
    { mental: true },
  );

  // ——— Les quatre opérations ———

  const multiplierDecimal = N(
    id('multiplier-decimal'),
    'Multiplier un décimal par un entier inférieur à 10',
    'Poser et effectuer des multiplications d’un nombre décimal par un nombre entier inférieur à 10',
    [
      'Pour multiplier 2,35 par 4, pose l’opération sans te soucier de la virgule : 235 × 4 = 940.',
      'Puis remets la virgule : il y a autant de chiffres après la virgule dans le **produit** que dans le nombre décimal de départ : 9,40.',
    ],
    (rng, level) => {
      const k = rng.int(2, 9);
      const d = level === 1 ? 1 : level === 2 ? rng.int(1, 2) : 2;
      const x = exactDecimal(rng, level <= 2 ? 1 : 2, level <= 2 ? 9 : 49, d);
      const res = mul(x, r(k));
      const rawDigits = Math.round(toNumber(x) * 10 ** d);
      const digits = rawDigits * k;
      const approx = Math.round(toNumber(x));
      const wrongPos = mul(res, r(10));
      const wrongPos2 = mul(res, r(1, 10));
      if (level <= 2) {
        const wrong = [
          {
            label: fmt(wrongPos),
            why: 'La virgule n’est pas au bon endroit : compte les chiffres après la virgule du nombre de départ.',
          },
          {
            label: fmt(wrongPos2),
            why: `Le résultat est trop petit : estime-le avec des entiers. ${fmt(x)} est proche de ${approx}, et ${approx} × ${k} = ${approx * k} : le résultat doit être de cet ordre.`,
          },
          { label: fmt(mul(res, r(100))), why: 'Beaucoup trop grand : compare avec une estimation en entiers.' },
        ];
        return {
          prompt: `Combien font ${fmt(x)} × ${k} ?`,
          ...choice(rng, fmt(res), level === 1 ? wrong.slice(0, 2) : wrong),
          hint: `Multiplie ${rawDigits} par ${k} comme des entiers, puis place la virgule.`,
          steps: [
            `${rawDigits} × ${k} = ${digits}.`,
            `Il y a ${d} chiffre${d > 1 ? 's' : ''} après la virgule : ${fmt(x)} × ${k} = **${fmt(res)}**.`,
          ],
          targetSeconds: 25,
        };
      }
      if (level === 3) {
        return {
          prompt: `Pose et calcule ${fmt(x)} × ${k}.`,
          answer: num(res),
          traps: traps(res, [
            [wrongPos, 'La virgule n’est pas au bon endroit : compte les chiffres après la virgule de départ.'],
            [wrongPos2, 'La virgule est trop à gauche.'],
          ]),
          hint: `Calcule ${rawDigits} × ${k}, puis place la virgule pour qu’il y ait ${d} chiffres après.`,
          steps: [`${rawDigits} × ${k} = ${digits}.`, `Avec ${d} décimales : **${fmt(res)}**.`],
          targetSeconds: 40,
        };
      }
      if (level === 4) {
        const unit = exactDecimal(rng, 1, 9, 2);
        const total = mul(unit, r(k));
        const unitDigits = Math.round(toNumber(unit) * 100);
        const unitApprox = Math.round(toNumber(unit));
        return {
          prompt: `Estime d’abord, puis calcule : ${fmt(unit)} × ${k}. (Réponds avec le résultat exact.)`,
          answer: num(total),
          traps: traps(total, [
            [
              mul(total, r(10)),
              `Estime : ${fmt(unit)} est proche de ${unitApprox}, et ${unitApprox} × ${k} fait environ ${unitApprox * k}. Le résultat doit être de cet ordre.`,
            ],
            [mul(total, r(1, 10)), 'Trop petit : compare avec l’estimation.'],
          ]),
          hint: `Pose ${unitDigits} × ${k} sans virgule, puis place-la : 2 chiffres après.`,
          steps: [`${unitDigits} × ${k} = ${unitDigits * k}.`, `Avec 2 décimales : **${fmt(total)}**.`],
          targetSeconds: 40,
        };
      }
      const price = exactDecimal(rng, 1, 3, 2);
      const paid = 20;
      const cost = mul(price, r(k));
      const change = sub(r(paid), cost);
      return {
        prompt: `Un cahier coûte ${euros(price)} €. Tao en achète ${k} et donne un billet de ${paid} €. Combien d’argent lui rend-on ?`,
        answer: num(change, '€'),
        traps: traps(change, [
          [cost, `${euros(cost)} € est le prix des cahiers. On demande ce qu’on lui REND : ${paid} − ${euros(cost)}.`],
          [sub(r(paid), price), 'Il achète plusieurs cahiers : il faut d’abord multiplier le prix.'],
        ]),
        hint: `D’abord le prix des ${k} cahiers (une multiplication), puis ce qu’on rend (une soustraction).`,
        steps: [
          `${k} cahiers : ${euros(price)} × ${k} = ${euros(cost)} €.`,
          `${paid} − ${euros(cost)} = **${euros(change)} €**.`,
        ],
        targetSeconds: 60,
      };
    },
    { mental: true },
  );
  const multiplierDecimalV2 = { ...multiplierDecimal, version: 2 };

  return {
    nombres: [unitesNumeration],
    fractions: [encadrerFraction, fractionDroite],
    'calcul-mental': [foisDizaines, decimalFois10, distributivite],
    operations: [multiplierDecimalV2],
  };
}
