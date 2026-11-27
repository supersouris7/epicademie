import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Me } from '@epicademie/shared';
import { ApiError } from '../../shared/api/client.ts';
import { createQueryClient } from '../../shared/api/queryClient.ts';
import { useSession } from '../../shared/lib/session.ts';
import { renderApp } from '../../testing/renderApp.tsx';
import { useMe } from './api.ts';
import { meKey, SESSION_SIGNAL, useSessionSync } from './sessionCache.ts';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

const me = (family: string): Me => ({
  account: { id: family, email: null, role: 'parent' },
  family: { id: family, autonomous: false },
  parent: false,
  parentUntil: null,
  hasPin: false,
});

/** Appareil connecté à la famille « a », ses données en mémoire ; le serveur répond `answer` à la session. */
function open(answer: Me | 401) {
  vi.stubGlobal('fetch', () =>
    Promise.resolve(
      answer === 401
        ? Response.json({ code: 'UNAUTHORIZED', error: 'Connecte-toi.' }, { status: 401 })
        : Response.json(answer),
    ),
  );
  const qc = createQueryClient();
  qc.setQueryData(meKey, me('a'));
  qc.setQueryData(['profiles'], ['de la famille a']);
  qc.setQueryData(['auth-options'], {});
  useSession.getState().selectProfile('profil-a');
  localStorage.removeItem(SESSION_SIGNAL);
  const { result } = renderHook(
    () => {
      useSessionSync();
      return useMe();
    },
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
      ),
    },
  );
  return { qc, result };
}

const signal = () => localStorage.getItem(SESSION_SIGNAL)?.split('|')[0];
const otherTab = (family: string) =>
  act(() => {
    window.dispatchEvent(new StorageEvent('storage', { key: SESSION_SIGNAL, newValue: `${family}|1` }));
  });

describe('session finie ou changée', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => useSession.setState({ profileId: null }));

  it('401 sur la session : données et profil choisi retirés, autres onglets avertis', async () => {
    const { qc, result } = open(401);
    await act(() => result.current.refetch());
    expect(qc.getQueryData(['profiles'])).toBeUndefined();
    expect(qc.getQueryData(['auth-options'])).toBeDefined();
    expect(useSession.getState().profileId).toBeNull();
    expect(signal()).toBe('');
  });

  it('401 sur une autre requête : la session est revérifiée et les données retirées', async () => {
    const { qc } = open(401);
    await act(() =>
      qc
        .query({ queryKey: ['skills', 'x'], queryFn: () => Promise.reject(new ApiError(401, 'UNAUTHORIZED', 'non')) })
        .catch(() => undefined),
    );
    await waitFor(() => expect(qc.getQueryData(['profiles'])).toBeUndefined());
  });

  it('autre famille reçue du serveur : rien de la précédente ne reste', async () => {
    const { qc, result } = open(me('b'));
    await act(() => result.current.refetch());
    expect(qc.getQueryData(['profiles'])).toBeUndefined();
    expect(useSession.getState().profileId).toBeNull();
    expect(signal()).toBe('b');
  });

  it.each(['b', ''])('autre onglet (« %s ») : données retirées, session redemandée', async (family) => {
    const { qc, result } = open(me('b'));
    otherTab(family);
    expect(qc.getQueryData(['profiles'])).toBeUndefined();
    expect(useSession.getState().profileId).toBeNull();
    await waitFor(() => expect(result.current.data?.family.id).toBe('b'));
  });

  it('autre onglet, même famille : les données restent, la session est revérifiée', async () => {
    const { qc, result } = open({ ...me('a'), hasPin: true });
    otherTab('a');
    await waitFor(() => expect(result.current.data?.hasPin).toBe(true));
    expect(qc.getQueryData(['profiles'])).toBeDefined();
    expect(useSession.getState().profileId).toBe('profil-a');
  });

  it('déconnexion dans un autre onglet : les profils quittent l’écran', async () => {
    renderApp('/', { profileId: null });
    await screen.findByRole('button', { name: /Léa/ });
    vi.stubGlobal('fetch', () =>
      Promise.resolve(Response.json({ code: 'UNAUTHORIZED', error: 'Connecte-toi.' }, { status: 401 })),
    );
    otherTab('');
    await waitFor(() => expect(screen.queryByRole('button', { name: /Léa/ })).not.toBeInTheDocument());
  });
});
