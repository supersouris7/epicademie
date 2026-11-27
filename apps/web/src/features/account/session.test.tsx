import { renderHook } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import type { Me } from '@epicademie/shared';
import { createQueryClient } from '../../shared/api/queryClient.ts';
import { meKey, useSetMe } from './api.ts';

const me = (family: string): Me => ({
  account: { id: family, email: null, role: 'parent' },
  family: { id: family, autonomous: false },
  parent: true,
  parentUntil: null,
  hasPin: false,
});

function open() {
  const qc = createQueryClient();
  qc.setQueryData(meKey, me('a'));
  qc.setQueryData(['profiles'], ['de la famille a']);
  const { result } = renderHook(useSetMe, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    ),
  });
  return { qc, setMe: result.current };
}

describe('session en cache', () => {
  it('même famille (déverrouillage parent) : les données restent affichables', () => {
    const { qc, setMe } = open();
    setMe(me('a'));
    expect(qc.getQueryData(['profiles'])).toBeDefined();
  });

  it('autre famille : rien de la précédente ne reste', () => {
    const { qc, setMe } = open();
    setMe(me('b'));
    expect(qc.getQueryData(['profiles'])).toBeUndefined();
    expect(qc.getQueryData(meKey)).toEqual(me('b'));
  });

  it('déconnexion : cache vidé', () => {
    const { qc, setMe } = open();
    setMe(null);
    expect(qc.getQueryCache().getAll()).toHaveLength(0);
  });
});
