import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getChapter } from '@questeo/content';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

/** Fiabilité pédagogique côté écran : signaler, notions en maintenance, administration. */

describe('signaler une question', () => {
  it('depuis l’entraînement : motif obligatoire, envoi avec la question exacte', async () => {
    const { user, server } = renderApp('/partie/entrainement/m5-calcul/m5-tables');
    await user.click(await screen.findByRole('button', { name: 'Signaler cette question' }));
    const dialog = screen.getByRole('dialog', { name: 'Signaler cette question' });
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
  it('affichées « en maintenance », non jouables, absentes de l’« Épreuve du chapitre »', async () => {
    const { user } = renderApp('/jouer/entrainement/maths/m5-calcul', { disabled: ['m5-tables'] });
    const tables = await screen.findByRole('button', { name: /Tables de multiplication/ });
    await waitFor(() => expect(tables).toBeDisabled());
    expect(tables).toHaveTextContent('en maintenance');
    // L'épreuve couvre les notions du chapitre sauf celle en maintenance.
    const exam = screen.getByRole('button', { name: /Épreuve du chapitre/ });
    await user.click(exam);
    await screen.findByRole('progressbar', { name: 'Progression de la série' });
    expect(getChapter('m5-calcul')?.skills.length).toBeGreaterThan(1);
  });
});

describe('administration', () => {
  it('aucun bouton vers la console : adresse /admin seulement', async () => {
    renderApp('/', { admin: true });
    await screen.findByRole('button', { name: 'Nouveau joueur' });
    expect(screen.queryByRole('button', { name: 'Administration' })).not.toBeInTheDocument();
  });

  it('/admin : console directe pour l’opérateur, sans compte ni choix de profil', async () => {
    renderApp('/admin', { admin: true, loggedIn: false });
    expect(await screen.findByRole('heading', { name: /Console d’administration/ })).toBeInTheDocument();
    expect(screen.getByText('Opérateur : Marie Dupont')).toBeInTheDocument();
    expect(screen.queryByLabelText('Mot de passe')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Fermer la session' })).not.toBeInTheDocument();
  });

  it('hors page de pilotage : message, jamais de renvoi vers « Je suis un élève / un parent »', async () => {
    renderApp('/admin', { admin: false, loggedIn: false });
    expect(
      await screen.findByText('Administration accessible uniquement depuis la page de pilotage.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Je suis un élève/)).not.toBeInTheDocument();
  });

  it('même connecté en parent, /admin ne montre pas le choix du profil', async () => {
    renderApp('/admin', { admin: false });
    expect(
      await screen.findByText('Administration accessible uniquement depuis la page de pilotage.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nouveau joueur' })).not.toBeInTheDocument();
  });

  it('signalement traité, notion désactivée depuis la console', async () => {
    const { user, server } = renderApp('/admin', { admin: true });
    server.reports.push({
      id: '99999999-9999-4999-8999-999999999999',
      profileId: null,
      kind: 'question',
      skillId: 'm5-tables',
      level: 1,
      seed: 3,
      skillVersion: 1,
      screen: null,
      appVersion: null,
      reason: 'ambigue',
      comment: 'pas clair',
      status: 'nouveau',
      adminNote: null,
      createdAt: '2026-11-20T10:00:00.000Z',
      resolvedAt: null,
    });
    server.reports.push({
      id: '88888888-8888-4888-8888-888888888888',
      kind: 'general',
      skillId: null,
      level: null,
      seed: null,
      skillVersion: null,
      screen: '/hub',
      appVersion: '1.2.3',
      reason: 'son',
      comment: null,
      status: 'en-cours',
      adminNote: null,
      createdAt: '2026-11-20T10:00:00.000Z',
      resolvedAt: null,
    });
    await user.click(await screen.findByRole('tab', { name: 'Signalements' }));
    const table = await screen.findByRole('table', { name: 'Signalements' });
    expect(await within(table).findByText('La question n’est pas claire')).toBeInTheDocument();
    // Les signalements généraux (sans notion) s'affichent aussi, avec leur écran.
    await user.selectOptions(screen.getByLabelText('État'), 'en-cours');
    expect(
      await within(await screen.findByRole('table', { name: 'Signalements' })).findByText('Général · /hub'),
    ).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('État'), 'nouveau');
    await user.click(
      within(await screen.findByRole('table', { name: 'Signalements' })).getByRole('button', { name: 'Détail' }),
    );
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

describe('comptes', () => {
  it('liste paginée côté serveur, recherche, fiche, mot de passe temporaire et journal', async () => {
    const { user, server } = renderApp('/admin', { admin: true });
    await user.click(await screen.findByRole('tab', { name: 'Comptes' }));
    const table = await screen.findByRole('table', { name: 'Comptes' });
    // 30 comptes côté serveur : une seule page de 25 lignes est affichée.
    expect(within(table).getAllByRole('row')).toHaveLength(26);
    expect(screen.getByRole('status')).toHaveTextContent('30 comptes');
    await user.click(screen.getByRole('button', { name: 'Suivant' }));
    await waitFor(() =>
      expect(within(screen.getByRole('table', { name: 'Comptes' })).getAllByRole('row')).toHaveLength(6),
    );
    expect(screen.getByRole('button', { name: 'Suivant' })).toBeDisabled();
    await user.type(screen.getByRole('searchbox'), 'enfant 7');
    await user.click(screen.getByRole('button', { name: 'Rechercher' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('1 compte '));
    expect(server.calls.some((c) => c.path.endsWith('/admin/accounts/search'))).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Ouvrir la fiche' }));
    const profiles = await screen.findByRole('region', { name: 'Profils' });
    expect(within(profiles).getByText(/Enfant 7/)).toBeInTheDocument();
    expect(screen.getByText('Cette consultation est enregistrée dans le journal d’audit.')).toBeInTheDocument();
    expect(screen.getByText('Défini')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Générer un mot de passe temporaire' }));
    await user.click(screen.getByRole('button', { name: 'Oui, générer un mot de passe' }));
    expect(await screen.findByText('Temp0raireXy7')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retour à la liste' }));
    await user.click(screen.getByRole('tab', { name: 'Journal d’audit' }));
    expect(await screen.findByText('Consultation de la fiche')).toBeInTheDocument();
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

  it('thème sombre local à la console et indicateurs clés en tête', async () => {
    const { container } = renderApp('/admin', { admin: true });
    const kpis = await screen.findByRole('region', { name: 'Indicateurs clés' });
    expect(container.querySelector('.admin-dark')).not.toBeNull();
    expect(within(kpis).getByText('Comptes')).toBeInTheDocument();
    expect(within(kpis).getByText('Profils enfants')).toBeInTheDocument();
    expect(within(kpis).getByText('Abonnements actifs · Famille, à l’année')).toBeInTheDocument();
    expect(within(kpis).getByText('Revenus (mode test)')).toBeInTheDocument();
    expect(within(kpis).getByText(/124,95/)).toBeInTheDocument();
  });

  it('graphiques : décrits en texte et valeurs en tableau', async () => {
    const { user } = renderApp('/admin', { admin: true });
    const bars = await screen.findByRole('img', { name: /Comptes créés par jour\. 3 comptes sur 30 jours/ });
    expect(bars).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /Abonnements actifs par jour\. 5 abonnements aujourd’hui/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('5 (100 %)')).toBeInTheDocument();
    const [first] = screen.getAllByText('Voir les valeurs');
    await user.click(first!);
    const table = screen.getByRole('table', { name: 'Comptes créés par jour' });
    expect(within(table).getAllByRole('row')).toHaveLength(31);
    expect(within(table).getByRole('row', { name: '30/11 3' })).toBeInTheDocument();
  });
});
