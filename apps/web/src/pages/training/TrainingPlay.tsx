import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { check, generate, getChapter, getSkill, type Question, type Response } from '@questeo/content';
import {
  isFinished,
  nextQuestion,
  recordAnswer,
  regularCount,
  startTraining,
  TRAINING_LENGTH,
  xpForAnswer,
  type PlannedQuestion,
  type SkillState,
  type TrainingState,
} from '@questeo/engine';
import type { Profile, SessionSummary } from '@questeo/shared';
import { finishSession, skillsKey, startSession, submitAnswer, useSkills } from '../../api/play.ts';
import { Button } from '../../components/Button.tsx';
import { Confetti } from '../../components/Confetti.tsx';
import { MathText } from '../../components/MathText.tsx';
import { StageDots } from '../../components/StageDots.tsx';
import { useToast } from '../../components/Toast.tsx';
import { Figure } from '../../components/figures/Figure.tsx';
import { Questy } from '../../components/mascot/Questy.tsx';
import type { MoodId } from '../../components/mascot/moods.ts';
import { AnswerInput } from '../../components/play/AnswerInput.tsx';
import { Feedback } from '../../components/play/Feedback.tsx';
import { LessonSheet } from '../../components/play/LessonSheet.tsx';
import { localToday, randomSeed } from '../../lib/dates.ts';
import { playSound, preloadSounds, setSoundEnabled } from '../../lib/sound.ts';
import { stageMessage } from '../../lib/answers.ts';

interface Current {
  readonly plan: PlannedQuestion;
  readonly question: Question;
  readonly shownAt: number;
}

interface Answered {
  readonly correct: boolean;
  readonly why?: string;
  readonly xp: number;
  readonly streak: number;
}

/** Partie d'Entraînement : 10 questions + variantes, correction après chaque réponse. */
export function TrainingPlay({ profile }: { readonly profile: Profile }) {
  const { chapterId = '', skillId = '' } = useParams();
  const chapter = getChapter(chapterId);
  const skills = useMemo(
    () => (chapter ? (skillId === 'tout' ? chapter.skills.map((s) => s.id) : [skillId]) : []),
    [chapter, skillId],
  );
  const valid = chapter !== undefined && skills.every((id) => chapter.skills.some((s) => s.id === id));
  const { data: progress, isPending } = useSkills(profile.id);
  const location = useLocation();
  if (!valid) return <Navigate to="/jouer/entrainement" replace />;
  if (isPending || !progress) return <p className="p-8 text-xl">Chargement…</p>;
  const states = new Map<string, SkillState>(progress.map((s) => [s.skillId, s]));
  return <Game key={location.key} profile={profile} chapterId={chapterId} skills={skills} states={states} />;
}

