/** Longueur maximale d'une réponse écrite (schéma serveur : 80). */
export const MAX_TEXT = 80;

/** Applique une touche du clavier à la saisie. */
export function typeKey(text: string, key: string, upper: boolean): string {
  if (key === '⌫') return text.slice(0, -1);
  if (text.length >= MAX_TEXT) return text;
  if (key === ' ') return text.endsWith(' ') || !text ? text : `${text} `;
  return text + (upper ? key.toUpperCase() : key);
}
