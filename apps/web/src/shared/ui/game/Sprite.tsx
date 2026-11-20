import type { CSSProperties } from 'react';
import { useReducedMotion } from 'motion/react';
import { SPRITE_ANIMS } from '../../../design/sprites.generated.ts';
import { assetSrc } from '../../../design/assets.ts';

interface SpriteProps {
  /** Chemin de la bande, relatif à /assets et sans extension (ex. characters/alex/anim-idle). */
  readonly anim: string;
  /** Hauteur (pixels ou valeur CSS, ex. « 100% ») ; la largeur suit les proportions d'une image. */
  readonly height: number | string;
  /** Images par seconde. */
  readonly fps?: number;
  /** Sous-partie de la bande : [première image, nombre d'images] (ex. le boss calme ou en rage). */
  readonly range?: readonly [number, number];
  readonly flip?: boolean;
  /** Joue une seule fois puis reste sur la dernière image (victoire). */
  readonly once?: boolean;
}

/**
 * Animation dessinée image par image : une bande de N images jouée en boucle par `steps()` (aucune
 * interpolation entre deux images). « Réduire les animations » : première image, immobile.
 */
export function Sprite({ anim, height, fps = 8, range, flip = false, once = false }: SpriteProps) {
  const reduce = useReducedMotion();
  const meta = SPRITE_ANIMS[anim];
  const src = assetSrc(anim.replace(/\//g, '-'));
  if (!meta || !src) return null;
  const [start, count] = range ?? [0, meta.frames];
  const at = (i: number) => `${(i / Math.max(1, meta.frames - 1)) * 100}%`;
  const style: CSSProperties & Record<'--sprite-from' | '--sprite-to', string> = {
    height,
    aspectRatio: `${meta.width} / ${meta.height}`,
    backgroundImage: `url(${src})`,
    backgroundSize: `${meta.frames * 100}% 100%`,
    backgroundRepeat: 'no-repeat',
    backgroundPositionX: at(start),
    transform: flip ? 'scaleX(-1)' : undefined,
    '--sprite-from': at(start),
    '--sprite-to': at(start + count - 1),
    animation:
      reduce || count < 2
        ? undefined
        : `af-sprite ${count / fps}s steps(${count}, jump-none) ${once ? '1 forwards' : 'infinite'}`,
  };
  return <div role="presentation" aria-hidden style={style} data-sprite={anim} />;
}
