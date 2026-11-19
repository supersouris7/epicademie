import { choice, nonZero, num, objective, traps } from '../../build.ts';
import { fmt, r } from '../../rational.ts';
import type { Chapter, Skill, Trap } from '../../types.ts';

const coord = (x: number, y: number) => `(${fmt(x)} ; ${fmt(y)})`;

/* ───────────────────────── Repérage ───────────────────────── */

const droiteDecimaux: Skill = {
  id: 'm5-droite-decimaux',
  title: 'Lire une abscisse décimale',
  lesson: {
    memo: [
      'Avant tout, trouve ce que vaut **une case** : compte les cases entre deux nombres écrits (pas les traits !).',
      '10 cases entre 2 et 3 → une case vaut 0,1. 5 cases → une case vaut 0,2. 2 cases → 0,5.',
      'Puis pars du nombre écrit juste avant le point et avance case par case.',
    ],
    source: objective('Sur une droite graduée : lire l’abscisse d’un point donné ; placer un point d’abscisse donnée'),
  },
  generate(rng, level) {
    const sub = level === 1 ? 2 : level === 2 ? 5 : 10;
    const start = rng.int(0, level === 3 ? 20 : 8);
    const max = start + 2;
    let k = rng.int(1, 2 * sub - 1);
    while (k % sub === 0) k = rng.int(1, 2 * sub - 1);
    const value = r(start * sub + k, sub);
    return {
      prompt: 'Quelle est l’abscisse du point **A** ?',
      figure: {
        kind: 'numberLine',
        min: start,
        max,
        subdivisions: sub,
        labels: [start, start + 1, max],
        points: [{ name: 'A', at: value.n / value.d }],
      },
      answer: num(value),
      traps: traps(value, [
        [
          r(start * 10 + k, 10),
          `Ici une graduation vaut ${fmt(r(1, sub))}, pas 0,1 : il y a ${sub} intervalles par unité.`,
        ],
      ]),
      hint: `Compte les cases entre ${start} et ${start + 1} : combien vaut une case ?`,
      steps: [
        `Entre ${start} et ${start + 1}, on compte ${sub} cases. Une case vaut donc 1 ÷ ${sub} = ${fmt(r(1, sub))}.`,
        k < sub
          ? `On part de ${start} et on avance de ${k} case${k > 1 ? 's' : ''} jusqu’à A : ${k} × ${fmt(r(1, sub))} = ${fmt(r(k, sub))}.`
          : `On part de ${start + 1} (le nombre écrit juste avant A) et on avance de ${k - sub} case${k - sub > 1 ? 's' : ''} : ${k - sub} × ${fmt(r(1, sub))} = ${fmt(r(k - sub, sub))}.`,
        `A = ${k < sub ? start : start + 1} + ${fmt(r(k < sub ? k : k - sub, sub))} = **${fmt(value)}**`,
      ],
    };
  },
};

const coordonnees: Skill = {
  id: 'm5-coordonnees',
  title: 'Coordonnées dans un repère',
  lesson: {
    memo: [
      'Pour aller à B(−3 ; 2), pars du centre : **d’abord on marche** (horizontal : 3 vers la gauche), **ensuite on monte** (vertical : 2 vers le haut).',
      'Moyen de retenir : « on prend l’ascenseur après avoir marché dans le couloir ». Négatif = gauche ou bas.',
    ],
    source: objective(
      'Dans le plan muni d’un repère orthogonal : lire les coordonnées d’un point donné ; placer un point de coordonnées données',
    ),
  },
  generate(rng, level) {
    const lim = 5;
    const x = level === 1 ? rng.int(1, lim) : nonZero(rng, -lim, lim);
    let y = level === 1 ? rng.int(1, lim) : nonZero(rng, -lim, lim);
    if (y === x) y = -y;
    const base = { kind: 'grid' as const, xMin: -lim, xMax: lim, yMin: -lim, yMax: lim, axes: true };
    if (level === 3) {
      const t: Trap[] = [
        {
          point: { x: y, y: x },
          why: 'Abscisse et ordonnée inversées : on se déplace d’abord horizontalement (abscisse).',
        },
        { point: { x: -x, y }, why: 'Erreur de signe sur l’abscisse : négatif = à gauche.' },
        { point: { x, y: -y }, why: 'Erreur de signe sur l’ordonnée : négatif = vers le bas.' },
      ].filter((p) => !(p.point.x === x && p.point.y === y));
      return {
        prompt: `Touche le quadrillage pour placer le point B${coord(x, y)}.`,
        figure: { ...base, points: [], pick: true },
        answer: { kind: 'point', x, y },
        traps: t,
        hint: `Pars du centre : d’abord ${fmt(x)} à l’horizontale, puis ${fmt(y)} à la verticale. Négatif = gauche ou bas.`,
        steps: [
          `On part du centre du repère (l’origine).`,
          `1er nombre, ${fmt(x)} : on marche de ${Math.abs(x)} case${Math.abs(x) > 1 ? 's' : ''} vers la ${x > 0 ? 'droite' : 'gauche'}${x < 0 ? ' (négatif = gauche)' : ''}.`,
          `2e nombre, ${fmt(y)} : on ${y > 0 ? 'monte' : 'descend'} de ${Math.abs(y)} case${Math.abs(y) > 1 ? 's' : ''}${y < 0 ? ' (négatif = bas)' : ''}. Le point B est **là, entouré en vert**.`,
        ],
      };
    }
    return {
      prompt: 'Quelles sont les coordonnées du point **A** ?',
      figure: { ...base, points: [{ name: 'A', x, y, color: 'accent' }] },
      ...choice(rng, coord(x, y), [
        { label: coord(y, x), why: 'On écrit d’abord l’abscisse (axe horizontal), puis l’ordonnée.' },
        { label: coord(-x, y), why: 'Le signe de l’abscisse est faux.' },
        { label: coord(x, -y), why: 'Le signe de l’ordonnée est faux.' },
      ]),
      hint: 'Pars du centre : combien de cases à l’horizontale pour être sous (ou sur) A ? Puis combien à la verticale ?',
      steps: [
        `On part du centre et on va jusqu’à A en deux temps.`,
        `À l’horizontale : ${Math.abs(x)} case${Math.abs(x) > 1 ? 's' : ''} vers la ${x > 0 ? 'droite' : 'gauche'} → ${fmt(x)}. C’est le 1er nombre.`,
        `À la verticale : ${Math.abs(y)} case${Math.abs(y) > 1 ? 's' : ''} vers le ${y > 0 ? 'haut' : 'bas'} → ${fmt(y)}. C’est le 2e nombre : A**${coord(x, y)}**.`,
      ],
    };
  },
};

export const reperage: Chapter = {
  id: 'm5-reperage',
  subject: 'maths',
  grade: '5e',
  domain: 'geometrie',
  title: 'Repérage',
  skills: [droiteDecimaux, coordonnees],
};