function Game({
  profile,
  chapterId,
  skills,
  states,
}: {
  profile: Profile;
  chapterId: string;
  skills: string[];
  states: Map<string, SkillState>;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const chapter = getChapter(chapterId);
  const today = localToday();
  const [toast, showToast] = useToast(2500);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [training, setTraining] = useState<TrainingState>(() => startTraining(skills, states));
  const [current, setCurrent] = useState<Current | null>(null);
  const [answered, setAnswered] = useState<Answered | null>(null);
  const [picked, setPicked] = useState<{ x: number; y: number } | null>(null);
  const [lesson, setLesson] = useState(false);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [xpTotal, setXpTotal] = useState(0);
  const pending = useRef<Promise<unknown>[]>([]);
  const started = useRef(false);
  const advancing = useRef(false);

  useEffect(() => {
    setSoundEnabled(profile.soundOn);
    preloadSounds();
  }, [profile.soundOn]);

  const draw = useCallback(
    (t: TrainingState) => {
      const plan = nextQuestion(t, states, today, Math.random(), randomSeed() % 2_000_000_000);
      setCurrent({ plan, question: generate(plan.skillId, plan.level, plan.seed), shownAt: performance.now() });
      setAnswered(null);
      setPicked(null);
    },
    [states, today],
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
        setSessionId(id);
        draw(training);
      })
      .catch(() => setError('Impossible de démarrer la partie. Le serveur est-il joignable ?'));
  }, [chapter?.subject, chapterId, draw, profile.id, skills, training]);

  const submit = (response: Response) => {
    if (!current || answered || !sessionId) return;
    const result = check(current.question, response);
    if (result.invalid) {
      showToast('Écris un nombre valide (ex. 3,5 ou −2).');
      return;
    }
    const durationMs = Math.round(performance.now() - current.shownAt);
    const newStreak = result.correct ? streak + 1 : 0;
    const xp = xpForAnswer({
      correct: result.correct,
      variant: current.plan.variant,
      durationMs,
      targetSeconds: current.question.targetSeconds,
      streak: newStreak,
    });
    setStreak(newStreak);
    setXpTotal((v) => v + xp);
    setAnswered({ correct: result.correct, why: result.why, xp, streak: newStreak });
    playSound(result.correct ? (newStreak > 0 && newStreak % 5 === 0 ? 'combo' : 'correct') : 'wrong');
    setTraining((t) => recordAnswer(t, current.plan, result.correct));
    const { plan } = current;
    pending.current.push(
      submitAnswer(sessionId, {
        skillId: plan.skillId,
        level: plan.level,
        seed: plan.seed,
        variant: plan.variant,
        response,
        durationMs,
      }).catch(() => showToast('Réponse non enregistrée (problème de connexion).')),
    );
  };

  const next = async () => {
    // Garde contre le double appui pendant la transition.
    if (!answered || advancing.current) return;
    advancing.current = true;
    playSound('click', 0.3);
    if (!isFinished(training)) {
      draw(training);
      advancing.current = false;
      return;
    }
    if (!sessionId) return;
    setCurrent(null);
    await Promise.allSettled(pending.current);
    try {
      const s = await finishSession(sessionId);
      setSummary(s);
      playSound(s.levelAfter > s.levelBefore ? 'levelup' : 'finish');
      void qc.invalidateQueries({ queryKey: skillsKey(profile.id) });
      void qc.invalidateQueries({ queryKey: ['profiles'] });
    } catch {
      setError('Impossible d’enregistrer la fin de partie.');
    }
  };

  const quit = () => {
    if (window.confirm('Quitter la partie ? Ta progression sur cette série ne sera pas comptée.'))
      void navigate(`/jouer/entrainement/${chapter?.subject ?? 'maths'}/${chapterId}`);
  };

  if (error) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center">
        <Questy mood="sad" size={120} />
        <p className="text-xl font-bold">{error}</p>
        <Button onClick={() => void navigate('/hub')}>Retour à l’accueil</Button>
      </div>
    );
  }

  if (summary)
    return (
      <Results
        summary={summary}
        chapterId={chapterId}
        onReplay={() => void navigate(location.pathname, { replace: true, state: { replay: Date.now() } })}
      />
    );

  const done = regularCount(training);
  const skill = current ? getSkill(current.plan.skillId) : undefined;

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-4 px-4 py-4">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={quit}
          className="cartoon cartoon-press bg-surface font-display flex h-12 w-12 items-center justify-center text-2xl"
          aria-label="Quitter la partie"
        >
          ✕
        </button>
        <div
          className="bg-surface-2 border-outline h-6 flex-1 overflow-hidden rounded-full border-4"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TRAINING_LENGTH}
          aria-valuenow={done}
          aria-label="Progression de la série"
        >
          <motion.div className="bg-primary h-full" animate={{ width: `${(done / TRAINING_LENGTH) * 100}%` }} />
        </div>
        <span className="font-display text-xl">
          {Math.min(done + (answered ? 0 : 1), TRAINING_LENGTH)}/{TRAINING_LENGTH}
        </span>
        <span
          className="font-display bg-gold rounded-full px-3 py-1 text-lg text-[#1d1638]"
          aria-label={`${xpTotal} XP gagnés`}
        >
          {xpTotal} XP
        </span>
      </header>

      {!current && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Questy mood="wow" size={120} />
          <p className="font-display text-2xl">{sessionId ? 'Calcul des résultats…' : 'C’est parti…'}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {current && (
          <motion.main
            key={`${current.plan.seed}-${current.plan.variant}`}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            className="flex flex-1 flex-col gap-5"
          >
            <div className="flex items-center gap-2">
              <span className="text-muted text-sm font-bold">{skill?.title}</span>
              {current.plan.variant && (
                <span className="bg-accent rounded-full px-2 py-0.5 text-xs font-bold text-white">
                  Question similaire
                </span>
              )}
              <span className="text-muted ml-auto text-sm font-bold">Niveau {current.plan.level}</span>
            </div>
            <h1 className="text-2xl leading-snug font-bold sm:text-3xl">
              <MathText text={current.question.prompt} />
            </h1>
            {current.question.figure && (
              <Figure
                figure={current.question.figure}
                picked={picked}
                onPick={current.question.answer.kind === 'point' && !answered ? setPicked : undefined}
                reveal={
                  answered && !answered.correct && current.question.answer.kind === 'point'
                    ? current.question.answer
                    : null
                }
              />
            )}
            {answered ? (
              <Feedback
                question={current.question}
                correct={answered.correct}
                why={answered.why}
                xp={answered.xp}
                streak={answered.streak}
                variantNext={training.pendingVariant !== null}
                onLesson={() => setLesson(true)}
                onNext={() => void next()}
              />
            ) : (
              <AnswerInput
                key={`${current.plan.seed}-${current.plan.variant}`}
                question={current.question}
                disabled={false}
                onSubmit={submit}
                picked={picked}
              />
            )}
          </motion.main>
        )}
      </AnimatePresence>
      {lesson && skill && <LessonSheet skill={skill} onClose={() => setLesson(false)} />}
      {toast}
    </div>
  );
}

