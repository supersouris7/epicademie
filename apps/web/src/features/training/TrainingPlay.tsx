import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { check, getChapter, getSkill, type Question, type Response } from '@questeo/content';
import {
  isFinished,
  nextQuestion,
  recordAnswer,
  regularCount,
  startTraining,
  seriesLength,
  xpForAnswer,
  type PlannedQuestion,
  type SkillState,
  type TrainingState,
} from '@questeo/engine';
import { type Profile, type SessionSummary } from '@questeo/shared';
import { finishSession, markConfused, skillsKey, startSession, submitAnswer, useSkills } from './api.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { GameIcon } from '../../shared/ui/game/GameIcon.tsx';
import { ProgressBar } from '../../shared/ui/game/ProgressBar.tsx';
import { ResourceCounter } from '../../shared/ui/game/ResourceCounter.tsx';
import { MathText } from '../../shared/question/MathText.tsx';
import { useToast } from '../../shared/ui/Toast.tsx';
import { Figure } from '../../shared/question/figures/Figure.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { Feedback } from '../../shared/question/Feedback.tsx';
import { Memo } from '../../shared/question/Memo.tsx';
import { QuestionTools } from '../../shared/question/QuestionTools.tsx';
import { DOCK_HEIGHT } from '../../shared/question/tools.ts';
import { useBackGuard, useGameExit } from '../../shared/lib/gameExit.ts';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog.tsx';
import { localToday, randomSeed } from '../../shared/lib/dates.ts';
import { playSound, preloadSounds, setSoundEnabled } from '../../shared/lib/sound.ts';
import { formatAnswer } from '../../shared/question/answers.ts';
import { heroSays, type HeroMoment } from '../../shared/lib/dialogue.ts';
import { freshQuestion, recentPrompts, rememberPrompt } from '../../shared/lib/recent.ts';
import { HeroBubble } from '../../shared/battle/HeroBubble.tsx';
import { PauseButton } from '../../shared/question/PauseButton.tsx';

import { Results } from './TrainingResults.tsx';
import type { Missed } from './types.ts';

interface Current {
  readonly plan: PlannedQuestion;
  readonly question: Question;
  readonly shownAt: number;
  /** Conseil d'outil de Questy : seulement à la 1re question de chaque notion (pas de radotage). */
  readonly advise: boolean;
}

interface Answered {
  readonly correct: boolean;
  /** Bonne réponse trouvée au 2e essai, grâce à l'indice. */
  readonly retried?: boolean;
  readonly why?: string;
  /** Dernière réponse donnée (affichée dans l'explication). */
  readonly given?: Response;
  readonly xp: number;
  readonly streak: number;
}

/** 1re erreur : Questy dit ce qui cloche et donne un indice, l'enfant réessaie la même question. */
interface Retry {
  readonly why?: string;
  /** Option de QCM déjà essayée (grisée au 2e essai). */
  readonly excluded?: number;
  readonly nonce: number;
}

/** Un 2e essai n'a pas de sens quand il ne reste qu'une option (Vrai / Faux, < / >…). */
const canRetry = (q: Question) => q.answer.kind !== 'choice' || q.answer.options.length > 2;

