import { useEffect, useState } from 'react';
import type { MapId } from '@epicademie/content';
import type { FondCarte } from './types.ts';

/** Chaque fond est un module à part, chargé à la première carte affichée (les fonds pèsent 20 à 70 ko). */
const LOADERS: Record<MapId, () => Promise<{ readonly fond: FondCarte }>> = {
  'france-regions': () => import('./fonds-france-regions.ts'),
  'france-departements': () => import('./fonds-france-departements.ts'),
  europe: () => import('./fonds-europe.ts'),
  monde: () => import('./fonds-monde.ts'),
};

const cache = new Map<MapId, FondCarte>();

/** Fond de la carte, ou null pendant son chargement. */
export function useFond(map: MapId): FondCarte | null {
  const [loaded, setLoaded] = useState<{ readonly map: MapId; readonly fond: FondCarte } | null>(() => {
    const hit = cache.get(map);
    return hit ? { map, fond: hit } : null;
  });
  useEffect(() => {
    if (cache.has(map)) return;
    let alive = true;
    void LOADERS[map]().then((m) => {
      cache.set(map, m.fond);
      if (alive) setLoaded({ map, fond: m.fond });
    });
    return () => {
      alive = false;
    };
  }, [map]);
  const fond = cache.get(map) ?? null;
  return fond ?? (loaded?.map === map ? loaded.fond : null);
}