function Results({
  summary,
  chapterId,
  onReplay,
}: {
  summary: SessionSummary;
  chapterId: string;
  onReplay: () => void;
}) {
  const navigate = useNavigate();
  const chapter = getChapter(chapterId);
  const { regular } = summary;
  const mood: MoodId = summary.perfect
    ? 'proud'
    : summary.scoreOn20 >= 14
      ? 'happy'
      : summary.scoreOn20 >= 10
        ? 'ok'
        : 'sad';
  const levelUp = summary.levelAfter > summary.levelBefore;
  const message = summary.perfect
    ? 'Sans-faute !'
    : summary.scoreOn20 >= 14
      ? 'Très bien !'
      : summary.scoreOn20 >= 10
        ? 'C’est en bonne voie !'
        : 'On s’accroche, ça va venir !';
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-5 px-4 py-6">
      {(summary.perfect || levelUp) && <Confetti />}
      <div className="flex flex-col items-center gap-3 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          <Questy mood={mood} size={140} />
        </motion.div>
        <h1 className="font-display text-4xl tracking-wide">{message}</h1>
        <p className="font-display text-6xl">
          {regular.correct}/{regular.answered}
        </p>
        <p className="text-muted text-xl font-bold">Note : {String(summary.scoreOn20).replace('.', ',')}/20</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="cartoon bg-gold flex flex-col items-center p-3 text-[#1d1638]">
          <span className="font-display text-3xl">+{summary.xpGained}</span>
          <span className="font-bold">XP{summary.perfect ? ' (bonus sans-faute)' : ''}</span>
        </div>
        <div className="cartoon bg-surface flex flex-col items-center p-3">
          <span className="font-display text-3xl">+{summary.coinsGained}</span>
          <span className="font-bold">pièces</span>
        </div>
      </div>

      {levelUp && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="cartoon bg-accent font-display p-4 text-center text-3xl text-white"
        >
          Niveau {summary.levelAfter} atteint !
        </motion.div>
      )}

      {summary.variants.answered > 0 && (
        <p className="text-center text-lg font-bold">
          Questions similaires après erreur : {summary.variants.correct}/{summary.variants.answered} réussies.
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl tracking-wide">Tes notions</h2>
        {summary.skills.map((s) => (
          <div key={s.skillId} className="cartoon bg-surface flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl tracking-wide">{getSkill(s.skillId)?.title}</p>
              <p className="text-muted font-bold">
                {s.correct}/{s.answered} · {stageMessage(s.stageAfter, s.due)}
              </p>
            </div>
            <StageDots stage={s.stageAfter} />
          </div>
        ))}
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={onReplay}>Rejouer</Button>
        <Button
          variant="surface"
          onClick={() => void navigate(`/jouer/entrainement/${chapter?.subject ?? 'maths'}/${chapterId}`)}
        >
          Autre notion
        </Button>
        <Button variant="surface" onClick={() => void navigate('/hub')}>
          Accueil
        </Button>
      </div>
    </div>
  );
}
