import type { BattleView } from '@questeo/shared';
import type { ArenaEnemy, EnemyState } from '../../../shared/battle/BattleArena.tsx';
import type { BossExpression, PiBotHead } from '../../../design/assets.ts';
import { bossHeadId, mobHeadId, mobName, mobOf, type BossIdentity } from '../../../design/bosses.ts';
import { onBoss, type BattleScreen } from './state.ts';

/** Adversaires affichés pendant un combat de boss (fonctions pures, sans état). */

/** Le boss en personne (entrée en scène). */
export const bossEnemy = (boss: BossIdentity): ArenaEnemy => ({
  key: 'boss',
  name: boss.name,
  boss: true,
  image: `bosses-maths-${boss.id}`,
});

/**
 * Adversaire du moment : le mob de la question, puis le boss. En rage (dernière vie), le boss
 * change d'apparence, sauf au KO qui garde sa pose.
 */
export function currentEnemy(boss: BossIdentity, battle: BattleView | null, state: EnemyState): ArenaEnemy | null {
  if (!battle) return null;
  if (onBoss(battle)) {
    const enraged = battle.bossLives === 1 && state !== 'ko';
    return { ...bossEnemy(boss), image: enraged ? `bosses-maths-${boss.id}-rage-combat` : `bosses-maths-${boss.id}` };
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

/** Adversaire des scènes en grand : le boss au face-à-face, puis celui du moment (1er mob, boss qui arrive). */
export const stagedEnemy = (boss: BossIdentity, s: BattleScreen): ArenaEnemy | null =>
  !s.arrival && s.introStage !== 'mob' ? bossEnemy(boss) : currentEnemy(boss, s.battle, s.enemyState);
