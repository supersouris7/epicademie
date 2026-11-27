/**
 * Intention de toucher (survol, appui, focus) : le moment de demander d'avance les données de
 * l'écran suivant. Les demandes répétées sont regroupées par le cache.
 */
export const onIntent = (prepare: () => void) => ({
  onPointerEnter: prepare,
  onPointerDown: prepare,
  onFocus: prepare,
});
