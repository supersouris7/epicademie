import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getChapter } from '@epicademie/content';
import type { ReportStatus } from '@epicademie/shared';
import { renderAdmin, renderApp } from '../../testing/renderApp.tsx';
import { plural } from './labels.ts';
import { integerTicks } from './ticks.ts';
import { PHONE_QUERY } from './useIsPhone.ts';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

/** Fiabilité pédagogique côté écran : signaler, notions en maintenance, administration. */

const report = (n: string, status: ReportStatus) => ({
  id: `99999999-9999-4999-8999-99999999999${n}`,
  profileId: null,
  kind: 'question',
  skillId: 'm5-tables',
  level: 1,
  seed: Number(n),
  skillVersion: 1,
  screen: null,
  appVersion: null,
  reason: 'ambigue',
  comment: null,
  status,
  adminNote: null,
  createdAt: `2026-11-2${n}T10:00:00.000Z`,
  resolvedAt: null,
});

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

  it('console directe pour l’opérateur, sans compte ni choix de profil', async () => {
    renderAdmin({ admin: true, loggedIn: false });
    expect(await screen.findByRole('heading', { name: 'Gestion du jeu' })).toBeInTheDocument();
    expect(screen.queryByText(/Opérateur :/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Mot de passe')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Fermer la session' })).not.toBeInTheDocument();
  });

  it('hors page de pilotage : message, jamais de renvoi vers « Je suis un élève / un parent »', async () => {
    renderAdmin({ admin: false, loggedIn: false });
    expect(
      await screen.findByText('Administration accessible uniquement depuis la page de pilotage.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Je suis un élève/)).not.toBeInTheDocument();
  });

  it('signalement traité, notion désactivée depuis la console', async () => {
    const { user, server } = renderAdmin({ admin: true });
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
    await user.click(await screen.findByRole('tab', { name: /^Signalements/ }));
    const table = await screen.findByRole('table', { name: 'Signalements' });
    expect(await within(table).findByText('La question n’est pas claire')).toBeInTheDocument();
    // Les signalements généraux (sans notion) s'affichent aussi, avec leur écran.
    const states = screen.getByRole('group', { name: 'État des signalements' });
    await user.click(within(states).getByRole('button', { name: /^En cours/ }));
    expect(
      await within(await screen.findByRole('table', { name: 'Signalements' })).findByText('Général · /hub'),
    ).toBeInTheDocument();
    await user.click(within(states).getByRole('button', { name: /^Nouveau/ }));
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
    const { user, server } = renderAdmin({ admin: true });
    await user.click(await screen.findByRole('tab', { name: 'Familles' }));
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
    await user.click(screen.getByRole('tab', { name: 'Technique' }));
    await user.click(await screen.findByRole('button', { name: 'Journal d’audit' }));
    expect(await screen.findByText('Consultation de la fiche')).toBeInTheDocument();
    // E-mail masqué, jamais l'identifiant ; le nom court ouvre la fiche.
    expect(screen.queryByText(/aaaaaaaa-aaaa/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'p…@famille.test' }));
    expect(await screen.findByRole('region', { name: 'Profils' })).toBeInTheDocument();
  });
});

