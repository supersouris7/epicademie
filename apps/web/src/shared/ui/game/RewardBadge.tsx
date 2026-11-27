import { MEDAL_LABELS, type Medal } from '@epicademie/engine';
import { GameIcon } from './GameIcon.tsx';

const MEDAL_ICONS: Record<Medal, string> = {
  aucune: 'rewards-medals-none',
  bronze: 'rewards-medals-bronze',
  argent: 'rewards-medals-argent',
  or: 'rewards-medals-or',
  diamant: 'rewards-medals-diamant',
};

/** Médaille d'une notion (bronze, argent, or avec aide, diamant sans aide ; emplacement vide sinon). */
export function MedalBadge({
  medal,
  size = 40,
  label,
}: {
  readonly medal: Medal;
  readonly size?: number;
  readonly label?: string;
}) {
  return (
    <GameIcon
      id={MEDAL_ICONS[medal]}
      size={size}
      label={label ?? (medal === 'aucune' ? 'Pas encore de médaille' : `Médaille ${MEDAL_LABELS[medal]}`)}
    />
  );
}

interface RewardBadgeProps {
  /** Icône de la récompense (pièce, XP, coffre, trophée…). */
  readonly icon: string;
  readonly value: string;
  readonly label: string;
  readonly tone?: 'gold' | 'surface' | 'accent';
}

const TONES = {
  gold: 'bg-gold text-on-light',
  surface: 'bg-surface text-ink',
  accent: 'bg-accent text-on-color',
} as const;

/** Tuile de récompense gagnée (« +120 XP », « +12 pièces »). */
export function RewardBadge({ icon, value, label, tone = 'surface' }: RewardBadgeProps) {
  return (
    <div className={`cartoon flex flex-col items-center gap-1 p-3 ${TONES[tone]}`}>
      <GameIcon id={icon} size="lg" />
      <span className="font-display text-3xl leading-none">{value}</span>
      <span className="font-bold">{label}</span>
    </div>
  );
}
