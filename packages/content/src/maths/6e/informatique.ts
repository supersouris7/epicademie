import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Block } from '../../types.ts';
import { bossOf, NAMES } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Pensée informatique ———

type Move = 'haut' | 'bas' | 'gauche' | 'droite';
const DELTA: Record<Move, readonly [number, number]> = { haut: [0, 1], bas: [0, -1], gauche: [-1, 0], droite: [1, 0] };

const sequence = S(
  'm6-sequence',
  'Exécuter une séquence d’instructions',
  'Produire et exécuter une séquence d’instructions',
  ['Exécute les instructions **dans l’ordre**, une par une, en partant de la case de départ.'],
  (rng, level) => {
    const lim = 5;
    for (;;) {
      let x = rng.int(-2, 2);
      let y = rng.int(-2, 2);
      const start = { x, y };
      const n = level === 1 ? 2 : level === 2 ? 3 : 4;
      const moves = Array.from({ length: n }, () => ({
        d: rng.pick(['haut', 'bas', 'gauche', 'droite'] as Move[]),
        k: rng.int(1, 3),
      }));
      for (const m of moves) {
        x += DELTA[m.d][0] * m.k;
        y += DELTA[m.d][1] * m.k;
      }
      if (Math.abs(x) > lim || Math.abs(y) > lim || (x === start.x && y === start.y)) continue;
      const dir = (d: Move) => (d === 'haut' || d === 'bas' ? `vers le ${d}` : `vers la ${d}`);
      const text = moves.map((m) => `avancer de ${m.k} ${dir(m.d)}`).join(', puis ');
      return {
        prompt: `Le robot part du point R. Programme : ${text}. Touche le point d’arrivée.`,
        figure: {
          kind: 'grid',
          xMin: -lim,
          xMax: lim,
          yMin: -lim,
          yMax: lim,
          axes: false,
          points: [{ name: 'R', x: start.x, y: start.y, color: 'accent' }],
          pick: true,
        },
        answer: { kind: 'point', x, y },
        traps: [],
        hint: 'Suis les instructions une par une, avec ton doigt.',
        steps: [
          'On part de R et on applique chaque instruction dans l’ordre.',
          'Le robot arrive sur **le nœud entouré en vert**.',
        ],
        targetSeconds: 35,
      };
    }
  },
);

const repeter = S(
  'm6-repeter',
  'Répéter une séquence',
  'Répéter à la main une séquence d’instructions pour accomplir une tâche imposée',
  ['« Répéter 4 fois : avancer de 2 » fait avancer de 4 × 2 = 8 en tout.'],
  (rng, level) => {
    const times = rng.int(2, level === 1 ? 4 : 8);
    const step = rng.int(1, 5);
    const start = rng.int(0, 10);
    const program: Block[] = [
      { op: 'set', variable: 'score', expr: String(start) },
      { op: 'repeat', times, body: [{ op: 'change', variable: 'score', by: String(step) }] },
      { op: 'say', expr: 'score' },
    ];
    const res = start + times * step;
    return {
      prompt: 'Quel nombre le lutin dit-il à la fin ?',
      figure: { kind: 'blocks', program },
      answer: num(res),
      traps: traps(r(res), [
        [start + step, `La boucle répète l’ajout ${times} fois.`],
        [times * step, `N’oublie pas la valeur de départ (${start}).`],
      ]),
      hint: `On part de ${start} et on ajoute ${step}, ${times} fois.`,
      steps: [
        `score commence à ${start}, puis on ajoute ${step} à chaque tour, ${times} fois : + ${times * step}.`,
        `${start} + ${times * step} = **${res}**.`,
      ],
      targetSeconds: 25,
    };
  },
);

