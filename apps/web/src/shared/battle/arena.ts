import { useEffect, useState, type RefObject } from 'react';
import { ARENA_VARIANTS, assetSrc } from '../../design/assets.ts';

export interface ArenaPick {
  readonly src: string;
  /** Proportions (largeur / hauteur) de l'image choisie. */
  readonly ratio: number;
}

/**
 * Variante d'arène la plus proche des proportions du cadre (écart mesuré en rapport, pas en
 * différence : 0,75 et 1,5 sont aussi loin de 1,06). Seules les variantes livrées comptent ;
 * sans aucune, `null` (dégradé de remplacement).
 */
export function pickArenaVariant(
  arena: string,
  ratio: number,
  has: (id: string) => string | null = assetSrc,
): ArenaPick | null {
  let best: ArenaPick | null = null;
  let gap = Infinity;
  for (const v of ARENA_VARIANTS) {
    const src = has(`environments-arenas-${arena}${v.suffix}`);
    const d = Math.abs(Math.log(ratio / v.ratio));
    if (src && d < gap) [best, gap] = [{ src, ratio: v.ratio }, d];
  }
  return best;
}

export const pickArena = (arena: string, ratio: number, has?: (id: string) => string | null): string | null =>
  pickArenaVariant(arena, ratio, has)?.src ?? null;

/**
 * Au-delà de la plus large variante, l'image garde ses proportions (largeur limitée, centrée) et le
 * reste du cadre est comblé par un fond d'ambiance flouté de la même image : jamais d'étirement.
 */
export const isExtended = (frameRatio: number, imageRatio: number): boolean =>
  imageRatio >= Math.max(...ARENA_VARIANTS.map((v) => v.ratio)) && frameRatio > imageRatio * 1.02;

/** Largeur maximale de la scène (combattants) en multiple de la hauteur du cadre : ils restent groupés. */
export const STAGE_MAX_RATIO = 3.4;

export interface ArenaImage extends ArenaPick {
  readonly extended: boolean;
}

/** Image de l'arène adaptée au cadre `ref`, recalculée quand il change de taille (rotation…). */
export function useArenaImage(ref: RefObject<HTMLElement | null>, arena: string): ArenaImage | null {
  const [ratio, setRatio] = useState(16 / 9);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e?.contentRect ?? { width: 0, height: 0 };
      if (width > 0 && height > 0) setRatio(width / height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  const pick = pickArenaVariant(arena, ratio);
  return pick && { ...pick, extended: isExtended(ratio, pick.ratio) };
}
