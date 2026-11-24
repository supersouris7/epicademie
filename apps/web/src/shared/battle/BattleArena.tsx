import { useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition } from 'motion/react';
import { HERO_NAMES, type HeroId } from '@epicademie/shared';
import { assetSrc, characterSrc, type AnimationState } from '../../design/assets.ts';
import { mustFlip } from '../../design/orientation.ts';
import { CharacterSprite } from '../ui/game/CharacterSprite.tsx';
import { STAGE_MAX_RATIO, useArenaImage, type ArenaImage } from './arena.ts';

/**
 * Hauteur unique de l'arène, à toutes les phases (face-à-face, arrivée du boss, coups) : les
 * personnages gardent la même taille d'une scène à l'autre.
 */
export const ARENA_HEIGHT = 'min(44dvh, 440px)';

export type EnemyState = 'idle' | 'attack' | 'hurt' | 'ko' | 'shield';

export interface ArenaEnemy {
  /** Clé d'affichage : change à chaque nouvel adversaire (entrée en scène). */
  readonly key: string;
  readonly name: string;
  readonly boss: boolean;
  /** Identifiant d'image (boss : sans suffixe d'état ; mob : image unique). */
  readonly image: string;
  readonly filter?: string;
  /** Image par état (boss : poses fixes du Sorcier π) ; sinon `${image}-${état}`. */
  readonly poses?: Partial<Record<EnemyState, string>>;
}

interface BattleArenaProps {
  readonly hero: HeroId;
  readonly heroState: AnimationState;
  readonly enemy: ArenaEnemy | null;
  readonly enemyState: EnemyState;
  /** Change à chaque tir : une orbe part du héros vers l'adversaire. */
  readonly shot: number;
  /** Change à chaque riposte : une onde part de l'adversaire vers le héros. */
  readonly riposte: number;
  readonly shield: boolean;
  /** Le héros entre en courant (par défaut comme `entrance`) ; false : il attend déjà en place. */
  readonly heroEntrance?: boolean;
  /** Durée de l'entrée en scène de l'adversaire (secondes). */
  readonly entranceSeconds?: number;
  /** Décor : image d'arène livrée, sinon dégradé. */
  readonly arena: string;
  readonly sky: readonly [string, string];
  /** Entrée en scène en courant (début du combat) ; non pour les scènes d'action en cours de combat. */
  readonly entrance?: boolean;
}

/**
 * Scène du combat, vue de côté : héros à gauche, adversaire à droite. Uniquement des images fixes
 * (poses, états du boss) enchaînées par animation en code ; munition et ondes dessinées en code.
 * Tant qu'une image manque, un remplaçant dessiné prend sa place (jamais de personnage coupé).
 */
