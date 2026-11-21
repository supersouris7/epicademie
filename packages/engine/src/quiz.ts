import { QUIZ_ROUNDS, type ArenaEvent, type ArenaPlayer, type QuizStatus } from '@questeo/shared';
import type { ArenaState } from './arena.ts';

/**
 * Quiz plateau (docs/adr/0027-quiz-plateau.md) : tous les joueurs répondent en même temps à la
 * même question, sur leur téléphone ; la 1re bonne réponse gagne la manche (1 point). Une mauvaise
 * réponse bloque le joueur pour cette manche. La manche se termine à la 1re bonne réponse, quand
 * tout le monde s'est trompé, ou au temps écoulé. Après QUIZ_ROUNDS manches, le meilleur score
 * gagne (égalité : pas de gagnant unique, le 1er dans l'ordre est affiché).
 */
export interface QuizState extends ArenaState {
  readonly quiz: QuizStatus;
}

export function startQuiz(players: readonly ArenaPlayer[]): QuizState {
  const ready = players.filter((p) => p.ready).map((p) => ({ ...p, hearts: 1 }));
  if (ready.length < 2) throw new Error('Il faut au moins 2 joueurs');
  return {
    players: ready,
    current: 0,
    turn: 0,
    over: false,
    winnerId: null,
    last: null,
    quiz: { round: 1, rounds: QUIZ_ROUNDS, scores: Object.fromEntries(ready.map((p) => [p.id, 0])), locked: [] },
  };
}

const inGame = (p: ArenaPlayer) => p.hearts > 0;

/** Manche suivante, ou fin de partie après la dernière. */
function nextRound(s: QuizState, last: ArenaEvent): QuizState {
  const round = s.quiz.round + 1;
  const turn = s.turn + 1;
  if (round > s.quiz.rounds || s.players.filter(inGame).length < 2) {
    const best = [...s.players].sort((a, b) => (s.quiz.scores[b.id] ?? 0) - (s.quiz.scores[a.id] ?? 0))[0];
    return { ...s, turn, over: true, winnerId: best?.id ?? null, last, quiz: { ...s.quiz, locked: [] } };
  }
  return { ...s, turn, last, quiz: { ...s.quiz, round, locked: [] } };
}

/** Réponse d'un joueur : bonne → point et manche suivante ; fausse → bloqué pour la manche. */
export function answerQuiz(s: QuizState, playerId: string, correct: boolean): QuizState {
  const player = s.players.find((p) => p.id === playerId);
  if (s.over || !player || !inGame(player) || s.quiz.locked.includes(playerId)) return s;
  if (correct) {
    const scores = { ...s.quiz.scores, [playerId]: (s.quiz.scores[playerId] ?? 0) + 1 };
    return nextRound(
      { ...s, quiz: { ...s.quiz, scores } },
      { playerId, correct: true, targetId: null, timeout: false },
    );
  }
  const locked = [...s.quiz.locked, playerId];
  const next = { ...s, quiz: { ...s.quiz, locked } };
  // Tout le monde s'est trompé : manche perdue pour tous.
  if (s.players.filter(inGame).every((p) => locked.includes(p.id))) {
    return nextRound(next, { playerId, correct: false, targetId: null, timeout: false });
  }
  return { ...next, last: { playerId, correct: false, targetId: null, timeout: false } };
}

/** Temps écoulé : personne ne marque, manche suivante. */
export const timeoutQuiz = (s: QuizState): QuizState =>
  s.over ? s : nextRound(s, { playerId: '', correct: false, targetId: null, timeout: true });

/** Un joueur part : il sort du jeu ; la partie continue s'il reste au moins 2 joueurs. */
export function leaveQuiz(s: QuizState, playerId: string): QuizState {
  const players = s.players.map((p) => (p.id === playerId ? { ...p, hearts: 0 } : p));
  const next = { ...s, players };
  return players.filter(inGame).length < 2
    ? nextRound(
        { ...next, quiz: { ...next.quiz, round: next.quiz.rounds } },
        { playerId, correct: false, targetId: null, timeout: false },
      )
    : next;
}

export const isQuiz = (s: ArenaState): s is QuizState => 'quiz' in s;
