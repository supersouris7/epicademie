import { motion, useReducedMotion } from 'motion/react';
import { HERO_NAMES, type HeroId } from '@questeo/shared';
import { assetSrc, type HeroExpression } from '../../design/assets.ts';
import { HeroFace } from './HeroFace.tsx';

interface BattleBarProps {
  readonly hero: HeroId;
  readonly face: HeroExpression;
  readonly hearts: number;
  readonly maxHearts: number;
  readonly shield: boolean;
  /** Adversaire : nom, image (tête du boss ou mob entier), filtre de couleur. */
  readonly enemyName: string;
  readonly enemyImage: string;
  readonly enemyFilter?: string;
  readonly enemyKey: string;
  /** Vies du boss (null avant lui) ; avant lui, les mobs restants : une barre segmentée, comme des vies. */
  readonly bossLives: number | null;
  readonly bossMax: number;
  readonly mobsLeft: number;
  readonly mobsMax: number;
  /** Change à chaque coup reçu par le héros / par l'adversaire : le portrait tremble. */
  readonly riposte: number;
  readonly shot: number;
}

/**
 * HUD de combat façon jeu de combat : portraits aux deux bouts, longues barres de vie inclinées
 * qui se vident vers le centre (avec la traînée blanche des dégâts), « VS » et manches au centre.
 * Pas de décor de l'arène dans le HUD : le décor reste derrière les personnages.
 */
