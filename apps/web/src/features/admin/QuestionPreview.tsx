import { useMemo } from 'react';
import { generate, type Level } from '@epicademie/content';
import { formatAnswer } from '../../shared/question/answers.ts';
import { MathText } from '../../shared/question/MathText.tsx';
import { errorClass, innerCardClass } from './ui.tsx';

/** Une question régénérée à l'identique (notion, niveau, graine). */
export function QuestionPreview({ skillId, level, seed }: { skillId: string; level: Level; seed: number }) {
  const question = useMemo(() => {
    try {
      return generate(skillId, level, seed);
    } catch {
      return null;
    }
  }, [skillId, level, seed]);
  if (!question) return <p className={errorClass}>Notion retirée du contenu.</p>;
  return (
    <div className={`${innerCardClass} p-3 text-sm`}>
      <p className="font-medium">
        <MathText text={question.prompt} />
      </p>
      <p className="mt-1 text-pilot-mut">
        Réponse attendue : <MathText text={formatAnswer(question)} />
      </p>
    </div>
  );
}
