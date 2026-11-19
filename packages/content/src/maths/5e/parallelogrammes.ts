import { choice, num, objective, traps, trueFalse } from '../../build.ts';
import { dec, fmt, mul, r, type Rational } from '../../rational.ts';
import type { Chapter, Skill } from '../../types.ts';
import { TRIPLES } from './commun.ts';

/* ───────────────────────── Parallélogrammes ───────────────────────── */

const paraProprietes: Skill = {
  id: 'm5-para-proprietes',
  title: 'Propriétés des parallélogrammes',
  lesson: {
    memo: [
      'C’est une famille : le **parallélogramme** est le parent. Ses diagonales se coupent en leur milieu.',
      'Le **rectangle** a en plus des diagonales de même longueur. Le **losange** a en plus des diagonales perpendiculaires (en croix).',
      'Le **carré** a tout : c’est à la fois un rectangle et un losange.',
    ],
    source: objective(
      'Connaitre les propriétés caractéristiques des côtés opposés et des diagonales. Définir les parallélogrammes particuliers (rectangle, losange, carré)',
    ),
  },
  generate(rng, level) {
    if (level === 3) {
      const cases = [
        { d: 'ses diagonales se coupent en leur milieu', a: 'un parallélogramme' },
        { d: 'ses diagonales se coupent en leur milieu et ont la même longueur', a: 'un rectangle' },
        { d: 'ses diagonales se coupent en leur milieu et sont perpendiculaires', a: 'un losange' },
        { d: 'ses diagonales se coupent en leur milieu, sont perpendiculaires et ont la même longueur', a: 'un carré' },
      ];
      const c = rng.pick(cases);
      const all = ['un parallélogramme', 'un rectangle', 'un losange', 'un carré', 'un trapèze'];
      return {
        prompt: `Un quadrilatère dont ${c.d} est forcément…`,
        ...choice(
          rng,
          c.a,
          all
            .filter((x) => x !== c.a)
            .slice(0, 3)
            .map((label) => ({
              label,
              why: `Milieu commun ⇒ parallélogramme ; même longueur ⇒ rectangle ; perpendiculaires ⇒ losange ; les deux ⇒ carré. Ici : ${c.a}.`,
            })),
        ),
        hint: 'Milieu commun → parallélogramme. Même longueur en plus → rectangle. En croix en plus → losange. Les deux → carré.',
        steps: [
          'Les diagonales qui se coupent en leur milieu, c’est la base : c’est au moins un parallélogramme.',
          c.a === 'un parallélogramme'
            ? 'Rien d’autre n’est dit (ni même longueur, ni perpendiculaires) : on ne peut pas en dire plus.'
            : c.a === 'un rectangle'
              ? 'En plus, elles ont la même longueur : c’est le signe du rectangle.'
              : c.a === 'un losange'
                ? 'En plus, elles sont perpendiculaires (en croix) : c’est le signe du losange.'
                : 'En plus, elles ont la même longueur (rectangle) ET sont perpendiculaires (losange) : les deux à la fois.',
          `C’est forcément **${c.a}**.`,
        ],
      };
    }
    const st =
      level === 1
        ? [
            {
              t: 'Les diagonales d’un parallélogramme se coupent en leur milieu.',
              v: true,
              why: 'C’est une propriété caractéristique du parallélogramme.',
            },
            {
              t: 'Les côtés opposés d’un parallélogramme ont la même longueur.',
              v: true,
              why: 'C’est une propriété du parallélogramme.',
            },
            {
              t: 'Les diagonales d’un parallélogramme ont toujours la même longueur.',
              v: false,
              why: 'Seulement pour le rectangle (et le carré).',
            },
            {
              t: 'Les diagonales d’un parallélogramme sont toujours perpendiculaires.',
              v: false,
              why: 'Seulement pour le losange (et le carré).',
            },
          ]
        : [
            {
              t: 'Les diagonales d’un rectangle ont la même longueur.',
              v: true,
              why: 'C’est une propriété du rectangle.',
            },
            {
              t: 'Les diagonales d’un losange sont perpendiculaires.',
              v: true,
              why: 'C’est une propriété du losange.',
            },
            {
              t: 'Un carré est un losange.',
              v: true,
              why: 'Un carré a 4 côtés égaux : c’est un losange (et un rectangle).',
            },
            {
              t: 'Un losange a toujours quatre angles droits.',
              v: false,
              why: 'Seul le carré est un losange avec des angles droits.',
            },
            {
              t: 'Un rectangle a toujours quatre côtés de même longueur.',
              v: false,
              why: 'Seul le carré est un rectangle avec 4 côtés égaux.',
            },
          ];
    const s = rng.pick(st);
    return {
      prompt: `Vrai ou faux : ${s.t}`,
      ...trueFalse(s.v, s.why),
      hint: 'Pense à la famille : parallélogramme (parent) → rectangle et losange → carré (qui a tout).',
      steps: [
        'Rappel de la famille : tous sont des parallélogrammes ; le rectangle et le losange ont un « super-pouvoir » chacun, le carré a les deux.',
        s.why,
        `Donc c’est **${s.v ? 'vrai' : 'faux'}**.`,
      ],
      targetSeconds: 15,
    };
  },
};

