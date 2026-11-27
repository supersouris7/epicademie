import { describe, expect, it } from 'vitest';
import { ApiError } from './client.ts';
import { createQueryClient } from './queryClient.ts';

describe('cache des requêtes : nouvelles tentatives', () => {
  const retry = createQueryClient().getDefaultOptions().queries?.retry as (n: number, e: Error) => boolean;

  it('serveur qui redémarre : deux nouvelles tentatives ; refus métier : aucune', () => {
    const restart = new ApiError(502, 'INTERNAL', 'x');
    expect([retry(0, restart), retry(1, restart), retry(2, restart)]).toEqual([true, true, false]);
    expect(retry(0, new ApiError(409, 'CONFLICT', 'x'))).toBe(false);
    expect(retry(0, new Error('réseau'))).toBe(true);
  });
});
