import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { App } from '../app/App.tsx';
import { AdminApp } from '../features/admin/index.ts';
import { createQueryClient } from '../shared/api/queryClient.ts';
import { useSession } from '../shared/lib/session.ts';
import { useRealtime } from '../features/realtime/store.ts';
import { createFakeApi, type FakeApi, type FakeApiOptions } from './fakeApi.ts';

// L'application charge ses écrans à la demande : ici ils sont déjà transformés avant le 1er test,
// pour que la durée d'une attente ne dépende pas de la machine (couverture en CI).
// L'exclusion reprend la racine du motif inclus : `!../**` laisse passer des fichiers de test.
export const preloadedScreens = import.meta.glob(['../features/**/*.tsx', '!../features/**/*.test.tsx'], {
  eager: true,
});

/**
 * Rend la console d'administration (application à part, admin.html), branchée sur le faux serveur.
 */
export function renderAdmin(options: FakeApiOptions = {}) {
  const server = createFakeApi(options);
  vi.stubGlobal('fetch', server.fetch);
  const user = userEvent.setup();
  return { ...render(<AdminApp />), server, user };
}

/**
 * Rend l'application complète sur une page donnée, branchée sur le faux serveur, avec le
 * profil choisi sur « cet appareil ». Animations réduites (pas d'attente inutile).
 *
 * `fakeTimers` : minuteurs simulés (mises en scène de plusieurs secondes) ; `user` avance alors
 * le temps tout seul entre deux actions. `setup` prépare le faux serveur avant le 1er rendu
 * (panne simulée dès la 1re requête).
 */
export function renderApp(
  path: string,
  {
    profileId,
    fakeTimers = false,
    setup,
    ...api
  }: FakeApiOptions & {
    readonly profileId?: string | null;
    readonly fakeTimers?: boolean;
    readonly setup?: (server: FakeApi) => void;
  } = {},
) {
  const server = createFakeApi(api);
  setup?.(server);
  // État temps réel global (arène, notifications) : repart de zéro à chaque test.
  useRealtime.getState().connect(null);
  useRealtime.setState({ notices: [], refused: null, arena: null });
  vi.stubGlobal('fetch', server.fetch);
  const chosen = profileId === undefined ? [...server.profiles.keys()][0] : profileId;
  useSession.setState({ profileId: chosen ?? null });
  if (fakeTimers) vi.useFakeTimers({ shouldAdvanceTime: true });
  const user = userEvent.setup(fakeTimers ? { advanceTimers: (ms) => vi.advanceTimersByTime(ms) } : {});
  const view = render(
    <QueryClientProvider client={createQueryClient()}>
      <MotionConfig reducedMotion="always">
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </MotionConfig>
    </QueryClientProvider>,
  );
  return { ...view, server, user };
}
