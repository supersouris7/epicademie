import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../testing/fakeSocket.ts')).socketModule);

type Server = ReturnType<typeof renderApp>['server'];
const asked = (server: Server, path: RegExp) => server.calls.filter((c) => path.test(c.path)).length;

/** Plus aucune réponse : seul ce qui est déjà en mémoire peut s'afficher. */
const cutNetwork = () => vi.stubGlobal('fetch', () => new Promise<Response>(() => undefined));

describe('navigation fluide', () => {
  it('menus préparés après l’ouverture : ils s’affichent sans réponse du serveur ni attente', async () => {
    const { user, server } = renderApp('/', { profileId: null });
    const player = await screen.findByRole('button', { name: /Léa/ });
    await waitFor(() => expect(asked(server, /content\/disabled|disabled/)).toBe(1));
    expect(asked(server, /billing/)).toBe(0);
    await user.hover(player);
    await waitFor(() => expect(asked(server, /\/skills$/)).toBe(1));
    await waitFor(() => expect(asked(server, /\/bosses$/)).toBe(1));
    cutNetwork();

    await user.click(player);
    // Le profil vient de la liste déjà reçue.
    expect(await screen.findByRole('list', { name: 'Jouer' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Progrès' }));
    expect(await screen.findByRole('list', { name: 'Progrès par matière' })).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeNull();
    expect(screen.queryByText(/Chargement/)).not.toBeInTheDocument();
  });

  it('donnée jamais reçue : une silhouette, sans message d’attente', async () => {
    renderApp('/hub');
    cutNetwork();
    expect(await screen.findByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText(/Chargement/)).not.toBeInTheDocument();
  });

  it('Espace parent : les progrès des enfants sont demandés dès le survol du bouton', async () => {
    const { user, server } = renderApp('/', { profileId: null });
    await screen.findByRole('button', { name: /Léa/ });
    expect(asked(server, /learning/)).toBe(0);
    await user.hover(screen.getByRole('button', { name: /Espace parent/ }));
    await waitFor(() => expect(asked(server, /learning/)).toBe(1));
  });

  it('Espace parent verrouillé : rien n’est demandé d’avance', async () => {
    const { user, server } = renderApp('/', { profileId: null, parent: false });
    await screen.findByRole('button', { name: /Léa/ });
    await user.hover(screen.getByRole('button', { name: /Espace parent/ }));
    expect(asked(server, /learning/)).toBe(0);
  });

  it('Arène d’évaluation : l’accueil de la matière est demandé à l’appui sur sa tuile', async () => {
    const { user, server } = renderApp('/jouer/evaluation');
    await user.hover(await screen.findByRole('button', { name: 'Maths' }));
    await waitFor(() => expect(asked(server, /evaluation/)).toBeGreaterThan(0));
  });
});
