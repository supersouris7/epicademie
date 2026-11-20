import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

describe('version gratuite et abonnement', () => {
  it('chapitres de l’abonnement marqués d’un cadenas ; le 1er chapitre reste ouvert', async () => {
    const { user } = renderApp('/jouer/entrainement/maths?classe=5e', { premium: false });
    // Le 1er chapitre (Calcul mental) : bouton de la liste (le dernier ; le 1er est la suggestion).
    const free = (await screen.findAllByRole('button', { name: /Calcul mental/ })).at(-1);
    await waitFor(() => expect(screen.getAllByText('Abonnement').length).toBeGreaterThan(0));
    expect(free).not.toHaveTextContent('Abonnement');
    await user.click(screen.getByRole('button', { name: /Nombres relatifs/ }));
    expect(await screen.findByText(/demande à tes parents/)).toBeInTheDocument();
    // Toujours sur la liste des chapitres.
    expect(screen.getByRole('heading', { name: /Entraînement · Maths/ })).toBeInTheDocument();
  });

  it('avec l’abonnement : aucun cadenas', async () => {
    renderApp('/jouer/entrainement/maths?classe=5e', { premium: true });
    await screen.findByRole('button', { name: /Nombres relatifs/ });
    expect(screen.queryByText('Abonnement')).not.toBeInTheDocument();
  });

  it('paiement de l’année (simulateur) : accès complet, historique des paiements', async () => {
    const { user } = renderApp('/abonnement', { premium: false });
    expect(await screen.findByRole('heading', { name: 'Version gratuite' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Payer l’année scolaire — 24,99/ }));
    expect(await screen.findByRole('heading', { name: 'Simulateur de paiement' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Paiement accepté' }));
    expect(await screen.findByRole('heading', { name: 'Abonnement actif' })).toBeInTheDocument();
    expect(screen.getByText(/Tous les chapitres sont ouverts jusqu’au 31 août 2027/)).toBeInTheDocument();
    expect(screen.getByText(/Payé/)).toBeInTheDocument();
  });

  it('paiement refusé : reste en version gratuite, l’échec est dans l’historique', async () => {
    const { user } = renderApp('/abonnement', { premium: false });
    await user.click(await screen.findByRole('button', { name: /Payer l’année scolaire/ }));
    await user.click(await screen.findByRole('button', { name: 'Paiement refusé' }));
    expect(await screen.findByRole('heading', { name: 'Version gratuite' })).toBeInTheDocument();
    // L'historique se met à jour après le retour du simulateur.
    expect(await screen.findByText(/Paiement refusé \(accès/)).toBeInTheDocument();
  });
});
