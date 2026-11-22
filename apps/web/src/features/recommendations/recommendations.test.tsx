import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { FamilyRecommendation } from '@questeo/shared';
import { emptyLearning } from '../../testing/fakeApi.ts';
import { renderApp } from '../../testing/renderApp.tsx';
import { suggestedSkills } from './suggestions.ts';
import { chaptersOf } from '@questeo/content';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

const LEA = '11111111-1111-4111-8111-111111111111';
const reco = (over: Partial<FamilyRecommendation> = {}): FamilyRecommendation => ({
  id: 'bbbbbbbb-0000-4000-8000-000000000001',
  profileId: LEA,
  profileName: 'Léa',
  skillId: 'm5-tables',
  note: 'Courage, tu y arriveras !',
  status: 'en-attente',
  createdAt: '2026-11-22T10:00:00.000Z',
  doneAt: null,
  correct: null,
  answered: null,
  ...over,
});

/** Léa a du mal avec les priorités opératoires. */
const learning = {
  ...emptyLearning(),
  toRework: ['m5-priorites'],
  skills: [
    {
      skillId: 'm5-priorites',
      chapterId: 'm5-calcul',
      subject: 'maths' as const,
      status: 'a-travailler' as const,
      tally: { answered: 6, autonomous: 2, helped: 2, hints: 2, collective: 0 },
      recentRate: 0.33,
      trend: 'baisse' as const,
      lastPracticed: '2026-11-19T17:00:00.000Z',
      nextReview: '2026-11-20',
      recurringErrors: [],
    },
  ],
};

describe('suggestions', () => {
  it('notions à retravailler et « à travailler » de la matière, d’abord', () => {
    const chapters = chaptersOf('maths', '5e');
    expect(suggestedSkills(learning, 'maths', chapters)).toEqual(['m5-priorites']);
    expect(suggestedSkills(learning, 'anglais', chaptersOf('anglais', '5e'))).toEqual([]);
    expect(suggestedSkills(emptyLearning(), 'maths', chapters)).toEqual([]);
  });
});

describe('Espace parent : recommander un entraînement', () => {
  it('matière, notion suggérée d’abord, petit mot : la recommandation apparaît en attente', async () => {
    const { user, server } = renderApp(`/parent/enfant/${LEA}`, { learning });
    await user.click(await screen.findByRole('button', { name: 'Recommander un entraînement' }));
    const form = screen.getByRole('form', { name: 'Nouvelle recommandation' });
    await user.selectOptions(within(form).getByLabelText('Matière'), 'Maths');
    const notion = within(form).getByLabelText('Notion');
    // Le groupe « souvent ratées » vient en premier.
    const groups = within(notion).getAllByRole('group');
    expect(groups[0]).toHaveAttribute('label', expect.stringContaining('Souvent ratées'));
    expect(within(groups[0]!).getAllByRole('option')).toHaveLength(1);
    await user.selectOptions(notion, 'm5-priorites');
    // Mot limité à 140 caractères.
    const mot = within(form).getByLabelText(/Un petit mot/);
    expect(mot).toHaveAttribute('maxlength', '140');
    await user.type(mot, 'Courage !');
    expect(within(form).getByText('9 / 140 caractères')).toBeInTheDocument();
    await user.click(within(form).getByRole('button', { name: 'Envoyer à Léa' }));

    const list = await screen.findByRole('list', { name: 'Recommandations en attente' });
    expect(list).toHaveTextContent('Priorités opératoires');
    expect(list).toHaveTextContent('« Courage ! »');
    const sent = server.calls.find((c) => c.method === 'POST' && c.path.endsWith('/recommendations'));
    expect(sent?.body).toEqual({ skillId: 'm5-priorites', note: 'Courage !' });
  });

  it('le mot est facultatif : « Envoyer » n’attend que la notion', async () => {
    const { user } = renderApp(`/parent/enfant/${LEA}`, { learning });
    await user.click(await screen.findByRole('button', { name: 'Recommander un entraînement' }));
    const send = screen.getByRole('button', { name: 'Envoyer à Léa' });
    expect(send).toBeDisabled();
    await user.selectOptions(screen.getByLabelText('Matière'), 'Maths');
    await user.selectOptions(screen.getByLabelText('Notion'), 'm5-tables');
    await user.click(send);
    expect(await screen.findByRole('list', { name: 'Recommandations en attente' })).toHaveTextContent('Tables');
  });

  it('le parent annule une recommandation en attente', async () => {
    const { user } = renderApp(`/parent/enfant/${LEA}`, { learning, recommendations: [reco()] });
    const list = await screen.findByRole('list', { name: 'Recommandations en attente' });
    await user.click(within(list).getByRole('button', { name: 'Annuler' }));
    await vi.waitFor(() =>
      expect(screen.queryByRole('list', { name: 'Recommandations en attente' })).not.toBeInTheDocument(),
    );
  });

  it('une recommandation faite montre la date et le score', async () => {
    renderApp(`/parent/enfant/${LEA}`, {
      learning,
      recommendations: [reco({ status: 'faite', doneAt: '2026-11-23T16:00:00.000Z', correct: 3, answered: 4 })],
    });
    const list = await screen.findByRole('list', { name: 'Recommandations faites' });
    expect(list).toHaveTextContent('Faite le 23 novembre : 3 réussies sur 4');
  });

  it('3 recommandations en attente : on ne peut plus en envoyer', async () => {
    const three = ['m5-tables', 'm5-priorites', 'm5-relatifs-vocab'].map((skillId, i) =>
      reco({ id: `bbbbbbbb-0000-4000-8000-00000000000${i + 1}`, skillId }),
    );
    renderApp(`/parent/enfant/${LEA}`, { learning, recommendations: three });
    expect(await screen.findByRole('note')).toHaveTextContent('3 recommandations sont déjà en attente');
    expect(screen.getByRole('button', { name: 'Recommander un entraînement' })).toBeDisabled();
  });
});

describe('accueil de l’enfant', () => {
  it('Questy présente le mot du parent ; le bouton lance l’entraînement de la notion', async () => {
    const { user, server } = renderApp('/hub', { recommendations: [reco()] });
    const section = await screen.findByRole('region', { name: 'Ton parent te recommande' });
    expect(section).toHaveTextContent('« Courage, tu y arriveras ! »');
    expect(section).toHaveTextContent('Tables');
    await user.click(within(section).getByRole('button', { name: 'S’entraîner' }));
    // La partie démarre sur cette notion seulement.
    await waitFor(() =>
      expect(server.calls.find((c) => c.method === 'POST' && c.path === '/sessions')?.body).toMatchObject({
        mode: 'entrainement',
        skillId: 'm5-tables',
        chapterId: 'm5-calcul',
      }),
    );
  });

  it('sans recommandation, rien n’est affiché ; une recommandation annulée ou faite non plus', async () => {
    renderApp('/hub', {
      recommendations: [
        reco({ status: 'faite' }),
        reco({ id: 'bbbbbbbb-0000-4000-8000-000000000002', status: 'annulee' }),
      ],
    });
    await screen.findByRole('list', { name: 'Jouer' });
    expect(screen.queryByRole('region', { name: 'Ton parent te recommande' })).not.toBeInTheDocument();
  });
});
