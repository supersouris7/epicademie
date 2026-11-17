import type { ReactNode } from 'react';
import { ProgressBar } from './ProgressBar.tsx';
import { GameIcon } from './GameIcon.tsx';

const nf = (n: number) => n.toLocaleString('fr-FR');

/** Barre de vie (cœur, rouge, segmentée). */
export function HealthBar({
  value,
  max,
  label = 'Vie',
}: {
  readonly value: number;
  readonly max: number;
  readonly label?: string;
}) {
  return (
    <ProgressBar
      value={value}
      max={max}
      label={label}
      icon="icons-resources-life"
      color="var(--health)"
      segments={max <= 10 ? max : 5}
    />
  );
}

/** Barre d'énergie (éclair, jaune). */
export function EnergyBar({
  value,
  max,
  label = 'Énergie',
}: {
  readonly value: number;
  readonly max: number;
  readonly label?: string;
}) {
  return (
    <ProgressBar
      value={value}
      max={max}
      label={label}
      icon="icons-resources-energy"
      color="var(--energy)"
      segments={5}
      text={`${nf(value)} / ${nf(max)}`}
    />
  );
}

interface XPBarProps {
  readonly level: number;
  readonly xp: number;
  readonly xpForNext: number;
  /** Titre du niveau (« Apprenti », « Championne »…). */
  readonly title?: ReactNode;
}

/** Barre d'expérience : badge de niveau hexagonal doré, onglet de titre, remplissage orange. */
export function XPBar({ level, xp, xpForNext, title }: XPBarProps) {
  return (
    <div className="flex min-w-0 items-center">
      <div
        className="relative z-10 -mr-3 flex h-16 w-16 shrink-0 items-center justify-center"
        aria-label={`Niveau ${level}`}
        role="img"
      >
        <GameIcon id="icons-resources-level" size={64} className="absolute inset-0" />
        <span className="font-display text-toon relative text-2xl">{level}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title && <span className="font-display truncate pl-4 text-lg tracking-wide">{title}</span>}
        <ProgressBar
          value={xp}
          max={xpForNext}
          label="Progression vers le niveau suivant"
          color="var(--primary)"
          text={`${nf(xp)} / ${nf(xpForNext)} XP`}
          size="lg"
        />
      </div>
    </div>
  );
}

interface BossHealthBarProps {
  readonly name: string;
  readonly hp: number;
  readonly maxHp: number;
  /** Portrait du boss (identifiant du catalogue). */
  readonly portrait: string;
}

/** Barre de vie du boss : portrait rond, bandeau de nom, barre rouge segmentée. */
export function BossHealthBar({ name, hp, maxHp, portrait }: BossHealthBarProps) {
  return (
    <div className="flex items-center">
      <div className="cartoon bg-accent-strong relative z-10 -mr-4 h-16 w-16 shrink-0 overflow-hidden rounded-full">
        <GameIcon id={portrait} size={64} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="bg-accent-strong font-display text-toon w-fit rounded-r-full py-0.5 pr-5 pl-6 text-lg">
          {name}
        </span>
        <ProgressBar value={hp} max={maxHp} label={`Vie de ${name}`} color="var(--boss)" segments={10} size="md" />
      </div>
    </div>
  );
}
