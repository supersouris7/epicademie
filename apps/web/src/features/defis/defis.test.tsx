import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

describe('défis', () => {
  it('Contre-la-montre : règles, chronomètre, arrêt et résultats', async () => {
    const { user } = renderApp('/partie/defi/chrono/maths');
    expect(await screen.findByText(/60 secondes pour donner un maximum/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /C’est parti/ }));
    expect(await screen.findByRole('timer')).toHaveTextContent(/⏱ (60|59) s/);
    await user.click(screen.getByRole('button', { name: 'Arrêter' }));
    expect(await screen.findByRole('heading', { name: /0 bonne réponse/ })).toBeInTheDocument();
  });

  it('Survie : trois cœurs au départ', async () => {
    const { user } = renderApp('/partie/defi/survie/maths');
    await user.click(await screen.findByRole('button', { name: /C’est parti/ }));
    expect(await screen.findByRole('img', { name: '3 cœurs sur 3' })).toBeInTheDocument();
  });

  it('depuis l’accueil : les défis sont jouables', async () => {
    const { user } = renderApp('/hub');
    await user.click(await screen.findByRole('button', { name: /Survie/ }));
    await user.click(await screen.findByRole('button', { name: 'Maths' }));
    expect(await screen.findByText(/3 cœurs. Chaque erreur coûte un cœur/)).toBeInTheDocument();
  });
});
