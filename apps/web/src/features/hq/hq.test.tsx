import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

describe('Mon QG', () => {
  it('depuis l’accueil : héros en pied, titre, vitrine vide, héros de départ en trophée', async () => {
    const { user } = renderApp('/hub');
    await user.click(await screen.findByRole('button', { name: 'Mon QG et mes trophées' }));
    expect(await screen.findByRole('heading', { name: 'Mon QG' })).toBeInTheDocument();
    expect(screen.getByText('Apprenti')).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Vitrine' })).getAllByText('Emplacement libre')).toHaveLength(3);
    // Le trophée « héros de départ » se pose dans la vitrine.
    await user.click(screen.getByRole('button', { name: /Acad-Héros : Lina/ }));
    expect(
      await within(screen.getByRole('list', { name: 'Vitrine' })).findByText('Acad-Héros : Lina'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Acad-Héros : Lina/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('achat d’un décor en rubis, puis installation ; décor de badge à débloquer en jouant', async () => {
    const { user } = renderApp('/qg');
    await screen.findByRole('heading', { name: 'Mon QG' });
    const panel = await screen.findByRole('tabpanel', { name: 'Décor du QG' });
    expect(within(panel).getByText(/À débloquer : Badge Chasseur de boss, grade Argent/)).toBeInTheDocument();
    await user.click(within(panel).getByRole('button', { name: 'Acheter · 2 rubis' }));
    expect(await screen.findByText(/Acheté !/)).toBeInTheDocument();
    const buttons = await within(panel).findAllByRole('button', { name: 'Installer' });
    await user.click(buttons[0]!);
    expect(await within(panel).findAllByRole('button', { name: 'Installé' })).toHaveLength(1);
  });

  it('pas assez de rubis : message clair', async () => {
    const { user } = renderApp('/qg');
    await user.click(await screen.findByRole('tab', { name: 'Titre' }));
    await user.click(screen.getByRole('button', { name: 'Acheter · 8 rubis' }));
    expect(await screen.findByText('Il te faut 8 rubis.')).toBeInTheDocument();
  });
});
