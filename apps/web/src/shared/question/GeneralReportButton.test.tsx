import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

/** Signalement général : accessible depuis le menu principal, l'Espace parent et la question en cours. */

async function sendFrom(user: ReturnType<typeof renderApp>['user'], reasonLabel: string) {
  const dialog = await screen.findByRole('dialog', { name: 'Signaler un souci' });
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
    await user.click(await screen.findByRole('button', { name: 'Signaler un souci' }));
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
    await user.click(await screen.findByRole('button', { name: 'Signaler un souci' }));
    await sendFrom(user, 'Ça ne marche pas (bug)');
    expect(server.reports).toEqual([expect.objectContaining({ reason: 'bug', screen: '/parent' })]);
  });

  it('depuis une question (entraînement, combat) : « Autre souci » ouvre le signalement général', async () => {
    const { user, server } = renderApp('/partie/entrainement/m5-calcul/m5-tables');
    await user.click(await screen.findByRole('button', { name: 'Signaler un problème' }));
    await user.click(screen.getByRole('button', { name: /Autre souci/ }));
    await sendFrom(user, 'Problème d’affichage');
    expect(server.reports).toEqual([expect.objectContaining({ kind: 'general', reason: 'affichage' })]);
  });
});
