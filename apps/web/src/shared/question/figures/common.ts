import type { Figure as FigureSpec } from '@questeo/content';

/** Socle commun des figures : couleurs du thème, nombres à la française, props. */

export const INK = 'var(--text)';
export const MUTED = 'var(--text-muted)';
export const ACCENT = 'var(--accent)';
export const DANGER = 'var(--danger)';
export const PRIMARY = 'var(--primary)';

/** Nombre à la française (virgule, vrai signe moins), 3 décimales au plus. */
export const frNum = (v: number) =>
  String(Math.round(v * 1000) / 1000)
    .replace('.', ',')
    .replace('-', '−');

export interface FigureProps {
  readonly figure: FigureSpec;
  /** Point choisi (quadrillage interactif). */
  readonly picked?: { x: number; y: number } | null;
  readonly onPick?: (p: { x: number; y: number }) => void;
  /** Réponse attendue, affichée pendant la correction. */
  readonly reveal?: { x: number; y: number } | null;
  /** Hauteur maximale de la figure (CSS), pour que tout tienne à l'écran. */
  readonly maxHeight?: string;
}

/** La variante de figure de type K. */
export type Of<K extends FigureSpec['kind']> = Extract<FigureSpec, { kind: K }>;

/** Point du plan (coordonnées de la figure). */
export interface P {
  readonly x: number;
  readonly y: number;
}
