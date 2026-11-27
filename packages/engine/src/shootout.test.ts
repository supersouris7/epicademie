import { describe, expect, it } from 'vitest';
import { DUEL_LIVES } from '@epicademie/shared';
import {
  endShootoutRound,
  nextShootoutRound,
  shoot,
  startShootout,
  stopShootout,
  type Shootout,
  type ShootoutSide,
} from './shootout.ts';

const play = (s: Shootout, by: ShootoutSide, ...answers: boolean[]) =>
  answers.reduce((x, correct) => shoot(x, by, correct), s);
const times = (n: number) => Array.from({ length: n }, () => true);
/** Le joueur gagne la manche en cours en tirant sans relâche. */
const sweep = (s: Shootout, by: ShootoutSide) => play(s, by, ...times(DUEL_LIVES + 1));

describe('duel : tirs et boucliers', () => {
  it('bonne réponse : une vie en moins chez l’autre ; mauvaise réponse : aucune vie perdue', () => {
    const hit = shoot(startShootout(), 0, true);
    expect(hit.fighters.map((f) => f.lives)).toEqual([DUEL_LIVES, DUEL_LIVES - 1]);
    expect(hit.lastShot).toEqual({ n: 1, by: 0, outcome: 'hit' });
    const missed = shoot(hit, 1, false);
    expect(missed.fighters.map((f) => f.lives)).toEqual([DUEL_LIVES, DUEL_LIVES - 1]);
    expect(missed.lastShot).toEqual({ n: 2, by: 1, outcome: 'missed' });
  });

  it('3 bonnes réponses d’affilée : un bouclier, qui arrête le tir suivant reçu puis disparaît', () => {
    const two = play(startShootout(), 0, true, false, true, true);
    expect(two.fighters[0].shield).toBe(false);
    const shielded = shoot(two, 0, true);
    expect(shielded.fighters[0]).toMatchObject({ shield: true, shields: 1 });
    const blocked = shoot(shielded, 1, true);
    expect(blocked.lastShot?.outcome).toBe('blocked');
    expect(blocked.fighters[0]).toMatchObject({ shield: false, lives: DUEL_LIVES });
    expect(blocked.fighters[1]).toMatchObject({ hits: 0, roundHits: 0, correct: 1 });
    expect(shoot(blocked, 1, true).fighters[0].lives).toBe(DUEL_LIVES - 1);
  });

  it('un seul bouclier à la fois', () => {
    // L’adversaire arrête le premier tir : la manche dure assez pour une seconde série de 3.
    const s = play(play(startShootout(), 1, true, true, true), 0, ...times(6));
    expect(s.fighters[0]).toMatchObject({ shield: true, shields: 1, correct: 6, streak: 0 });
  });
});

describe('duel : manches', () => {
  it('plus de vie : manche gagnée, plus aucun tir ; la suivante repart à neuf', () => {
    const s = sweep(startShootout(), 0);
    expect(s).toMatchObject({ phase: 'round-over', roundWinner: 0, winner: null, round: 1 });
    expect(shoot(s, 1, true)).toBe(s);
    const next = nextShootoutRound(s);
    expect(next).toMatchObject({ phase: 'playing', round: 2, roundWinner: null });
    expect(next.fighters[1]).toMatchObject({ lives: DUEL_LIVES, shield: false, roundsWon: 0 });
    expect(next.fighters[0]).toMatchObject({ roundsWon: 1, roundHits: 0, hits: DUEL_LIVES, correct: DUEL_LIVES });
  });

  it('temps écoulé : le plus de vies', () => {
    expect(endShootoutRound(shoot(startShootout(), 1, true)).roundWinner).toBe(1);
  });

  it('temps écoulé à vies égales : le plus de tirs réussis de la manche', () => {
    const base = startShootout();
    const [a, b] = base.fighters;
    const s = endShootoutRound({ ...base, fighters: [{ ...a, roundHits: 1 }, b] });
    expect(s.roundWinner).toBe(0);
  });

  it('égalité parfaite : la manche compte pour les deux', () => {
    const s = endShootoutRound(startShootout());
    expect(s).toMatchObject({ phase: 'round-over', roundWinner: 'both' });
    expect(s.fighters.map((f) => f.roundsWon)).toEqual([1, 1]);
  });

  it('match en 2 manches gagnantes', () => {
    const first = nextShootoutRound(sweep(startShootout(), 1));
    const second = sweep(first, 1);
    expect(second).toMatchObject({ phase: 'over', winner: 1 });
    expect(nextShootoutRound(second)).toBe(second);
    expect(endShootoutRound(second)).toBe(second);
  });

  it('une manche partout puis égalité : match nul ; une manche d’avance puis égalité : gagné', () => {
    const even = nextShootoutRound(sweep(nextShootoutRound(sweep(startShootout(), 0)), 1));
    expect(endShootoutRound(even)).toMatchObject({ phase: 'over', winner: null });
    const ahead = nextShootoutRound(sweep(startShootout(), 0));
    expect(endShootoutRound(ahead)).toMatchObject({ phase: 'over', winner: 0 });
  });

  it('arrêt au départ d’un joueur : aucun vainqueur, bilan conservé', () => {
    const s = stopShootout(sweep(startShootout(), 0));
    expect(s).toMatchObject({ phase: 'over', winner: null, roundWinner: null });
    expect(s.fighters[0].hits).toBe(DUEL_LIVES);
  });
});
