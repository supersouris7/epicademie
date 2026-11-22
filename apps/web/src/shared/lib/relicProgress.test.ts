import { chaptersOf } from '@questeo/content';
import { describe, expect, it } from 'vitest';
import { relicProgressOf } from './relicProgress.ts';

describe('relicProgressOf', () => {
  const bosses = chaptersOf('maths').filter((c) => c.boss);

  it('compte les boss vaincus de la matière', () => {
    const records = [
      { chapterId: bosses[0]!.id, wins: 2 },
      { chapterId: bosses[1]!.id, wins: 0 },
      { chapterId: 'autre', wins: 3 },
    ];
    expect(relicProgressOf('maths', undefined, records)).toEqual({ won: 1, max: bosses.length });
  });

  it('vaut 0 sur 0 pour une matière sans boss', () => {
    expect(relicProgressOf('inconnue', '6e', [])).toEqual({ won: 0, max: 0 });
  });

  it('suit la classe demandée : un boss d’une autre classe ne compte pas', () => {
    const grades = ['cm1', 'cm2', '6e', '5e', '4e', '3e'] as const;
    const withBoss = grades.find((g) => chaptersOf('maths', g).some((c) => c.boss));
    const other = grades.find((g) => g !== withBoss);
    const boss = chaptersOf('maths', withBoss).find((c) => c.boss)!;
    const records = [{ chapterId: boss.id, wins: 1 }];
    expect(relicProgressOf('maths', withBoss, records).won).toBe(1);
    expect(relicProgressOf('maths', other, records).won).toBe(0);
  });
});
