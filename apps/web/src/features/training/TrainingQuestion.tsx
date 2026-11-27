import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { getChapterOfSkill, type Question, type Response, type Skill } from '@epicademie/content';
import type { Profile } from '@epicademie/shared';
import { Feedback } from '../../shared/question/Feedback.tsx';
import { Figure } from '../../shared/question/figures/Figure.tsx';
import { ListenButton } from '../../shared/question/ListenButton.tsx';
import { READ_ALOUD_GRADES } from '../../shared/lib/speech.ts';
import { MathText } from '../../shared/question/MathText.tsx';
import { QuestionTools } from '../../shared/question/QuestionTools.tsx';
import { ReportButton } from '../../shared/question/ReportButton.tsx';
import { DOCK_HEIGHT, toolTabs } from '../../shared/question/tools.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { GameIcon } from '../../shared/ui/game/GameIcon.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import type { Current, Help, Retry, TrainingScreen } from './state.ts';

type Point = { readonly x: number; readonly y: number };

/**
 * Question en cours : énoncé (notion, niveau, 2e essai, conseil d'outil, figure) et zone de
 * réponse, remplacée par la correction une fois la réponse donnée. Après une erreur,
 * l'explication prend la place des outils et s'agrandit (l'énoncé reste en haut).
 */
export function TrainingQuestion({
  screen,
  skill,
  gender,
  epreuve,
  onPick,
  onSubmit,
  onNext,
  onHelp,
  onCloseExplanation,
  onMemo,
}: {
  readonly screen: TrainingScreen;
  readonly skill: Skill | undefined;
  readonly gender: Profile['gender'];
  /** Épreuve du chapitre : indice seulement, l'explication vient après la réponse. */
  readonly epreuve: boolean;
  readonly onHelp: (help: Help) => void;
  readonly onCloseExplanation: () => void;
  readonly onPick: (point: Point | null) => void;
  readonly onSubmit: (response: Response) => void;
  readonly onNext: (skipSimilar?: boolean) => void;
  readonly onMemo: () => void;
}) {
  const { current, answered, picked } = screen;
  const advice = current?.advise ? skill?.advice : undefined;
  const explaining = answered !== null && !answered.correct;
  return (
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
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <QuestionMeta title={skill?.title} variant={current.plan.variant} level={current.plan.level} />
              </div>
              <ReportButton question={current.question} />
            </div>
            <h1 className="text-2xl leading-snug font-bold sm:text-3xl xl:text-4xl">
              <MathText text={current.question.prompt} terms />
            </h1>
            <ListenButton
              question={current.question}
              readPrompt={READ_ALOUD_GRADES.includes(getChapterOfSkill(current.question.skillId)?.grade ?? '')}
            />
            <StatementHelp
              screen={screen}
              question={current.question}
              epreuve={epreuve}
              onHelp={onHelp}
              onCloseExplanation={onCloseExplanation}
            />
            {advice && !answered && !screen.retry && toolTabs(current.question, skill).includes(advice) && (
              <AdviceNote advice={advice} />
            )}
            {current.question.figure && (
              <Figure
                figure={current.question.figure}
                maxHeight="var(--figure-max)"
                picked={picked}
                onPick={current.question.answer.kind === 'point' && !answered ? onPick : undefined}
                reveal={revealedPoint(current.question, explaining)}
              />
            )}
            <ZoneReveal question={current.question} explaining={explaining} />
          </section>

          {/* Écran coupé : pavé et outils en bas (portrait) ou sur le côté (paysage). */}
          <AnswerDock
            screen={screen}
            current={current}
            skill={skill}
            advice={advice}
            gender={gender}
            onSubmit={onSubmit}
            onNext={onNext}
            onHint={() => onHelp('hint')}
            onMemo={onMemo}
          />
        </motion.main>
      )}
    </AnimatePresence>
  );
}

/** Après une erreur sur un point : la bonne réponse apparaît sur la figure. */
const revealedPoint = (question: Question, explaining: boolean) =>
  explaining && question.answer.kind === 'point' ? question.answer : null;

/** 2e essai : Questy dit ce qui cloche (s'il le sait) et donne l'indice. */
function RetryHint({ retry, hint }: { readonly retry: Retry; readonly hint: string }) {
  return (
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
        {retry.why ? <MathText text={retry.why} /> : 'Pas encore…'}
        <span className="mt-1 flex items-start gap-1.5">
          <GameIcon id="icons-navigation-hint" size="xs" />
          <span>
            <strong>Indice :</strong> <MathText text={hint} />
          </span>
        </span>
        <span className="text-muted mt-1 block">Relis l’indice et réfléchis avant de répondre. Essaie encore !</span>
      </span>
    </motion.p>
  );
}

/**
 * Sous l'énoncé, tant qu'on n'a pas répondu : l'indice du 2e essai ou celui demandé, les boutons
 * d'aide, et l'explication complète quand elle est ouverte.
 */
