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
import { accord, type Gender, type Profile, type SessionSummary } from '@questeo/shared';
import { finishSession, markConfused, skillsKey, startSession, submitAnswer, useSkills } from '../../api/play.ts';
import { GameButton } from '../../components/game/GameButton.tsx';
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
import { AnswerInput } from '../../components/play/AnswerInput.tsx';
import { Feedback } from '../../components/play/Feedback.tsx';
import { NotUnderstood } from '../../components/play/NotUnderstood.tsx';
import { ConfirmDialog } from '../../components/ConfirmDialog.tsx';
import { ToolButton, ToolsPanel, type ToolTab } from '../../components/play/ToolsPanel.tsx';
import { Brouillon, type Stroke } from '../../components/tools/Brouillon.tsx';
import { Calculator } from '../../components/tools/Calculator.tsx';
import { EMPTY_CALC, type CalcState } from '../../lib/calcState.ts';
import { ConversionTable } from '../../components/tools/ConversionTable.tsx';
import { emptyConversion, unitsIn, type ConversionKind, type ConversionState } from '../../lib/conversion.ts';
import { localToday, randomSeed } from '../../lib/dates.ts';
import { playSound, preloadSounds, setSoundEnabled } from '../../lib/sound.ts';
import { stageMessage } from '../../lib/answers.ts';

