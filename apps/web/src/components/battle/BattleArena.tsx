import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition } from 'motion/react';
import { HERO_NAMES, type AmmoInfo, type HeroId } from '@questeo/shared';
import { assetSrc, heroPoseSrc, type AnimationState } from '../../design/assets.ts';
import { HERO_COLORS } from '../../design/heroes.ts';
import { CHARACTER_MOTION } from '../../design/motion.ts';

export type EnemyState = 'idle' | 'attack' | 'hurt' | 'ko';

export interface ArenaEnemy {
  /** Clé d'affichage : change à chaque nouvel adversaire (entrée en scène). */
  readonly key: string;
  readonly name: string;
  readonly boss: boolean;
  /** Identifiant d'image (boss : sans suffixe d'état ; mob : image unique). */
  readonly image: string;
  readonly filter?: string;
}

interface BattleArenaProps {
  readonly hero: HeroId;
  readonly heroState: AnimationState;
  readonly enemy: ArenaEnemy | null;
  readonly enemyState: EnemyState;
  readonly ammo: AmmoInfo;
  /** Change à chaque tir : une orbe part du héros vers l'adversaire. */
  readonly shot: number;
  /** Change à chaque riposte : une onde part de l'adversaire vers le héros. */
  readonly riposte: number;
  readonly shield: boolean;
  /** Décor : image d'arène livrée, sinon dégradé. */
  readonly arena: string;
  readonly sky: readonly [string, string];
}

/**
 * Scène du combat, vue de côté : héros à gauche, adversaire à droite. Uniquement des images fixes
 * (poses, états du boss) enchaînées par animation en code ; munition et ondes dessinées en code.
 * Tant qu'une image manque, un remplaçant dessiné prend sa place (jamais de personnage coupé).
 */
