/**
 * Habillage des cadres et boutons par une image étirable en 9 parts (border-image), quand elle est livrée.
 * Tant que l'image n'existe pas, les composants gardent leur rendu CSS équivalent (mêmes tokens).
 */
import type { CSSProperties } from 'react';
import { AVAILABLE } from './assets.available.ts';

const available = new Set<string>(AVAILABLE);

/**
 * Style border-image pour `file` (relatif à public/assets), ou undefined si l'image n'est pas encore livrée.
 * `slice` : part de l'image réservée aux coins (en %) ; `width` : épaisseur affichée des bords.
 */
export function skinStyle(file: string, slice = 28, width = '1.25rem'): CSSProperties | undefined {
  if (!available.has(file)) return undefined;
  return {
    borderStyle: 'solid',
    borderWidth: width,
    borderColor: 'transparent',
    borderImage: `url(/assets/${file}) ${slice}% fill / ${width} / 0 stretch`,
    background: 'none',
    boxShadow: 'none',
  };
}
