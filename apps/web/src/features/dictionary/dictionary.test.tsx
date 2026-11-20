import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

describe('Mon dictionnaire', () => {
  it('depuis l’accueil : mots par famille, définition et schéma, mot coché une fois regardé', async () => {
    const { user } = renderApp('/hub');
    await user.click(await screen.findByRole('button', { name: 'Mon dictionnaire' }));
    expect(await screen.findByRole('heading', { name: 'La division' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Longueurs, aires et volumes' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /cm³ \(centimètre cube\)/ }));
    const dialog = screen.getByRole('dialog', { name: /cm³/ });
    expect(dialog).toHaveTextContent('le volume d’un cube de 1 cm d’arête');
    expect(within(dialog).getByLabelText(/le lien entre cm, cm² et cm³/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'J’ai compris' }));
    expect(screen.getByRole('button', { name: /cm³ \(centimètre cube\)/ })).toHaveTextContent('✓');
  });
});
