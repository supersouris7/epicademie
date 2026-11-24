import { BATTLE_MOBS, BOSS_LIVES, type HeroId } from '@epicademie/shared';
import { BattleArena } from '../../../shared/battle/BattleArena.tsx';
import { BattleBar } from '../../../shared/battle/BattleBar.tsx';
import { QuipRow } from '../../../shared/battle/BattleScenes.tsx';
import { GameButton } from '../../../shared/ui/game/GameButton.tsx';
import { Questy } from '../../../shared/ui/mascot/Questy.tsx';
import type { BossIdentity } from '../../../design/bosses.ts';
import { currentEnemy, enemyHead } from './enemy.ts';
import { onBoss, type BattleError, type BattleScreen } from './state.ts';

/** Morceaux d'affichage de l'écran de combat (sans état propre). */

interface StageProps {
  readonly screen: BattleScreen;
  readonly hero: HeroId;
  readonly boss: BossIdentity;
  readonly arena: string;
}

/** HUD de combat (portraits, barres de vie, VS et manches) et répliques dessous. */
export function BattleHud({ screen: s, hero, boss }: StageProps) {
  const battle = s.battle;
  const enemy = currentEnemy(boss, battle);
  const mobsDefeated = Math.min(battle?.mobsDefeated ?? 0, BATTLE_MOBS);
  return (
    <>
      <BattleBar
        hero={hero}
        face={s.heroFace}
        hearts={battle?.hearts ?? 3}
        maxHearts={battle?.maxHearts ?? 3}
        shield={battle?.shield ?? false}
        enemyName={enemy?.name ?? boss.name}
        enemyImage={enemyHead(boss, battle, enemy, { boss: s.bossFace, mob: s.mobFace })}
        enemyFilter={enemy?.filter}
        enemyKey={enemy?.key ?? 'boss'}
        bossLives={battle && onBoss(battle) ? battle.bossLives : null}
        bossMax={BOSS_LIVES}
        mobsLeft={BATTLE_MOBS - mobsDefeated}
        mobsMax={BATTLE_MOBS}
        shot={s.shot}
        riposte={s.riposte}
      />
      <QuipRow hero={s.heroQuip} enemy={s.enemyQuip} />
    </>
  );
}

/** Les coups se jouent en grand, personnages entiers, au milieu de l'écran (sur tout appareil). */
export function ActionScene({ screen: s, hero, boss, arena }: StageProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-20 mx-auto flex max-w-6xl flex-col justify-center px-3 pt-24 sm:px-4">
      <BattleArena
        hero={hero}
        heroState={s.heroState}
        enemy={currentEnemy(boss, s.battle)}
        enemyState={s.enemyState}
        // Seul le dernier coup se rejoue (sinon l'ancien tir repart avec la riposte).
        shot={s.lastHit === 'shot' ? s.shot : 0}
        riposte={s.lastHit === 'riposte' ? s.riposte : 0}
        shield={s.battle?.shield ?? false}
        arena={arena}
        sky={boss.sky}
        entrance={false}
      />
    </div>
  );
}

/** Attente : le boss arrive (avant la 1re question) ou le combat se termine. */
export function BattleWaiting({ started, bossName }: { readonly started: boolean; readonly bossName: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <Questy mood={started ? 'wow' : 'angry'} size={100} />
      <p className="font-display text-2xl">{started ? 'Fin du combat…' : `${bossName} arrive…`}</p>
    </div>
  );
}

/** Erreur bloquante ; un combat expiré (mise à jour du jeu) peut être relancé. */
export function BattleFailure({
  error,
  onReplay,
  onLeave,
}: {
  readonly error: BattleError;
  readonly onReplay: () => void;
  readonly onLeave: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center">
      <Questy mood="sad" size={120} />
      <p className="text-xl font-bold">{error.message}</p>
      {error.canReplay && <GameButton onClick={onReplay}>Relancer le combat</GameButton>}
      <GameButton variant={error.canReplay ? 'surface' : 'primary'} onClick={onLeave}>
        Retour aux boss
      </GameButton>
    </div>
  );
}
