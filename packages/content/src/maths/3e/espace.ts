import { choice, num, traps } from '../../build.ts';
import { fmt, r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C, unit } from './commun.ts';

// ——— Espace : boule, sphère, sections ———

const volumeBoule = S(
  'm3-volume-boule',
  'Volume d’une boule',
  'Connaitre et utiliser la formule du volume d’une boule de rayon donné',
  ['Volume d’une boule de rayon r : **{4/3} × π × r^3**.'],
  (rng) => {
    const rad = rng.int(2, 12);
    const v = (4 / 3) * Math.PI * rad ** 3;
    return {
      prompt: `Calcule le volume d’une boule de rayon ${rad} cm, arrondi à l’unité (en cm^3).`,
      answer: { ...num(unit(v), 'cm^3'), accept: [unit((4 / 3) * 3.14 * rad ** 3)], round: 0 },
      traps: traps(unit(v), [
        [unit(4 * Math.PI * rad * rad), 'Ça, c’est l’aire de la sphère. Le volume utilise r^3.'],
        [unit((4 / 3) * Math.PI * rad * rad), 'Le rayon est au **cube**.'],
      ]),
      hint: '{4/3} × π × r × r × r.',
      steps: [`{4/3} × π × ${rad}^3 = {4/3} × π × ${rad ** 3}.`, `≈ **${fmt(unit(v))} cm^3**.`],
      targetSeconds: 40,
    };
  },
  { advice: 'calculatrice' },
);

const sections = S(
  'm3-sections',
  'Sections de solides',
  'Visualiser et réaliser des sections de pavé parallèlement à une face, de cylindre parallèlement ou perpendiculairement à son axe, d’une boule',
  [
    'Pavé coupé parallèlement à une face → **rectangle** de même taille que la face. Cylindre coupé ⟂ à l’axe → **disque** ; parallèlement → **rectangle**. Boule → **disque** (cercle).',
  ],
  (rng) => {
    const q = rng.pick([
      { p: 'un pavé droit coupé par un plan parallèle à une face', a: 'Un rectangle' },
      { p: 'un cylindre coupé par un plan perpendiculaire à son axe', a: 'Un disque' },
      { p: 'un cylindre coupé par un plan parallèle à son axe', a: 'Un rectangle' },
      { p: 'une boule coupée par un plan', a: 'Un disque' },
      { p: 'un cube coupé par un plan parallèle à une face', a: 'Un carré' },
    ]);
    return {
      prompt: `Quelle est la forme de la section d’${q.p} ?`,
      ...choice(
        rng,
        q.a,
        ['Un rectangle', 'Un disque', 'Un carré', 'Un triangle']
          .filter((x) => x !== q.a)
          .map((x) => ({ label: x, why: 'Imagine qu’on coupe le solide avec un couteau bien droit.' })),
      ),
      hint: 'Imagine la tranche obtenue en coupant au couteau.',
      steps: ['On imagine la tranche plate obtenue en coupant le solide.', `La section est **${q.a.toLowerCase()}**.`],
      targetSeconds: 20,
    };
  },
);

const sphere = S(
  'm3-sphere',
  'Sphère et grands cercles',
  'Définir la boule et la sphère. Définir les grands cercles, le diamètre',
  [
    'La **sphère** est la surface (l’enveloppe) ; la **boule** est le solide plein. Un **grand cercle** a le même centre et le même rayon que la sphère (l’équateur).',
  ],
  (rng) => {
    const rad = rng.int(3, 15);
    const askDiam = rng.int(0, 1) === 1;
    return {
      prompt: askDiam
        ? `Une sphère a un rayon de ${rad} cm. Quel est le rayon d’un de ses grands cercles ?`
        : `Une balle a un diamètre de ${2 * rad} cm. Quel est son rayon ?`,
      answer: num(rad, 'cm'),
      traps: traps(r(rad), [
        [
          2 * rad,
          askDiam ? 'Un grand cercle a **le même rayon** que la sphère.' : 'Le rayon est la moitié du diamètre.',
        ],
      ]),
      hint: askDiam ? 'Un grand cercle passe par le centre de la sphère.' : 'Rayon = diamètre ÷ 2.',
      steps: [
        askDiam ? 'Un grand cercle a le même centre et le même rayon que la sphère.' : 'Rayon = diamètre ÷ 2.',
        `**${rad} cm**.`,
      ],
      targetSeconds: 15,
    };
  },
);

