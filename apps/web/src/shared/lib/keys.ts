/**
 * Clavier physique des parties (pavé, calculatrice, clavier de lettres) : les touches ne vont au
 * jeu que si l'enfant n'écrit pas ailleurs. Ignorées quand le focus est dans un champ de saisie
 * (texte, zone de texte, liste, contenu modifiable) ou qu'une boîte de dialogue modale est ouverte
 * (signalement, mot de passe parent, pause…).
 */
export function keyIsForGame(e: KeyboardEvent): boolean {
  const t = e.target;
  if (
    t instanceof HTMLInputElement ||
    t instanceof HTMLTextAreaElement ||
    t instanceof HTMLSelectElement ||
    (t instanceof HTMLElement && t.isContentEditable)
  ) {
    return false;
  }
  return document.querySelector('[aria-modal="true"]') === null;
}
