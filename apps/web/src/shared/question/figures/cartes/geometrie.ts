import type { FondCarte, VueCarte } from './types.ts';

/** Cadre visible : tout le fond, ou une fenêtre centrée sur (cx, cy) quand on zoome. */
export function viewBoxOf(fond: FondCarte, view?: VueCarte): string {
  const z = view?.zoom ?? 1;
  const w = fond.w / z;
  const h = fond.h / z;
  const x = Math.min(Math.max((view?.cx ?? fond.w / 2) - w / 2, 0), fond.w - w);
  const y = Math.min(Math.max((view?.cy ?? fond.h / 2) - h / 2, 0), fond.h - h);
  return `${Math.round(x)} ${Math.round(y)} ${Math.round(w)} ${Math.round(h)}`;
}

/** Zone voisine dans la direction des flèches : la plus proche, en pénalisant l'écart latéral. */
export function neighbour(fond: FondCarte, from: string, dir: readonly [number, number]): string | null {
  const here = fond.zones.find((z) => z.id === from);
  if (!here) return null;
  let best: { id: string; score: number } | null = null;
  for (const z of fond.zones) {
    if (z.id === from) continue;
    const dx = z.c[0] - here.c[0];
    const dy = z.c[1] - here.c[1];
    const along = dx * dir[0] + dy * dir[1];
    if (along <= 0) continue;
    const score = along + 2 * Math.abs(dx * dir[1] - dy * dir[0]);
    if (!best || score < best.score) best = { id: z.id, score };
  }
  return best?.id ?? null;
}
