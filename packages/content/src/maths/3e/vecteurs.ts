import { choice, distinct, nonZero, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Translations et vecteurs ———

const vecteurImage = S(
  'm3-vecteur-image',
  'Translation de vecteur donné',
  'Définir et utiliser la translation : définition ponctuelle avec parallélogramme',
  [
    'L’image de M par la translation de vecteur {AB} est M′ tel que ABM′M soit un parallélogramme : M glisse comme A va vers B.',
  ],
  (rng) => {
    const lim = 5;
    for (;;) {
      const dx = nonZero(rng, -4, 4);
      const dy = rng.int(-4, 4);
      const m = { x: rng.int(-4, 4), y: rng.int(-4, 4) };
      const img = { x: m.x + dx, y: m.y + dy };
      if (Math.abs(img.x) > lim || Math.abs(img.y) > lim) continue;
      return {
        prompt: `Le vecteur u se déplace de ${Math.abs(dx)} carreau${Math.abs(dx) > 1 ? 'x' : ''} vers la ${dx > 0 ? 'droite' : 'gauche'}${dy ? ` et de ${Math.abs(dy)} vers le ${dy > 0 ? 'haut' : 'bas'}` : ''}. Touche l’image de M par la translation de vecteur u.`,
        figure: {
          kind: 'grid',
          xMin: -lim,
          xMax: lim,
          yMin: -lim,
          yMax: lim,
          axes: false,
          points: [{ name: 'M', x: m.x, y: m.y, color: 'accent' }],
          pick: true,
        },
        answer: { kind: 'point', ...img },
        traps: [{ point: { x: m.x - dx, y: m.y - dy }, why: 'Attention au sens du vecteur.' }].filter(
          (t) => Math.abs(t.point.x) <= lim && Math.abs(t.point.y) <= lim,
        ),
        hint: 'Fais le même déplacement que le vecteur, à partir de M.',
        steps: [`On part de M et on applique le déplacement du vecteur u.`, 'L’image est **le nœud entouré en vert**.'],
        targetSeconds: 30,
      };
    }
  },
);

const chasles = S(
  'm3-chasles',
  'Somme de vecteurs, relation de Chasles',
  'Découvrir et utiliser la relation de Chasles',
  ['Relation de Chasles : **{AB} + {BC} = {AC}** (le point du milieu « s’efface »). Et {AB} + {BA} = vecteur nul.'],
  (rng) => {
    const [a, b, c] = distinct(rng, 3, () => rng.pick(['A', 'B', 'C', 'D', 'E', 'M', 'N']));
    const good = `→${a}${c}`;
    return {
      prompt: `Simplifie →${a}${b} + →${b}${c}.`,
      ...choice(rng, good, [
        { label: `→${c}${a}`, why: 'Attention au sens : on part de ' + String(a) + '.' },
        { label: `→${b}${b}`, why: `C’est ${b} qui « s’efface ».` },
        { label: `→${a}${b}${c}`, why: 'Un vecteur a deux extrémités.' },
      ]),
      hint: 'Chasles : →AB + →BC = →AC.',
      steps: [
        `Le point ${b} est à la fin du 1er vecteur et au début du 2e : il s’efface.`,
        `→${a}${b} + →${b}${c} = **${good}**.`,
      ],
      targetSeconds: 20,
    };
  },
);

const vecteursEgaux = S(
  'm3-vecteurs-egaux',
  'Vecteurs égaux et parallélogramme',
  'Définir et utiliser les notions de vecteur, de vecteurs égaux, de vecteur nul, d’opposé d’un vecteur',
  ['→AB = →DC ⟺ ABCD est un parallélogramme (éventuellement aplati). L’opposé de →AB est →BA.'],
  (rng) => {
    const q = rng.pick([
      { p: 'ABCD est un parallélogramme. Quel vecteur est égal à →AB ?', a: '→DC', w: ['→CD', '→BC', '→AD'] },
      { p: 'ABCD est un parallélogramme. Quel vecteur est égal à →AD ?', a: '→BC', w: ['→CB', '→DC', '→AB'] },
      { p: 'Quel est l’opposé du vecteur →EF ?', a: '→FE', w: ['→EF', '→EE', '→FF'] },
    ]);
    return {
      prompt: q.p,
      ...choice(
        rng,
        q.a,
        q.w.map((w) => ({ label: w, why: 'Même direction, même sens, même longueur : vérifie le sens.' })),
      ),
      hint: 'Deux vecteurs égaux ont même direction, même sens et même longueur.',
      steps: ['On compare direction, sens et longueur.', `Réponse : **${q.a}**.`],
      targetSeconds: 20,
    };
  },
);

export const vecteurs = C(
  'm3-vecteurs',
  'geometrie',
  'Translations et vecteurs',
  [vecteurImage, vecteursEgaux, chasles],
  bossOf(
    [
      S(
        'm3-boss-vecteurs-bateau',
        'Problème : le bateau et le courant',
        'Définir et utiliser la somme de deux vecteurs par enchainement de deux translations',
        [
          'Deux déplacements à la suite : on additionne les vecteurs (on additionne les déplacements en largeur, puis en hauteur).',
        ],
        (rng) => {
          const a = rng.int(2, 8);
          const b = rng.int(1, 5);
          return {
            prompt: `Un bateau avance de ${a} km vers l’est, puis le courant le déplace de ${b} km vers l’est et 3 km vers le nord. De combien de km vers l’est s’est-il déplacé en tout ?`,
            answer: num(a + b, 'km'),
            traps: traps(r(a + b), [[a + b + 3, 'Le déplacement vers le nord est dans une autre direction.']]),
            hint: 'Additionne les déplacements vers l’est seulement.',
            steps: [`Vers l’est : ${a} + ${b}.`, `= **${a + b} km**.`],
            targetSeconds: 25,
          };
        },
      ),
      S(
        'm3-boss-vecteurs-chasles',
        'Problème : l’itinéraire',
        'Découvrir et utiliser la relation de Chasles',
        ['→AB + →BC + →CD = →AD : seuls le départ et l’arrivée comptent.'],
        (rng) => {
          const pts = distinct(rng, 4, () => rng.pick(['A', 'B', 'C', 'D', 'E', 'F']));
          const [p, q, s, t] = pts;
          return {
            prompt: `Simplifie →${p}${q} + →${q}${s} + →${s}${t}.`,
            ...choice(rng, `→${p}${t}`, [
              { label: `→${t}${p}`, why: 'Le départ est ' + String(p) + '.' },
              { label: `→${p}${s}`, why: 'Il reste un vecteur à ajouter.' },
            ]),
            hint: 'Applique Chasles deux fois.',
            steps: [
              `→${p}${q} + →${q}${s} = →${p}${s}, puis →${p}${s} + →${s}${t} = →${p}${t}.`,
              `Résultat : **→${p}${t}**.`,
            ],
            targetSeconds: 30,
          };
        },
      ),
    ],
    [
      S(
        'm3-boss-vecteurs-piege',
        'Piège : →AB = →CD veut-il dire ABCD parallélogramme ?',
        'Définir et utiliser la translation : définition ponctuelle avec parallélogramme',
        [
          '→AB = →DC ⟺ ABCD parallélogramme. Avec →AB = →CD, c’est ABDC qui est un parallélogramme (attention à l’ordre !).',
        ],
        (rng) => ({
          prompt: 'Si →AB = →CD, quel quadrilatère est un parallélogramme ?',
          ...choice(rng, 'ABDC', [
            { label: 'ABCD', why: 'Pour ABCD, il faudrait →AB = →DC.' },
            { label: 'ACBD', why: 'Suis les extrémités dans l’ordre : A → B, puis D, puis C.' },
          ]),
          hint: '→AB = →DC ⟺ ABCD parallélogramme. Ici le 2e vecteur va de C vers D.',
          steps: ['→AB = →CD : on lit A, B, puis D, puis C.', 'C’est **ABDC** qui est un parallélogramme.'],
          targetSeconds: 30,
        }),
      ),
    ],
  ),
);
