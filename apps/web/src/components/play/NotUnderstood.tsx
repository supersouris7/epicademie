import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { generate, type Level, type Skill } from '@questeo/content';
import { formatAnswer } from '../../lib/answers.ts';
import { Button } from '../Button.tsx';
import { MathText } from '../MathText.tsx';
import { Figure } from '../figures/Figure.tsx';
import { Questy } from '../mascot/Questy.tsx';

interface NotUnderstoodProps {
  readonly skill: Skill;
  readonly level: Level;
  readonly seed: number;
  readonly onClose: () => void;
}

/** « Je n'ai pas compris » : la leçon, puis un nouvel exemple résolu étape par étape. */
export function NotUnderstood({ skill, level, seed, onClose }: NotUnderstoodProps) {
  const [part, setPart] = useState<'lecon' | 'exemple'>('lecon');
  const [shown, setShown] = useState(0);
  // Nouvel exemple de la même notion (graine différente, niveau 1 ou celui en cours).
  const example = useMemo(
    () => generate(skill.id, Math.min(level, 2) as Level, (seed * 7919 + 17) % 2_000_000_000),
    [skill.id, level, seed],
  );
  const done = shown >= example.steps.length;
  const { lesson } = skill;
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Aide : ${skill.title}`}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="cartoon bg-surface flex max-h-[92dvh] w-full max-w-2xl flex-col gap-4 overflow-y-auto p-5"
      >
        <div className="flex items-center gap-3">
          <Questy mood={part === 'lecon' ? 'wink' : done ? 'happy' : 'ok'} size={64} />
          <h2 className="font-display text-3xl tracking-wide">{part === 'lecon' ? skill.title : 'Exemple guidé'}</h2>
        </div>

        {part === 'lecon' ? (
          <>
            {lesson.body.map((p, i) => (
              <p key={i} className="text-xl leading-relaxed">
                <MathText text={p} />
              </p>
            ))}
            <p className="text-muted text-sm">Source : {lesson.source}</p>
            <Button className="self-end" onClick={() => setPart('exemple')}>
              Voir un exemple guidé →
            </Button>
          </>
        ) : (
          <>
            <p className="text-2xl font-bold">
              <MathText text={example.prompt} />
            </p>
            {example.figure && (
              <Figure
                figure={example.figure}
                reveal={done && example.answer.kind === 'point' ? example.answer : null}
              />
            )}
            <ol className="flex list-decimal flex-col gap-2 pl-6 text-xl">
              {example.steps.slice(0, shown).map((s, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <MathText text={s} />
                </motion.li>
              ))}
            </ol>
            {done && (
              <p className="bg-surface-2 rounded-2xl p-3 text-xl">
                Réponse :{' '}
                <strong>
                  <MathText text={formatAnswer(example)} />
                </strong>
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-3">
              {!done ? (
                <Button onClick={() => setShown((n) => n + 1)}>
                  {shown === 0 ? 'Première étape' : 'Étape suivante'}
                </Button>
              ) : (
                <Button variant="success" onClick={onClose}>
                  J’ai compris, je réessaie
                </Button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
