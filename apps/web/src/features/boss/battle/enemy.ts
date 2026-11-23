import type { BattleView } from '@questeo/shared';
import type { ArenaEnemy } from '../../../shared/battle/BattleArena.tsx';
import { type BossExpression, type PiBotHead } from '../../../design/assets.ts';
import { bossHeadId, bossPoseId, mobHeadId, mobName, mobOf, type BossIdentity } from '../../../design/bosses.ts';
import { onBoss, type BattleScreen } from './state.ts';

/** Adversaires affichés pendant un combat de boss (fonctions pures, sans état). */

/** Le boss en personne (entrée en scène). */
export const bossEnemy = (boss: BossIdentity): ArenaEnemy => ({
  key: 'boss',
  name: boss.name,
  boss: true,
  image: bossPoseId(boss.id, 'idle'),
  poses: {
    idle: bossPoseId(boss.id, 'idle'),
    attack: bossPoseId(boss.id, 'attack'),
    hurt: bossPoseId(boss.id, 'hurt'),
    ko: bossPoseId(boss.id, 'defeat'),
    shield: bossPoseId(boss.id, 'shield'),
  },
});

/** Adversaire du moment : le mob de la question, puis le boss (toujours en pose tournée vers le héros). */
export function currentEnemy(boss: BossIdentity, battle: BattleView | null): ArenaEnemy | null {
  if (!battle) return null;
  if (onBoss(battle)) {
    return bossEnemy(boss);
  }
  const mob = mobOf(boss, battle.mobsDefeated);
  return { key: `mob-${battle.mobsDefeated}`, name: mobName(mob), boss: false, image: `bosses-minions-${mob}` };
}

/** Tête de l'adversaire dans le bandeau, avec son expression du moment. */
export function enemyHead(
  boss: BossIdentity,
  battle: BattleView | null,
  enemy: ArenaEnemy | null,
  faces: { readonly boss: BossExpression; readonly mob: PiBotHead },
): string {
  if (!enemy) return 'placeholder-boss';
  return enemy.boss ? bossHeadId(boss.id, faces.boss) : mobHeadId(mobOf(boss, battle?.mobsDefeated ?? 0), faces.mob);
}

/**
 * Adversaire des scènes en grand : le boss au face-à-face ; il disparaît (« exit »), puis le 1er
 * mob entre ; plus tard, le boss qui arrive après le dernier mob.
 */
export function stagedEnemy(boss: BossIdentity, s: BattleScreen): ArenaEnemy | null {
  if (s.arrival || s.introStage === 'mob') return currentEnemy(boss, s.battle);
  return s.introStage === 'boss' ? bossEnemy(boss) : null;
}
