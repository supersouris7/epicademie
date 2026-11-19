import { choice, num, traps } from '../../build.ts';
import { dec, fmt, r } from '../../rational.ts';
import type { Figure } from '../../types.ts';
import { bossOf } from '../kit.ts';
import { S, C, tenth, unit } from './commun.ts';

const DEG = Math.PI / 180;

// ——— Trigonométrie ———

const rightAt = (angleLabel: string, labels: [string | null, string | null, string | null]): Figure => ({
  kind: 'polygon',
  vertices: [
    { name: 'A', x: 0, y: 0 },
    { name: 'B', x: 7, y: 0 },
    { name: 'C', x: 0, y: 4 },
  ],
  sideLabels: labels,
  angleLabels: [null, angleLabel, null],
  rightAngles: [0],
});

const trigoChoisir = S(
  'm3-trigo-choisir',
  'Quel rapport trigonométrique ?',
  'Connaitre et utiliser les lignes trigonométriques dans le triangle rectangle : cosinus, sinus, tangente',
  ['cos = {adjacent/hypoténuse} ; sin = {opposé/hypoténuse} ; tan = {opposé/adjacent}. Astuce : « SOH CAH TOA ».'],
  (rng) => {
    const q = rng.pick([
      { known: 'le côté adjacent et l’hypoténuse', a: 'Le cosinus' },
      { known: 'le côté opposé et l’hypoténuse', a: 'Le sinus' },
      { known: 'le côté opposé et le côté adjacent', a: 'La tangente' },
    ]);
    return {
      prompt: `Dans un triangle rectangle, on connaît ${q.known} à un angle. Quel rapport utiliser pour trouver l’angle ?`,
      ...choice(
        rng,
        q.a,
        ['Le cosinus', 'Le sinus', 'La tangente']
          .filter((x) => x !== q.a)
          .map((x) => ({
            label: x,
            why: 'CAH : cos = adjacent/hypoténuse ; SOH : sin = opposé/hypoténuse ; TOA : tan = opposé/adjacent.',
          })),
        true,
      ),
      hint: 'SOH CAH TOA.',
      steps: [`On connaît ${q.known}.`, `On utilise **${q.a.toLowerCase()}**.`],
      targetSeconds: 20,
    };
  },
);

const trigoLongueur = S(
  'm3-trigo-longueur',
  'Calculer une longueur avec la trigonométrie',
  'Connaitre et utiliser les lignes trigonométriques dans le triangle rectangle : cosinus, sinus, tangente',
  ['ABC rectangle en A : cos(B) = {AB/BC}, donc AB = BC × cos(B). Calculatrice en **degrés** !'],
  (rng, level) => {
    const angle = rng.int(20, 70);
    const bc = rng.int(5, 20);
    const kind = level === 1 ? 'cos' : level === 2 ? 'sin' : 'tan';
    if (kind === 'tan') {
      const ab = rng.int(4, 15);
      const ac = ab * Math.tan(angle * DEG);
      return {
        prompt: `ABC est rectangle en A, AB = ${ab} cm et l’angle B mesure ${angle}°. Calcule AC, arrondi au dixième.`,
        figure: rightAt(`${angle}°`, [`${ab} cm`, null, '?']),
        answer: { ...num(tenth(ac), 'cm'), round: 1 },
        traps: traps(tenth(ac), [
          [tenth(ab / Math.tan(angle * DEG)), 'tan(B) = {AC/AB} : on multiplie par AB.'],
          [tenth(ab * Math.sin(angle * DEG)), 'AC est opposé à B et AB adjacent : c’est la tangente.'],
        ]),
        hint: 'AC est opposé à B, AB adjacent : tan(B) = {AC/AB}.',
        steps: [`tan(${angle}°) = {AC/${ab}}, donc AC = ${ab} × tan(${angle}°).`, `AC ≈ **${fmt(tenth(ac))} cm**.`],
        targetSeconds: 50,
      };
    }
    const v = kind === 'cos' ? bc * Math.cos(angle * DEG) : bc * Math.sin(angle * DEG);
    const side = kind === 'cos' ? 'AB' : 'AC';
    return {
      prompt: `ABC est rectangle en A, BC = ${bc} cm et l’angle B mesure ${angle}°. Calcule ${side}, arrondi au dixième.`,
      figure: rightAt(`${angle}°`, [kind === 'cos' ? '?' : null, `${bc} cm`, kind === 'sin' ? '?' : null]),
      answer: { ...num(tenth(v), 'cm'), round: 1 },
      traps: traps(tenth(v), [
        [
          tenth(kind === 'cos' ? bc * Math.sin(angle * DEG) : bc * Math.cos(angle * DEG)),
          kind === 'cos' ? 'AB est **adjacent** à B : c’est le cosinus.' : 'AC est **opposé** à B : c’est le sinus.',
        ],
        [tenth(bc / Math.cos(angle * DEG)), 'On multiplie par l’hypoténuse, on ne divise pas.'],
      ]),
      hint: kind === 'cos' ? 'cos(B) = {AB/BC}.' : 'sin(B) = {AC/BC}.',
      steps: [
        `${kind}(${angle}°) = {${side}/${bc}}, donc ${side} = ${bc} × ${kind}(${angle}°).`,
        `${side} ≈ **${fmt(tenth(v))} cm**.`,
      ],
      targetSeconds: 50,
    };
  },
  { advice: 'calculatrice' },
);