const paraAire: Skill = {
  id: 'm5-para-aire',
  title: 'Aire d’un parallélogramme',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Coupe le petit triangle d’un côté du parallélogramme et recolle-le de l’autre : ça fait un **rectangle** !',
      'Donc aire = base × hauteur, comme un rectangle. La hauteur, c’est le trait avec l’angle droit, pas le côté penché.',
    ],
    source: objective('Savoir calculer l’aire d’un parallélogramme et de figures complexes'),
  },
  generate(rng, level) {
    const [tf, th, ts] = rng.pick(TRIPLES);
    const scale = level === 3 ? r(1, 2) : r(1);
    const shift = level === 1 ? rng.int(1, 3) : (tf * scale.n) / scale.d;
    const h: Rational = level === 1 ? r(rng.int(2, 9)) : mul(r(th), scale);
    const side: Rational | null = level === 1 ? null : mul(r(ts), scale);
    const b = rng.int(4, 12);
    const hv = h.n / h.d;
    const area = mul(r(b), h);
    return {
      prompt: 'Calcule l’aire de ce parallélogramme (en cm^2).',
      figure: {
        kind: 'polygon',
        vertices: [
          { name: 'A', x: 0, y: 0 },
          { name: 'B', x: b, y: 0 },
          { name: 'C', x: b + shift, y: hv },
          { name: 'D', x: shift, y: hv },
        ],
        sideLabels: [`${b} cm`, side ? `${fmt(side)} cm` : null, null, null],
        extra: [{ from: { x: shift, y: hv }, to: { x: shift, y: 0 }, label: `${fmt(h)} cm`, rightAngleAtEnd: true }],
      },
      answer: num(area, 'cm^2'),
      traps: traps(area, [
        [mul(mul(r(b), h), r(1, 2)), 'Pas de division par 2 : c’est la formule du triangle.'],
        ...(side
          ? ([
              [mul(r(b), side), 'Le côté oblique n’est pas la hauteur : la hauteur est perpendiculaire à la base.'],
            ] as [Rational, string][])
          : []),
      ]),
      hint: 'Imagine qu’on découpe le petit triangle et qu’on le recolle de l’autre côté : quel rectangle obtiens-tu ?',
      steps: [
        'On découpe le petit triangle d’un côté et on le recolle de l’autre : le parallélogramme devient un rectangle.',
        `Ce rectangle a pour longueur la base (${b} cm) et pour largeur la hauteur (${fmt(h)} cm, le trait avec l’angle droit)${side ? `. Le côté penché de ${fmt(side)} cm ne sert pas` : ''}.`,
        `Aire = ${b} × ${fmt(h)} = **${fmt(area)}** cm^2 (pas de ÷ 2 : ce n’est pas un triangle).`,
      ],
    };
  },
};

const LENGTH = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];

