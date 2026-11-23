/**
 * Orientation des images d'adversaires (ticket 46) : sens dans lequel le personnage est DESSINÉ.
 * Règle : dans l'arène, l'adversaire regarde le héros (à gauche) ; dans le HUD et les bulles, son visage
 * regarde vers le centre de l'écran (à gauche s'il est posé à droite, à droite s'il est posé à gauche).
 * Une image de face (« front ») convient partout ; une image tournée du mauvais côté est retournée en CSS.
 * Constat fait en regardant les planches : poses, têtes et portrait du Sorcier π, ainsi que le π-bot,
 * sont tournés vers la gauche ; l'animation d'attente du Sorcier π et l'Empereur sont de face.
 */
export type Facing = 'left' | 'right' | 'front';

/** Sens de dessin par famille d'images (préfixe d'identifiant d'asset), le plus long préfixe gagne. */
export const SOURCE_FACING: Readonly<Record<string, Facing>> = {
  'bosses-sorcier-pi-pose-': 'left',
  'bosses-sorcier-pi-head-': 'left',
  'bosses-sorcier-pi-portrait': 'left',
  'bosses-sorcier-pi-anim-idle': 'front',
  'bosses-empereur-': 'front',
  'bosses-minions-pi-bot': 'left',
};

/** Sens de dessin d'une image ; « front » pour un boss pas encore dessiné (cadre provisoire). */
export function facingOf(assetId: string): Facing {
  let best: Facing = 'front';
  let len = -1;
  for (const [prefix, facing] of Object.entries(SOURCE_FACING)) {
    if (assetId.startsWith(prefix) && prefix.length > len) {
      best = facing;
      len = prefix.length;
    }
  }
  return best;
}

/** Faut-il retourner l'image pour qu'elle regarde du côté voulu ? */
export const mustFlip = (assetId: string, wanted: 'left' | 'right'): boolean => {
  const f = facingOf(assetId);
  return f !== 'front' && f !== wanted;
};

/** Côté vers lequel regarde l'image une fois la règle appliquée. */
export const shownFacing = (assetId: string, wanted: 'left' | 'right'): Facing =>
  mustFlip(assetId, wanted) ? wanted : facingOf(assetId);
