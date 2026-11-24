import { motion } from 'motion/react';
import { GameButton } from '../../../shared/ui/game/GameButton.tsx';
import { MathText } from '../../../shared/question/MathText.tsx';
import { formatAnswer, formatResponse } from '../../../shared/question/answers.ts';

import type { Question } from '@epicademie/content';
import type { Missed } from './constants.ts';

/** Après une erreur : la réponse donnée, la bonne, pourquoi, et la méthode pas à pas. */
export function MissedPanel({
  question,
  missed,
  canMemo,
  onMemo,
  onNext,
}: {
  readonly question: Question;
  readonly missed: Missed;
  readonly canMemo: boolean;
  readonly onMemo: () => void;
  readonly onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="cartoon flex min-h-0 flex-1 flex-col gap-2 bg-[color-mix(in_srgb,var(--danger)_12%,var(--surface))] p-3"
      aria-live="polite"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        <p className="text-lg leading-snug">
          {missed.given.kind === 'unknown' ? (
            'Tu ne savais pas : regarde bien comment on fait. '
          ) : (
            <>
              Tu as répondu <MathText text={formatResponse(question, missed.given)} className="font-bold" />.{' '}
            </>
          )}
          La bonne réponse : <MathText text={formatAnswer(question)} className="font-bold" />.
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
      <div className="flex shrink-0 flex-wrap justify-end gap-2">
        {canMemo && (
          <GameButton variant="surface" size="sm" icon="icons-navigation-hint" onClick={onMemo}>
            Le truc à retenir
          </GameButton>
        )}
        <GameButton icon="icons-navigation-next" onClick={onNext}>
          {missed.next.status === 'fighting' ? 'Suivant' : 'Voir le résultat'}
        </GameButton>
      </div>
    </motion.div>
  );
}
