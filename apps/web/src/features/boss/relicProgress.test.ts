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
});
