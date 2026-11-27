import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

describe('choix des notions', () => {
  it('chaque notion affiche sa médaille en premier (tout à gauche), en grand', async () => {
    renderApp('/jouer/entrainement/maths/m5-calcul');
    const medals = await screen.findAllByTestId('notion-medal');
    expect(medals.length).toBeGreaterThan(0);
    for (const m of medals) {
      expect(m.parentElement?.firstElementChild).toBe(m);
      expect(within(m).getByRole('img', { name: 'Pas encore de médaille' })).toBeInTheDocument();
    }
  });
});