/** Partie d’Entraînement : 4 questions (5 en calcul de tête) + variantes, correction après chaque réponse. */
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
  const { left } = useGameExit(`/jouer/entrainement/${chapter?.subject ?? 'maths'}/${chapterId}`);
  if (!valid) return <Navigate to="/jouer/entrainement" replace />;
  // Partie déjà quittée, revenue par « précédent » : on ne la relance pas (redirection en cours).
  if (left) return null;
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
  const profileId = profile.id;
  const chapter = getChapter(chapterId);
  const today = localToday();
  const [toast, showToast] = useToast(2500);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [training, setTraining] = useState<TrainingState>(() =>
    startTraining(skills, states, seriesLength(skills.every((id) => getSkill(id)?.mental === true))),
  );
  const [current, setCurrent] = useState<Current | null>(null);
  const [answered, setAnswered] = useState<Answered | null>(null);
  const [picked, setPicked] = useState<{ x: number; y: number } | null>(null);
  const [memo, setMemo] = useState(false);
  const [retry, setRetry] = useState<Retry | null>(null);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const confusedSent = useRef(new Set<string>());
  const advised = useRef(new Set<string>());
  const [missed, setMissed] = useState<readonly Missed[]>([]);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [xpTotal, setXpTotal] = useState(0);
  const pending = useRef<Promise<unknown>[]>([]);
  const started = useRef(false);
  const advancing = useRef(false);
  /** Énoncés déjà posés dans la partie : jamais deux fois le même. */
  const seen = useRef(new Set<string>());
  /** Réaction du héros (tête + petite bulle) en haut de l'écran. */
  const [hero, setHero] = useState(() => ({ ...heroSays(profile.hero, 'start'), nonce: 1 }));
  const react = (moment: HeroMoment) => setHero((h) => ({ ...heroSays(profile.hero, moment), nonce: h.nonce + 1 }));

  useEffect(() => {
    setSoundEnabled(profile.soundOn);
    preloadSounds();
  }, [profile.soundOn]);

  const draw = useCallback(
    (t: TrainingState) => {
      const planned = nextQuestion(t, states, today, Math.random(), randomSeed() % 2_000_000_000);
      const { question, seed } = freshQuestion(
        planned.skillId,
        planned.level,
        planned.seed,
        seen.current,
        recentPrompts(profileId, planned.skillId),
        () => randomSeed() % 2_000_000_000,
      );
      const plan = { ...planned, seed };
      seen.current.add(question.prompt);
      rememberPrompt(profileId, plan.skillId, question.prompt);
      const advise = !advised.current.has(plan.skillId);
      advised.current.add(plan.skillId);
      if (!plan.variant && regularCount(t) === t.length - 1) {
        setHero((h) => ({ ...heroSays(profile.hero, 'lastOne'), nonce: h.nonce + 1 }));
      }
      setCurrent({
        plan,
        question,
        shownAt: performance.now(),
        advise,
      });
      setAnswered(null);
      setRetry(null);
      setPicked(null);
    },
    [states, today, profileId, profile.hero],
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
    // 2e essai : il ne compte pas dans le score (la 1re réponse est déjà enregistrée), il sert à apprendre.
    if (retry) {
      playSound(result.correct ? 'correct' : 'wrong');
      react(result.correct ? 'retried' : 'wrong');
      setAnswered({ correct: result.correct, retried: true, why: result.why, given: response, xp: 0, streak: 0 });
      // Erreur corrigée seul avec l'indice : pas besoin d'une question similaire.
      if (result.correct) setTraining((t) => ({ ...t, pendingVariant: null }));
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
    react(result.correct ? (newStreak >= 3 ? 'streak' : 'correct') : 'wrong');
    setXpTotal((v) => v + xp);
    if (!result.correct) {
      const { question } = current;
      setMissed((m) => [...m, { prompt: question.prompt, answer: formatAnswer(question) }]);
    }
    if (!result.correct && canRetry(current.question)) {
      setRetry({
        why: result.why,
        excluded: response.kind === 'choice' ? response.index : undefined,
        nonce: Date.now(),
      });
      setPicked(null);
    } else setAnswered({ correct: result.correct, why: result.why, given: response, xp, streak: newStreak });
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

  const quit = () => setConfirmQuit(true);
  // Sorties : la partie est remplacée dans l'historique (« précédent » ne la relance pas).
  const { exit } = useGameExit(`/jouer/entrainement/${chapter?.subject ?? 'maths'}/${chapterId}`);
  // Quitter la partie ramène au menu principal.
  const leave = () => exit('/hub');
  // « Précédent » pendant la série : même confirmation que la Pause.
  const { rearm } = useBackGuard(!summary && !error, quit);

  if (error) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center">
        <Questy mood="sad" size={120} />
        <p className="text-xl font-bold">{error}</p>
        <GameButton onClick={() => exit('/hub')}>Retour à l’accueil</GameButton>
      </div>
    );
  }

  if (summary)
    return (
      <Results
        summary={summary}
        missed={missed}
        gender={profile.gender}
        chapterId={chapterId}
        onExit={exit}
        onReplay={() => void navigate(location.pathname, { replace: true, state: { replay: Date.now() } })}
      />
    );

  const done = regularCount(training);
  const skill = current ? getSkill(current.plan.skillId) : undefined;
  const advice = current?.advise ? skill?.advice : undefined;
  // Explication après une erreur : elle prend la place des outils et s'agrandit (l'énoncé reste en haut).
  const explaining = answered !== null && !answered.correct;

  const reportConfused = () => {
    setMemo(true);
    if (!current) return;
    const id = current.plan.skillId;
    if (sessionId && !confusedSent.current.has(id)) {
      confusedSent.current.add(id);
      void markConfused(sessionId, id).catch(() => undefined);
    }
  };

  return (
    <div className="mx-auto flex h-dvh max-w-6xl flex-col gap-3 px-3 py-3 sm:px-4">
      <header className="flex shrink-0 items-center gap-3">
        <PauseButton onClick={quit} />
        <HeroBubble hero={profile.hero} face={hero.face} text={hero.text} nonce={hero.nonce} />
        <ProgressBar
          className="flex-1"
          value={done}
          max={training.length}
          label="Progression de la série"
          segments={training.length}
        />
        <ResourceCounter icon="icons-resources-xp" value={`+${xpTotal} XP`} label={`${xpTotal} XP gagnés`} />
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
            className="side:grid side:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] xl:side:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] flex min-h-0 flex-1 flex-col gap-3"
          >
            {/* Énoncé et figure : jamais recouverts par les outils. */}
            <section
              className={`flex min-h-0 flex-col gap-3 overflow-y-auto pb-1 [&>*]:shrink-0 ${explaining ? 'side:max-h-none max-h-[38dvh] flex-none' : 'flex-1'}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted text-sm font-bold">{skill?.title}</span>
                {current.plan.variant && (
                  <span className="bg-accent rounded-full px-2 py-0.5 text-xs font-bold text-white">
                    Question similaire
                  </span>
                )}
                <span className="text-muted ml-auto text-sm font-bold">Niveau {current.plan.level}</span>
              </div>
              <h1 className="text-2xl leading-snug font-bold sm:text-3xl xl:text-4xl">
                <MathText text={current.question.prompt} />
              </h1>
              {retry && !answered && (
                <motion.p
                  key={retry.nonce}
                  initial={{ x: -8 }}
                  animate={{ x: [0, -8, 8, -4, 4, 0] }}
                  className="flex items-start gap-2 text-base font-bold"
                  role="status"
                >
                  <span className="shrink-0">
                    <Questy mood="wink" size={72} />
                  </span>
                  <span className="cartoon bg-[color-mix(in_srgb,var(--danger)_14%,var(--surface))] px-3 py-2">
                    {retry.why ? <MathText text={retry.why} /> : 'Ce n’est pas ça…'}
                    <span className="mt-1 flex items-start gap-1.5">
                      <GameIcon id="icons-navigation-hint" size="xs" />
                      <span>
                        <strong>Indice :</strong> <MathText text={current.question.hint} />
                      </span>
                    </span>
                    <span className="text-muted mt-1 block">Essaie encore !</span>
                  </span>
                </motion.p>
              )}
              {advice && !answered && !retry && (advice === 'brouillon' || !skill?.mental) && (
                <p className="flex items-center gap-2 text-base font-bold" role="note">
                  <Questy mood={advice === 'calculatrice' ? 'happy' : 'wink'} size={64} />
                  <span className="cartoon bg-surface-2 px-3 py-1.5">
                    {advice === 'calculatrice'
                      ? 'Tu peux t’aider de la calculatrice.'
                      : 'Je te conseille de faire un brouillon pour cette question.'}
                  </span>
                </p>
              )}
              {current.question.figure && (
                <Figure
                  figure={current.question.figure}
                  maxHeight="var(--figure-max)"
                  picked={picked}
                  onPick={current.question.answer.kind === 'point' && !answered ? setPicked : undefined}
                  reveal={
                    answered && !answered.correct && current.question.answer.kind === 'point'
                      ? current.question.answer
                      : null
                  }
                />
              )}
            </section>

            {/* Écran coupé : pavé et outils en bas (portrait) ou sur le côté (paysage). */}
            <section
              className={`flex min-h-0 shrink-0 flex-col ${explaining ? 'side:h-full min-h-[clamp(280px,40dvh,390px)] flex-1' : `side:h-[min(100%,560px)] xl:side:h-[min(100%,680px)] side:self-center ${DOCK_HEIGHT}`}`}
            >
              {answered ? (
                <Feedback
                  question={current.question}
                  correct={answered.correct}
                  retried={answered.retried}
                  why={answered.why}
                  given={answered.given}
                  xp={answered.xp}
                  streak={answered.streak}
                  variantNext={training.pendingVariant !== null}
                  gender={profile.gender}
                  onMemo={reportConfused}
                  onNext={() => void next()}
                />
              ) : (
                <QuestionTools
                  key={`${current.plan.seed}-${current.plan.variant}`}
                  question={current.question}
                  skill={skill}
                  advice={advice}
                  excluded={retry?.excluded}
                  attempt={retry?.nonce ?? 0}
                  picked={picked}
                  onSubmit={submit}
                />
              )}
            </section>
          </motion.main>
        )}
      </AnimatePresence>
      {memo && skill && <Memo skill={skill} onClose={() => setMemo(false)} />}
      {confirmQuit && (
        <ConfirmDialog
          title="Pause"
          message="Si tu quittes, cette série ne sera pas comptée."
          confirm="Quitter la série"
          mood="ok"
          cancel="Reprendre"
          onConfirm={leave}
          onCancel={() => {
            setConfirmQuit(false);
            rearm();
          }}
        />
      )}
      {toast}
    </div>
  );
}