export function BattleArena(props: BattleArenaProps) {
  const { hero, heroState, enemy, enemyState, ammo, shot, riposte, shield, arena, sky } = props;
  const reduce = useReducedMotion();
  const bg = assetSrc(`environments-arenas-${arena}`);
  return (
    <div
      className="cartoon relative w-full shrink-0 overflow-hidden"
      style={{
        height: 'var(--arena-h)',
        background: bg
          ? `center / cover no-repeat url(${bg})`
          : `linear-gradient(180deg, ${sky[0]}, ${sky[1]} 70%, color-mix(in srgb, ${sky[1]} 50%, black))`,
      }}
      role="img"
      aria-label={`${HERO_NAMES[hero]} contre ${enemy?.name ?? '…'}`}
    >
      {/* Sol */}
      <div className="absolute inset-x-0 bottom-0 h-[14%] bg-black/25" />

      <div className="absolute bottom-[6%] left-[6%] h-[78%]" style={{ aspectRatio: '1' }}>
        <HeroFigure hero={hero} state={heroState} />
        <AnimatePresence>
          {shield && (
            <motion.div
              key="shield"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0 }}
              className="absolute inset-[-6%] rounded-full border-4 border-cyan-300/80 bg-cyan-300/15 shadow-[0_0_24px_rgba(103,232,249,0.7)]"
              aria-label="Bouclier levé"
            />
          )}
        </AnimatePresence>
      </div>

      <div className="absolute right-[6%] bottom-[6%] h-[82%]" style={{ aspectRatio: '1' }}>
        <AnimatePresence mode="wait">
          {enemy && (
            <motion.div
              key={enemy.key}
              className="h-full w-full"
              initial={reduce ? false : { x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={reduce ? undefined : { scale: 0.2, opacity: 0, rotate: 20, transition: { duration: 0.35 } }}
            >
              <EnemyFigure enemy={enemy} state={enemyState} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {shot > 0 && (
          <motion.div
            key={`shot-${shot}`}
            className="pointer-events-none absolute bottom-[40%] left-[24%]"
            initial={{ x: 0, opacity: 1, scale: 0.6 }}
            animate={{ x: '230%', opacity: [1, 1, 0], scale: [0.6, 1, 1.3] }}
            transition={{ duration: reduce ? 0.01 : 0.55, ease: 'easeIn' }}
            style={{ width: '22%' }}
          >
            <AmmoOrb ammo={ammo} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {riposte > 0 && (
          <motion.div
            key={`riposte-${riposte}`}
            className="pointer-events-none absolute right-[22%] bottom-[30%] h-[36%] w-[20%] rounded-[50%] border-l-[10px] border-orange-400"
            style={{ boxShadow: '-10px 0 30px rgba(255,90,40,0.8)' }}
            initial={{ x: 0, opacity: 1 }}
            animate={{ x: '-260%', opacity: [1, 1, 0] }}
            transition={{ duration: reduce ? 0.01 : 0.5, ease: 'easeIn' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/** Orbe de munition : boule lumineuse à la couleur du chapitre, symbole au centre, traînée. */
export function AmmoOrb({ ammo, size }: { readonly ammo: AmmoInfo; readonly size?: number }) {
  return (
    <div className="relative" style={{ width: size ?? '100%', aspectRatio: '1' }} aria-hidden>
      {/* Traînée */}
      <div
        className="absolute top-1/2 right-1/2 h-1/2 w-[160%] -translate-y-1/2 rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${ammo.color})`, opacity: 0.55 }}
      />
      <div
        className="font-display absolute inset-0 flex items-center justify-center rounded-full text-[min(6vw,2.2rem)] text-white"
        style={{
          background: `radial-gradient(circle at 35% 35%, white, ${ammo.color} 45%, color-mix(in srgb, ${ammo.color} 60%, black))`,
          boxShadow: `0 0 18px ${ammo.color}, 0 0 36px ${ammo.color}`,
          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
          fontSize: size ? size * 0.5 : undefined,
        }}
      >
        {ammo.symbol}
      </div>
    </div>
  );
}

function HeroFigure({ hero, state }: { readonly hero: HeroId; readonly state: AnimationState }) {
  const reduce = useReducedMotion();
  // Pose manquante (touché, défaite) : la pose d'attente, animée selon l'état.
  const src = heroPoseSrc(hero, state);
  const motionProps = reduce ? {} : { animate: CHARACTER_MOTION[state] };
  if (src) {
    return (
      <motion.img
        key={state}
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        className={`h-full w-full object-contain ${state === 'defeat' ? 'grayscale-[0.6]' : ''} ${state === 'hurt' ? 'drop-shadow-[0_0_12px_rgba(255,60,60,0.9)]' : ''}`}
        style={{ originX: 0.5, originY: 1 }}
        {...motionProps}
      />
    );
  }
  // Remplaçant tant que les poses ne sont pas livrées : jeton coloré au nom du héros.
  return (
    <motion.div
      key={state}
      className="flex h-full w-full items-end justify-center"
      style={{ originX: 0.5, originY: 1 }}
      {...motionProps}
    >
      <div
        className="cartoon font-display text-toon flex aspect-[3/4] h-[85%] items-center justify-center rounded-[40%_40%_20%_20%] text-[min(8vw,3rem)]"
        style={{ background: `linear-gradient(160deg, ${HERO_COLORS[hero]}, var(--outline))` }}
      >
        {HERO_NAMES[hero].slice(0, 1)}
      </div>
    </motion.div>
  );
}

const ENEMY_MOTION: Record<EnemyState, TargetAndTransition> = {
  idle: { y: [0, -5, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
  attack: { x: [0, -30, 0], transition: { duration: 0.4 } },
  hurt: { x: [0, 16, -6, 0], opacity: [1, 0.4, 1, 0.7, 1], transition: { duration: 0.45 } },
  ko: { rotate: 12, y: 16, opacity: 0.6, transition: { duration: 0.5 } },
};

function EnemyFigure({ enemy, state }: { readonly enemy: ArenaEnemy; readonly state: EnemyState }) {
  const reduce = useReducedMotion();
  // Boss : une image par état ; mob : une seule image, l'état est joué par le mouvement.
  const src = (enemy.boss && state !== 'idle' ? assetSrc(`${enemy.image}-${state}`) : null) ?? assetSrc(enemy.image);
  return (
    <motion.div
      key={state}
      className="relative h-full w-full"
      style={{ originX: 0.5, originY: 1 }}
      animate={reduce ? undefined : ENEMY_MOTION[state]}
    >
      {src && (
        <img
          src={src}
          alt=""
          aria-hidden
          draggable={false}
          className="h-full w-full object-contain"
          style={{ filter: enemy.filter, transform: enemy.boss ? undefined : 'scale(0.7)', transformOrigin: 'bottom' }}
        />
      )}
      {state === 'hurt' && (
        <motion.div
          className="absolute top-1/3 left-1/4 h-1/2 w-1/2 rounded-full bg-white"
          initial={{ scale: 0.2, opacity: 0.9 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.4 }}
          aria-hidden
        />
      )}
    </motion.div>
  );
}
