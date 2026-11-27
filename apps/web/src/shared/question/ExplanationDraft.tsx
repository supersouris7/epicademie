/** Brouillon disponible pendant une explication : on refait le calcul en lisant les étapes. */
import { useState } from 'react';
import { getAnySkill, type Question } from '@epicademie/content';
import { GameIcon } from '../ui/game/GameIcon.tsx';
import { GameButton } from '../ui/game/GameButton.tsx';
import { MathText } from './MathText.tsx';
import { Brouillon, type Stroke } from './tools/Brouillon.tsx';
import { toolTabs } from './tools.ts';

interface ExplanationDraftProps {
  readonly question: Question;
  /** Étapes déjà lues, rappelées au-dessus de la feuille. */
  readonly steps: readonly string[];
}

/** Bouton « Brouillon » (maths et sciences seulement) et sa feuille pleine page ; le dessin est gardé. */
export function ExplanationDraft({ question, steps }: ExplanationDraftProps) {
  const [open, setOpen] = useState(false);
  const [strokes, setStrokes] = useState<readonly Stroke[]>([]);
  if (!toolTabs(question, getAnySkill(question.skillId)).includes('brouillon')) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cartoon cartoon-press bg-surface-2 flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-sm font-bold whitespace-nowrap"
      >
        <GameIcon id="icons-tools-pencil" size="xs" />
        Brouillon
      </button>
      {open && (
        <div
          className="bg-bg fixed inset-0 z-50 flex flex-col gap-2 p-3"
          role="dialog"
          aria-label="Brouillon pleine page"
        >
          <div className="flex max-h-[30dvh] shrink-0 flex-col gap-1 overflow-y-auto text-lg font-bold">
            <h2>
              <MathText text={question.prompt} />
            </h2>
            <ol className="list-inside list-decimal font-normal">
              {steps.map((s, i) => (
                <li key={i}>
                  <MathText text={s} />
                </li>
              ))}
            </ol>
          </div>
          <div className="min-h-0 flex-1">
            <Brouillon strokes={strokes} onChange={setStrokes} expanded onToggleExpand={() => setOpen(false)} />
          </div>
          <GameButton className="self-end" size="sm" onClick={() => setOpen(false)}>
            Revenir à l’explication
          </GameButton>
        </div>
      )}
    </>
  );
}
