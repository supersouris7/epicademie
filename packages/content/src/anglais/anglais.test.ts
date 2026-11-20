import { describe, expect, it } from 'vitest';
import { check, generate } from '../index.ts';
import { IRREGULAR_VERBS, regularised } from './verbs.ts';

describe('anglais : verbes irréguliers', () => {
  it('52 verbes du tableau du British Council, sans doublon', () => {
    expect(IRREGULAR_VERBS).toHaveLength(52);
    expect(new Set(IRREGULAR_VERBS.map((v) => v.base)).size).toBe(52);
  });

  it('prétérit : réponse acceptée sans tenir compte des majuscules ; « goed » expliqué', () => {
    for (let seed = 1; seed < 60; seed++) {
      const q = generate('a5-preterit', 1, seed);
      if (!q.prompt.includes('to go')) continue;
      expect(check(q, { kind: 'text', text: 'Went' }).correct).toBe(true);
      const wrong = check(q, { kind: 'text', text: regularised('go') });
      expect(wrong.correct).toBe(false);
      expect(wrong.why).toMatch(/irrégulier/);
      return;
    }
    throw new Error('« go » jamais tiré');
  });

  it('« be » : was et were sont acceptés', () => {
    for (let seed = 1; seed < 200; seed++) {
      const q = generate('a5-preterit', 1, seed);
      if (!q.prompt.includes('to be')) continue;
      expect(check(q, { kind: 'text', text: 'was' }).correct).toBe(true);
      expect(check(q, { kind: 'text', text: 'were' }).correct).toBe(true);
      return;
    }
    throw new Error('« be » jamais tiré');
  });
});
