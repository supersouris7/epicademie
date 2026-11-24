import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chaptersOf, check, generate, type Question, type Response } from '@epicademie/content';
import { playedGrade, type Profile, type SessionSummary, type SubjectId } from '@epicademie/shared';
import { playSound } from '../../shared/lib/sound.ts';
import { formatAnswer, formatResponse } from '../../shared/question/answers.ts';
import { useChapterAccess } from '../parent/index.ts';
import { finishSession, startSession, submitAnswer, useDisabledSkills } from '../training/index.ts';
import {
  comboOf,
  INITIAL_SCORE,
  isOver,
  levelFor,
  pointsFor,
  referenceSeconds,
  timeGainMs,
  remainingMs,
  saveBest,
  scoreAfter,
  bestScore,
  type DefiId,
  type DefiScore,
} from './rules.ts';

/** Question ratée, pour « Revoir mes erreurs ». */
export interface DefiMiss {
  readonly prompt: string;
  readonly given: string;
  readonly answer: string;
  readonly why: string;
}

/** Retour instantané après une réponse (points gagnés, combo, temps). */
export interface Feedback {
  readonly id: number;
  readonly correct: boolean;
  readonly gained: number;
  /** Temps gagné (ms) sur une bonne réponse. */
  readonly timeGainMs: number;
  readonly combo: number;
}

/** Durée du retour instantané avant la question suivante. */
const FEEDBACK_MS = 350;

export type Phase = 'intro' | 'playing' | 'finishing' | 'done';

/**
 * Déroulé d'un défi : tirage des questions dans les chapitres accessibles de sa classe,
 * enregistrement des réponses (comme à l'entraînement), fin au temps écoulé ou au dernier cœur.
 */
export function useDefi(profile: Profile, kind: DefiId, subject: SubjectId, notify: (m: string) => void) {
  const qc = useQueryClient();
  const canPlay = useChapterAccess();
  const { data: disabled } = useDisabledSkills();
  const chapters = chaptersOf(subject, playedGrade(profile.grade)).filter((c) => canPlay(c.id));
  const pool = useMemo(
    () => chapters.flatMap((c) => c.skills.map((s) => s.id)).filter((id) => !disabled?.has(id)),
    [chapters, disabled],
  );

  const [phase, setPhase] = useState<Phase>('intro');
  const [score, setScore] = useState<DefiScore>(INITIAL_SCORE);
  const [question, setQuestion] = useState<Question | null>(null);
  const [flash, setFlash] = useState<Feedback | null>(null);
  const [misses, setMisses] = useState<readonly DefiMiss[]>([]);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [record, setRecord] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const grade = playedGrade(profile.grade);
  const [previousBest, setPreviousBest] = useState(0);
  const feedbackId = useRef(0);
  const session = useRef<string | null>(null);
  const shownAt = useRef(0);
  const pending = useRef<Promise<unknown>[]>([]);
  const finishing = useRef(false);

  const draw = (correct: number) => {
    const skillId = pool[Math.floor(Math.random() * pool.length)];
    if (!skillId) return;
    setQuestion(generate(skillId, levelFor(kind, correct, Math.random()), Math.floor(Math.random() * 1e9)));
    shownAt.current = performance.now();
  };

  const finish = async (final: DefiScore) => {
    if (!session.current || finishing.current) return;
    finishing.current = true;
    setPhase('finishing');
    await Promise.allSettled(pending.current);
    try {
      setSummary(await finishSession(session.current));
    } catch {
      notify('Fin de partie non enregistrée (problème de connexion).');
    }
    const isRecord = saveBest(kind, profile.id, subject, grade, final.points);
    setRecord(isRecord);
    playSound(isRecord ? 'victory' : 'finish');
    setPhase('done');
    void qc.invalidateQueries({ queryKey: ['profiles'] });
  };

  // Contre-la-montre : l'horloge tourne pendant la partie, et la termine à 60 s.
  useEffect(() => {
    if (phase !== 'playing' || kind !== 'chrono') return;
    const t = window.setInterval(() => setNow(performance.now()), 100);
    return () => window.clearInterval(t);
  }, [phase, kind]);
  const elapsed = phase === 'playing' ? now - startedAt : 0;
  const leftMs = remainingMs(score, elapsed);
  useEffect(() => {
    if (phase === 'playing' && kind === 'chrono' && isOver(kind, score, elapsed)) void finish(score);
  });

  const start = async () => {
    const first = chapters[0];
    if (!first || pool.length === 0) return;
    try {
      const { id } = await startSession({
        profileId: profile.id,
        mode: kind,
        subject,
        chapterId: first.id,
        skillId: null,
      });
      session.current = id;
      setPreviousBest(bestScore(kind, profile.id, subject, grade));
      const t = performance.now();
      setStartedAt(t);
      setNow(t);
      setPhase('playing');
      draw(0);
    } catch {
      notify('Impossible de démarrer le défi. Le serveur est-il joignable ?');
    }
  };

  const submit = (response: Response) => {
    if (!question || flash !== null || !session.current) return;
    const result = check(question, response);
    if (result.invalid) {
      notify('Écris un nombre valide (ex. 3,5 ou −2).');
      return;
    }
    pending.current.push(
      submitAnswer(session.current, {
        skillId: question.skillId,
        level: question.level,
        seed: question.seed,
        variant: false,
        response,
        durationMs: Math.round(performance.now() - shownAt.current),
        attempt: 1,
      }).catch(() => undefined),
    );
    const duration = performance.now() - shownAt.current;
    const gained = result.correct
      ? pointsFor(question.level, question.answer.kind, duration, score.streak + 1, referenceSeconds(question))
      : 0;
    const gainMs = result.correct ? timeGainMs(question) : 0;
    const next = scoreAfter(kind, score, result.correct, gained, gainMs);
    setScore(next);
    setNow(performance.now());
    feedbackId.current += 1;
    setFlash({
      id: feedbackId.current,
      correct: result.correct,
      gained,
      timeGainMs: gainMs,
      combo: comboOf(next.streak),
    });
    if (result.correct) playSound(next.streak >= 3 ? 'combo' : 'correct');
    else {
      playSound('wrong');
      setMisses((m) => [
        ...m,
        {
          prompt: question.prompt,
          given: formatResponse(question, response),
          answer: formatAnswer(question),
          why: result.why ?? question.steps[question.steps.length - 1] ?? '',
        },
      ]);
    }
    window.setTimeout(() => {
      setFlash(null);
      if (isOver(kind, next, performance.now() - startedAt)) void finish(next);
      else draw(next.correct);
    }, FEEDBACK_MS);
  };

  return {
    phase,
    score,
    question,
    flash,
    summary,
    record,
    available: pool.length > 0,
    misses,
    previousBest,
    leftMs,
    secondsLeft: Math.ceil(leftMs / 1000),
    start,
    submit,
    stop: () => void finish(score),
  };
}
