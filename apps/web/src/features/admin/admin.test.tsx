import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getChapter } from '@questeo/content';
import { FAKE_PASSWORD } from '../../testing/fakeApi.ts';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

/** Fiabilité pédagogique côté écran : signaler, notions en maintenance, administration. */

describe('signaler une question', () => {
  it('depuis l’entraînement : motif obligatoire, envoi avec la question exacte', async () => {
    const { user, server } = renderApp('/partie/entrainement/m5-calcul/m5-tables');
    await user.click(await screen.findByRole('button', { name: 'Signaler un problème' }));
    const dialog = screen.getByRole('dialog', { name: 'Signaler un problème' });
    const send = within(dialog).getByRole('button', { name: 'Envoyer' });
    expect(send).toBeDisabled();
    await user.click(within(dialog).getByRole('radio', { name: 'La réponse attendue est fausse' }));
    await user.type(within(dialog).getByLabelText('Précision (facultatif)'), 'Le résultat est 42');
    await user.click(send);
    expect(await within(dialog).findByRole('status')).toHaveTextContent('Merci');
    expect(server.reports).toEqual([
      expect.objectContaining({
        skillId: 'm5-tables',
        reason: 'mauvaise-reponse',
        comment: 'Le résultat est 42',
        profileId: expect.any(String) as string,
      }),
    ]);
  });
});

describe('notions en maintenance', () => {
  it('affichées « en maintenance », non jouables, absentes de « Tout le chapitre »', async () => {
    renderApp('/jouer/entrainement/maths/m5-calcul', { disabled: ['m5-tables'] });
    const tables = await screen.findByRole('button', { name: /Tables de multiplication/ });
    await waitFor(() => expect(tables).toBeDisabled());
    expect(tables).toHaveTextContent('en maintenance');
    const all = screen.getByRole('button', { name: /Tout le chapitre/ });
    const total = Number(/\((\d+) notions\)/.exec(all.textContent)?.[1]);
    expect(total).toBe((getChapter('m5-calcul')?.skills.length ?? 0) - 1);
  });
});

describe('administration', () => {
  it('aucun bouton vers la console : adresse /admin seulement', async () => {
    renderApp('/', { admin: true });
    await screen.findByRole('button', { name: 'Nouveau joueur' });
    expect(screen.queryByRole('button', { name: 'Administration' })).not.toBeInTheDocument();
  });

  it('mot de passe redemandé à l’ouverture, puis « Fermer la session »', async () => {
    const { user } = renderApp('/admin', { admin: true, adminLocked: true });
    const password = await screen.findByLabelText('Mot de passe');
    await user.type(password, 'faux');
    await user.click(screen.getByRole('button', { name: 'Ouvrir la session' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('incorrect');
    await user.clear(password);
    await user.type(password, FAKE_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Ouvrir la session' }));
    expect(await screen.findByRole('heading', { name: /Console d’administration/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fermer la session' }));
    expect(await screen.findByRole('button', { name: 'Nouveau joueur' })).toBeInTheDocument();
  });

  it('non administrateur : accès refusé', async () => {
    renderApp('/admin', { admin: false });
    expect(await screen.findByText('Accès réservé à l’administration.')).toBeInTheDocument();
  });

  it('signalement traité, notion désactivée depuis la console', async () => {
    const { user, server } = renderApp('/admin', { admin: true });
    server.reports.push({
      id: '99999999-9999-4999-8999-999999999999',
      profileId: null,
      skillId: 'm5-tables',
      level: 1,
      seed: 3,
      skillVersion: 1,
      reason: 'ambigue',
      comment: 'pas clair',
      status: 'nouveau',
      adminNote: null,
      createdAt: '2026-11-20T10:00:00.000Z',
      resolvedAt: null,
    });
    await user.click(await screen.findByRole('tab', { name: 'Signalements' }));
    const table = await screen.findByRole('table', { name: 'Signalements' });
    expect(await within(table).findByText('La question n’est pas claire')).toBeInTheDocument();
    await user.click(within(table).getByRole('button', { name: 'Détail' }));
    const card = screen.getByLabelText(/Signalement Tables de multiplication/);
    expect(card).toHaveTextContent('Réponse attendue');
    await user.type(within(card).getByLabelText('Note de l’équipe'), 'Énoncé reformulé');
    await user.click(within(card).getByRole('button', { name: 'Résolu' }));
    await waitFor(() => expect(server.reports[0]?.status).toBe('resolu'));

    await user.click(screen.getByRole('tab', { name: 'Notions' }));
    const notions = await screen.findByRole('table', { name: 'Notions' });
    await user.type(screen.getByRole('searchbox', { name: 'Rechercher dans Notions' }), 'Tables de multiplication');
    await user.click(within(notions).getAllByRole('button', { name: 'Détail' })[0]!);
    const row = await screen.findByLabelText('Notion Tables de multiplication');
    expect(within(row).getByText(/Programme :/)).toBeInTheDocument();
    await user.click(within(row).getByRole('button', { name: 'Désactiver' }));
    await waitFor(() => expect(server.calls.some((c) => c.method === 'PUT')).toBe(true));
  });
});

describe('pilotage', () => {
  it('vue d’ensemble, anomalies et erreurs récentes en tableaux', async () => {
    const { user } = renderApp('/admin', { admin: true });
    expect(await screen.findByText('Réussite sans aide (7 j)')).toBeInTheDocument();
    expect(screen.getByText('72 %')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Payé' })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Anomalies' }));
    expect(await screen.findByText('Réponses trop rapides pour être lues')).toBeInTheDocument();
    expect(screen.getByText('00000000…')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Erreurs' }));
    expect(await screen.findByText('Cannot read properties of undefined')).toBeInTheDocument();
  });
});
