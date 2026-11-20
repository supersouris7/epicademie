import { useEffect, useState, type RefObject } from 'react';
import { ARENA_VARIANTS, assetSrc } from '../../design/assets.ts';

/**
 * Variante d'arène la plus proche des proportions du cadre (écart mesuré en rapport, pas en
 * différence : 0,75 et 1,5 sont aussi loin de 1,06). Seules les variantes livrées comptent ;
 * sans aucune, `null` (dégradé de remplacement).
 */
export function pickArena(arena: string, ratio: number, has: (id: string) => string | null = assetSrc): string | null {
  let best: string | null = null;
  let gap = Infinity;
  for (const v of ARENA_VARIANTS) {
    const src = has(`environments-arenas-${arena}${v.suffix}`);
    const d = Math.abs(Math.log(ratio / v.ratio));
    if (src && d < gap) [best, gap] = [src, d];
  }
  return best;
}

/** Image de l'arène adaptée au cadre `ref`, recalculée quand il change de taille (rotation…). */
export function useArenaImage(ref: RefObject<HTMLElement | null>, arena: string): string | null {
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
  return pickArena(arena, ratio);
}