describe('pilotage', () => {
  it('vue d’ensemble : tuiles en tête, sections datées, anomalies visibles', async () => {
    renderAdmin({ admin: true });
    const kpis = await screen.findByRole('region', { name: 'Indicateurs clés' });
    for (const label of ['Familles', 'Enfants actifs', 'Abonnés', 'Signalements à traiter']) {
      expect(within(kpis).getByText(label)).toBeInTheDocument();
    }
    expect(within(kpis).getByText('Famille, année scolaire')).toBeInTheDocument();
    const week = screen.getByRole('region', { name: '7 derniers jours' });
    expect(within(week).getByText('72 %')).toBeInTheDocument();
    expect(within(week).queryByText('Boss vaincus')).not.toBeInTheDocument();
    const all = screen.getByRole('region', { name: 'Depuis le début' });
    expect(within(all).getByText('Encaissements d’essai, depuis le début')).toBeInTheDocument();
    expect(await within(all).findByText('Prestataire : simulateur de paiement')).toBeInTheDocument();
    expect(within(all).getAllByText(/124,95/)).toHaveLength(2);
    expect(screen.getByRole('cell', { name: 'Payé' })).toBeInTheDocument();
    expect(await screen.findByText('Réponses trop rapides pour être lues')).toBeInTheDocument();
    for (const gone of [/Familles abonnées/, /Répartition/, /Stripe de test/]) {
      expect(screen.queryByText(gone)).not.toBeInTheDocument();
    }
  });

  it('signalements à traiter : compteur sur l’onglet, regroupés par notion, lien', async () => {
    const { user, server } = renderAdmin({ admin: true });
    server.reports.push(report('1', 'nouveau'), report('2', 'nouveau'), report('3', 'en-cours'));
    const todo = await screen.findByRole('list', { name: 'Signalements à traiter' });
    await waitFor(() => expect(within(todo).getAllByRole('listitem')).toHaveLength(1));
    expect(todo).toHaveTextContent('Tables de multiplication');
    expect(todo).toHaveTextContent('3 signalements');
    expect(screen.getByRole('tab', { name: /^Signalements/ })).toHaveTextContent('3 à traiter');
    await user.click(within(screen.getByRole('region', { name: 'Indicateurs clés' })).getByRole('button'));
    const table = await screen.findByRole('table', { name: 'Signalements' });
    // Les deux « nouveaux » de la même notion font une seule ligne.
    await waitFor(() => expect(within(table).getAllByRole('row')).toHaveLength(2));
    expect(screen.getByRole('button', { name: /^Nouveau 2/ })).toHaveAttribute('aria-pressed', 'true');
    await user.click(within(table).getByRole('button', { name: 'Détail' }));
    expect(screen.getAllByLabelText('Signalement Tables de multiplication')).toHaveLength(2);
  });

  it('six rubriques ; « Technique » réunit les outils et les erreurs ont un libellé français', async () => {
    const { user } = renderAdmin({ admin: true });
    const nav = await screen.findByRole('navigation', { name: 'Rubriques' });
    expect(
      within(nav)
        .getAllByRole('tab')
        .map((t) => t.textContent),
    ).toEqual(['Vue d’ensemble', 'Signalements', 'Familles', 'Notions', 'Points faibles', 'Technique']);
    const technical = within(nav).getByRole('tab', { name: 'Technique' });
    await user.click(technical);
    expect(technical).toHaveAttribute('aria-selected', 'true');
    const tools = screen.getByRole('group', { name: 'Outil' });
    expect(within(tools).getAllByRole('button')).toHaveLength(4);
    await user.click(within(tools).getByRole('button', { name: 'Anomalies' }));
    expect(await screen.findByText('Réponses trop rapides pour être lues')).toBeInTheDocument();
    expect(screen.queryByText(/00000000/)).not.toBeInTheDocument();
    await user.click(within(tools).getByRole('button', { name: 'Erreurs' }));
    expect(await screen.findByText('Erreur de programme (valeur manquante)')).toBeInTheDocument();
    expect(screen.queryByText('Cannot read properties of undefined')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Détail' }));
    expect(screen.getByText('Cannot read properties of undefined')).toBeInTheDocument();
  });

  it('notions : total détaillé, type « notions » par défaut, badge court, noms de chapitre', async () => {
    const { user } = renderAdmin({ admin: true });
    await user.click(await screen.findByRole('tab', { name: 'Notions' }));
    const table = await screen.findByRole('table', { name: 'Notions' });
    expect(screen.getByText(/^\d+ notions? \+ \d+ questions? de boss$/)).toBeInTheDocument();
    const types = screen.getByRole('group', { name: 'Type' });
    expect(within(types).getByRole('button', { name: 'Notions' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(table).getAllByText(getChapter('m5-calcul')!.title).length).toBeGreaterThan(0);
    expect(table).not.toHaveTextContent('m5-calcul');
    expect(screen.getByRole('list', { name: 'Notions par état' })).toHaveTextContent(/OK : \d/);
    await user.selectOptions(screen.getByLabelText('Matière'), 'anglais');
    expect(await screen.findByText('Aucune notion avec ces filtres.')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Matière'), 'toutes');
    await user.selectOptions(screen.getByLabelText('Classe'), 'cm1');
    expect(screen.getByText('Aucune notion avec ces filtres.')).toBeInTheDocument();
  });

  it('thème propre à la console, texte sombre sur le violet actif', async () => {
    const { container } = renderAdmin({ admin: true });
    const tab = await screen.findByRole('tab', { name: 'Vue d’ensemble' });
    expect(container.firstChild).toHaveClass('bg-pilot-bg', 'text-pilot-fg');
    expect(tab).toHaveClass('bg-pilot-acc', 'text-pilot-bg');
  });

  it('graphiques : textes hors de l’échelle du dessin, accords, graduations entières', async () => {
    const { user } = renderAdmin({ admin: true });
    const bars = await screen.findByRole('img', { name: /Comptes créés par jour\. 3 comptes sur 30 jours/ });
    expect(bars.querySelector('text')).toBeNull();
    expect(
      screen.getByRole('img', { name: /Abonnements actifs par jour\. 5 abonnements aujourd’hui/ }),
    ).toBeInTheDocument();
    const [first] = screen.getAllByText('Voir les valeurs');
    await user.click(first!);
    const table = screen.getByRole('table', { name: 'Comptes créés par jour' });
    expect(within(table).getAllByRole('row')).toHaveLength(31);
    expect(within(table).getByRole('row', { name: '30/11 3' })).toBeInTheDocument();
    expect(integerTicks(0)).toEqual([0, 1]);
    expect(integerTicks(1)).toEqual([0, 1]);
    expect(integerTicks(3)).toEqual([0, 2, 4]);
    expect(plural(1, 'abonnement')).toBe('1 abonnement');
    expect(plural(2, 'abonnement')).toBe('2 abonnements');
  });
});

describe('téléphone (sous 700 px) : des cartes à la place des tableaux', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) =>
      Object.assign(new EventTarget(), { matches: query === PHONE_QUERY, media: query, onchange: null }),
    );
  });

  it('comptes : carte entièrement touchable qui ouvre la fiche', async () => {
    const { user } = renderAdmin({ admin: true });
    await user.click(await screen.findByRole('tab', { name: 'Familles' }));
    const list = await screen.findByRole('list', { name: 'Comptes' });
    expect(screen.queryByRole('table', { name: 'Comptes' })).not.toBeInTheDocument();
    expect(within(list).getAllByRole('button')).toHaveLength(25);
    await user.click(within(list).getAllByRole('button')[0]!);
    expect(await screen.findByRole('region', { name: 'Profils' })).toBeInTheDocument();
  });

  it('signalements, notions et erreurs en cartes qui déplient leur détail', async () => {
    const { user, server } = renderAdmin({ admin: true });
    server.reports.push(report('1', 'nouveau'));
    await user.click(await screen.findByRole('tab', { name: /^Signalements/ }));
    const reports = await screen.findByRole('list', { name: 'Signalements' });
    await user.click(await within(reports).findByRole('button', { name: /Tables de multiplication/ }));
    expect(screen.getByLabelText('Signalement Tables de multiplication')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Notions' }));
    const notions = await screen.findByRole('list', { name: 'Notions' });
    await user.click(within(notions).getByRole('button', { name: /Tables de multiplication/ }));
    expect(screen.getByLabelText('Notion Tables de multiplication')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Technique' }));
    await user.click(screen.getByRole('button', { name: 'Erreurs' }));
    const errors = await screen.findByRole('list', { name: 'Erreurs' });
    await user.click(within(errors).getByRole('button', { name: /Erreur de programme/ }));
    expect(screen.getByText('Cannot read properties of undefined')).toBeInTheDocument();
  });
});
