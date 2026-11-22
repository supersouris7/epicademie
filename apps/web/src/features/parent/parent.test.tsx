import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { LearningReport } from '@questeo/shared';
import { emptyLearning, FAKE_PASSWORD } from '../../testing/fakeApi.ts';
import { renderApp } from '../../testing/renderApp.tsx';
import { weeklySummary, weekBars } from './summary.ts';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

const tally = (answered: number, autonomous: number, helped = 0, collective = 0) => ({
  answered,
  autonomous,
  helped,
  hints: helped,
  collective,
});
const week = (date: string, t: ReturnType<typeof tally>) => ({
  week: date,
  tally: t,
  modes: ['entrainement' as const],
});

/** Enfant qui a joué : une notion à retravailler, une acquise, deux semaines d'activité. */
const report: LearningReport = {
  ...emptyLearning(),
  tally: tally(14, 9, 2),
  lastActivity: '2026-11-19T17:00:00.000Z',
  subjects: [
    {
      subject: 'maths',
      tally: tally(14, 9, 2),
      statuses: { 'non-commencee': 0, 'a-travailler': 1, 'en-progression': 0, 'a-consolider': 0, acquise: 1 },
    },
  ],
  chapters: [
    {
      chapterId: 'm5-calcul',
      subject: 'maths',
      tally: tally(14, 9, 2),
      statuses: { 'non-commencee': 0, 'a-travailler': 1, 'en-progression': 0, 'a-consolider': 0, acquise: 1 },
    },
  ],
  skills: [
    {
      skillId: 'm5-priorites',
      chapterId: 'm5-calcul',
      subject: 'maths',
      status: 'a-travailler',
      tally: tally(6, 2, 2),
      recentRate: 0.33,
      trend: 'baisse',
      lastPracticed: '2026-11-19T17:00:00.000Z',
      nextReview: '2026-11-20',
      recurringErrors: [{ text: 'La multiplication passe avant l’addition.', count: 3 }],
    },
    {
      skillId: 'm5-tables',
      chapterId: 'm5-calcul',
      subject: 'maths',
      status: 'acquise',
      tally: tally(8, 7),
      recentRate: 0.9,
      trend: 'stable',
      lastPracticed: '2026-11-18T17:00:00.000Z',
      nextReview: '2026-12-18',
      recurringErrors: [],
    },
  ],
  toRework: ['m5-priorites'],
  dueReviews: ['m5-priorites'],
  weeks: [week('2026-11-09', tally(4, 1)), week('2026-11-16', tally(10, 8, 2, 1))],
};

describe('lecture du suivi pour un parent', () => {
  it('bilan de la semaine en phrases, comparé à la semaine précédente', () => {
    const { lines } = weeklySummary(report);
    expect(lines).toEqual([
      '10 questions cette semaine, dont 8 réussies sans aide.',
      '2 réussites avec un indice ou au second essai.',
      'Plus de réussites sans aide que la semaine dernière : bravo !',
      '1 réponse données en équipe (non comptées dans sa progression).',
    ]);
    expect(weeklySummary(emptyLearning()).lines).toEqual(['Pas encore de séance cette semaine.']);
  });

  it('histogramme : hauteur relative à la semaine la plus remplie', () => {
    expect(weekBars(report).map((b) => b.height)).toEqual([0.4, 1]);
  });
});

