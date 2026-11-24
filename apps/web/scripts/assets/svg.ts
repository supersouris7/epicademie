/**
 * Briques communes des SVG Épicadémie.
 *
 * Règles de dessin (documentées dans docs/DESIGN-SYSTEM.md) :
 * - grille 64 × 64, contour encre de 4 unités, jointures et extrémités arrondies ;
 * - volume « cartoon » : teinte de base + ombre franche en bas à droite (`toon`) + reflet blanc en haut à gauche ;
 * - glyphes d'interface : blanc détouré d'encre (`line`, `glyph`) pour rester lisibles sur toutes les couleurs ;
 * - uniquement les couleurs de src/design/palette.ts.
 */
import { c, type PaletteName } from '../../src/design/palette.ts';

export const INK = c('ink');
export const STROKE = 4;

export type Shape = string;

/** Formes de base (sans attributs de peinture). */
export const path = (d: string): Shape => `<path d="${d}"/>`;
export const circle = (cx: number, cy: number, r: number): Shape => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
export const rect = (x: number, y: number, w: number, h: number, r = 0): Shape =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}"${r ? ` rx="${r}"` : ''}/>`;
export const poly = (pts: readonly (readonly [number, number])[]): Shape =>
  `<polygon points="${pts.map(([x, y]) => `${x} ${y}`).join(' ')}"/>`;

/** Ajoute des attributs de peinture à une forme. */
export const paint = (shape: Shape, attrs: string): string => shape.replace(/\/>$/, ` ${attrs}/>`);

const fillOf = (color: PaletteName | 'none') => (color === 'none' ? 'none' : c(color));

/**
 * Forme pleine en volume : base, ombre franche décalée (bas-droite) et contour encre.
 * `uid` doit être unique dans le fichier (il préfixe le clipPath).
 */
export function toon(
  uid: string,
  shape: Shape,
  base: PaletteName,
  shade: PaletteName,
  { dx = -3, dy = -4, stroke = STROKE }: { dx?: number; dy?: number; stroke?: number } = {},
): string {
  return [
    `<clipPath id="${uid}">${shape}</clipPath>`,
    `<g clip-path="url(#${uid})">`,
    paint(shape, `fill="${c(shade)}"`),
    `<g transform="translate(${dx} ${dy})">${paint(shape, `fill="${c(base)}"`)}</g>`,
    `</g>`,
    outline(shape, stroke),
  ].join('');
}

/** Forme simple remplie et détourée. */
export const flat = (shape: Shape, fill: PaletteName | 'none', stroke = STROKE): string =>
  paint(
    shape,
    `fill="${fillOf(fill)}"${stroke ? ` stroke="${INK}" stroke-width="${stroke}" stroke-linejoin="round"` : ''}`,
  );

/** Contour encre seul. */
export const outline = (shape: Shape, stroke = STROKE): string =>
  paint(shape, `fill="none" stroke="${INK}" stroke-width="${stroke}" stroke-linejoin="round" stroke-linecap="round"`);

/** Remplissage sans contour. */
export const fill = (shape: Shape, color: PaletteName, opacity?: number): string =>
  paint(shape, `fill="${c(color)}"${opacity === undefined ? '' : ` opacity="${opacity}"`}`);

/** Reflet blanc (trait arrondi semi-transparent). */
export const shine = (d: string, width = 4, opacity = 0.6): string =>
  `<path d="${d}" fill="none" stroke="${c('white')}" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}"/>`;

/** Trait épais coloré détouré d'encre (glyphes linéaires : croix, coche, flèches…). */
export const line = (d: string, color: PaletteName = 'white', width = 6): string =>
  `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${width + STROKE * 2 - 2}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${c(color)}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** Trait coloré sans contour. */
export const stroke = (d: string, color: PaletteName, width: number, cap: 'round' | 'butt' = 'round'): string =>
  `<path d="${d}" fill="none" stroke="${c(color)}" stroke-width="${width}" stroke-linecap="${cap}" stroke-linejoin="round"/>`;

/** Glyphe plein blanc détouré (icônes de navigation). */
export const glyph = (shape: Shape, color: PaletteName = 'white'): string => flat(shape, color);

/** Engrenage : `teeth` dents autour de (cx, cy). */
export function gearPath(cx: number, cy: number, rOut: number, rIn: number, teeth: number): string {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    const half = step * 0.22;
    const ring = [
      [rIn, a - step / 2 + half],
      [rOut, a - half],
      [rOut, a + half],
      [rIn, a + step / 2 - half],
    ] as const;
    for (const [r, t] of ring) pts.push(`${round(cx + r * Math.cos(t))} ${round(cy + r * Math.sin(t))}`);
  }
  return `M${pts.join('L')}Z`;
}

export const round = (n: number) => Math.round(n * 10) / 10;

/** Polygone régulier (hexagone de badge, etc.). */
export function regular(cx: number, cy: number, r: number, sides: number, rotate = -90): [number, number][] {
  return Array.from({ length: sides }, (_, i) => {
    const t = ((rotate + (360 / sides) * i) * Math.PI) / 180;
    return [round(cx + r * Math.cos(t)), round(cy + r * Math.sin(t))];
  });
}

/** Texte vectorisé : remplissage + contour peint sous le remplissage. */
export const lettering = (d: string, color: PaletteName, outlineWidth = 3, outlineColor: PaletteName = 'ink'): string =>
  `<path d="${d}" fill="${c(color)}" stroke="${c(outlineColor)}" stroke-width="${outlineWidth}" stroke-linejoin="round" paint-order="stroke"/>`;

/** Cercle (ou forme) en simple trait coloré. */
export const ring = (shape: Shape, color: PaletteName, width: number): string =>
  paint(shape, `fill="none" stroke="${c(color)}" stroke-width="${width}"`);
