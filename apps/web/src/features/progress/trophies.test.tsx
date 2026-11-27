import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

describe('Mes progrès : détail d’une matière', () => {
  it('légende des médailles : une ligne par médaille, condition du diamant en clair', async () => {
    renderApp('/progres/maths');
    const legend = await screen.findByRole('list', { name: 'Légende des médailles' });
    expect(
      within(legend)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual([
      'Diamant : tout réussi du premier coup, sans indice ni explication',
      'Or : tout réussi, avec de l’aide (notion acquise)',
      'Argent : il te reste 1 question à réussir',
      'Bronze : il t’en reste 2',
    ]);
  });
});

describe('Mes progrès : trophées et badges', () => {
  it('boss vaincus avec leur médaille, puis les badges (plus d’Acad-Héros)', async () => {
    renderApp('/progres/trophees', {
      setup: (server) => {
        server.overview.records = [
          { chapterId: 'm5-calcul', wins: 2, bestHearts: 3, bestMedal: 'or', firstWonAt: '2026-11-19T10:00:00.000Z' },
        ];
      },
    });
    const trophies = await screen.findByRole('region', { name: 'Trophées et badges' });
    const bosses = await within(trophies).findByRole('list', { name: 'Boss vaincus' });
    expect(within(bosses).getByLabelText('Calcul mental : médaille Or')).toHaveTextContent('× 2');
    expect(within(trophies).queryByText(/Acad-Héros/)).not.toBeInTheDocument();
    expect(await within(trophies).findByRole('heading', { name: 'Badges' })).toBeInTheDocument();
  });

  it('aucun boss vaincu : message d’encouragement', async () => {
    renderApp('/progres/trophees');
    const trophies = await screen.findByRole('region', { name: 'Trophées et badges' });
    expect(within(trophies).getByText(/Bats un boss de chapitre/)).toBeInTheDocument();
  });

  it('trophées de chapitre : obtenu en couleur, les autres grisés', async () => {
    renderApp('/progres/trophees', { trophies: ['m5-calcul'] });
    const list = await screen.findByRole('list', { name: 'Trophées de chapitre' });
    expect(await within(list).findByLabelText(/Calcul mental : obtenu/)).toHaveTextContent('Validé');
    const other = within(list)
      .getAllByRole('listitem')
      .find((li) => (li.getAttribute('aria-label') ?? '').includes('pas encore gagné'));
    expect(other).toHaveTextContent('Épreuve à réussir');
  });
});
