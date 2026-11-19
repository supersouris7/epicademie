import { describe, expect, it } from 'vitest';
import type { SkillProgress } from '@questeo/shared';
import { chapterProgress, masteryOf, suggestChapter } from './progress.ts';

const state = (skillId: string, over: Partial<SkillProgress> = {}): SkillProgress => ({
  skillId,
  stage: 1,
  due: null,
  attempts: 4,
  correct: 3,
  recent: [true, true, true, false],
  maintained: 0,
  best: 0,
  ...over,
});

describe('progression', () => {
  it('compte notions commencées, acquises (or) et à revoir', () => {
    const states = new Map([
      ['a', state('a', { best: 5 })],
      ['b', state('b', { due: '2026-11-10' })],
    ]);
    expect(chapterProgress(['a', 'b', 'c'], states, '2026-11-19')).toEqual({
      total: 3,
      acquired: 1,
      started: 2,
      due: 1,
    });
  });

  it('niveau affiché tiré de la médaille', () => {
    expect(masteryOf(undefined).id).toBe('non-evalue');
    expect(masteryOf(state('a', { attempts: 0 })).id).toBe('non-evalue');
    expect(masteryOf(state('a', { best: 5 })).label).toBe('Acquise');
    expect(masteryOf(state('a', { best: 4 })).label).toBe('Satisfaisante');
    expect(masteryOf(state('a', { best: 3 })).label).toBe('Fragile');
    expect(masteryOf(state('a', { best: 1 })).label).toBe('À travailler');
  });

  it('où reprendre : à revoir, puis commencé, puis premier non acquis', () => {
    const chapters = [
      { id: 'c1', skills: [{ id: 'a' }] },
      { id: 'c2', skills: [{ id: 'b' }] },
      { id: 'c3', skills: [{ id: 'c' }] },
    ];
    const today = '2026-11-19';
    expect(suggestChapter(chapters, new Map(), today)).toMatchObject({
      chapter: { id: 'c1' },
      why: 'par où commencer',
    });
    expect(suggestChapter(chapters, new Map([['b', state('b')]]), today)).toMatchObject({
      chapter: { id: 'c2' },
      why: 'tu l’as commencé',
    });
    expect(suggestChapter(chapters, new Map([['c', state('c', { due: '2026-11-01' })]]), today)).toMatchObject({
      chapter: { id: 'c3' },
      why: '1 notion à revoir',
    });
    const allGold = new Map(['a', 'b', 'c'].map((id) => [id, state(id, { best: 5 })]));
    expect(suggestChapter(chapters, allGold, today)).toBeNull();
  });
});
