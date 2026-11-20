import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { check, getChapter, getSkill, type Response } from '@questeo/content';
import {
  isFinished,
  nextQuestion,
  regularCount,
  seriesLength,
  startTraining,
  type SkillState,
  type TrainingState,
} from '@questeo/engine';
import type { Profile } from '@questeo/shared';
import { finishSession, markConfused, skillsKey, startSession, submitAnswer } from './api.ts';
import { localToday, randomSeed } from '../../shared/lib/dates.ts';
import { heroSays } from '../../shared/lib/dialogue.ts';
import { freshQuestion, recentPrompts, rememberPrompt } from '../../shared/lib/recent.ts';
import { playSound, preloadSounds, setSoundEnabled } from '../../shared/lib/sound.ts';
import {
  answerSound,
  createTrainingReducer,
  initialTrainingScreen,
  isFirstAttempt,
  type TrainingScreen,
} from './state.ts';

/**
 * Déroulé d'une partie d'entraînement : démarrage côté serveur, tirage des questions (sans
 * doublon), envoi des réponses, fin de partie. Les règles de l'écran sont dans `state.ts`.
 */

/** Graines des générateurs : entiers positifs bornés (contrat de l'API). */
const nextSeed = () => randomSeed() % 2_000_000_000;

export interface TrainingSetup {
  readonly profile: Profile;
  readonly chapterId: string;
  /** Notions de la série (une seule, ou tout le chapitre). */
  readonly skills: readonly string[];
  /** Progression du joueur par notion (niveau de départ, notions à revoir). */
  readonly states: ReadonlyMap<string, SkillState>;
}

export function useTraining({ profile, chapterId, skills, states }: TrainingSetup, notify: (message: string) => void) {
  const qc = useQueryClient();
  const chapter = getChapter(chapterId);
  const today = localToday();
  const reducer = useMemo(() => createTrainingReducer((moment) => heroSays(profile.hero, moment)), [profile.hero]);
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    initialTrainingScreen(
      startTraining([...skills], states, seriesLength(skills.every((id) => getSkill(id)?.mental === true))),
      heroSays(profile.hero, 'start'),
    ),
  );
  // Dernier état affiché, lu par les actions (qui suivent un rendu).
  const latest = useRef<TrainingScreen>(state);
  useLayoutEffect(() => {
    latest.current = state;
  }, [state]);
  /** Réponses en cours d'envoi : la fin de partie les attend. */
  const pending = useRef<Promise<unknown>[]>([]);
  const started = useRef(false);
  /** Garde contre le double appui sur « Suivant » pendant la transition. */
  const advancing = useRef(false);
  /** Moment où la question en cours est apparue (temps de réponse, bonus de vitesse). */
  const shownAt = useRef(0);
  /** Énoncés déjà posés dans la partie : jamais deux fois le même. */
  const seen = useRef(new Set<string>());
  /** Notions déjà conseillées (outil de Questy) et déjà signalées « pas compris ». */
  const advised = useRef(new Set<string>());
  const confusedSent = useRef(new Set<string>());

  useEffect(() => {
    setSoundEnabled(profile.soundOn);
    preloadSounds();
  }, [profile.soundOn]);

  /** Tire la question suivante de la série (énoncé jamais vu dans la partie). */
  const draw = useCallback(
    (t: TrainingState) => {
      const planned = nextQuestion(t, states, today, Math.random(), nextSeed());
      const { question, seed } = freshQuestion(
        planned,
        { seen: seen.current, recent: recentPrompts(profile.id, planned.skillId) },
        nextSeed,
      );
      const plan = { ...planned, seed };
      seen.current.add(question.prompt);
      rememberPrompt(profile.id, plan.skillId, question.prompt);
      const advise = !advised.current.has(plan.skillId);
      advised.current.add(plan.skillId);
      shownAt.current = performance.now();
      dispatch({
        type: 'drawn',
        current: { plan, question, advise },
        lastOne: !plan.variant && regularCount(t) === t.length - 1,
      });
    },
    [states, today, profile.id],
  );

  // Démarrage (une seule fois, même en StrictMode).
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    startSession({
      profileId: profile.id,
      mode: 'entrainement',
      subject: chapter?.subject ?? 'maths',
      chapterId,
      skillId: skills.length === 1 ? (skills[0] ?? null) : null,
    })
      .then(({ id }) => {
        dispatch({ type: 'started', sessionId: id });
        draw(latest.current.training);
      })
      .catch(() =>
        dispatch({ type: 'failed', error: 'Impossible de démarrer la partie. Le serveur est-il joignable ?' }),
      );
  }, [chapter?.subject, chapterId, draw, profile.id, skills]);

  const submit = (response: Response) => {
    const s = latest.current;
    const { current, sessionId } = s;
    if (!current || s.answered || !sessionId) return;
    const result = check(current.question, response);
    if (result.invalid) {
      notify('Écris un nombre valide (ex. 3,5 ou −2).');
      return;
    }
    const durationMs = Math.round(performance.now() - shownAt.current);
    playSound(answerSound(s, result.correct));
    dispatch({ type: 'answered', result, response, durationMs });
    if (!isFirstAttempt(s)) return;
    const { plan } = current;
    pending.current.push(
      submitAnswer(sessionId, {
        skillId: plan.skillId,
        level: plan.level,
        seed: plan.seed,
        variant: plan.variant,
        response,
        durationMs,
      }).catch(() => notify('Réponse non enregistrée (problème de connexion).')),
    );
  };

  /** Question suivante, ou fin de partie (après l'enregistrement de toutes les réponses). */
  const next = async () => {
    const { answered, training, sessionId } = latest.current;
    if (!answered || advancing.current) return;
    advancing.current = true;
    playSound('click', 0.3);
    if (!isFinished(training)) {
      draw(training);
      advancing.current = false;
      return;
    }
    if (!sessionId) return;
    dispatch({ type: 'finishing' });
    await Promise.allSettled(pending.current);
    try {
      const summary = await finishSession(sessionId);
      dispatch({ type: 'finished', summary });
      playSound(summary.levelAfter > summary.levelBefore ? 'levelup' : 'finish');
      void qc.invalidateQueries({ queryKey: skillsKey(profile.id) });
      void qc.invalidateQueries({ queryKey: ['profiles'] });
    } catch {
      dispatch({ type: 'failed', error: 'Impossible d’enregistrer la fin de partie.' });
    }
  };

  /** « Je n'ai pas compris » : signalé une fois par notion (la notion repassera à revoir). */
  const reportConfused = () => {
    const { current, sessionId } = latest.current;
    if (!current || !sessionId) return;
    const id = current.plan.skillId;
    if (confusedSent.current.has(id)) return;
    confusedSent.current.add(id);
    void markConfused(sessionId, id).catch(() => undefined);
  };

  return {
    state,
    submit,
    next: () => void next(),
    reportConfused,
    pick: (point: { readonly x: number; readonly y: number } | null) => dispatch({ type: 'picked', point }),
  };
}