function StatementHelp({
  screen,
  question,
  epreuve,
  onHelp,
  onCloseExplanation,
}: {
  readonly screen: TrainingScreen;
  readonly question: Question;
  readonly epreuve: boolean;
  readonly onHelp: (help: Help) => void;
  readonly onCloseExplanation: () => void;
}) {
  const [explanationOpen, setExplanationOpen] = useState(false);
  const { answered, retry, help } = screen;
  if (answered) return null;
  const asked = help.includes('hint');
  const explain = () => {
    onHelp('explanation');
    setExplanationOpen(true);
  };
  return (
    <>
      {retry && <RetryHint retry={retry} hint={question.hint} />}
      {!retry && asked && <HintNote hint={question.hint} />}
      <HelpButtons
        hintShown={retry !== null || asked}
        onHint={() => onHelp('hint')}
        onExplain={epreuve ? undefined : explain}
      />
      {explanationOpen && (
        <FullExplanation
          question={question}
          onClose={() => {
            setExplanationOpen(false);
            onCloseExplanation();
          }}
        />
      )}
    </>
  );
}

/** Indice demandé avant de répondre. */
function HintNote({ hint }: { readonly hint: string }) {
  return (
    <p className="cartoon bg-surface-2 flex items-start gap-2 px-3 py-2 font-bold" role="status">
      <GameIcon id="icons-navigation-hint" size="xs" />
      <span>
        <strong>Indice :</strong> <MathText text={hint} />
      </span>
    </p>
  );
}

/** Aides à tout moment, sans coût (à l'Épreuve : l'indice seulement). */
function HelpButtons({
  hintShown,
  onHint,
  onExplain,
}: {
  readonly hintShown: boolean;
  readonly onHint: () => void;
  readonly onExplain: (() => void) | undefined;
}) {
  const button = 'cartoon cartoon-press bg-surface-2 flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold';
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Aide">
      {!hintShown && (
        <button type="button" onClick={onHint} className={button}>
          <GameIcon id="icons-navigation-hint" size="xs" />
          Un indice
        </button>
      )}
      {onExplain && (
        <button type="button" onClick={onExplain} className={button}>
          <GameIcon id="icons-navigation-lesson" size="xs" />
          Explique-moi
        </button>
      )}
    </div>
  );
}

/** Explication complète demandée avant de répondre : ensuite, l'enfant répond à la même question. */
function FullExplanation({ question, onClose }: { readonly question: Question; readonly onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Explication complète"
    >
      <div className="cartoon bg-surface flex max-h-[85dvh] w-full max-w-xl flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <Questy mood="wink" size={64} />
          <h2 className="font-display text-2xl tracking-wide">On regarde ensemble</h2>
        </div>
        <ol className="flex min-h-0 flex-col gap-2 overflow-y-auto">
          {question.steps.map((s, i) => (
            <li key={i} className="bg-surface-2 rounded-2xl p-3 text-lg leading-snug">
              <MathText text={s} />
            </li>
          ))}
        </ol>
        <GameButton className="self-end" variant="success" onClick={onClose}>
          J’essaie
        </GameButton>
      </div>
    </div>
  );
}

/** Conseil d'outil de Questy (1re question de chaque notion). */
function AdviceNote({ advice }: { readonly advice: NonNullable<Skill['advice']> }) {
  return (
    <p className="flex items-center gap-2 text-base font-bold" role="note">
      <Questy mood={advice === 'calculatrice' ? 'happy' : 'wink'} size={64} />
      <span className="cartoon bg-surface-2 px-3 py-1.5">
        {advice === 'calculatrice'
          ? 'Tu peux t’aider de la calculatrice.'
          : 'Je te conseille de faire un brouillon pour cette question.'}
      </span>
    </p>
  );
}

/** Notion, « question similaire » (variante) et niveau. */
function QuestionMeta({
  title,
  variant,
  level,
}: {
  readonly title: string | undefined;
  readonly variant: boolean;
  readonly level: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted text-sm font-bold">{title}</span>
      {variant && (
        <span className="bg-accent rounded-full px-2 py-0.5 text-xs font-bold text-white">Question similaire</span>
      )}
      <span className="text-muted ml-auto text-sm font-bold">Niveau {level}</span>
    </div>
  );
}

/** Zone de réponse (outils) puis correction ; après une erreur, l'explication s'agrandit. */
function AnswerDock({
  screen,
  current,
  skill,
  advice,
  gender,
  onSubmit,
  onNext,
  onHint,
  onMemo,
}: {
  readonly screen: TrainingScreen;
  readonly current: Current;
  readonly skill: Skill | undefined;
  readonly advice: Skill['advice'];
  readonly gender: Profile['gender'];
  readonly onSubmit: (response: Response) => void;
  readonly onNext: (skipSimilar?: boolean) => void;
  readonly onHint: () => void;
  readonly onMemo: () => void;
}) {
  const { answered, retry, picked, help, training } = screen;
  const explaining = answered !== null && !answered.correct;
  return (
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
          gender={gender}
          onMemo={onMemo}
          similar={training.pendingVariant !== null}
          onNext={() => onNext()}
          onSkip={() => onNext(true)}
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
          onSubmit={onSubmit}
          // « ? » : l'indice, tout de suite et sans coût.
          onUnknown={retry || help.includes('hint') ? undefined : onHint}
        />
      )}
    </section>
  );
}

/** Après une erreur sur une zone : la carte s'affiche avec la bonne zone surlignée. */
function ZoneReveal({ question, explaining }: { readonly question: Question; readonly explaining: boolean }) {
  const a = question.answer;
  if (!explaining || a.kind !== 'zone') return null;
  return <Figure figure={{ kind: 'map', map: a.map, highlight: [a.zone] }} maxHeight="var(--figure-max)" />;
}
