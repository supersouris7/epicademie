import { assetSrc } from '../../../design/assets.ts';

/**
 * Décor de fond des menus (château-académie) une fois livré ; sinon le motif à pois du thème reste visible.
 * Un voile aux couleurs du thème garde les textes lisibles.
 */
export function GameBackdrop({ id = 'environments-backgrounds-accueil' }: { readonly id?: string }) {
  const src = assetSrc(id);
  if (!src) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <img src={src} alt="" className="h-full w-full object-cover" decoding="async" />
      <div className="bg-bg/55 absolute inset-0" />
    </div>
  );
}
