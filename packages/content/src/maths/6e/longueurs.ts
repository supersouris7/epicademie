import { num, traps } from '../../build.ts';
import { add, dec, fmt, mul, r } from '../../rational.ts';
import type { Figure } from '../../types.ts';
import { big, bossOf } from '../kit.ts';
import { S, C, convert } from './commun.ts';

const LEN = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'] as const;
const PI = r(314, 100);

// ——— Longueurs et périmètres ———

const conversionsLongueur = S(
  'm6-conversions-longueur',
  'Convertir des longueurs',
  'Connaître et utiliser les unités de longueur et les relations entre elles (automatisme)',
  [
    'km, hm, dam, **m**, dm, cm, mm : on passe d’une unité à la suivante en multipliant ou divisant par **10**.',
    'Place le chiffre des unités sous l’unité de départ dans le tableau, puis lis le nombre jusqu’à l’unité d’arrivée.',
  ],
  (rng, level) => {
    const from = rng.int(0, 6);
    let to = rng.int(Math.max(0, from - (level === 1 ? 1 : 3)), Math.min(6, from + (level === 1 ? 1 : 3)));
    if (to === from) to = from < 6 ? from + 1 : from - 1;
    const x = level === 1 ? r(rng.int(2, 99)) : dec(rng.int(11, 999), rng.int(1, 2));
    const res = convert(x, from, to);
    const wrong = convert(x, to, from);
    const uf = LEN[from] ?? 'm';
    const ut = LEN[to] ?? 'm';
    return {
      prompt: `Complète : ${fmt(x)} ${uf} = … ${ut}`,
      answer: num(res, ut),
      traps: traps(res, [
        [
          wrong,
          `On passe à une unité plus ${to > from ? 'petite' : 'grande'} : le nombre doit devenir plus ${to > from ? 'grand' : 'petit'}.`,
        ],
      ]),
      hint: `Utilise le tableau : le chiffre des unités de ${fmt(x)} sous ${uf}, puis lis jusqu’à ${ut}.`,
      demo: { kind: 'conversion', table: 'longueur', value: x, from: uf, to: ut },
      steps: [
        `De ${uf} à ${ut}, il y a ${Math.abs(to - from)} rang${Math.abs(to - from) > 1 ? 's' : ''} : on ${to > from ? 'multiplie' : 'divise'} par ${big(10 ** Math.abs(to - from))}.`,
        `${fmt(x)} ${uf} = **${fmt(res)} ${ut}**.`,
      ],
      targetSeconds: 25,
    };
  },
  { tools: ['conversion-longueur'] },
);

const perimetreRectangle = S(
  'm6-perimetre-rectangle',
  'Périmètre du carré et du rectangle',
  'L’élève sait calculer le périmètre d’un carré et d’un rectangle (automatisme)',
  [
    'Le **périmètre**, c’est la longueur du tour de la figure.',
    'Rectangle : 2 × (longueur + largeur). Carré : 4 × côté.',
  ],
  (rng, level) => {
    const square = rng.int(0, 2) === 0;
    const L = level === 3 ? dec(rng.int(21, 99), 1) : r(rng.int(3, 25));
    const l = square ? L : level === 3 ? dec(rng.int(11, 49), 1) : r(rng.int(2, 15));
    const p = square ? mul(L, r(4)) : mul(add(L, l), r(2));
    const figure: Figure = {
      kind: 'polygon',
      vertices: [
        { name: 'A', x: 0, y: 0 },
        { name: 'B', x: 6, y: 0 },
        { name: 'C', x: 6, y: square ? 6 : 3.5 },
        { name: 'D', x: 0, y: square ? 6 : 3.5 },
      ],
      sideLabels: [`${fmt(L)} cm`, square ? null : `${fmt(l)} cm`, null, null],
      rightAngles: [0, 1, 2, 3],
      ...(square ? { ticks: [1, 1, 1, 1] } : {}),
    };
    return {
      prompt: square
        ? `Quel est le périmètre de ce carré de côté ${fmt(L)} cm ?`
        : `Quel est le périmètre de ce rectangle de ${fmt(L)} cm sur ${fmt(l)} cm ?`,
      figure,
      answer: num(p, 'cm'),
      traps: traps(p, [
        [square ? mul(L, L) : mul(L, l), 'Ça, c’est l’aire. Le périmètre est le **tour**.'],
        [square ? mul(L, r(2)) : add(L, l), 'Il faut faire **tout** le tour : 4 côtés.'],
      ]),
      hint: square ? 'Un carré a 4 côtés égaux.' : 'Fais le tour : longueur + largeur + longueur + largeur.',
      steps: [
        square
          ? `Les 4 côtés mesurent ${fmt(L)} cm : 4 × ${fmt(L)}.`
          : `Le tour : ${fmt(L)} + ${fmt(l)} + ${fmt(L)} + ${fmt(l)} = 2 × (${fmt(L)} + ${fmt(l)}).`,
        `Périmètre = **${fmt(p)} cm**.`,
      ],
      targetSeconds: 25,
    };
  },
);