const trigoAngle = S(
  'm3-trigo-angle',
  'Calculer un angle avec la trigonométrie',
  'Connaitre et utiliser les lignes trigonométriques dans le triangle rectangle : cosinus, sinus, tangente',
  ['Si cos(B) = 0,5, alors B = arccos(0,5) = 60° (touches « cos^(−1) » ou « Acs » de la calculatrice).'],
  (rng) => {
    const ab = rng.int(3, 12);
    const bc = rng.int(ab + 2, ab + 10);
    const angle = Math.acos(ab / bc) / DEG;
    return {
      prompt: `ABC est rectangle en A, AB = ${ab} cm et BC = ${bc} cm. Calcule l’angle B, arrondi au degré.`,
      figure: rightAt('?', [`${ab} cm`, `${bc} cm`, null]),
      answer: { ...num(unit(angle), '°'), round: 0 },
      traps: traps(unit(angle), [
        [unit(Math.asin(ab / bc) / DEG), 'AB est **adjacent** à B : c’est le cosinus.'],
        [unit(90 - angle + 0.0001), 'Ça, c’est l’angle C.'],
      ]),
      hint: 'AB est adjacent à B, BC est l’hypoténuse : cos(B) = {AB/BC}.',
      steps: [`cos(B) = {${ab}/${bc}}.`, `B = arccos({${ab}/${bc}}) ≈ **${fmt(unit(angle))}°**.`],
      targetSeconds: 50,
    };
  },
  { advice: 'calculatrice' },
);

export const trigonometrie = C(
  'm3-trigonometrie',
  'geometrie',
  'Trigonométrie',
  [trigoChoisir, trigoLongueur, trigoAngle],
  bossOf(
    [
      S(
        'm3-boss-trigo-rampe',
        'Problème : la rampe d’accès',
        'Connaitre et utiliser les lignes trigonométriques dans le triangle rectangle : cosinus, sinus, tangente',
        ['Une rampe de longueur L qui monte d’un angle a s’élève de L × sin(a).'],
        (rng) => {
          const L = rng.int(4, 12);
          const a = rng.int(3, 10);
          const h = L * Math.sin(a * DEG);
          return {
            prompt: `Une rampe de ${L} m de long fait un angle de ${a}° avec le sol. De quelle hauteur monte-t-elle, en m, arrondi au centième ?`,
            answer: { ...num(r(Math.round(h * 100), 100), 'm'), round: 2 },
            traps: traps(r(Math.round(h * 100), 100), [
              [r(Math.round(L * Math.cos(a * DEG) * 100), 100), 'La hauteur est **opposée** à l’angle : sinus.'],
            ]),
            hint: 'La rampe est l’hypoténuse, la hauteur est opposée à l’angle.',
            steps: [
              `sin(${a}°) = {h/${L}}, donc h = ${L} × sin(${a}°).`,
              `h ≈ **${fmt(r(Math.round(h * 100), 100))} m**.`,
            ],
            targetSeconds: 60,
          };
        },
        { advice: 'calculatrice' },
      ),
      S(
        'm3-boss-trigo-cerf',
        'Problème : la hauteur de l’immeuble',
        'Connaitre et utiliser les lignes trigonométriques dans le triangle rectangle : cosinus, sinus, tangente',
        ['À d mètres d’un immeuble, on voit son sommet sous un angle a : hauteur = d × tan(a).'],
        (rng) => {
          const d = rng.int(20, 60);
          const a = rng.int(25, 60);
          const h = d * Math.tan(a * DEG);
          return {
            prompt: `À ${d} m du pied d’un immeuble, on voit son sommet sous un angle de ${a}° avec l’horizontale. Quelle est sa hauteur, arrondie au mètre ?`,
            answer: { ...num(unit(h), 'm'), round: 0 },
            traps: traps(unit(h), [
              [unit(d * Math.sin(a * DEG)), 'On connaît le côté adjacent et on cherche l’opposé : tangente.'],
            ]),
            hint: 'tan(angle) = {hauteur/distance}.',
            steps: [`tan(${a}°) = {h/${d}}, donc h = ${d} × tan(${a}°).`, `h ≈ **${fmt(unit(h))} m**.`],
            targetSeconds: 60,
          };
        },
        { advice: 'calculatrice' },
      ),
    ],
    [
      S(
        'm3-boss-trigo-piege',
        'Piège : un cosinus plus grand que 1 ?',
        'Connaitre et utiliser les lignes trigonométriques dans le triangle rectangle : cosinus, sinus, tangente',
        [
          'cos = adjacent ÷ hypoténuse, et l’hypoténuse est le plus grand côté : un cosinus est toujours **inférieur à 1**.',
        ],
        (rng) => {
          const v = dec(rng.int(11, 19), 1);
          return {
            prompt: `Tao trouve cos(B) = ${fmt(v)}. Est-ce possible ?`,
            ...choice(
              rng,
              'Non',
              [{ label: 'Oui', why: 'L’hypoténuse est le plus grand côté : adjacent ÷ hypoténuse < 1.' }],
              true,
            ),
            hint: 'Quel est le plus grand côté d’un triangle rectangle ?',
            steps: [
              'cos(B) = adjacent ÷ hypoténuse, et l’hypoténuse est plus longue que l’adjacent.',
              `Donc cos(B) < 1 : **non**, ${fmt(v)} est impossible.`,
            ],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);
