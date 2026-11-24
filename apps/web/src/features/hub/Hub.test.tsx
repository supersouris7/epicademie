import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

const GROUPS: readonly [string, readonly string[]][] = [
  ['Défis', ['Contre-la-montre', 'Survie', 'Arène d’évaluation']],
  ['En famille', ['Duels']],
];

describe('accueil : deux grands modes, Défis et En famille dessous', () => {
  it('affiche les deux gros boutons puis les groupes Défis et En famille, sans mode retiré', async () => {
    renderApp('/hub');
    const play = await screen.findByRole('list', { name: 'Jouer' });
    expect(
      within(play)
        .getAllByRole('button')
        .map((b) => b.textContent.trim()),
    ).toEqual(['Entraînement', 'Mode Histoire']);
    for (const [group, names] of GROUPS) {
      const section = (await screen.findByRole('heading', { name: group })).closest('section')!;
      const labels = within(section)
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-label') ?? b.textContent.trim());
      expect(labels).toEqual(names);
    }
    for (const gone of ['Raid', 'Quiz', 'Course']) {
      expect(screen.queryByRole('button', { name: new RegExp(gone) })).not.toBeInTheDocument();
    }
  });

  it('l’Arène d’évaluation est disponible (plus de « À venir ») et mène au choix de la matière', async () => {
    const { user } = renderApp('/hub');
    const tile = await screen.findByRole('button', { name: /Arène d’évaluation/ });
    expect(tile).not.toHaveAttribute('aria-disabled');
    expect(tile).not.toHaveTextContent(/À venir/);
    await user.click(tile);
    expect(await screen.findByRole('heading', { name: 'Arène d’évaluation' })).toBeInTheDocument();
  });

  it('Duels mène à l’écran des duels', async () => {
    const { user } = renderApp('/hub');
    await user.click(await screen.findByRole('button', { name: /Duels/ }));
    expect(await screen.findByRole('heading', { name: 'Duels' })).toBeInTheDocument();
  });
});
