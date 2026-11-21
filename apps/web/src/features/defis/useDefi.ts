import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chaptersOf, check, generate, type Question, type Response } from '@questeo/content';
import { playedGrade, type Profile, type SessionSummary, type SubjectId } from '@questeo/shared';
import { useChapterAccess } from '../parent/index.ts';
import { finishSession, startSession, submitAnswer, useDisabledSkills } from '../training/index.ts';
import {
  CHRONO_MS,
  isOver,
  levelFor,
  saveBest,
  scoreAfter,
  SURVIE_HEARTS,
  type DefiId,
  type DefiScore,
} from './rules.ts';

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
  const [score, setScore] = useState<DefiScore>({ correct: 0, answered: 0, hearts: SURVIE_HEARTS });
  const [question, setQuestion] = useState<Question | null>(null);
  const [flash, setFlash] = useState<boolean | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [record, setRecord] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
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
    setRecord(saveBest(kind, profile.id, subject, final.correct));
    setPhase('done');
    void qc.invalidateQueries({ queryKey: ['profiles'] });
  };

  // Contre-la-montre : l'horloge tourne pendant la partie, et la termine à 60 s.
  useEffect(() => {
    if (phase !== 'playing' || kind !== 'chrono') return;
    const t = window.setInterval(() => setNow(performance.now()), 250);
    return () => window.clearInterval(t);
  }, [phase, kind]);
  const elapsed = phase === 'playing' ? now - startedAt : 0;
  useEffect(() => {
    if (phase === 'playing' && kind === 'chrono' && elapsed >= CHRONO_MS) void finish(score);
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
    const next = scoreAfter(kind, score, result.correct);
    setScore(next);
    setFlash(result.correct);
    window.setTimeout(() => {
      setFlash(null);
      if (isOver(kind, next, performance.now() - startedAt)) void finish(next);
      else draw(next.correct);
    }, 500);
  };

  return {
    phase,
    score,
    question,
    flash,
    summary,
    record,
    available: pool.length > 0,
    secondsLeft: Math.max(0, Math.ceil((CHRONO_MS - elapsed) / 1000)),
    start,
    submit,
    stop: () => void finish(score),
  };
}
