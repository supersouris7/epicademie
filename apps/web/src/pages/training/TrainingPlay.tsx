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
  TRAINING_LENGTH,
  xpForAnswer,
  type PlannedQuestion,
  type SkillState,
  type TrainingState,
} from '@questeo/engine';
import { accord, type Gender, type Profile, type SessionSummary } from '@questeo/shared';
import { finishSession, markConfused, skillsKey, startSession, submitAnswer, useSkills } from '../../api/play.ts';
import { GameButton } from '../../components/game/GameButton.tsx';
import { GameIcon } from '../../components/game/GameIcon.tsx';
import { Confetti } from '../../components/Confetti.tsx';
import { ProgressBar } from '../../components/game/ProgressBar.tsx';
import { ResourceCounter } from '../../components/game/ResourceCounter.tsx';
import { RewardBadge } from '../../components/game/RewardBadge.tsx';
import { QuestyPose } from '../../components/mascot/QuestyPose.tsx';
import type { QuestyPoseId } from '../../components/mascot/poses.ts';
import { skinStyle } from '../../design/skin.ts';
import { MathText } from '../../components/MathText.tsx';
import { StageDots } from '../../components/StageDots.tsx';
import { useToast } from '../../components/Toast.tsx';
import { Figure } from '../../components/figures/Figure.tsx';
import { Questy } from '../../components/mascot/Questy.tsx';
import type { MoodId } from '../../components/mascot/moods.ts';
import { Feedback } from '../../components/play/Feedback.tsx';
import { Memo } from '../../components/play/Memo.tsx';
import { QuestionTools } from '../../components/play/QuestionTools.tsx';
import { DOCK_HEIGHT } from '../../lib/tools.ts';
import { ConfirmDialog } from '../../components/ConfirmDialog.tsx';
import { localToday, randomSeed } from '../../lib/dates.ts';
import { playSound, preloadSounds, setSoundEnabled } from '../../lib/sound.ts';
import { formatAnswer, stageMessage } from '../../lib/answers.ts';
import { heroLine, type HeroMoment } from '../../lib/heroLines.ts';
import { freshQuestion, recentPrompts, rememberPrompt } from '../../lib/recent.ts';
import { HeroBubble } from '../../components/battle/HeroBubble.tsx';
import { PauseButton } from '../../components/play/PauseButton.tsx';
import { ChestReveal } from '../../components/game/ChestReveal.tsx';

interface Current {
  readonly plan: PlannedQuestion;
  readonly question: Question;
  readonly shownAt: number;
  /** Conseil d'outil de Questy : seulement à la 1re question de chaque notion (pas de radotage). */
  readonly advise: boolean;
}

/** Une question ratée, pour le récapitulatif de fin de partie. */
interface Missed {
  readonly prompt: string;
  readonly answer: string;
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

/** Partie d’Entraînement : 5 questions + variantes, correction après chaque réponse. */
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
  const profileId = profile.id;
  const chapter = getChapter(chapterId);
  const today = localToday();
  const [toast, showToast] = useToast(2500);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [training, setTraining] = useState<TrainingState>(() => startTraining(skills, states));
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
  const [hero, setHero] = useState(() => ({ ...heroLine('start', Math.floor(Math.random() * 3)), nonce: 1 }));
  const react = (moment: HeroMoment) =>
    setHero((h) => ({ ...heroLine(moment, h.nonce + Math.floor(Math.random() * 5)), nonce: h.nonce + 1 }));

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
      if (!plan.variant && regularCount(t) === TRAINING_LENGTH - 1) {
        setHero((h) => ({ ...heroLine('lastOne', h.nonce), nonce: h.nonce + 1 }));
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
    [states, today, profileId],
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
  // Quitter la partie ramène au menu principal.
  const leave = () => void navigate('/hub');

  if (error) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center">
        <Questy mood="sad" size={120} />
        <p className="text-xl font-bold">{error}</p>
        <GameButton onClick={() => void navigate('/hub')}>Retour à l’accueil</GameButton>
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
          max={TRAINING_LENGTH}
          label="Progression de la série"
          segments={TRAINING_LENGTH}
          text={`${Math.min(done + (answered || retry ? 0 : 1), TRAINING_LENGTH)}/${TRAINING_LENGTH}`}
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
            className="side:grid side:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] flex min-h-0 flex-1 flex-col gap-3"
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
              <h1 className="text-2xl leading-snug font-bold sm:text-3xl">
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
              className={`flex min-h-0 shrink-0 flex-col ${explaining ? 'side:h-full min-h-[clamp(280px,40dvh,390px)] flex-1' : `side:h-[min(100%,560px)] side:self-center ${DOCK_HEIGHT}`}`}
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
          onCancel={() => setConfirmQuit(false)}
        />
      )}
      {toast}
    </div>
  );
}

