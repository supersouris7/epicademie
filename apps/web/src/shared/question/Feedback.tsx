import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { Question, Response } from '@questeo/content';
import { accord, type Gender } from '@questeo/shared';
import { formatAnswer, formatResponse } from './answers.ts';
import { GameButton } from '../ui/game/GameButton.tsx';
import { GameIcon } from '../ui/game/GameIcon.tsx';
import { MathText } from './MathText.tsx';
import { Questy } from '../ui/mascot/Questy.tsx';
import type { MoodId } from '../ui/mascot/moods.ts';
import { DemoView } from './demos/DemoView.tsx';

interface FeedbackProps {
  readonly question: Question;
  readonly correct: boolean;
  /** Bonne réponse trouvée au 2e essai, après l'indice. */
  readonly retried?: boolean;
  readonly why?: string;
  /** Réponse donnée (pour « Tu as répondu … »). */
  readonly given?: Response;
  readonly xp: number;
  readonly streak: number;
  readonly gender: Gender | null;
  readonly onMemo: () => void;
  readonly onNext: () => void;
}

const PRAISE = ['Bravo !', 'Excellent !', 'Parfait !', 'Bien joué !', 'Génial !', 'Trop fort !'];

function praise(seed: number, streak: number, gender: Gender | null): string {
  if (streak >= 10) return accord(gender, 'Champion !', 'Championne !');
  if (streak >= 5) return accord(gender, 'Inarrêtable !', 'Inarrêtable !');
  return PRAISE[(seed + streak) % PRAISE.length] ?? 'Bravo !';
}

/** Écran bas (téléphone couché) : Questy et boutons plus petits pour laisser voir l'explication. */
const isShort = () => typeof window !== 'undefined' && window.matchMedia('(max-height: 500px)').matches;

/** Retour après une réponse : félicitations, ou explication de Questy bulle par bulle. */
export function Feedback(props: FeedbackProps) {
  return props.correct ? <Success {...props} /> : <Explanation {...props} />;
}

/** Après une bonne réponse, on enchaîne vite tout seul après l'annonce des XP : aucun bouton. */
export const AUTO_NEXT_MS = 1200;

function Success({ question, retried, xp, streak, gender, onNext }: FeedbackProps) {
  const short = isShort();
  // onNext change à chaque rendu du parent : on garde la dernière version sans relancer le minuteur.
  const next = useRef(onNext);
  useEffect(() => {
    next.current = onNext;
  }, [onNext]);
  useEffect(() => {
    const t = setTimeout(() => next.current(), AUTO_NEXT_MS);
    return () => clearTimeout(t);
  }, []);
  const mood: MoodId = retried ? 'wink' : streak >= 10 ? 'proud' : streak >= 5 ? 'laugh' : 'happy';
  return (
    <motion.section
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="cartoon flex min-h-0 flex-col gap-3 bg-[color-mix(in_srgb,var(--success)_18%,var(--surface))] p-4"
      aria-live="assertive"
    >
      <div className="flex min-h-0 flex-1 items-center gap-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.4, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 12 }}
        >
          <Questy mood={mood} size={short ? 72 : 110} />
        </motion.div>
        <div className="flex flex-col">
          <h2 className="font-display flex items-center gap-2 text-3xl tracking-wide [@media(max-height:500px)]:text-2xl">
            <GameIcon id="icons-status-correct" size="sm" />
            {retried ? 'Bien rattrapé !' : praise(question.seed, streak, gender)}
          </h2>
          <p className="text-lg font-bold">
            {retried
              ? 'Tu as trouvé avec l’indice. Tu progresses !'
              : `+${xp} XP${streak >= 3 ? ` · série de ${streak} !` : ''}`}
          </p>
        </div>
      </div>
    </motion.section>
  );
}

/**
 * « On regarde ensemble » : Questy part de la réponse de l'enfant, dit ce qui cloche, puis explique
 * la question pas à pas (une bulle par appui sur « Suivant »). L'explication ne se passe pas :
 * on lit chaque étape, et seulement à la fin « Vérifions si j'ai compris » mène à la suite.
 */
function Explanation({ question, why, given, onMemo, onNext }: FeedbackProps) {
  const short = isShort();
  const steps = question.steps;
  // Première bulle + première étape d'emblée : un appui de moins.
  const [shown, setShown] = useState(Math.min(1, steps.length));
  const done = shown >= steps.length;
  const box = useRef<HTMLDivElement>(null);
  // Chaque nouvelle bulle reste visible : on fait défiler jusqu'en bas.
  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [shown]);

  return (
    <motion.section
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="cartoon flex min-h-0 flex-1 flex-col gap-2 bg-[color-mix(in_srgb,var(--danger)_12%,var(--surface))] p-3 sm:p-4"
      aria-live="polite"
      aria-label="Explication de Questy"
    >
      <div className="flex shrink-0 items-center gap-3">
        <Questy mood={why ? 'wink' : 'ok'} size={short ? 56 : 80} />
        <h2 className="sr-only">On regarde ensemble</h2>
        <span className="flex-1" />
        <button
          type="button"
          onClick={onMemo}
          className="cartoon cartoon-press bg-surface-2 flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-sm font-bold whitespace-nowrap"
        >
          <GameIcon id="icons-navigation-hint" size="xs" />
          Le truc à retenir
        </button>
      </div>

      <div ref={box} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto scroll-smooth pr-1 [&>*]:shrink-0">
        <Bubble>
          {given?.kind === 'unknown' ? (
            <>Tu ne savais pas : c’est justement pour ça qu’on regarde ensemble. </>
          ) : (
            given && (
              <>
                Tu as répondu <MathText text={formatResponse(question, given)} className="font-bold" />.{' '}
              </>
            )
          )}
          La bonne réponse : <MathText text={formatAnswer(question)} className="font-bold" />.
          {why && (
            <span className="mt-1 block">
              <MathText text={why} terms />
            </span>
          )}
          <span className="text-muted mt-1 block text-base font-bold">
            Pas de panique : on regarde ensemble pourquoi. Lis chaque étape, c’est comme ça qu’on réussit la prochaine !
          </span>
        </Bubble>
        {steps.slice(0, shown).map((s, i) => (
          <Bubble key={i} step={i + 1}>
            <MathText text={s} terms />
            {i === 0 && question.demo && (
              <span className="mt-2 block">
                <DemoView demo={question.demo} />
              </span>
            )}
          </Bubble>
        ))}
      </div>

      <div className="flex shrink-0 justify-end">
        {done ? (
          <GameButton size={short ? 'sm' : undefined} icon="icons-navigation-next" onClick={onNext}>
            Vérifions si j’ai compris
          </GameButton>
        ) : (
          <GameButton
            variant="accent"
            size={short ? 'sm' : undefined}
            icon="icons-navigation-next"
            onClick={() => setShown((n) => n + 1)}
            aria-label="Suivant : étape suivante de l’explication"
          >
            Suivant
          </GameButton>
        )}
      </div>
    </motion.section>
  );
}

function Bubble({ step, children }: { readonly step?: number; readonly children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface flex gap-2 rounded-2xl rounded-tl-sm p-3 text-lg leading-snug"
    >
      {step !== undefined && (
        <span className="bg-accent font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base text-white">
          {step}
        </span>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </motion.div>
  );
}
