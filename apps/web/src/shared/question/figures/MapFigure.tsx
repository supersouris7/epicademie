import { MAP_CREDIT } from '@epicademie/content';
import { Carte } from './cartes/Carte.tsx';
import { useFond } from './cartes/useFond.ts';
import { type Of } from './common.ts';

/** Carte à regarder : zones surlignées et repères ; le fond est chargé à la demande. */
export function MapFigure({ f }: { f: Of<'map'> }) {
  const fond = useFond(f.map);
  return (
    <figure className="text-left">
      {fond ? (
        <Carte map={f.map} fond={fond} highlight={f.highlight} marks={f.marks} />
      ) : (
        <p role="status" className="text-muted py-8 text-center font-bold">
          Chargement de la carte…
        </p>
      )}
      <figcaption className="text-muted mt-2 text-xs italic">{MAP_CREDIT[f.map]}</figcaption>
    </figure>
  );
}
