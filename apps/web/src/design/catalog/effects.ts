import { SVG_ASSETS } from '../assets.generated.ts';
import { a, chunk } from './kinds.ts';

/** Catalogue des images — Kit combat : effets (les blancs sont recolorés par l'application) */

export const EFFECTS = [
  ['impacts/hit-burst', 'éclat d’impact étoilé BLANC pur (sera recoloré par l’application)', 'fx-hit-burst'],
  ['impacts/anneau', 'anneau d’onde de choc BLANC pur vu de trois quarts (sera recoloré)'],
  ['impacts/etincelles', 'gerbe d’étincelles BLANCHES en étoile (sera recolorée)'],
  ['impacts/flash', 'flash de bouche de canon BLANC et jaune pâle, en étoile, vu de profil vers la droite'],
  ['impacts/explosion', 'petite explosion cartoon orange et jaune avec fumée'],
  ['particles/puff', 'nuage de fumée violette cartoon (disparition d’un mob)', 'fx-puff'],
  ['particles/bouclier', 'bulle de bouclier hexagonale cyan translucide (vue de face, vide au centre)'],
  ['particles/soin', 'croix verte lumineuse entourée de petits cœurs et d’étincelles vertes'],
  ['particles/etourdi', 'trois petites spirales dorées en orbite (étourdi)'],
  ['impacts/onde-boss', 'onde d’attaque rouge et orange en forme de croissant, se déplaçant vers la gauche'],
  ['particles/confettis', 'gerbe de confettis violets, orange, cyan et jaunes'],
  ['transitions/portail', 'tourbillon de portail violet vu de face'],
] as const satisfies readonly (readonly [string, string, (keyof typeof SVG_ASSETS)?])[];

export const effectAssets = EFFECTS.map(([id, look, fallback], i) =>
  a(
    'effect',
    `effects/${id}.webp`,
    `Effet ${id.split('/')[1] ?? id}`,
    look,
    'Effets de combat, récompenses, transitions.',
    1,
    {
      sheet: chunk('effets', i, 9, EFFECTS.length),
      ...(fallback ? { fallback } : {}),
    },
  ),
);