const instructions = S(
  'm6-instructions',
  'Écrire un chemin',
  'Programmer la construction d’un chemin simple',
  ['Pour aller d’un point à un autre sur un quadrillage, compte les cases à droite/à gauche, puis en haut/en bas.'],
  (rng) => {
    const dx = rng.int(-4, 4) || 3;
    const dy = rng.int(-4, 4) || -2;
    const good = `${Math.abs(dx)} vers la ${dx > 0 ? 'droite' : 'gauche'}, puis ${Math.abs(dy)} vers le ${dy > 0 ? 'haut' : 'bas'}`;
    const wrong1 = `${Math.abs(dx)} vers la ${dx > 0 ? 'gauche' : 'droite'}, puis ${Math.abs(dy)} vers le ${dy > 0 ? 'haut' : 'bas'}`;
    const wrong2 = `${Math.abs(dy)} vers la ${dx > 0 ? 'droite' : 'gauche'}, puis ${Math.abs(dx)} vers le ${dy > 0 ? 'haut' : 'bas'}`;
    return {
      prompt: 'Quel programme mène le robot de R à T ?',
      figure: {
        kind: 'grid',
        xMin: -5,
        xMax: 5,
        yMin: -5,
        yMax: 5,
        axes: false,
        points: [
          { name: 'R', x: 0, y: 0, color: 'accent' },
          { name: 'T', x: dx, y: dy },
        ],
      },
      ...choice(rng, good, [
        { label: wrong1, why: 'Regarde dans quel sens se trouve T.' },
        { label: wrong2, why: 'Compte bien les cases dans chaque direction.' },
      ]),
      hint: 'Compte les cases horizontalement, puis verticalement.',
      steps: [
        `T est à ${Math.abs(dx)} case${Math.abs(dx) > 1 ? 's' : ''} ${dx > 0 ? 'à droite' : 'à gauche'} et ${Math.abs(dy)} ${dy > 0 ? 'plus haut' : 'plus bas'}.`,
        `Programme : **${good}**.`,
      ],
      targetSeconds: 25,
    };
  },
);

export const informatique = C(
  'm6-informatique',
  'informatique',
  'Pensée informatique',
  [sequence, repeter, instructions],
  bossOf(
    [
      S(
        'm6-boss-info-tirelire',
        'Problème : la tirelire',
        'Répéter à la main une séquence d’instructions pour accomplir une tâche imposée',
        ['Suis le programme bloc par bloc ; la boucle répète son contenu.'],
        (rng) => {
          const start = rng.int(5, 30);
          const weeks = rng.int(3, 10);
          const add = rng.int(2, 6);
          const res = start + weeks * add;
          return {
            prompt: `Ce programme calcule l’argent de ${rng.pick(NAMES)} après ${weeks} semaines. Que dit le lutin ?`,
            figure: {
              kind: 'blocks',
              program: [
                { op: 'set', variable: 'argent', expr: String(start) },
                { op: 'repeat', times: weeks, body: [{ op: 'change', variable: 'argent', by: String(add) }] },
                { op: 'say', expr: 'argent' },
              ],
            },
            answer: num(res),
            traps: traps(r(res), [[weeks * add, `N’oublie pas les ${start} € du départ.`]]),
            hint: `Départ : ${start}. Chaque tour : + ${add}.`,
            steps: [
              `${weeks} tours de boucle : + ${weeks} × ${add} = + ${weeks * add}.`,
              `${start} + ${weeks * add} = **${res}**.`,
            ],
            targetSeconds: 35,
          };
        },
      ),
      S(
        'm6-boss-info-carre',
        'Problème : tracer un carré',
        'Programmer la construction d’un chemin simple',
        ['Pour tracer un carré : répéter 4 fois « avancer, tourner d’un quart de tour ».'],
        (rng) => {
          const side = rng.int(20, 100);
          return {
            prompt: `Un robot répète 4 fois : « avancer de ${side} pas, tourner de 90° ». Quelle distance a-t-il parcourue en tout, en pas ?`,
            answer: num(4 * side),
            traps: traps(r(4 * side), [[side, 'Le programme est répété 4 fois.']]),
            hint: `Chaque répétition avance de ${side} pas.`,
            steps: [`4 répétitions de ${side} pas.`, `4 × ${side} = **${4 * side} pas** (il a tracé un carré).`],
            targetSeconds: 25,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-info-piege',
        'Piège : l’ordre des instructions',
        'Identifier une instruction ou une séquence d’instructions',
        ['L’ordre compte : « ajouter 3 puis multiplier par 2 » ne donne pas la même chose que l’inverse.'],
        (rng) => {
          const x = rng.int(2, 9);
          const res = (x + 3) * 2;
          return {
            prompt: `Programme : choisir ${x}, ajouter 3, puis multiplier par 2. Quel résultat ?`,
            answer: num(res),
            traps: traps(r(res), [[x * 2 + 3, 'Respecte l’ordre : on ajoute 3 **d’abord**.']]),
            hint: 'Fais les étapes dans l’ordre écrit.',
            steps: [`${x} + 3 = ${x + 3}.`, `${x + 3} × 2 = **${res}**.`],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);
