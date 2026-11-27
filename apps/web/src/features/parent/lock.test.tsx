import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Me } from '@epicademie/shared';
import { createQueryClient, PARENT_GC_MS } from '../../shared/api/queryClient.ts';
import { useSetMe } from '../account/index.ts';
import { billingKey, useBilling } from './billing.ts';
import { FamilyFriends } from './FamilyFriends.tsx';
import { evaluationSummaryQuery, learningQuery } from './queries.ts';

const me = (parent: boolean): Me => ({
  account: { id: 'a', email: null, role: 'parent' },
  family: { id: 'a', autonomous: false },
  parent,
  parentUntil: null,
  hasPin: false,
});

describe('verrouillage de l’Espace parent', () => {
  it('abonnement, amis de la famille et suivi quittent le cache ; les profils restent', async () => {
    vi.stubGlobal('fetch', () => Promise.resolve(Response.json([])));
    const qc = createQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );
    qc.setQueryData(['me'], me(true));
    qc.setQueryData(['profiles'], []);
    const billing = renderHook(useBilling, { wrapper });
    const friends = render(<FamilyFriends />, { wrapper });
    await screen.findByText('Aucune demande pour l’instant.');
    await qc.query(learningQuery('p'));
    await qc.query(evaluationSummaryQuery('p'));
    await waitFor(() => expect(billing.result.current.data).toBeDefined());
    for (const queryKey of [billingKey, ['family-friends']]) {
      expect(qc.getQueryCache().find({ queryKey })?.gcTime).toBe(PARENT_GC_MS);
    }
    billing.unmount();
    friends.unmount();

    renderHook(useSetMe, { wrapper }).result.current(me(false));
    expect(
      qc
        .getQueryCache()
        .getAll()
        .map((q) => q.queryKey[0])
        .sort(),
    ).toEqual(['me', 'profiles']);
  });
});
