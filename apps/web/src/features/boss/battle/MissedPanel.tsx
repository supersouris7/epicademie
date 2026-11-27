import { motion } from 'motion/react';
import { GameButton } from '../../../shared/ui/game/GameButton.tsx';
import { MathText } from '../../../shared/question/MathText.tsx';
import { formatAnswer, formatResponse } from '../../../shared/question/answers.ts';

import type { Question } from '@epicademie/content';
import type { Missed } from './constants.ts';

/**
 * Pas encore : la réponse donnée, la bonne, pourquoi, la méthode pas à pas, puis la proposition de
 * réessayer une question du même type (l'adversaire en pose toujours une).
 */
export function MissedPanel({
  question,
  missed,
  canMemo,
  onMemo,
  onNext,
  onPause,
}: {
  readonly question: Question;
  readonly missed: Missed;
  readonly canMemo: boolean;
  readonly onMemo: () => void;
  readonly onNext: () => void;
  readonly onPause: () => void;
}) {
  const fighting = missed.next.status === 'fighting';
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="cartoon flex min-h-0 flex-1 flex-col gap-2 bg-[color-mix(in_srgb,var(--danger)_12%,var(--surface))] p-3"
      aria-live="polite"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        <p className="text-lg leading-snug">
          Tu as répondu <MathText text={formatResponse(question, missed.given)} className="font-bold" />. La bonne
          réponse : <MathText text={formatAnswer(question)} className="font-bold" />.
        </p>
        {missed.why && (
          <p className="text-lg">
            <MathText text={missed.why} />
          </p>
        )}
        <ol className="flex flex-col gap-1.5">
          {question.steps.map((s, i) => (
            <li key={i} className="bg-surface rounded-2xl p-2.5 text-lg leading-snug">
              <MathText text={s} />
            </li>
          ))}
        </ol>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        {fighting && <p className="w-full text-right font-bold">Tu veux réessayer une question du même type ?</p>}
        {canMemo && (
          <GameButton variant="surface" size="sm" icon="icons-navigation-hint" onClick={onMemo}>
            Le truc à retenir
          </GameButton>
        )}
        {fighting && (
          <GameButton variant="surface" size="sm" onClick={onPause}>
            Pas maintenant
          </GameButton>
        )}
        <GameButton icon="icons-navigation-next" onClick={onNext}>
          {fighting ? 'Oui, j’essaie' : 'Voir le résultat'}
        </GameButton>
      </div>
    </motion.div>
  );
}
