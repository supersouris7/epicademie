import { describe, expect, it } from 'vitest';
import type { ArenaPlayer } from '@questeo/shared';
import { answerQuiz, leaveQuiz, startQuiz, timeoutQuiz } from './quiz.ts';

const player = (id: string): ArenaPlayer => ({ id, name: id, hero: 'alex', hearts: 0, ready: true });

describe('quiz plateau', () => {
  it('la 1re bonne réponse gagne la manche ; une erreur bloque le joueur pour la manche', () => {
    let s = startQuiz([player('a'), player('b'), player('c')]);
    s = answerQuiz(s, 'a', false);
    expect(s.quiz.locked).toEqual(['a']);
    expect(answerQuiz(s, 'a', true)).toBe(s); // bloqué
    s = answerQuiz(s, 'b', true);
    expect(s.quiz).toMatchObject({ round: 2, locked: [], scores: { a: 0, b: 1, c: 0 } });
  });

  it('tout le monde se trompe, ou temps écoulé : manche suivante sans point', () => {
    let s = startQuiz([player('a'), player('b')]);
    s = answerQuiz(answerQuiz(s, 'a', false), 'b', false);
    expect(s.quiz.round).toBe(2);
    s = timeoutQuiz(s);
    expect(s.quiz).toMatchObject({ round: 3, scores: { a: 0, b: 0 } });
  });

  it('après 10 manches, le meilleur score gagne ; un départ à deux termine la partie', () => {
    let s = startQuiz([player('a'), player('b')]);
    for (let i = 0; i < 10; i++) s = answerQuiz(s, i < 6 ? 'b' : 'a', true);
    expect(s).toMatchObject({ over: true, winnerId: 'b' });
    expect(leaveQuiz(startQuiz([player('a'), player('b')]), 'a').over).toBe(true);
  });
});
