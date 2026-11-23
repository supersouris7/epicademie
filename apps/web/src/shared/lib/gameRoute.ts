/** Écrans de jeu (parties, combats de boss, défis, arène) : le drapeau s'y fait discret. */
export const isGameRoute = (pathname: string): boolean =>
  pathname.startsWith('/partie/') || pathname.startsWith('/arene');
