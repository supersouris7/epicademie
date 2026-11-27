import { renderHook } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createQueryClient } from '../../shared/api/queryClient.ts';
import { makeProfile } from '../../testing/fakeApi.ts';
import { profilesQuery, useProfile } from './api.ts';

/** Profil repris de la liste déjà reçue, et redemandé quand elle est périmée. */
function open(prepare: (qc: ReturnType<typeof createQueryClient>) => void) {
  const fetch = vi.fn(() => new Promise<Response>(() => undefined));
  vi.stubGlobal('fetch', fetch);
  const qc = createQueryClient();
  prepare(qc);
  const profile = makeProfile();
  const { result } = renderHook(() => useProfile(profile.id), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    ),
  });
  return { result, fetch, profile };
}

describe('profil connu par la liste', () => {
  it('affiché tout de suite, sans nouvelle demande', () => {
    const { result, fetch, profile } = open((qc) => qc.setQueryData(profilesQuery.queryKey, [makeProfile()]));
    expect(result.current.data).toEqual(profile);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('liste périmée par une modification : affiché tout de suite puis redemandé', () => {
    const { result, fetch, profile } = open((qc) => {
      qc.setQueryData(profilesQuery.queryKey, [makeProfile()]);
      void qc.invalidateQueries({ queryKey: profilesQuery.queryKey });
    });
    expect(result.current.data).toEqual(profile);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('profil absent de la liste : demandé au serveur', () => {
    const { result, fetch } = open((qc) => qc.setQueryData(profilesQuery.queryKey, []));
    expect(result.current.isPending).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
