import { choice, distinct, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Vision dans l'espace ———

const reconnaitreSolides = S(
  'm6-solides',
  'Reconnaître les solides',
  'L’élève identifie dans un ensemble de solides lesquels sont des pyramides, des boules, des cubes, des cylindres, des pavés, des cônes ou des prismes droits (automatisme)',
  [
    'Cube : 6 faces carrées. Pavé : 6 faces rectangles. Pyramide : une base et des faces **triangulaires** qui se rejoignent en un sommet.',
    'Cylindre : deux disques. Cône : un disque et une pointe. Boule : toute ronde.',
  ],
  (rng) => {
    const s = rng.pick([
      { d: '6 faces, toutes des carrés identiques', a: 'Un cube' },
      { d: '6 faces rectangulaires', a: 'Un pavé droit' },
      { d: 'une base carrée et 4 faces triangulaires qui se rejoignent en un sommet', a: 'Une pyramide' },
      { d: 'deux bases en forme de disque et une face courbe', a: 'Un cylindre' },
      { d: 'une base en forme de disque et une pointe', a: 'Un cône' },
      { d: 'deux bases triangulaires identiques et 3 faces rectangulaires', a: 'Un prisme droit' },
    ]);
    const all = ['Un cube', 'Un pavé droit', 'Une pyramide', 'Un cylindre', 'Un cône', 'Un prisme droit'];
    return {
      prompt: `Quel solide a ${s.d} ?`,
      ...choice(
        rng,
        s.a,
        distinct(rng, 3, () => rng.pick(all.filter((x) => x !== s.a))).map((x) => ({
          label: x,
          why: 'Regarde la forme des faces.',
        })),
      ),
      hint: 'Regarde la forme et le nombre des faces.',
      steps: [`${s.d.charAt(0).toUpperCase() + s.d.slice(1)}.`, `C’est **${s.a.toLowerCase()}**.`],
      targetSeconds: 15,
    };
  },
);

const cubeFaces = S(
  'm6-faces-aretes',
  'Faces, arêtes, sommets',
  'Voir dans l’espace des assemblages de cubes',
  ['Un cube a **6** faces, **12** arêtes et **8** sommets. Un pavé aussi !'],
  (rng) => {
    const q = rng.pick([
      { p: 'faces', a: 6, w: 4 },
      { p: 'arêtes', a: 12, w: 8 },
      { p: 'sommets', a: 8, w: 6 },
    ]);
    const solid = rng.pick(['un cube', 'un pavé droit']);
    return {
      prompt: `Combien ${solid} a-t-il de **${q.p}** ?`,
      figure: { kind: 'solid', solid: solid === 'un cube' ? 'cube' : 'pave', labels: [] },
      answer: num(q.a),
      traps: traps(r(q.a), [[q.w, 'Pense aussi aux éléments cachés, à l’arrière.']]),
      hint: 'Compte aussi ce qui est caché derrière (en pointillés).',
      steps: [
        'Faces : 6 (dessus, dessous, 4 côtés). Arêtes : 4 en haut, 4 en bas, 4 verticales. Sommets : 4 en haut, 4 en bas.',
        `${solid.charAt(0).toUpperCase() + solid.slice(1)} a **${q.a}** ${q.p}.`,
      ],
      targetSeconds: 15,
    };
  },
);

export const espace = C(
  'm6-espace',
  'geometrie',
  'Vision dans l’espace',
  [reconnaitreSolides, cubeFaces],
  bossOf(
    [
      S(
        'm6-boss-espace-peinture',
        'Problème : le cube peint',
        'Voir dans l’espace des assemblages de cubes',
        ['Un gros cube fait de 3 × 3 × 3 petits cubes : seuls ceux de surface sont peints.'],
        (rng) => {
          const n = rng.int(2, 4);
          const corners = 8;
          return {
            prompt: `On assemble ${n * n * n} petits cubes en un gros cube de ${n} × ${n} × ${n}, puis on peint tout l’extérieur. Combien de petits cubes ont exactement 3 faces peintes ?`,
            answer: num(corners),
            traps: traps(r(corners), [[6, 'Ce sont les cubes des **coins** : combien de coins a un cube ?']]),
            hint: 'Un petit cube a 3 faces peintes quand il est dans un coin.',
            steps: [
              '3 faces peintes = un cube placé dans un coin du gros cube.',
              'Un cube a 8 sommets : **8** petits cubes.',
            ],
            targetSeconds: 45,
          };
        },
      ),
      S(
        'm6-boss-espace-aretes',
        'Problème : la structure en pailles',
        'Voir dans l’espace des assemblages de cubes',
        ['Les pailles sont les arêtes du pavé : il y en a 12, 4 de chaque longueur.'],
        (rng) => {
          const [L, l, h] = [rng.int(10, 30), rng.int(5, 20), rng.int(5, 15)];
          const total = 4 * (L + l + h);
          return {
            prompt: `On construit un pavé droit en pailles de ${L} cm, ${l} cm et ${h} cm (une paille par arête). Quelle longueur de paille faut-il en tout ?`,
            answer: num(total, 'cm'),
            traps: traps(r(total), [
              [L + l + h, 'Un pavé a 12 arêtes : 4 de chaque longueur.'],
              [2 * (L + l + h), 'Compte bien les 12 arêtes : 4 de chaque longueur.'],
            ]),
            hint: 'Un pavé a 12 arêtes : 4 longueurs, 4 largeurs, 4 hauteurs.',
            steps: [`4 × ${L} + 4 × ${l} + 4 × ${h}.`, `= **${total} cm**.`],
            targetSeconds: 50,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-espace-piege',
        'Piège : le cylindre a-t-il des arêtes ?',
        'L’élève identifie dans un ensemble de solides lesquels sont des pyramides, des boules, des cubes, des cylindres, des pavés, des cônes ou des prismes droits (automatisme)',
        ['Un cylindre n’a ni sommet ni arête droite : ses bords sont des cercles.'],
        (rng) => ({
          prompt: 'Combien de sommets a un cylindre ?',
          ...choice(rng, '0', [
            { label: '2', why: 'Les bords d’un cylindre sont des cercles : pas de « pointe ».' },
            { label: '8', why: 'Ça, c’est un pavé.' },
          ]),
          hint: 'Un sommet est une « pointe » où des arêtes se rejoignent.',
          steps: ['Un cylindre a deux disques et une face courbe : aucune pointe.', 'Il a **0** sommet.'],
          targetSeconds: 15,
        }),
      ),
    ],
  ),
);