export const espace = C(
  'm3-espace',
  'geometrie',
  'Sphère, boule et sections',
  [sphere, volumeBoule, sections],
  bossOf(
    [
      S(
        'm3-boss-espace-balles',
        'Problème : la boîte de balles',
        'Connaitre et utiliser la formule du volume d’une boule de rayon donné',
        ['Une boîte cylindrique contient 3 balles empilées : hauteur = 3 diamètres, rayon = rayon des balles.'],
        (rng) => {
          const rad = rng.int(2, 4);
          const cyl = Math.PI * rad * rad * 6 * rad;
          const balls = 3 * (4 / 3) * Math.PI * rad ** 3;
          const empty = cyl - balls;
          return {
            prompt: `Une boîte cylindrique de rayon ${rad} cm et de hauteur ${6 * rad} cm contient 3 balles de rayon ${rad} cm. Quel volume reste vide, arrondi au cm^3 ?`,
            answer: { ...num(unit(empty), 'cm^3'), round: 0 },
            traps: traps(unit(empty), [
              [unit(balls), 'Ça, c’est le volume des balles.'],
              [unit(cyl), 'Il faut enlever le volume des balles.'],
            ]),
            hint: 'Volume du cylindre − volume des 3 balles.',
            steps: [
              `Cylindre : π × ${rad}^2 × ${6 * rad} ≈ ${fmt(unit(cyl))}. Balles : 3 × {4/3} × π × ${rad}^3 ≈ ${fmt(unit(balls))}.`,
              `Vide ≈ **${fmt(unit(empty))} cm^3** (un tiers de la boîte !).`,
            ],
            targetSeconds: 90,
          };
        },
        { advice: 'calculatrice' },
      ),
      S(
        'm3-boss-espace-fromage',
        'Problème : la tranche de fromage',
        'Visualiser et réaliser des sections de pavé parallèlement à une face',
        ['Une tranche parallèle à une face d’un pavé est un rectangle de mêmes dimensions que cette face.'],
        (rng) => {
          const L = rng.int(8, 20);
          const l = rng.int(4, 10);
          return {
            prompt: `Un bloc de fromage en forme de pavé mesure ${L} cm × ${l} cm × 6 cm. On le coupe parallèlement à la face ${L} cm × ${l} cm. Quelle est l’aire de la tranche, en cm^2 ?`,
            answer: num(L * l, 'cm^2'),
            traps: traps(r(L * l), [[L * l * 6, 'C’est une aire (une tranche plate), pas un volume.']]),
            hint: 'La section est un rectangle identique à cette face.',
            steps: [`La section est un rectangle de ${L} cm sur ${l} cm.`, `Aire : **${L * l} cm^2**.`],
            targetSeconds: 30,
          };
        },
      ),
    ],
    [
      S(
        'm3-boss-espace-piege',
        'Piège : doubler le rayon',
        'Connaitre et utiliser la formule du volume d’une boule de rayon donné',
        ['Le volume dépend de r^3 : doubler le rayon multiplie le volume par 2^3 = **8**.'],
        () => {
          return {
            prompt: 'On double le rayon d’une boule. Par combien son volume est-il multiplié ?',
            answer: num(8),
            traps: traps(r(8), [
              [2, 'Le rayon est au cube : 2 × 2 × 2.'],
              [4, 'Le volume dépend de r^3, pas r^2.'],
            ]),
            hint: 'Le volume dépend de r × r × r.',
            steps: ['(2r)^3 = 2^3 × r^3 = 8 × r^3.', 'Le volume est multiplié par **8**.'],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);
