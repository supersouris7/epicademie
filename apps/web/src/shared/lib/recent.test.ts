import { describe, expect, it } from 'vitest';
import { generate } from '@questeo/content';
import { freshQuestion } from './recent.ts';

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
});