describe('espace parent', () => {
  it('mot de passe demandé, puis carte de chaque enfant et détail', async () => {
    const { user } = renderApp('/parent', { parent: false, learning: report });
    await user.type(await screen.findByLabelText(/Mot de passe/), FAKE_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Ouvrir l’Espace parent' }));
    const card = await screen.findByRole('listitem', { name: 'Progrès de Léa' });
    expect(card).toHaveTextContent('Matières : Maths');
    expect(card).toHaveTextContent('À retravailler : Priorités opératoires');
    await user.click(within(card).getByRole('link', { name: /Voir les progrès/ }));
    expect(await screen.findByRole('heading', { name: 'Bilan de la semaine' })).toBeInTheDocument();
    await user.click(screen.getByText(/Maths —/));
    expect(screen.getByText(/Erreur fréquente : La multiplication/)).toBeInTheDocument();
    expect(screen.getByText(/en baisse/)).toBeInTheDocument();
  });

  it('code PIN : l’Espace parent s’ouvre avec les 4 chiffres, et « Verrouiller » le referme', async () => {
    const { user } = renderApp('/parent', { parent: false, pin: '2580', learning: report });
    expect(await screen.findByText('Code PIN parent')).toBeInTheDocument();
    for (const k of ['1', '1', '1', '1']) await user.click(screen.getByRole('button', { name: k }));
    expect(await screen.findByRole('alert')).toHaveTextContent('incorrect');
    for (const k of ['2', '5', '8', '0']) await user.click(screen.getByRole('button', { name: k }));
    expect(await screen.findByRole('listitem', { name: 'Progrès de Léa' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Verrouiller' }));
    // Reste dans l'Espace parent : le code est redemandé, sans retour au jeu.
    expect(await screen.findByText('Code PIN parent')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Nouveau joueur/ })).not.toBeInTheDocument();
  });

  it('onglets : où suis-je, et chaque rubrique reste dans l’Espace parent', async () => {
    const { user } = renderApp('/parent', { learning: report });
    const tabs = await screen.findByRole('navigation', { name: 'Rubriques de l’Espace parent' });
    expect(
      within(tabs)
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual(['Progrès', 'Abonnement', 'Profils', 'Réglages']);
    expect(within(tabs).getByRole('link', { name: 'Progrès' })).toHaveAttribute('aria-current', 'page');
    for (const [name, heading] of [
      ['Abonnement', 'Abonnement familial'],
      ['Profils', 'Profils des enfants'],
      ['Réglages', 'Réglages'],
    ] as const) {
      await user.click(
        within(screen.getByRole('navigation', { name: 'Rubriques de l’Espace parent' })).getByRole('link', { name }),
      );
      expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
      const nav = screen.getByRole('navigation', { name: 'Rubriques de l’Espace parent' });
      expect(within(nav).getByRole('link', { name })).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('button', { name: 'Retour au jeu' })).toBeInTheDocument();
    }
  });

  it('« Retour au jeu » est le seul bouton qui quitte l’Espace parent', async () => {
    const { user } = renderApp('/parent', { learning: report });
    await user.click(await screen.findByRole('button', { name: 'Retour au jeu' }));
    expect(await screen.findByRole('button', { name: /Nouveau joueur/ })).toBeInTheDocument();
  });

  it('profils : amis validés ici ; ajouter un enfant ramène à la liste des profils, pas au jeu', async () => {
    const { user } = renderApp('/parent/profils', { learning: report });
    expect(await screen.findByRole('heading', { name: 'Amis d’autres familles' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Ajouter un enfant' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Ajouter un enfant' })).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('Ex. Léa'), 'Tom');
    await user.click(screen.getByRole('button', { name: 'Un garçon' }));
    await user.type(screen.getByLabelText('Date de naissance'), '2014-03-09');
    await user.click(await screen.findByRole('button', { name: 'Oui' }));
    await user.click(screen.getByRole('button', { name: 'Ajouter cet enfant' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Profils des enfants' })).toBeInTheDocument();
    expect(await screen.findByText('Tom')).toBeInTheDocument();
  });

  it('réglages : le code PIN se choisit dans l’Espace parent', async () => {
    renderApp('/parent/reglages');
    expect(await screen.findByRole('button', { name: 'Choisir un code PIN' })).toBeInTheDocument();
  });

  it('séance ciblée : les notions choisies deviennent une série pour l’enfant', async () => {
    const { user, server } = renderApp('/parent/enfant/11111111-1111-4111-8111-111111111111', { learning: report });
    const box = await screen.findByRole('checkbox', { name: /Priorités opératoires/ });
    expect(box).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Lancer la séance dans le jeu pour Léa' }));
    await screen.findByRole('progressbar', { name: 'Progression de la série' });
    expect(server.calls.find((c) => c.path === '/sessions')?.body).toMatchObject({
      chapterId: 'seance',
      skillId: 'm5-priorites',
    });
  });
});
