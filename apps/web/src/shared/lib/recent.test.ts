import { afterEach, describe, expect, it, vi } from 'vitest';
import * as content from '@epicademie/content';
import { generate } from '@epicademie/content';

vi.mock('@epicademie/content', async (orig) => {
  const actual = await orig<typeof import('@epicademie/content')>();
  return { ...actual, generate: vi.fn(actual.generate) };
});

import { freshQuestion } from './recent.ts';

afterEach(() => vi.unstubAllGlobals());

describe('questions sans doublon', () => {
  it('évite les énoncés de la partie, puis ceux des dernières parties', () => {
    let n = 1;
    const next = () => ++n;
    const first = generate('m5-tables', 1, 1).prompt;
    const second = generate('m5-tables', 1, 2).prompt;
    const q = freshQuestion(
      { skillId: 'm5-tables', level: 1, seed: 1 },
      { seen: new Set([first]), recent: [second] },
      next,
    );
    expect(q.question.prompt).not.toBe(first);
    expect(q.question.prompt).not.toBe(second);
  });

  it('une série entière de tables n’a aucun doublon', () => {
    const seen = new Set<string>();
    let n = 0;
    for (let i = 0; i < 5; i++) {
      const q = freshQuestion({ skillId: 'm5-tables', level: 1, seed: ++n }, { seen, recent: [] }, () => ++n);
      expect(seen.has(q.question.prompt)).toBe(false);
      seen.add(q.question.prompt);
    }
  });

  it('une question d’écoute sans voix est remplacée par une autre de la notion', () => {
    vi.stubGlobal('speechSynthesis', { getVoices: () => [], cancel: vi.fn(), speak: vi.fn() });
    const audio = { text: 'Seven', lang: 'en-GB' };
    const real = vi.mocked(content.generate).getMockImplementation();
    vi.mocked(content.generate).mockImplementation((skillId, level, seed) => {
      const q = real!(skillId, level, seed);
      return seed === 1 ? { ...q, audio } : q;
    });
    const q = freshQuestion({ skillId: 'm5-tables', level: 1, seed: 1 }, { seen: new Set(), recent: [] }, () => 2);
    expect(q.seed).toBe(2);
    expect(q.question.audio).toBeUndefined();
    vi.mocked(content.generate).mockImplementation(real!);
  });
});
