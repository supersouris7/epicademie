import { describe, expect, it } from 'vitest';
import { IRREGULAR_VERBS } from './verbs.ts';

describe('anglais : verbes irréguliers', () => {
  it('52 verbes du tableau du British Council, sans doublon', () => {
    expect(IRREGULAR_VERBS).toHaveLength(52);
    expect(new Set(IRREGULAR_VERBS.map((v) => v.base)).size).toBe(52);
  });
});
