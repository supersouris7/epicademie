import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDebugMode } from '../lib/debugMode.ts';
import { renderAdmin, renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

/** Signalement général : accessible depuis le menu principal, l'Espace parent et la question en cours. */

async function sendFrom(user: ReturnType<typeof renderApp>['user'], reasonLabel: string) {
  const dialog = await screen.findByRole('dialog', { name: 'Signaler un problème sur cet écran' });
  const send = within(dialog).getByRole('button', { name: 'Envoyer' });
  expect(send).toBeDisabled();
  await user.click(within(dialog).getByRole('radio', { name: reasonLabel }));
  await user.type(within(dialog).getByLabelText('Dis-nous en plus (facultatif)'), 'rien ne bouge');
  await user.click(send);
  expect(await within(dialog).findByRole('status')).toHaveTextContent('Merci');
}

describe('signaler un souci', () => {
  it('depuis le menu principal : écran et version ajoutés automatiquement', async () => {
    const { user, server } = renderApp('/parametres');
    await user.click(await screen.findByRole('button', { name: 'Signaler un problème sur cet écran' }));
    await sendFrom(user, 'Problème de son');
    expect(server.reports).toEqual([
      expect.objectContaining({
        kind: 'general',
        reason: 'son',
        comment: 'rien ne bouge',
        screen: '/parametres',
        appVersion: expect.any(String) as string,
      }),
    ]);
  });

  it('depuis l’Espace parent', async () => {
    const { user, server } = renderApp('/parent', { parent: true });
    await user.click(await screen.findByRole('button', { name: 'Signaler un problème sur cet écran' }));
    await sendFrom(user, 'Ça ne marche pas (bug)');
    expect(server.reports).toEqual([expect.objectContaining({ reason: 'bug', screen: '/parent' })]);
  });

  it('une question n’offre que le signalement de la question, sans « Autre souci »', async () => {
    const { user } = renderApp('/partie/entrainement/m5-calcul/m5-tables');
    await user.click(await screen.findByRole('button', { name: 'Signaler cette question' }));
    const dialog = screen.getByRole('dialog', { name: 'Signaler cette question' });
    expect(within(dialog).queryByRole('button', { name: /Autre souci/ })).toBeNull();
    expect(within(dialog).queryByRole('radio', { name: 'Problème de son' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Signaler un problème sur cet écran' })).toBeNull();
  });
});

describe('mode debug', () => {
  afterEach(() => useDebugMode.getState().setEnabled(false));

  it('désactivé par défaut : aucun drapeau', async () => {
    renderApp('/partie/entrainement/m5-calcul/m5-tables');
    await screen.findByRole('button', { name: 'Signaler cette question' });
    expect(screen.queryByRole('button', { name: 'Signaler un problème sur cet écran' })).toBeNull();
  });

  it('activé : le drapeau ouvre le signalement de l’écran courant, y compris en partie', async () => {
    useDebugMode.getState().setEnabled(true);
    const { user, server } = renderApp('/partie/entrainement/m5-calcul/m5-tables');
    await screen.findByRole('button', { name: 'Signaler cette question' });
    await user.click(screen.getByRole('button', { name: 'Signaler un problème sur cet écran' }));
    await sendFrom(user, 'Problème d’affichage');
    expect(server.reports).toEqual([
      expect.objectContaining({
        kind: 'general',
        reason: 'affichage',
        screen: '/partie/entrainement/m5-calcul/m5-tables',
      }),
    ]);
  });

  it('s’active depuis l’administration', async () => {
    const { user } = renderAdmin({ admin: true });
    // Mode debug : premier outil de la rubrique « Technique ».
    await user.click(await screen.findByRole('tab', { name: 'Technique' }));
    const box = await screen.findByRole('checkbox', { name: /drapeau de signalement/ });
    expect(box).not.toBeChecked();
    await user.click(box);
    expect(useDebugMode.getState().enabled).toBe(true);
  });
});
