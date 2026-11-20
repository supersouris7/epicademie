import { describe, expect, it } from 'vitest';
import type { BattleView } from '@questeo/shared';
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
  itemsUsed: 0,
  equipped: [],
  question: null,
  inventory: { bouclier: 0, soin: 0, indice: 0 },
  ...over,
});

describe('adversaires du combat', () => {
  it('le boss en personne', () => {
    expect(bossEnemy(boss)).toEqual({ key: 'boss', name: boss.name, boss: true, image: `bosses-maths-${boss.id}` });
  });

  it('un mob par question tant qu’il en reste', () => {
    expect(currentEnemy(boss, null, 'idle')).toBeNull();
    expect(currentEnemy(boss, view({ mobsDefeated: 2 }), 'idle')).toEqual({
      key: 'mob-2',
      name: 'π-bot',
      boss: false,
      image: 'bosses-minions-pi-bot',
    });
  });

  it('le boss change d’apparence en rage, sauf au KO', () => {
    const calm = currentEnemy(boss, view({ mobsDefeated: 4, bossLives: 2 }), 'idle');
    expect(calm?.image).toBe(`bosses-maths-${boss.id}`);
    expect(currentEnemy(boss, view({ mobsDefeated: 4, bossLives: 1 }), 'idle')?.image).toMatch(/-rage-combat$/);
    expect(currentEnemy(boss, view({ mobsDefeated: 4, bossLives: 1 }), 'ko')?.image).toBe(`bosses-maths-${boss.id}`);
  });

  it('tête dans le bandeau : boss ou mob avec son expression', () => {
    const faces = { boss: 'menace', mob: 'menace' } as const;
    expect(enemyHead(boss, null, null, faces)).toBe('placeholder-boss');
    const mob = view({ mobsDefeated: 1 });
    expect(enemyHead(boss, mob, currentEnemy(boss, mob, 'idle'), faces)).toMatch(/^bosses-minions-pi-bot/);
    const atBoss = view({ mobsDefeated: 4 });
    expect(enemyHead(boss, atBoss, currentEnemy(boss, atBoss, 'idle'), faces)).toMatch(/^bosses-maths-/);
  });
});