const conversionsLA: Skill = {
  id: 'm5-conversions-longueur-aire',
  tools: ['conversion-longueur', 'conversion-aire'],
  title: 'Convertir longueurs et aires',
  lesson: {
    memo: [
      'Utilise le tableau de conversion ! Le chiffre des unités va dans la colonne de l’unité de départ.',
      'Longueurs : **1 chiffre par colonne** (× 10 d’une unité à l’autre). Aires : **2 chiffres par colonne** (× 100), car un carré de 1 dm de côté contient 10 × 10 = 100 petits carrés de 1 cm.',
      'Vers une unité plus petite, le nombre devient plus grand.',
    ],
    source: objective(
      'Résoudre des problèmes faisant appel à des conversions d’unités de longueur et d’unités d’aires',
    ),
  },
  generate(rng, level) {
    const area = level >= 2;
    const i = rng.int(level === 3 ? 2 : 3, 5);
    const j = Math.min(6, Math.max(0, i + rng.pick(level === 1 ? [1, 2, -1] : [1, -1, 2])));
    const from = LENGTH[i] ?? 'm';
    const to = LENGTH[j] ?? 'cm';
    const x = level === 1 ? dec(rng.int(11, 99), 1) : dec(rng.int(1, 999), rng.int(0, 1));
    const factor = area ? 100 : 10;
    const steps = j - i;
    const result = steps >= 0 ? mul(x, r(factor ** steps)) : mul(x, r(1, factor ** -steps));
    const linear = steps >= 0 ? mul(x, r(10 ** steps)) : mul(x, r(1, 10 ** -steps));
    const sup = area ? '^2' : '';
    return {
      prompt: `Complète : ${fmt(x)} ${from}${sup} = … ${to}${sup}`,
      answer: num(result, `${to}${sup}`),
      traps: traps(result, [
        ...(area
          ? ([[linear, 'Pour les aires, on multiplie (ou divise) par 100 d’une unité à la suivante, pas par 10.']] as [
              Rational,
              string,
            ][])
          : []),
        [
          steps >= 0 ? mul(x, r(1, factor ** steps)) : mul(x, r(factor ** -steps)),
          'Mauvais sens : vers une unité plus petite, le nombre devient plus grand.',
        ],
      ]),
      hint: `Utilise le tableau de conversion : chiffre des unités de ${fmt(x)} ${area ? 'dans la 2e case de' : 'sous'} ${from}${sup}, puis lis jusqu’à ${to}${sup}.${area ? ' Attention : 2 cases par unité pour les aires !' : ''}`,
      demo: {
        kind: 'conversion',
        table: area ? 'aire' : 'longueur',
        value: x,
        from: `${from}${sup}`,
        to: `${to}${sup}`,
      },
      steps: [
        `On place ${fmt(x)} dans le tableau : le chiffre des unités va dans ${area ? 'la case de droite de la colonne' : 'la colonne'} ${from}${sup}.`,
        `De ${from}${sup} à ${to}${sup}, on se déplace de ${Math.abs(steps)} colonne${Math.abs(steps) > 1 ? 's' : ''}${area ? ` de 2 cases, soit ${2 * Math.abs(steps)} cases` : ''} vers la ${steps >= 0 ? 'droite' : 'gauche'} : le nombre devient ${fmt(factor ** Math.abs(steps))} fois plus ${steps >= 0 ? 'grand' : 'petit'}.`,
        `On met la virgule juste après ${area ? 'la dernière case de ' : ''}la colonne ${to}${sup}${steps > 0 ? ' et on complète les cases vides par des 0' : ''}.`,
        `On lit : ${fmt(x)} ${from}${sup} = **${fmt(result)} ${to}${sup}**`,
      ],
    };
  },
};

export const parallelogrammes: Chapter = {
  id: 'm5-parallelogrammes',
  subject: 'maths',
  grade: '5e',
  domain: 'geometrie',
  title: 'Parallélogrammes',
  skills: [paraProprietes, paraAire, conversionsLA],
};
