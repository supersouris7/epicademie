import type { SubjectId } from '@questeo/shared';
import { GameIcon, type IconSize } from './GameIcon.tsx';

/** Icône d'une matière. */
export function SubjectIcon({
  subject,
  size = 'lg',
}: {
  readonly subject: SubjectId;
  readonly size?: IconSize | number;
}) {
  return <GameIcon id={`icons-subjects-${subject}`} size={size} />;
}
