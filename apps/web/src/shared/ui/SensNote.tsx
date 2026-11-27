import { SENS_LABELS, type Sens } from '@epicademie/content';
import { MathText } from '../question/MathText.tsx';

/** Une phrase de « sens » (pourquoi apprendre ça) : son type puis la phrase ; sa source reste dans le contenu. */
export function SensNote({ sens, className = '' }: { readonly sens: Sens; readonly className?: string }) {
  return (
    <p className={`text-base font-bold ${className}`}>
      <span className="font-display tracking-wide">{SENS_LABELS[sens.type]}</span>
      <span aria-hidden> · </span>
      <MathText text={sens.text} className="text-muted" />
    </p>
  );
}
