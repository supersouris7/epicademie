import type { SubjectId } from '@questeo/shared';
import { RELICS } from '../../../design/relics.ts';
import { GameIcon, type IconSize } from './GameIcon.tsx';

/** Icône d'une matière : la relique de la matière (même image partout dans le jeu). */
export function SubjectIcon({
  subject,
  size = 'lg',
}: {
  readonly subject: SubjectId;
  readonly size?: IconSize | number;
}) {
  return <GameIcon id={RELICS[subject].icon} size={size} />;
}
