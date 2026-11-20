import { describe, expect, it } from 'vitest';
import { generate, type CheckResult, type Question, type Response } from '@questeo/content';
import { startTraining } from '@questeo/engine';
import type { SessionSummary } from '@questeo/shared';
import {
  answerSound,
  canRetry,
  createTrainingReducer,
  initialTrainingScreen,
  isFirstAttempt,
  type Current,
  type TrainingEvent,
  type TrainingScreen,
} from './state.ts';

/** Réactions fixes du héros : le texte dit le moment. */
const reducer = createTrainingReducer((moment) => ({ text: moment, face: 'joie' }));
const run = (events: readonly TrainingEvent[], from: TrainingScreen) => events.reduce(reducer, from);

const SKILL = 'm5-tables';
const fresh = () => initialTrainingScreen(startTraining([SKILL], new Map(), 4), { text: 'start', face: 'joie' });
const numberQuestion = generate(SKILL, 1, 1);
const choice = (options: number): Question => ({
  ...numberQuestion,
  answer: { kind: 'choice', options: Array.from({ length: options }, (_, i) => `option ${i}`), correct: 0 },
});
const current = (question: Question = numberQuestion, variant = false): Current => ({
  plan: { skillId: SKILL, level: 1, seed: 1, variant },
  question,
  advise: true,
});
/** Partie lancée, une question affichée. */
const playing = (question?: Question, variant?: boolean) =>
  run(
    [
      { type: 'started', sessionId: 's1' },
      { type: 'drawn', current: current(question, variant), lastOne: false },
    ],
    fresh(),
  );
const answer = (result: CheckResult, response: Response = { kind: 'number', text: '42' }, durationMs = 2000) =>
  ({ type: 'answered', result, response, durationMs }) as const;
const ok: CheckResult = { correct: true };
const ko: CheckResult = { correct: false, why: 'Tu as additionné' };

describe('début de partie', () => {
  it('le héros salue, aucune question avant le serveur', () => {
    const s = fresh();
    expect(s).toMatchObject({ sessionId: null, current: null, hero: { text: 'start', nonce: 1 }, xpTotal: 0 });
  });

  it('question tirée : correction, essai et point effacés ; le héros annonce la dernière', () => {
    const dirty = { ...playing(), picked: { x: 1, y: 1 }, answered: { correct: true, xp: 10, streak: 1 } };
    const s = reducer(dirty, { type: 'drawn', current: current(), lastOne: true });
    expect(s).toMatchObject({ answered: null, retry: null, picked: null, hero: { text: 'lastOne' } });
    expect(reducer(dirty, { type: 'drawn', current: current(), lastOne: false }).hero).toEqual(dirty.hero);
  });

  it('serveur injoignable : message d’erreur', () => {
    expect(reducer(fresh(), { type: 'failed', error: 'Hors ligne' }).error).toBe('Hors ligne');
  });
});

describe('réponses', () => {
  it('bonne réponse : XP, série, correction, réponse enregistrée dans la série', () => {
    const s = reducer(playing(), answer(ok));
    expect(s.streak).toBe(1);
    expect(s.xpTotal).toBeGreaterThan(0);
    expect(s.answered).toMatchObject({ correct: true, xp: s.xpTotal, streak: 1 });
    expect(s.training.answers).toHaveLength(1);
    expect(s.hero.text).toBe('correct');
    expect(s.missed).toEqual([]);
  });

  it('3 bonnes réponses d’affilée : le héros s’enflamme', () => {
    const third = run([answer(ok), { type: 'drawn', current: current(), lastOne: false }, answer(ok)], playing());
    const s = reducer({ ...third, answered: null }, answer(ok));
    expect(s.streak).toBe(3);
    expect(s.hero.text).toBe('streak');
  });

  it('1re erreur : 2e essai avec indice (pas de correction), série remise à zéro', () => {
    const s = reducer({ ...playing(), streak: 2, picked: { x: 0, y: 0 } }, answer(ko));
    expect(s).toMatchObject({ answered: null, streak: 0, picked: null, retry: { why: ko.why, nonce: 1 } });
    expect(s.missed).toEqual([{ prompt: numberQuestion.prompt, answer: expect.any(String) as string }]);
    expect(s.training.answers).toEqual([expect.objectContaining({ correct: false })]);
    expect(isFirstAttempt(s)).toBe(false);
  });

  it('QCM : l’option essayée est grisée au 2e essai', () => {
    const s = reducer(playing(choice(4)), answer(ko, { kind: 'choice', index: 2 }));
    expect(s.retry?.excluded).toBe(2);
  });

  it('Vrai / Faux : pas de 2e essai, correction directe', () => {
    expect(canRetry(choice(2))).toBe(false);
    expect(canRetry(choice(3))).toBe(true);
    expect(canRetry(numberQuestion)).toBe(true);
    const s = reducer(playing(choice(2)), answer(ko, { kind: 'choice', index: 1 }));
    expect(s).toMatchObject({ retry: null, answered: { correct: false, xp: 0, streak: 0 } });
  });

  it('2e essai réussi : pas d’XP, pas de question similaire', () => {
    const retrying = reducer(playing(), answer(ko));
    expect(retrying.training.pendingVariant).not.toBeNull();
    const s = reducer(retrying, answer(ok));
    expect(s.answered).toMatchObject({ correct: true, retried: true, xp: 0 });
    expect(s.training.pendingVariant).toBeNull();
    expect(s.xpTotal).toBe(retrying.xpTotal);
    expect(s.training.answers).toHaveLength(1);
    expect(s.hero.text).toBe('retried');
  });

  it('2e essai raté : correction, la question similaire reste prévue', () => {
    const s = run([answer(ko), answer(ko, { kind: 'number', text: '1' })], playing());
    expect(s.answered).toMatchObject({ correct: false, retried: true, given: { kind: 'number', text: '1' } });
    expect(s.training.pendingVariant).not.toBeNull();
  });

  it('réponse ignorée sans question ou une fois la correction affichée', () => {
    const idle = { ...playing(), current: null };
    expect(reducer(idle, answer(ok))).toBe(idle);
    const done = reducer(playing(), answer(ok));
    expect(reducer(done, answer(ko))).toBe(done);
  });

  it('point choisi sur une figure', () => {
    expect(reducer(playing(), { type: 'picked', point: { x: 3, y: 4 } }).picked).toEqual({ x: 3, y: 4 });
  });
});

describe('sons', () => {
  it('juste, faux, et combo toutes les 5 bonnes réponses d’affilée', () => {
    const s = playing();
    expect(answerSound(s, false)).toBe('wrong');
    expect(answerSound(s, true)).toBe('correct');
    expect(answerSound({ ...s, streak: 4 }, true)).toBe('combo');
    expect(answerSound({ ...s, streak: 9 }, true)).toBe('combo');
  });

  it('2e essai : jamais de combo', () => {
    const retrying = { ...reducer(playing(), answer(ko)), streak: 4 };
    expect(answerSound(retrying, true)).toBe('correct');
  });
});

describe('fin de partie', () => {
  it('calcul des résultats puis bilan', () => {
    const summary = { xpGained: 30 } as unknown as SessionSummary;
    const s = run([{ type: 'finishing' }, { type: 'finished', summary }], playing());
    expect(s).toMatchObject({ current: null, summary: { xpGained: 30 } });
  });
});
