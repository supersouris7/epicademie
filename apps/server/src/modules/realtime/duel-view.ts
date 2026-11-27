import type { Shootout, ShootoutSide } from '@epicademie/engine';
import {
  DUEL_LIVES,
  type DuelFighter,
  type DuelQuestion,
  type DuelSide,
  type DuelView,
  type Profile,
  type SubjectId,
} from '@epicademie/shared';

/**
 * État d'un Duel en mémoire et vue envoyée à chaque joueur (docs/adr/0040) : chacun voit sa
 * question et son bilan, jamais ceux de l'adversaire.
 */
export interface DuelPlayer {
  readonly profile: Profile;
  /** Sa famille : elle décide des chapitres joués. */
  readonly familyId: string;
  /** Notions de sa classe (remplies au lancement). */
  pool: readonly string[];
  /** Numéro de sa question en cours. */
  seq: number;
  question: DuelQuestion | null;
  timer?: NodeJS.Timeout;
  /** Déconnecté : délai avant qu'il quitte le duel. */
  away?: NodeJS.Timeout;
  /** Parti : il ne reçoit plus rien. */
  gone: boolean;
  rematch: boolean;
}

export interface Duel {
  readonly id: string;
  readonly subject: SubjectId;
  /** Le joueur qui défie, puis l'invité. */
  readonly players: readonly [DuelPlayer, DuelPlayer];
  /** Null tant que la partie n'a pas commencé (invitation en attente). */
  game: Shootout | null;
  /** Invitation acceptée : les questions se préparent. */
  starting: boolean;
  /** Fin de la manche ou de la pause. */
  deadline: number | null;
  /** Expiration de l'invitation, manche, pause ou effacement, selon le moment. */
  timer?: NodeJS.Timeout;
  end: DuelView['end'];
  rematchDeadline: number | null;
}

export const duelPlayer = (profile: Profile, familyId: string): DuelPlayer => ({
  profile,
  familyId,
  pool: [],
  seq: 0,
  question: null,
  gone: false,
  rematch: false,
});

function fighterView(d: Duel, side: ShootoutSide): DuelFighter {
  const p = d.players[side];
  const f = d.game?.fighters[side];
  return {
    id: p.profile.id,
    name: p.profile.name,
    hero: p.profile.hero,
    lives: f?.lives ?? DUEL_LIVES,
    shield: f?.shield ?? false,
    roundsWon: f?.roundsWon ?? 0,
    away: p.gone || p.away !== undefined,
  };
}

/** Le même camp, vu par ce joueur. */
const seenBy = (me: ShootoutSide, side: ShootoutSide): DuelSide => (side === me ? 'you' : 'opponent');

function outcomeView(game: Shootout | null, me: ShootoutSide) {
  const shot = game?.lastShot;
  const round = game?.roundWinner ?? null;
  const winner = game?.winner ?? null;
  return {
    lastShot: shot ? { ...shot, by: seenBy(me, shot.by) } : null,
    roundWinner: round === null || round === 'both' ? round : seenBy(me, round),
    winner: winner === null ? null : seenBy(me, winner),
  };
}

function summaryView(game: Shootout | null, me: ShootoutSide) {
  if (game?.phase !== 'over') return null;
  const { hits, shields, correct } = game.fighters[me];
  return { hits, shields, correct };
}

function rematchView(d: Duel, me: ShootoutSide) {
  if (d.rematchDeadline === null) return null;
  const them = me === 0 ? 1 : 0;
  return { deadline: d.rematchDeadline, you: d.players[me].rematch, opponent: d.players[them].rematch };
}

export function duelView(d: Duel, me: ShootoutSide): DuelView {
  return {
    id: d.id,
    subject: d.subject,
    phase: d.game?.phase ?? 'lobby',
    you: fighterView(d, me),
    opponent: fighterView(d, me === 0 ? 1 : 0),
    round: d.game?.round ?? 1,
    deadline: d.deadline,
    question: d.players[me].question,
    ...outcomeView(d.game, me),
    end: d.end,
    summary: summaryView(d.game, me),
    rematch: rematchView(d, me),
  };
}