export function BattleBar(p: BattleBarProps) {
  const reduce = useReducedMotion();
  const enemySrc = assetSrc(p.enemyImage);
  const onBoss = p.bossLives !== null;
  const enemyValue = p.bossLives ?? p.mobsLeft;
  const enemyMax = onBoss ? p.bossMax : p.mobsMax;
  const shake = (key: number, dir: 1 | -1) => (key && !reduce ? { x: [0, 8 * dir, -8 * dir, 4 * dir, 0] } : undefined);
  return (
    <header
      className="border-outline relative flex shrink-0 items-center gap-2 rounded-2xl border-[3px] bg-[linear-gradient(180deg,#1b0f33,#2a1650)] px-2 py-1.5 text-white shadow-[0_4px_0_rgb(0_0_0/0.35)] sm:gap-3 sm:px-3"
      aria-label="Combat"
    >
      {/* Héros : portrait (tremble quand il est touché), nom, barre de vie, bouclier. */}
      <motion.div
        key={`hero-${p.riposte}`}
        animate={shake(p.riposte, -1)}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="relative shrink-0"
      >
        <Portrait side="left">
          <HeroFace hero={p.hero} expression={p.face} size={52} />
        </Portrait>
        {p.shield && (
          <span
            className="absolute inset-[-4px] rounded-xl border-4 border-cyan-300/80 shadow-[0_0_14px_rgba(103,232,249,0.8)]"
            aria-label="Bouclier levé"
          />
        )}
      </motion.div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-display text-toon truncate text-sm tracking-wide sm:text-base">{HERO_NAMES[p.hero]}</span>
        <LifeBar
          side="left"
          value={p.hearts}
          max={p.maxHearts}
          role="img"
          label={`${p.hearts} cœurs sur ${p.maxHearts}`}
          hit={p.riposte}
        />
      </div>

      {/* Centre : VS, puis les manches (mobs battus) et le boss. */}
      <div className="flex shrink-0 flex-col items-center gap-1" aria-hidden>
        <span className="font-display text-toon text-2xl leading-none text-[var(--gold)] italic sm:text-3xl">VS</span>
        <span className="flex items-center gap-0.5">
          {Array.from({ length: p.mobsMax }, (_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rotate-45 border border-white/60 ${i < p.mobsMax - p.mobsLeft || onBoss ? 'bg-[var(--gold)]' : 'bg-black/40'}`}
            />
          ))}
          <span
            className={`ml-1 h-3 w-3 rotate-45 border border-white/70 ${onBoss ? 'animate-pulse bg-[var(--boss)]' : 'bg-black/40'}`}
          />
        </span>
      </div>

      {/* Adversaire : barre de vie en miroir, nom, portrait. */}
      <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
        <span className="font-display text-toon max-w-full truncate text-sm tracking-wide sm:text-base">
          {p.enemyName}
        </span>
        <LifeBar
          side="right"
          value={enemyValue}
          max={enemyMax}
          role="progressbar"
          label={onBoss ? `Vies de ${p.enemyName}` : 'Mobs restants'}
          hit={p.shot}
          boss={onBoss}
        />
      </div>
      <motion.div
        key={`enemy-${p.enemyKey}-${p.shot}`}
        initial={p.shot ? false : { scale: 0.4, opacity: 0 }}
        animate={p.shot && !reduce ? shake(p.shot, 1) : { scale: 1, opacity: 1 }}
        transition={{ delay: p.shot ? 0.45 : 0, duration: 0.4 }}
        className="shrink-0"
      >
        <Portrait side="right">
          {enemySrc && (
            <img
              src={enemySrc}
              alt=""
              aria-hidden
              className="h-[52px] w-[52px] object-contain"
              style={{ filter: p.enemyFilter }}
            />
          )}
        </Portrait>
      </motion.div>
    </header>
  );
}

/** Cadre du portrait, incliné vers le centre comme dans les jeux de combat. */
function Portrait({ side, children }: { readonly side: 'left' | 'right'; readonly children: React.ReactNode }) {
  return (
    <div
      className={`border-gold flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-xl border-[3px] bg-[radial-gradient(circle_at_50%_35%,#5b3a9e,#1b0f33)] ${side === 'left' ? '-skew-x-6' : 'skew-x-6'}`}
      style={{ borderColor: 'var(--gold)' }}
    >
      <div className={side === 'left' ? 'skew-x-6' : '-skew-x-6'}>{children}</div>
    </div>
  );
}

/**
 * Barre de vie de jeu de combat : segments, remplissage jaune→orange (rouge au dernier point),
 * traînée blanche qui rattrape la vie restante après un coup. Se vide vers le centre.
 */
function LifeBar({
  side,
  value,
  max,
  label,
  role,
  hit,
  boss = false,
}: {
  readonly side: 'left' | 'right';
  readonly value: number;
  readonly max: number;
  readonly label: string;
  readonly role: 'img' | 'progressbar';
  readonly hit: number;
  readonly boss?: boolean;
}) {
  const reduce = useReducedMotion();
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) * 100 : 0;
  const low = value <= 1;
  const fill = boss
    ? 'linear-gradient(180deg,#ff6b6b,#c2183a)'
    : low
      ? 'linear-gradient(180deg,#ff8a7a,#e23b2e)'
      : 'linear-gradient(180deg,#ffe066,#f59f00)';
  const origin = side === 'left' ? 'right-0' : 'left-0';
  const a11y =
    role === 'progressbar'
      ? { role, 'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': value }
      : { role, 'aria-label': label };
  return (
    <div
      {...a11y}
      className={`relative h-4 w-full overflow-hidden rounded-sm border-2 border-black/70 bg-black/60 sm:h-5 ${side === 'left' ? '-skew-x-12' : 'skew-x-12'}`}
    >
      {/* Traînée des dégâts : rattrape la vie restante un peu après le coup. */}
      <motion.div
        key={`trail-${hit}`}
        className={`absolute inset-y-0 ${origin} bg-white/80`}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ delay: reduce ? 0 : 0.6, duration: reduce ? 0 : 0.5 }}
      />
      <motion.div
        className={`absolute inset-y-0 ${origin} ${low && !reduce ? 'animate-pulse' : ''}`}
        style={{ background: fill }}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: reduce ? 0 : 0.2 }}
      />
      {/* Séparations entre les points de vie. */}
      <div className="absolute inset-0 flex" aria-hidden>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className="h-full flex-1 border-r-2 border-black/50 last:border-r-0" />
        ))}
      </div>
    </div>
  );
}