const perimetreDisque = S(
  'm6-perimetre-disque',
  'Périmètre d’un cercle',
  'Connaître la formule du périmètre d’un disque',
  [
    'Le périmètre d’un cercle est **proportionnel à son diamètre** : périmètre = π × diamètre (π ≈ 3,14).',
    'Avec le rayon : périmètre = 2 × π × rayon.',
  ],
  (rng, level) => {
    const useRadius = level !== 1;
    const v = rng.int(2, level === 3 ? 30 : 15);
    const diameter = useRadius ? 2 * v : v;
    const p = mul(r(diameter), PI);
    return {
      prompt: `Calcule le périmètre d’un cercle de ${useRadius ? 'rayon' : 'diamètre'} ${v} cm, en prenant π ≈ 3,14.`,
      figure: { kind: 'disk', radiusLabel: `${v} cm`, diameter: !useRadius },
      answer: num(p, 'cm'),
      traps: traps(p, [
        ...(useRadius
          ? [[mul(r(v), PI), 'Le rayon est la moitié du diamètre : périmètre = 2 × π × rayon.'] as const]
          : []),
        [mul(r(v * v), PI), 'Ça ressemble à une aire (π × r × r). Le périmètre = π × diamètre.'],
      ]),
      hint: useRadius ? 'Diamètre = 2 × rayon, puis périmètre = π × diamètre.' : 'Périmètre = π × diamètre.',
      steps: [
        useRadius ? `Diamètre = 2 × ${v} = ${diameter} cm.` : `Le diamètre vaut ${diameter} cm.`,
        `Périmètre ≈ 3,14 × ${diameter} = **${fmt(p)} cm**.`,
      ],
      targetSeconds: 35,
    };
  },
  { advice: 'calculatrice' },
);

const perimetreCompose = S(
  'm6-perimetre-compose',
  'Périmètre de figures composées',
  'Calculer des périmètres de figures composées',
  [
    'On suit le **contour** de la figure, et seulement lui : les traits à l’intérieur ne comptent pas.',
    'Une forme en L : il faut parfois trouver une longueur manquante par soustraction.',
  ],
  (rng) => {
    const W = rng.int(6, 12);
    const H = rng.int(6, 12);
    const w = rng.int(2, W - 2);
    const h = rng.int(2, H - 2);
    // Forme en L : rectangle W × H privé du coin haut droit (W − w) × (H − h) — périmètre = 2(W + H).
    const p = 2 * (W + H);
    return {
      prompt: `Cette figure en forme de L a des angles droits. Calcule son périmètre en cm.`,
      figure: {
        kind: 'polygon',
        vertices: [
          { name: 'A', x: 0, y: 0 },
          { name: 'B', x: W, y: 0 },
          { name: 'C', x: W, y: h },
          { name: 'D', x: w, y: h },
          { name: 'E', x: w, y: H },
          { name: 'F', x: 0, y: H },
        ],
        sideLabels: [`${W} cm`, `${h} cm`, `${W - w} cm`, `${H - h} cm`, `${w} cm`, `${H} cm`],
        rightAngles: [0, 1, 2, 4, 5],
      },
      answer: num(p, 'cm'),
      traps: traps(r(p), [[W * h + w * (H - h), 'Ça, c’est l’aire. Le périmètre, c’est le tour.']]),
      hint: 'Additionne les 6 côtés du contour.',
      steps: [`On fait le tour : ${W} + ${h} + ${W - w} + ${H - h} + ${w} + ${H}.`, `Périmètre = **${p} cm**.`],
      targetSeconds: 40,
    };
  },
);

