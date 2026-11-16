import { motion } from 'motion/react';
import type { Skill } from '@questeo/content';
import { Button } from '../Button.tsx';
import { MathText } from '../MathText.tsx';

/** Fiche « Revoir la leçon » d'une notion. */
export function LessonSheet({ skill, onClose }: { readonly skill: Skill; readonly onClose: () => void }) {
  const { lesson } = skill;
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Leçon : ${skill.title}`}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="cartoon bg-surface flex max-h-[90dvh] w-full max-w-2xl flex-col gap-4 overflow-y-auto p-5"
      >
        <h2 className="font-display text-3xl tracking-wide">{skill.title}</h2>
        {lesson.body.map((p, i) => (
          <p key={i} className="text-xl leading-relaxed">
            <MathText text={p} />
          </p>
        ))}
        {lesson.example && (
          <div className="bg-surface-2 rounded-2xl p-4">
            <p className="font-display text-xl tracking-wide">Exemple</p>
            <p className="mt-1 text-xl font-bold">
              <MathText text={lesson.example.question} />
            </p>
            <ol className="mt-2 list-decimal pl-6 text-lg">
              {lesson.example.steps.map((s, i) => (
                <li key={i}>
                  <MathText text={s} />
                </li>
              ))}
            </ol>
          </div>
        )}
        <p className="text-muted text-sm">Source : {lesson.source}</p>
        <Button onClick={onClose} className="self-end">
          J’ai compris
        </Button>
      </motion.div>
    </div>
  );
}
