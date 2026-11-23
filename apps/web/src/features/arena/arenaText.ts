import type { ArenaEvent, ArenaView } from '@questeo/shared';

/** Textes de l'arène, partagés par les téléphones et l'écran TV. */

const nameIn = (arena: ArenaView, id: string | null) => arena.players.find((p) => p.id === id)?.name ?? '?';

/** Ce qui vient de se passer, en une phrase (téléphones et écran TV). */
export function eventText(arena: ArenaView, last: ArenaEvent): string {
  const who = nameIn(arena, last.playerId);
  if (last.correct) return `⚔️ ${who} a trouvé et attaque ${nameIn(arena, last.targetId)} !`;
  return last.timeout ? `⏱ Temps écoulé pour ${who} : −1 cœur.` : `💥 ${who} s’est trompé·e : −1 cœur.`;
}

/** Titre de fin de partie (vu par `me`, ou par l'écran TV si `me` est null). */
export function overTitle(arena: ArenaView, me: string | null): string {
  if (me !== null && arena.winnerId === me) return 'Victoire !';
  return `${nameIn(arena, arena.winnerId)} a gagné !`;
}
