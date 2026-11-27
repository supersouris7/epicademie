import { DUEL_LIVES, DUEL_ROUNDS_TO_WIN, DUEL_SHIELD_STREAK, type DuelShot } from '@epicademie/shared';

/**
 * Duel à distance (docs/adr/0040-duel-et-quiz-tv.md) : les deux joueurs répondent en même temps.
 * Bonne réponse : tir immédiat, qui retire une vie à l'autre sauf si son bouclier l'arrête ;
 * mauvaise réponse ou temps écoulé : tir dévié, sans perte de vie. Plusieurs bonnes réponses
 * d'affilée donnent un bouclier (un seul à la fois). La manche finit quand un joueur n'a plus de
 * vie ou quand son temps est écoulé ; la première série de manches gagnantes termine le match.
 * Règles pures : ni minuteur ni réseau (la durée d'une manche est mesurée par le serveur).
 */

/** Indice d'un joueur du duel. */
export type ShootoutSide = 0 | 1;

export interface ShootoutFighter {
  readonly lives: number;
  readonly shield: boolean;
  /** Bonnes réponses d'affilée depuis le dernier bouclier gagné (ou la dernière erreur). */
  readonly streak: number;
  readonly roundsWon: number;
  /** Tirs réussis de la manche en cours (départage au temps). */
  readonly roundHits: number;
  /** Bilan du match : tirs réussis, boucliers gagnés, bonnes réponses. */
  readonly hits: number;
  readonly shields: number;
  readonly correct: number;
}

export interface Shootout {
  readonly fighters: readonly [ShootoutFighter, ShootoutFighter];
  /** Numéro de la manche, à partir de 1. */
  readonly round: number;
  readonly phase: 'playing' | 'round-over' | 'over';
  /** Gagnant de la manche terminée (`both` : égalité parfaite, la manche compte pour les deux). */
  readonly roundWinner: ShootoutSide | 'both' | null;
  /** Vainqueur du match ; null tant qu'il n'est pas fini, en cas d'égalité ou d'arrêt. */
  readonly winner: ShootoutSide | null;
  readonly lastShot: {
    readonly n: number;
    readonly by: ShootoutSide;
    readonly outcome: DuelShot['outcome'];
  } | null;
}

const fresh: ShootoutFighter = {
  lives: DUEL_LIVES,
  shield: false,
  streak: 0,
  roundsWon: 0,
  roundHits: 0,
  hits: 0,
  shields: 0,
  correct: 0,
};

export const startShootout = (): Shootout => ({
  fighters: [fresh, fresh],
  round: 1,
  phase: 'playing',
  roundWinner: null,
  winner: null,
  lastShot: null,
});

const other = (side: ShootoutSide): ShootoutSide => (side === 0 ? 1 : 0);

const pair = (side: ShootoutSide, mine: ShootoutFighter, theirs: ShootoutFighter): Shootout['fighters'] =>
  side === 0 ? [mine, theirs] : [theirs, mine];

/** Bonne réponse du tireur : sa série avance, et un bouclier arrive au bout. */
function reward(f: ShootoutFighter): ShootoutFighter {
  const streak = f.streak + 1;
  const full = streak >= DUEL_SHIELD_STREAK;
  return {
    ...f,
    correct: f.correct + 1,
    streak: full ? 0 : streak,
    shield: f.shield || full,
    shields: f.shields + (full && !f.shield ? 1 : 0),
  };
}

/** Meilleur des deux : le plus de vies, puis le plus de tirs réussis de la manche. */
function leader([a, b]: Shootout['fighters']): ShootoutSide | 'both' {
  const gap = a.lives - b.lives || a.roundHits - b.roundHits;
  if (gap === 0) return 'both';
  return gap > 0 ? 0 : 1;
}

/** Fin de la manche (plus de vie, ou temps écoulé), et du match si assez de manches sont gagnées. */
export function endShootoutRound(s: Shootout): Shootout {
  if (s.phase !== 'playing') return s;
  const roundWinner = leader(s.fighters);
  const won = (f: ShootoutFighter, side: ShootoutSide) =>
    roundWinner === side || roundWinner === 'both' ? { ...f, roundsWon: f.roundsWon + 1 } : f;
  const fighters: Shootout['fighters'] = [won(s.fighters[0], 0), won(s.fighters[1], 1)];
  const [a, b] = fighters;
  const over = Math.max(a.roundsWon, b.roundsWon) >= DUEL_ROUNDS_TO_WIN;
  let winner: ShootoutSide | null = null;
  if (over && a.roundsWon !== b.roundsWon) winner = a.roundsWon > b.roundsWon ? 0 : 1;
  return { ...s, fighters, roundWinner, winner, phase: over ? 'over' : 'round-over' };
}

/** Réponse d'un joueur, corrigée par l'appelant (temps écoulé : `correct` faux). */
export function shoot(s: Shootout, by: ShootoutSide, correct: boolean): Shootout {
  if (s.phase !== 'playing') return s;
  let shooter = s.fighters[by];
  let target = s.fighters[other(by)];
  let outcome: DuelShot['outcome'] = 'missed';
  if (!correct) shooter = { ...shooter, streak: 0 };
  else {
    shooter = reward(shooter);
    if (target.shield) {
      outcome = 'blocked';
      target = { ...target, shield: false };
    } else {
      outcome = 'hit';
      target = { ...target, lives: target.lives - 1 };
      shooter = { ...shooter, hits: shooter.hits + 1, roundHits: shooter.roundHits + 1 };
    }
  }
  const next: Shootout = {
    ...s,
    fighters: pair(by, shooter, target),
    lastShot: { n: (s.lastShot?.n ?? 0) + 1, by, outcome },
  };
  return target.lives > 0 ? next : endShootoutRound(next);
}

/** Manche suivante : vies, boucliers et séries repartent de zéro ; le bilan est conservé. */
export function nextShootoutRound(s: Shootout): Shootout {
  if (s.phase !== 'round-over') return s;
  const reset = (f: ShootoutFighter): ShootoutFighter => ({
    ...f,
    lives: DUEL_LIVES,
    shield: false,
    streak: 0,
    roundHits: 0,
  });
  return {
    ...s,
    fighters: [reset(s.fighters[0]), reset(s.fighters[1])],
    round: s.round + 1,
    phase: 'playing',
    roundWinner: null,
  };
}

/** Un joueur est parti : le match s'arrête là, sans vainqueur. */
export const stopShootout = (s: Shootout): Shootout => ({ ...s, phase: 'over', roundWinner: null, winner: null });
