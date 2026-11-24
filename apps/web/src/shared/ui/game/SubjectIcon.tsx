import type { SubjectId } from '@epicademie/shared';
import { RELICS } from '../../../design/relics.ts';
import { type IconSize } from './GameIcon.tsx';
import { ProgressIcon } from './ProgressIcon.tsx';

const PX: Record<IconSize, number> = { xs: 16, sm: 24, md: 32, lg: 48, xl: 64 };

/**
 * Icône d'une matière : sa relique, grise au départ, qui se remplit de couleur (du bas vers le haut)
 * avec les boss vaincus de la matière. Même rendu dans tous les menus.
 */
export function SubjectIcon({
  subject,
  name,
  won,
  max,
  size = 'lg',
}: {
  readonly subject: SubjectId;
  /** Nom de la matière, pour le libellé accessible. */
  readonly name: string;
  /** Boss vaincus de la matière (0 si aucun ou matière à venir). */
  readonly won: number;
  /** Boss de la matière (0 si aucun). */
  readonly max: number;
  readonly size?: IconSize | number;
}) {
  const px = typeof size === 'number' ? size : PX[size];
  return (
    <ProgressIcon
      id={RELICS[subject].icon}
      ratio={max > 0 ? won / max : 0}
      size={px}
      label={`${won} boss vaincus sur ${max} en ${name}`}
    />
  );
}
