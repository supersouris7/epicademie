import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

describe('amis', () => {
  it('Mes amis : mon code, ajout par code (erreur puis demande envoyée), retrait', async () => {
    const { user } = renderApp('/amis');
    expect(await screen.findByText('LEA7K2')).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/Son code/);
    await user.type(input, 'zzzzzz');
    await user.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(await screen.findByText(/Aucun joueur avec ce code/)).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, 'tom234');
    await user.click(screen.getByRole('button', { name: 'Ajouter' }));
    const list = screen.getByRole('list', { name: 'Mes amis' });
    expect(await within(list).findByText(/Demande envoyée/)).toBeInTheDocument();
    await user.click(within(list).getByRole('button', { name: 'Retirer Tom' }));
    expect(await within(list).findByText(/Pas encore d’ami/)).toBeInTheDocument();
  });

  it('Multijoueur : une seule mascotte, le bouton « Mes amis » ; plus de bannière sur l’accueil', async () => {
    const { user } = renderApp('/multi');
    expect(await screen.findByRole('button', { name: /Joueurs connectés/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mes amis' }));
    expect(await screen.findByRole('heading', { name: 'Mes amis' })).toBeInTheDocument();
  });

  it('accueil : plus de bannière des joueurs connectés', async () => {
    renderApp('/hub');
    expect(await screen.findByRole('group', { name: 'Mon joueur' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Joueurs connectés/ })).not.toBeInTheDocument();
  });

  it('se comparer : classement par niveau, puis cette semaine (toi en avant, ami marqué)', async () => {
    const { user } = renderApp('/classement');
    const list = await screen.findByRole('list', { name: 'Classement : Niveau' });
    const items = await within(list).findAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Tom');
    expect(items[1]).toHaveTextContent('Léa (toi)');
    await user.click(screen.getByRole('tab', { name: 'Cette semaine' }));
    const week = within(screen.getByRole('list', { name: 'Classement : Cette semaine' })).getAllByRole('listitem');
    expect(week[0]).toHaveTextContent('Léa (toi)');
  });
});