/** Tableau adapté à l'unité de la question (aires en ^2, volumes en ^3 ou en litres). */
function conversionKind(q: Question): ConversionKind {
  const text = q.prompt + (q.answer.kind === 'number' ? (q.answer.unit ?? '') : '');
  if (/\^3|\bc?L\b|\bmL\b/.test(text)) return 'volume';
  if (text.includes('^2')) return 'aire';
  return 'longueur';
}

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
  const [toolsOpen, setToolsOpen] = useState(false);
  const [tab, setTab] = useState<ToolTab>('brouillon');
  const [strokes, setStrokes] = useState<readonly Stroke[]>([]);
  const [calc, setCalc] = useState<CalcState>(EMPTY_CALC);
  const [conv, setConv] = useState<ConversionState | null>(null);
  const [fill, setFill] = useState<{ value: string; nonce: number } | null>(null);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const confusedSent = useRef(new Set<string>());
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
      setStrokes([]);
      setCalc(EMPTY_CALC);
      setConv(null);
      setFill(null);
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

  const quit = () => setConfirmQuit(true);
  const leave = () => void navigate(`/jouer/entrainement/${chapter?.subject ?? 'maths'}/${chapterId}`);

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
        gender={profile.gender}
        chapterId={chapterId}
        onReplay={() => void navigate(location.pathname, { replace: true, state: { replay: Date.now() } })}
      />
    );

  const done = regularCount(training);
  const skill = current ? getSkill(current.plan.skillId) : undefined;
  const tabs: ToolTab[] = [
    'brouillon',
    ...(skill?.tools?.includes('calculatrice') ? (['calculatrice'] as const) : []),
    ...(skill?.tools?.some((t) => t.startsWith('conversion')) ? (['conversion'] as const) : []),
  ];
  const activeTab = tabs.includes(tab) ? tab : 'brouillon';
  const openTool = (t: ToolTab) => {
    setTab(t);
    setToolsOpen(true);
  };
  const kind = current ? conversionKind(current.question) : 'longueur';
  const convState = conv ?? emptyConversion(kind);

  const reportConfused = () => {
    setLesson(true);
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
        <GameButton
          variant="danger"
          size="sm"
          iconOnly
          icon="icons-navigation-close"
          onClick={quit}
          aria-label="Quitter la partie"
        />
        <ProgressBar
          className="flex-1"
          value={done}
          max={TRAINING_LENGTH}
          label="Progression de la série"
          segments={TRAINING_LENGTH}
          text={`${Math.min(done + (answered ? 0 : 1), TRAINING_LENGTH)}/${TRAINING_LENGTH}`}
        />
        <ResourceCounter icon="icons-resources-xp" value={xpTotal} label={`${xpTotal} XP gagnés`} />
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
            className="land:grid land:grid-cols-[minmax(0,1fr)_minmax(340px,400px)] flex min-h-0 flex-1 flex-col gap-3"
          >
            {/* Colonne question : énoncé, figure, outils (défile si besoin, sans jamais cacher la réponse). */}
            <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-1 [&>*]:shrink-0">
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
              {current.question.figure && (
                <Figure
                  figure={current.question.figure}
                  maxHeight={toolsOpen ? '22dvh' : '46dvh'}
                  picked={picked}
                  onPick={current.question.answer.kind === 'point' && !answered ? setPicked : undefined}
                  reveal={
                    answered && !answered.correct && current.question.answer.kind === 'point'
                      ? current.question.answer
                      : null
                  }
                />
              )}
              {toolsOpen ? (
                <div className="land:h-auto land:min-h-[45dvh] land:flex-1 flex h-[50dvh] flex-col">
                  <ToolsPanel tabs={tabs} active={activeTab} onSelect={setTab} onClose={() => setToolsOpen(false)}>
                    {activeTab === 'brouillon' && <Brouillon strokes={strokes} onChange={setStrokes} />}
                    {activeTab === 'calculatrice' && (
                      <Calculator
                        state={calc}
                        onChange={setCalc}
                        onUse={
                          current.question.answer.kind === 'number' && !answered
                            ? (value) => {
                                setFill({ value, nonce: Date.now() });
                                if (!window.matchMedia('(orientation: landscape) and (min-width: 900px)').matches)
                                  setToolsOpen(false);
                              }
                            : undefined
                        }
                      />
                    )}
                    {activeTab === 'conversion' && (
                      <ConversionTable
                        kind={kind}
                        state={convState}
                        onChange={setConv}
                        highlight={unitsIn(current.question.prompt)}
                      />
                    )}
                  </ToolsPanel>
                </div>
              ) : (
                !answered && (
                  <div className="flex flex-wrap gap-2" aria-label="Outils">
                    {tabs.map((t) => (
                      <ToolButton
                        key={t}
                        label={
                          t === 'brouillon'
                            ? 'Brouillon'
                            : t === 'calculatrice'
                              ? 'Calculatrice'
                              : 'Tableau de conversion'
                        }
                        onClick={() => openTool(t)}
                      />
                    ))}
                  </div>
                )
              )}
            </section>

            {/* Colonne réponse : toujours visible (en bas en portrait, à droite en paysage). */}
            <section className="land:max-h-none land:justify-center flex max-h-[60dvh] min-h-0 shrink-0 flex-col">
              {answered ? (
                <Feedback
                  question={current.question}
                  correct={answered.correct}
                  why={answered.why}
                  xp={answered.xp}
                  streak={answered.streak}
                  variantNext={training.pendingVariant !== null}
                  gender={profile.gender}
                  onLesson={reportConfused}
                  onNext={() => void next()}
                />
              ) : (
                <>
                  {toolsOpen && (
                    <button
                      type="button"
                      onClick={() => setToolsOpen(false)}
                      className="cartoon cartoon-press bg-primary font-display land:hidden min-h-14 text-xl text-white"
                    >
                      Revenir à ma réponse
                    </button>
                  )}
                  <div className={toolsOpen ? 'land:block hidden' : 'contents'}>
                    <AnswerInput
                      key={`${current.plan.seed}-${current.plan.variant}-${fill?.nonce ?? 0}`}
                      question={current.question}
                      disabled={false}
                      onSubmit={submit}
                      picked={picked}
                      initialText={fill?.value}
                    />
                  </div>
                </>
              )}
            </section>
          </motion.main>
        )}
      </AnimatePresence>
      {lesson && skill && current && (
        <NotUnderstood
          skill={skill}
          level={current.plan.level}
          seed={current.plan.seed}
          onClose={() => setLesson(false)}
        />
      )}
      {confirmQuit && (
        <ConfirmDialog
          title="Quitter la partie ?"
          message="Ta progression sur cette série ne sera pas comptée."
          confirm="Quitter"
          cancel="Continuer à jouer"
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
  gender,
  chapterId,
  onReplay,
}: {
  summary: SessionSummary;
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
          className="bg-accent font-display text-toon cartoon px-8 py-2 text-3xl tracking-wide sm:text-4xl"
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
