import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

describe('Mes progrès : trophées et badges', () => {
  it('boss vaincus avec leur médaille, puis les badges (plus d’Acad-Héros)', async () => {
    renderApp('/progres', {
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
    renderApp('/progres');
    const trophies = await screen.findByRole('region', { name: 'Trophées et badges' });
    expect(within(trophies).getByText(/Bats un boss de chapitre/)).toBeInTheDocument();
  });
});