function Results({
  summary,
  missed,
  gender,
  chapterId,
  onReplay,
}: {
  summary: SessionSummary;
  missed: readonly Missed[];
  gender: Gender | null;
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
  const pose: QuestyPoseId = summary.perfect
    ? 'hero'
    : summary.scoreOn20 >= 14
      ? 'bravo'
      : summary.scoreOn20 >= 10
        ? 'pouce'
        : 'triste';
  const levelUp = summary.levelAfter > summary.levelBefore;
  const message = summary.perfect
    ? `Sans-faute, ${accord(gender, 'champion', 'championne')} !`
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
          <QuestyPose pose={pose} mood={mood} size={150} />
        </motion.div>
        <h1
          className="bg-accent font-display text-toon cartoon px-8 pt-0 pb-[0.85em] text-3xl leading-tight tracking-wide sm:text-4xl"
          // Le bandeau illustré a sa face dans le haut de l'image (la queue dépasse en bas) : texte remonté.
          style={skinStyle('hud/frames/ribbon.webp', 30, '1.5rem')}
        >
          {message}
        </h1>
        <p className="font-display text-6xl">
          {regular.correct}/{regular.answered}
        </p>
        <p className="text-muted text-xl font-bold">Note : {String(summary.scoreOn20).replace('.', ',')}/20</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <RewardBadge
          tone="gold"
          icon="icons-resources-xp"
          value={`+${summary.xpGained}`}
          label={`XP${summary.perfect ? ' (bonus sans-faute)' : ''}`}
        />
        <RewardBadge icon="icons-resources-coin" value={`+${summary.coinsGained}`} label="pièces" />
      </div>

      {levelUp && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="cartoon bevel bg-accent font-display text-toon p-4 text-center text-3xl"
        >
          Niveau {summary.levelAfter} atteint !
        </motion.div>
      )}

      <ChestReveal chest={summary.chest} />

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

      {missed.length > 0 && (
        <details className="cartoon bg-surface p-4">
          <summary className="font-display cursor-pointer text-2xl tracking-wide">
            Tes erreurs ({missed.length}) : la bonne réponse
          </summary>
          <ul className="mt-3 flex flex-col gap-2">
            {missed.map((m, i) => (
              <li key={i} className="bg-surface-2 rounded-2xl p-3 text-lg">
                <MathText text={m.prompt} />
                <span className="text-muted mt-1 block font-bold">
                  Réponse : <MathText text={m.answer} className="text-ink" />
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <GameButton icon="icons-navigation-retry" onClick={onReplay}>
          Rejouer
        </GameButton>
        <GameButton
          variant="accent"
          icon="icons-navigation-next"
          onClick={() => void navigate(`/jouer/entrainement/${chapter?.subject ?? 'maths'}/${chapterId}`)}
        >
          Autre notion
        </GameButton>
        <GameButton variant="accent" icon="icons-navigation-home" onClick={() => void navigate('/hub')}>
          Accueil
        </GameButton>
      </div>
    </div>
  );
}
