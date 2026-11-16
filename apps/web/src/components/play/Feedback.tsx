import { motion } from 'motion/react';
import type { Question } from '@questeo/content';
import { accord, type Gender } from '@questeo/shared';
import { formatAnswer } from '../../lib/answers.ts';
import { Button } from '../Button.tsx';
import { MathText } from '../MathText.tsx';
import { Questy } from '../mascot/Questy.tsx';
import type { MoodId } from '../mascot/moods.ts';

interface FeedbackProps {
  readonly question: Question;
  readonly correct: boolean;
  readonly why?: string;
  readonly xp: number;
  readonly streak: number;
  readonly variantNext: boolean;
  readonly gender: Gender | null;
  readonly onLesson: () => void;
  readonly onNext: () => void;
}

const PRAISE = ['Bravo !', 'Excellent !', 'Parfait !', 'Bien joué !', 'Génial !', 'Trop fort !'];

function praise(seed: number, streak: number, gender: Gender | null): string {
  if (streak >= 10) return accord(gender, 'Champion !', 'Championne !');
  if (streak >= 5) return accord(gender, 'Inarrêtable !', 'Inarrêtable !');
  return PRAISE[(seed + streak) % PRAISE.length] ?? 'Bravo !';
}

/** Retour après une réponse : félicitations, ou explication de l'erreur + correction pas-à-pas. */
export function Feedback({ question, correct, why, xp, streak, variantNext, gender, onLesson, onNext }: FeedbackProps) {
  const mood: MoodId = correct ? (streak >= 10 ? 'proud' : streak >= 5 ? 'laugh' : 'happy') : why ? 'dizzy' : 'sad';
  const title = correct ? praise(question.seed, streak, gender) : 'Pas tout à fait…';
  return (
    <motion.section
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`cartoon flex min-h-0 flex-col gap-3 p-4 ${correct ? 'bg-[color-mix(in_srgb,var(--success)_18%,var(--surface))]' : 'bg-[color-mix(in_srgb,var(--danger)_14%,var(--surface))]'}`}
      aria-live="assertive"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.4, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 12 }}
          >
            <Questy mood={mood} size={84} />
          </motion.div>
          <div className="flex flex-col">
            <h2 className="font-display text-3xl tracking-wide">{title}</h2>
            {correct ? (
              <p className="text-lg font-bold">
                +{xp} XP{streak >= 3 ? ` · série de ${streak} !` : ''}
              </p>
            ) : (
              <p className="text-lg">
                La bonne réponse :{' '}
                <strong className="text-xl">
                  <MathText text={formatAnswer(question)} />
                </strong>
              </p>
            )}
          </div>
        </div>

        {!correct && (
          <>
            {why && (
              <div className="bg-surface rounded-2xl p-4">
                <p className="font-display text-xl tracking-wide">Pourquoi c’est faux ?</p>
                <p className="text-lg">
                  <MathText text={why} />
                </p>
              </div>
            )}
            <div className="bg-surface rounded-2xl p-4">
              <p className="font-display text-xl tracking-wide">La correction</p>
              <ol className="mt-1 flex list-decimal flex-col gap-1 pl-6 text-lg">
                {question.steps.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.6 }}
                  >
                    <MathText text={s} />
                  </motion.li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap justify-end gap-3">
        {!correct && (
          <Button variant="surface" onClick={onLesson}>
            Je n’ai pas compris
          </Button>
        )}
        <Button variant={correct ? 'success' : 'primary'} onClick={onNext}>
          {variantNext ? 'Question similaire →' : 'Suivant →'}
        </Button>
      </div>
    </motion.section>
  );
}
