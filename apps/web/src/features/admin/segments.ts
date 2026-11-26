/** Style du sélecteur segmenté (rubriques et filtres). */
/* Le fond clair visible entre les boutons (1 px) dessine les séparations. */
export const segmentedClass = 'gap-px overflow-hidden rounded-[18px] border border-pilot-line bg-pilot-line';
export const segmentClass = (active: boolean) =>
  `cursor-pointer px-3 py-1.5 text-sm ${active ? 'bg-pilot-acc font-semibold text-pilot-bg' : 'bg-pilot-bg text-pilot-fg hover:bg-pilot-card'}`;
