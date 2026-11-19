import { num, objective, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Chapter, Skill } from '../../types.ts';

/* ───────────────────────── Fonctions ───────────────────────── */

const formuleValeurs: Skill = {
  id: 'm5-fonctions-formule',
  title: 'Grandeur en fonction d’une autre',
  lesson: {
    memo: [
      'Une formule, c’est une machine : on met un nombre dedans, elle en ressort un autre.',
      'P = 3 × n + 2 avec n = 5 : on remplace n par 5 → 3 × 5 + 2 = 17.',
    ],
    source: objective(
      'Introduire l’expression « en fonction de ». Traduire la relation de dépendance entre deux grandeurs par un tableau de valeurs à partir d’une formule',
    ),
  },
  generate(rng, level) {
    const forms = [
      {
        f: (c: number) => 4 * c,
        txt: 'P = 4 × c',
        what: 'Le périmètre P d’un carré en fonction de son côté c',
        v: 'c',
      },
      {
        f: (n: number) => 3 * n + 2,
        txt: 'P = 3 × n + 2',
        what: 'Le prix P (en €) en fonction du nombre n de tickets',
        v: 'n',
      },
      {
        f: (t: number) => 60 * t,
        txt: 'd = 60 × t',
        what: 'La distance d (en km) en fonction de la durée t (en h)',
        v: 't',
      },
      { f: (x: number) => x * x, txt: 'A = x^2', what: 'L’aire A d’un carré en fonction de son côté x', v: 'x' },
    ];
    const f = rng.pick(level === 1 ? forms.slice(0, 2) : forms);
    const x = rng.int(2, level === 3 ? 12 : 9);
    const v = f.f(x);
    return {
      prompt: `${f.what} est donné par ${f.txt}. Calcule la valeur pour ${f.v} = ${x}.`,
      answer: num(v),
      hint: `Remplace ${f.v} par ${x} dans la formule ${f.txt}, puis calcule (× avant +).`,
      steps: [
        `La formule est une machine : on y met ${f.v} = ${x}.`,
        `${f.txt} devient ${f.txt.split(' = ')[0]} = ${(f.txt.split(' = ')[1] ?? '').replace(f.v, String(x)).replace(/x\^2/, `${x} × ${x}`).replace(`${x}^2`, `${x} × ${x}`)}.`,
        `On calcule : **${v}**`,
      ],
      targetSeconds: 20,
    };
  },
};

const lireGraphique: Skill = {
  id: 'm5-fonctions-graphique',
  title: 'Lire un graphique',
  lesson: {
    memo: [
      'Lire un graphique, c’est un trajet en « L » : on part de l’axe du bas, on **monte** jusqu’à la courbe, puis on va **à gauche** lire sur l’axe vertical.',
      'Pour trouver le moment le plus chaud, on cherche le point **le plus haut** de la courbe, et on descend lire l’heure en bas.',
    ],
    source: objective('Lire et interpréter un graphique cartésien donné par une courbe ou un nuage de points'),
  },
  generate(rng, level) {
    const hours = [8, 10, 12, 14, 16, 18];
    let t = rng.int(4, 10);
    const temps = hours.map((_, i) => {
      if (i > 0) t += rng.pick([-2, 2, 4, 2, -2, 0]);
      return t;
    });
    const points = hours.map((x, i) => ({ x, y: temps[i] ?? 0 }));
    const figure = { kind: 'chart' as const, xLabel: 'Heure (h)', yLabel: 'Température (°C)', points, line: true };
    const i = rng.int(0, 5);
    const p = points[i] ?? { x: 8, y: 0 };
    if (level === 3) {
      const max = points.reduce((m, q) => (q.y > m.y ? q : m));
      return {
        prompt: 'À quelle heure la température a-t-elle été la plus élevée ?',
        figure,
        answer: num(max.x, 'h'),
        traps: traps(r(max.x), [[max.y, `${max.y} est la température maximale ; on demande l’**heure**.`]]),
        hint: 'Cherche le point le plus haut de la courbe, puis descends tout droit lire l’heure sur l’axe du bas.',
        steps: [
          'La température la plus élevée, c’est le point le plus haut de la courbe.',
          `Ce point est à ${max.y} °C. On descend tout droit jusqu’à l’axe du bas.`,
          `On lit l’heure : **${max.x} h**.`,
        ],
      };
    }
    return {
      prompt: `Quelle température faisait-il à ${p.x} h (en °C) ?`,
      figure,
      answer: num(p.y, '°C'),
      traps: traps(r(p.y), [[p.x, 'Ça, c’est l’heure : on lit la température sur l’axe vertical.']]),
      hint: `Pars de ${p.x} h sur l’axe du bas, monte jusqu’à la courbe, puis va à gauche lire la température.`,
      steps: [
        `On part de ${p.x} h sur l’axe du bas.`,
        'On monte tout droit jusqu’à la courbe.',
        `On va à gauche jusqu’à l’axe vertical et on lit **${p.y} °C**.`,
      ],
      targetSeconds: 20,
    };
  },
};
export const fonctions: Chapter = {
  id: 'm5-fonctions',
  subject: 'maths',
  grade: '5e',
  domain: 'fonctions',
  title: 'Fonctions',
  skills: [formuleValeurs, lireGraphique],
};