export function BattleArena(props: BattleArenaProps) {
  const { hero, heroState, enemy, enemyState, shot, riposte, shield, arena, sky } = props;
  const run = props.entrance !== false;
  const heroRun = props.heroEntrance ?? run;
  const reduce = useReducedMotion();
  // Variante de l'arène (portrait, 16:9, large, panorama) la plus proche des proportions du cadre.
  const frame = useRef<HTMLDivElement>(null);
  const bg = useArenaImage(frame, arena);
  return (
    <div
      ref={frame}
      className="cartoon relative w-full shrink-0 overflow-hidden"
      style={{
        height: ARENA_HEIGHT,
        background: bg
          ? '#0b0a1f'
          : `linear-gradient(180deg, ${sky[0]}, ${sky[1]} 70%, color-mix(in srgb, ${sky[1]} 50%, black))`,
      }}
      role="img"
      aria-label={`${HERO_NAMES[hero]} contre ${enemy?.name ?? '…'}`}
    >
      {bg && <ArenaBackdrop image={bg} />}
      {/* Sol */}
      <div className="absolute inset-x-0 bottom-0 h-[14%] bg-black/25" />

      {/* Scène : les combattants restent groupés au centre, même sur un écran très large. */}
      <div
        className="absolute inset-y-0 left-1/2 w-full -translate-x-1/2"
        style={{ maxWidth: `calc(${ARENA_HEIGHT} * ${STAGE_MAX_RATIO})`, containerType: 'size' }}
      >
        {/* Entrée en scène : le héros arrive en courant depuis la gauche. Il est plus petit que le boss
          (le boss mesure 1,4 fois sa taille) et de la même taille que les mobs. */}
        <motion.div
          className="absolute bottom-[6%] left-[4%] h-[min(61%,44cqw)]"
          style={{ aspectRatio: '1', maxWidth: '44%' }}
          initial={reduce || !heroRun ? false : { x: '-140%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <HeroFigure hero={hero} state={heroState} />
          <ShieldBubble shield={shield} />
        </motion.div>

        <div
          className={`absolute right-[4%] bottom-[6%] ${enemy?.boss ? 'h-[min(86%,50cqw)]' : 'h-[min(61%,44cqw)]'}`}
          style={{ aspectRatio: '1', maxWidth: enemy?.boss ? '50%' : '44%' }}
        >
          <AnimatePresence mode="wait">
            {enemy && (
              <motion.div
                key={enemy.key}
                className="h-full w-full"
                initial={reduce || !run ? false : { x: '140%', opacity: 1 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: props.entranceSeconds ?? 0.9, ease: 'easeOut' }}
                // Un mob vaincu s'envole ; le boss, lui, disparaît simplement (fondu) avant l'entrée du mob.
                exit={
                  reduce
                    ? undefined
                    : enemy.boss
                      ? { opacity: 0, transition: { duration: 0.5 } }
                      : { scale: 0.2, opacity: 0, rotate: 20, transition: { duration: 0.35 } }
                }
              >
                <EnemyFigure enemy={enemy} state={enemyState} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Projectiles shot={shot} riposte={riposte} reduce={reduce === true} />
      </div>
    </div>
  );
}

/**
 * Décor : l'image garde toujours ses proportions (jamais étirée). Si le cadre est plus large que la
 * plus large variante, elle est centrée avec des bords fondus sur un fond d'ambiance flouté de la
 * même image ; un voile léger (haut, bords) garde l'interface lisible sur tous les décors.
 */
function ArenaBackdrop({ image }: { readonly image: ArenaImage }) {
  const url = `url(${image.src})`;
  const fade = 'linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)';
  return (
    <>
      {image.extended && (
        <div
          aria-hidden
          className="absolute inset-0 scale-110"
          style={{ background: `center / cover no-repeat ${url}`, filter: 'blur(44px) brightness(0.6) saturate(1.15)' }}
        />
      )}
      <div
        aria-hidden
        className="absolute inset-y-0 left-1/2 -translate-x-1/2"
        style={{
          width: image.extended ? `calc(${ARENA_HEIGHT} * ${image.ratio})` : '100%',
          background: `center 62% / cover no-repeat ${url}`,
          ...(image.extended ? { maskImage: fade, WebkitMaskImage: fade } : {}),
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,6,24,0.38), transparent 28%), radial-gradient(ellipse at center, transparent 62%, rgba(8,6,24,0.35))',
        }}
      />
    </>
  );
}

/** Bouclier levé autour du héros. */
function ShieldBubble({ shield }: { readonly shield: boolean }) {
  return (
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
  );
}

/** Tir du héros (vers la droite) et riposte de l'adversaire (vers la gauche) ; chaque incrément rejoue l'effet. */
function Projectiles({
  shot,
  riposte,
  reduce,
}: {
  readonly shot: number;
  readonly riposte: number;
  readonly reduce: boolean;
}) {
  return (
    <>
      <AnimatePresence>
        {shot > 0 && (
          <motion.div
            key={`shot-${shot}`}
            className="pointer-events-none absolute bottom-[32%] left-[22%]"
            initial={{ x: 0, opacity: 1, scale: 0.6 }}
            animate={{ x: '230%', opacity: [1, 1, 0], scale: [0.6, 1, 1.3] }}
            transition={{ duration: reduce ? 0.01 : 0.55, ease: 'easeIn' }}
            style={{ width: '22%' }}
          >
            <PlasmaShot />
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
    </>
  );
}

/** Tir du canon à plasma d'Alex : boule d'énergie violette et sa traînée, dessinées en code. */
export function PlasmaShot() {
  const color = '#c45cff';
  return (
    <div className="relative w-full" style={{ aspectRatio: '1' }} aria-hidden>
      <div
        className="absolute top-1/2 right-1/2 h-1/2 w-[160%] -translate-y-1/2 rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${color})`, opacity: 0.6 }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 40% 40%, white, ${color} 45%, color-mix(in srgb, ${color} 55%, black))`,
          boxShadow: `0 0 18px ${color}, 0 0 40px ${color}`,
        }}
      />
    </div>
  );
}

function HeroFigure({ hero, state }: { readonly hero: HeroId; readonly state: AnimationState }) {
  return (
    <div
      className={`flex h-full w-full items-end justify-center ${state === 'defeat' ? 'grayscale-[0.6]' : ''} ${state === 'hurt' ? 'drop-shadow-[0_0_12px_rgba(255,60,60,0.9)]' : ''}`}
    >
      <CharacterSprite hero={hero} state={state} height="100%" />
    </div>
  );
}

/** Poses fixes : seulement une secousse aux impacts (élan de l'attaque, coup reçu). */
const ENEMY_MOTION: Record<EnemyState, TargetAndTransition> = {
  idle: {},
  attack: { x: [0, -30, 0], transition: { duration: 0.4 } },
  hurt: { x: [0, 16, -6, 0], transition: { duration: 0.45 } },
  ko: {},
  shield: {},
};

/**
 * Respiration du boss à l'attente : la pose d'attente (tournée vers le héros) respire sur place.
 * La bande d'animation d'attente est dessinée de face : elle n'est jamais utilisée dans l'arène.
 */
const BOSS_BREATH: TargetAndTransition = {
  scaleY: [1, 1.025, 1],
  transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
};

function EnemyFigure({ enemy, state }: { readonly enemy: ArenaEnemy; readonly state: EnemyState }) {
  const reduce = useReducedMotion();
  // Une image par état quand elle est livrée ; sinon l'image d'attente, animée selon l'état.
  const stateId = enemy.poses?.[state] ?? `${enemy.image}-${state}`;
  const shownId = state !== 'idle' && assetSrc(stateId) ? stateId : (enemy.poses?.idle ?? enemy.image);
  const src = characterSrc(shownId);
  return (
    <motion.div
      key={state}
      className="relative flex h-full w-full items-end justify-center"
      style={{ originX: 0.5, originY: 1 }}
      animate={reduce ? undefined : state === 'idle' && enemy.boss ? BOSS_BREATH : ENEMY_MOTION[state]}
    >
      {src && (
        // Poses du boss : même cadre que son animation, affichées à la même hauteur (pieds au sol).
        <img
          src={src}
          alt=""
          aria-hidden
          draggable={false}
          className="h-full w-full object-contain"
          // L'adversaire regarde toujours le héros (à gauche).
          style={{ filter: enemy.filter, transform: mustFlip(shownId, 'left') ? 'scaleX(-1)' : undefined }}
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
