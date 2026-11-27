import { describe, expect, it } from 'vitest';
import type { BattleView } from '@epicademie/shared';
import { bossOfSubject } from '../../../design/bosses.ts';
import { bossEnemy, currentEnemy, enemyHead } from './enemy.ts';

const boss = bossOfSubject('maths');
const view = (over: Partial<BattleView>): BattleView => ({
  id: '00000000-0000-4000-8000-000000000001',
  chapterId: 'm5-relatifs',
  status: 'fighting',
  hearts: 3,
  maxHearts: 3,
  bossLives: 3,
  mobsDefeated: 0,
  turn: 0,
  shield: false,
  hintShown: false,
  weakAttack: false,
  itemsUsed: 0,
  equipped: [],
  question: null,
  inventory: { bouclier: 0, soin: 0, indice: 0 },
  ...over,
});

describe('adversaires du combat', () => {
  it('le boss en personne', () => {
    expect(bossEnemy(boss)).toMatchObject({
      key: 'boss',
      name: boss.name,
      boss: true,
      image: 'bosses-sorcier-pi-pose-idle',
      poses: {
        idle: 'bosses-sorcier-pi-pose-idle',
        attack: 'bosses-sorcier-pi-pose-attack',
        ko: 'bosses-sorcier-pi-pose-defeat',
      },
    });
    // La bande d'attente est dessinée de face : jamais dans l'arène (retour #46, boss « de dos » à l'intro).
    expect(bossEnemy(boss)).not.toHaveProperty('idleAnim');
  });

  it('un mob par question tant qu’il en reste', () => {
    expect(currentEnemy(boss, null)).toBeNull();
    expect(currentEnemy(boss, view({ mobsDefeated: 2 }))).toEqual({
      key: 'mob-2',
      name: 'π-bot',
      boss: false,
      image: 'bosses-minions-pi-bot',
    });
  });

  it('à toute vie, le boss reste en pose tournée vers le héros (pas de bande de face)', () => {
    for (const bossLives of [3, 2, 1]) {
      const e = currentEnemy(boss, view({ mobsDefeated: 4, bossLives }));
      expect(e?.image).toBe('bosses-sorcier-pi-pose-idle');
      expect(e).not.toHaveProperty('idleAnim');
    }
  });

  it('tête dans le bandeau : boss ou mob avec son expression', () => {
    const faces = { boss: 'menace', mob: 'menace' } as const;
    expect(enemyHead(boss, null, null, faces)).toBe('placeholder-boss');
    const mob = view({ mobsDefeated: 1 });
    expect(enemyHead(boss, mob, currentEnemy(boss, mob), faces)).toMatch(/^bosses-minions-pi-bot/);
    const atBoss = view({ mobsDefeated: 4 });
    expect(enemyHead(boss, atBoss, currentEnemy(boss, atBoss), faces)).toBe('bosses-sorcier-pi-head-menace');
  });
});
