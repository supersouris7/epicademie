import type { CM } from './outils.ts';
import { chapterOf, skillsOf } from '../kit.ts';

/** Réglages et outils propres à la classe (CM1 ou CM2), partagés par tous les chapitres. */
export function contexte(g: CM) {
  const S = skillsOf(g);
  const C = chapterOf(g);
  const cm2 = g === 'cm2';
  const id = (x: string) => `m${g}-${x}`;
  const decs = cm2 ? 3 : 2;
  return { g, S, C, cm2, id, decs };
}

export type Contexte = ReturnType<typeof contexte>;
