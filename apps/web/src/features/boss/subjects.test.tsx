import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

describe('boss des autres matières', () => {
  it('anglais : son boss (cadre provisoire), son nom en titre, combats ouverts avec la tête du boss', async () => {
    const { user } = renderApp('/jouer/boss/anglais');
    const closeUp = await screen.findByRole('dialog', { name: 'Lord Blablabla te provoque' });
    expect(within(closeUp).getByRole('heading', { name: 'Lord Blablabla' })).toBeInTheDocument();
    expect(within(closeUp).getByText(/Touche l’écran pour continuer/)).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 700)); // anti double-toucher
    await user.click(within(closeUp).getByRole('button', { name: 'Passer' }));
    expect((await screen.findAllByRole('button', { name: /Combattre/ })).length).toBeGreaterThan(0);
    expect(screen.queryByText('À venir')).not.toBeInTheDocument();
  });
});
