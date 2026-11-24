import { motion } from 'motion/react';
import { useState } from 'react';
import { generate, glossaryEntry, termsIn, type Skill } from '@epicademie/content';
import { GameButton } from '../ui/game/GameButton.tsx';
import { MathText } from './MathText.tsx';
import { Questy } from '../ui/mascot/Questy.tsx';
import { TermDialog } from './Term.tsx';

/** Mots du glossaire de la notion : titre, mémo et énoncés types (niveaux 1 à 3). */
function skillTerms(skill: Skill): string[] {
  const samples: string[] = [];
  for (const level of [1, 2, 3] as const) {
    try {
      const q = generate(skill.id, level, 1);
      samples.push(q.prompt, ...q.steps);
    } catch {
      // Notion hors catalogue (tests) : le mémo suffit.
    }
  }
  return termsIn([skill.title, ...skill.lesson.memo, ...samples]);
}

/** « Le truc à retenir » : le mémo de la notion, en quelques phrases de Questy. Jamais imposé. */
export function Memo({ skill, onClose }: { readonly skill: Skill; readonly onClose: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const words = skillTerms(skill);
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Le truc à retenir : ${skill.title}`}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="cartoon bg-surface flex max-h-[85dvh] w-full max-w-xl flex-col gap-3 overflow-y-auto p-5"
      >
        <div className="flex items-center gap-3">
          <Questy mood="wink" size={84} />
          <div>
            <p className="text-muted text-sm font-bold">Le truc à retenir</p>
            <h2 className="font-display text-2xl tracking-wide">{skill.title}</h2>
          </div>
        </div>
        {words.length > 0 && (
          <section aria-labelledby="mots-a-connaitre" className="flex flex-col gap-2">
            <h3 id="mots-a-connaitre" className="font-display text-xl tracking-wide">
              Les mots à connaître
            </h3>
            <ul className="flex flex-wrap gap-2">
              {words.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setOpen(id)}
                    className="cartoon cartoon-press bg-gold text-on-light px-3 py-1 font-bold"
                  >
                    {glossaryEntry(id)?.word ?? id}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        <h3 className="font-display text-xl tracking-wide">Le truc à retenir</h3>
        <ul className="flex flex-col gap-2">
          {skill.lesson.memo.map((p, i) => (
            <li key={i} className="bg-surface-2 rounded-2xl p-3 text-lg leading-snug">
              <MathText text={p} terms />
            </li>
          ))}
        </ul>
        <p className="text-muted text-xs">Source : {skill.lesson.source}</p>
        <GameButton className="self-end" variant="success" onClick={onClose}>
          J’ai compris
        </GameButton>
        {open && <TermDialog id={open} onClose={() => setOpen(null)} />}
      </motion.div>
    </div>
  );
}
