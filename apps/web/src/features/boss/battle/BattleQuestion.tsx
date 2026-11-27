import { AnimatePresence, motion } from 'motion/react';
import type { Question, Response, Skill } from '@epicademie/content';
import type { BattleView, ItemId } from '@epicademie/shared';
import { Figure } from '../../../shared/question/figures/Figure.tsx';
import { MathText } from '../../../shared/question/MathText.tsx';
import { ReportButton } from '../../../shared/question/ReportButton.tsx';
import { QuestionTools } from '../../../shared/question/QuestionTools.tsx';
import { DOCK_HEIGHT } from '../../../shared/question/tools.ts';
import { GameIcon } from '../../../shared/ui/game/GameIcon.tsx';
import { HELP_MEDAL_NOTE, hintWarning, STAGE_LABEL, type Missed } from './constants.ts';
import { ItemBar } from './ItemBar.tsx';
import { itemRefusal } from '@epicademie/engine';
import { MissedPanel } from './MissedPanel.tsx';

type Point = { readonly x: number; readonly y: number };

/**
 * Question du combat : énoncé (avec étape du boss, objets, indice et figure) et zone de
 * réponse, remplacée après une erreur par le panneau d'explication.
 */
export function BattleQuestion({
  battle,
  question,
  skill,
  missed,
  busy,
  picked,
  onPick,
  onSubmit,
  onUseItem,
  onAskHint,
  onMemo,
  onNext,
}: {
  readonly battle: BattleView & { readonly question: NonNullable<BattleView['question']> };
  readonly question: Question;
  readonly skill: Skill | undefined;
  readonly missed: Missed | null;
  readonly busy: boolean;
  readonly picked: Point | null;
  readonly onPick: (point: Point | null) => void;
  readonly onSubmit: (response: Response) => void;
  readonly onUseItem: (item: ItemId) => void;
  /** Indice sans objet (attaque un peu moins forte). */
  readonly onAskHint: () => void;
  readonly onMemo: () => void;
  readonly onNext: (battle: BattleView) => void;
}) {
  const q = battle.question;
  const hintItem = itemRefusal(battle, 'indice') === null;
  const pointAnswer = question.answer.kind === 'point';
  const diamondOpen = battle.hearts >= battle.maxHearts;
  // Un objet Indice équipé s'il en reste (pleine puissance), sinon un indice avec une attaque moins forte.
  const askHint = () => (hintItem ? onUseItem('indice') : onAskHint());
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={`${q.seed}-${battle.turn}`}
        data-turn={battle.turn}
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -30, opacity: 0 }}
        className="side:grid side:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] xl:side:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] flex min-h-0 flex-1 flex-col gap-3"
      >
        <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-1 [&>*]:shrink-0">
          <div className="flex items-center gap-2">
            {/* Étape du boss seulement (pas de « Mob », pas de titre de notion pendant le combat). */}
            {q.stage !== 'mob' && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${q.stage === 'piege' ? 'bg-danger' : 'bg-accent'}`}
              >
                {STAGE_LABEL[q.stage]}
              </span>
            )}
            <span className="flex-1" />
            <ItemBar battle={battle} disabled={busy || missed !== null} onUse={onUseItem} />
            <ReportButton question={question} />
          </div>
          <h1 className="text-2xl leading-snug font-bold sm:text-3xl xl:text-4xl">
            <MathText text={question.prompt} terms />
          </h1>
          {!battle.hintShown && !missed && (
            <button
              type="button"
              disabled={busy}
              onClick={askHint}
              className="cartoon cartoon-press bg-surface-2 flex items-center gap-1.5 self-start px-3 py-1.5 text-sm font-bold"
            >
              <GameIcon id="icons-navigation-hint" size="xs" />
              {hintItem ? 'Un indice (objet)' : 'Un indice (attaque un peu moins forte)'}
            </button>
          )}
          {/* Annoncé avant l'aide, tant que le diamant est encore en jeu (aucun cœur perdu). */}
          {!battle.hintShown && !missed && diamondOpen && (
            <p className="text-muted text-sm font-bold">{HELP_MEDAL_NOTE}</p>
          )}
          {battle.weakAttack && (
            <p className="text-muted text-sm font-bold">Avec l’indice, ton attaque sera un peu moins forte.</p>
          )}
          {battle.hintShown && (
            <p className="cartoon bg-surface-2 flex items-start gap-2 px-3 py-2 font-bold" role="note">
              <GameIcon id="icons-navigation-hint" size="xs" />
              <span>
                <strong>Indice :</strong> <MathText text={question.hint} />
              </span>
            </p>
          )}
          {question.figure && (
            <Figure
              figure={question.figure}
              maxHeight="var(--figure-max)"
              picked={picked}
              onPick={pointAnswer && !missed ? onPick : undefined}
              reveal={missed && question.answer.kind === 'point' ? question.answer : null}
            />
          )}
        </section>

        <section
          className={`side:h-[min(100%,520px)] xl:side:h-[min(100%,680px)] side:self-center flex ${DOCK_HEIGHT} min-h-0 shrink-0 flex-col`}
        >
          {missed ? (
            <MissedPanel
              question={question}
              missed={missed}
              canMemo={skill !== undefined}
              onMemo={onMemo}
              onNext={() => onNext(missed.next)}
            />
          ) : (
            <QuestionTools
              key={`${q.seed}-${battle.turn}`}
              question={question}
              skill={skill}
              picked={picked}
              onSubmit={onSubmit}
              // « ? » : le même indice que le bouton, après confirmation.
              onUnknown={battle.hintShown ? undefined : askHint}
              unknownWarning={hintWarning(hintItem, diamondOpen)}
            />
          )}
        </section>
      </motion.main>
    </AnimatePresence>
  );
}