export const longueurs = C(
  'm6-longueurs',
  'grandeurs',
  'Longueurs et périmètres',
  [conversionsLongueur, perimetreRectangle, perimetreDisque, perimetreCompose],
  bossOf(
    [
      S(
        'm6-boss-longueurs-cloture',
        'Problème : la clôture',
        'Résoudre des problèmes impliquant des longueurs',
        ['Une clôture fait le **tour** du terrain : c’est un périmètre. On enlève la largeur du portail.'],
        (rng) => {
          const L = rng.int(12, 40);
          const l = rng.int(8, 25);
          const gate = rng.int(2, 4);
          const p = 2 * (L + l) - gate;
          return {
            prompt: `Un jardin rectangulaire mesure ${L} m sur ${l} m. On l’entoure d’un grillage, sauf un portail de ${gate} m. Combien de mètres de grillage faut-il ?`,
            answer: num(p, 'm'),
            traps: traps(r(p), [
              [2 * (L + l), `N’oublie pas d’enlever le portail (${gate} m).`],
              [L * l, 'Ça, c’est l’aire du jardin.'],
            ]),
            hint: 'Calcule le tour du jardin, puis enlève le portail.',
            steps: [
              `Tour du jardin : 2 × (${L} + ${l}) = ${2 * (L + l)} m.`,
              `Sans le portail : ${2 * (L + l)} − ${gate} = **${p} m**.`,
            ],
            targetSeconds: 50,
          };
        },
      ),
      S(
        'm6-boss-longueurs-roue',
        'Problème : la roue du vélo',
        'Savoir que le périmètre du disque est proportionnel à son diamètre',
        ['À chaque tour, la roue avance de son périmètre : π × diamètre.'],
        (rng) => {
          const d = rng.pick([50, 60, 70]);
          const turns = rng.int(10, 50);
          const one = mul(r(d), PI);
          const total = mul(one, r(turns));
          return {
            prompt: `Une roue de vélo a un diamètre de ${d} cm. Quelle distance parcourt le vélo, en cm, quand la roue fait ${turns} tours ? (π ≈ 3,14)`,
            answer: num(total, 'cm'),
            traps: traps(total, [[one, `Ça, c’est un seul tour. La roue en fait ${turns}.`]]),
            hint: 'Un tour de roue = le périmètre de la roue.',
            steps: [
              `Un tour : 3,14 × ${d} = ${fmt(one)} cm.`,
              `${turns} tours : ${fmt(one)} × ${turns} = **${fmt(total)} cm**.`,
            ],
            targetSeconds: 60,
          };
        },
        { advice: 'calculatrice' },
      ),
    ],
    [
      S(
        'm6-boss-longueurs-piege',
        'Piège : les unités',
        'Connaître et utiliser les unités de longueur et les relations entre elles (automatisme)',
        ['Avant d’additionner des longueurs, mets-les dans la **même unité**.'],
        (rng) => {
          const m = rng.int(1, 5);
          const cm = rng.int(10, 90);
          const total = add(r(m), r(cm, 100));
          return {
            prompt: `Une planche de ${m} m et une planche de ${cm} cm sont mises bout à bout. Quelle longueur totale, en m ?`,
            answer: num(total, 'm'),
            traps: traps(total, [[m + cm, `On n’additionne pas des m et des cm : ${cm} cm = ${fmt(r(cm, 100))} m.`]]),
            hint: `Convertis d’abord ${cm} cm en m.`,
            steps: [`${cm} cm = ${fmt(r(cm, 100))} m.`, `${m} + ${fmt(r(cm, 100))} = **${fmt(total)} m**.`],
            targetSeconds: 30,
          };
        },
        { tools: ['conversion-longueur'] },
      ),
    ],
  ),
);
