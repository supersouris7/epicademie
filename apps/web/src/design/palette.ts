/**
 * Palette Épicadémie : source unique des couleurs.
 *
 * Valeurs relevées sur les planches de direction artistique (violet, orange et crème dominants,
 * puis cyan, vert et rose), harmonisées en rampes de luminosité régulières.
 * - Les SVG générés (scripts/assets) n'utilisent que ces valeurs ; un test le vérifie.
 * - Les variables CSS de src/design/tokens.css reprennent ces valeurs ; un test vérifie la concordance.
 */
export const PALETTE = {
  ink: '#1d1238',
  white: '#ffffff',

  'violet-50': '#f3eeff',
  'violet-100': '#e4d9ff',
  'violet-300': '#b598ff',
  'violet-500': '#7c4dff',
  'violet-600': '#6436e0',
  'violet-700': '#4d24b8',
  'violet-800': '#33207a',
  'violet-900': '#261659',
  'violet-950': '#150c33',

  'orange-200': '#ffd9a8',
  'orange-400': '#ffa63d',
  'orange-500': '#ff8a1f',
  'orange-600': '#ec6a00',
  'orange-700': '#c25100',

  'cream-50': '#fffaf0',
  'cream-100': '#fff3dd',
  'cream-200': '#fbe5bf',
  'cream-300': '#f1cf98',

  'cyan-300': '#8ee9ff',
  'cyan-500': '#1ec8f2',
  'cyan-700': '#0a8cc0',

  'blue-500': '#3d7cf5',
  'blue-700': '#1f55c4',

  'green-300': '#9ef07c',
  'green-500': '#3fc944',
  'green-700': '#1f8f2e',

  'pink-300': '#ffa3cd',
  'pink-500': '#ff4fa0',
  'pink-700': '#cc2a77',

  'red-300': '#ff9aa5',
  'red-500': '#f03a4f',
  'red-700': '#b51f35',

  'gold-200': '#fff0a8',
  'gold-400': '#ffd23f',
  'gold-600': '#e0a00c',

  'bronze-300': '#f2b07e',
  'bronze-500': '#d9813f',
  'bronze-700': '#9c5222',

  'silver-100': '#f4f6fa',
  'silver-300': '#cfd6e2',
  'silver-500': '#8f9bb0',

  'platinum-100': '#e2fdff',
  'platinum-300': '#a8eefa',
  'platinum-500': '#4fb9d8',

  'gray-300': '#cbc5db',
  'gray-500': '#8e86a8',
  'gray-700': '#5d5680',

  'brown-500': '#a8673a',
  'brown-700': '#6e3f22',
} as const;

export type PaletteName = keyof typeof PALETTE;

/** Raccourci typé : `c('violet-500')`. */
export const c = (name: PaletteName): string => PALETTE[name];
